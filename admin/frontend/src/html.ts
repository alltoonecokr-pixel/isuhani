// 본문 HTML 정리 — 기존 admin.html의 cleanForEditor/cleanForSave와 동일 동작.
// 사이트(프론트)와 같은 HTML 계약을 유지해야 하므로 출력 형태를 바꾸지 않는다.

export function isoToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function isoToAddDate(iso: string): string {
  const m = String(iso).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return m ? `${m[1]}. ${parseInt(m[2], 10)}. ${parseInt(m[3], 10)}.` : "";
}

// 불러오기용 — 네이버 placeholder/lazy-src를 실제 src로 정규화하고 안전 필터.
// 추가로 TipTap이 이해하도록 <figure><img>/<iframe></figure> 래퍼를 벗겨 bare img/iframe으로.
export function cleanForEditor(html: string | null | undefined): string {
  if (!html) return "<p></p>";
  let out = html;
  // 네이버 lazy-load: <img src="?type=w80_blur" data-lazy-src="원본"> → src=원본
  out = out.replace(
    /<img\b([^>]*?)\sdata-lazy-src="([^"]+)"([^>]*)>/gi,
    (_m, before, real, after) => {
      const merged = (before + " " + after).replace(/\ssrc="[^"]*"/i, "");
      return `<img${merged} src="${real}">`;
    },
  );
  // pstatic.net 이미지 ?type 정규화
  out = out.replace(
    /(<img[^>]+src="https:\/\/[^"]*?\.pstatic\.net\/[^"?]+)(\?type=[^"]*)?"/g,
    '$1?type=w966"',
  );
  // 안전: script/style/onXxx 제거
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/\son\w+="[^"]*"/gi, "");
  out = out.replace(/\son\w+='[^']*'/gi, "");
  // 네이버 SmartEditor의 빈 placeholder 제거
  out = out.replace(
    /<img[^>]+src="[^"]*\?type=w(?:2|80_blur)[^"]*"[^>]*>/gi,
    "",
  );
  // figcaption 보존: <figure><img><figcaption>..</figcaption></figure>
  //  → <img data-caption=".."> (TipTap Image 커스텀 속성으로 왕복)
  out = out.replace(
    /<figure[^>]*class="[^"]*cms-video[^"]*"[^>]*>([\s\S]*?)<\/figure>/gi,
    "$1",
  );
  out = out.replace(/<figure[^>]*>\s*(<img[^>]*>)\s*<\/figure>/gi, "$1");
  out = out.replace(
    /<figure[^>]*>\s*(<img[^>]*>)\s*<figcaption[^>]*>([\s\S]*?)<\/figcaption>\s*<\/figure>/gi,
    (_m, img: string, cap: string) => {
      const caption = cap.replace(/"/g, "&quot;").trim();
      return img.replace(/<img/i, `<img data-caption="${caption}"`);
    },
  );
  return out;
}

// 저장용 — TipTap 출력 HTML을 사이트 표시 HTML로.
// bare <img>/<iframe> 을 다시 <figure> 로 감싸고, referrerpolicy/lazy 부착, 빈 p 제거.
export function cleanForSave(html: string | null | undefined): string {
  if (!html) return "";
  let out = html;
  out = out.replace(/<script[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style[\s\S]*?<\/style>/gi, "");
  out = out.replace(/\son\w+="[^"]*"/gi, "");
  out = out.replace(/\son\w+='[^']*'/gi, "");

  // iframe(영상) → <figure class="cms-video">…</figure>
  out = out.replace(
    /<iframe\b[^>]*><\/iframe>/gi,
    (m) => `<figure class="cms-video">${m}</figure>`,
  );

  // img → referrerpolicy/lazy 부착 + data-caption 분리 + <figure> 래핑
  out = out.replace(/<img\b([^>]*)>/gi, (_m, attrsRaw: string) => {
    let attrs = attrsRaw;
    let caption = "";
    const capMatch = attrs.match(/\sdata-caption="([^"]*)"/i);
    if (capMatch) {
      caption = capMatch[1];
      attrs = attrs.replace(/\sdata-caption="[^"]*"/i, "");
    }
    if (!/\sloading=/.test(attrs)) attrs += ' loading="lazy"';
    if (!/referrerpolicy=/i.test(attrs)) attrs += ' referrerpolicy="no-referrer"';
    const figcap = caption
      ? `<figcaption>${caption}</figcaption>`
      : "";
    return `<figure><img${attrs}>${figcap}</figure>`;
  });

  // 빈 문단 제거
  out = out.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
  return out;
}

// YouTube / Vimeo URL → embed iframe HTML (없으면 null)
export function videoEmbed(url: string): string | null {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  // 네이버 TV: tv.naver.com/v/{번호} 또는 /embed/{번호}
  const ntv = url.match(/tv\.naver\.com\/(?:v|embed)\/(\d+)/);
  if (yt)
    return `<iframe src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen></iframe>`;
  if (vm)
    return `<iframe src="https://player.vimeo.com/video/${vm[1]}" frameborder="0" allowfullscreen></iframe>`;
  if (ntv)
    return `<iframe src="https://tv.naver.com/embed/${ntv[1]}" frameborder="0" allowfullscreen></iframe>`;
  return null;
}
