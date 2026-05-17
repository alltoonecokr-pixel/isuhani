// 이수한의원 v1 — CMS API (Lambda Function URL)
// 건강 저널 CMS의 클라우드 백엔드.
//
// 데이터 모델
//   posts/{logNo}.json    — 포스트 (blocks[] 원본 + 렌더된 body HTML)
//   images/{name}         — 업로드 이미지 (public read)
//   meta/categories.json  — 사용자 정의 카테고리 목록
//   source/source.zip     — CodeBuild 소스 (별도 스크립트로 갱신)
//
// 환경변수
//   BUCKET            S3 버킷
//   BUILD_PROJECT     CodeBuild 프로젝트 이름
//   CMS_USER          Basic Auth 사용자명
//   CMS_PASSWORD      Basic Auth 비밀번호

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { CodeBuildClient, StartBuildCommand, BatchGetBuildsCommand } from "@aws-sdk/client-codebuild";

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const BUCKET = process.env.BUCKET;
const BUILD_PROJECT = process.env.BUILD_PROJECT;
const CMS_USER = process.env.CMS_USER || "admin";
const CMS_PASSWORD = process.env.CMS_PASSWORD || "";

const s3 = new S3Client({ region: REGION });
const cb = new CodeBuildClient({ region: REGION });

const POST_PREFIX = "posts/";
const IMAGE_PREFIX = "images/";
const META_KEY = "meta/categories.json";
const INDEX_KEY = "index.json";

// 레거시 (네이버 크롤) 카테고리 매핑 — index 엔트리 재계산 시 사용
const CATEGORY_MAP = {
  "1":"한의원 story","32":"건강관리","43":"한의원 story",
  "42":"여가 · 여행","11":"비만 · 다이어트","38":"BLOG",
  "7":"체형 · 척추 · 관절통증","12":"체형 · 척추 · 관절통증",
  "13":"체형 · 척추 · 관절통증","14":"체형 · 척추 · 관절통증","21":"체형 · 척추 · 관절통증",
  "8":"여성 · 산후조리","24":"여성 · 산후조리","25":"여성 · 산후조리",
  "9":"소아 성장","10":"소아 성장","15":"소아 성장","39":"소아 성장",
};
const PARENT_CATEGORY_MAP = {
  "1":"한의원 story","7":"체형 · 척추 · 관절통증",
  "8":"여성 · 산후조리","9":"소아 성장",
  "11":"비만 · 다이어트","32":"건강관리",
  "38":"BLOG","42":"여가 · 여행",
};

// 실제 사이트 /journal 상단 탭과 동일한 순서·항목으로 유지.
// 사용자는 카테고리 모달에서 추가/삭제/순서 변경 가능 (S3 meta/categories.json 저장).
const DEFAULT_CATEGORIES = [
  "한의원 story",
  "건강관리",
  "체형 · 척추 · 관절통증",
  "소아 성장",
  "여성 · 산후조리",
  "여가 · 여행",
  "비만 · 다이어트",
];

// ── helpers ──────────────────────────────────────────────────────────────────

