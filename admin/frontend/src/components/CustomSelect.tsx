import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
};

export function CustomSelect({ value, options, onChange, placeholder = "선택" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="csel-wrap">
      <button
        type="button"
        className={"csel-trigger" + (open ? " open" : "")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="csel-value">{value || placeholder}</span>
        <svg className={"csel-arrow" + (open ? " open" : "")} width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="csel-panel">
          {options.map((o) => (
            <button
              key={o}
              type="button"
              className={"csel-item" + (o === value ? " on" : "")}
              onClick={() => { onChange(o); setOpen(false); }}
            >
              {o === value && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flex: "none" }}>
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
