/**
 * K-Pantry 테마 — Atlas Lab 브랜드 토큰(app/globals.css :root)에 맞춘다.
 * 컴포넌트는 인라인 스타일에서 var(--kp-*) 만 쓴다. 주 액션은 --kp-accent(브랜드 레드) 하나.
 * 호버·누름은 버튼·링크 자신의 --kp-accent 를 바꿔서 처리한다 — 인라인 background 는 그대로 둬도
 * var() 가 요소 자신의 값으로 풀리므로 :hover 가 먹는다.
 *
 * 앱 레이아웃(app/kpantry/en/layout.tsx)과, 앱 밖에서 K-Pantry 컴포넌트를 띄우는 곳(랜딩의 언락 모달)이 같이 쓴다.
 * 쓰는 쪽은 <style>{KP_THEME_CSS}</style> 를 넣고 감싸는 요소에 className="kp-app" 을 준다.
 */
export const KP_THEME_CSS = `
.kp-app {
  --kp-accent: var(--brand-red, #C8102E);
  --kp-accent-hover: var(--brand-red-dark, #A30D25);
  --kp-accent-active: #8A0B20;
  --kp-accent-soft: #FBEEF0;
  --kp-bg: #FDFBF7;
  --kp-surface-muted: #F1EFEC;
  --kp-rule: var(--rule, #E5E1DC);
  --kp-secondary: #475569;
  --kp-secondary-border: #CBD5E1;
  --kp-icon: #4B5563;
}
.kp-app :is(button, a):not(:disabled):hover { --kp-accent: var(--kp-accent-hover); }
.kp-app :is(button, a):not(:disabled):active { --kp-accent: var(--kp-accent-active); }
`
