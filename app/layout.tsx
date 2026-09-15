import type { Metadata } from "next";
import Script from "next/script";
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
      </body>
    </html>
  );
}
