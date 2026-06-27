import { useState } from "react";
import type { TreatmentContent, Method, Faq } from "../../pages/treatmentContent";

// 진료영역 페이지 섹션 편집기 (목업) — 좌: 섹션 폼 / 우: 실제 페이지 미리보기.
// 고정 섹션 스키마라 레이아웃은 안 깨지고, 직원은 칸의 글·항목만 수정한다.

type Props = {
  initial: TreatmentContent;
  onBack: () => void;
  onSave: (next: TreatmentContent) => void;
  busy?: boolean;
};

export function TreatmentEditor({ initial, onBack, onSave, busy }: Props) {
  const [c, setC] = useState<TreatmentContent>(initial);
  const dirty = JSON.stringify(c) !== JSON.stringify(initial);

  const set = <K extends keyof TreatmentContent>(k: K, v: TreatmentContent[K]) =>
    setC((p) => ({ ...p, [k]: v }));

  // methods helpers
  const setMethod = (i: number, patch: Partial<Method>) =>
    set("methods", c.methods.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  const addMethod = () => set("methods", [...c.methods, { title: "", desc: "" }]);
  const delMethod = (i: number) => set("methods", c.methods.filter((_, idx) => idx !== i));
  const moveMethod = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= c.methods.length) return;
    const arr = [...c.methods];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set("methods", arr);
  };

  // faq helpers
  const setFaq = (i: number, patch: Partial<Faq>) =>
    set("faq", c.faq.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addFaq = () => set("faq", [...c.faq, { q: "", a: "" }]);
  const delFaq = (i: number) => set("faq", c.faq.filter((_, idx) => idx !== i));

  return (
    <div className="pg-editor">
      <div className="pg-editor-bar">
        <button className="ghost" onClick={onBack}>← 페이지 목록</button>
        <div className="pg-editor-title">진료영역 · {c.name || "(이름 없음)"}<span className="pg-slug">/{c.slug}</span></div>
        <button className="primary" disabled={!dirty || busy} onClick={() => onSave(c)}>
          {busy ? "저장 중…" : dirty ? "저장 · 발행" : "저장됨"}
        </button>
      </div>

      <div className="pg-editor-body">
        {/* ── 좌: 섹션 폼 ── */}
        <div className="pg-form">
          <section className="pg-section">
            <h3 className="pg-section-h">기본 정보</h3>
            <label className="pg-field">
              <span>진료 영역 이름</span>
              <input value={c.name} onChange={(e) => set("name", e.target.value)} placeholder="예: 체형 · 척추 · 관절통증" />
            </label>
            <label className="pg-field">
              <span>한 줄 부제</span>
              <input value={c.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="예: 디스크 · 추나요법 · 자세교정" />
            </label>
            <label className="pg-field">
              <span>소개 문단</span>
              <textarea rows={4} value={c.description} onChange={(e) => set("description", e.target.value)} placeholder="이 진료 영역을 소개하는 문단" />
            </label>
          </section>

          <section className="pg-section">
            <div className="pg-section-head">
              <h3 className="pg-section-h">치료 방법</h3>
              <button className="ghost sm" onClick={addMethod}>+ 항목 추가</button>
            </div>
            {c.methods.length === 0 && <p className="pg-empty">아직 항목이 없습니다. “+ 항목 추가”로 만드세요.</p>}
            {c.methods.map((m, i) => (
              <div className="pg-item" key={i}>
                <div className="pg-item-head">
                  <span className="pg-item-no">{i + 1}</span>
                  <div className="pg-item-tools">
                    <button className="icon" disabled={i === 0} onClick={() => moveMethod(i, -1)} title="위로">↑</button>
                    <button className="icon" disabled={i === c.methods.length - 1} onClick={() => moveMethod(i, 1)} title="아래로">↓</button>
                    <button className="icon danger" onClick={() => delMethod(i)} title="삭제">✕</button>
                  </div>
                </div>
                <input className="pg-item-title" value={m.title} onChange={(e) => setMethod(i, { title: e.target.value })} placeholder="치료 방법 이름 (예: 추나요법)" />
                <textarea rows={2} value={m.desc} onChange={(e) => setMethod(i, { desc: e.target.value })} placeholder="설명" />
              </div>
            ))}
          </section>

          <section className="pg-section">
            <div className="pg-section-head">
              <h3 className="pg-section-h">자주 묻는 질문</h3>
              <button className="ghost sm" onClick={addFaq}>+ 질문 추가</button>
            </div>
            {c.faq.length === 0 && <p className="pg-empty">질문이 없습니다.</p>}
            {c.faq.map((f, i) => (
              <div className="pg-item" key={i}>
                <div className="pg-item-head">
                  <span className="pg-item-no">Q{i + 1}</span>
                  <div className="pg-item-tools">
                    <button className="icon danger" onClick={() => delFaq(i)} title="삭제">✕</button>
                  </div>
                </div>
                <input className="pg-item-title" value={f.q} onChange={(e) => setFaq(i, { q: e.target.value })} placeholder="질문" />
                <textarea rows={3} value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} placeholder="답변" />
              </div>
            ))}
          </section>
        </div>

        {/* ── 우: 실제 페이지 미리보기 ── */}
        <div className="pg-preview-col">
          <div className="pg-preview-label">실제 페이지 미리보기</div>
          <div className="pg-preview">
            <div className="pgp-eyebrow">진료 영역</div>
            <h1 className="pgp-name">{c.name || "진료 영역 이름"}</h1>
            <p className="pgp-tagline">{c.tagline}</p>
            <p className="pgp-desc">{c.description}</p>

            {c.methods.length > 0 && (
              <>
                <div className="pgp-sec-h">치료 방법</div>
                <div className="pgp-methods">
                  {c.methods.map((m, i) => (
                    <div className="pgp-method" key={i}>
                      <div className="pgp-method-t">{m.title || "제목"}</div>
                      <div className="pgp-method-d">{m.desc}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {c.faq.length > 0 && (
              <>
                <div className="pgp-sec-h">자주 묻는 질문</div>
                <div className="pgp-faqs">
                  {c.faq.map((f, i) => (
                    <div className="pgp-faq" key={i}>
                      <div className="pgp-faq-q">Q. {f.q || "질문"}</div>
                      <div className="pgp-faq-a">{f.a}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
