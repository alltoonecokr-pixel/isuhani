// Phase B 사전 작업 — url-map.json 재구성
//
// Phase A에서 url-map.json이 로컬에 남지 않았으므로,
// S3 images/legacy/ 목록 + 포스트 본문 스캔으로 역산한다.
//
// 사용:
//   node gen-url-map.mjs --posts <posts dir> --out <map.json>
//   AWS_PROFILE=isuhani node gen-url-map.mjs ...

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : def;
}
const POSTS = arg("--posts");
const OUT = arg("--out");
if (!POSTS || !OUT) {
  console.error("필수: --posts <posts dir> --out <map.json>");
  process.exit(1);
}

const BUCKET = "isuhani-clinic-data";
const REGION = "ap-northeast-2";
const PROFILE = process.env.AWS_PROFILE || "isuhani";
const publicUrl = (relKey) =>
  `https://${BUCKET}.s3.${REGION}.amazonaws.com/${relKey}`;

const IMG_RE = /https?:\/\/[a-z0-9.\-]*(?:pstatic\.net|naver\.com)\/[^\s"'<>)\\]+/gi;
const PHOTO_HOSTS = /(postfiles|blogfiles|dthumb-phinf|blogthumb|blogpfthumb-phinf|storep-phinf)\.pstatic\.net/i;
const stripQuery = (u) => {
  const i = u.indexOf("?");
  return i > -1 ? u.slice(0, i) : u;
};
const keyOf = (strippedUrl) =>
  crypto.createHash("sha1").update(strippedUrl).digest("hex").slice(0, 16);

// 1. S3 images/legacy/ 목록 → { hash16: "images/legacy/hash16.ext" }
console.log("S3 images/legacy/ 목록 로딩...");
const raw = execSync(
  `aws s3 ls s3://${BUCKET}/images/legacy/ --profile ${PROFILE} --recursive`,
  { encoding: "utf8" },
);
const s3Set = new Map(); // hash16 → full key
for (const line of raw.split("\n")) {
  const m = line.match(/images\/legacy\/([0-9a-f]{16})\.\w+\s*$/);
  if (m) {
    const key = line.match(/images\/legacy\/\S+/)?.[0];
    if (key) s3Set.set(m[1], key);
  }
}
console.log(`S3 이미지 ${s3Set.size}개 인식`);

// 2. 포스트 본문에서 사진 URL 수집
console.log("포스트 스캔 중...");
const files = fs.readdirSync(POSTS).filter((f) => f.endsWith(".json"));
const candidates = new Map(); // strippedUrl → original

for (const f of files) {
  let doc;
  try { doc = JSON.parse(fs.readFileSync(path.join(POSTS, f), "utf8")); }
  catch { continue; }
  const hay = [doc.body || "", doc?.meta?.ogImage || ""].join(" ");
  for (const raw of hay.match(IMG_RE) || []) {
    const stripped = stripQuery(raw);
    if (!PHOTO_HOSTS.test(stripped)) continue;
    if (!candidates.has(stripped)) candidates.set(stripped, raw);
  }
}
console.log(`고유 네이버 사진 URL ${candidates.size}개 발견`);

// 3. hash16으로 S3 매핑
const urlMap = {};
let matched = 0;
let unmatched = 0;

for (const [stripped] of candidates) {
  const h = keyOf(stripped);
  const s3Key = s3Set.get(h);
  if (s3Key) {
    urlMap[stripped] = s3Key;
    matched++;
  } else {
    unmatched++;
  }
}

fs.writeFileSync(OUT, JSON.stringify(urlMap, null, 2));
console.log(`\n매핑 완료: ${matched}개 / 미매핑(유실): ${unmatched}개`);
console.log(`url-map 저장 → ${OUT}`);
