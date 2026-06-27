// 이미지 URL 정제 · 추출 유틸리티

const HTML_ENTITIES = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " ",
};

// HTML 엔티티 디코딩. 네이버 export는 URL을 &#x3D; / &amp; 로 인코딩해 저장하는 경우가 있어,
// React src 등 HTML 파싱을 거치지 않는 곳에서 쓰려면 미리 풀어야 한다. (변화 없을 때까지 반복)
export function decodeEntities(s) {
  if (!s) return s;
  const once = (x) =>
    x
      .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(parseInt(n, 10)))
      .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&[a-z]+;/gi, (m) => HTML_ENTITIES[m] ?? m);
  let prev = s;
  for (let i = 0; i < 5; i++) {
    const next = once(prev);
    if (next === prev) break;
    prev = next;
  }
  return prev;
}

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
