/**
 * K-PATTO 판매 — 상품 3종·가격·결제 링크의 단일 출처.
 *
 * 랜딩 페이지는 /kpatto 하나다(옛 /kpatto/purchase 는 /kpatto#pricing 으로 넘긴다).
 * 결제는 Gumroad 정식 상품 페이지로 바로 간다(새 탭). 2026-10-27 세 페이지 모두 열려 있고 가격이 맞는 것을 확인했다:
 *   eBook $14.99 → /l/k-patto · WebApp Pass $19.99 → /l/kpatto-app · Bundle $24.99 → /l/kpatto-bundle
 *
 * WebApp Pass·Bundle 은 Gumroad 라이선스 키로 앱을 연다(로그인 불필요): 앱의 🔑 버튼·잠금 안내 시트나
 * /kpatto/redeem 에서 키를 넣으면 /api/verify-license 가 Gumroad 에 확인하고 서버 서명 패스 쿠키를 준다
 * (lib/kpatto/gumroad.ts · licensePass.ts). 로그인해 있으면 kp_lifetime_access 에도 남긴다(선택).
 * 서버 전용 GUMROAD_WEBAPP_PRODUCT_ID(또는 GUMROAD_PRODUCT_ID)·GUMROAD_BUNDLE_PRODUCT_ID 가 Vercel 에 들어가 있다
 * (2026-10-27 프로덕션 /api/verify-license 가 not_configured 가 아니라 invalid 를 돌려줌으로 확인).
 * 앱 안 Paddle 월 구독 결제는 폐지 — 기존 구독자만 구독 관리로 남는다.
 */
export const LANDING_PATH = '/kpatto'
export const PRICING_ANCHOR = 'pricing'

/** 무료 체험 — 첫 에피소드(EP01~10 무료) */
export const TRY_APP_PATH = '/kpatto/story/kp-ep-001'

/** 무료 샘플 PDF — 표지·사용법 + 패턴 001~010 (exports/kpatto/pdf-build/make_free_sample.py) */
export const SAMPLE_PDF_URL = process.env.NEXT_PUBLIC_KPATTO_FREE_SAMPLE_URL || '/assets/K_Patto_Free_Sample_10.pdf'
export const SAMPLE_PATTERNS = 10

/** 전체 PDF 쪽수 — exports/kpatto/pdf-build/out/K_Patto_Final_Edition.pdf 실측 */
export const EBOOK_PAGES = 153

export type ProductId = 'ebook' | 'webapp' | 'bundle'

export type Product = {
  id: ProductId
  name: string
  edition: string
  price: string
  /** 원래 합계가 있으면(번들) 취소선으로 */
  regular?: string
  saving?: string
  for: string
  highlights: string[]
  cta: string
  checkoutUrl: string
  featured?: boolean
}

export const PRODUCTS: readonly Product[] = [
  {
    id: 'ebook',
    name: '300 Essential Patterns',
    edition: 'eBook Edition',
    price: '$14.99',
    for: 'Reading & grammar focused learners',
    highlights: [
      `${EBOOK_PAGES}-page full PDF`,
      'Grammar breakdown for every pattern',
      'Real-world example sentences',
      'Printable & iPad-ready',
    ],
    cta: 'Get the eBook — $14.99',
    checkoutUrl: 'https://zizou7.gumroad.com/l/k-patto',
  },
  {
    id: 'webapp',
    name: 'Interactive Webtoon App',
    edition: 'WebApp Pass',
    price: '$19.99',
    for: 'Interactive & visual learners',
    highlights: [
      '100-episode full-color webtoon',
      'Native audio on every line',
      'Review quizzes & streak tracker',
      'Works in any phone or desktop browser',
    ],
    cta: 'Get the WebApp Pass — $19.99',
    checkoutUrl: 'https://zizou7.gumroad.com/l/kpatto-app',
  },
  {
    id: 'bundle',
    name: 'All-in-One Complete Bundle',
    edition: 'eBook + WebApp Pass',
    price: '$24.99',
    regular: '$34.98',
    saving: 'Save $9.99',
    for: 'Complete fluency & offline study',
    highlights: [
      'Everything in the eBook ($14.99)',
      'Everything in the WebApp Pass ($19.99)',
      'Instant PDF download',
      'Full WebApp unlock',
    ],
    cta: 'Get the Bundle — $24.99',
    checkoutUrl: 'https://zizou7.gumroad.com/l/kpatto-bundle',
    featured: true,
  },
]
