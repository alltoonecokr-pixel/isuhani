"use client";

// 즉시 발행용 클라이언트 렌더러.
// 정적 HTML이 아직 없는(갓 발행된) 글, 또는 수정 직후 본문을 사이트와 동일하게 그린다.
// 정적 상세 페이지(app/[logNo]/page.tsx)의 본문 영역과 같은 레이아웃·sanitizeBody 사용.

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { sanitizeBody, extractSummaryPoints } from "@/lib/blog/sanitize";
import { ArticleToolbar } from "@/components/blog/ArticleToolbar";
import { SITE_URL } from "@/lib/site";

export type LivePost = {
  logNo: string;
  title: string;
  category: string;
  dateLabel: string;
  date?: string;
  body: string | null;
  ogImage?: string | null;
  externalUrl?: string;
};

export function LiveArticle({ post }: { post: LivePost }) {
  const postUrl = `${SITE_URL}/${post.logNo}`;
  const externalUrl = post.externalUrl || `https://blog.naver.com/isuhani/${post.logNo}`;
  const html = post.body ? sanitizeBody(post.body) : "";
  const points = html ? extractSummaryPoints(html) : [];

  return (
    <article className="bg-white">
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-0">
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
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1.5 hover:text-ink-900 transition-colors"
          >
            네이버 원문
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {html ? (
        <div className="max-w-4xl mx-auto px-5 md:px-8 pb-16 md:pb-24 naver-body article-leadin">
          <ArticleToolbar url={postUrl} title={post.title} summaryPoints={points} />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto px-5 md:px-8 pb-16 text-ink-500">
          <p>본문을 사이트 내에 표시하지 못했습니다. 원문 링크에서 확인해 주세요.</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-5 md:px-8">
        <div className="border-t border-ink-900" />
        <div className="py-5 flex items-center justify-between text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
          <span>이수한의원 · {post.dateLabel}</span>
          <Link href="/journal" className="hover:text-ink-900 transition-colors">
            ← 전체 목록으로
          </Link>
        </div>
      </div>
    </article>
  );
}
