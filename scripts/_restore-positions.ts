/**
 * _restore-positions.ts
 * kpatto_webtoon_layouts 위치값 복구 (3-way merge)
 *
 * 방식: pre_sync 백업의 xPct·yPct·widthPct·tail 등 위치 필드
 *       + 현재 DB의 lineBreaks → merge 후 upsert
 *
 * 복구 대상 (대사 추가 없음 → 버블 키 동일):
 *   EP01~10, EP12~15, EP19, EP30
 *
 * 제외:
 *   EP11·16 — 생존 행, 손대지 않음
 *   EP17·18·20~29 — 대사 추가로 버블 키 이동
 *   kp-ep-031 — EP31도 대사 추가됨
 *   kp-ep-31  — 생존 행 (구 형식 키)
 *
 * 사용:
 *   --dry-run  : EP02 한 화만 결과 출력 (DB 쓰기 없음)
 *   (없음)     : 전체 복구 실행
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ── 복구 대상 에피소드 번호 ────────────────────────────────────────────────────
const RESTORE_TARGETS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,   // EP01~10
  12, 13, 14, 15,                    // EP12~15 (EP11·16 제외: 생존)
  19,                                // EP19
  30,                                // EP30
])

// ── 위치 필드 여부 판정 ────────────────────────────────────────────────────────
function hasPositionField(fields: Record<string, unknown>): boolean {
  return 'xPct' in fields || 'yPct' in fields || 'widthPct' in fields || 'tail' in fields
}

// ── 3-way merge ───────────────────────────────────────────────────────────────
// 결과: 백업의 위치 필드 + 현재 DB의 lineBreaks
function mergeOverrides(
  backup:  Record<string, Record<string, unknown>>,
  current: Record<string, Record<string, unknown>>,
): Record<string, Record<string, unknown>> {
  const merged: Record<string, Record<string, unknown>> = {}
  const allIds = new Set([...Object.keys(backup), ...Object.keys(current)])

  for (const bid of allIds) {
    const bk = backup[bid] ?? {}
    const cu = current[bid] ?? {}

    // 백업에서 lineBreaks 제거 (현재 DB 값으로 대체)
    const { lineBreaks: _bkLB, ...backupPos } = bk as Record<string, unknown> & { lineBreaks?: unknown }
    const currentLB = (cu as Record<string, unknown> & { lineBreaks?: unknown }).lineBreaks

    const entry: Record<string, unknown> = { ...backupPos }
    if (currentLB !== undefined) entry.lineBreaks = currentLB

    if (Object.keys(entry).length > 0) merged[bid] = entry
  }
  return merged
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  const isDryRun = process.argv.includes('--dry-run')

  // 백업 파일 로드
  const backupPath = path.resolve(
    process.cwd(),
    'data/kpatto/source/backup/kpatto_webtoon_layouts_pre_sync_1785946676015.json'
  )
  const backupRows = JSON.parse(fs.readFileSync(backupPath, 'utf-8')) as Array<{
    episode_id: string
    overrides: Record<string, Record<string, unknown>>
  }>
  const backupMap = new Map(backupRows.map(r => [r.episode_id, r.overrides]))

  // 현재 DB에서 복구 대상 행 읽기
  const targetEpIds = [...RESTORE_TARGETS].map(n => `kp-ep-${String(n).padStart(3, '0')}`)
  const { data: currentRows, error } = await sb
    .from('kpatto_webtoon_layouts')
    .select('episode_id, overrides')
    .in('episode_id', isDryRun ? ['kp-ep-002'] : targetEpIds)

  if (error) { console.error('DB 조회 실패:', error.message); process.exit(1) }

  const currentMap = new Map((currentRows ?? []).map(r => [r.episode_id as string, (r.overrides ?? {}) as Record<string, Record<string, unknown>>]))

  if (isDryRun) {
    console.log('\n=== DRY-RUN: EP02 merge 결과 미리보기 ===')
    console.log('(DB 쓰기 없음)\n')
  } else {
    console.log(`\n=== 위치값 복구 — ${targetEpIds.length}화 ===\n`)
  }

  let restoredCount = 0
  let skippedCount  = 0

  const targets = isDryRun ? ['kp-ep-002'] : targetEpIds

  for (const epId of targets) {
    const epNum = parseInt(epId.replace('kp-ep-', ''), 10)
    const epLabel = `EP${String(epNum).padStart(2, '0')}`

    const backupOv  = backupMap.get(epId)
    const currentOv = currentMap.get(epId) ?? {}

    if (!backupOv) {
      console.log(`  ${epLabel}  ⚠ 백업에 행 없음 → 건너뜀`)
      skippedCount++
      continue
    }

    // 백업에 위치값 있는 버블 수 확인
    const backupPosBubbles = Object.entries(backupOv).filter(([, v]) => hasPositionField(v))
    if (backupPosBubbles.length === 0) {
      console.log(`  ${epLabel}  ⚠ 백업에 위치 필드 없음 → 건너뜀`)
      skippedCount++
      continue
    }

    const merged = mergeOverrides(backupOv, currentOv)

    // 결과 집계
    const posCount = Object.values(merged).filter(v => hasPositionField(v)).length
    const lbCount  = Object.values(merged).filter(v => 'lineBreaks' in v).length

    if (isDryRun) {
      console.log(`${epLabel} merge 결과 (버블 ${Object.keys(merged).length}개):`)
      for (const [bid, fields] of Object.entries(merged)) {
        const pos = hasPositionField(fields)
          ? `xPct=${(fields.xPct as number)?.toFixed(1)} yPct=${(fields.yPct as number)?.toFixed(1)} wPct=${(fields.widthPct as number)?.toFixed(1)}`
          : '위치 없음'
        const lb  = fields.lineBreaks ? `LB=[${fields.lineBreaks}]` : ''
        const tail = fields.tail ? '(tail✓)' : ''
        console.log(`  [${bid}]  ${pos}  ${lb}  ${tail}`)
      }
      console.log(`\n  → 위치 있는 버블: ${posCount}개 / LB 있는 버블: ${lbCount}개`)
      console.log('\n위 결과가 맞으면 --dry-run 없이 실행하세요.')
      return
    }

    // 실제 upsert
    const { error: upsertErr } = await sb
      .from('kpatto_webtoon_layouts')
      .upsert({ episode_id: epId, overrides: merged }, { onConflict: 'episode_id' })

    if (upsertErr) {
      console.error(`  ${epLabel}  ✗ upsert 실패: ${upsertErr.message}`)
      skippedCount++
    } else {
      console.log(`  ${epLabel}  ✓ 위치${posCount}  LB${lbCount}`)
      restoredCount++
    }
  }

  if (!isDryRun) {
    console.log(`\n복구 완료: ${restoredCount}화 / 건너뜀: ${skippedCount}화`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
