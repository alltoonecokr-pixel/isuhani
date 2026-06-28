import { useMemo, useState } from "react";
import type { FullPost, PostInput } from "../types";
import { RichEditor } from "../editor/RichEditor";
import { PreviewPane } from "./PreviewPane";
import { CustomSelect } from "./CustomSelect";
import { DatePicker } from "./DatePicker";
import { cleanForEditor, cleanForSave, isoToAddDate, isoToday } from "../html";

type Props = {
  post: FullPost | null;
  categories: string[];
  busy: boolean;
  onSave: (input: PostInput, publish: boolean) => Promise<void>;
  onDelete: () => void;
  onBack: () => void;
  onUploadImage: (file: File) => Promise<string>;
  toast: (msg: string, kind?: "ok" | "error") => void;
};

export function EditorView({
  post, categories, busy,
  onSave, onDelete, onBack, onUploadImage, toast,
}: Props) {
  const wantCat = post?.meta?.category || categories[0] || "한의원 story";
  const catOptions = useMemo(() => {
    const c = categories.slice();
    if (wantCat && !c.includes(wantCat)) c.push(wantCat);
    return c;
  }, [categories, wantCat]);

  const [title, setTitle]       = useState(post?.title || "");
  const [category, setCategory] = useState(wantCat);
  const [date, setDate]         = useState(post?.meta?.date || isoToday());
  const [bodyHtml, setBodyHtml] = useState(cleanForEditor(post?.body || "<p></p>"));
  const [dirty, setDirty]       = useState(false);
  const [saved, setSaved]       = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const markDirty = () => { setDirty(true); setSaved(false); };

  // 네이버에서 가져온 글 — 편집기로 본문을 다시 저장하면 링크·뉴스카드가 손실될 수 있음
  const isImported = post?.body_kind === "html";

  const submit = async (publish: boolean) => {
    if (!title.trim()) { toast("제목을 입력하세요", "error"); return; }
    if (isImported && dirty && !window.confirm(
      "이 글은 네이버에서 가져온 글입니다.\n본문을 다시 저장하면 일부 링크·뉴스카드가 사라질 수 있어요.\n제목·카테고리·발행일만 바꾸려면 본문은 건드리지 마세요.\n\n그래도 저장할까요?"
    )) return;
    const input: PostInput = {
      title: title.trim(),
      addDate: isoToAddDate(date),
      category,
      body: cleanForSave(bodyHtml),
    };
    await onSave(input, publish);
    setDirty(false);
    setSaved(true);
  };

  return (
    <div className="ev-wrap">
      {/* 상단 바 */}
      <div className="ev-bar">
        <div className="ev-bar-left">
          <button className="ghost" onClick={onBack} style={{ paddingLeft: 2, color: "var(--ink-500)" }}>
            ← 목록
          </button>
          <span style={{ color: "var(--ink-300)", fontSize: 12, padding: "0 4px" }}>|</span>
          <span style={{ fontSize: 12, color: "var(--ink-400)" }}>
            {post ? `편집 중 · #${post.logNo}` : "새 글 작성"}
          </span>
          {post?.logNo && (
            <a
              href={`https://isuclinic.co.kr/${post.logNo}/`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12, color: "var(--ink-400)",
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3,
                padding: "3px 8px", borderRadius: 5, border: "1px solid var(--ink-200)",
                background: "var(--white)",
              }}
              title="발행된 글을 사이트에서 확인"
            >
              ↗ 사이트에서 보기
            </a>
          )}
          {saved && <span className="ev-save-hint saved">저장됨</span>}
          {dirty && !saved && <span className="ev-save-hint dirty">저장 필요</span>}
        </div>
        <div className="ev-bar-right">
          <button
            onClick={() => setShowPreview(v => !v)}
            style={{
              fontSize: 12.5, gap: 6,
              color: showPreview ? "var(--accent)" : "var(--ink-500)",
              background: showPreview ? "var(--accent-light)" : "var(--white)",
              borderColor: showPreview ? "var(--accent-border)" : "var(--ink-200)",
            }}
            title={showPreview ? "미리보기 닫기" : "미리보기 열기"}
          >
            {/* 분할 패널 아이콘 */}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1" y="1" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="8" y1="1" x2="8" y2="14" stroke="currentColor" strokeWidth="1.4"/>
              {showPreview
                ? <path d="M10.5 5.5L12 7.5L10.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M11 5.5L9.5 7.5L11 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
            {showPreview ? "미리보기 닫기" : "미리보기"}
          </button>
          <div style={{ width: 1, height: 16, background: "var(--ink-200)", margin: "0 8px" }} />
          {post && (
            <button className="danger" onClick={onDelete} disabled={busy} style={{ fontSize: 12.5 }}>
              삭제
            </button>
          )}
          <button onClick={() => submit(false)} disabled={busy} style={{ fontSize: 12.5 }}>
            임시 저장
          </button>
          <button className="herb" onClick={() => submit(true)} disabled={busy} style={{ fontSize: 12.5, padding: "6px 16px" }}>
            발행하기
          </button>
        </div>
      </div>

      {isImported && (
        <div className="ev-import-warn">
          네이버에서 가져온 글이에요. 제목·카테고리·발행일은 자유롭게 바꿔도 되지만,
          본문을 직접 고쳐 저장하면 일부 링크·뉴스카드가 사라질 수 있습니다.
          사진 교체는 상단 [페이지 편집]에서 글을 열어 사진을 클릭하면 안전하게 됩니다.
        </div>
      )}

      {/* 본문 */}
      <div className="ev-body">
        <div className={"ev-split" + (showPreview ? " on" : "")}>
          {/* 편집 폼 */}
          <div className="ev-form">
            {/* 제목 */}
            <div className="ev-form-top">
              <input
                className="ev-title-input"
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                autoFocus
                onChange={(e) => { setTitle(e.target.value); markDirty(); }}
              />
            </div>

            {/* 메타 */}
            <div className="ev-form-meta">
              <div className="ev-grid2">
                <div>
                  <span className="ev-label">카테고리</span>
                  <CustomSelect
                    value={category}
                    options={catOptions}
                    onChange={(v) => { setCategory(v); markDirty(); }}
                  />
                </div>
                <div>
                  <span className="ev-label">발행일</span>
                  <DatePicker
                    value={date}
                    onChange={(v) => { setDate(v); markDirty(); }}
                  />
                </div>
              </div>
            </div>

            {/* 리치 에디터 */}
            <RichEditor
              initialHtml={bodyHtml}
              onChange={(html) => { setBodyHtml(html); markDirty(); }}
              onUploadImage={onUploadImage}
              toast={toast}
            />
          </div>

          {/* 미리보기 */}
          {showPreview && (
            <PreviewPane
              title={title}
              category={category}
              dateLabel={isoToAddDate(date)}
              bodyHtml={bodyHtml}
            />
          )}
        </div>
      </div>
    </div>
  );
}
