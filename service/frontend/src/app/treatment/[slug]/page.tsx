import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Phone } from "lucide-react";
import { getAllPosts, makeExcerpt } from "@/lib/blog";
import { TREATMENTS, TREATMENT_LIST } from "@/data/treatments";
import { SITE_URL } from "@/lib/site";
import { TreatmentIllustration } from "@/components/treatment/TreatmentIllustration";
import { TreatmentAnimations } from "@/components/treatment/TreatmentAnimations";

/* ── 진료 영역별 컬러 테마 ── */
type Theme = {
  heroBg: string;
  softCircle: string;
  accent: string;
  chipBg: string;
  chipText: string;
};

// 모노크롬 — 진료별로 색을 달리하지 않고 브랜드 그린 단색으로 통일.
// (구분은 색이 아니라 각 진료의 커스텀 일러스트가 담당)
const GREEN_THEME: Theme = {
  heroBg: "linear-gradient(135deg, #f7faf7 0%, #e6f0e9 100%)",
  softCircle: "#d6e8db",
  accent: "#2d6e5a",
  chipBg: "#eaf3ec",
  chipText: "#1f5a48",
};
const THEMES: Record<string, Theme> = {
  spine: GREEN_THEME, women: GREEN_THEME, children: GREEN_THEME,
  diet: GREEN_THEME, health: GREEN_THEME, skin: GREEN_THEME,
};
const DEFAULT_THEME = GREEN_THEME;

/* 히어로 배경 파티클 정의 */
const PARTICLES = [
  { size: 220, left: "6%",  top: "12%", dur: "9s",  del: "0s" },
  { size: 150, left: "80%", top: "58%", dur: "12s", del: "2.5s" },
  { size: 100, left: "74%", top: "8%",  dur: "10s", del: "1s" },
  { size: 72,  left: "18%", top: "72%", dur: "14s", del: "4s" },
];

export function generateStaticParams() {
  return TREATMENT_LIST.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = TREATMENTS[params.slug];
  if (!t) return { title: "이수한의원" };
  const url = `${SITE_URL}/treatment/${params.slug}`;
  return {
    title: `${t.name} — 이수한의원`,
    description: t.description,
    keywords: [t.name, t.tagline, "이수한의원", "한의원", "서울 동작구", "남성역", ...t.methods.map((m) => m.title)],
    alternates: { canonical: url },
    openGraph: { url, type: "website", title: `${t.name} — 이수한의원`, description: t.description },
  };
}

