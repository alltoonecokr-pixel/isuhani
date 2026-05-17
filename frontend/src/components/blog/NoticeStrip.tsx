import Link from "next/link";
import type { IndexPost } from "./BlogIndexClient";

const NOTICE_KEYWORDS = ["휴진", "휴무", "휴원", "진료 안내", "휴일", "명절", "공휴일"];

export function NoticeStrip({ posts }: { posts: IndexPost[] }) {
  const notice = posts.find(
    (p) =>
      p.category === "한의원 story" &&
      NOTICE_KEYWORDS.some((k) => p.title.includes(k)),
  );
  if (!notice) return null;

  return (
    <div className="bg-paper-100 border-b border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 py-2.5 md:py-3 flex items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px] tracking-[0.2em] uppercase font-bold text-herb-700">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-herb-700" aria-hidden />
          공지
        </span>
        <Link
          href={`/${notice.logNo}`}
          className="flex-1 min-w-0 truncate text-ink-900 hover:text-herb-700 transition-colors"
        >
          <span className="font-semibold">{notice.title}</span>
        </Link>
        <span className="hidden sm:inline shrink-0 text-[11px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
          {notice.dateLabel}
        </span>
      </div>
    </div>
  );
}
