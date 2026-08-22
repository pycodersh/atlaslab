import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /kpatto/welcome → /kpatto (308 — 색인됐을 수 있으므로 permanent)
      {
        source:      '/kpatto/welcome',
        destination: '/kpatto',
        permanent:   true,
      },
      // /kpantry → /kpantry/en (308 — 로케일 구조 확정, permanent)
      {
        source:      '/kpantry',
        destination: '/kpantry/en',
        permanent:   true,
      },

      // ── 2026-07-11 구조 개편(116c156d)으로 죽은 legacy 최상위 URL ────────────
      // 당시 app/{stories,library,home,learn,records,review,settings,essays,editor}
      // 를 app/patto/* 아래로 통째로 옮겼다(R100 rename). 1:1 대응이므로 301.
      { source: '/stories',           destination: '/patto/stories',           permanent: true },
      { source: '/stories/:path+',    destination: '/patto/stories/:path+',    permanent: true },
      { source: '/library',           destination: '/patto/library',           permanent: true },
      { source: '/library/:path+',    destination: '/patto/library/:path+',    permanent: true },
      { source: '/home',              destination: '/patto/home',              permanent: true },
      { source: '/learn',             destination: '/patto/learn',             permanent: true },
      { source: '/learn/:path+',      destination: '/patto/learn/:path+',      permanent: true },
      { source: '/records',           destination: '/patto/records',           permanent: true },
      { source: '/records/:path+',    destination: '/patto/records/:path+',    permanent: true },
      { source: '/review',            destination: '/patto/review',            permanent: true },
      { source: '/settings',          destination: '/patto/settings',          permanent: true },
      { source: '/settings/:path+',   destination: '/patto/settings/:path+',   permanent: true },
      { source: '/essays',            destination: '/patto/essays',            permanent: true },
      { source: '/essays/:path+',     destination: '/patto/essays/:path+',     permanent: true },
      { source: '/editor',            destination: '/patto/editor',            permanent: true },
      { source: '/editor/:path+',     destination: '/patto/editor/:path+',     permanent: true },

      // /patto-landing → /patto (45375361에서 삭제, /patto 가 후속 랜딩)
      { source: '/patto-landing',     destination: '/patto',                   permanent: true },

      // /kpatto/onboarding → /kpatto (e8975fa1: onboarding 제거, /kpatto 가 홈 역할)
      { source: '/kpatto/onboarding', destination: '/kpatto',                  permanent: true },

      // 패턴 카드 전용 페이지 → 스토리 페이지 내 패턴 뷰로 통합 (095423c3)
      {
        source:      '/patto/stories/:id/patterns/:pid',
        destination: '/patto/stories/:id?v=p&pid=:pid',
        permanent:   true,
      },
    ]
  },
  images: {
    minimumCacheTTL: 0,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'eecvvgkihtcgfikaimao.supabase.co',
      },
    ],
  },
};

export default nextConfig;
