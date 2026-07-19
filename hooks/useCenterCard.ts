'use client'

import { type RefObject, useEffect, useState } from 'react'

/**
 * Tracks which card is "centered" in the viewport using IntersectionObserver.
 * - rootMargin is computed from window.innerHeight (25% top+bottom exclusion).
 * - Observer is recreated on window resize to pick up the new viewport height.
 * - boundaryRef + side: section isolation. 'above' = active only when viewport
 *   center is above the boundary element; 'below' = active only when at/below.
 *   Prevents simultaneous highlight across story paragraphs and pattern cards.
 * - No window.scrollY edge-case: scroll container is an overflow:auto div, not
 *   window, so scrollY is always 0. The ratioMap naturally returns null when
 *   nothing sits inside the rootMargin zone.
 * In listening mode, defers to the provided listeningIndex instead.
 */
export function useCenterCard(
  elemsRef: RefObject<(HTMLElement | null)[]>,
  count: number,
  mode: 'reading' | 'listening',
  listeningIndex?: number | null,
  boundaryRef?: RefObject<HTMLElement | null>,
  side?: 'above' | 'below',
): number | null {
  const [centerIndex, setCenterIndex] = useState<number | null>(null)

  useEffect(() => {
    if (mode === 'listening') return

    const elems = elemsRef.current ?? []
    if (!elems.length) return

    /** Returns true when this hook's section is the active viewport zone. */
    function isInZone(): boolean {
      if (!boundaryRef?.current || !side) return true
      const rect = boundaryRef.current.getBoundingClientRect()
      const mid  = window.innerHeight / 2
      return side === 'above' ? rect.top > mid : rect.top <= mid
    }

    function buildObserver() {
      const vh     = window.innerHeight
      const margin = Math.round(vh * 0.25)
      const ratioMap = new Map<number, number>()

      const obs = new IntersectionObserver(
        (entries) => {
          // Section isolation — yield to the other zone
          if (!isInZone()) {
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

    // Detect boundary crossing on every scroll (capture: true catches
    // scroll on any container, not just window).
    function onScroll() {
      if (!isInZone()) setCenterIndex(null)
    }

    function onResize() {
      current.disconnect()
      current = buildObserver()
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, { capture: true })

    return () => {
      current.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, { capture: true })
    }
  }, [elemsRef, count, mode, boundaryRef, side])

  return mode === 'listening' ? (listeningIndex ?? null) : centerIndex
}
