import Link from "next/link";
import type { Metadata } from "next";
import { Phone, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "소아성장·성조숙증 완전 가이드 — 이수한의원",
  description:
    "이수한의원 어린이 성장클리닉·성조숙증·소아비염 허브. 한방부인과 전문의 나효석 원장 직접 진료. 키 성장 한약, 성조숙증 진단·치료, 면역력 강화까지.",
  keywords: [
    "소아성장", "어린이 성장 한의원", "성장 한약", "키 크는 한약",
    "성조숙증", "성조숙증 한방치료", "소아 비염", "어린이 보약",
    "어린이 면역력", "수험생 한약", "남성역 성장클리닉", "사당동 성장클리닉",
  ],
  alternates: { canonical: `${SITE_URL}/children-growth` },
  openGraph: {
    type: "article",
    title: "소아성장·성조숙증 완전 가이드 — 이수한의원",
    description: "키 성장 한약, 성조숙증 진단·치료, 소아비염, 어린이 면역력. 한방부인과 전문의 나효석 원장 직접 진료.",
    url: `${SITE_URL}/children-growth`,
    images: [{ url: `${SITE_URL}/og.png` }],
  },
};

const POSTS = [
  { logNo: "223901854660", title: "우리 아이 키 성장! 성장치료 잘 하는 한의원과 상담하세요", tag: "키 성장" },
  { logNo: "223706942313", title: "성장에 도움 되는 운동, 영양 관리, 생활 습관 (3)", tag: "성장 생활습관" },
  { logNo: "223700238894", title: "성장에 도움 되는 운동, 영양 관리, 생활 습관 (2)", tag: "성장 생활습관" },
  { logNo: "223688096024", title: "성장에 도움 되는 운동, 영양 관리, 생활 습관", tag: "성장 생활습관" },
  { logNo: "223725467288", title: "아이들의 식단을 짜는 엄마의 자세", tag: "성장 영양" },
  { logNo: "222620051618", title: "성조숙증의 진단과 치료 — 이수한의원 나효석 원장", tag: "성조숙증" },
  { logNo: "222399338233", title: "소아성장 — 우리아이 어떻게 하면 키 크게 할 수 있을까", tag: "키 성장" },
  { logNo: "221545476288", title: "우리 아이 잘 크게 하는 방법이 있을까?", tag: "키 성장" },
  { logNo: "221447367368", title: "한방 성장치료에 대해", tag: "성장 한약" },
  { logNo: "222074358374", title: "수험생, 어린이 보약", tag: "어린이 보약" },
  { logNo: "221682326519", title: "수험생 보약", tag: "어린이 보약" },
  { logNo: "223105349339", title: "남성역 한의원 — 소아청소년들이 한의원을 찾는 이유는", tag: "소아 한의원" },
];

