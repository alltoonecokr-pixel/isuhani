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
import { SettingsModal } from "./components/SettingsModal";
import { CategoriesModal } from "./components/CategoriesModal";
import { GuideModal } from "./components/GuideModal";
import {
  DeployProgress,
  initialDeploy,
  type DeployState,
} from "./components/DeployProgress";

const PHASE_PCT: Record<string, number> = {
  SUBMITTED: 12,
  QUEUED: 20,
  PROVISIONING: 30,
  DOWNLOAD_SOURCE: 40,
  INSTALL: 55,
  PRE_BUILD: 65,
  BUILD: 80,
  POST_BUILD: 92,
  COMPLETED: 100,
};
const FAIL = new Set(["FAILED", "STOPPED", "FAULT", "TIMED_OUT"]);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type View = "list" | "editor";

export function App() {
  const [cfg, setCfg] = useState<Config>(() => loadConfig());
  const apiRef = useRef<CmsApi>(new CmsApi(cfg));

  const [status, setStatus] = useState<{ kind: StatusKind; text: string }>({
    kind: "",
    text: "연결 중…",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [posts, setPosts] = useState<PostIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [view, setView] = useState<View>("list");
  const [editingPost, setEditingPost] = useState<FullPost | null>(null);
  const [editorKey, setEditorKey] = useState(0); // 새 글/수정 전환 시 폼 리셋

  const [settings, setSettings] = useState<{ open: boolean; force: boolean }>({
    open: false,
    force: false,
  });
  const [catsOpen, setCatsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [deploy, setDeploy] = useState<DeployState>(initialDeploy);

  // ── toast ──────────────────────────────────────────────────────────────────
  const [toastState, setToastState] = useState<{ msg: string; kind: string; show: boolean }>({
    msg: "",
    kind: "",
    show: false,
  });
  const toastTimer = useRef<number | undefined>(undefined);
  const toast = useCallback((msg: string, kind: "ok" | "error" = "ok") => {
    setToastState({ msg, kind: kind === "error" ? "error" : "", show: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(
      () => setToastState((s) => ({ ...s, show: false })),
      2400,
    );
  }, []);

  // ── api 401 → 로그인 재노출 ──────────────────────────────────────────────────
  useEffect(() => {
    apiRef.current.onUnauthorized = () => {
      setCfg((c) => ({ ...c, pass: "" }));
      setSettings({ open: true, force: true });
      setStatus({ kind: "error", text: "다시 로그인해 주세요" });
    };
  }, []);

  // ── boot ─────────────────────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setStatus({ kind: "busy", text: "불러오는 중…" });
    const data = await apiRef.current.listPosts();
    setPosts(data.posts || []);
    setStatus({ kind: "ok", text: `총 ${(data.posts || []).length}개` });
  }, []);

  const boot = useCallback(async () => {
    const api = apiRef.current;
    if (!api.cfg.pass) {
      setSettings({ open: true, force: true });
      setLoading(false);
      return;
    }
    setStatus({ kind: "", text: "확인 중…" });
    setLoading(true);
    try {
      await api.ping();
      const cats = await api.getCategories();
      setCategories(cats.categories?.length ? cats.categories : DEFAULT_CATEGORIES);
      await loadPosts();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "연결 실패";
      setStatus({ kind: "error", text: "연결 실패: " + msg });
      if (!(e instanceof ApiError && e.status === 401)) toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [loadPosts, toast]);

  useEffect(() => {
    void boot();
    // 최초 1회
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 설정 저장(로그인) ────────────────────────────────────────────────────────
  const submitSettings = (next: Config) => {
    saveConfig(next);
    apiRef.current.cfg = next;
    setCfg(next);
    setSettings({ open: false, force: false });
    void boot();
  };

  // ── 에디터 진입 ──────────────────────────────────────────────────────────────
  const openNew = async () => {
    if (categories.length === 0) {
      try {
        const cats = await apiRef.current.getCategories();
        setCategories(cats.categories?.length ? cats.categories : DEFAULT_CATEGORIES);
      } catch {
        toast("카테고리를 불러오지 못했습니다. [설정]을 확인하세요", "error");
        return;
      }
    }
    setEditingPost(null);
    setEditorKey((k) => k + 1);
    setView("editor");
  };

  const openEdit = async (logNo: string) => {
    try {
      const post = await apiRef.current.getPost(logNo);
      setEditingPost(post);
      setEditorKey((k) => k + 1);
      setView("editor");
    } catch (e) {
      toast(e instanceof Error ? e.message : "불러오기 실패", "error");
    }
  };

  // ── 저장 / 발행 ──────────────────────────────────────────────────────────────
  const handleSave = async (input: PostInput, publish: boolean) => {
    setBusy(true);
    try {
      let saved: FullPost;
      if (editingPost?.logNo) {
        saved = await apiRef.current.updatePost(editingPost.logNo, input);
      } else {
        saved = await apiRef.current.createPost(input);
      }
      if (saved?.logNo) setEditingPost((p) => p ?? saved);
      if (publish) {
        toast("발행 시작 — 사이트 반영까지 약 2~3분");
        void runDeploy();
      } else {
        toast("저장되었습니다 (사이트엔 아직 반영 안 됨)");
      }
      await loadPosts();
      if (publish) setView("list");
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
      setView("list");
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

  // 일괄 삭제 — 확인은 ListView에서, 여기선 순차 삭제 후 한 번만 새로고침.
  const bulkDelete = async (logNos: string[]) => {
    let ok = 0;
    for (const logNo of logNos) {
      try {
        await apiRef.current.deletePost(logNo);
        ok++;
      } catch {
        /* 개별 실패는 건너뛰고 계속 */
      }
    }
    await loadPosts();
    const failed = logNos.length - ok;
    toast(
      failed === 0
        ? `${ok}개 삭제 완료`
        : `${ok}개 삭제 · ${failed}개 실패`,
      failed === 0 ? "ok" : "error",
    );
  };

  // ── 배포 진행 폴링 ────────────────────────────────────────────────────────────
  const runDeploy = async () => {
    setDeploy({ open: true, title: "발행 중…", step: "빌드 시작", pct: 10 });
    try {
      const res = await apiRef.current.deploy();
      if (!res.buildId) throw new Error("buildId 없음");
      for (let n = 0; n < 60; n++) {
        await sleep(5000);
        const s = await apiRef.current.buildStatus(res.buildId);
        const pct = PHASE_PCT[s.currentPhase || ""] || 50;
        setDeploy({
          open: true,
          title: "발행 중…",
          step: `${s.currentPhase || s.status} (${s.status})`,
          pct,
        });
        if (s.status === "SUCCEEDED") {
          setDeploy({
            open: true,
            title: "발행 완료",
            step: "사이트가 갱신되었습니다",
            pct: 100,
          });
          setTimeout(() => setDeploy((d) => ({ ...d, open: false })), 4000);
          return;
        }
        if (FAIL.has(s.status)) {
          setDeploy((d) => ({ ...d, title: "발행 실패", step: s.status }));
          return;
        }
      }
      setDeploy((d) => ({ ...d, step: "타임아웃 — CodeBuild 콘솔에서 확인" }));
    } catch (e) {
      setDeploy((d) => ({
        ...d,
        title: "발행 실패",
        step: e instanceof Error ? e.message : "오류",
      }));
    }
  };

  // ── 카테고리 저장 ─────────────────────────────────────────────────────────────
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
          건강 저널 관리
          <small>이수한의원</small>
        </div>
        <div className="top-actions">
          <span className="top-status">
            <span className={"dot " + status.kind} />
            {status.text}
          </span>
          <button className="ghost" onClick={() => setGuideOpen(true)} title="사용 설명서">
            안내
          </button>
          <button
            className="ghost"
            title="카테고리 관리"
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
          <button
            className="ghost"
            title="API 설정"
            onClick={() => setSettings({ open: true, force: false })}
          >
            설정
          </button>
        </div>
      </header>

      {view === "list" ? (
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
          onBack={() => setView("list")}
          onUploadImage={onUploadImage}
          toast={toast}
        />
      )}

      {settings.open && (
        <SettingsModal
          cfg={cfg}
          force={settings.force}
          onSubmit={submitSettings}
          onClose={() => setSettings({ open: false, force: false })}
          onGuide={() => setGuideOpen(true)}
        />
      )}
      {catsOpen && (
        <CategoriesModal
          categories={categories}
          onSave={saveCats}
          onClose={() => setCatsOpen(false)}
        />
      )}
      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}

      <DeployProgress state={deploy} />

      <div className={["toast", toastState.show ? "show" : "", toastState.kind].filter(Boolean).join(" ")}>
        {toastState.msg}
      </div>
    </div>
  );
}
