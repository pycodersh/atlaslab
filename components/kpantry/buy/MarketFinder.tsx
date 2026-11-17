'use client'
import { MapPin, Navigation } from 'lucide-react'
import { useEffect, useState } from 'react'
import { buildMarketSearchUrl, readSavedLocation, writeSavedLocation } from '@/lib/kpantry/marketSearch'
import { trackMarketSearch, type MarketPlacement } from '@/lib/kpantry/analytics'
import { BuyStyles } from './BuyStyles'

interface Props {
  placement: MarketPlacement
  /** 제목 단계 — 페이지 구조에 맞춘다 */
  headingLevel?: 'h2' | 'h3'
}

/**
 * Find a Korean market near you — Google Maps 검색을 새 탭으로 연다(Places API 없음, 위치 권한 요청 없음).
 * 입력한 우편번호·도시는 이 기기에 남겨 다음 방문 때 미리 채운다.
 */
export default function MarketFinder({ placement, headingLevel = 'h2' }: Props) {
  const [location, setLocation] = useState('')

  useEffect(() => { setLocation(readSavedLocation()) }, [])

  const Heading = headingLevel
  const trimmed = location.trim()

  const openZip = (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed) return
    writeSavedLocation(trimmed)
    trackMarketSearch({ method: 'zip', market: 'korean', placement })
    window.open(buildMarketSearchUrl('korean', trimmed), '_blank', 'noopener')
  }

  return (
    <div className="kpb-card">
      <BuyStyles />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <MapPin size={18} strokeWidth={2} color="var(--kp-buy-accent)" aria-hidden="true" />
        <Heading className="kpb-h" style={{ fontSize: 18 }}>Find a Korean market near you</Heading>
      </div>
      <p className="kpb-small" style={{ marginBottom: 12 }}>Opens Google Maps in a new tab.</p>

      <a
        href={buildMarketSearchUrl('korean')}
        target="_blank"
        rel="noopener noreferrer"
        className="kpb-btn kpb-btn-solid kpb-btn-md"
        style={{ width: '100%', boxSizing: 'border-box' }}
        onClick={() => trackMarketSearch({ method: 'near_me', market: 'korean', placement })}
      >
        <Navigation size={14} strokeWidth={2} aria-hidden="true" />
        Korean markets near me
      </a>

      <form onSubmit={openZip} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <label htmlFor={`kpb-loc-${placement}`} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          ZIP code or city
        </label>
        <input
          id={`kpb-loc-${placement}`}
          className="kpb-input"
          type="text"
          inputMode="text"
          autoComplete="postal-code"
          placeholder="ZIP or city (e.g. 90010, Austin TX)"
          value={location}
          maxLength={80}
          onChange={e => setLocation(e.target.value)}
        />
        <button type="submit" className="kpb-btn kpb-btn-outline kpb-btn-md" disabled={!trimmed} style={{ opacity: trimmed ? 1 : 0.5 }}>
          Search
        </button>
      </form>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <a
          href={buildMarketSearchUrl('asian', trimmed)}
          target="_blank"
          rel="noopener noreferrer"
          className="kpb-link"
          onClick={() => {
            if (trimmed) writeSavedLocation(trimmed)
            trackMarketSearch({ method: trimmed ? 'zip' : 'near_me', market: 'asian', placement })
          }}
        >
          Try Asian markets instead →
        </a>
        <p className="kpb-small">No market nearby? Order online or check the substitutes above.</p>
      </div>
    </div>
  )
}
