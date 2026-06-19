import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Train, Bus, Car, ChevronRight } from "lucide-react";
import { VisitFlow } from "@/components/sections/VisitFlow";
import { ScrollJourney, type JourneySection } from "@/components/landing/ScrollJourney";
import { SITE_URL } from "@/lib/site";

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["#step-01", "#step-02", "#step-03", "#step-06"],
  },
  mainEntity: [
    {
      "@type": "Question",
      name: "이수한의원 예약은 어떻게 하나요?",
      acceptedAnswer: { "@type": "Answer", text: "전화 예약(02-584-1075)이 가장 빠릅니다. 워크인도 가능하나 대기 시간이 있을 수 있어 전화 예약을 권장합니다. 마지막 접수는 진료 종료 30분 전입니다." },
    },
    {
      "@type": "Question",
      name: "이수한의원 진료시간이 어떻게 되나요?",
      acceptedAnswer: { "@type": "Answer", text: "평일(월~금) 09:30~20:00 야간진료, 토·일 09:30~15:00, 공휴일 휴진입니다." },
    },
    {
      "@type": "Question",
      name: "남성역에서 이수한의원까지 얼마나 걸리나요?",
      acceptedAnswer: { "@type": "Answer", text: "서울 지하철 7호선 남성역 1번 출구에서 도보 1분 거리입니다. 주소: 서울 동작구 사당로 218-1 2층." },
    },
    {
      "@type": "Question",
      name: "이수한의원 주차가 가능한가요?",
      acceptedAnswer: { "@type": "Answer", text: "전용 주차장은 없으며 인근 공영주차장을 이용하실 수 있습니다. 자세한 안내는 전화(02-584-1075)로 도와드립니다." },
    },
    {
      "@type": "Question",
      name: "추나요법은 건강보험이 되나요?",
      acceptedAnswer: { "@type": "Answer", text: "근골격계 질환(허리디스크, 목디스크, 골반 불균형 등)이 있는 경우 건강보험 적용이 가능합니다. 진료 후 원장님이 안내해 드립니다." },
    },
    {
      "@type": "Question",
      name: "어린이도 진료 가능한가요?",
      acceptedAnswer: { "@type": "Answer", text: "네. 어린이 성장클리닉, 성조숙증 진료, 소아 비염 등을 진료합니다. 부모님 동반 시 더 정확한 진료가 가능합니다." },
    },
    {
      "@type": "Question",
      name: "진료 시간은 얼마나 걸리나요?",
      acceptedAnswer: { "@type": "Answer", text: "첫 진료는 상담·진찰·시술 포함 약 30~40분 소요됩니다. 재진은 15~20분입니다." },
    },
  ],
};

export const metadata: Metadata = {
  title: "처음 방문 가이드 — 이수한의원",
  description:
    "이수한의원에 처음 방문하시는 분을 위한 안내. 예약 방법, 진료 시간, 위치, 보험 적용, 자주 묻는 질문.",
  alternates: { canonical: `${SITE_URL}/visit-guide` },
};

const CONTENT_SECTIONS: JourneySection[] = [
  { id: "step-01", label: "예약 방법" },
  { id: "step-02", label: "진료 시간" },
  { id: "step-03", label: "오시는 길" },
  { id: "step-04", label: "첫 진료 준비" },
  { id: "step-05", label: "보험 · 비용" },
  { id: "step-06", label: "자주 묻는 질문" },
];

export default function VisitGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <VisitGuideContent />
    </>
  );
}

