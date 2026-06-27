import { LiveFallback } from "@/components/blog/LiveFallback";

// 정적 HTML이 없는 경로(=갓 발행된 글 포함)에서 CloudFront가 404.html로 서빙.
// LiveFallback이 URL의 logNo로 갓 발행된 글을 즉시 렌더하거나, 아니면 일반 404 안내를 보여준다.
export default function NotFound() {
  return <LiveFallback />;
}
