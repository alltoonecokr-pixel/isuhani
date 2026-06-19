import { Phone } from "lucide-react";

const SCHEDULE = [
  { day: "월", time: "09:30 – 20:00", note: "야간진료" },
  { day: "화", time: "09:30 – 20:00", note: "야간진료" },
  { day: "수", time: "09:30 – 20:00", note: "야간진료" },
  { day: "목", time: "09:30 – 20:00", note: "야간진료" },
  { day: "금", time: "09:30 – 20:00", note: "야간진료" },
  { day: "토", time: "09:30 – 15:00", note: "주말진료" },
  { day: "일", time: "09:30 – 15:00", note: "주말진료" },
  { day: "공휴일", time: "휴진", note: "" },
];

export function Hours() {
  return (
    <section id="hours" className="bg-white border-t border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="eyebrow">Section · 진료 시간</div>
            <h2 className="mt-3 font-serif text-3xl md:text-[44px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
              평일 야간진료,
              <br />
              토 · 일 진료
            </h2>
            <p className="mt-6 text-base text-ink-700 leading-[1.78]">
              직장인과 학생도 편하게 방문할 수 있도록 평일은 저녁 8시까지,
              주말에도 진료합니다.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-ink-700">
              <li className="flex items-baseline gap-2">
                <span className="text-herb-700">·</span>
                <span>점심시간은 별도 운영되며 전화로 안내드립니다.</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-herb-700">·</span>
                <span>마지막 접수는 진료 종료 30분 전 마감됩니다.</span>
              </li>
              <li className="flex items-baseline gap-2">
                <span className="text-herb-700">·</span>
                <span>공휴일 휴진 일정은 블로그 공지를 참고해 주세요.</span>
              </li>
            </ul>

            <a
              href="tel:0285841075"
              className="mt-8 inline-flex items-center gap-2 text-ink-900 hover:text-herb-700"
            >
              <Phone size={16} />
              <span className="text-sm font-semibold tracking-[0.05em]">
                전화 예약 ·
              </span>
              <span className="font-serif text-lg font-black tabular-nums">
                02-584-1075
              </span>
            </a>
          </div>

          <div className="lg:col-span-7">
            <div className="border border-ink-300">
              <div className="flex items-baseline justify-between px-5 md:px-7 py-3.5 border-b border-ink-300 bg-ink-100">
                <span className="text-[12px] tracking-[0.2em] uppercase text-ink-900 font-bold">
                  주간 진료시간표
                </span>
                <span className="text-[12px] tracking-[0.18em] uppercase text-ink-500 tabular-nums">
                  Mon – Sun
                </span>
              </div>
              <table className="w-full">
                <tbody>
                  {SCHEDULE.map((row, i) => (
                    <tr
                      key={row.day}
                      className={[
                        "transition-colors duration-200 hover:bg-ink-50",
                        i !== SCHEDULE.length - 1 ? "border-b border-ink-200" : "",
                        row.time === "휴진" ? "bg-ink-50/50" : "",
                      ].join(" ")}
                    >
                      <td className="px-5 md:px-7 py-4 text-sm font-bold text-ink-900 w-24">
                        {row.day}
                      </td>
                      <td className="px-5 md:px-7 py-4 text-[12px] tracking-[0.18em] uppercase text-ink-500 hidden sm:table-cell">
                        {row.note}
                      </td>
                      <td
                        className={[
                          "px-5 md:px-7 py-4 text-right tabular-nums font-semibold",
                          row.time === "휴진" ? "text-ink-500" : "text-ink-900 text-base",
                        ].join(" ")}
                      >
                        {row.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
