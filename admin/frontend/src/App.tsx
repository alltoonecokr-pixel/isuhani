import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  CmsApi,
  DEFAULT_CATEGORIES,
  loadConfig,
  saveConfig,
  uploadFile,
} from "./api";
import type { Config, FullPost, PostIndexEntry, PostInput, StatusKind } from "./types";
import { ListView } from "./components/ListView";
import { EditorView } from "./components/EditorView";
import { InlinePageEditor, type ChangesByPage } from "./components/pages/InlinePageEditor";
import { SettingsModal } from "./components/SettingsModal";
import { CategoriesModal } from "./components/CategoriesModal";
import { GuideModal } from "./components/GuideModal";
import {
  DeployProgress,
  initialDeploy,
  type DeployState,
} from "./components/DeployProgress";
import { SyncModal, initialSync, type SyncState } from "./components/SyncModal";

const PHASE_PCT: Record<string, number> = {
  SUBMITTED: 12, QUEUED: 20, PROVISIONING: 30, DOWNLOAD_SOURCE: 40,
  INSTALL: 55, PRE_BUILD: 65, BUILD: 80, POST_BUILD: 92, COMPLETED: 100,
};
const FAIL = new Set(["FAILED", "STOPPED", "FAULT", "TIMED_OUT"]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type View = "list" | "editor";

// ── 해시 라우팅 유틸 ──────────────────────────────────────────────
// history.pushState 는 popstate 를 발생시키지 않음 → 루프 없음
// 브라우저 뒤로/앞으로 → popstate 발생 → React state 복원
function getHashInfo(): { view: View; logNo: string | null } {
  const h = window.location.hash.replace(/^#\/?/, "");
  if (h.startsWith("edit/")) return { view: "editor", logNo: h.slice(5) };
  if (h === "new") return { view: "editor", logNo: null };
  return { view: "list", logNo: null };
}
function pushHash(path: string) {
  history.pushState({ hash: path }, "", path ? `#${path}` : location.pathname + location.search);
}
function replaceHash(path: string) {
  history.replaceState({ hash: path }, "", path ? `#${path}` : location.pathname + location.search);
}

export function App() {
  const [cfg, setCfg] = useState<Config>(() => loadConfig());
  const apiRef = useRef<CmsApi>(new CmsApi(cfg));

  const [status, setStatus] = useState<{ kind: StatusKind; text: string }>({ kind: "", text: "연결 중…" });
  const [categories, setCategories] = useState<string[]>([]);
  const [posts, setPosts] = useState<PostIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [view, setView] = useState<View>("list");
  const [editingPost, setEditingPost] = useState<FullPost | null>(null);
  const [editorKey, setEditorKey] = useState(0);

  const [syncing, setSyncing] = useState(false);
  const [sync, setSync] = useState<SyncState>(initialSync);

  // 상단 모드: 글 관리 vs 페이지 편집. 진료영역 콘텐츠는 API에서 로드, 없으면 시드.
  const [section, setSection] = useState<"journal" | "pages">("journal");
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const [settings, setSettings] = useState<{ open: boolean; force: boolean }>({ open: false, force: false });
  const [catsOpen, setCatsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [deploy, setDeploy] = useState<DeployState>(initialDeploy);

  // ── toast ───────────────────────────────────────────────────────
  const [toastState, setToastState] = useState<{ msg: string; kind: string; show: boolean }>({ msg: "", kind: "", show: false });
  const toastTimer = useRef<number | undefined>(undefined);
  const toast = useCallback((msg: string, kind: "ok" | "error" = "ok") => {
    setToastState({ msg, kind: kind === "error" ? "error" : "", show: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastState((s) => ({ ...s, show: false })), 2400);
  }, []);

  // ── api 401 ─────────────────────────────────────────────────────
  useEffect(() => {
    apiRef.current.onUnauthorized = () => {
      setCfg((c) => ({ ...c, pass: "" }));
      setSettings({ open: true, force: true });
      setStatus({ kind: "error", text: "다시 로그인해 주세요" });
    };
  }, []);

  // ── boot ────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setStatus({ kind: "busy", text: "불러오는 중…" });
    const data = await apiRef.current.listPosts();
    setPosts(data.posts || []);
    setStatus({ kind: "ok", text: `총 ${(data.posts || []).length}개` });
  }, []);

  const boot = useCallback(async () => {
    const api = apiRef.current;
    if (!api.cfg.pass) { setSettings({ open: true, force: true }); setLoading(false); return; }
    setStatus({ kind: "", text: "확인 중…" });
    setLoading(true);
    try {
      await api.ping();
      const cats = await api.getCategories();
      setCategories(cats.categories?.length ? cats.categories : DEFAULT_CATEGORIES);
      await loadPosts();
      // 처음 접속하면 설명서 자동 표시 (한 번 본 뒤로는 [설명서] 버튼으로 다시 열 수 있음)
      if (!localStorage.getItem("isuhani_guide_seen")) setGuideOpen(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "연결 실패";
      setStatus({ kind: "error", text: "연결 실패: " + msg });
      if (!(e instanceof ApiError && e.status === 401)) toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [loadPosts, toast]);

  useEffect(() => { void boot(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // ── 설정 ────────────────────────────────────────────────────────
  const submitSettings = (next: Config) => {
    saveConfig(next);
    apiRef.current.cfg = next;
    setCfg(next);
    setSettings({ open: false, force: false });
    void boot();
  };

  // ── 목록으로 ─────────────────────────────────────────────────────
  const goToList = useCallback(() => {
    setView("list");
    setEditingPost(null);
    pushHash("");
  }, []);

  // ── 에디터 진입 ──────────────────────────────────────────────────
  const openNew = useCallback(async () => {
    if (categories.length === 0) {
      try {
        const cats = await apiRef.current.getCategories();
        setCategories(cats.categories?.length ? cats.categories : DEFAULT_CATEGORIES);
      } catch {
        toast("카테고리를 불러오지 못했습니다", "error"); return;
      }
    }
    setEditingPost(null);
    setEditorKey((k) => k + 1);
    setView("editor");
    pushHash("new");
  }, [categories, toast]);

  const openEdit = useCallback(async (logNo: string) => {
    try {
      const post = await apiRef.current.getPost(logNo);
      setEditingPost(post);
      setEditorKey((k) => k + 1);
      setView("editor");
      pushHash(`edit/${logNo}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "불러오기 실패", "error");
    }
  }, [toast]);

  // ── 브라우저 뒤로/앞으로 (popstate) ─────────────────────────────
  useEffect(() => {
    replaceHash(""); // 최초 진입 시 히스토리 엔트리 확보

    const onPop = async () => {
      const { view: v, logNo } = getHashInfo();
      if (v === "list") {
        setView("list");
        setEditingPost(null);
      } else if (v === "editor" && logNo) {
        try {
          const post = await apiRef.current.getPost(logNo);
          setEditingPost(post);
          setEditorKey((k) => k + 1);
          setView("editor");
        } catch {
          // 포스트 로드 실패 → 목록으로
          setView("list");
          setEditingPost(null);
          replaceHash("");
        }
      } else {
        // #new → 새 글 에디터 (카테고리는 이미 로드됐을 것)
        setEditingPost(null);
        setEditorKey((k) => k + 1);
        setView("editor");
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 저장 / 발행 ──────────────────────────────────────────────────
  const handleSave = async (input: PostInput, publish: boolean) => {
    setBusy(true);
    try {
      let saved: FullPost;
      if (editingPost?.logNo) {
        saved = await apiRef.current.updatePost(editingPost.logNo, input);
      } else {
        saved = await apiRef.current.createPost(input);
      }
      if (saved?.logNo) {
        setEditingPost((p) => p ?? saved);
        // 새 글이었으면 해시를 edit/xxx 로 교체 (뒤로가기 시 list로 가도록)
        if (!editingPost?.logNo) {
          replaceHash(`edit/${saved.logNo}`);
        }
      }
      if (publish) {
        toast("발행 시작 — 사이트 반영까지 약 2~3분");
        void runDeploy();
        await loadPosts();
        goToList();
      } else {
        toast("임시 저장되었습니다");
        await loadPosts();
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "저장 실패", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    const logNo = editingPost?.logNo;
    if (!logNo) return;
    if (!window.confirm("이 글을 삭제할까요? 되돌릴 수 없습니다.")) return;
    try {
      await apiRef.current.deletePost(logNo);
      toast("삭제되었습니다");
      await loadPosts();
      goToList();
    } catch (e) {
      toast(e instanceof Error ? e.message : "삭제 실패", "error");
    }
  };

  const deleteFromList = async (logNo: string) => {
    if (!window.confirm("이 글을 삭제할까요? 되돌릴 수 없습니다.")) return;
    try {
      await apiRef.current.deletePost(logNo);
      toast("삭제되었습니다");
      await loadPosts();
    } catch (e) {
      toast(e instanceof Error ? e.message : "삭제 실패", "error");
    }
  };

  const bulkDelete = async (logNos: string[]) => {
    let ok = 0;
    for (const logNo of logNos) {
      try { await apiRef.current.deletePost(logNo); ok++; } catch { /* skip */ }
    }
    await loadPosts();
    const failed = logNos.length - ok;
    toast(failed === 0 ? `${ok}개 삭제 완료` : `${ok}개 삭제 · ${failed}개 실패`, failed === 0 ? "ok" : "error");
  };

  // ── 배포 ─────────────────────────────────────────────────────────
  const runDeploy = async () => {
    setDeploy({ open: true, title: "발행 중…", step: "빌드 시작", pct: 10 });
    try {
      const res = await apiRef.current.deploy();
      if (!res.buildId) throw new Error("buildId 없음");
      for (let n = 0; n < 60; n++) {
        await sleep(5000);
        const s = await apiRef.current.buildStatus(res.buildId);
        const pct = PHASE_PCT[s.currentPhase || ""] || 50;
        setDeploy({ open: true, title: "발행 중…", step: `${s.currentPhase || s.status} (${s.status})`, pct });
        if (s.status === "SUCCEEDED") {
          setDeploy({ open: true, title: "발행 완료", step: "사이트가 갱신되었습니다", pct: 100 });
          setTimeout(() => setDeploy((d) => ({ ...d, open: false })), 4000);
          return;
        }
        if (FAIL.has(s.status)) { setDeploy((d) => ({ ...d, title: "발행 실패", step: s.status })); return; }
      }
      setDeploy((d) => ({ ...d, step: "타임아웃 — CodeBuild 콘솔에서 확인" }));
    } catch (e) {
      setDeploy((d) => ({ ...d, title: "발행 실패", step: e instanceof Error ? e.message : "오류" }));
    }
  };

  // ── 페이지 편집 (인라인) ─────────────────────────────────────────
  // 변경된 모든 페이지를 각각 PUT(변경분 병합). 텍스트는 클라이언트가 즉시 적용 → 빌드 불필요.
  const savePages = async (changes: ChangesByPage): Promise<boolean> => {
    const entries = Object.entries(changes).filter(([, c]) => Object.keys(c).length);
    if (!entries.length) return false;
    setBusy(true);
    try {
      for (const [slug, fields] of entries) {
        await apiRef.current.putPage(slug, fields);
      }
      toast("저장됨 · 사이트에 즉시 반영됩니다");
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : "저장 실패", "error");
      return false;
    } finally {
      setBusy(false);
    }
  };

  // ── 블로그 동기화 (네이버 새 글 가져오기 + 발행) ──────────────────
  const runSync = async () => {
    setSyncing(true);
    setSync({ open: true, phase: "running", imported: [], found: 0, newCount: 0 });
    try {
      const r = await apiRef.current.syncBlog();
      setSync({ open: true, phase: "result", imported: r.imported, found: r.found, newCount: r.new });
      if (r.imported.length > 0) {
        await loadPosts().catch(() => {});
        void runDeploy(); // 정적 SEO 페이지 생성
      }
    } catch {
      await loadPosts().catch(() => {});
      setSync({ open: true, phase: "error", imported: [], found: 0, newCount: 0 });
    } finally {
      setSyncing(false);
    }
  };

  const resetPage = async (slug: string) => {
    setBusy(true);
    try {
      await apiRef.current.resetPage(slug);
      toast("원래 디자인으로 되돌렸습니다");
    } catch (e) {
      toast(e instanceof Error ? e.message : "초기화 실패", "error");
    } finally {
      setBusy(false);
    }
  };

  const replaceImage = async (src: string, base64: string, mime: string): Promise<boolean> => {
    try {
      await apiRef.current.replaceImage(src, base64, mime);
      toast("사진을 교체했습니다");
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : "사진 교체 실패", "error");
      return false;
    }
  };

  // ── 카테고리 ─────────────────────────────────────────────────────
  const saveCats = async (cats: string[]) => {
    try {
      const res = await apiRef.current.putCategories(cats);
      setCategories(res.categories);
      toast("카테고리가 저장되었습니다");
      setCatsOpen(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "저장 실패", "error");
    }
  };

  const onUploadImage = (file: File) => uploadFile(apiRef.current, file);

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <span className="brand-icon">醫</span>
          이수한의원 관리
          <small>CMS</small>
        </div>
        <div className="top-tabs">
          <button
            className={"top-tab" + (section === "journal" ? " active" : "")}
            onClick={() => setSection("journal")}
          >
            건강 저널
          </button>
          <button
            className={"top-tab" + (section === "pages" ? " active" : "")}
            onClick={() => { setSection("pages"); setEditingSlug("home"); }}
          >
            페이지 편집
          </button>
        </div>
        <div className="top-actions">
          <span className="top-status">
            <span className={"dot " + status.kind} />
            {status.text}
          </span>
          <button className="ghost sync" onClick={runSync} disabled={syncing} title="네이버 블로그의 새 글을 가져와 사이트에 게시">
            {syncing ? "동기화 중…" : "↻ 블로그 동기화"}
          </button>
          <button className="ghost" onClick={() => setGuideOpen(true)}>설명서</button>
          <button
            className="ghost"
            onClick={async () => {
              try {
                const cats = await apiRef.current.getCategories();
                if (cats.categories) setCategories(cats.categories);
              } catch { /* 무시 */ }
              setCatsOpen(true);
            }}
          >
            카테고리
          </button>
          <button className="ghost" onClick={() => setSettings({ open: true, force: false })}>설정</button>
        </div>
      </header>

      {section === "pages" ? (
        <InlinePageEditor
          startSlug={editingSlug ?? "home"}
          busy={busy}
          onBack={() => setSection("journal")}
          onSaveAll={savePages}
          onReset={resetPage}
          onReplaceImage={replaceImage}
        />
      ) : view === "list" ? (
        <ListView
          posts={posts}
          categories={categories}
          loading={loading}
          onNew={openNew}
          onEdit={openEdit}
          onDelete={deleteFromList}
          onBulkDelete={bulkDelete}
        />
      ) : (
        <EditorView
          key={editorKey}
          post={editingPost}
          categories={categories}
          busy={busy}
          onSave={handleSave}
          onDelete={handleDelete}
          onBack={goToList}
          onUploadImage={onUploadImage}
          toast={toast}
        />
      )}

      {settings.open && (
        <SettingsModal
          cfg={cfg} force={settings.force}
          onSubmit={submitSettings}
          onClose={() => setSettings({ open: false, force: false })}
          onGuide={() => setGuideOpen(true)}
        />
      )}
      {catsOpen && <CategoriesModal categories={categories} onSave={saveCats} onClose={() => setCatsOpen(false)} />}
      {guideOpen && <GuideModal onClose={() => { setGuideOpen(false); localStorage.setItem("isuhani_guide_seen", "1"); }} />}

      <DeployProgress state={deploy} />
      <SyncModal state={sync} onClose={() => setSync((s) => ({ ...s, open: false }))} />

      <div className={["toast", toastState.show ? "show" : "", toastState.kind].filter(Boolean).join(" ")}>
        {toastState.msg}
      </div>
    </div>
  );
}