function todayLabel(d = new Date()) {
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
function isoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseAddDate(s) {
  if (!s) return "";
  const m = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : "";
}
function isoToAddDate(iso) {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return m ? `${m[1]}. ${parseInt(m[2], 10)}. ${parseInt(m[3], 10)}.` : "";
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

async function streamToString(stream) {
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

// ── block → HTML 렌더 ────────────────────────────────────────────────────────

function youtubeId(url) {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function vimeoId(url) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function renderBlock(b) {
  switch (b.type) {
    case "heading": {
      const level = Math.min(Math.max(b.level || 2, 2), 4);
      return `<h${level}>${escapeHtml(b.text || "")}</h${level}>`;
    }
    case "paragraph": {
      const text = String(b.text || "");
      return text
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
        .join("\n");
    }
    case "photo": {
      const src = b.url || "";
      const cap = b.caption || "";
      const alt = b.alt || cap || "";
      const inner = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />`;
      return cap
        ? `<figure>${inner}<figcaption>${escapeHtml(cap)}</figcaption></figure>`
        : `<figure>${inner}</figure>`;
    }
    case "gallery": {
      const imgs = (b.images || [])
        .map((im) => {
          const src = im.url || "";
          const alt = im.alt || im.caption || "";
          const cap = im.caption || "";
          const inner = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />`;
          return cap
            ? `<figure>${inner}<figcaption>${escapeHtml(cap)}</figcaption></figure>`
            : `<figure>${inner}</figure>`;
        })
        .join("\n");
      return `<div class="cms-gallery">${imgs}</div>`;
    }
    case "video": {
      const url = b.url || "";
      const cap = b.caption || "";
      const yt = youtubeId(url);
      const vm = vimeoId(url);
      let embed = "";
      if (yt) {
        embed = `<iframe src="https://www.youtube.com/embed/${yt}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      } else if (vm) {
        embed = `<iframe src="https://player.vimeo.com/video/${vm}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      } else if (url) {
        embed = `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`;
      }
      return `<figure class="cms-video">${embed}${
        cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : ""
      }</figure>`;
    }
    case "quote":
      return `<blockquote>${escapeHtml(b.text || "")}</blockquote>`;
    case "divider":
      return `<hr/>`;
    default:
      return "";
  }
}
function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks.map(renderBlock).filter(Boolean).join("\n");
}
// 본문 HTML 안전 필터 — 프론트가 1차 정리하지만 직접 API 호출에 대비
function sanitizeBody(html) {
  if (!html) return "";
  let out = html;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  // on* 핸들러 제거
  out = out.replace(/\son\w+="[^"]*"/gi, "");
  out = out.replace(/\son\w+='[^']*'/gi, "");
  // iframe whitelist — youtube/vimeo만 허용. 그 외 iframe 블록은 통째 제거.
  out = out.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, (m) => {
    const src = m.match(/src=["']([^"']+)["']/i)?.[1] || "";
    return /^(https?:)?\/\/(www\.)?(youtube\.com\/embed|player\.vimeo\.com)\//.test(src) ? m : "";
  });
  // self-closing 또는 닫는 태그가 분리된 iframe도 제거
  out = out.replace(/<iframe\b[^>]*\/?>(?![\s\S]*<\/iframe>)/gi, "");
  out = out.replace(/<\/iframe\s*>/gi, "");
  return out;
}

function extractImageUrlsFromHtml(html) {
  const urls = [];
  const re = /<img[^>]+src="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.push(m[1]);
  return urls;
}

function blocksToImages(blocks) {
  const urls = [];
  for (const b of blocks || []) {
    if (b.type === "photo" && b.url) urls.push(b.url);
    if (b.type === "gallery") for (const im of b.images || []) if (im.url) urls.push(im.url);
  }
  return urls;
}

// 포스트의 카테고리 추정 (CMS는 meta.category, 레거시는 categoryNo 매핑)
function categoryOf(post) {
  if (post?.meta?.category) return post.meta.category;
  if (post?.categoryNo && CATEGORY_MAP[post.categoryNo]) return CATEGORY_MAP[post.categoryNo];
  if (post?.parentCategoryNo && PARENT_CATEGORY_MAP[post.parentCategoryNo]) {
    return PARENT_CATEGORY_MAP[post.parentCategoryNo];
  }
  return "기타";
}

