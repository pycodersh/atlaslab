import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })
const EPS = [71, 72, 73, 74, 75]
const kind = (u: string | null) => !u ? 'none' : u.includes('/dialogues/') ? 'gemini-wav' : u.includes('/bubbles/') ? 'openai-mp3' : 'other'
async function main() {
  const { data: dlg } = await sb.from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url').in('episode_id', EPS).order('episode_id').order('order_num')
  const { data: bub } = await sb.from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url').in('episode_id', EPS)
  console.log('EP | 대사 | 대사URL | 대사엔진 | 버블 | 버블URL | 버블엔진')
  let total = 0
  for (const ep of EPS) {
    const d = (dlg ?? []).filter(x => x.episode_id === ep)
    const b = (bub ?? []).filter(x => x.episode_id === ep)
    total += d.length
    const dk = [...new Set(d.map(x => kind(x.audio_url)))].join('+')
    const bk = [...new Set(b.map(x => kind(x.audio_url)))].join('+')
    console.log(`${ep} | ${String(d.length).padStart(4)} | ${String(d.filter(x=>x.audio_url).length).padStart(6)} | ${dk.padEnd(8)} | ${String(b.length).padStart(4)} | ${String(b.filter(x=>x.audio_url).length).padStart(6)} | ${bk}`)
  }
  console.log(`\n대사 합계: ${total}건`)
  const bySpeaker: Record<string, number> = {}
  for (const d of dlg ?? []) bySpeaker[d.speaker] = (bySpeaker[d.speaker] ?? 0) + 1
  console.log(`화자별: ${Object.entries(bySpeaker).map(([k,v])=>`${k}:${v}`).join(', ')}`)
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
  let bad = 0
  for (const d of dlg ?? []) {
    const hit = (bub ?? []).filter(b => b.episode_id === d.episode_id && norm(b.korean) === norm(d.text_ko))
    if (hit.length !== 1) { console.log(`  ⚠️ 버블 매칭 ${hit.length}건: EP${d.episode_id} id=${d.id} "${d.text_ko}"`); bad++ }
  }
  console.log(bad === 0 ? '버블 1:1 매칭: ✅ 전건' : `버블 매칭 이상 ${bad}건`)
}
main().catch(e => { console.error(e); process.exit(1) })
