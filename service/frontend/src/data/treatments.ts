/**
 * 6개 진료 영역 정보. 각 영역마다 상세 페이지 자동 생성.
 * 추가 정보(가격/사례)는 원장님 자료 받으면 보강.
 */
export type Treatment = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  // 카테고리 매칭 — 이 카테고리 글들이 추천 글로 노출
  categoryMatch: string[];
  methods: { title: string; desc: string }[];
};

export const TREATMENTS: Record<string, Treatment> = {
  spine: {
    slug: "spine",
    name: "체형 · 척추 · 관절통증",
    tagline: "디스크 · 추나요법 · 자세교정",
    description:
      "허리 디스크부터 거북목, 일자목, 골반 비대칭, 어깨 통증까지. 추나요법과 침치료, 자세교정 운동을 통해 통증의 원인을 다스립니다. 자동차보험 한방치료도 함께 진료합니다.",
    categoryMatch: ["체형 · 척추 · 관절통증"],
    methods: [
      { title: "추나요법", desc: "근골격계 변위를 손으로 직접 교정하는 한방 수기치료. 건강보험 적용." },
      { title: "침 · 부항", desc: "통증 부위 근막과 경혈을 자극해 혈류와 통증 신호를 조절." },
      { title: "자동차보험 한방치료", desc: "교통사고 후유증 진료. 침 · 추나 · 한약 모두 자동차보험 적용." },
      { title: "체형교정", desc: "거북목, 일자목, 골반 비대칭 등 자세 교정 프로그램." },
    ],
  },
  women: {
    slug: "women",
    name: "여성 · 산후조리",
    tagline: "산후풍 · 갱년기 · 난임 · 자궁질환",
    description:
      "한방부인과 전문의가 진료하는 영역. 출산 후 산후조리부터 갱년기 증후군, 난임·임신 준비, 자궁근종·생리통 등 여성의 일생에 걸친 건강을 함께 살핍니다.",
    categoryMatch: ["여성 · 산후조리"],
    methods: [
      { title: "산후조리", desc: "출산 후 회복기 한약·침치료. 산후풍 · 부종 · 모유수유 · 회복 통증 관리." },
      { title: "갱년기 한방치료", desc: "안면홍조 · 불면 · 우울 · 골다공증 등 갱년기 증후군 한방 처방." },
      { title: "난임 · 임신 준비", desc: "체질 분석 기반 한약과 침치료로 임신 준비를 돕습니다." },
      { title: "자궁질환", desc: "자궁근종 · 생리통 · 생리불순 · 다낭성난소증후군 한방 진료." },
    ],
  },
  children: {
    slug: "children",
    name: "소아 성장",
    tagline: "어린이 성장 · 성조숙증 · 소아비염",
    description:
      "성장기 어린이의 키 성장, 면역력, 성조숙증 진료. 어린이 보약, 성장침, 식습관·수면 상담까지 종합적으로 관리합니다.",
    categoryMatch: ["소아 성장"],
    methods: [
      { title: "어린이 성장클리닉", desc: "한약 · 성장침 · 생활 상담을 결합한 키 성장 프로그램." },
      { title: "성조숙증 진료", desc: "사춘기 조기 발현 진료. 부모님 상담 동반." },
      { title: "소아 비염 · 감기", desc: "잦은 감기, 비염, 면역력 저하 한방 치료." },
      { title: "어린이 보약", desc: "체질 분석 기반 어린이 보약 처방." },
    ],
  },
  diet: {
    slug: "diet",
    name: "비만 · 다이어트",
    tagline: "체질 분석 · 한방 다이어트",
    description:
      "체질과 생활습관 분석을 기반으로 한 한방 다이어트. 단순 체중 감량이 아니라 체형·체질 개선을 목표로 합니다.",
    categoryMatch: ["비만 · 다이어트"],
    methods: [
      { title: "체질 분석 진료", desc: "체질 진단 후 개인별 다이어트 한약 · 식이 처방." },
      { title: "한약 다이어트", desc: "체지방 감량 한약 + 부종 · 식욕 조절." },
      { title: "비만 침 치료", desc: "부위별 지방 침 시술 (복부 · 옆구리 · 허벅지)." },
    ],
  },
  health: {
    slug: "health",
    name: "건강관리 · 보약",
    tagline: "공진단 · 경옥고 · 노화 케어",
    description:
      "노화에 따른 근감소증, 만성 피로, 면역력 저하 등 일상의 건강 관리. 공진단·경옥고 등 정성 들인 한방 보약을 처방합니다.",
    categoryMatch: ["건강관리"],
    methods: [
      { title: "공진단 · 사향공진단", desc: "면역력 · 기력 회복 한방 보약. 처방 전 체질 진단 필수." },
      { title: "경옥고", desc: "기관지 · 폐 건강을 위한 전통 한방 처방." },
      { title: "근감소증 한방 케어", desc: "노화에 따른 근육 감소 · 만성 피로 한방 진료." },
      { title: "한방 보약", desc: "체질·증상별 맞춤 보약 처방." },
    ],
  },
  skin: {
    slug: "skin",
    name: "피부",
    tagline: "여드름 · 아토피 · 피부 트러블",
    description:
      "여드름·아토피·만성 피부 트러블의 한방 진료. 피부의 원인이 되는 체질·소화·스트레스를 함께 다스립니다.",
    categoryMatch: ["건강관리"],
    methods: [
      { title: "여드름 한방치료", desc: "체질 분석 기반 한약 + 침치료." },
      { title: "아토피 한방진료", desc: "어린이·성인 아토피 한방 관리." },
    ],
  },
};

export const TREATMENT_LIST = Object.values(TREATMENTS);
