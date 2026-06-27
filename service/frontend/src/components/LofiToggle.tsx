"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

// 로파이 배경음악 — 유튜브 채널 @isu_hani 의 lofi 영상.
// 기본 ON. 단, 브라우저 정책상 소리 자동재생은 "첫 사용자 동작(클릭/탭/키)" 전까지
// 차단되므로, 첫 상호작용 시점에 플레이어를 한 번 리로드해 즉시 소리가 나게 한다.
const LOFI_VIDEO_ID = "3Et1tV6dM3Q";
const STORE_KEY = "isu_bgm";

export function LofiToggle() {
  const [hydrated, setHydrated] = useState(false);
  const [on, setOn] = useState(true);
  const [kick, setKick] = useState(0); // 첫 제스처에 iframe 리로드용
  const kicked = useRef(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORE_KEY);
    } catch {
      /* noop */
    }
    // 사용자가 직접 켠 적('1')이 있을 때만 ON (기본 OFF)
    setOn(stored === "1");
    setHydrated(true);
  }, []);

  // 첫 사용자 동작에 한 번 iframe 을 리로드 → 자동재생 차단 우회(소리 시작)
  useEffect(() => {
    if (!hydrated) return;
    const onFirstGesture = () => {
      if (kicked.current) return;
      kicked.current = true;
      setKick((k) => k + 1);
      remove();
    };
    const evs: (keyof DocumentEventMap)[] = [
      "pointerdown",
      "keydown",
      "touchstart",
    ];
    const remove = () =>
      evs.forEach((e) => window.removeEventListener(e, onFirstGesture));
    evs.forEach((e) =>
      window.addEventListener(e, onFirstGesture, { once: false, passive: true }),
    );
    return remove;
  }, [hydrated]);

  const toggle = () => {
    setOn((v) => {
      const next = !v;
      try {
        localStorage.setItem(STORE_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
    setKick((k) => k + 1);
  };

  if (!hydrated) return null;

  return (
    <>
      {on && (
        <iframe
          key={kick}
          title="잔잔한 배경음악"
          aria-hidden
          tabIndex={-1}
          src={`https://www.youtube-nocookie.com/embed/${LOFI_VIDEO_ID}?autoplay=1&loop=1&playlist=${LOFI_VIDEO_ID}&controls=0&modestbranding=1&playsinline=1&rel=0`}
          allow="autoplay; encrypted-media"
          style={{
            position: "fixed",
            width: 1,
            height: 1,
            left: -10,
            bottom: -10,
            opacity: 0,
            border: 0,
            pointerEvents: "none",
          }}
        />
      )}

      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? "배경음악 끄기" : "잔잔한 배경음악 켜기"}
        title={on ? "배경음악 끄기" : "잔잔한 배경음악 켜기"}
        className={[
          "fixed bottom-5 left-5 z-30 inline-flex items-center",
          /* 모바일: 아이콘 전용 원형 / 데스크톱: 텍스트 포함 pill */
          "md:gap-2 md:pl-3 md:pr-4 md:py-2.5 md:text-[13px] md:font-semibold md:tracking-[-0.01em]",
          "p-2.5 rounded-full",
          "shadow-[0_10px_28px_-12px_rgba(26,20,16,0.35)] transition-colors",
          on
            ? "bg-herb-700 text-white hover:bg-herb-800"
            : "bg-white/95 text-ink-700 hover:text-herb-700 border border-ink-200 backdrop-blur",
        ].join(" ")}
      >
        {on ? (
          <Pause size={14} aria-hidden />
        ) : (
          <Music size={14} aria-hidden />
        )}
        <span className="hidden md:inline">{on ? "음악 끄기" : "잔잔한 음악"}</span>
        {on && (
          <span
            aria-hidden
            className="hidden md:inline-flex ml-0.5 items-center gap-[3px]"
          >
            <span className="w-[3px] h-[3px] rounded-full bg-white/90 animate-pulse" />
            <span className="w-[3px] h-[3px] rounded-full bg-white/90 animate-pulse [animation-delay:0.2s]" />
            <span className="w-[3px] h-[3px] rounded-full bg-white/90 animate-pulse [animation-delay:0.4s]" />
          </span>
        )}
      </button>
    </>
  );
}
