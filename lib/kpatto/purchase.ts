/**
 * K-PATTO PDF 패키지 판매 — 경로·결제 링크·표기 상수.
 * 결제 링크(Gumroad / 스마트스토어)가 정해지면 NEXT_PUBLIC_KPATTO_CHECKOUT_URL 만 채우면
 * 랜딩 페이지의 체크아웃 버튼이 자동으로 활성화된다.
 */
export const PURCHASE_PATH = '/kpatto/purchase'

/** 비어 있으면 랜딩 페이지의 구매 버튼은 사전 주문(출시 알림) 모달을 연다.
 *  NEXT_PUBLIC_KPATTO_CHECKOUT_URL 이 표준 이름, NEXT_PUBLIC_PDF_CHECKOUT_URL 은 옛 이름(호환) */
export const CHECKOUT_URL = process.env.NEXT_PUBLIC_KPATTO_CHECKOUT_URL || process.env.NEXT_PUBLIC_PDF_CHECKOUT_URL || ''

/**
 * 판형별 구매·다운로드 링크. 각각 NEXT_PUBLIC_PDF_POCKET_URL / NEXT_PUBLIC_PDF_MASTER_URL 로 채우고,
 * 비어 있으면 위의 공통 CHECKOUT_URL 을 쓴다. 전부 비어 있으면 랜딩 페이지의 두 버튼은 비활성이다.
 */
export const POCKET_URL = process.env.NEXT_PUBLIC_PDF_POCKET_URL || CHECKOUT_URL
export const MASTER_URL = process.env.NEXT_PUBLIC_PDF_MASTER_URL || CHECKOUT_URL
