// 전역 상수 — S3 키 프리픽스, 카테고리 매핑, 기본 카테고리 목록

export const POST_PREFIX = "posts/";
export const PAGE_PREFIX = "pages/";
export const IMAGE_PREFIX = "images/";
export const META_KEY = "meta/categories.json";
export const INDEX_KEY = "index.json";

// 편집 가능한 사이트 페이지 (건강저널 글이 아닌 정적 페이지). 슬러그 화이트리스트.
export const EDITABLE_PAGES = [
  "treatment-spine", "treatment-women", "treatment-children",
  "treatment-diet", "treatment-health", "treatment-skin",
];

// 레거시(네이버 크롤) categoryNo → 표시 이름 매핑
export const CATEGORY_MAP = {
  "1": "한의원 story", "32": "건강관리", "43": "한의원 story",
  "42": "여가 · 여행", "11": "비만 · 다이어트", "38": "BLOG",
  "7": "체형 · 척추 · 관절통증", "12": "체형 · 척추 · 관절통증",
  "13": "체형 · 척추 · 관절통증", "14": "체형 · 척추 · 관절통증",
  "21": "체형 · 척추 · 관절통증",
  "8": "여성 · 산후조리", "24": "여성 · 산후조리", "25": "여성 · 산후조리",
  "9": "소아 성장", "10": "소아 성장", "15": "소아 성장", "39": "소아 성장",
};

export const PARENT_CATEGORY_MAP = {
  "1": "한의원 story", "7": "체형 · 척추 · 관절통증",
  "8": "여성 · 산후조리", "9": "소아 성장",
  "11": "비만 · 다이어트", "32": "건강관리",
  "38": "BLOG", "42": "여가 · 여행",
};

// 사이트 /journal 상단 탭 순서와 동일하게 유지
export const DEFAULT_CATEGORIES = [
  "한의원 story",
  "건강관리",
  "체형 · 척추 · 관절통증",
  "소아 성장",
  "여성 · 산후조리",
  "여가 · 여행",
  "비만 · 다이어트",
];
