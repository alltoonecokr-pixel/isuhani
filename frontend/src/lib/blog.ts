import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = path.join(process.cwd(), "src/data/blog/posts");

export type RawPost = {
  logNo: string;
  title: string;
  addDate?: string; // "2026. 4. 24."
  categoryNo?: string;
  parentCategoryNo?: string;
  url?: string;
  body: string | null;
  body_kind?: string | null;
  images?: string[];
  meta?: {
    ogTitle?: string;
    ogDesc?: string;
    ogImage?: string;
    category?: string | null;
    date?: string | null;
  };
};

export type BlogPost = {
  logNo: string;
  title: string;
  date: string; // ISO-ish "2026-04-24"
  dateLabel: string; // "2026. 4. 24."
  categoryNo: string;
  category: string;
  body: string | null;
  ogImage?: string | null;
  ogDesc?: string | null;
  thumbnail: string | null;
  images: string[];
  externalUrl: string;
};

function parseAddDate(s?: string): { iso: string; label: string } {
  if (!s) return { iso: "", label: "" };
  const m = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/);
  if (!m) return { iso: "", label: s };
  const [, y, mo, d] = m;
  const iso = `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return { iso, label: `${y}. ${mo}. ${d}.` };
}

// 네이버 사이드바 기준 매핑 (자식은 부모 카테고리로 묶음)
const CATEGORY_MAP: Record<string, string> = {
  "1": "한의원 story",
  "32": "건강관리",
  "43": "한의원 story",
  "42": "여가 · 여행",
  "11": "비만 · 다이어트",
  "38": "BLOG",
  // 체형척추관절통증
  "7": "체형 · 척추 · 관절통증",
  "12": "체형 · 척추 · 관절통증",
  "13": "체형 · 척추 · 관절통증",
  "14": "체형 · 척추 · 관절통증",
  "21": "체형 · 척추 · 관절통증",
  // 여성 산후조리
  "8": "여성 · 산후조리",
  "24": "여성 · 산후조리",
  "25": "여성 · 산후조리",
  // 소아 성장
  "9": "소아 성장",
  "10": "소아 성장",
  "15": "소아 성장",
  "39": "소아 성장",
};

const PARENT_CATEGORY_MAP: Record<string, string> = {
  "1": "한의원 story",
  "7": "체형 · 척추 · 관절통증",
  "8": "여성 · 산후조리",
  "9": "소아 성장",
  "11": "비만 · 다이어트",
  "32": "건강관리",
  "38": "BLOG",
  "42": "여가 · 여행",
};

function categoryName(post: RawPost): string {
  if (post.meta?.category) return post.meta.category;
  if (post.categoryNo && CATEGORY_MAP[post.categoryNo]) return CATEGORY_MAP[post.categoryNo];
  if (post.parentCategoryNo && PARENT_CATEGORY_MAP[post.parentCategoryNo]) {
    return PARENT_CATEGORY_MAP[post.parentCategoryNo];
  }
  return "기타";
}

let _cache: BlogPost[] | null = null;

export function getAllPosts(): BlogPost[] {
  if (_cache && process.env.NODE_ENV === "production") return _cache;
  if (!fs.existsSync(POSTS_DIR)) {
    _cache = [];
    return _cache;
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"));
  const posts: BlogPost[] = files
    .map((f) => {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), "utf8")) as RawPost;
        const { iso, label } = parseAddDate(raw.addDate);
        return {
          logNo: raw.logNo,
          title: decodeEntities(raw.title || ""),
          date: iso,
          dateLabel: label,
          categoryNo: raw.categoryNo || "",
          category: categoryName(raw),
          body: raw.body,
          ogImage: cleanImageUrl(raw.meta?.ogImage) || null,
          thumbnail: extractThumbnail(raw.body, raw.meta?.ogImage),
          ogDesc: raw.meta?.ogDesc || null,
          images: raw.images || [],
          externalUrl: `https://blog.naver.com/isuhani/${raw.logNo}`,
        } as BlogPost;
      } catch {
        return null;
      }
    })
    .filter((p): p is BlogPost => Boolean(p))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  _cache = posts;
  return _cache;
}

export function getPostByLogNo(logNo: string): BlogPost | null {
  return getAllPosts().find((p) => p.logNo === logNo) || null;
}

