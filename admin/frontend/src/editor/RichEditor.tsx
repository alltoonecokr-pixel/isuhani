import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Iframe } from "./extensions";
import { ResizableImage } from "./ResizableImage";
import { videoEmbed } from "../html";

type Props = {
  initialHtml: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  onReady?: (editor: Editor) => void;
  toast: (msg: string, kind?: "ok" | "error") => void;
};

const IcoImage = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
    <circle cx="8.5" cy="10" r="1.6" />
    <path d="M21 16l-5-5L5 19.5" />
  </svg>
);
const IcoVideo = (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="5.5" width="14" height="13" rx="2.5" />
    <path d="M21.5 8.5l-5 3.5 5 3.5z" />
  </svg>
);

const TOOLBAR = [
  { cmd: "bold", label: "B", title: "굵게", bold: true },
  { cmd: "heading", label: "H", title: "소제목" },
  { cmd: "quote", label: "❝", title: "인용" },
  { sep: true },
  { cmd: "image", label: "사진", icon: IcoImage, title: "사진 넣기" },
  { cmd: "video", label: "영상", icon: IcoVideo, title: "영상 넣기" },
  { cmd: "hr", label: "구분선", title: "구분선" },
] as const;

export function RichEditor({
  initialHtml,
  onChange,
  onUploadImage,
  onReady,
  toast,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
      }),
      ResizableImage.configure({ inline: false, allowBase64: false, uploadImage: onUploadImage }),
      Iframe,
      Placeholder.configure({
        placeholder: "내용을 입력하세요. 상단 도구로 소제목·사진·영상을 넣을 수 있습니다.",
      }),
    ],
    content: initialHtml,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      handleDrop(_view, event) {
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith("image/")) return false;
        event.preventDefault();
        void doUpload(file);
        return true;
      },
      // YouTube·Vimeo 링크를 그냥 붙여넣으면 자동으로 영상으로 바꿔준다
      handlePaste(view, event) {
        const text = (event.clipboardData?.getData("text/plain") || "").trim();
        if (!/^https?:\/\/\S+$/.test(text)) return false;
        const embed = videoEmbed(text);
        if (!embed) return false;
        const src = embed.match(/src="([^"]+)"/)?.[1];
        const nodeType = view.state.schema.nodes.iframe;
        if (!src || !nodeType) return false;
        event.preventDefault();
        const node = nodeType.create({ src });
        view.dispatch(view.state.tr.replaceSelectionWith(node).scrollIntoView());
        return true;
      },
    },
  });

  useEffect(() => {
    if (editor) onReady?.(editor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function doUpload(file: File) {
    if (!editor) return;
    toast("업로드 중…");
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: "" }).run();
      toast("사진이 추가되었습니다");
    } catch (e) {
      toast(e instanceof Error ? e.message : "업로드 실패", "error");
    }
  }

  function pickImage() {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = () => {
      const file = inp.files?.[0];
      if (file) void doUpload(file);
    };
    inp.click();
  }

  function insertVideo() {
    if (!editor) return;
    const url = window.prompt("YouTube 또는 Vimeo URL을 붙여넣으세요:");
    if (!url) return;
    const embed = videoEmbed(url);
    if (!embed) {
      toast("YouTube 또는 Vimeo URL을 인식할 수 없습니다", "error");
      return;
    }
    const src = embed.match(/src="([^"]+)"/)?.[1];
    if (src) editor.chain().focus().insertContent({ type: "iframe", attrs: { src } }).run();
  }

  function run(cmd: string) {
    if (!editor) return;
    const c = editor.chain().focus();
    switch (cmd) {
      case "bold":
        c.toggleBold().run();
        break;
      case "heading":
        c.toggleHeading({ level: 2 }).run();
        break;
      case "quote":
        c.toggleBlockquote().run();
        break;
      case "hr":
        c.setHorizontalRule().run();
        break;
      case "image":
        pickImage();
        break;
      case "video":
        insertVideo();
        break;
    }
  }

  const isActive = (cmd: string): boolean => {
    if (!editor) return false;
    if (cmd === "bold") return editor.isActive("bold");
    if (cmd === "heading") return editor.isActive("heading", { level: 2 });
    if (cmd === "quote") return editor.isActive("blockquote");
    return false;
  };

  return (
    <div>
      <div className="rich-toolbar">
        {TOOLBAR.map((item, i) =>
          "sep" in item ? (
            <span className="rt-sep" key={`sep-${i}`} />
          ) : (
            <button
              type="button"
              key={item.cmd}
              title={"title" in item ? item.title : undefined}
              className={isActive(item.cmd) ? "rt-on" : ""}
              onClick={() => run(item.cmd)}
            >
              {"bold" in item && item.bold ? <b>{item.label}</b> : item.label}
            </button>
          ),
        )}
      </div>
      <EditorContent editor={editor} className="rich-editor" />
    </div>
  );
}
