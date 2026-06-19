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
