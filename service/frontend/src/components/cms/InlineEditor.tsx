"use client";

// 인라인 편집 엔진 — ?__edit=1 (CMS iframe) 에서만 활성.
// <main> 안의 모든 텍스트 leaf 를 자동으로 편집 가능하게 만든다(마커 불필요).
// 변경은 페이지 슬러그 + 인덱스 + tag 와 함께 부모(CMS)로 postMessage. 저장은 CMS가 한다.
// 편집 모드에선 사이트 링크가 __edit=1 을 유지해 페이지 사이 자유 이동.
// 공개 사이트(일반 방문)에서는 no-op.

import { useEffect } from "react";
import { editableLeaves, pathToSlug } from "@/lib/cmsFields";

export function InlineEditor() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("__edit") !== "1") return;

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
    const leaves = editableLeaves(main);
    const snapshot: Record<string, { t: string; v: string }> = {};
    leaves.forEach((el, i) => {
      el.dataset.cmsi = String(i);
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");
      snapshot[i] = { t: el.tagName, v: el.innerText };
    });
    post({ type: "snapshot", payload: snapshot });

    const onInput = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-cmsi]") as HTMLElement | null;
      if (!el) return;
      post({ type: "change", field: el.dataset.cmsi, tag: el.tagName, value: el.innerText });
    };
    const onPaste = (e: ClipboardEvent) => {
      if (!(e.target as HTMLElement)?.closest?.("[data-cmsi]")) return;
      e.preventDefault();
      document.execCommand("insertText", false, e.clipboardData?.getData("text/plain") ?? "");
    };
    // 편집 영역은 그대로 편집. tel/mailto 는 편집 중 차단(실수로 전화 걸림 방지)
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
      leaves.forEach((el) => el.removeAttribute("contenteditable"));
    };
  }, []);

  return null;
}
