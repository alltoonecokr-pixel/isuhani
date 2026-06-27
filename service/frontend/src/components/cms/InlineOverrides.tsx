"use client";

// 저장된 텍스트 오버라이드를 일반 방문 시 클라이언트에서 적용.
// CMS 저장 → /live-pages/{slug}.json (웹 버킷) 즉시 기록 → 이 컴포넌트가 읽어 그 자리에 반영.
// 빌드 불필요(즉시 반영). 편집 모드(?__edit=1)에서는 InlineEditor가 담당하므로 no-op.

import { useEffect } from "react";
import { editableLeaves, pathToSlug, type PageOverrides } from "@/lib/cmsFields";

export function InlineOverrides() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("__edit") === "1") return;
    const slug = pathToSlug(window.location.pathname);
    let alive = true;
    fetch(`/live-pages/${slug}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PageOverrides | null) => {
        if (!alive || !data || typeof data !== "object") return;
        const leaves = editableLeaves(document.querySelector("main"));
        for (const [i, ov] of Object.entries(data)) {
          const el = leaves[Number(i)];
          if (el && ov && el.tagName === ov.t && el.innerText.trim() !== (ov.v ?? "").trim()) {
            el.innerText = ov.v;
          }
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return null;
}
