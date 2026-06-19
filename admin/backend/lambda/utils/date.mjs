// 날짜 변환 유틸리티

export function todayLabel(d = new Date()) {
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
}

export function isoDate(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// "2026. 4. 24." → "2026-04-24"
export function parseAddDate(s) {
  if (!s) return "";
  const m = s.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : "";
}

// "2026-04-24" → "2026. 4. 24."
export function isoToAddDate(iso) {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  return m ? `${m[1]}. ${parseInt(m[2], 10)}. ${parseInt(m[3], 10)}.` : "";
}
