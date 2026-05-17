#!/bin/bash
# 이수한의원 v1 — S3 + CloudFront 배포 스크립트
# 사용:
#   BUCKET=isuhani-clinic-v1 DISTRIBUTION_ID=EXXX AWS_PROFILE=default ./scripts/deploy.sh
#
# 환경변수
#   BUCKET           — 필수. S3 버킷 이름
#   DISTRIBUTION_ID  — 선택. 있으면 invalidation 호출
#   AWS_PROFILE      — 기본 default
#   AWS_REGION       — 기본 ap-northeast-2
#   SKIP_BUILD=1     — 빌드 건너뛰고 out/만 업로드

set -euo pipefail

BUCKET=${BUCKET:?"BUCKET 환경변수 필수"}
DISTRIBUTION_ID=${DISTRIBUTION_ID:-}
PROFILE=${AWS_PROFILE:-default}
REGION=${AWS_REGION:-ap-northeast-2}
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONT="$ROOT/frontend"

cd "$FRONT"

if [ "${SKIP_BUILD:-0}" != "1" ]; then
  echo "▸ next build (static export)"
  rm -rf .next out
  NEXT_EXPORT=1 npm run build
fi

if [ ! -d "out" ]; then
  echo "out/ 디렉토리가 없습니다. 빌드를 먼저 실행하세요." >&2
  exit 1
fi

echo "▸ S3 업로드 — _next/static (long cache, 1y immutable)"
aws s3 sync out/_next/static "s3://$BUCKET/_next/static" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --profile "$PROFILE" --region "$REGION"

echo "▸ S3 업로드 — 나머지 (short cache, 5m)"
aws s3 sync out/ "s3://$BUCKET/" \
  --delete \
  --exclude "_next/static/*" \
  --cache-control "public, max-age=300, s-maxage=3600" \
  --profile "$PROFILE" --region "$REGION"

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "▸ CloudFront invalidation — $DISTRIBUTION_ID"
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --profile "$PROFILE"
fi

echo "✓ 완료. 버킷: $BUCKET, 배포: ${DISTRIBUTION_ID:-(스킵)}"
