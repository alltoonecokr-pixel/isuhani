#!/bin/bash
# 이수한의원 v1 — CMS 어드민(/admin) 전용 배포 (원커맨드)
#
# admin/frontend(Vite/React)를 빌드해 service/frontend/public/admin 으로 내보내고,
# 운영 버킷의 /admin/ 폴더만 갱신한 뒤 CloudFront를 무효화한다.
# 사이트 글/이미지에는 손대지 않는다(영향 0).
#
# 사용:
#   ./scripts/deploy-admin-frontend.sh            # 빌드 후 배포
#   ./scripts/deploy-admin-frontend.sh --fast     # 빌드 건너뛰고 현재 산출물만 업로드
#
# 값 변경이 필요할 때만 환경변수로 덮어쓰기:
#   BUCKET=... DISTRIBUTION_ID=... CLINIC_PROFILE=... ./scripts/deploy-admin-frontend.sh

set -euo pipefail

# ── 올투원 계정 고정 (배포 대상) ─────────────────────────────────
# 주의: 셸에 AWS_PROFILE=yeonggwang(서울경제) 등이 떠 있어도 휘둘리지 않게
# 올투원 프로필로 강제한다. 다른 프로필로 보내려면 CLINIC_PROFILE 로만 덮어쓴다.
BUCKET="${BUCKET:-isuhani-clinic-web}"
DISTRIBUTION_ID="${DISTRIBUTION_ID:-ENI986CTR7J51}"
AWS_PROFILE="${CLINIC_PROFILE:-isuhani}"
AWS_REGION="${AWS_REGION:-ap-northeast-2}"
export AWS_PROFILE AWS_REGION

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/admin/frontend"
OUT="$ROOT/service/frontend/public/admin"

echo "▸ CMS 어드민 배포"
echo "  프로필     : $AWS_PROFILE"
echo "  S3 버킷    : $BUCKET/admin/"
echo "  CloudFront : $DISTRIBUTION_ID"
echo ""

# 1) 빌드 (--fast 면 스킵)
if [ "${1:-}" != "--fast" ]; then
  echo "▸ admin-app 빌드 (tsc + vite build)"
  ( cd "$APP" && npm run build )
else
  echo "▸ 빌드 스킵 — 현재 $OUT 그대로 업로드"
fi

if [ ! -f "$OUT/index.html" ]; then
  echo "✗ $OUT/index.html 없음 — 빌드 먼저 실행하세요." >&2
  exit 1
fi

# 2) 안전장치: 개발용 프록시 경로(/__cms-api)가 빌드에 섞였으면 중단
if grep -rq "__cms-api" "$OUT/assets" 2>/dev/null; then
  echo "✗ 빌드에 개발 프록시(/__cms-api)가 포함됨 — 운영에서 깨짐. 중단." >&2
  echo "  (vite build는 import.meta.env.DEV=false 라 정상이면 execute-api가 박혀야 함)" >&2
  exit 1
fi
if ! grep -rq "execute-api" "$OUT/assets" 2>/dev/null; then
  echo "✗ 빌드에서 API Gateway 주소를 못 찾음 — 설정 확인 필요. 중단." >&2
  exit 1
fi
echo "▸ 빌드 검증 OK (API Gateway 직접 호출, 프록시 없음)"

# 3) 업로드 — /admin/ 한정, 옛 에셋 정리(--delete). 다른 경로는 건드리지 않음.
echo "▸ S3 업로드 → s3://$BUCKET/admin/"
aws s3 sync "$OUT/" "s3://$BUCKET/admin/" \
  --delete \
  --cache-control "public, max-age=300" \
  --region "$AWS_REGION"

# 4) CloudFront 무효화 — /admin/* 만
echo "▸ CloudFront 무효화 (/admin/*)"
aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/admin/*" \
  --query 'Invalidation.[Id,Status]' --output text

echo ""
echo "✓ 완료 → https://isuclinic.co.kr/admin  (전파 1~3분, 강력 새로고침 권장)"
