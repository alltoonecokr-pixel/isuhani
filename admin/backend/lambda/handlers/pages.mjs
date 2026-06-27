// 페이지 콘텐츠 핸들러 — 고정 섹션 페이지(진료영역 등)의 GET/PUT.
// 본문(글)과 분리: 레이아웃은 코드, 칸 내용만 JSON으로 관리.

import { getPageContent, putPageContent, writeLivePage } from "../services/s3.mjs";

// pageId 화이트리스트 — 임의 키 쓰기 방지 (예: treatment-spine)
const TREATMENT_SLUGS = ["spine", "women", "children", "diet", "health", "skin"];
const VALID_PAGE_IDS = new Set(TREATMENT_SLUGS.map((s) => `treatment-${s}`));

export function isValidPageId(pageId) {
  return VALID_PAGE_IDS.has(pageId);
}

export async function handleGetPage(pageId) {
  if (!isValidPageId(pageId)) return null;
  const content = await getPageContent(pageId);
  // 미저장이면 null 반환 → 어드민이 자체 시드(treatments.ts) 사용
  return { pageId, content };
}

export async function handlePutPage(pageId, body) {
  if (!isValidPageId(pageId)) return null;
  const content = body?.content;
  if (!content || typeof content !== "object") return { error: "content object required" };
  const saved = { ...content, updatedAt: new Date().toISOString() };
  // 원본(data) + 즉시반영(web) 동시 기록
  await Promise.all([putPageContent(pageId, saved), writeLivePage(pageId, saved)]);
  return { pageId, content: saved };
}
