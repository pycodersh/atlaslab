'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { BlogThumb } from '@/components/blog/BlogThumb'
import type { ResolvedStep } from './TravelRoadmap'

/**
 * 로드맵 단계 목록 + 모바일 단계 탭. 스타일은 TravelRoadmap 의 CSS 가 들고 있다.
 * PC · 태블릿은 탭이 숨겨지고(.rm-tabs display: none) 다섯 단계가 다 보인다 — data-active 는 600px 미만에서만 의미가 있다.
 * 서버 HTML 도 첫 단계(Arrive)가 켜진 상태로 나가므로 하이드레이션 전후 화면이 같다.
 */
export function RoadmapSteps({ steps }: { steps: ResolvedStep[] }) {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // 탭 목록 키보드 — 좌우 화살표 · Home · End 로 옮기고 바로 고른다
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = steps.length - 1
    const next =
      e.key === 'ArrowRight' ? (active === last ? 0 : active + 1)
      : e.key === 'ArrowLeft' ? (active === 0 ? last : active - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null
    if (next === null) return
    e.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <>
      <div className="rm-tabs" role="tablist" aria-label="Trip steps" onKeyDown={onKey}>
        {steps.map((s, i) => (
          <button
            key={s.key}
            ref={el => { tabRefs.current[i] = el }}
            type="button"
            role="tab"
            id={`rm-tab-${s.key}`}
            aria-selected={i === active}
            aria-controls={`rm-step-${s.key}`}
            tabIndex={i === active ? 0 : -1}
            className="rm-tab"
            onClick={() => setActive(i)}
          >
            <b>{String(i + 1).padStart(2, '0')}</b>
            {s.step}
          </button>
        ))}
      </div>
      <ol className="rm-list">
        {steps.map((s, i) => (
          <li key={s.key} id={`rm-step-${s.key}`} className="rm-step" data-active={i === active}>
            <div className="rm-head">
              <p className="rm-num">{String(i + 1).padStart(2, '0')} · {s.step}</p>
              <h3 className="rm-title">{s.title}</h3>
              <p className="rm-blurb">{s.blurb}</p>
            </div>
            {s.hub && (
              <a href={s.hub.href} className="rm-hub">
                <BlogThumb thumb={s.hub.thumb} alt={s.hub.title} />
                <span className="rm-hub-title">{s.hub.title}</span>
              </a>
            )}
            <div className="rm-side">
              {s.more.length > 0 && (
                <ul className="rm-more">
                  {s.more.map(m => (
                    <li key={m.href}><a href={m.href}>{m.label}</a></li>
                  ))}
                </ul>
              )}
              {s.phrase && (
                <a href={s.phrase.href} className="rm-phrase">
                  <small>Say it in Korean</small>
                  {s.phrase.label} →
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
