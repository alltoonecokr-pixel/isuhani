"use client";

import { useEffect, useState, useCallback } from "react";

export type JourneySection = { id: string; label: string };

export function ScrollJourney({
  sections,
  variant = "fixed",
}: {
  sections: JourneySection[];
  /** fixed: 뷰포트 좌측 고정 오버레이 (xl+). sticky: 인라인 흐름, 부모가 sticky 담당. */
  variant?: "fixed" | "sticky";
}) {
  const [active, setActive] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const id = (e.target as HTMLElement).id;
          if (e.isIntersecting) visible.set(id, e.intersectionRatio);
          else visible.delete(id);
        });
        let best: string | null = null;
        let bestRatio = 0;
        visible.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        });
        if (best) setActive(best);
      },
      {
        rootMargin: "-25% 0px -50% 0px",
        threshold: [0, 0.5, 1],
      },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [sections]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  const activeIdx = Math.max(0, sections.findIndex((s) => s.id === active));

  const navClass =
    variant === "fixed"
      ? "hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20"
      : "w-full";

  return (
    <nav aria-label="페이지 섹션" className={navClass}>
      <ol className="relative flex flex-col gap-1">
        <span
          aria-hidden
          className="absolute left-[3px] top-2 bottom-2 w-px bg-ink-200"
        />
        <span
          aria-hidden
          className="absolute left-[3px] top-2 w-px bg-herb-500/40 transition-all duration-700 ease-out"
          style={{
            height: `calc(${(activeIdx / Math.max(1, sections.length - 1)) * 100}% - 4px)`,
          }}
        />
        {sections.map((s, i) => {
          const isActive = i === activeIdx;
          const isVisited = i < activeIdx;
          const distance = Math.abs(i - activeIdx);
          const opacity =
            distance === 0 ? 1 : distance === 1 ? 0.78 : distance === 2 ? 0.55 : 0.35;
          return (
            <li key={s.id} className="relative">
              <a
                href={`#${s.id}`}
                onClick={(e) => handleClick(e, s.id)}
                aria-current={isActive ? "true" : undefined}
                style={{ opacity }}
                className="group/item flex items-center gap-3.5 py-1.5 pr-2 outline-none rounded-full transition-opacity duration-500 hover:!opacity-100"
              >
                <span
                  aria-hidden
                  className={[
                    "relative shrink-0 block rounded-full transition-all duration-500 ease-out",
                    isActive
                      ? "w-[7px] h-[7px] bg-herb-700 ring-[3px] ring-herb-50"
                      : isVisited
                      ? "w-[7px] h-[7px] bg-herb-500/60 border border-herb-500/30"
                      : "w-[7px] h-[7px] bg-paper border border-ink-300 group-hover/item:border-herb-500 group-hover/item:bg-herb-50",
                  ].join(" ")}
                />
                <span
                  className={[
                    "text-[12px] tracking-tight whitespace-nowrap transition-colors duration-300",
                    isActive
                      ? "text-ink-900 font-bold"
                      : isVisited
                      ? "text-ink-700 font-medium group-hover/item:text-ink-900"
                      : "text-ink-400 font-medium group-hover/item:text-ink-700",
                  ].join(" ")}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
