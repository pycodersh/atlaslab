'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * 웹앱 설치(PWA) 버튼 — K-PATTO · K-Pantry 공통. 환경마다 다르게 동작한다.
 *   iOS · iPadOS   "📲 Add to Home Screen"        → Safari 공유 → 홈 화면에 추가 안내
 *   Android        "📲 Install App to Home Screen" → 네이티브 설치 창(beforeinstallprompt), 없으면 메뉴 안내
 *   PC(Win/Mac)    "💻 Install Desktop App"        → 네이티브 설치 창, 없으면 주소창 설치 아이콘 안내
 * 이미 설치된 창(standalone)에서는 숨긴다. 설치가 끝나면(appinstalled) 바로 사라진다.
 *
 * 어느 앱을 설치하느냐는 그 화면에 걸린 매니페스트가 정한다(한 화면에는 한 앱의 매니페스트만 걸린다):
 *   K-PATTO  public/kpatto/manifest.webmanifest   — app/kpatto/layout.tsx
 *   K-Pantry public/kpantry/manifest.webmanifest  — app/kpantry/en/layout.tsx · app/kpantry/landing/page.tsx
 * beforeinstallprompt 는 페이지가 뜨자마자 한 번 오므로 InstallPromptCatcher 를 그 레이아웃에 두어 미리 잡아 둔다.
 * 앱별 색·이름은 components/kpatto/InstallAppButton.tsx · components/kpantry/InstallAppButton.tsx 가 채운다.
 */

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }
type Platform = 'ios' | 'android' | 'desktop'

declare global {
  interface Window { __pwaInstallPrompt?: BIPEvent | null }
}

const PROMPT_EVENT = 'pwa-install-prompt'

