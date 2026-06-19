import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  ArrowRight,
  ArrowUp,
  Activity,
  Leaf,
  Baby,
  HeartPulse,
  Receipt,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { SsuMascot } from "@/components/chat/SsuMascot";
import { VisitFlow } from "@/components/sections/VisitFlow";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "쑤에게 물어보세요 — AI 한방 상담 | 이수한의원",
  description:
    "그 증상, 한방으로 될까? 시세·치료·비용·예약까지 이수한의원 AI 상담 쑤에게 먼저 편하게 물어보세요. 진단이 아닌, 길잡이입니다.",
  alternates: { canonical: `${SITE_URL}/ask` },
};

/* ── "이런 것도 물어보세요" 예시 질문 (treatments 7카테고리 기반) ── */
const ASK_GROUPS: {
  icon: LucideIcon;
  label: string;
  questions: string[];
}[] = [
  {
    icon: Activity,
    label: "증상 · 통증",
    questions: [
      "허리 디스크, 한방으로 좋아질까요?",
      "어깨가 자주 결려요. 침이 도움될까요?",
      "교통사고 후유증도 진료되나요?",
    ],
  },
  {
    icon: Leaf,
    label: "보약 · 체력",
    questions: [
      "수능 앞둔 아이 체력 보강하고 싶어요",
      "공진단, 저한테 맞을까요?",
      "요즘 너무 피곤한데 보약 필요할까요?",
    ],
  },
  {
    icon: HeartPulse,
    label: "여성 · 산후조리",
    questions: [
      "산후조리 한약은 언제부터 먹나요?",
      "갱년기 증상도 한방치료 되나요?",
      "임신 준비 중인데 상담 가능한가요?",
    ],
  },
  {
    icon: Baby,
    label: "소아 · 성장",
    questions: [
      "아이 키 성장클리닉이 궁금해요",
      "소아 비염도 한방으로 보나요?",
      "성조숙증 진료는 어떻게 진행돼요?",
    ],
  },
  {
    icon: Receipt,
    label: "비용 · 보험",
    questions: [
      "추나요법, 건강보험 되나요?",
      "한약 한 제 비용이 궁금해요",
      "실손보험 청구 가능한가요?",
    ],
  },
  {
    icon: CalendarCheck,
    label: "예약 · 방문",
    questions: [
      "오늘 진료하나요?",
      "주차 가능한가요?",
      "남성역에서 어떻게 가나요?",
    ],
  },
];

/* ── 샘플 대화 쇼케이스 (chatLogic 톤 그대로) ── */
const SAMPLES: {
  tag: string;
  desc: string;
  turns: { who: "me" | "ssu"; text: string }[];
}[] = [
  {
    tag: "막연한 증상",
    desc: "어디부터 물어야 할지 몰라도 괜찮아요.",
    turns: [
      { who: "me", text: "요즘 허리가 자주 아픈데, 한의원 가야 할까요?" },
      {
        who: "ssu",
        text:
          "허리 통증은 자세·디스크·근육 긴장 등 원인이 다양해서, 한방에서는 추나요법·침 치료로 접근하는 경우가 많아요. 정확한 원인은 내원 진찰이 필요하지만, 어떤 상황에서 더 아프신지 알려주시면 관련 정보를 먼저 정리해드릴게요.",
      },
      { who: "me", text: "앉아 있다가 일어설 때 특히 심해요" },
      {
        who: "ssu",
        text:
          "그런 양상은 자세·디스크와 관련된 경우가 많아 추나요법 상담을 권하는 편이에요. 진료 시간 안내해드리고, 첫 방문 흐름도 같이 알려드릴까요?",
      },
    ],
  },
  {
    tag: "보약 관심",
    desc: "구매 결정 전이라도 편하게.",
    turns: [
      { who: "me", text: "수능 앞둔 아이 체력 보강해주고 싶어요" },
      {
        who: "ssu",
        text:
          "수험생 보약은 체질·수면·소화 상태에 맞춰 처방드려요. 공진단·한방 보약 등 선택지가 있는데, 아이 나이와 주로 힘들어하는 부분(집중력·피로·식욕 등)을 알려주시면 어떤 상담이 맞을지 안내해드릴게요.",
      },
      { who: "me", text: "고3이고 늘 피곤해해요" },
      {
        who: "ssu",
        text:
          "피로 위주라면 진료 후 체질에 맞춘 보약을 권하는 경우가 많아요. 정확한 처방은 진찰이 필요하고, 공진단 FAQ 칼럼도 함께 보여드릴게요.",
      },
    ],
  },
  {
    tag: "예약 · 방문",
    desc: "방문 전에 궁금한 건 다.",
    turns: [
      { who: "me", text: "오늘 진료하나요? 주차도 되나요?" },
      {
        who: "ssu",
        text:
          "평일은 09:30–20:00(야간진료), 토·일은 09:30–15:00 진료하고 공휴일은 휴진이에요. 전용 주차장은 없어 인근 공영주차장을 이용하시면 되고, 자세한 길 안내는 전화로 도와드려요.",
      },
      { who: "me", text: "그럼 예약은 어떻게 해요?" },
      {
        who: "ssu",
        text:
          "전화 예약(02-584-1075)이 가장 빠르고, 워크인도 가능해요. 다만 대기 시간이 있을 수 있어 전화 예약을 권해드려요.",
      },
    ],
  },
];

