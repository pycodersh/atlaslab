import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const EPS = [29, 46, 47, 48, 60]
async function main() {
  const { data: dlg } = await sb.from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url')
    .in('episode_id', EPS).order('episode_id').order('order_num')
  const { data: bub } = await sb.from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url').in('episode_id', EPS)
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
  let total = 0
  console.log('EP | 대사총 | 생성대상 | skip | 버블총 | 버블NULL')
  for (const ep of EPS) {
    const d = (dlg ?? []).filter(x => x.episode_id === ep)
    const b = (bub ?? []).filter(x => x.episode_id === ep)
    const todo = d.filter(x => !x.audio_url)
    total += todo.length
    console.log(`${ep} | ${String(d.length).padStart(6)} | ${String(todo.length).padStart(8)} | ${String(d.length - todo.length).padStart(4)} | ${String(b.length).padStart(6)} | ${String(b.filter(x => !x.audio_url).length).padStart(8)}`)
  }
  console.log(`\n생성 대상 합계: ${total}건`)
  const todoAll = (dlg ?? []).filter(x => !x.audio_url)
  const bySpeaker: Record<string, number> = {}
  for (const d of todoAll) bySpeaker[d.speaker] = (bySpeaker[d.speaker] ?? 0) + 1
  console.log(`화자별: ${Object.entries(bySpeaker).map(([k, v]) => `${k}:${v}`).join(', ')}`)
  console.log('\n대사 목록:')
  for (const d of todoAll) console.log(`  EP${d.episode_id} id=${d.id} [${d.speaker}] ${d.text_ko}`)
  console.log('\n버블 1:1 매칭 확인:')
  let bad = 0
  for (const d of todoAll) {
    const hit = (bub ?? []).filter(b => b.episode_id === d.episode_id && norm(b.korean) === norm(d.text_ko))
    if (hit.length !== 1) { console.log(`  ⚠️ 매칭 ${hit.length}건: EP${d.episode_id} id=${d.id} "${d.text_ko}"`); bad++ }
  }
  console.log(bad === 0 ? '  ✅ 전건 1:1' : `  ❌ ${bad}건 이상`)
}
main().catch(e => { console.error(e); process.exit(1) })
