// 건강저널 블로그 — 공개 API
// import { getAllPosts, ... } from "@/lib/blog" 는 모두 이 파일을 가리킨다.

import fs from "node:fs";
import path from "node:path";
import { cleanImageUrl, extractThumbnail } from "./images";
import { decodeEntities } from "./sanitize";

export { cleanImageUrl } from "./images";
export { sanitizeBody, decodeEntities, extractFAQs, extractSummaryPoints } from "./sanitize";

// ── 타입 ─────────────────────────────────────────────────────────────────────

export type RawPost = {
  logNo: string;
  title: string;
  addDate?: string;
  categoryNo?: string;
  parentCategoryNo?: string;
  url?: string;
  blog?: string;
  body: string | null;
  body_kind?: string | null;
  images?: string[];
  meta?: {
    ogTitle?: string;
    ogDesc?: string;
    ogImage?: string;
    category?: string | null;
    date?: string | null;
    thumbnail?: string | null;
  };
};

export type BlogPost = {
  logNo: string;
  title: string;
  date: string;
  dateLabel: string;
  categoryNo: string;
  category: string;
  body: string | null;
  ogImage?: string | null;
  ogDesc?: string | null;
  thumbnail: string | null;
  images: string[];
  externalUrl: string;
  summary?: string[] | null;
};

// ── 카테고리 매핑 (네이버 레거시 categoryNo → 표시 이름) ────────────────────

const CATEGORY_MAP: Record<string, string> = {
  "1": "한의원 story", "32": "건강관리", "43": "한의원 story",
  "42": "여가 · 여행", "11": "비만 · 다이어트", "38": "BLOG",
  "7": "체형 · 척추 · 관절통증", "12": "체형 · 척추 · 관절통증",
  "13": "체형 · 척추 · 관절통증", "14": "체형 · 척추 · 관절통증",
  "21": "체형 · 척추 · 관절통증",
  "8": "여성 · 산후조리", "24": "여성 · 산후조리", "25": "여성 · 산후조리",
  "9": "소아 성장", "10": "소아 성장", "15": "소아 성장", "39": "소아 성장",
};

const PARENT_CATEGORY_MAP: Record<string, string> = {
  "1": "한의원 story", "7": "체형 · 척추 · 관절통증",
  "8": "여성 · 산후조리", "9": "소아 성장",
  "11": "비만 · 다이어트", "32": "건강관리",
  "38": "BLOG", "42": "여가 · 여행",
};

// 원본 블로그 ID — 동기화 글은 blog 필드, 과거 글은 url의 blogId로 판별
function blogIdOf(post: RawPost): string {
  return post.blog || post.url?.match(/blogId=([A-Za-z0-9_-]+)/)?.[1] || "isuhani";
}

function categoryName(post: RawPost): string {
  if (post.meta?.category) return post.meta.category;
  if (post.categoryNo && CATEGORY_MAP[post.categoryNo]) return CATEGORY_MAP[post.categoryNo];
  if (post.parentCategoryNo && PARENT_CATEGORY_MAP[post.parentCategoryNo])
    return PARENT_CATEGORY_MAP[post.parentCategoryNo];
  return "기타";
}

// ── 날짜 ────────────────────────────────────────────────────────────────────

function parseAddDate(s?: string): { iso: string; label: string } {
  if (!s) return { iso: "", label: "" };
  const m = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/);
  if (!m) return { iso: "", label: s };
  const [, y, mo, d] = m;
  return {
    iso: `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`,
    label: `${y}. ${mo}. ${d}.`,
  };
}

// ── 포스트 읽기 ──────────────────────────────────────────────────────────────

const POSTS_DIR = path.join(process.cwd(), "src/data/blog/posts");

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
        const raw = JSON.parse(
          fs.readFileSync(path.join(POSTS_DIR, f), "utf8"),
        ) as RawPost;
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
          thumbnail: raw.meta?.thumbnail
            ? cleanImageUrl(raw.meta.thumbnail)
            : extractThumbnail(raw.body, raw.meta?.ogImage),
          ogDesc: raw.meta?.ogDesc || null,
          images: raw.images || [],
          externalUrl: `https://blog.naver.com/${blogIdOf(raw)}/${raw.logNo}`,
          summary: (raw.meta as Record<string, unknown>)?.summary as string[] | null ?? null,
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

export function makeExcerpt(post: BlogPost, len = 140): string {
  const src = post.ogDesc || (post.body ? post.body.replace(/<[^>]+>/g, " ") : "");
  const flat = decodeEntities(src).replace(/\s+/g, " ").trim();
  return flat.length > len ? flat.slice(0, len) + "…" : flat;
}
