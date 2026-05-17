"use client";

import { useState } from "react";
import { Play, X } from "lucide-react";

export type VideoItem = {
  id: string; // YouTube video ID
  title: string;
  category?: string;
};

export function VideoSection({ videos }: { videos: VideoItem[] }) {
  const [active, setActive] = useState<VideoItem | null>(null);
  if (videos.length === 0) return null;

  return (
    <section className="relative -mx-4 md:-mx-8 mt-16 md:mt-20 bg-paper-100">
      <div className="border-t border-ink-200" />

      <div className="max-w-container mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <span className="inline-block w-6 h-px bg-herb-700" aria-hidden></span>
            <span className="text-[12px] tracking-[0.3em] uppercase text-herb-700 font-bold">Watch</span>
            <span className="inline-block w-6 h-px bg-herb-700" aria-hidden></span>
          </div>
          <h2 className="font-serif text-[26px] md:text-[34px] font-black tracking-[-0.025em] text-ink-900 leading-none">
            영상으로 만나는 이수한의원
          </h2>
          <div className="mt-3 text-sm text-ink-500">
            원장님이 직접 전하는 진료 이야기와 건강 팁.
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
        {videos.map((v) => (
          <article key={v.id} className="group">
            <button
              type="button"
              onClick={() => setActive(v)}
              className="block w-full text-left"
              aria-label={`재생: ${v.title}`}
            >
              <div className="relative aspect-video overflow-hidden bg-ink-900 shadow-[0_12px_30px_-10px_rgba(26,20,16,0.25)] group-hover:shadow-[0_22px_50px_-12px_rgba(26,20,16,0.35)] transition-shadow duration-500">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`}
                  alt={v.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`;
                  }}
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <Play size={24} fill="currentColor" className="text-herb-700 ml-1" />
                  </div>
                </div>
              </div>
              {v.category && (
                <div className="mt-4 text-[11px] tracking-[0.2em] uppercase text-herb-700 font-bold">
                  {v.category}
                </div>
              )}
              <h3 className="mt-1.5 font-serif text-[19px] md:text-[20px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.3] line-clamp-2">
                {v.title}
              </h3>
            </button>
          </article>
        ))}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-ink-900/90 flex items-center justify-center p-4 md:p-8"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            onClick={() => setActive(null)}
            aria-label="닫기"
            className="absolute top-5 right-5 inline-flex items-center justify-center w-10 h-10 text-white hover:text-ink-300"
          >
            <X size={24} />
          </button>
          <div
            className="w-full max-w-4xl aspect-video bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${active.id}?autoplay=1&rel=0`}
              title={active.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </section>
  );
}
