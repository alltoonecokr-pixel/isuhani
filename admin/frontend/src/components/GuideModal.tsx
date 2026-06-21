import { useState } from "react";

type Props = { onClose: () => void };

const STEPS = [
  {
    title: "글 목록",
    desc: "관리 화면에 들어오면 지금까지 쓴 글이 모두 보입니다. 오른쪽 위 필터·정렬로 카테고리나 날짜순을 바꿀 수 있고, 검색으로 특정 글을 빠르게 찾을 수 있습니다.",
    icon: (
      <svg viewBox="0 0 72 72" fill="none" className="guide-icon">
        <rect x="8" y="8" width="56" height="56" rx="10" fill="var(--accent-light)" stroke="var(--accent-border)" strokeWidth="1.5"/>
        <rect x="18" y="20" width="14" height="14" rx="3" fill="var(--accent)" opacity=".25"/>
        <rect x="18" y="20" width="14" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.4"/>
        <line x1="38" y1="24" x2="54" y2="24" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="38" y1="30" x2="50" y2="30" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="18" y="40" width="14" height="14" rx="3" fill="var(--accent)" opacity=".25"/>
        <rect x="18" y="40" width="14" height="14" rx="3" stroke="var(--accent)" strokeWidth="1.4"/>
        <line x1="38" y1="44" x2="54" y2="44" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="38" y1="50" x2="50" y2="50" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "새 글 쓰기",
    desc: "오른쪽 위 [+ 새 글] 버튼을 누르면 편집 화면이 열립니다. 제목을 입력하고 카테고리와 날짜를 설정하세요. 카테고리가 없으면 상단 [카테고리]에서 먼저 추가할 수 있습니다.",
    icon: (
      <svg viewBox="0 0 72 72" fill="none" className="guide-icon">
        <rect x="8" y="8" width="56" height="56" rx="10" fill="var(--accent-light)" stroke="var(--accent-border)" strokeWidth="1.5"/>
        <rect x="22" y="18" width="28" height="36" rx="4" fill="white" stroke="var(--ink-200)" strokeWidth="1.4"/>
        <line x1="28" y1="28" x2="44" y2="28" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="28" y1="34" x2="40" y2="34" stroke="var(--ink-200)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="52" cy="52" r="10" fill="var(--accent)"/>
        <line x1="52" y1="47" x2="52" y2="57" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <line x1="47" y1="52" x2="57" y2="52" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "본문 작성",
    desc: "에디터에서 텍스트를 굵게·기울임·소제목으로 꾸밀 수 있습니다. 사진 버튼으로 이미지를 직접 올리고, 유튜브 주소를 붙여넣으면 영상도 바로 삽입됩니다.",
    icon: (
      <svg viewBox="0 0 72 72" fill="none" className="guide-icon">
        <rect x="8" y="8" width="56" height="56" rx="10" fill="var(--accent-light)" stroke="var(--accent-border)" strokeWidth="1.5"/>
        <rect x="14" y="14" width="44" height="10" rx="3" fill="white" stroke="var(--ink-200)" strokeWidth="1.2"/>
        <rect x="16" y="16.5" width="5" height="5" rx="1" fill="var(--accent)" opacity=".6"/>
        <rect x="23" y="16.5" width="5" height="5" rx="1" fill="var(--ink-200)"/>
        <rect x="30" y="16.5" width="5" height="5" rx="1" fill="var(--ink-200)"/>
        <rect x="14" y="28" width="44" height="30" rx="3" fill="white" stroke="var(--ink-200)" strokeWidth="1.2"/>
        <line x1="20" y1="35" x2="52" y2="35" stroke="var(--ink-900)" strokeWidth="2" strokeLinecap="round"/>
        <line x1="20" y1="41" x2="46" y2="41" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="20" y1="47" x2="50" y2="47" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "미리보기",
    desc: "우측 상단 [미리보기] 버튼을 누르면 오른쪽에 스마트폰 화면이 나타납니다. 실제 홈페이지에서 어떻게 보이는지 확인하면서 작성할 수 있습니다.",
    icon: (
      <svg viewBox="0 0 72 72" fill="none" className="guide-icon">
        <rect x="8" y="8" width="56" height="56" rx="10" fill="var(--accent-light)" stroke="var(--accent-border)" strokeWidth="1.5"/>
        <rect x="12" y="16" width="28" height="40" rx="3" fill="white" stroke="var(--ink-200)" strokeWidth="1.2"/>
        <line x1="18" y1="24" x2="34" y2="24" stroke="var(--ink-900)" strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="18" y1="30" x2="30" y2="30" stroke="var(--ink-300)" strokeWidth="1.4" strokeLinecap="round"/>
        <rect x="36" y="24" width="24" height="36" rx="5" fill="var(--ink-900)"/>
        <rect x="38" y="28" width="20" height="28" rx="2" fill="var(--ink-50)"/>
        <line x1="41" y1="33" x2="55" y2="33" stroke="var(--ink-900)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="41" y1="37" x2="52" y2="37" stroke="var(--ink-300)" strokeWidth="1" strokeLinecap="round"/>
        <circle cx="48" cy="58" r="2" fill="var(--ink-500)"/>
      </svg>
    ),
  },
  {
    title: "임시저장 vs 발행",
    desc: "[임시 저장]은 홈페이지에 올리지 않고 초안으로 보관합니다. [발행하기]를 눌러야 실제 홈페이지에 게시됩니다. 발행 후 홈페이지 반영까지는 약 2~5분이 걸립니다.",
    icon: (
      <svg viewBox="0 0 72 72" fill="none" className="guide-icon">
        <rect x="8" y="8" width="56" height="56" rx="10" fill="var(--accent-light)" stroke="var(--accent-border)" strokeWidth="1.5"/>
        <rect x="14" y="28" width="19" height="16" rx="4" fill="var(--ink-100)" stroke="var(--ink-300)" strokeWidth="1.4"/>
        <line x1="23.5" y1="33" x2="23.5" y2="39" stroke="var(--ink-500)" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="20.5" y1="36" x2="26.5" y2="36" stroke="var(--ink-500)" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="39" y="28" width="19" height="16" rx="4" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1.4"/>
        <path d="M44.5 36.5l3 3 5.5-5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="20" y1="52" x2="24" y2="52" stroke="var(--ink-400)" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M34 52 Q36 46 38 52" stroke="var(--ink-300)" strokeWidth="1.2" strokeLinecap="round"/>
        <line x1="48" y1="52" x2="52" y2="52" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "글 수정 · 삭제",
    desc: "목록에서 글을 클릭하거나 오른쪽 [수정] 버튼을 누르면 다시 편집할 수 있습니다. 삭제는 되돌릴 수 없으니 주의하세요. 수정 후에는 반드시 [발행하기]를 눌러야 홈페이지에 반영됩니다.",
    icon: (
      <svg viewBox="0 0 72 72" fill="none" className="guide-icon">
        <rect x="8" y="8" width="56" height="56" rx="10" fill="var(--accent-light)" stroke="var(--accent-border)" strokeWidth="1.5"/>
        <rect x="14" y="18" width="44" height="10" rx="3" fill="white" stroke="var(--ink-200)" strokeWidth="1.2"/>
        <rect x="14" y="32" width="44" height="10" rx="3" fill="white" stroke="var(--ink-200)" strokeWidth="1.2"/>
        <path d="M46 34.5l2.5 2.5-6 6-3 0.5 0.5-3z" fill="var(--accent)" stroke="var(--accent)" strokeWidth="0.5" strokeLinejoin="round"/>
        <rect x="14" y="46" width="44" height="10" rx="3" fill="white" stroke="var(--ink-200)" strokeWidth="1.2"/>
        <line x1="47" y1="49" x2="53" y2="55" stroke="var(--danger)" strokeWidth="1.6" strokeLinecap="round"/>
        <line x1="53" y1="49" x2="47" y2="55" stroke="var(--danger)" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function GuideModal({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const total = STEPS.length;
  const cur = STEPS[step];
  const isLast = step === total - 1;

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal guide-tour">
        {/* 상단 헤더 */}
        <div className="gt-header">
          <span className="gt-label">사용 가이드</span>
          <button className="gt-close" onClick={onClose} title="닫기">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 일러스트 */}
        <div className="gt-illus">{cur.icon}</div>

        {/* 단계 인디케이터 */}
        <div className="gt-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={"gt-dot" + (i === step ? " on" : "")}
              onClick={() => setStep(i)}
              aria-label={`${i + 1}단계`}
            />
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="gt-body">
          <div className="gt-step-no">{step + 1} / {total}</div>
          <h3 className="gt-title">{cur.title}</h3>
          <p className="gt-desc">{cur.desc}</p>
        </div>

        {/* 하단 버튼 */}
        <div className="gt-actions">
          <button
            className="gt-prev"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
          >
            ← 이전
          </button>
          {isLast ? (
            <button className="herb gt-done" onClick={onClose}>
              시작하기
            </button>
          ) : (
            <button className="herb gt-next" onClick={() => setStep(s => s + 1)}>
              다음 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
