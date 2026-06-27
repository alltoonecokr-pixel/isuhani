#!/usr/bin/env bash
# 이수한의원 v1 — CMS 클라우드 백엔드 부트스트랩
#
# 처음 실행 시 모든 AWS 리소스를 생성하고, 이후엔 코드/설정만 갱신함 (idempotent).
#
# 생성되는 리소스
#   S3   isuhani-clinic-data         — CMS 포스트 + 이미지 + 소스 zip
#   IAM  isuhani-cms-api-role        — Lambda 실행 역할
#   IAM  isuhani-cms-build-role      — CodeBuild 실행 역할
#   λ    isuhani-cms-api             — CMS API (Function URL)
#   CB   isuhani-cms-build           — 정적 사이트 빌드/배포
#
# 사용
#   ./deploy-cms.sh                       — 전체 부트스트랩 (최초)
#   ./deploy-cms.sh --update-lambda       — Lambda 코드만 재배포
#   ./deploy-cms.sh --upload-source       — CodeBuild 소스 zip만 갱신
#   ./deploy-cms.sh --reset-password      — 비밀번호 재생성

set -euo pipefail

REGION=${AWS_REGION:-ap-northeast-2}
# 셸의 AWS_PROFILE(예: yeonggwang/서울경제)에 휘둘리지 않게 올투원으로 고정. CLINIC_PROFILE로만 덮어쓰기.
PROFILE=${CLINIC_PROFILE:-isuhani}
DATA_BUCKET=${DATA_BUCKET:-isuhani-clinic-data}
SITE_BUCKET=${SITE_BUCKET:-isuhani-clinic-web}
CF_DISTRIBUTION_ID=${CF_DISTRIBUTION_ID:-ENI986CTR7J51}
LAMBDA_NAME=${LAMBDA_NAME:-isuhani-cms-api}
LAMBDA_ROLE=${LAMBDA_ROLE:-isuhani-cms-api-role}
BUILD_PROJECT=${BUILD_PROJECT:-isuhani-cms-build}
BUILD_ROLE=${BUILD_ROLE:-isuhani-cms-build-role}
POSTS_TABLE=${POSTS_TABLE:-isuhani-journal-posts}
CMS_USER=${CMS_USER:-admin}

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"  # v1-웹사이트
INFRA="$ROOT/admin/backend"
LAMBDA_DIR="$INFRA/lambda"
BUILD_DIR="$INFRA/build"
WORK="$INFRA/.work"
mkdir -p "$WORK"

AWS=(aws --region "$REGION" --profile "$PROFILE")

ACCOUNT=$("${AWS[@]}" sts get-caller-identity --query Account --output text)
echo "▸ Account: $ACCOUNT  Region: $REGION  Profile: $PROFILE"

MODE=${1:-all}

# ── helpers ──────────────────────────────────────────────────────────────────

bucket_exists() {
  "${AWS[@]}" s3api head-bucket --bucket "$1" >/dev/null 2>&1
}
role_exists() {
  "${AWS[@]}" iam get-role --role-name "$1" >/dev/null 2>&1
}
lambda_exists() {
  "${AWS[@]}" lambda get-function --function-name "$1" >/dev/null 2>&1
}
build_project_exists() {
  "${AWS[@]}" codebuild batch-get-projects --names "$1" --query 'projects[0].name' --output text 2>/dev/null | grep -q "^$1$"
}

random_password() {
  openssl rand -hex 16
}

# ── S3 bucket (CMS data) ─────────────────────────────────────────────────────

ensure_data_bucket() {
  if bucket_exists "$DATA_BUCKET"; then
    echo "▸ S3 bucket exists: $DATA_BUCKET"
  else
    echo "▸ S3 bucket 생성: $DATA_BUCKET"
    "${AWS[@]}" s3api create-bucket \
      --bucket "$DATA_BUCKET" \
      --create-bucket-configuration "LocationConstraint=$REGION"
  fi

  # 이미지 prefix만 public read 허용 (정책으로)
  "${AWS[@]}" s3api put-public-access-block \
    --bucket "$DATA_BUCKET" \
    --public-access-block-configuration \
      "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=false,RestrictPublicBuckets=false"

  cat > "$WORK/bucket-policy.json" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadImages",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$DATA_BUCKET/images/*"
  }]
}
JSON
  "${AWS[@]}" s3api put-bucket-policy --bucket "$DATA_BUCKET" --policy "file://$WORK/bucket-policy.json"

  # CORS — 직접 hotlink 시 다른 origin이 가져갈 수 있도록
  cat > "$WORK/cors.json" <<JSON
{ "CORSRules": [{ "AllowedOrigins": ["*"], "AllowedMethods": ["GET"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 3000 }] }
JSON
  "${AWS[@]}" s3api put-bucket-cors --bucket "$DATA_BUCKET" --cors-configuration "file://$WORK/cors.json"
}

