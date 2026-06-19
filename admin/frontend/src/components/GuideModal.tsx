type Props = { onClose: () => void };

const STEPS: [string, JSX.Element][] = [
  [
    "로그인",
    <>
      처음 들어오면 <b>관리자 비밀번호</b>를 한 번만 입력하면 됩니다. 이
      컴퓨터·브라우저에서는 다음부터 묻지 않습니다.
    </>,
  ],
  [
    "새 글 쓰기",
    <>
      오른쪽 위 <b>[+ 새 글 작성]</b> → 제목 입력 → <b>카테고리</b> 선택 → 내용
      작성(굵게·소제목·사진·유튜브 넣기 가능) → 아래 <b>[발행]</b>.
    </>,
  ],
  [
    "저장 vs 발행",
    <>
      <b>저장</b> = 임시 보관(홈페이지에 안 보임). <b>발행</b> = 홈페이지에 올림.
      보통 <b>[발행]</b>을 누르세요.
    </>,
  ],
  [
    "사진·영상 넣기",
    <>
      본문에서 <b>사진</b> 버튼으로 이미지 업로드, <b>영상</b>은 유튜브 주소를
      붙여넣으면 됩니다.
    </>,
  ],
  [
    "글 수정·삭제",
    <>
      목록에서 글 오른쪽 <b>[수정]</b> 또는 <b>[삭제]</b>. 수정 후 다시{" "}
      <b>[발행]</b>.
    </>,
  ],
  [
    "발행하면 언제 보이나요?",
    <>
      발행 후 홈페이지가 자동으로 다시 만들어집니다. <b>약 2~5분 뒤</b>{" "}
      isuclinic.co.kr 에 반영됩니다. 바로 안 보여도 잠시 기다렸다 새로고침하세요.
    </>,
  ],
];

export function GuideModal({ onClose }: Props) {
  return (
    <div
      className="modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal guide">
        <h3>📖 건강 저널 관리 — 사용 설명서</h3>
        <p style={{ color: "var(--ink-500)", fontSize: 13.5, margin: "-6px 0 14px" }}>
          이 페이지에서 홈페이지(건강 저널)의 글을 직접 쓰고 고칠 수 있습니다.
          처음이시면 아래 순서대로 따라 하세요.
        </p>
        {STEPS.map(([title, body], i) => (
          <div className="g-step" key={i}>
            <span className="g-no">{i + 1}</span>
            <div>
              <b>{title}</b>
              <br />
              {body}
            </div>
          </div>
        ))}
        <div className="g-tip">
          <b>알아두면 좋아요</b>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.7 }}>
            <li>
              제목에 <b>“안내 · 휴진 · 명절”</b> 같은 말이 들어간 공지글은 홈{" "}
              <b>메인 대표 자리</b>에서 자동으로 빠지고, 건강 칼럼이 대표로
              유지됩니다(공지도 목록엔 그대로).
            </li>
            <li>사진이 너무 크면 페이지가 느려질 수 있어요. 적당한 크기를 권장합니다.</li>
            <li>
              상단 <b>[카테고리]</b>에서 분류를 관리할 수 있습니다.
            </li>
          </ul>
        </div>
        <div className="modal-actions">
          <button className="herb" onClick={onClose}>
            확인했어요
          </button>
        </div>
      </div>
    </div>
  );
}
