"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";

type Slide = {
  image: string;
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
};

const SLIDES: Slide[] = [
  {
    // 한방 차 / 약초 톤
    image:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=1800&q=85&auto=format&fit=crop",
    eyebrow: "Wellness · 한방의 하루",
    title: (
      <>
        오늘 하루를 깨우는
        <br />
        한 잔의 차.
      </>
    ),
    sub: "공진단부터 경옥고까지, 정성 들인 한방차 처방.",
  },
  {
    // 야외 활동 / 활기
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1800&q=85&auto=format&fit=crop",
    eyebrow: "Movement · 활기찬 일상",
    title: (
      <>
        달리는 사람도,
        <br />
        걷는 사람도.
      </>
    ),
    sub: "추나요법과 체형교정으로 누구든 더 가벼운 하루.",
  },
  {
    // 한의원 자연 / 진료 느낌 (자연 소재)
    image:
      "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1800&q=85&auto=format&fit=crop",
    eyebrow: "Care · 1986년부터",
    title: (
      <>
        남성역 1번 출구.
        <br />
        원장 3인의 진료.
      </>
    ),
    sub: "39년의 시간이 쌓아온 정성 진료, 사이트로도 전합니다.",
  },
];

const AUTOPLAY_MS = 5500;

export function ClinicPromo() {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (hovered) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [hovered]);

  return (
    <section
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="mt-16 md:mt-20"
    >
      {/* 카드 박스 — 그림자 + 미세 보더 */}
      <div className="relative overflow-hidden bg-ink-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] ring-1 ring-ink-900/5">
        {/* 좌측 brand 스트립 — 이수한의원 herb green */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 md:w-2 bg-herb-700 z-10" aria-hidden />

        <div className="relative aspect-[16/10] md:aspect-[21/9] min-h-[460px] md:min-h-[560px]">
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={[
                "absolute inset-0 transition-opacity duration-[1200ms] ease-in-out",
                idx === i ? "opacity-100" : "opacity-0 pointer-events-none",
              ].join(" ")}
              aria-hidden={idx !== i}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" decoding="async"                 src={s.image}
                alt=""
                referrerPolicy="no-referrer"
                className={[
                  "absolute inset-0 w-full h-full object-cover transition-transform duration-[7000ms] ease-out",
                  idx === i ? "scale-105" : "scale-100",
                ].join(" ")}
              />
              {/* 어둡게 + herb-그린 톤 — 브랜드 컬러 시그니처 */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(95deg, rgba(5, 51, 48, 0.92) 0%, rgba(10, 74, 69, 0.78) 30%, rgba(10, 14, 18, 0.45) 65%, rgba(10, 14, 18, 0.2) 100%)",
                }}
              />
              {/* 위→아래 미세 어두움 (텍스트 안정성) */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(5,51,48,0.45) 100%)",
                }}
              />
            </div>
          ))}

          {/* 텍스트 영역 */}
          <div className="relative h-full max-w-container mx-auto px-6 md:px-14 py-16 md:py-24 flex flex-col justify-center text-white">
            <div
              key={idx}
              className={[
                "max-w-2xl transition-all duration-700 ease-out",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
              ].join(" ")}
              style={{
                textShadow:
                  "0 1px 2px rgba(0,0,0,0.25), 0 6px 24px rgba(0,0,0,0.18)",
              }}
            >
              <div className="inline-flex items-center gap-2.5 mb-5 animate-fadein">
                <span className="inline-block w-6 h-px bg-herb-200" aria-hidden />
                <span className="text-[12px] tracking-[0.3em] uppercase text-herb-100/95 font-semibold">
                  {SLIDES[idx].eyebrow}
                </span>
              </div>
              <h2 className="font-serif text-[40px] sm:text-[56px] md:text-[68px] font-black tracking-[-0.025em] leading-[1.05] text-white animate-fadein-slow">
                {SLIDES[idx].title}
              </h2>
              <p className="mt-6 max-w-xl text-base md:text-lg text-white/90 leading-[1.78] animate-fadein-slower">
                {SLIDES[idx].sub}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 animate-fadein-slower">
                <a
                  href="tel:0285841075"
                  className="inline-flex items-center gap-2 text-white hover:text-herb-200 transition-colors"
                >
                  <Phone size={18} />
                  <span className="font-serif text-[22px] md:text-[26px] font-black tabular-nums tracking-[-0.02em]">
                    02-584-1075
                  </span>
                </a>
                <Link
                  href="/clinic"
                  className="text-[12px] tracking-[0.25em] uppercase border-b border-white/70 pb-1 hover:text-herb-200 hover:border-herb-200 transition-colors"
                >
                  한의원 자세히 보기 →
                </Link>
              </div>
            </div>
          </div>

          {/* 인디케이터 */}
          <div className="absolute bottom-6 md:bottom-8 right-6 md:right-12 flex items-center gap-2 z-10">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`슬라이드 ${i + 1}로 이동`}
                className={[
                  "h-1 transition-all duration-500",
                  idx === i ? "w-10 bg-herb-200" : "w-5 bg-white/40 hover:bg-white/70",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
