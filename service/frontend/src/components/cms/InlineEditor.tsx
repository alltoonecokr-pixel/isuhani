"use client";

// 인라인 편집 엔진 — ?__edit=1 (CMS iframe) 에서만 활성.
// <main> 안의 모든 텍스트 노드를 편집 가능한 span 으로 감싸 어디든 클릭해 고칠 수 있게 한다.
// (텍스트 노드 단위라 아이콘·줄바꿈·강조가 섞여도 안 깨짐) 변경은 인덱스/부모tag/값과 함께
// 부모(CMS)로 postMessage. 저장은 CMS가 한다. 편집 모드에선 링크가 __edit=1 유지.
// 공개 사이트(일반 방문)에서는 no-op — 적용은 InlineOverrides 담당.

import { useEffect } from "react";
import { textNodes, pathToSlug, isTextEditablePage } from "@/lib/cmsFields";

export function InlineEditor() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("__edit") !== "1") return;

    const origin = window.location.origin;
    const page = pathToSlug(window.location.pathname);
    const post = (msg: Record<string, unknown>) =>
      window.parent?.postMessage({ source: "cms-inline", page, ...msg }, origin);

    document.body.classList.add("cms-edit-mode");
    if (isTextEditablePage(page)) document.body.classList.add("cms-text");

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
    // 텍스트 인라인 편집은 저장 대상 페이지에서만. 블로그 글 등은 사진 교체만 허용.
    const textEditable = isTextEditablePage(page);
    const snapshot: Record<string, { t: string; v: string }> = {};
    if (textEditable) {
      textNodes(main).forEach((tn, i) => {
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
    }
    post({ type: "snapshot", payload: snapshot, textEditable });

    // ── 이미지 교체 ──────────────────────────────────────────────
    // 본문(main) 안 우리 S3 이미지는 클릭하면 새 사진으로 교체(원 URL 유지, S3 객체만 덮어씀).
    const isOurImg = (img: HTMLImageElement) => /amazonaws\.com\/images\//.test(img.src);
    main?.querySelectorAll("img").forEach((img) => {
      if (img.closest("[data-cms-skip]")) return;
      if (isOurImg(img)) { img.classList.add("cms-img-edit"); img.title = "클릭해 사진 교체"; }
    });
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    let pendingImg: HTMLImageElement | null = null;
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      fileInput.value = "";
      if (!file || !pendingImg) return;
      const img = pendingImg;
      const src = img.src.split("?")[0];
      img.classList.add("cms-img-busy");
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = String(reader.result).split(",")[1] || "";
        post({ type: "replaceImage", src, base64: b64, mime: file.type || "image/jpeg" });
      };
      reader.readAsDataURL(file);
    });

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
      if (target?.closest?.("[data-cmsi]")) return; // 편집 영역은 그대로 편집
      const img = target?.closest?.("img.cms-img-edit") as HTMLImageElement | null;
      if (img) { e.preventDefault(); e.stopPropagation(); pendingImg = img; fileInput.click(); return; }
      const a = target?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (/^(tel:|mailto:)/.test(href)) { e.preventDefault(); return; }
      // 같은 출처 이동은 "전체 새로고침"으로 강제 — Next SPA 이동은 편집 엔진을 다시 안 붙임.
      try {
        const u = new URL(a.href, origin);
        if (u.origin === origin) {
          e.preventDefault();
          e.stopPropagation();
          u.searchParams.set("__edit", "1");
          window.location.assign(u.toString());
        }
      } catch { /* ignore */ }
    };

    // 부모(CMS)의 교체 결과 수신 → 해당 이미지 캐시버스트(즉시 새 사진 표시)
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== origin) return;
      const d = ev.data;
      if (d?.source !== "cms-host") return;
      if (d.type === "imageReplaced" && d.src) {
        document.querySelectorAll<HTMLImageElement>("img.cms-img-edit").forEach((im) => {
          if (im.src.split("?")[0] === d.src) {
            im.src = d.src + "?v=" + Date.now();
            im.classList.remove("cms-img-busy");
          }
        });
      } else if (d.type === "imageFailed" && d.src) {
        document.querySelectorAll<HTMLImageElement>("img.cms-img-busy").forEach((im) => im.classList.remove("cms-img-busy"));
      }
    };

    document.addEventListener("input", onInput, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("message", onMessage);
    post({ type: "ready" });

    return () => {
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onMessage);
      fileInput.remove();
      document.body.classList.remove("cms-edit-mode", "cms-text");
    };
  }, []);

  return null;
}
