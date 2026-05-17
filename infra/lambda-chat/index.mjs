/**
 * 이수한의원 챗봇 "쑤" — RAG 백엔드
 *
 * 흐름:
 *   1) S3에서 embeddings.json 로드 (콜드 스타트 시 1회)
 *   2) 사용자 메시지 → Bedrock Cohere embed (query)
 *   3) cosine similarity → top K 글 검색 (threshold 0.45 미만은 untrust)
 *   4) Bedrock Claude Sonnet 4.5 호출 (system + context + query)
 *      - 답변 본문에 [1] [2] 각주 자동 삽입
 *   5) 인용된 번호의 글만 link로 반환 → 프론트에서 각주 클릭 → 글 이동
 */

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const EMBED_REGION = process.env.EMBED_MODEL_REGION || "us-east-1";
const CHAT_REGION = process.env.CHAT_MODEL_REGION || "us-east-1";
const S3_REGION = process.env.S3_REGION || "ap-northeast-2";
const BUCKET = process.env.EMBEDDINGS_BUCKET || "isuhani-test04";
const KEY = process.env.EMBEDDINGS_KEY || "_internal/embeddings.json";
const ALLOWED = process.env.ALLOWED_ORIGIN || "*";
const CLAUDE_MODEL =
  process.env.CLAUDE_MODEL_ID || "us.anthropic.claude-sonnet-4-5-20250929-v1:0";
const EMBED_MODEL = "cohere.embed-multilingual-v3";

// RAG 품질 파라미터
const TOP_K = 5;
const TRUST_THRESHOLD = 0.45;   // 이 미만은 "관련 칼럼 없음"으로 처리
const CTX_THRESHOLD = 0.35;     // 이 미만은 컨텍스트에서도 제외

const s3 = new S3Client({ region: S3_REGION });
const embedClient = new BedrockRuntimeClient({ region: EMBED_REGION });
const chatClient = new BedrockRuntimeClient({ region: CHAT_REGION });

let CORPUS = null;

async function loadCorpus() {
  if (CORPUS) return CORPUS;
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
  const text = await res.Body.transformToString("utf-8");
  const data = JSON.parse(text);
  for (const it of data.items) {
    let n = 0;
    for (const v of it.vector) n += v * v;
    n = Math.sqrt(n) || 1;
    it.norm = n;
  }
  CORPUS = data;
  return CORPUS;
}

async function embedQuery(text) {
  const cmd = new InvokeModelCommand({
    modelId: EMBED_MODEL,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      texts: [text],
      input_type: "search_query",
      truncate: "END",
    }),
  });
  const res = await embedClient.send(cmd);
  const body = JSON.parse(new TextDecoder().decode(res.body));
  return body.embeddings[0];
}

