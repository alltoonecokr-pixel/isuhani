"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// /clinic 은 /home(병원 소개)으로 통합됨. 옛 링크·북마크 호환용 리다이렉트.
// 정적 export 환경에서도 동작하도록 클라이언트 리다이렉트를 쓴다.
export default function ClinicRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-6">
      <p className="text-ink-500 text-[15px]">병원 소개 페이지로 이동하고 있어요…</p>
      <Link
        href="/home"
        className="inline-flex items-center rounded-full bg-herb-700 px-5 py-2.5 text-[14px] font-bold text-white hover:bg-herb-900 transition-colors"
      >
        바로 가기
      </Link>
    </main>
  );
}
