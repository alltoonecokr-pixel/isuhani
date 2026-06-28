import type { Metadata } from "next";
import Link from "next/link";
import { Phone, ArrowRight, CalendarCheck, MessageCircle, MapPin, Youtube, Instagram } from "lucide-react";
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

/* ── 진료 카드 컬러 테마 ── */
// 모노크롬 — 진료 구분은 색이 아니라 커스텀 아이콘으로. 브랜드 그린 단색으로 통일.
const TREATMENT_TONE = { accent: "#2d6e5a", bg: "#eaf3ec" };
const CARD_ACCENT: Record<string, { accent: string; bg: string }> = {
  spine: TREATMENT_TONE, women: TREATMENT_TONE, children: TREATMENT_TONE,
  diet: TREATMENT_TONE, health: TREATMENT_TONE, skin: TREATMENT_TONE,
};

const TREATMENT_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  spine:    SpineIcon,
  women:    MotherChildIcon,
  children: SproutIcon,
  diet:     BalanceIcon,
  skin:     DropLeafIcon,
  health:   MortarIcon,
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

const HERO_STATS = [
  { value: "25년",    label: "한자리 진료",   sub: "사당동 254-5, 그 자리" },
  { value: "원장 3인", label: "직접 진료",     sub: "전문 분야별 매칭" },
  { value: "1,042편", label: "건강 칼럼",     sub: "원장 직필 Q&A" },
  { value: "주 7일",  label: "야간·주말 포함", sub: "평일 8시, 주말 3시" },
];

const HOURS: { day: string; time: string; note?: string; muted?: boolean }[] = [
  { day: "평일",   time: "09:30 – 20:00", note: "야간진료" },
  { day: "토요일", time: "09:30 – 15:00" },
  { day: "일요일", time: "09:30 – 15:00" },
  { day: "공휴일", time: "휴진", muted: true },
];

// 히어로 채널 아이콘 (톡톡·플레이스·유튜브·인스타)
function HeroChannel({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-ink-200 text-ink-500 hover:bg-herb-700 hover:border-herb-700 hover:text-white transition-colors"
    >
      {children}
    </a>
  );
}