// 본문에서 첫 이미지 추출 (썸네일용 — 네이버 lazy 패턴 처리)
function thumbnailOf(post) {
  const body = post?.body;
  if (post?.images && post.images.length > 0) return post.images[0];
  if (body) {
    const lazy = body.match(/<img[^>]+data-lazy-src="([^"]+)"/);
    if (lazy) return cleanImageUrl(lazy[1]);
    const src = body.match(/<img[^>]+src="(https:\/\/(?:postfiles|blogfiles|mblogthumb|blogthumb)[^"]+)"/);
    if (src) return cleanImageUrl(src[1]);
    const any = body.match(/<img[^>]+src="([^"]+)"/);
    if (any) return any[1];
  }
  if (post?.meta?.ogImage) return cleanImageUrl(post.meta.ogImage);
  return null;
}
function cleanImageUrl(url, size = "w966") {
  if (!url) return "";
  if (/\.(?:postfiles|blogfiles|blogthumb|mblogthumb)/.test(url) || /pstatic\.net/.test(url)) {
    if (/\?type=/.test(url)) return url.replace(/\?type=[^&]+/, `?type=${size}`);
    if (/&type=/.test(url)) return url.replace(/&type=[^&]+/, `&type=${size}`);
    return url + (url.includes("?") ? "&" : "?") + `type=${size}`;
  }
  return url;
}

function indexEntry(post) {
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

// ── S3 ops ───────────────────────────────────────────────────────────────────

async function listPostKeys() {
  const keys = [];
  let token;
  do {
    const out = await s3.send(
      new ListObjectsV2Command({ Bucket: BUCKET, Prefix: POST_PREFIX, ContinuationToken: token }),
    );
    for (const o of out.Contents || []) {
      if (o.Key && o.Key.endsWith(".json")) keys.push(o.Key);
    }
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

// ── index.json (전체 포스트 메타 카탈로그) ──────────────────────────────────
async function readPostIndex() {
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: INDEX_KEY }));
    return JSON.parse(await streamToString(out.Body));
  } catch (e) {
    if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404) {
      return { generatedAt: new Date().toISOString(), total: 0, posts: [] };
    }
    throw e;
  }
}
async function writePostIndex(idx) {
  idx.generatedAt = new Date().toISOString();
  idx.total = idx.posts.length;
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: INDEX_KEY,
    Body: JSON.stringify(idx, null, 2),
    ContentType: "application/json; charset=utf-8",
  }));
}
function sortIndexPosts(posts) {
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
async function upsertIndexEntry(post) {
  const idx = await readPostIndex();
  const entry = indexEntry(post);
  const i = idx.posts.findIndex((p) => p.logNo === post.logNo);
  if (i >= 0) idx.posts[i] = entry; else idx.posts.unshift(entry);
  sortIndexPosts(idx.posts);
  await writePostIndex(idx);
}
async function removeIndexEntry(logNo) {
  const idx = await readPostIndex();
  idx.posts = idx.posts.filter((p) => p.logNo !== logNo);
  await writePostIndex(idx);
}
async function getPostByKey(key) {
  const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  return JSON.parse(await streamToString(out.Body));
}
async function getPost(logNo) {
  try { return await getPostByKey(`${POST_PREFIX}${logNo}.json`); }
  catch (e) {
    if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404) return null;
    throw e;
  }
}
async function putPost(post) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: `${POST_PREFIX}${post.logNo}.json`,
    Body: JSON.stringify(post, null, 2), ContentType: "application/json; charset=utf-8",
  }));
}
async function deletePostS3(logNo) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `${POST_PREFIX}${logNo}.json` }));
}
async function postExists(logNo) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: `${POST_PREFIX}${logNo}.json` }));
    return true;
  } catch (e) {
    if (e.$metadata?.httpStatusCode === 404 || e.name === "NotFound") return false;
    throw e;
  }
}

async function getCategories() {
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: META_KEY }));
    const data = JSON.parse(await streamToString(out.Body));
    if (Array.isArray(data?.categories) && data.categories.length > 0) return data.categories;
  } catch (e) {
    if (e.name !== "NoSuchKey" && e.$metadata?.httpStatusCode !== 404) throw e;
  }
  return DEFAULT_CATEGORIES.slice();
}
async function putCategories(cats) {
  const dedup = Array.from(new Set(cats.map((c) => String(c).trim()).filter(Boolean)));
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: META_KEY,
    Body: JSON.stringify({ categories: dedup, updatedAt: new Date().toISOString() }, null, 2),
    ContentType: "application/json; charset=utf-8",
  }));
  return dedup;
}

