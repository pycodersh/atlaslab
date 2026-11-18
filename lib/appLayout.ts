/**
 * K-PATTO · K-Pantry 웹앱 공통 레이아웃 폭(2026-11-18 통일).
 * 모바일은 1열 풀폭 그대로, PC 에서는 이 폭까지만 넓어지고 가운데 정렬된다(Tailwind max-w-3xl 과 같은 768px).
 *
 *   APP_MAX_WIDTH      앱 화면 전체(헤더 · 목록 · 설정 · 레시피 · 재료 가이드 …)
 *   READING_MAX_WIDTH  웹툰 에피소드 뷰어 — 말풍선 위치는 %, 글자는 px 라 너무 넓히면 그림만 커지고 글자가 작아 보인다
 *
 * 모달 · 바텀 시트(라이선스 입력 · 결제 안내 등)는 이 값과 상관없이 원래 폭을 쓴다.
 */
export const APP_MAX_WIDTH = 768
export const READING_MAX_WIDTH = 640
