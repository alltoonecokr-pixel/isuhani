import Link from "next/link";

const SITEMAP = [
  { label: "병원 소개", href: "/home" },
  { label: "진료 영역", href: "/home#treatments" },
  { label: "의료진", href: "/home#doctors" },
  { label: "진료시간 · 오시는 길", href: "/home#visit" },
  { label: "처음 방문 가이드", href: "/visit-guide" },
  { label: "건강 저널", href: "/journal" },
];

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