export default function TreatmentPage({ params }: { params: { slug: string } }) {
  const t = TREATMENTS[params.slug];
  if (!t) notFound();

  const theme = THEMES[params.slug] ?? DEFAULT_THEME;
  const index = TREATMENT_LIST.findIndex((x) => x.slug === params.slug);
  const heroNum = String(index + 1).padStart(2, "0");

  const url = `${SITE_URL}/treatment/${params.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalTherapy",
    name: t.name,
    alternateName: t.tagline,
    description: t.description,
    url,
    medicineSystem: "TraditionalChineseMedicine",
    provider: { "@type": "MedicalClinic", "@id": SITE_URL, name: "이수한의원", telephone: "+82-2-584-1075", url: SITE_URL },
    potentialAction: { "@type": "ReserveAction", name: "전화 예약", target: "tel:0285841075" },
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

  const otherTreatments = TREATMENT_LIST.filter((x) => x.slug !== params.slug);

  // GEO: 관련 글을 hasPart로 연결해 AI 크롤러가 콘텐츠 클러스터를 인식하도록
  const jsonLdEnriched = {
    ...jsonLd,
    ...(relatedPosts.length > 0 && {
      hasPart: relatedPosts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        url: `${SITE_URL}/${p.logNo}`,
        author: { "@type": "MedicalClinic", "@id": SITE_URL },
        about: { "@type": "MedicalTherapy", name: t.name },
      })),
    }),
  };

  const faqLd = t.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: t.faq.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "진료 안내", item: `${SITE_URL}/clinic` },
      { "@type": "ListItem", position: 3, name: t.name, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdEnriched) }} />
      {faqLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* 클라이언트 애니메이션 엔진 */}
      <TreatmentAnimations accent={theme.accent} />

      {/* ══════════════════════════════════
          HERO — 풀위드 + 패럴랙스
          ══════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[540px] md:min-h-[600px]" style={{ background: theme.heroBg }}>

        {/* 배경 파티클 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="tx-particle absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                top: p.top,
                background: theme.accent,
                opacity: 0.055,
                filter: "blur(52px)",
                ["--tx-dur" as string]: p.dur,
                ["--tx-del" as string]: p.del,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-5 md:px-10 py-18 md:py-24 grid md:grid-cols-[1fr_420px] gap-10 md:gap-16 items-center">

          {/* 텍스트 (패럴랙스 대상) */}
          <div id="tx-hero-text">
            <div
              className="tx-enter tx-e1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-[0.22em] uppercase mb-7"
              style={{ background: theme.chipBg, color: theme.chipText }}
            >
              Treatment · {heroNum}
            </div>

            <h1 data-cms-field="name" className="tx-enter tx-e2 font-serif text-[36px] sm:text-[46px] md:text-[58px] font-black tracking-[-0.03em] text-ink-900 leading-[1.06]">
              {t.name}
            </h1>

            <div data-cms-field="tagline" className="tx-enter tx-e3 mt-3 text-[16px] md:text-[18px] font-semibold" style={{ color: theme.accent }}>
              {t.tagline}
            </div>

            <p data-cms-field="description" className="tx-enter tx-e4 mt-5 text-[15px] md:text-[16px] text-ink-600 leading-[1.88] max-w-[500px]">
              {t.description}
            </p>

            <div className="tx-enter tx-e5 mt-9 flex flex-wrap gap-3">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-white text-[14px] font-bold rounded-full hover:opacity-85 transition-opacity"
                style={{ background: theme.accent }}
              >
                <Phone size={15} strokeWidth={2.5} />
                전화 예약
              </a>
              <Link
                href="/visit-guide"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-ink-300 text-ink-700 text-[14px] font-semibold rounded-full hover:border-ink-900 hover:text-ink-900 transition-colors"
              >
                처음 방문 가이드 →
              </Link>
            </div>
          </div>

          {/* 일러스트 (패럴랙스 대상) */}
          <div id="tx-illus-wrap" className="flex items-center justify-center order-first md:order-last">
            {/* 호흡하는 원형 배경 */}
            <div
              className="tx-breathe w-[260px] h-[260px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] rounded-full flex items-center justify-center"
              style={{ background: theme.softCircle }}
            >
              {/* 입장 + 플로팅 */}
              <div className="tx-illus-enter">
                <div className="tx-float">
                  <div className="tx-illus-svg w-[180px] h-[180px] sm:w-[210px] sm:h-[210px] md:w-[270px] md:h-[270px]">
                    <TreatmentIllustration slug={params.slug} accentColor={theme.accent} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 물결 구분선 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none" aria-hidden
          style={{
            background: "linear-gradient(to bottom, transparent, #ffffff)",
          }}
        />
      </section>

      {/* ══════════════════════════════════
          METHOD CARDS — 스크롤 리빌
          ══════════════════════════════════ */}
      <section className="py-18 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="reveal flex items-baseline gap-4 mb-11">
            <span className="font-serif text-[11px] tracking-[0.3em] text-ink-400 tabular-nums">01</span>
            <h2 className="font-serif text-[26px] md:text-[34px] font-black tracking-[-0.025em] text-ink-900">
              주요 진료 방법
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
            {t.methods.map((m, i) => (
              <div
                key={m.title}
                className={`reveal reveal-d${i + 1} tx-method-card group relative p-7 md:p-8 rounded-2xl border border-ink-100 hover:border-transparent hover:shadow-[0_20px_56px_-16px_rgba(0,0,0,0.18)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden`}
              >
                {/* 호버 시 코너에서 번지는 원 */}
                <div
                  className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-[3.5] scale-100 transition-all duration-700 ease-out"
                  style={{ background: theme.softCircle }}
                />

                {/* 번호 */}
                <div
                  className="tx-card-num relative text-[11px] font-bold tracking-[0.28em] tabular-nums mb-5 transition-all duration-300 group-hover:tracking-[0.42em]"
                  style={{ color: theme.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>

                <h3 data-cms-field={`methods.${i}.title`} className="relative font-serif text-[20px] md:text-[22px] font-black tracking-[-0.02em] text-ink-900 leading-tight">
                  {m.title}
                </h3>
                <p data-cms-field={`methods.${i}.desc`} className="relative mt-3 text-[14px] text-ink-600 leading-[1.82]">{m.desc}</p>

                {/* 하단 슬라이딩 액센트 바 */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
                  style={{ background: theme.accent }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          RELATED POSTS — 매거진 그리드
          ══════════════════════════════════ */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-ink-50">
          <div className="max-w-5xl mx-auto px-5 md:px-8">
            <div className="reveal flex items-baseline justify-between mb-9">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-[11px] tracking-[0.3em] text-ink-400 tabular-nums">02</span>
                <h2 className="font-serif text-[26px] md:text-[34px] font-black tracking-[-0.025em] text-ink-900">
                  관련 칼럼
                </h2>
              </div>
              <Link
                href={`/journal?cat=${encodeURIComponent(t.categoryMatch[0])}`}
                className="text-[12px] tracking-[0.2em] uppercase font-semibold hover:opacity-60 transition-opacity"
                style={{ color: theme.accent }}
              >
                전체 보기 →
              </Link>
            </div>

            <div data-cms-skip className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
              {relatedPosts.map((p, i) => (
                <Link
                  key={p.logNo}
                  href={`/${p.logNo}`}
                  className={`reveal reveal-d${(i % 3) + 1} group block`}
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-xl mb-3.5 bg-ink-200">
                    {p.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-600"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ background: theme.softCircle }}
                      >
                        <span
                          className="font-serif text-5xl font-black"
                          style={{ color: theme.accent, opacity: 0.3 }}
                        >醫</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif text-[16px] font-black tracking-[-0.02em] text-ink-900 group-hover:opacity-60 transition-opacity leading-[1.3] line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-ink-500 line-clamp-2 leading-[1.65]">
                    {makeExcerpt(p, 80)}
                  </p>
                  <div className="mt-2 text-[11px] tracking-[0.18em] uppercase text-ink-400 tabular-nums">
                    {p.dateLabel}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════
          CTA — 예약 배너
          ══════════════════════════════════ */}
      <section className="reveal relative overflow-hidden" style={{ background: theme.heroBg }}>
        {/* 배경 파티클 (작게) */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="tx-particle absolute rounded-full"
            style={{
              width: 160, height: 160,
              right: "10%", top: "20%",
              background: theme.accent,
              opacity: 0.07,
              filter: "blur(40px)",
              ["--tx-dur" as string]: "8s",
              ["--tx-del" as string]: "0s",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-5 md:px-8 py-14 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div
                className="text-[10.5px] tracking-[0.3em] uppercase font-bold mb-2"
                style={{ color: theme.accent }}
              >
                진료 예약 · 문의
              </div>
              <p className="font-serif text-[22px] md:text-[28px] font-black tracking-[-0.025em] text-ink-900 leading-tight">
                {t.name} 진료를 받고 싶으신가요?
              </p>
              <p className="mt-2 text-[14px] text-ink-500">
                평일 야간(20시) · 토·일 진료. 전화 또는 방문 예약.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-white text-[14px] font-bold rounded-full hover:opacity-85 transition-opacity tabular-nums"
                style={{ background: theme.accent }}
              >
                <Phone size={15} strokeWidth={2.5} />
                02-584-1075
              </a>
              <Link
                href="/visit-guide"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-ink-300 text-ink-700 text-[14px] font-semibold rounded-full hover:border-ink-900 transition-colors"
              >
                처음 방문 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          다른 진료 영역 — 가로 스크롤
          ══════════════════════════════════ */}
      <section className="py-12 md:py-14 bg-white border-t border-ink-100">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="reveal text-[10.5px] tracking-[0.3em] uppercase font-bold text-ink-400 mb-5">
            다른 진료 영역
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {otherTreatments.map((x, i) => {
              const xt = THEMES[x.slug] ?? DEFAULT_THEME;
              return (
                <Link
                  key={x.slug}
                  href={`/treatment/${x.slug}`}
                  className={`reveal reveal-d${(i % 5) + 1} shrink-0 group block rounded-2xl border border-ink-100 hover:border-transparent hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 transition-all duration-200 p-5 w-[178px]`}
                >
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
                    style={{ background: xt.softCircle }}
                  >
                    <div className="w-6 h-6">
                      <TreatmentIllustration slug={x.slug} accentColor={xt.accent} />
                    </div>
                  </div>
                  <div className="font-serif text-[13.5px] font-black tracking-[-0.02em] text-ink-900 group-hover:opacity-60 transition-opacity leading-tight">
                    {x.name}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-400 line-clamp-1">{x.tagline}</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
