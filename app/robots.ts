import type { MetadataRoute } from 'next'

// Strip leading BOM (U+FEFF) that PowerShell stdin piping can inject into env vars
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

/**
 * 광고 크롤러에게 숨길 앱 경로 — 앱 랜딩까지 포함한다.
 *
 * 트레일링 슬래시 없음이 의도된 것이다. '/kpatto' 는 접두어 매칭이라
 * 랜딩 '/kpatto' 자체와 그 아래 전부를 막는다. 세 앱 랜딩 모두 본문
 * 5~100단어의 앱 셸이라 심사에 보여줄 페이지가 아니고, '/patto' 는 307 로
 * 차단 경로(/patto/home)에 떨어져 실질 내용이 없다. 슬래시를 다시 붙이면
 * 랜딩이 광고 크롤러에 노출되므로 붙이지 말 것.
 *
 * 광고 크롤러에게 남는 것: '/', '/about', '/contact', '/privacy', '/terms',
 * '/blog/**' (글 163편 + 목록 6개). 접두어가 '/blog' 로 시작하므로
 * '/blog/ko/patto', '/blog/en/k-patto/*' 는 위 규칙과 겹치지 않는다.
 */
const AD_CRAWLER_RULE: { disallow: string[] } = {
  disallow: [
    '/kpatto',
    '/kpantry',
    '/patto',
    '/videos',
    '/admin',
    '/api',
  ],
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // ── 광고 크롤러 2종 ───────────────────────────────────────────────────
      // 'User-agent: *' 그룹은 이 둘에게 적용되지 않는다. 구글 공식 문서:
      // "The global user agent (*) is ignored." 따라서 이름을 직접 지정한
      // 별도 그룹이 필요하다.
      //   Mediapartners-Google  — 광고 관련성 판정 크롤러
      //   Google-Display-Ads-Bot — 사이트 추가 시 사이트를 확인하는 봇(심사 경로)
      {
        userAgent: 'Mediapartners-Google',
        ...AD_CRAWLER_RULE,
      },
      {
        userAgent: 'Google-Display-Ads-Bot',
        ...AD_CRAWLER_RULE,
      },

      // ── 검색 크롤러 ───────────────────────────────────────────────────────
      // 여기는 한 줄도 바꾸지 않는다. Googlebot 이 앱 페이지를 계속 크롤해야
      // 각 페이지의 noindex 를 읽고 기존 색인에서 빠진다. 새로 막으면
      // 이미 색인된 페이지가 'robots.txt 에 의해 차단됨' 상태로 영구 고정된다.
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
