import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAllPosts, getCategories, getPostByLogNo, makeExcerpt, sanitizeBody, extractFAQs } from "@/lib/blog";
import { BlogCategoryBar } from "@/components/blog/BlogCategoryBar";
import { SITE_URL } from "@/lib/site";

const DEFAULT_OG = `${SITE_URL}/og.png`;
// 네이버 기본 아이콘(og_270x270 등)은 의미 없으므로 사이트 기본 이미지로 교체
const resolveOgImage = (url?: string | null) =>
  url && !url.includes("static/blog/icon") && !url.includes("og_270x270")
    ? url
    : DEFAULT_OG;

// 카테고리 → 담당 원장 (GEO 저자 권위도)
const PHYSICIAN_BY_CATEGORY: Record<string, { name: string; jobTitle: string; knowsAbout: string[] }> = {
  "체형 · 척추 · 관절통증": {
    name: "문학진",
    jobTitle: "대표원장 · 한의학 박사 · 척추신경추나의학회",
    knowsAbout: ["추나요법", "척추교정", "허리디스크", "목디스크", "공진단"],
  },
  "여성 · 산후조리": {
    name: "나효석",
    jobTitle: "원장 · 한방부인과 전문의",
    knowsAbout: ["산후조리", "갱년기", "난임", "자궁질환", "생리불순"],
  },
  "소아 성장": {
    name: "나효석",
    jobTitle: "원장 · 한방부인과 전문의",
    knowsAbout: ["소아성장", "성조숙증", "소아비염", "어린이보약"],
  },
  "비만 · 다이어트": {
    name: "이윤호",
    jobTitle: "원장 · 통증진단학회 FOST",
    knowsAbout: ["한방다이어트", "체질분석", "비만침", "체중감량"],
  },
  "건강관리": {
    name: "문학진",
    jobTitle: "대표원장 · 한의학 박사 · 척추신경추나의학회",
    knowsAbout: ["공진단", "경옥고", "보약", "면역력", "근감소증"],
  },
};

// 카테고리 → 연결 진료 페이지
const TREATMENT_BY_CATEGORY: Record<string, { href: string; name: string }> = {
  "체형 · 척추 · 관절통증": { href: "/treatment/spine", name: "체형 · 척추 · 관절통증" },
  "여성 · 산후조리": { href: "/treatment/women", name: "여성 · 산후조리" },
  "소아 성장": { href: "/treatment/children", name: "소아 성장" },
  "비만 · 다이어트": { href: "/treatment/diet", name: "비만 · 다이어트" },
  "건강관리": { href: "/treatment/health", name: "건강관리 · 보약" },
};

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ logNo: p.logNo }));
}

