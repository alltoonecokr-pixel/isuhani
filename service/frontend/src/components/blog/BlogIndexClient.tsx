"use client";

import { useMemo, Suspense, useState, useEffect } from "react";
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
// 개선(v2) 그리드는 한 화면 분량으로 끊어 페이지 뷰로 — 스크롤 길이 절제 (3열 × 3행)
const V2_PAGE_SIZE = 9;

export function BlogIndexClient({
  posts: initialPosts,
  categories: initialCategories,
  videos = [],
}: {
  posts: IndexPost[];
  categories: { name: string; count: number }[];
  videos?: VideoItem[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [categories, setCategories] = useState(initialCategories);

  useEffect(() => {
    fetch("/live-index.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data?.posts) || !data.posts.length) return;
        setPosts(data.posts);
        const map = new Map<string, number>();
        for (const p of data.posts as IndexPost[]) {
          map.set(p.category, (map.get(p.category) || 0) + 1);
        }
        setCategories([...map.entries()].map(([name, count]) => ({ name, count })));
      })
      .catch(() => {});
  }, []);

  // useSearchParams는 Suspense fallback을 정적 HTML로 내보낸다(output: export).
  // fallback을 "기본 홈 화면(전체)" 자체로 렌더해야 히어로·카드·이미지가
  // 빌드 시 HTML에 박혀 첫 접속에도 보인다. 클라이언트는 그 위에서 cat/q/page로 덮어쓴다.
  const defaultView = (
    <BlogIndexView
      posts={posts}
      categories={categories}
      videos={videos}
      activeCat="전체"
      rawQuery=""
      page={1}
      variant="v2"
    />
  );
  return (
    <Suspense fallback={defaultView}>
      <BlogIndexFromParams posts={posts} categories={categories} videos={videos} />
    </Suspense>
  );
}

// searchParams를 읽어 현재 화면 상태를 결정하는 클라이언트 래퍼.
// (이 컴포넌트만 useSearchParams로 인해 클라이언트 전용으로 처리된다)
function BlogIndexFromParams({
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
  const page = Math.max(1, parseInt(sp?.get("page") || "1", 10) || 1);
  // v2(개선)가 기본. ?ui=v1 은 옛 레이아웃 폴백용 숨은 스위치.
  const variant = sp?.get("ui") === "v1" ? "v1" : "v2";
  return (
    <BlogIndexView
      posts={posts}
      categories={categories}
      videos={videos}
      activeCat={activeCat}
      rawQuery={rawQuery}
      page={page}
      variant={variant}
    />
  );
}

// 지난 진료/휴진 안내·공지성 글 판별 — 홈 히어로/상단에서 제외용.
// (공지가 "한의원 story" 카테고리에 섞여 있어 제목 패턴으로 판별)
const NOTICE_RE =
  /(안내|휴진|휴무|휴원|공지|연휴|진료\s*시간|진료\s*변경|운영\s*시간|설날|구정|추석|명절|삼일절|신정|성탄|크리스마스|개천절|광복절|현충일|어린이날|대체\s*공휴일|연차|단축\s*진료)/;
function isNotice(title: string): boolean {
  return NOTICE_RE.test(title || "");
}

// 홈 메인(히어로) 고정 글 — 공진단 플래그십.
// 바꾸려면 이 logNo만 교체 (빈 문자열이면 최신 칼럼 자동 선정).
const PINNED_HERO_LOGNO = "224136780944"; // [공진단 FAQ] 공진단, 제대로 알고 먹어야 보약입니다

// 순수 프레젠테이션 컴포넌트 — 상태(cat/q/page)를 props로 받는다.
// useSearchParams를 쓰지 않으므로 서버(정적 export)에서도 그대로 렌더된다 = 이미지가 HTML에 포함.
function BlogIndexView({
  posts,
  categories,
  videos,
  activeCat,
  rawQuery,
  page,
  variant = "v2",
}: {
  posts: IndexPost[];
  categories: { name: string; count: number }[];
  videos: VideoItem[];
  activeCat: string;
  rawQuery: string;
  page: number;
  variant?: "v1" | "v2";
}) {
  const q = rawQuery.toLowerCase();
  // variant 미지정 시 v2(개선)가 기본
  const isV2 = variant !== "v1";
  const uiSuffix = isV2 ? "ui=v2" : "";
  // v2 카드 그리드는 카드 자체가 패딩/높이를 가지므로 균일 gap을 쓴다.
  const gridGap = isV2 ? "gap-6" : "gap-x-8 gap-y-12";

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
        <BlogCategoryBar active={activeCat} categories={categories} variant={variant} uiSuffix={uiSuffix} />
        <section className="bg-white">
          <div className="max-w-container mx-auto px-4 md:px-8 py-12 md:py-16">
            <header className="pb-8 md:pb-10 border-b border-ink-200">
              <div className="eyebrow">Search · 검색</div>
              <h1 className="mt-3 font-serif text-4xl md:text-[52px] font-black tracking-[-0.03em] text-ink-900 leading-[1.05]">
                "{rawQuery}" 검색 결과
              </h1>
              <p className="mt-3 text-base text-ink-700">{filtered.length}편</p>
            </header>
            <div className={`mt-12 grid sm:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
              {pageItems.map((p) => (
                <PostCard key={p.logNo} post={p} variant={variant} />
              ))}
            </div>
            {pageItems.length === 0 && (
              <div className="mt-20 text-center text-ink-500">결과가 없습니다.</div>
            )}
            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} cat={activeCat} q={rawQuery} variant={variant} />
            )}
          </div>
        </section>
      </>
    );
  }

  // 메인 + 카테고리 페이지 — 3-column 영문 사이트 톤
  const isHome = activeCat === "전체";
  // 홈 첫 화면 우선순위: ① 건강 칼럼(노화·근감소증·통증·산후조리 등)
  // ② 그 외 일반글(한의원 story·여가 등) ③ 지난 공지/휴진 안내.
  // 각 tier 안에서는 filtered가 이미 최신순이므로 stable sort로 날짜순 유지.
  const CONTENT_CATS = new Set([
    "건강관리",
    "체형 · 척추 · 관절통증",
    "여성 · 산후조리",
    "소아 성장",
    "비만 · 다이어트",
  ]);
  const tier = (p: IndexPost) =>
    isNotice(p.title) ? 2 : CONTENT_CATS.has(p.category) ? 0 : 1;
  const feed =
    isHome && !rawQuery
      ? [...filtered].sort((a, b) => tier(a) - tier(b))
      : filtered;
  const pinned =
    isHome && !rawQuery && PINNED_HERO_LOGNO
      ? feed.find((p) => p.logNo === PINNED_HERO_LOGNO)
      : undefined;
  const main =
    pinned ||
    feed.find((p) => p.thumbnail && p.hasBody) ||
    feed[0] ||
    filtered[0];
  const used = new Set<string>([main?.logNo || ""]);
  const take = (n: number, withImage = true, source: IndexPost[] = feed) => {
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
    // ── v2: signals식 — 피처 히어로 + 3열 contained 카드 그리드 ──
    if (isV2) {
      const catItems = filtered.filter((p) => p.logNo !== main?.logNo);
      const v2Total = Math.max(1, Math.ceil(catItems.length / V2_PAGE_SIZE));
      const gridStart = (page - 1) * V2_PAGE_SIZE;
      const gridItems = catItems.slice(gridStart, gridStart + V2_PAGE_SIZE);
      const showHero = page === 1 && main;
      return (
        <>
          <BlogCategoryBar active={activeCat} categories={categories} variant={variant} uiSuffix={uiSuffix} />
          <section className="bg-white">
            <div className="max-w-container mx-auto px-4 md:px-8 py-10 md:py-14">
              <header className="mb-8 md:mb-10">
                <h1 className="font-serif text-[32px] md:text-[44px] font-bold tracking-[-0.025em] text-ink-900 leading-[1.1]">
                  {activeCat}
                </h1>
                <p className="mt-2 text-[15px] text-ink-500">{categoryTagline(activeCat)}</p>
              </header>
              {showHero && main && <CleanHero post={main} />}
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
                {gridItems.map((p) => (
                  <CleanCard key={p.logNo} post={p} />
                ))}
              </div>
              {gridItems.length === 0 && !showHero && (
                <div className="text-center text-ink-500 py-16">글이 없습니다.</div>
              )}
              {v2Total > 1 && (
                <Pagination page={page} totalPages={v2Total} cat={activeCat} q={rawQuery} variant={variant} />
              )}
            </div>
          </section>
        </>
      );
    }

    return (
      <>
        <BlogCategoryBar active={activeCat} categories={categories} variant={variant} uiSuffix={uiSuffix} />
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
                <div className={`grid sm:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
                  {moreList.map((post) => (
                    <PostCard key={post.logNo} post={post} variant={variant} />
                  ))}
                </div>
              </div>
            )}

            {showPagination && (
              <Pagination page={page} totalPages={totalPages} cat={activeCat} q={rawQuery} variant={variant} />
            )}
          </div>
        </section>
      </>
    );
  }

  // 메인 페이지 (전체) — v2: signals식 피처 히어로 + 3열 카드 그리드로 통일
  if (isV2) {
    const gridPosts = feed.filter(
      (p) => p.logNo !== main?.logNo && !isNotice(p.title),
    );
    const v2Total = Math.max(1, Math.ceil(gridPosts.length / V2_PAGE_SIZE));
    const start = (page - 1) * V2_PAGE_SIZE;
    const pageItems = gridPosts.slice(start, start + V2_PAGE_SIZE);
    const showHero = page === 1 && main;
    return (
      <>
        <BlogCategoryBar active={activeCat} categories={categories} variant={variant} uiSuffix={uiSuffix} />
        <NoticeStrip posts={posts} />
        <section className="bg-white">
          <div className="max-w-container mx-auto px-4 md:px-8 py-10 md:py-14">
            {showHero && main && <CleanHero post={main} />}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gridGap}`}>
              {pageItems.map((p) => (
                <CleanCard key={p.logNo} post={p} />
              ))}
            </div>
            {v2Total > 1 && (
              <Pagination page={page} totalPages={v2Total} cat={activeCat} q={rawQuery} variant={variant} />
            )}
          </div>
        </section>
      </>
    );
  }

  // 메인 페이지 (전체)
  return (
    <>
      <BlogCategoryBar active={activeCat} categories={categories} variant={variant} uiSuffix={uiSuffix} />
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
                <div
                  className={
                    isV2
                      ? "mt-10 grid sm:grid-cols-2 gap-6 pt-8 border-t border-ink-200"
                      : "mt-10 grid sm:grid-cols-2 gap-x-6 gap-y-10 pt-8 border-t border-ink-200"
                  }
                >
                  {subFeatures.map((p) => (
                    <SubFeatureCard key={p.logNo} post={p} variant={variant} />
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
function SubFeatureCard({ post, variant = "v1" }: { post: IndexPost; variant?: "v1" | "v2" }) {
  if (variant === "v2") return <CleanCard post={post} />;
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

/* ── signals식 카테고리 칩 (v2) ── */
function CategoryChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center self-start rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-[0.01em] bg-herb-50 text-herb-700">
      {label}
    </span>
  );
}

/* ── signals식 피처 히어로 (v2) — 이미지 60% + 텍스트 40% 가로 ── */
function CleanHero({ post }: { post: IndexPost }) {
  return (
    <article className="group mb-10 md:mb-12">
      <Link
        href={`/${post.logNo}`}
        className="flex flex-col md:flex-row gap-6 md:gap-8 rounded-3xl overflow-hidden"
      >
        {post.thumbnail && (
          <div className="w-full md:w-[58%] aspect-[3/2] overflow-hidden rounded-2xl bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="eager"
              decoding="async"
            />
          </div>
        )}
        <div className="w-full md:w-[42%] flex flex-col justify-center">
          <CategoryChip label={post.category} />
          <h2 className="mt-4 font-serif text-[24px] md:text-[30px] font-bold tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.3]">
            {post.title}
          </h2>
          <p className="mt-3 text-[14px] md:text-[15px] text-ink-600 leading-[1.7] line-clamp-3">
            {post.excerpt}
          </p>
          <div className="mt-5 text-[12px] text-ink-400 tabular-nums">
            {post.dateLabel}
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ── signals식 contained 카드 (v2 공용) — 둥근 모서리·옅은 섀도·hover 리프트 ── */
function CleanCard({ post }: { post: IndexPost }) {
  return (
    <article className="group h-full">
      <Link
        href={`/${post.logNo}`}
        className="flex flex-col h-full rounded-2xl bg-white overflow-hidden border border-ink-200 hover:border-herb-500 shadow-[0_2px_12px_0_rgba(26,20,16,0.05)] hover:shadow-[0_10px_28px_0_rgba(26,20,16,0.10)] transition-all duration-300"
      >
        {post.thumbnail ? (
          <div className="aspect-[3/2] overflow-hidden bg-ink-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.thumbnail}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[3/2] flex items-center justify-center bg-herb-50">
            <span className="font-serif text-6xl font-black text-herb-200">醫</span>
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <CategoryChip label={post.category} />
          <h3 className="mt-3 font-serif text-[18px] font-bold tracking-[-0.02em] text-ink-900 group-hover:text-herb-700 transition-colors leading-[1.35] line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-2 text-[13px] text-ink-600 leading-[1.65] line-clamp-2 flex-1">
            {post.excerpt}
          </p>
          <div className="mt-4 text-[12px] text-ink-400 tabular-nums">
            {post.dateLabel}
          </div>
        </div>
      </Link>
    </article>
  );
}

/* ── 표준 카드 (카테고리·검색 페이지·하단 그리드 공용) ── */
function PostCard({ post, variant = "v1" }: { post: IndexPost; variant?: "v1" | "v2" }) {
  if (variant === "v2") return <CleanCard post={post} />;
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
  variant = "v1",
}: {
  page: number;
  totalPages: number;
  cat: string;
  q?: string;
  variant?: "v1" | "v2";
}) {
  const isV2 = variant === "v2";
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (cat !== "전체") params.set("cat", cat);
    if (q) params.set("q", q);
    if (p > 1) params.set("page", String(p));
    if (isV2) params.set("ui", "v2");
    const qs = params.toString();
    return qs ? `/journal?${qs}` : "/journal";
  };
  const window = 5;
  let s = Math.max(1, page - Math.floor(window / 2));
  let end = Math.min(totalPages, s + window - 1);
  if (end - s < window - 1) s = Math.max(1, end - window + 1);
  const pages = Array.from({ length: end - s + 1 }, (_, i) => s + i);

  const baseBtn = isV2
    ? "min-w-[40px] h-10 px-3 inline-flex items-center justify-center rounded-full text-sm tabular-nums transition-colors"
    : "min-w-[40px] h-10 px-3 inline-flex items-center justify-center text-sm tabular-nums transition-colors";
  const inactiveBtn = isV2
    ? baseBtn + " border border-ink-200 text-ink-600 hover:bg-ink-50 hover:text-ink-900"
    : baseBtn + " border border-ink-300 text-ink-700 hover:border-ink-900 hover:bg-ink-900 hover:text-white";
  const activeBtn = isV2
    ? baseBtn + " bg-herb-700 text-white font-bold"
    : baseBtn + " border border-ink-900 bg-ink-900 text-white font-bold";

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

