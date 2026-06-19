# 2026-06-19 — feat: SEO 전면 구축 + 분석 도구 연동

## 배경

1,042개 글과 6개 진료 페이지에 메타 태그·구조화 데이터·sitemap 등 SEO 요소가 전무한 상태였음.
Google Search Console 미등록, GA4/Clarity 미설치.

---

## 작업 내역

### A. SEO 기반 구축

**`src/lib/site.ts` (신규)**
- 도메인 상수 `SITE_URL = "https://isuclinic.co.kr"` 단일 관리
- layout.tsx, sitemap.ts, [logNo]/page.tsx 등 전역 참조

**`app/robots.ts` (신규)**
- 모든 크롤러 허용, `/admin/` 차단
- GPTBot·ClaudeBot·PerplexityBot·Google-Extended·Bingbot 명시 허용
- sitemap 위치 선언

**`app/sitemap.ts` (신규)**
- 정적 5개 (`/`, `/journal`, `/ask`, `/clinic`, `/visit-guide`)
- 진료 6개 (`/treatment/[slug]`)
- 글 1,042개 (`/[logNo]`) — `lastModified: post.date` 포함
- 총 1,053개 URL, `out/sitemap.xml` 생성 확인

**`app/layout.tsx` 수정**
- MedicalClinic JSON-LD `url`: 네이버 블로그 → `SITE_URL` 수정
- `sameAs` 추가: 네이버 블로그, 네이버 지도
- `@id` 필드 추가

### B. 글 상세 페이지 SEO

**`app/[logNo]/page.tsx` 수정**
- `generateMetadata` 강화
  - `alternates.canonical` 절대 URL 추가
  - `openGraph.url` 추가
  - `openGraph.type: "article"` 추가
  - `openGraph.publishedTime` / `modifiedTime` 추가 (post.date ISO 변환)
  - `twitter.card: "summary_large_image"` 추가
- `BlogPosting` JSON-LD 삽입 (컴포넌트 상단 `<script>` 태그)
  - `headline`, `description`, `image`, `datePublished`, `dateModified`
  - `mainEntityOfPage`: 글 절대 URL
  - `author` / `publisher`: Organization (이수한의원) — 개별 저자 필드 없어 임시 처리

> **미결 — B-3 저자**: 글 JSON에 저자 필드 없음. 향후 CMS에 저자(한의사) 필드 추가 후
> `{ "@type": "Person", "name": "..." }` 으로 교체 필요. E-E-A-T 의료 콘텐츠에 중요.

### C. Google Analytics 4

- GA4 속성 생성: `isuclinic.co.kr`
- 측정 ID: `G-72JPJQR1Y3`
- `NEXT_PUBLIC_GA_ID` 환경 변수로 관리 (비어있으면 스크립트 미삽입)
- `next/script strategy="afterInteractive"` 로 삽입

### D. Microsoft Clarity

- 프로젝트 ID: `x9ec111qal`
- `NEXT_PUBLIC_CLARITY_ID` 환경 변수로 관리
- `next/script strategy="afterInteractive"` 로 삽입
- GA4 통합 완료 (Clarity 대시보드에서 연결)

### E. Google Search Console

- 소유권 확인 파일: `google78921185acfec329.html`
- `public/` 폴더에 보관 + S3에 직접 업로드 (`--cache-control no-cache`)
- sitemap.xml 제출 대기 (Search Console → Sitemaps 탭에서 직접 제출 필요)

---

## 환경 변수 현황 (`service/frontend/.env.local`)

```
NEXT_PUBLIC_CHAT_ENDPOINT=https://d2zjli04lm5qax.cloudfront.net/chat-api
NEXT_PUBLIC_GA_ID=G-72JPJQR1Y3
NEXT_PUBLIC_CLARITY_ID=x9ec111qal
```

---

## 배포

- 총 3회 배포 (`deploy-service-frontend.sh`)
- sitemap.xml / robots.txt / BlogPosting JSON-LD 모두 out/ 생성 확인
- CloudFront 무효화 완료

---

## 남은 작업

- [ ] Google Search Console → Sitemaps 탭 → `https://isuclinic.co.kr/sitemap.xml` 제출
- [ ] Search Console → GA4 속성 연결 (설정 → 속성 연결)
- [ ] 저자 필드 CMS 추가 후 BlogPosting author를 Person으로 교체
- [ ] 2~4시간 후 Clarity 레코딩 탭 수집 확인
