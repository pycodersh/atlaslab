import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // K-Pantry: atlaslabstudios.com/kpantry → k-pantry.vercel.app/kpantry (308 permanent)
      {
        source: '/kpantry',
        destination: 'https://k-pantry.vercel.app/kpantry',
        permanent: true,
      },
      {
        source: '/kpantry/:path*',
        destination: 'https://k-pantry.vercel.app/kpantry/:path*',
        permanent: true,
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
    ],
  },
};

export default nextConfig;
