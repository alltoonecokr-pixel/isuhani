# 2026-06-19 — CMS 개편 · 이미지 이관 · 레포 재편

## 1. 어드민(admin/frontend) 개편
- 글 목록을 티스토리 구조로 재작성: 작은 썸네일 + 텍스트 폴백(깨진 네이버 썸네일 자동 숨김), 보기 필터(전체/CMS작성/네이버이전 + 카테고리), 변경=선택 일괄삭제.
- 에디터 라이브 미리보기: iframe 기반 디바이스 목업(모바일 폰 베젤 / 데스크탑 브라우저창, 1280px 렌더 후 패널에 맞춰 축소). "넓게 보기"로 전체폭 전환. 사이트 sanitizeBody·.naver-body CSS를 이식해 실제 렌더와 동일.
- 이미지 자유 편집: TipTap 커스텀 노드(ResizableImage) — 드래그 핸들 + 프리셋(작게/중간/크게) + 정렬(좌/중/우). 저장형 `<img style="width:NN%" data-align>`, sanitizeBody·globals.css가 보존·존중(전체 글 적용, 기본은 max-width 가드).
- 디자인 정리: 이모지 → 라인 SVG 아이콘(디바이스 토글, 사진/영상 버튼).
- 로컬 dev는 CORS 때문에 Vite 프록시(`/__cms-api`)로 우회. API Gateway 허용 origin = isuclinic.co.kr + localhost:5173.

## 2. 레거시 이미지 이관 (네이버 → 자체 S3)
- 본문의 네이버 핫링크 이미지 고유 7,418장 중 6,366장(85.8%)을 `s3://isuhani-clinic-data/images/legacy/`로 이관. 유실 1,052장은 2010년대 만료분(복구 불가).
- 본문 1,005개의 URL을 S3 주소로 치환(body+images[]+og+index 썸네일, 총 20,930곳). 원본 백업 `posts-backup-20260619/`. CodeBuild 재빌드로 라이브 반영.
- 화질 문제(저해상도 저장) 발견 → 최고해상도 재다운로드(후보 type 중 최대 선택, 기준선보다 클 때만 교체) → 5,297장 고화질 교체.
- 도구: `admin/backend/tools/{recon,migrate,rewrite,upgrade}-image*.mjs` (일회성, 보관).

## 3. 저장 아키텍처 결론 (docs/blog-db-architecture.md v0.2)
- 공개 사이트는 정적(CloudFront)이라 DB는 직원 편집용 → 최적화 축은 동시편집 안전성·확장성.
- 권고 B안: 메타=DynamoDB(`isuhani-journal-posts`), 본문=S3(`posts/{id}.json`), 이미지=S3. 본문 DB 저장 회피(비용·400KB).
- 인덱스: (status/category + date) GSI + 커서 페이지네이션 = 스캔 회피(WordPress type_status_date 동형). 미결: A/B 최종, 공개 정적유지 vs 동적.

## 4. 레포 구조 재편
- 평면 구조 → `service/{frontend,backend}` + `admin/{frontend,backend}`.
  - service/frontend ← frontend, service/backend ← infra/lambda-chat
  - admin/frontend ← cms/admin-app, admin/backend ← infra/cms-api(+tools)
- 제거: 옛 로컬 CMS(cms/server.mjs, cms/admin.html), 빌드 산출물(lambda-chat.zip, out, .next), 빈 backend/·cms/·infra/.
- 배포 스크립트 4종(scripts/): deploy-service-frontend / deploy-service-backend / deploy-admin-frontend / deploy-admin-backend. 모두 올투원(isuhani) 프로필 고정(셸 AWS_PROFILE에 안 휘둘림).
- 발행 파이프라인: buildspec·source.zip을 service/frontend 경로로 갱신 + 재업로드. /admin은 source.zip·발행 --delete에서 제외 → deploy-admin-frontend가 단독 배포(상호 클로버 방지).

## 배포 명령 (요약)
- 사이트: `./scripts/deploy-service-frontend.sh`
- 어드민 화면: `./scripts/deploy-admin-frontend.sh`
- 챗봇 람다: `./scripts/deploy-service-backend.sh`
- CMS API/인프라: `./scripts/deploy-admin-backend.sh [--upload-source]`
