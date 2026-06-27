import Link from "next/link";
import type { Metadata } from "next";
import { Phone, ExternalLink, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "공진단 & 경옥고 완전 가이드 — 이수한의원",
  description:
    "이수한의원 공진단·경옥고 허브. 효능·복용법·가격·수험생 공진단·부작용·사향 vs 녹용 차이까지. 경희대 한의학 박사 문학진 원장이 처방합니다.",
  keywords: [
    "공진단",
    "이수한의원 공진단",
    "공진단 가격",
    "공진단 효능",
    "공진단 부작용",
    "공진단 복용법",
    "수험생 공진단",
    "공진단 경옥고 차이",
    "사향 공진단",
    "녹용 공진단",
    "남성역 공진단",
    "사당동 공진단",
    "경옥고",
  ],
  alternates: { canonical: `${SITE_URL}/gongjindan` },
  openGraph: {
    type: "article",
    title: "공진단 & 경옥고 완전 가이드 — 이수한의원",
    description:
      "효능·복용법·가격·수험생 공진단·부작용·사향 vs 녹용 차이까지. 경희대 한의학 박사 문학진 원장 직접 처방.",
    url: `${SITE_URL}/gongjindan`,
    images: [{ url: `${SITE_URL}/og.png` }],
  },
};

/* ── 글 목록 ── */
const POSTS = [
  {
    logNo: "224136780944",
    title: "[공진단 FAQ] 공진단, 제대로 알고 먹어야 보약입니다. 환자분들이 가장 많이 묻는 질문 5가지에 답을 드립니다.",
    tag: "FAQ",
  },
  {
    logNo: "223941871203",
    title: "수능을 앞둔 고3 수험생. 체력과 집중력을 위한 공진단의 3가지 비밀",
    tag: "수험생",
  },
  {
    logNo: "223912733167",
    title: "공진단 만들기 위한 약재들을 검수했습니다.",
    tag: "제조과정",
  },
  {
    logNo: "222626145598",
    title: "연초에 자신에게 또는 감사한 분들에게 건강선물로 제격인 공진단 만들기.",
    tag: "선물",
  },
  {
    logNo: "222149502352",
    title: "수험생 보약 [공진단, 총명공진단, 경옥고]",
    tag: "수험생",
  },
  {
    logNo: "221192323251",
    title: "이수한의원 공진단, 경옥고 [남성역 한의원]",
    tag: "처방 안내",
  },
  {
    logNo: "220802359163",
    title: "공진단의 효능 — 기억력 개선",
    tag: "효능",
  },
  {
    logNo: "220796357337",
    title: "공진단을 만듭니다",
    tag: "제조과정",
  },
  {
    logNo: "220026392768",
    title: "[수험생보약] 수험생의 집중력 향상과 최상의 컨디션을 위한 총명공진단",
    tag: "수험생",
  },
  {
    logNo: "222707043982",
    title: "롱코비드(Long Covid) — 코로나 후유증, 경옥고가 좋습니다",
    tag: "경옥고",
  },
  {
    logNo: "221358990377",
    title: "경옥고 [남성역 경옥고 한의원]",
    tag: "경옥고",
  },
  {
    logNo: "110166346775",
    title: "어버이날·스승의날 선물은 경옥고·공진단으로 추천합니다",
    tag: "선물",
  },
  {
    logNo: "110148167742",
    title: "경옥고, 건강을 위해 매일매일 한수저",
    tag: "경옥고",
  },
  {
    logNo: "110114478959",
    title: "공진단(供辰丹) 이야기",
    tag: "기초 지식",
  },
];

const TAG_COLOR: Record<string, { bg: string; text: string }> = {
  "FAQ":       { bg: "#e8f5ee", text: "#2d6b40" },
  "수험생":    { bg: "#e8eef5", text: "#2c4e7a" },
  "제조과정":  { bg: "#f5ece8", text: "#7a3c2c" },
  "선물":      { bg: "#f5e8f0", text: "#7a2c5a" },
  "처방 안내": { bg: "#eee8f5", text: "#4a2c7a" },
  "효능":      { bg: "#e8f5ee", text: "#2d6b40" },
  "경옥고":    { bg: "#f5f0e8", text: "#7a5a2c" },
  "기초 지식": { bg: "#f0f0f0", text: "#555" },
};

