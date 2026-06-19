import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatDock } from "@/components/chat/ChatDock";
import { LofiToggle } from "@/components/LofiToggle";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/site";

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
  metadataBase: new URL(SITE_URL),
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
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://isuclinic.co.kr",
    siteName: "이수한의원",
    title: "이수한의원 — 매일의 건강 이야기, Since 1986",
    description:
      "남성역 1번 출구 앞, 원장 3인이 직접 쓰는 건강 칼럼 1,042편. 추나요법, 산후조리, 어린이 성장, 공진단까지.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "이수한의원 — 매일의 건강 이야기" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "이수한의원 — 매일의 건강 이야기, Since 1986",
    description:
      "남성역 1번 출구 앞, 원장 3인이 직접 쓰는 건강 칼럼 1,042편. 추나요법, 산후조리, 어린이 성장, 공진단까지.",
    images: ["/og.png"],
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
  "@id": SITE_URL,
  name: "이수한의원",
  alternateName: "Isuhan Korean Medicine Clinic",
  url: SITE_URL,
  sameAs: [
    "https://blog.naver.com/isuhani",
    "https://map.naver.com/p/search/이수한의원",
  ],
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
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/icon-512.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/og.png`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.4884,
    longitude: 126.9817,
  },
  hasMap: "https://map.naver.com/p/search/이수한의원",
  areaServed: {
    "@type": "City",
    name: "서울특별시 동작구",
  },
  priceRange: "$$",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${notoKr.variable} ${notoSerifKr.variable}`}>
      <head>
        {/* AI 크롤러용 llms.txt 디스커버리 링크 */}
        <link rel="alternate" type="text/plain" href="/llms.txt" />
        {/* Naver 이미지 CDN preconnect — 썸네일 로드 시간 ~150ms 단축 */}
        <link rel="preconnect" href="https://postfiles.pstatic.net" crossOrigin="" />
        <link rel="preconnect" href="https://blogfiles.pstatic.net" crossOrigin="" />
        <link rel="preconnect" href="https://mblogthumb-phinf.pstatic.net" crossOrigin="" />
        <link rel="dns-prefetch" href="https://pstatic.net" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "이수한의원",
              url: SITE_URL,
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/journal?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Physician",
                name: "문학진",
                jobTitle: "대표원장",
                affiliation: { "@type": "MedicalClinic", "@id": SITE_URL },
                hasCredential: [
                  { "@type": "EducationalOccupationalCredential", credentialCategory: "doctorate", recognizedBy: { name: "경희대학교" } },
                  { "@type": "EducationalOccupationalCredential", credentialCategory: "certification", recognizedBy: { name: "척추신경추나의학회" } },
                ],
                medicalSpecialty: ["추나요법", "척추교정", "디스크치료", "공진단"],
                description: "경희대학교 한의학 박사. 척추신경추나의학회. 추나요법·체형교정·디스크·공진단 전문.",
              },
              {
                "@context": "https://schema.org",
                "@type": "Physician",
                name: "나효석",
                jobTitle: "원장",
                affiliation: { "@type": "MedicalClinic", "@id": SITE_URL },
                hasCredential: [
                  { "@type": "EducationalOccupationalCredential", credentialCategory: "specialization", recognizedBy: { name: "한방부인과 전문의" } },
                  { "@type": "EducationalOccupationalCredential", credentialCategory: "experience", recognizedBy: { name: "전 함소아한의원" } },
                ],
                medicalSpecialty: ["한방부인과", "산후조리", "갱년기", "성조숙증", "소아성장"],
                description: "한방부인과 전문의. 전 함소아한의원 원장. 산후조리·갱년기·난임·자궁질환·성조숙증·소아성장 전문.",
              },
              {
                "@context": "https://schema.org",
                "@type": "Physician",
                name: "이윤호",
                jobTitle: "원장",
                affiliation: { "@type": "MedicalClinic", "@id": SITE_URL },
                hasCredential: [
                  { "@type": "EducationalOccupationalCredential", credentialCategory: "certification", recognizedBy: { name: "척추신경추나의학회" } },
                  { "@type": "EducationalOccupationalCredential", credentialCategory: "certification", recognizedBy: { name: "통증진단학회 FOST" } },
                ],
                medicalSpecialty: ["관절통증", "어린이성장", "한방다이어트", "건강관리"],
                description: "척추신경추나의학회. 통증진단학회 FOST. 관절통증·어린이성장클리닉·한방다이어트·건강관리 전문.",
              },
            ]),
          }}
        />
      </head>
      <body>
        {/* GA4 */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}</Script>
          </>
        )}
        {/* Microsoft Clarity — 히트맵 + 세션 녹화 */}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script id="clarity-init" strategy="afterInteractive">{`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${process.env.NEXT_PUBLIC_CLARITY_ID}");`}</Script>
        )}
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
        <LofiToggle />
      </body>
    </html>
  );
}
