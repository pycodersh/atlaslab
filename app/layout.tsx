import type { Metadata, Viewport } from "next";
import { Baloo_2, Kalam, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainTabBar } from "@/components/MainTabBar";
import { WelcomeCover } from "@/components/WelcomeCover";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-jakarta",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-baloo",
});

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-caveat",  // reuse variable name — no other files need changing
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Patto — 영어 패턴 학습",
  description: "100개의 짧은 Story로 영어 핵심 패턴을 자동화하는 앱",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Patto",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4F8CFF",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`antialiased ${jakartaSans.variable} ${baloo2.variable} ${playfair.variable} ${kalam.variable}`}>
      <body>
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', minHeight: '100vh', zIndex: -1, background: 'linear-gradient(135deg, #d8d0ee 0%, #e8d8f0 40%, #d0e0f0 100%)' }} />
        <ThemeProvider><PreferencesProvider><AuthProvider><WelcomeCover />{children}<MainTabBar /></AuthProvider></PreferencesProvider></ThemeProvider>
      </body>
    </html>
  );
}
