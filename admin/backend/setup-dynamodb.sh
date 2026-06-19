#!/bin/bash
# 이수한의원 건강 저널 — DynamoDB 메타데이터 테이블 생성 (직접 CLI, CloudFormation 없음)
#
# 사용:
#   AWS_PROFILE=isuhani ./setup-dynamodb.sh
#
# 환경변수
#   TABLE        기본 isuhani-journal-posts
#   AWS_PROFILE  기본 isuhani
#   AWS_REGION   기본 ap-northeast-2
#
# 설계(docs/blog-db-architecture.md):
#   PK  postId
#   GSI1  최신 피드   GSI1PK="POST"     GSI1SK=date
#   GSI2  카테고리별  GSI2PK=category   GSI2SK=date
# 본문 HTML은 DynamoDB가 아니라 S3(bodyKey)에 저장.

set -euo pipefail

TABLE=${TABLE:-isuhani-journal-posts}
PROFILE=${AWS_PROFILE:-isuhani}
REGION=${AWS_REGION:-ap-northeast-2}

if aws dynamodb describe-table --table-name "$TABLE" --profile "$PROFILE" --region "$REGION" >/dev/null 2>&1; then
  echo "이미 존재: $TABLE — 생성 건너뜀"
  exit 0
fi

echo "▸ DynamoDB 테이블 생성: $TABLE ($REGION)"
aws dynamodb create-table \
  --table-name "$TABLE" \
  --billing-mode PAY_PER_REQUEST \
  --attribute-definitions \
      AttributeName=postId,AttributeType=S \
      AttributeName=GSI1PK,AttributeType=S \
      AttributeName=GSI1SK,AttributeType=S \
      AttributeName=GSI2PK,AttributeType=S \
      AttributeName=GSI2SK,AttributeType=S \
  --key-schema \
      AttributeName=postId,KeyType=HASH \
  --global-secondary-indexes '[
    {
      "IndexName": "GSI1",
      "KeySchema": [
        {"AttributeName":"GSI1PK","KeyType":"HASH"},
        {"AttributeName":"GSI1SK","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    },
    {
      "IndexName": "GSI2",
      "KeySchema": [
        {"AttributeName":"GSI2PK","KeyType":"HASH"},
        {"AttributeName":"GSI2SK","KeyType":"RANGE"}
      ],
      "Projection": {"ProjectionType":"ALL"}
    }
  ]' \
  --profile "$PROFILE" --region "$REGION" >/dev/null

echo "▸ ACTIVE 대기…"
aws dynamodb wait table-exists --table-name "$TABLE" --profile "$PROFILE" --region "$REGION"
echo "✓ 완료: $TABLE"
