'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

/**
 * 홈 히어로 검색창 — 글 제목 · 태그 · 분류를 브라우저에서 바로 거른다(서버 호출 없음).
 * 색인은 홈이 이미 받아 온 글 목록에서 만들어 넘긴다(app/page.tsx). 결과는 입력 바로 아래 드롭다운으로 최대 8편.
 *   ↑ ↓ 로 고르고 Enter 로 이동, Esc 로 닫는다. 낱말을 여러 개 치면 모두 들어 있는 글만 남긴다.
 */
export type SearchDoc = { title: string; href: string; group: string; tags: string[] }

const MAX = 8

export function HomeSearch({ docs }: { docs: SearchDoc[] }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  // 미리 소문자로 합쳐 둔다 — 글자 칠 때마다 200여 편을 다시 이어 붙이지 않게
  const index = useMemo(
    () => docs.map(d => ({ d, title: d.title.toLowerCase(), rest: `${d.tags.join(' ')} ${d.group}`.toLowerCase() })),
    [docs],
  )

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(w => w.length > 0)
    if (!words.length) return []
    return index
      .filter(x => words.every(w => x.title.includes(w) || x.rest.includes(w)))
      // 제목에 걸린 낱말이 많을수록 위로
      .map(x => ({ d: x.d, score: words.filter(w => x.title.includes(w)).length }))
      .sort((a, b) => b.score - a.score)
      .map(x => x.d)
  }, [q, index])

  // 바깥을 누르면 닫는다
  useEffect(() => {
    const onDown = (e: PointerEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [])

  const shown = results.slice(0, MAX)
  const showPanel = open && q.trim().length > 0

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (!shown.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setCursor(c => (c + 1) % shown.length) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => (c - 1 + shown.length) % shown.length) }
    else if (e.key === 'Enter') { e.preventDefault(); window.location.href = shown[Math.min(cursor, shown.length - 1)].href }
  }

  return (
    <div className="hsearch" ref={boxRef}>
      <style>{`
        .hsearch { position: relative; max-width: 560px; margin-top: 24px; }
        .hsearch-field {
          display: flex; align-items: center; gap: 10px;
          height: 46px; padding: 0 14px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18); border-radius: 8px;
          transition: border-color .15s, background .15s;
        }
        .hsearch-field:focus-within { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.12); }
        .hsearch-field svg { flex: 0 0 auto; opacity: .6; }
        .hsearch-input {
          flex: 1; min-width: 0; height: 100%; border: 0; outline: none; background: transparent;
          font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 15px; color: #fff;
        }
        .hsearch-input::placeholder { color: rgba(255,255,255,0.45); }
        .hsearch-clear { border: 0; background: none; color: rgba(255,255,255,0.6); font-size: 18px; line-height: 1; cursor: pointer; padding: 4px; }
        .hsearch-panel {
          position: absolute; left: 0; right: 0; top: calc(100% + 6px); z-index: 120;
          background: #fff; border: 1px solid #E5E1DC; border-radius: 8px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
          max-height: min(62vh, 560px); overflow-y: auto; overscroll-behavior: contain;
        }
        .hsearch-item {
          display: flex; flex-direction: column; gap: 2px; padding: 11px 14px;
          text-decoration: none; border-bottom: 1px solid #F0EEE9;
        }
        .hsearch-item:last-of-type { border-bottom: 0; }
        .hsearch-item[aria-selected="true"], .hsearch-item:hover { background: #F7F5F2; }
        .hsearch-group { font-family: "DM Sans", system-ui, sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #C8102E; }
        .hsearch-title { font-family: "DM Sans", system-ui, sans-serif; font-size: 14.5px; font-weight: 600; color: #111; line-height: 1.35; }
        .hsearch-foot { padding: 9px 14px; font-family: "DM Sans", system-ui, sans-serif; font-size: 12px; color: #7A7670; background: #FAF9F7; }
        @media (max-width: 700px) { .hsearch { margin-top: 20px; } .hsearch-input { font-size: 16px; } }
      `}</style>
      <div className="hsearch-field">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
        <input
          type="search"
          className="hsearch-input"
          placeholder="Search topics, food, cafe, subway, phrases..."
          aria-label="Search articles"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          value={q}
          onChange={e => { setQ(e.target.value); setOpen(true); setCursor(0) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
        />
        {q && (
          <button type="button" className="hsearch-clear" aria-label="Clear search" onClick={() => { setQ(''); setOpen(false) }}>×</button>
        )}
      </div>
      {showPanel && (
        <div className="hsearch-panel" id={listId} role="listbox">
          {shown.map((d, i) => (
            <a key={d.href} href={d.href} className="hsearch-item" role="option" aria-selected={i === cursor} onMouseEnter={() => setCursor(i)}>
              <span className="hsearch-group">{d.group}</span>
              <span className="hsearch-title">{d.title}</span>
            </a>
          ))}
          <div className="hsearch-foot">
            {results.length === 0
              ? `No articles match “${q.trim()}”. Try a shorter word like “cafe” or “bus”.`
              : results.length > MAX
                ? `Showing ${MAX} of ${results.length} articles — add a word to narrow it down.`
                : `${results.length} article${results.length > 1 ? 's' : ''}`}
          </div>
        </div>
      )}
    </div>
  )
}
