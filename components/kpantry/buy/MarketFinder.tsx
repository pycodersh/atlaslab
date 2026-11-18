'use client'
import { Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buildMarketSearchUrl, readSavedLocation, writeSavedLocation } from '@/lib/kpantry/marketSearch'
import { trackMarketSearch, type MarketPlacement } from '@/lib/kpantry/analytics'
import { BuyStyles } from './BuyStyles'

interface Props {
  placement: MarketPlacement
  /** 제목 단계 — 페이지 구조에 맞춘다 */
  headingLevel?: 'h2' | 'h3'
  /** 위에 구분선을 둘지 — 그룹들 아래에 붙을 때 */
  ruleAbove?: boolean
}

/**
 * Find a Korean market near you — Google Maps 검색을 새 탭으로 연다(Places API 없음, 위치 권한 요청 없음).
 * 카드 없이 소제목 + 설명 + 레드 버튼 하나 + 한 덩어리 입력창 + 회색 링크(2026-11-18 2차).
 * 입력한 우편번호·도시는 이 기기에 남겨 다음 방문 때 미리 채운다.
 */
export default function MarketFinder({ placement, headingLevel = 'h2', ruleAbove = false }: Props) {
  const [location, setLocation] = useState('')

  useEffect(() => { setLocation(readSavedLocation()) }, [])

  const Heading = headingLevel
  const trimmed = location.trim()
  const inputId = `kpb-loc-${placement}`

  const openZip = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed) return
    writeSavedLocation(trimmed)
    trackMarketSearch({ method: 'zip', market: 'korean', placement })
    window.open(buildMarketSearchUrl('korean', trimmed), '_blank', 'noopener')
  }

  return (
    <section>
      <BuyStyles />
      {ruleAbove && <hr className="kpb-rule" style={{ marginBottom: 24 }} />}
      <Heading className="kpb-sub">Find a Korean market near you</Heading>
      <p className="kpb-small" style={{ margin: '4px 0 14px' }}>Opens Google Maps in a new tab.</p>

      <a
        href={buildMarketSearchUrl('korean')}
        target="_blank"
        rel="noopener noreferrer"
        className="kpb-primary"
        onClick={() => trackMarketSearch({ method: 'near_me', market: 'korean', placement })}
      >
        <Navigation size={14} strokeWidth={2} aria-hidden="true" />
        Korean markets near me
      </a>

      <form onSubmit={openZip} className="kpb-field" style={{ marginTop: 10 }}>
        <label htmlFor={inputId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          ZIP code or city
        </label>
        <input
          id={inputId}
          type="text"
          autoComplete="postal-code"
          placeholder="ZIP or city (e.g. 90010, Austin TX)"
          value={location}
          maxLength={80}
          onChange={e => setLocation(e.target.value)}
        />
        <button type="submit" disabled={!trimmed}>Search</button>
      </form>

      <a
        href={buildMarketSearchUrl('asian', trimmed)}
        target="_blank"
        rel="noopener noreferrer"
        className="kpb-link-muted"
        style={{ display: 'inline-block', marginTop: 12 }}
        onClick={() => {
          if (trimmed) writeSavedLocation(trimmed)
          trackMarketSearch({ method: trimmed ? 'zip' : 'near_me', market: 'asian', placement })
        }}
      >
        Try Asian markets instead ›
      </a>
    </section>
  )
}