export default function AskPage() {
  return (
    <div className="bg-white">
      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-paper-50">
        {/* 부드러운 herb 글로우 — 토스식 절제된 배경 */}
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(111,176,122,0.18) 0%, rgba(111,176,122,0) 65%)",
          }}
        />
        <div className="relative max-w-container mx-auto px-5 md:px-8 pt-24 md:pt-32 pb-16 md:pb-24 text-center">
          <div className="hero-rise-1 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-4 py-2 text-[12px] font-bold tracking-[0.08em] text-herb-700 shadow-[0_2px_10px_-2px_rgba(26,20,16,0.08)]">
            <SsuMascot size={20} />
            ISUHANI · AI 상담
          </div>

          <h1 className="hero-rise-2 mt-7 font-serif text-[34px] md:text-[56px] font-bold tracking-[-0.03em] text-ink-900 leading-[1.18]">
            그 증상, 한방으로 될까?
            <br />
            <span className="text-herb-700">쑤</span>에게 먼저 물어보세요.
          </h1>
          <p className="hero-rise-3 mt-6 mx-auto max-w-[34rem] text-[15px] md:text-[17px] text-ink-600 leading-[1.75]">
            증상·치료·비용·예약까지, 한의원에 관한 거라면 무엇이든.
            <br className="hidden md:block" />
            진단이 아니라, 내원 전에 길을 잡아주는 따뜻한 길잡이예요.
          </p>

          {/* 목업 입력바 — 토스식 부드러운 그림자 */}
          <div className="hero-rise-4 mt-10 mx-auto max-w-[34rem]">
            <div className="flex items-center gap-2 rounded-full bg-white p-2 pl-6 shadow-[0_12px_36px_-12px_rgba(26,20,16,0.22)] ring-1 ring-ink-100">
              <span className="flex-1 text-left text-[15px] text-ink-400">
                쑤에게 무엇이든 물어보세요
              </span>
              <button
                type="button"
                aria-label="쑤에게 보내기"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-herb-700 text-white transition-colors hover:bg-herb-900"
              >
                <ArrowUp size={20} strokeWidth={2.5} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {["진료 시간", "공진단", "추나요법", "주차", "실비 청구"].map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-white px-4 py-2 text-[13px] font-medium text-ink-600 ring-1 ring-ink-100 transition-colors hover:text-herb-700 hover:ring-herb-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 페르소나 ── */}
      <section className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
        <div className="reveal-on-scroll flex flex-col items-center gap-6 rounded-3xl bg-paper-50 px-8 py-14 text-center md:flex-row md:gap-10 md:px-16 md:text-left">
          <div className="shrink-0 rounded-full bg-white p-5 shadow-[0_8px_28px_-10px_rgba(26,20,16,0.18)]">
            <SsuMascot size={84} variant="wave" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-[0.12em] text-herb-700">
              MEET 쑤
            </div>
            <h2 className="mt-2 font-serif text-[24px] md:text-[30px] font-bold tracking-[-0.025em] text-ink-900">
              당신 편에서, 당신 눈높이로
            </h2>
            <p className="mt-4 max-w-[40rem] text-[15px] md:text-[16px] text-ink-600 leading-[1.8]">
              쑤는 이수한의원의 AI 상담 길잡이예요. 필요한 정보를 원하는 만큼,
              쉬운 말로 정리해 드립니다. 결정은 늘 환자분이 하시고, 쑤는 옆에서
              판단에 필요한 것만 건네요. 진단은 진료실에서, 쑤는 그 전까지의
              막막함을 덜어드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 왜 쑤인가 (Problem → Solution, Before/After) ── */}
      <section className="border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <header className="reveal-on-scroll text-center">
            <div className="text-[12px] font-bold tracking-[0.12em] text-herb-700">
              WHY 쑤
            </div>
            <h2 className="mt-3 font-serif text-[26px] md:text-[36px] font-bold tracking-[-0.025em] text-ink-900 leading-[1.2]">
              혼자 검색하면 불안만 커지죠
            </h2>
            <p className="mt-4 text-[15px] md:text-[16px] text-ink-500">
              증상을 검색할수록 정보는 흩어지고, 정작 내 경우인지는 더 모르겠어요.
            </p>
          </header>

          <div className="mt-12 grid grid-cols-1 items-stretch gap-5 md:grid-cols-[1fr_auto_1fr]">
            {/* Before — 혼자 검색할 때 */}
            <div className="reveal-on-scroll flex flex-col rounded-3xl bg-paper-50 p-8 ring-1 ring-ink-100">
              <span className="inline-flex w-fit rounded-full bg-ink-100 px-3 py-1 text-[12px] font-bold text-ink-500">
                혼자 검색할 때
              </span>
              <ul className="mt-6 space-y-4">
                {[
                  "증상을 검색하면 무서운 글만 잔뜩 나와요",
                  "정보가 흩어져 뭐가 내 경우인지 모르겠어요",
                  "한의원에 가야 할지 계속 망설이게 돼요",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* 화살표 */}
            <div className="flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-herb-700 text-white shadow-[0_8px_20px_-6px_rgba(45,110,90,0.5)] md:rotate-0 rotate-90">
                <ArrowRight size={22} strokeWidth={2.5} />
              </span>
            </div>

            {/* After — 쑤와 함께 */}
            <div className="reveal-on-scroll flex flex-col rounded-3xl bg-white p-8 shadow-[0_14px_40px_-16px_rgba(26,20,16,0.18)] ring-1 ring-herb-200">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-herb-50 px-3 py-1 text-[12px] font-bold text-herb-700">
                <SsuMascot size={16} />
                쑤와 함께하면
              </span>
              <ul className="mt-6 space-y-4">
                {[
                  "내 상황에 맞춰 한방 관점으로 정리해드려요",
                  "치료·비용·예약까지 한자리에서 확인해요",
                  "내원이 필요한 상황인지 길을 잡아드려요",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-800">
                    <span className="mt-1.5 shrink-0 text-herb-700">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="reveal-on-scroll mt-10 text-center text-[14px] md:text-[15px] text-ink-500">
            진단은 진료실에서. 그 전까지의 막막함을 쑤가 덜어드려요.
          </p>
        </div>
      </section>

      {/* ── 이런 것도 물어보세요 ── */}
      <section className="bg-paper-50">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <header className="reveal-on-scroll text-center">
            <div className="text-[12px] font-bold tracking-[0.12em] text-herb-700">
              ASK ANYTHING
            </div>
            <h2 className="mt-3 font-serif text-[26px] md:text-[36px] font-bold tracking-[-0.025em] text-ink-900 leading-[1.2]">
              이런 것도 물어보셔도 돼요
            </h2>
            <p className="mt-4 text-[15px] md:text-[16px] text-ink-500">
              "이런 것도 물어봐도 되나?" 고민하지 마세요. 무엇이든 듣습니다.
            </p>
          </header>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ASK_GROUPS.map(({ icon: Icon, label, questions }) => (
              <div
                key={label}
                className="reveal-on-scroll flex flex-col rounded-2xl bg-white p-6 shadow-[0_2px_14px_-4px_rgba(26,20,16,0.07)] ring-1 ring-ink-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-12px_rgba(26,20,16,0.14)]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-herb-50 text-herb-700">
                    <Icon size={22} />
                  </span>
                  <span className="font-serif text-[18px] font-bold text-ink-900">
                    {label}
                  </span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {questions.map((q) => (
                    <li
                      key={q}
                      className="rounded-xl bg-paper-50 px-4 py-3 text-[14px] leading-[1.5] text-ink-700 transition-colors hover:bg-herb-50 hover:text-herb-700"
                    >
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 샘플 대화 쇼케이스 ── */}
      <section className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
        <header className="reveal-on-scroll text-center">
          <div className="text-[12px] font-bold tracking-[0.12em] text-herb-700">
            CONVERSATION
          </div>
          <h2 className="mt-3 font-serif text-[26px] md:text-[36px] font-bold tracking-[-0.025em] text-ink-900 leading-[1.2]">
            쑤는 이렇게 답해요
          </h2>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {SAMPLES.map((s) => (
            <div
              key={s.tag}
              className="reveal-on-scroll flex flex-col rounded-3xl bg-paper-50 p-6 ring-1 ring-ink-100"
            >
              <div className="mb-5">
                <span className="inline-flex rounded-full bg-herb-700 px-3 py-1 text-[12px] font-bold text-white">
                  {s.tag}
                </span>
                <p className="mt-2.5 text-[13px] text-ink-500">{s.desc}</p>
              </div>
              <div className="flex flex-1 flex-col gap-3">
                {s.turns.map((t, i) =>
                  t.who === "me" ? (
                    <div key={i} className="flex justify-end">
                      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-herb-700 px-4 py-2.5 text-[13.5px] leading-[1.6] text-white">
                        {t.text}
                      </p>
                    </div>
                  ) : (
                    <div key={i} className="flex items-end gap-2">
                      <span className="mb-1 shrink-0 rounded-full bg-white p-1 shadow-[0_2px_6px_-2px_rgba(26,20,16,0.12)]">
                        <SsuMascot size={24} />
                      </span>
                      <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[13.5px] leading-[1.65] text-ink-700 shadow-[0_2px_8px_-3px_rgba(26,20,16,0.08)]">
                        {t.text}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 첫 방문 흐름 단계 시각화 ── */}
      <section className="border-t border-ink-100">
        <div className="max-w-container mx-auto px-5 md:px-8 py-20 md:py-28">
          <VisitFlow />
        </div>
      </section>

      {/* ── 신뢰 띠 ── */}
      <section className="bg-paper-50">
        <div className="max-w-container mx-auto px-5 md:px-8 py-16 md:py-20">
          <div className="reveal-on-scroll grid grid-cols-3 gap-6 text-center">
            {[
              { n: "Since 1986", l: "이수한의원" },
              { n: "17년+", l: "한 자리 임상" },
              { n: "남성역 1번출구", l: "도보 1분" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-serif text-[20px] md:text-[30px] font-bold tracking-[-0.02em] text-ink-900">
                  {s.n}
                </div>
                <div className="mt-1.5 text-[12px] md:text-[14px] text-ink-500">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 마무리 CTA ── */}
      <section className="max-w-container mx-auto px-5 md:px-8 py-24 md:py-32">
        <div className="reveal-on-scroll relative overflow-hidden rounded-[2.5rem] bg-ink-900 px-8 py-16 text-center md:py-20">
          <div
            className="pointer-events-none absolute -bottom-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(111,176,122,0.45) 0%, rgba(111,176,122,0) 65%)",
            }}
          />
          <div className="relative">
            <SsuMascot size={64} className="mx-auto" variant="wave" />
            <h2 className="mt-6 font-serif text-[28px] md:text-[40px] font-bold tracking-[-0.025em] text-white leading-[1.2]">
              지금 쑤에게 물어보세요
            </h2>
            <p className="mt-4 text-[15px] md:text-[17px] text-white/70">
              가입 없이, 편하게. 더 깊은 상담은 전화 한 통으로 이어집니다.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[15px] font-bold text-ink-900 transition-transform hover:-translate-y-0.5"
              >
                쑤에게 말 걸기
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
              <Link
                href="tel:0285841075"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-4 text-[15px] font-bold text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-white/20"
              >
                <Phone size={17} strokeWidth={2.5} />
                02-584-1075
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
