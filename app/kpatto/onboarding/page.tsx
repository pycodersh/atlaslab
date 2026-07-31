'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const ORANGE = '#D4873A'
const DARK = '#0d0d1a'
const TOTAL = 5

export default function KPattoOnboardingPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef(0)

  const goTo = (i: number) => {
    if (i < 0 || i >= TOTAL) return
    setCurrent(i)
  }

  const handleSkip = () => router.push('/kpatto')

  const handleStart = () => {
    localStorage.setItem('kpatto_visited', 'true')
    router.push('/kpatto/pre-course')
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) goTo(current + 1)
    else if (diff < -50) goTo(current - 1)
  }

  const handleSceneClick = () => {
    if (current < TOTAL - 1) goTo(current + 1)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 50 }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClick={handleSceneClick}
    >
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Skip */}
      <button
        onClick={(e) => { e.stopPropagation(); handleSkip() }}
        style={{
          position: 'absolute', top: 52, left: 20, zIndex: 20,
          background: 'rgba(0,0,0,0.45)', border: 'none',
          borderRadius: 20, padding: '8px 18px',
          color: 'white', fontSize: 15, cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Skip
      </button>

      {/* Dot indicator */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 48, left: 0, right: 0, zIndex: 20,
          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
        }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); goTo(i) }}
            style={{
              width: i === current ? 20 : 8, height: 8,
              borderRadius: 4,
              background: i === current ? ORANGE : 'rgba(255,255,255,0.35)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* ── Slides container ── */}
      <div style={{
        display: 'flex',
        width: `${TOTAL * 100}%`,
        height: '100dvh',
        transform: `translateX(-${current * (100 / TOTAL)}%)`,
        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {/* ── 씬 1: Hook ── */}
        <div style={{
          width: `${100 / TOTAL}%`, height: '100dvh', flexShrink: 0,
          background: DARK,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: '0 28px', textAlign: 'center',
        }}>
          <p style={{ color: 'white', fontSize: 40, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            Korean looks difficult?
          </p>
          <p style={{ color: '#888', fontSize: 22, margin: 0 }}>
            {"Let's change that."}
          </p>
        </div>

        {/* ── 씬 2: 한글 구조 ── */}
        <div style={{
          width: `${100 / TOTAL}%`, height: '100dvh', flexShrink: 0,
          background: DARK,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 28, padding: '0 28px', textAlign: 'center',
        }}>
          <div
            key={current === 1 ? 'hangul-on' : 'hangul-off'}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            {[
              { char: 'ㄱ', color: 'white',  size: 64, delay: '0.1s' },
              { char: '+',  color: '#888',   size: 48, delay: '0.4s' },
              { char: 'ㅏ', color: 'white',  size: 64, delay: '0.7s' },
              { char: '=',  color: '#888',   size: 48, delay: '1.0s' },
              { char: '가', color: ORANGE,   size: 80, delay: '1.3s' },
            ].map(({ char, color, size, delay }) => (
              <span key={char} style={{
                color, fontSize: size, fontWeight: 700, lineHeight: 1,
                animation: `fadeInScale 0.45s ease ${delay} both`,
              }}>
                {char}
              </span>
            ))}
          </div>
          <p style={{ color: 'white', fontSize: 20, margin: 0 }}>
            {"Consonant + vowel. That's it."}
          </p>
        </div>

        {/* ── 씬 3: 패턴 ── */}
        <div style={{
          width: `${100 / TOTAL}%`, height: '100dvh', flexShrink: 0,
          background: ORANGE,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: '0 28px', textAlign: 'center',
        }}>
          <p style={{ color: 'white', fontSize: 72, fontWeight: 700, margin: 0 }}>
            주세요
          </p>
          <p style={{ color: 'white', fontSize: 28, margin: 0 }}>
            {'"..., please."'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320, marginTop: 8 }}>
            {[
              { ko: '커피 주세요.', en: 'Coffee, please.' },
              { ko: '사진 찍어 주세요.', en: 'Please take a photo.' },
            ].map(({ ko, en }) => (
              <div key={ko} style={{
                background: 'rgba(255,255,255,0.2)', borderRadius: 14,
                padding: '16px 20px', textAlign: 'left',
              }}>
                <p style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>{ko}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: '4px 0 0' }}>{en}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 씬 4: 웹툰 ── */}
        <div style={{
          width: `${100 / TOTAL}%`, height: '100dvh', flexShrink: 0,
          background: '#1a1a2e',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          overflowY: 'auto', padding: '60px 20px 80px',
        }}>
          <img
            src="/kpatto/ep-001/cut-1.jpg"
            alt="webtoon cut 1"
            style={{ width: '100%', maxWidth: 360, objectFit: 'contain', borderRadius: 8 }}
          />
          <div style={{ height: 12, flexShrink: 0 }} />
          <img
            src="/kpatto/ep-001/cut-2.jpg"
            alt="webtoon cut 2"
            style={{ width: '100%', maxWidth: 360, objectFit: 'contain', borderRadius: 8 }}
          />
          <p style={{
            color: 'white', fontSize: 22, fontWeight: 700,
            textAlign: 'center', margin: '20px 0 0',
          }}>
            Learn inside real stories.
          </p>
        </div>

        {/* ── 씬 5: 시작 ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: `${100 / TOTAL}%`, height: '100dvh', flexShrink: 0,
            background: DARK,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12, padding: '0 28px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <Image
              src="/kpatto/kpatto-icon.png"
              alt="K-PATTO"
              width={80}
              height={80}
              style={{ borderRadius: 18 }}
            />
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1 }}>
              <span style={{ color: ORANGE }}>K</span>
              <span style={{ color: 'white' }}>-PATTO</span>
            </div>
          </div>
          <p style={{ color: '#888', fontSize: 18, margin: 0 }}>
            Learn Korean through stories.
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); handleStart() }}
            style={{
              marginTop: 24,
              background: 'none', color: ORANGE, border: 'none',
              padding: '16px 48px',
              fontSize: 18, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Start &gt;
          </button>
        </div>

      </div>
    </div>
  )
}
