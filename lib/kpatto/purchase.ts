/**
 * K-PATTO PDF 패키지 판매 — 경로·결제 링크·표기 상수.
 * 결제 링크(Gumroad / 스마트스토어)가 정해지면 NEXT_PUBLIC_PDF_CHECKOUT_URL 만 채우면
 * 랜딩 페이지의 체크아웃 버튼이 자동으로 활성화된다.
 */
export const PURCHASE_PATH = '/kpatto/purchase'

/** 비어 있으면 랜딩 페이지는 "곧 공개" 상태의 비활성 버튼을 보여 준다 */
export const CHECKOUT_URL = process.env.NEXT_PUBLIC_PDF_CHECKOUT_URL ?? ''

/**
 * 예문 음성에 쓴 Typecast 보이스의 영문 이름(tc_69f2e455…, 한국어 이름 서현).
 * 카피에 들어가는 이름이라 한 곳에서 관리한다.
 */
export const VOICE_NAME = 'Seohyeon'
