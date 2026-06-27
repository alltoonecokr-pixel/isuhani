// 이수한의원 CMS API — 진입점 · 라우터
//
// 의존 방향: index → handlers → services → utils
// 인증(Basic Auth)과 라우팅만 여기서 처리한다.
//
// 환경변수
//   BUCKET          S3 버킷
//   BUILD_PROJECT   CodeBuild 프로젝트 이름
//   CMS_USER        Basic Auth 사용자명
//   CMS_PASSWORD    Basic Auth 비밀번호

import { handleList, handleCreate, handleUpdate, handleDelete } from "./handlers/posts.mjs";
import { handleGetPage, handlePutPage, handleDeletePage } from "./handlers/pages.mjs";
import { handleDeploy, handleBuildStatus } from "./handlers/deploy.mjs";
import { handleUpload } from "./handlers/media.mjs";
import { getPost, getCategories, putCategories } from "./services/s3.mjs";
import { respond } from "./utils/respond.mjs";

const REGION = process.env.AWS_REGION || "ap-northeast-2";
const CMS_USER = process.env.CMS_USER || "admin";
const CMS_PASSWORD = process.env.CMS_PASSWORD || "";

// ── 인증 ─────────────────────────────────────────────────────────────────────

function checkAuth(headers) {
  if (!CMS_PASSWORD) return false;
  const auth = headers["authorization"] || headers["Authorization"] || "";
  if (!auth.startsWith("Basic ")) return false;
  const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
  const [u, ...pwParts] = decoded.split(":");
  return u === CMS_USER && pwParts.join(":") === CMS_PASSWORD;
}

function unauthorized() {
  return {
    statusCode: 401,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "www-authenticate": 'Basic realm="이수한의원 CMS"',
    },
    body: JSON.stringify({ error: "인증이 필요합니다" }),
  };
}

// ── 라우터 ───────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || "GET";
  const path = event.requestContext?.http?.path || event.rawPath || "/";
  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]),
  );

  if (method === "OPTIONS") return respond(204, "");

  // 공개 엔드포인트
  if (method === "GET" && path === "/")
    return respond(200, { ok: true, service: "isuhani-cms-api", region: REGION });
  if (method === "GET" && path === "/api/categories")
    return respond(200, { categories: await getCategories() });

  // 인증 필요
  if (!checkAuth(headers)) return unauthorized();

  try {
    let body = {};
    if (event.body) {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    }

    // 글 목록
    if (method === "GET" && path === "/api/posts")
      return respond(200, await handleList());

    // 글 단건
    const single = path.match(/^\/api\/posts\/([^/]+)$/);
    if (single) {
      const logNo = single[1];
      if (method === "GET") {
        const p = await getPost(logNo);
        if (!p) return respond(404, { error: "not found" });
        return respond(200, p);
      }
      if (method === "PUT") {
        const updated = await handleUpdate(logNo, body);
        if (!updated) return respond(404, { error: "not found" });
        return respond(200, updated);
      }
      if (method === "DELETE") {
        const deleted = await handleDelete(logNo);
        if (!deleted) return respond(404, { error: "not found" });
        return respond(200, { ok: true });
      }
    }

    // 편집 가능 페이지 (진료영역 등)
    const pageSingle = path.match(/^\/api\/pages\/([^/]+)$/);
    if (pageSingle) {
      const slug = pageSingle[1];
      if (method === "GET") {
        const content = await handleGetPage(slug);
        if (content === undefined) return respond(404, { error: "not found" });
        return respond(200, { content }); // content=null → 아직 저장 전(시드 사용)
      }
      if (method === "PUT") {
        const result = await handlePutPage(slug, body);
        if (result === undefined) return respond(404, { error: "not found" });
        if (result?.error) return respond(400, result);
        return respond(200, result);
      }
      if (method === "DELETE") {
        const result = await handleDeletePage(slug);
        if (result === undefined) return respond(404, { error: "not found" });
        return respond(200, result);
      }
    }

    // 글 생성 · 미디어 · 배포
    if (method === "POST" && path === "/api/posts")
      return respond(201, await handleCreate(body));
    if (method === "POST" && path === "/api/upload")
      return respond(201, await handleUpload(body));
    if (method === "POST" && path === "/api/deploy")
      return respond(202, await handleDeploy());

    // 카테고리 수정 (인증 후)
    if (method === "PUT" && path === "/api/categories") {
      const cats = Array.isArray(body.categories) ? body.categories : null;
      if (!cats) return respond(400, { error: "categories: string[] required" });
      return respond(200, { categories: await putCategories(cats) });
    }

    // 빌드 상태
    const buildSingle = path.match(/^\/api\/builds\/([^/]+)$/);
    if (method === "GET" && buildSingle) {
      const status = await handleBuildStatus(buildSingle[1]);
      if (!status) return respond(404, { error: "build not found" });
      return respond(200, status);
    }

    return respond(404, { error: "not found", path, method });
  } catch (e) {
    console.error("[CMS]", e);
    return respond(500, { error: e.message || "server error" });
  }
};
