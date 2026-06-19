// CMS API 데이터 모델 — Lambda(admin/backend/lambda/index.mjs) 계약과 1:1.

/** GET /api/posts → { posts: PostIndexEntry[] } (index.json 카탈로그) */
export type PostIndexEntry = {
  logNo: string;
  title: string;
  addDate: string; // "2025. 7. 21." 형태
  date: string; // ISO "2025-07-21"
  category: string;
  thumbnail: string | null;
  isCms?: boolean;
};

/** GET /api/posts/:logNo → 단일 글 전체 */
export type FullPost = {
  logNo: string;
  title: string;
  addDate: string;
  body: string; // 사이트 표시 HTML
  body_kind?: string;
  blocks?: unknown[];
  images?: string[];
  meta?: {
    category?: string;
    date?: string; // ISO
    ogDesc?: string | null;
    ogImage?: string | null;
  };
};

/** POST/PUT /api/posts 입력 (일체형 HTML 에디터) */
export type PostInput = {
  title: string;
  addDate: string;
  category: string;
  body: string;
};

export type BuildStatus = {
  buildId?: string;
  status: string; // SUCCEEDED | FAILED | IN_PROGRESS | ...
  currentPhase?: string;
};

export type Config = {
  url: string;
  user: string;
  pass: string;
};

export type StatusKind = "ok" | "error" | "busy" | "";
