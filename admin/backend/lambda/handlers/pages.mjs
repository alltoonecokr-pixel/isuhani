// 편집 가능 페이지 핸들러 — GET/PUT /api/pages/{slug}
// 자동 인라인 편집: <main> 텍스트 leaf 의 인덱스별 오버라이드 { "인덱스": {t:tag, v:텍스트} }.
// PUT은 변경분만 받아 기존에 병합 → 데이터 버킷(durable) + 웹 버킷 live-pages(즉시 적용) 둘 다 기록.

import { getPageContent, putPageContent, writeLivePage, deletePageContent } from "../services/s3.mjs";
import { EDITABLE_PAGES } from "../constants.mjs";

function isEditablePage(slug) {
  return EDITABLE_PAGES.includes(slug);
}

// { "12": {t:"H2", v:"..."} } 형태만 허용
function normalize(input) {
  const out = {};
  if (input && typeof input === "object" && !Array.isArray(input)) {
    for (const [k, v] of Object.entries(input)) {
      if (!/^\d+$/.test(k)) continue;
      if (v && typeof v === "object" && typeof v.t === "string" && typeof v.v === "string") {
        out[k] = { t: v.t, v: v.v };
      }
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
  const changes = normalize(body);
  if (!Object.keys(changes).length) return { error: "변경 내용이 없습니다" };
  const existing = (await getPageContent(slug)) || {};
  const merged = { ...existing, ...changes };
  await putPageContent(slug, merged); // 데이터 버킷 (durable)
  await writeLivePage(slug, merged);  // 웹 버킷 (즉시 서빙)
  return { slug, fields: Object.keys(merged).length };
}

// 원래대로 초기화 — 저장된 오버라이드 삭제 → 코드 기본값으로 복원
export async function handleDeletePage(slug) {
  if (!isEditablePage(slug)) return undefined; // 404
  await deletePageContent(slug);
  return { slug, reset: true };
}
