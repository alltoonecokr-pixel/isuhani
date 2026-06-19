// 이수한의원 건강 저널 — 레거시 이미지 이관 Phase B (본문 URL 치환)
//
// Phase A가 만든 url-map(네이버 stripped URL → images/legacy/키)을 이용해,
// posts/*.json 본문·meta.ogImage 및 index.json 썸네일의 네이버 이미지 URL을
// 우리 S3 공개 URL로 바꾼다. 맵에 없는 것(유실분·비사진 위젯)은 그대로 둔다.
//
// 사용:
//   node rewrite-bodies.mjs --src <posts> --map <map.json> --index <index.json> --out <out posts> [--dry]
//   --dry : 쓰기 없이 치환 건수만 집계

import fs from "node:fs";
import path from "node:path";

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : def;
}
const SRC = arg("--src");
const MAP = arg("--map");
const INDEX = arg("--index");
const OUT = arg("--out");
const DRY = process.argv.includes("--dry");
if (!SRC || !MAP || !OUT) {
  console.error("필수: --src <posts> --map <map.json> --out <out> [--index <index.json>] [--dry]");
  process.exit(1);
}

const BUCKET = "isuhani-clinic-data";
const REGION = "ap-northeast-2";
const publicUrl = (relKey) => `https://${BUCKET}.s3.${REGION}.amazonaws.com/${relKey}`;

const IMG_RE = /https?:\/\/[a-z0-9.\-]*(?:pstatic\.net|naver\.com)\/[^\s"'<>)\\]+/gi;
const stripQuery = (u) => {
  const i = u.indexOf("?");
  return i > -1 ? u.slice(0, i) : u;
};

const map = JSON.parse(fs.readFileSync(MAP, "utf8")); // strippedUrl → "images/legacy/{key}"

// 텍스트 안의 네이버 이미지 URL을 우리 S3 URL로 치환. [새문자열, 치환수] 반환.
function rewrite(text) {
  if (!text) return [text, 0];
  let n = 0;
  const out = text.replace(IMG_RE, (m) => {
    const key = map[stripQuery(m)];
    if (key) {
      n++;
      return publicUrl(key);
    }
    return m;
  });
  return [out, n];
}

// JSON 텍스트 전체에서 치환(모든 필드: body·meta.ogImage·images[]·기타 일괄).
// 치환은 네이버 이미지 URL → S3 URL뿐이고 새 URL은 JSON-safe라 구조 안 깨짐.
// 안전을 위해 치환 후 반드시 JSON.parse로 검증한다.
function rewriteFile(raw) {
  const [out, n] = rewrite(raw);
  JSON.parse(out); // 깨지면 throw → 호출부에서 해당 파일 skip
  return [out, n];
}

function main() {
  if (!DRY) fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith(".json"));

  let postsChanged = 0;
  let totalRepl = 0;
  let parseFail = 0;

  for (const f of files) {
    const raw = fs.readFileSync(path.join(SRC, f), "utf8");
    let out, c;
    try {
      [out, c] = rewriteFile(raw);
    } catch {
      parseFail++;
      continue; // 검증 실패 파일은 원본 유지(쓰지 않음)
    }
    totalRepl += c;
    if (c > 0) postsChanged++;
    if (!DRY && c > 0) fs.writeFileSync(path.join(OUT, f), out);
  }

  // index.json 썸네일도 같은 방식
  let thumbRepl = 0;
  if (INDEX) {
    const raw = fs.readFileSync(INDEX, "utf8");
    const [out, c] = rewriteFile(raw);
    thumbRepl = c;
    if (!DRY) fs.writeFileSync(path.join(OUT, "..", "index.rewritten.json"), out);
  }

  // 검증: 출력(또는 dry시 메모리)에 남은 사진 URL 분류
  let leftPhoto = 0;
  const PHOTO = /(postfiles|blogfiles|dthumb-phinf|blogthumb|blogpfthumb-phinf|storep-phinf)\.pstatic\.net/i;
  for (const f of files) {
    const raw = fs.readFileSync(path.join(SRC, f), "utf8");
    const out = rewrite(raw)[0];
    for (const m of out.match(IMG_RE) || []) if (PHOTO.test(m)) leftPhoto++;
  }

  console.log(DRY ? "── DRY RUN (쓰기 없음) ──" : "── 치환 실행 ──");
  console.log(`글 파일            : ${files.length}`);
  console.log(`변경된 글          : ${postsChanged}`);
  console.log(`총 URL 치환(본문+이미지배열+og) : ${totalRepl.toLocaleString()}`);
  console.log(`썸네일(index) 치환 : ${thumbRepl}`);
  console.log(`JSON 검증 실패     : ${parseFail}`);
  console.log(`치환 후 남은 사진 URL 참조 : ${leftPhoto.toLocaleString()} (유실분, 예상)`);
  if (!DRY) {
    console.log(`\n출력: ${OUT}  + index.rewritten.json`);
    console.log(`다음: aws s3 sync ${OUT}/ s3://isuhani-clinic-data/posts/`);
  }
}

main();
