import { useEffect, useMemo, useRef, useState } from "react";
import { sanitizeBody } from "../preview";

type Props = {
  title: string;
  category: string;
  dateLabel: string; // "2026. 4. 24."
  bodyHtml: string;
};

type Device = "mobile" | "desktop";

const DESKTOP_W = 1280; // 실제 데스크탑 폭으로 렌더 후 패널에 맞게 축소
const MOBILE_W = 390;

const ICONS: Record<Device, JSX.Element> = {
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  ),
  desktop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8.5 20.5h7M12 17v3.5" />
    </svg>
  ),
};

const DEVICES: { id: Device; label: string }[] = [
  { id: "mobile", label: "모바일" },
  { id: "desktop", label: "데스크탑" },
];

// iframe 내부 CSS — 공개 사이트(isuclinic.co.kr) 글 상세 타이포/본문을 재현.
// iframe 폭에 따라 @media가 실제로 동작 → 모바일에서 진짜 반응형으로 보인다.
const FRAME_CSS = `
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#fff;color:#1f1f1f;font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;-webkit-font-smoothing:antialiased}
.art{max-width:720px;margin:0 auto;padding:48px 32px 80px}
.eyebrow{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#4a6b3a;font-weight:700}
.title{font-family:Georgia,"Noto Serif KR",serif;font-weight:900;letter-spacing:-.02em;line-height:1.22;color:#14110e;margin:14px 0 0;font-size:38px;word-break:keep-all}
.meta{display:flex;gap:10px;align-items:center;margin-top:22px;padding:13px 0;border-top:1px solid #e3ddcf;border-bottom:1px solid #e3ddcf;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#8a8377}
.meta b{color:#3a342d;font-weight:600}
.nb{margin-top:30px;font-size:18px;line-height:1.85;letter-spacing:-.005em}
.nb p{margin:1rem 0;word-break:keep-all;overflow-wrap:break-word}
.nb strong,.nb b{font-weight:700;color:#111}
.nb a{color:#0a4a45;text-decoration:underline;text-underline-offset:4px}
.nb img{max-width:100%;height:auto;display:block;margin:2rem auto;border-radius:4px}
.nb img[data-align=left]{margin-left:0;margin-right:auto}
.nb img[data-align=right]{margin-left:auto;margin-right:0}
.nb img[data-align=center]{margin-left:auto;margin-right:auto}
.nb figure{margin:2rem 0}
.nb iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:6px;margin:2rem 0}
.nb blockquote{border-left:3px solid #0a4a45;padding:1.1rem 1.4rem;margin:2rem 0;background:#f9f9f9;font-style:italic;color:#333}
.nb h2,.nb h3,.nb h4{font-family:Georgia,"Noto Serif KR",serif;font-weight:900;letter-spacing:-.025em;line-height:1.2;margin:2.2rem 0 1rem}
.nb h2{font-size:1.6rem}.nb h3{font-size:1.35rem}.nb h4{font-size:1.1rem}
.nb table{width:100%;border-collapse:collapse;margin:1.5rem 0}
.nb td,.nb th{border:1px solid #e5e5e5;padding:8px 12px}
.empty{margin-top:30px;color:#aaa;font-size:15px}
@media(max-width:520px){.art{padding:30px 18px 56px}.title{font-size:27px}.nb{font-size:16px;margin-top:24px}}
`;

const SHELL = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${FRAME_CSS}</style></head><body><article class="art"><div class="eyebrow" id="cat"></div><h1 class="title" id="title"></h1><div class="meta" id="meta"></div><div class="nb" id="body"></div></article></body></html>`;

export function PreviewPane({ title, category, dateLabel, bodyHtml }: Props) {
  const [device, setDevice] = useState<Device>("desktop");
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ready = useRef(false);

  const bodyClean = useMemo(() => sanitizeBody(bodyHtml), [bodyHtml]);

  // 스테이지 크기 측정(축소 비율 계산용)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setStage({ w: el.clientWidth, h: el.clientHeight }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 기기 전환/최초: 새 iframe에 셸(CSS+골격) 주입 후 내용 페인트
  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(SHELL);
    doc.close();
    ready.current = true;
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  // 내용 변경 시 iframe 내부 요소만 갱신(리로드 없음)
  useEffect(() => {
    paint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, category, dateLabel, bodyClean]);

  function paint() {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !ready.current) return;
    const cat = doc.getElementById("cat");
    const ttl = doc.getElementById("title");
    const meta = doc.getElementById("meta");
    const body = doc.getElementById("body");
    if (cat) cat.textContent = category || "카테고리";
    if (ttl) ttl.textContent = title || "제목을 입력하세요";
    if (meta)
      meta.innerHTML = `<b>By 이수한의원</b><span>·</span><span>${(dateLabel || "").replace(/[<>]/g, "")}</span>`;
    if (body)
      body.innerHTML = bodyClean.trim()
        ? bodyClean
        : `<div class="empty">본문을 작성하면 여기에 사이트 모습 그대로 보여요.</div>`;
  }

  const PAD = 24;
  const availW = Math.max(0, stage.w - PAD * 2);
  const availH = Math.max(0, stage.h - PAD * 2);

  // 데스크탑: 1280px로 렌더 후 패널 폭에 맞춰 축소
  const scale = availW > 0 ? Math.min(1, availW / DESKTOP_W) : 1;
  const deskH = scale > 0 ? availH / scale : availH; // 축소 후 세로를 채우도록

  return (
    <div className="preview-pane">
      <div className="preview-chrome">
        <span className="preview-dot" />
        <span className="preview-url">isuclinic.co.kr</span>
        <div className="device-toggle">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              className={device === d.id ? "on" : ""}
              onClick={() => setDevice(d.id)}
              title={d.label}
              aria-label={d.label}
            >
              <span className="device-ico">{ICONS[d.id]}</span>
              <span className="device-lbl">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="preview-stage" ref={stageRef}>
        {device === "mobile" ? (
          <div
            className="device-frame device-mobile"
            style={{ width: MOBILE_W, height: Math.min(availH, 800) }}
          >
            <div className="device-notch" />
            <iframe ref={iframeRef} title="미리보기" className="preview-frame" />
          </div>
        ) : (
          <div
            className="scale-box"
            style={{ width: DESKTOP_W * scale, height: deskH * scale }}
          >
            <div
              className="device-frame device-desktop"
              style={{
                width: DESKTOP_W,
                height: deskH,
                transform: `scale(${scale})`,
                transformOrigin: "0 0",
              }}
            >
              <div className="device-bar">
                <span /> <span /> <span />
                <div className="device-bar-url">isuclinic.co.kr</div>
              </div>
              <iframe
                ref={iframeRef}
                title="미리보기"
                className="preview-frame"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
