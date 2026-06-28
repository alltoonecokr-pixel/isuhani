// 미디어 핸들러 — 이미지 업로드 (base64 → S3)

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { IMAGE_PREFIX } from "../constants.mjs";

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const BUCKET = process.env.BUCKET;

const s3 = new S3Client({ region: REGION });

export async function handleUpload(payload) {
  if (!payload.base64) throw new Error("base64 missing");
  const ext = (payload.filename?.match(/\.([a-z0-9]+)$/i)?.[1] || "jpg").toLowerCase();
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
  const id = Math.random().toString(36).slice(2, 10);
  const name = `${Date.now()}-${id}.${safeExt}`;
  const key = `${IMAGE_PREFIX}${name}`;
  const buf = Buffer.from(payload.base64, "base64");
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: payload.mimeType || `image/${safeExt}`,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return {
    url: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`,
    key,
    size: buf.length,
  };
}

// 이미지 교체 — 본문/인덱스 변경 없이 기존 이미지 S3 객체만 새 사진으로 덮어쓴다.
// (URL이 그대로라 본문·썸네일이 자동 반영. 다른 페이지·글 어디에서든 통용)
export async function handleReplaceImage(payload) {
  if (!payload.base64 || !payload.srcUrl) throw new Error("srcUrl/base64 required");
  const m = String(payload.srcUrl).match(/amazonaws\.com\/(.+?)(?:\?|$)/);
  const key = m ? decodeURIComponent(m[1]) : "";
  if (!key.startsWith(IMAGE_PREFIX)) throw new Error("우리 이미지가 아닙니다");
  const ext = (key.match(/\.([a-z0-9]+)$/i)?.[1] || "jpg").toLowerCase();
  const buf = Buffer.from(payload.base64, "base64");
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: payload.mimeType || `image/${ext}`,
      CacheControl: "public, max-age=300", // 교체 후 빠르게 전파
    }),
  );
  return { ok: true, key, size: buf.length };
}