/* ── FAQ JSON-LD ── */
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "공진단 효능은 무엇인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "공진단은 원기 회복, 체력 강화, 집중력 향상, 면역력 증진에 효과적입니다. 특히 만성 피로, 수험생 체력 관리, 고령자 기력 보충에 많이 처방됩니다. 주요 성분인 사향(또는 녹용), 당귀, 산수유, 목향이 시너지 효과를 냅니다.",
      },
    },
    {
      "@type": "Question",
      name: "이수한의원 공진단 가격은 얼마인가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "공진단은 사향(천연 사향) 원방과 녹용 대체 처방의 가격이 다릅니다. 체질 진단 후 원장님이 적합한 처방을 안내드리며, 정확한 가격은 상담 시 말씀드립니다. 02-584-1075로 문의해 주세요.",
      },
    },
    {
      "@type": "Question",
      name: "공진단 복용법(언제, 어떻게 먹나요)은?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "공진단은 보통 아침 공복에 1알을 따뜻한 물 또는 꿀물과 함께 복용합니다. 처방에 따라 저녁 추가 복용 가능합니다. 공복 복용이 흡수율이 높으며, 녹차나 커피와 함께 드시면 효과가 감소할 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "공진단 부작용이 있나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "체질에 맞게 처방된 공진단은 부작용이 거의 없습니다. 다만 열이 많은 체질(태양인·양실체질)에서는 상열감이 생길 수 있으며, 소화기가 약하신 분은 처음에 소화 불편을 느낄 수 있습니다. 반드시 한의사의 체질 진단 후 처방을 받으시기를 권합니다.",
      },
    },
    {
      "@type": "Question",
      name: "사향 공진단과 녹용 공진단의 차이는?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "사향 공진단은 천연 사향을 사용한 원방(原方)으로 원기 회복 효과가 강력하지만 가격이 높습니다. 녹용 공진단은 사향 대신 녹용을 사용한 처방으로, 성장 발육과 조혈 기능이 추가되며 상대적으로 가격이 낮습니다. 체질과 목적에 따라 원장님이 추천해 드립니다.",
      },
    },
    {
      "@type": "Question",
      name: "수험생에게 공진단이 좋은 이유는?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "공진단은 심장과 뇌에 기운을 집중시켜 집중력, 기억력, 체력 지속성을 높입니다. 수험생의 과도한 학습으로 인한 두뇌 피로·수면 질 저하·집중력 감소에 효과적입니다. 이수한의원에서는 수험생 전용 총명공진단 처방도 운영합니다.",
      },
    },
    {
      "@type": "Question",
      name: "공진단과 경옥고의 차이는?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "공진단은 원기 및 기력 회복, 면역 강화에 초점을 맞춥니다. 경옥고는 정(精)을 보충하는 장기 복용 보약으로 폐·신장 기능을 강화하고 노화 방지에 효과적입니다. 급격한 체력 저하엔 공진단, 만성 피로·폐 건강·노화 예방엔 경옥고가 권장됩니다.",
      },
    },
    {
      "@type": "Question",
      name: "부모님께 드릴 효도 선물로 공진단이 좋은가요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "네, 공진단은 어버이날·추석·설날 효도 선물로 매우 인기 있습니다. 어르신의 체력 저하, 만성 피로, 면역력 감소에 효과적이며, 진단 후 연세와 체질에 맞는 처방을 드립니다. 선물 목적 처방도 가능하므로 02-584-1075로 문의해 주세요.",
      },
    },
    {
      "@type": "Question",
      name: "공진단은 누구에게 적합하지 않나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "열이 아주 많고 체력이 충만한 체질은 공진단이 맞지 않을 수 있습니다. 또한 임산부, 수유 중인 분은 반드시 한의사와 상담 후 복용해야 합니다. 이수한의원에서는 체질 진단 후에만 처방하므로 부적합한 처방을 방지합니다.",
      },
    },
    {
      "@type": "Question",
      name: "공진단은 몇 알이나 처방받나요?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "일반적으로 10알, 30알 단위로 처방됩니다. 보통 한 달 복용(30알)을 기준으로 체력 개선을 확인합니다. 효과 지속 원하시면 2~3개월 복용을 권장하며, 이후 경옥고로 전환하는 방법도 있습니다.",
      },
    },
  ],
};

