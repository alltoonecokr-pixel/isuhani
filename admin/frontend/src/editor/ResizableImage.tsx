import { mergeAttributes } from "@tiptap/core";
import Image, { type ImageOptions } from "@tiptap/extension-image";

type ResizableImageOptions = ImageOptions & {
  uploadImage: null | ((file: File) => Promise<string>);
};
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { useRef, useState } from "react";

// 자유 크기조정 + 정렬 + 교체 이미지.
// 저장 형태: <img src style="width:NN%" data-align="left|center|right">
// (width 인라인 스타일 + data-align — 공개 사이트 sanitizeBody가 보존하도록 맞춤)
export const ResizableImage = Image.extend<ResizableImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      // 교체 업로드 함수 (RichEditor에서 주입) — (file) => Promise<url>
      uploadImage: null,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => {
          const m = (el.getAttribute("style") || "").match(/width:\s*([\d.]+%)/);
          return m ? m[1] : el.getAttribute("data-w");
        },
        renderHTML: (attrs) =>
          attrs.width ? { style: `width: ${attrs.width}` } : {},
      },
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) =>
          attrs.align ? { "data-align": attrs.align } : {},
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});

const PRESETS = [
  { label: "작게", w: "33%" },
  { label: "중간", w: "60%" },
  { label: "크게", w: "100%" },
];
const ALIGNS = [
  { label: "⬅", v: "left", title: "왼쪽" },
  { label: "■", v: "center", title: "가운데" },
  { label: "➡", v: "right", title: "오른쪽" },
];

function ResizableImageView(props: NodeViewProps) {
  const { node, updateAttributes, selected, editor, extension } = props;
  const width: string = node.attrs.width || "100%";
  const align: string = node.attrs.align || "center";
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState(false);

  const uploadImage: ((f: File) => Promise<string>) | null = extension.options.uploadImage;

  const onPickReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !uploadImage) return;
    setReplacing(true);
    try {
      const url = await uploadImage(file);
      updateAttributes({ src: url });
    } catch {
      /* 업로드 실패 — 상위 토스트로 알림됨 */
    } finally {
      setReplacing(false);
    }
  };

  // 우하단 핸들 드래그 → 콘텐츠 폭 대비 퍼센트로 폭 조정
  const startDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const img = imgRef.current;
    if (!img) return;
    const contentEl =
      (img.closest(".rich-editor") as HTMLElement) ||
      (img.parentElement as HTMLElement);
    const contentW = contentEl?.clientWidth || img.clientWidth;
    const startX = e.clientX;
    const startW = img.clientWidth;

    const onMove = (ev: MouseEvent) => {
      const next = startW + (ev.clientX - startX);
      let pct = Math.round((next / contentW) * 100);
      pct = Math.max(15, Math.min(100, pct));
      updateAttributes({ width: `${pct}%` });
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <NodeViewWrapper
      className="rz-img-wrap"
      data-align={align}
      style={{ width }}
    >
      <div className={"rz-img" + (selected ? " selected" : "")}>
        <img ref={imgRef} src={node.attrs.src} alt={node.attrs.alt || ""} />
        {editor.isEditable && selected && (
          <>
            <span
              className="rz-handle"
              onMouseDown={startDrag}
              title="드래그해서 크기 조절"
            />
            <div className="rz-bar" contentEditable={false}>
              {PRESETS.map((p) => (
                <button
                  key={p.w}
                  type="button"
                  className={width === p.w ? "on" : ""}
                  onClick={() => updateAttributes({ width: p.w })}
                >
                  {p.label}
                </button>
              ))}
              <span className="rz-bar-sep" />
              {ALIGNS.map((a) => (
                <button
                  key={a.v}
                  type="button"
                  title={a.title}
                  className={align === a.v ? "on" : ""}
                  onClick={() => updateAttributes({ align: a.v })}
                >
                  {a.label}
                </button>
              ))}
              {uploadImage && (
                <>
                  <span className="rz-bar-sep" />
                  <button
                    type="button"
                    className="rz-replace"
                    title="다른 사진으로 교체"
                    disabled={replacing}
                    onClick={() => fileRef.current?.click()}
                  >
                    {replacing ? "교체 중…" : "사진 교체"}
                  </button>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={onPickReplace}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
