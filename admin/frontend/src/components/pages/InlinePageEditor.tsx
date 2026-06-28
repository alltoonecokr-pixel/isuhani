import { useEffect, useRef, useState } from "react";

// 실제 사이트를 iframe으로 띄워 그 위에서 인라인 편집.
// 자유 이동(전체 새로고침) · 변경 누적 · 일괄 저장 · 되돌리기/원래대로/나가기 경고/변경 검토.

export type FieldOverride = { t: string; v: string };
export type ChangesByPage = Record<string, Record<string, FieldOverride>>;

type Props = {
  startSlug: string;
  busy?: boolean;
  onBack: () => void;
  onSaveAll: (changes: ChangesByPage) => Promise<boolean>;
  onReset: (slug: string) => Promise<void>;
  onReplaceImage: (src: string, base64: string, mime: string) => Promise<boolean>;
};

const startPath = (slug: string) =>
  slug === "home" ? "/home/" : slug === "visit-guide" ? "/visit-guide/" : `/treatment/${slug}/`;

const trunc = (s: string, n = 28) => (s.length > n ? s.slice(0, n) + "…" : s);

export function InlinePageEditor({ startSlug, busy, onBack, onSaveAll, onReset, onReplaceImage }: Props) {
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState("");
  const [, bump] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const changesRef = useRef<ChangesByPage>({});
  const snapsRef = useRef<Record<string, Record<string, FieldOverride>>>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (d?.source !== "cms-inline") return;
      if (d.type === "snapshot") {
        if (d.page) { setCurrentPage(d.page); snapsRef.current[d.page] = d.payload || {}; }
        setReady(true);
      } else if (d.type === "ready") {
        if (d.page) setCurrentPage(d.page);
        setReady(true);
      } else if (d.type === "change" && d.page && d.field != null) {
        (changesRef.current[d.page] ??= {})[String(d.field)] = { t: String(d.tag || ""), v: String(d.value ?? "") };
        bump((n) => n + 1);
      } else if (d.type === "replaceImage" && d.src && d.base64) {
        onReplaceImage(d.src, d.base64, d.mime || "image/jpeg").then((ok) => {
          iframeRef.current?.contentWindow?.postMessage(
            { source: "cms-host", type: ok ? "imageReplaced" : "imageFailed", src: d.src },
            window.location.origin,
          );
        });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const reloadIframe = () => {
    setReady(false);
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
  };

  const totalChanged = Object.values(changesRef.current).reduce((n, p) => n + Object.keys(p).length, 0);
  const pageCount = Object.values(changesRef.current).filter((p) => Object.keys(p).length).length;
  const dirty = totalChanged > 0;

  const save = async () => {
    const ok = await onSaveAll(changesRef.current);
    if (ok) { changesRef.current = {}; setReviewOpen(false); bump((n) => n + 1); }
  };

  const discard = () => {
    if (!dirty) return;
    if (!window.confirm("고친 내용을 모두 되돌릴까요? 저장 안 한 변경이 사라집니다.")) return;
    changesRef.current = {};
    setReviewOpen(false);
    reloadIframe();
  };

  const reset = async () => {
    if (!currentPage) return;
    if (!window.confirm("이 페이지를 원래 디자인으로 되돌릴까요? 저장된 수정이 삭제됩니다.")) return;
    await onReset(currentPage);
    delete changesRef.current[currentPage];
    reloadIframe();
  };

  const back = () => {
    if (dirty && !window.confirm("저장하지 않은 변경이 있습니다. 그래도 나갈까요?")) return;
    onBack();
  };

  // 변경 검토 목록 (페이지 → 옛 문구 → 새 문구)
  const reviewItems: { page: string; oldV: string; newV: string }[] = [];
  for (const [page, fields] of Object.entries(changesRef.current)) {
    for (const [idx, ov] of Object.entries(fields)) {
      reviewItems.push({ page, oldV: snapsRef.current[page]?.[idx]?.v ?? "", newV: ov.v });
    }
  }

  return (
    <div className="pg-editor">
      <div className="pg-editor-bar">
        <button className="ghost" onClick={back}>← 나가기</button>
        <div className="pg-editor-title">
          사이트 편집
          <span className="pg-slug">
            {currentPage ? `현재: ${currentPage}` : "불러오는 중…"} · 텍스트 클릭해 수정 · 메뉴로 이동
          </span>
        </div>

        <button className="ghost sm" onClick={reset} disabled={!ready || busy} title="이 페이지를 원래 디자인으로">
          원래대로
        </button>
        {dirty && (
          <div className="pg-review-wrap">
            <button className="ghost sm" onClick={() => setReviewOpen((o) => !o)}>
              변경 {totalChanged}곳 ({pageCount}p) ▾
            </button>
            {reviewOpen && (
              <div className="pg-review">
                <div className="pg-review-h">저장하면 반영될 변경</div>
                {reviewItems.map((r, i) => (
                  <div className="pg-review-row" key={i}>
                    <span className="pg-review-page">{r.page}</span>
                    <span className="pg-review-old">{trunc(r.oldV) || "(빈칸)"}</span>
                    <span className="pg-review-arr">→</span>
                    <span className="pg-review-new">{trunc(r.newV) || "(빈칸)"}</span>
                  </div>
                ))}
                <button className="ghost sm pg-review-discard" onClick={discard}>전체 되돌리기</button>
              </div>
            )}
          </div>
        )}
        <div className="pg-device-toggle">
          <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}>데스크탑</button>
          <button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}>모바일</button>
        </div>
        <button className="primary" disabled={!ready || !dirty || busy} onClick={save}>
          {busy ? "저장 중…" : dirty ? `저장 (${pageCount}페이지)` : ready ? "변경 없음" : "불러오는 중…"}
        </button>
      </div>

      <div className={"pg-iframe-wrap " + device}>
        <iframe ref={iframeRef} className="pg-iframe" src={`${startPath(startSlug)}?__edit=1`} title="사이트 편집" />
      </div>
    </div>
  );
}
