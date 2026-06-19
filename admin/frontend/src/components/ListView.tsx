import { useEffect, useMemo, useRef, useState } from "react";
import type { PostIndexEntry } from "../types";

const PAGE_SIZE = 20;

type StatusFilter = "all" | "cms" | "imported";

type Props = {
  posts: PostIndexEntry[];
  categories: string[];
  loading: boolean;
  onNew: () => void;
  onEdit: (logNo: string) => void;
  onDelete: (logNo: string) => void;
  onBulkDelete?: (logNos: string[]) => Promise<void>;
};

// 썸네일 — 네이버 핫링크 등으로 로드 실패하면 통째로 숨겨 텍스트 줄로 떨어진다.
function Thumb({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <div className="t-thumb">
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export function ListView({
  posts,
  categories,
  loading,
  onNew,
  onEdit,
  onDelete,
  onBulkDelete,
}: Props) {
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(0);
  const [viewOpen, setViewOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const viewRef = useRef<HTMLDivElement>(null);

  // 보기 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    if (!viewOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) {
        setViewOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [viewOpen]);

  const resetPage = () => setPage(0);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (query && !p.title.toLowerCase().includes(query)) return false;
      if (cat && p.category !== cat) return false;
      if (status === "cms" && !p.isCms) return false;
      if (status === "imported" && p.isCms) return false;
      return true;
    });
  }, [posts, q, cat, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, pages - 1);
  const slice = filtered.slice(
    curPage * PAGE_SIZE,
    curPage * PAGE_SIZE + PAGE_SIZE,
  );

  const statusLabel: Record<StatusFilter, string> = {
    all: "전체",
    cms: "CMS 작성",
    imported: "네이버 이전",
  };
  const viewLabel = cat || (status !== "all" ? statusLabel[status] : "전체 보기");

  const togglePick = (logNo: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(logNo)) next.delete(logNo);
      else next.add(logNo);
      return next;
    });
  };

  const allOnPagePicked =
    slice.length > 0 && slice.every((p) => picked.has(p.logNo));

  const toggleAllOnPage = () => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (allOnPagePicked) slice.forEach((p) => next.delete(p.logNo));
      else slice.forEach((p) => next.add(p.logNo));
      return next;
    });
  };

  const exitSelect = () => {
    setSelecting(false);
    setPicked(new Set());
  };

  const runBulkDelete = async () => {
    if (picked.size === 0) return;
    if (
      !window.confirm(
        `선택한 ${picked.size}개 글을 삭제할까요? 되돌릴 수 없습니다.`,
      )
    )
      return;
    if (onBulkDelete) await onBulkDelete(Array.from(picked));
    exitSelect();
  };

  const pickView = (next: () => void) => {
    next();
    resetPage();
    setViewOpen(false);
  };

  return (
    <section>
      {/* 제목 + 글쓰기 */}
      <div className="t-head">
        <h2 className="t-head-title">
          글 관리 <span className="t-count">{posts.length}</span>
        </h2>
        <button className="t-write" onClick={onNew}>
          글쓰기 <span className="t-write-ico">✎</span>
        </button>
      </div>

      {/* 변경 · 보기 · 검색 바 */}
      <div className="t-bar">
        <div className="t-bar-left">
          {!selecting ? (
            <button className="t-bar-btn" onClick={() => setSelecting(true)}>
              변경 <span className="caret">▾</span>
            </button>
          ) : (
            <div className="t-select-actions">
              <button className="t-bar-btn" onClick={toggleAllOnPage}>
                {allOnPagePicked ? "선택 해제" : "이 페이지 전체"}
              </button>
              <span className="t-picked-count">{picked.size}개 선택</span>
              <button
                className="t-bar-btn danger"
                disabled={picked.size === 0}
                onClick={runBulkDelete}
              >
                선택 삭제
              </button>
              <button className="t-bar-btn" onClick={exitSelect}>
                취소
              </button>
            </div>
          )}
        </div>

        <div className="t-bar-right">
          <div className="t-view" ref={viewRef}>
            <button
              className="t-bar-btn"
              onClick={() => setViewOpen((v) => !v)}
            >
              보기 <span className="caret">{viewOpen ? "▴" : "▾"}</span>
            </button>
            {viewOpen && (
              <div className="t-view-panel">
                <div className="t-view-cur">{viewLabel}</div>
                <div className="t-view-sec">상태별 보기</div>
                {(["all", "cms", "imported"] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    className={
                      "t-view-item" + (status === s && !cat ? " on" : "")
                    }
                    onClick={() =>
                      pickView(() => {
                        setStatus(s);
                        setCat("");
                      })
                    }
                  >
                    {statusLabel[s]}
                  </button>
                ))}
                <div className="t-view-sec">카테고리별 보기</div>
                <button
                  className={"t-view-item" + (!cat ? " on" : "")}
                  onClick={() => pickView(() => setCat(""))}
                >
                  카테고리 전체보기
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    className={"t-view-item" + (cat === c ? " on" : "")}
                    onClick={() => pickView(() => setCat(c))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="t-bar-btn"
            onClick={() => {
              const willClose = searchOpen;
              setSearchOpen((v) => !v);
              if (willClose) {
                setQ("");
                resetPage();
              }
            }}
          >
            검색 <span className="t-search-ico">⌕</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="t-search-row">
          <input
            type="text"
            autoFocus
            placeholder="제목으로 검색"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              resetPage();
            }}
          />
        </div>
      )}

      {/* 목록 */}
      <div className="t-list">
        {loading && posts.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div className="t-skel" key={i}>
              <div className="t-skel-bar" style={{ width: "55%" }} />
              <div
                className="t-skel-bar"
                style={{ width: "30%", marginTop: 8, height: 10 }}
              />
            </div>
          ))
        ) : slice.length === 0 ? (
          <div className="t-empty">
            {q || cat || status !== "all" ? (
              <>
                <h4>해당하는 글이 없습니다</h4>
                <div>검색어나 보기 필터를 다시 확인해 주세요.</div>
              </>
            ) : (
              <>
                <h4>아직 작성된 글이 없습니다</h4>
                <div>우측 상단 [글쓰기]를 눌러 시작하세요.</div>
              </>
            )}
          </div>
        ) : (
          slice.map((p) => {
            const isPicked = picked.has(p.logNo);
            return (
              <div
                className={"t-row" + (isPicked ? " picked" : "")}
                key={p.logNo}
                onClick={() => {
                  if (selecting) togglePick(p.logNo);
                  else onEdit(p.logNo);
                }}
              >
                {selecting && (
                  <input
                    type="checkbox"
                    className="t-check"
                    checked={isPicked}
                    onChange={() => togglePick(p.logNo)}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Thumb src={p.thumbnail} />
                <div className="t-main">
                  <div className="t-title">{p.title || "(제목 없음)"}</div>
                  <div className="t-meta">
                    <span className={"t-cat" + (p.category ? "" : " none")}>
                      {p.category || "카테고리 없음"}
                    </span>
                    <span className="t-sep">·</span>
                    <span>{p.isCms ? "CMS 작성" : "네이버 이전"}</span>
                    <span className="t-sep">·</span>
                    <span>{p.addDate || p.date || ""}</span>
                  </div>
                </div>
                {!selecting && (
                  <div
                    className="t-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => onEdit(p.logNo)}>수정</button>
                    <button
                      className="danger"
                      onClick={() => onDelete(p.logNo)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="t-pager">
        <button disabled={curPage === 0} onClick={() => setPage(curPage - 1)}>
          ← 이전
        </button>
        <span>
          {curPage + 1} / {pages} · 총 {filtered.length}개
        </span>
        <button
          disabled={curPage >= pages - 1}
          onClick={() => setPage(curPage + 1)}
        >
          다음 →
        </button>
      </div>
    </section>
  );
}
