#!/bin/bash
# 이수한의원 v1 — 사이트(service/frontend) 배포 (원커맨드)
#
# Next.js 정적 export 빌드 → S3(isuhani-clinic-web) sync → CloudFront 무효화.
# 글/이미지는 S3가 단일 출처라, 발행 글까지 정확히 반영하려면 빌드 전 S3에서
# posts를 받아온다(--no-sync 로 끄기 가능). /admin 은 건드리지 않는다.
#
# 사용:
#   ./scripts/deploy-service-frontend.sh           # posts 동기화 + 빌드 + 배포
#   ./scripts/deploy-service-frontend.sh --fast     # 빌드 스킵, out/ 만 업로드
#   ./scripts/deploy-service-frontend.sh --no-sync  # 로컬 posts 그대로(동기화 생략)

set -euo pipefail

BUCKET="${BUCKET:-isuhani-clinic-web}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-ENI986CTR7J51}"
DATA_BUCKET="${DATA_BUCKET:-isuhani-clinic-data}"
AWS_PROFILE="${CLINIC_PROFILE:-isuhani}"      # 셸의 AWS_PROFILE에 휘둘리지 않게 고정
AWS_REGION="${AWS_REGION:-ap-northeast-2}"
export AWS_PROFILE AWS_REGION

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONT="$ROOT/service/frontend"
POSTS="$FRONT/src/data/blog/posts"

FAST=0; NOSYNC=0
for a in "$@"; do
  [ "$a" = "--fast" ] && FAST=1
  [ "$a" = "--no-sync" ] && NOSYNC=1
done

echo "▸ 사이트 배포"
echo "  프로필     : $AWS_PROFILE"
echo "  S3 버킷    : $BUCKET"
echo "  CloudFront : $DISTRIBUTION_ID"
echo ""

cd "$FRONT"

if [ "$FAST" != "1" ]; then
  if [ "$NOSYNC" != "1" ]; then
    echo "▸ posts 동기화 — s3://$DATA_BUCKET/posts/ → 로컬(발행 글 반영, 단일 출처)"
    rm -rf "$POSTS" && mkdir -p "$POSTS"
    aws s3 sync "s3://$DATA_BUCKET/posts/" "$POSTS/" --exclude "*" --include "*.json" --only-show-errors
    COUNT=$(ls "$POSTS"/*.json 2>/dev/null | wc -l | tr -d ' ')
    echo "  포스트 ${COUNT}개"
    [ "$COUNT" -gt 100 ] || { echo "✗ 포스트가 너무 적음 — 중단" >&2; exit 1; }
  fi
  echo "▸ next build (static export)"
  rm -rf .next out
  NEXT_EXPORT=1 npm run build
  echo "▸ image-sitemap.xml 생성"
  node scripts/generate-image-sitemap.mjs
fi

[ -d out ] || { echo "✗ out/ 없음 — 빌드 먼저" >&2; exit 1; }

echo "▸ S3 업로드 — _next/static (1y immutable)"
aws s3 sync out/_next/static "s3://$BUCKET/_next/static" \
  --cache-control "public, max-age=31536000, immutable" --only-show-errors

echo "▸ S3 업로드 — 나머지 (short cache). /admin·_internal 보호"
aws s3 sync out/ "s3://$BUCKET/" \
  --delete --exclude "_next/static/*" --exclude "_internal/*" --exclude "admin/*" \
  --cache-control "public, max-age=300, s-maxage=3600" --only-show-errors

echo "▸ CloudFront 무효화 (/*)"
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" \
  --query 'Invalidation.[Id,Status]' --output text

echo ""
echo "✓ 완료 → https://isuclinic.co.kr  (전파 1~3분)"
