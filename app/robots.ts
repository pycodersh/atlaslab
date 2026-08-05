import type { MetadataRoute } from 'next'

// Strip leading BOM (U+FEFF) that PowerShell stdin piping can inject into env vars
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/kpatto',
          '/kpatto/story',
          // EP01~10 only — matches kp-ep-001 through kp-ep-010
          '/kpatto/story/kp-ep-00',
          '/kpatto/story/kp-ep-010',
        ],
        disallow: [
          '/kpatto/story/kp-ep-0[1-9][1-9]',
          '/kpatto/story/kp-ep-[1-9]',
          '/kpatto/editor/',
          '/kpatto/record/',
          '/kpatto/profile/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
