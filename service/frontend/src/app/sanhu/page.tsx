import Link from "next/link";
import type { Metadata } from "next";
import { Phone, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "산후조리·부인과 완전 가이드 — 이수한의원",
  description:
    "이수한의원 산후조리·산후풍·갱년기·난임·자궁질환 허브. 한방부인과 전문의 나효석 원장 직접 진료. 출산 후 한약, 산후풍 치료, 갱년기 증후군까지.",
  keywords: [
    "산후조리", "이수한의원 산후조리", "산후풍", "산후풍 치료", "갱년기 한방치료",
    "난임 한방", "불임 한약", "자궁근종", "생리통 한약", "생리불순",
    "한방부인과", "남성역 산후조리", "사당동 산후조리",
  ],
  alternates: { canonical: `${SITE_URL}/sanhu` },
  openGraph: {
    type: "article",
    title: "산후조리·부인과 완전 가이드 — 이수한의원",
    description: "산후조리·산후풍·갱년기·난임·자궁질환. 한방부인과 전문의 나효석 원장 직접 진료.",
    url: `${SITE_URL}/sanhu`,
    images: [{ url: `${SITE_URL}/og.png` }],
  },
};

const POSTS = [
  { logNo: "223497561303", title: "산후조리도 골든 타임이 있다 — 초산 나이가 늦어지면서 산후조리는 더 중요해져", tag: "산후조리" },
  { logNo: "222942254750", title: "산후풍 치료 — 남성역 이수한의원", tag: "산후풍" },
  { logNo: "222641032644", title: "출산 후 신체 변화", tag: "산후조리" },
  { logNo: "222473246348", title: "출산 후 3개월이 30년 허리를 좌우한다", tag: "산후조리" },
  { logNo: "222937883076", title: "갱년기 치료 — 남성역 이수한의원", tag: "갱년기" },
  { logNo: "222413028628", title: "임신·불임·생리통·폐경·자궁질환에 에스트로겐(여성호르몬)이 주요 역할을 합니다", tag: "부인과·호르몬" },
  { logNo: "223129804536", title: "한약이 난임(불임) 치료에 효과적이라는 연구 + 임신 성공 사례", tag: "난임" },
  { logNo: "222622626423", title: "이수한의원 난임 클리닉", tag: "난임" },
  { logNo: "222919501383", title: "습관성 유산의 한방 치료", tag: "유산·임신" },
  { logNo: "222473257536", title: "계류 유산에 대하여", tag: "유산·임신" },
  { logNo: "223065648455", title: "재발성 질염의 한방 치료", tag: "부인과" },
  { logNo: "222149942072", title: "월경통(생리통)에 대한 첩약(한약) 처방이 건강보험 적용됩니다!", tag: "생리통·보험" },
];

