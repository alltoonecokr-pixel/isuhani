"use client";

// 인라인 편집 엔진 — 실제 사이트 페이지 위에서 텍스트를 직접 고친다.
// CMS(어드민)가 이 페이지를 ?__edit=1 로 iframe에 띄우면 활성화된다.
// 편집 가능한 요소엔 data-cms-field="경로" 가 붙어 있고(예: tagline, methods.0.title),
// 여기서 contentEditable 로 열고, 변경을 부모(CMS)로 postMessage 한다. 저장은 CMS가 한다.
//
// 공개 사이트(일반 방문)에서는 아무 일도 하지 않는다(스크립트가 no-op).

import { useEffect } from "react";

export function InlineEditor() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("__edit") !== "1") return;

    const parentOrigin = window.location.origin;
    const post = (msg: Record<string, unknown>) =>
      window.parent?.postMessage({ source: "cms-inline", ...msg }, parentOrigin);

    document.body.classList.add("cms-edit-mode");

    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-cms-field]"),
    );

    const valueOf = (el: HTMLElement) => (el.innerText ?? el.textContent ?? "").replace(/ /g, " ");

    // 초기 스냅샷 — 현재 페이지의 모든 편집 필드 값
    const snapshot: Record<string, string> = {};
    for (const el of els) {
      const field = el.dataset.cmsField!;
      snapshot[field] = valueOf(el);
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");
      el.dataset.cmsActive = "1";
    }
    post({ type: "snapshot", payload: snapshot });

    // 입력 → 변경 전송
    const onInput = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-cms-field]") as HTMLElement | null;
      if (!el) return;
      post({ type: "change", field: el.dataset.cmsField, value: valueOf(el) });
    };
    // 붙여넣기 서식 제거 (plain text)
    const onPaste = (e: ClipboardEvent) => {
      if (!(e.target as HTMLElement)?.closest?.("[data-cms-field]")) return;
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    };
    // 편집 모드에선 링크 이동 차단(편집 중 페이지 이탈 방지)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a");
      if (a) { e.preventDefault(); e.stopPropagation(); }
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("click", onClick, true);

    // 부모(CMS)가 외부 변경을 밀어넣을 때(예: 되돌리기) 반영
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== parentOrigin) return;
      const d = ev.data;
      if (d?.source === "cms-host" && d.type === "setField") {
        const el = els.find((x) => x.dataset.cmsField === d.field);
        if (el) el.innerText = d.value;
      }
    };
    window.addEventListener("message", onMessage);

    post({ type: "ready" });

    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
      document.body.classList.remove("cms-edit-mode");
      for (const el of els) el.removeAttribute("contenteditable");
    };
  }, []);

  return null;
}
