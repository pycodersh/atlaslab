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
        // 유료 에피소드(EP11~100)는 robots.txt 로 막지 않는다.
        // 서버에서 권한 없는 요청에 실제 404 를 반환하므로, 크롤러가 그 404 를
        // 읽을 수 있어야 색인에서 빠진다. Disallow 를 걸면 응답 자체를 못 읽는다.
        // (이전의 '/kpatto/story/kp-ep-0[1-9][1-9]' 류 규칙은 robots.txt 가
        //  * 와 $ 만 와일드카드로 인정하므로 애초에 동작하지 않았다.)
        disallow: [
          '/kpatto/editor/',
          '/kpatto/record/',
          '/kpatto/profile/',
          '/admin/',
          '/patto/editor/',
          '/patto/dev/',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
