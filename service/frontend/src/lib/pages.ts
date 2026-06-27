// 편집 가능 페이지 콘텐츠 로더 (빌드 타임, 서버 전용).
// CMS에서 저장한 pages/{slug}.json (빌드 시 src/data/pages/ 로 동기화) 를
// treatments.ts 기본 시드 위에 병합한다. 저장된 적 없으면 시드 그대로.

import fs from "node:fs";
import path from "node:path";
import { TREATMENTS, type Treatment } from "@/data/treatments";

const PAGES_DIR = path.join(process.cwd(), "src/data/pages");

type TreatmentOverride = Partial<
  Pick<Treatment, "name" | "tagline" | "description" | "methods" | "faq">
>;

function readOverride(slug: string): TreatmentOverride | null {
  try {
    const f = path.join(PAGES_DIR, `treatment-${slug}.json`);
    if (!fs.existsSync(f)) return null;
    return JSON.parse(fs.readFileSync(f, "utf8")) as TreatmentOverride;
  } catch {
    return null;
  }
}

export function getTreatment(slug: string): Treatment | undefined {
  const base = TREATMENTS[slug];
  if (!base) return undefined;
  const o = readOverride(slug);
  if (!o) return base;
  return {
    ...base,
    ...(o.name ? { name: o.name } : {}),
    ...(o.tagline ? { tagline: o.tagline } : {}),
    ...(o.description ? { description: o.description } : {}),
    ...(Array.isArray(o.methods) && o.methods.length ? { methods: o.methods } : {}),
    ...(Array.isArray(o.faq) ? { faq: o.faq } : {}),
  };
}
