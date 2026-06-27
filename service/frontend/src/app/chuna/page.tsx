import Link from "next/link";
import type { Metadata } from "next";
import { Phone, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "추나요법 완전 가이드 — 이수한의원",
  description:
    "이수한의원 추나요법 허브. 건강보험 적용 여부·가격·디스크 치료·목·허리·교통사고 자동차보험까지. 경희대 한의학 박사 문학진 원장이 직접 진료합니다.",
  keywords: [
    "추나요법", "이수한의원 추나요법", "추나요법 보험", "추나요법 가격",
    "허리디스크 추나", "목디스크", "체형교정", "척추교정", "골반교정",
    "교통사고 한방치료", "자동차보험 추나", "남성역 추나요법", "사당동 추나요법",
  ],
  alternates: { canonical: `${SITE_URL}/chuna` },
  openGraph: {
    type: "article",
    title: "추나요법 완전 가이드 — 이수한의원",
    description: "건강보험 적용·가격·디스크·체형교정·교통사고 자동차보험까지. 경희대 한의학 박사 문학진 원장 직접 진료.",
    url: `${SITE_URL}/chuna`,
    images: [{ url: `${SITE_URL}/og.png` }],
  },
};

const POSTS = [
  { logNo: "223924912633", title: "허리 엉치 통증이 있다면 고관절 유연성을 키워주세요", tag: "허리·골반" },
  { logNo: "223868967255", title: "자세 교정을 통한 허리 통증, 골반 통증 해소", tag: "자세교정" },
  { logNo: "223856649367", title: "날개뼈 주변의 통증 — 상후거근, 전거근, 견갑하근", tag: "어깨·등" },
  { logNo: "223829791584", title: "엉치 아프고 다리가 저릴 때 셀프 마사지법", tag: "좌골신경통" },
  { logNo: "223891449026", title: "어깨의 주요 힘줄과 근육 — 극상근·극하근·소원근·대원근", tag: "어깨" },
  { logNo: "223500018660", title: "많이 아픈 회전근개 석회 — 어깨에 석회가 생겼어요", tag: "어깨" },
  { logNo: "223399601188", title: "어깨가 아픈데, 원인은 목이라고?", tag: "목·어깨" },
  { logNo: "223328552819", title: "손목 통증 — 힘줄염, 인대 염좌, 손목터널 증후군 총정리", tag: "손목" },
  { logNo: "223295175664", title: "발목 삐었을 때 운동 손상 셀프케어 가이드", tag: "발목·관절" },
  { logNo: "223812649361", title: "발목이 삐었을 땐, 한의원!", tag: "발목·관절" },
  { logNo: "223191388350", title: "다리가 저려요 · 시려요 · 당겨요 — 좌골신경통 치료", tag: "좌골신경통" },
  { logNo: "223155216484", title: "근육통에 스트레칭 vs 근육강화 운동, 뭐가 좋을까?", tag: "운동·재활" },
];

