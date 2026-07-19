# 블로그 2개 동기화 + 과거 글 백필 + 썸네일 직접 지정

## 배경 (버그 리포트)
2026-07-18 채은님 리포트: 네이버에 7월 새 글들이 있는데 CMS "블로그 동기화"가
7/10 글 1건만 가져옴. "두 블로그 중 하나만 연결된 것 아닌가" 추측.

원인: `admin/backend/lambda/handlers/sync.mjs`에 `BLOG = "isuhani"` 하나가
하드코딩. 병원은 블로그를 2개 운영 중이었다 —
- isuhani (이수한의원 공식, 월 1~2건: 공지 위주)
- metroparis (남성역엔 이수한의원, 매일 14시 예약 발행: 체질·건강 콘텐츠)

7월 신규 글들은 전부 metroparis에 올라갔고, 이 블로그는 동기화 대상이 아니었다.
동기화 자체는 정상 동작 — 보는 곳이 하나뿐이었을 뿐.

## Before → After

| 항목 | Before | After |
|---|---|---|
| 동기화 대상 | isuhani 1개 | isuhani + metroparis 2개 (RSS 병합, logNo 내림차순) |
| 사이트 글 수 | 1,052건 | 1,441건 (+389 metroparis 전량) |
| 2026-07월 글 | 1건 | 14건 |
| metroparis 발행일 | (수입 시) 2022-06-27 오파싱 | RSS pubDate / 목록 API addDate 기준 정확 |
| 제목 `&middot;` 등 | 리터럴 노출 | 디코딩 (`·` `…` `–` `—` 따옴표류) |
| 네이버에서 보기 링크 | 무조건 blog.naver.com/isuhani | 글의 원본 블로그로 (post.blog → url blogId → isuhani 폴백) |
| 썸네일 | 자동만 (images[0] → 본문 첫 img → og) | 어드민에서 본문 이미지 중 직접 선택 가능 (meta.thumbnail 최우선, null=자동) |
| 네이버 글 메타 수정 | 저장 시 본문도 항상 재전송 | bodyDirty일 때만 body 전송 — 썸네일·제목만 바꾸면 본문 무손실 |

## 구현

동기화 멀티 블로그 (sync.mjs)
- `BLOGS = ["isuhani", "metroparis"]`, rssItems/buildPost에 blogId 관통.
- 글 JSON에 `blog` 필드 신설. 기존 글은 `url`의 blogId로 판별.
- 날짜: metroparis 스킨은 PostView HTML의 첫 날짜 패턴이 실제 발행일이 아님
  (2022 오파싱) → RSS pubDate를 우선 파싱(`rssDateLabel`, +0900 KST 변환).

백필 모드 (RSS는 최근 50건까지만 노출)
- `POST /api/sync-blog {"mode":"backfill","blog":"metroparis","max":3}`
- PostTitleListAsync로 전체 389건 열거(30건/페이지) → 인덱스에 없는 글만 수입.
- 날짜는 목록 API의 addDate("2026. 6. 4." 형식) 사용.
  '1시간 전' 상대 표기(최근 글)는 건너뜀 — RSS 경로가 처리.
- 함정: 이미지 20장+ 과거 글은 5건 배치가 API Gateway 29초를 넘겨 503.
  Lambda(120s)는 서버에서 계속 완료하므로 데이터는 안전하나 호출측이 결과를
  못 받음 → max=3으로 축소해 해결. 로컬 드라이버 셸로 22회 반복, missing=0.

썸네일 직접 지정
- 편집 화면 메타 영역에 대표 이미지 섹션: 현재 썸네일 미리보기 + 본문 이미지
  격자에서 클릭 선택 + "자동으로 되돌리기".
- `meta.thumbnail` 신설: indexer `thumbnailOf`와 사이트 정적 빌드가 최우선 참조.
- PostInput.body를 옵셔널로 — 본문 미수정 저장은 body를 보내지 않아
  CLAUDE.md 함정 6(네이버 글 재저장 손실)을 구조적으로 회피.

## 검증
- isuhani RSS: 7월 글 1건(7/10)뿐임을 확인 → "1건만 동기화"는 정상 동작이었음.
- 수정 후 /api/sync-blog 반복 실행: RSS 50건 + 백필 339건(오늘 신규 1건 포함) 전량 수입.
- 잘못 들어간 초기 5건(2022 날짜)은 PUT addDate로 교정.
- 썸네일: PUT thumbnail 지정 → live-index 반영, null → images[0] 복귀 (S3 원본 확인,
  CloudFront 캐시 지연은 별개).
- 발행 빌드 SUCCEEDED. 백필 글 정적 페이지 200 + 날짜·외부링크 정확
  (예: /224214806676/ → 2026. 3. 18, blog.naver.com/metroparis/...).
- 연도 분포 2010~2026 자연 분포 확인.

## 커밋
- de0bbf3 fix(동기화): 두 번째 블로그(metroparis) 동기화 추가
- 072649b feat(동기화): 백필 모드
- 23fc446 feat(CMS): 대표 이미지(썸네일) 직접 지정
- 60269a0 fix(백필): 호출당 수입 건수 조절(max) — 29초 제한 대응

## 운영 메모
- 앞으로 어드민 "블로그 동기화" 버튼 한 번으로 두 블로그 새 글이 함께 들어온다.
- metroparis 글 카테고리는 RSS 카테고리가 사이트 분류와 안 맞아 대부분
  "한의원 story"로 들어감 — 필요 시 어드민에서 개별 변경.
- metroparis 콘텐츠(매일 발행 마케팅 글)를 건강저널에 전부 노출하는 게 병원
  의도에 맞는지는 확인해볼 것.
