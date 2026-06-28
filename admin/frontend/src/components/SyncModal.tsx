// 블로그 동기화 진행/결과 모달 — 무엇이 일어나는지, 무엇을 가져왔는지 명확히 보여준다.

export type SyncState = {
  open: boolean;
  phase: "running" | "result" | "error";
  imported: { logNo: string; title: string; date: string; category: string }[];
  found: number;
  newCount: number;
  message?: string;
};

export const initialSync: SyncState = { open: false, phase: "running", imported: [], found: 0, newCount: 0 };

export function SyncModal({ state, onClose }: { state: SyncState; onClose: () => void }) {
  if (!state.open) return null;
  const { phase, imported, newCount, message } = state;

  return (
    <div className="modal-bg" onClick={(e) => { if (e.target === e.currentTarget && phase !== "running") onClose(); }}>
      <div className="modal sync-modal">
        <div className="sync-head">
          <span className={"sync-spin" + (phase === "running" ? " on" : "")}>↻</span>
          <h3>블로그 동기화</h3>
        </div>

        {phase === "running" && (
          <p className="sync-msg">
            네이버 블로그에서 새 글을 확인하고, 글과 사진을 사이트로 가져오는 중이에요.
            <br />사진이 많으면 조금 걸릴 수 있어요. 잠시만 기다려 주세요…
          </p>
        )}

        {phase === "result" && imported.length > 0 && (
          <>
            <p className="sync-msg">
              새 글 <b>{imported.length}편</b>을 가져왔어요. 곧 홈페이지에 올라갑니다(발행 중).
              {newCount > imported.length && <><br />아직 더 있어요 — 동기화를 한 번 더 누르면 이어서 가져옵니다.</>}
            </p>
            <div className="sync-list">
              {imported.map((p) => (
                <div className="sync-row" key={p.logNo}>
                  <span className="sync-date">{p.date}</span>
                  <span className="sync-title">{p.title}</span>
                  <span className="sync-cat">{p.category}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {phase === "result" && imported.length === 0 && (
          <p className="sync-msg">
            이미 최신 상태입니다. 네이버 블로그에 새로 올라온 글이 없어요.
          </p>
        )}

        {phase === "error" && (
          <p className="sync-msg">
            {message || "처리에 시간이 걸렸어요. 목록을 확인한 뒤 한 번 더 눌러 이어주세요."}
          </p>
        )}

        <div className="modal-actions">
          <button className="herb" disabled={phase === "running"} onClick={onClose}>
            {phase === "running" ? "가져오는 중…" : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
