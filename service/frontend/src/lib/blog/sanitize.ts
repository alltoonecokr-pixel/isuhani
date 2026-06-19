// HTML 정제 — 네이버 블로그 본문 클렌징 · HTML 엔티티 디코딩

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/**
 * HTML 엔티티 디코딩. 네이버 export는 이중·삼중 인코딩(&amp;quot; 등)이 흔해
 * 변화가 없을 때까지 최대 5회 반복한다.
 */
export function decodeEntities(s: string): string {
  if (!s) return s;
  const once = (x: string) =>
    x
      .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(parseInt(n, 10)))
      .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&[a-z]+;/gi, (m) => HTML_ENTITIES[m] ?? m);
  let prev = s;
  for (let i = 0; i < 5; i++) {
    const next = once(prev);
    if (next === prev) break;
    prev = next;
  }
  return prev;
}

/**
 * 네이버 블로그 본문 정제:
 * - lazy-load src 교체, pstatic.net 이미지 type=w966 정규화
 * - CMS 지정 width(%) · data-align 보존, 나머지 인라인 치수·스타일 제거
 * - script / style / 트래킹 제거, 빈 블록 제거, 광고 영역 제거
 */
export function sanitizeBody(body: string): string {
  let out = body;

  // 네이버 lazy-load: data-lazy-src 값으로 src 교체
  out = out.replace(
    /<img\b([^>]*)\sdata-lazy-src="([^"]+)"([^>]*)>/gi,
    (_full, before, real, after) => {
      const merged = (before + " " + after).replace(/\ssrc="[^"]*"/i, "");
      return `<img${merged} src="${real}">`;
    },
  );

  // pstatic.net ?type → w966
  out = out.replace(
    /(<img[^>]+src="https:\/\/[^"]*?\.pstatic\.net\/[^"?]+)(\?type=[^"]*)?"/g,
    '$1?type=w966"',
  );

  // 흐린 placeholder src(w80_blur, w2) 비움
  out = out.replace(
    /<img([^>]+)src="([^"]*\?type=w(?:80|2)_blur[^"]*)"/gi,
    (_m, attrs) => `<img${attrs}src="" data-broken="true"`,
  );

  // img: CMS 지정 width% · data-align 보존, 그 외 인라인 치수·스타일 제거
  out = out.replace(/<img\b([^>]*)>/gi, (_m, attrs: string) => {
    const w = (attrs.match(/width:\s*([\d.]+%)/) || [])[1];
    const align = (attrs.match(/data-align="(left|center|right)"/) || [])[1];
    let a = attrs
      .replace(/\swidth="[^"]*"/gi, "")
      .replace(/\sheight="[^"]*"/gi, "")
      .replace(/\sstyle="[^"]*"/gi, "")
      .replace(/\sclass="[^"]*"/gi, "")
      .replace(/\sid="[^"]*"/gi, "")
      .replace(/\sdata-width="[^"]*"/gi, "")
      .replace(/\sdata-height="[^"]*"/gi, "")
      .replace(/\sdata-align="[^"]*"/gi, "")
      .replace(/\sdata-(?!lazy-src)[a-z][a-z0-9\-]*="[^"]*"/gi, "");
    if (w) a += ` style="width:${w}"`;
    if (align) a += ` data-align="${align}"`;
    // alt 없거나 빈값이면 기본 설명 삽입 (Google 이미지 검색 최적화)
    if (!/\salt="[^"]+"/i.test(a)) {
      a = a.replace(/\salt=""/gi, "");
      a += ` alt="이수한의원 건강 칼럼 이미지"`;
    }
    return `<img${a} referrerpolicy="no-referrer" loading="lazy">`;
  });

  // 빈 src 이미지 제거
  out = out.replace(/<img[^>]+src=""[^>]*>/gi, "");

  // script / style 제거
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 네이버 SE 구조 속성 제거 — class / id / data-* / 인라인 style (img는 위에서 처리됨)
  // data-* 는 여러 개 붙어있을 수 있어 변화가 없을 때까지 반복
  const ATTR_RE = [
    /\s+class="[^"]*"/gi,
    /\s+id="[^"]*"/gi,
    /\s+style="[^"]*"/gi,
    /\s+data-[a-z][a-z0-9\-]*="[^"]*"/gi,
  ];
  out = out.replace(/<((?!img\b)[a-z][a-z0-9]*)(\b[^>]*)>/gi, (_m, tag, attrs) => {
    let a = attrs;
    let prev: string;
    do {
      prev = a;
      for (const re of ATTR_RE) a = a.replace(re, "");
    } while (a !== prev);
    return `<${tag}${a}>`;
  });

  // 빈 element 제거 (SE2 빈 줄 누적 → 큰 공백)
  for (let i = 0; i < 5; i++) {
    const prev = out;
    out = out.replace(
      /<(p|div|span)[^>]*>(?:\s|&nbsp;|&#160;|&#xa0;|<br\s*\/?>)*<\/\1>/gi,
      "",
    );
    out = out.replace(
      /<(p|div)[^>]*>(?:\s|&nbsp;|<br\s*\/?>|<(?:span|p|div)[^>]*>(?:\s|&nbsp;|<br\s*\/?>)*<\/(?:span|p|div)>)*<\/\1>/gi,
      "",
    );
    if (prev === out) break;
  }

  // 연속 br 2개 이상 → 1개
  out = out.replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br/>");

  // 네이버 광고·스티커 제거
  out = out.replace(
    /<div[^>]*class="[^"]*(?:revenue|adArea|ad_default|na_ad|se-sticker)[^"]*"[\s\S]*?<\/div>/gi,
    "",
  );

  // 외부 링크 카드(oglink) → 깔끔한 anchor로 교체
  out = out.replace(
    /<div[^>]*class="[^"]*se-oglink[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi,
    (m) => {
      const titleMatch = m.match(/class="se-oglink-title"[^>]*>([^<]+)</);
      const urlMatch = m.match(/href="([^"]+)"/);
      if (titleMatch && urlMatch)
        return `<p><a href="${urlMatch[1]}" target="_blank" rel="noopener">${titleMatch[1]}</a></p>`;
      return "";
    },
  );

  // Q숫자. 로 시작하는 단락 → h2 (헤딩 구조 + Google 추천 스니펫 최적화)
  // Naver HTML은 Q1. 텍스트가 <p><span><b>Q1. ...</b></span></p> 구조로 오므로
  // 내부 인라인 태그(span/b/strong)를 통과하는 패턴 사용
  out = out.replace(
    /<p>(?:<(?:span|b|strong)[^>]*>)*(Q\d+[.．、][^<]{4,120})(?:<\/(?:strong|b|span)>)*<\/p>/gi,
    "<h2>$1</h2>",
  );

  return out;
}

/**
 * 본문 HTML에서 Q숫자. / A : 패턴의 FAQ 쌍을 추출한다.
 * FAQPage JSON-LD 생성에 사용.
 */
export function extractFAQs(body: string): Array<{ question: string; answer: string }> {
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (m) => HTML_ENTITIES[m] ?? " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = text.split(/\bQ\d+[.．、]\s*/);
  const faqs: Array<{ question: string; answer: string }> = [];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    const aIdx = part.search(/\bA\s*[:：]\s*/);
    if (aIdx === -1) continue;
    const q = part.slice(0, aIdx).trim();
    const rawA = part.slice(aIdx).replace(/\bA\s*[:：]\s*/, "").trim();
    const a = rawA.split(/\bQ\d+[.．、]/)[0].trim().slice(0, 500);
    if (q.length > 3 && a.length > 10) {
      faqs.push({ question: q, answer: a });
    }
  }
  return faqs;
}
