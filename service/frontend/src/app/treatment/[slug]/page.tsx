import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Phone, ChevronRight } from "lucide-react";
import { getAllPosts, makeExcerpt } from "@/lib/blog";
import { TREATMENTS, TREATMENT_LIST } from "@/data/treatments";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return TREATMENT_LIST.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = TREATMENTS[params.slug];
  if (!t) return { title: "이수한의원" };
  const url = `${SITE_URL}/treatment/${params.slug}`;
  const keywords = [t.name, t.tagline, "이수한의원", "한의원", "서울 동작구", "남성역", ...t.methods.map((m) => m.title)];
  return {
    title: `${t.name} — 이수한의원`,
    description: t.description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      url,
      type: "website",
      title: `${t.name} — 이수한의원`,
      description: t.description,
    },
  };
}

export default function TreatmentPage({ params }: { params: { slug: string } }) {
  const t = TREATMENTS[params.slug];
  if (!t) notFound();

  const url = `${SITE_URL}/treatment/${params.slug}`;
  const therapyJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalTherapy",
    name: t.name,
    alternateName: t.tagline,
    description: t.description,
    url,
    medicineSystem: "TraditionalChineseMedicine",
    relevantSpecialty: "TraditionalChineseMedicine",
    recognizingAuthority: {
      "@type": "MedicalOrganization",
      name: "대한한의사협회",
    },
    potentialAction: {
      "@type": "ReserveAction",
      name: "전화 예약",
      target: "tel:0285841075",
    },
    provider: {
      "@type": "MedicalClinic",
      "@id": SITE_URL,
      name: "이수한의원",
      telephone: "+82-2-584-1075",
      url: SITE_URL,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${t.name} 진료 항목`,
      itemListElement: t.methods.map((m, i) => ({
        "@type": "Offer",
        position: i + 1,
        name: m.title,
        description: m.desc,
        offeredBy: { "@type": "MedicalClinic", "@id": SITE_URL },
      })),
    },
  };

  const relatedPosts = getAllPosts()
    .filter((p) => t.categoryMatch.includes(p.category))
    .slice(0, 6);

  const otherTreatments = TREATMENT_LIST.filter((x) => x.slug !== params.slug).slice(0, 5);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(therapyJsonLd) }}
      />
    <article className="bg-white">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16">

        {/* 뒤로 가기 */}
        <Link
          href="/home#treatments"
          className="inline-flex items-center gap-1.5 text-[12px] tracking-[0.2em] uppercase text-ink-500 hover:text-ink-900 transition-colors"
        >
          <ArrowLeft size={14} />
          진료 영역 전체
        </Link>

        {/* ── 2-컬럼 그리드: 본문 (1fr) + 사이드바 (260px) ── */}
        <div className="mt-8 lg:grid lg:grid-cols-[1fr_260px] lg:gap-12 lg:items-start">

          {/* LEFT: 본문 */}
          <div>
            <header className="pb-10 border-b border-ink-200">
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
              <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-5">
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
                      <Link href={`/${p.logNo}`} className="group flex gap-4 py-4 items-start">
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

            {/* 모바일 전용: 예약 CTA + 다른 진료 영역 */}
            <div className="lg:hidden">
              <MobileCta name={t.name} />
              <MobileOtherTreatments treatments={otherTreatments} />
            </div>
          </div>

          {/* RIGHT: sticky 사이드바 (lg+ only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">

              {/* 예약 CTA 카드 */}
              <div className="bg-ink-900 text-white p-6">
                <div className="text-[10px] tracking-[0.3em] uppercase text-white/60 font-bold mb-3">
                  진료 예약 / 문의
                </div>
                <p className="font-serif text-[18px] font-black tracking-[-0.02em] leading-snug">
                  {t.name} 진료를
                  <br />
                  받고 싶으신가요?
                </p>
                <p className="mt-2 text-[13px] text-white/75 leading-[1.65]">
                  평일 야간(20시) · 주말 진료.
                  <br />
                  전화 또는 방문 예약.
                </p>
                <a
                  href="tel:0285841075"
                  className="mt-4 flex items-center gap-2 px-4 py-3 bg-white text-ink-900 text-sm font-semibold tabular-nums hover:bg-herb-100 transition-colors"
                >
                  <Phone size={15} />
                  02-584-1075
                </a>
                <Link
                  href="/visit-guide"
                  className="mt-2 flex items-center justify-between px-4 py-2.5 border border-white/30 text-white text-[13px] font-medium hover:bg-white/10 transition-colors"
                >
                  처음 방문 가이드
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* 다른 진료 영역 */}
              <div>
                <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-ink-400 mb-3 px-1">
                  다른 진료 영역
                </div>
                <ul className="space-y-1">
                  {otherTreatments.map((x) => (
                    <li key={x.slug}>
                      <Link
                        href={`/treatment/${x.slug}`}
                        className="group flex items-center justify-between px-4 py-3 border border-ink-200 hover:border-ink-900 transition-colors"
                      >
                        <div>
                          <div className="font-serif text-[14px] font-black tracking-[-0.02em] text-ink-900 group-hover:text-herb-700 transition-colors">
                            {x.name}
                          </div>
                          <div className="text-[11px] text-ink-500 mt-0.5">{x.tagline}</div>
                        </div>
                        <ChevronRight size={14} className="text-ink-400 shrink-0 ml-2" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </aside>
        </div>
      </div>
    </article>
    </>
  );
}

function MobileCta({ name }: { name: string }) {
  return (
    <section className="mt-14 pt-10 border-t border-ink-200">
      <div className="bg-ink-900 text-white p-8 md:p-10">
        <div className="text-[12px] tracking-[0.3em] uppercase text-white/70 font-bold mb-3">
          진료 예약 / 문의
        </div>
        <h2 className="font-serif text-[24px] md:text-[32px] font-black tracking-[-0.025em] leading-tight">
          {name} 진료를 받고 싶으신가요?
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
  );
}

function MobileOtherTreatments({ treatments }: { treatments: { slug: string; name: string; tagline: string }[] }) {
  return (
    <section className="mt-10 pt-8 border-t border-ink-200">
      <div className="text-[12px] tracking-[0.2em] uppercase text-ink-500 font-bold mb-4">
        다른 진료 영역
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {treatments.slice(0, 3).map((x) => (
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
  );
}
