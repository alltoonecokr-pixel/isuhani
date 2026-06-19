import Link from "next/link";

const HIDDEN = new Set(["BLOG", "기타"]);

export function BlogCategoryBar({
  active,
  categories,
  variant = "v1",
  uiSuffix = "",
}: {
  active: string;
  categories: { name: string; count: number }[];
  variant?: "v1" | "v2";
  /** ?ui=v2 등 현재 비교 모드를 유지하기 위한 쿼리 접미사 */
  uiSuffix?: string;
}) {
  const list = categories.filter((c) => !HIDDEN.has(c.name));
  const isV2 = variant === "v2";

  // 링크에 ui 모드를 보존해 붙인다.
  const withUi = (href: string) => {
    if (!uiSuffix) return href;
    return href.includes("?") ? `${href}&${uiSuffix}` : `${href}?${uiSuffix}`;
  };

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
      href={withUi(href)}
      prefetch
      scroll
      className={
        isV2
          ? [
              // 가벼운 필터 칩 — 테두리 없이, 헤더와 한 존으로
              "inline-flex items-center rounded-full px-3.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors duration-200",
              isActive
                ? "bg-herb-700 text-white"
                : "text-ink-500 hover:bg-ink-50 hover:text-ink-800",
            ].join(" ")
          : [
              "inline-flex items-center h-12 text-[13px] font-medium whitespace-nowrap transition-colors border-b-2",
              isActive
                ? "text-ink-900 font-semibold border-herb-700"
                : "text-ink-500 hover:text-ink-900 border-transparent",
            ].join(" ")
      }
    >
      {label}
    </Link>
  );

  return (
    <div className={isV2 ? "bg-white border-b border-ink-100" : "border-b border-ink-200 bg-white"}>
      <div className="max-w-container mx-auto px-4 md:px-8">
        <nav
          className={[
            "flex items-center overflow-x-auto scrollbar-hide",
            isV2 ? "gap-1 py-2.5" : "gap-6 md:gap-7 lg:gap-9",
          ].join(" ")}
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