// ── post handlers ────────────────────────────────────────────────────────────

function buildPostFromInput(input, logNo, existing = null) {
  const now = new Date();
  // blocks가 명시되면 우선, 그 외엔 기존값. 단 input.body가 명시되면 (레거시 HTML 편집)
  // blocks를 비우고 body를 그대로 저장.
  const hasBlocksInput = Array.isArray(input.blocks);
  const hasBodyInput = typeof input.body === "string";
  let blocks, body;
  if (hasBlocksInput) {
    blocks = input.blocks;
    body = blocks.length > 0 ? renderBlocks(blocks) : (existing?.body || "");
  } else if (hasBodyInput) {
    blocks = []; // 일체형 에디터: body 직접 저장
    body = sanitizeBody(input.body);
  } else {
    blocks = existing?.blocks || [];
    body = existing?.body || "";
  }
  const addDate = input.addDate || existing?.addDate || todayLabel(now);
  // 기존 글의 카테고리 보존: meta.category > legacy 매핑 > 기본
  const fallbackCategory = existing ? categoryOf(existing) : "기타";
  // body_kind: blocks 있으면 cms, 없고 기존 글이면 기존 유지(또는 legacy)
  const isCmsContent = blocks.length > 0 || (hasBodyInput && existing?.body_kind === "cms");
  const bodyKind = isCmsContent ? "cms" : (existing?.body_kind || (hasBodyInput ? "html" : ""));
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
    images: blocks.length > 0
      ? blocksToImages(blocks)
      : (body ? extractImageUrlsFromHtml(body) : (existing?.images || [])),
    meta: {
      ...(existing?.meta || {}),
      category: input.category ?? existing?.meta?.category ?? fallbackCategory,
      ogDesc: input.excerpt ?? existing?.meta?.ogDesc ?? null,
      ogImage: existing?.meta?.ogImage ?? null,
      date: parseAddDate(addDate) || isoDate(now),
    },
  };
}

// 인덱스 기반 빠른 목록 (1042+ 개에서도 단일 GET)
async function handleList() {
  const idx = await readPostIndex();
  return { total: idx.total || idx.posts.length, posts: idx.posts };
}

async function handleCreate(input) {
  const logNo = String(Date.now());
  const post = buildPostFromInput(input, logNo, null);
  await putPost(post);
  await upsertIndexEntry(post);
  return post;
}

async function handleUpdate(logNo, input) {
  const existing = await getPost(logNo);
  if (!existing) return null;
  const next = buildPostFromInput(input, logNo, existing);
  await putPost(next);
  await upsertIndexEntry(next);
  return next;
}