const TAG_COLOR: Record<string, { bg: string; text: string }> = {
  "키 성장":       { bg: "#e8f5ee", text: "#3a7a56" },
  "성장 생활습관": { bg: "#dff0e8", text: "#286040" },
  "성장 영양":     { bg: "#e4f2ea", text: "#3a7a56" },
  "성조숙증":      { bg: "#e0eed6", text: "#3a6830" },
  "성장 한약":     { bg: "#e8f5ee", text: "#3a7a56" },
  "어린이 보약":   { bg: "#dceedd", text: "#286040" },
  "소아 한의원":   { bg: "#e4f0e8", text: "#3a7a56" },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "어린이 성장 한약은 몇 살부터 먹을 수 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "보통 만 4세 이상부터 성장 한약 처방이 가능합니다. 성장판이 열려 있는 시기(초등학생~중학교 1~2학년)에 가장 효과적입니다. 체질과 현재 성장 상태를 진단 후 맞춤 처방합니다." },
    },
    {
      "@type": "Question",
      name: "한방 성장치료 효과가 실제로 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "한방 성장치료는 수면의 질 개선, 소화 기능 강화, 성장호르몬 분비 촉진 환경 조성에 도움을 줍니다. 단독 키 성장 효과보다는 체질 개선과 면역력 강화를 통한 건강한 성장 지원이 핵심입니다. 이수한의원에서는 성장 한약과 함께 운동·영양·수면 지도를 병행합니다." },
    },
    {
      "@type": "Question",
      name: "성조숙증이란 무엇인가요? 한방 치료가 가능한가요?",
      acceptedAnswer: { "@type": "Answer", text: "성조숙증은 여아 8세 미만, 남아 9세 미만에 2차 성징이 나타나는 상태입니다. 성장판이 일찍 닫혀 최종 키가 작아질 수 있습니다. 한방 치료는 호르몬 균형 회복과 초경 지연, 뼈 나이 조절에 도움을 줍니다. 나효석 원장(한방부인과 전문의)이 전문 진료합니다." },
    },
    {
      "@type": "Question",
      name: "소아 비염에 한방 치료가 효과적인가요?",
      acceptedAnswer: { "@type": "Answer", text: "한방 치료는 면역력 강화를 통해 비염의 근본 원인을 개선합니다. 스테로이드 스프레이 없이 체질을 바꿔 재발을 줄이는 것이 목표입니다. 한약·침·뜸을 병행하며, 계절성 악화를 막는 예방 처방도 운영합니다." },
    },
    {
      "@type": "Question",
      name: "수험생 보약은 어떤 것이 좋나요?",
      acceptedAnswer: { "@type": "Answer", text: "수험생 보약은 집중력·기억력·체력 유지를 목표로 합니다. 총명탕, 공진단(총명공진단), 귀비탕 등이 대표 처방입니다. 체질에 따라 처방이 다르므로 반드시 진단 후 복용해야 합니다. 수능 3개월 전부터 시작하는 것을 권장합니다." },
    },
    {
      "@type": "Question",
      name: "성장 한약과 함께 운동을 병행해야 하나요?",
      acceptedAnswer: { "@type": "Answer", text: "네. 성장판 자극에는 줄넘기, 수영, 농구 등 점프 동작이 있는 유산소 운동이 효과적입니다. 이수한의원에서는 성장 한약 처방과 함께 아이 체질에 맞는 운동·영양·수면 가이드를 함께 제공합니다." },
    },
    {
      "@type": "Question",
      name: "어린이 보약은 얼마나 자주 먹이는 게 좋나요?",
      acceptedAnswer: { "@type": "Answer", text: "일반적으로 1년에 2회(봄·가을) 체질 보강 한약을 복용하는 것을 권장합니다. 감기나 비염이 잦은 아이는 면역 강화 한약을 별도 처방합니다. 환절기 전 예방적 복용이 특히 효과적입니다." },
    },
    {
      "@type": "Question",
      name: "성장 한약이 부작용이 있지 않나요?",
      acceptedAnswer: { "@type": "Answer", text: "체질에 맞게 처방된 성장 한약은 부작용이 거의 없습니다. 간혹 첫 복용 시 소화 불편감이 있을 수 있으며, 이 경우 처방을 조정합니다. 이수한의원에서는 한방부인과 전문의가 직접 진단 후 처방합니다." },
    },
  ],
};

