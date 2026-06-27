import type { TreatmentContent } from "../../pages/treatmentContent";

// 편집 가능한 사이트 페이지 목록. 진료영역(6) 우선, 병원소개·첫방문은 다음 단계.

type Props = {
  treatments: TreatmentContent[];
  onEditTreatment: (slug: string) => void;
};

export function PagesView({ treatments, onEditTreatment }: Props) {
  return (
    <div className="pg-list">
      <div className="pg-list-intro">
        <h2>페이지 편집</h2>
        <p>실제 사이트 화면에서 텍스트를 직접 클릭해 수정합니다. 편집 중 메뉴로 페이지를 자유롭게 이동하며 고치고, 저장하면 즉시 반영됩니다.</p>
        <button className="primary pg-start" onClick={() => onEditTreatment("home")}>
          사이트 편집 시작 (병원 소개부터) →
        </button>
      </div>

      <div className="pg-group">
        <div className="pg-group-h">진료 영역</div>
        <div className="pg-cards">
          {treatments.map((t) => (
            <button key={t.slug} className="pg-card" onClick={() => onEditTreatment(t.slug)}>
              <div className="pg-card-name">{t.name}</div>
              <div className="pg-card-tagline">{t.tagline}</div>
              <div className="pg-card-meta">
                치료 방법 {t.methods.length} · 질문 {t.faq.length}
                <span className="pg-card-go">수정 ›</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pg-group">
        <div className="pg-group-h">기타 페이지</div>
        <div className="pg-cards">
          <button className="pg-card" onClick={() => onEditTreatment("home")}>
            <div className="pg-card-name">병원 소개 (메인)</div>
            <div className="pg-card-tagline">홈 히어로 · 통계 · 원장 · 진료 안내</div>
            <div className="pg-card-meta"><span className="pg-card-go">수정 ›</span></div>
          </button>
          <button className="pg-card" onClick={() => onEditTreatment("visit-guide")}>
            <div className="pg-card-name">첫 방문 안내</div>
            <div className="pg-card-tagline">진료 절차 · 준비물</div>
            <div className="pg-card-meta"><span className="pg-card-go">수정 ›</span></div>
          </button>
        </div>
      </div>
    </div>
  );
}
