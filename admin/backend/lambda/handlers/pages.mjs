// 편집 가능 페이지 핸들러 — GET/PUT /api/pages/{slug}
// 진료영역 등 정적 페이지 콘텐츠를 pages/{slug}.json (데이터 버킷)에 저장.
// 발행은 글과 동일하게 CodeBuild(빌드 시 pages/ 동기화 → 사이트 렌더)로 반영.

import { getPageContent, putPageContent } from "../services/s3.mjs";
import { EDITABLE_PAGES } from "../constants.mjs";

const str = (v) => (typeof v === "string" ? v : "");

// 진료영역 콘텐츠 정규화 — 고정 스키마만 허용 (레이아웃 보호)
function normalizeTreatment(slug, input) {
  return {
    slug,
    name: str(input?.name).trim(),
    tagline: str(input?.tagline).trim(),
    description: str(input?.description).trim(),
    methods: Array.isArray(input?.methods)
      ? input.methods
          .map((m) => ({ title: str(m?.title).trim(), desc: str(m?.desc).trim() }))
          .filter((m) => m.title || m.desc)
      : [],
    faq: Array.isArray(input?.faq)
      ? input.faq
          .map((f) => ({ q: str(f?.q).trim(), a: str(f?.a).trim() }))
          .filter((f) => f.q || f.a)
      : [],
    updatedAt: new Date().toISOString(),
  };
}

export async function handleGetPage(slug) {
  if (!EDITABLE_PAGES.includes(slug)) return undefined; // 404
  return (await getPageContent(slug)) ?? null; // null = 아직 저장 안 됨(시드 사용)
}

export async function handlePutPage(slug, body) {
  if (!EDITABLE_PAGES.includes(slug)) return undefined; // 404
  if (slug.startsWith("treatment-")) {
    const content = normalizeTreatment(slug, body);
    if (!content.name) return { error: "이름(name)은 필수입니다" };
    await putPageContent(slug, content);
    return content;
  }
  return { error: "지원하지 않는 페이지" };
}
