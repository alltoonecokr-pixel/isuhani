import { useState } from "react";

type Props = {
  categories: string[];
  onSave: (cats: string[]) => Promise<void> | void;
  onClose: () => void;
};

export function CategoriesModal({ categories, onSave, onClose }: Props) {
  const [cats, setCats] = useState<string[]>(categories);
  const [newCat, setNewCat] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const add = () => {
    const v = newCat.trim();
    if (v && !cats.includes(v)) {
      setCats([...cats, v]);
      setNewCat("");
    }
  };
  const remove = (i: number) => setCats(cats.filter((_, idx) => idx !== i));

  // 마우스로 끌어 순서 변경 — 드래그 중인 항목을 지나가는 줄 위치로 즉시 이동
  const reorder = (from: number, to: number) => {
    setCats((prev) => {
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div
      className="modal-bg"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <h3>카테고리 관리</h3>
        <p style={{ margin: "2px 0 12px", fontSize: 12.5, color: "var(--ink-400)" }}>
          줄을 마우스로 끌어서 순서를 바꿀 수 있어요.
        </p>
        <div>
          {cats.map((c, i) => (
            <div
              className={"row-cat" + (dragIdx === i ? " dragging" : "")}
              key={c}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIdx === null || dragIdx === i) return;
                reorder(dragIdx, i);
                setDragIdx(i);
              }}
              onDrop={(e) => e.preventDefault()}
              onDragEnd={() => setDragIdx(null)}
            >
              <span className="cat-grip" aria-hidden title="끌어서 순서 변경">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="6" cy="3" r="1.4" /><circle cx="10" cy="3" r="1.4" />
                  <circle cx="6" cy="8" r="1.4" /><circle cx="10" cy="8" r="1.4" />
                  <circle cx="6" cy="13" r="1.4" /><circle cx="10" cy="13" r="1.4" />
                </svg>
              </span>
              <span className="name">{c}</span>
              <button className="danger" onClick={() => remove(i)}>
                삭제
              </button>
            </div>
          ))}
        </div>
        <div className="add-row">
          <input
            type="text"
            placeholder="새 카테고리 이름"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="primary" onClick={add}>
            추가
          </button>
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>닫기</button>
          <button className="herb" onClick={() => onSave(cats)}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
