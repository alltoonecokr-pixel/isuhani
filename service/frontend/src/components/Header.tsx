"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { BlogSearchInline } from "@/components/blog/BlogSearchInline";
import { TREATMENTS } from "@/data/treatments";
import {
  LeafIcon,
  SpineIcon,
  MotherChildIcon,
  SproutIcon,
  BalanceIcon,
  DropLeafIcon,
  MortarIcon,
} from "@/components/landing/HerbIcons";

type RecentPost = {
  logNo: string;
  title: string;
  category: string;
  dateLabel: string;
};

type IconType = React.ComponentType<{ size?: number; className?: string }>;
type MenuItem = { label: string; desc?: string; href: string; Icon: IconType };

// 진료 영역 드롭다운 — treatments 데이터 + herb 아이콘 매핑
const TREATMENT_ICONS: Record<string, IconType> = {
  spine: SpineIcon,
  women: MotherChildIcon,
  children: SproutIcon,
  diet: BalanceIcon,
  health: MortarIcon,
  skin: DropLeafIcon,
};
const TREATMENT_ITEMS: MenuItem[] = Object.values(TREATMENTS).map((t) => ({
  label: t.name,
  desc: t.tagline,
  href: `/treatment/${t.slug}`,
  Icon: TREATMENT_ICONS[t.slug] ?? LeafIcon,
}));

export function Header({ recentPosts = [] }: { recentPosts?: RecentPost[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isJournal =
    pathname === "/" || pathname === "/journal" || /^\/\d+$/.test(pathname);

  return (
    <header className="sticky top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-ink-100">
      <div className="max-w-container mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
        {/* 좌: 브랜드 */}
        <Link
          href="/"
          className="shrink-0 inline-flex items-center gap-2.5 group"
          aria-label="이수한의원 홈"
        >
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
        <nav className="hidden md:flex items-center gap-1 mx-auto">
          <NavLink label="병원 소개" href="/home" active={pathname === "/home"} />
          <NavDropdown label="진료 영역" items={TREATMENT_ITEMS} active={pathname.startsWith("/treatment")} />
          <NavLink label="건강 저널" href="/journal" active={isJournal} />
          <NavLink label="첫 방문" href="/visit-guide" active={pathname.startsWith("/visit-guide")} />
          <NavLink label="쑤 상담" href="/ask" active={pathname.startsWith("/ask")} badge />
        </nav>

        {/* 우: 검색 + 전화예약 CTA + 모바일 햄버거 */}
        <div className="flex items-center gap-2 md:gap-3">
          <BlogSearchInline recent={recentPosts} />
          <a
            href="tel:0285841075"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-herb-700 px-4 py-2 text-[13px] font-bold text-white hover:bg-herb-900 transition-colors"
          >
            <Phone size={15} strokeWidth={2.5} />
            전화 예약
          </a>
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
        <div className="md:hidden border-t border-ink-100 bg-white max-h-[80vh] overflow-y-auto">
          <nav className="max-w-container mx-auto px-4 py-2 flex flex-col">
            <MobileLink label="병원 소개" href="/home" onClick={() => setOpen(false)} active={pathname === "/home"} />
            <MobileGroup label="진료 영역" items={TREATMENT_ITEMS} onNavigate={() => setOpen(false)} />
            <MobileLink label="건강 저널" href="/journal" onClick={() => setOpen(false)} active={isJournal} />
            <MobileLink label="첫 방문" href="/visit-guide" onClick={() => setOpen(false)} active={pathname.startsWith("/visit-guide")} />
            <MobileLink label="쑤 상담" href="/ask" onClick={() => setOpen(false)} active={pathname.startsWith("/ask")} badge />
            <a
              href="tel:0285841075"
              className="mt-3 mb-3 inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 bg-herb-700 text-white text-sm font-semibold tabular-nums hover:bg-herb-900 transition-colors"
            >
              <Phone size={16} />
              02-584-1075 전화 예약
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

/* ── 평범한 탭 ── */
function NavLink({
  label,
  href,
  active,
  badge,
}: {
  label: string;
  href: string;
  active: boolean;
  badge?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "relative inline-flex items-center h-16 px-3 text-[13.5px] font-semibold tracking-[-0.01em] transition-colors",
        active ? "text-ink-900" : "text-ink-600 hover:text-ink-900",
      ].join(" ")}
    >
      {label}
      {badge && <NewPing />}
      {/* 텍스트와 독립된 absolute 언더라인 — 텍스트 위치 절대 불변 */}
      <span
        aria-hidden
        className={[
          "absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-opacity duration-200",
          active ? "bg-herb-700 opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </Link>
  );
}

/* ── 드롭다운 탭 (CSS hover) ── */
function NavDropdown({
  label,
  items,
  active,
}: {
  label: string;
  items: MenuItem[];
  active: boolean;
}) {
  return (
    <div className="relative group">
      <button
        type="button"
        className={[
          "relative inline-flex items-center gap-1 h-16 px-3 text-[13.5px] font-semibold tracking-[-0.01em] transition-colors",
          active ? "text-ink-900" : "text-ink-600 group-hover:text-ink-900",
        ].join(" ")}
      >
        {label}
        <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
        <span
          aria-hidden
          className={[
            "absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-opacity duration-200",
            active ? "bg-herb-700 opacity-100" : "opacity-0",
          ].join(" ")}
        />
      </button>
      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50">
        <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rotate-45 border-l border-t border-ink-100" />
        <div className="relative min-w-[21rem] rounded-2xl bg-white p-2 shadow-[0_22px_55px_-22px_rgba(26,20,16,0.28)] ring-1 ring-ink-100">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-herb-50 transition-colors"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-herb-50 text-herb-700 transition-colors group-hover/item:bg-herb-700 group-hover/item:text-white">
                <it.Icon size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-semibold text-ink-900 transition-colors group-hover/item:text-herb-700">
                  {it.label}
                </span>
                {it.desc && (
                  <span className="block truncate text-[11.5px] text-ink-400">{it.desc}</span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── NEW ping 배지 ── */
function NewPing() {
  return (
    <span className="relative ml-1.5 inline-flex items-center">
      <span className="relative z-10 rounded-full bg-herb-700 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] text-white">
        NEW
      </span>
      <span className="absolute inset-0 rounded-full bg-herb-500 opacity-40 animate-ping" aria-hidden />
    </span>
  );
}

/* ── 모바일: 단일 링크 ── */
function MobileLink({
  label,
  href,
  active,
  badge,
  onClick,
}: {
  label: string;
  href: string;
  active: boolean;
  badge?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 py-3.5 text-[14px] border-b border-ink-100 transition-colors",
        active ? "text-ink-900 font-bold" : "text-ink-700",
      ].join(" ")}
    >
      {label}
      {badge && <NewPing />}
    </Link>
  );
}

/* ── 모바일: 그룹(하위 링크 펼침) ── */
function MobileGroup({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: MenuItem[];
  onNavigate: () => void;
}) {
  return (
    <div className="border-b border-ink-100 py-3">
      <div className="text-[12px] font-bold tracking-[0.04em] text-ink-400 mb-1">{label}</div>
      <div className="flex flex-col">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            onClick={onNavigate}
            className="flex items-center gap-3 py-2.5 text-[14px] text-ink-700 hover:text-herb-700 transition-colors"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-herb-50 text-herb-700">
              <it.Icon size={16} />
            </span>
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
