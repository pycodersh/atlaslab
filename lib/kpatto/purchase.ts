/**
 * K-PATTO 판매 — 상품 3종·가격·결제 링크의 단일 출처.
 *
 * 랜딩 페이지는 /kpatto 하나다(옛 /kpatto/purchase 는 /kpatto#pricing 으로 넘긴다).
 * 결제 링크는 Gumroad 상품 URL 을 환경 변수로 넣는다. 비어 있는 상품의 구매 버튼은
 * 출시 알림(사전 주문) 이메일 모달을 연다 — 누를 수 없는 버튼이나 '#' 링크를 두지 않는다.
 *
 * ⚠️ WebApp Pass·Bundle 은 Gumroad 구매로 앱이 열리는 연결(라이선스 키 확인 등)이 아직 없다.
 *    현재 앱 프리미엄은 Paddle 구독(/kpatto/subscription)으로만 열린다. 링크를 넣기 전에 연결부터.
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
    checkoutUrl: process.env.NEXT_PUBLIC_GUMROAD_EBOOK_URL || '',
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
    checkoutUrl: process.env.NEXT_PUBLIC_GUMROAD_WEBAPP_URL || '',
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
    checkoutUrl: process.env.NEXT_PUBLIC_GUMROAD_BUNDLE_URL || '',
    featured: true,
  },
]