const TAG_COLOR: Record<string, { bg: string; text: string }> = {
  "허리·골반":    { bg: "#f5ece4", text: "#7a4c2e" },
  "자세교정":     { bg: "#f0e8de", text: "#6b3d22" },
  "어깨·등":      { bg: "#ede5dc", text: "#7a4c2e" },
  "좌골신경통":   { bg: "#f5e8e0", text: "#8a4420" },
  "어깨":         { bg: "#f0e4d8", text: "#7a4c2e" },
  "목·어깨":      { bg: "#ece4dc", text: "#6b3d22" },
  "손목":         { bg: "#f5e8e0", text: "#8a4420" },
  "발목·관절":    { bg: "#f0ebe4", text: "#7a4c2e" },
  "운동·재활":    { bg: "#e8e4dc", text: "#5a3c1e" },
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "추나요법이란 무엇인가요?",
      acceptedAnswer: { "@type": "Answer", text: "추나요법은 한의사가 손으로 척추·관절·근막의 변위를 교정하는 한방 수기치료입니다. 뼈·관절·근육을 직접 밀고 당겨 정상 위치로 돌려 통증을 완화하고 기능을 회복시킵니다. 이수한의원 문학진 원장(경희대 한의학 박사, 척추신경추나의학회)이 직접 시행합니다." },
    },
    {
      "@type": "Question",
      name: "추나요법은 건강보험이 적용되나요?",
      acceptedAnswer: { "@type": "Answer", text: "네. 2019년부터 근골격계 질환 진단 시 건강보험이 적용됩니다. 단순추나 본인부담 약 8,000~12,000원, 복잡추나 약 18,000~28,000원 수준입니다. 의사소견서 없이 한의사 진단만으로 보험 처리됩니다." },
    },
    {
      "@type": "Question",
      name: "허리디스크에 추나요법이 효과 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "추나요법은 디스크 압박을 줄이고 주변 근육·인대를 이완시켜 통증을 완화합니다. 수술 없이 호전되는 사례가 많으며, 약침·침 치료와 병행하면 효과가 높아집니다. 단, 심한 신경 손상이 있는 경우 MRI 결과를 보고 판단합니다." },
    },
    {
      "@type": "Question",
      name: "교통사고 후유증에 자동차보험으로 추나를 받을 수 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "네. 교통사고 후 한방 치료는 자동차보험으로 처리됩니다. 목디스크·허리 통증·근육 긴장 등 교통사고 후유증에 추나요법·침·약침 치료를 자동차보험 적용으로 받으실 수 있습니다. 이수한의원에서 자동차보험 청구를 도와드립니다." },
    },
    {
      "@type": "Question",
      name: "추나요법과 카이로프랙틱의 차이는?",
      acceptedAnswer: { "@type": "Answer", text: "추나요법은 한의학 이론에 기반한 수기치료로, 한의사만 시행할 수 있습니다. 카이로프랙틱은 서양 의학 기반의 척추 교정법입니다. 추나요법은 침·약침·한약 등 다른 한방 치료와 통합 진료가 가능하며, 한국에서 건강보험 적용을 받을 수 있습니다." },
    },
    {
      "@type": "Question",
      name: "추나요법은 몇 회나 받아야 하나요?",
      acceptedAnswer: { "@type": "Answer", text: "증상 경중에 따라 다릅니다. 급성 통증은 3~5회로 호전되는 경우가 많고, 만성 허리디스크나 체형 교정은 10~20회가 필요할 수 있습니다. 이수한의원에서는 첫 진단 후 원장님이 예상 횟수를 직접 안내해 드립니다." },
    },
    {
      "@type": "Question",
      name: "어린이나 임산부도 추나요법을 받을 수 있나요?",
      acceptedAnswer: { "@type": "Answer", text: "어린이 성장과 관련한 추나 치료는 가능합니다. 임산부의 경우 산후조리 기간이나 임신 중 허리 통증에 대해 원장님과 상담 후 결정합니다. 임신 중에는 복압을 주는 강한 기법을 제한하며 부드러운 수기 치료를 적용합니다." },
    },
    {
      "@type": "Question",
      name: "골반 불균형·척추측만증에도 추나가 도움이 되나요?",
      acceptedAnswer: { "@type": "Answer", text: "네. 골반 불균형과 척추측만증은 추나요법의 주요 적응증 중 하나입니다. 골반·요추·흉추·경추를 단계적으로 교정하며, 운동 재활 지도를 함께 진행합니다. 구조적 측만(선천성)과 기능적 측만을 구분해 진료합니다." },
    },
  ],
};

