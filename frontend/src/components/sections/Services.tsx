import Link from "next/link";
import {
  Bone,
  Baby,
  Sparkles,
  Heart,
  Flower2,
  Leaf,
  ArrowUpRight,
} from "lucide-react";

const SERVICES = [
  {
    no: "01",
    slug: "spine",
    Icon: Bone,
    title: "체형 · 척추 · 관절통증",
    desc: "디스크 / 추나요법 / 체형교정 / 자동차보험 한방치료",
  },
  {
    no: "02",
    slug: "women",
    Icon: Flower2,
    title: "여성 · 산후조리",
    desc: "산후풍 / 갱년기 / 난임·임신 / 자궁질환",
  },
  {
    no: "03",
    slug: "children",
    Icon: Baby,
    title: "소아 성장",
    desc: "어린이 성장클리닉 / 성조숙증 / 소아비염",
  },
  {
    no: "04",
    slug: "diet",
    Icon: Heart,
    title: "비만 · 다이어트",
    desc: "한방 다이어트 / 체질 분석 기반 관리",
  },
  {
    no: "05",
    slug: "skin",
    Icon: Sparkles,
    title: "피부",
    desc: "여드름 / 아토피 / 피부 트러블 한방 관리",
  },
  {
    no: "06",
    slug: "health",
    Icon: Leaf,
    title: "건강관리 · 보약",
    desc: "공진단 / 경옥고 / 노화·근감소 케어",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-white border-t border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 py-16 md:py-24">
        <header className="grid lg:grid-cols-12 gap-6 lg:gap-12 pb-8 md:pb-12 border-b border-ink-200">
          <div className="lg:col-span-5">
            <div className="eyebrow">Section · 진료 안내</div>
            <h2 className="mt-3 font-serif text-3xl md:text-[44px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
              6가지 진료 영역
            </h2>
          </div>
          <p className="lg:col-span-6 lg:col-start-7 text-base md:text-lg text-ink-700 leading-[1.78] self-end">
            한의학 전문 원장 3인이 환자분의 체질과 증상에 맞춰
            세심하게 진료하고 처방합니다. 어떤 진료를 받을지 망설여진다면
            전화로 편하게 문의해 주세요.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {SERVICES.map(({ no, slug, Icon, title, desc }) => (
            <Link
              key={title}
              href={`/treatment/${slug}`}
              className="group py-2 block"
            >
              <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-ink-200">
                <span className="font-serif text-[12px] tracking-[0.2em] text-ink-400 tabular-nums">
                  {no}
                </span>
                <Icon size={22} className="text-herb-700" strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-[22px] md:text-[26px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.2]">
                {title}
              </h3>
              <p className="mt-3 text-sm text-ink-700 leading-[1.78]">
                {desc}
              </p>
              <div className="mt-4 inline-flex items-center gap-1 text-[11px] tracking-[0.2em] uppercase text-herb-700 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                자세히 보기
                <ArrowUpRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
