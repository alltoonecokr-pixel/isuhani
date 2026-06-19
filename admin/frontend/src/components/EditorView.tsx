import { useMemo, useState } from "react";
import type { FullPost, PostInput } from "../types";
import { RichEditor } from "../editor/RichEditor";
import { PreviewPane } from "./PreviewPane";
import { cleanForEditor, cleanForSave, isoToAddDate, isoToday } from "../html";

type Props = {
  post: FullPost | null; // null = 새 글
  categories: string[];
  busy: boolean;
  onSave: (input: PostInput, publish: boolean) => Promise<void>;
  onDelete: () => void;
  onBack: () => void;
  onUploadImage: (file: File) => Promise<string>;
  toast: (msg: string, kind?: "ok" | "error") => void;
};

export function EditorView({
  post,
  categories,
  busy,
  onSave,
  onDelete,
  onBack,
  onUploadImage,
  toast,
}: Props) {
  // 기존 글 카테고리가 목록에 없으면 임시로 포함해 보여준다.
  const wantCat = post?.meta?.category || categories[0] || "한의원 story";
  const catOptions = useMemo(() => {
    const c = categories.slice();
    if (wantCat && !c.includes(wantCat)) c.push(wantCat);
    return c;
  }, [categories, wantCat]);

  const [title, setTitle] = useState(post?.title || "");
  const [category, setCategory] = useState(wantCat);
  const [date, setDate] = useState(post?.meta?.date || isoToday());
  const [excerpt, setExcerpt] = useState(post?.meta?.ogDesc || "");
  const [bodyHtml, setBodyHtml] = useState(
    cleanForEditor(post?.body || "<p></p>"),
  );
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewWide, setPreviewWide] = useState(false);

  const markDirty = () => {
    setDirty(true);
    setSaved(false);
  };

  const submit = async (publish: boolean) => {
    if (!title.trim()) {
      toast("제목을 입력하세요", "error");
      return;
    }
    const input: PostInput = {
      title: title.trim(),
      addDate: isoToAddDate(date),
      category,
      excerpt: excerpt.trim(),
      body: cleanForSave(bodyHtml),
    };
    await onSave(input, publish);
    setDirty(false);
    setSaved(true);
  };

  return (
    <section>
      <div className="editor-bar">
        <div className="editor-bar-left">
          <button className="ghost" onClick={onBack}>
            ← 목록
          </button>
          <span className="meta">
            {post ? `수정 · ${post.logNo}` : "새 글 작성"}
          </span>
        </div>
        <div className="editor-bar-right">
          <span className={"save-indicator" + (saved ? " saved" : "")}>
            {saved ? "저장됨" : dirty ? "변경됨 (저장 필요)" : ""}
          </span>
          <button
            className={"ghost preview-toggle" + (showPreview ? " on" : "")}
            onClick={() => setShowPreview((v) => !v)}
            title="사이트 미리보기 켜기/끄기"
          >
            {showPreview ? "미리보기 끄기" : "미리보기"}
          </button>
          {showPreview && (
            <button
              className={"ghost preview-toggle" + (previewWide ? " on" : "")}
              onClick={() => setPreviewWide((v) => !v)}
              title="미리보기를 전체 폭으로"
            >
              {previewWide ? "편집으로" : "넓게 보기"}
            </button>
          )}
          {post && (
            <button className="danger" onClick={onDelete} disabled={busy}>
              삭제
            </button>
          )}
          <button onClick={() => submit(false)} disabled={busy}>
            저장
          </button>
          <button className="herb" onClick={() => submit(true)} disabled={busy}>
            발행
          </button>
        </div>
      </div>

      <div
        className={
          "editor-split" +
          (showPreview ? " split-on" : "") +
          (showPreview && previewWide ? " preview-wide" : "")
        }
      >
      <div className="editor-shell">
        <div>
          <span className="field-label">제목</span>
          <input
            type="text"
            placeholder="예: 환절기 면역력 관리"
            value={title}
            autoFocus
            onChange={(e) => {
              setTitle(e.target.value);
              markDirty();
            }}
          />
        </div>

        <div className="editor-meta-grid">
          <div>
            <span className="field-label">카테고리</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                markDirty();
              }}
            >
              {catOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="field-label">발행일</span>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                markDirty();
              }}
            />
          </div>
          <div>
            <span className="field-label">요약 (선택)</span>
            <input
              type="text"
              placeholder="목록 카드 1~2줄"
              value={excerpt}
              onChange={(e) => {
                setExcerpt(e.target.value);
                markDirty();
              }}
            />
          </div>
        </div>

        <RichEditor
          initialHtml={bodyHtml}
          onChange={(html) => {
            setBodyHtml(html);
            markDirty();
          }}
          onUploadImage={onUploadImage}
          toast={toast}
        />

        <div className="editor-actions">
          <button className="ghost" onClick={onBack}>
            취소하고 목록으로
          </button>
          <span className="muted" style={{ fontSize: 12.5 }}>
            저장: 임시 저장 (사이트 미반영) · 발행: 즉시 사이트에 올림
          </span>
        </div>
      </div>

      {showPreview && (
        <PreviewPane
          title={title}
          category={category}
          dateLabel={isoToAddDate(date)}
          bodyHtml={bodyHtml}
        />
      )}
      </div>
    </section>
  );
}
