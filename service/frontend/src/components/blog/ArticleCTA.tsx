import { CalendarCheck, MapPin, MessageCircle, Phone } from "lucide-react";
import { BOOKING_URL, PLACE_URL, TALK_URL, TEL, TEL_HREF } from "@/lib/site";

/**
 * 글 하단 예약·상담 CTA — 검색 유입 독자를 내원으로 잇는 다리.
 * 진료 안내(treatmentLink)보다 앞, 본문 종료 직후에 배치한다.
 */
export function ArticleCTA() {
  return (
    <section className="border-t border-ink-200 bg-white">
      <div className="max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-12">
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-ink-400 mb-2">
          진료 예약 · 상담
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h3 className="font-serif text-[22px] md:text-[25px] font-black tracking-[-0.02em] text-ink-900 leading-[1.3]">
              비슷한 증상으로 고민 중이신가요?
            </h3>
            <p className="mt-2 text-[14px] text-ink-500 leading-relaxed">
              사당동 · 7호선 남성역 1번 출구 앞 · {TEL}
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> · </span>
              토요일 진료, 상담은 부담 없이 문의하세요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white text-[13.5px] font-semibold hover:bg-herb-700 transition-colors"
            >
              <CalendarCheck size={15} strokeWidth={2.4} />
              네이버 예약
            </a>
            <a
              href={TALK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 border border-ink-300 text-ink-900 text-[13.5px] font-semibold hover:border-ink-900 transition-colors"
            >
              <MessageCircle size={15} strokeWidth={2.4} />
              톡톡 상담
            </a>
            <a
              href={PLACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 border border-ink-300 text-ink-900 text-[13.5px] font-semibold hover:border-ink-900 transition-colors"
            >
              <MapPin size={15} strokeWidth={2.4} />
              오시는 길
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 글 상세 모바일 하단 고정 바 — 예약(주 액션) + 전화 + 톡톡.
 * 홈 랜딩의 StickyMobileCTA와 별개: 글 독자는 예약 의도가 더 명확하다.
 */
export function ArticleStickyCTA() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-ink-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-12px_rgba(26,20,16,0.18)]"
      aria-label="예약·상담 빠른 액션"
    >
      <div className="flex items-stretch divide-x divide-ink-100">
        <a
          href={BOOKING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[14.5px] font-bold text-white bg-ink-900 active:bg-herb-700 transition-colors"
          aria-label="네이버 예약하기"
        >
          <CalendarCheck size={16} strokeWidth={2.6} />
          네이버 예약
        </a>
        <a
          href={TEL_HREF}
          className="flex items-center justify-center gap-1.5 px-5 py-3.5 text-[13.5px] font-bold text-ink-900 active:bg-paper-100 transition-colors shrink-0"
          aria-label={`${TEL} 전화 걸기`}
        >
          <Phone size={15} strokeWidth={2.6} className="text-herb-700" />
          전화
        </a>
        <a
          href={TALK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-5 py-3.5 text-[13.5px] font-bold text-ink-900 active:bg-paper-100 transition-colors shrink-0"
          aria-label="네이버 톡톡 상담"
        >
          <MessageCircle size={15} strokeWidth={2.6} className="text-herb-700" />
          톡톡
        </a>
      </div>
    </div>
  );
}
