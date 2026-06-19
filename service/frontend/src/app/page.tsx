import type { Metadata } from "next";
import { getAllPosts, getCategories, makeExcerpt } from "@/lib/blog";
import { BlogIndexClient, type IndexPost } from "@/components/blog/BlogIndexClient";
import { VIDEOS } from "@/data/videos";
import { SITE_URL } from "@/lib/site";

// 홈(첫 화면) = 건강 저널. 제목·설명·OG는 layout 기본값 상속, canonical만 명시.
export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};
export default function HomePage() {
  const posts: IndexPost[] = getAllPosts().map((p) => ({
    logNo: p.logNo,
    title: p.title,
    date: p.date,
    dateLabel: p.dateLabel,
    category: p.category,
    thumbnail: p.thumbnail,
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
