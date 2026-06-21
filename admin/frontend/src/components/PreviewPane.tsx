import { useEffect, useMemo, useRef } from "react";
import { sanitizeBody } from "../preview";

type Props = {
  title: string;
  category: string;
  dateLabel: string;
  bodyHtml: string;
};

const MOBILE_W = 375;

const FRAME_CSS = `
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#fff;color:#1f1f1f;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;-webkit-font-smoothing:antialiased}
.art{max-width:720px;margin:0 auto;padding:28px 20px 60px}
.eyebrow{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#4a6b3a;font-weight:700}
.title{font-family:Georgia,"Noto Serif KR",serif;font-weight:900;letter-spacing:-.02em;line-height:1.22;color:#14110e;margin:12px 0 0;font-size:26px;word-break:keep-all}
.meta{display:flex;gap:8px;align-items:center;margin-top:16px;padding:11px 0;border-top:1px solid #e3ddcf;border-bottom:1px solid #e3ddcf;font-size:11px;letter-spacing:.1em;color:#8a8377}
.meta b{color:#3a342d;font-weight:600}
.nb{margin-top:20px;font-size:15.5px;line-height:1.82;letter-spacing:-.005em}
.nb p{margin:.9rem 0;word-break:keep-all;overflow-wrap:break-word}
.nb strong,.nb b{font-weight:700;color:#111}
.nb a{color:#0a4a45;text-decoration:underline;text-underline-offset:3px}
.nb img{max-width:100%;height:auto;display:block;margin:1.4rem auto;border-radius:4px}
.nb img[data-align=left]{margin-left:0;margin-right:auto}
.nb img[data-align=right]{margin-left:auto;margin-right:0}
.nb img[data-align=center]{margin-left:auto;margin-right:auto}
.nb figure{margin:1.4rem 0}
.nb iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:6px;margin:1.4rem 0}
.nb blockquote{border-left:3px solid #4a6b3a;padding:.8rem 1.1rem;margin:1.4rem 0;background:#f9f9f9;font-style:italic;color:#333}
.nb h2,.nb h3{font-family:Georgia,"Noto Serif KR",serif;font-weight:900;letter-spacing:-.025em;line-height:1.2;margin:1.8rem 0 .8rem}
.nb h2{font-size:1.3rem}.nb h3{font-size:1.1rem}
.nb table{width:100%;border-collapse:collapse;margin:1.1rem 0}
.nb td,.nb th{border:1px solid #e5e5e5;padding:6px 9px}
.empty{margin-top:40px;color:#bbb;font-size:13px;text-align:center;padding:30px 0;line-height:2}
`;

const SHELL = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${FRAME_CSS}</style></head><body><article class="art"><div class="eyebrow" id="cat"></div><h1 class="title" id="title"></h1><div class="meta" id="meta"></div><div class="nb" id="body"></div></article></body></html>`;

export function PreviewPane({ title, category, dateLabel, bodyHtml }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  const bodyClean = useMemo(() => sanitizeBody(bodyHtml), [bodyHtml]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.open(); doc.write(SHELL); doc.close();
    ready.current = true;
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { paint(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [title, category, dateLabel, bodyClean]);

  function paint() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !ready.current) return;
    const el = (id: string) => doc.getElementById(id);
    const cat  = el("cat");
    const ttl  = el("title");
    const meta = el("meta");
    const body = el("body");
    if (cat)  cat.textContent = category || "카테고리";
    if (ttl)  ttl.textContent = title || "제목을 입력하세요";
    if (meta) meta.innerHTML = `<b>By 이수한의원</b><span>·</span><span>${(dateLabel || "").replace(/[<>]/g, "")}</span>`;
    if (body) body.innerHTML = bodyClean.trim()
      ? bodyClean
      : `<div class="empty">본문을 작성하면<br>여기에 미리보기가 표시됩니다</div>`;
  }

  return (
    <div className="preview-pane">
      {/* 미니멀 폰 프레임 */}
      <div className="phone-shell">
        {/* 상단 상태바 */}
        <div className="phone-status">
          <span className="phone-time">9:41</span>
          <div className="phone-icons">
            <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
              <rect x="0" y="3" width="3" height="7" rx="1" opacity=".35"/>
              <rect x="3.5" y="2" width="3" height="8" rx="1" opacity=".55"/>
              <rect x="7" y="1" width="3" height="9" rx="1" opacity=".8"/>
              <rect x="10.5" y="0" width="3" height="10" rx="1"/>
            </svg>
            <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M1 3.5C2.9 1.2 9.1 1.2 11 3.5"/>
              <path d="M3 6C4.2 4.5 7.8 4.5 9 6"/>
              <circle cx="6" cy="8.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <span className="phone-battery">
              <span className="phone-battery-inner" />
            </span>
          </div>
        </div>
        {/* iframe 콘텐츠 */}
        <iframe
          ref={iframeRef}
          title="모바일 미리보기"
          className="phone-frame"
          style={{ width: MOBILE_W }}
        />
        {/* 홈 인디케이터 */}
        <div className="phone-home"><span /></div>
      </div>
    </div>
  );
}
