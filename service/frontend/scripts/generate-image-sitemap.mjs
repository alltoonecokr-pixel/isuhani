// 빌드 후 out/ 폴더에 image-sitemap.xml 생성
// Next.js MetadataRoute가 image namespace를 미지원하므로 별도 생성

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, "../src/data/blog/posts");
const OUT_FILE = path.join(__dirname, "../out/image-sitemap.xml");
const SITE_URL = "https://isuclinic.co.kr";
const NAVER_ICON = ["static/blog/icon", "og_270x270"];

const isRealImage = (url) =>
  url && !NAVER_ICON.some((p) => url.includes(p));

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => {
    try { return JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), "utf8")); }
    catch { return null; }
  })
  .filter(Boolean);

const entries = posts
  .filter((p) => isRealImage(p.meta?.ogImage))
  .map((p) => {
    const logNo = p.logNo;
    const img = p.meta.ogImage;
    const title = (p.title || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return [
      `  <url>`,
      `    <loc>${SITE_URL}/${logNo}</loc>`,
      `    <image:image>`,
      `      <image:loc>${img}</image:loc>`,
      `      <image:title>${title}</image:title>`,
      `    </image:image>`,
      `  </url>`,
    ].join("\n");
  });

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset`,
  `  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
  `  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
  ...entries,
  `</urlset>`,
].join("\n");

fs.writeFileSync(OUT_FILE, xml, "utf8");
console.log(`image-sitemap.xml 생성 완료: ${entries.length}개 이미지 URL`);
