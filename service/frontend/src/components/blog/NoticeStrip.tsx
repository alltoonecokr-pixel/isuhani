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
    <div className="bg-herb-50 border-b border-herb-100">
      <div className="max-w-container mx-auto px-4 md:px-8 py-2.5 flex items-center gap-3 text-[13px]">
        <span className="shrink-0 rounded-full bg-herb-700 px-2.5 py-0.5 text-[11px] font-bold text-white">
          공지
        </span>
        <Link
          href={`/${notice.logNo}`}
          className="flex-1 min-w-0 truncate font-medium text-ink-700 hover:text-herb-700 transition-colors"
        >
          {notice.title}
        </Link>
        <span className="hidden sm:inline shrink-0 text-[12px] text-ink-400 tabular-nums">
          {notice.dateLabel}
        </span>
      </div>
    </div>
  );
}
