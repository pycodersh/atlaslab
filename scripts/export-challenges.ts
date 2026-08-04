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

async function main() {
  const { data: eps, error: epErr } = await sb
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')
  if (epErr) throw epErr

  const epMap: Record<number, number> = {}
  for (const e of eps ?? []) epMap[e.id] = e.episode_num

  const { data: challenges, error: chErr } = await sb
    .from('kp_challenges')
    .select('id, episode_id, challenge_type, question, options, answer, word_pieces')
    .order('episode_id')
    .order('id')
  if (chErr) throw chErr

  const rows = (challenges ?? []).map(c => ({
    id: c.id,
    episode_num: epMap[c.episode_id] ?? null,
    challenge_type: c.challenge_type ?? null,
    question: c.question?.prompt ?? null,
    answer: c.answer ?? null,
    options: c.options ?? null,
    word_pieces: c.word_pieces ?? null,
  }))

  // JSON 저장
  const jsonPath = path.resolve(process.cwd(), 'kp_challenges_export.json')
  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), 'utf-8')
  console.log(`✅ JSON 저장: ${jsonPath}  (${rows.length}건)`)

  // CSV 저장
  const csvHeader = 'id,episode_num,challenge_type,question,answer,options,word_pieces'
  const csvLines = rows.map(r => {
    const esc = (v: unknown) => {
      if (v === null || v === undefined) return ''
      const s = typeof v === 'object' ? JSON.stringify(v) : String(v)
      return `"${s.replace(/"/g, '""')}"`
    }
    return [r.id, r.episode_num, esc(r.challenge_type), esc(r.question), esc(r.answer), esc(r.options), esc(r.word_pieces)].join(',')
  })
  const csvPath = path.resolve(process.cwd(), 'kp_challenges_export.csv')
  fs.writeFileSync(csvPath, [csvHeader, ...csvLines].join('\n'), 'utf-8')
  console.log(`✅ CSV 저장: ${csvPath}  (${rows.length}건)`)

  // 타입별 통계
  const byType: Record<string, number> = {}
  for (const r of rows) byType[r.challenge_type ?? 'null'] = (byType[r.challenge_type ?? 'null'] ?? 0) + 1
  console.log('\n타입별 분포:')
  for (const [t, n] of Object.entries(byType)) console.log(`  ${t}: ${n}건`)
}

main().catch(console.error)
