"use client";

// 상세 페이지 본문의 stale-while-revalidate 섬.
// 빌드된 정적 본문(initialHtml)을 즉시 표시하고, 마운트 후 /live-posts/{logNo}.json 을 확인해
// 본문이 더 최신이면(수정 발행 직후) 그 자리에서 교체한다. SEO는 정적 HTML이 그대로 담당.

import { useEffect, useState } from "react";
import { sanitizeBody, extractSummaryPoints } from "@/lib/blog/sanitize";
import { ArticleToolbar } from "@/components/blog/ArticleToolbar";

type Props = {
  logNo: string;
  initialHtml: string;
  initialPoints: string[];
  title: string;
  postUrl: string;
};

export function ArticleBodyLive({ logNo, initialHtml, initialPoints, title, postUrl }: Props) {
  const [html, setHtml] = useState(initialHtml);
  const [points, setPoints] = useState(initialPoints);

  useEffect(() => {
    let alive = true;
    fetch(`/live-posts/${logNo}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { body?: string | null } | null) => {
        if (!alive || !data?.body) return;
        const liveHtml = sanitizeBody(data.body);
        if (liveHtml && liveHtml !== initialHtml) {
          setHtml(liveHtml);
          const p = extractSummaryPoints(liveHtml);
          if (p.length >= 2) setPoints(p);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [logNo, initialHtml]);

  return (
    <>
      <ArticleToolbar url={postUrl} title={title} summaryPoints={points} />
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
