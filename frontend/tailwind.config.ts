import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 이수한의원 실제 브랜드 — 민트~연두 (#7BC47F 로고 톤) 베이스
        // 어두운 진녹(#0a4a45) → 모던 따뜻한 그린으로 톤업
        herb: {
          50: "#eaf3ec",   // 부드러운 민트 배경
          100: "#d3e7d8",  // 카드 hover 톤
          200: "#b3d7bd",  // 칩·보더
          300: "#8fc89c",  // 일러스트 라이트
          500: "#6fb07a",  // 실제 로고 민트 — primary
          600: "#4a8e62",  // 강조
          700: "#2d6e5a",  // 텍스트·hover (이전 #0a4a45보다 따뜻·라이트)
          900: "#1c4f3f",  // 가장 깊은 액센트
        },
        ink: {
          900: "#1a1410",
          800: "#22201c",
          700: "#33302b",
          500: "#5c5751",
          400: "#8c8780",
          300: "#bdb9b1",
          200: "#e3dfd6",
          100: "#f1ede4",
          50: "#f7f3ea",
        },
        paper: {
          DEFAULT: "#fdfbf5",
          50: "#fdfbf5",
          100: "#f8f3e6",
          // 따뜻한 모래색 — 검정 stats 대체용 (Tsumura톤)
          200: "#f5efe1",
        },
        // 우드 베이지 — 인테리어 결(연베이지+우드톤). clay 흙색에서 변경
        clay: {
          50: "#f7f0e4",   // 매우 옅은 베이지
          400: "#dab891",  // 라이트 우드
          500: "#c9a57b",  // primary 우드
          700: "#9a7a52",  // 진한 우드 액센트
        },
      },
      fontFamily: {
        sans: ["var(--font-noto-kr)", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-kr)", "'Noto Serif KR'", "serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      letterSpacing: {
        tightest: "-0.03em",
      },
    },
  },
  plugins: [],
};

export default config;
