import Link from "next/link";

const HIDDEN = new Set(["BLOG", "기타"]);

export function BlogCategoryBar({
  active,
  categories,
}: {
  active: string;
  categories: { name: string; count: number }[];
}) {
  const list = categories.filter((c) => !HIDDEN.has(c.name));

  const Item = ({
    label,
    href,
    isActive,
  }: {
    label: string;
    href: string;
    isActive: boolean;
  }) => (
    <Link
      href={href}
      prefetch
      scroll
      className={[
        "inline-flex items-center h-12 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2",
        isActive
          ? "text-ink-900 font-semibold border-ink-900"
          : "text-ink-500 hover:text-ink-900 border-transparent",
      ].join(" ")}
    >
      {label}
    </Link>
  );

  return (
    <div className="border-b border-ink-200 bg-white">
      <div className="max-w-container mx-auto px-4 md:px-8">
        <nav
          className="flex items-center gap-6 md:gap-7 lg:gap-9 overflow-x-auto scrollbar-hide"
          aria-label="블로그 카테고리"
        >
          <Item label="전체" href="/journal" isActive={active === "전체"} />
          {list.map((c) => (
            <Item
              key={c.name}
              label={c.name}
              href={`/journal?cat=${encodeURIComponent(c.name)}`}
              isActive={active === c.name}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
