# 이수한의원 v1 웹사이트 — AI 컨텍스트

## 프로젝트 정체
올투원 한의원(isuclinic.co.kr)의 건강저널 블로그 + 챗봇 쑤(Suu) + CMS 어드민으로 구성된 v1 사이트.
의사·조무사 등 비개발자 직원이 CMS로 글을 쓰면 CodeBuild가 정적 사이트로 자동 빌드·배포하는 구조.

---

## 레포 구조

```
service/
  frontend/    Next.js 14 정적 사이트 (NEXT_EXPORT=1, S3+CloudFront)
  backend/     챗봇 쑤 — RAG Lambda (us-east-1, Bedrock Cohere+Claude)
admin/
  frontend/    CMS 어드민 SPA (Vite+React, /admin/ 경로에 배포)
  backend/     CMS API Lambda + CodeBuild buildspec + 배포 스크립트
    lambda/    index.mjs — S3 기반 CRUD, 로그인, 발행 트리거
    build/     buildspec.yml — CodeBuild "발행" 파이프라인
    tools/     이미지 이관 일회성 스크립트 (보관용, 재실행 불필요)
scripts/
  deploy-service-frontend.sh   사이트 정적 빌드 → S3 sync → CF invalidate
  deploy-admin-frontend.sh     어드민 SPA 빌드 → S3 /admin/ 업로드
  deploy-service-backend.sh    챗봇 Lambda 패키징·배포
  deploy-admin-backend.sh      CMS Lambda + CodeBuild 부트스트랩 (deploy-cms.sh 래퍼)
docs/
  Phase/       작업 기록 (날짜별)
  Ticket/      스프린트 태스크
  blog-db-architecture.md   저장 설계 v0.2
```

---

## 개발 서버

```bash
# 사이트
cd service/frontend && npm run dev          # http://localhost:3003

# CMS 어드민 (CORS 우회 프록시 포함)
cd admin/frontend && npm run dev            # http://localhost:5180
```

어드민 로그인: `admin` / `12341234`  
CMS 프록시: 로컬에선 `/__cms-api` → API Gateway (vite.config.ts server.proxy 설정). DEV 분기는 `admin/frontend/src/api.ts` 참조.

---

## 배포 명령

```bash
# 올투원 AWS 프로필: CLINIC_PROFILE=isuhani (셸의 AWS_PROFILE 무시)
./scripts/deploy-service-frontend.sh        # 사이트 전체 재배포
./scripts/deploy-admin-frontend.sh          # 어드민 UI 업데이트
./scripts/deploy-service-backend.sh         # 챗봇 Lambda
./scripts/deploy-admin-backend.sh [--upload-source] [--update-lambda]
```

`--upload-source` 옵션: buildspec 또는 service/frontend 경로 변경 시 반드시 실행.  
CodeBuild "발행"은 CMS 어드민의 "발행" 버튼으로 트리거 — 스크립트 아님.

---

## AWS 리소스 (ap-northeast-2, 올투원 계정 018789813499)

| 이름 | 종류 | 역할 |
|---|---|---|
| isuhani-clinic-web | S3 | 정적 사이트 + /admin/ SPA |
| isuhani-clinic-data | S3 | CMS 포스트(posts/), 이미지(images/), 소스zip(source/) |
| ENI986CTR7J51 | CloudFront | isuclinic.co.kr CDN |
| isuhani-cms-api | Lambda | CMS CRUD API (Function URL) |
| isuhani-cms-build | CodeBuild | 발행 파이프라인 |
| isuhani-chat | Lambda (us-east-1) | 챗봇 RAG |

---

## 핵심 아키텍처 결정

**S3 = 단일 출처.** 공개 사이트는 정적(CloudFront). DB는 직원 편집용 인터페이스.  
- 글 원본: `s3://isuhani-clinic-data/posts/{logNo}.json` (본문 HTML 포함)  
- 이미지: `s3://isuhani-clinic-data/images/` (public-read)  
- 인덱스: `s3://isuhani-clinic-data/index.json` (목록 카탈로그)  
- 발행 시 CodeBuild가 posts/ → `service/frontend/src/data/blog/posts/` sync 후 Next 빌드

**이미지 편집 (admin/frontend):** TipTap 커스텀 노드 `ResizableImage` — 드래그 크기 조정 + 정렬.  
저장 형식: `<img style="width:NN%" data-align="center">`. sanitizeBody와 globals.css가 이 형식 보존.

**DynamoDB 도입 보류:** 메타만 DynamoDB, 본문은 S3 유지 방향으로 검토 중 (미결).

---

## 중요 함정 / 주의사항

1. **`CLINIC_PROFILE`** 사용, `AWS_PROFILE` 사용 금지.  
   셸에 `AWS_PROFILE=yeonggwang` (서울경제 계정)이 export돼 있어 오염 위험.

2. **buildspec `--exclude "admin/*"`** 필수.  
   발행 파이프라인이 S3 sync 시 /admin 폴더를 지우면 어드민 SPA가 날아감.  
   `deploy-admin-frontend.sh`만 /admin을 관리.

3. **source.zip 재업로드** 규칙.  
   `service/frontend/` 경로 변경 또는 buildspec 수정 후엔 반드시  
   `./scripts/deploy-admin-backend.sh --upload-source` 실행.

4. **CMS API CORS.** API Gateway 허용 origin = `isuclinic.co.kr`, `localhost:5173`.  
   다른 포트는 Vite 프록시(/__cms-api)로 우회 — 이미 vite.config.ts에 세팅됨.

5. **글 JSON 전체 텍스트 치환.** body 외에 `images[]` 배열, `meta.ogImage`, index.json 썸네일 등에도 URL 중복 존재. 필드별 아닌 JSON 전체 텍스트로 한번에 처리.

6. **sanitizeBody (`service/frontend/src/lib/blog.ts`).** `width:%`와 `data-align` 보존, 나머지 네이버 인라인 스타일 제거. 이 함수 수정 시 `admin/frontend/src/preview.ts`도 동일하게 수정.

---

## 코드 컨벤션

- 타입: `admin/frontend/src/types.ts` (PostIndexEntry, FullPost, PostInput, BuildStatus)
- API 기저 URL: `admin/frontend/src/api.ts` (DEFAULT_API, DEV 분기)
- 이미지 노드: `admin/frontend/src/editor/ResizableImage.tsx`
- 디바이스 미리보기: `admin/frontend/src/components/PreviewPane.tsx`
- 글 목록: `admin/frontend/src/components/ListView.tsx`
- 글 편집: `admin/frontend/src/components/EditorView.tsx`
- CSS 글로벌: `service/frontend/src/app/globals.css` (.naver-body 이미지 정렬 규칙 포함)

디자인 톤: Toss/당근 스타일 — 부드러운 그림자, 넉넉한 여백, 이모지 대신 라인 SVG.  
이모지·볼드 강조(`**text**`) 사용 금지.

---

## 현재 상태 (2026-06-19 기준)

완료:
- 어드민 티스토리식 목록, 디바이스 미리보기(모바일/데스크탑 iframe), 이미지 자유 크기·정렬
- 네이버 이미지 6,366장 S3 이관 + 본문 URL 치환 + 최고화질 재다운로드
- 레포 구조 재편 (service/admin × frontend/backend)

보류/미결:
- DynamoDB 최종 채택 여부 (A안 vs B안)
- 챗봇 쑤 Bedrock 액세스 (올투원 계정 Claude 모델 활성화 대기)
- 사이트 재배포 (이미지 정렬 CSS 반영 — `deploy-service-frontend.sh` 1회 실행 필요)
