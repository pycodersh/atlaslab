import type { Metadata, Viewport } from "next";
import { Baloo_2, Kalam, Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";

import { ThemeProvider } from "@/components/ThemeProvider";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainTabBar } from "@/components/MainTabBar";
import { WelcomeCover } from "@/components/WelcomeCover";
import { OneSignalInit } from "@/components/OneSignalInit";
import { PageTransition } from "@/components/PageTransition";
;

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
  variable: "--font-caveat",
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

export default function PattoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`antialiased ${jakartaSans.variable} ${baloo2.variable} ${playfair.variable} ${kalam.variable}`}>
      <div className="patto-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', minHeight: '100vh', zIndex: -1 }} />
      <div style={{ position: 'relative', zIndex: 1 }}><ThemeProvider><PreferencesProvider><AuthProvider><OneSignalInit /><WelcomeCover /><PageTransition>{children}</PageTransition><MainTabBar /></AuthProvider></PreferencesProvider></ThemeProvider></div>
    </div>
  );
}
