/**
 * 챗봇 응답 로직.
 *  - NEXT_PUBLIC_CHAT_ENDPOINT 가 설정되어 있으면 Lambda(RAG) 호출
 *  - 없거나 실패 시 정적 키워드 규칙으로 fallback
 */

export type ChatLink = {
  label: string;
  href: string;
  /** 각주 번호 (RAG 응답에만 존재. 정적 규칙은 undefined) */
  n?: number;
};

export type ChatAnswer = {
  text: string;
  suggestions?: string[];
  links?: ChatLink[];
};

export const GREETING =
  "안녕하세요, 저는 이수한의원의 쑤예요.\n예약·진료시간·건강 칼럼까지, 무엇이든 편하게 물어보세요.";

export const QUICK_QUESTIONS = [
  "진료 시간이 어떻게 되나요?",
  "예약은 어떻게 하나요?",
  "위치가 어떻게 되나요?",
  "주차 가능한가요?",
  "건강보험 적용되나요?",
  "공진단 처방받고 싶어요",
  "추나요법은 어떻게 받나요?",
  "어린이 성장 진료 가능한가요?",
  "처음 방문할 때 뭘 준비하나요?",
];

const ENDPOINT = process.env.NEXT_PUBLIC_CHAT_ENDPOINT || "";

type Rule = {
  match: RegExp;
  answer: () => ChatAnswer;
};

