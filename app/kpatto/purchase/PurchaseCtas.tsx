'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CHECKOUT_URL } from '@/lib/kpatto/purchase'

export const PRICE = '$19.99'
export const LIST_PRICE = '$24.99'

/** 무료 미리보기 PDF — 표지·사용법 + 패턴 001~010 (exports/kpatto/pdf-build/make_free_sample.py 로 생성).
 *  NEXT_PUBLIC_KPATTO_FREE_SAMPLE_URL 로 바꿀 수 있고, 비어 있으면 커밋된 파일을 쓴다. */
const SAMPLE_URL = process.env.NEXT_PUBLIC_KPATTO_FREE_SAMPLE_URL || '/assets/K_Patto_Free_Sample_10.pdf'

const SERIF = '"Playfair Display", Georgia, serif'

/* 두 버튼이 공유하는 규격 — 높이 52px · 최소 폭 240px · 모바일은 화면 폭 */
const BTN = 'box-border w-full sm:w-auto min-w-[240px] h-[52px] px-6 rounded-md font-medium text-sm sm:text-base ' +
  'flex items-center justify-center text-center whitespace-nowrap no-underline cursor-pointer transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current'
const PRIMARY = 'bg-[var(--brand-red,#C8102E)] hover:bg-[var(--brand-red-dark,#A30D25)] text-white shadow-sm'
/* Tailwind 의 dark: 는 방문자 OS 테마를 따른다 — 히어로는 늘 검고 결제 섹션은 늘 밝으므로
   바탕에 맞춘 tone 으로 색을 고른다(OS 다크 모드에서 밝은 섹션의 글자가 흰색이 되는 일을 막는다). */
const SECONDARY = {
  dark: 'bg-transparent border border-white/40 hover:border-white hover:bg-white/5 text-white',
  light: 'bg-transparent border border-neutral-400 hover:border-neutral-900 text-neutral-900',
} as const
const NOTE = { dark: 'text-white/45', light: 'text-[#8A8580]' } as const

/**
 * 히어로와 결제 섹션이 똑같이 쓰는 버튼 한 쌍: 유료 전체 패키지(솔리드 레드) + 무료 샘플(아웃라인).
 *
 * 결제 링크는 NEXT_PUBLIC_KPATTO_CHECKOUT_URL(옛 이름 NEXT_PUBLIC_PDF_CHECKOUT_URL)에서 온다.
 * 채워지면 새 창으로 결제 페이지를 열고, 비어 있으면 '#' 대신 사전 주문 모달을 연다 —
 * 아무 일도 안 일어나는 버튼을 두지 않고 출시 알림 이메일을 받는다.
 */
export function PurchaseCtas({ tone }: { tone: 'dark' | 'light' }) {
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  // 한 span 으로 감싼다 — flex 버튼 안에서 텍스트와 가격 span 이 따로 놓이면 사이 공백이 사라진다
  const label = <span>Get Full Package — <span className="notranslate" translate="no">{PRICE}</span></span>

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        {CHECKOUT_URL ? (
          <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className={`${BTN} ${PRIMARY}`}>{label}</a>
        ) : (
          <button type="button" ref={openerRef} aria-haspopup="dialog" onClick={() => setOpen(true)} className={`${BTN} ${PRIMARY}`}>
            {label}
          </button>
        )}
        <a href={SAMPLE_URL} download className={`${BTN} ${SECONDARY[tone]}`}>
          Download Free Sample
        </a>
      </div>
      {/* 괄호 설명은 버튼에서 빼서 서브텍스트로 */}
      <p className={`mt-3 text-xs text-center sm:text-left ${NOTE[tone]}`}>
        Free sample: patterns 001–010 as a PDF, no sign-up · Full package: one-time payment, lifetime access
      </p>
      {open && <CheckoutModal onClose={() => { setOpen(false); openerRef.current?.focus() }} />}
    </div>
  )
}

type Status = 'idle' | 'sending' | 'done' | 'error'

function CheckoutModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Esc 로 닫기 · 배경 스크롤 잠금 · 열리면 이메일 칸에 포커스
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    inputRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/kpatto/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return createPortal(
    <div className="ckm-backdrop" onClick={onClose}>
      <style>{`
        .ckm-backdrop {
          position: fixed; inset: 0; z-index: 400;
          background: rgba(17,17,17,.64);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: ckmFade .22s ease-out;
        }
        .ckm {
          position: relative; width: 100%; max-width: 460px; max-height: calc(100dvh - 40px); overflow-y: auto;
          background: #fff; color: #111;
          border-top: 4px solid var(--brand-red, #C8102E);
          padding: 40px 36px 32px;
          box-shadow: 0 24px 60px rgba(0,0,0,.35);
          font-family: "DM Sans", "Inter", system-ui, sans-serif;
          animation: ckmRise .28s cubic-bezier(.2,.8,.2,1);
        }
        .ckm-x {
          position: absolute; top: 10px; right: 10px; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border: none; background: none; cursor: pointer; color: #8A8580; border-radius: 50%;
          transition: color .15s, background .15s;
        }
        .ckm-x:hover { color: #111; background: rgba(0,0,0,.05); }
        .ckm-kicker { font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--brand-red, #C8102E); margin: 0 0 10px; }
        .ckm-title { font-family: ${SERIF}; font-size: 26px; font-weight: 700; line-height: 1.2; letter-spacing: -.015em; margin: 0 0 12px; }
        .ckm-price { display: flex; align-items: baseline; gap: 8px; margin: 0 0 18px; }
        .ckm-price-now { font-family: ${SERIF}; font-size: 30px; font-weight: 700; color: var(--brand-red, #C8102E); line-height: 1; }
        .ckm-price-tag { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #6B6B6B; }
        .ckm-text { font-size: 14.5px; line-height: 1.65; color: #4A4540; margin: 0 0 20px; }
        .ckm-form { display: flex; flex-direction: column; gap: 10px; }
        .ckm-input {
          width: 100%; box-sizing: border-box; height: 48px; padding: 0 14px;
          border: 1px solid #D6D1CA; background: #fff; color: #111;
          font: inherit; font-size: 15px; outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .ckm-input:focus { border-color: #111; box-shadow: 0 0 0 3px rgba(17,17,17,.08); }
        .ckm-submit {
          height: 50px; border: none; cursor: pointer;
          background: var(--brand-red, #C8102E); color: #fff;
          font: inherit; font-size: 15px; font-weight: 700; letter-spacing: .01em;
          transition: background .15s, opacity .15s;
        }
        .ckm-submit:hover { background: var(--brand-red-dark, #A30D25); }
        .ckm-submit:disabled { opacity: .7; cursor: default; }
        .ckm-note { font-size: 12px; color: #8A8580; margin: 12px 0 0; }
        .ckm-error { font-size: 13px; color: var(--brand-red, #C8102E); margin: 2px 0 0; }
        .ckm-done { border-top: 1px solid #E5E1DC; padding-top: 18px; }
        .ckm-done-title { font-family: ${SERIF}; font-size: 20px; font-weight: 700; margin: 0 0 6px; }
        @keyframes ckmFade { from { opacity: 0; } }
        @keyframes ckmRise { from { opacity: 0; transform: translateY(12px) scale(.985); } }
        @media (prefers-reduced-motion: reduce) { .ckm-backdrop, .ckm { animation: none; } }
        @media (max-width: 480px) {
          .ckm { padding: 36px 22px 24px; }
          .ckm-title { font-size: 23px; }
        }
      `}</style>

      <div className="ckm" role="dialog" aria-modal="true" aria-labelledby="ckm-title" onClick={e => e.stopPropagation()}>
        <button type="button" className="ckm-x" aria-label="Close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <p className="ckm-kicker" translate="no">K-PATTO E-Book</p>
        <h2 id="ckm-title" className="ckm-title">Get K-Patto Premium Package</h2>
        <p className="ckm-price">
          {/* 자동 번역이 가격을 "19.99달러"처럼 바꾸지 않게 */}
          <span className="ckm-price-now notranslate" translate="no">{PRICE}</span>{' '}
          <span className="ckm-price-tag">(Launch Special)</span>
        </p>

        {status === 'done' ? (
          <div className="ckm-done" role="status">
            <p className="ckm-done-title">You&rsquo;re on the list.</p>
            <p className="ckm-text" style={{ margin: 0 }}>
              We&rsquo;ll email <strong>{email}</strong> as soon as checkout opens — at the {PRICE} launch price.
            </p>
          </div>
        ) : (
          <>
            <p className="ckm-text">
              Secure checkout via Gumroad / Stripe coming soon. Enter your email to get launch notifications:
            </p>
            <form className="ckm-form" onSubmit={submit}>
              <label htmlFor="ckm-email" className="sr-only">Email address</label>
              <input
                id="ckm-email"
                ref={inputRef}
                className="ckm-input"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); if (status === 'error') setStatus('idle') }}
              />
              <button type="submit" className="ckm-submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Notify Me & Pre-order'}
              </button>
              {status === 'error' && (
                <p className="ckm-error" role="alert">Something went wrong. Please try again in a moment.</p>
              )}
            </form>
            <p className="ckm-note">No payment now. We&rsquo;ll only email you about the launch.</p>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
