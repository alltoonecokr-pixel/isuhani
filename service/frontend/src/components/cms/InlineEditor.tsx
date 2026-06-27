"use client";

// 인라인 편집 엔진 — ?__edit=1 (CMS iframe) 에서만 활성.
// <main> 안의 모든 텍스트 노드를 편집 가능한 span 으로 감싸 어디든 클릭해 고칠 수 있게 한다.
// (텍스트 노드 단위라 아이콘·줄바꿈·강조가 섞여도 안 깨짐) 변경은 인덱스/부모tag/값과 함께
// 부모(CMS)로 postMessage. 저장은 CMS가 한다. 편집 모드에선 링크가 __edit=1 유지.
// 공개 사이트(일반 방문)에서는 no-op — 적용은 InlineOverrides 담당.

import { useEffect } from "react";
import { textNodes, pathToSlug } from "@/lib/cmsFields";

export function InlineEditor() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("__edit") !== "1") return;

    const origin = window.location.origin;
    const page = pathToSlug(window.location.pathname);
    const post = (msg: Record<string, unknown>) =>
      window.parent?.postMessage({ source: "cms-inline", page, ...msg }, origin);

    document.body.classList.add("cms-edit-mode");

    // 같은 출처 링크는 __edit=1 유지(편집 모드 끊김 방지)
    document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (/^(tel:|mailto:|#)/.test(href)) return;
      try {
        const u = new URL(a.href, origin);
        if (u.origin === origin) { u.searchParams.set("__edit", "1"); a.href = u.toString(); }
      } catch { /* ignore */ }
    });

    const main = document.querySelector("main");
    const nodes = textNodes(main);
    const snapshot: Record<string, { t: string; v: string }> = {};
    nodes.forEach((tn, i) => {
      const parentTag = tn.parentElement?.tagName || "";
      const span = document.createElement("span");
      span.dataset.cmsi = String(i);
      span.dataset.cmsTag = parentTag;
      span.className = "cms-ed";
      span.setAttribute("contenteditable", "true");
      span.setAttribute("spellcheck", "false");
      span.textContent = tn.nodeValue;
      tn.parentNode?.replaceChild(span, tn);
      snapshot[i] = { t: parentTag, v: span.textContent || "" };
    });
    post({ type: "snapshot", payload: snapshot });

    const onInput = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-cmsi]") as HTMLElement | null;
      if (!el) return;
      post({ type: "change", field: el.dataset.cmsi, tag: el.dataset.cmsTag, value: el.textContent || "" });
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!(e.target as HTMLElement)?.closest?.("[data-cmsi]")) return;
      e.preventDefault();
      document.execCommand("insertText", false, e.clipboardData?.getData("text/plain") ?? "");
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.("[data-cmsi]")) return;
      const a = target?.closest?.("a");
      if (a && /^(tel:|mailto:)/.test(a.getAttribute("href") || "")) e.preventDefault();
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
    };
  }, []);

  return null;
}
