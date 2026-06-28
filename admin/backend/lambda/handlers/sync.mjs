// 블로그 동기화 핸들러 — POST /api/sync-blog
// 네이버 RSS로 새 글 탐지 → PostView에서 본문/이미지 추출 → 이미지 S3 이관 →
// posts/ 저장 + index/live-index/DynamoDB 갱신 + live-posts(즉시 상세) 기록.
// 텍스트는 즉시 반영(빌드 불필요), 정적 SEO 페이지는 이후 발행 빌드로.

import crypto from "node:crypto";
import { putPost, putImage, objectExists, writeLivePost, readPostIndex } from "../services/s3.mjs";
import { upsertIndexEntry, indexEntry } from "../services/indexer.mjs";
import { toItem, putIndex } from "../services/dynamo.mjs";

const BLOG = "isuhani";
const REGION = process.env.AWS_REGION || "ap-northeast-2";
const DATA_BUCKET = process.env.BUCKET;
const UA = { "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/120 Safari/537.36" };
const MAX_PER_RUN = 5; // API Gateway 29s 제한 — 많으면 재클릭으로 이어받음(이미지 중복 업로드 스킵)

const SITE_CATS = ["한의원 story", "건강관리", "체형 · 척추 · 관절통증", "소아 성장",
  "여성 · 산후조리", "여가 · 여행", "비만 · 다이어트"];
const CAT_TABLE = {
  "건강관리": "건강관리", "한의원story": "한의원 story",
  "체형척추관절통증": "체형 · 척추 · 관절통증", "통증질환": "체형 · 척추 · 관절통증",
  "디스크": "체형 · 척추 · 관절통증", "추나": "체형 · 척추 · 관절통증",
  "여성산후조리": "여성 · 산후조리", "산후조리": "여성 · 산후조리", "여성": "여성 · 산후조리",
  "소아성장": "소아 성장", "소아": "소아 성장",
  "비만다이어트": "비만 · 다이어트", "다이어트": "비만 · 다이어트",
  "여가여행": "여가 · 여행", "여행": "여가 · 여행", "일상": "여가 · 여행",
};
function normCat(raw) {
  if (!raw) return "한의원 story";
  const k = raw.replace(/[\s·.]/g, "");
  if (CAT_TABLE[k]) return CAT_TABLE[k];
  for (const c of SITE_CATS) if (c.replace(/[\s·.]/g, "") === k) return c;
  return "한의원 story";
}

const decode = (s) =>
  (s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&#x?([0-9a-f]+);/gi,
      (_m, h) => String.fromCharCode(/^x/i.test("x" + h) && /[a-f]/i.test(h) ? parseInt(h, 16) : parseInt(h, 10)));

async function fetchText(url) {
  const r = await fetch(url, { headers: UA });
  return await r.text();
}
async function fetchBytes(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error("img " + r.status);
  return Buffer.from(await r.arrayBuffer());
}

function og(html, prop) {
  const m = html.match(new RegExp(`<meta property="og:${prop}" content="([^"]*)"`));
  return m ? decode(m[1]) : "";
}
function extractBody(html) {
  const i = html.indexOf('<div class="se-main-container">');
  if (i < 0) return "";
  let depth = 0, end = -1;
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = i;
  let m;
  while ((m = re.exec(html))) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) { end = m.index + m[0].length; break; }
  }
  return end < 0 ? "" : html.slice(i, end);
}
function addDateOf(html) {
  const m = html.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
  return m ? `${m[1]}. ${+m[2]}. ${+m[3]}.` : "";
}
function isoDateOf(addd) {
  const m = addd.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/);
  return m ? `${m[1]}-${String(+m[2]).padStart(2, "0")}-${String(+m[3]).padStart(2, "0")}` : "";
}

const IMG_RE = /https:\/\/(?:postfiles|blogfiles|mblogthumb|blogthumb)[^\s"'<>]+|https:\/\/[a-z0-9.\-]*pstatic\.net\/[^\s"'<>]*(?:postfiles|MjAy|\/\d{8}_)[^\s"'<>]*/g;
const stripQ = (u) => u.split("?")[0];
const keyOf = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);

