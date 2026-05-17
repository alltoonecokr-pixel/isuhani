// 이수한의원 v1 — 로컬 CMS 서버
// 건강 저널 (frontend/src/data/blog/posts/*.json) CRUD + 이미지 업로드
// 실행: node cms/server.mjs  →  http://localhost:3004

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "frontend/src/data/blog/posts");
const INDEX_FILE = path.join(ROOT, "frontend/src/data/blog/index.json");
const UPLOAD_DIR = path.join(ROOT, "frontend/public/uploads/cms");
const ADMIN_HTML = path.join(__dirname, "admin.html");

const PORT = Number(process.env.PORT || 3004);

const CATEGORIES = [
  "한의원 story",
  "건강관리",
  "체형 · 척추 · 관절통증",
  "여성 · 산후조리",
  "소아 성장",
  "비만 · 다이어트",
  "여가 · 여행",
  "BLOG",
  "기타",
];

function todayLabel(d = new Date()) {
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}
function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function parseAddDate(s) {
  if (!s) return "";
  const m = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2));
}

function readIndex() {
  if (!fs.existsSync(INDEX_FILE)) {
    return { generatedAt: new Date().toISOString(), total: 0, posts: [] };
  }
  return readJSON(INDEX_FILE);
}

function writeIndex(idx) {
  idx.generatedAt = new Date().toISOString();
  idx.total = idx.posts.length;
  writeJSON(INDEX_FILE, idx);
}

function upsertIndexEntry(post) {
  const idx = readIndex();
  const entry = {
    logNo: post.logNo,
    title: post.title,
    addDate: post.addDate,
    categoryNo: post.categoryNo || "",
    parentCategoryNo: post.parentCategoryNo || "",
  };
  const i = idx.posts.findIndex((p) => p.logNo === post.logNo);
  if (i >= 0) idx.posts[i] = entry;
  else idx.posts.unshift(entry);
  // 날짜 desc 정렬
  idx.posts.sort((a, b) => {
    const da = parseAddDate(a.addDate);
    const db = parseAddDate(b.addDate);
    return da < db ? 1 : da > db ? -1 : 0;
  });
  writeIndex(idx);
}

function removeIndexEntry(logNo) {
  const idx = readIndex();
  idx.posts = idx.posts.filter((p) => p.logNo !== logNo);
  writeIndex(idx);
}

// 본문이 plain text면 <p>로 감싸고, 줄바꿈을 <br/>로 변환
function normalizeBody(body, kind = "html") {
  if (!body) return "";
  if (kind === "plain") {
    const escaped = body
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("\n");
  }
  return body;
}

function extractImageUrls(html) {
  const urls = [];
  const re = /<img[^>]+src="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.push(m[1]);
  return urls;
}

// ── HTTP utils ───────────────────────────────────────────────────────────────

