"use client";

import { Phone, MapPin, MessageCircle } from "lucide-react";
import Link from "next/link";

/**
 * 모바일 하단 고정 CTA — 시니어 친화 (NN/G 권장).
 * 한국 사용자 기대치: 전화 + 카카오 + 길찾기
 * 카카오 채널 미설정 시 채널 가입 안내 페이지로 우회 (chat fallback).
 */
const KAKAO_CHANNEL_URL = "http://pf.kakao.com/_isuhani"; // 추후 실제 채널로 교체

export function StickyMobileCTA() {
  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-ink-200 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-12px_rgba(26,20,16,0.18)]"
      aria-label="빠른 액션"
    >
      <div className="flex items-stretch divide-x divide-ink-100">
        <a
          href="tel:0285841075"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[14.5px] font-bold text-ink-900 active:bg-paper-100 transition-colors"
          aria-label="02-584-1075 전화 걸기"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-herb-700 text-white">
            <Phone size={15} strokeWidth={2.6} />
          </span>
          <span className="tabular-nums">전화</span>
        </a>
        <a
          href={KAKAO_CHANNEL_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-[14.5px] font-bold text-ink-900 active:bg-paper-100 transition-colors"
          aria-label="카카오톡 문의"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#fee500] text-[#3d2f1f]">
            <MessageCircle size={15} strokeWidth={2.6} />
          </span>
          <span>카카오톡</span>
        </a>
        <Link
          href="/clinic#location"
          className="flex items-center justify-center gap-1.5 px-4 py-3.5 text-[13.5px] font-bold text-ink-700 active:bg-paper-100 transition-colors shrink-0"
          aria-label="오시는 길 보기"
        >
          <MapPin size={15} className="text-ink-500" />
          길찾기
        </Link>
      </div>
    </div>
  );
}
