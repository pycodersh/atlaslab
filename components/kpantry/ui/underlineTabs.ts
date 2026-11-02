/**
 * 언더라인 탭 — 재료 화면·레시피 화면 카테고리 탭이 같이 쓴다.
 * 호버 색은 인라인 스타일로 못 주므로 클래스로 둔다. 컨테이너에 kp-utabs, 버튼에 kp-utab + aria-selected.
 */
export const UNDERLINE_TABS_CSS = `
.kp-utabs { scrollbar-width: none; }
.kp-utabs::-webkit-scrollbar { display: none; }
.kp-utab {
  flex-shrink: 0;
  padding: 0 0 8px;
  margin-bottom: -1px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #78716C;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.kp-utab:hover { color: #292524; }
.kp-utab[aria-selected="true"] {
  font-weight: 600;
  color: #1C1917;
  border-bottom-color: #C8102E;
}
`
