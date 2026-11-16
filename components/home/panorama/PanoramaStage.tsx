'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

/**
 * 두 장면을 겹쳐 두고 크로스페이드로 번갈아 보여 준다.
 * - 자동 전환: Heritage 8초 → Culture 7초. 그림 위에 마우스 · 포커스가 있으면 멈춘다.
 * - 오른쪽 아래 토글로 직접 고른다(고르면 타이머가 처음부터 다시 돈다).
 * - 움직임 줄이기 설정이면 자동 전환을 하지 않는다.
 * 숨은 장면의 루프 애니메이션은 CSS 로 멈춘다(.hp-scene[data-on="false"]).
 */

const DWELL = [8000, 7000] as const
const SCENES = [
  { icon: '🏮', label: 'Heritage' },
  { icon: '⚡', label: 'Culture' },
] as const

export function PanoramaStage({ heritage, culture }: { heritage: ReactNode; culture: ReactNode }) {
  const [scene, setScene] = useState<0 | 1>(0)
  const [hold, setHold] = useState(false)
  const [cycle, setCycle] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setAuto(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!auto || hold) return
    const id = window.setTimeout(() => setScene((s) => (s ? 0 : 1)), DWELL[scene])
    return () => window.clearTimeout(id)
  }, [scene, hold, auto, cycle])

  const pick = (i: 0 | 1) => { setScene(i); setCycle((c) => c + 1) }
  const running = auto && !hold

  return (
    <div
      className="hp-stagewrap"
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHold(true) }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHold(false) }}
      onFocus={() => setHold(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHold(false) }}
    >
      <div className="hp-scroll">
        <div className="hp-stage">
          <div className="hp-scene" data-on={scene === 0} aria-hidden={scene !== 0}>{heritage}</div>
          <div className="hp-scene" data-on={scene === 1} aria-hidden={scene !== 1}>{culture}</div>
        </div>
      </div>
      <div className="hp-controls">
      <div className="hp-toggle" role="group" aria-label="Choose illustration" data-pos={scene}>
        <span className="hp-thumb" aria-hidden="true" />
        {SCENES.map((s, i) => (
          <button key={s.label} type="button" className="hp-tbtn" aria-pressed={scene === i} onClick={() => pick(i as 0 | 1)}>
            <span className="hp-ticon" aria-hidden="true">{s.icon}</span>
            <span>{s.label}</span>
            {scene === i && running && (
              <span key={`${scene}-${cycle}`} className="hp-tprog" aria-hidden="true"
                style={{ '--dwell': `${DWELL[scene]}ms` } as CSSProperties} />
            )}
          </button>
        ))}
      </div>
      </div>
    </div>
  )
}