const TAG_COLOR: Record<string, { bg: string; text: string }> = {
  "산후조리":      { bg: "#f8edf3", text: "#9e4568" },
  "산후풍":        { bg: "#f5e5ef", text: "#862a50" },
  "갱년기":        { bg: "#f0dcea", text: "#7a2c58" },
  "부인과·호르몬": { bg: "#f5e8f0", text: "#9e4568" },
  "난임":          { bg: "#f8e8f2", text: "#862a50" },
  "유산·임신":     { bg: "#f5e5ee", text: "#7a2c58" },
  "부인과":        { bg: "#f0e0eb", text: "#9e4568" },
  "생리통·보험":   { bg: "#f5e2ec", text: "#862a50" },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "산후조리 한약은 언제부터 먹을 수 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "출산 직후부터 복용 가능합니다. 자연분만과 제왕절개 모두 가능하며, 분만 방법과 체질에 따라 처방이 다릅니다. 이수한의원 나효석 원장(한방부인과 전문의)이 출산 방식과 현재 상태를 확인 후 맞춤 처방합니다." },
    },
    {
      "@type": "Question",
      name: "산후풍이란 무엇이며 한방 치료가 가능한가요?",
      acceptedAnswer: { "@type": "Answer", text: "산후풍은 출산 후 몸이 채 회복되기 전에 찬 기운이 들어가 관절·근육 통증, 오한, 두통이 생기는 상태입니다. 한방에서는 기혈 순환 회복을 통해 치료합니다. 초기 대응이 중요하며, 한약·침·뜸 치료를 병행합니다." },
    },
    {
      "@type": "Question",
      name: "갱년기 증상에 한방 치료가 효과 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "한방 치료는 갱년기 안면홍조, 수면 장애, 감정 기복, 질 건조증 완화에 효과적입니다. 호르몬 보충 요법(HRT)이 어렵거나 부작용이 걱정되는 경우 대안으로 많이 선택합니다. 나효석 원장이 체질 진단 후 한약·침 치료를 설계합니다." },
    },
    {
      "@type": "Question",
      name: "난임에 한방 치료가 정말 효과 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "국내외 연구에서 한약이 배란 유도와 자궁내막 강화에 효과가 있다는 결과가 있습니다. 이수한의원에서는 체외수정(IVF) 전 자궁 환경 준비, 자연임신 시도 기간 중 한약 처방을 병행하는 방식으로 진료합니다. 임신 성공 사례를 보유하고 있습니다." },
    },
    {
      "@type": "Question",
      name: "생리통 한약도 건강보험이 되나요?",
      acceptedAnswer: { "@type": "Answer", text: "네. 2021년부터 월경통(생리통)에 대한 첩약 처방이 건강보험 적용됩니다. 한의사 진료 후 처방하며, 본인부담금이 크게 줄어듭니다. 이수한의원에서 보험 처방이 가능합니다." },
    },
    {
      "@type": "Question",
      name: "자궁근종·자궁내막증에 한방 치료는?",
      acceptedAnswer: { "@type": "Answer", text: "자궁근종과 자궁내막증은 한방에서 어혈(瘀血) 개선과 기혈 순환 회복으로 접근합니다. 종양 크기를 줄이거나 수술을 대체하는 것보다는 통증 완화, 생리 불순 개선, 재발 방지에 효과적입니다. 산부인과와 협진을 권장하는 경우도 있습니다." },
    },
    {
      "@type": "Question",
      name: "출산 후 허리 통증도 산후 한방 치료로 해결할 수 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "네. 출산 후 이완된 인대·골반의 불안정으로 허리 통증이 심해지는 경우가 많습니다. 한약으로 기혈 회복을 돕고, 침·추나요법으로 골반·요추를 교정합니다. '출산 후 3개월이 30년 허리를 좌우한다'는 말처럼 초기 관리가 중요합니다." },
    },
    {
      "@type": "Question",
      name: "임신 중에도 한의원 진료가 가능한가요?",
      acceptedAnswer: { "@type": "Answer", text: "임신 중 허리 통증, 입덧, 부종 등에 대해 안전한 한방 치료가 가능합니다. 임신 중 처방 가능한 한약과 침 혈위는 제한되며, 나효석 원장이 안전하게 진료합니다. 임신 전 체질 개선 치료도 운영합니다." },
    },
  ],
};

