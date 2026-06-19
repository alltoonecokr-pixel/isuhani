import type { Metadata } from "next";
import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";
import { TREATMENT_LIST } from "@/data/treatments";
import { getAllPosts, makeExcerpt, cleanImageUrl } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";
import {
  SpineIcon,
  MotherChildIcon,
  SproutIcon,
  BalanceIcon,
  DropLeafIcon,
  MortarIcon,
  ClockSoftIcon,
  StethIcon,
  BookLeafIcon,
  PinSoftIcon,
} from "@/components/landing/HerbIcons";
import { StickyMobileCTA } from "@/components/landing/StickyMobileCTA";
import { ScrollJourney } from "@/components/landing/ScrollJourney";
import { VisitFlow } from "@/components/sections/VisitFlow";

export const metadata: Metadata = {
  title: "이수한의원 | 사당동 남성역 · 매일 진료하는 한의원",
  description:
    "추나·산후조리·소아성장·다이어트·피부·건강관리. 원장 3인이 직접 짚어드리는 진료. 평일 야간·주말까지 매일 진료. 7호선 남성역 1번 출구 도보 1분.",
  alternates: { canonical: `${SITE_URL}/home` },
};

const TREATMENT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  spine: SpineIcon,
  women: MotherChildIcon,
  children: SproutIcon,
  diet: BalanceIcon,
  skin: DropLeafIcon,
  health: MortarIcon,
};

const DOCTORS = [
  {
    hanja: "文",
    name: "문학진",
    role: "대표원장",
    intro: "환자 한 분 한 분의 체질과 생활 습관을 살피는 정성 진료를 원칙으로 합니다.",
    specialties: ["추나요법", "체형 · 척추교정", "디스크 치료", "공진단"],
  },
  {
    hanja: "羅",
    name: "나효석",
    role: "원장 · 한방부인과",
    intro: "한방부인과 진료. 산후조리부터 갱년기, 난임, 자궁질환까지 여성의 일생 건강을 함께 살핍니다.",
    specialties: ["산후조리", "갱년기", "난임 · 임신", "자궁질환"],
  },
  {
    hanja: "李",
    name: "이윤호",
    role: "원장",
    intro: "체형·관절 통증 진료와 어린이 성장클리닉, 건강관리 전반을 담당합니다.",
    specialties: ["관절통증", "어린이 성장", "한방 다이어트", "건강관리"],
  },
];

const STATS = [
  { value: "25년", label: "한자리 진료" },
  { value: "원장 3인", label: "전문 분야 직접 진료" },
  { value: "1,042편", label: "건강 칼럼 자산" },
  { value: "주 7일", label: "평일 야간 · 주말 진료" },
];

const HOURS: { day: string; time: string; note?: string; muted?: boolean }[] = [
  { day: "평일", time: "09:30 – 20:00", note: "야간진료" },
  { day: "토요일", time: "09:30 – 15:00" },
  { day: "일요일", time: "09:30 – 15:00" },
  { day: "공휴일", time: "휴진", muted: true },
];

