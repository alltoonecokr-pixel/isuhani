import { useEffect, useMemo, useRef, useState } from "react";
import type { PostIndexEntry } from "../types";

const PAGE_SIZE = 20;
type StatusFilter = "all" | "cms" | "imported";
type SortOrder = "newest" | "oldest";

type Props = {
  posts: PostIndexEntry[];
  categories: string[];
  loading: boolean;
  onNew: () => void;
  onEdit: (logNo: string) => void;
  onDelete: (logNo: string) => void;
  onBulkDelete?: (logNos: string[]) => Promise<void>;
};

function Thumb({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <div className="lv-thumb">
      <img src={src} alt="" referrerPolicy="no-referrer" loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
}

export function ListView({ posts, categories, loading, onNew, onEdit, onDelete, onBulkDelete }: Props) {
  const [q, setQ]               = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [status, setStatus]     = useState<StatusFilter>("all");
  const [cat, setCat]           = useState("");
  const [sort, setSort]         = useState<SortOrder>("newest");
  const [page, setPage]         = useState(0);
  const [viewOpen, setViewOpen] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked]     = useState<Set<string>>(new Set());
  const viewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(e.target as Node)) setViewOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [viewOpen]);

  const resetPage = () => setPage(0);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = posts.filter(p => {
      if (query && !p.title.toLowerCase().includes(query)) return false;
      if (cat && p.category !== cat) return false;
      if (status === "cms" && !p.isCms) return false;
      if (status === "imported" && p.isCms) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      const da = a.date || a.addDate || "";
      const db = b.date || b.addDate || "";
      return sort === "newest" ? db.localeCompare(da) : da.localeCompare(db);
    });
  }, [posts, q, cat, status, sort]);

  const pages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, pages - 1);
  const slice  = filtered.slice(curPage * PAGE_SIZE, curPage * PAGE_SIZE + PAGE_SIZE);

  const statusLabel: Record<StatusFilter, string> = { all: "전체", cms: "CMS 작성", imported: "네이버 이전" };
  const sortLabel: Record<SortOrder, string> = { newest: "최신순", oldest: "오래된순" };
  const viewLabel = [
    cat || (status !== "all" ? statusLabel[status] : "전체"),
    sortLabel[sort],
  ].join(" · ");

  const togglePick = (logNo: string) => setPicked(prev => {
    const next = new Set(prev);
    next.has(logNo) ? next.delete(logNo) : next.add(logNo);
    return next;
  });

  const allOnPagePicked = slice.length > 0 && slice.every(p => picked.has(p.logNo));
  const toggleAllOnPage = () => setPicked(prev => {
    const next = new Set(prev);
    if (allOnPagePicked) slice.forEach(p => next.delete(p.logNo));
    else slice.forEach(p => next.add(p.logNo));
    return next;
  });

  const exitSelect = () => { setSelecting(false); setPicked(new Set()); };

  const runBulkDelete = async () => {
    if (picked.size === 0) return;
    if (!window.confirm(`선택한 ${picked.size}개 글을 삭제할까요?`)) return;
    if (onBulkDelete) await onBulkDelete(Array.from(picked));
    exitSelect();
  };

  const pickView = (next: () => void, keepOpen?: boolean) => { next(); resetPage(); if (!keepOpen) setViewOpen(false); };

  return (
    <div className="lv-wrap">
      {/* 헤더 */}
      <div className="lv-head">
        <h2 className="lv-title">
          글 관리 <span className="lv-count">{posts.length}</span>
        </h2>
        <button className="primary" onClick={onNew} style={{ borderRadius: 999, padding: "8px 20px" }}>
          + 새 글
        </button>
      </div>

      {/* 툴바 */}
      <div className="lv-bar">
        <div className="lv-bar-left">
          {!selecting ? (
            <button className="lv-btn" onClick={() => setSelecting(true)}>
              선택
            </button>
          ) : (
            <div className="lv-select-bar">
              <button className="lv-btn" onClick={toggleAllOnPage}>
                {allOnPagePicked ? "전체 해제" : "이 페이지 선택"}
              </button>
              <span className="lv-picked-label">{picked.size}개 선택됨</span>
              <button className="lv-btn danger" disabled={picked.size === 0} onClick={runBulkDelete}>
                삭제
              </button>
              <button className="lv-btn" onClick={exitSelect}>
                취소
              </button>
            </div>
          )}
        </div>

        <div className="lv-bar-right">
          <div className="lv-view" ref={viewRef}>
            <button className="lv-btn" onClick={() => setViewOpen(v => !v)}>
              {viewLabel} ▾
            </button>
            {viewOpen && (
              <div className="lv-panel">
                <div className="lv-panel-sec">정렬</div>
                {(["newest", "oldest"] as SortOrder[]).map(s => (
                  <button
                    key={s}
                    className={"lv-panel-item" + (sort === s ? " on" : "")}
                    onClick={() => pickView(() => setSort(s), true)}
                  >
                    {sortLabel[s]}
                  </button>
                ))}
                <div className="lv-panel-divider" />
                <div className="lv-panel-sec">상태</div>
                {(["all", "cms", "imported"] as StatusFilter[]).map(s => (
                  <button
                    key={s}
                    className={"lv-panel-item" + (status === s && !cat ? " on" : "")}
                    onClick={() => pickView(() => { setStatus(s); setCat(""); }, true)}
                  >
                    {statusLabel[s]}
                  </button>
                ))}
                <div className="lv-panel-divider" />
                <div className="lv-panel-sec">카테고리</div>
                <button className={"lv-panel-item" + (!cat ? " on" : "")} onClick={() => pickView(() => setCat(""), true)}>
                  전체
                </button>
                {categories.map(c => (
                  <button key={c} className={"lv-panel-item" + (cat === c ? " on" : "")} onClick={() => pickView(() => setCat(c), true)}>
                    {c}
                  </button>
                ))}
                <div className="lv-panel-divider" />
                <button className="lv-panel-apply" onClick={() => setViewOpen(false)}>
                  적용
                </button>
              </div>
            )}
          </div>

          <button
            className={"lv-btn" + (searchOpen ? " active" : "")}
            onClick={() => {
              const willClose = searchOpen;
              setSearchOpen(v => !v);
              if (willClose) { setQ(""); resetPage(); }
            }}
          >
            검색
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="lv-search-row">
          <input type="text" autoFocus placeholder="제목으로 검색" value={q}
            onChange={e => { setQ(e.target.value); resetPage(); }} />
        </div>
      )}

      {/* 목록 */}
      <div className="lv-list">
        {loading && posts.length === 0 ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div className="lv-skel" key={i}>
              <div className="lv-skel-bar" style={{ width: "55%" }} />
              <div className="lv-skel-bar" style={{ width: "28%", marginTop: 8, height: 10 }} />
            </div>
          ))
        ) : slice.length === 0 ? (
          <div className="lv-empty">
            {q || cat || status !== "all" ? (
              <><h4>결과 없음</h4><div>검색어나 필터를 다시 확인해 주세요.</div></>
            ) : (
              <><h4>아직 작성된 글이 없습니다</h4><div>[새 글]을 눌러 시작하세요.</div></>
            )}
          </div>
        ) : (
          slice.map(p => {
            const isPicked = picked.has(p.logNo);
            return (
              <div
                className={"lv-row" + (isPicked ? " picked" : "")}
                key={p.logNo}
                onClick={() => selecting ? togglePick(p.logNo) : onEdit(p.logNo)}
              >
                {selecting && (
                  <input type="checkbox" className="lv-check" checked={isPicked}
                    onChange={() => togglePick(p.logNo)} onClick={e => e.stopPropagation()} />
                )}
                <Thumb src={p.thumbnail} />
                <div className="lv-main">
                  <div className="lv-item-title">{p.title || "(제목 없음)"}</div>
                  <div className="lv-meta">
                    <span className={"lv-cat" + (p.category ? "" : " none")}>
                      {p.category || "카테고리 없음"}
                    </span>
                    <span className="lv-sep">·</span>
                    <span className={"lv-badge" + (p.isCms ? " cms" : "")}>
                      {p.isCms ? "CMS" : "이전"}
                    </span>
                    <span className="lv-sep">·</span>
                    <span>{p.addDate || p.date || ""}</span>
                  </div>
                </div>
                {!selecting && (
                  <div className="lv-actions" onClick={e => e.stopPropagation()}>
                    <a
                      className="lv-site-link"
                      href={`https://isuclinic.co.kr/${p.logNo}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="사이트에서 보기"
                    >
                      ↗
                    </a>
                    <button onClick={() => onEdit(p.logNo)}>수정</button>
                    <button className="danger" onClick={() => onDelete(p.logNo)}>삭제</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="lv-pager">
        <button disabled={curPage === 0} onClick={() => setPage(curPage - 1)}>← 이전</button>
        <span>{curPage + 1} / {pages} · {filtered.length}개</span>
        <button disabled={curPage >= pages - 1} onClick={() => setPage(curPage + 1)}>다음 →</button>
      </div>
    </div>
  );
}
