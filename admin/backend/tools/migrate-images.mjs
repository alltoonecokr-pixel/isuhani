// 이수한의원 건강 저널 — 레거시 이미지 이관 Phase A (다운로드 + 스테이징 + 맵)
//
// 안전: 본문(posts/*.json)을 절대 수정하지 않는다. 네이버 이미지를 받아 로컬
// 스테이징 폴더에 {hash}.{ext}로 저장하고, "네이버 원본 URL → images/legacy/키"
// 매핑(url-map.json)과 유실 목록(dead.json)을 남긴다. 업로드는 별도 `aws s3 sync`.
//
// 사용:
//   node migrate-images.mjs --src <posts dir> --out <staging dir> --map <map.json> [--limit N]
//
// 흐름(래퍼에서):
//   aws s3 sync s3://isuhani-clinic-data/posts/ /tmp/isuhani-posts/
//   node migrate-images.mjs --src /tmp/isuhani-posts --out /tmp/isuhani-img-stage --map /tmp/isuhani-url-map.json
//   aws s3 sync /tmp/isuhani-img-stage/ s3://isuhani-clinic-data/images/legacy/

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : def;
}
const SRC = arg("--src");
const OUT = arg("--out");
const MAP = arg("--map");
const LIMIT = Number(arg("--limit", "0")) || 0;
const CONCURRENCY = Number(process.env.CONCURRENCY || 6);
if (!SRC || !OUT || !MAP) {
  console.error("필수: --src <posts> --out <staging> --map <map.json>");
  process.exit(1);
}

const IMG_RE = /https?:\/\/[a-z0-9.\-]*(?:pstatic\.net|naver\.com)\/[^\s"'<>)\\]+/gi;
// 실제 사진(첨부/썸네일)만 — 검색/예약/스토어 위젯 등 비사진 호스트는 제외
const PHOTO_HOSTS = /(postfiles|blogfiles|dthumb-phinf|blogthumb|blogpfthumb-phinf|storep-phinf)\.pstatic\.net/i;

const stripQuery = (u) => {
  const i = u.indexOf("?");
  return i > -1 ? u.slice(0, i) : u;
};

function extOf(strippedUrl, contentType) {
  const base = strippedUrl.split("/").pop() || "";
  const m = base.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
  if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
  if (/png/i.test(contentType)) return "png";
  if (/gif/i.test(contentType)) return "gif";
  if (/webp/i.test(contentType)) return "webp";
  return "jpg";
}

const keyOf = (strippedUrl) =>
  crypto.createHash("sha1").update(strippedUrl).digest("hex").slice(0, 16);

// 1) 본문에서 고유 사진 URL 수집 (stripped → 대표 전체URL)
function collect() {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".json"));
  const byPath = new Map();
  for (const f of files) {
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(path.join(SRC, f), "utf8"));
    } catch {
      continue;
    }
    const hay = [doc.body || "", doc?.meta?.ogImage || ""].join(" ");
    for (const raw of hay.match(IMG_RE) || []) {
      const stripped = stripQuery(raw);
      if (!PHOTO_HOSTS.test(stripped)) continue;
      if (!byPath.has(stripped)) byPath.set(stripped, raw);
    }
  }
  return byPath;
}

async function download(url) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 20000);
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const type = r.headers.get("content-type") || "";
    const buf = Buffer.from(await r.arrayBuffer());
    const ok = r.status === 200 && buf.length > 1500 && /image\//i.test(type);
    return { ok, status: r.status, type, buf };
  } catch (e) {
    return { ok: false, status: 0, type: "", buf: null, err: String(e?.name || e) };
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const byPath = collect();
  let entries = [...byPath.entries()]; // [stripped, fullUrl]
  if (LIMIT > 0) {
    // 균등 추출(오래된~최신 고르게)
    const step = Math.max(1, Math.floor(entries.length / LIMIT));
    entries = entries.filter((_, i) => i % step === 0).slice(0, LIMIT);
  }
  console.log(`고유 사진 ${byPath.size.toLocaleString()}장${LIMIT ? ` → 이번 실행 ${entries.length}장(제한)` : ""}`);

  const map = {}; // strippedUrl → "images/legacy/{key}.{ext}"
  const dead = []; // 받지 못한 원본 URL
  let ok = 0;
  let cursor = 0;
  const total = entries.length;

  async function worker() {
    while (cursor < total) {
      const i = cursor++;
      const [stripped, fullUrl] = entries[i];
      const res = await download(fullUrl);
      if (res.ok) {
        const ext = extOf(stripped, res.type);
        const rel = `${keyOf(stripped)}.${ext}`;
        fs.writeFileSync(path.join(OUT, rel), res.buf);
        map[stripped] = `images/legacy/${rel}`;
        ok++;
      } else {
        dead.push({ url: fullUrl, status: res.status, err: res.err || null });
      }
      if ((i + 1) % 100 === 0 || i + 1 === total) {
        console.log(`  ${i + 1}/${total} · 성공 ${ok} · 유실 ${dead.length}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  fs.writeFileSync(MAP, JSON.stringify(map, null, 0));
  const deadPath = MAP.replace(/\.json$/, "") + ".dead.json";
  fs.writeFileSync(deadPath, JSON.stringify(dead, null, 0));

  const bytes = fs
    .readdirSync(OUT)
    .reduce((s, f) => s + fs.statSync(path.join(OUT, f)).size, 0);
  console.log("\n── Phase A 완료 ──────────────────────");
  console.log(`  이관 성공 : ${ok}장`);
  console.log(`  유실      : ${dead.length}장  → ${deadPath}`);
  console.log(`  스테이징  : ${OUT}  (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  URL 맵    : ${MAP}  (${Object.keys(map).length}건)`);
  console.log(`\n  다음: aws s3 sync ${OUT}/ s3://isuhani-clinic-data/images/legacy/`);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
