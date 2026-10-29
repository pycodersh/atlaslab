/**
 * 글 카드 뱃지 — 홈 섹션 카드 · /blog 목록 카드 · 세로 리스트 줄에 붙는 '어떤 글인지' 한 단어.
 *
 *   Beginner          Phrases · Basics (한국어 학습 첫걸음)
 *   Travel Essential  Explore Korea 전부 + Life 의 교통 · 앱 · 돈/쇼핑
 *   Food & Cafe       Food 전부 + Life 중 카페 · 식당 · 편의점 · 길거리 음식 글
 *   Local Life        나머지 Life(문화 · 일상)
 * 분류는 lib/blog/sections(그룹) · subcategories(Life 세부)를 그대로 쓴다 — 뱃지 기준이 따로 생기면 어긋난다.
 * patto 글(한국인 대상 영어 학습)은 주제 그룹이 아니라 뱃지가 없다.
 */
import { groupKeyOf } from './sections'
import { subcategoryOf } from './subcategories'

export type PostBadge = { label: string; tone: 'beginner' | 'travel' | 'food' | 'life' }

const FOOD_IN_LIFE = /\b(cafe|cafes|coffee|restaurant|restaurants|dining|food|foods|convenience|street|bbq|eat|eating|menu|delivery)\b/i

export function badgeFor(post: { app: string; category: string | null; slug: string; title: string }): PostBadge | null {
  const group = groupKeyOf(post.app, post.category)
  switch (group) {
    case 'phrases':
    case 'basics':
      return { label: 'Beginner', tone: 'beginner' }
    case 'explore-korea':
      return { label: 'Travel Essential', tone: 'travel' }
    case 'food':
      return { label: 'Food & Cafe', tone: 'food' }
    case 'life': {
      if (FOOD_IN_LIFE.test(`${post.title} ${post.slug.replace(/-/g, ' ')}`)) return { label: 'Food & Cafe', tone: 'food' }
      const sub = subcategoryOf('life', post)
      return sub === 'transit' || sub === 'apps' || sub === 'money'
        ? { label: 'Travel Essential', tone: 'travel' }
        : { label: 'Local Life', tone: 'life' }
    }
    default:
      return null
  }
}
