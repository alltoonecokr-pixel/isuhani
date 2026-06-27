import { ClipboardList, MessagesSquare, Stethoscope, Sparkles, Leaf, type LucideIcon } from "lucide-react";

type Step = {
  icon: LucideIcon;
  label: string;
  desc: string;
};

const STEPS: Step[] = [
  { icon: ClipboardList, label: "접수", desc: "도착 후 간단한 접수" },
  { icon: MessagesSquare, label: "상담", desc: "증상·생활습관 문진" },
  { icon: Stethoscope, label: "진단", desc: "맥진·체질 진단" },
  { icon: Sparkles, label: "치료", desc: "침·추나 등 맞춤 치료" },
  { icon: Leaf, label: "처방 · 관리", desc: "한약 처방과 사후관리" },
];

/**
 * 첫 방문 흐름 단계 시각화 — 토스식 클린 스테퍼.
 * /ask·/visit-guide 등에서 재사용. 색은 herb/ink/paper 그대로.
 */
export function VisitFlow({
  eyebrow = "FIRST VISIT",
  title = "첫 방문, 이렇게 진행돼요",
  subtitle = "처음이라 막막하지 않게. 도착부터 관리까지 다섯 단계예요.",
  className = "",
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <header className="reveal-on-scroll">
        <div className="chip-kr mb-5">{eyebrow}</div>
        <h2 className="font-serif text-[30px] md:text-[44px] leading-[1.15] tracking-[-0.022em] text-ink-900">
          {title}
        </h2>
        <p className="mt-4 text-[14.5px] text-ink-400 max-w-md">{subtitle}</p>
      </header>

      <div className="reveal-on-scroll relative mt-14">
        {/* 데스크톱 연결선 — 노드 중심(top-7)을 가로지름 */}
        <div className="pointer-events-none absolute left-[10%] right-[10%] top-7 hidden h-px bg-herb-200 md:block" />
        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-5 sm:gap-4">
          {STEPS.map(({ icon: Icon, label, desc }, i) => (
            <li key={label} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white ring-1 ring-herb-200 shadow-[0_6px_18px_-8px_rgba(45,110,90,0.35)]">
                <Icon size={24} className="text-herb-700" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-herb-700 text-[11px] font-bold text-white tabular-nums">
                  {i + 1}
                </span>
              </div>
              <div className="mt-4 font-serif text-[17px] font-bold tracking-[-0.02em] text-ink-900">
                {label}
              </div>
              <div className="mt-1.5 text-[13px] leading-[1.55] text-ink-500">
                {desc}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
