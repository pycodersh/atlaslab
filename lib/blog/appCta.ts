/**
 * 글 → 연계 앱 CTA 매핑.
 *
 * 카테고리를 직접 나열하지 않고 lib/blog/sections 의 주제 분류를 재사용한다.
 * 카테고리 목록이 또 하나 생기면 홈·목록·CTA 세 곳이 어긋나기 때문이다.
 *
 *   Korean phrases / Korean basics  → K-Patto (표현 연습)
 *   Life in Korea / Explore Korea   → K-Patto (문화·표현 결이라 요리보다 맞다)
 *   Korean food                     → K-Pantry
 *   그 외(app=patto 등)             → Patto
 */
import { topicSectionKey } from './sections'

export type AppCta = {
  /** 카드 상단 작은 라벨 */
  label: string
  href: string
  /** 본문 톤의 한 문장 */
  blurb: string
  /** 버튼 문구 */
  button: string
  /** 버튼 아래 작은 안내(선택) */
  note?: string
}

/** Korean phrases / basics — 앱 연결과 PDF 구매를 /kpatto 랜딩 하나로 모은 단일 CTA */
const K_PATTO: AppCta = {
  label: 'K-Patto',
  href: '/kpatto',
  blurb: 'Practice these patterns in a 100-episode webtoon with native audio.',
  // 오른쪽 버튼은 한 줄(nowrap)이라 짧게 — '300 patterns · eBook' 안내는 note 가 맡는다
  button: 'Study with Webtoon →',
  note: 'Free sample episodes & 153-page printable eBook available.',
}

/** Life in Korea — 문화 글이라 "연습" 보다 "이해" 쪽으로 문구를 맞춘다 */
const K_PATTO_CULTURE: AppCta = {
  label: 'K-Patto',
  href: '/kpatto',
  blurb: 'Want to understand Korean culture through real sentence patterns?',
  button: 'Explore K-Patto →',
  note: 'Master 300+ everyday patterns through 100 slice-of-life webtoon episodes with native audio.',
}

const K_PANTRY: AppCta = {
  label: 'K-Pantry',
  href: '/kpantry/en',
  blurb:
    "Have Korean ingredients but don't know what to cook? Let K-Pantry find authentic recipes from your fridge.",
  button: 'Try K-Pantry Free →',
}

/** 기본값 — patto 글은 한국어권 독자라 문구도 한국어로 낸다 */
function patto(locale: string): AppCta {
  const ko = locale === 'ko'
  return {
    label: 'Patto',
    href: '/patto/home',
    blurb: ko
      ? '영어 패턴을 매일 조금씩. Patto로 습관이 되는 연습을 시작해 보세요.'
      : 'Learning English patterns instead? Patto turns them into daily practice.',
    button: ko ? '무료로 시작하기 →' : 'Try Patto Free →',
  }
}

export function ctaForPost(
  app: string,
  category: string | null,
  locale: string,
): AppCta {
  switch (topicSectionKey(app, category)) {
    case 'phrases':
    case 'basics':
      return K_PATTO
    case 'life':
    case 'hotels':
    case 'places':
      return K_PATTO_CULTURE
    case 'food':
      return K_PANTRY
    default:
      return patto(locale)
  }
}
