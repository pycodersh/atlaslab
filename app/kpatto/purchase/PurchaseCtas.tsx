'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CHECKOUT_URL } from '@/lib/kpatto/purchase'

export const PRICE = '$19.99'
export const LIST_PRICE = '$24.99'
/** 무료 미리보기 PDF — 표지·사용법 + 패턴 001~010 (exports/kpatto/pdf-build/make_free_sample.py 로 생성) */
const SAMPLE_PDF = '/assets/K_Patto_Free_Sample_10.pdf'
const SAMPLE_PATTERNS = 10

const SERIF = '"Playfair Display", Georgia, serif'

/**
 * 히어로와 결제 섹션이 똑같이 쓰는 버튼 한 쌍: 구매(솔리드 레드) + 무료 샘플(아웃라인).
 * 같은 높이로 나란히(모바일은 세로로 화면 폭), 아래 한 줄로 무엇을 받는지 알린다.
 * tone 은 바탕색만 따른다 — dark(검은 히어로)는 흰 아웃라인, light(오프화이트 본문)는 검은 아웃라인.
 *
 * 결제 연동 전이라 구매 버튼은 사전 주문 모달을 연다.
 * NEXT_PUBLIC_PDF_CHECKOUT_URL 이 채워지면 모달 대신 그 결제 링크로 간다(코드 수정 없이).
 */
export function PurchaseCtas({ tone }: { tone: 'dark' | 'light' }) {
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement | null>(null)

  const buyInner = (
    <>
      {/* 공백 텍스트는 flex 에서 보이지 않지만 스크린 리더가 "Package $19.99" 로 띄어 읽게 한다 */}
      <span>Buy the Premium Package</span>{' '}
      <span className="pc-buy-sep" aria-hidden />{' '}
      <span className="notranslate" translate="no">{PRICE}</span>
    </>
  )

  return (
    <div className={`pc pc--${tone}`}>
      <style>{CTA_CSS}</style>
      <div className="pc-row">
        {CHECKOUT_URL ? (
          <a href={CHECKOUT_URL} className="pc-btn pc-buy" rel="noopener noreferrer">{buyInner}</a>
        ) : (
          <button type="button" ref={openerRef} className="pc-btn pc-buy" aria-haspopup="dialog" onClick={() => setOpen(true)}>
            {buyInner}
          </button>
        )}
        <a href={SAMPLE_PDF} download className="pc-btn pc-sample">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" />
          </svg>
          Free Sample ({SAMPLE_PATTERNS} Patterns)
        </a>
      </div>
      <p className="pc-note">Instant PDF download · Sample needs no sign-up · One-time payment, lifetime access</p>
      {open && <CheckoutModal onClose={() => { setOpen(false); openerRef.current?.focus() }} />}
    </div>
  )
}

const CTA_CSS = `
  .pc-row { display: flex; flex-wrap: wrap; gap: 12px; }
  .pc-btn {
    box-sizing: border-box; height: 56px; padding: 0 28px;
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
    font-family: "DM Sans", "Inter", system-ui, sans-serif; font-size: 15px; font-weight: 700;
    letter-spacing: .01em; line-height: 1; text-decoration: none; white-space: nowrap;
    border: 1px solid transparent; cursor: pointer;
    transition: background .18s, border-color .18s, color .18s, transform .18s;
  }
  .pc-btn:active { transform: translateY(1px); }
  .pc-btn:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
  .pc-buy { background: var(--brand-red, #C8102E); border-color: var(--brand-red, #C8102E); color: #fff; }
  .pc-buy:hover { background: var(--brand-red-dark, #A30D25); border-color: var(--brand-red-dark, #A30D25); }
  /* 상품명과 가격 사이의 가는 세로선 — 대시보다 정돈돼 보인다 */
  .pc-buy-sep { width: 1px; height: 16px; background: rgba(255,255,255,.45); }
  .pc-sample { background: transparent; font-weight: 600; }
  .pc--dark .pc-sample { color: #fff; border-color: rgba(255,255,255,.38); }
  .pc--dark .pc-sample:hover { border-color: #fff; background: rgba(255,255,255,.07); }
  .pc--light .pc-sample { color: #111; border-color: #111; }
  .pc--light .pc-sample:hover { background: #111; color: #fff; }
  .pc-note { margin: 14px 0 0; font-family: "DM Sans", "Inter", system-ui, sans-serif; font-size: 12.5px; letter-spacing: .01em; }
  .pc--dark .pc-note { color: rgba(255,255,255,.48); }
  .pc--light .pc-note { color: #8A8580; }
  @media (max-width: 560px) {
    .pc-row { flex-direction: column; }
    .pc-btn { width: 100%; padding: 0 18px; }
    .pc-note { text-align: center; }
  }
`

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
