"use client";

// 즉시 발행 폴백 페이지.
// 정적 HTML이 아직 없는(갓 발행된) 글 URL은 CloudFront 404 → 이 페이지가 200으로 서빙된다
// (원 URL 유지). URL의 logNo로 /live-posts/{logNo}.json 을 읽어 그 자리에서 렌더.

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveArticle, type LivePost } from "@/components/blog/LiveArticle";

type State =
  | { kind: "loading" }
  | { kind: "found"; post: LivePost }
  | { kind: "notfound" };

function logNoFromPath(): string | null {
  if (typeof window === "undefined") return null;
  // /223456/  ·  /223456  ·  /live/?logNo=223456 모두 대응
  const qp = new URLSearchParams(window.location.search).get("logNo");
  if (qp && /^\d+$/.test(qp)) return qp;
  const seg = window.location.pathname.split("/").filter(Boolean);
  const cand = seg[seg.length - 1] || "";
  return /^\d+$/.test(cand) ? cand : null;
}

export default function LivePostPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  // 이 폴백 경로는 색인 대상이 아님 — SEO는 빌드된 정적 상세 페이지가 담당
  useEffect(() => {
    if (typeof document === "undefined") return;
    let meta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex";
  }, []);

  useEffect(() => {
    const logNo = logNoFromPath();
    if (!logNo) {
      setState({ kind: "notfound" });
      return;
    }
    let alive = true;
    fetch(`/live-posts/${logNo}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((data: LivePost) => {
        if (!alive) return;
        if (typeof document !== "undefined" && data.title) document.title = `${data.title} | 이수한의원`;
        setState({ kind: "found", post: data });
      })
      .catch(() => alive && setState({ kind: "notfound" }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-16 pb-24">
        <div className="h-3 w-24 bg-ink-100 rounded animate-pulse" />
        <div className="mt-8 h-10 w-4/5 bg-ink-100 rounded animate-pulse" />
        <div className="mt-3 h-10 w-2/3 bg-ink-100 rounded animate-pulse" />
        <div className="mt-10 space-y-3">
          <div className="h-4 w-full bg-ink-100 rounded animate-pulse" />
          <div className="h-4 w-full bg-ink-100 rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-ink-100 rounded animate-pulse" />
        </div>
        <p className="mt-10 text-[13px] text-ink-400">갓 발행된 글을 불러오는 중…</p>
      </div>
    );
  }

  if (state.kind === "notfound") {
    return (
      <div className="max-w-4xl mx-auto px-5 md:px-8 pt-24 pb-24 text-center">
        <p className="font-serif text-2xl font-black text-ink-900">글을 찾을 수 없습니다</p>
        <p className="mt-3 text-ink-500">삭제되었거나 주소가 올바르지 않습니다.</p>
        <Link
          href="/journal"
          className="mt-8 inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white text-sm font-semibold hover:bg-herb-700 transition-colors"
        >
          건강 칼럼 전체 보기
        </Link>
      </div>
    );
  }

  return <LiveArticle post={state.post} />;
}
