#!/usr/bin/env node
// 1042개 글 → Bedrock Cohere Multilingual 임베딩 → JSON 저장
// 사용:
//   AWS_PROFILE=default node scripts/build-embeddings.mjs
// 출력: frontend/src/data/blog/embeddings.json

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.resolve(__dirname, "../service/frontend/src/data/blog/posts");
const OUT_FILE = path.resolve(__dirname, "../service/frontend/src/data/blog/embeddings.json");

const REGION = process.env.AWS_REGION || "us-east-1";
const MODEL_ID = "cohere.embed-multilingual-v3";
const BATCH_SIZE = 90; // Cohere 한 번에 최대 96 docs

const bedrock = new BedrockRuntimeClient({ region: REGION });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function stripHtml(html) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function embedBatch(texts) {
  const cmd = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      texts,
      input_type: "search_document",
      truncate: "END",
    }),
  });
  const res = await bedrock.send(cmd);
  const body = JSON.parse(new TextDecoder().decode(res.body));
  return body.embeddings; // [[float, ...], ...]
}

async function main() {
  const files = (await fs.readdir(POSTS_DIR)).filter((f) => f.endsWith(".json"));
  console.log(`[embed] 글 ${files.length}개 임베딩 시작`);

  const docs = [];
  for (const f of files) {
    try {
      const raw = JSON.parse(await fs.readFile(path.join(POSTS_DIR, f), "utf8"));
      if (!raw.body) continue;
      const cleanBody = stripHtml(raw.body);
      const text = (raw.title + ". " + cleanBody).slice(0, 1800);
      // snippet — Lambda가 컨텍스트에 끼울 발췌 (본문 350자)
      const snippet = cleanBody.slice(0, 350);
      docs.push({
        logNo: raw.logNo,
        title: raw.title,
        addDate: raw.addDate,
        category: raw.categoryNo,
        text,
        snippet,
      });
    } catch {}
  }
  console.log(`[embed] body 있는 글 ${docs.length}개 처리`);

  const out = [];
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    let attempts = 0;
    while (true) {
      try {
        const vecs = await embedBatch(batch.map((d) => d.text));
        for (let j = 0; j < batch.length; j += 1) {
          out.push({
            logNo: batch[j].logNo,
            title: batch[j].title,
            addDate: batch[j].addDate,
            snippet: batch[j].snippet,
            vector: vecs[j].map((v) => Number(v.toFixed(5))),
          });
        }
        break;
      } catch (e) {
        attempts += 1;
        console.error(`[embed] batch ${i} 실패 (${attempts}회): ${e.message}`);
        if (attempts >= 4) throw e;
        await sleep(2000 * attempts);
      }
    }
    console.log(`[embed] ${i + batch.length}/${docs.length}`);
    await sleep(200); // rate limit 보호
  }

  await fs.writeFile(
    OUT_FILE,
    JSON.stringify({ model: MODEL_ID, generatedAt: new Date().toISOString(), count: out.length, items: out }),
  );
  const stats = await fs.stat(OUT_FILE);
  console.log(`[done] ${out.length}개 임베딩 저장 — ${(stats.size / 1024 / 1024).toFixed(1)}MB → ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