export function getCategories(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of getAllPosts()) {
    map.set(p.category, (map.get(p.category) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&[a-z]+;/gi, (m) => HTML_ENTITIES[m] ?? m);
}

/**
 * 네이버 이미지 URL을 큰 해상도(w966)로 정규화.
 * postfiles/blogfiles/blogthumb은 ?type=가 없으면 placeholder를 반환하고,
 * w275/w2/w80_blur 같이 작거나 흐림인 type도 모두 w966으로 교체한다.
 */
export function cleanImageUrl(url: string | null | undefined, size = "w966"): string {
  if (!url) return "";
  if (/\.(?:postfiles|blogfiles|blogthumb|mblogthumb)/.test(url) || /pstatic\.net/.test(url)) {
    if (/\?type=/.test(url)) return url.replace(/\?type=[^&]+/, `?type=${size}`);
    if (/&type=/.test(url)) return url.replace(/&type=[^&]+/, `&type=${size}`);
    return url + (url.includes("?") ? "&" : "?") + `type=${size}`;
  }
  return url;
}

/**
 * 카드용 썸네일 추출 — og:image가 placeholder(?type=w2)인 경우가 많아서
 * 본문 첫 이미지의 data-lazy-src(원본 lazy URL) 또는 src를 우선 사용
 */
function extractThumbnail(body: string | null, ogImage?: string | null): string | null {
  if (body) {
    const lazy = body.match(/<img[^>]+data-lazy-src="([^"]+)"/);
    if (lazy) return cleanImageUrl(lazy[1]);
    const src = body.match(/<img[^>]+src="(https:\/\/(?:postfiles|blogfiles|mblogthumb|blogthumb)[^"]+)"/);
    if (src) return cleanImageUrl(src[1]);
  }
  if (ogImage) return cleanImageUrl(ogImage);
  return null;
}

export function makeExcerpt(post: BlogPost, len = 140): string {
  const src = post.ogDesc || (post.body ? post.body.replace(/<[^>]+>/g, " ") : "");
  const flat = decodeEntities(src).replace(/\s+/g, " ").trim();
  return flat.length > len ? flat.slice(0, len) + "…" : flat;
}

/**
 * 네이버 블로그 본문 정제
 * - 이미지 src의 흐린 썸네일 파라미터 제거 (?type=w80_blur, ?type=w2 등)
 * - script / style / iframe 트래킹 제거
 * - 빈 p · nbsp만 있는 블록 제거
 * - 인라인 font-family/size 일부만 제거 (CSS에서 처리)
 */
export function sanitizeBody(body: string): string {
  let out = body;

  // 네이버 lazy-load 패턴: <img src="...?type=w80_blur" data-lazy-src="원본">
  // → data-lazy-src 값으로 src 교체
  out = out.replace(/<img\b([^>]*)\sdata-lazy-src="([^"]+)"([^>]*)>/gi, (_full, before, real, after) => {
    const merged = (before + " " + after).replace(/\ssrc="[^"]*"/i, "");
    return `<img${merged} src="${real}">`;
  });

  // pstatic.net 이미지의 ?type을 w966 (데스크톱 풀사이즈)로 정규화
  // ?type 없으면 추가, 있으면 교체 — type 빠지면 네이버가 placeholder를 줌
  out = out.replace(
    /(<img[^>]+src="https:\/\/[^"]*?\.pstatic\.net\/[^"?]+)(\?type=[^"]*)?"/g,
    '$1?type=w966"',
  );

  // SmartEditor 2의 link-preview 흐린 placeholder src 정리
  out = out.replace(/<img([^>]+)src="([^"]*\?type=w(?:80|2)_blur[^"]*)"/gi, (_m, attrs, _src) => {
    return `<img${attrs}src="" data-broken="true"`;
  });

  // 모든 img에 referrer-policy + lazy + 인라인 width/height 제거
  out = out.replace(/<img\b([^>]*)>/gi, (_m, attrs: string) => {
    let a = attrs
      .replace(/\swidth="[^"]*"/gi, "")
      .replace(/\sheight="[^"]*"/gi, "")
      .replace(/\sstyle="[^"]*"/gi, "")
      .replace(/\sdata-width="[^"]*"/gi, "")
      .replace(/\sdata-height="[^"]*"/gi, "");
    return `<img${a} referrerpolicy="no-referrer" loading="lazy">`;
  });
  // 빈 src(='')로 바뀐 것 제거
  out = out.replace(/<img[^>]+src=""[^>]*>/gi, "");

  // script / style / iframe 트래킹 제거
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");

  // 빈 element 정리 — SE2 본문 빈 줄 누적이 큰 빈 공간을 만듦, 여러 패스로 제거
  for (let i = 0; i < 5; i += 1) {
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
  // 연속 br 2개 이상 → 1개로 (단락 사이 큰 빈 공간 방지)
  out = out.replace(/(?:<br\s*\/?>\s*){2,}/gi, "<br/>");

  // 네이버 자체 광고/리비뉴/스티커 영역 제거
  out = out.replace(
    /<div[^>]*class="[^"]*(?:revenue|adArea|ad_default|na_ad|se-sticker)[^"]*"[\s\S]*?<\/div>/gi,
    "",
  );

  // 네이버 oglink (외부 링크 카드 미리보기)는 div를 깔끔한 anchor로 교체
  out = out.replace(
    /<div[^>]*class="[^"]*se-oglink[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi,
    (m) => {
      const titleMatch = m.match(/class="se-oglink-title"[^>]*>([^<]+)</);
      const urlMatch = m.match(/href="([^"]+)"/);
      if (titleMatch && urlMatch) {
        return `<p><a href="${urlMatch[1]}" target="_blank" rel="noopener">${titleMatch[1]}</a></p>`;
      }
      return "";
    },
  );

  return out;
}