export default function HomePage() {
  const featured = getAllPosts()
    .filter((p) => p.body && p.thumbnail)
    .slice(0, 4)
    .map((p) => ({
      logNo:     p.logNo,
      title:     p.title,
      category:  p.category,
      dateLabel: p.dateLabel,
      excerpt:   makeExcerpt(p, 120),
      thumbnail: cleanImageUrl(p.thumbnail, "w773"),
    }));

  return (
    <div>

      {/* ════════════════════════════════
          1) HERO — 카피 + 스탯 한 호흡
          ════════════════════════════════ */}
      <section id="hero" className="relative overflow-hidden">
        {/* 우상단 잎새 데코 */}
        <div
          aria-hidden
          className="hidden md:block absolute -right-14 lg:-right-8 top-10 text-herb-700/[0.065] pointer-events-none animate-leaf-drift"
        >
          <svg width="220" height="220" className="lg:w-[300px] lg:h-[300px]" viewBox="0 0 32 32" fill="currentColor">
            <path d="M6 26 C 8 16, 16 8, 26 6 C 24 16, 16 24, 6 26 Z" />
          </svg>
        </div>
        <div aria-hidden className="md:hidden absolute -right-8 -top-8 w-28 h-28 rounded-full bg-herb-50/60 pointer-events-none" />

        <div className="relative max-w-container mx-auto px-5 md:px-8 pt-14 md:pt-22 pb-0">
          <div className="max-w-3xl">
            <div className="chip-kr mb-6 hero-rise-1">
              사당동 25년 · 남성역 1번 출구 도보 1분
            </div>

            <h1 className="font-serif text-[32px] md:text-[68px] leading-[1.08] tracking-[-0.025em] text-ink-900 hero-rise-2">
              <span className="block">퇴근하고 가도</span>
              <span className="block text-herb-700">늦지 않습니다.</span>
            </h1>

            <p className="mt-5 md:mt-9 text-[15px] md:text-[20px] leading-[1.8] text-ink-600 max-w-2xl hero-rise-3">
              평일 저녁 8시까지, 주말까지 진료해요. 사당동에서 25년 —
              <br className="hidden md:block" />
              처음 오시는 분도, 아이 데리고 오시는 분도 편하게.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3 hero-rise-4">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-herb-700 hover:bg-herb-900 text-white text-[15.5px] font-bold tabular-nums shadow-[0_8px_24px_-10px_rgba(45,110,90,0.38)] hover:shadow-[0_14px_36px_-10px_rgba(45,110,90,0.48)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <Phone size={16} strokeWidth={2.5} />
                02-584-1075 전화로 문의
              </a>
              <Link
                href="#treatments"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-ink-200 hover:border-ink-900 hover:bg-paper-100 text-ink-800 text-[15.5px] font-semibold transition-all duration-300"
              >
                진료 영역 보기
                <ArrowRight size={16} strokeWidth={2.3} />
              </Link>
            </div>

            {/* 예약 · 채널 바로가기 */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 hero-rise-4">
              <a
                href="https://booking.naver.com/booking/13/bizes/331349?area=pll"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-herb-200 bg-herb-50 px-4 py-2 text-[13.5px] font-bold text-herb-700 hover:bg-herb-700 hover:text-white hover:border-herb-700 transition-colors"
              >
                <CalendarCheck size={15} strokeWidth={2.2} />
                네이버 예약
              </a>
              <HeroChannel href="https://talk.naver.com/ct/w4vt4b" label="네이버 톡톡">
                <MessageCircle size={16} strokeWidth={2} />
              </HeroChannel>
              <HeroChannel href="https://map.naver.com/p/entry/place/13104608" label="네이버 플레이스(지도)">
                <MapPin size={16} strokeWidth={2} />
              </HeroChannel>
              <HeroChannel href="https://www.youtube.com/@isu_hani" label="유튜브">
                <Youtube size={16} strokeWidth={2} />
              </HeroChannel>
              <HeroChannel href="https://www.instagram.com/isuclinic/" label="인스타그램">
                <Instagram size={16} strokeWidth={2} />
              </HeroChannel>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-ink-400 hero-rise-4">
              <div className="inline-flex items-center gap-1.5">
                <ClockSoftIcon size={15} className="text-ink-300" />
                평일 09:30–20:00 · 주말 09:30–15:00
              </div>
              <div className="inline-flex items-center gap-1.5">
                <PinSoftIcon size={15} className="text-ink-300" />
                서울 동작구 사당동 254-5
              </div>
            </div>
          </div>

          {/* ── 스탯 스트립 — 히어로와 한 호흡으로 붙임 ── */}
          <div className="mt-14 md:mt-16 pt-8 border-t border-ink-100 grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 pb-14 md:pb-20">
            {HERO_STATS.map((s, i) => (
              <div key={s.value} className="stat-pop" style={{ animationDelay: `${440 + i * 90}ms` }}>
                <div className="font-serif text-[28px] md:text-[36px] tracking-[-0.03em] text-ink-900 leading-none tabular-nums">
                  {s.value}
                </div>
                <div className="mt-2 text-[12.5px] font-semibold text-ink-700">{s.label}</div>
                <div className="mt-0.5 text-[11px] text-ink-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          2) TREATMENTS — 컬러 테마 카드
          ════════════════════════════════ */}
      <section id="treatments" className="scroll-mt-20 bg-paper border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-14 md:py-24">
          <div className="md:flex md:items-end md:justify-between mb-12 md:mb-14 gap-8">
            <div className="max-w-xl">
              <div className="chip-kr mb-5">진료 영역</div>
              <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.15] tracking-[-0.022em] text-ink-900">
                어디가 불편하세요?
                <br />
                천천히 봐드릴게요.
              </h2>
            </div>
            <p className="hidden md:block max-w-[260px] text-[14px] leading-[1.8] text-ink-400 pb-1">
              증상이 모호해도 괜찮아요. 전화 주시면 어느 원장님께 보일지 먼저 안내드려요.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {TREATMENT_LIST.map((t, i) => {
              const Icon = TREATMENT_ICONS[t.slug];
              const ca = CARD_ACCENT[t.slug] ?? { accent: "#3a7a56", bg: "#cce8d8" };
              const stagger = (i % 3) + 1;
              return (
                <Link
                  key={t.slug}
                  href={`/treatment/${t.slug}`}
                  className={`group relative block rounded-3xl bg-white pt-7 pb-6 px-7 md:px-8 border border-ink-100 overflow-hidden hover:border-ink-200 hover:shadow-[0_16px_48px_-14px_rgba(26,20,16,0.12)] hover:-translate-y-1 transition-all duration-300 reveal-on-scroll reveal-stagger-${stagger}`}
                >
                  {/* 아이콘 */}
                  <div
                    className="inline-flex items-center justify-center w-10 h-10 rounded-xl mb-5 group-hover:opacity-75 transition-opacity duration-300"
                    style={{ background: ca.bg, color: ca.accent }}
                  >
                    {Icon ? <Icon size={21} /> : null}
                  </div>

                  {/* 태그라인 */}
                  <div
                    className="text-[10.5px] font-bold tracking-[0.14em] mb-2.5"
                    style={{ color: ca.accent, opacity: 0.8 }}
                  >
                    {t.tagline}
                  </div>

                  {/* 이름 */}
                  <h3 className="font-serif text-[21px] tracking-[-0.02em] text-ink-900 leading-tight mb-3">
                    {t.name}
                  </h3>

                  {/* 설명 */}
                  <p className="text-[13.5px] leading-[1.74] text-ink-500 line-clamp-3">
                    {t.description}
                  </p>

                  {/* 호버 시 등장하는 화살표 */}
                  <div
                    className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-bold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
                    style={{ color: ca.accent }}
                  >
                    자세히 보기
                    <ArrowRight size={13} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          3) DOCTORS — ghost 한자 카드
          ════════════════════════════════ */}
      <section id="doctors" className="scroll-mt-20 bg-white border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-14 md:py-24">
          <div className="max-w-2xl mb-12 md:mb-16">
            <div className="chip-kr mb-5">원장 소개</div>
            <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.15] tracking-[-0.022em] text-ink-900">
              원장님 세 분이,
              <br />
              늘 같은 자리에 있어요.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.78] text-ink-400">
              한 번 봐드린 분은 다음에 오셨을 때 알아봐드려요.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5">
            {DOCTORS.map((d, i) => (
              <div
                key={d.name}
                className={`relative overflow-hidden rounded-2xl bg-white border border-ink-100 p-8 md:p-9 hover:border-ink-200 hover:shadow-[0_14px_44px_-14px_rgba(26,20,16,0.10)] hover:-translate-y-0.5 transition-all duration-300 reveal-on-scroll reveal-stagger-${i + 1}`}
              >
                {/* ghost 한자 — 카드 개성 */}
                <div
                  aria-hidden
                  className="absolute -right-1 -bottom-5 font-serif text-[144px] leading-none tracking-[-0.04em] text-ink-900 opacity-[0.038] select-none pointer-events-none"
                  style={{ fontFamily: 'var(--font-noto-serif-kr), "Noto Serif KR", serif' }}
                >
                  {d.hanja}
                </div>

                <div className="relative">
                  {/* 역할 */}
                  <div className="text-[10.5px] font-bold tracking-[0.24em] uppercase text-clay-600 mb-3.5">
                    {d.role}
                  </div>

                  {/* 이름 */}
                  <h3 className="font-serif text-[30px] md:text-[34px] tracking-[-0.03em] text-ink-900 leading-none mb-5">
                    {d.name}
                  </h3>

                  {/* 소개 */}
                  <p className="text-[14px] leading-[1.78] text-ink-600 mb-6">
                    {d.intro}
                  </p>

                  {/* 진료 분야 */}
                  <div className="pt-5 border-t border-ink-100">
                    <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-ink-400 mb-3">
                      진료 분야
                    </div>
                    <ul className="space-y-1.5">
                      {d.specialties.map((s) => (
                        <li key={s} className="flex items-baseline gap-2 text-[13.5px] text-ink-700">
                          <span className="text-herb-400 shrink-0 leading-none">·</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 md:mt-12">
            <Link
              href="/visit-guide"
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-900 hover:text-herb-700 border-b border-ink-300 hover:border-herb-700 pb-0.5 transition-colors"
            >
              처음 방문 가이드 보기
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          4) JOURNAL PREVIEW
          ════════════════════════════════ */}
      <section id="journal" className="scroll-mt-20 bg-paper border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-14 md:py-24">
          <div className="md:flex md:items-end md:justify-between mb-12 md:mb-14 gap-8">
            <div>
              <div className="chip-kr mb-5">건강 칼럼</div>
              <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.15] tracking-[-0.022em] text-ink-900">
                진료실 밖에서도
                <br />
                계속 쓰고 있어요.
              </h2>
              <p className="mt-4 text-[14.5px] leading-[1.78] text-ink-400 max-w-sm">
                25년간 환자분들이 가장 많이 묻는 이야기 1,042편이에요.
                한 편만 읽고 오셔도 진료가 한결 편해져요.
              </p>
            </div>
            <Link
              href="/journal"
              className="hidden md:inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-900 hover:text-herb-700 border-b border-ink-300 hover:border-herb-700 pb-0.5 transition-colors shrink-0"
            >
              저널 1,042편 전체 보기
              <ArrowRight size={14} />
            </Link>
          </div>

          <div data-cms-skip className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {featured.map((p, i) => (
              <Link
                key={p.logNo}
                href={`/${p.logNo}`}
                className={`group block reveal-on-scroll reveal-stagger-${i + 1}`}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-2xl mb-4 relative bg-paper-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-herb-50 via-paper-100 to-clay-50 flex items-center justify-center">
                    <svg viewBox="0 0 32 32" width="52" height="52" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="text-herb-500/25" aria-hidden>
                      <path d="M6 26 C 8 16, 16 8, 26 6 C 24 16, 16 24, 6 26 Z" />
                      <path d="M9 23 L 22 10" />
                    </svg>
                  </div>
                  {p.thumbnail && (
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                      style={{ backgroundImage: `url("${p.thumbnail}")` }}
                      role="img"
                      aria-label={p.title}
                    />
                  )}
                </div>

                <div className="text-[11px] font-bold tracking-[0.12em] text-herb-700 mb-2">
                  {p.category}
                </div>
                <h3 className="font-serif text-[17px] tracking-[-0.015em] text-ink-900 leading-[1.35] mb-2 line-clamp-2 group-hover:text-herb-700 transition-colors">
                  {p.title}
                </h3>
                <p className="text-[13px] leading-[1.65] text-ink-400 line-clamp-2">
                  {p.excerpt}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-10 md:hidden">
            <Link href="/journal" className="inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-900 border-b border-ink-300 pb-0.5">
              저널 1,042편 전체 보기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          5) FAQ
          ════════════════════════════════ */}
      <section id="faq" className="scroll-mt-20 bg-white border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-14 md:py-24">
          <div className="md:grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4 mb-10 md:mb-0">
              <div className="chip-kr mb-5">자주 묻는 질문</div>
              <h2 className="font-serif text-[30px] md:text-[42px] leading-[1.15] tracking-[-0.022em] text-ink-900 mb-5">
                전화 걸기 전에
                <br />
                궁금한 것들.
              </h2>
              <p className="text-[14px] leading-[1.78] text-ink-400 mb-7">
                처음 오시는 분들이 가장 많이 묻는 8가지를 정리해 두었어요.
              </p>
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-ink-200 hover:border-ink-900 text-ink-800 text-[13.5px] font-semibold transition-colors"
              >
                <Phone size={14} strokeWidth={2.5} />
                바로 통화 02-584-1075
              </a>
            </div>

            <div className="md:col-span-8 divide-y divide-ink-100 border-y border-ink-100">
              {[
                { q: "추나요법은 건강보험 적용되나요?",          a: "네, 2019년 4월부터 건강보험이 적용됩니다. 단순 추나 1만원대, 복잡 추나 2~3만원대 본인부담입니다. 자동차보험 한방치료도 가능해요." },
                { q: "한약 먹으면 간이 나빠진다던데요?",          a: "한의사 처방을 따라 복용하는 한약은 약물성 간 손상 위험이 통계적으로 유의하지 않다는 임상 메타 연구가 있습니다. 다만 다이어트용 마황 함유 한약은 두근거림·불면 등 부작용이 가능하니 진료 시 솔직히 안내드립니다." },
                { q: "공진단·경옥고는 얼마인가요?",               a: "체질·증상 진단 후 처방되는 비급여 보약입니다. 공진단은 1환 단위, 경옥고는 단위별로 가격이 달라요. 정확한 비용은 02-584-1075로 문의 주시거나 진료 후 견적을 드립니다. 무리한 권유는 하지 않습니다." },
                { q: "처음 방문할 때 뭘 가져가야 하나요?",        a: "신분증(건강보험 적용 시 필수)이면 충분합니다. 최근 복용 중인 약·한약 정보, 증상 시작 시점·통증 부위 메모를 가져오시면 진료가 정확해요." },
                { q: "초진은 시간이 얼마나 걸리나요?",            a: "초진은 30~50분 정도. 접수·문진(5분) → 원장 상담(10~15분) → 침·추나(20분) → 한약 처방 상담(선택, 5분) → 수납·다음 예약(5분) 순서입니다." },
                { q: "다이어트 한약 부작용 있나요?",              a: "마황 성분이 들어간 다이어트 한약은 두근거림·갈증·불면이 나타날 수 있습니다. 진료 시 체질·기저질환·복용 약 확인 후 처방하며, 부작용 발생 시 바로 중단·조정하실 수 있도록 카카오톡으로 컨디션을 추적합니다." },
                { q: "어린이 한약은 몇 살부터 먹일 수 있나요?",   a: "보통 만 3세 이상부터 처방합니다. 키 성장 한약은 연령·체질·성장 단계에 따라 처방 내용이 달라지며, 부모님 동반 진료를 권장합니다." },
                { q: "전용 주차장이 있나요?",                    a: "전용 주차장은 없습니다. 인근 공영주차장을 이용해 주시거나, 7호선 남성역 1번 출구에서 도보 1분이라 대중교통을 권장드려요." },
              ].map((f, i) => (
                <details key={f.q} className={`group py-5 reveal-on-scroll reveal-stagger-${(i % 4) + 1}`}>
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                    <span className="font-serif text-[16.5px] md:text-[18px] tracking-[-0.015em] text-ink-900 leading-[1.45] flex-1">
                      {f.q}
                    </span>
                    <span
                      aria-hidden
                      className="shrink-0 mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full border border-ink-200 text-ink-500 group-open:bg-herb-700 group-open:text-white group-open:border-herb-700 group-open:rotate-45 transition-all duration-300"
                    >
                      <span className="text-[13px] leading-none">＋</span>
                    </span>
                  </summary>
                  <p className="mt-3 pr-10 text-[14px] leading-[1.78] text-ink-600">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          6) 첫 방문 플로우
          ════════════════════════════════ */}
      <section id="flow" className="scroll-mt-20 bg-paper border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-24">
          <VisitFlow />
        </div>
      </section>

      {/* ════════════════════════════════
          7) LOCATION
          ════════════════════════════════ */}
      <section id="visit" className="scroll-mt-20 bg-white border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="chip-kr mb-5">오시는 길</div>
              <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.15] tracking-[-0.022em] text-ink-900 mb-5">
                남성역 1번 출구
                <br />
                도보 1분.
              </h2>
              <p className="text-[15px] leading-[1.78] text-ink-600 mb-7">
                서울 동작구 사당동 254-5
                <br />
                7호선 남성역 1번 출구 도보 1분
              </p>

              <a
                href="https://map.naver.com/p/search/이수한의원%20사당동"
                target="_blank"
                rel="noreferrer noopener"
                className="group mb-7 block rounded-2xl overflow-hidden border border-ink-200 bg-white aspect-[16/10] relative hover:border-ink-400 transition-colors"
                aria-label="네이버 지도로 이수한의원 위치 보기"
              >
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=126.9710%2C37.4836%2C126.9760%2C37.4876&layer=mapnik&marker=37.4856%2C126.9735"
                  title="이수한의원 위치 지도"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="px-3 py-1.5 bg-white rounded-full shadow-[0_4px_16px_-4px_rgba(26,20,16,0.22)] border border-ink-100 flex items-center gap-1.5 text-[12.5px] font-bold text-ink-900">
                    <PinSoftIcon size={13} className="text-herb-700" />
                    이수한의원
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-ink-900/85 text-white text-[11px] font-semibold rounded-full">
                  네이버 지도 →
                </div>
              </a>

              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:0285841075"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ink-900 hover:bg-herb-700 text-white text-[15px] font-bold tabular-nums transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Phone size={16} strokeWidth={2.5} />
                  02-584-1075
                </a>
                <a
                  href="https://map.naver.com/p/search/이수한의원%20사당동"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-ink-200 hover:border-ink-900 text-ink-800 text-[15px] font-semibold transition-colors"
                >
                  <PinSoftIcon size={16} />
                  네이버 지도
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-paper p-7 md:p-9 border border-ink-100">
                <div className="chip-kr mb-6">진료 시간</div>
                <ul className="divide-y divide-ink-100">
                  {HOURS.map((h) => (
                    <li key={h.day} className="flex items-center justify-between py-4">
                      <span className={["text-[15.5px] font-semibold", h.muted ? "text-ink-300" : "text-ink-900"].join(" ")}>
                        {h.day}
                      </span>
                      <span className={["text-[15.5px] tabular-nums", h.muted ? "text-ink-300" : "text-ink-700"].join(" ")}>
                        {h.time}
                        {h.note && (
                          <span className="ml-2 text-[11px] font-bold text-clay-500">· {h.note}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-5 border-t border-ink-100 flex items-start gap-2 text-[13px] text-ink-400 leading-[1.7]">
                  <ClockSoftIcon size={15} className="mt-0.5 shrink-0" />
                  마지막 접수는 진료 종료 30분 전. 점심시간 운영은 전화로 안내.
                </div>
              </div>

              <Link
                href="/visit-guide"
                className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-bold text-ink-900 hover:text-herb-700 border-b border-ink-300 hover:border-herb-700 pb-0.5 transition-colors"
              >
                처음 방문 가이드
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StickyMobileCTA />
      <ScrollJourney
        sections={[
          { id: "hero",       label: "홈" },
          { id: "treatments", label: "진료 영역" },
          { id: "doctors",    label: "원장 소개" },
          { id: "journal",    label: "건강 칼럼" },
          { id: "faq",        label: "자주 묻는 질문" },
          { id: "flow",       label: "첫 방문" },
          { id: "visit",      label: "오시는 길" },
        ]}
      />
      <div className="md:hidden h-20" aria-hidden />
    </div>
  );
}
