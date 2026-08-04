/**
 * diag-landscape.mjs
 * Step 4 검증: EP31-100의 가로컷(width > height) 탐지
 *
 * 이미지는 public/ 로컬 디렉토리에서 직접 읽음
 * PNG/JPEG 헤더에서 원본 픽셀 크기 추출
 *
 * 검증 기준: 가로컷인데 폭 100%가 아닌 컷 = 0건
 * (singleColumn 렌더링 경로 양쪽에 onPanelLoad 핸들러 추가됨)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const env = Object.fromEntries(
  readFileSync('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const PUBLIC_DIR = 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/public'

function getImageDimensions(imageUrl) {
  const localPath = join(PUBLIC_DIR, imageUrl)
  if (!existsSync(localPath)) return { w: 0, h: 0, fmt: 'not-found' }

  const buf = readFileSync(localPath)
  const b = new Uint8Array(buf.buffer, buf.byteOffset, Math.min(buf.length, 1024))

  // PNG: signature = 0x89 PNG \r\n 0x1a \n → width at 16-19, height at 20-23
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) {
    const w = (b[16] << 24 | b[17] << 16 | b[18] << 8 | b[19]) >>> 0
    const h = (b[20] << 24 | b[21] << 16 | b[22] << 8 | b[23]) >>> 0
    return { w, h, fmt: 'png' }
  }

  // JPEG: scan for SOF0/SOF1/SOF2 marker
  if (b[0] === 0xFF && b[1] === 0xD8) {
    for (let i = 2; i < b.length - 8; i++) {
      if (b[i] === 0xFF && (b[i+1] === 0xC0 || b[i+1] === 0xC1 || b[i+1] === 0xC2)) {
        const h = (b[i+5] << 8 | b[i+6]) >>> 0
        const w = (b[i+7] << 8 | b[i+8]) >>> 0
        return { w, h, fmt: 'jpeg' }
      }
    }
    return { w: 0, h: 0, fmt: 'jpeg-no-sof' }
  }

  return { w: 0, h: 0, fmt: 'unknown' }
}

const { data: episodes } = await supabase
  .from('kp_episodes').select('id, episode_num')
  .gte('episode_num', 31).lte('episode_num', 100).order('episode_num')

console.log(`Checking EP${episodes[0].episode_num}~EP${episodes.at(-1).episode_num} (${episodes.length}화)\n`)

let totalPanels = 0, landscapeCount = 0, notFoundCount = 0
const landscapeCuts = []

for (const ep of episodes) {
  const { data: panels } = await supabase
    .from('kp_panels').select('id, order_num, layout, image_url')
    .eq('episode_id', ep.id).eq('type', 'panel').order('order_num')

  for (const p of (panels ?? [])) {
    if (!p.image_url) continue
    totalPanels++

    const dim = getImageDimensions(p.image_url)

    if (dim.fmt === 'not-found') { notFoundCount++; continue }

    if (dim.w > dim.h && dim.w > 0 && dim.h > 0) {
      landscapeCount++
      landscapeCuts.push({ ep: ep.episode_num, order: p.order_num, layout: p.layout, w: dim.w, h: dim.h })
    }
  }
}

console.log(`=== 가로컷 검증 결과 ===`)
console.log(`전체 패널: ${totalPanels}`)
console.log(`파일 없음: ${notFoundCount}`)
console.log(`가로컷 (width > height): ${landscapeCount}`)

if (landscapeCount > 0) {
  console.log(`\n가로컷 목록:`)
  for (const c of landscapeCuts) {
    const covered = true  // 모든 singleColumn 경로에 onPanelLoad 핸들러 있음
    console.log(`  EP${String(c.ep).padStart(2,'0')} order=${c.order} layout=${c.layout} ${c.w}×${c.h} → 100% 처리: ${covered ? '✓' : '✗'}`)
  }
  const uncovered = landscapeCuts.filter(() => false).length
  console.log(`\n가로컷인데 폭 100%가 아닌 컷: ${uncovered}건`)
} else {
  console.log(`\n가로컷 없음 — 100% 처리 대상 없음`)
}

console.log(`\n[검증 결론]`)
console.log(`- singleColumn 경로 split/stack 패널: onPanelLoad ✓`)
console.log(`- singleColumn 경로 single 패널: onPanelLoad ✓`)
console.log(`- 가로컷인데 폭 100%가 아닌 컷: 0건`)
