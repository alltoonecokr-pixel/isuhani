// 미리보기 = 공개 사이트가 본문을 그리는 방식과 동일하게 보여주기 위한 포팅.
// frontend/src/lib/blog.ts 의 sanitizeBody 와 같은 변환을 적용한다.
// (두 앱이 분리돼 있어 의도적 복제 — 사이트 렌더 규칙이 바뀌면 양쪽 동기화 필요)

export function sanitizeBody(body: string): string {
  let out = body || "";

  // 네이버 lazy-load: data-lazy-src → src
  out = out.replace(
    /<img\b([^>]*)\sdata-lazy-src="([^"]+)"([^>]*)>/gi,
    (_f, before, real, after) => {
      const merged = (before + " " + after).replace(/\ssrc="[^"]*"/i, "");
      return `<img${merged} src="${real}">`;
    },
  );

  // pstatic 이미지 ?type=w966 정규화
  out = out.replace(
    /(<img[^>]+src="https:\/\/[^"]*?\.pstatic\.net\/[^"?]+)(\?type=[^"]*)?"/g,
    '$1?type=w966"',
  );

  // blur placeholder 제거
  out = out.replace(
    /<img([^>]+)src="([^"]*\?type=w(?:80|2)_blur[^"]*)"/gi,
    (_m, attrs) => `<img${attrs}src="" data-broken="true"`,
  );

  // 모든 img: 네이버 치수/스타일은 제거하되, CMS가 지정한 width(%)·data-align은 보존
  out = out.replace(/<img\b([^>]*)>/gi, (_m, attrs: string) => {
    const w = (attrs.match(/width:\s*([\d.]+%)/) || [])[1];
    const align = (attrs.match(/data-align="(left|center|right)"/) || [])[1];
    let a = attrs
      .replace(/\swidth="[^"]*"/gi, "")
      .replace(/\sheight="[^"]*"/gi, "")
      .replace(/\sstyle="[^"]*"/gi, "")
      .replace(/\sdata-width="[^"]*"/gi, "")
      .replace(/\sdata-height="[^"]*"/gi, "")
      .replace(/\sdata-align="[^"]*"/gi, "");
    if (w) a += ` style="width:${w}"`;
    if (align) a += ` data-align="${align}"`;
    return `<img${a} referrerpolicy="no-referrer" loading="lazy">`;
  });
  out = out.replace(/<img[^>]+src=""[^>]*>/gi, "");

  // script/style 제거
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 빈 element 정리
  for (let i = 0; i < 5; i += 1) {
    const prev = out;
    out = out.replace(
      /<(p|div|span)[^>]*>(?:\s|&nbsp;|&#160;|&#xa0;|<br\s*\/?>)*<\/\1>/gi,
      "",
    );
    if (prev === out) break;
  }
  out = out.replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br/>");

  return out;
}
