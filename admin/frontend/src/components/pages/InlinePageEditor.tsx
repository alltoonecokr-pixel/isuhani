import { useEffect, useRef, useState } from "react";

// 실제 사이트를 iframe으로 띄워 그 위에서 인라인 편집.
// 편집 모드에서 사이트를 자유롭게 이동(링크가 __edit 유지)하며 어느 페이지든 텍스트를 고치고,
// 변경은 페이지별로 누적된다. "저장·발행"은 변경된 모든 페이지를 한 번에 저장 → 빌드 발행.

export type FieldOverride = { t: string; v: string };
export type ChangesByPage = Record<string, Record<string, FieldOverride>>;

type Props = {
  startSlug: string; // 진입 시작 페이지 (예: "spine" → /treatment/spine)
  busy?: boolean;
  onBack: () => void;
  onSaveAll: (changes: ChangesByPage) => void;
};

const startPath = (slug: string) =>
  slug === "home" ? "/home/" : slug === "visit-guide" ? "/visit-guide/" : `/treatment/${slug}/`;

export function InlinePageEditor({ startSlug, busy, onBack, onSaveAll }: Props) {
  const [ready, setReady] = useState(false);
  const [currentPage, setCurrentPage] = useState<string>("");
  const [, bumpChanges] = useState(0); // 변경 누적 시 리렌더 트리거 (값은 changesRef에서 계산)
  const changesRef = useRef<ChangesByPage>({});
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (d?.source !== "cms-inline") return;
      if (d.type === "snapshot" || d.type === "ready") {
        if (d.page) setCurrentPage(d.page);
        setReady(true);
      } else if (d.type === "change" && d.page && d.field != null) {
        const page = (changesRef.current[d.page] ??= {});
        page[String(d.field)] = { t: String(d.tag || ""), v: String(d.value ?? "") };
        bumpChanges((n) => n + 1);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const totalChanged = Object.values(changesRef.current).reduce(
    (n, p) => n + Object.keys(p).length,
    0,
  );
  const pageCount = Object.values(changesRef.current).filter((p) => Object.keys(p).length).length;
  const dirty = totalChanged > 0;

  return (
    <div className="pg-editor">
      <div className="pg-editor-bar">
        <button className="ghost" onClick={onBack}>← 페이지 목록</button>
        <div className="pg-editor-title">
          사이트 편집
          <span className="pg-slug">
            {currentPage ? `현재: ${currentPage}` : "불러오는 중…"}
            {dirty ? ` · 변경 ${totalChanged}곳 (${pageCount}페이지)` : " · 텍스트를 클릭해 수정 · 링크로 이동 가능"}
          </span>
        </div>
        <div className="pg-device-toggle">
          <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}>데스크탑</button>
          <button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}>모바일</button>
        </div>
        <button
          className="primary"
          disabled={!ready || !dirty || busy}
          onClick={() => onSaveAll(changesRef.current)}
        >
          {busy ? "저장 중…" : dirty ? `저장 (${pageCount}페이지)` : ready ? "변경 없음" : "불러오는 중…"}
        </button>
      </div>

      <div className={"pg-iframe-wrap " + device}>
        <iframe className="pg-iframe" src={`${startPath(startSlug)}?__edit=1`} title="사이트 편집" />
      </div>
    </div>
  );
}
