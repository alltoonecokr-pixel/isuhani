"use client";

// 404(=정적 HTML 없음) 응답 시 CloudFront가 서빙하는 404.html의 본체.
// URL이 글 번호(logNo)면 /live-posts/{logNo}.json 을 읽어 갓 발행된 글을 즉시 렌더하고,
// 아니면 일반 404 안내를 보여준다. (HTTP 상태는 404 유지 → 색인 안 됨, 정적 빌드가 SEO 담당)

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveArticle, type LivePost } from "@/components/blog/LiveArticle";

type State =
  | { kind: "loading" }
  | { kind: "found"; post: LivePost }
  | { kind: "notfound" };

function logNoFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const qp = new URLSearchParams(window.location.search).get("logNo");
  if (qp && /^\d+$/.test(qp)) return qp;
  const seg = window.location.pathname.split("/").filter(Boolean);
  const cand = seg[seg.length - 1] || "";
  return /^\d+$/.test(cand) ? cand : null;
}

export function LiveFallback() {
  const [state, setState] = useState<State>({ kind: "loading" });

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

  if (state.kind === "found") return <LiveArticle post={state.post} />;

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
        <p className="mt-10 text-[13px] text-ink-400">글을 불러오는 중…</p>
      </div>
    );
  }

  // notfound
  return (
    <section className="bg-white">
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-24 md:py-32 text-center">
        <div className="text-[12px] tracking-[0.3em] uppercase text-herb-700 font-bold mb-4">
          404 · Page Not Found
        </div>
        <h1 className="font-serif text-4xl md:text-[56px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
          이 페이지를
          <br />
          찾을 수 없습니다.
        </h1>
        <p className="mt-6 text-base md:text-lg text-ink-700 leading-[1.78]">
          주소가 변경되었거나 글이 다른 카테고리로 이동했을 수 있습니다.
          <br />
          아래에서 다른 글을 찾아보세요.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white text-sm font-semibold hover:bg-herb-700 transition-colors"
          >
            건강 칼럼 전체 보기
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink-900 text-ink-900 text-sm font-semibold hover:bg-ink-900 hover:text-white transition-colors"
          >
            병원 소개
          </Link>
        </div>
        <div className="mt-12 pt-8 border-t border-ink-200 text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
          이수한의원 · 매일의 건강 이야기 · Since 1986
        </div>
      </div>
    </section>
  );
}