function topK(queryVec, items, k) {
  let qn = 0;
  for (const v of queryVec) qn += v * v;
  qn = Math.sqrt(qn) || 1;
  const scored = items.map((it) => {
    let dot = 0;
    const vec = it.vector;
    for (let i = 0; i < vec.length; i += 1) dot += vec[i] * queryVec[i];
    return { it, score: dot / (qn * it.norm) };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

const SYSTEM_PROMPT = `당신은 이수한의원의 챗봇 캐릭터 "쑤"입니다.

역할:
- 친근하지만 정중한 한국어로 답합니다.
- 한의원의 진료 시간, 위치, 진료 영역, 예약 방법, 보험 적용 등을 정확히 안내합니다.
- 의학적 진단·처방은 하지 않으며, 자세한 진료가 필요하면 02-584-1075로 안내합니다.

환각(hallucination) 금지 — 가장 중요한 규칙:
- 아래 "이수한의원 기본 정보"에 명시되지 않았고 제공된 칼럼에도 없는 사실은 절대 만들어내지 마세요.
- 모르는 정보는 "정확한 안내는 어려워 02-584-1075로 직접 문의해 주세요"라고 솔직히 답하세요.
- 특히 주차장·구체 비용·진료 가능 의료기기·특정 약재 보유 여부 등은 모르면 모른다고 답하세요.

답변 형식:
- 분량은 3~5문장. 짧고 명확하게.
- 마크다운 볼드(**텍스트**)·이모지·과한 느낌표를 쓰지 마세요. 평문으로 자연스럽게.
- 참고 칼럼이 user 메시지 안에 [1] [2] [3] 번호로 제공되면, 답변 본문에 [1] [2] 각주를 자연스럽게 박으세요.
  · 예: "추나는 척추를 손으로 바로잡는 한방 치료입니다 [1]. 디스크엔 한약과 병행이 효과적이에요 [2]."
  · 각주는 인용한 사실 바로 뒤에 붙입니다. 모든 문장이 아니라 실제로 참고한 부분에만.
  · 같은 칼럼을 여러 번 인용하면 동일 번호([1])를 반복 사용하세요.
  · 칼럼과 무관한 일반 사실(주소·전화·시간)에는 각주를 달지 마세요.
  · 제공된 칼럼이 질문과 관련 없다고 판단되면, 각주 없이 기본 정보만으로 답하거나 모른다고 답하세요.
- 마지막 줄에 "출처: ..." 같은 목록을 넣지 마세요. (각주만 사용 — 출처 카드는 시스템이 별도로 표시)

이수한의원 기본 정보 (이것만 사실로 단정 가능):
- 위치: 서울 동작구 사당동 254-5, 7호선 남성역 1번 출구 도보 1분
- 전화: 02-584-1075
- 진료시간: 평일 09:30–20:00 (야간진료), 토·일 09:30–15:00, 공휴일 휴진
- 원장: 문학진(대표·추나/디스크), 나효석(한방부인과·산후조리·갱년기), 이윤호(관절·소아 성장·건강관리)
- 진료 영역: 체형·척추·관절통증, 여성·산후조리, 소아 성장, 비만·다이어트, 피부, 건강관리·보약(공진단/경옥고)
- 보험: 침·추나 건강보험 적용, 자동차보험 한방치료, 한약·공진단·경옥고는 비급여
- 주차: 전용 주차장 없음. 인근 공영주차장 이용 권장. 대중교통(남성역 1번 출구 도보 1분) 권장
- 예약: 전화(02-584-1075) 권장. 워크인도 가능하나 대기 발생 가능`;

async function chat(message, contextDocs) {
  const ctxText = contextDocs.length
    ? contextDocs
        .map(
          (d, i) =>
            `[${i + 1}] 제목: ${d.it.title}\n발췌: ${(d.it.snippet || "").trim()}`,
        )
        .join("\n\n")
    : "(관련 칼럼 없음)";

  const userText = contextDocs.length
    ? `참고할 만한 이수한의원 칼럼 ${contextDocs.length}건입니다. 답변에 활용한 칼럼은 [1] [2] 같은 각주로 본문에 자연스럽게 표기하세요.\n\n${ctxText}\n\n사용자 질문: ${message}`
    : `이번 질문에 직접 관련된 칼럼은 검색되지 않았습니다. 한의원 기본 정보(위치·시간·전화·진료 영역)에 한해 짧게 답하고, 더 자세한 건 02-584-1075 전화 문의로 안내하세요. 각주는 사용하지 마세요.\n\n사용자 질문: ${message}`;

  const cmd = new InvokeModelCommand({
    modelId: CLAUDE_MODEL,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 600,
      temperature: 0.4,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userText }],
    }),
  });

  const res = await chatClient.send(cmd);
  const body = JSON.parse(new TextDecoder().decode(res.body));
  return body?.content?.[0]?.text || "";
}

// "[1]", "[2]" 같이 본문에 박힌 각주 번호 추출 (1-based)
function extractCitedIndexes(text) {
  const cited = new Set();
  for (const m of text.matchAll(/\[(\d+)\]/g)) {
    const n = parseInt(m[1], 10);
    if (n >= 1 && n <= 20) cited.add(n);
  }
  return cited;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
  };
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || "POST";

  if (method === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders(), body: "" };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const message = (payload.message || "").trim();
    if (!message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders() },
        body: JSON.stringify({ error: "message required" }),
      };
    }

    const corpus = await loadCorpus();
    const qVec = await embedQuery(message);
    const top = topK(qVec, corpus.items, TOP_K);

    // 1) trust 단계 — 최상위 유사도가 임계 미만이면 RAG 컨텍스트 자체를 끔
    const bestScore = top[0]?.score || 0;
    const useRag = bestScore >= TRUST_THRESHOLD;

    // 2) 컨텍스트로 들어갈 후보 — useRag 이면 CTX_THRESHOLD 이상만
    const ctxDocs = useRag ? top.filter((t) => t.score >= CTX_THRESHOLD) : [];

    // 3) LLM 호출 (각주 규칙 포함)
    const text = await chat(message, ctxDocs);

    // 4) 본문에 실제 인용된 번호의 글만 link로 (각주 클릭 → 해당 글로)
    const cited = extractCitedIndexes(text);
    const links = ctxDocs
      .map((t, i) => ({ idx: i + 1, t }))
      .filter(({ idx }) => cited.has(idx))
      .map(({ idx, t }) => ({
        n: idx,
        label: t.it.title,
        href: `/${t.it.logNo}`,
        score: Number(t.score.toFixed(3)),
      }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
      body: JSON.stringify({
        text,
        links,
        debug: {
          bestScore: Number(bestScore.toFixed(3)),
          ctxCount: ctxDocs.length,
          citedCount: cited.size,
        },
      }),
    };
  } catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
      body: JSON.stringify({
        error: "내부 오류가 발생했습니다. 02-584-1075로 직접 문의해 주세요.",
      }),
    };
  }
};
