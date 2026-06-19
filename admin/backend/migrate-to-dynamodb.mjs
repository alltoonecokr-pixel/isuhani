// 이수한의원 건강 저널 — S3 index.json → DynamoDB 메타데이터 마이그레이션
//
// 사용:
//   AWS_PROFILE=isuhani node migrate-to-dynamodb.mjs --dry     (검증만, 쓰기 없음)
//   AWS_PROFILE=isuhani node migrate-to-dynamodb.mjs           (실제 쓰기)
//
// 본문은 그대로 S3(posts/{id}.json)에 두고, bodyKey로 참조한다(메타만 이관).
// index.json은 logNo/title/addDate/date/category/thumbnail이 이미 계산돼 있어 이를 재사용.

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, BatchWriteCommand } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const BUCKET = process.env.BUCKET || "isuhani-clinic-data";
const TABLE = process.env.TABLE || "isuhani-journal-posts";
const INDEX_KEY = process.env.INDEX_KEY || "index.json";
const POST_PREFIX = "posts/";
const DRY = process.argv.includes("--dry");

const s3 = new S3Client({ region: REGION });
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

const nowIso = new Date().toISOString();

async function streamToString(stream) {
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

async function readIndex() {
  const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: INDEX_KEY }));
  return JSON.parse(await streamToString(out.Body));
}

// index.json 엔트리 → DynamoDB 아이템 (스키마: docs/blog-db-architecture.md)
function toItem(e) {
  const date = e.date || "";
  return {
    postId: String(e.logNo),
    title: e.title || "(제목 없음)",
    category: e.category || "기타",
    status: "PUBLISHED",
    date,
    addDate: e.addDate || "",
    thumbnail: e.thumbnail || null,
    bodyKey: `${POST_PREFIX}${e.logNo}.json`,
    bodyKind: e.isCms ? "cms" : "html",
    createdAt: date ? `${date}T00:00:00.000Z` : nowIso,
    updatedAt: nowIso,
    // GSI 키
    GSI1PK: "POST",
    GSI1SK: date,
    GSI2PK: e.category || "기타",
    GSI2SK: date,
  };
}

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

async function batchWrite(items) {
  let written = 0;
  for (const group of chunk(items, 25)) {
    let req = {
      [TABLE]: group.map((Item) => ({ PutRequest: { Item } })),
    };
    // UnprocessedItems 재시도
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await ddb.send(new BatchWriteCommand({ RequestItems: req }));
      const un = res.UnprocessedItems?.[TABLE];
      const done = group.length - (un?.length || 0);
      written += attempt === 0 ? done : (req[TABLE].length - (un?.length || 0));
      if (!un || un.length === 0) break;
      req = { [TABLE]: un };
      await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  return written;
}

async function main() {
  console.log(`▸ index.json 로드: s3://${BUCKET}/${INDEX_KEY}`);
  const idx = await readIndex();
  const entries = idx.posts || [];
  console.log(`  엔트리: ${entries.length}개 (index total=${idx.total})`);

  const items = entries.map(toItem);
  // 샘플 출력
  console.log("  샘플 3건:");
  for (const it of items.slice(0, 3)) {
    console.log(
      `   - ${it.postId} | ${it.date} | ${it.category} | thumb=${it.thumbnail ? "Y" : "N"} | ${it.title.slice(0, 24)}`,
    );
  }
  const noDate = items.filter((i) => !i.date).length;
  const noThumb = items.filter((i) => !i.thumbnail).length;
  console.log(`  날짜 없음: ${noDate} · 썸네일 없음: ${noThumb}`);

  if (DRY) {
    console.log("\n[DRY RUN] 쓰기 없이 종료. 실제 이관하려면 --dry 빼고 실행.");
    return;
  }

  console.log(`\n▸ DynamoDB(${TABLE}) 쓰기…`);
  const n = await batchWrite(items);
  console.log(`✓ 완료: ${n}/${items.length} 건 기록`);
}

main().catch((e) => {
  console.error("실패:", e);
  process.exit(1);
});
