import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPosts } from "@/lib/blog";
import { TREATMENT_LIST } from "@/data/treatments";

export default function sitemap(): MetadataRoute.Sitemap {
  const TODAY = new Date("2026-06-19T00:00:00+09:00");

  // 정적 페이지
  const statics: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: TODAY, priority: 1.0, changeFrequency: "weekly" },
    { url: `${SITE_URL}/journal`, lastModified: TODAY, priority: 0.9, changeFrequency: "daily" },
    { url: `${SITE_URL}/ask`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/clinic`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${SITE_URL}/visit-guide`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${SITE_URL}/gongjindan`, lastModified: TODAY, priority: 0.85, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/chuna`, lastModified: TODAY, priority: 0.85, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/sanhu`, lastModified: TODAY, priority: 0.85, changeFrequency: "monthly" as const },
    { url: `${SITE_URL}/children-growth`, lastModified: TODAY, priority: 0.85, changeFrequency: "monthly" as const },
  ];

  // 진료 영역 6개
  const treatments: MetadataRoute.Sitemap = TREATMENT_LIST.map((t) => ({
    url: `${SITE_URL}/treatment/${t.slug}`,
    lastModified: TODAY,
    priority: 0.8,
    changeFrequency: "monthly" as const,
  }));

  // 글 1,042개 — 발행일 기준 신선도 priority 동적 계산
  const now = Date.now();
  const MS_PER_DAY = 86_400_000;
  const posts: MetadataRoute.Sitemap = getAllPosts().map((p) => {
    const pub = p.date ? new Date(p.date).getTime() : 0;
    const daysOld = pub ? (now - pub) / MS_PER_DAY : 999;
    const priority =
      daysOld < 1   ? 1.0 :
      daysOld < 7   ? 0.9 :
      daysOld < 30  ? 0.8 :
      daysOld < 90  ? 0.7 :
      daysOld < 180 ? 0.6 :
                      0.5;
    return {
      url: `${SITE_URL}/${p.logNo}`,
      lastModified: pub ? new Date(pub) : undefined,
      priority,
      changeFrequency: "yearly" as const,
    };
  });

  return [...statics, ...treatments, ...posts];
}
