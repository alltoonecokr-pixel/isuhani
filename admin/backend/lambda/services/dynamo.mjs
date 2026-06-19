// DynamoDB 메타 인덱스 — 본문은 S3, 여기엔 메타만.
// 설계: docs/blog-db-architecture.md
//
//   PK  postId
//   GSI1  최신 피드    GSI1PK="POST"   GSI1SK=date
//   GSI2  카테고리별   GSI2PK=category GSI2SK=date

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const TABLE = process.env.POSTS_TABLE || "isuhani-journal-posts";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({ region: REGION }), {
  marshallOptions: { removeUndefinedValues: true },
});

// indexEntry(post) 결과 + 추가 메타 → DynamoDB 아이템
export function toItem(entry, extra = {}) {
  const date = entry.date || "";
  const category = entry.category || "기타";
  const now = new Date().toISOString();
  return {
    postId: String(entry.logNo),
    title: entry.title || "(제목 없음)",
    category,
    status: extra.status || "PUBLISHED",
    date,
    addDate: entry.addDate || "",
    thumbnail: entry.thumbnail || null,
    excerpt: extra.excerpt || null,
    bodyKey: `posts/${entry.logNo}.json`,
    bodyKind: entry.isCms ? "cms" : (extra.bodyKind || "html"),
    createdAt: extra.createdAt || (date ? `${date}T00:00:00.000Z` : now),
    updatedAt: now,
    GSI1PK: "POST",
    GSI1SK: date,
    GSI2PK: category,
    GSI2SK: date,
  };
}

export async function putIndex(item) {
  await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
}

export async function deleteIndex(postId) {
  await ddb.send(
    new DeleteCommand({ TableName: TABLE, Key: { postId: String(postId) } }),
  );
}

// 커서 기반 페이지 조회 — GSI1(전체 최신순) 또는 GSI2(카테고리별)
export async function queryPage({ category, cursor, limit = 1000 } = {}) {
  const useCat = category && category !== "전체" && category !== "";
  const params = {
    TableName: TABLE,
    ScanIndexForward: false,
    Limit: limit,
    ...(useCat
      ? {
          IndexName: "GSI2",
          KeyConditionExpression: "GSI2PK = :p",
          ExpressionAttributeValues: { ":p": category },
        }
      : {
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :p",
          ExpressionAttributeValues: { ":p": "POST" },
        }),
  };
  if (cursor) {
    params.ExclusiveStartKey = JSON.parse(
      Buffer.from(cursor, "base64").toString("utf8"),
    );
  }
  const out = await ddb.send(new QueryCommand(params));
  const next = out.LastEvaluatedKey
    ? Buffer.from(JSON.stringify(out.LastEvaluatedKey)).toString("base64")
    : null;
  return { items: out.Items || [], nextCursor: next };
}

// 전체 조회 — 관리자 목록용 (스캔 대신 GSI1 풀 순회)
export async function queryAll(category) {
  const items = [];
  let cursor;
  do {
    const r = await queryPage({ category, cursor });
    items.push(...r.items);
    cursor = r.nextCursor;
  } while (cursor);
  return items;
}
