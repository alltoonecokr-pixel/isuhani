"use client";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "step-01", label: "예약 방법" },
  { id: "step-02", label: "진료 시간" },
  { id: "step-03", label: "오시는 길" },
  { id: "step-04", label: "첫 진료 준비" },
  { id: "step-05", label: "보험 · 비용" },
  { id: "step-06", label: "자주 묻는 질문" },
];

export function VisitGuideToc() {
  const [active, setActive] = useState("step-01");

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-16% 0px -72% 0px", threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <nav aria-label="페이지 목차">
      <div className="text-[10px] font-bold tracking-[0.3em] uppercase text-ink-400 mb-5">
        목차
      </div>
      <ul className="space-y-0.5">
        {SECTIONS.map((s, i) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={[
                  "flex items-center gap-3 py-2 pr-2 rounded-lg text-[13px] transition-all duration-200",
                  isActive
                    ? "text-herb-700 font-semibold"
                    : "text-ink-400 hover:text-ink-700",
                ].join(" ")}
              >
                <span
                  className={[
                    "shrink-0 w-[18px] text-[10px] tabular-nums font-bold transition-all duration-200",
                    isActive ? "text-herb-700" : "text-ink-300",
                  ].join(" ")}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-snug">{s.label}</span>
                {isActive && (
                  <span className="ml-auto w-1 h-1 rounded-full bg-herb-700 shrink-0" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
