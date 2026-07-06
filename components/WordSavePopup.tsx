'use client'

/**
 * WordSavePopup
 *
 * Story 문단에서 텍스트를 선택(long press → native selection)하면
 * 선택 영역 아래에 저장 확인 팝업을 표시한다.
 *
 * iOS/Android 제약:
 *  - 네이티브 선택 툴바(Copy/Look Up)와 동시에 표시될 수 있음 (PWA 허용 범위).
 *  - 네이티브 툴바를 억제하는 방법이 없으므로 팝업을 선택 영역 하단에 배치.
 */

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { saveWord, canSaveWord, type WordSourceType } from '@/lib/words/storage'
import { FREE_WORD_LIMIT } from '@/lib/subscription/storage'

type Props = {
  /** 단어가 속한 스토리 ID */
  storyId: number
  sourceType: WordSourceType
  /** 선택 감지를 제한할 컨테이너 ref. null이면 문서 전체 */
  containerRef: React.RefObject<HTMLElement | null>
  /** 문단 목록 — 선택된 텍스트가 속한 원본 문장을 찾기 위해 사용 */
  paragraphs: { id: string; english: string }[]
}

type PopupState = {
  word:     string
  sentence: string
  anchorY:  number   // viewport Y, 팝업 기준점
  anchorX:  number
}

type ToastState = 'hidden' | 'visible' | 'fading' | 'limit'

export function WordSavePopup({ storyId, sourceType, containerRef, paragraphs }: Props) {
  const [popup, setPopup]   = useState<PopupState | null>(null)
  const [toast, setToast]   = useState<ToastState>('hidden')
  const toastTimer          = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) { setPopup(null); return }

      const raw = sel.toString().trim()
      if (!raw || raw.split(/\s+/).length > 6) { setPopup(null); return }

      // 컨테이너 밖 선택이면 무시
      if (containerRef.current) {
        try {
          const range = sel.getRangeAt(0)
          if (!containerRef.current.contains(range.commonAncestorContainer)) {
            setPopup(null); return
          }
        } catch { setPopup(null); return }
      }

      try {
        const range = sel.getRangeAt(0)
        const rect  = range.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) { setPopup(null); return }

        // 원본 문장 찾기: data-para-id 속성을 타고 올라가 매칭
        let sentence = ''
        let node = range.commonAncestorContainer
        let el: Element | null =
          node.nodeType === Node.ELEMENT_NODE
            ? (node as Element)
            : (node as Text).parentElement

        while (el) {
          const pid = el.getAttribute?.('data-para-id')
          if (pid) {
            sentence = paragraphs.find(p => p.id === pid)?.english ?? ''
            break
          }
          el = el.parentElement
        }

        setPopup({
          word:    raw,
          sentence,
          anchorY: rect.bottom + window.scrollY,
          anchorX: rect.left + rect.width / 2,
        })
      } catch { setPopup(null) }
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [containerRef, paragraphs])

  function handleSave() {
    if (!popup) return
    if (!canSaveWord()) {
      window.getSelection()?.removeAllRanges()
      setPopup(null)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      setToast('limit')
      toastTimer.current = setTimeout(() => {
        setToast('fading')
        toastTimer.current = setTimeout(() => setToast('hidden'), 400)
      }, 2800)
      return
    }
    saveWord({
      word:             popup.word,
      sourceType,
      sourceId:         String(storyId),
      storyId,
      originalSentence: popup.sentence,
    })
    window.getSelection()?.removeAllRanges()
    setPopup(null)

    // Toast
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast('visible')
    toastTimer.current = setTimeout(() => {
      setToast('fading')
      toastTimer.current = setTimeout(() => setToast('hidden'), 400)
    }, 1800)
  }

  function handleCancel() {
    window.getSelection()?.removeAllRanges()
    setPopup(null)
  }

  // 팝업 X 위치: 뷰포트 안에 맞게 클램핑
  const popupWidth = 180
  const clampedX   = popup
    ? Math.max(popupWidth / 2 + 12, Math.min(popup.anchorX, (typeof window !== 'undefined' ? window.innerWidth : 375) - popupWidth / 2 - 12))
    : 0

  return (
    <>
      {/* ── 단어 저장 확인 팝업 ── */}
      {popup && (
        <div
          style={{
            position:  'fixed',
            top:       popup.anchorY - window.scrollY + 10,
            left:      clampedX - popupWidth / 2,
            width:     popupWidth,
            zIndex:    200,
            background: 'var(--pb)',
            border:    '1px solid var(--pd)',
            borderRadius: 10,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            padding:   '12px 14px',
          }}
        >
          {/* 화살표 포인터 */}
          <div style={{
            position: 'absolute', top: -7, left: '50%',
            width: 12, height: 12,
            background: 'var(--pb)', border: '1px solid var(--pd)',
            borderBottom: 'none', borderRight: 'none',
            transform: 'translateX(-50%) rotate(45deg)',
          }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 10 }}>
            <p style={{
              fontSize: 12, fontWeight: 700, color: 'var(--pt)',
              margin: 0, lineHeight: 1.4, wordBreak: 'break-word',
            }}>
              Save &ldquo;{popup.word}&rdquo;?
            </p>
            <button
              type="button"
              onClick={handleCancel}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0, marginTop: 1 }}
            >
              <X style={{ width: 12, height: 12, color: 'var(--pm2)' }} strokeWidth={2} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                flex: 1, padding: '7px 12px', borderRadius: 7,
                background: 'var(--pc)', color: 'var(--pt2)',
                border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1, padding: '7px 12px', borderRadius: 7,
                background: 'var(--pc)', color: 'var(--pt2)',
                border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── 저장 완료 Toast ── */}
      {toast !== 'hidden' && (
        <div style={{
          position:  'fixed',
          bottom:    90,
          left:      '50%',
          transform: 'translateX(-50%)',
          background: toast === 'limit' ? '#3A3A3C' : 'var(--pc)',
          color:     toast === 'limit' ? '#fff' : 'var(--pt2)',
          fontSize:  12,
          fontWeight: 600,
          padding:   '8px 20px',
          borderRadius: 20,
          zIndex:    300,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          opacity:   toast === 'fading' ? 0 : 1,
          transition: 'opacity 0.4s ease',
          border:    '1px solid var(--pd)',
        }}>
          {toast === 'limit'
            ? `Free plan: ${FREE_WORD_LIMIT} words max · Upgrade to Premium`
            : 'Saved to Library'}
        </div>
      )}
    </>
  )
}
