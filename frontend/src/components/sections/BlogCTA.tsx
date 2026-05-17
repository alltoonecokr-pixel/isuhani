import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getAllPosts, makeExcerpt } from "@/lib/blog";

export function BlogCTA() {
  const recent = getAllPosts()
    .filter((p) => p.body && p.thumbnail)
    .slice(0, 3);

  return (
    <section id="blog" className="bg-white border-t border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 py-16 md:py-24">
        <header className="grid lg:grid-cols-12 gap-6 lg:gap-12 pb-8 md:pb-12 border-b border-ink-200">
          <div className="lg:col-span-7">
            <div className="eyebrow">Editorial · 건강 칼럼</div>
            <h2 className="mt-3 font-serif text-3xl md:text-[44px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
              건강 칼럼 · 진료 사례
              <br />
              휴진 안내
            </h2>
          </div>
          <p className="lg:col-span-5 text-base md:text-lg text-ink-700 leading-[1.78] self-end">
            노화와 근감소증, 공진단 FAQ, 산후조리 골든타임 등
            원장님들이 직접 쓰는 건강 칼럼을 사이트에서 그대로 보실 수 있습니다.
          </p>
        </header>

        {recent.length > 0 && (
          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12 mt-12 md:mt-16">
            {recent.map((post) => (
              <Link key={post.logNo} href={`/${post.logNo}`} className="group block">
                <div className="aspect-[4/3] overflow-hidden border border-ink-200 mb-5 bg-ink-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.thumbnail!}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="chip">{post.category}</div>
                <h3 className="mt-3 font-serif text-[22px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.2] line-clamp-3">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm text-ink-700 leading-[1.78] line-clamp-3">
                  {makeExcerpt(post, 110)}
                </p>
                <div className="mt-4 text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
                  {post.dateLabel}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-14 pt-8 border-t border-ink-200 flex items-baseline justify-between">
          <span className="text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
            전체 {getAllPosts().length}개의 글
          </span>
          <Link
            href="/journal"
            className="group inline-flex items-center gap-2 text-sm font-semibold tracking-[0.08em] uppercase border-b border-ink-900 pb-1 text-ink-900 hover:text-herb-700 hover:border-herb-700 transition-colors"
          >
            <span>건강 저널 전체 보기</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
