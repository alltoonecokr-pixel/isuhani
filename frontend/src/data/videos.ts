import type { VideoItem } from "@/components/blog/VideoSection";

/**
 * 메인 페이지 비디오 섹션에 노출할 유튜브 영상 목록.
 * id = YouTube video ID (URL의 ?v= 또는 youtu.be/ 뒤 부분)
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
];
