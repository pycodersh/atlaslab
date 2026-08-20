/** 패턴이 물음표로 끝나는 표현 집계 (읽기 전용) */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

/** 물결·앞뒤 하이픈만 제거한 패턴 원문 (물음표 유지) */
function patternRaw(korean: string): string {
  return korean.split('/')[0].replace(/~/g, '').replace(/^-+|-+$/g, '').replace(/\s+/g, ' ').trim()
}
/** 실제 TTS에 들어간 텍스트 (문장부호 제거) */
function patternTts(korean: string): string {
  return patternRaw(korean).replace(/[.!?]$/, '').trim()
}

async function main() {
  const all: any[] = []
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from('kp_expressions')
      .select('id, slug, first_episode, korean, audio_urls')
      .order('first_episode').order('id').range(f, f + 999)
    if (error) throw error
    all.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  console.log(`kp_expressions 전체 ${all.length}개`)

  const q = all.filter(e => patternRaw(e.korean).endsWith('?'))
  const noUrls = q.filter(e => !e.audio_urls?.pattern)
  console.log(`패턴이 ?로 끝나는 표현: ${q.length}개`)
  console.log(`그중 pattern 파일이 없는 것: ${noUrls.length}개 (있어야 덮어쓸 수 있음)\n`)

  console.log('EP  id    slug                          korean                     TTS 입력           글자')
  for (const e of q) {
    const tts = patternTts(e.korean)
    console.log(
      `${String(e.first_episode).padStart(2)}  ${String(e.id).padEnd(5)} ${e.slug.padEnd(29)} ` +
      `${e.korean.padEnd(26)} ${tts.padEnd(18)} ${tts.replace(/\s/g, '').length}`
    )
  }

  const short = q.filter(e => {
    const n = patternTts(e.korean).replace(/\s/g, '').length
    return n >= 2 && n <= 3
  })
  console.log(`\n2~3자 패턴(길이 검증 대상): ${short.length}개 — ${short.map(e => e.slug).join(', ')}`)

  console.log(`\nslug 목록:`)
  console.log(q.map(e => e.slug).join(', '))
}

main().catch(e => { console.error(e); process.exit(1) })
