// CMS 인라인 편집 — 공용 텍스트 탐지 (편집 엔진 / 적용 엔진이 동일하게 사용).
// <main> 안에서 "자식 요소가 없고 텍스트가 있는" leaf 요소만 편집 대상으로 본다.
// (자식 요소가 없으므로 innerText 로 안전하게 교체 가능 — 아이콘/레이아웃 안 깨짐)
// 문서 순서 인덱스로 키를 매기고, 적용 시 tag 일치까지 확인해 구조 변경에 안전.

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH", "BR", "HR", "IMG", "INPUT", "TEXTAREA", "SELECT", "BUTTON"]);

export function editableLeaves(root: Element | null): HTMLElement[] {
  if (!root) return [];
  const out: HTMLElement[] = [];
  const walk = (el: Element) => {
    for (const child of Array.from(el.children)) {
      const tag = child.tagName.toUpperCase();
      if (SKIP_TAGS.has(tag)) continue;
      // 동적(클라이언트 렌더) 영역은 인덱스가 흔들리므로 편집 대상에서 제외
      if ((child as HTMLElement).dataset?.cmsSkip !== undefined) continue;
      if (child.childElementCount === 0) {
        const txt = (child.textContent || "").trim();
        if (txt) out.push(child as HTMLElement);
      } else {
        walk(child);
      }
    }
  };
  walk(root);
  return out;
}

// URL 경로 → 페이지 슬러그(저장 키). 예: /treatment/spine/ → treatment-spine, /home/ → home, / → home
export function pathToSlug(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  if (p === "" || p === "/home") return "home";
  return p.replace(/^\//, "").replace(/\//g, "-");
}

export type FieldOverride = { t: string; v: string }; // tag, value
export type PageOverrides = Record<string, FieldOverride>;
