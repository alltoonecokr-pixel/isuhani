import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { IndexPost } from "./BlogIndexClient";

const SERIES = [
  {
    keyword: "공진단",
    title: "공진단 가이드",
    sub: "복용법·보관·체질별 처방까지",
  },
  {
    keyword: "디스크",
    title: "디스크 · 추나",
    sub: "허리·목 통증의 한방 접근",
  },
  {
    keyword: "근감소",
    title: "근감소증과 노화",
    sub: "나이 들수록 강해지는 몸",
  },
  {
    keyword: "산후",
    title: "산후조리 골든타임",
    sub: "출산 후 100일의 한방 케어",
  },
];

export function SeriesSection({ posts }: { posts: IndexPost[] }) {
  // 시리즈별 글 수 + 대표 썸네일
  const series = SERIES.map((s) => {
    const matched = posts.filter((p) => p.title.includes(s.keyword) || p.excerpt.includes(s.keyword));
    return {
      ...s,
      count: matched.length,
      thumbnail: matched.find((p) => p.thumbnail)?.thumbnail || null,
    };
  }).filter((s) => s.count >= 3);

  if (series.length === 0) return null;

  return (
    <section className="mt-16 md:mt-20 pt-10 border-t border-ink-200">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2.5 mb-3">
          <span className="inline-block w-6 h-px bg-herb-700" aria-hidden />
          <span className="text-[12px] tracking-[0.3em] uppercase text-herb-700 font-bold">
            Series
          </span>
          <span className="inline-block w-6 h-px bg-herb-700" aria-hidden />
        </div>
        <h2 className="font-serif text-[26px] md:text-[34px] font-black tracking-[-0.025em] text-ink-900 leading-none">
          깊이 읽는 시리즈
        </h2>
        <div className="mt-3 text-sm text-ink-500">
          하나의 주제를 여러 글로 따라가며 깊게 살펴봅니다.
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {series.map((s) => (
          <Link
            key={s.keyword}
            href={`/?q=${encodeURIComponent(s.keyword)}`}
            className="group block"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-ink-900 mb-4 shadow-[0_12px_30px_-10px_rgba(26,20,16,0.25)] group-hover:shadow-[0_22px_50px_-12px_rgba(26,20,16,0.35)] transition-shadow duration-500">
              {s.thumbnail ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.thumbnail}
                    alt=""
                    aria-hidden
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-80 group-hover:scale-[1.03] transition-all duration-700 ease-out"
                    loading="lazy"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(5,51,48,0.4) 0%, rgba(10,14,18,0.85) 100%)",
                    }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-herb-700 to-ink-900" />
              )}
              <div className="relative h-full p-5 md:p-6 flex flex-col justify-between text-white">
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-herb-200">
                  Series · {String(series.indexOf(s) + 1).padStart(2, "0")}
                </div>
                <div>
                  <h3 className="font-serif text-[22px] md:text-[24px] font-black tracking-[-0.025em] leading-[1.2]">
                    {s.title}
                  </h3>
                  <div className="mt-2 text-[12px] text-white/80 leading-snug">{s.sub}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/70 tabular-nums">
                      {s.count}편
                    </span>
                    <ArrowUpRight size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
