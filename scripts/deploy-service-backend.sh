#!/usr/bin/env bash
# 이수한의원 챗봇 "쑤" — RAG Lambda 배포 스크립트
#
# 전제:
#   1) 임베딩 JSON이 이미 빌드되어 있음 (service/frontend/src/data/blog/embeddings.json)
#   2) AWS_PROFILE이 설정되어 있음 (default 또는 export AWS_PROFILE=...)
#   3) Bedrock 모델 액세스가 us-east-1에서 활성화돼 있음
#      - cohere.embed-multilingual-v3
#      - anthropic.claude-sonnet-4-5-20250929-v1:0
#
# 사용:
#   bash scripts/deploy-service-backend.sh
#
# 멱등성: 모든 단계는 이미 존재하면 update 또는 skip 처리

set -euo pipefail

# ============= 설정 =============
FUNCTION_NAME="isuhani-chat"
ROLE_NAME="isuhani-chat-lambda-role"
REGION="${CHAT_REGION:-us-east-1}"          # Lambda + Bedrock 리전
S3_REGION="${S3_REGION:-ap-northeast-2}"    # 임베딩 버킷 리전
BUCKET="${BUCKET:-isuhani-clinic-web}"      # 임베딩 저장 버킷 (계정별 오버라이드)
EMBED_LOCAL="service/frontend/src/data/blog/embeddings.json"
EMBED_KEY="_internal/embeddings.json"
ALLOWED_ORIGIN="${ALLOWED_ORIGIN:-*}"        # 운영 시 CloudFront 도메인으로 좁히기
CLAUDE_MODEL="us.anthropic.claude-sonnet-4-5-20250929-v1:0"

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LAMBDA_DIR="$ROOT_DIR/service/backend"
ZIP_PATH="$ROOT_DIR/service/backend.zip"

# ============= 헬퍼 =============
say() { echo "[deploy-chat] $*"; }

check_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "ERROR: '$1' 명령이 필요합니다."; exit 1; }
}

check_cmd aws
check_cmd zip
check_cmd node

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
say "AWS account: $ACCOUNT_ID, region: $REGION"

# ============= 1) 임베딩 업로드 =============
if [[ ! -f "$ROOT_DIR/$EMBED_LOCAL" ]]; then
  echo "ERROR: $EMBED_LOCAL 가 없습니다. 먼저 'node scripts/build-embeddings.mjs' 실행"
  exit 1
fi
EMBED_SIZE_MB=$(du -m "$ROOT_DIR/$EMBED_LOCAL" | cut -f1)
say "임베딩 파일 ${EMBED_SIZE_MB}MB → s3://$BUCKET/$EMBED_KEY"
aws s3 cp "$ROOT_DIR/$EMBED_LOCAL" "s3://$BUCKET/$EMBED_KEY" \
  --region "$S3_REGION" \
  --content-type application/json \
  --cache-control "no-cache"

# ============= 2) IAM Role =============
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/$ROLE_NAME"
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  say "IAM role 이미 존재 — 스킵"
else
  say "IAM role 생성 — $ROLE_NAME"
  aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": { "Service": "lambda.amazonaws.com" },
        "Action": "sts:AssumeRole"
      }]
    }' >/dev/null

  aws iam attach-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

  # Bedrock + S3 권한 인라인 정책
  # Cross-region inference profile은 us-east-1/us-east-2/us-west-2로 라우팅되므로 region wildcard
  BARE_MODEL="${CLAUDE_MODEL#us.}"  # us. prefix 제거 → 실제 foundation-model ID
  aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "isuhani-chat-bedrock-s3" \
    --policy-document "{
      \"Version\": \"2012-10-17\",
      \"Statement\": [
        {
          \"Effect\": \"Allow\",
          \"Action\": [\"bedrock:InvokeModel\"],
          \"Resource\": [
            \"arn:aws:bedrock:*::foundation-model/cohere.embed-multilingual-v3\",
            \"arn:aws:bedrock:*::foundation-model/$BARE_MODEL\",
            \"arn:aws:bedrock:*:$ACCOUNT_ID:inference-profile/$CLAUDE_MODEL\"
          ]
        },
        {
          \"Effect\": \"Allow\",
          \"Action\": [\"s3:GetObject\"],
          \"Resource\": \"arn:aws:s3:::$BUCKET/$EMBED_KEY\"
        }
      ]
    }"

  say "IAM role 생성 — 전파 대기 (10s)"
  sleep 10
