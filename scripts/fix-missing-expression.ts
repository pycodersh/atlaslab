import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  const backup = JSON.parse(fs.readFileSync('C:\\Users\\msj15\\Downloads\\kpatto_mappings_backup.json', 'utf-8'))
  const missing = backup.focus.filter((r: any) => r.expression_korean === '덕분에 정말 많이 배웠어요')
  console.log('missing focus rows:', JSON.stringify(missing, null, 2))

  if (!missing.length) { console.log('백업에도 없음'); return }

  // Insert missing expression
  const { data: expr, error: eErr } = await sb
    .from('kp_expressions')
    .insert({
      korean: '덕분에 정말 많이 배웠어요',
      english: '덕분에 정말 많이 배웠어요',
      description: 'Credit someone for helping you learn or grow a lot.',
      examples: [
        { ko: '여러분 덕분에 정말 많이 배웠어요.', en: 'Thanks to all of you, I\'ve learned so much.' },
        { ko: '선생님 덕분에 정말 많이 배웠어요.', en: 'Thanks to my teacher, I\'ve really learned a lot.' },
        { ko: '같이 공부해서 덕분에 정말 많이 배웠어요.', en: 'Studying together, I\'ve learned so much thanks to you.' },
      ],
    })
    .select('id')
    .single()
  if (eErr || !expr) { console.error('expression INSERT 실패:', eErr); return }
  console.log('expression INSERT 완료: id=', expr.id)

  // Insert focus mappings for each missing row
  for (const row of missing) {
    const { error: deErr } = await sb
      .from('kp_dialogue_expressions')
      .insert({
        dialogue_id: row.dialogue_id,
        expression_id: expr.id,
        matched_text: row.matched_text,
        role: 'focus',
      })
    if (deErr) console.error(`focus 매핑 INSERT 실패 dialogue_id=${row.dialogue_id}:`, deErr.message)
    else console.log(`focus 매핑 완료: dialogue_id=${row.dialogue_id}`)
  }
}
main().catch(console.error)