# ── IAM (Lambda role) ────────────────────────────────────────────────────────

ensure_lambda_role() {
  cat > "$WORK/lambda-trust.json" <<JSON
{ "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Principal": {"Service":"lambda.amazonaws.com"}, "Action": "sts:AssumeRole" }] }
JSON
  if role_exists "$LAMBDA_ROLE"; then
    echo "▸ Lambda role exists: $LAMBDA_ROLE"
  else
    echo "▸ Lambda role 생성: $LAMBDA_ROLE"
    "${AWS[@]}" iam create-role --role-name "$LAMBDA_ROLE" \
      --assume-role-policy-document "file://$WORK/lambda-trust.json" >/dev/null
    "${AWS[@]}" iam attach-role-policy --role-name "$LAMBDA_ROLE" \
      --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
  fi

  cat > "$WORK/lambda-policy.json" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject","s3:PutObject","s3:DeleteObject","s3:ListBucket"],
      "Resource": ["arn:aws:s3:::$DATA_BUCKET","arn:aws:s3:::$DATA_BUCKET/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject","s3:PutObject"],
      "Resource": "arn:aws:s3:::$SITE_BUCKET/live-index.json"
    },
    {
      "Effect": "Allow",
      "Action": ["codebuild:StartBuild","codebuild:BatchGetBuilds"],
      "Resource": "arn:aws:codebuild:$REGION:$ACCOUNT:project/$BUILD_PROJECT"
    },
    {
      "Effect": "Allow",
      "Action": ["dynamodb:PutItem","dynamodb:GetItem","dynamodb:DeleteItem","dynamodb:Query","dynamodb:BatchWriteItem"],
      "Resource": [
        "arn:aws:dynamodb:$REGION:$ACCOUNT:table/$POSTS_TABLE",
        "arn:aws:dynamodb:$REGION:$ACCOUNT:table/$POSTS_TABLE/index/*"
      ]
    }
  ]
}
JSON
  "${AWS[@]}" iam put-role-policy --role-name "$LAMBDA_ROLE" \
    --policy-name "isuhani-cms-api-inline" \
    --policy-document "file://$WORK/lambda-policy.json"
}

# ── IAM (CodeBuild role) ─────────────────────────────────────────────────────

ensure_build_role() {
  cat > "$WORK/build-trust.json" <<JSON
{ "Version": "2012-10-17", "Statement": [{ "Effect": "Allow", "Principal": {"Service":"codebuild.amazonaws.com"}, "Action": "sts:AssumeRole" }] }
JSON
  if role_exists "$BUILD_ROLE"; then
    echo "▸ CodeBuild role exists: $BUILD_ROLE"
  else
    echo "▸ CodeBuild role 생성: $BUILD_ROLE"
    "${AWS[@]}" iam create-role --role-name "$BUILD_ROLE" \
      --assume-role-policy-document "file://$WORK/build-trust.json" >/dev/null
  fi

  cat > "$WORK/build-policy.json" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],
      "Resource": "arn:aws:logs:$REGION:$ACCOUNT:log-group:/aws/codebuild/$BUILD_PROJECT*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject","s3:GetObjectVersion","s3:ListBucket"],
      "Resource": ["arn:aws:s3:::$DATA_BUCKET","arn:aws:s3:::$DATA_BUCKET/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject","s3:DeleteObject","s3:GetObject","s3:ListBucket","s3:GetBucketLocation"],
      "Resource": ["arn:aws:s3:::$SITE_BUCKET","arn:aws:s3:::$SITE_BUCKET/*"]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::$ACCOUNT:distribution/$CF_DISTRIBUTION_ID"
    },
    {
      "Effect": "Allow",
      "Action": ["codebuild:CreateReportGroup","codebuild:CreateReport","codebuild:UpdateReport","codebuild:BatchPutTestCases","codebuild:BatchPutCodeCoverages"],
      "Resource": "arn:aws:codebuild:$REGION:$ACCOUNT:report-group/$BUILD_PROJECT-*"
    }
  ]
}
JSON
  "${AWS[@]}" iam put-role-policy --role-name "$BUILD_ROLE" \
    --policy-name "isuhani-cms-build-inline" \
    --policy-document "file://$WORK/build-policy.json"
}

