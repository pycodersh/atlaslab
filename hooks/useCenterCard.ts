'use client'

import { type RefObject, useEffect, useState } from 'react'

export function useCenterCard(
  elemsRef: RefObject<(HTMLElement | null)[]>,
  count: number,
  mode: 'reading' | 'listening',
  listeningIndex?: number | null,
  patternSectionRef?: RefObject<HTMLElement | null>,
  role?: 'story' | 'pattern',
): number | null {
  const [centerIndex, setCenterIndex] = useState<number | null>(null)

  // Reset immediately when story changes (count or mode flip)
  useEffect(() => {
    setCenterIndex(null)
  }, [count])

  useEffect(() => {
    if (mode === 'listening') return

    const findCenterCard = () => {
      const elems = elemsRef.current ?? []
      if (!elems.length) return

      // Edge case: at very top or bottom of scroll container → no highlight
      const container = elems.find(Boolean)?.closest<HTMLElement>('[style*="overflow"]')
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container
        if (scrollTop < 50 || scrollHeight - scrollTop - clientHeight < 20) {
          setCenterIndex(null)
          return
        }
      }

      const centerY = window.innerHeight / 2

      // Boundary guard: only one section is active at a time
      if (patternSectionRef?.current && role) {
        const patternTop = patternSectionRef.current.getBoundingClientRect().top
        if (role === 'story' && patternTop < centerY) { setCenterIndex(null); return }
        if (role === 'pattern' && patternTop >= centerY) { setCenterIndex(null); return }
      }

      let minDist = Infinity
      let closestIdx: number | null = null

      elems.forEach((el, i) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const cardCenterY = (rect.top + rect.bottom) / 2
        const dist = Math.abs(cardCenterY - centerY)
        if (dist < minDist) {
          minDist = dist
          closestIdx = i
        }
      })

      setCenterIndex(closestIdx)
    }

    findCenterCard()

    window.addEventListener('scroll', findCenterCard, { capture: true, passive: true })
    return () => {
      window.removeEventListener('scroll', findCenterCard, { capture: true })
    }
  }, [elemsRef, count, mode, patternSectionRef, role])

  return mode === 'listening' ? (listeningIndex ?? null) : centerIndex
}