export default function HomePage() {
  // 추천 칼럼 4개 — body가 있고 썸네일이 있는 최신 글
  const featured = getAllPosts()
    .filter((p) => p.body && p.thumbnail)
    .slice(0, 4)
    .map((p) => ({
      logNo: p.logNo,
      title: p.title,
      category: p.category,
      dateLabel: p.dateLabel,
      excerpt: makeExcerpt(p, 120),
      thumbnail: cleanImageUrl(p.thumbnail, "w773"),
    }));

  return (
    <div>
      {/* ====================  1) HERO  ==================== */}
      <section id="hero" className="relative overflow-hidden">
        {/* 데코 — 한방 잎새 모티프. md+에서 보이도록 (반응형 크기 조정) */}
        <div
          aria-hidden
          className="hidden md:block absolute -right-16 lg:-right-12 top-8 lg:top-12 text-herb-700/[0.07] pointer-events-none animate-leaf-drift"
        >
          <svg width="240" height="240" className="lg:w-[320px] lg:h-[320px]" viewBox="0 0 32 32" fill="currentColor">
            <path d="M6 26 C 8 16, 16 8, 26 6 C 24 16, 16 24, 6 26 Z" />
          </svg>
        </div>
        <div
          aria-hidden
          className="hidden lg:block absolute right-48 bottom-12 text-clay-500/[0.08] pointer-events-none rotate-[18deg] animate-leaf-drift-slow"
        >
          <svg width="140" height="140" viewBox="0 0 32 32" fill="currentColor">
            <path d="M16 6 C 11 12, 9 17, 11 22 C 13 26, 19 26, 21 22 C 23 17, 21 12, 16 6 Z" />
          </svg>
        </div>
        {/* 모바일에서도 미세 데코 — 우상단 코너에만 작은 동그라미 */}
        <div
          aria-hidden
          className="md:hidden absolute -right-8 -top-8 w-32 h-32 rounded-full bg-herb-50/60 pointer-events-none"
        />
        <div
          aria-hidden
          className="md:hidden absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-clay-50/70 pointer-events-none"
        />
        <div className="relative max-w-container mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28">
          <div className="max-w-3xl">
            <div className="chip-kr mb-7 hero-rise-1">
              사당동 25년 · 남성역 1번 출구 도보 1분
            </div>
            <h1 className="font-serif text-[42px] md:text-[68px] leading-[1.1] tracking-[-0.025em] text-ink-900 hero-rise-2">
              <span className="block">퇴근하고 가도</span>
              <span className="block text-herb-700">늦지 않습니다.</span>
            </h1>
            <p className="mt-8 md:mt-10 text-[18px] md:text-[21px] leading-[1.78] text-ink-700 max-w-2xl hero-rise-3">
              평일 저녁 8시까지, 주말까지 진료해요. 사당동에서 25년 —
              <br className="hidden md:block" />
              처음 오시는 분도, 아이 데리고 오시는 분도 편하게.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3 hero-rise-4">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-herb-700 hover:bg-herb-900 text-white text-[16px] font-bold tabular-nums shadow-[0_8px_24px_-10px_rgba(45,110,90,0.4)] hover:shadow-[0_14px_36px_-10px_rgba(45,110,90,0.5)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <Phone size={17} strokeWidth={2.5} />
                02-584-1075 전화로 문의
              </a>
              <Link
                href="#treatments"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-ink-300 hover:border-ink-900 hover:bg-paper-100 text-ink-900 text-[16px] font-bold transition-all duration-300"
              >
                진료 영역 보기
                <ArrowRight size={17} strokeWidth={2.5} />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] text-ink-500 hero-rise-4">
              <div className="inline-flex items-center gap-2">
                <ClockSoftIcon size={18} className="text-ink-400" />
                평일 09:30–20:00 · 주말 09:30–15:00
              </div>
              <div className="inline-flex items-center gap-2">
                <PinSoftIcon size={18} className="text-ink-400" />
                서울 동작구 사당동 254-5
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================  2) WHY  ==================== */}
      <section id="why" className="scroll-mt-20 bg-paper-200">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="max-w-2xl mb-14 md:mb-20">
            <div className="chip-kr mb-5">우리 한의원</div>
            <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.18] tracking-[-0.02em] text-ink-900">
              25년째,
              <br />
              같은 자리에 있어요.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 md:gap-7">
            {[
              {
                Icon: StethIcon,
                title: "어떤 증상이든\n맞는 원장님이 있어요.",
                body: "추나·디스크는 문학진, 산후·갱년기는 나효석, 소아 성장·관절은 이윤호. 헤매지 않게 미리 짝지어 드려요.",
              },
              {
                Icon: ClockSoftIcon,
                title: "야근하고 와도\n괜찮아요.",
                body: "평일 저녁 8시까지, 토·일도 9:30–15:00 진료해요. 점심시간만 빼면 늘 누군가 진료실에 있어요.",
              },
              {
                Icon: BookLeafIcon,
                title: "궁금한 게 있으면\n먼저 읽어보세요.",
                body: "원장님이 직접 쓴 진료 사례·체질 가이드 1,042편이 있어요. 챗봇 ‘쑤’가 그 안에서 답을 찾아 안내해요.",
              },
            ].map((c, i) => (
              <div
                key={c.title}
                className={`bg-white rounded-3xl p-7 md:p-9 border border-ink-200 hover:border-ink-300 hover:shadow-[0_10px_36px_-14px_rgba(26,20,16,0.12)] hover:-translate-y-0.5 transition-all duration-300 reveal-on-scroll reveal-stagger-${i + 1}`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-herb-50 text-herb-700 mb-6">
                  <c.Icon size={28} />
                </div>
                <h3 className="font-serif text-[22px] tracking-[-0.015em] text-ink-900 mb-3 whitespace-pre-line leading-[1.3]">
                  {c.title}
                </h3>
                <p className="text-[16px] leading-[1.78] text-ink-700">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================  3) TREATMENTS  ==================== */}
      <section id="treatments" className="scroll-mt-20 bg-paper">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="md:flex md:items-end md:justify-between mb-12 md:mb-16 gap-8">
            <div className="max-w-2xl">
              <div className="chip-kr mb-5">진료 영역</div>
              <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.18] tracking-[-0.02em] text-ink-900">
                어디가 불편하세요?
                <br />
                천천히 봐드릴게요.
              </h2>
            </div>
            <p className="hidden md:block max-w-sm text-[15px] leading-[1.78] text-ink-600">
              증상이 모호해도 괜찮아요. 전화 주시면 어느 원장님께 보일지 먼저 안내드려요.
            </p>
          </div>

          {/* 페르소나 진입로 — 직장인 / 워킹맘 / 시니어 (한의신문 결정요인 기반) */}
          <div className="mb-10 md:mb-14 grid sm:grid-cols-3 gap-3 md:gap-4">
            {[
              {
                tag: "직장인이라면",
                title: "거북목·허리·만성피로",
                hint: "야간진료 · 추나 · 다이어트",
                color: "bg-herb-50 text-herb-700 border-herb-200",
                href: "/treatment/spine",
              },
              {
                tag: "워킹맘이라면",
                title: "산후조리·아이 성장",
                hint: "한방부인과 · 소아성장",
                color: "bg-clay-50 text-clay-700 border-clay-400/40",
                href: "/treatment/women",
              },
              {
                tag: "어르신이라면",
                title: "관절통증·기력·보약",
                hint: "추나 · 공진단 · 경옥고",
                color: "bg-paper-200 text-ink-900 border-ink-200",
                href: "/treatment/health",
              },
            ].map((p, i) => (
              <Link
                key={p.tag}
                href={p.href}
                className={`group block rounded-2xl border ${p.color} p-5 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(26,20,16,0.18)] transition-all duration-300 reveal-on-scroll reveal-stagger-${i + 1}`}
              >
                <div className="text-[11px] font-bold tracking-[0.05em] opacity-70 mb-1.5">
                  {p.tag}
                </div>
                <div className="font-serif text-[18px] md:text-[19px] tracking-[-0.015em] mb-2 leading-tight">
                  {p.title}
                </div>
                <div className="text-[12.5px] opacity-75 inline-flex items-center gap-1">
                  {p.hint}
                  <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {TREATMENT_LIST.map((t, i) => {
              const Icon = TREATMENT_ICONS[t.slug];
              const stagger = (i % 3) + 1;
              return (
                <Link
                  key={t.slug}
                  href={`/treatment/${t.slug}`}
                  className={`group block rounded-3xl bg-white p-7 md:p-8 border border-ink-200 hover:border-ink-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-14px_rgba(26,20,16,0.18)] reveal-on-scroll reveal-stagger-${stagger}`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-herb-50 text-herb-700 group-hover:bg-herb-700 group-hover:text-white transition-colors duration-300">
                      {Icon ? <Icon size={26} /> : null}
                    </div>
                    <div className="text-[12px] font-bold text-herb-700 leading-tight">
                      {t.tagline}
                    </div>
                  </div>
                  <h3 className="font-serif text-[24px] tracking-[-0.02em] text-ink-900 leading-[1.2] mb-3">
                    {t.name}
                  </h3>
                  <p className="text-[15px] leading-[1.7] text-ink-600 mb-6 line-clamp-3">
                    {t.description}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-900 group-hover:text-herb-700 transition-colors">
                    자세히 보기
                    <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================  4) STATS — 따뜻한 모래색 (검정 X)  ==================== */}
      <section id="trust" className="scroll-mt-20 bg-paper-200 border-y border-ink-200">
        <div className="max-w-container mx-auto px-5 md:px-8 py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={[
                  "text-center px-3 md:px-6 py-6 md:py-4 stat-pop",
                  i < STATS.length - 1 ? "md:border-r md:border-ink-200" : "",
                  i < 2 ? "border-b border-ink-200 md:border-b-0" : "",
                ].join(" ")}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="font-serif text-[34px] md:text-[48px] tracking-[-0.02em] text-ink-900 mb-1.5 leading-none">
                  {s.value}
                </div>
                <div className="text-[13px] md:text-[14px] text-ink-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================  5) DOCTORS  ==================== */}
      <section id="doctors" className="scroll-mt-20 bg-paper">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="max-w-2xl mb-14 md:mb-20">
            <div className="chip-kr mb-5">원장 소개</div>
            <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.18] tracking-[-0.02em] text-ink-900">
              원장님 세 분이,
              <br />
              늘 같은 자리에 있어요.
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.78] text-ink-600 max-w-xl">
              한 번 봐드린 분은 다음에 오셨을 때 알아봐드려요.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 md:gap-6">
            {DOCTORS.map((d, i) => (
              <div
                key={d.name}
                className={`group bg-white rounded-3xl p-8 md:p-9 border border-ink-200 hover:border-ink-300 hover:shadow-[0_14px_40px_-14px_rgba(26,20,16,0.12)] hover:-translate-y-0.5 transition-all duration-300 reveal-on-scroll reveal-stagger-${i + 1}`}
              >
                {/* 한자 명패 — 이름의 한자 첫 글자, 정성 진료 시그널 */}
                <div className="relative mb-7 flex items-start justify-between">
                  <div className="relative">
                    {/* 한자 배경 톤 */}
                    <div
                      aria-hidden
                      className="absolute -inset-3 rounded-2xl bg-herb-50 opacity-90"
                    />
                    <span
                      aria-hidden
                      className="relative font-serif text-[68px] md:text-[76px] leading-none text-herb-700 tracking-[-0.04em]"
                      style={{ fontFamily: 'var(--font-noto-serif-kr), "Noto Serif KR", "Noto Serif CJK KR", "Source Han Serif", serif' }}
                    >
                      {d.hanja}
                    </span>
                  </div>
                  {/* 미세 우드 액센트 — 도장 느낌 */}
                  <div
                    aria-hidden
                    className="mt-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-clay-50 text-clay-700 text-[10px] font-bold tracking-[0.05em]"
                  >
                    醫
                  </div>
                </div>

                <div className="text-[12px] font-bold text-clay-700 tracking-[0.02em] mb-2">
                  {d.role}
                </div>
                <h3 className="font-serif text-[28px] md:text-[30px] tracking-[-0.02em] text-ink-900 mb-4">
                  {d.name}
                </h3>
                <p className="text-[14.5px] leading-[1.75] text-ink-600 mb-5">
                  {d.intro}
                </p>

                <div className="pt-5 border-t border-ink-100">
                  <div className="text-[11px] font-bold tracking-[0.15em] uppercase text-ink-400 mb-3">
                    진료 분야
                  </div>
                  <ul className="space-y-1.5">
                    {d.specialties.map((s) => (
                      <li
                        key={s}
                        className="flex items-baseline gap-2 text-[14px] text-ink-700"
                      >
                        <span className="text-herb-500 leading-none">·</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 md:mt-14">
            <Link
              href="#doctors"
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-900 hover:text-herb-700 border-b-2 border-ink-900 hover:border-herb-700 pb-1 transition-colors"
            >
              의료진 자세히 보기
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================  6) JOURNAL PREVIEW  ==================== */}
      <section id="journal" className="scroll-mt-20">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="md:flex md:items-end md:justify-between mb-12 md:mb-16 gap-8">
            <div>
              <div className="chip-kr mb-5">건강 칼럼</div>
              <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.18] tracking-[-0.02em] text-ink-900">
                진료실 밖에서도
                <br />
                계속 쓰고 있어요.
              </h2>
              <p className="mt-5 text-[15.5px] leading-[1.78] text-ink-600 max-w-md">
                25년간 환자분들이 가장 많이 묻는 이야기 1,042편이에요. 한 편만 읽고 오셔도 진료가 한결 편해져요.
              </p>
            </div>
            <Link
              href="/journal"
              className="hidden md:inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-900 hover:text-herb-700 border-b-2 border-ink-900 hover:border-herb-700 pb-1 transition-colors"
            >
              저널 1,042편 전체 보기
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {featured.map((p, i) => (
              <Link
                key={p.logNo}
                href={`/${p.logNo}`}
                className={`group block reveal-on-scroll reveal-stagger-${i + 1}`}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-3xl mb-4 relative">
                  {/* fallback — 이미지 깨져도 보이는 그라디언트 + 잎 데코 */}
                  <div className="absolute inset-0 bg-gradient-to-br from-herb-50 via-paper-100 to-clay-50 flex items-center justify-center">
                    <svg
                      viewBox="0 0 32 32"
                      width={70}
                      height={70}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-herb-500/40"
                      aria-hidden
                    >
                      <path d="M6 26 C 8 16, 16 8, 26 6 C 24 16, 16 24, 6 26 Z" />
                      <path d="M9 23 L 22 10" />
                    </svg>
                  </div>
                  {/* Naver 썸네일 — 로드되면 fallback 덮음. 실패하면 CSS 자동 무시 (broken 아이콘 X) */}
                  {p.thumbnail && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                      style={{ backgroundImage: `url("${p.thumbnail}")` }}
                      role="img"
                      aria-label={p.title}
                    />
                  )}
                </div>
                <div className="text-[11.5px] font-bold text-herb-700 mb-2">
                  {p.category}
                </div>
                <h3 className="font-serif text-[18px] tracking-[-0.015em] text-ink-900 leading-[1.35] mb-2 line-clamp-2 group-hover:text-herb-700 transition-colors">
                  {p.title}
                </h3>
                <p className="text-[14px] leading-[1.65] text-ink-500 line-clamp-2">
                  {p.excerpt}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 md:hidden">
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-900 border-b-2 border-ink-900 pb-1"
            >
              저널 1,042편 전체 보기
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================  6.5) FAQ — 페인포인트 정면 답변 ==================== */}
      <section id="faq" className="scroll-mt-20 bg-paper border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="md:grid md:grid-cols-12 gap-12">
            <div className="md:col-span-5 mb-10 md:mb-0">
              <div className="chip-kr mb-5">자주 묻는 질문</div>
              <h2 className="font-serif text-[30px] md:text-[42px] leading-[1.18] tracking-[-0.02em] text-ink-900 mb-6">
                전화 걸기 전에
                <br />
                궁금한 것들.
              </h2>
              <p className="text-[15.5px] leading-[1.78] text-ink-600 mb-6">
                “한약 먹으면 간이 나빠지나요?”, “추나는 보험되나요?”, “초진은 얼마나 걸려요?” — 처음 오시는 분들이 가장 많이 묻는 8가지를 정리해 두었어요.
              </p>
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-ink-300 hover:border-ink-900 hover:bg-paper-200 text-ink-900 text-[14.5px] font-bold transition-all duration-300"
              >
                <Phone size={15} strokeWidth={2.5} />
                바로 통화 02-584-1075
              </a>
            </div>

            <div className="md:col-span-7 divide-y divide-ink-100 border-y border-ink-200">
              {[
                {
                  q: "추나요법은 건강보험 적용되나요?",
                  a: "네, 2019년 4월부터 건강보험이 적용됩니다. 단순 추나 1만원대, 복잡 추나 2~3만원대 본인부담입니다. 자동차보험 한방치료도 가능해요.",
                },
                {
                  q: "한약 먹으면 간이 나빠진다던데요?",
                  a: "한의사 처방을 따라 복용하는 한약은 약물성 간 손상 위험이 통계적으로 유의하지 않다는 임상 메타 연구가 있습니다. 다만 다이어트용 마황 함유 한약은 두근거림·불면 등 부작용이 가능하니 진료 시 솔직히 안내드립니다.",
                },
                {
                  q: "공진단·경옥고는 얼마인가요?",
                  a: "체질·증상 진단 후 처방되는 비급여 보약입니다. 공진단은 1환 단위, 경옥고는 단위별로 가격이 달라요. 정확한 비용은 02-584-1075로 문의 주시거나 진료 후 견적을 드립니다. 무리한 권유는 하지 않습니다.",
                },
                {
                  q: "처음 방문할 때 뭘 가져가야 하나요?",
                  a: "신분증(건강보험 적용 시 필수)이면 충분합니다. 최근 복용 중인 약·한약 정보, 증상 시작 시점·통증 부위 메모를 가져오시면 진료가 정확해요. 추나·침 시술이 있을 수 있어 활동 편한 옷을 권합니다.",
                },
                {
                  q: "초진은 시간이 얼마나 걸리나요?",
                  a: "초진은 30~50분 정도. 접수·문진(5분) → 원장 상담(10~15분) → 침·추나(20분) → 한약 처방 상담(선택, 5분) → 수납·다음 예약(5분) 순서입니다.",
                },
                {
                  q: "다이어트 한약 부작용 있나요?",
                  a: "마황 성분이 들어간 다이어트 한약은 두근거림·갈증·불면이 나타날 수 있습니다. 진료 시 체질·기저질환·복용 약 확인 후 처방하며, 부작용 발생 시 바로 중단·조정하실 수 있도록 카카오톡으로 컨디션을 추적합니다.",
                },
                {
                  q: "어린이 한약은 몇 살부터 먹일 수 있나요?",
                  a: "보통 만 3세 이상부터 처방합니다. 키 성장 한약은 연령·체질·성장 단계에 따라 처방 내용이 달라지며, 부모님 동반 진료를 권장합니다.",
                },
                {
                  q: "전용 주차장이 있나요?",
                  a: "전용 주차장은 없습니다. 인근 공영주차장을 이용해 주시거나, 7호선 남성역 1번 출구에서 도보 1분이라 대중교통을 권장드려요.",
                },
              ].map((f, i) => (
                <details
                  key={f.q}
                  className={`group py-5 reveal-on-scroll reveal-stagger-${(i % 4) + 1}`}
                >
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                    <span className="font-serif text-[17px] md:text-[18.5px] tracking-[-0.015em] text-ink-900 leading-[1.45] flex-1">
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 mt-1 inline-flex items-center justify-center w-7 h-7 rounded-full border border-ink-200 text-ink-500 group-open:bg-herb-700 group-open:text-white group-open:border-herb-700 group-open:rotate-45 transition-all duration-300"
                    >
                      <span className="text-[15px] leading-none">＋</span>
                    </span>
                  </summary>
                  <p className="mt-3 pr-12 text-[15px] leading-[1.78] text-ink-700">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================  7) LOCATION & RESERVATION  ==================== */}
      <section id="flow" className="scroll-mt-20 bg-white border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <VisitFlow />
        </div>
      </section>

      <section id="visit" className="scroll-mt-20 bg-paper-200 border-t border-ink-200">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="chip-kr mb-5">오시는 길</div>
              <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.18] tracking-[-0.02em] text-ink-900 mb-6">
                남성역 1번 출구
                <br />
                도보 1분.
              </h2>
              <p className="text-[16px] leading-[1.78] text-ink-700 mb-6">
                서울 동작구 사당동 254-5
                <br />
                7호선 남성역 1번 출구 도보 1분
              </p>

              {/* 지도 — OpenStreetMap embed (API key 불필요) */}
              <a
                href="https://map.naver.com/p/search/이수한의원%20사당동"
                target="_blank"
                rel="noreferrer noopener"
                className="group mb-8 block rounded-3xl overflow-hidden border border-ink-200 bg-white aspect-[16/10] relative hover:border-ink-900 transition-colors"
                aria-label="네이버 지도로 이수한의원 위치 보기"
              >
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=126.9710%2C37.4836%2C126.9760%2C37.4876&layer=mapnik&marker=37.4856%2C126.9735"
                  title="이수한의원 위치 지도"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* 마커 오버레이 — 더 명확한 위치 강조 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-3 py-2 bg-white rounded-full shadow-[0_6px_20px_-6px_rgba(26,20,16,0.3)] border border-ink-200 flex items-center gap-1.5 text-[13px] font-bold text-ink-900">
                    <PinSoftIcon size={14} className="text-herb-700" />
                    이수한의원
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-ink-900/90 text-white text-[11px] font-bold rounded-full inline-flex items-center gap-1 group-hover:bg-herb-700 transition-colors">
                  네이버 지도에서 열기 →
                </div>
              </a>

              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:0285841075"
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-ink-900 hover:bg-herb-700 text-white text-[16px] font-bold tabular-nums shadow-[0_8px_24px_-10px_rgba(26,20,16,0.4)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Phone size={17} strokeWidth={2.5} />
                  02-584-1075
                </a>
                <a
                  href="https://map.naver.com/p/search/이수한의원%20사당동"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-ink-300 hover:border-ink-900 hover:bg-white text-ink-900 text-[16px] font-bold transition-all duration-300"
                >
                  <PinSoftIcon size={17} />
                  네이버 지도
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-3xl bg-white p-8 md:p-10 border border-ink-200">
                <div className="chip-kr mb-6">진료 시간</div>
                <ul className="divide-y divide-ink-100">
                  {HOURS.map((h) => (
                    <li
                      key={h.day}
                      className="flex items-center justify-between py-4"
                    >
                      <span
                        className={[
                          "text-[16px] font-bold",
                          h.muted ? "text-ink-400" : "text-ink-900",
                        ].join(" ")}
                      >
                        {h.day}
                      </span>
                      <span
                        className={[
                          "text-[16px] tabular-nums",
                          h.muted ? "text-ink-400" : "text-ink-700",
                        ].join(" ")}
                      >
                        {h.time}
                        {h.note && (
                          <span className="ml-2 text-[12px] font-bold text-clay-500">
                            · {h.note}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-ink-100 flex items-start gap-2 text-[14px] text-ink-500 leading-[1.7]">
                  <ClockSoftIcon size={16} className="mt-0.5 shrink-0" />
                  마지막 접수는 진료 종료 30분 전. 점심시간 운영은 전화로 안내.
                </div>
              </div>

              <Link
                href="/visit-guide"
                className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-bold text-ink-900 hover:text-herb-700 border-b-2 border-ink-900 hover:border-herb-700 pb-1 transition-colors"
              >
                처음 방문 가이드
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyMobileCTA />
      <ScrollJourney
        sections={[
          { id: "hero", label: "홈" },
          { id: "why", label: "우리 한의원" },
          { id: "treatments", label: "진료 영역" },
          { id: "trust", label: "신뢰" },
          { id: "doctors", label: "원장 소개" },
          { id: "journal", label: "건강 칼럼" },
          { id: "faq", label: "자주 묻는 질문" },
          { id: "visit", label: "오시는 길" },
        ]}
      />
      {/* sticky CTA + 챗봇이 가리지 않도록 하단 패딩 (모바일) */}
      <div className="md:hidden h-24" aria-hidden />
    </div>
  );
}