export function generateMetadata({ params }: { params: { logNo: string } }): Metadata {
  const post = getPostByLogNo(params.logNo);
  if (!post) return { title: "이수한의원" };
  const url = `${SITE_URL}/${post.logNo}`;
  const excerpt = (post.ogDesc as string | undefined) || makeExcerpt(post, 160);
  const publishedTime = post.date ? `${post.date}T00:00:00+09:00` : undefined;
  return {
    title: post.title,
    description: excerpt,
    alternates: { canonical: url },
    openGraph: {
      url,
      type: "article",
      title: post.title,
      description: excerpt,
      publishedTime,
      modifiedTime: publishedTime,
      images: [{ url: resolveOgImage(post.ogImage) }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
      images: [resolveOgImage(post.ogImage)],
    },
  };
}

export default function PostPage({ params }: { params: { logNo: string } }) {
  if (!/^\d+$/.test(params.logNo)) notFound();

  const post = getPostByLogNo(params.logNo);
  if (!post) notFound();

  const related = getAllPosts()
    .filter((p) => p.category === post.category && p.logNo !== post.logNo)
    .slice(0, 4);

  const publishedTime = post.date ? `${post.date}T00:00:00+09:00` : undefined;
  const excerpt = makeExcerpt(post, 160);
  const postUrl = `${SITE_URL}/${post.logNo}`;

  const physician = PHYSICIAN_BY_CATEGORY[post.category];
  const treatmentLink = TREATMENT_BY_CATEGORY[post.category];

  const authorEntity = physician
    ? {
        "@type": "Person",
        name: physician.name,
        jobTitle: physician.jobTitle,
        knowsAbout: physician.knowsAbout,
        worksFor: { "@type": "MedicalClinic", "@id": SITE_URL, name: "이수한의원" },
      }
    : { "@type": "Organization", name: "이수한의원", url: SITE_URL };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: excerpt,
    abstract: excerpt,
    ...(post.ogImage && { image: post.ogImage }),
    ...(publishedTime && { datePublished: publishedTime, dateModified: publishedTime }),
    mainEntityOfPage: postUrl,
    author: authorEntity,
    publisher: { "@type": "MedicalClinic", "@id": SITE_URL, name: "이수한의원", url: SITE_URL },
    about: [
      { "@type": "Thing", name: post.category },
      ...(treatmentLink ? [{ "@type": "MedicalTherapy", name: treatmentLink.name, url: `${SITE_URL}${treatmentLink.href}` }] : []),
    ],
    isAccessibleForFree: true,
    inLanguage: "ko",
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "건강 칼럼", item: `${SITE_URL}/journal` },
      { "@type": "ListItem", position: 3, name: post.category, item: `${SITE_URL}/journal?cat=${encodeURIComponent(post.category)}` },
      { "@type": "ListItem", position: 4, name: post.title, item: postUrl },
    ],
  };

  const faqs = post.body ? extractFAQs(post.body) : [];
  const faqLd = faqs.length >= 2 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  } : null;

  return (
    <>
      <div className="reading-progress-bar" aria-hidden="true" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      <BlogCategoryBar active={post.category} categories={getCategories()} />
      <article className="bg-white">
        <div className="max-w-4xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-10">
          <div className="flex items-center justify-between text-[12px] tracking-[0.2em] uppercase">
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 text-ink-500 hover:text-ink-900 transition-colors"
            >
              <ArrowLeft size={14} />
              전체 목록
            </Link>
            <Link
              href={`/journal?cat=${encodeURIComponent(post.category)}`}
              className="text-herb-700 font-semibold hover:text-ink-900 transition-colors"
            >
              {post.category}
            </Link>
          </div>

          <h1 className="mt-8 md:mt-10 font-serif text-[30px] sm:text-[36px] md:text-[44px] font-black tracking-[-0.02em] text-ink-900 leading-[1.22]">
            {post.title}
          </h1>

          <div className="mt-8 flex items-center gap-3 border-y border-ink-200 py-3.5 text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
            <span className="font-semibold text-ink-700">By 이수한의원</span>
            <span className="text-ink-300">·</span>
            <span>{post.dateLabel}</span>
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 hover:text-ink-900 transition-colors"
            >
              네이버 원문
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {post.body ? (
          <div className="max-w-4xl mx-auto px-5 md:px-8 pb-16 md:pb-24 naver-body article-leadin">
            <div dangerouslySetInnerHTML={{ __html: sanitizeBody(post.body) }} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-5 md:px-8 pb-16 text-ink-500">
            <p>본문을 사이트 내에 표시하지 못했습니다. 원문 링크에서 확인해 주세요.</p>
            <a
              href={post.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white text-sm font-semibold hover:bg-herb-700"
            >
              <ExternalLink size={16} />
              네이버 블로그에서 보기
            </a>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-5 md:px-8">
          <div className="border-t border-ink-900" />
          <div className="py-5 flex items-center justify-between text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
            <span>이수한의원 · {post.dateLabel}</span>
            <Link
              href="/journal"
              className="hover:text-ink-900 transition-colors"
            >
              ← 전체 목록으로
            </Link>
          </div>
        </div>

        {treatmentLink && (
          <div className="border-t border-ink-200 bg-ink-50">
            <div className="max-w-4xl mx-auto px-5 md:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-ink-400 mb-1">관련 진료 안내</p>
                <p className="text-[15px] font-serif font-black text-ink-900">{treatmentLink.name}</p>
                {physician && (
                  <p className="mt-0.5 text-[13px] text-ink-500">{physician.name} {physician.jobTitle.split("·")[0].trim()}</p>
                )}
              </div>
              <Link
                href={treatmentLink.href}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white text-[13px] font-semibold hover:bg-herb-700 transition-colors"
              >
                진료 안내 보기 →
              </Link>
            </div>
          </div>
        )}

        {related.length > 0 && (
          <section className="border-t border-ink-200 bg-ink-50">
            <div className="max-w-container mx-auto px-4 md:px-8 py-14 md:py-16">
              <div className="flex items-baseline justify-between border-b-2 border-ink-900 pb-3 mb-8">
                <div className="eyebrow">Related · 같은 카테고리</div>
                <Link
                  href={`/?cat=${encodeURIComponent(post.category)}`}
                  className="text-[12px] tracking-[0.2em] uppercase text-ink-500 hover:text-ink-900 transition-colors"
                >
                  {post.category} 더보기 →
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
                {related.map((p) => (
                  <Link key={p.logNo} href={`/${p.logNo}`} className="group block">
                    {p.thumbnail ? (
                      <div className="aspect-[4/3] overflow-hidden mb-3 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] mb-3 flex items-center justify-center bg-white">
                        <span className="font-serif text-5xl font-black text-ink-200">醫</span>
                      </div>
                    )}
                    <h4 className="font-serif text-[17px] font-black tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors line-clamp-3 leading-[1.25]">
                      {p.title}
                    </h4>
                    <div className="mt-2 text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
                      {p.dateLabel}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  );
}
