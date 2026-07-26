// TRUNCATE kp_expressions + kp_dialogue_expressions
// then INSERT 284 expressions with desc+examples
// then re-link kp_dialogue_expressions from backup
import * as fs from 'fs'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

type ExprData = { id: number; korean: string; desc: string; examples: { ko: string; en: string }[] }
type BackupRow = { de_id: number; dialogue_id: number; expression_korean: string; matched_text: string; role: string; episode_num: number }

async function main() {
  // Load expression data (combine ABC + D)
  const scratchDir = 'C:\\Users\\msj15\\AppData\\Local\\Temp\\claude\\C--Users-msj15-OneDrive-------ClaudeCode\\1653959a-c6bc-46c3-be0a-4d7fd2eccd09\\scratchpad'
  const exprABC: ExprData[] = JSON.parse(fs.readFileSync(path.join(scratchDir, 'expressions_ABC.json'), 'utf-8'))
  const exprD: ExprData[] = JSON.parse(fs.readFileSync(path.join(scratchDir, 'expressions_D.json'), 'utf-8'))
  const allExprs = [...exprABC, ...exprD]
  // Deduplicate by korean text (in case of any overlap)
  const seenKorean = new Set<string>()
  const uniqueExprs = allExprs.filter(e => {
    if (seenKorean.has(e.korean)) return false
    seenKorean.add(e.korean)
    return true
  })
  console.log(`총 ${uniqueExprs.length}개 고유 표현 로드 완료 (ABC=${exprABC.length}, D=${exprD.length})`)

  // Load backup
  const backup = JSON.parse(fs.readFileSync('C:\\Users\\msj15\\Downloads\\kpatto_mappings_backup.json', 'utf-8'))
  const focusRows: BackupRow[] = backup.focus
  const exposureRows: BackupRow[] = backup.exposure
  console.log(`백업 로드: focus=${focusRows.length}, exposure=${exposureRows.length}`)

  // Step 1: Delete all kp_dialogue_expressions
  console.log('\nStep 1: kp_dialogue_expressions 전체 삭제...')
  const { error: delDE } = await sb
    .from('kp_dialogue_expressions')
    .delete()
    .gte('id', 0)
  if (delDE) { console.error('kp_dialogue_expressions 삭제 실패:', delDE); return }
  console.log('  kp_dialogue_expressions 삭제 완료')

  // Step 1b: NULL out kp_bubbles.expression_id (FK dependency on kp_expressions)
  console.log('\nStep 1b: kp_bubbles.expression_id NULL 처리...')
  const { error: nullBubbles } = await sb
    .from('kp_bubbles')
    .update({ expression_id: null })
    .not('expression_id', 'is', null)
  if (nullBubbles) { console.error('kp_bubbles NULL 처리 실패:', nullBubbles); return }
  console.log('  kp_bubbles.expression_id NULL 처리 완료')

  // Step 2: Delete all kp_expressions
  console.log('\nStep 2: kp_expressions 전체 삭제...')
  const { error: delE } = await sb
    .from('kp_expressions')
    .delete()
    .gte('id', 0)
  if (delE) { console.error('kp_expressions 삭제 실패:', delE); return }
  console.log('  kp_expressions 삭제 완료')

  // Step 3: INSERT all expressions
  console.log('\nStep 3: expressions INSERT 중...')
  const koreanToId = new Map<string, number>()
  let insertOk = 0
  let insertFail = 0
  for (const expr of uniqueExprs) {
    const { data, error } = await sb
      .from('kp_expressions')
      .insert({
        korean: expr.korean,
        english: expr.korean,  // placeholder (same as original seed)
        description: expr.desc,
        examples: expr.examples,
      })
      .select('id')
      .single()
    if (error || !data) {
      console.error(`  FAIL [${expr.korean}]:`, error?.message)
      insertFail++
    } else {
      koreanToId.set(expr.korean, data.id)
      insertOk++
      if (insertOk % 50 === 0) console.log(`  ${insertOk}/${uniqueExprs.length} 완료...`)
    }
  }
  console.log(`  INSERT 결과: 성공=${insertOk}, 실패=${insertFail}`)

  // Step 4: Re-link focus mappings
  console.log('\nStep 4: focus 매핑 재연결...')
  const focusInsert = []
  const focusMissed: string[] = []
  for (const row of focusRows) {
    const newId = koreanToId.get(row.expression_korean)
    if (newId === undefined) {
      focusMissed.push(row.expression_korean)
    } else {
      focusInsert.push({
        dialogue_id: row.dialogue_id,
        expression_id: newId,
        matched_text: row.matched_text,
        role: 'focus',
      })
    }
  }
  if (focusMissed.length) {
    const uniq = [...new Set(focusMissed)]
    console.warn(`  경고: expression 못 찾은 focus 매핑 ${focusMissed.length}건 (unique ${uniq.length}개):\n  ${uniq.join('\n  ')}`)
  }

  // Insert focus rows in batches of 50
  let focusOk = 0
  for (let i = 0; i < focusInsert.length; i += 50) {
    const batch = focusInsert.slice(i, i + 50)
    const { error } = await sb.from('kp_dialogue_expressions').insert(batch)
    if (error) { console.error(`  focus batch INSERT 실패 (${i}~):`, error.message); return }
    focusOk += batch.length
  }
  console.log(`  focus 매핑 INSERT 완료: ${focusOk}건`)

  // Step 5: Re-link exposure mappings
  console.log('\nStep 5: exposure 매핑 재연결...')
  const exposureInsert = []
  const exposureMissed: string[] = []
  for (const row of exposureRows) {
    const newId = koreanToId.get(row.expression_korean)
    if (newId === undefined) {
      exposureMissed.push(row.expression_korean)
    } else {
      exposureInsert.push({
        dialogue_id: row.dialogue_id,
        expression_id: newId,
        matched_text: row.matched_text,
        role: 'exposure',
      })
    }
  }
  if (exposureMissed.length) {
    const uniq = [...new Set(exposureMissed)]
    console.warn(`  경고: expression 못 찾은 exposure 매핑 ${exposureMissed.length}건 (unique ${uniq.length}개):\n  ${uniq.join('\n  ')}`)
  }

  // Insert exposure rows in batches of 50
  let exposureOk = 0
  for (let i = 0; i < exposureInsert.length; i += 50) {
    const batch = exposureInsert.slice(i, i + 50)
    const { error } = await sb.from('kp_dialogue_expressions').insert(batch)
    if (error) { console.error(`  exposure batch INSERT 실패 (${i}~):`, error.message); return }
    exposureOk += batch.length
  }
  console.log(`  exposure 매핑 INSERT 완료: ${exposureOk}건`)

  // Step 6: Re-link kp_bubbles.expression_id via dialogue_id
  console.log('\nStep 6: kp_bubbles.expression_id 재연결...')
  // Build dialogue_id → new expression_id map from focus inserts
  const dialogueToExprId = new Map<number, number>()
  for (const row of focusInsert) {
    dialogueToExprId.set(row.dialogue_id, row.expression_id)
  }

  // Fetch bubbles that originally had expression_id (all that have dialogue_id with a focus mapping)
  const { data: bubblesData, error: bErr } = await sb
    .from('kp_bubbles')
    .select('id, dialogue_id')
    .not('dialogue_id', 'is', null)
  if (bErr) { console.error('kp_bubbles 조회 실패:', bErr); return }

  let bubbleOk = 0
  for (const bubble of bubblesData ?? []) {
    const newExprId = dialogueToExprId.get(bubble.dialogue_id)
    if (newExprId === undefined) continue // this dialogue has no focus expression
    const { error } = await sb
      .from('kp_bubbles')
      .update({ expression_id: newExprId })
      .eq('id', bubble.id)
    if (error) { console.error(`bubble id=${bubble.id} 업데이트 실패:`, error.message) }
    else bubbleOk++
  }
  console.log(`  kp_bubbles 재연결 완료: ${bubbleOk}건`)

  console.log('\n=== 완료 ===')
  console.log(`expressions: ${insertOk}개`)
  console.log(`focus 매핑: ${focusOk}건`)
  console.log(`exposure 매핑: ${exposureOk}건`)
  console.log(`총 kp_dialogue_expressions: ${focusOk + exposureOk}건`)
  console.log(`kp_bubbles 재연결: ${bubbleOk}건`)
}

main().catch(console.error)