const COLLECTION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/children-growth`,
  name: "이수한의원 소아성장·성조숙증 완전 가이드",
  description: "어린이 키 성장 한약, 성조숙증 진단·치료, 소아비염, 수험생 보약. 한방부인과 전문의 나효석 원장. 칼럼 140편 클러스터.",
  url: `${SITE_URL}/children-growth`,
  about: {
    "@type": "MedicalSpecialty",
    name: "소아 한방 성장 치료",
    description: "어린이 성장판 활성화, 성조숙증 호르몬 균형, 소아비염 면역 개선 한방 전문 진료.",
    recognizingAuthority: { "@type": "Organization", name: "이수한의원" },
  },
  author: {
    "@type": "Person",
    name: "나효석",
    jobTitle: "원장 · 한방부인과 전문의",
    worksFor: { "@type": "MedicalClinic", "@id": SITE_URL, name: "이수한의원" },
    knowsAbout: ["소아성장", "성조숙증", "소아비염", "어린이보약", "수험생한약"],
  },
  isPartOf: { "@type": "MedicalClinic", "@id": SITE_URL },
  hasPart: POSTS.map((p, i) => ({
    "@type": "BlogPosting",
    position: i + 1,
    headline: p.title,
    url: `${SITE_URL}/${p.logNo}`,
  })),
};

export default function ChildrenGrowthPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COLLECTION_JSON_LD) }} />

      {/* HERO */}
      <section className="border-b" style={{ background: "#f3faf5", borderColor: "#cce8d8" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-14">
          <div className="chip-kr mb-5">소아성장 · 성조숙증 · 어린이 보약</div>
          <h1 className="font-serif text-[28px] md:text-[54px] leading-[1.08] tracking-[-0.025em] text-ink-900">
            이수한의원
            <br />
            <span style={{ color: "#3a7a56" }}>소아성장 완전 가이드</span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[17.5px] leading-[1.82] text-ink-600 max-w-xl">
            키 성장 한약, 성조숙증 치료, 소아비염, 수험생 보약까지.
            <br className="hidden md:block" />
            한방부인과 전문의 나효석 원장이 직접 진료합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:0285841075"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-[14.5px] font-bold transition-colors"
              style={{ background: "#3a7a56" }}
            >
              <Phone size={15} strokeWidth={2.5} />
              02-584-1075 예약
            </a>
            <Link
              href="/treatment/children"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-[14.5px] font-semibold transition-colors"
              style={{ borderColor: "#a0d8b8", color: "#3a7a56" }}
            >
              소아성장 진료 안내 →
            </Link>
          </div>
        </div>
      </section>

      {/* 핵심 정보 */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-5">한눈에 보기</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { q: "치료 시작 시기", a: "만 4세 이상 · 성장판 열려 있는 초등~중학교 1~2학년이 최적" },
              { q: "성조숙증 기준", a: "여아 8세 미만 · 남아 9세 미만 2차 성징 발현 시" },
              { q: "주요 진료 항목", a: "키 성장 한약, 성조숙증, 소아비염, 어린이 면역, 수험생 보약" },
              { q: "진료 원장", a: "나효석 원장 (한방부인과 전문의, 소아성장·성조숙증 전문)" },
              { q: "복용 주기 권장", a: "연 2회(봄·가을) · 감기·비염 잦은 아이는 면역 처방 별도" },
              { q: "병행 가이드", a: "운동(줄넘기·수영) + 영양 + 수면 관리 지도 함께 제공" },
            ].map((item) => (
              <div key={item.q} className="p-4 rounded-xl border" style={{ background: "#f5faf7", borderColor: "#cce8d8" }}>
                <div className="text-[11.5px] font-bold tracking-[0.08em] mb-1" style={{ color: "#3a7a56" }}>{item.q}</div>
                <div className="text-[14.5px] text-ink-800 leading-snug">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 글 목록 */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-3">칼럼 · 가이드</div>
          <h2 className="font-serif text-[22px] md:text-[32px] tracking-[-0.02em] text-ink-900 mb-6 md:mb-8">
            소아성장·성조숙증 관련 칼럼 {POSTS.length}편
          </h2>
          <ul className="space-y-2">
            {POSTS.map((p) => {
              const tc = TAG_COLOR[p.tag] ?? { bg: "#cce8d8", text: "#3a7a56" };
              return (
                <li key={p.logNo}>
                  <Link href={`/${p.logNo}`} className="group flex items-start gap-3 p-4 rounded-xl border border-transparent hover:border-ink-100 transition-all">
                    <span className="mt-0.5 shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.text }}>{p.tag}</span>
                    <span className="text-[14.5px] text-ink-800 leading-[1.55] group-hover:text-ink-900 flex-1">{p.title}</span>
                    <ChevronRight size={15} className="shrink-0 mt-0.5 text-ink-300 group-hover:text-ink-600 transition-colors" />
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/journal?cat=소아+성장" className="flex items-center gap-2 px-4 py-3 text-[13.5px] font-semibold rounded-xl border border-ink-100 hover:border-ink-300 transition-colors" style={{ color: "#3a7a56" }}>
                소아성장 칼럼 140편 전체 보기 →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-3">자주 묻는 질문</div>
          <h2 className="font-serif text-[22px] md:text-[32px] tracking-[-0.02em] text-ink-900 mb-6 md:mb-8">소아성장 FAQ</h2>
          <div className="divide-y divide-ink-100 border-y border-ink-100">
            {FAQ_JSON_LD.mainEntity.map((faq) => (
              <details key={faq.name} className="group py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <span className="font-serif text-[16px] md:text-[17px] tracking-[-0.015em] text-ink-900 leading-[1.45] flex-1">{faq.name}</span>
                  <span aria-hidden className="shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full border border-ink-200 text-ink-400 group-open:rotate-45 transition-all duration-300">
                    <span className="text-[13px] leading-none">＋</span>
                  </span>
                </summary>
                <p className="mt-3 pr-6 md:pr-10 text-[14.5px] leading-[1.78] text-ink-600">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 원장 소개 */}
      <section style={{ background: "#f3faf5", borderTop: "1px solid #cce8d8", borderBottom: "1px solid #cce8d8" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-5">진료 원장</div>
          <div className="flex items-start gap-5">
            <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl font-serif text-[28px] font-black" style={{ background: "#cce8d8", color: "#3a7a56" }}>羅</div>
            <div>
              <div className="font-serif text-[20px] font-black text-ink-900 tracking-[-0.02em]">나효석 원장</div>
              <div className="mt-1 text-[13px] text-ink-500 leading-[1.7]">한방부인과 전문의 · 전 함소아한의원 원장</div>
              <p className="mt-3 text-[14.5px] text-ink-600 leading-[1.78]">
                함소아한의원 원장 출신으로, 소아 한방 치료 경험이 풍부합니다. 성장 한약 처방부터 성조숙증 진단, 소아 비염·면역력 강화까지 아이의 건강 성장을 종합적으로 지원합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="font-serif text-[24px] md:text-[30px] tracking-[-0.022em] text-ink-900">아이의 성장, 전문의와 함께하세요.</h2>
              <p className="mt-2 text-[14.5px] text-ink-500">성조숙증·비염·보약 모두 나효석 원장이 직접 진료합니다.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a href="tel:0285841075" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-[14.5px] font-bold" style={{ background: "#3a7a56" }}>
                <Phone size={15} strokeWidth={2.5} />02-584-1075
              </a>
              <Link href="/ask" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-ink-200 hover:border-ink-900 text-ink-800 text-[14.5px] font-semibold transition-colors">
                쑤에게 물어보기 →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
