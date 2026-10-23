'use client'

import { useEffect, useRef, useState } from 'react'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const INK = '#111111'
const MUTED = '#6B6B6B'
const CREAM = '#F4EDE0'
const CREAM_LINE = '#E3D6C4'
const RED = '#C8102E'

const ITEMS = [
  {
    name: 'K-Patto',
    href: '/kpatto',
    blurb: 'Learn Korean through a 100-episode webtoon — 300+ real sentence patterns with native audio.',
  },
  {
    name: 'K-Pantry',
    href: '/kpantry/en',
    blurb: "Authentic Korean recipes built from what's already in your fridge.",
  },
  {
    name: 'Guides',
    href: '/blog',
    blurb: 'Phrases, grammar basics, curated stays, food and everyday life in Korea.',
  },
] as const

/**
 * 홈 히어로의 "How it works" 버튼 + 사이트 소개 모달.
 * 배경 클릭 · X · Esc 로 닫히고, 열려 있는 동안 배경 스크롤을 잠근다.
 * CTA "Explore Products" 는 모달을 닫고 아래 제품 카드(#products)로 부드럽게 이동한다.
 */
export function WelcomeTour() {
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      openerRef.current?.focus()
    }
  }, [open])

  return (
    <>
      <style>{`
        .wt-open {
          display: inline-block; cursor: pointer; border: none;
          font-family: ${BODY}; font-size: 13px; font-weight: 700;
          letter-spacing: .04em; text-transform: uppercase;
          background: ${RED}; color: #fff; padding: 12px 26px;
          transition: background .15s;
        }
        .wt-open:hover { background: #A30D25; }
        .wt-backdrop {
          position: fixed; inset: 0; z-index: 300;
          background: rgba(17,17,17,.62);
          display: flex; align-items: center; justify-content: center; padding: 24px;
          animation: wtFade .2s ease-out;
        }
        .wt-modal {
          position: relative; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;
          background: ${CREAM}; color: ${INK};
          border-top: 4px solid ${RED};
          padding: 44px 40px 36px;
          box-shadow: 0 24px 60px rgba(0,0,0,.35);
          animation: wtRise .26s cubic-bezier(.2,.8,.2,1);
        }
        .wt-close {
          position: absolute; top: 12px; right: 12px; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer; color: ${MUTED};
          font-size: 22px; line-height: 1; font-family: inherit; transition: color .15s;
        }
        .wt-close:hover { color: ${INK}; }
        .wt-item {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 14px 0; border-top: 1px solid ${CREAM_LINE};
          text-decoration: none; color: inherit;
        }
        .wt-item:last-of-type { border-bottom: 1px solid ${CREAM_LINE}; }
        .wt-item:hover .wt-item-name { color: ${RED}; }
        .wt-cta {
          display: inline-block; background: ${RED}; color: #fff; text-decoration: none;
          font-family: ${BODY}; font-size: 13px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
          padding: 12px 26px; transition: background .15s;
        }
        .wt-cta:hover { background: #A30D25; }
        @keyframes wtFade { from { opacity: 0; } }
        @keyframes wtRise { from { opacity: 0; transform: translateY(14px) scale(.985); } }
        @media (prefers-reduced-motion: reduce) { .wt-backdrop, .wt-modal { animation: none; } }
        @media (max-width: 480px) { .wt-modal { padding: 40px 22px 28px; } }
      `}</style>

      <button
        type="button"
        ref={openerRef}
        className="wt-open"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        How it works
      </button>

      {open && (
        <div className="wt-backdrop" onClick={() => setOpen(false)}>
          <div
            className="wt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wt-title"
            onClick={e => e.stopPropagation()}
          >
            <button type="button" className="wt-close" ref={closeRef} aria-label="Close" onClick={() => setOpen(false)}>×</button>

            <p style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: RED, margin: '0 0 12px' }} translate="no">
              Atlas Lab
            </p>
            <h2 id="wt-title" style={{ fontFamily: SERIF, fontSize: 30, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-.015em', margin: '0 0 14px' }}>
              Welcome to Atlas Lab
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7, color: '#4A4540', margin: '0 0 24px' }}>
              One place to live, travel and speak like a local in Korea — learn Korean through real sentence patterns,
              cook authentic Korean food at home, and plan your trip with curated travel and culture guides.
            </p>

            <div style={{ marginBottom: 28 }}>
              {ITEMS.map(item => (
                <a key={item.name} href={item.href} className="wt-item" onClick={() => setOpen(false)}>
                  <span>
                    <span className="wt-item-name notranslate" translate="no" style={{ display: 'block', fontFamily: SERIF, fontSize: 18, fontWeight: 700, transition: 'color .15s' }}>{item.name}</span>
                    <span style={{ display: 'block', fontFamily: BODY, fontSize: 13.5, lineHeight: 1.55, color: MUTED, marginTop: 3 }}>{item.blurb}</span>
                  </span>
                  <span aria-hidden style={{ color: RED, fontSize: 18, flexShrink: 0 }}>→</span>
                </a>
              ))}
            </div>

            <a href="#products" className="wt-cta" onClick={() => setOpen(false)}>Explore Products</a>
          </div>
        </div>
      )}
    </>
  )
}
