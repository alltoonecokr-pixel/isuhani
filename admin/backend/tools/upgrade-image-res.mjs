// 이수한의원 이미지 — 최고 해상도 재다운로드(품질 업그레이드)
//
// Phase A가 본문 URL을 그대로 받아 저해상도(?type=w275/blur)를 저장한 문제를 수정.
// url-map의 각 원본을 최고화질로 다시 받아 동일 S3 키(파일명)로 스테이징한다.
// 본문 URL은 그대로라 재치환(Phase B) 불필요 — S3 객체만 덮어쓰면 끝.
//
// 전략: 후보 파라미터를 시도해 "가장 큰 유효 이미지"를 채택.
//   w3840(성공 시 그 호스트 최대) → 실패 시 무파라미터/w966/w773 폴백 중 최대.
//
// 사용:
//   node upgrade-image-res.mjs --map <map.json> --out <staging> [--limit N]

import fs from "node:fs";
import path from "node:path";

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : def;
}
const MAP = arg("--map");
const OUT = arg("--out");
const BASELINE = arg("--baseline"); // Phase A 다운로드본(기준선): 새것이 더 클 때만 교체
const LIMIT = Number(arg("--limit", "0")) || 0;
const CONCURRENCY = Number(process.env.CONCURRENCY || 8);
if (!MAP || !OUT) {
  console.error("필수: --map <map.json> --out <staging> [--limit N]");
  process.exit(1);
}

const map = JSON.parse(fs.readFileSync(MAP, "utf8")); // strippedUrl → "images/legacy/{hash}.ext"

// 쿼리 없는 stripped URL 기준 후보 — 전부 받아 "가장 큰 유효 이미지"를 채택(화질 무손실).
const CANDIDATES = ["?type=w3840", "?type=w966", "?type=w773", "?type=w275", ""];

async function fetchSize(url) {
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
    return ok ? buf : null;
  } catch {
    return null;
  }
}

// 최고화질 버퍼: 모든 후보를 받아 가장 큰 유효 이미지를 채택(절대 화질 손실 없음).
async function bestImage(stripped) {
  const bufs = await Promise.all(CANDIDATES.map((c) => fetchSize(stripped + c)));
  let best = null;
  for (const buf of bufs) if (buf && (!best || buf.length > best.length)) best = buf;
  return best;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  let entries = Object.entries(map); // [strippedUrl, relKey]
  if (LIMIT > 0) {
    const step = Math.max(1, Math.floor(entries.length / LIMIT));
    entries = entries.filter((_, i) => i % step === 0).slice(0, LIMIT);
  }
  console.log(`업그레이드 대상 ${entries.length.toLocaleString()}장 (CONCURRENCY=${CONCURRENCY})`);

  const baseSize = (relKey) => {
    if (!BASELINE) return 0;
    try {
      return fs.statSync(path.join(BASELINE, path.basename(relKey))).size;
    } catch {
      return 0;
    }
  };

  let upgraded = 0; // 더 커서 교체
  let kept = 0; // 기존이 더 크거나 같아 유지
  let fail = 0;
  let bytes = 0;
  let cursor = 0;
  const total = entries.length;

  async function worker() {
    while (cursor < total) {
      const i = cursor++;
      const [stripped, relKey] = entries[i];
      const buf = await bestImage(stripped);
      if (!buf) {
        fail++;
      } else if (buf.length > baseSize(relKey)) {
        fs.writeFileSync(path.join(OUT, path.basename(relKey)), buf);
        upgraded++;
        bytes += buf.length;
      } else {
        kept++; // 기존(S3)이 더 좋음 → 건드리지 않음
      }
      if ((i + 1) % 200 === 0 || i + 1 === total) {
        console.log(`  ${i + 1}/${total} · 교체 ${upgraded} · 유지 ${kept} · 실패 ${fail} · ${(bytes / 1024 / 1024).toFixed(0)}MB`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log("\n── 업그레이드 완료 ──");
  console.log(`  교체(고화질) ${upgraded} · 유지(기존우수) ${kept} · 실패 ${fail}`);
  console.log(`  스테이징 ${OUT} (${(bytes / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`  다음: aws s3 sync ${OUT}/ s3://isuhani-clinic-data/images/legacy/  (교체분만)`);
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
