#!/usr/bin/env node
// 이수한의원 블로그 크롤러
// 1) 전체 글 목록 페이지에서 logNo + 제목 + 날짜 수집
// 2) 각 PostView 페이지에서 se-main-container 본문 + 카테고리 + 태그 추출
// 출력: frontend/src/data/blog/posts/{logNo}.json + index.json

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../frontend/src/data/blog");
const POSTS_DIR = path.join(OUT_DIR, "posts");

const BLOG_ID = "isuhani";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
const DELAY_MS = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA, "Referer": "https://blog.naver.com/" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return await res.text();
}

// 목록 페이지 — TopListJsonp 엔드포인트가 더 깔끔
// https://blog.naver.com/PostTitleListAsync.naver?blogId=isuhani&viewdate=&currentPage=1&categoryNo=0&parentCategoryNo=0&countPerPage=30
async function fetchPostList(page) {
  const url = `https://blog.naver.com/PostTitleListAsync.naver?blogId=${BLOG_ID}&viewdate=&currentPage=${page}&categoryNo=0&parentCategoryNo=0&countPerPage=30`;
  const text = await fetchHtml(url);
  // 일부 글 제목에 raw control char가 섞여 JSON.parse가 실패하는 경우가 있음 → 정규식으로 직접 추출
  const items = [];
  // postList:[ {...},{...} ] 안의 각 객체에서 필드 뽑기
  const objRe = /\{[^{}]*?"logNo":"(\d+)"[^{}]*?\}/g;
  const fieldRe = (key) => new RegExp(`"${key}":"([^"]*)"`);
  let m;
  while ((m = objRe.exec(text))) {
    const obj = m[0];
    const logNo = m[1];
    const titleRaw = (obj.match(fieldRe("title")) || [])[1] || "";
    const addDate = (obj.match(fieldRe("addDate")) || [])[1] || "";
    const categoryNo = (obj.match(fieldRe("categoryNo")) || [])[1] || "";
    const parentCategoryNo = (obj.match(fieldRe("parentCategoryNo")) || [])[1] || "";
    let title = titleRaw;
    try { title = decodeURIComponent(titleRaw.replace(/\+/g, " ")); } catch {}
    items.push({ logNo, title, addDate, categoryNo, parentCategoryNo });
  }
  return { postList: items };
}

function extractFromMainList(html) {
  // /PostList.naver의 HTML에서 logNo 추출 fallback
  const re = /logNo=(\d+)[^"]*"[^>]*class="[^"]*pcol2[^"]*">([^<]+)</g;
  const items = [];
  let m;
  while ((m = re.exec(html))) {
    items.push({ logNo: m[1], title: m[2].trim() });
  }
  return items;
}

async function collectAllPostMetas() {
  console.log("[index] 전체 글 목록 수집 시작...");
  const all = new Map();
  let page = 1;
  while (true) {
    let data;
    try {
      data = await fetchPostList(page);
    } catch (e) {
      console.error(`[index] page ${page} 실패:`, e.message);
      break;
    }
    const list = data?.postList || [];
    if (!list.length) break;
    for (const p of list) {
      all.set(String(p.logNo), {
        logNo: String(p.logNo),
        title: p.title,
        addDate: p.addDate,
        categoryNo: p.categoryNo,
        parentCategoryNo: p.parentCategoryNo,
      });
    }
    console.log(`[index] page ${page}: ${list.length}개 (누적 ${all.size})`);
    if (list.length < 30) break;
    page += 1;
    await sleep(DELAY_MS);
    if (page > 200) break;
  }
  return Array.from(all.values());
}

function pickBlock(html, openMarker, closeNeedle) {
  const start = html.indexOf(openMarker);
  if (start < 0) return null;
  // depth-aware tag extraction for div
  const tagOpen = "<div";
  const tagClose = "</div>";
  let i = html.indexOf(">", start) + 1;
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
  return html.slice(start, i);
}

function extractMeta(html) {
  // og:title, og:description, og:image
  const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1];
  const ogDesc = (html.match(/<meta property="og:description" content="([^"]*)"/) || [])[1];
  const ogImage = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];
  const date = (html.match(/<span class="se_publishDate[^"]*">([^<]+)<\/span>/) || [])[1]
    || (html.match(/"publishDate":"([^"]+)"/) || [])[1]
    || null;
  const category = (html.match(/<a class="blog2_categorylist_url[^"]*"[^>]*>([^<]+)</) || [])[1] || null;
  return { ogTitle, ogDesc, ogImage, date, category };
}

function extractImages(bodyHtml) {
  const re = /<img[^>]+src="([^"]+)"/g;
  const set = new Set();
  let m;
  while ((m = re.exec(bodyHtml))) {
    set.add(m[1]);
  }
  return Array.from(set);
}

async function fetchPostBody(logNo) {
  const url = `https://blog.naver.com/PostView.naver?blogId=${BLOG_ID}&logNo=${logNo}`;
  const html = await fetchHtml(url);
  const body = pickBlock(html, '<div class="se-main-container"');
  const meta = extractMeta(html);
  const images = body ? extractImages(body) : [];
  return { url, html_size: html.length, body, meta, images };
}

async function main() {
  await fs.mkdir(POSTS_DIR, { recursive: true });

  // 1) 인덱스 수집
  const metas = await collectAllPostMetas();
  await fs.writeFile(
    path.join(OUT_DIR, "index.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), total: metas.length, posts: metas }, null, 2),
  );
  console.log(`[index] 총 ${metas.length}개 글 인덱스 저장 완료`);

  // 2) 본문 크롤링 (이미 받은 건 스킵)
  const existing = new Set((await fs.readdir(POSTS_DIR)).map((f) => f.replace(/\.json$/, "")));
  let ok = 0, fail = 0, skip = 0;
  for (let i = 0; i < metas.length; i++) {
    const m = metas[i];
    if (existing.has(m.logNo)) { skip += 1; continue; }
    try {
      const data = await fetchPostBody(m.logNo);
      await fs.writeFile(
        path.join(POSTS_DIR, `${m.logNo}.json`),
        JSON.stringify({ ...m, ...data }, null, 2),
      );
      ok += 1;
    } catch (e) {
      fail += 1;
      console.error(`[post] ${m.logNo} 실패: ${e.message}`);
    }
    if ((i + 1) % 25 === 0) {
      console.log(`[post] ${i + 1}/${metas.length} (ok=${ok} skip=${skip} fail=${fail})`);
    }
    await sleep(DELAY_MS);
  }
  console.log(`[done] 본문 크롤링 완료 — ok=${ok} skip=${skip} fail=${fail} / total=${metas.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