const RULES: Rule[] = [
  {
    match: /(진료\s*시간|영업\s*시간|언제|몇\s*시|문\s*여|문여|open|언제까지|언제부터)/i,
    answer: () => ({
      text:
        "진료 시간 안내드립니다.\n\n• 평일 09:30 – 20:00 (야간진료)\n• 토 · 일 09:30 – 15:00\n• 공휴일 휴진\n\n마지막 접수는 진료 종료 30분 전 마감됩니다. 점심시간은 별도 운영되어 전화로 안내드립니다.",
      suggestions: ["예약은 어떻게 하나요?", "위치가 어떻게 되나요?"],
    }),
  },
  {
    match: /(예약|예약하|예약\s*방법|어떻게\s*가|reservation)/i,
    answer: () => ({
      text:
        "전화 예약이 가장 빠릅니다.\n\n• 전화 02-584-1075 — 진료 시간 내 언제든\n• 워크인 가능 — 단 대기 시간 있을 수 있어 전화 예약 권장\n\n자세한 첫 방문 가이드도 준비되어 있습니다.",
      links: [
        { label: "📞 02-584-1075 전화하기", href: "tel:0285841075" },
        { label: "처음 방문 가이드 보기", href: "/visit-guide" },
      ],
    }),
  },
  {
    match: /(위치|어디|주소|찾아가|오시는|길|어떻게\s*오)/i,
    answer: () => ({
      text:
        "이수한의원은 7호선 남성역 1번 출구에서 도보 1분 거리입니다.\n\n• 주소 — 서울특별시 동작구 사당동 254-5\n• 지하철 — 7호선 남성역 1번 출구\n• 버스 — 남성역 정류장 인근 다수 노선",
      links: [{ label: "지도 자세히 보기", href: "/clinic#location" }],
    }),
  },
  {
    match: /(주차|차\s*가|차로|car|parking)/i,
    answer: () => ({
      text:
        "전용 주차장은 없으며 인근 공영주차장을 이용하실 수 있습니다.\n자가용으로 오시는 경우 자세한 안내는 전화로 문의해 주세요.",
      links: [{ label: "📞 전화 02-584-1075", href: "tel:0285841075" }],
    }),
  },
  {
    match: /(보험|건강보험|실비|실손|자동차\s*보험|교통사고)/i,
    answer: () => ({
      text:
        "이수한의원은 건강보험과 자동차보험 모두 적용 가능합니다.\n\n• 침 · 추나요법 — 건강보험 적용\n• 자동차보험 한방치료 — 교통사고 후유증 진료\n• 한약 처방 · 공진단 · 경옥고 — 비급여\n• 실손 보험은 약관에 따라 청구 가능",
      suggestions: ["공진단 처방받고 싶어요", "추나요법은 어떻게 받나요?"],
    }),
  },
  {
    match: /(공진단|경옥고|보약|보양|체질)/i,
    answer: () => ({
      text:
        "공진단·경옥고 등 한방 보약은 진료 후 체질·증상에 맞춰 직접 처방드립니다.\n자주 묻는 복용법·보관·기간 등은 공진단 FAQ 칼럼을 참고해 주세요.",
      links: [
        { label: "공진단 가이드 보기", href: "/?q=%EA%B3%B5%EC%A7%84%EB%8B%A8" },
        { label: "건강관리 · 보약 영역", href: "/treatment/health" },
        { label: "📞 진료 예약 02-584-1075", href: "tel:0285841075" },
      ],
    }),
  },
  {
    match: /(추나|추나요법|척추|허리|디스크|목\s*디스크|목\s*아|어깨|관절|통증)/i,
    answer: () => ({
      text:
        "추나요법은 손으로 직접 척추·관절을 교정하는 한방 수기치료로, 건강보험 적용됩니다.\n허리 디스크, 거북목, 골반 비대칭, 어깨 통증 등에 효과적입니다.",
      links: [
        { label: "체형 · 척추 · 관절통증 진료", href: "/treatment/spine" },
        { label: "관련 칼럼 보기", href: "/?cat=%EC%B2%B4%ED%98%95+%C2%B7+%EC%B2%99%EC%B6%94+%C2%B7+%EA%B4%80%EC%A0%88%ED%86%B5%EC%A6%9D" },
      ],
    }),
  },
  {
    match: /(어린이|아이|소아|성장|키|성조숙|비염)/i,
    answer: () => ({
      text:
        "어린이 성장 클리닉, 성조숙증, 소아 비염 진료 모두 가능합니다.\n부모님 동반 시 더 정확한 진료가 가능합니다.",
      links: [
        { label: "소아 성장 진료 영역", href: "/treatment/children" },
        { label: "관련 칼럼 보기", href: "/?cat=%EC%86%8C%EC%95%84+%EC%84%B1%EC%9E%A5" },
      ],
    }),
  },
  {
    match: /(여성|산후|산후조리|갱년|갱년기|난임|임신|자궁|생리)/i,
    answer: () => ({
      text:
        "한방부인과 전문의가 진료합니다. 산후조리, 갱년기, 난임·임신 준비, 자궁 질환·생리통 등 여성 건강 전반을 다룹니다.",
      links: [
        { label: "여성 · 산후조리 진료", href: "/treatment/women" },
        { label: "관련 칼럼 보기", href: "/?cat=%EC%97%AC%EC%84%B1+%C2%B7+%EC%82%B0%ED%9B%84%EC%A1%B0%EB%A6%AC" },
      ],
    }),
  },
  {
    match: /(다이어트|비만|체중|살\s*빼)/i,
    answer: () => ({
      text:
        "체질·생활습관 분석을 기반으로 한 한방 다이어트 진료입니다.\n단순 체중 감량이 아니라 체형·체질 개선이 목표입니다.",
      links: [{ label: "비만 · 다이어트 진료", href: "/treatment/diet" }],
    }),
  },
  {
    match: /(여드름|아토피|피부|트러블)/i,
    answer: () => ({
      text:
        "여드름, 아토피, 만성 피부 트러블의 한방 진료입니다.\n피부의 원인이 되는 체질·소화·스트레스를 함께 다스립니다.",
      links: [{ label: "피부 진료", href: "/treatment/skin" }],
    }),
  },
  {
    match: /(가격|비용|얼마|원|cost|price)/i,
    answer: () => ({
      text:
        "건강보험 적용되는 침·추나요법은 본인부담금만 발생합니다.\n한약·공진단·경옥고 등 비급여 처방 비용은 체질·증상별 처방에 따라 다르므로, 정확한 비용은 진료 후 안내드립니다.",
      links: [{ label: "📞 비용 문의 02-584-1075", href: "tel:0285841075" }],
    }),
  },
  {
    match: /(처음|첫\s*방문|뭐\s*가져|준비|신분증)/i,
    answer: () => ({
      text:
        "처음 방문 시 준비하실 것:\n\n• 신분증 (건강보험 적용 시 필수)\n• 최근 복용 중인 약·한약 정보\n• 증상 시작 시점·통증 부위 메모\n• 추나·침 시술을 받을 수 있어 활동 편한 옷",
      links: [{ label: "처음 방문 가이드 전체 보기", href: "/visit-guide" }],
    }),
  },
  {
    match: /(원장|의료진|선생|문학진|나효석|이윤호)/i,
    answer: () => ({
      text:
        "이수한의원은 원장 3인이 진료합니다.\n\n• 문학진 대표원장 — 추나요법, 척추 교정, 디스크\n• 나효석 원장 — 한방부인과 전문의 (산후조리 · 갱년기 · 난임)\n• 이윤호 원장 — 관절통증, 어린이 성장, 건강관리",
      links: [{ label: "의료진 자세히 보기", href: "/clinic#doctors" }],
    }),
  },
  {
    match: /(휴진|휴무|쉬|닫|close)/i,
    answer: () => ({
      text:
        "공휴일은 정기 휴진입니다.\n명절·임시 휴진은 메인 페이지 상단 공지 또는 한의원 STORY 카테고리에서 확인하실 수 있습니다.",
      links: [
        { label: "한의원 STORY 카테고리", href: "/?cat=%ED%95%9C%EC%9D%98%EC%9B%90+story" },
      ],
    }),
  },
];

function staticAnswer(q: string): ChatAnswer {
  for (const r of RULES) {
    if (r.match.test(q)) return r.answer();
  }
  return {
    text:
      "더 자세한 답변이 필요하면 전화로 문의해 주세요. 또는 아래 자주 묻는 질문 중에서 골라주세요.",
    suggestions: QUICK_QUESTIONS.slice(0, 4),
    links: [{ label: "📞 02-584-1075 전화하기", href: "tel:0285841075" }],
  };
}

export async function answerQuestion(q: string): Promise<ChatAnswer> {
  if (!ENDPOINT) return staticAnswer(q);

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25_000);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: q }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as { text?: string; links?: ChatLink[] };
    if (!data.text) throw new Error("empty response");
    return {
      text: data.text,
      links: data.links,
    };
  } catch {
    return staticAnswer(q);
  }
}
