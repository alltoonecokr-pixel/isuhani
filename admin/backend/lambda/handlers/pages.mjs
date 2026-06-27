// 편집 가능 페이지 핸들러 — GET/PUT /api/pages/{slug}
// 페이지 텍스트 오버라이드를 pages/{slug}.json (데이터 버킷) 에 플랫 맵 { 필드: 텍스트 } 으로 저장.
// PUT은 "변경된 필드만" 받아 기존 맵에 병합(merge) → 다른 필드/이전 저장분 보존.
// 발행은 글과 동일하게 CodeBuild(빌드 시 pages/ 동기화 → 사이트 렌더)로 반영.

import { getPageContent, putPageContent } from "../services/s3.mjs";
import { EDITABLE_PAGES } from "../constants.mjs";

function isEditablePage(slug) {
  return EDITABLE_PAGES.includes(slug);
}

// 플랫 맵 정규화 — 문자열 키/값만 허용
function normalizeFlat(input) {
  const out = {};
  if (input && typeof input === "object" && !Array.isArray(input)) {
    for (const [k, v] of Object.entries(input)) {
      if (typeof k === "string" && typeof v === "string") out[k] = v;
    }
  }
  return out;
}

export async function handleGetPage(slug) {
  if (!isEditablePage(slug)) return undefined; // 404
  return (await getPageContent(slug)) ?? null;
}

export async function handlePutPage(slug, body) {
  if (!isEditablePage(slug)) return undefined; // 404
  const changes = normalizeFlat(body);
  if (!Object.keys(changes).length) return { error: "변경 내용이 없습니다" };
  const existing = (await getPageContent(slug)) || {};
  const merged = { ...existing, ...changes };
  await putPageContent(slug, merged);
  return { slug, fields: Object.keys(merged).length };
}
