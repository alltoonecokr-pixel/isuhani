import Link from "next/link";

const SITEMAP = [
  { label: "병원 소개", href: "/home" },
  { label: "진료 영역", href: "/home#treatments" },
  { label: "의료진", href: "/home#doctors" },
  { label: "진료시간 · 오시는 길", href: "/home#visit" },
  { label: "처음 방문 가이드", href: "/visit-guide" },
  { label: "건강 저널", href: "/journal" },
];

const BOOKING_URL = "https://booking.naver.com/booking/13/bizes/331349?area=pll";
const TALK_URL = "https://talk.naver.com/ct/w4vt4b";
const PLACE_URL = "https://map.naver.com/p/entry/place/13104608";
const YOUTUBE_URL = "https://www.youtube.com/@isu_hani";
const INSTAGRAM_URL = "https://www.instagram.com/isuclinic/";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white border-t border-ink-200">
      <div className="max-w-container mx-auto px-4 md:px-8 py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          {/* 브랜드 */}
          <div className="md:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <span
                aria-hidden
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-herb-50 group-hover:bg-herb-700 transition-colors"
              >
                <svg viewBox="0 0 32 32" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-herb-700 group-hover:text-white transition-colors">
                  <path d="M6 26 C 8 16, 16 8, 26 6 C 24 16, 16 24, 6 26 Z" />
                  <path d="M9 23 L 22 10" />
                </svg>
              </span>
              <span className="font-serif text-[26px] font-bold tracking-[-0.025em] text-ink-900 group-hover:text-herb-700 transition-colors">
                이수한의원
              </span>
            </Link>
            <div className="mt-2 text-[12px] tracking-[0.2em] uppercase text-ink-500">
              매일의 건강 이야기 · Since 1986
            </div>
            <p className="mt-5 text-sm text-ink-700 leading-[1.78]">
              남성역 1번 출구 앞 · 사당동 한의원.
              <br />
              원장 3인이 직접 쓰는 건강 칼럼과 진료 이야기.
            </p>
            <a
              href="tel:0285841075"
              className="mt-5 inline-flex items-baseline gap-2 hover:text-herb-700 transition-colors"
            >
              <span className="text-[12px] tracking-[0.2em] uppercase text-ink-500">전화</span>
              <span className="font-serif text-xl font-black tabular-nums text-ink-900">
                02-584-1075
              </span>
            </a>

            {/* 예약 · 채널 바로가기 */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-herb-700 px-4 py-2 text-[13px] font-bold text-white hover:bg-herb-900 transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="12" height="11" rx="2" />
                  <path d="M2 6.5h12M5 1.5v3M11 1.5v3M6 10l1.4 1.4L10 8.8" />
                </svg>
                네이버 예약
              </a>
              <SocialIcon href={TALK_URL} label="네이버 톡톡으로 문의하기">
                <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C5.9 3 2.5 5.7 2.5 9c0 2.1 1.4 4 3.5 5.1-.2.7-.6 1.9-.7 2.2-.1.4.1.4.3.3.2-.1 2.3-1.5 3.1-2.1.5.1 1 .1 1.3.1 4.1 0 7.5-2.7 7.5-6.6S14.1 3 10 3z"/></svg>
              </SocialIcon>
              <SocialIcon href={PLACE_URL} label="네이버 지도에서 길찾기">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17.5s5.5-4.7 5.5-9A5.5 5.5 0 1 0 4.5 8.5c0 4.3 5.5 9 5.5 9z"/><circle cx="10" cy="8.3" r="1.9"/></svg>
              </SocialIcon>
              <SocialIcon href={YOUTUBE_URL} label="이수한의원 유튜브 보기">
                <svg width="17" height="17" viewBox="0 0 20 20" fill="currentColor"><path d="M18.2 6.4a2.1 2.1 0 0 0-1.5-1.5C15.4 4.6 10 4.6 10 4.6s-5.4 0-6.7.3A2.1 2.1 0 0 0 1.8 6.4C1.5 7.7 1.5 10 1.5 10s0 2.3.3 3.6a2.1 2.1 0 0 0 1.5 1.5c1.3.3 6.7.3 6.7.3s5.4 0 6.7-.3a2.1 2.1 0 0 0 1.5-1.5c.3-1.3.3-3.6.3-3.6s0-2.3-.3-3.6zM8.4 12.5v-5l4.3 2.5-4.3 2.5z"/></svg>
              </SocialIcon>
              <SocialIcon href={INSTAGRAM_URL} label="이수한의원 인스타그램 보기">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2.5" y="2.5" width="15" height="15" rx="4.5"/><circle cx="10" cy="10" r="3.6"/><circle cx="14.3" cy="5.7" r="1" fill="currentColor" stroke="none"/></svg>
              </SocialIcon>
            </div>
          </div>

          {/* 사이트맵 */}
          <nav className="md:col-span-3" aria-label="사이트맵">
            <div className="text-[12px] tracking-[0.2em] uppercase text-ink-500 font-semibold mb-4">
              사이트맵
            </div>
            <ul className="space-y-2.5 text-sm">
              {SITEMAP.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-900 hover:text-herb-700 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 사업자 정보 */}
          <dl className="md:col-span-5 text-sm space-y-2">
            <div className="text-[12px] tracking-[0.2em] uppercase text-ink-500 font-semibold mb-4">
              사업자 정보
            </div>
            <Row label="상호" value="이수한의원" />
            <Row label="대표" value="문학진" />
            <Row label="주소" value="서울특별시 동작구 사당동 254-5" />
            <Row label="사업자번호" value="121-90-96920" mono />
            <Row
              label="이메일"
              value={
                <a href="mailto:isuhani@naver.com" className="hover:text-herb-700 transition-colors">
                  isuhani@naver.com
                </a>
              }
            />
            <Row
              label="유튜브"
              value={
                <a
                  href="https://www.youtube.com/@isu_hani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-herb-700 transition-colors"
                >
                  youtube.com/@isu_hani
                </a>
              }
            />
            <Row
              label="진료시간"
              value={
                <span className="tabular-nums">
                  평일 09:30–20:00 · 주말 09:30–15:00 · 공휴일 휴진
                </span>
              }
            />
          </dl>
        </div>

        <div className="mt-14 pt-6 border-t border-ink-200 space-y-3 text-[12px] tracking-[0.18em] uppercase text-ink-500">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2">
            <span>© {year} 이수한의원. All rights reserved.</span>
            <span className="tabular-nums">Seoul · Dongjak-gu · Sadang-dong</span>
          </div>
          <div className="text-[10px] tracking-[0.2em] text-ink-400">
            Founded 1986 · Published from Sadang-dong, Seoul · Editor-in-chief 문학진
          </div>
        </div>
      </div>
    </footer>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-4">
      <dt className="w-24 shrink-0 text-[12px] tracking-[0.2em] uppercase text-ink-500">
        {label}
      </dt>
      <dd className={["text-ink-900", mono ? "tabular-nums" : ""].join(" ")}>{value}</dd>
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink-200 text-ink-500 hover:bg-herb-700 hover:border-herb-700 hover:text-white transition-colors"
    >
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-3 py-2 text-[13px] font-semibold text-white opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] z-30">
        {label}
        <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-ink-900" />
      </span>
    </a>
  );
}
