"use client";
import { useEffect } from "react";

export function TreatmentAnimations({ accent }: { accent: string }) {
  useEffect(() => {
    /* ── 1. 스크롤 진행 바 + 패럴랙스 ── */
    const bar = document.getElementById("tx-pgbar");

    const onScroll = () => {
      const y = window.scrollY;

      // 진행 바
      if (bar) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = h > 0 ? `${(y / h) * 100}%` : "0%";
      }

      // 히어로 일러스트 패럴랙스 (텍스트보다 느리게)
      const wrap = document.getElementById("tx-illus-wrap");
      if (wrap) wrap.style.transform = `translateY(${y * 0.20}px)`;

      // 히어로 텍스트 페이드아웃 + 살짝 올라가기
      const txt = document.getElementById("tx-hero-text");
      if (txt) {
        txt.style.opacity = `${Math.max(0, 1 - y / 380)}`;
        txt.style.transform = `translateY(${y * 0.10}px)`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    /* ── 2. 스크롤 리빌 (IntersectionObserver) ── */
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.08, rootMargin: "0px 0px -52px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    /* ── 3. SVG 드로잉 애니메이션 ── */
    const svgRoot = document.querySelector<SVGElement>(".tx-illus-svg svg");
    if (svgRoot) {
      const tags = ["path", "line", "circle", "ellipse", "rect"] as const;
      const els = tags.flatMap((t) =>
        Array.from(svgRoot.querySelectorAll<SVGElement>(t))
      );

      els.forEach((el, i) => {
        const tag = el.tagName.toLowerCase();
        const isLine = tag === "line";

        // 원래 값 저장
        const origFill = isLine ? "0" : (el.getAttribute("fill-opacity") ?? "1");
        const origStroke = el.getAttribute("stroke-opacity") ?? "0";

        // 초기 숨김
        el.style.fillOpacity = "0";
        el.style.strokeOpacity = "0";
        el.style.strokeDasharray = "2000";
        el.style.strokeDashoffset = "2000";

        // 순차적으로 등장
        setTimeout(() => {
          el.style.transition = [
            "fill-opacity 1s cubic-bezier(.22,1,.36,1)",
            "stroke-opacity 0.5s ease",
            "stroke-dashoffset 2s cubic-bezier(.22,1,.36,1)",
          ].join(", ");

          // double rAF → 브라우저가 initial state를 실제로 렌더링한 뒤 animate 시작
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              el.style.fillOpacity = origFill;
              el.style.strokeOpacity = origStroke;
              el.style.strokeDashoffset = "0";
            })
          );
        }, 350 + i * 55);
      });
    }

    /* ── 4. 메서드 카드 숫자 틱업 ── */
    const nums = document.querySelectorAll<HTMLElement>(".tx-card-num");
    nums.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "scale(0.5)";
      el.style.transition = "opacity 0.5s ease, transform 0.5s cubic-bezier(.22,1,.36,1)";
      setTimeout(() => {
        // 카드가 visible 된 이후에 트리거되도록 짧은 폴링
        const check = () => {
          const card = el.closest(".reveal");
          if (card?.classList.contains("is-visible")) {
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
          } else {
            setTimeout(check, 80);
          }
        };
        check();
      }, 100);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    /* 스크롤 진행 바 */
    <div
      id="tx-pgbar"
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "2.5px",
        width: "0%",
        background: accent,
        zIndex: 200,
        pointerEvents: "none",
        transition: "width 0.1s linear",
        borderRadius: "0 2px 2px 0",
      }}
    />
  );
}
