/**
 * "Where to Buy" 위젯 공통 스타일 — 재료 가이드·레시피 구매 섹션·팝오버·SAVED 탭이 같이 쓴다.
 * 쓰는 쪽은 <BuyStyles /> 를 한 번 넣는다(React 19 의 href·precedence 로 여러 번 넣어도 한 벌만 남는다).
 *
 * 색은 아래 --kp-buy-* 토큰만 거친다. 지금은 K-Pantry 앱 테마(--kp-accent, 브랜드 레드)를 그대로 따른다.
 * 딥 그린·오렌지 톤으로 바꾸려면 --kp-buy-accent / --kp-buy-accent-soft 두 줄만 바꾸면 된다.
 */
export const BUY_CSS = `
.kp-app {
  --kp-buy-accent: var(--kp-accent);
  --kp-buy-accent-soft: var(--kp-accent-soft);
  --kp-buy-ink: #1C1917;
  --kp-buy-muted: #78716C;
}
.kpb-card { background: #FFFFFF; border: 1px solid var(--kp-rule); border-radius: 16px; padding: 16px; }
.kpb-h { font-family: 'Playfair Display', serif; font-weight: 700; color: var(--kp-buy-ink); margin: 0; }
.kpb-p { font-family: Inter, sans-serif; font-size: 14px; line-height: 1.6; color: #44403C; margin: 0; }
.kpb-small { font-family: Inter, sans-serif; font-size: 12px; line-height: 1.5; color: var(--kp-buy-muted); margin: 0; }
.kpb-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-family: Inter, sans-serif; font-size: 11px; font-weight: 600; white-space: nowrap; }
.kpb-badge[data-level="korean_asian"] { background: var(--kp-buy-accent-soft); color: var(--kp-buy-accent); }
.kpb-badge[data-level="regular"] { background: #EEF2F6; color: #475569; }
.kpb-badge[data-level="common"] { background: var(--kp-surface-muted); color: #57534E; }
.kpb-btn { display: inline-flex; align-items: center; justify-content: center; gap: 5px; border-radius: 10px; font-family: Inter, sans-serif; font-weight: 600; text-decoration: none; cursor: pointer; transition: background-color .15s, border-color .15s; white-space: nowrap; }
.kpb-btn-sm { padding: 6px 10px; font-size: 12px; }
.kpb-btn-md { padding: 11px 16px; font-size: 14px; }
.kpb-btn-outline { background: #FFFFFF; color: var(--kp-buy-ink); border: 1px solid var(--kp-rule); }
.kpb-btn-outline:hover, .kpb-btn-outline:focus-visible { border-color: #A8A29E; background: #FAFAF9; }
.kpb-btn-solid { background: var(--kp-buy-accent); color: #FFFFFF; border: 1px solid transparent; }
.kpb-link { font-family: Inter, sans-serif; font-size: 13px; font-weight: 600; color: var(--kp-buy-accent); text-decoration: none; background: none; border: none; padding: 0; cursor: pointer; }
.kpb-link:hover, .kpb-link:focus-visible { text-decoration: underline; }
.kpb-input { flex: 1; min-width: 0; padding: 10px 12px; border: 1px solid var(--kp-rule); border-radius: 10px; background: #FFFFFF; font-family: Inter, sans-serif; font-size: 14px; color: var(--kp-buy-ink); outline: none; }
.kpb-input:focus { border-color: #A8A29E; }
.kpb-name-btn { background: none; border: none; padding: 0; cursor: pointer; font: inherit; color: inherit; text-decoration: underline dotted #A8A29E; text-underline-offset: 3px; }
.kpb-name-btn:hover, .kpb-name-btn:focus-visible { text-decoration-color: var(--kp-buy-ink); }
.kpb-backdrop { position: fixed; inset: 0; z-index: 300; }
.kpb-backdrop[data-sheet="true"] { background: rgba(28, 25, 23, 0.4); }
.kpb-pop { position: fixed; z-index: 301; width: 300px; box-shadow: 0 12px 32px rgba(0,0,0,.16); }
.kpb-sheet { position: fixed; z-index: 301; left: 0; right: 0; bottom: 0; max-width: 430px; margin: 0 auto; border-radius: 20px 20px 0 0; padding: 8px 20px calc(20px + env(safe-area-inset-bottom)); max-height: 80vh; overflow-y: auto; animation: kpb-up .2s ease-out; }
@keyframes kpb-up { from { transform: translateY(24px); opacity: .6; } to { transform: none; opacity: 1; } }
.kpb-grab { width: 36px; height: 4px; border-radius: 2px; background: #D6D3D1; margin: 0 auto 12px; }
`

export function BuyStyles() {
  return <style href="kp-buy-styles" precedence="default">{BUY_CSS}</style>
}
