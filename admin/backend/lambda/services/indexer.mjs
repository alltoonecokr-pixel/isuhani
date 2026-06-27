// 포스트 인덱스 관리 — index.json(S3 카탈로그) CRUD + 포스트 메타 계산
// "포스트가 어느 카테고리인가", "썸네일이 뭔가"를 여기서만 결정한다.

import { CATEGORY_MAP, PARENT_CATEGORY_MAP } from "../constants.mjs";
import { cleanImageUrl, decodeEntities } from "../utils/images.mjs";
import { parseAddDate } from "../utils/date.mjs";
import { readPostIndex, writePostIndex, writeWebIndex } from "./s3.mjs";

// ── 포스트 도메인 헬퍼 ────────────────────────────────────────────────────────

export function categoryOf(post) {
  if (post?.meta?.category) return post.meta.category;
  if (post?.categoryNo && CATEGORY_MAP[post.categoryNo])
    return CATEGORY_MAP[post.categoryNo];
  if (post?.parentCategoryNo && PARENT_CATEGORY_MAP[post.parentCategoryNo])
    return PARENT_CATEGORY_MAP[post.parentCategoryNo];
  return "기타";
}

export function thumbnailOf(post) {
  // 썸네일 URL은 index.json/live-index.json에 저장돼 React src로 직접 쓰이므로
  // (HTML 파싱을 안 거침) 네이버 엔티티 인코딩(&#x3D; 등)을 반드시 풀어준다.
  if (post?.images && post.images.length > 0) return decodeEntities(post.images[0]);
  const body = post?.body;
  if (body) {
    const lazy = body.match(/<img[^>]+data-lazy-src="([^"]+)"/);
    if (lazy) return cleanImageUrl(decodeEntities(lazy[1]));
    const src = body.match(
      /<img[^>]+src="(https:\/\/(?:postfiles|blogfiles|mblogthumb|blogthumb)[^"]+)"/,
    );
    if (src) return cleanImageUrl(decodeEntities(src[1]));
    const any = body.match(/<img[^>]+src="([^"]+)"/);
    if (any) return decodeEntities(any[1]);
  }
  if (post?.meta?.ogImage) return cleanImageUrl(decodeEntities(post.meta.ogImage));
  return null;
}

export function indexEntry(post) {
  return {
    logNo: post.logNo,
    title: post.title,
    addDate: post.addDate,
    date: parseAddDate(post.addDate),
    category: categoryOf(post),
    thumbnail: thumbnailOf(post),
    isCms: post.body_kind === "cms" || /^\d{13,}$/.test(String(post.logNo)),
  };
}

// ── index.json 갱신 ─────────────────────────────────────────────────────────

function sortIndexPosts(posts) {
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

function toWebEntry(e) {
  const d = e.date;
  return {
    logNo: e.logNo,
    title: e.title,
    date: typeof d === "object" ? d.iso : (d || ""),
    dateLabel: typeof d === "object" ? d.label : (e.addDate || ""),
    category: e.category,
    thumbnail: e.thumbnail || null,
    excerpt: "",
    hasBody: e.isCms || false,
  };
}

export async function upsertIndexEntry(post) {
  const idx = await readPostIndex();
  const entry = indexEntry(post);
  const i = idx.posts.findIndex((p) => p.logNo === post.logNo);
  if (i >= 0) idx.posts[i] = entry;
  else idx.posts.unshift(entry);
  sortIndexPosts(idx.posts);
  await writePostIndex(idx);
  await writeWebIndex(idx.posts.map(toWebEntry));
}

export async function removeIndexEntry(logNo) {
  const idx = await readPostIndex();
  idx.posts = idx.posts.filter((p) => p.logNo !== logNo);
  await writePostIndex(idx);
  await writeWebIndex(idx.posts.map(toWebEntry));
}
