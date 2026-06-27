import Link from "next/link";
import type { Metadata } from "next";
import { Phone, Train, Bus, Car } from "lucide-react";
import { VisitFlow } from "@/components/sections/VisitFlow";
import { VisitGuideToc } from "@/components/visit/VisitGuideToc";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "처음 방문 가이드 — 이수한의원",
  description:
    "이수한의원에 처음 방문하시는 분을 위한 안내. 예약 방법, 진료 시간, 위치, 보험 적용, 자주 묻는 질문.",
  alternates: { canonical: `${SITE_URL}/visit-guide` },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "이수한의원 예약은 어떻게 하나요?", acceptedAnswer: { "@type": "Answer", text: "전화 예약(02-584-1075)이 가장 빠릅니다. 마지막 접수는 진료 종료 30분 전입니다." } },
    { "@type": "Question", name: "이수한의원 진료시간이 어떻게 되나요?", acceptedAnswer: { "@type": "Answer", text: "평일(월~금) 09:30~20:00 야간진료, 토·일 09:30~15:00, 공휴일 휴진입니다." } },
    { "@type": "Question", name: "남성역에서 이수한의원까지 얼마나 걸리나요?", acceptedAnswer: { "@type": "Answer", text: "서울 지하철 7호선 남성역 1번 출구에서 도보 1분 거리입니다." } },
  ],
};