const COLLECTION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/chuna`,
  name: "이수한의원 추나요법 완전 가이드",
  description: "건강보험 적용 추나요법·체형교정·허리디스크·목디스크·교통사고 한방치료. 이수한의원 칼럼 150편 클러스터.",
  url: `${SITE_URL}/chuna`,
  about: {
    "@type": "MedicalTherapy",
    name: "추나요법",
    description: "한의사가 손으로 척추·관절·근막 변위를 교정하는 한방 수기치료. 2019년부터 건강보험 적용.",
    relevantSpecialty: "TraditionalChineseMedicine",
    recognizingAuthority: { "@type": "Organization", name: "이수한의원" },
  },
  author: {
    "@type": "Person",
    name: "문학진",
    jobTitle: "대표원장 · 한의학 박사 · 척추신경추나의학회",
    worksFor: { "@type": "MedicalClinic", "@id": SITE_URL, name: "이수한의원" },
    knowsAbout: ["추나요법", "척추교정", "허리디스크", "목디스크", "체형교정", "교통사고 한방치료"],
  },
  isPartOf: { "@type": "MedicalClinic", "@id": SITE_URL },
  hasPart: POSTS.map((p, i) => ({
    "@type": "BlogPosting",
    position: i + 1,
    headline: p.title,
    url: `${SITE_URL}/${p.logNo}`,
  })),
};

export default function ChunaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COLLECTION_JSON_LD) }} />

      {/* HERO */}
      <section className="bg-[#faf4ee] border-b border-[#e8d8c8]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-14">
          <div className="chip-kr mb-5">추나요법 · 척추 · 관절</div>
          <h1 className="font-serif text-[28px] md:text-[54px] leading-[1.08] tracking-[-0.025em] text-ink-900">
            이수한의원
            <br />
            <span style={{ color: "#7a4c2e" }}>추나요법 완전 가이드</span>
          </h1>
          <p className="mt-6 text-[16px] md:text-[17.5px] leading-[1.82] text-ink-600 max-w-xl">
            건강보험 적용, 허리·목디스크, 체형교정, 교통사고 자동차보험까지.
            <br className="hidden md:block" />
            경희대 한의학 박사 문학진 원장이 직접 진료합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:0285841075"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-[14.5px] font-bold transition-colors"
              style={{ background: "#7a4c2e" }}
            >
              <Phone size={15} strokeWidth={2.5} />
              02-584-1075 예약
            </a>
            <Link
              href="/treatment/spine"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border text-[14.5px] font-semibold transition-colors"
              style={{ borderColor: "#c8a888", color: "#7a4c2e" }}
            >
              척추·추나 진료 안내 →
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
              { q: "건강보험 적용", a: "근골격계 질환 진단 시 가능 (2019년~)" },
              { q: "본인부담금", a: "단순추나 약 8,000~12,000원 · 복잡추나 약 18,000~28,000원" },
              { q: "주요 적응증", a: "허리·목디스크, 골반 불균형, 체형교정, 어깨통증, 관절통증" },
              { q: "교통사고", a: "자동차보험으로 추나·침·약침 치료 가능" },
              { q: "진료 원장", a: "문학진 원장 (경희대 한의학 박사, 척추신경추나의학회)" },
              { q: "치료 횟수", a: "급성 3~5회 / 만성·체형교정 10~20회 내외" },
            ].map((item) => (
              <div key={item.q} className="p-4 rounded-xl border" style={{ background: "#faf4ee", borderColor: "#e8d8c8" }}>
                <div className="text-[11.5px] font-bold tracking-[0.08em] mb-1" style={{ color: "#7a4c2e" }}>{item.q}</div>
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
            척추·추나 관련 칼럼 {POSTS.length}편
          </h2>
          <ul className="space-y-2">
            {POSTS.map((p) => {
              const tc = TAG_COLOR[p.tag] ?? { bg: "#f0e8de", text: "#7a4c2e" };
              return (
                <li key={p.logNo}>
                  <Link
                    href={`/${p.logNo}`}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-transparent hover:border-ink-100 transition-all"
                    style={{ "--hover-bg": "#faf4ee" } as React.CSSProperties}
                  >
                    <span className="mt-0.5 shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.text }}>{p.tag}</span>
                    <span className="text-[14.5px] text-ink-800 leading-[1.55] group-hover:text-ink-900 flex-1">{p.title}</span>
                    <ChevronRight size={15} className="shrink-0 mt-0.5 text-ink-300 group-hover:text-ink-600 transition-colors" />
                  </Link>
                </li>
              );
            })}
            <li>
              <Link href="/journal?cat=체형+·+척추+·+관절통증" className="flex items-center gap-2 px-4 py-3 text-[13.5px] font-semibold rounded-xl border border-ink-100 hover:border-ink-300 transition-colors" style={{ color: "#7a4c2e" }}>
                척추·관절 칼럼 150편 전체 보기 →
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-3">자주 묻는 질문</div>
          <h2 className="font-serif text-[22px] md:text-[32px] tracking-[-0.02em] text-ink-900 mb-6 md:mb-8">추나요법 FAQ</h2>
          <div className="divide-y divide-ink-100 border-y border-ink-100">
            {FAQ_JSON_LD.mainEntity.map((faq) => (
              <details key={faq.name} className="group py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <span className="font-serif text-[16px] md:text-[17px] tracking-[-0.015em] text-ink-900 leading-[1.45] flex-1">{faq.name}</span>
                  <span aria-hidden className="shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full border border-ink-200 text-ink-400 group-open:text-white group-open:border-transparent group-open:rotate-45 transition-all duration-300" style={{ "--open-bg": "#7a4c2e" } as React.CSSProperties}>
                    <span className="text-[13px] leading-none group-open:hidden">＋</span>
                    <span className="text-[13px] leading-none hidden group-open:inline">×</span>
                  </span>
                </summary>
                <p className="mt-3 pr-6 md:pr-10 text-[14.5px] leading-[1.78] text-ink-600">{faq.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 원장 소개 */}
      <section style={{ background: "#faf4ee", borderTop: "1px solid #e8d8c8", borderBottom: "1px solid #e8d8c8" }}>
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-5">진료 원장</div>
          <div className="flex items-start gap-5">
            <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl font-serif text-[28px] font-black" style={{ background: "#f0dece", color: "#7a4c2e" }}>文</div>
            <div>
              <div className="font-serif text-[20px] font-black text-ink-900 tracking-[-0.02em]">문학진 대표원장</div>
              <div className="mt-1 text-[13px] text-ink-500 leading-[1.7]">경희대학교 한의학 박사 · 척추신경추나의학회 · AK(응용근신경학) 자격</div>
              <p className="mt-3 text-[14.5px] text-ink-600 leading-[1.78]">
                척추·관절 통증은 구조적 원인을 해결해야 재발이 줄어듭니다. 문학진 원장은 한의학 박사 과정에서 추나의학을 전공했으며, 허리디스크·목디스크·체형교정·교통사고 후유증을 중점 진료합니다.
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
              <h2 className="font-serif text-[24px] md:text-[30px] tracking-[-0.022em] text-ink-900">진단 후 맞춤 치료합니다.</h2>
              <p className="mt-2 text-[14.5px] text-ink-500">교통사고·보험 문의도 전화 한 통으로 안내드립니다.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a href="tel:0285841075" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-[14.5px] font-bold transition-colors" style={{ background: "#7a4c2e" }}>
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