async function migrateImages(body, ogImage) {
  const urls = new Set(body.match(IMG_RE) || []);
  if (ogImage && ogImage.includes("pstatic")) urls.add(ogImage);
  const s3Urls = [];
  let body2 = body, og2 = ogImage;
  for (const u of [...urls].sort()) {
    const stripped = stripQ(u);
    const ext = (stripped.match(/\.(jpg|jpeg|png|gif)$/i)?.[1] || "jpg").toLowerCase();
    const key = `images/legacy/${keyOf(stripped)}.${ext}`;
    const s3Url = `https://${DATA_BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
    try {
      if (!(await objectExists(key))) {
        // 최고화질 우선(w3840) → 실패 시 점차 낮춰 폴백
        const cands = stripped.includes("pstatic") ? ["?type=w3840", "?type=w966", "?type=w773", ""] : [""];
        let buf = null;
        for (const q of cands) {
          try { buf = await fetchBytes(stripped + q); break; } catch { /* try next */ }
        }
        if (!buf) continue;
        const ct = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif" }[ext];
        await putImage(key, buf, ct);
      }
    } catch { continue; }
    const pat = new RegExp(stripped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '(\\?[^\\s"\'<>]*)?', "g");
    body2 = body2.replace(pat, s3Url);
    if (og2) og2 = og2.replace(pat, s3Url);
    s3Urls.push(s3Url);
  }
  return { s3Urls, body2, og2 };
}

async function buildPost(logno, rssCat) {
  const html = await fetchText(`https://blog.naver.com/PostView.naver?blogId=${BLOG}&logNo=${logno}`);
  const title = og(html, "title");
  const body = extractBody(html);
  if (!title || !body) return null;
  const addDate = addDateOf(html);
  const ogImg = og(html, "image");
  const desc = og(html, "description");
  const { s3Urls, body2, og2 } = await migrateImages(body, ogImg);
  return {
    logNo: logno, title, addDate, categoryNo: "", parentCategoryNo: "",
    url: `https://blog.naver.com/PostView.naver?blogId=${BLOG}&logNo=${logno}`,
    blocks: [], body: body2, body_kind: "html", images: s3Urls,
    meta: { ogTitle: title, ogDesc: desc, ogImage: og2 || null, category: normCat(rssCat), date: isoDateOf(addDate) },
  };
}

async function rssItems() {
  const x = await fetchText(`https://rss.blog.naver.com/${BLOG}.xml`);
  const out = [];
  for (const it of x.match(/<item>[\s\S]*?<\/item>/g) || []) {
    const link = it.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
    const cat = it.match(/<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/);
    const m = link?.[1].match(/\/(\d{10,})/);
    if (m) out.push({ logNo: m[1], cat: cat ? decode(cat[1].trim()) : "" });
  }
  return out;
}

export async function handleSyncBlog() {
  const idx = await readPostIndex();
  const have = new Set((idx.posts || []).map((p) => String(p.logNo)));
  const items = await rssItems();
  const todo = items.filter((it) => !have.has(it.logNo)).slice(0, MAX_PER_RUN);

  const imported = [];
  for (const { logNo, cat } of todo) {
    let post;
    try { post = await buildPost(logNo, cat); } catch { post = null; }
    if (!post) continue;
    await putPost(post);
    await upsertIndexEntry(post);
    await putIndex(toItem(indexEntry(post), { excerpt: post.meta.ogDesc || null }));
    await writeLivePost({
      logNo: post.logNo, title: post.title, category: post.meta.category,
      dateLabel: post.addDate, date: post.meta.date, body: post.body,
      ogImage: post.meta.ogImage, externalUrl: `https://blog.naver.com/${BLOG}/${post.logNo}`,
      updatedAt: new Date().toISOString(),
    });
    imported.push({ logNo: post.logNo, title: post.title, date: post.meta.date, category: post.meta.category, images: post.images.length });
  }
  return { found: items.length, new: todo.length, imported };
}
