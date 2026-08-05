/**
 * fix-linebreaks-episode-id.ts
 * 이전 apply-kpatto-line-breaks.ts가 episode_id를 정수 문자열("2","3"...)로
 * 저장한 것을 올바른 "kp-ep-002" 형식으로 재저장하고 잘못된 행을 삭제한다.
 *
 * 동작:
 *  1. kpatto_webtoon_layouts에서 episode_id가 순수 숫자인 행 조회
 *  2. 해당 episode_num → "kp-ep-NNN" 변환
 *  3. 기존 "kp-ep-NNN" 행이 있으면 lineBreaks를 병합, 없으면 새로 생성
 *  4. 원래 숫자 행 삭제
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function isNumeric(s: string): boolean {
  return /^\d+$/.test(s)
}

async function main() {
  // 1. 잘못된(숫자) episode_id 행 전체 조회
  const { data: wrongRows, error: e1 } = await sb
    .from('kpatto_webtoon_layouts')
    .select('episode_id, overrides, bubbles')

  if (e1 || !wrongRows) { console.error('조회 실패:', e1); process.exit(1) }

  const badRows = wrongRows.filter(r => isNumeric(String(r.episode_id)))
  console.log(`잘못된 행(숫자 episode_id): ${badRows.length}건`)

  if (badRows.length === 0) {
    console.log('수정할 항목 없음.')
    return
  }

  let fixed = 0, skipped = 0

  for (const row of badRows) {
    const num = parseInt(String(row.episode_id))
    const correctId = `kp-ep-${String(num).padStart(3, '0')}`
    const wrongOverrides = (row.overrides ?? {}) as Record<string, Record<string, unknown>>

    // 2. 기존 올바른 행 조회
    const { data: existing } = await sb
      .from('kpatto_webtoon_layouts')
      .select('overrides, bubbles')
      .eq('episode_id', correctId)
      .maybeSingle()

    const existingOverrides = ((existing?.overrides ?? {}) as Record<string, Record<string, unknown>>)

    // 3. 병합: 기존 overrides 기반으로 lineBreaks를 wrong row에서 추가
    const merged = { ...existingOverrides }
    for (const [bubbleId, ov] of Object.entries(wrongOverrides)) {
      if ('lineBreaks' in ov) {
        const prev = merged[bubbleId] ?? {}
        merged[bubbleId] = { ...prev, lineBreaks: ov.lineBreaks }
      }
    }

    // 4. 올바른 episode_id로 upsert
    const { error: upsertErr } = await sb
      .from('kpatto_webtoon_layouts')
      .upsert(
        { episode_id: correctId, overrides: merged, bubbles: existing?.bubbles ?? row.bubbles ?? {} },
        { onConflict: 'episode_id' }
      )

    if (upsertErr) {
      console.error(`  ${correctId} upsert 실패:`, upsertErr.message)
      skipped++
      continue
    }

    // 5. 잘못된 행 삭제
    const { error: delErr } = await sb
      .from('kpatto_webtoon_layouts')
      .delete()
      .eq('episode_id', String(num))

    if (delErr) {
      console.error(`  ${num} 행 삭제 실패:`, delErr.message)
    } else {
      console.log(`  ✅ ${String(num).padStart(3)} → ${correctId}  (lineBreaks ${Object.values(wrongOverrides).filter(o => 'lineBreaks' in o).length}건)`)
      fixed++
    }
  }

  console.log(`\n완료: ${fixed}건 수정, ${skipped}건 스킵`)
}

main().catch(e => { console.error(e); process.exit(1) })
