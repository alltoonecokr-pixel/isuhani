import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/"] },
      // AI 학습·검색 크롤러 전체 명시 허용
      {
        userAgent: [
          "GPTBot",              // ChatGPT 학습
          "OAI-SearchBot",       // ChatGPT 실시간 검색
          "ChatGPT-User",        // ChatGPT 웹 브라우징
          "ClaudeBot",           // Claude AI 학습
          "Claude-Web",          // Claude AI 실시간 검색
          "anthropic-ai",        // Anthropic 크롤러
          "CCBot",               // Common Crawl (LLM 학습 기반)
          "PerplexityBot",       // Perplexity AI
          "Google-Extended",     // Google AI (Gemini 학습)
          "GoogleOther",         // Google AI Overview / Gemini 검색
          "Bingbot",             // Bing / Copilot
          "Yeti",                // 네이버 검색
          "Daumoa",              // 다음 검색
          "DuckDuckBot",         // DuckDuckGo
          "facebookexternalhit", // SNS 공유 미리보기
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
