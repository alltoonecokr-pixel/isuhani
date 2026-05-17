import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAllPosts, getCategories, getPostByLogNo, makeExcerpt, sanitizeBody } from "@/lib/blog";
import { BlogCategoryBar } from "@/components/blog/BlogCategoryBar";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ logNo: p.logNo }));
}

export function generateMetadata({ params }: { params: { logNo: string } }): Metadata {
  const post = getPostByLogNo(params.logNo);
  if (!post) return { title: "이수한의원" };
  return {
    title: `${post.title} — 이수한의원`,
    description: makeExcerpt(post, 160),
    openGraph: {
      title: post.title,
      description: makeExcerpt(post, 160),
      images: post.ogImage ? [post.ogImage] : undefined,
    },
  };
}

export default function PostPage({ params }: { params: { logNo: string } }) {
  // 숫자가 아닌 경로(/clinic 등)는 정적 라우트가 우선이지만, 안전 가드
  if (!/^\d+$/.test(params.logNo)) notFound();

  const post = getPostByLogNo(params.logNo);
  if (!post) notFound();

  const related = getAllPosts()
    .filter((p) => p.category === post.category && p.logNo !== post.logNo)
    .slice(0, 4);

  return (
    <>
      <BlogCategoryBar active={post.category} categories={getCategories()} />
      <article className="bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-10">
          <div className="flex items-center justify-between text-[12px] tracking-[0.2em] uppercase">
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 text-ink-500 hover:text-ink-900 transition-colors"
            >
              <ArrowLeft size={14} />
              전체 목록
            </Link>
            <Link
              href={`/journal?cat=${encodeURIComponent(post.category)}`}
              className="text-herb-700 font-semibold hover:text-ink-900 transition-colors"
            >
              {post.category}
            </Link>
          </div>

          <h1 className="mt-8 md:mt-10 font-serif text-[30px] sm:text-[36px] md:text-[44px] font-black tracking-[-0.02em] text-ink-900 leading-[1.22]">
            {post.title}
          </h1>

          <div className="mt-8 flex items-center gap-3 border-y border-ink-200 py-3.5 text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
            <span className="font-semibold text-ink-700">By 이수한의원</span>
            <span className="text-ink-300">·</span>
            <span>{post.dateLabel}</span>
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 hover:text-ink-900 transition-colors"
            >
              네이버 원문
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {post.body ? (
          <div className="max-w-3xl mx-auto px-5 md:px-8 pb-16 md:pb-24 naver-body article-leadin">
            <div dangerouslySetInnerHTML={{ __html: sanitizeBody(post.body) }} />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto px-5 md:px-8 pb-16 text-ink-500">
            <p>본문을 사이트 내에 표시하지 못했습니다. 원문 링크에서 확인해 주세요.</p>
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white text-sm font-semibold hover:bg-herb-700"
            >
              <ExternalLink size={16} />
              네이버 블로그에서 보기
            </a>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-5 md:px-8">
          <div className="border-t border-ink-900" />
          <div className="py-5 flex items-center justify-between text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
            <span>이수한의원 · {post.dateLabel}</span>
            <Link
              href="/journal"
              className="hover:text-ink-900 transition-colors"
            >
              ← 전체 목록으로
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="border-t border-ink-200 bg-ink-50">
            <div className="max-w-container mx-auto px-4 md:px-8 py-14 md:py-16">
              <div className="flex items-baseline justify-between border-b-2 border-ink-900 pb-3 mb-8">
                <div className="eyebrow">Related · 같은 카테고리</div>
                <Link
                  href={`/?cat=${encodeURIComponent(post.category)}`}
                  className="text-[12px] tracking-[0.2em] uppercase text-ink-500 hover:text-ink-900 transition-colors"
                >
                  {post.category} 더보기 →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {related.map((p) => (
                  <Link key={p.logNo} href={`/${p.logNo}`} className="group block">
                    {p.thumbnail ? (
                      <div className="aspect-[4/3] overflow-hidden mb-3 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] mb-3 flex items-center justify-center bg-white">
                        <span className="font-serif text-5xl font-black text-ink-200">醫</span>
                      </div>
                    )}
                    <h4 className="font-serif text-[17px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors line-clamp-3 leading-[1.25]">
                      {p.title}
                    </h4>
                    <div className="mt-2 text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
                      {p.dateLabel}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
