'use client'

import { useEffect, useRef, useState } from 'react'

const SERIF = '"Playfair Display", Georgia, serif'
const BODY = '"DM Sans", "Inter", system-ui, sans-serif'
const INK = '#111111'
const MUTED = '#6B6B6B'
const CREAM = '#F4EDE0'
const CREAM_LINE = '#E3D6C4'
const RED = '#C8102E'

// 기능 설명이 아니라 "무엇이 쉬워지는가"를 말하는 가치 중심 카피 — 각 섹션 끝의 화살표 링크가 해당 콘텐츠로 바로 간다.
const SECTIONS = [
  {
    no: '01',
    title: 'Speak Korean for Real Life',
    product: 'K-PATTO',
    story: "Stop memorizing textbook grammar you'll never use. Learn 300+ survival phrases through our interactive webtoon series. With native audio and real-life scenarios, you'll communicate with confidence from day one.",
    href: '/kpatto',
    link: 'Start learning with K-Patto',
  },
  {
    no: '02',
    title: 'Korean Cooking, Zero Hassle',
    product: 'K-PANTRY',
    story: "Craving Korean food but missing the right ingredients? Just tell us what’s already in your fridge. We’ll generate authentic, easy-to-follow Korean recipes tailored to your local pantry.",
    href: '/kpantry/en',
    link: 'Find a recipe in K-Pantry',
  },
  {
    no: '03',
    title: 'Travel Beyond the Tourist Traps',
    product: 'EXPLORE KOREA',
    story: 'Skip the generic internet searches. Discover hand-picked luxury resorts, hidden local hotspots, and essential cultural etiquette. It’s like having a local best friend guiding you safely.',
    href: '/blog?tab=explore-korea',
    link: 'Read the travel guides',
  },
] as const

/**
 * 홈 히어로의 "Why Atlas Lab?" 버튼 + 사이트 소개 모달("Unlock Your Ultimate Korean Experience").
 * 배경 클릭 · X · Esc 로 닫히고, 열려 있는 동안 배경 스크롤을 잠근다.
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
        .wt-sec {
          display: grid; grid-template-columns: 44px 1fr; gap: 0 14px;
          padding: 20px 0; border-top: 1px solid ${CREAM_LINE};
        }
        .wt-sec:last-child { border-bottom: 1px solid ${CREAM_LINE}; }
        .wt-no {
          font-family: ${SERIF}; font-size: 26px; font-weight: 700; line-height: 1;
          color: ${RED}; padding-top: 2px;
        }
        .wt-link {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 12px;
          font-family: ${BODY}; font-size: 13px; font-weight: 700; letter-spacing: .02em;
          color: ${RED}; text-decoration: none;
        }
        .wt-link-arrow { transition: transform .18s; }
        .wt-link:hover { text-decoration: underline; text-underline-offset: 3px; }
        .wt-link:hover .wt-link-arrow { transform: translateX(4px); }
        .wt-link:focus-visible { outline: 2px solid ${RED}; outline-offset: 3px; }
        @keyframes wtFade { from { opacity: 0; } }
        @keyframes wtRise { from { opacity: 0; transform: translateY(14px) scale(.985); } }
        @media (prefers-reduced-motion: reduce) { .wt-backdrop, .wt-modal { animation: none; } }
        @media (max-width: 480px) {
          .wt-modal { padding: 40px 22px 24px; }
          .wt-sec { grid-template-columns: 34px 1fr; gap: 0 10px; padding: 18px 0; }
          .wt-no { font-size: 22px; }
        }
      `}</style>

      <button
        type="button"
        ref={openerRef}
        className="wt-open"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        Why Atlas Lab?
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
              Unlock Your Ultimate Korean Experience
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 15, lineHeight: 1.7, color: '#4A4540', margin: '0 0 24px' }}>
              Traveling, living, or cooking Korean shouldn&rsquo;t feel like a maze. We bridge the gap between tourists and locals. Here is how <span className="notranslate" translate="no">Atlas Lab</span> makes your journey effortless:
            </p>

            <div>
              {SECTIONS.map(s => (
                <section key={s.no} className="wt-sec" aria-labelledby={`wt-sec-${s.no}`}>
                  <span className="wt-no" aria-hidden>{s.no}</span>
                  <div>
                    <p className="notranslate" translate="no" style={{ fontFamily: BODY, fontSize: 10, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: MUTED, margin: '0 0 4px' }}>
                      {s.product}
                    </p>
                    <h3 id={`wt-sec-${s.no}`} style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, lineHeight: 1.25, margin: '0 0 6px' }}>
                      {s.title}
                    </h3>
                    <p style={{ fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: '#4A4540', margin: 0 }}>
                      {s.story}
                    </p>
                    <a href={s.href} className="wt-link" onClick={() => setOpen(false)}>
                      {s.link} <span className="wt-link-arrow" aria-hidden>→</span>
                    </a>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
