'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Tracks which card is "centered" in the viewport using IntersectionObserver.
 * - rootMargin is computed from window.innerHeight (25% top+bottom exclusion).
 * - Edge-case: null if scrolled to the very top or bottom of the page.
 * - Observer is recreated on window resize to pick up the new viewport height.
 * In listening mode, defers to the provided listeningIndex instead.
 */
export function useCenterCard(
  elemsRef: RefObject<(HTMLElement | null)[]>,
  count: number,
  mode: 'reading' | 'listening',
  listeningIndex?: number | null,
): number | null {
  const [centerIndex, setCenterIndex] = useState<number | null>(null)

  useEffect(() => {
    if (mode === 'listening') return

    const elems = elemsRef.current ?? []
    if (!elems.length) return

    const EDGE_PX = 50

    function buildObserver() {
      const vh     = window.innerHeight
      const margin = Math.round(vh * 0.25)
      const ratioMap = new Map<number, number>()

      const obs = new IntersectionObserver(
        (entries) => {
          // Edge-case: at very top or bottom — clear all highlights
          const atTop    = window.scrollY < EDGE_PX
          const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - EDGE_PX
          if (atTop || atBottom) {
            setCenterIndex(null)
            return
          }

          entries.forEach(entry => {
            const idx = elems.indexOf(entry.target as HTMLElement)
            if (idx === -1) return
            if (entry.isIntersecting) {
              ratioMap.set(idx, entry.intersectionRatio)
            } else {
              ratioMap.delete(idx)
            }
          })

          let best: number | null = null
          let bestR = 0
          ratioMap.forEach((r, idx) => {
            if (r > bestR) { bestR = r; best = idx }
          })
          setCenterIndex(best)
        },
        {
          threshold: [0, 0.6],
          rootMargin: `-${margin}px 0px -${margin}px 0px`,
        },
      )

      elems.forEach(el => { if (el) obs.observe(el) })
      return obs
    }

    let current = buildObserver()

    function onResize() {
      current.disconnect()
      current = buildObserver()
    }

    window.addEventListener('resize', onResize)

    return () => {
      current.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [elemsRef, count, mode])

  return mode === 'listening' ? (listeningIndex ?? null) : centerIndex
}
