'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  DEFAULT_LANG, LANGS, STORAGE_KEY, detectLang, isLangCode, readTranslateCookie,
  type LangCode,
} from '@/lib/i18n/siteLanguages'

/**
 * 헤더 언어 선택(드롭다운) + 무료 자동 번역(Google Translate Element, 클라이언트).
 *
 * 흐름
 *  1) 처음 방문: localStorage 가 없으면 navigator.language 로 지원 언어를 찾는다(없으면 en).
 *  2) 언어를 고르면 localStorage('atlas_selected_lang') 에 저장하고, googtrans 쿠키를 맞춘 뒤 새로고침한다.
 *     (실시간 교체보다 새로고침이 React DOM 과 덜 부딪친다.)
 *  3) en 이 아니면 번역 스크립트를 이때만 불러온다. en 이면 아무것도 불러오지 않는다.
 *
 * 번역 제외: translate="no" / class="notranslate" 가 붙은 곳(이 컴포넌트, 코드 블록)은 그대로 둔다.
 * 한국어 글(/blog/ko/…)은 이미 한국어라 번역하지 않는다.
 */

declare global {
  interface Window {
    __atlasTranslateInit?: () => void
    __atlasDomPatched?: boolean
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any
  }
}

const RELOAD_GUARD = 'atlas_lang_reloaded'
const INCLUDED = LANGS.filter(l => l.code !== DEFAULT_LANG).map(l => l.code).join(',')

function setTranslateCookie(lang: LangCode) {
  const host = window.location.hostname
  const domains = ['', host, `.${host.replace(/^www\./, '')}`]
  if (lang === DEFAULT_LANG) {
    for (const d of domains) {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ''}`
    }
    return
  }
  for (const d of domains) {
    document.cookie = `googtrans=/en/${lang}; path=/; max-age=31536000${d ? `; domain=${d}` : ''}`
  }
}

/** 번역이 DOM 노드를 감싸고 나면 React 가 지우려는 노드를 못 찾아 터지는 알려진 문제를 막는다. */
function patchDomForTranslate() {
  if (window.__atlasDomPatched) return
  window.__atlasDomPatched = true
  const origRemove = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) return child
    return origRemove.call(this, child) as T
  }
  const origInsert = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) return node
    return origInsert.call(this, node, ref) as T
  }
}

function loadTranslateScript() {
  if (document.getElementById('google-translate-script')) return
  patchDomForTranslate()
  window.__atlasTranslateInit = () => {
    try {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: INCLUDED, autoDisplay: false },
        'google_translate_element',
      )
    } catch { /* 번역이 안 돼도 페이지는 원문으로 정상 동작한다 */ }
  }
  const s = document.createElement('script')
  s.id = 'google-translate-script'
  s.src = 'https://translate.google.com/translate_a/element.js?cb=__atlasTranslateInit'
  s.async = true
  document.body.appendChild(s)
}

export function LanguageSelector() {
  const pathname = usePathname() ?? ''
  const translatable = !pathname.startsWith('/blog/ko')
  const [lang, setLang] = useState<LangCode>(DEFAULT_LANG)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  // 첫 로드: 저장값 → 없으면 브라우저 언어. 쿠키를 맞추고, 바뀌었으면 한 번만 새로고침.
  useEffect(() => {
    let chosen: LangCode = DEFAULT_LANG
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (isLangCode(stored)) chosen = stored
      else {
        chosen = detectLang(navigator.language)
        localStorage.setItem(STORAGE_KEY, chosen)
      }
    } catch { chosen = detectLang(navigator.language) }
    // 저장값은 브라우저에서만 읽을 수 있어 마운트 뒤에 한 번 반영한다(서버 렌더 결과와 맞추려는 것).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLang(chosen)
    if (!translatable) return

    const cookieLang = readTranslateCookie(document.cookie)
    if (cookieLang !== chosen) {
      setTranslateCookie(chosen)
      let guarded = false
      try { guarded = sessionStorage.getItem(RELOAD_GUARD) === chosen } catch { /* 무시 */ }
      if (!guarded) {
        try { sessionStorage.setItem(RELOAD_GUARD, chosen) } catch { /* 무시 */ }
        window.location.reload()
        return
      }
    }
    if (chosen !== DEFAULT_LANG) loadTranslateScript()
  }, [translatable])

  // 바깥 클릭 / Esc 로 닫기
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function choose(next: LangCode) {
    setOpen(false)
    if (next === lang) return
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* 무시 */ }
    try { sessionStorage.removeItem(RELOAD_GUARD) } catch { /* 무시 */ }
    setLang(next)
    if (translatable) {
      setTranslateCookie(next)
      window.location.reload()
    }
  }

  const current = LANGS.find(l => l.code === lang) ?? LANGS[0]

  return (
    <div className="lang-sel notranslate" translate="no" ref={rootRef} data-open={open}>
      <style>{`
        .lang-sel { position: relative; display: flex; align-items: center; }
        /* 버튼 크기·모양은 헤더의 .nav-pill(SiteNav)이 정한다 — 여기서는 열림 상태만 */
        .lang-sel[data-open="true"] .lang-sel-btn { background: rgba(255,255,255,0.24); border-color: rgba(255,255,255,0.6); }
        .lang-sel-menu {
          position: absolute; top: calc(100% + 12px); right: 0; z-index: 300;
          min-width: 168px; margin: 0; padding: 6px; list-style: none;
          background: #fff; border: 1px solid var(--rule, #E5E1DC);
          box-shadow: 0 12px 32px rgba(0,0,0,0.10);
          animation: langFade 0.14s ease-out;
        }
        .lang-sel-item {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          width: 100%; padding: 9px 12px; background: none; border: none; cursor: pointer;
          font-family: inherit; font-size: 13px; color: var(--ink, #111); text-align: left;
          transition: background 0.12s;
        }
        .lang-sel-item:hover, .lang-sel-item:focus-visible { background: var(--paper-warm, #F7F5F2); outline: none; }
        .lang-sel-item[aria-selected="true"] { background: var(--paper-warm, #F7F5F2); font-weight: 700; }
        .lang-sel-check { color: var(--brand-red, #C8102E); font-size: 13px; }
        @keyframes langFade { from { opacity: 0; transform: translateY(-4px); } }
        @media (prefers-reduced-motion: reduce) { .lang-sel-menu { animation: none; } }
        @media (max-width: 480px) { .lang-sel-menu { right: -8px; } }
      `}</style>

      <button
        type="button"
        className="lang-sel-btn nav-pill nav-pill--sub"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.label}`}
        onClick={() => setOpen(o => !o)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3c2.6 2.7 4 5.7 4 9s-1.4 6.3-4 9c-2.6-2.7-4-5.7-4-9s1.4-6.3 4-9z" />
        </svg>
        <span className="lang-sel-code">{current.short}</span>
      </button>

      {open && (
        <ul className="lang-sel-menu" role="listbox" aria-label="Select language">
          {LANGS.map(l => (
            <li key={l.code} role="none">
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang}
                className="lang-sel-item"
                onClick={() => choose(l.code)}
              >
                <span lang={l.code}>{l.label}</span>
                {l.code === lang && <span className="lang-sel-check" aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 번역 위젯이 붙는 자리 — 화면에는 보이지 않는다 */}
      <div id="google_translate_element" style={{ display: 'none' }} />
    </div>
  )
}