const COLLECTION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/gongjindan`,
  name: "이수한의원 공진단 & 경옥고 완전 가이드",
  description:
    "이수한의원의 공진단·경옥고 관련 모든 칼럼과 FAQ를 한곳에 모았습니다. 효능·복용법·가격·체질별 처방 안내.",
  url: `${SITE_URL}/gongjindan`,
  about: {
    "@type": "MedicalTherapy",
    name: "공진단",
    alternateName: "供辰丹",
    description:
      "한의학 고전 처방. 사향·녹용·당귀·산수유·목향으로 구성. 원기 회복, 집중력 향상, 면역 강화에 사용.",
    relevantSpecialty: "TraditionalChineseMedicine",
    recognizingAuthority: { "@type": "Organization", name: "이수한의원" },
  },
  author: {
    "@type": "Person",
    name: "문학진",
    jobTitle: "대표원장 · 한의학 박사 · 척추신경추나의학회",
    worksFor: { "@type": "MedicalClinic", "@id": SITE_URL, name: "이수한의원" },
    knowsAbout: ["공진단", "경옥고", "보약", "체력 회복", "수험생 한약"],
  },
  isPartOf: { "@type": "MedicalClinic", "@id": SITE_URL },
  hasPart: POSTS.map((p, i) => ({
    "@type": "BlogPosting",
    position: i + 1,
    headline: p.title,
    url: `${SITE_URL}/${p.logNo}`,
  })),
};

export default function GongjindanPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(COLLECTION_JSON_LD) }}
      />

      {/* ════════ HERO ════════ */}
      <section className="bg-[#f5f0e8] border-b border-[#e2d8c8]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-14 md:pb-18">
          <div className="chip-kr mb-5">공진단 · 경옥고</div>
          <h1 className="font-serif text-[28px] md:text-[54px] leading-[1.08] tracking-[-0.025em] text-ink-900">
            이수한의원
            <br />
            공진단 완전 가이드
          </h1>
          <p className="mt-6 text-[16px] md:text-[17.5px] leading-[1.82] text-ink-600 max-w-xl">
            효능, 복용법, 가격, 수험생 처방, 경옥고 차이까지.
            <br className="hidden md:block" />
            경희대 한의학 박사 문학진 원장이 직접 처방합니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="tel:0285841075"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#5c4a2a] text-white text-[14.5px] font-bold hover:bg-[#3d3018] transition-colors"
            >
              <Phone size={15} strokeWidth={2.5} />
              02-584-1075 상담 예약
            </a>
            <Link
              href="/treatment/health"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[#c8b898] text-[#5c4a2a] text-[14.5px] font-semibold hover:bg-[#ede5d8] transition-colors"
            >
              건강관리·보약 진료 안내 →
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ 핵심 정보 카드 ════════ */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-5">한눈에 보기</div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                q: "복용법",
                a: "아침 공복 1알 · 따뜻한 물 또는 꿀물",
              },
              {
                q: "주성분",
                a: "사향(또는 녹용) · 당귀 · 산수유 · 목향",
              },
              {
                q: "적응증",
                a: "만성 피로 · 수험생 집중력 · 어르신 기력 · 면역 저하",
              },
              {
                q: "처방 절차",
                a: "체질 진단 → 원장 처방 → 원내 조제",
              },
              {
                q: "보험 여부",
                a: "비급여 (실손보험 청구 가능 · 약관 확인 필요)",
              },
              {
                q: "경옥고와 차이",
                a: "공진단: 빠른 기력 회복 / 경옥고: 정(精) 보충 · 노화 예방",
              },
            ].map((item) => (
              <div
                key={item.q}
                className="p-4 rounded-xl bg-[#faf8f4] border border-[#e8e0d0]"
              >
                <div className="text-[11.5px] font-bold tracking-[0.08em] text-[#8a6a3a] mb-1">
                  {item.q}
                </div>
                <div className="text-[14.5px] text-ink-800 leading-snug">
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 글 목록 ════════ */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-3">칼럼 · 가이드</div>
          <h2 className="font-serif text-[22px] md:text-[32px] tracking-[-0.02em] text-ink-900 mb-6 md:mb-8">
            공진단·경옥고 관련 칼럼 {POSTS.length}편
          </h2>
          <ul className="space-y-2">
            {POSTS.map((p) => {
              const tc = TAG_COLOR[p.tag] ?? { bg: "#f0f0f0", text: "#555" };
              return (
                <li key={p.logNo}>
                  <Link
                    href={`/${p.logNo}`}
                    className="group flex items-start gap-3 p-4 rounded-xl border border-transparent hover:border-ink-100 hover:bg-[#faf8f4] transition-all"
                  >
                    <span
                      className="mt-0.5 shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: tc.bg, color: tc.text }}
                    >
                      {p.tag}
                    </span>
                    <span className="text-[14.5px] text-ink-800 leading-[1.55] group-hover:text-ink-900 flex-1">
                      {p.title}
                    </span>
                    <ChevronRight
                      size={15}
                      className="shrink-0 mt-0.5 text-ink-300 group-hover:text-ink-600 transition-colors"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section className="bg-white border-b border-ink-100">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-3">자주 묻는 질문</div>
          <h2 className="font-serif text-[22px] md:text-[32px] tracking-[-0.02em] text-ink-900 mb-6 md:mb-8">
            공진단 FAQ
          </h2>
          <div className="divide-y divide-ink-100 border-y border-ink-100">
            {FAQ_JSON_LD.mainEntity.map((faq) => (
              <details key={faq.name} className="group py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                  <span className="font-serif text-[16px] md:text-[17px] tracking-[-0.015em] text-ink-900 leading-[1.45] flex-1">
                    {faq.name}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full border border-ink-200 text-ink-400 group-open:bg-[#5c4a2a] group-open:text-white group-open:border-[#5c4a2a] group-open:rotate-45 transition-all duration-300"
                  >
                    <span className="text-[13px] leading-none">＋</span>
                  </span>
                </summary>
                <p className="mt-3 pr-6 md:pr-10 text-[14.5px] leading-[1.78] text-ink-600">
                  {faq.acceptedAnswer.text}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 원장 소개 ════════ */}
      <section className="bg-[#faf8f4] border-b border-[#e8e0d0]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
          <div className="chip-kr mb-5">처방 원장</div>
          <div className="flex items-start gap-5">
            <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-[#ede5d8] text-[#5c4a2a] font-serif text-[28px] font-black">
              文
            </div>
            <div>
              <div className="font-serif text-[20px] font-black text-ink-900 tracking-[-0.02em]">
                문학진 대표원장
              </div>
              <div className="mt-1 text-[13px] text-ink-500 leading-[1.7]">
                경희대학교 한의학 박사 · 척추신경추나의학회 · AK(응용근신경학) 자격
              </div>
              <p className="mt-3 text-[14.5px] text-ink-600 leading-[1.78]">
                공진단·경옥고 처방은 체질 진단이 핵심입니다. 문학진 원장은 1986년부터 이어온 이수한의원의 전통 처방에 따라,
                환자 개개인의 체질과 건강 상태를 직접 진단한 뒤 처방합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="bg-white">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-14 md:py-18">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="font-serif text-[24px] md:text-[30px] tracking-[-0.022em] text-ink-900">
                체질 진단 후 처방합니다.
              </h2>
              <p className="mt-2 text-[14.5px] text-ink-500">
                전화 한 통으로 상담 예약하세요. 공진단 처방 목적도 안내해 드려요.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#5c4a2a] text-white text-[14.5px] font-bold hover:bg-[#3d3018] transition-colors"
              >
                <Phone size={15} strokeWidth={2.5} />
                02-584-1075
              </a>
              <Link
                href="/ask"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-ink-200 hover:border-ink-900 text-ink-800 text-[14.5px] font-semibold transition-colors"
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
