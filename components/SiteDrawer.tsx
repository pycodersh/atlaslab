'use client'

/**
 * 헤더 우측 햄버거(≡) → 오른쪽에서 밀려 나오는 사이드 드로어. SiteNav 가 언어 선택 바로 오른쪽에 둔다.
 *
 *   Products   K-Patto · K-Pantry
 *   Korean     Phrases · Basics ▸ (All Basics + 4개 소분류)
 *   Guides     Explore Korea ▸ · Food & Dining ▸ · Living in Korea ▸ (All + 소분류)
 *
 * 기본은 2단계까지 보이고, 소분류가 있는 항목은 눌러야 3단계가 펼쳐진다(한 번에 하나만 열린다).
 * 소분류 목록은 lib/blog/subcategories 의 SUBCATEGORIES 에서 그대로 읽는다 — /blog 목록의 칩과 어긋나지 않게.
 * 링크를 누르면 그 주소로 가면서 드로어가 닫힌다. 열려 있는 동안 본문 스크롤을 잠그고, Esc · 배경 · X 로 닫는다.
 * 닫힌 동안에는 visibility:hidden 이라 탭 순서에 끼지 않는다(닫히는 애니메이션이 끝난 뒤 숨는다).
 * 메뉴 이름은 자동 번역에서 뺀다(translate="no") — 목록 탭 이름과 같은 영어 라벨을 그대로 둔다.
 * 패널은 body 로 포털한다 — 헤더(sticky, z-index 100) 안에 두면 글 하단 고정 CTA(z-index 150)가 그 위로 올라온다.
 */
import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { subcategoriesFor } from '@/lib/blog/subcategories'

type Leaf = { label: string; href: string }
type Branch = { label: string; href?: string; children?: Leaf[] }
type Group = { label: string; items: Branch[] }

/** 그룹의 'All' + 소분류 링크 — /blog?tab=<group>&sub=<key> */
function withSubs(group: string, allLabel = 'All'): Leaf[] {
  return [
    { label: allLabel, href: `/blog?tab=${group}` },
    ...subcategoriesFor(group).map(s => ({ label: s.label, href: `/blog?tab=${group}&sub=${s.key}` })),
  ]
}

const TREE: Group[] = [
  {
    label: 'Products',
    items: [
      { label: 'K-Patto', href: '/kpatto' },
      { label: 'K-Pantry', href: '/kpantry' },
    ],
  },
  {
    label: 'Korean',
    items: [
      { label: 'Phrases', href: '/blog?tab=phrases' },
      { label: 'Basics', children: withSubs('basics', 'All Basics') },
    ],
  },
  {
    label: 'Guides',
    items: [
      { label: 'Explore Korea', children: withSubs('explore-korea') },
      { label: 'Food & Dining', children: withSubs('food') },
      { label: 'Living in Korea', children: withSubs('life') },
    ],
  },
]

const BODY = '"DM Sans", "Inter", system-ui, sans-serif'

