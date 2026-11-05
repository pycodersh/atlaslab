import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import { SITE_URL, SITE_TITLE, SITE_DESC, DEFAULT_OPEN_GRAPH, DEFAULT_TWITTER } from "@/lib/seo/site";

const GA_ID = "G-DMDS6WFWSF";

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
  // 표지가 없는 페이지의 공유 이미지는 public/og-default.png. 페이지가 openGraph 를 정하면 이 객체가 통째로 바뀌므로
  // 그런 페이지는 lib/seo/site 의 DEFAULT_OPEN_GRAPH 를 펼쳐 쓴다
  openGraph: {
    ...DEFAULT_OPEN_GRAPH,
    title: SITE_TITLE,
    description: SITE_DESC,
    // url 은 여기 두지 않는다 — 두면 openGraph 를 안 정한 모든 페이지의 og:url 이 홈 주소가 된다(홈은 app/page.tsx 가 정한다)
  },
  twitter: {
    ...DEFAULT_TWITTER,
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
        {/* Impact(제휴 네트워크) 사이트 소유 확인 — Impact 가 준 그대로 value 속성을 쓴다(content 가 아니다) */}
        <meta name="impact-site-verification" {...{ value: '13c3e8e3-f8ce-4950-963d-4b93e327e96a' }} />
        {/* 사이트 공통 글꼴은 Playfair Display(제목) · DM Sans(본문 UI) 둘뿐이다.
            Inter 는 K-Pantry 앱 화면에서만 주 글꼴이라 app/kpantry/en/layout.tsx 가 따로 불러오고,
            Space Mono 는 쓰는 화면이 없어(globals.css 의 .hub-* 는 어느 페이지도 쓰지 않는다) 뺐다(2026-11-05) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;500;600;700&display=swap"
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
