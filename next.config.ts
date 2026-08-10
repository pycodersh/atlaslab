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
        hostname: 'mzcdowxmmuefowcayzfk.supabase.co',
      },
    ],
  },
};

export default nextConfig;