export default function VisitGuidePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />

      {/* ════════════════════════════════
          HERO — 따뜻한 환영
          ════════════════════════════════ */}
      <section className="bg-herb-50/60 border-b border-herb-100">
        <div className="max-w-5xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-16 md:pb-22">
          <div className="chip-kr mb-6">처음 방문 안내</div>

          <h1 className="font-serif text-[30px] md:text-[58px] leading-[1.08] tracking-[-0.025em] text-ink-900">
            처음이어도,
            <br />
            <span className="text-herb-700">편하게 오세요.</span>
          </h1>

          <p className="mt-6 text-[16px] md:text-[18px] leading-[1.82] text-ink-600 max-w-lg">
            25년 동안 사당동에서 환자분들을 기다려왔어요.
            <br className="hidden md:block" />
            예약부터 첫 진료까지, 천천히 안내해 드릴게요.
          </p>

          {/* 빠른 동선 카드 */}
          <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-xl">
            <a
              href="tel:0285841075"
              className="group flex items-center gap-4 p-5 rounded-2xl bg-herb-700 hover:bg-herb-900 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(45,110,90,0.4)]"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/15">
                <Phone size={20} strokeWidth={2} />
              </span>
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-white/60 mb-0.5">전화 예약</div>
                <div className="font-serif text-[20px] font-black tabular-nums leading-none">02-584-1075</div>
              </div>
            </a>

            <Link
              href="/home#visit"
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-herb-200 hover:border-herb-400 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(45,110,90,0.12)]"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-herb-50">
                <Train size={19} className="text-herb-700" strokeWidth={2} />
              </span>
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-herb-700 mb-0.5">오시는 길</div>
                <div className="font-serif text-[16px] font-black text-ink-900 leading-snug">남성역 1번 출구<br />도보 1분</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          VISIT FLOW
          ════════════════════════════════ */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-20">
          <VisitFlow
            eyebrow="진료 흐름"
            title="이렇게 진행돼요."
            subtitle="도착하시면 접수부터 차근차근 안내해 드려요."
          />
        </div>
      </section>

      {/* ════════════════════════════════
          2-COL: TOC + 본문
          items-start 제거 → 왼쪽 컬럼이 오른쪽 높이만큼 늘어나 sticky 동작
          ════════════════════════════════ */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-20 lg:grid lg:grid-cols-[180px_1fr] lg:gap-16">

          {/* LEFT — sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 pt-1">
              <VisitGuideToc />
            </div>
          </aside>

          {/* RIGHT — 본문 */}
          <div>

            {/* 01 예약 방법 */}
            <GuideSection id="step-01" num="01" title="예약 방법">
              <p className="mb-5">
                전화 예약이 가장 빠릅니다. 평일 야간(저녁 8시까지)과 주말에도 진료하므로 직장인·학생도 편하게 방문하실 수 있어요.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: "전화 예약", desc: "02-584-1075 · 진료 시간 내 언제든" },
                  { label: "워크인 방문", desc: "가능 · 대기 있을 수 있어 전화 권장" },
                  { label: "마지막 접수", desc: "진료 종료 30분 전까지" },
                  { label: "점심시간", desc: "별도 운영 · 전화로 확인해 주세요" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-paper border border-ink-100">
                    <div className="text-[12px] font-bold text-herb-700 mb-1">{item.label}</div>
                    <div className="text-[13.5px] text-ink-600 leading-snug">{item.desc}</div>
                  </div>
                ))}
              </div>
            </GuideSection>

            {/* 02 진료 시간 */}
            <GuideSection id="step-02" num="02" title="진료 시간">
              <div className="rounded-2xl border border-ink-100 overflow-hidden">
                {[
                  { day: "월요일 — 금요일", time: "09:30 – 20:00", badge: "야간진료", active: true },
                  { day: "토요일 · 일요일", time: "09:30 – 15:00", badge: "주말진료", active: true },
                  { day: "공휴일", time: "휴진", badge: "", active: false },
                ].map((row, i) => (
                  <div
                    key={row.day}
                    className={[
                      "flex items-center justify-between px-5 py-4",
                      i < 2 ? "border-b border-ink-100" : "",
                      !row.active ? "opacity-40" : "",
                    ].join(" ")}
                  >
                    <span className="text-[14.5px] font-semibold text-ink-900">{row.day}</span>
                    <div className="flex items-center gap-3">
                      {row.badge && (
                        <span className="hidden sm:inline text-[10.5px] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded-full bg-herb-50 text-herb-700">
                          {row.badge}
                        </span>
                      )}
                      <span className={["tabular-nums text-[15px] font-semibold", row.active ? "text-ink-900" : "text-ink-400"].join(" ")}>
                        {row.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[13px] text-ink-400 leading-[1.7]">
                명절 휴진 · 임시 휴진 일정은 건강 저널 '한의원 story' 카테고리를 확인해 주세요.
              </p>
            </GuideSection>

            {/* 03 오시는 길 */}
            <GuideSection id="step-03" num="03" title="오시는 길">
              <p className="mb-5 text-ink-600">
                <strong className="text-ink-900">서울 동작구 사당동 254-5</strong>
              </p>
              <div className="space-y-3">
                {[
                  { Icon: Train, label: "지하철", desc: "7호선 남성역 1번 출구 도보 1분" },
                  { Icon: Bus,   label: "버스",   desc: "남성역 정류장 인근 다수 노선" },
                  { Icon: Car,   label: "자가용", desc: "인근 공영주차장 이용 · 주차 안내는 전화 문의" },
                ].map(({ Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-paper border border-ink-100">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-herb-50 text-herb-700 shrink-0">
                      <Icon size={17} strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[12px] font-bold text-ink-400 mb-0.5">{label}</div>
                      <div className="text-[14.5px] text-ink-800">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GuideSection>

            {/* 04 첫 진료 준비 */}
            <GuideSection id="step-04" num="04" title="첫 진료 시 준비">
              <p className="mb-5 text-ink-600">
                아래를 미리 준비해 오시면 더 정확하고 빠른 진료가 가능해요.
              </p>
              <div className="space-y-3">
                {[
                  { num: "1", title: "신분증", desc: "건강보험 적용 시 필수입니다." },
                  { num: "2", title: "복용 중인 약·한약 정보", desc: "있으시다면 메모해 오시거나 가져와 주세요." },
                  { num: "3", title: "증상 메모", desc: "언제부터, 어느 부위가, 어떻게 불편한지 간단히 적어 오시면 좋아요." },
                  { num: "4", title: "편한 복장", desc: "추나·침 시술을 받을 수 있어 활동하기 좋은 옷을 권합니다." },
                ].map((item) => (
                  <div key={item.num} className="flex gap-4 p-4 rounded-xl bg-paper border border-ink-100">
                    <span className="font-serif text-[13px] font-black text-herb-700/50 tabular-nums mt-0.5 shrink-0 w-5">
                      {item.num}
                    </span>
                    <div>
                      <div className="text-[14.5px] font-semibold text-ink-900 mb-0.5">{item.title}</div>
                      <div className="text-[13.5px] text-ink-500 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </GuideSection>

            {/* 05 보험·비용 */}
            <GuideSection id="step-05" num="05" title="보험 적용 · 비용">
              <p className="mb-5 text-ink-600">
                이수한의원은 건강보험 적용 기관입니다. 아래 항목을 참고해 주세요.
              </p>
              <div className="space-y-2.5">
                {[
                  { type: "건강보험 적용", items: ["침 치료", "추나요법 (근골격계 진단 시)", "일반 진료"] },
                  { type: "자동차보험", items: ["교통사고 후유증 한방치료"] },
                  { type: "비급여", items: ["한약 처방", "공진단 · 경옥고 (처방 후 비용 안내)", "실손보험 청구 가능 (약관 확인)"] },
                ].map((group) => (
                  <div key={group.type} className="rounded-xl border border-ink-100 overflow-hidden">
                    <div className="px-4 py-2.5 bg-paper border-b border-ink-100">
                      <span className="text-[11.5px] font-bold text-ink-600 tracking-[0.06em]">{group.type}</span>
                    </div>
                    <ul className="px-4 py-3 space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-baseline gap-2 text-[14px] text-ink-700">
                          <span className="text-herb-400 shrink-0">·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </GuideSection>

            {/* 06 자주 묻는 질문 */}
            <GuideSection id="step-06" num="06" title="자주 묻는 질문">
              <div className="divide-y divide-ink-100 border-y border-ink-100">
                {[
                  { q: "진료 시간은 얼마나 걸리나요?", a: "첫 진료는 상담 + 진찰 + 시술 포함 약 30~40분 소요됩니다. 재진은 15~20분 정도예요." },
                  { q: "추나요법은 한 번으로 효과가 있나요?", a: "증상 정도에 따라 다릅니다. 만성 통증의 경우 보통 5~10회 시술이 권장됩니다. 첫 상담 후 원장님이 회차를 안내드려요." },
                  { q: "공진단은 어떻게 처방되나요?", a: "체질·증상·복용 기간에 따라 처방이 달라집니다. 진료 후 원장님이 직접 처방해 드리며, 가격은 사전에 안내드립니다." },
                  { q: "어린이도 진료 가능한가요?", a: "네, 어린이 성장클리닉·성조숙증·소아 비염 등을 진료합니다. 부모님 동반 시 더 정확한 진료가 가능해요." },
                  { q: "주차는 어떻게 하나요?", a: "전용 주차장은 없습니다. 남성역 1번 출구에서 도보 1분이라 대중교통을 권해드려요. 공영주차장 안내가 필요하시면 전화 주세요." },
                ].map((f) => (
                  <details key={f.q} className="group py-5">
                    <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                      <span className="font-serif text-[16px] md:text-[17.5px] tracking-[-0.015em] text-ink-900 leading-[1.45] flex-1">
                        {f.q}
                      </span>
                      <span
                        aria-hidden
                        className="shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full border border-ink-200 text-ink-400 group-open:bg-herb-700 group-open:text-white group-open:border-herb-700 group-open:rotate-45 transition-all duration-300"
                      >
                        <span className="text-[13px] leading-none">＋</span>
                      </span>
                    </summary>
                    <p className="mt-3 pr-6 md:pr-10 text-[14.5px] leading-[1.78] text-ink-600">{f.a}</p>
                  </details>
                ))}
              </div>
            </GuideSection>

          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          BOTTOM CTA — 따뜻한 마무리
          ════════════════════════════════ */}
      <section className="bg-herb-50/60 border-t border-herb-100">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-12 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <div className="chip-kr mb-4">전화 예약</div>
              <h2 className="font-serif text-[28px] md:text-[36px] leading-[1.18] tracking-[-0.025em] text-ink-900">
                준비되셨나요?
                <br />
                전화 한 통이면 됩니다.
              </h2>
              <p className="mt-3 text-[14.5px] text-ink-500 leading-[1.78]">
                어떤 증상이든, 어느 원장님께 가야 할지도 안내해 드려요.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-herb-700 hover:bg-herb-900 text-white text-[15px] font-bold tabular-nums shadow-[0_8px_24px_-8px_rgba(45,110,90,0.35)] hover:shadow-[0_12px_32px_-8px_rgba(45,110,90,0.48)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <Phone size={16} strokeWidth={2.5} />
                02-584-1075
              </a>
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-ink-200 hover:border-ink-900 text-ink-800 text-[15px] font-semibold transition-colors"
              >
                쑤에게 물어보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ── 섹션 래퍼 ── */
function GuideSection({
  id,
  num,
  title,
  children,
}: {
  id: string;
  num: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 pt-8 pb-8 md:pt-12 md:pb-12 border-b border-ink-100 last:border-b-0">
      <div className="flex items-baseline gap-3 mb-5 md:mb-6">
        <span className="font-serif text-[11px] tracking-[0.24em] tabular-nums text-ink-300">{num}</span>
        <h2 className="font-serif text-[21px] md:text-[28px] font-black tracking-[-0.025em] text-ink-900">
          {title}
        </h2>
      </div>
      <div className="text-[15px] md:text-[15.5px] text-ink-700 leading-[1.8]">
        {children}
      </div>
    </section>
  );
}
