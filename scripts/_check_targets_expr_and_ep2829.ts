/** 작업 대상 확인 (읽기 전용): ① EP01~05 표현 ② EP28·29 미생성 대사 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function patternText(korean: string): string {
  return korean.replace(/^~/, '').split('/')[0].replace(/[.!?]$/, '').trim()
}

async function main() {
  console.log('=== ① EP01~05 표현 (first_episode 1~5) ===')
  const { data: exprs, error } = await sb
    .from('kp_expressions')
    .select('id, slug, first_episode, korean, examples, audio_urls, audio_url')
    .in('first_episode', [1, 2, 3, 4, 5])
    .order('first_episode').order('id')
  if (error) throw error
  console.log(`표현 ${exprs?.length}개 → × 4 = ${(exprs?.length ?? 0) * 4}건\n`)
  console.log('id   slug                  ep  패턴텍스트(글자수)   예문수  audio_urls키           확장자')
  for (const e of exprs ?? []) {
    const ex = (typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples) as Array<{ ko: string }>
    const urls = (e.audio_urls ?? {}) as Record<string, string>
    const keys = Object.keys(urls).sort().join(',')
    const ext = [...new Set(Object.values(urls).map(u => u.split('.').pop()))].join('/')
    const pat = patternText(e.korean)
    console.log(
      `${String(e.id).padEnd(4)} ${e.slug.padEnd(21)} ${e.first_episode}   ${(pat + `(${pat.length}자)`).padEnd(20)} ${String(ex?.length ?? 0).padStart(4)}   ${keys.padEnd(22)} ${ext}`
    )
  }
  // 경로 규약 확인
  const sample = (exprs ?? []).find(e => e.audio_urls)
  if (sample) {
    console.log('\n경로 예시:')
    for (const [k, v] of Object.entries(sample.audio_urls as Record<string, string>))
      console.log(`  ${k}: ${v.split('/public/audio/')[1]}`)
  }
  const noUrls = (exprs ?? []).filter(e => !e.audio_urls)
  console.log(`\naudio_urls 없는 표현: ${noUrls.length}개 ${noUrls.map(e => e.slug).join(', ')}`)
  const fewEx = (exprs ?? []).filter(e => {
    const ex = (typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples) as unknown[]
    return !Array.isArray(ex) || ex.length < 3
  })
  console.log(`예문 3개 미만 표현: ${fewEx.length}개 ${fewEx.map(e => e.slug).join(', ')}`)

  console.log('\n\n=== ② EP28·EP29 미생성 대사 ===')
  const { data: dlg } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url')
    .in('episode_id', [28, 29]).order('episode_id').order('order_num')
  const todo = (dlg ?? []).filter(d => !d.audio_url)
  console.log(`전체 ${dlg?.length}건 중 audio_url NULL = ${todo.length}건`)
  for (const d of todo)
    console.log(`  EP${d.episode_id} id=${d.id} #${d.order_num} [${d.speaker}] ${d.text_ko}`)
  console.log(`\n화자: ${[...new Set(todo.map(d => d.speaker))].join(', ')}`)

  const { data: bub } = await sb
    .from('kp_bubbles').select('id, episode_id, speaker, korean, audio_url').in('episode_id', [28, 29])
  console.log(`버블: EP28 ${bub?.filter(b => b.episode_id === 28).length}건(NULL ${bub?.filter(b => b.episode_id === 28 && !b.audio_url).length}), EP29 ${bub?.filter(b => b.episode_id === 29).length}건(NULL ${bub?.filter(b => b.episode_id === 29 && !b.audio_url).length})`)
  // 텍스트 매칭 가능 여부
  const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
  for (const d of todo) {
    const hit = (bub ?? []).filter(b => b.episode_id === d.episode_id && norm(b.korean) === norm(d.text_ko))
    if (hit.length !== 1) console.log(`  ⚠️ 매칭 ${hit.length}건: EP${d.episode_id} id=${d.id} "${d.text_ko}"`)
  }
  console.log('버블 매칭 확인 완료 (위에 ⚠️ 없으면 전건 1:1)')
}

main().catch(e => { console.error(e); process.exit(1) })
