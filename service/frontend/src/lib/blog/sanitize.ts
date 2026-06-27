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
/**
 * 네이버 oglink(뉴스/외부 링크 카드) 컴포넌트를 찾아 주석 플레이스홀더로 치환.
 * 닫는 태그가 `</script></div>`인 원본 export와 script가 제거된 CMS 저장본(중첩 div만)
 * 양쪽을 모두 처리하기 위해 정규식 앵커 대신 div 깊이를 세어 컴포넌트 끝을 찾는다.
 */
function oglinkToPlaceholders(html: string): string {
  const startRe = /<div[^>]*class="[^"]*se-component[^"]*se-oglink[^"]*"[^>]*>/gi;
  let result = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = startRe.exec(html)) !== null) {
    const start = m.index;
    // div 깊이를 세어 매칭되는 컴포넌트 종료 위치 탐색
    const tagRe = /<\/?div\b[^>]*>/gi;
    tagRe.lastIndex = start;
    let depth = 0;
    let end = -1;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(html)) !== null) {
      depth += t[0][1] === "/" ? -1 : 1;
      if (depth === 0) { end = t.index + t[0].length; break; }
    }
    if (end === -1) break; // 깨진 구조 — 이후는 건드리지 않음
    const block = html.slice(start, end);
    const href = (block.match(/\bhref="([^"]+)"/) || [])[1];
    if (href) {
      const titleRaw = (block.match(/se-oglink-title"[^>]*>([\s\S]*?)<\/(?:strong|p|div|span)>/i) || [])[1] || "";
      const title = titleRaw.replace(/<[^>]+>/g, "").trim();
      const domain = ((block.match(/se-oglink-url"[^>]*>([^<]+)</) || [])[1] || "").trim();
      // 카드 썸네일: 컴포넌트 안 첫 img src (엔티티는 본문 HTML 렌더 시 브라우저가 디코딩)
      const thumb = (block.match(/<img[^>]+src="([^"]+)"/i) || [])[1] || "";
      const label = title || domain || href;
      result += html.slice(last, start) +
        `<!--OGLINK:${encodeURIComponent(href)}:${encodeURIComponent(label)}:${encodeURIComponent(domain)}:${encodeURIComponent(thumb)}-->`;
    } else {
      result += html.slice(last, end); // href 없으면 원본 유지
    }
    last = end;
    startRe.lastIndex = end;
  }
  return result + html.slice(last);
}

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

  // 구형 Naver 이미지(2010~2015 날짜경로, 예: /20101122_96/...) 제거
  // 이 URL들은 Naver CDN에서 삭제돼 ~1KB 에러 이미지 반환 — 제거가 낫다
  out = out.replace(
    /<img[^>]+src="https?:\/\/[a-z0-9.\-]*pstatic\.net\/20\d{6}_[^"]*"[^>]*>/gi,
    "",
  );

  // ── oglink 카드 처리 ─────────────────────────────────────────────────────────
  // ATTR_RE 전에 class 감지 → HTML 주석 플레이스홀더로 변환 → ATTR_RE 후 최종 HTML 삽입
  // (플레이스홀더는 ATTR_RE 대상이 아닌 HTML 주석이라 class가 보존됨)

  // 1단계: oglink 직전의 중복 URL 텍스트 단락 제거 (작성자가 URL을 텍스트+카드 두 번 삽입한 경우)
  out = out.replace(
    /<p\b[^>]*>\s*(?:<span\b[^>]*>\s*)?<a\b[^>]*class="se-link"[^>]*>https?:\/\/[^<]{3,300}<\/a>\s*(?:<\/span>\s*)?<\/p>/gi,
    (whole) => {
      // 이 단락 뒤에 (최대 1500자 내) oglink 컴포넌트가 있으면 단락 제거
      const afterP = out.indexOf(whole);
      const tail = afterP >= 0 ? out.slice(afterP + whole.length, afterP + whole.length + 1500) : "";
      return /class="[^"]*se-oglink/.test(tail) ? "" : whole;
    },
  );

  // 2단계: oglink 컴포넌트 → 주석 플레이스홀더 (ATTR_RE가 class를 지우기 전에 데이터 추출)
  // div 깊이 기반 매칭 — script 유무(원본 export vs CMS 저장본) 모두 처리
  out = oglinkToPlaceholders(out);

  // script / style 제거
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 네이버 SE-TEXT 주석 제거 (<!-- SE-TEXT { --> · <!-- } SE-TEXT -->)
  out = out.replace(/<!--\s*(?:SE-TEXT \{|\} SE-TEXT)\s*-->/g, "");

  // **text** → <strong>text</strong> (마크다운 볼드가 HTML로 미변환된 경우)
  out = out.replace(/\*\*([^*\n]{1,200})\*\*/g, "<strong>$1</strong>");

  // 네이버 SE 에디터가 삽입하는 invisible Unicode 문자 제거 (zero-width space 등)
  // 이 문자가 <p> 안에 남으면 빈 줄처럼 보이는 단락이 과도하게 생성됨
  out = out.replace(/[​‌‍﻿­]/g, "");

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

  // Q숫자. 로 시작하는 단락 → h2 (헤딩 구조 + Google 추천 스니펫 최적화)
  // Naver HTML은 Q1. 텍스트가 <p><span><b>Q1. ...</b></span></p> 구조로 오므로
  // 내부 인라인 태그(span/b/strong)를 통과하는 패턴 사용
  out = out.replace(
    /<p>(?:<(?:span|b|strong)[^>]*>)*(Q\d+[.．、][^<]{4,120})(?:<\/(?:strong|b|span)>)*<\/p>/gi,
    "<h2>$1</h2>",
  );

  // 숫자. 로 시작하는 섹션 제목형 단락 → h2
  // "1. 정품 사향이 들어갔는가" 형태. 조건: 2-30자, 마침표 미종결, 콤마 1개 이하
  out = out.replace(
    /<p>(?:<(?:span|b|strong)[^>]*>)*(\d{1,2}[.．]\s*[^<]{2,30})(?:<\/(?:strong|b|span)>)*<\/p>/gi,
    (_m, text) => {
      const t = text.trim();
      if (/[.。]$/.test(t)) return `<p>${t}</p>`;
      if ((t.match(/,/g) || []).length >= 2) return `<p>${t}</p>`;
      return `<h2>${t}</h2>`;
    },
  );

  // 마지막 단계: oglink 플레이스홀더 → 최종 link-card HTML (ATTR_RE 이후라 class 보존됨)
  // 썸네일이 있으면 이미지 포함 리치 카드, 없으면 기존 텍스트 카드
  // 그룹은 [^:>]* — 인코딩 필드엔 `:`/`>`가 없으므로 안전하고, `-->`의 `>`를 못 넘어
  // 뒤쪽 다른 HTML 주석(<!-- SE-TEXT --> 등)까지 흡수하는 일이 없다.
  out = out.replace(
    /<!--OGLINK:([^:>]*):([^:>]*):([^:>]*):([^:>]*)-->/g,
    (_m, hrefEnc, labelEnc, domainEnc, thumbEnc) => {
      const hrefRaw = decodeURIComponent(hrefEnc);
      const label = decodeURIComponent(labelEnc);
      const domain = decodeURIComponent(domainEnc);
      const thumb = decodeURIComponent(thumbEnc);
      if (!hrefRaw) return "";
      const domainHtml = domain ? `<span class="link-card-domain">${domain}</span>` : "";
      if (thumb) {
        const altSafe = label.replace(/"/g, "&quot;");
        return `<div class="link-card link-card-rich"><a href="${hrefRaw}" target="_blank" rel="noopener noreferrer"><img class="link-card-thumb" src="${thumb}" alt="${altSafe}" referrerpolicy="no-referrer" loading="lazy" /><span class="link-card-text"><span class="link-card-label">${label}</span>${domainHtml}</span></a></div>`;
      }
      return `<div class="link-card"><a href="${hrefRaw}" target="_blank" rel="noopener noreferrer"><span class="link-card-label">${label}</span>${domainHtml}</a></div>`;
    },
  );

  // 첫 번째 텍스트 단락에 article-lead 클래스 추가 (드롭캡·리드인용, ATTR_RE 이후라 class 보존)
  out = out.replace(/<p>/, '<p class="article-lead">');

  return out;
}

/**
 * 정제된 HTML에서 핵심 요약 포인트를 추출한다.
 * 1순위: h2 헤딩 목록 (Q1./숫자. 패턴 등 자동 변환된 것)
 * 2순위: 첫 단락 주요 문장 2-3개
 */
export function extractSummaryPoints(sanitizedHtml: string): string[] {
  // h2 헤딩 추출
  const headings: string[] = [];
  const h2Re = /<h2>([\s\S]*?)<\/h2>/gi;
  let m: RegExpExecArray | null;
  while ((m = h2Re.exec(sanitizedHtml)) !== null && headings.length < 6) {
    const text = m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (text.length >= 4) headings.push(text);
  }
  if (headings.length >= 2) return headings.slice(0, 5);

  // fallback: 첫 단락 문장 분리
  const pMatch = sanitizedHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!pMatch) return [];
  const raw = pMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  // 마침표·느낌표·물음표 기준으로 문장 분리
  const parts = raw.split(/(?<=[.。!?！？])\s+/);
  return parts
    .map((s) => s.trim())
    .filter((s) => s.length >= 15)
    .slice(0, 3);
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
