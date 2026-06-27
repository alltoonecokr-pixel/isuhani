import type {
  BuildStatus,
  Config,
  FullPost,
  PostIndexEntry,
  PostInput,
} from "./types";

// ── 환경 / 설정 ───────────────────────────────────────────────────────────────
// 운영: API Gateway 직접 호출(허용 origin = isuclinic.co.kr).
// 개발: 같은 출처 프록시(/__cms-api)로 우회 — Vite dev 서버가 서버사이드로 포워딩해
//       localhost 포트가 무엇이든 CORS에 막히지 않는다. (vite.config.ts server.proxy)
const PROD_API = "https://9q3yi60ms3.execute-api.ap-northeast-2.amazonaws.com";
export const DEFAULT_API = import.meta.env.DEV ? "/__cms-api" : PROD_API;
export const DEFAULT_USER = "admin";

export const DEFAULT_CATEGORIES = [
  "한의원 story",
  "건강관리",
  "체형 · 척추 · 관절통증",
  "소아 성장",
  "여성 · 산후조리",
  "여가 · 여행",
  "비만 · 다이어트",
];

const LS = { url: "cms_url", user: "cms_user", pass: "cms_pass" } as const;

// 옛 세션이 막힌 Lambda Function URL(.lambda-url.)을 저장해두면 글이 안 보임 →
// 그런 stale 값은 버리고 항상 최신 DEFAULT_API(API Gateway)를 사용.
function resolveApiUrl(): string {
  const saved = localStorage.getItem(LS.url);
  if (!saved || saved.indexOf(".lambda-url.") > -1 || saved !== DEFAULT_API) {
    localStorage.removeItem(LS.url);
    return DEFAULT_API;
  }
  return saved;
}

export function loadConfig(): Config {
  return {
    url: resolveApiUrl(),
    user: localStorage.getItem(LS.user) || DEFAULT_USER,
    pass: localStorage.getItem(LS.pass) || "",
  };
}

export function saveConfig(cfg: Config): void {
  localStorage.setItem(LS.url, cfg.url);
  localStorage.setItem(LS.user, cfg.user);
  localStorage.setItem(LS.pass, cfg.pass);
}

export function clearPass(): void {
  try {
    localStorage.removeItem(LS.pass);
  } catch {
    /* ignore */
  }
}

// ── 에러 타입 ─────────────────────────────────────────────────────────────────
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ── 클라이언트 ────────────────────────────────────────────────────────────────
// onUnauthorized: 401 발생 시(비번 만료/불일치) 상위에서 로그인 화면을 다시 띄우기 위한 훅.
export class CmsApi {
  cfg: Config;
  onUnauthorized?: () => void;

  constructor(cfg: Config) {
    this.cfg = cfg;
  }

  private authHeader(): string {
    return "Basic " + btoa(`${this.cfg.user}:${this.cfg.pass}`);
  }

  private async req<T>(path: string, opts: RequestInit = {}): Promise<T> {
    const r = await fetch(this.cfg.url + path, {
      ...opts,
      headers: {
        "content-type": "application/json",
        authorization: this.authHeader(),
        ...(opts.headers || {}),
      },
    });
    if (!r.ok) {
      const err = await r
        .json()
        .catch(() => ({ error: r.statusText }) as { error?: string });
      if (r.status === 401) {
        this.cfg.pass = "";
        clearPass();
        this.onUnauthorized?.();
      }
      throw new ApiError(err.error || "요청 실패", r.status);
    }
    return (await r.json()) as T;
  }

  private async pub<T>(path: string): Promise<T> {
    const r = await fetch(this.cfg.url + path);
    if (!r.ok) throw new ApiError("요청 실패", r.status);
    return (await r.json()) as T;
  }

  // 연결 확인(루트) — 공개
  ping(): Promise<unknown> {
    return this.pub("/");
  }

  getCategories(): Promise<{ categories: string[] }> {
    return this.pub("/api/categories");
  }

  putCategories(categories: string[]): Promise<{ categories: string[] }> {
    return this.req("/api/categories", {
      method: "PUT",
      body: JSON.stringify({ categories }),
    });
  }

  listPosts(): Promise<{ total: number; posts: PostIndexEntry[] }> {
    return this.req("/api/posts");
  }

  getPost(logNo: string): Promise<FullPost> {
    return this.req(`/api/posts/${logNo}`);
  }

  createPost(input: PostInput): Promise<FullPost> {
    return this.req("/api/posts", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  updatePost(logNo: string, input: PostInput): Promise<FullPost> {
    return this.req(`/api/posts/${logNo}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  }

  deletePost(logNo: string): Promise<unknown> {
    return this.req(`/api/posts/${logNo}`, { method: "DELETE" });
  }

  upload(
    filename: string,
    base64: string,
    mimeType: string,
  ): Promise<{ url: string }> {
    return this.req("/api/upload", {
      method: "POST",
      body: JSON.stringify({ filename, base64, mimeType }),
    });
  }

  // 페이지 콘텐츠 (진료영역 등 고정 섹션 페이지)
  getPage<T = unknown>(pageId: string): Promise<{ pageId: string; content: T | null }> {
    return this.req(`/api/pages/${pageId}`);
  }

  putPage<T = unknown>(pageId: string, content: T): Promise<{ pageId: string; content: T }> {
    return this.req(`/api/pages/${pageId}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    });
  }

  deploy(): Promise<{ buildId: string }> {
    return this.req("/api/deploy", { method: "POST" });
  }

  buildStatus(buildId: string): Promise<BuildStatus> {
    return this.req(`/api/builds/${encodeURIComponent(buildId)}`);
  }
}

// ── 이미지 업로드 헬퍼 (File → base64) ────────────────────────────────────────
export async function uploadFile(api: CmsApi, file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK)),
    );
  }
  const base64 = btoa(bin);
  const res = await api.upload(file.name, base64, file.type);
  return res.url;
}
