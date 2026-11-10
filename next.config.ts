import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /tools/sw.js 가 /tools 허브(끝 슬래시 없음)까지 맡으려면 기본 범위 /tools/ 를 넓혀야 한다
  async headers() {
    return [{ source: '/tools/sw.js', headers: [{ key: 'Service-Worker-Allowed', value: '/tools' }] }]
  },
  async redirects() {
    return [
      // 홈 게이트웨이 카드 주소 — 전용 페이지가 생기기 전까지 /blog 탭으로 보낸다(나중에 페이지를 만들 수 있게 임시 이동)
      { source: '/learn-korean/phrases', destination: '/blog?tab=phrases',       permanent: false },
      { source: '/learn-korean/basics',  destination: '/blog?tab=basics',        permanent: false },
      { source: '/travel',               destination: '/blog?tab=explore-korea', permanent: false },
      { source: '/food',                 destination: '/blog?tab=food',          permanent: false },
      { source: '/life',                 destination: '/blog?tab=life',          permanent: false },
      // 2026-11-05 Basics 중복 글 통합 — 짧은 글은 DB 에서 비공개(is_paused), 주소는 남은 글로 영구 이동.
      // permanent: true 는 308 을 내므로, 요청대로 고전적인 301 을 statusCode 로 명시한다(둘은 함께 쓸 수 없다)
      { source: '/blog/en/k-patto/eun-neun-vs-i-ga-difference',             destination: '/blog/en/k-patto/korean-topic-vs-subject-particle',    statusCode: 301 },
      { source: '/blog/en/k-patto/why-korean-has-two-number-systems',       destination: '/blog/en/k-patto/korean-two-number-systems',           statusCode: 301 },
      { source: '/blog/en/k-patto/formal-vs-casual-korean-when-to-drop-yo', destination: '/blog/en/k-patto/korean-politeness-levels-explained', statusCode: 301 },
      // 2026-11-10 도구 주소를 검색용 슬러그로 바꿨다 — 옛 주소는 이미 색인됐으므로 301
      { source: '/tools/hotspot-finder',   destination: '/tools/regional-hotspots',    statusCode: 301 },
      { source: '/tools/transit-guide',    destination: '/tools/intercity-transit',    statusCode: 301 },
      { source: '/tools/krw-converter',    destination: '/tools/krw-price-sense',      statusCode: 301 },
      { source: '/tools/order-builder',    destination: '/tools/k-food-order-builder', statusCode: 301 },
      { source: '/tools/weather',          destination: '/tools/korea-weather',        statusCode: 301 },
      { source: '/tools/holiday-calendar', destination: '/tools/korea-holidays',       statusCode: 301 },
      { source: '/tools/size-units',       destination: '/tools/korea-size-converter', statusCode: 301 },
      { source: '/tools/world-time',       destination: '/tools/seoul-world-time',     statusCode: 301 },
      // /kpatto/welcome → /kpatto (308 — 색인됐을 수 있으므로 permanent)
      {
        source:      '/kpatto/welcome',
        destination: '/kpatto',
        permanent:   true,
      },
      // 2026-10-22 슬롯형 패턴 승격으로 slug 가 바뀐 표현 (이미 색인됐을 수 있으므로 permanent)
      { source: '/kpatto/expressions/naramada-dallayo',       destination: '/kpatto/expressions/mada-dallayo',      permanent: true },
      { source: '/kpatto/expressions/da-gachi-isseoseo-joayo', destination: '/kpatto/expressions/aseo-eoseo-joayo', permanent: true },
      // 2026-10-22 패턴 정예화(300개)로 목록에서 빠진 표현 25개 — 색인된 URL 은 허브로 보낸다
      { source: '/kpatto/expressions/jal-butakdeuryeoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/gireul-ilheosseoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/gangchu-yeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/jeodoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/oraenmanieyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/jal-jinaesseoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/daeume-bwayo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/matneun-marieyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/jeo-dalayo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/eonjedeunji-yeollakaeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/bap-hanbeon-meogeoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/geonbaehaeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/yeogikkajiman-haeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/murihaji-maseyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/hapgyeokaesseoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/deudieo-haenaesseoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/haengbokaeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/ireon-ilsangi-sojunghaeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/yeoreobun-deokbunieyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/apeurodo-jal-butakaeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/amuri-geuraedo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/jal-moreugenneundeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/gami-japyeoyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/soljikage-malhaedo-dwaeyo', destination: '/kpatto/expressions', permanent: true },
      { source: '/kpatto/expressions/sumgyeojin-myeongsoya', destination: '/kpatto/expressions', permanent: true },

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
    // 최적화한 이미지를 31일 동안 캐시한다. 예전엔 0(에피소드 배너를 같은 파일명으로 바꿔 끼우려고)이라
    // 원본 캐시 헤더가 짧은 /public 이미지는 사실상 요청마다 다시 변환됐다.
    // 이미지를 교체할 때는 파일명을 바꾼다(ep4.png → ep4-v2.png).
    minimumCacheTTL: 2678400,
    // 변환 개수(무료 플랜 한도)는 원본 × 폭 × 품질 조합마다 센다 — 폭 후보를 줄여 조합 수를 줄인다
    deviceSizes: [640, 828, 1080, 1920],
    // 외부 이미지는 next/image 로 쓰는 곳이 없다(블로그 썸네일 · 온보딩 Unsplash 는 전부 <img>).
    // unsplash · picsum · pexels 를 허용해 두면 누구나 /_next/image 로 그 호스트의 아무 이미지나
    // 변환시켜 한도를 태울 수 있어 뺐다. Supabase 는 공개 스토리지 경로만 연다.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eecvvgkihtcgfikaimao.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
