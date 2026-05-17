"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * 좌측 스크롤 여정 인디케이터.
 * 각 섹션을 점 + 라벨로 표시 + 활성 섹션 강조 + 클릭 시 해당 섹션으로 부드러운 스크롤.
 *
 * 디자인 원칙:
 *  - xl(1280px+)에서만 표시 — 작은 화면에서 본문 침범 방지
 *  - 라벨은 항상 보임 — 어디로 이동할지 한눈에 명확
 *  - 비활성 라벨은 ink-400 (톤다운), 활성은 ink-900 굵게
 *  - left-6 (24px) — 가장자리 너무 붙지 않게
 */

export type JourneySection = { id: string; label: string };

export function ScrollJourney({ sections }: { sections: JourneySection[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id || "");

  useEffect(() => {
    const visible = new Map<string, number>();
    // 단일 IntersectionObserver — 섹션마다 따로 만들지 않아 콜백 빈도 ↓
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
        // threshold 단순화 — 0.1 단계만 추적해도 충분, 콜백 빈도 1/5 수준
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
    const top = el.getBoundingClientRect().top + window.scrollY - 80; // 헤더 보정
    window.scrollTo({ top, behavior: "smooth" });
  }, []);

  // 활성 섹션의 인덱스 — 거리 기반 opacity 계산용
  const activeIdx = Math.max(0, sections.findIndex((s) => s.id === active));

  return (
    <nav
      aria-label="페이지 섹션"
      className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-20"
    >
      <ol className="relative flex flex-col gap-1">
        {/* 세로 가이드 라인 — 방문 영역(이미 본 섹션) + 남은 영역 톤 차이 */}
        <span
          aria-hidden
          className="absolute left-[3px] top-2 bottom-2 w-px bg-ink-200"
        />
        {/* 진행 바 — 활성 위치까지 herb 톤으로 */}
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
          // 거리 기반 opacity — 활성에서 멀어질수록 부드럽게 흐려짐
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
                {/* 점 — 활성/방문/미방문 3단계 + hover 시 살짝 빛남 */}
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
                {/* 라벨 — 항상 표시. 활성 시 강조, 방문은 살짝 진하게 */}
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