export function SiteDrawer() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  // 포털 대상(document.body)은 브라우저에만 있다 — 서버 HTML 에는 버튼만 굽는다
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const closeRef = useRef<HTMLButtonElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const id = useId()

  // 열려 있는 동안 본문 스크롤 잠금 + Esc 로 닫기. 닫히면 햄버거 버튼으로 포커스를 돌려준다
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // preventScroll — 포커스를 옮기며 페이지가 맨 위(헤더)로 튀지 않게
    closeRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    const toggle = toggleRef.current
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      toggle?.focus({ preventScroll: true })
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <style>{`
        .sd-burger {
          width: 40px; height: 40px; margin-right: -8px;
          display: inline-flex; align-items: center; justify-content: center;
          background: none; border: 0; border-radius: 999px; cursor: pointer; color: #fff;
        }
        .sd-burger:hover { background: rgba(255,255,255,0.12); }
        .sd-burger:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

        .sd-dim {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          opacity: 0; visibility: hidden; transition: opacity .25s, visibility 0s .25s;
        }
        .sd-panel {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 201;
          width: min(360px, 88vw); background: #fff; box-shadow: -12px 0 40px rgba(0,0,0,0.18);
          display: flex; flex-direction: column; font-family: ${BODY}; color: #1C1917;
          transform: translateX(100%); visibility: hidden;
          transition: transform .28s cubic-bezier(.2,.7,.2,1), visibility 0s .28s;
        }
        .sd-open .sd-dim { opacity: 1; visibility: visible; transition: opacity .25s; }
        .sd-open .sd-panel { transform: none; visibility: visible; transition: transform .28s cubic-bezier(.2,.7,.2,1); }

        .sd-head { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 8px 0 24px; border-bottom: 1px solid #E7E5E4; }
        .sd-title { font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #78716C; }
        .sd-x { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; background: none; border: 0; border-radius: 999px; cursor: pointer; color: #1C1917; }
        .sd-x:hover { background: #F5F5F4; }
        .sd-x:focus-visible, .sd-link:focus-visible, .sd-branch:focus-visible { outline: 2px solid #C8102E; outline-offset: -2px; }

        .sd-body { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 8px 0 32px; }
        .sd-group { padding: 16px 0 4px; }
        .sd-group + .sd-group { border-top: 1px solid #F0EEEB; }
        .sd-glabel { margin: 0 0 4px; padding: 0 24px; font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #C8102E; }
        .sd-list { list-style: none; margin: 0; padding: 0; }

        .sd-link, .sd-branch {
          display: flex; align-items: center; justify-content: space-between; width: 100%; box-sizing: border-box;
          min-height: 48px; padding: 0 24px; font: inherit; font-size: 16px; font-weight: 600; color: #1C1917;
          text-decoration: none; text-align: left; background: none; border: 0; cursor: pointer;
        }
        .sd-link:hover, .sd-branch:hover { background: #FAF8F5; }
        .sd-chev { flex: none; color: #A8A29E; transition: transform .25s; }
        .sd-branch[aria-expanded="true"] .sd-chev { transform: rotate(90deg); color: #1C1917; }

        /* 3단계 — 높이 0fr → 1fr 로 부드럽게 펼친다 */
        .sd-sub { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .28s ease; }
        .sd-sub.is-open { grid-template-rows: 1fr; }
        .sd-sub > ul { overflow: hidden; list-style: none; margin: 0; padding: 0; }
        .sd-sub .sd-link { min-height: 42px; padding-left: 40px; font-size: 15px; font-weight: 400; color: #44403C; }
        .sd-sub .sd-link:first-child { font-weight: 600; }
        @media (prefers-reduced-motion: reduce) { .sd-panel, .sd-dim, .sd-sub, .sd-chev { transition: none !important; } }
      `}</style>

      <button
        ref={toggleRef}
        type="button"
        className="sd-burger"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(true)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {mounted && createPortal(
      <div className={open ? 'sd-open' : undefined}>
        <div className="sd-dim" onClick={close} aria-hidden="true" />
        {/* 자동 번역(헤더 언어 선택)에서 뺀다 — 'Phrases' 가 '실없는 말', K-Patto 가 '케이패토'로 바뀐다 */}
        <aside id={id} className="sd-panel" role="dialog" aria-modal="true" aria-label="Site menu" translate="no">
          <div className="sd-head">
            <span className="sd-title">Menu</span>
            <button ref={closeRef} type="button" className="sd-x" aria-label="Close menu" onClick={close}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="sd-body" aria-label="Site sections">
            {TREE.map(group => (
              <div key={group.label} className="sd-group">
                <p className="sd-glabel">{group.label}</p>
                <ul className="sd-list">
                  {group.items.map(item => {
                    if (!item.children) {
                      return (
                        <li key={item.label}>
                          <Link href={item.href!} className="sd-link" onClick={close}>{item.label}</Link>
                        </li>
                      )
                    }
                    const key = `${group.label}/${item.label}`
                    const isOpen = expanded === key
                    const subId = `${id}-${group.label}-${item.label}`.replace(/[^\w-]/g, '')
                    return (
                      <li key={item.label}>
                        <button
                          type="button"
                          className="sd-branch"
                          aria-expanded={isOpen}
                          aria-controls={subId}
                          onClick={() => setExpanded(isOpen ? null : key)}
                        >
                          {item.label}
                          <svg className="sd-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <div id={subId} className={`sd-sub${isOpen ? ' is-open' : ''}`}>
                          <ul>
                            {item.children.map(leaf => (
                              <li key={leaf.href}>
                                <Link href={leaf.href} className="sd-link" onClick={close} tabIndex={isOpen ? 0 : -1}>
                                  {leaf.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
      </div>,
      document.body,
      )}
    </>
  )
}
