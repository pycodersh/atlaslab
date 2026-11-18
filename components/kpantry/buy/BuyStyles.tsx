/**
 * "Where to Buy" 공통 스타일 — 레시피 구매 시트·배너, 재료 가이드, 팝오버, SAVED 탭 마트 찾기가 같이 쓴다.
 * 쓰는 쪽은 <BuyStyles /> 를 넣는다(React 19 의 href·precedence 로 여러 번 넣어도 한 벌만 남는다).
 *
 * 문법(2026-11-18 2차): 레시피 "Ingredients" 섹션과 같다 — 굵은 소제목 + 오른쪽 회색 개수, 그 아래 1px 구분선 행.
 * 카드 테두리·색 배경 칩은 쓰지 않는다. 브랜드 레드는 텍스트 링크, 주요 버튼 1개, 재료 타일 점에만.
 *
 * 색은 아래 --kp-buy-* 토큰만 거친다. 지금은 K-Pantry 테마(--kp-accent, 브랜드 레드 #C8102E)를 따른다.
 */
export const BUY_CSS = `
.kp-app {
  --kp-buy-accent: var(--kp-accent);
  --kp-buy-ink: #111111;
  --kp-buy-text: #44403C;
  --kp-buy-muted: #78716C;
  --kp-buy-rule: var(--kp-rule);
}
.kpb-h { font-family: 'Playfair Display', serif; font-weight: 700; color: var(--kp-buy-ink); margin: 0; }
.kpb-sub { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; font-family: Inter, sans-serif; font-size: 16px; font-weight: 700; color: var(--kp-buy-ink); margin: 0; }
.kpb-count { font-size: 13px; font-weight: 500; color: #9E9E9E; }
.kpb-p { font-family: Inter, sans-serif; font-size: 14px; line-height: 1.6; color: var(--kp-buy-text); margin: 0; }
.kpb-small { font-family: Inter, sans-serif; font-size: 12px; line-height: 1.5; color: var(--kp-buy-muted); margin: 0; }
.kpb-rule { height: 1px; background: var(--kp-buy-rule); border: 0; margin: 0; }
.kpb-group + .kpb-group { margin-top: 28px; }
.kpb-rows { list-style: none; margin: 8px 0 0; padding: 0; }
.kpb-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-top: 1px solid var(--kp-buy-rule); }
.kpb-row:last-child { border-bottom: 1px solid var(--kp-buy-rule); }
.kpb-row-main { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 4px 12px; flex-wrap: wrap; }
.kpb-row-name { font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: var(--kp-buy-ink); text-decoration: none; }
.kpb-row-name:hover { text-decoration: underline; }
.kpb-thumb { width: 40px; height: 40px; border-radius: 10px; object-fit: cover; flex-shrink: 0; background: var(--kp-surface-muted); }
.kpb-links { display: inline-flex; gap: 16px; flex-shrink: 0; }
.kpb-link { font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: var(--kp-buy-accent); text-decoration: none; background: none; border: none; padding: 0; cursor: pointer; white-space: nowrap; }
.kpb-link:hover, .kpb-link:focus-visible { text-decoration: underline; }
.kpb-link-muted { font-family: Inter, sans-serif; font-size: 13px; color: var(--kp-buy-muted); text-decoration: none; background: none; border: none; padding: 0; cursor: pointer; }
.kpb-link-muted:hover, .kpb-link-muted:focus-visible { text-decoration: underline; color: var(--kp-buy-text); }
.kpb-fresh { font-family: Inter, sans-serif; font-size: 12px; color: #9E9E9E; white-space: nowrap; }
.kpb-primary { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; box-sizing: border-box; padding: 13px 16px; border-radius: 12px; background: var(--kp-buy-accent); color: #FFFFFF; font-family: Inter, sans-serif; font-size: 15px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; }
.kpb-field { display: flex; align-items: center; border: 1px solid var(--kp-buy-rule); border-radius: 12px; background: #FFFFFF; padding: 0 6px 0 14px; }
.kpb-field:focus-within { border-color: #A8A29E; }
.kpb-field input { flex: 1; min-width: 0; border: none; outline: none; background: transparent; padding: 12px 0; font-family: Inter, sans-serif; font-size: 14px; color: var(--kp-buy-ink); }
.kpb-field button { background: none; border: none; padding: 8px 10px; font-family: Inter, sans-serif; font-size: 14px; font-weight: 600; color: var(--kp-buy-accent); cursor: pointer; }
.kpb-field button:disabled { color: #C4C0BB; cursor: default; }
.kpb-name-btn { background: none; border: none; padding: 0; cursor: pointer; font: inherit; color: inherit; text-decoration: underline dotted #A8A29E; text-underline-offset: 3px; }
.kpb-name-btn:hover, .kpb-name-btn:focus-visible { text-decoration-color: var(--kp-buy-ink); }
.kpb-dot { position: absolute; top: 5px; left: 5px; width: 6px; height: 6px; border-radius: 50%; background: var(--kp-buy-accent); box-shadow: 0 0 0 1.5px #FFFFFF; pointer-events: none; }
.kpb-banner { display: flex; align-items: center; gap: 10px; width: 100%; padding: 14px 0; border: 0; border-top: 1px solid var(--kp-buy-rule); border-bottom: 1px solid var(--kp-buy-rule); background: none; text-align: left; font-family: Inter, sans-serif; font-size: 13px; line-height: 1.45; color: var(--kp-buy-text); }
button.kpb-banner { cursor: pointer; }
button.kpb-banner:hover .kpb-banner-go { text-decoration: underline; }
.kpb-banner-go { margin-left: auto; flex-shrink: 0; font-weight: 600; color: var(--kp-buy-accent); white-space: nowrap; }
.kpb-backdrop { position: fixed; inset: 0; z-index: 300; }
.kpb-backdrop[data-dim="true"] { background: rgba(28, 25, 23, 0.4); }
.kpb-pop { position: fixed; z-index: 301; width: 300px; background: #FFFFFF; border: 1px solid var(--kp-buy-rule); border-radius: 16px; padding: 16px; box-shadow: 0 12px 32px rgba(0,0,0,.16); }
.kpb-sheet { position: fixed; z-index: 301; background: var(--kp-bg, #FDFBF7); box-shadow: 0 -8px 32px rgba(0,0,0,.14); display: flex; flex-direction: column; outline: none; }
.kpb-sheet[data-mode="bottom"] { left: 0; right: 0; bottom: 0; max-width: 430px; margin: 0 auto; max-height: 85vh; border-radius: 20px 20px 0 0; animation: kpb-up .2s ease-out; }
.kpb-sheet[data-mode="side"] { top: 0; right: 0; bottom: 0; width: 420px; max-width: 100vw; border-left: 1px solid var(--kp-buy-rule); animation: kpb-left .2s ease-out; }
.kpb-sheet-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 20px 12px; flex-shrink: 0; touch-action: none; }
.kpb-sheet-body { overflow-y: auto; padding: 4px 20px calc(24px + env(safe-area-inset-bottom)); overscroll-behavior: contain; }
.kpb-close { background: none; border: none; padding: 6px; margin-right: -6px; cursor: pointer; color: #78716C; border-radius: 8px; }
.kpb-close:hover, .kpb-close:focus-visible { color: var(--kp-buy-ink); background: var(--kp-surface-muted); }
.kpb-grab { width: 36px; height: 4px; border-radius: 2px; background: #D6D3D1; margin: 0 auto 8px; }
.kpb-disclose { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 0; background: none; border: 0; border-top: 1px solid var(--kp-buy-rule); border-bottom: 1px solid var(--kp-buy-rule); cursor: pointer; font-family: Inter, sans-serif; font-size: 16px; font-weight: 700; color: var(--kp-buy-ink); text-align: left; }
.kpb-disclose svg { transition: transform .15s; }
.kpb-disclose[aria-expanded="true"] svg { transform: rotate(90deg); }
/* 이동만 — 투명도는 건드리지 않는다(애니메이션이 멈춘 환경에서 시트가 반투명으로 남아 뒤 화면이 비쳤다) */
@keyframes kpb-up { from { transform: translateY(24px); } to { transform: none; } }
@keyframes kpb-left { from { transform: translateX(24px); } to { transform: none; } }
@media (prefers-reduced-motion: reduce) { .kpb-sheet { animation: none; } }
`

export function BuyStyles() {
  return <style href="kp-buy-styles" precedence="default">{BUY_CSS}</style>
}
