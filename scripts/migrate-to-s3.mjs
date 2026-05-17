// 이수한의원 v1 — 레거시 1042개 포스트를 S3로 일괄 마이그레이션
//
// 1) frontend/src/data/blog/posts/*.json → s3://isuhani-cms-data/posts/
// 2) 메타데이터(category, thumbnail 포함)를 합산해 s3://isuhani-cms-data/index.json 생성
//
// 사용
//   node scripts/migrate-to-s3.mjs              # 업로드 + 인덱스
//   node scripts/migrate-to-s3.mjs --index-only # 이미 업로드됐을 때 인덱스만 다시
//   node scripts/migrate-to-s3.mjs --dry        # 업로드 없이 인덱스만 미리보기
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "frontend/src/data/blog/posts");

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const BUCKET = process.env.DATA_BUCKET || "isuhani-cms-data";

const s3 = new S3Client({ region: REGION });
const args = new Set(process.argv.slice(2));
const INDEX_ONLY = args.has("--index-only");
const DRY = args.has("--dry");

// ── lib/blog.ts와 동일한 카테고리 매핑 ──────────────────────────────────────
const CATEGORY_MAP = {
  "1": "한의원 story", "32": "건강관리", "43": "한의원 story",
  "42": "여가 · 여행", "11": "비만 · 다이어트", "38": "BLOG",
  "7":  "체형 · 척추 · 관절통증", "12": "체형 · 척추 · 관절통증",
  "13": "체형 · 척추 · 관절통증", "14": "체형 · 척추 · 관절통증",
  "21": "체형 · 척추 · 관절통증",
  "8":  "여성 · 산후조리", "24": "여성 · 산후조리", "25": "여성 · 산후조리",
  "9":  "소아 성장", "10": "소아 성장", "15": "소아 성장", "39": "소아 성장",
};
const PARENT_CATEGORY_MAP = {
  "1": "한의원 story", "7": "체형 · 척추 · 관절통증",
  "8": "여성 · 산후조리", "9": "소아 성장",
  "11": "비만 · 다이어트", "32": "건강관리",
  "38": "BLOG", "42": "여가 · 여행",
};

function categoryName(post) {
  if (post?.meta?.category) return post.meta.category;
  if (post?.categoryNo && CATEGORY_MAP[post.categoryNo]) return CATEGORY_MAP[post.categoryNo];
  if (post?.parentCategoryNo && PARENT_CATEGORY_MAP[post.parentCategoryNo]) {
    return PARENT_CATEGORY_MAP[post.parentCategoryNo];
  }
  return "기타";
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

function extractThumbnail(post) {
  const body = post?.body;
  if (body) {
    const lazy = body.match(/<img[^>]+data-lazy-src="([^"]+)"/);
    if (lazy) return cleanImageUrl(lazy[1]);
    const src = body.match(/<img[^>]+src="(https:\/\/(?:postfiles|blogfiles|mblogthumb|blogthumb)[^"]+)"/);
    if (src) return cleanImageUrl(src[1]);
  }
  if (post?.meta?.ogImage) return cleanImageUrl(post.meta.ogImage);
  return null;
}

function parseAddDate(s) {
  if (!s) return "";
  const m = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : "";
}

// ── concurrency 제어 ────────────────────────────────────────────────────────
async function batchedRun(items, fn, concurrency = 20) {
  let i = 0;
  const total = items.length;
  const errors = [];
  async function worker() {
    while (i < total) {
      const my = i++;
      try { await fn(items[my], my); }
      catch (e) { errors.push({ item: items[my], error: e.message }); }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return errors;
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(POSTS_DIR)) throw new Error(`POSTS_DIR not found: ${POSTS_DIR}`);
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".json"));
  console.log(`▸ 로컬 포스트: ${files.length}개`);
  console.log(`▸ 대상 버킷  : s3://${BUCKET}/posts/`);

  // 인덱스 엔트리 빌드
  const entries = [];
  let skippedBad = 0;
  for (const file of files) {
    try {
      const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
      entries.push({
        logNo: post.logNo,
        title: post.title || "(제목 없음)",
        addDate: post.addDate || "",
        date: parseAddDate(post.addDate),
        category: categoryName(post),
        thumbnail: extractThumbnail(post),
        isCms: false,
      });
    } catch (e) {
      skippedBad++;
      console.warn(`  ! 스킵 (파싱 실패): ${file} — ${e.message}`);
    }
  }
  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  console.log(`▸ 인덱스 엔트리: ${entries.length}개 (스킵 ${skippedBad})`);

  if (DRY) {
    console.log("\n[DRY RUN] 인덱스 미리보기 (top 5):");
    console.log(JSON.stringify(entries.slice(0, 5), null, 2));
    return;
  }

  // 포스트 업로드
  if (!INDEX_ONLY) {
    console.log(`▸ 업로드 시작 (concurrency 20)…`);
    let done = 0;
    const errors = await batchedRun(files, async (file) => {
      const post = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: `posts/${post.logNo}.json`,
        Body: JSON.stringify(post, null, 2),
        ContentType: "application/json; charset=utf-8",
      }));
      done++;
      if (done % 50 === 0 || done === files.length) {
        process.stdout.write(`  ${done}/${files.length}\r`);
      }
    }, 20);
    console.log(`\n▸ 업로드 완료 (실패 ${errors.length})`);
    if (errors.length > 0) {
      console.log("실패 내역 (앞 5개):");
      errors.slice(0, 5).forEach((e) => console.log(`  - ${e.item}: ${e.error}`));
    }
  }

  // 인덱스 작성
  const indexJson = {
    generatedAt: new Date().toISOString(),
    total: entries.length,
    posts: entries,
  };
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: "index.json",
    Body: JSON.stringify(indexJson, null, 2),
    ContentType: "application/json; charset=utf-8",
  }));
  console.log(`▸ 인덱스 업로드: s3://${BUCKET}/index.json`);

  // 검증
  const list = await s3.send(new ListObjectsV2Command({
    Bucket: BUCKET, Prefix: "posts/", MaxKeys: 1,
  }));
  console.log(`▸ S3 posts/ 첫 객체 확인: ${list.Contents?.[0]?.Key || "(empty)"}`);

  console.log(`\n✓ 마이그레이션 완료. 총 ${entries.length}개 인덱스됨.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
