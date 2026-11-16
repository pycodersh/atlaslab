'use client'

import { useEffect, useState, type ReactNode } from 'react'

/**
 * 두 장면을 겹쳐 두고 크로스페이드로 번갈아 보여 준다 — 버튼 · 표시 없이 그림만.
 * - 자동 전환: Heritage 8초 → Culture 7초를 끝없이 돈다. 멈출 수단(토글)이 없으니 마우스를 올려도 멈추지 않는다.
 * - 움직임 줄이기 설정이면 자동 전환을 하지 않는다(Heritage 한 장면만).
 * 숨은 장면의 루프 애니메이션은 CSS 로 멈춘다(.hp-scene[data-on="false"]).
 */

const DWELL = [8000, 7000] as const

export function PanoramaStage({ heritage, culture }: { heritage: ReactNode; culture: ReactNode }) {
  const [scene, setScene] = useState<0 | 1>(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setAuto(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!auto) return
    const id = window.setTimeout(() => setScene((s) => (s ? 0 : 1)), DWELL[scene])
    return () => window.clearTimeout(id)
  }, [scene, auto])

  return (
    <div className="hp-stagewrap">
      <div className="hp-scroll">
        <div className="hp-stage">
          <div className="hp-scene" data-on={scene === 0} aria-hidden={scene !== 0}>{heritage}</div>
          <div className="hp-scene" data-on={scene === 1} aria-hidden={scene !== 1}>{culture}</div>
        </div>
      </div>
    </div>
  )
}