const COLLECTION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/sanhu`,
  name: "이수한의원 산후조리·부인과 완전 가이드",
  description: "산후조리·산후풍·갱년기·난임·자궁질환·생리통 한방 치료. 한방부인과 전문의 나효석 원장 직접 진료. 칼럼 100편 이상 클러스터.",
  url: `${SITE_URL}/sanhu`,
  about: {
    "@type": "MedicalSpecialty",
    name: "한방부인과",
    description: "산후조리, 갱년기, 난임, 자궁질환, 생리통 등 여성 질환 한방 전문 진료.",
    recognizingAuthority: { "@type": "Organization", name: "이수한의원" },
  },
  author: {
    "@type": "Person",
    name: "나효석",
    jobTitle: "원장 · 한방부인과 전문의",
    worksFor: { "@type": "MedicalClinic", "@id": SITE_URL, name: "이수한의원" },
    knowsAbout: ["산후조리", "산후풍", "갱년기", "난임", "자궁질환", "생리통", "성조숙증"],
  },
  isPartOf: { "@type": "MedicalClinic", "@id": SITE_URL },
  hasPart: POSTS.map((p, i) => ({
    "@type": "BlogPosting",
    position: i + 1,
    headline: p.title,
    url: `${SITE_URL}/${p.logNo}`,
  })),
};

export default function SanhuPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COLLECTION_JSON_LD) }} />

      {/* HERO */}
      <section className="border-b" style={{ background: "#fdf2f6", borderColor: "#f0d5e4" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-14">
          <div className="chip-kr mb-5">산후조리 · 부인과 · 갱년기</div>
          <h1 className="font-serif text-[28px] md:text-[54px] leading-[1.08] tracking-[-0.025em] text-ink-900">
            이수한의원
            <br />
            <span style={{ color: "#9e4568" }}>산후조리 완전 가이드</span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[17.5px] leading-[1.82] text-ink-600 max-w-xl">
            산후조리·산후풍·갱년기·난임·자궁질환·생리통까지.
            <br className="hidden md:block" />
            한방부인과 전문의 나효석 원장이 직접 진료합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:0285841075"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-[14.5px] font-bold transition-colors"
              style={{ background: "#9e4568" }}
            >
              <Phone size={15} strokeWidth={2.5} />
              02-584-1075 예약
            </a>
            <Link
              href="/treatment/women"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-[14.5px] font-semibold transition-colors"
              style={{ borderColor: "#d8b0c8", color: "#9e4568" }}
            >
              여성·산후조리 진료 안내 →
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
              { q: "산후조리 시작 시기", a: "출산 직후부터 가능 · 자연분만·제왕절개 모두" },
              { q: "생리통 건강보험", a: "월경통 첩약 처방 보험 적용 (2021년~)" },
              { q: "주요 진료 질환", a: "산후풍·갱년기·난임·자궁근종·생리불순·성조숙증" },
              { q: "진료 원장", a: "나효석 원장 (한방부인과 전문의, 전 함소아한의원 원장)" },
              { q: "난임 치료 방향", a: "자궁 환경 개선 + 체외수정 전 준비 + 자연임신 지원" },
              { q: "갱년기 치료", a: "HRT 대안·보완 · 안면홍조·수면 장애·감정 기복 개선" },
            ].map((item) => (
              <div key={item.q} className="p-4 rounded-xl border" style={{ background: "#fdf7fa", borderColor: "#f0d5e4" }}>
                <div className="text-[11.5px] font-bold tracking-[0.08em] mb-1" style={{ color: "#9e4568" }}>{item.q}</div>
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
            산후조리·부인과 관련 칼럼 {POSTS.length}편
          </h2>
          <ul className="space-y-2">
            {POSTS.map((p) => {
              const tc = TAG_COLOR[p.tag] ?? { bg: "#f0d5e4", text: "#9e4568" };
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
              <Link href="/journal?cat=여성+·+산후조리" className="flex items-center gap-2 px-4 py-3 text-[13.5px] font-semibold rounded-xl border border-ink-100 hover:border-ink-300 transition-colors" style={{ color: "#9e4568" }}>
                여성·산후조리 칼럼 100편 전체 보기 →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-3">자주 묻는 질문</div>
          <h2 className="font-serif text-[22px] md:text-[32px] tracking-[-0.02em] text-ink-900 mb-6 md:mb-8">산후조리·부인과 FAQ</h2>
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
      <section style={{ background: "#fdf7fa", borderTop: "1px solid #f0d5e4", borderBottom: "1px solid #f0d5e4" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-5">진료 원장</div>
          <div className="flex items-start gap-5">
            <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl font-serif text-[28px] font-black" style={{ background: "#f0d5e4", color: "#9e4568" }}>羅</div>
            <div>
              <div className="font-serif text-[20px] font-black text-ink-900 tracking-[-0.02em]">나효석 원장</div>
              <div className="mt-1 text-[13px] text-ink-500 leading-[1.7]">한방부인과 전문의 · 전 함소아한의원 원장</div>
              <p className="mt-3 text-[14.5px] text-ink-600 leading-[1.78]">
                여성의 임신 준비부터 산후조리, 갱년기까지 한 원장이 일관되게 진료합니다. 나효석 원장은 한방부인과 전문의로, 난임·성조숙증·소아성장도 함께 진료합니다.
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
              <h2 className="font-serif text-[24px] md:text-[30px] tracking-[-0.022em] text-ink-900">전문의가 직접 진료합니다.</h2>
              <p className="mt-2 text-[14.5px] text-ink-500">산후조리·난임·갱년기 모두 나효석 원장이 진료합니다.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a href="tel:0285841075" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-[14.5px] font-bold" style={{ background: "#9e4568" }}>
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
