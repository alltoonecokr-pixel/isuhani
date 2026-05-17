"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { BlogSearchInline } from "@/components/blog/BlogSearchInline";

type RecentPost = {
  logNo: string;
  title: string;
  category: string;
  dateLabel: string;
};

export function Header({ recentPosts = [] }: { recentPosts?: RecentPost[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isJournal = pathname === "/journal" || /^\/\d+$/.test(pathname);

  const NAV: { label: string; href: string; match: (p: string) => boolean }[] = [
    { label: "진료 영역", href: "/#treatments", match: () => false },
    { label: "첫 방문 안내", href: "/visit-guide", match: (p) => p.startsWith("/visit-guide") },
    { label: "건강 저널", href: "/journal", match: () => isJournal },
  ];

  return (
    <header className="sticky top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
        {/* 좌: 브랜드 — 마크 + 워드마크 */}
        <Link
          href="/"
          className="shrink-0 inline-flex items-center gap-2.5 group"
          aria-label="이수한의원 홈"
        >
          {/* 브랜드 마크 — 잎새 SVG (한자 폰트 미지원 환경에서도 정상 렌더) */}
          <span
            aria-hidden
            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-herb-50 group-hover:bg-herb-700 transition-colors"
          >
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-herb-700 group-hover:text-white transition-colors">
              <path d="M6 26 C 8 16, 16 8, 26 6 C 24 16, 16 24, 6 26 Z" />
              <path d="M9 23 L 22 10" />
            </svg>
          </span>
          <span className="font-serif text-[22px] md:text-[24px] font-bold tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors">
            이수한의원
          </span>
        </Link>

        {/* 중: 데스크톱 네비 */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 mx-auto">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "text-[13.5px] font-semibold tracking-[-0.01em] transition-colors",
                  active
                    ? "text-ink-900 border-b-2 border-ink-900 pb-px"
                    : "text-ink-600 hover:text-ink-900",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 우: 검색 + 모바일 햄버거 (데스크톱 전화 CTA 제거 — Hero/Visit/FAQ에서 충분히 노출) */}
        <div className="flex items-center gap-2 md:gap-3">
          <BlogSearchInline recent={recentPosts} />
          {/* 모바일만: 작은 전화 아이콘 (햄버거 옆) — 데스크톱은 검색만 노출 */}
          <a
            href="tel:0285841075"
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-ink-900 hover:text-herb-700"
            aria-label="전화 02-584-1075"
          >
            <Phone size={18} strokeWidth={2.2} />
          </a>
          <button
            className="md:hidden p-1 text-ink-900"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 모바일 드로어 */}
      {open && (
        <div className="md:hidden border-t border-ink-200 bg-white">
          <nav className="max-w-container mx-auto px-4 py-2 flex flex-col">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className={[
                "py-3.5 text-[14px] border-b border-ink-100 transition-colors",
                pathname === "/" ? "text-ink-900 font-bold" : "text-ink-700",
              ].join(" ")}
            >
              홈
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={[
                  "py-3.5 text-[14px] border-b border-ink-100 transition-colors",
                  item.match(pathname) ? "text-ink-900 font-bold" : "text-ink-700",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="tel:0285841075"
              className="mt-3 mb-3 inline-flex items-center justify-center gap-2 px-4 py-3 bg-ink-900 text-white text-sm font-semibold tabular-nums hover:bg-herb-700 transition-colors"
            >
              <Phone size={16} />
              02-584-1075 전화걸기
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