/** 앱 레이아웃에 한 번 — 설치 제안 이벤트를 잡아 두고 버튼들에 알린다 */
export function InstallPromptCatcher() {
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()   // 브라우저 기본 미니 배너 대신 우리 버튼으로 띄운다
      window.__pwaInstallPrompt = e as BIPEvent
      window.dispatchEvent(new Event(PROMPT_EVENT))
    }
    const onInstalled = () => {
      window.__pwaInstallPrompt = null
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

export type InstallTheme = {
  /** 안내 모달 제목·문구에 들어갈 앱 이름 */
  appName: string
  /** 안내 모달 아이콘 선 · 확인 버튼 색 */
  accent: string
  /** 안내 모달 아이콘 바탕 */
  accentLight: string
}

export type InstallAppButtonProps = {
  /** button = 꽉 찬 검은 버튼(앱 안), link = 글 줄 속 텍스트 링크(푸터), bare = 기본 스타일 없음(className 으로 꾸민다) */
  variant?: 'button' | 'link' | 'bare'
  /** 버튼을 감싸는 틀(카드 등) — 설치된 창에서는 틀째 사라진다 */
  frame?: (button: React.ReactNode) => React.ReactNode
  /** link 일 때 버튼 대신 쓸 문구 — 없으면 기기별 문구 */
  label?: string
  /** 버튼이 보일 때만 앞에 붙는 것(예: ' · ') — 설치된 창에서 구분점만 남지 않게 */
  before?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function InstallAppButton({ theme, variant = 'button', label, before, frame, style, className }: InstallAppButtonProps & { theme: InstallTheme }) {
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [hidden, setHidden] = useState(true)
  const [canPrompt, setCanPrompt] = useState(false)
  const [guide, setGuide] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setHidden(isStandalone())
    const sync = () => {
      setCanPrompt(!!window.__pwaInstallPrompt)
      if (window.__pwaInstallPrompt === null) setHidden(isStandalone())
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
    const ev = window.__pwaInstallPrompt
    if (platform !== 'ios' && ev) {
      await ev.prompt()
      const { outcome } = await ev.userChoice
      window.__pwaInstallPrompt = null   // 한 번 쓴 이벤트는 다시 못 쓴다
      setCanPrompt(false)
      if (outcome === 'accepted') setHidden(true)
      return
    }
    setGuide(true)
  }

  const base: React.CSSProperties = variant === 'bare' ? { cursor: 'pointer' } : variant === 'link'
    ? {
        display: 'inline', padding: 0, margin: 0, background: 'none', border: 'none',
        font: 'inherit', fontWeight: 600, color: 'inherit',
        textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer',
      }
    : {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', height: 52, borderRadius: 12, cursor: 'pointer',
        background: '#111111', color: '#FFFFFF', border: 'none',
        fontFamily: 'inherit', fontSize: 15.5, fontWeight: 700,
      }

  const button = (
    <button
      type="button"
      onClick={onClick}
      data-can-prompt={canPrompt || undefined}
      className={className}
      style={{ WebkitTapHighlightColor: 'transparent', ...base, ...style }}
    >
      {label ?? LABEL[platform]}
    </button>
  )

  return (
    <>
      {before}
      {frame ? frame(button) : button}
      {guide && <InstallGuide platform={platform} theme={theme} onClose={() => setGuide(false)} />}
    </>
  )
}

/* ── 안내 모달 — 네이티브 설치 창을 띄울 수 없을 때 ───────────────────────── */

const svg = (c: string) => ({ width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true })
const ShareIcon = ({ c }: { c: string }) => (
  <svg {...svg(c)}><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" /></svg>
)
const PlusSquare = ({ c }: { c: string }) => (
  <svg {...svg(c)}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></svg>
)
const InstallIcon = ({ c }: { c: string }) => (
  <svg {...svg(c)}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 8v5M9.5 10.5L12 13l2.5-2.5" /><path d="M8 21h8" /></svg>
)
const DotsIcon = ({ c }: { c: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={c} aria-hidden="true">
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
)

function guideFor(platform: Platform, name: string, c: string) {
  const done = <span style={{ fontSize: 18 }}>✅</span>
  switch (platform) {
    case 'ios': return {
      title: `Add ${name} to your Home Screen`,
      steps: [
        { icon: <ShareIcon c={c} />, text: <>Tap the <strong>Share</strong> button in Safari&rsquo;s toolbar.</> },
        { icon: <PlusSquare c={c} />, text: <>Scroll down and tap <strong>Add to Home Screen</strong>.</> },
        { icon: done, text: <>Tap <strong>Add</strong> — {name} opens full-screen from your Home Screen.</> },
      ],
      note: 'Use Safari for this step. On iPad, the Share button is at the top right.',
    }
    case 'android': return {
      title: `Install ${name}`,
      steps: [
        { icon: <DotsIcon c={c} />, text: <>Open Chrome&rsquo;s <strong>⋮ menu</strong> (top right).</> },
        { icon: <PlusSquare c={c} />, text: <>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</> },
        { icon: done, text: <>Confirm — {name} appears on your Home Screen.</> },
      ],
    }
    case 'desktop': return {
      title: `Install the ${name} desktop app`,
      steps: [
        { icon: <InstallIcon c={c} />, text: <>In Chrome or Edge, click the <strong>install icon</strong> at the right end of the address bar.</> },
        { icon: <PlusSquare c={c} />, text: <>Choose <strong>Install</strong>. {name} opens in its own window.</> },
      ],
      note: 'Safari on Mac: File → Add to Dock. Firefox doesn’t support installing web apps.',
    }
  }
}

function InstallGuide({ platform, theme, onClose }: { platform: Platform; theme: InstallTheme; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])
  const g = guideFor(platform, theme.appName, theme.accent)
  const sheet = platform !== 'desktop'

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: sheet ? 'flex-end' : 'center', justifyContent: 'center', padding: sheet ? 0 : 20 }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 440, background: '#fff', boxSizing: 'border-box', textAlign: 'left',
          fontFamily: 'inherit', borderRadius: sheet ? '20px 20px 0 0' : 20,
          padding: `24px 22px calc(${sheet ? 26 : 22}px + env(safe-area-inset-bottom, 0px))`,
        }}
      >
        <h2 id="install-guide-title" style={{ fontSize: 19, fontWeight: 800, color: '#111', margin: '0 0 16px' }}>{g.title}</h2>
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
          {g.steps.map((s, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, background: theme.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</span>
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: '#333' }}>{s.text}</span>
            </li>
          ))}
        </ol>
        {g.note && <p style={{ margin: '16px 0 0', fontSize: 12.5, lineHeight: 1.5, color: '#888' }}>{g.note}</p>}
        <button type="button" onClick={onClose} style={{ width: '100%', height: 48, marginTop: 18, borderRadius: 12, border: 'none', background: theme.accent, color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Got it
        </button>
      </div>
    </div>,
    document.body,
  )
}
