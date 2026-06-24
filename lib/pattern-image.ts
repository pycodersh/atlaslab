/**
 * PATTO 패턴 이미지 시스템
 *
 * ───────────────────────────────────────────────────────────
 * 저장 위치
 * ───────────────────────────────────────────────────────────
 *   Supabase Storage 버킷: "pattern-images"  (public)
 *
 *   경로 규칙:
 *     level{L}/p{NNN}.webp
 *     예) level1/p001.webp  ← Level 1, order_index 1
 *         level1/p050.webp  ← Level 1, order_index 50
 *         level2/p001.webp  ← Level 2, order_index 1
 *
 *   포맷:   WebP (손실 80%)
 *   크기:   800 × 600 px  (4:3, 카드 내 160px 높이 렌더)
 *   최대:   150 KB/장
 *
 * ───────────────────────────────────────────────────────────
 * Placeholder 교체 방식
 * ───────────────────────────────────────────────────────────
 *   1. 이미지 업로드 → Supabase Storage (level1/p001.webp)
 *   2. patterns 테이블의 image_storage_key 컬럼 업데이트
 *      UPDATE patterns SET image_storage_key = 'level1/p001.webp'
 *      WHERE level = 1 AND order_index = 1;
 *   3. DB 쿼리 시 getPublicUrl()로 image_url 생성
 *      → PatternCardFront가 image_url이 있으면 자동으로 실제 이미지 렌더
 *
 * ───────────────────────────────────────────────────────────
 * 패턴-이미지 연결 방식
 * ───────────────────────────────────────────────────────────
 *   patterns.image_storage_key  (nullable text)
 *     NULL  → PatternCardFront에서 <ImageIcon> placeholder 표시
 *     값 있음 → getImageUrl()로 공개 URL 변환 후 <img> 렌더
 *
 * ───────────────────────────────────────────────────────────
 * 이미지 생성 파이프라인 제안 (향후)
 * ───────────────────────────────────────────────────────────
 *   1. GPT-4o / DALL-E 3 또는 Ideogram API 호출
 *      prompt: "Clean minimal illustration for English pattern
 *               '{pattern_text}', Apple Education style,
 *               white background, soft blue tones"
 *   2. WebP 변환 + 리사이즈 (sharp.js 또는 Cloudflare Images)
 *   3. Supabase Storage upload (level{L}/p{NNN}.webp)
 *   4. DB image_storage_key 업데이트
 *   → 자동화 스크립트: scripts/generate-pattern-images.ts
 */

import { createClient } from '@supabase/supabase-js'

const BUCKET = 'pattern-images'

export function getImageStorageKey(level: number, orderIndex: number): string {
  const padded = String(orderIndex).padStart(3, '0')
  return `level${level}/p${padded}.webp`
}

export function getImagePublicUrl(
  supabaseUrl: string,
  storageKey: string,
): string {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${storageKey}`
}
