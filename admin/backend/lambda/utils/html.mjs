// HTML 렌더링 · 정제 유틸리티

export function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
}

export function escapeAttr(s) {
  return escapeHtml(s);
}

// ── 블록 → HTML 렌더 ─────────────────────────────────────────────────────────

function youtubeId(url) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

function vimeoId(url) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function renderBlock(b) {
  switch (b.type) {
    case "heading": {
      const level = Math.min(Math.max(b.level || 2, 2), 4);
      return `<h${level}>${escapeHtml(b.text || "")}</h${level}>`;
    }
    case "paragraph": {
      const text = String(b.text || "");
      return text
        .split(/\n{2,}/)
        .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`)
        .join("\n");
    }
    case "photo": {
      const src = b.url || "";
      const cap = b.caption || "";
      const alt = b.alt || cap || "";
      const inner = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />`;
      return cap
        ? `<figure>${inner}<figcaption>${escapeHtml(cap)}</figcaption></figure>`
        : `<figure>${inner}</figure>`;
    }
    case "gallery": {
      const imgs = (b.images || [])
        .map((im) => {
          const src = im.url || "";
          const alt = im.alt || im.caption || "";
          const cap = im.caption || "";
          const inner = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" />`;
          return cap
            ? `<figure>${inner}<figcaption>${escapeHtml(cap)}</figcaption></figure>`
            : `<figure>${inner}</figure>`;
        })
        .join("\n");
      return `<div class="cms-gallery">${imgs}</div>`;
    }
    case "video": {
      const url = b.url || "";
      const cap = b.caption || "";
      const yt = youtubeId(url);
      const vm = vimeoId(url);
      let embed = "";
      if (yt) {
        embed = `<iframe src="https://www.youtube.com/embed/${yt}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
      } else if (vm) {
        embed = `<iframe src="https://player.vimeo.com/video/${vm}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
      } else if (url) {
        embed = `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">${escapeHtml(url)}</a>`;
      }
      return `<figure class="cms-video">${embed}${
        cap ? `<figcaption>${escapeHtml(cap)}</figcaption>` : ""
      }</figure>`;
    }
    case "quote":
      return `<blockquote>${escapeHtml(b.text || "")}</blockquote>`;
    case "divider":
      return `<hr/>`;
    default:
      return "";
  }
}

export function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks.map(renderBlock).filter(Boolean).join("\n");
}

// 직접 API 호출에 대비한 최소 XSS 필터 (프론트가 TipTap으로 1차 정리하지만 서버도 방어)
export function sanitizeBody(html) {
  if (!html) return "";
  let out = html;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/\son\w+="[^"]*"/gi, "");
  out = out.replace(/\son\w+='[^']*'/gi, "");
  // youtube/vimeo 외 iframe 제거
  out = out.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, (m) => {
    const src = m.match(/src=["']([^"']+)["']/i)?.[1] || "";
    return /^(https?:)?\/\/(www\.)?(youtube\.com\/embed|player\.vimeo\.com)\//.test(src) ? m : "";
  });
  out = out.replace(/<iframe\b[^>]*\/?>(?![\s\S]*<\/iframe>)/gi, "");
  out = out.replace(/<\/iframe\s*>/gi, "");
  return out;
}
