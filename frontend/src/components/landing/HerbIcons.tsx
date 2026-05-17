/**
 * 이수한의원 커스텀 아이콘 셋 — 한방 모티프
 * 라인 1.6px / 32×32 viewBox / currentColor / round caps
 * Tsumura·이수한의원 모티프: 잎·척추·모자·새싹·약초·차완·시계·잎새 단순 라인
 */

type IconProps = { size?: number; className?: string };

const wrap = (size: number, children: React.ReactNode, className?: string) => (
  <svg
    viewBox="0 0 32 32"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden
  >
    {children}
  </svg>
);

/** 한방 잎 — 진료영역 spine/general */
export function LeafIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M6 26 C 8 16, 16 8, 26 6  C 24 16, 16 24, 6 26 Z" />
      <path d="M9 23 L 22 10" />
      <path d="M13 21 L 17 17" opacity="0.6" />
      <path d="M11 22 L 14 19" opacity="0.6" />
    </>,
    className,
  );
}

/** 척추 곡선 — 추나·디스크 */
export function SpineIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M16 4 C 12 8, 20 12, 16 16 C 12 20, 20 24, 16 28" />
      <circle cx="16" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="11" r="1" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="16" cy="21" r="1" fill="currentColor" stroke="none" opacity="0.7" />
      <circle cx="16" cy="26" r="1.4" fill="currentColor" stroke="none" />
    </>,
    className,
  );
}

/** 모자 — 여성·산후조리 */
export function MotherChildIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      {/* 엄마 */}
      <circle cx="11" cy="9" r="3" />
      <path d="M5 23 C 5 18, 8 16, 11 16 C 14 16, 17 18, 17 23" />
      {/* 아이 */}
      <circle cx="22" cy="14" r="2.2" />
      <path d="M18 24 C 18 20, 20 19, 22 19 C 24 19, 26 20, 26 24" />
    </>,
    className,
  );
}

/** 새싹 — 소아 성장 */
export function SproutIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M16 26 L 16 14" />
      <path d="M16 14 C 16 8, 11 6, 7 7 C 8 11, 12 14, 16 14 Z" />
      <path d="M16 16 C 16 11, 21 9, 25 10 C 24 14, 20 17, 16 16 Z" />
      <path d="M11 26 L 21 26" strokeWidth="2" />
    </>,
    className,
  );
}

/** 균형 저울 — 비만·다이어트 */
export function BalanceIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M16 6 L 16 24" />
      <path d="M16 8 L 6 8 L 9 14 L 13 14 L 16 8 Z" />
      <path d="M16 8 L 26 8 L 23 14 L 19 14 L 16 8 Z" />
      <path d="M11 24 L 21 24" strokeWidth="2" />
    </>,
    className,
  );
}

/** 잎+물방울 — 피부 */
export function DropLeafIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M16 6 C 11 12, 9 17, 11 22 C 13 26, 19 26, 21 22 C 23 17, 21 12, 16 6 Z" />
      <path d="M14 17 C 14 19, 16 20, 17 19" opacity="0.55" />
    </>,
    className,
  );
}

/** 약완(약사발) — 건강관리·보약 */
export function MortarIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M5 14 L 27 14" strokeWidth="2" />
      <path d="M7 14 C 7 22, 11 25, 16 25 C 21 25, 25 22, 25 14" />
      <path d="M13 14 L 13 9" />
      <path d="M16 14 L 16 7" />
      <path d="M19 14 L 19 9" />
    </>,
    className,
  );
}

/** 시계 — 매일 진료 */
export function ClockSoftIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <circle cx="16" cy="16" r="11" />
      <path d="M16 9 L 16 16 L 21 18" />
    </>,
    className,
  );
}

/** 청진기 풍 — 원장 3인 */
export function StethIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M9 5 L 9 14 C 9 18, 13 20, 16 20 C 19 20, 23 18, 23 14 L 23 5" />
      <circle cx="23" cy="24" r="3" />
      <path d="M16 20 L 16 24 C 16 25, 18 26, 20 26" />
    </>,
    className,
  );
}

/** 책+잎 — 1042편 칼럼 */
export function BookLeafIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M6 8 C 9 7, 13 7, 16 9 C 19 7, 23 7, 26 8 L 26 24 C 23 23, 19 23, 16 25 C 13 23, 9 23, 6 24 Z" />
      <path d="M16 9 L 16 25" />
      <path d="M19 14 C 21 14, 22 13, 22 11" opacity="0.6" />
    </>,
    className,
  );
}

/** 위치 핀 */
export function PinSoftIcon({ size = 28, className }: IconProps) {
  return wrap(
    size,
    <>
      <path d="M16 28 C 16 28, 7 19, 7 13 C 7 8, 11 4, 16 4 C 21 4, 25 8, 25 13 C 25 19, 16 28, 16 28 Z" />
      <circle cx="16" cy="13" r="3" />
    </>,
    className,
  );
}
