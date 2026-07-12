'use client'

/**
 * WordSavePopup
 *
 * Story 문단에서 텍스트를 선택하면 Trainer Orb 버블로 저장 확인을 표시한다.
 * 기존 인라인 팝업 + 토스트를 제거하고 TrainerContext.showAction()으로 대체.
 */

import { useEffect, useRef } from 'react'
import { saveWord, canSaveWord, type WordSourceType } from '@/lib/words/storage'
import { FREE_WORD_LIMIT } from '@/lib/subscription/storage'
import { useTrainerSafe } from '@/contexts/TrainerContext'

type Props = {
  storyId: number
  sourceType: WordSourceType
  containerRef: React.RefObject<HTMLElement | null>
  paragraphs: { id: string; english: string }[]
}

export function WordSavePopup({ storyId, sourceType, containerRef, paragraphs }: Props) {
  const trainer = useTrainerSafe()
  const trainerRef = useRef(trainer)
  trainerRef.current = trainer

  const cooldownRef = useRef(false)

  useEffect(() => {
    function onSelectionChange() {
      if (cooldownRef.current) return
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed) return

      const raw = sel.toString().trim()
      if (!raw || raw.split(/\s+/).length > 6) return

      if (containerRef.current) {
        try {
          const range = sel.getRangeAt(0)
          if (!containerRef.current.contains(range.commonAncestorContainer)) return
        } catch { return }
      }

      try {
        const range = sel.getRangeAt(0)
        const rect  = range.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) return

        // 원본 문장 찾기
        let sentence = ''
        let node = range.commonAncestorContainer
        let el: Element | null =
          node.nodeType === Node.ELEMENT_NODE
            ? (node as Element)
            : (node as Text).parentElement
        while (el) {
          const pid = el.getAttribute?.('data-para-id')
          if (pid) { sentence = paragraphs.find(p => p.id === pid)?.english ?? ''; break }
          el = el.parentElement
        }

        const wordDisplay = raw.length > 20 ? raw.slice(0, 18) + '…' : raw

        const t = trainerRef.current
        if (!t) return

        if (!canSaveWord()) {
          t.showMessage(`Free plan: ${FREE_WORD_LIMIT} words max`, 3000)
          window.getSelection()?.removeAllRanges()
          return
        }

        t.showAction(
          `Save "${wordDisplay}"?`,
          [
            {
              label: 'Not now',
              onClick: () => {
                window.getSelection()?.removeAllRanges()
                trainerRef.current?.clearMessage()
              },
            },
            {
              label: 'Save',
              primary: true,
              onClick: () => {
                cooldownRef.current = true
                saveWord({ word: raw, sourceType, sourceId: String(storyId), storyId, originalSentence: sentence })
                window.getSelection()?.removeAllRanges()
                setTimeout(() => {
                  trainerRef.current?.showMessage('Saved.', 1800)
                  setTimeout(() => { cooldownRef.current = false }, 500)
                }, 100)
              },
            },
          ],
        )
      } catch { /* ignore */ }
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => document.removeEventListener('selectionchange', onSelectionChange)
  }, [containerRef, paragraphs, sourceType, storyId]) // trainer accessed via ref

  return null
}
