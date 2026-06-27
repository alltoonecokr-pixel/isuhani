import { useEffect, useRef, useState } from "react";
import type { TreatmentContent } from "../../pages/treatmentContent";

// 실제 사이트 페이지를 iframe으로 띄워 그 위에서 인라인 편집.
// 사이트의 InlineEditor(?__edit=1)가 변경을 postMessage로 보내고, 여기서 모아 저장한다.
// 저장 안 보이는 필드(faq 등)는 base 에서 그대로 보존.

type Props = {
  slug: string;          // "spine" …
  base: TreatmentContent; // 현재 콘텐츠(시드+저장본) — 비편집 필드 보존용
  busy?: boolean;
  onBack: () => void;
  onSave: (content: TreatmentContent) => void;
};

function buildContent(base: TreatmentContent, map: Record<string, string>): TreatmentContent {
  const methods = base.methods.map((m) => ({ ...m }));
  for (const [k, v] of Object.entries(map)) {
    const mm = k.match(/^methods\.(\d+)\.(title|desc)$/);
    if (mm) {
      const i = Number(mm[1]);
      if (!methods[i]) methods[i] = { title: "", desc: "" };
      methods[i][mm[2] as "title" | "desc"] = v;
    }
  }
  return {
    slug: base.slug,
    name: (map.name ?? base.name).trim(),
    tagline: (map.tagline ?? base.tagline).trim(),
    description: (map.description ?? base.description).trim(),
    methods: methods.map((m) => ({ title: m.title.trim(), desc: m.desc.trim() })),
    faq: base.faq, // 페이지에 안 보이는 필드 — 보존
  };
}

export function InlinePageEditor({ slug, base, busy, onBack, onSave }: Props) {
  const [ready, setReady] = useState(false);
  const [changed, setChanged] = useState(false);
  const mapRef = useRef<Record<string, string>>({});
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const src = `/treatment/${slug}/?__edit=1`;

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.origin !== window.location.origin) return;
      const d = ev.data;
      if (d?.source !== "cms-inline") return;
      if (d.type === "snapshot") { mapRef.current = { ...d.payload }; setReady(true); }
      else if (d.type === "ready") { setReady(true); }
      else if (d.type === "change") {
        mapRef.current = { ...mapRef.current, [d.field]: d.value };
        setChanged(true);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const save = () => onSave(buildContent(base, mapRef.current));

  return (
    <div className="pg-editor">
      <div className="pg-editor-bar">
        <button className="ghost" onClick={onBack}>← 페이지 목록</button>
        <div className="pg-editor-title">
          진료영역 · {base.name}
          <span className="pg-slug">실제 페이지에서 텍스트를 클릭해 수정</span>
        </div>
        <div className="pg-device-toggle">
          <button className={device === "desktop" ? "active" : ""} onClick={() => setDevice("desktop")}>데스크탑</button>
          <button className={device === "mobile" ? "active" : ""} onClick={() => setDevice("mobile")}>모바일</button>
        </div>
        <button className="primary" disabled={!ready || !changed || busy} onClick={save}>
          {busy ? "저장 중…" : changed ? "저장 · 발행" : ready ? "변경 없음" : "불러오는 중…"}
        </button>
      </div>

      <div className={"pg-iframe-wrap " + device}>
        <iframe
          key={slug}
          className="pg-iframe"
          src={src}
          title="페이지 편집"
        />
      </div>
    </div>
  );
}
