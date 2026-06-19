"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";

type SuggestPost = {
  logNo: string;
  title: string;
  category: string;
  dateLabel: string;
};

const POPULAR_KEYWORDS = [
  "공진단",
  "근감소증",
  "산후조리",
  "추나요법",
  "어린이 성장",
  "디스크",
  "여드름",
  "갱년기",
];

export function BlogSearchInline({
  initial = "",
  recent = [],
}: {
  initial?: string;
  recent?: SuggestPost[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(initial);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    if (v) router.push(`/journal?q=${encodeURIComponent(v)}`);
    else router.push("/journal");
    setOpen(false);
  };

  const trigger = (kw: string) => {
    router.push(`/journal?q=${encodeURIComponent(kw)}`);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="블로그 검색"
        className="inline-flex items-center justify-center w-10 h-10 text-ink-500 hover:text-ink-900 transition-colors"
      >
        <Search size={16} strokeWidth={2} />
      </button>

      {open && (
        <>
          {/* 백드롭 — 살짝 어둡게 + 블러. 클릭 시 닫힘 */}
          <div
            className="fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-[2px] animate-fadein"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* 컴팩트 검색 패널 — 헤더 아래 중앙 정렬 (모바일은 거의 풀폭) */}
          <div
            role="dialog"
            aria-label="블로그 검색"
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[min(560px,calc(100vw-24px))] max-h-[min(560px,calc(100vh-120px))] bg-white rounded-3xl shadow-[0_30px_80px_-20px_rgba(26,20,16,0.35)] border border-ink-100 overflow-hidden flex flex-col animate-fadein-slow"
          >
            {/* 검색 입력 */}
            <div className="border-b border-ink-100 bg-white">
              <div className="px-5 md:px-6 h-14 flex items-center gap-3">
                <form onSubmit={submit} className="flex-1 flex items-center gap-3" role="search">
                  <Search size={17} className="text-ink-500 shrink-0" strokeWidth={2} />
                  <input
                    ref={inputRef}
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="궁금한 것 — 제목, 본문에서 찾아드려요"
                    aria-label="블로그 검색"
                    className="flex-1 bg-transparent outline-none border-0 text-[15px] text-ink-900 placeholder:text-ink-400"
                  />
                </form>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="검색 닫기"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-ink-500 hover:bg-paper-200 hover:text-ink-900 transition-colors"
                >
                  <X size={18} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* 추천 영역 — 스크롤 가능 */}
            <div className="overflow-y-auto px-5 md:px-6 py-5 space-y-6">
              {/* 자주 찾는 키워드 */}
              <section>
                <h3 className="text-[10.5px] tracking-[0.2em] uppercase text-ink-400 font-bold mb-3">
                  자주 찾는 키워드
                </h3>
                <ul className="flex flex-wrap gap-1.5">
                  {POPULAR_KEYWORDS.map((kw) => (
                    <li key={kw}>
                      <button
                        type="button"
                        onClick={() => trigger(kw)}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-paper-200 hover:bg-herb-700 text-[12.5px] font-medium text-ink-700 hover:text-white transition-colors"
                      >
                        {kw}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 최근 발행 */}
              {recent.length > 0 && (
                <section>
                  <h3 className="text-[10.5px] tracking-[0.2em] uppercase text-ink-400 font-bold mb-3">
                    최근 발행
                  </h3>
                  <ul className="space-y-1">
                    {recent.slice(0, 5).map((p) => (
                      <li key={p.logNo}>
                        <Link
                          href={`/${p.logNo}`}
                          onClick={() => setOpen(false)}
                          className="flex items-baseline justify-between gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-paper-100 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] tracking-[0.15em] uppercase text-herb-700 font-bold mb-0.5">
                              {p.category}
                            </div>
                            <div className="text-[13.5px] text-ink-900 truncate">
                              {p.title}
                            </div>
                          </div>
                          <span className="shrink-0 text-[11px] text-ink-400 tabular-nums">
                            {p.dateLabel}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
