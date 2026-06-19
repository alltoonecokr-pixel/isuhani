#!/bin/bash
# 이수한의원 v1 — 어드민 백엔드(CMS API) 배포 (래퍼)
#
# 실제 로직은 admin/backend/deploy-cms.sh 에 있다(IAM·Lambda·CodeBuild 프로비저닝 +
# 사이트 빌드 트리거 + source.zip 업로드). 이 스크립트는 scripts/ 에서 일관된
# 이름으로 호출하기 위한 얇은 래퍼다. 인자는 그대로 전달한다.
#
# 사용:
#   ./scripts/deploy-admin-backend.sh                  # 전체(프로비저닝 + 람다 배포)
#   ./scripts/deploy-admin-backend.sh --upload-source  # CodeBuild source.zip만 갱신
#   ./scripts/deploy-admin-backend.sh --reset-password # CMS 비밀번호 재생성

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
exec "$ROOT/admin/backend/deploy-cms.sh" "$@"
