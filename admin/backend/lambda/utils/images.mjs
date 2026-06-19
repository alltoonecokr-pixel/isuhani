// 이미지 URL 정제 · 추출 유틸리티

// 네이버 이미지 ?type 파라미터를 원하는 사이즈로 정규화
export function cleanImageUrl(url, size = "w966") {
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

// 본문 HTML에서 img src 전체 추출
export function extractImageUrlsFromHtml(html) {
  const urls = [];
  const re = /<img[^>]+src="([^"]+)"/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.push(m[1]);
  return urls;
}

// blocks[] 배열에서 이미지 URL 추출 (photo, gallery 블록)
export function blocksToImages(blocks) {
  const urls = [];
  for (const b of blocks || []) {
    if (b.type === "photo" && b.url) urls.push(b.url);
    if (b.type === "gallery")
      for (const im of b.images || []) if (im.url) urls.push(im.url);
  }
  return urls;
}
