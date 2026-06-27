# 즉시 발행 (Instant Publish) — 하이브리드 설계

## 배경
발행 = 정적 사이트 전체 재빌드(1,043글, ~2.5분)라 글이 바로 안 올라간다.
데이터는 저장 즉시 S3(posts/)+DynamoDB+live-index.json에 들어가므로, 공개 렌더만 즉시화하면 된다.
정적 HTML은 SEO 자산이라 유지하고, 그 위에 "즉시 렌더" 레이어를 얹는 하이브리드.

## 구성
1. lambda 저장 시 `s3://isuhani-clinic-web/live-posts/{logNo}.json` 공개 기록(원본 body 포함).
   - live-index.json과 동일 패턴. buildspec sync --delete에서 `live-posts/*` 제외.
   - 삭제 시 해당 객체도 제거.
2. 새 글: 정적 HTML 없음 → CloudFront 404 → `/live/` 폴백(클라이언트)이 URL의 logNo로
   `/live-posts/{logNo}.json` fetch 후 렌더. CF custom error response 404→/live/index.html (200, 원 URL 유지).
3. 수정 글: 상세 페이지 클라이언트 섬이 로드 시 live-posts와 본문 비교 → 다르면 교체(stale-while-revalidate).
4. SEO 정적 HTML은 기존 빌드가 백그라운드로 채움. (발행 버튼=빌드 트리거 유지)

## 렌더 일관성
live-posts엔 원본 body 저장, 클라이언트가 서비스 `sanitizeBody`(뉴스카드 포함) 적용 → 정적/즉시 결과 동일.

## live-posts JSON 형태
```
{ logNo, title, category, dateLabel, date, body(원본), ogImage, externalUrl, updatedAt }
```
category/dateLabel은 lambda가 계산해 넣음(클라이언트 중복 로직 제거).

## 작업 순서 (프론트 먼저)
- [진행] 프론트: LiveArticle 렌더러 + /live 폴백 + 상세 stale-while-revalidate 섬 (mock JSON으로 검증)
- 백엔드: lambda live-posts 기록/삭제, buildspec 제외, IAM(이미 live-index.json만 허용 → prefix로 확장)
- CloudFront: 404 custom error response → /live/index.html
