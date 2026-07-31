/**
 * fill_blank 문제에 hint_en 추가 + EP11 translation 오류 수정
 *
 * 실행: npx tsx scripts/fix-fill-blank-hints.ts
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

function log(msg: string) { console.log(`[fix-hints] ${msg}`) }

// ── 1. fill_blank에 hint_en 추가 ───────────────────────────────────────────────

async function addFillBlankHints() {
  log('=== fill_blank hint_en 추가 ===')

  const { data: fb } = await sb.from('kp_challenges')
    .select('id,episode_id,question,answer')
    .eq('challenge_type', 'fill_blank')

  const { data: tr } = await sb.from('kp_challenges')
    .select('episode_id,question,answer')
    .eq('challenge_type', 'translation')

  // translation lookup: episode_id+answer(Korean) → English prompt
  const lookup = new Map<string, string>()
  for (const t of (tr ?? [])) {
    const key = `${t.episode_id}|${t.answer}`
    lookup.set(key, t.question.prompt)
  }

  let updated = 0
  let notFound = 0
  const batch: Array<{ id: number; question: { prompt: string; hint_en: string } }> = []

  for (const f of (fb ?? [])) {
    const fullKorean = (f.question.prompt as string).replace('___', f.answer as string)
    const hint = lookup.get(`${f.episode_id}|${fullKorean}`)
    if (hint) {
      batch.push({ id: f.id, question: { prompt: f.question.prompt, hint_en: hint } })
    } else {
      notFound++
    }
  }

  // Batch update in chunks of 50
  const CHUNK = 50
  for (let i = 0; i < batch.length; i += CHUNK) {
    const chunk = batch.slice(i, i + CHUNK)
    for (const row of chunk) {
      const { error } = await sb.from('kp_challenges')
        .update({ question: row.question })
        .eq('id', row.id)
      if (error) { console.error(`  ❌ id=${row.id}:`, error.message); continue }
      updated++
    }
    log(`  updated ${Math.min(i + CHUNK, batch.length)}/${batch.length}...`)
  }

  log(`  ✓ ${updated} fill_blank hints added, ${notFound} no match (left as-is)`)
}

// ── 2. EP11 translation 오류 수정 ──────────────────────────────────────────────

async function fixEp11Translations() {
  log('=== EP11 translation English prompt 수정 ===')

  const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', 11).single()
  if (!ep) { log('EP11 not found'); return }

  const { data: rows } = await sb.from('kp_challenges')
    .select('id,question,answer')
    .eq('episode_id', ep.id)
    .eq('challenge_type', 'translation')

  // Korean answer → correct English prompt mapping
  const correctPrompts: Record<string, string> = {
    '갈아타요?':          '"Do you need to transfer?"',
    '2호선 타면 돼!':      '"You can take Line 2!"',
    '홍대까지 가 주세요!': '"Please take me to Hongdae!"',
  }

  let fixed = 0
  for (const row of (rows ?? [])) {
    const correct = correctPrompts[row.answer]
    if (correct && row.question.prompt !== correct) {
      log(`  fixing: "${row.question.prompt}" → "${correct}" (answer: ${row.answer})`)
      const { error } = await sb.from('kp_challenges')
        .update({ question: { prompt: correct } })
        .eq('id', row.id)
      if (error) { console.error(`  ❌ id=${row.id}:`, error.message); continue }
      fixed++
    }
  }

  log(`  ✓ ${fixed} EP11 translation prompts corrected`)
}

// ── main ───────────────────────────────────────────────────────────────────────

async function main() {
  await addFillBlankHints()
  await fixEp11Translations()
  log('\n=== 완료 ===')
}

main().catch(console.error)
