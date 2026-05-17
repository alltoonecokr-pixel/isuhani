import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Phone } from "lucide-react";
import { getAllPosts, makeExcerpt } from "@/lib/blog";
import { TREATMENTS, TREATMENT_LIST } from "@/data/treatments";

export function generateStaticParams() {
  return TREATMENT_LIST.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = TREATMENTS[params.slug];
  if (!t) return { title: "이수한의원" };
  return {
    title: `${t.name} — 이수한의원`,
    description: t.description,
  };
}

export default function TreatmentPage({ params }: { params: { slug: string } }) {
  const t = TREATMENTS[params.slug];
  if (!t) notFound();

  // 관련 글 추천
  const relatedPosts = getAllPosts()
    .filter((p) => t.categoryMatch.includes(p.category))
    .slice(0, 6);

  // 다른 영역 — 사이드 추천
  const otherTreatments = TREATMENT_LIST.filter((x) => x.slug !== t.slug).slice(0, 3);

  return (
    <article className="bg-white">
      <div className="max-w-3xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-12">
        <Link
          href="/clinic#services"
          className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.2em] uppercase text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={14} />
          진료 영역 전체
        </Link>

        <header className="mt-8 md:mt-10 pb-10 border-b border-ink-200">
          <div className="text-[12px] tracking-[0.3em] uppercase text-herb-700 font-bold mb-3">
            Treatment · 진료 영역
          </div>
          <h1 className="font-serif text-[32px] sm:text-[40px] md:text-[52px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
            {t.name}
          </h1>
          <div className="mt-3 text-base md:text-lg text-ink-500">{t.tagline}</div>
        </header>

        <p className="mt-8 text-[16px] md:text-[17px] text-ink-700 leading-[1.85]">
          {t.description}
        </p>

        {/* 진료 방법 */}
        <section className="mt-12 pt-10 border-t border-ink-200">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="font-serif text-[12px] tracking-[0.2em] text-ink-400 tabular-nums">01</span>
            <h2 className="font-serif text-[24px] md:text-[28px] font-black tracking-[-0.025em] text-ink-900">
              주요 진료 방법
            </h2>
          </div>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-6">
            {t.methods.map((m) => (
              <li key={m.title} className="border border-ink-200 p-5">
                <h3 className="font-serif text-[18px] md:text-[20px] font-black tracking-[-0.02em] text-ink-900 leading-tight">
                  {m.title}
                </h3>
                <p className="mt-2 text-[14px] text-ink-700 leading-[1.78]">{m.desc}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 관련 글 */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-10 border-t border-ink-200">
            <div className="flex items-baseline justify-between mb-6">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-[12px] tracking-[0.2em] text-ink-400 tabular-nums">02</span>
                <h2 className="font-serif text-[24px] md:text-[28px] font-black tracking-[-0.025em] text-ink-900">
                  관련 칼럼
                </h2>
              </div>
              <Link
                href={`/?cat=${encodeURIComponent(t.categoryMatch[0])}`}
                className="text-[11px] tracking-[0.2em] uppercase text-herb-700 font-semibold hover:text-ink-900 transition-colors"
              >
                전체 보기 →
              </Link>
            </div>
            <ul className="divide-y divide-ink-200 border-y border-ink-200">
              {relatedPosts.map((p) => (
                <li key={p.logNo}>
                  <Link
                    href={`/${p.logNo}`}
                    className="group flex gap-4 py-4 items-start"
                  >
                    {p.thumbnail && (
                      <div className="w-24 h-16 shrink-0 overflow-hidden bg-ink-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-[16px] md:text-[17px] font-black tracking-[-0.02em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.3] line-clamp-2">
                        {p.title}
                      </h3>
                      <p className="mt-1.5 text-[13px] text-ink-700 leading-[1.65] line-clamp-2">
                        {makeExcerpt(p, 100)}
                      </p>
                      <div className="mt-1.5 text-[11px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
                        {p.dateLabel}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section className="mt-14 pt-10 border-t border-ink-200">
          <div className="bg-ink-900 text-white p-8 md:p-10">
            <div className="text-[12px] tracking-[0.3em] uppercase text-white/70 font-bold mb-3">
              진료 예약 / 문의
            </div>
            <h2 className="font-serif text-[24px] md:text-[32px] font-black tracking-[-0.025em] leading-tight">
              {t.name} 진료를 받고 싶으신가요?
            </h2>
            <p className="mt-3 text-white/80 leading-[1.78]">
              전화 또는 직접 방문으로 예약 가능합니다. 평일 야간진료(20시) · 주말 진료.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-ink-900 text-sm font-semibold tabular-nums hover:bg-herb-200 transition-colors"
              >
                <Phone size={16} />
                02-584-1075
              </a>
              <Link
                href="/visit-guide"
                className="inline-flex items-center gap-2 px-5 py-3 border border-white/70 text-white text-sm font-semibold hover:bg-white hover:text-ink-900 transition-colors"
              >
                처음 방문 가이드 →
              </Link>
            </div>
          </div>
        </section>

        {/* 다른 진료 영역 */}
        <section className="mt-14 pt-10 border-t border-ink-200">
          <div className="text-[12px] tracking-[0.2em] uppercase text-ink-500 font-bold mb-5">
            다른 진료 영역
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {otherTreatments.map((x) => (
              <Link
                key={x.slug}
                href={`/treatment/${x.slug}`}
                className="group block p-5 border border-ink-200 hover:border-ink-900 transition-colors"
              >
                <div className="font-serif text-[17px] font-black tracking-[-0.02em] text-ink-900 group-hover:text-herb-700 transition-colors leading-tight">
                  {x.name}
                </div>
                <div className="mt-1 text-[12px] text-ink-500">{x.tagline}</div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