function send(res, status, body, headers = {}) {
  const isJSON = typeof body === "object" && !Buffer.isBuffer(body);
  const payload = isJSON ? JSON.stringify(body) : body;
  res.writeHead(status, {
    "content-type": isJSON ? "application/json; charset=utf-8" : headers["content-type"] || "text/plain",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type",
    ...headers,
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const buf = Buffer.concat(chunks);
        if (!buf.length) return resolve({});
        const ct = req.headers["content-type"] || "";
        if (ct.includes("application/json")) resolve(JSON.parse(buf.toString("utf8")));
        else resolve(buf);
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// ── Handlers ─────────────────────────────────────────────────────────────────

function listPosts() {
  const idx = readIndex();
  // 카테고리 라벨을 위해 각 포스트의 meta.category 또는 categoryNo 매핑 필요.
  // 목록은 가벼운 응답: 본문 안 읽음.
  const posts = idx.posts.map((p) => ({
    logNo: p.logNo,
    title: p.title,
    addDate: p.addDate,
    date: parseAddDate(p.addDate),
    categoryNo: p.categoryNo,
    parentCategoryNo: p.parentCategoryNo,
    isCms: isCmsPost(p.logNo),
  }));
  return { total: posts.length, posts };
}

function isCmsPost(logNo) {
  // 13자리 이상 epoch ms = CMS 생성. 네이버 logNo는 9~12자리.
  return /^\d{13,}$/.test(String(logNo));
}

function readPost(logNo) {
  const file = path.join(POSTS_DIR, `${logNo}.json`);
  if (!fs.existsSync(file)) return null;
  return readJSON(file);
}

function createPost(input) {
  const logNo = String(Date.now());
  const now = new Date();
  const body = normalizeBody(input.body || "", input.bodyKind || "html");
  const post = {
    logNo,
    title: input.title || "(제목 없음)",
    addDate: input.addDate || todayLabel(now),
    categoryNo: "",
    parentCategoryNo: "",
    url: "",
    body,
    body_kind: "cms",
    images: extractImageUrls(body),
    meta: {
      category: input.category || "기타",
      ogDesc: input.excerpt || null,
      ogImage: null,
      date: isoDate(now),
    },
  };
  fs.writeFileSync(path.join(POSTS_DIR, `${logNo}.json`), JSON.stringify(post, null, 2));
  upsertIndexEntry(post);
  return post;
}

function updatePost(logNo, input) {
  const file = path.join(POSTS_DIR, `${logNo}.json`);
  if (!fs.existsSync(file)) return null;
  const existing = readJSON(file);
  const body = input.body !== undefined ? normalizeBody(input.body, input.bodyKind || "html") : existing.body;
  const next = {
    ...existing,
    title: input.title ?? existing.title,
    addDate: input.addDate ?? existing.addDate,
    body,
    images: extractImageUrls(body || ""),
    meta: {
      ...(existing.meta || {}),
      category: input.category ?? existing.meta?.category ?? "기타",
      ogDesc: input.excerpt ?? existing.meta?.ogDesc ?? null,
    },
  };
  fs.writeFileSync(file, JSON.stringify(next, null, 2));
  upsertIndexEntry(next);
  return next;
}

function deletePost(logNo) {
  const file = path.join(POSTS_DIR, `${logNo}.json`);
  if (!fs.existsSync(file)) return false;
  // 안전: CMS가 만든 글만 삭제 허용. 네이버 크롤 1042개는 잠금.
  if (!isCmsPost(logNo)) {
    const err = new Error("네이버 크롤 데이터는 삭제할 수 없습니다 (CMS로 만든 글만 삭제 가능).");
    err.code = "FORBIDDEN_DELETE";
    throw err;
  }
  fs.unlinkSync(file);
  removeIndexEntry(logNo);
  return true;
}

async function uploadImage(payload) {
  // payload: { filename, base64, mimeType }
  if (!payload.base64) throw new Error("base64 missing");
  const ext = (payload.filename?.match(/\.([a-z0-9]+)$/i)?.[1] || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const id = crypto.randomBytes(6).toString("hex");
  const name = `${Date.now()}-${id}.${safeExt}`;
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const buf = Buffer.from(payload.base64, "base64");
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buf);
  return { url: `/uploads/cms/${name}`, size: buf.length };
}

// ── Router ───────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const method = req.method || "GET";

    if (method === "OPTIONS") return send(res, 204, "");

    // 정적 — admin.html은 자주 바뀌므로 캐시 비활성
    if (method === "GET" && (url.pathname === "/" || url.pathname === "/admin")) {
      const html = fs.readFileSync(ADMIN_HTML, "utf8");
      return send(res, 200, html, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store, must-revalidate",
      });
    }

    // 카테고리 메타
    if (method === "GET" && url.pathname === "/api/categories") {
      return send(res, 200, { categories: CATEGORIES });
    }

    // 포스트 목록
    if (method === "GET" && url.pathname === "/api/posts") {
      return send(res, 200, listPosts());
    }

    // 포스트 단건
    const single = url.pathname.match(/^\/api\/posts\/([^/]+)$/);
    if (single) {
      const logNo = single[1];
      if (method === "GET") {
        const p = readPost(logNo);
        if (!p) return send(res, 404, { error: "not found" });
        return send(res, 200, p);
      }
      if (method === "PUT") {
        const body = await readBody(req);
        const updated = updatePost(logNo, body);
        if (!updated) return send(res, 404, { error: "not found" });
        return send(res, 200, updated);
      }
      if (method === "DELETE") {
        try {
          const ok = deletePost(logNo);
          if (!ok) return send(res, 404, { error: "not found" });
          return send(res, 200, { ok: true });
        } catch (e) {
          if (e.code === "FORBIDDEN_DELETE") return send(res, 403, { error: e.message });
          throw e;
        }
      }
    }

    // 포스트 생성
    if (method === "POST" && url.pathname === "/api/posts") {
      const body = await readBody(req);
      const created = createPost(body);
      return send(res, 201, created);
    }

    // 이미지 업로드
    if (method === "POST" && url.pathname === "/api/upload") {
      const body = await readBody(req);
      const result = await uploadImage(body);
      return send(res, 201, result);
    }

    return send(res, 404, { error: "not found" });
  } catch (e) {
    console.error("[CMS]", e);
    return send(res, 500, { error: e.message || "server error" });
  }
});

server.listen(PORT, () => {
  console.log(`[CMS] http://localhost:${PORT}`);
  console.log(`[CMS] posts dir: ${POSTS_DIR}`);
});
