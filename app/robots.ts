import type { MetadataRoute } from 'next'

// Strip leading BOM (U+FEFF) that PowerShell stdin piping can inject into env vars
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.atlaslabstudios.com').replace(/^﻿/, '')

/**
 * 광고 크롤러에게 숨길 앱 내부 경로.
 *
 * 트레일링 슬래시는 의도된 것이다 — '/kpatto/' 는 '/kpatto' (랜딩)를 막지 않는다.
 * 광고 크롤러에게 앱 랜딩은 보여주고 그 아래 기능 페이지만 가린다.
 * 슬래시를 제거하면 랜딩까지 막히므로 붙인 채로 둘 것.
 *
 * '/kpantry/en' 은 유일하게 색인 중인 앱 랜딩(page.tsx 에서 index:true 로 명시
 * 해제)이라 Allow 로 되살린다. 'Allow: /kpantry/en$'(12자) 가
 * 'Disallow: /kpantry/'(9자) 보다 길어 최장 매칭 규칙상 Allow 가 이기고,
 * '$' 앵커 덕분에 '/kpantry/en/recipes/*' 는 계속 차단된다.
 */
const AD_CRAWLER_RULE: { allow: string[]; disallow: string[] } = {
  allow: ['/kpantry/en$'],
  disallow: [
    '/kpatto/',
    '/kpantry/',
    '/patto/',
    '/videos',
    '/admin/',
    '/api/',
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
