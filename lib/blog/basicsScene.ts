import type { BlogThumbnail } from './thumbnail'

const BASE = '/images/blog/basics/'
const SUFFIX = ['', '--example', '--keyword']

/** 카드 윗선 색 — Indigo · Rose · Emerald · Amber. 4색이라 3열 격자에서 좌우 · 위아래가 겹치지 않는다 */
export const BASICS_ACCENTS = ['#4F46E5', '#E11D48', '#059669', '#D97706']

/**
 * Basics 카드의 구도를 목록 위치로 고른다. 파일은 글마다 3장씩 있다(scripts/render-basics-thumbnails.mjs).
 * 줄마다 한 칸씩 밀어(i + 줄 번호) 3열에서 좌우 · 위아래가, 폰 1열에서 앞뒤가 같은 구도가 되지 않는다.
 * 그냥 i % 3 이면 3열에서 세로줄이 전부 같은 구도가 된다.
 * Basics 스틸이 아니면 null.
 */
export function basicsSceneThumb(thumb: BlogThumbnail | null, index: number): BlogThumbnail | null {
  if (thumb?.kind !== 'image' || !thumb.src.startsWith(BASE)) return null
  const scene = (index + Math.floor(index / 3)) % 3
  return { ...thumb, src: thumb.src.replace(/\.webp$/, `${SUFFIX[scene]}.webp`) }
}
