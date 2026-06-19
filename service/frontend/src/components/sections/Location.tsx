import { MapPin, Train, Phone, Bus, Car } from "lucide-react";

const ADDRESS = "서울특별시 동작구 사당동 254-5 이수한의원";
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(
  ADDRESS
)}&z=17&hl=ko&output=embed`;

export function Location() {
  return (
    <section id="location" className="bg-white border-t border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 py-16 md:py-24">
        <header className="grid lg:grid-cols-12 gap-6 lg:gap-12 pb-8 md:pb-12 border-b border-ink-200">
          <div className="lg:col-span-5">
            <div className="eyebrow">Section · 오시는 길</div>
            <h2 className="mt-3 font-serif text-3xl md:text-[44px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
              남성역 1번 출구
              <br />
              도보 1분
            </h2>
          </div>
          <p className="lg:col-span-6 lg:col-start-7 text-base md:text-lg text-ink-700 leading-[1.78] self-end">
            지하철 7호선 남성역 1번 출구를 나오면 바로 보입니다.
            대중교통으로 편하게 방문하실 수 있습니다.
          </p>
        </header>

        <div className="grid lg:grid-cols-5 gap-0">
          <div className="lg:col-span-3 border border-ink-300 lg:border-r-0 overflow-hidden">
            <iframe
              title="이수한의원 약도"
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-[360px] lg:h-full min-h-[360px] border-0"
            />
          </div>

          <div className="lg:col-span-2 border border-ink-300 lg:border-t lg:border-b">
            <div className="px-6 py-5 border-b border-ink-200">
              <div className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-herb-700 font-semibold">
                <MapPin size={14} />
                주소
              </div>
              <div className="mt-2 text-base font-semibold text-ink-900">
                서울특별시 동작구 사당동 254-5
              </div>
              <div className="text-xs text-ink-500 mt-1">
                지번 · 도로명 주소는 추후 보강
              </div>
            </div>

            <dl className="divide-y divide-ink-200">
              <div className="px-6 py-5">
                <dt className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-herb-700 font-semibold">
                  <Train size={14} />
                  지하철
                </dt>
                <dd className="mt-2 text-sm text-ink-900">
                  7호선 <strong className="font-semibold">남성역 1번 출구</strong> · 도보 1분
                </dd>
              </div>
              <div className="px-6 py-5">
                <dt className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-herb-700 font-semibold">
                  <Bus size={14} />
                  버스
                </dt>
                <dd className="mt-2 text-sm text-ink-900">
                  남성역 정류장 인근 정차 노선 다수
                </dd>
              </div>
              <div className="px-6 py-5">
                <dt className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase text-herb-700 font-semibold">
                  <Car size={14} />
                  자가용
                </dt>
                <dd className="mt-2 text-sm text-ink-900">
                  인근 공영주차장 이용 (전화 문의)
                </dd>
              </div>
            </dl>

            <a
              href="tel:0285841075"
              className="block px-6 py-6 bg-ink-900 text-white hover:bg-herb-700 transition-colors"
            >
              <div className="flex items-center gap-2 text-[12px] tracking-[0.2em] uppercase font-semibold text-white/70">
                <Phone size={14} />
                전화 예약 / 길 안내
              </div>
              <div className="mt-3 font-serif text-[28px] font-black tabular-nums leading-none">
                02-584-1075
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