# ── source zip upload ────────────────────────────────────────────────────────

upload_source() {
  echo "▸ 소스 zip 작성"
  local zip="$WORK/source.zip"
  rm -f "$zip"
  cd "$ROOT"
  # service/frontend + buildspec.yml만 묶음 (node_modules 제외)
  cp "$BUILD_DIR/buildspec.yml" buildspec.yml
  # 제외: 포스트(S3 단일출처) · /admin(deploy-admin-frontend가 단독 배포) · 빌드 산출물.
  zip -rq "$zip" buildspec.yml \
    service/frontend/package.json service/frontend/package-lock.json service/frontend/next.config.js \
    service/frontend/tsconfig.json service/frontend/tailwind.config.ts service/frontend/postcss.config.js \
    service/frontend/next-env.d.ts \
    service/frontend/src service/frontend/public \
    -x 'service/frontend/node_modules/*' 'service/frontend/.next/*' 'service/frontend/out/*' \
       'service/frontend/public/admin/*' \
       'service/frontend/public/uploads/cms/*' \
       'service/frontend/src/data/blog/embeddings.json' \
       'service/frontend/src/data/blog/posts/*' \
       'service/frontend/src/data/blog/index.json'
  rm -f buildspec.yml
  echo "▸ S3 업로드: s3://$DATA_BUCKET/source/source.zip ($(du -h "$zip" | cut -f1))"
  "${AWS[@]}" s3 cp "$zip" "s3://$DATA_BUCKET/source/source.zip"
}

# ── CodeBuild project ────────────────────────────────────────────────────────

ensure_build_project() {
  local role_arn
  role_arn=$("${AWS[@]}" iam get-role --role-name "$BUILD_ROLE" --query Role.Arn --output text)

  # 신규 생성한 IAM role은 즉시 trust되지 않을 수 있어 짧게 대기
  if ! build_project_exists "$BUILD_PROJECT"; then
    echo "▸ CodeBuild project 생성: $BUILD_PROJECT"
    sleep 8
  fi

  local source_json="{
    \"type\": \"S3\",
    \"location\": \"$DATA_BUCKET/source/source.zip\",
    \"buildspec\": \"buildspec.yml\"
  }"
  local artifacts_json='{ "type": "NO_ARTIFACTS" }'
  local env_json="{
    \"type\": \"LINUX_CONTAINER\",
    \"image\": \"aws/codebuild/standard:7.0\",
    \"computeType\": \"BUILD_GENERAL1_SMALL\",
    \"environmentVariables\": [
      {\"name\":\"CMS_BUCKET\",\"value\":\"$DATA_BUCKET\"},
      {\"name\":\"SITE_BUCKET\",\"value\":\"$SITE_BUCKET\"},
      {\"name\":\"CF_DISTRIBUTION_ID\",\"value\":\"$CF_DISTRIBUTION_ID\"}
    ]
  }"

  if build_project_exists "$BUILD_PROJECT"; then
    echo "▸ CodeBuild project 업데이트"
    "${AWS[@]}" codebuild update-project \
      --name "$BUILD_PROJECT" \
      --source "$source_json" \
      --artifacts "$artifacts_json" \
      --environment "$env_json" \
      --service-role "$role_arn" \
      --timeout-in-minutes 15 >/dev/null
  else
    "${AWS[@]}" codebuild create-project \
      --name "$BUILD_PROJECT" \
      --source "$source_json" \
      --artifacts "$artifacts_json" \
      --environment "$env_json" \
      --service-role "$role_arn" \
      --timeout-in-minutes 15 >/dev/null
  fi
}

# ── Lambda ───────────────────────────────────────────────────────────────────

build_lambda_zip() {
  echo "▸ Lambda 패키지 작성"
  cd "$LAMBDA_DIR"
  rm -rf node_modules package-lock.json
  npm install --omit=dev --no-audit --no-fund >/dev/null
  rm -f "$WORK/lambda.zip"
  zip -rq "$WORK/lambda.zip" index.mjs constants.mjs handlers/ services/ utils/ node_modules package.json
  echo "▸ Lambda zip: $(du -h "$WORK/lambda.zip" | cut -f1)"
}

