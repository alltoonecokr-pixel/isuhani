/* 진료 영역별 SVG 일러스트 — 한방 의학 추상 모티프 */
import React from "react";

function SpineIllustration({ c }: { c: string }) {
  const verts = [
    { w: 82, h: 28 },
    { w: 100, h: 30 },
    { w: 116, h: 32 },
    { w: 100, h: 30 },
    { w: 82, h: 28 },
  ];
  let y = 16;
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  verts.forEach((v) => {
    rects.push({ x: (240 - v.w) / 2, y, w: v.w, h: v.h });
    y += v.h + 14;
  });
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden>
      <line x1="120" y1="8" x2="120" y2="232" stroke={c} strokeWidth="1.5" strokeOpacity="0.12" />
      {rects.map((r, i) => (
        <React.Fragment key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="8"
            fill={c} fillOpacity={0.06 + i * 0.014}
            stroke={c} strokeWidth="1.4" strokeOpacity={0.22 + i * 0.02} />
          {i < rects.length - 1 && (
            <rect x={108} y={r.y + r.h} width={24}
              height={rects[i + 1].y - (r.y + r.h)}
              fill={c} fillOpacity="0.09" />
          )}
        </React.Fragment>
      ))}
    </svg>
  );
}

function WomenIllustration({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="120" cy="88" rx="26" ry="68"
          fill={c} fillOpacity="0.10"
          stroke={c} strokeWidth="1.2" strokeOpacity="0.22"
          transform={`rotate(${deg} 120 120)`} />
      ))}
      <circle cx="120" cy="120" r="20"
        fill={c} fillOpacity="0.18"
        stroke={c} strokeWidth="1.5" strokeOpacity="0.38" />
      <circle cx="120" cy="120" r="7"
        fill={c} fillOpacity="0.5" />
    </svg>
  );
}

function ChildrenIllustration({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden>
      <path d="M120 228 L120 48" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" />
      {/* 3쌍 잎 */}
      {[
        ["M120 190 C90 170 64 148 86 128", "M120 190 C150 170 176 148 154 128"],
        ["M120 150 C90 130 64 108 86 88", "M120 150 C150 130 176 108 154 88"],
        ["M120 110 C90 90 68 68 90 52", "M120 110 C150 90 172 68 150 52"],
      ].map(([l, r], i) => (
        <React.Fragment key={i}>
          <path d={l} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeOpacity={0.35 + i * 0.08} />
          <path d={r} stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeOpacity={0.35 + i * 0.08} />
        </React.Fragment>
      ))}
      <circle cx="120" cy="42" r="14" fill={c} fillOpacity="0.16"
        stroke={c} strokeWidth="1.4" strokeOpacity="0.32" />
    </svg>
  );
}

function DietIllustration({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden>
      {/* 기둥 */}
      <line x1="120" y1="48" x2="120" y2="195" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
      {/* 저울대 (좌로 약간 기울어짐) */}
      <path d="M44 96 L196 108" stroke={c} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.4" />
      {/* 줄 */}
      <line x1="64" y1="96" x2="64" y2="128" stroke={c} strokeWidth="1.4" strokeOpacity="0.3" />
      <line x1="176" y1="103" x2="176" y2="140" stroke={c} strokeWidth="1.4" strokeOpacity="0.3" />
      {/* 왼쪽 접시 */}
      <ellipse cx="64" cy="140" rx="34" ry="14"
        fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1.5" strokeOpacity="0.28" />
      {/* 오른쪽 접시 */}
      <ellipse cx="176" cy="152" rx="34" ry="14"
        fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1.5" strokeOpacity="0.28" />
      {/* 잎 (왼쪽 접시 위) */}
      <ellipse cx="64" cy="126" rx="14" ry="20"
        fill={c} fillOpacity="0.20" stroke={c} strokeWidth="1.2" strokeOpacity="0.3"
        transform="rotate(-15 64 126)" />
      {/* 받침 */}
      <rect x="90" y="192" width="60" height="10" rx="5"
        fill={c} fillOpacity="0.15" stroke={c} strokeWidth="1.2" strokeOpacity="0.25" />
      {/* 꼭대기 고리 */}
      <circle cx="120" cy="48" r="8" fill={c} fillOpacity="0.2"
        stroke={c} strokeWidth="1.4" strokeOpacity="0.35" />
    </svg>
  );
}

function HealthIllustration({ c }: { c: string }) {
  // 은행잎 — 팬 형태 + 줄기
  const cx = 120, base = 200;
  const r = 90;
  const rays = Array.from({ length: 9 }, (_, i) => {
    const deg = 25 + i * 16;
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.sin(rad), y: base - r * Math.cos(rad) };
  });
  const fanPath =
    `M${cx} ${base} ` +
    rays.map((p, i) => (i === 0 ? `L${p.x} ${p.y}` : `A${r} ${r} 0 0 1 ${p.x} ${p.y}`)).join(" ") +
    " Z";

  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden>
      {/* 팬 바디 */}
      <path d={fanPath} fill={c} fillOpacity="0.08" stroke={c} strokeWidth="1.4" strokeOpacity="0.22" />
      {/* 방사선 맥 */}
      {rays.map((p, i) => (
        <line key={i} x1={cx} y1={base} x2={p.x} y2={p.y}
          stroke={c} strokeWidth="1" strokeOpacity="0.14" />
      ))}
      {/* 꼭대기 노치 */}
      <path d={`M${rays[3].x} ${rays[3].y} Q${cx} ${rays[4].y - 14} ${rays[5].x} ${rays[5].y}`}
        fill="none" stroke={c} strokeWidth="1.5" strokeOpacity="0.3" />
      {/* 줄기 */}
      <line x1={cx} y1={base} x2={cx} y2="234"
        stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.45" />
    </svg>
  );
}

function SkinIllustration({ c }: { c: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden>
      {[92, 74, 56, 38, 22].map((r, i) => (
        <ellipse key={i} cx="120" cy="120" rx={r} ry={r * 0.62}
          fill="none"
          stroke={c} strokeWidth={i === 0 ? "1" : "1.1"}
          strokeOpacity={0.06 + i * 0.08} />
      ))}
      {/* 중앙 포인트 */}
      <circle cx="120" cy="120" r="9" fill={c} fillOpacity="0.25"
        stroke={c} strokeWidth="1.4" strokeOpacity="0.4" />
      {/* 가로 결 선 — 피부 결 표현 */}
      {[-28, -14, 0, 14, 28].map((dy) => (
        <path key={dy}
          d={`M${120 - 70 * Math.sqrt(1 - (dy / 58) ** 2)} ${120 + dy} Q120 ${120 + dy - 8} ${120 + 70 * Math.sqrt(1 - (dy / 58) ** 2)} ${120 + dy}`}
          fill="none" stroke={c} strokeWidth="0.8" strokeOpacity="0.08" />
      ))}
    </svg>
  );
}

const ILLUSTRATIONS: Record<string, React.FC<{ c: string }>> = {
  spine: SpineIllustration,
  women: WomenIllustration,
  children: ChildrenIllustration,
  diet: DietIllustration,
  health: HealthIllustration,
  skin: SkinIllustration,
};

export function TreatmentIllustration({ slug, accentColor }: { slug: string; accentColor: string }) {
  const Comp = ILLUSTRATIONS[slug] ?? HealthIllustration;
  return <Comp c={accentColor} />;
}
