/**
 * 챗봇 응답 레이어
 *
 * 현재는 키워드 매칭 기반 더미 응답.
 * 추후 AWS Bedrock(Claude) 연동 시 `sendMessage` 내부만 fetch로 교체하면 됨.
 *   POST /api/chat  →  Lambda + Bedrock InvokeModel
 *   request:  { messages: ChatMessage[] }
 *   response: { reply: string, suggestions?: string[] }
 */

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  // 답변에 따라오는 후속 빠른 질문 (assistant 메시지에만)
  suggestions?: string[];
  // 답변에 노출되는 외부 링크 (블로그 등)
  link?: { label: string; href: string };
}

export const QUICK_QUESTIONS: string[] = [
  "진료시간이 어떻게 되나요?",
  "위치가 어디인가요?",
  "어떤 진료를 받을 수 있나요?",
  "주차가 가능한가요?",
  "어린이 진료도 하나요?",
  "공진단 / 보약 처방받을 수 있나요?",
];

export const GREETING_TEXT =
  "안녕하세요 :) 이수한의원입니다.\n무엇을 도와드릴까요? 아래에서 질문을 골라주세요.";

const DISCLAIMER =
  "* 본 챗봇은 일반 안내용이며 의학적 진단·처방을 제공하지 않습니다. 정확한 진료는 내원해 주세요.";

interface DummyAnswer {
  match: RegExp;
  reply: string;
  suggestions?: string[];
  link?: { label: string; href: string };
}

const DUMMY_ANSWERS: DummyAnswer[] = [
  {
    match: /(진료시간|시간|영업|언제|운영)/,
    reply:
      "이수한의원 진료시간 안내드립니다.\n\n• 평일 (월~금) 09:30 ~ 20:00 — 야간진료\n• 토 · 일 09:30 ~ 15:00 — 주말진료\n• 공휴일 휴진\n\n점심시간은 별도 운영되며, 마지막 접수는 진료 종료 30분 전입니다.",
    suggestions: ["전화 예약은 어떻게 하나요?", "공휴일 휴진 일정"],
  },
  {
    match: /(위치|어디|주소|오시는|길|찾아|약도|지도)/,
    reply:
      "이수한의원은 서울 동작구 사당동 254-5에 있습니다.\n지하철 7호선 남성역 1번 출구에서 도보 1분 거리입니다.",
    suggestions: ["주차가 가능한가요?", "버스로 가는 방법"],
  },
  {
    match: /(주차|차|자가용|발렛)/,
    reply:
      "병원 자체 주차장은 별도로 운영되지 않으며, 인근 공영주차장을 이용해 주시면 됩니다. 자세한 위치는 전화로 안내드립니다.",
    suggestions: ["대중교통으로 가는 방법"],
  },
  {
    match: /(전화|예약|상담|문의)/,
    reply:
      "전화 예약은 02-584-1075 로 연락 주시면 됩니다. 진료시간 내 언제든 가능합니다.",
    suggestions: ["진료시간이 어떻게 되나요?"],
  },
  {
    match: /(어린이|아이|소아|성장|성조숙|키)/,
    reply:
      "네, 어린이 진료를 진행합니다. 성장클리닉, 성조숙증, 소아비염 등 어린이 한방 진료가 가능합니다. 자세한 상담은 내원하시거나 전화로 문의해 주세요.",
    suggestions: ["진료시간이 어떻게 되나요?"],
  },
  {
    match: /(공진단|경옥고|보약|한약|처방)/,
    reply:
      "공진단·경옥고를 비롯한 보약 처방이 가능합니다. 체질과 건강 상태에 따라 처방이 달라지므로, 우선 내원하셔서 진료 후 상담받으시길 권해드립니다.",
    link: {
      label: "공진단 FAQ 블로그 글 보기",
      href: "https://blog.naver.com/isuhani",
    },
    suggestions: ["진료시간이 어떻게 되나요?"],
  },
  {
    match: /(추나|디스크|허리|목|척추|체형|교정)/,
    reply:
      "추나요법, 디스크 치료, 체형·척추 교정 진료를 진행합니다. 자동차보험 한방치료도 가능합니다. 정확한 상태는 내원 후 진료 통해 확인이 필요합니다.",
    suggestions: ["자동차보험 진료가 가능한가요?", "진료시간이 어떻게 되나요?"],
  },
  {
    match: /(자동차|보험|car insurance|교통사고)/,
    reply:
      "자동차보험을 통한 한방치료가 가능합니다. 사고 접수번호와 보험사 정보를 가지고 내원해 주세요.",
    suggestions: ["진료시간이 어떻게 되나요?"],
  },
  {
    match: /(산후|임신|난임|갱년|부인|여성|자궁)/,
    reply:
      "한방부인과 진료를 운영합니다. 산후조리, 갱년기, 난임·임신, 자궁질환 등 여성 건강 진료를 받으실 수 있습니다.",
    suggestions: ["진료시간이 어떻게 되나요?"],
  },
  {
    match: /(공휴일|휴진|쉬|연휴)/,
    reply:
      "공휴일은 휴진합니다. 명절·연휴 등 별도 휴진 일정은 네이버 블로그 공지를 참고해 주세요.",
    link: {
      label: "휴진 공지 블로그 보기",
      href: "https://blog.naver.com/isuhani",
    },
  },
  {
    match: /(진료|영역|분야|뭐|어떤|무엇)/,
    reply:
      "이수한의원에서는 6가지 영역의 진료를 합니다.\n\n1. 체형·척추·관절통증\n2. 여성·산후조리\n3. 소아 성장\n4. 비만·다이어트\n5. 피부\n6. 건강관리·보약\n\n어떤 분야가 궁금하신가요?",
    suggestions: ["어린이 진료도 하나요?", "공진단 / 보약 처방받을 수 있나요?"],
  },
];

const FALLBACK_REPLY =
  "죄송합니다, 정확한 답변이 어려운 질문이에요. 자세한 상담은 02-584-1075 로 전화 주시거나, 직접 내원해 주시면 친절하게 안내드리겠습니다.";

/**
 * 더미 응답기 — 추후 Bedrock fetch로 교체.
 *
 * @example (Bedrock 연동 시)
 *   const res = await fetch("/api/chat", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ messages: history }),
 *   });
 *   const data = await res.json();
 *   return { reply: data.reply, suggestions: data.suggestions };
 */
export async function sendMessage(
  userText: string,
  // _history는 추후 Bedrock 호출 시 컨텍스트로 사용
  _history: ChatMessage[]
): Promise<{ reply: string; suggestions?: string[]; link?: ChatMessage["link"] }> {
  // 자연스러운 응답 지연
  await new Promise((r) => setTimeout(r, 450 + Math.random() * 400));

  const matched = DUMMY_ANSWERS.find((a) => a.match.test(userText));
  if (matched) {
    return {
      reply: matched.reply,
      suggestions: matched.suggestions,
      link: matched.link,
    };
  }

  return { reply: FALLBACK_REPLY };
}

export { DISCLAIMER };
