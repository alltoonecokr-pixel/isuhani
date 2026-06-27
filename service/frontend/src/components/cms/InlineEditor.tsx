"use client";

// 인라인 편집 엔진 — 실제 사이트 페이지 위에서 보이는 텍스트를 직접 고친다.
// CMS가 ?__edit=1 로 iframe에 띄우면 활성화. 편집 모드에서는 사이트를 자유롭게 이동하며
// (링크가 __edit=1 을 유지) 어느 페이지의 어떤 텍스트든 고칠 수 있고, 변경은 페이지 경로와
// 함께 부모(CMS)로 postMessage 된다. 저장은 CMS가 모아서 한다.
// 공개 사이트(일반 방문)에서는 no-op.

import { useEffect } from "react";

// URL 경로 → 페이지 슬러그 (저장 키). 예: /treatment/spine/ → treatment-spine, / → home
function pathToSlug(pathname: string): string {
  const p = pathname.replace(/\/+$/, "");
  if (p === "" || p === "/home") return "home";
  const seg = p.replace(/^\//, "");
  return seg.replace(/\//g, "-");
}

export function InlineEditor() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("__edit") !== "1") return;

    const origin = window.location.origin;
    const page = pathToSlug(window.location.pathname);
    const post = (msg: Record<string, unknown>) =>
      window.parent?.postMessage({ source: "cms-inline", page, ...msg }, origin);

    document.body.classList.add("cms-edit-mode");

    // 같은 출처 페이지 링크는 __edit=1 을 유지해 편집 모드가 끊기지 않게 한다.
    document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (/^(tel:|mailto:|#)/.test(href)) return;
      try {
        const u = new URL(a.href, origin);
        if (u.origin === origin) { u.searchParams.set("__edit", "1"); a.href = u.toString(); }
      } catch { /* ignore */ }
    });

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cms-field]"));
    const valueOf = (el: HTMLElement) => (el.innerText ?? el.textContent ?? "");

    const snapshot: Record<string, string> = {};
    for (const el of els) {
      const field = el.dataset.cmsField!;
      snapshot[field] = valueOf(el);
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");
    }
    post({ type: "snapshot", payload: snapshot });

    const onInput = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-cms-field]") as HTMLElement | null;
      if (!el) return;
      post({ type: "change", field: el.dataset.cmsField, value: valueOf(el) });
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!(e.target as HTMLElement)?.closest?.("[data-cms-field]")) return;
      e.preventDefault();
      document.execCommand("insertText", false, e.clipboardData?.getData("text/plain") ?? "");
    };
    // 편집 가능한 요소 클릭 시엔 편집, 그 외 링크 클릭은 (편집 중 실수 방지) tel/외부만 차단
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.("[data-cms-field]")) return; // 편집 영역은 그대로 편집
      const a = target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (/^(tel:|mailto:)/.test(href)) { e.preventDefault(); } // 전화/메일은 편집 중 차단
      // 같은 출처 페이지 이동은 허용(위에서 __edit 유지). 외부는 새 탭 두는 편이 안전하지만 v1은 허용.
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("click", onClick, true);

    post({ type: "ready" });

    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("click", onClick, true);
      document.body.classList.remove("cms-edit-mode");
      for (const el of els) el.removeAttribute("contenteditable");
    };
  }, []);

  return null;
}
