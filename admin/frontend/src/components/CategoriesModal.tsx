import { useState } from "react";

type Props = {
  categories: string[];
  onSave: (cats: string[]) => Promise<void> | void;
  onClose: () => void;
};

export function CategoriesModal({ categories, onSave, onClose }: Props) {
  const [cats, setCats] = useState<string[]>(categories);
  const [newCat, setNewCat] = useState("");

  const add = () => {
    const v = newCat.trim();
    if (v && !cats.includes(v)) {
      setCats([...cats, v]);
      setNewCat("");
    }
  };
  const remove = (i: number) => setCats(cats.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= cats.length) return;
    const next = cats.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setCats(next);
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
        <div>
          {cats.map((c, i) => (
            <div className="row-cat" key={`${c}-${i}`}>
              <span className="name">{c}</span>
              <button
                className="tiny ghost"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                ↑
              </button>
              <button
                className="tiny ghost"
                disabled={i === cats.length - 1}
                onClick={() => move(i, 1)}
              >
                ↓
              </button>
              <button className="tiny danger" onClick={() => remove(i)}>
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
