// CMS 인라인 편집 — 공용 텍스트 노드 탐지 (편집 엔진 / 적용 엔진이 동일하게 사용).
// "요소"가 아니라 "텍스트 노드" 단위로 다룬다 → 아이콘 옆 글자, 줄바꿈(<br>) 든 문단,
// 강조 span 섞인 문단도 전부 편집되고 아이콘/구조/스타일이 안 깨진다.
// 문서 순서 인덱스로 키를 매기고, 적용 시 부모 tag 일치까지 확인해 구조 변경에 안전.

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "PATH", "TEXTAREA", "TITLE"]);

// <main> 안의 편집 대상 텍스트 노드를 문서 순서로 수집 (공백만/스킵영역 제외)
export function textNodes(root: Element | null): Text[] {
  if (!root || typeof document === "undefined") return [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!(node.nodeValue || "").trim()) return NodeFilter.FILTER_REJECT;
      let p: HTMLElement | null = node.parentElement;
      while (p && p !== root) {
        if (SKIP_TAGS.has(p.tagName.toUpperCase())) return NodeFilter.FILTER_REJECT;
        if (p.dataset && p.dataset.cmsSkip !== undefined) return NodeFilter.FILTER_REJECT;
        p = p.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const out: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
  return out;
}

// URL 경로 → 페이지 슬러그(저장 키). 예: /treatment/spine/ → treatment-spine, /home/ → home, / → home
export function pathToSlug(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  if (p === "" || p === "/home") return "home";
  return p.replace(/^\//, "").replace(/\//g, "-");
}

export type FieldOverride = { t: string; v: string }; // 부모 tag, 텍스트
export type PageOverrides = Record<string, FieldOverride>;
