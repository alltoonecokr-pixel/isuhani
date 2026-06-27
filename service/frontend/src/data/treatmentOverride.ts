// 진료영역 콘텐츠 = 코드 기본값(treatments.ts) 위에 CMS 편집본(pages/treatment-{slug}.json) 덮어쓰기.
// pages/ 는 빌드 시 S3에서 sync (buildspec). 없으면 코드 기본값 그대로.
// 서버 전용(fs) — 진료 페이지(서버 컴포넌트)에서만 import.

import fs from "node:fs";
import path from "node:path";
import { TREATMENTS, TREATMENT_LIST, type Treatment } from "./treatments";

const PAGES_DIR = path.join(process.cwd(), "src/data/pages");

function readOverride(slug: string): Partial<Treatment> | null {
  try {
    const p = path.join(PAGES_DIR, `treatment-${slug}.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8")) as Partial<Treatment>;
  } catch {
    return null;
  }
}

// 편집 가능한 칸만 덮어씀 — slug·categoryMatch 등 구조 값은 코드 기준 유지
export function getTreatment(slug: string): Treatment | undefined {
  const base = TREATMENTS[slug];
  if (!base) return undefined;
  const o = readOverride(slug);
  if (!o) return base;
  return {
    ...base,
    name: typeof o.name === "string" && o.name.trim() ? o.name : base.name,
    tagline: typeof o.tagline === "string" ? o.tagline : base.tagline,
    description: typeof o.description === "string" ? o.description : base.description,
    methods: Array.isArray(o.methods) ? o.methods : base.methods,
    faq: Array.isArray(o.faq) ? o.faq : base.faq,
  };
}

export function getTreatmentList(): Treatment[] {
  return TREATMENT_LIST.map((t) => getTreatment(t.slug)!);
}
