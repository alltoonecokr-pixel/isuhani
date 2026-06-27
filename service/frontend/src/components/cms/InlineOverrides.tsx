"use client";

// 저장된 텍스트 오버라이드를 일반 방문 시 클라이언트에서 적용.
// CMS 저장 → /live-pages/{slug}.json (웹 버킷) 즉시 기록 → 이 컴포넌트가 읽어 해당 텍스트 노드만 교체.
// (DOM 구조는 안 바꾸고 텍스트 값만 교체 — 일반 방문자에겐 부작용 없음) 빌드 불필요(즉시 반영).
// 편집 모드(?__edit=1)에서는 InlineEditor가 담당하므로 no-op.

import { useEffect } from "react";
import { textNodes, pathToSlug, type PageOverrides } from "@/lib/cmsFields";

export function InlineOverrides() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("__edit") === "1") return;
    const slug = pathToSlug(window.location.pathname);
    let alive = true;
    fetch(`/live-pages/${slug}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: PageOverrides | null) => {
        if (!alive || !data || typeof data !== "object") return;
        const nodes = textNodes(document.querySelector("main"));
        for (const [i, ov] of Object.entries(data)) {
          const tn = nodes[Number(i)];
          if (
            tn && ov &&
            (tn.parentElement?.tagName || "") === ov.t &&
            (tn.nodeValue || "").trim() !== (ov.v ?? "").trim()
          ) {
            tn.nodeValue = ov.v;
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
