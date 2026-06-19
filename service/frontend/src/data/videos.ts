import type { VideoItem } from "@/components/blog/VideoSection";

/**
 * 메인 페이지 비디오 섹션에 노출할 유튜브 영상 목록.
 * 출처: 유튜브 채널 @isu_hani (남성역_이수한의원) — 최신 영상.
 * id = YouTube video ID (URL의 ?v= 또는 youtu.be/ 뒤 부분)
 * 채널에 새 영상이 올라오면 이 목록만 갱신.
 */
export const VIDEOS: VideoItem[] = [
  {
    id: "n4X0wqgGpgc",
    title: "장시간 공부에도 집중력을 잃지 않는 방법",
    category: "건강관리",
  },
  {
    id: "_0riJP9mQqY",
    title: "자세가 무너질 때 생기는 의외의 증상들",
    category: "체형 · 척추",
  },
  {
    id: "puuTlO_HSfw",
    title: "어깨 통증, 사실은 목에서 시작됩니다",
    category: "체형 · 척추",
  },
  {
    id: "FQdV-o0WD1M",
    title: "손발이 얼음처럼 차갑다면… 수족냉증 신호입니다",
    category: "건강관리",
  },
  {
    id: "7RjGKDvmbw8",
    title: "척추 휘는 10대 급증! 방치하면 평생 고생합니다",
    category: "체형 · 척추",
  },
  {
    id: "jN7KaBxZ17g",
    title: "산후풍, 출산 후 방심하면 평생 고생합니다",
    category: "여성 · 산후조리",
  },
  {
    id: "E-qOPxMwahs",
    title: "소아비만 방치하면 성인병 폭탄 — 당뇨·고혈압까지",
    category: "소아 성장",
  },
  {
    id: "qHBr_5GiABY",
    title: "여름 건강관리 핵심 — 저녁 운동과 숙면 비밀",
    category: "건강관리",
  },
  {
    id: "HmABf67DxQ4",
    title: "소화 안 될 때, 고기 절대 피하세요 — 위 건강 핵심 습관",
    category: "건강관리",
  },
];

/** 유튜브 채널 (구독·전체 영상) */
export const YOUTUBE_CHANNEL = "https://www.youtube.com/@isu_hani";