function VisitGuideContent() {
  return (
    <article className="bg-white">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-16">

        {/* ── 마스트헤드 (full-width) ── */}
        <header id="intro" className="scroll-mt-24 text-center pb-10 md:pb-14 border-b border-ink-200">
          <div className="text-[12px] tracking-[0.3em] uppercase text-herb-700 font-bold mb-3">
            Visit Guide · 처음 오시나요?
          </div>
          <h1 className="font-serif text-[36px] md:text-[56px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
            처음 방문하시는 분을
            <br />
            위한 안내.
          </h1>
          <p className="mt-5 text-base md:text-lg text-ink-700 leading-[1.78] max-w-xl mx-auto">
            예약 · 위치 · 진료시간 · 보험 적용 · 첫 진료 안내까지,
            한 번에 정리했습니다.
          </p>
        </header>

        {/* ── 빠른 동선 카드 (full-width) ── */}
        <section className="grid sm:grid-cols-2 gap-4 mt-10">
          <a
            href="tel:0285841075"
            className="group block p-6 bg-ink-900 text-white hover:bg-herb-700 transition-colors"
          >
            <div className="text-[11px] tracking-[0.2em] uppercase text-white/70 font-bold mb-2">
              전화 예약 / 문의
            </div>
            <div className="font-serif text-[28px] md:text-[32px] font-black tabular-nums leading-none flex items-center gap-3">
              <Phone size={22} />
              02-584-1075
            </div>
            <div className="mt-3 text-sm text-white/80">평일 09:30 – 20:00 · 주말 09:30 – 15:00</div>
          </a>
          <Link
            href="/home#visit"
            className="group block p-6 border border-ink-300 hover:border-ink-900 transition-colors"
          >
            <div className="text-[11px] tracking-[0.2em] uppercase text-herb-700 font-bold mb-2">
              위치 / 약도
            </div>
            <div className="font-serif text-[22px] md:text-[24px] font-black text-ink-900 leading-tight">
              7호선 남성역 1번 출구
              <br />
              도보 1분
            </div>
            <div className="mt-3 text-sm text-ink-600 inline-flex items-center gap-1">
              지도 자세히 보기 <ChevronRight size={14} />
            </div>
          </Link>
        </section>

        {/* ── 첫 방문 흐름 단계 시각화 (full-width) ── */}
        <section className="mt-14 pb-14 border-b border-ink-200">
          <VisitFlow
            eyebrow="First Visit · 진행 흐름"
            subtitle="도착부터 관리까지 다섯 단계로 진행됩니다."
          />
        </section>

        {/* ── 2-컬럼: TOC 사이드바 (lg+) + 본문 섹션 ── */}
        <div className="lg:grid lg:grid-cols-[196px_1fr] lg:gap-16 lg:items-start">

          {/* LEFT: sticky 목차 (lg+ only) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 pt-10">
              <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-ink-400 mb-4">
                목차
              </p>
              <ScrollJourney sections={CONTENT_SECTIONS} variant="sticky" />
            </div>
          </aside>

          {/* RIGHT: 본문 섹션들 */}
          <div>

            <Section number="01" title="예약 방법">
              <p>
                이수한의원은 <strong>전화 예약</strong>이 가장 빠릅니다.
                평일 야간(저녁 8시까지)과 주말에도 진료하므로, 직장인·학생도 편하게 방문하실 수 있습니다.
              </p>
              <ul className="mt-4 space-y-2.5">
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>전화 예약</strong> 02-584-1075 — 진료 시간 내 언제든.</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>워크인</strong> 가능 — 단, 대기 시간이 있을 수 있어 전화 예약 권장.</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>마지막 접수</strong>는 진료 종료 30분 전까지.</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>점심시간</strong>은 별도 운영 — 전화로 안내드립니다.</span></li>
              </ul>
            </Section>

            <Section number="02" title="진료 시간">
              <ul className="border border-ink-200 divide-y divide-ink-200">
                {[
                  { day: "월 ~ 금", time: "09:30 – 20:00", note: "야간진료" },
                  { day: "토 · 일", time: "09:30 – 15:00", note: "주말진료" },
                  { day: "공휴일", time: "휴진", note: "" },
                ].map((row) => (
                  <li key={row.day} className="flex items-center justify-between px-5 py-4">
                    <span className="font-semibold text-ink-900 w-24">{row.day}</span>
                    <span className="hidden sm:inline text-[11px] tracking-[0.18em] uppercase text-ink-500">
                      {row.note}
                    </span>
                    <span className={`tabular-nums font-semibold ${row.time === "휴진" ? "text-ink-500" : "text-ink-900 text-base"}`}>
                      {row.time}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-ink-600">
                ※ 명절 휴진 / 임시 휴진 일정은 메인 페이지 상단 공지 또는 한의원 STORY 카테고리를 확인해 주세요.
              </p>
            </Section>

            <Section number="03" title="오시는 길">
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <Train size={18} className="text-herb-700 mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink-900">지하철</div>
                    <div className="text-ink-700 mt-1">7호선 <strong>남성역 1번 출구</strong> 도보 1분</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Bus size={18} className="text-herb-700 mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink-900">버스</div>
                    <div className="text-ink-700 mt-1">남성역 정류장 인근 다수 노선 정차</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <Car size={18} className="text-herb-700 mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold text-ink-900">자가용</div>
                    <div className="text-ink-700 mt-1">인근 공영주차장 이용. 주차 안내는 전화로 문의.</div>
                  </div>
                </li>
              </ul>
              <div className="mt-6 text-sm text-ink-700">
                <strong className="text-ink-900">주소</strong> · 서울특별시 동작구 사당동 254-5
              </div>
            </Section>

            <Section number="04" title="첫 진료 시 준비">
              <ul className="space-y-2.5">
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>신분증</strong> (건강보험 적용 시 필수)</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>최근 복용 중인 약 / 한약</strong> 정보가 있으면 가져오세요.</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>증상 시작 시점 / 통증 부위</strong>를 미리 정리하시면 진료가 빠릅니다.</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>편한 복장</strong> — 추나·침 시술을 받을 수 있어 활동성 좋은 옷이 편합니다.</span></li>
              </ul>
            </Section>

            <Section number="05" title="보험 적용 · 비용">
              <p>
                이수한의원은 <strong>건강보험</strong>이 적용됩니다.
              </p>
              <ul className="mt-4 space-y-2.5">
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>침 · 추나요법</strong> — 건강보험 적용</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>자동차보험 한방치료</strong> — 교통사고 후유증 진료 시 적용</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span><strong>한약 처방 · 공진단 · 경옥고</strong> — 비급여 (정확한 비용은 처방 후 안내)</span></li>
                <li className="flex gap-3"><span className="text-herb-700 mt-1">·</span><span>실손 보험은 약관에 따라 청구 가능합니다.</span></li>
              </ul>
            </Section>

            <Section number="06" title="자주 묻는 질문">
              <Faq q="진료 시간은 얼마나 걸리나요?">
                첫 진료는 상담 + 진찰 + 시술까지 약 30 ~ 40분 정도 소요됩니다. 재진은 15 ~ 20분.
              </Faq>
              <Faq q="추나요법은 한 번으로 효과가 있나요?">
                증상 정도에 따라 다릅니다. 만성 통증의 경우 보통 5 ~ 10회 시술이 권장됩니다. 첫 상담 후 원장님이 회차를 안내드립니다.
              </Faq>
              <Faq q="공진단은 어떻게 처방되나요?">
                체질·증상·복용 기간에 따라 처방이 달라집니다. 진료 후 원장님이 직접 처방해 드리며, 자세한 안내는 공진단 FAQ 글을 참고해 주세요.
              </Faq>
              <Faq q="어린이도 진료 가능한가요?">
                네. 어린이 성장 클리닉, 성조숙증 진료, 소아 비염 등 진료합니다. 부모님 동반 시 더 정확한 진료가 가능합니다.
              </Faq>
            </Section>

            {/* 마무리 CTA */}
            <div className="mt-16 pt-10 border-t-2 border-ink-900 text-center">
              <h2 className="font-serif text-2xl md:text-[32px] font-black tracking-[-0.025em] text-ink-900 leading-tight">
                준비되셨나요?
                <br />
                전화 예약으로 바로 시작합니다.
              </h2>
              <a
                href="tel:0285841075"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3.5 bg-ink-900 text-white text-sm font-semibold tabular-nums hover:bg-herb-700 transition-colors"
              >
                <Phone size={16} />
                02-584-1075 전화 예약
              </a>
            </div>

          </div>
        </div>
      </div>
    </article>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={`step-${number}`} className="scroll-mt-24 mt-12 pt-10 border-t border-ink-200">
      <div className="flex items-baseline gap-4 mb-5">
        <span className="font-serif text-[12px] tracking-[0.2em] text-ink-400 tabular-nums">
          {number}
        </span>
        <h2 className="font-serif text-[24px] md:text-[28px] font-black tracking-[-0.025em] text-ink-900">
          {title}
        </h2>
      </div>
      <div className="text-[15px] md:text-base text-ink-700 leading-[1.78]">{children}</div>
    </section>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-ink-200 py-4">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <span className="font-semibold text-ink-900">{q}</span>
        <ChevronRight size={16} className="text-ink-500 group-open:rotate-90 transition-transform" />
      </summary>
      <div className="mt-3 text-ink-700 leading-[1.78]">{children}</div>
    </details>
  );
}
