/** EP01~70 오디오 URL 패턴 점검 (읽기 전용) */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function kind(url: string | null): string {
  if (!url) return 'none'
  if (url.includes('/dialogues/')) return 'dialogues/*.wav(Gemini)'
  if (url.includes('/bubbles/')) return 'bubbles/*.mp3(OpenAI)'
  return 'other:' + url.split('/audio/')[1]?.split('/')[0]
}

async function main() {
  console.log('EP | dlg | dlg_url | bub | bub_url | dlg종류 | bub종류')
  for (let ep = 1; ep <= 70; ep++) {
    const { data: dlg } = await sb.from('kp_dialogues')
      .select('id, audio_url').eq('episode_id', ep)
    const { data: bub } = await sb.from('kp_bubbles')
      .select('id, audio_url').eq('episode_id', ep)
    const dk = [...new Set((dlg ?? []).map(d => kind(d.audio_url)))].join('+')
    const bk = [...new Set((bub ?? []).map(b => kind(b.audio_url)))].join('+')
    console.log(
      `${String(ep).padStart(2)} | ${String(dlg?.length ?? 0).padStart(3)} | ${String((dlg ?? []).filter(d => d.audio_url).length).padStart(7)} | ` +
      `${String(bub?.length ?? 0).padStart(3)} | ${String((bub ?? []).filter(b => b.audio_url).length).padStart(7)} | ${dk} | ${bk}`
    )
  }

  console.log('\n=== EP58~62 버블 상세 ===')
  const { data: b } = await sb.from('kp_bubbles')
    .select('id, episode_id, order_num, speaker, korean, audio_url, dialogue_id')
    .gte('episode_id', 58).lte('episode_id', 62).order('episode_id').order('order_num')
  for (const r of b ?? []) console.log(`EP${r.episode_id} #${r.order_num} id=${r.id} dlg=${r.dialogue_id} [${r.speaker}] ${r.audio_url}`)

  console.log('\n=== EP58~62 대사 상세 ===')
  const { data: d } = await sb.from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url')
    .gte('episode_id', 58).lte('episode_id', 62).order('episode_id').order('order_num')
  for (const r of d ?? []) console.log(`EP${r.episode_id} #${r.order_num} id=${r.id} [${r.speaker}] ${r.audio_url}`)
}

main().catch(e => { console.error(e); process.exit(1) })