fi

# ============= 3) Lambda 패키징 =============
say "node_modules 설치"
( cd "$LAMBDA_DIR" && npm install --omit=dev --silent )

say "zip 패키지 생성 — $ZIP_PATH"
rm -f "$ZIP_PATH"
( cd "$LAMBDA_DIR" && zip -qr "$ZIP_PATH" index.mjs package.json node_modules )
ls -lh "$ZIP_PATH"

# ============= 4) Lambda 함수 생성/업데이트 =============
ENV_VARS="Variables={EMBEDDINGS_BUCKET=$BUCKET,EMBEDDINGS_KEY=$EMBED_KEY,S3_REGION=$S3_REGION,EMBED_MODEL_REGION=$REGION,CHAT_MODEL_REGION=$REGION,ALLOWED_ORIGIN=$ALLOWED_ORIGIN,CLAUDE_MODEL_ID=$CLAUDE_MODEL}"

if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" >/dev/null 2>&1; then
  say "Lambda 이미 존재 — 코드 + 환경변수 업데이트"
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --zip-file "fileb://$ZIP_PATH" >/dev/null

  # 코드 업데이트 진행 대기
  aws lambda wait function-updated --function-name "$FUNCTION_NAME" --region "$REGION"

  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --environment "$ENV_VARS" \
    --timeout 30 \
    --memory-size 1024 >/dev/null
else
  say "Lambda 신규 생성"
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --runtime nodejs20.x \
    --role "$ROLE_ARN" \
    --handler index.handler \
    --timeout 30 \
    --memory-size 1024 \
    --environment "$ENV_VARS" \
    --zip-file "fileb://$ZIP_PATH" >/dev/null
fi

# ============= 5) Function URL =============
CORS_JSON=$(cat <<EOF
{
  "AllowOrigins": ["$ALLOWED_ORIGIN"],
  "AllowMethods": ["POST"],
  "AllowHeaders": ["content-type"],
  "MaxAge": 600
}
EOF
)

if aws lambda get-function-url-config --function-name "$FUNCTION_NAME" --region "$REGION" >/dev/null 2>&1; then
  say "Function URL 이미 존재 — CORS 업데이트"
  aws lambda update-function-url-config \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --auth-type NONE \
    --cors "$CORS_JSON" >/dev/null
else
  say "Function URL 생성"
  aws lambda create-function-url-config \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --auth-type NONE \
    --cors "$CORS_JSON" >/dev/null

  # NONE 인증을 위한 public invoke 권한
  aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --region "$REGION" \
    --statement-id "FunctionURLAllowPublicAccess" \
    --action lambda:InvokeFunctionUrl \
    --principal "*" \
    --function-url-auth-type NONE >/dev/null
fi

URL=$(aws lambda get-function-url-config \
  --function-name "$FUNCTION_NAME" \
  --region "$REGION" \
  --query FunctionUrl --output text)

say "============================================"
say "배포 완료"
say "Function URL: $URL"
say "============================================"
say ""
say "다음 단계 — 프론트 연결:"
say "  frontend/.env.local 에 다음 추가:"
say "    NEXT_PUBLIC_CHAT_ENDPOINT=$URL"
say ""
say "테스트:"
say "  curl -X POST $URL \\"
say "    -H 'Content-Type: application/json' \\"
say "    -d '{\"message\":\"진료 시간이 어떻게 되나요?\"}'"
