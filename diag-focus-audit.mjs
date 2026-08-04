/**
 * diag-focus-audit.mjs
 * K-PATTO Focus Expression Audit — EP01-100
 *
 * Usage: node diag-focus-audit.mjs
 *
 * Schema chain:
 *   kp_dialogue_expressions (role='focus')
 *     → kp_dialogues (episode_id, text_ko, speaker)
 *       → kp_episodes (episode_num)
 *     → kp_expressions (korean, english)
 *
 * Budget: 4 focus expressions per episode, EXCEPT EP11 which has 5.
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY)

/** Expected focus expression count per episode. */
const expected = (epNum) => epNum === 11 ? 5 : 4

async function main() {
  console.log('Fetching focus expressions from kp_dialogue_expressions …')

  // Single query: all focus rows with episode number + expression text via nested join.
  const { data: focusRows, error: focusErr } = await sb
    .from('kp_dialogue_expressions')
    .select(`
      id,
      dialogue_id,
      matched_text,
      kp_dialogues!inner(
        episode_id,
        text_ko,
        speaker,
        kp_episodes!inner(episode_num)
      ),
      kp_expressions!inner(
        id,
        korean,
        english
      )
    `)
    .eq('role', 'focus')

  if (focusErr) {
    console.error('Error fetching focus expressions:', focusErr.message)
    process.exit(1)
  }

  // Group rows by episode_num.
  const focusByEp = new Map() // episode_num → detail[]
  for (const r of (focusRows ?? [])) {
    const epNum = r.kp_dialogues?.kp_episodes?.episode_num
    if (epNum == null) continue
    if (!focusByEp.has(epNum)) focusByEp.set(epNum, [])
    focusByEp.get(epNum).push({
      de_id:        r.id,
      dialogue_id:  r.dialogue_id,
      matched_text: r.matched_text,
      text_ko:      r.kp_dialogues.text_ko,
      speaker:      r.kp_dialogues.speaker,
      expr_id:      r.kp_expressions.id,
      expr_korean:  r.kp_expressions.korean,
      expr_english: r.kp_expressions.english,
    })
  }

  // ── Summary table ──────────────────────────────────────────────────────────
  console.log('\n=== K-PATTO Focus Expression Audit EP01-100 ===\n')
  console.log('EP   | 기대 | 실제 | 누락 | 상태')
  console.log('-----+------+------+------+----------')

  const shortEps = [] // episodes where actual < expected

  for (let epNum = 1; epNum <= 100; epNum++) {
    const exp    = expected(epNum)
    const actual = focusByEp.get(epNum)?.length ?? 0
    const diff   = exp - actual

    let status
    if (diff === 0)      status = 'OK'
    else if (diff > 0)   status = `SHORT -${diff}`
    else                 status = `EXTRA +${-diff}`

    const epStr   = `EP${String(epNum).padStart(2, '0')}`
    const diffStr = diff > 0 ? String(diff) : diff === 0 ? '0' : String(diff)

    console.log(
      `${epStr} |   ${exp}  |   ${actual}  |   ${diffStr}  | ${status}`
    )

    if (diff > 0) shortEps.push({ epNum, exp, actual, diff })
  }

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const totalExpected = Array.from({ length: 100 }, (_, i) => expected(i + 1))
                              .reduce((s, v) => s + v, 0)
  const totalActual   = [...focusByEp.entries()]
    .filter(([ep]) => ep >= 1 && ep <= 100)
    .reduce((s, [, rows]) => s + rows.length, 0)

  console.log('\n=== 집계 ===')
  console.log(`총 기대 focus (EP01-100): ${totalExpected}`)
  console.log(`총 실제 focus (EP01-100): ${totalActual}`)
  console.log(`총 누락                 : ${totalExpected - totalActual}`)
  console.log(`누락 있는 에피소드       : ${shortEps.length}개`)

  // ── Short episode detail ───────────────────────────────────────────────────
  if (shortEps.length === 0) {
    console.log('\n모든 에피소드에 focus 표현이 충분히 등록되어 있습니다.')
    return
  }

  console.log('\n=== 누락 에피소드 상세 ===\n')

  for (const { epNum, exp, actual, diff } of shortEps) {
    const epStr = `EP${String(epNum).padStart(2, '0')}`
    console.log(`[${epStr}] 기대 ${exp}개 → 실제 ${actual}개 (${diff}개 누락)`)

    const rows = focusByEp.get(epNum) ?? []
    if (rows.length === 0) {
      console.log('  등록된 focus 표현이 없습니다.')
    } else {
      console.log('  현재 등록된 focus 표현:')
      for (const r of rows) {
        const matchLabel = r.matched_text ? `"${r.matched_text}"` : '(no matched_text)'
        console.log(
          `    • [dialogue ${r.dialogue_id}] [${r.speaker}] ${r.text_ko}`
        )
        console.log(
          `      → expr #${r.expr_id}: ${r.expr_korean} / ${r.expr_english} | matched: ${matchLabel}`
        )
      }
    }
    console.log()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
