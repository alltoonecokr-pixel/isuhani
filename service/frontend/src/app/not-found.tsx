import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="max-w-2xl mx-auto px-6 md:px-8 py-24 md:py-32 text-center">
        <div className="text-[12px] tracking-[0.3em] uppercase text-herb-700 font-bold mb-4">
          404 · Page Not Found
        </div>
        <h1 className="font-serif text-4xl md:text-[56px] font-black tracking-[-0.025em] text-ink-900 leading-[1.1]">
          이 페이지를
          <br />
          찾을 수 없습니다.
        </h1>
        <p className="mt-6 text-base md:text-lg text-ink-700 leading-[1.78]">
          주소가 변경되었거나 글이 다른 카테고리로 이동했을 수 있습니다.
          <br />
          아래에서 다른 글을 찾아보세요.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-ink-900 text-white text-sm font-semibold hover:bg-herb-700 transition-colors"
          >
            건강 칼럼 전체 보기
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-3 border border-ink-900 text-ink-900 text-sm font-semibold hover:bg-ink-900 hover:text-white transition-colors"
          >
            병원 소개
          </Link>
        </div>
        <div className="mt-12 pt-8 border-t border-ink-200 text-[12px] tracking-[0.2em] uppercase text-ink-500 tabular-nums">
          이수한의원 · 매일의 건강 이야기 · Since 1986
        </div>
      </div>
    </section>
  );
}
