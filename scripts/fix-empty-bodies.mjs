#!/usr/bin/env node
// body가 null인 옛글들을 다시 받아 보강된 selector로 본문 추출
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.resolve(__dirname, "../frontend/src/data/blog/posts");

const BLOG_ID = "isuhani";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const DELAY_MS = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pickByDivIndex(html, startIdx) {
  if (startIdx < 0) return null;
  const tagOpen = "<div";
  const tagClose = "</div>";
  let i = html.indexOf(">", startIdx) + 1;
  let depth = 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf(tagOpen, i);
    const nextClose = html.indexOf(tagClose, i);
    if (nextClose < 0) break;
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + tagOpen.length;
    } else {
      depth -= 1;
      i = nextClose + tagClose.length;
    }
  }
  return html.slice(startIdx, i);
}

function extractBody(html, logNo) {
  // 우선순위: SmartEditor One → SmartEditor 2 → legacy postViewArea
  const candidates = [
    { marker: '<div class="se-main-container"', kind: "se-one" },
    { marker: `<div id="post-view${logNo}"`, kind: "post-view" },
    { marker: '<div class="se_doc_viewer ', kind: "se-two" },
    { marker: '<div id="postViewArea"', kind: "post-area" },
  ];
  for (const c of candidates) {
    const idx = html.indexOf(c.marker);
    if (idx >= 0) {
      const block = pickByDivIndex(html, idx);
      if (block && block.length > 200) return { body: block, kind: c.kind };
    }
  }
  return { body: null, kind: null };
}

function extractImages(bodyHtml) {
  if (!bodyHtml) return [];
  const re = /<img[^>]+src="([^"]+)"/g;
  const set = new Set();
  let m;
  while ((m = re.exec(bodyHtml))) set.add(m[1]);
  return Array.from(set);
}

function extractMetaFromHtml(html) {
  const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1];
  const ogDesc = (html.match(/<meta property="og:description" content="([^"]*)"/) || [])[1];
  const ogImage = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
  // 카테고리: PostView에 "categoryName":"X" 또는 카테고리 a tag 다양
  let category =
    (html.match(/"categoryName":"([^"]+)"/) || [])[1] ||
    (html.match(/<span class="blog2_categorylist[^"]*">[^<]*<a[^>]*>([^<]+)</) || [])[1] ||
    (html.match(/var sCategoryName\s*=\s*"([^"]+)"/) || [])[1] ||
    null;
  if (category) {
    try { category = decodeURIComponent(category.replace(/\+/g, " ")); } catch {}
  }
  // 발행일
  const date =
    (html.match(/<span class="se_publishDate[^"]*">([^<]+)<\/span>/) || [])[1] ||
    (html.match(/"publishDate":"([^"]+)"/) || [])[1] ||
    (html.match(/<p class="date[^"]*">([^<]+)<\/p>/) || [])[1] ||
    null;
  return { ogTitle, ogDesc, ogImage, category, date };
}

async function main() {
  const files = await fs.readdir(POSTS_DIR);
  const targets = [];
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const obj = JSON.parse(await fs.readFile(path.join(POSTS_DIR, f), "utf8"));
    if (!obj.body) targets.push(obj);
  }
  console.log(`[fix] body null 글 수: ${targets.length}`);

  let ok = 0, stillEmpty = 0, fail = 0;
  for (let i = 0; i < targets.length; i++) {
    const m = targets[i];
    try {
      const url = `https://blog.naver.com/PostView.naver?blogId=${BLOG_ID}&logNo=${m.logNo}`;
      const res = await fetch(url, { headers: { "User-Agent": UA, "Referer": "https://blog.naver.com/" } });
      const html = await res.text();
      const { body, kind } = extractBody(html, m.logNo);
      const images = extractImages(body);
      const meta = extractMetaFromHtml(html);
      const merged = { ...m, body, body_kind: kind, images, html_size: html.length, meta };
      await fs.writeFile(path.join(POSTS_DIR, `${m.logNo}.json`), JSON.stringify(merged, null, 2));
      if (body) ok += 1; else stillEmpty += 1;
    } catch (e) {
      fail += 1;
      console.error(`[fix] ${m.logNo} 실패: ${e.message}`);
    }
    if ((i + 1) % 25 === 0) {
      console.log(`[fix] ${i + 1}/${targets.length} (ok=${ok} stillEmpty=${stillEmpty} fail=${fail})`);
    }
    await sleep(DELAY_MS);
  }
  console.log(`[done] fix 완료 — ok=${ok} stillEmpty=${stillEmpty} fail=${fail}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
