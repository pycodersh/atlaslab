import { TOOLS, toolHref } from './toolList'
import { ToolIcon } from './toolIcons'

/**
 * 도구 페이지 맨 아래 다른 도구 링크 — 아이콘 + 진한 차콜 제목 + 은은한 → 의 미니 타일 그리드(폰 1열 · 640px 2열 · 768px 3열).
 * next/link 의 RSC 요청은 오프라인 캐시에 없어 일반 <a> 로 페이지째 이동한다.
 */
export function MoreTools({ current }: { current: string }) {
  return (
    <nav className="tl-more" aria-label="More travel tools">
      <style>{`
        .tl-more { margin-top: 32px; padding-top: 20px; border-top: 1px solid rgba(231,229,228,.9); }
        .tl-more-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
        .tl-more-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #78716C; }
        .tl-more-all { font-size: 13px; font-weight: 600; color: #1C1917; text-decoration: none; }
        .tl-more-all:hover { text-decoration: underline; text-underline-offset: 3px; }
        .tl-more-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin: 0; padding: 0; list-style: none; }
        .tl-more-tile { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 14px;
          background: #fff; border: 1px solid rgba(231,229,228,.9); border-radius: 8px;
          font-size: 12px; font-weight: 500; line-height: 1.35; color: #292524; text-decoration: none;
          transition: background-color .15s, border-color .15s; }
        .tl-more-tile:hover { background: #FAFAF9; border-color: #D6D3D1; }
        .tl-more-tile:focus-visible, .tl-more-all:focus-visible { outline: 2px solid #C8102E; outline-offset: 2px; }
        .tl-more-name { display: flex; align-items: center; gap: 8px; min-width: 0; }
        .tl-more-name svg, .tl-more-name .tl-more-ic { flex: none; color: #78716C; }
        .tl-more-arrow { flex: none; color: #A8A29E; }
        @media (min-width: 640px) { .tl-more-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 768px) { .tl-more-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      `}</style>
      <div className="tl-more-head">
        <span className="tl-more-label">More travel tools</span>
        <a className="tl-more-all" href="/tools">All {TOOLS.length} Tools →</a>
      </div>
      <ul className="tl-more-grid">
        {TOOLS.filter(t => toolHref(t.id) !== current).map(t => (
          <li key={t.id}>
            <a className="tl-more-tile" href={toolHref(t.id)}>
              <span className="tl-more-name"><ToolIcon id={t.id} size={15} className="tl-more-ic" />{t.title}</span>
              <span className="tl-more-arrow" aria-hidden="true">→</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
