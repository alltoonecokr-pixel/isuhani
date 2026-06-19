// 이수한의원 건강 저널 — 레거시 이미지 이관 "정찰"(dry-run)
//
// 아무것도 바꾸지 않는다. 로컬 본문(정적 JSON = S3 미러)에서 네이버 이미지 URL을
// 전부 모아 고유 개수/호스트 분포를 집계하고, 샘플 N장을 실제로 받아보며
// (referer 전략별) 성공률을 측정한다. 이 숫자로 전량 이관 여부를 판단한다.
//
// 사용:
//   node recon-images.mjs                 (샘플 60장)
//   SAMPLE=120 node recon-images.mjs
//   node recon-images.mjs --save /tmp/isuhani-img-probe   (샘플을 파일로 저장)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.resolve(
  __dirname,
  "../../../service/frontend/src/data/blog/posts",
);
const SAMPLE = Number(process.env.SAMPLE || 60);
const saveIdx = process.argv.indexOf("--save");
const SAVE_DIR = saveIdx > -1 ? process.argv[saveIdx + 1] : null;

const IMG_RE = /https?:\/\/[a-z0-9.\-]*(?:pstatic\.net|naver\.com)\/[^\s"'<>)\\]+/gi;
// 실제 사진만 — 아이콘/버튼/프로필 잡음 제외용 호스트 화이트리스트
const PHOTO_HOSTS = /(postfiles|blogfiles|dthumb-phinf|blogthumb)\.pstatic\.net/i;

function stripQuery(u) {
  const i = u.indexOf("?");
  return i > -1 ? u.slice(0, i) : u;
}

function collect() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"));
  const hostCount = new Map();
  const byPath = new Map(); // path(쿼리제거) → 대표 전체URL (가장 큰 type 우선 아님, 첫 등장)
  let refTotal = 0;

  for (const f of files) {
    let doc;
    try {
      doc = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), "utf8"));
    } catch {
      continue;
    }
    const hay = [doc.body || "", doc?.meta?.ogImage || ""].join(" ");
    const matches = hay.match(IMG_RE) || [];
    for (const raw of matches) {
      refTotal++;
      const host = raw.replace(/^https?:\/\//, "").split("/")[0];
      hostCount.set(host, (hostCount.get(host) || 0) + 1);
      const key = stripQuery(raw);
      if (!byPath.has(key)) byPath.set(key, raw);
    }
  }
  return { files: files.length, refTotal, hostCount, byPath };
}

async function tryFetch(url, headers) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(url, { headers, signal: ctrl.signal });
    clearTimeout(t);
    const buf = Buffer.from(await r.arrayBuffer());
    return { status: r.status, bytes: buf.length, type: r.headers.get("content-type") || "", buf };
  } catch (e) {
    return { status: 0, bytes: 0, type: "", err: String(e?.name || e) };
  }
}

const STRATEGIES = [
  { name: "no-referer", headers: { "User-Agent": "Mozilla/5.0" } },
  {
    name: "naver-referer",
    headers: {
      "User-Agent": "Mozilla/5.0",
      Referer: "https://blog.naver.com/isuhani",
    },
  },
];

function isGoodImage(res) {
  return res.status === 200 && res.bytes > 1500 && /image\//i.test(res.type);
}

async function main() {
  console.log("posts dir:", POSTS_DIR);
  const { files, refTotal, hostCount, byPath } = collect();
  const photos = [...byPath.entries()]
    .filter(([k]) => PHOTO_HOSTS.test(k))
    .map(([, full]) => full);

  console.log("\n── 집계 ──────────────────────────────");
  console.log(`글 파일            : ${files}`);
  console.log(`이미지 참조(중복포함): ${refTotal.toLocaleString()}`);
  console.log(`고유 이미지(전체)   : ${byPath.size.toLocaleString()}`);
  console.log(`고유 사진(첨부류만) : ${photos.length.toLocaleString()}`);
  console.log("\n호스트 분포(참조수):");
  [...hostCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .forEach(([h, c]) => console.log(`  ${String(c).padStart(7)}  ${h}`));

  // 샘플 — 사진 전체에서 균등 간격으로 추출(오래된~최신 고르게)
  const step = Math.max(1, Math.floor(photos.length / SAMPLE));
  const sample = [];
  for (let i = 0; i < photos.length && sample.length < SAMPLE; i += step) {
    sample.push(photos[i]);
  }

  console.log(`\n── 샘플 다운로드 (${sample.length}장) ──────────────`);
  if (SAVE_DIR) fs.mkdirSync(SAVE_DIR, { recursive: true });

  const tally = Object.fromEntries(STRATEGIES.map((s) => [s.name, { ok: 0, blocked: 0, fail: 0 }]));
  const statusSeen = new Map();
  let idx = 0;

  for (const url of sample) {
    idx++;
    let line = `${String(idx).padStart(3)}. `;
    let best = null;
    for (const strat of STRATEGIES) {
      const res = await tryFetch(url, strat.headers);
      statusSeen.set(res.status, (statusSeen.get(res.status) || 0) + 1);
      const good = isGoodImage(res);
      if (good) {
        tally[strat.name].ok++;
        if (!best) best = { strat: strat.name, res };
      } else if (res.status === 0) {
        tally[strat.name].fail++;
      } else {
        tally[strat.name].blocked++;
      }
    }
    if (best) {
      line += `OK via ${best.strat} (${(best.res.bytes / 1024).toFixed(0)}KB)`;
      if (SAVE_DIR) {
        const name = `${String(idx).padStart(3, "0")}_${path.basename(stripQuery(url)).slice(-40)}`;
        fs.writeFileSync(path.join(SAVE_DIR, name), best.res.buf);
      }
    } else {
      line += "✗ 모든 전략 실패";
    }
    console.log(line);
  }

  console.log("\n── 전략별 성공/차단/네트워크실패 ──────────");
  for (const [name, t] of Object.entries(tally)) {
    const pct = ((t.ok / sample.length) * 100).toFixed(0);
    console.log(`  ${name.padEnd(14)} 성공 ${t.ok}/${sample.length} (${pct}%) · 차단 ${t.blocked} · 실패 ${t.fail}`);
  }
  console.log("\n  응답코드 분포:", [...statusSeen.entries()].sort((a, b) => b[1] - a[1]).map(([s, c]) => `${s}:${c}`).join("  "));

  const anyOk = Object.values(tally).reduce((m, t) => Math.max(m, t.ok), 0);
  const rate = anyOk / sample.length;
  console.log("\n── 판단 ──────────────────────────────");
  console.log(`  접근 가능 추정율: 약 ${(rate * 100).toFixed(0)}%`);
  console.log(`  → 사진 ${photos.length.toLocaleString()}장 중 약 ${Math.round(photos.length * rate).toLocaleString()}장 이관 가능 추정`);
  if (SAVE_DIR) console.log(`  샘플 저장: ${SAVE_DIR} (눈으로 품질 확인 가능)`);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
