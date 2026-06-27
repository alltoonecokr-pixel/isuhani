// 미리보기 = 공개 사이트가 본문을 그리는 방식과 동일하게 보여주기 위한 포팅.
// frontend/src/lib/blog.ts 의 sanitizeBody 와 같은 변환을 적용한다.
// (두 앱이 분리돼 있어 의도적 복제 — 사이트 렌더 규칙이 바뀌면 양쪽 동기화 필요)

// 네이버 oglink 컴포넌트를 div 깊이로 잘라 .link-card-rich 카드로 치환.
// (service/frontend sanitize.ts의 oglinkToPlaceholders + 카드 빌더와 동일 결과)
function replaceOglinkCards(html: string): string {
  const startRe = /<div[^>]*class="[^"]*se-component[^"]*se-oglink[^"]*"[^>]*>/gi;
  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = startRe.exec(html)) !== null) {
    const start = m.index;
    const tagRe = /<\/?div\b[^>]*>/gi;
    tagRe.lastIndex = start;
    let depth = 0;
    let end = -1;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(html)) !== null) {
      depth += t[0][1] === "/" ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    if (end === -1) break;
    const block = html.slice(start, end);
    const href = (block.match(/\bhref="([^"]+)"/) || [])[1];
    result += html.slice(last, start);
    if (href) {
      const titleRaw = (block.match(/se-oglink-title"[^>]*>([\s\S]*?)<\/(?:strong|p|div|span)>/i) || [])[1] || "";
      const title = titleRaw.replace(/<[^>]+>/g, "").trim();
      const domain = ((block.match(/se-oglink-url"[^>]*>([^<]+)</) || [])[1] || "").trim();
      const thumb = (block.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || "";
      const label = title || domain || href;
      const domainHtml = domain ? `<span class="link-card-domain">${domain}</span>` : "";
      if (thumb) {
        const altSafe = label.replace(/"/g, "&quot;");
        result += `<div class="link-card link-card-rich"><a href="${href}" target="_blank" rel="noopener noreferrer"><img class="link-card-thumb" src="${thumb}" alt="${altSafe}" referrerpolicy="no-referrer" loading="lazy" /><span class="link-card-text"><span class="link-card-label">${label}</span>${domainHtml}</span></a></div>`;
      } else {
        result += `<div class="link-card"><a href="${href}" target="_blank" rel="noopener noreferrer"><span class="link-card-label">${label}</span>${domainHtml}</a></div>`;
      }
    } else {
      result += block;
    }
    last = end;
    startRe.lastIndex = end;
  }
  return result + html.slice(last);
}

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

  // oglink(뉴스/외부 링크) 카드 → 이미지+제목+도메인 리치 카드
  // 사이트 sanitizeBody와 동일 결과물(.link-card-rich). div 깊이로 컴포넌트 끝을 찾아
  // script 유무(원본 export vs CMS 저장본) 모두 처리. script 제거 전에 실행해야 함.
  out = replaceOglinkCards(out);

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
