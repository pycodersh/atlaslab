import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Patto — Promo Videos",
  description: "Patto promotional videos",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#0a0a12",
          color: "#fff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
