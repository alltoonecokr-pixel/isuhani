// 글 CRUD 핸들러 — GET/POST/PUT/DELETE /api/posts

import { getPost, putPost, deletePost, postExists, writeLivePost, deleteLivePost } from "../services/s3.mjs";
import { upsertIndexEntry, removeIndexEntry, indexEntry, categoryOf } from "../services/indexer.mjs";
import { toItem, putIndex, deleteIndex, queryAll } from "../services/dynamo.mjs";
import { renderBlocks, sanitizeBody } from "../utils/html.mjs";
import { blocksToImages, extractImageUrlsFromHtml } from "../utils/images.mjs";
import { todayLabel, parseAddDate, isoDate } from "../utils/date.mjs";

// ── 포스트 빌더 ──────────────────────────────────────────────────────────────
// 입력(input) + 기존 글(existing)을 병합해 저장할 포스트 객체를 반환.
// blocks 우선 → body 직접 → 기존 유지 순으로 콘텐츠를 결정한다.

function buildPostFromInput(input, logNo, existing = null) {
  const now = new Date();
  const hasBlocksInput = Array.isArray(input.blocks);
  const hasBodyInput = typeof input.body === "string";

  let blocks, body;
  if (hasBlocksInput) {
    blocks = input.blocks;
    body = blocks.length > 0 ? renderBlocks(blocks) : (existing?.body || "");
  } else if (hasBodyInput) {
    blocks = [];
    body = sanitizeBody(input.body);
  } else {
    blocks = existing?.blocks || [];
    body = existing?.body || "";
  }

  const addDate = input.addDate || existing?.addDate || todayLabel(now);
  const fallbackCategory = existing ? categoryOf(existing) : "기타";
  const isCmsContent =
    blocks.length > 0 || (hasBodyInput && existing?.body_kind === "cms");
  const bodyKind = isCmsContent
    ? "cms"
    : existing?.body_kind || (hasBodyInput ? "html" : "");

  return {
    logNo: logNo || existing?.logNo,
    title: input.title ?? existing?.title ?? "(제목 없음)",
    addDate,
    categoryNo: existing?.categoryNo || "",
    parentCategoryNo: existing?.parentCategoryNo || "",
    url: existing?.url || "",
    blocks,
    body,
    body_kind: bodyKind,
    images:
      blocks.length > 0
        ? blocksToImages(blocks)
        : body
        ? extractImageUrlsFromHtml(body)
        : existing?.images || [],
    meta: {
      ...(existing?.meta || {}),
      category: input.category ?? existing?.meta?.category ?? fallbackCategory,
      ogDesc: input.excerpt ?? existing?.meta?.ogDesc ?? null,
      ogImage: existing?.meta?.ogImage ?? null,
      date: parseAddDate(addDate) || isoDate(now),
    },
  };
}

// 즉시 발행용 공개 본문 엔트리 (프론트 LiveArticle 가 읽는 형태)
function liveEntry(post) {
  return {
    logNo: post.logNo,
    title: post.title,
    category: categoryOf(post),
    dateLabel: post.addDate || "",
    date: parseAddDate(post.addDate),
    body: post.body ?? null,
    ogImage: post?.meta?.ogImage ?? null,
    externalUrl: `https://blog.naver.com/isuhani/${post.logNo}`,
    updatedAt: new Date().toISOString(),
  };
}

// DynamoDB 메타 인덱스 + S3 index.json + 즉시 발행 본문 동시 갱신
async function syncIndexes(post) {
  await Promise.all([
    upsertIndexEntry(post),
    putIndex(toItem(indexEntry(post), { excerpt: post?.meta?.ogDesc || null })),
    writeLivePost(liveEntry(post)),
  ]);
}

// ── 핸들러 ───────────────────────────────────────────────────────────────────

export async function handleList() {
  const items = await queryAll();
  const posts = items.map((it) => ({
    logNo: it.postId,
    title: it.title,
    addDate: it.addDate,
    date: it.date,
    category: it.category,
    thumbnail: it.thumbnail,
    isCms: it.bodyKind === "cms",
  }));
  return { total: posts.length, posts };
}

export async function handleCreate(input) {
  const logNo = String(Date.now());
  const post = buildPostFromInput(input, logNo, null);
  await putPost(post);
  await syncIndexes(post);
  return post;
}

export async function handleUpdate(logNo, input) {
  const existing = await getPost(logNo);
  if (!existing) return null;
  const next = buildPostFromInput(input, logNo, existing);
  await putPost(next);
  await syncIndexes(next);
  return next;
}

export async function handleDelete(logNo) {
  if (!(await postExists(logNo))) return false;
  await deletePost(logNo);
  await Promise.all([removeIndexEntry(logNo), deleteIndex(logNo), deleteLivePost(logNo)]);
  return true;
}