ensure_lambda() {
  local role_arn
  role_arn=$("${AWS[@]}" iam get-role --role-name "$LAMBDA_ROLE" --query Role.Arn --output text)

  if lambda_exists "$LAMBDA_NAME"; then
    echo "▸ Lambda 코드 업데이트"
    "${AWS[@]}" lambda update-function-code \
      --function-name "$LAMBDA_NAME" \
      --zip-file "fileb://$WORK/lambda.zip" >/dev/null
    "${AWS[@]}" lambda wait function-updated --function-name "$LAMBDA_NAME"
  else
    echo "▸ Lambda 생성"
    sleep 8  # IAM trust propagation
    "${AWS[@]}" lambda create-function \
      --function-name "$LAMBDA_NAME" \
      --runtime nodejs20.x \
      --architectures arm64 \
      --role "$role_arn" \
      --handler "index.handler" \
      --memory-size 512 \
      --timeout 30 \
      --zip-file "fileb://$WORK/lambda.zip" >/dev/null
    "${AWS[@]}" lambda wait function-active --function-name "$LAMBDA_NAME"
  fi
}

ensure_lambda_env() {
  local pw_file="$WORK/cms-password.txt"
  local pw
  if [ -f "$pw_file" ] && [ "${RESET_PW:-0}" != "1" ]; then
    pw=$(cat "$pw_file")
  else
    pw=$(random_password)
    echo "$pw" > "$pw_file"
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo " CMS 비밀번호 (저장하세요 — 다시 출력되지 않습니다)"
    echo "  user: $CMS_USER"
    echo "  pass: $pw"
    echo "════════════════════════════════════════════════════════"
    echo ""
  fi

  "${AWS[@]}" lambda update-function-configuration \
    --function-name "$LAMBDA_NAME" \
    --environment "Variables={BUCKET=$DATA_BUCKET,WEB_BUCKET=$SITE_BUCKET,BUILD_PROJECT=$BUILD_PROJECT,POSTS_TABLE=$POSTS_TABLE,CMS_USER=$CMS_USER,CMS_PASSWORD=$pw}" \
    >/dev/null
  "${AWS[@]}" lambda wait function-updated --function-name "$LAMBDA_NAME"
}

ensure_function_url() {
  local existing
  existing=$("${AWS[@]}" lambda get-function-url-config --function-name "$LAMBDA_NAME" 2>/dev/null || true)
  local cors_json='{"AllowOrigins":["*"],"AllowMethods":["*"],"AllowHeaders":["content-type","authorization"],"MaxAge":600}'
  if [ -z "$existing" ]; then
    echo "▸ Function URL 생성"
    "${AWS[@]}" lambda create-function-url-config \
      --function-name "$LAMBDA_NAME" \
      --auth-type NONE \
      --cors "$cors_json" >/dev/null
  else
    echo "▸ Function URL 갱신"
    "${AWS[@]}" lambda update-function-url-config \
      --function-name "$LAMBDA_NAME" \
      --auth-type NONE \
      --cors "$cors_json" >/dev/null
  fi
  # 누구나 호출 가능 (Basic Auth는 Lambda 내부에서)
  "${AWS[@]}" lambda add-permission \
    --function-name "$LAMBDA_NAME" \
    --statement-id "FunctionURLAllowPublic" \
    --action "lambda:InvokeFunctionUrl" \
    --principal "*" \
    --function-url-auth-type NONE 2>/dev/null || true
  "${AWS[@]}" lambda get-function-url-config --function-name "$LAMBDA_NAME" --query FunctionUrl --output text
}

# ── orchestration ────────────────────────────────────────────────────────────

case "$MODE" in
  --update-lambda)
    ensure_lambda_role   # DynamoDB 권한 포함(멱등) — 비번/env는 건드리지 않음
    build_lambda_zip
    ensure_lambda
    ;;
  --upload-source)
    upload_source
    ;;
  --reset-password)
    RESET_PW=1 ensure_lambda_env
    ;;
  all|*)
    ensure_data_bucket
    ensure_lambda_role
    ensure_build_role
    upload_source
    ensure_build_project
    build_lambda_zip
    ensure_lambda
    ensure_lambda_env
    URL=$(ensure_function_url)
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo " 부트스트랩 완료"
    echo "  CMS API URL : $URL"
    echo "  S3 (data)   : s3://$DATA_BUCKET"
    echo "  S3 (site)   : s3://$SITE_BUCKET"
    echo "  CF distro   : $CF_DISTRIBUTION_ID"
    echo "  Lambda      : $LAMBDA_NAME"
    echo "  CodeBuild   : $BUILD_PROJECT"
    echo "════════════════════════════════════════════════════════"
    ;;
esac
