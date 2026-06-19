import { MapPin, Phone } from "lucide-react";

export function Hero() {
  return (
    <section id="hero" className="bg-white">
      <div className="max-w-container mx-auto px-4 md:px-8 pt-10 md:pt-14 pb-14 md:pb-20">
        {/* 발행일 라인 */}
        <div className="flex items-center justify-between text-[12px] tracking-[0.2em] uppercase text-ink-500 border-b border-ink-200 pb-3">
          <span>South Korea · Seoul · Dongjak-gu</span>
          <span className="tabular-nums">남성역 1번 출구 · 도보 1분</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 mt-10 md:mt-14">
          {/* 헤드라인 */}
          <div className="lg:col-span-7">
            <div className="eyebrow mb-4">진료 시작 1986</div>
            <h1 className="font-serif text-[44px] sm:text-[56px] md:text-[68px] lg:text-[80px] font-black tracking-[-0.03em] text-ink-900 leading-[1.04]">
              남성역 1번 출구,
              <br />
              <span className="text-herb-700">이수한의원</span>입니다.
            </h1>
            <p className="mt-7 md:mt-9 max-w-xl text-base md:text-lg text-ink-700 leading-[1.78]">
              원장 3인의 디테일한 진료, 야간·주말 진료로
              바쁜 일상 속 든든한 동네 한의원이 되겠습니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="tel:0285841075"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-ink-900 text-white text-sm font-semibold hover:bg-herb-700 transition-colors"
              >
                <Phone size={16} />
                <span className="tabular-nums">02-584-1075</span>
                <span className="opacity-80">전화 예약</span>
              </a>
              <a
                href="#location"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-ink-900 text-ink-900 text-sm font-semibold hover:bg-ink-900 hover:text-white transition-colors"
              >
                <MapPin size={16} />
                오시는 길
              </a>
            </div>
          </div>

          {/* 인포 사이드바 */}
          <aside className="lg:col-span-5 lg:border-l lg:border-ink-200 lg:pl-12">
            <div className="eyebrow mb-3">At a glance</div>
            <dl className="border-y border-ink-900 divide-y divide-ink-200">
              <InfoRow label="평일" value="09:30 – 20:00" sub="야간진료" />
              <InfoRow label="토 · 일" value="09:30 – 15:00" sub="주말진료" />
              <InfoRow label="공휴일" value="휴진" />
              <InfoRow label="원장" value="3인 진료" sub="문 · 나 · 이 원장" />
            </dl>
            <p className="mt-5 text-xs text-ink-500 leading-relaxed">
              마지막 접수는 진료 종료 30분 전 마감됩니다. 점심시간은 전화로 안내드립니다.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-baseline justify-between py-3.5">
      <dt className="text-[12px] tracking-[0.2em] uppercase text-ink-500">{label}</dt>
      <dd className="flex items-baseline gap-3 text-right">
        {sub && (
          <span className="text-[12px] tracking-[0.18em] uppercase text-ink-400">{sub}</span>
        )}
        <span className="text-sm font-semibold text-ink-900 tabular-nums">{value}</span>
      </dd>
    </div>
  );
}
