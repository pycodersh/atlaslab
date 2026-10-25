'use client'

import { useEffect, useState } from 'react'
import { SectionHeader } from '@/components/SectionHeader'
import { removeBookmark, sortedBookmarks, useSaves, type Bookmark, type SaveKind } from '@/lib/saves'

const GROUPS: { kind: SaveKind; label: string }[] = [
  { kind: 'pattern', label: 'Korean Patterns' },
  { kind: 'guide', label: 'Guides' },
]

/** 로컬 저장소의 북마크를 종류별로 묶어 보여 준다. 서버는 내용을 모르므로 마운트 뒤에만 그린다. */
export function BookmarksList() {
  const saves = useSaves()
  const [mounted, setMounted] = useState(false)
  // 서버 렌더에서는 저장값을 알 수 없어 "비어 있음"이 잠깐 번쩍이지 않도록 마운트 뒤에 그린다
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div style={{ minHeight: 200 }} />

  const all = sortedBookmarks(saves)

  if (all.length === 0) {
    return (
      <div className="bm-empty">
        <style>{CSS}</style>
        <p className="bm-empty-title">No bookmarks yet</p>
        <p className="bm-empty-desc">Tap the bookmark icon at the top of any guide or Korean pattern page to save it here.</p>
        <a href="/" className="bm-empty-link">Browse guides →</a>
      </div>
    )
  }

  return (
    <div>
      <style>{CSS}</style>
      {GROUPS.map(g => {
        const items = all.filter(b => b.kind === g.kind)
        if (items.length === 0) return null
        return (
          <section key={g.kind} className="bm-group" aria-labelledby={`bm-${g.kind}`}>
            <SectionHeader id={`bm-${g.kind}`} label={`${g.label} · ${items.length}`} />
            <ul className="bm-list">
              {items.map(b => <Row key={b.id} b={b} />)}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function Row({ b }: { b: Bookmark }) {
  return (
    <li className="bm-row">
      <a href={b.href} className="bm-link">
        <span className="bm-title">{b.title}</span>
        {b.desc && <span className="bm-desc">{b.desc}</span>}
      </a>
      <button type="button" className="bm-remove" aria-label={`Remove ${b.title} from bookmarks`} onClick={() => removeBookmark(b.id)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </li>
  )
}

const CSS = `
  .bm-group + .bm-group { margin-top: 48px; }
  .bm-list { list-style: none; margin: 0; padding: 0; }
  .bm-row { display: flex; align-items: flex-start; gap: 12px; border-bottom: 1px solid var(--rule, #E5E1DC); }
  .bm-row:first-child { margin-top: -12px; }
  .bm-link { flex: 1; min-width: 0; display: block; padding: 16px 0; text-decoration: none; }
  .bm-title { display: block; font-family: "Playfair Display", Georgia, serif; font-size: 17px; font-weight: 700; line-height: 1.35; color: var(--ink, #111); }
  .bm-link:hover .bm-title { color: var(--brand-red, #C8102E); }
  .bm-desc { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-top: 4px; font-family: "DM Sans", Inter, system-ui, sans-serif; font-size: 13px; line-height: 1.55; color: var(--ink-muted, #6B6B6B); }
  .bm-remove { flex-shrink: 0; margin-top: 12px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 50%; background: none; color: #A8A5A0; cursor: pointer; transition: color .15s, background .15s; }
  .bm-remove:hover { color: var(--ink, #111); background: rgba(0,0,0,.05); }
  .bm-empty { border-top: 1px solid var(--ink, #111); padding: 40px 0; text-align: center; font-family: "DM Sans", Inter, system-ui, sans-serif; }
  .bm-empty-title { font-family: "Playfair Display", Georgia, serif; font-size: 20px; font-weight: 700; color: var(--ink, #111); margin: 0 0 8px; }
  .bm-empty-desc { font-size: 14px; line-height: 1.6; color: var(--ink-muted, #6B6B6B); margin: 0 auto 20px; max-width: 380px; }
  .bm-empty-link { font-size: 13px; font-weight: 700; color: var(--brand-red, #C8102E); text-decoration: none; }
  .bm-empty-link:hover { text-decoration: underline; }
`
