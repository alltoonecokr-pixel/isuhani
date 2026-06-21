import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;     // ISO "YYYY-MM-DD"
  onChange: (v: string) => void;
};

const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
const DAYS   = ["일","월","화","수","목","금","토"];

function parseDate(iso: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = (iso || "").split("-").map(Number);
  if (!y || !m || !d) return null;
  return { y, m, d };
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

function firstDayOfWeek(y: number, m: number) {
  return new Date(y, m - 1, 1).getDay();
}

export function DatePicker({ value, onChange }: Props) {
  const [open, setOpen]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  const parsed            = parseDate(value);
  const today             = new Date();

  const [viewY, setViewY] = useState(parsed?.y ?? today.getFullYear());
  const [viewM, setViewM] = useState(parsed?.m ?? today.getMonth() + 1);

  // 패널 열릴 때 현재 선택 월로 이동
  const handleOpen = () => {
    if (parsed) { setViewY(parsed.y); setViewM(parsed.m); }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const prevMonth = () => {
    if (viewM === 1) { setViewY(viewY - 1); setViewM(12); }
    else setViewM(viewM - 1);
  };
  const nextMonth = () => {
    if (viewM === 12) { setViewY(viewY + 1); setViewM(1); }
    else setViewM(viewM + 1);
  };

  const totalDays  = daysInMonth(viewY, viewM);
  const startDow   = firstDayOfWeek(viewY, viewM);
  // 앞 빈칸 + 날짜 배열
  const cells: (number | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  // 6주 맞추기
  while (cells.length % 7 !== 0) cells.push(null);

  const isSelected = (d: number) =>
    parsed && parsed.y === viewY && parsed.m === viewM && parsed.d === d;
  const isToday = (d: number) =>
    today.getFullYear() === viewY && today.getMonth() + 1 === viewM && today.getDate() === d;

  const displayValue = parsed
    ? `${parsed.y}. ${parsed.m}. ${parsed.d}.`
    : "날짜 선택";

  return (
    <div ref={ref} className="dp-wrap">
      <button
        type="button"
        className={"dp-trigger" + (open ? " open" : "")}
        onClick={handleOpen}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="dp-icon">
          <rect x="1" y="2.5" width="11" height="9.5" rx="1.8" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M4 1v3M9 1v3M1 5.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        <span>{displayValue}</span>
        <svg className={"csel-arrow" + (open ? " open" : "")} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="dp-panel">
          {/* 헤더 */}
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth} title="이전 달">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M11 4.5L6.5 9 11 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="dp-month-label">{viewY}년 {MONTHS[viewM - 1]}</span>
            <button type="button" className="dp-nav" onClick={nextMonth} title="다음 달">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M7 4.5L11.5 9 7 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="dp-weekdays">
            {DAYS.map((d, i) => (
              <span key={d} className={"dp-dow" + (i === 0 ? " sun" : i === 6 ? " sat" : "")}>{d}</span>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="dp-grid">
            {cells.map((d, i) => {
              const dow = i % 7;
              if (!d) return <span key={i} className="dp-cell empty" />;
              return (
                <button
                  key={i}
                  type="button"
                  className={[
                    "dp-cell",
                    isSelected(d) ? "selected" : "",
                    isToday(d) && !isSelected(d) ? "today" : "",
                    dow === 0 ? "sun" : dow === 6 ? "sat" : "",
                  ].filter(Boolean).join(" ")}
                  onClick={() => { onChange(toISO(viewY, viewM, d)); setOpen(false); }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* 오늘 바로가기 */}
          <div className="dp-footer">
            <button
              type="button"
              className="dp-today-btn"
              onClick={() => {
                const y = today.getFullYear(), m = today.getMonth() + 1, d = today.getDate();
                onChange(toISO(y, m, d));
                setOpen(false);
              }}
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
