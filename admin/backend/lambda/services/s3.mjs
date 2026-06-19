// S3 CRUD — 포스트, 이미지, 카테고리, index.json
// 모든 함수는 BUCKET 환경변수를 읽고 AWS SDK를 직접 호출한다.
// 비즈니스 로직(indexEntry 계산, 카테고리 추론)은 indexer.mjs가 담당.

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { POST_PREFIX, META_KEY, INDEX_KEY, DEFAULT_CATEGORIES } from "../constants.mjs";

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const BUCKET = process.env.BUCKET;
const WEB_BUCKET = process.env.WEB_BUCKET;

const s3 = new S3Client({ region: REGION });

async function streamToString(stream) {
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

// ── 포스트 ───────────────────────────────────────────────────────────────────

export async function listPostKeys() {
  const keys = [];
  let token;
  do {
    const out = await s3.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: POST_PREFIX,
        ContinuationToken: token,
      }),
    );
    for (const o of out.Contents || []) {
      if (o.Key && o.Key.endsWith(".json")) keys.push(o.Key);
    }
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

export async function getPost(logNo) {
  try {
    const out = await s3.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: `${POST_PREFIX}${logNo}.json` }),
    );
    return JSON.parse(await streamToString(out.Body));
  } catch (e) {
    if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404) return null;
    throw e;
  }
}

export async function putPost(post) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: `${POST_PREFIX}${post.logNo}.json`,
      Body: JSON.stringify(post, null, 2),
      ContentType: "application/json; charset=utf-8",
    }),
  );
}

export async function deletePost(logNo) {
  await s3.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: `${POST_PREFIX}${logNo}.json` }),
  );
}

export async function postExists(logNo) {
  try {
    await s3.send(
      new HeadObjectCommand({ Bucket: BUCKET, Key: `${POST_PREFIX}${logNo}.json` }),
    );
    return true;
  } catch (e) {
    if (e.$metadata?.httpStatusCode === 404 || e.name === "NotFound") return false;
    throw e;
  }
}

// ── 카테고리 ─────────────────────────────────────────────────────────────────

export async function getCategories() {
  try {
    const out = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: META_KEY }));
    const data = JSON.parse(await streamToString(out.Body));
    if (Array.isArray(data?.categories) && data.categories.length > 0)
      return data.categories;
  } catch (e) {
    if (e.name !== "NoSuchKey" && e.$metadata?.httpStatusCode !== 404) throw e;
  }
  return DEFAULT_CATEGORIES.slice();
}

export async function putCategories(cats) {
  const dedup = Array.from(
    new Set(cats.map((c) => String(c).trim()).filter(Boolean)),
  );
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: META_KEY,
      Body: JSON.stringify({ categories: dedup, updatedAt: new Date().toISOString() }, null, 2),
      ContentType: "application/json; charset=utf-8",
    }),
  );
  return dedup;
}

// ── index.json (전체 포스트 메타 카탈로그) ───────────────────────────────────

export async function readPostIndex() {
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

export async function writePostIndex(idx) {
  idx.generatedAt = new Date().toISOString();
  idx.total = idx.posts.length;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: INDEX_KEY,
      Body: JSON.stringify(idx, null, 2),
      ContentType: "application/json; charset=utf-8",
    }),
  );
}

// 프론트엔드가 런타임에 fetch하는 공개 인덱스 — CMS 저장 즉시 반영
export async function writeWebIndex(posts) {
  if (!WEB_BUCKET) return;
  await s3.send(
    new PutObjectCommand({
      Bucket: WEB_BUCKET,
      Key: "live-index.json",
      Body: JSON.stringify({ updatedAt: new Date().toISOString(), posts }),
      ContentType: "application/json; charset=utf-8",
      CacheControl: "no-store, max-age=0",
    }),
  );
}
