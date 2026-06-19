/**
 * 이수한의원 챗봇 마스코트 — "쑤"
 * 큰 눈 + 한방 잎사귀 + 따뜻한 paper + 분홍 볼터치
 */
export function SsuMascot({
  size = 40,
  className = "",
  variant = "default",
}: {
  size?: number;
  className?: string;
  variant?: "default" | "wave"; // wave = 인사하는 톤 (호버용)
}) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {/* 배경 빛 — 살짝 빛나는 효과 */}
      <circle cx="40" cy="48" r="26" fill="#0a4a45" opacity="0.04" />

      {/* 잎 줄기 */}
      <path
        d="M40 12 L 40 24"
        stroke="#0a4a45"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* 큰 잎 (왼쪽) */}
      <path
        d="M40 14 Q 28 10, 26 18 Q 26 24, 34 22 Q 40 20, 40 14 Z"
        fill="#0a4a45"
      />
      {/* 잎맥 */}
      <path
        d="M28 17 Q 33 18, 38 18"
        stroke="#fdfbf5"
        strokeWidth="0.7"
        fill="none"
        opacity="0.55"
        strokeLinecap="round"
      />

      {/* 작은 잎 (오른쪽) */}
      <path
        d="M40 18 Q 50 14, 52 20 Q 50 25, 44 23 Q 40 21, 40 18 Z"
        fill="#0f5d56"
      />

      {/* 얼굴 — paper, 살짝 통통한 타원 */}
      <ellipse
        cx="40"
        cy="50"
        rx="23"
        ry="21"
        fill="#fdfbf5"
        stroke="#0a4a45"
        strokeWidth="2"
      />

      {/* 볼 — 분홍 (안쪽 살짝 짙게, 그라디언트 느낌) */}
      <ellipse cx="26" cy="55" rx="4" ry="3" fill="#f0a896" opacity="0.55" />
      <ellipse cx="54" cy="55" rx="4" ry="3" fill="#f0a896" opacity="0.55" />

      {/* 눈 — 큰 동그란 타원 + 하이라이트 */}
      {variant === "wave" ? (
        // 윙크 톤
        <>
          <path
            d="M28 47 Q 32 44, 36 47"
            stroke="#1a1410"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <ellipse cx="50" cy="48" rx="2.6" ry="3.6" fill="#1a1410" />
          <circle cx="51" cy="46.5" r="0.9" fill="#fdfbf5" />
        </>
      ) : (
        <>
          <ellipse cx="30" cy="48" rx="2.6" ry="3.6" fill="#1a1410" />
          <ellipse cx="50" cy="48" rx="2.6" ry="3.6" fill="#1a1410" />
          {/* 눈 하이라이트 */}
          <circle cx="31" cy="46.5" r="0.9" fill="#fdfbf5" />
          <circle cx="51" cy="46.5" r="0.9" fill="#fdfbf5" />
        </>
      )}

      {/* 입 — 동그란 미소 */}
      <path
        d="M35 59 Q 40 63, 45 59"
        stroke="#1a1410"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* 작은 디테일 — 머리 위 별 (반짝임) */}
      <circle cx="58" cy="22" r="1.2" fill="#0a4a45" opacity="0.5" />
      <circle cx="20" cy="30" r="0.9" fill="#0a4a45" opacity="0.4" />
    </svg>
  );
}