async function handleUpload(payload) {
  if (!payload.base64) throw new Error("base64 missing");
  const ext = (payload.filename?.match(/\.([a-z0-9]+)$/i)?.[1] || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const id = Math.random().toString(36).slice(2, 10);
  const name = `${Date.now()}-${id}.${safeExt}`;
  const key = `${IMAGE_PREFIX}${name}`;
  const buf = Buffer.from(payload.base64, "base64");
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET, Key: key, Body: buf,
    ContentType: payload.mimeType || `image/${safeExt}`,
    CacheControl: "public, max-age=31536000, immutable",
  }));
  return { url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`, key, size: buf.length };
}

async function handleDeploy() {
  if (!BUILD_PROJECT) throw new Error("BUILD_PROJECT env var not set");
  const out = await cb.send(new StartBuildCommand({ projectName: BUILD_PROJECT }));
  return {
    buildId: out.build?.id,
    arn: out.build?.arn,
    status: out.build?.buildStatus,
    startTime: out.build?.startTime,
  };
}
async function handleBuildStatus(buildId) {
  const out = await cb.send(new BatchGetBuildsCommand({ ids: [buildId] }));
  const b = out.builds?.[0];
  if (!b) return null;
  return {
    buildId: b.id,
    status: b.buildStatus,
    currentPhase: b.currentPhase,
    startTime: b.startTime,
    endTime: b.endTime,
  };
}

// ── HTTP layer ───────────────────────────────────────────────────────────────
// CORS 헤더는 Lambda Function URL 설정에서 자동 부착되므로 코드에서 따로 붙이지 않는다.
// (양쪽에서 붙이면 'Access-Control-Allow-Origin' 헤더가 중복돼 브라우저가 거부함)

function respond(status, body, extra = {}) {
  const isJSON = typeof body === "object";
  return {
    statusCode: status,
    headers: {
      "content-type": isJSON ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
      ...extra,
    },
    body: isJSON ? JSON.stringify(body) : body,
  };
}
function checkAuth(headers) {
  if (!CMS_PASSWORD) return false;
  const auth = headers["authorization"] || headers["Authorization"] || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
  const [u, ...pwParts] = decoded.split(":");
  return u === CMS_USER && pwParts.join(":") === CMS_PASSWORD;
}
function unauthorized() {
  return {
    statusCode: 401,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "www-authenticate": 'Basic realm="이수한의원 CMS"',
    },
    body: JSON.stringify({ error: "인증이 필요합니다" }),
  };
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || "GET";
  const path = event.requestContext?.http?.path || event.rawPath || "/";
  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]),
  );

  if (method === "OPTIONS") return respond(204, "");

  // 공개
  if (method === "GET" && path === "/") {
    return respond(200, { ok: true, service: "isuhani-cms-api", region: REGION });
  }
  if (method === "GET" && path === "/api/categories") {
    return respond(200, { categories: await getCategories() });
  }

  // 인증
  if (!checkAuth(headers)) return unauthorized();

  try {
    let body = {};
    if (event.body) {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    }

    if (method === "GET" && path === "/api/posts") return respond(200, await handleList());

    const single = path.match(/^\/api\/posts\/([^/]+)$/);
    if (single) {
      const logNo = single[1];
      if (method === "GET") {
        const p = await getPost(logNo);
        if (!p) return respond(404, { error: "not found" });
        return respond(200, p);
      }
      if (method === "PUT") {
        const updated = await handleUpdate(logNo, body);
        if (!updated) return respond(404, { error: "not found" });
        return respond(200, updated);
      }
      if (method === "DELETE") {
        if (!(await postExists(logNo))) return respond(404, { error: "not found" });
        await deletePostS3(logNo);
        await removeIndexEntry(logNo);
        return respond(200, { ok: true });
      }
    }

    if (method === "POST" && path === "/api/posts")  return respond(201, await handleCreate(body));
    if (method === "POST" && path === "/api/upload") return respond(201, await handleUpload(body));
    if (method === "POST" && path === "/api/deploy") return respond(202, await handleDeploy());

    // 카테고리 관리 (인증 후) — 목록 조회는 비인증으로도 가능했음. 쓰기만 보호.
    if (method === "PUT" && path === "/api/categories") {
      const cats = Array.isArray(body.categories) ? body.categories : null;
      if (!cats) return respond(400, { error: "categories: string[] required" });
      return respond(200, { categories: await putCategories(cats) });
    }

    const buildSingle = path.match(/^\/api\/builds\/([^/]+)$/);
    if (method === "GET" && buildSingle) {
      const status = await handleBuildStatus(buildSingle[1]);
      if (!status) return respond(404, { error: "build not found" });
      return respond(200, status);
    }

    return respond(404, { error: "not found", path, method });
  } catch (e) {
    console.error("[CMS]", e);
    return respond(500, { error: e.message || "server error" });
  }
};
