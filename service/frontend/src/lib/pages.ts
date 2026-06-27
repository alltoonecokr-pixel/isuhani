// 편집 가능 페이지 콘텐츠 로더 (빌드 타임, 서버 전용).
// CMS에서 저장한 pages/{slug}.json (빌드 시 src/data/pages/ 로 동기화) 은
// 플랫 맵 { "필드경로": "텍스트" } 이다. 코드가 구조/기본값을 갖고, 저장된 텍스트만 덮어쓴다.

import fs from "node:fs";
import path from "node:path";
import { TREATMENTS, type Treatment } from "@/data/treatments";

const PAGES_DIR = path.join(process.cwd(), "src/data/pages");
const _cache = new Map<string, Record<string, string>>();

// 페이지 슬러그(treatment-spine, home, visit-guide …)의 저장된 텍스트 오버라이드 맵
export function pageOverrides(slug: string): Record<string, string> {
  if (_cache.has(slug)) return _cache.get(slug)!;
  let map: Record<string, string> = {};
  try {
    const f = path.join(PAGES_DIR, `${slug}.json`);
    if (fs.existsSync(f)) {
      const parsed = JSON.parse(fs.readFileSync(f, "utf8"));
      if (parsed && typeof parsed === "object") {
        for (const [k, v] of Object.entries(parsed)) {
          if (typeof v === "string") map[k] = v;
        }
      }
    }
  } catch {
    map = {};
  }
  _cache.set(slug, map);
  return map;
}

// 진료영역: 코드 기본값(구조+텍스트) 위에 저장된 텍스트를 덮어쓴 Treatment 반환
export function getTreatment(slug: string): Treatment | undefined {
  const base = TREATMENTS[slug];
  if (!base) return undefined;
  const ov = pageOverrides(`treatment-${slug}`);
  if (!Object.keys(ov).length) return base;
  return {
    ...base,
    name: ov.name ?? base.name,
    tagline: ov.tagline ?? base.tagline,
    description: ov.description ?? base.description,
    methods: base.methods.map((m, i) => ({
      title: ov[`methods.${i}.title`] ?? m.title,
      desc: ov[`methods.${i}.desc`] ?? m.desc,
    })),
    faq: base.faq,
  };
}
