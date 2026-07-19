import type { Metadata } from "next";
import { getAllPosts, getCategories, makeExcerpt } from "@/lib/blog";
import { BlogIndexClient, type IndexPost } from "@/components/blog/BlogIndexClient";
import { VIDEOS } from "@/data/videos";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "건강 저널 | 이수한의원",
  description:
    "이수한의원 원장님들이 직접 쓰는 건강 칼럼과 진료 사례 1,400여 편. 공진단 FAQ, 근감소증, 산후조리, 어린이 성장 등.",
  alternates: { canonical: `${SITE_URL}/journal` },
};

export default function JournalPage() {
  const posts: IndexPost[] = getAllPosts().map((p) => ({
    logNo: p.logNo,
    title: p.title,
    date: p.date,
    dateLabel: p.dateLabel,
    category: p.category,
    thumbnail: p.thumbnail,
    // 카드 발췌 — 목록에 통째로 실리니 짧게 (페이지 크기 ↓)
    excerpt: makeExcerpt(p, 100),
    hasBody: Boolean(p.body),
  }));

  return (
    <BlogIndexClient
      posts={posts}
      categories={getCategories()}
      videos={VIDEOS}
    />
  );
}
