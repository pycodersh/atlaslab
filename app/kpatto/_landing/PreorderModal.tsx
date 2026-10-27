'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const SERIF = '"Playfair Display", Georgia, serif'

type Status = 'idle' | 'sending' | 'done' | 'error'

/**
 * 결제 링크가 아직 없는 상품의 구매 버튼이 여는 사전 주문(출시 알림) 모달.
 * 이메일은 /api/kpatto/preorder → kp_preorder_emails 로 간다.
 * 배경 클릭 · X · Esc 로 닫히고, 열려 있는 동안 배경 스크롤을 잠근다.
 */
export function PreorderModal({ product, price, onClose }: { product: string; price: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const inputRef = useRef<HTMLInputElement | null>(null)

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
          padding: 40px 36px 32px; box-sizing: border-box;
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

        <p className="ckm-kicker" translate="no">K-PATTO</p>
        <h2 id="ckm-title" className="ckm-title">{product}</h2>
        <p className="ckm-price">
          {/* 자동 번역이 가격을 "14.99달러"처럼 바꾸지 않게 */}
          <span className="ckm-price-now notranslate" translate="no">{price}</span>{' '}
          <span className="ckm-price-tag">(Launch price)</span>
        </p>

        {status === 'done' ? (
          <div className="ckm-done" role="status">
            <p className="ckm-done-title">You&rsquo;re on the list.</p>
            <p className="ckm-text" style={{ margin: 0 }}>
              We&rsquo;ll email <strong>{email}</strong> as soon as checkout opens — at the {price} launch price.
            </p>
          </div>
        ) : (
          <>
            <p className="ckm-text">
              Secure checkout via Gumroad is coming soon. Enter your email and we&rsquo;ll tell you the moment it opens:
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
