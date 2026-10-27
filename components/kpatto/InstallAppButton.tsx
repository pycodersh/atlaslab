'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { KP } from '@/lib/kpatto/theme'

/**
 * K-PATTO 설치(PWA) 버튼 — 환경마다 다르게 동작한다.
 *   iOS · iPadOS   "📲 Add to Home Screen"        → Safari 공유 → 홈 화면에 추가 안내
 *   Android        "📲 Install App to Home Screen" → 네이티브 설치 창(beforeinstallprompt), 없으면 메뉴 안내
 *   PC(Win/Mac)    "💻 Install Desktop App"        → 네이티브 설치 창, 없으면 주소창 설치 아이콘 안내
 * 이미 설치된 창(standalone)에서는 숨긴다. 설치가 끝나면(appinstalled) 바로 사라진다.
 *
 * beforeinstallprompt 는 페이지가 뜨자마자 한 번 오므로 KPattoInstallPromptCatcher(앱 레이아웃)가
 * 미리 잡아 window 에 둔다. 매니페스트: public/kpatto/manifest.webmanifest
 */

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
type Platform = 'ios' | 'android' | 'desktop'

declare global {
  interface Window { __kpattoInstallPrompt?: BIPEvent | null }
}

const PROMPT_EVENT = 'kpatto-install-prompt'

/** 앱 레이아웃에 한 번 — 설치 제안 이벤트를 잡아 두고 버튼들에 알린다 */
export function KPattoInstallPromptCatcher() {
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()   // 브라우저 기본 미니 배너 대신 우리 버튼으로 띄운다
      window.__kpattoInstallPrompt = e as BIPEvent
      window.dispatchEvent(new Event(PROMPT_EVENT))
    }
    const onInstalled = () => {
      window.__kpattoInstallPrompt = null
      window.dispatchEvent(new Event(PROMPT_EVENT))
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])
  return null
}

function detectPlatform(): Platform {
  const ua = navigator.userAgent
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1   // iPadOS 13+ 는 Mac 처럼 보인다
  if (/iPhone|iPad|iPod/i.test(ua) || iPadOS) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'desktop'
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

const LABEL: Record<Platform, string> = {
  ios: '📲 Add to Home Screen',
  android: '📲 Install App to Home Screen',
  desktop: '💻 Install Desktop App',
}

export function InstallAppButton({ style }: { style?: React.CSSProperties }) {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [hidden, setHidden] = useState(true)
  const [canPrompt, setCanPrompt] = useState(false)
  const [guide, setGuide] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setHidden(isStandalone())
    const sync = () => {
      setCanPrompt(!!window.__kpattoInstallPrompt)
      if (window.__kpattoInstallPrompt === null) setHidden(isStandalone())
    }
    sync()
    window.addEventListener(PROMPT_EVENT, sync)
    const onInstalled = () => setHidden(true)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener(PROMPT_EVENT, sync)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!platform || hidden) return null

  async function onClick() {
    const ev = window.__kpattoInstallPrompt
    if (platform !== 'ios' && ev) {
      await ev.prompt()
      const { outcome } = await ev.userChoice
      window.__kpattoInstallPrompt = null   // 한 번 쓴 이벤트는 다시 못 쓴다
      setCanPrompt(false)
      if (outcome === 'accepted') setHidden(true)
      return
    }
    setGuide(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        data-can-prompt={canPrompt || undefined}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 52, borderRadius: 12, cursor: 'pointer',
          background: '#111111', color: '#FFFFFF', border: 'none',
          fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700,
          WebkitTapHighlightColor: 'transparent',
          ...style,
        }}
      >
        {LABEL[platform]}
      </button>
      {guide && <InstallGuide platform={platform} onClose={() => setGuide(false)} />}
    </>
  )
}

/* ── 안내 모달 — 네이티브 설치 창을 띄울 수 없을 때 ───────────────────────── */

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={KP.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
  </svg>
)
const PlusSquare = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={KP.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" />
  </svg>
)
const InstallIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={KP.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 8v5M9.5 10.5L12 13l2.5-2.5" /><path d="M8 21h8" />
  </svg>
)
const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={KP.primary} aria-hidden="true">
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
)

const GUIDE: Record<Platform, { title: string; steps: { icon: React.ReactNode; text: React.ReactNode }[]; note?: string }> = {
  ios: {
    title: 'Add K-PATTO to your Home Screen',
    steps: [
      { icon: <ShareIcon />, text: <>Tap the <strong>Share</strong> button in Safari&rsquo;s toolbar.</> },
      { icon: <PlusSquare />, text: <>Scroll down and tap <strong>Add to Home Screen</strong>.</> },
      { icon: <span style={{ fontSize: 18 }}>✅</span>, text: <>Tap <strong>Add</strong> — K-PATTO opens full-screen from your Home Screen.</> },
    ],
    note: 'Use Safari for this step. On iPad, the Share button is at the top right.',
  },
  android: {
    title: 'Install K-PATTO',
    steps: [
      { icon: <DotsIcon />, text: <>Open Chrome&rsquo;s <strong>⋮ menu</strong> (top right).</> },
      { icon: <PlusSquare />, text: <>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</> },
      { icon: <span style={{ fontSize: 18 }}>✅</span>, text: <>Confirm — K-PATTO appears on your Home Screen.</> },
    ],
  },
  desktop: {
    title: 'Install the K-PATTO desktop app',
    steps: [
      { icon: <InstallIcon />, text: <>In Chrome or Edge, click the <strong>install icon</strong> at the right end of the address bar.</> },
      { icon: <PlusSquare />, text: <>Choose <strong>Install</strong>. K-PATTO opens in its own window.</> },
    ],
    note: 'Safari on Mac: File → Add to Dock. Firefox doesn’t support installing web apps.',
  },
}

function InstallGuide({ platform, onClose }: { platform: Platform; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  const g = GUIDE[platform]

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 330, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: platform === 'desktop' ? 'center' : 'flex-end', justifyContent: 'center', padding: platform === 'desktop' ? 20 : 0 }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440, background: '#fff', boxSizing: 'border-box',
          borderRadius: platform === 'desktop' ? 20 : '20px 20px 0 0',
          padding: `24px 22px calc(${platform === 'desktop' ? 22 : 26}px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <h2 id="install-guide-title" style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>{g.title}</h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {g.steps.map((s, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: KP.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: '#333' }}>{s.text}</span>
            </li>
          ))}
        </ol>
        {g.note && <p style={{ margin: '16px 0 0', fontSize: 12.5, lineHeight: 1.5, color: '#888' }}>{g.note}</p>}
        <button type="button" onClick={onClose} style={{ width: '100%', height: 48, marginTop: 18, borderRadius: 12, border: 'none', background: KP.primary, color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Got it
        </button>
      </div>
    </div>,
    document.body,
  )
}
