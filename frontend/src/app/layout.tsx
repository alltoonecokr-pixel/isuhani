import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatDock } from "@/components/chat/ChatDock";
import { getAllPosts } from "@/lib/blog";

const notoKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-kr",
  display: "swap",
});

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "이수한의원 — 매일의 건강 이야기, Since 1986",
    template: "%s | 이수한의원",
  },
  description:
    "남성역 1번 출구 앞, 39년의 시간이 쌓아온 정성 진료. 원장 3인이 직접 쓰는 건강 칼럼 1,042편 · 추나요법, 디스크치료, 체형교정, 산후조리, 어린이 성장클리닉, 공진단.",
  keywords: [
    "이수한의원",
    "남성역 한의원",
    "사당동 한의원",
    "건강 칼럼",
    "한의원 매거진",
    "추나요법",
    "디스크치료",
    "체형교정",
    "산후조리",
    "성장클리닉",
    "공진단",
  ],
  authors: [{ name: "이수한의원" }],
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "이수한의원",
    title: "이수한의원 — 매일의 건강 이야기, Since 1986",
    description:
      "남성역 1번 출구 앞, 원장 3인이 직접 쓰는 건강 칼럼 1,042편. 추나요법, 산후조리, 어린이 성장, 공진단까지.",
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "이수한의원 — 매일의 건강 이야기" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a4a45",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "이수한의원",
  alternateName: "Isuhan Korean Medicine Clinic",
  url: "https://blog.naver.com/isuhani",
  telephone: "+82-2-584-1075",
  email: "isuhani@naver.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "사당동 254-5",
    addressLocality: "동작구",
    addressRegion: "서울특별시",
    addressCountry: "KR",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:30",
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: "09:30",
      closes: "15:00",
    },
  ],
  medicalSpecialty: [
    "TraditionalChineseMedicine",
    "Pediatric",
    "Obstetric",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoKr.variable} ${notoSerifKr.variable}`}>
      <head>
        {/* Naver 이미지 CDN preconnect — 썸네일 로드 시간 ~150ms 단축 */}
        <link rel="preconnect" href="https://postfiles.pstatic.net" crossOrigin="" />
        <link rel="preconnect" href="https://blogfiles.pstatic.net" crossOrigin="" />
        <link rel="preconnect" href="https://mblogthumb-phinf.pstatic.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://pstatic.net" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Header
          recentPosts={getAllPosts()
            .slice(0, 6)
            .map((p) => ({
              logNo: p.logNo,
              title: p.title,
              category: p.category,
              dateLabel: p.dateLabel,
            }))}
        />
        <main>{children}</main>
        <Footer />
        <ChatDock />
      </body>
    </html>
  );
}
