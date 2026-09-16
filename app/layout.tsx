import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const GA_ID = "G-DMDS6WFWSF";

const SITE_TITLE = "Atlas Lab — Guides, Culture & Smart Tools";
const SITE_DESC =
  "Atlas Lab builds AI agent apps that help you navigate language, career, news, and food.";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.atlaslabstudios.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESC,
  // 파비콘은 public/ 에 둔다(app/favicon.ico 는 같은 경로라 함께 둘 수 없다).
  // 아래 선언이 <head> 의 link 태그로 그대로 나간다.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: "Atlas Lab",
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* 글 본문용 Pretendard — blog.atlaslabstudios.com 과 같은 소스·버전을 쓴다.
            dynamic-subset 이라 쓰인 글자만 내려받는다(한글 전체 폰트를 받지 않는다). */}
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          rel="stylesheet"
        />
      </head>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}');
      `}</Script>
      <body>
        {/* AdSense verification — raw script in body bypasses Next.js head optimization */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5046051724478341"
          crossOrigin="anonymous"
        />
        {children}
        {/* Vercel Web Analytics — 화면에 아무것도 그리지 않는다(스크립트만 주입).
            /react 대신 /next 를 쓰는 이유: 이 엔트리가 next/navigation 의
            usePathname·useParams 를 읽어 /blog/[locale]/[app]/[slug] 같은
            동적 경로를 패턴으로 묶어 준다. */}
        <Analytics />
      </body>
    </html>
  );
}
