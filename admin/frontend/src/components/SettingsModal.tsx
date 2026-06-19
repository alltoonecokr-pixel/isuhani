import { useState } from "react";
import type { Config } from "../types";

type Props = {
  cfg: Config;
  // force=true: 첫 진입 로그인(닫기 불가). false: 일반 연결 설정.
  force: boolean;
  onSubmit: (cfg: Config) => void;
  onClose: () => void;
  onGuide: () => void;
};

export function SettingsModal({ cfg, force, onSubmit, onClose, onGuide }: Props) {
  const [pass, setPass] = useState(cfg.pass);
  const [user, setUser] = useState(cfg.user);
  const [url, setUrl] = useState(cfg.url);

  const submit = () => {
    onSubmit({
      url: url.trim().replace(/\/$/, ""),
      user: user.trim() || "admin",
      pass,
    });
  };

  return (
    <div
      className="modal-bg"
      onClick={(e) => {
        // 강제 로그인 모드에서는 배경 클릭으로 닫히지 않음
        if (e.target === e.currentTarget && !force) onClose();
      }}
    >
      <div className="modal">
        {force && (
          <div style={{ marginBottom: 6 }}>
            <div className="lb-logo">잎</div>
            <div className="lb-title">이수한의원</div>
            <div className="lb-sub">건강 저널 콘텐츠 관리</div>
          </div>
        )}
        <h3>{force ? "관리자 로그인" : "연결 설정"}</h3>
        {force && (
          <p
            style={{
              color: "var(--ink-500)",
              fontSize: 13.5,
              lineHeight: 1.55,
              margin: "-6px 0 16px 0",
            }}
          >
            병원에서 받은 비밀번호를 입력하세요. 한 번 로그인하면 이
            브라우저에서는 다음부터 묻지 않고 바로 글을 작성·관리할 수 있습니다.
          </p>
        )}
        <div style={{ marginBottom: 12 }}>
          <span className="field-label">비밀번호</span>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            autoFocus
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>
        <details style={{ marginBottom: 6 }} open={!force}>
          <summary
            style={{
              cursor: "pointer",
              color: "var(--ink-500)",
              fontSize: 13,
              userSelect: "none",
            }}
          >
            고급 설정
          </summary>
          <div style={{ marginTop: 12 }}>
            <span className="field-label">사용자명</span>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </div>
          <div style={{ marginTop: 10 }}>
            <span className="field-label">CMS API URL</span>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </details>
        <div className="modal-actions">
          <button
            type="button"
            onClick={onGuide}
            style={{
              marginRight: "auto",
              background: "none",
              border: "none",
              boxShadow: "none",
              color: "var(--herb)",
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            📖 사용 설명서
          </button>
          {!force && <button onClick={onClose}>취소</button>}
          <button className="herb" onClick={submit}>
            {force ? "로그인" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
