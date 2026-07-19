// 건강 칼럼 RSS 피드 — 검색엔진·AI 크롤러·리더 앱의 신규 글 디스커버리용
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function GET() {
  const posts = getAllPosts().slice(0, 50);
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/${p.logNo}/`;
      const pub = p.date ? new Date(`${p.date}T05:00:00Z`).toUTCString() : "";
      return [
        "<item>",
        `<title>${esc(p.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        pub && `<pubDate>${pub}</pubDate>`,
        `<category>${esc(p.category)}</category>`,
        p.ogDesc && `<description>${esc(p.ogDesc)}</description>`,
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>이수한의원 건강 칼럼</title>
<link>${SITE_URL}/journal</link>
<description>서울 동작구 사당동 이수한의원 원장 3인이 쓰는 건강 칼럼 — 사상체질, 추나, 소아성장, 부인과, 공진단</description>
<language>ko</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
