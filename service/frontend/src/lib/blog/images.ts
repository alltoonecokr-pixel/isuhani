// 이미지 URL 정제 · 썸네일 추출

import { decodeEntities } from "./sanitize";

/**
 * 네이버 이미지 ?type 파라미터를 큰 해상도로 정규화.
 * w275 / w80_blur 같은 작거나 흐린 type도 size(기본 w966)로 교체.
 */
export function cleanImageUrl(url: string | null | undefined, size = "w966"): string {
  if (!url) return "";
  if (
    /\.(?:postfiles|blogfiles|blogthumb|mblogthumb)/.test(url) ||
    /pstatic\.net/.test(url)
  ) {
    if (/\?type=/.test(url)) return url.replace(/\?type=[^&]+/, `?type=${size}`);
    if (/&type=/.test(url)) return url.replace(/&type=[^&]+/, `&type=${size}`);
    return url + (url.includes("?") ? "&" : "?") + `type=${size}`;
  }
  return url;
}

/**
 * 카드 썸네일 추출 — og:image가 placeholder인 경우가 많으므로
 * 본문 첫 이미지(data-lazy-src 우선)를 먼저 시도한다.
 */
export function extractThumbnail(
  body: string | null,
  ogImage?: string | null,
): string | null {
  if (body) {
    const lazy = body.match(/<img[^>]+data-lazy-src="([^"]+)"/);
    if (lazy) return cleanImageUrl(decodeEntities(lazy[1]));
    const src = body.match(
      /<img[^>]+src="(https:\/\/(?:postfiles|blogfiles|mblogthumb|blogthumb)[^"]+)"/,
    );
    if (src) return cleanImageUrl(decodeEntities(src[1]));
  }
  if (ogImage) return cleanImageUrl(decodeEntities(ogImage));
  return null;
}
