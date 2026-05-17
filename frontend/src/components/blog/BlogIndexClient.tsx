"use client";

import { useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BlogCategoryBar } from "./BlogCategoryBar";
import { VideoSection, type VideoItem } from "./VideoSection";
import { ClinicPromo } from "./ClinicPromo";
import { NoticeStrip } from "./NoticeStrip";
import { SeriesSection } from "./SeriesSection";

export type IndexPost = {
  logNo: string;
  title: string;
  date: string;
  dateLabel: string;
  category: string;
  thumbnail: string | null;
  excerpt: string;
  hasBody: boolean;
};

const PAGE_SIZE = 30;

export function BlogIndexClient({
  posts,
  categories,
  videos = [],
}: {
  posts: IndexPost[];
  categories: { name: string; count: number }[];
  videos?: VideoItem[];
}) {
  return (
    <Suspense fallback={<BlogCategoryBar active="전체" categories={categories} />}>
      <BlogIndexInner posts={posts} categories={categories} videos={videos} />
    </Suspense>
  );
}

function BlogIndexInner({
  posts,
  categories,
  videos,
}: {
  posts: IndexPost[];
  categories: { name: string; count: number }[];
  videos: VideoItem[];
}) {
  const sp = useSearchParams();
  const activeCat = sp?.get("cat") || "전체";
  const rawQuery = (sp?.get("q") || "").trim();
  const q = rawQuery.toLowerCase();
  const page = Math.max(1, parseInt(sp?.get("page") || "1", 10) || 1);

  const byCategory = useMemo(
    () =>
      activeCat === "전체" ? posts : posts.filter((p) => p.category === activeCat),
    [activeCat, posts],
  );
  const filtered = useMemo(() => {
    if (!q) return byCategory;
    return byCategory.filter((p) =>
      (p.title + " " + p.excerpt).toLowerCase().includes(q),
    );
  }, [byCategory, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const isSearch = Boolean(rawQuery);

  // 검색 페이지 — 단순 그리드 (결과 리스트가 자연스러움)
  if (isSearch) {
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);
    return (
      <>
        <BlogCategoryBar active={activeCat} categories={categories} />
        <section className="bg-white">
          <div className="max-w-container mx-auto px-4 md:px-8 py-12 md:py-16">
            <header className="pb-8 md:pb-10 border-b border-ink-200">
              <div className="eyebrow">Search · 검색</div>
              <h1 className="mt-3 font-serif text-4xl md:text-[52px] font-black tracking-[-0.03em] text-ink-900 leading-[1.05]">
                "{rawQuery}" 검색 결과
              </h1>
              <p className="mt-3 text-base text-ink-700">{filtered.length}편</p>
            </header>
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {pageItems.map((p) => (
                <PostCard key={p.logNo} post={p} />
              ))}
            </div>
            {pageItems.length === 0 && (
              <div className="mt-20 text-center text-ink-500">결과가 없습니다.</div>
            )}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} cat={activeCat} q={rawQuery} />
            )}
          </div>
        </section>
      </>
    );
  }

  // 메인 + 카테고리 페이지 — 3-column 영문 사이트 톤
  const isHome = activeCat === "전체";
  const main = filtered.find((p) => p.thumbnail && p.hasBody) || filtered[0];
  const used = new Set<string>([main?.logNo || ""]);
  const take = (n: number, withImage = true, source: IndexPost[] = filtered) => {
    const out: IndexPost[] = [];
    for (const p of source) {
      if (used.has(p.logNo)) continue;
      if (withImage && !p.thumbnail) continue;
      out.push(p);
      used.add(p.logNo);
      if (out.length === n) break;
    }
    return out;
  };

  const sideList = take(5);
  // 메인은 sub 2개, 카테고리 페이지는 더 풍부하게 4개
  const subFeatures = take(isHome ? 2 : 4);

  // 메인 페이지: 카테고리별 mini-feature 섹션 (콘텐츠 hub 톤)
  // 카테고리 페이지: 그 카테고리의 더 많은 글 그리드
  const sectionCategories = isHome
    ? categories
        .filter((c) => !["BLOG", "기타", "한의원 story", "건강관리"].includes(c.name))
        .slice(0, 4)
        .map((c) => c.name)
    : [];

  const categorySections = sectionCategories.map((catName) => {
    const items: IndexPost[] = [];
    for (const p of posts) {
      if (used.has(p.logNo)) continue;
      if (p.category !== catName) continue;
      items.push(p);
      used.add(p.logNo);
      if (items.length === 4) break;
    }
    return { name: catName, items };
  });

  // 카테고리 페이지에서만 사용할 더 보기 그리드
  const moreList = isHome ? [] : take(PAGE_SIZE);

  // 메인 페이지 사이드바: 다른 카테고리 추천 (현재 카테고리 제외)
  const otherCats = categories
    .filter((c) => c.name !== activeCat && !["BLOG", "기타"].includes(c.name))
    .slice(0, 2);
  const sidebarSections = otherCats.map((c) => ({
    title: c.name,
    href: `/journal?cat=${encodeURIComponent(c.name)}`,
    posts: posts.filter((p) => p.category === c.name && !used.has(p.logNo)).slice(0, 5),
  }));

  // 카테고리 페이지: 같은 카테고리 추천 5개 + 가로 카드 리스트 5개
  const categoryRecommended = isHome ? [] : take(5, false);
  const categoryRowCards = isHome ? [] : take(8, false);

  // 페이지네이션
  const showPagination = !isHome && totalPages > 1;

  // 카테고리 페이지 분기 (서울경제 영문판 톤)
  if (!isHome) {
    return (
      <>
        <BlogCategoryBar active={activeCat} categories={categories} />
        <section className="bg-white">
          <div className="max-w-container mx-auto px-4 md:px-8 py-8 md:py-10">
            <div className="grid lg:grid-cols-12 gap-x-10 gap-y-10">
              {/* 좌 8 — 큰 메인 + 카드 리스트 */}
              <div className="lg:col-span-8">
                {main && <CategoryHero post={main} />}
                {categoryRowCards.length > 0 && (
                  <div className="mt-10 pt-8 border-t border-ink-200 divide-y divide-ink-200">
                    {categoryRowCards.map((p) => (
                      <RowCard key={p.logNo} post={p} />
                    ))}
                  </div>
                )}
              </div>

              {/* 우 4 — 같은 카테고리 추천 */}
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-20">
                  <div className="border-b border-ink-300 pb-2 mb-4">
                    <h3 className="font-serif text-[19px] font-black tracking-[-0.025em] text-ink-900">
                      Most Read · 추천 글
                    </h3>
                  </div>
                  <ol className="divide-y divide-ink-200">
                    {categoryRecommended.map((p, i) => (
                      <li key={p.logNo} className="py-4 first:pt-0">
                        <Link href={`/${p.logNo}`} className="group flex items-start gap-4">
                          <span className="font-serif text-[28px] font-black text-herb-700 leading-none w-7 shrink-0 tabular-nums">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif text-[15px] font-black tracking-[-0.02em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.3] line-clamp-3">
                              {p.title}
                            </h4>
                            <div className="mt-1 text-[10px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
                              {p.dateLabel}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </aside>
            </div>

            {/* 더 보기 */}
            {moreList.length > 0 && (
              <div className="mt-14 md:mt-16 pt-10 border-t border-ink-200">
                <div className="flex items-baseline justify-between mb-8">
                  <h2 className="font-serif text-2xl md:text-[28px] font-black tracking-[-0.025em] text-ink-900">
                    더 많은 글
                  </h2>
                  <span className="text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
                    {filtered.length} stories
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {moreList.map((post) => (
                    <PostCard key={post.logNo} post={post} />
                  ))}
                </div>
              </div>
            )}

            {showPagination && (
              <Pagination page={page} totalPages={totalPages} cat={activeCat} q={rawQuery} />
            )}
          </div>
        </section>
      </>
    );
  }

  // 메인 페이지 (전체)
  return (
    <>
      <BlogCategoryBar active={activeCat} categories={categories} />
      <NoticeStrip posts={posts} />
      <section className="bg-white">
        <div className="max-w-container mx-auto px-4 md:px-8 py-8 md:py-10">
          <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8">
            <aside className="hidden lg:block lg:col-span-3">
              <div className="divide-y divide-ink-200 border-y border-ink-200">
                {sideList.map((p) => (
                  <SideListItem key={p.logNo} post={p} />
                ))}
              </div>
            </aside>

            <div className="lg:col-span-6">
              {main && <MainFeature post={main} />}
              {subFeatures.length > 0 && (
                <div className="mt-10 grid sm:grid-cols-2 gap-x-6 gap-y-10 pt-8 border-t border-ink-200">
                  {subFeatures.map((p) => (
                    <SubFeatureCard key={p.logNo} post={p} />
                  ))}
                </div>
              )}
            </div>

            <aside className="lg:col-span-3 space-y-10">
              {sidebarSections.map((s) => (
                <SidebarSection
                  key={s.title}
                  title={s.title}
                  href={s.href}
                  posts={s.posts}
                />
              ))}
            </aside>
          </div>

          {categorySections.map((s, i) => (
            <div key={s.name}>
              <CategorySection name={s.name} items={s.items} />
              {/* 1번째 카테고리 후 영상 섹션 */}
              {i === 0 && videos.length > 0 && <VideoSection videos={videos} />}
              {/* 2번째 카테고리 후 한의원 정체성 띠 */}
              {i === 1 && <ClinicPromo />}
              {/* 3번째 카테고리 후 시리즈 큐레이션 */}
              {i === 2 && <SeriesSection posts={posts} />}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* 카테고리 tagline */
function categoryTagline(name: string): string {
  const t: Record<string, string> = {
    "한의원 story": "이수한의원의 일상, 의료진 이야기, 진료 후기까지.",
    "건강관리": "노화·근감소증부터 일상 건강 관리까지.",
    "체형 · 척추 · 관절통증": "추나요법, 디스크 치료, 자세교정.",
    "여성 · 산후조리": "산후조리·갱년기·난임·자궁질환 한방 관리.",
    "소아 성장": "어린이 성장 클리닉, 성조숙증, 소아비염.",
    "여가 · 여행": "원장님들의 여행과 일상.",
    "비만 · 다이어트": "체질 분석 기반 한방 다이어트.",
  };
  return t[name] || "이수한의원의 콘텐츠";
}

/* ── 메인 (가운데 큰 hero) ── */
function MainFeature({ post }: { post: IndexPost }) {
  return (
    <article>
      <Link href={`/${post.logNo}`} className="group block">
        {post.thumbnail && (
          <div className="aspect-[16/10] overflow-hidden bg-ink-50 mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        )}
        <h1 className="font-serif text-[28px] md:text-[34px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.18]">
          {post.title}
        </h1>
        <p className="mt-4 text-[15px] md:text-base text-ink-700 leading-[1.78] line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
          <span className="font-bold text-herb-700">{post.category}</span>
          <span className="text-ink-300">|</span>
          <span>Published {post.dateLabel}</span>
          <span className="text-ink-300">|</span>
          <span>By 이수한의원</span>
        </div>
      </Link>
    </article>
  );
}

/* ── 가운데 메인 아래 sub-feature ── */
function SubFeatureCard({ post }: { post: IndexPost }) {
  return (
    <article className="group">
      <Link href={`/${post.logNo}`} className="block">
        {post.thumbnail && (
          <div className="aspect-[16/10] overflow-hidden bg-ink-50 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                            src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <h3 className="font-serif text-[19px] md:text-[20px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.25] line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-2.5 text-[13px] text-ink-700 leading-[1.7] line-clamp-3 min-h-[4.5em]">
          {post.excerpt}
        </p>
        <div className="mt-3 flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
          <span className="font-bold text-herb-700">{post.category}</span>
          <span className="text-ink-300">|</span>
          <span>{post.dateLabel}</span>
        </div>
      </Link>
    </article>
  );
}

/* ── 좌측 small list (썸네일 + 제목 + 본문 미리보기) ── */
function SideListItem({ post }: { post: IndexPost }) {
  return (
    <article className="py-5 first:pt-0 last:pb-0 group">
      <Link href={`/${post.logNo}`} className="flex gap-3.5 items-start">
        {post.thumbnail && (
          <div className="w-[88px] aspect-[16/10] shrink-0 overflow-hidden bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                            src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className="font-serif text-[16px] font-black tracking-[-0.02em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.3] line-clamp-2">
            {post.title}
          </h4>
          <p className="mt-1.5 text-[12.5px] text-ink-700 leading-[1.65] line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}

/* ── 우측 sidebar 섹션 ── */
function SidebarSection({
  title,
  href,
  posts,
}: {
  title: string;
  href: string;
  posts: IndexPost[];
}) {
  if (posts.length === 0) return null;
  return (
    <section>
      <Link href={href} className="group block">
        <div className="flex items-baseline justify-between border-b border-ink-300 pb-2 mb-3">
          <h3 className="font-serif text-[19px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors">
            {title}
          </h3>
          <span className="text-[12px] tracking-[0.2em] uppercase text-herb-700 font-semibold">
            More →
          </span>
        </div>
      </Link>
      <ul className="divide-y divide-ink-200">
        {posts.map((p) => (
          <li key={p.logNo} className="py-3 first:pt-0">
            <Link href={`/${p.logNo}`} className="block group">
              <div className="text-[10px] tracking-[0.2em] uppercase text-ink-500 font-bold mb-1">
                {p.category}
              </div>
              <h4 className="font-serif text-[15px] font-black tracking-[-0.02em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.3] line-clamp-2">
                {p.title}
              </h4>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── 카테고리 페이지 큰 hero (이미지 좌 + 텍스트 우 가로) ── */
function CategoryHero({ post }: { post: IndexPost }) {
  return (
    <article className="group">
      <Link href={`/${post.logNo}`} className="grid sm:grid-cols-12 gap-6">
        {post.thumbnail && (
          <div className="sm:col-span-6 aspect-[16/10] overflow-hidden bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        )}
        <div className={post.thumbnail ? "sm:col-span-6 self-center" : "sm:col-span-12"}>
          <h2 className="font-serif text-[22px] md:text-[28px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.2]">
            {post.title}
          </h2>
          <p className="mt-4 text-[14px] text-ink-700 leading-[1.78] line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-4 text-[12px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
            <span className="font-bold text-herb-700">{post.category}</span>
            <span className="mx-2 text-ink-300">|</span>
            <span>Published {post.dateLabel}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ── 카테고리 페이지 가로 카드 (썸네일 좌 + 텍스트 우) ── */
function RowCard({ post }: { post: IndexPost }) {
  return (
    <article className="group py-6 first:pt-0 last:pb-0">
      <Link href={`/${post.logNo}`} className="grid grid-cols-12 gap-5">
        {post.thumbnail ? (
          <div className="col-span-4 sm:col-span-3 aspect-[4/3] overflow-hidden bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                            src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="col-span-4 sm:col-span-3 aspect-[4/3] flex items-center justify-center bg-ink-50">
            <span className="font-serif text-4xl font-black text-ink-200">醫</span>
          </div>
        )}
        <div className="col-span-8 sm:col-span-9 self-center">
          <h3 className="font-serif text-[18px] md:text-[22px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.25] line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 text-[13px] md:text-[14px] text-ink-700 leading-[1.7] line-clamp-2">
            {post.excerpt}
          </p>
          <div className="mt-2 text-[12px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
            {post.dateLabel}
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ── 카테고리별 mini-feature 섹션 (메인 하단 라인업) ── */
function CategorySection({
  name,
  items,
}: {
  name: string;
  items: IndexPost[];
}) {
  if (items.length === 0) return null;
  const [main, ...rest] = items;
  const href = `/journal?cat=${encodeURIComponent(name)}`;
  return (
    <section className="mt-14 md:mt-16 pt-8 border-t border-ink-200">
      <div className="text-center mb-7">
        <Link href={href} className="group inline-block">
          <h2 className="font-serif text-[22px] md:text-[26px] font-black tracking-[-0.025em] text-ink-900 group-hover:underline underline-offset-4 leading-none">
            {name}
          </h2>
          <div className="mt-2 text-[12px] tracking-[0.2em] uppercase text-ink-500 group-hover:text-ink-900 transition-colors">
            More in {name} →
          </div>
        </Link>
      </div>
      <div className="grid lg:grid-cols-12 gap-x-8 gap-y-8">
        {/* 큰 카드 */}
        <article className="lg:col-span-7 group">
          <Link href={`/${main.logNo}`} className="block">
            {main.thumbnail && (
              <div className="aspect-[16/10] overflow-hidden bg-ink-50 mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                                src={main.thumbnail}
                  alt={main.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <h3 className="font-serif text-[24px] md:text-[28px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.15] line-clamp-3">
              {main.title}
            </h3>
            <p className="mt-3 text-[14px] text-ink-700 leading-[1.78] line-clamp-3">
              {main.excerpt}
            </p>
            <div className="mt-3 text-[12px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
              {main.dateLabel}
            </div>
          </Link>
        </article>

        {/* 작은 리스트 3개 */}
        <div className="lg:col-span-5 divide-y divide-ink-200 border-t border-ink-200 lg:border-t-0">
          {rest.map((p) => (
            <SideListItem key={p.logNo} post={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── 표준 카드 (카테고리·검색 페이지·하단 그리드 공용) ── */
function PostCard({ post }: { post: IndexPost }) {
  return (
    <article className="group">
      <Link href={`/${post.logNo}`} className="block">
        {post.thumbnail ? (
          <div className="aspect-[4/3] overflow-hidden mb-4 bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                            src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[4/3] mb-4 flex items-center justify-center bg-ink-50">
            <span className="font-serif text-6xl font-black text-ink-200">醫</span>
          </div>
        )}
        <div className="text-[10px] tracking-[0.2em] uppercase text-herb-700 font-bold">
          {post.category}
        </div>
        <h3 className="mt-2 font-serif text-[19px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.25] line-clamp-2 min-h-[2.5em]">
          {post.title}
        </h3>
        <p className="mt-2.5 text-[13px] text-ink-700 leading-[1.7] line-clamp-3 min-h-[4.5em]">
          {post.excerpt}
        </p>
        <div className="mt-3 text-[12px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
          {post.dateLabel}
        </div>
      </Link>
    </article>
  );
}

function Pagination({
  page,
  totalPages,
  cat,
  q,
}: {
  page: number;
  totalPages: number;
  cat: string;
  q?: string;
}) {
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (cat !== "전체") params.set("cat", cat);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/journal?${qs}` : "/journal";
  };
  const window = 5;
  let s = Math.max(1, page - Math.floor(window / 2));
  let end = Math.min(totalPages, s + window - 1);
  if (end - s < window - 1) s = Math.max(1, end - window + 1);
  const pages = Array.from({ length: end - s + 1 }, (_, i) => s + i);

  const baseBtn =
    "min-w-[40px] h-10 px-3 inline-flex items-center justify-center text-sm tabular-nums transition-colors";
  const inactiveBtn =
    baseBtn +
    " border border-ink-300 text-ink-700 hover:border-ink-900 hover:bg-ink-900 hover:text-white";
  const activeBtn = baseBtn + " border border-ink-900 bg-ink-900 text-white font-bold";

  return (
    <nav
      className="mt-16 pt-8 border-t border-ink-200 flex items-center justify-center gap-1.5 flex-wrap"
      aria-label="페이지 이동"
    >
      {page > 1 && (
        <Link href={buildHref(page - 1)} className={inactiveBtn}>
          이전
        </Link>
      )}
      {s > 1 && (
        <>
          <Link href={buildHref(1)} className={inactiveBtn}>
            1
          </Link>
          {s > 2 && <span className="px-2 text-ink-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={p === page ? activeBtn : inactiveBtn}
          aria-current={p === page ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-ink-400">…</span>}
          <Link href={buildHref(totalPages)} className={inactiveBtn}>
            {totalPages}
          </Link>
        </>
      )}
      {page < totalPages && (
        <Link href={buildHref(page + 1)} className={inactiveBtn}>
          다음
        </Link>
      )}
    </nav>
  );
}
