/** 표현 TTS 입력 텍스트 건전성 점검 (읽기 전용) */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const pt = (k: string) => k.split('/')[0].replace(/~/g, '').replace(/^-+|-+$/g, '')
  .replace(/[.!?]$/, '').replace(/\s+/g, ' ').trim()

const JAMO = /[ㄱ-ㆎ]/

async function main() {
  const out: any[] = []
  for (let f = 0; ; f += 1000) {
    const { data } = await sb.from('kp_expressions')
      .select('id, slug, korean, examples, audio_urls').order('id').range(f, f + 999)
    out.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  const todo = out.filter(e => !e.audio_urls)
  console.log(`대상 ${todo.length}개\n`)

  console.log('=== 패턴에 낱자모(ㄹ,ㄴ…) 포함 ===')
  let n = 0
  for (const e of todo) {
    const p = pt(e.korean)
    if (JAMO.test(p)) { n++; console.log(`  id=${e.id} ${e.slug.padEnd(26)} "${e.korean}" → "${p}"`) }
  }
  console.log(`총 ${n}개`)

  console.log('\n=== 예문에 낱자모 포함 ===')
  let m = 0
  const samples: string[] = []
  for (const e of todo) {
    const ex = typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples
    for (const x of (Array.isArray(ex) ? ex : [])) {
      if (JAMO.test(x?.ko ?? '')) { m++; if (samples.length < 10) samples.push(`  ${e.slug}: "${x.ko}"`) }
    }
  }
  samples.forEach(s => console.log(s))
  console.log(`총 ${m}건`)

  console.log('\n=== 패턴 중간에 하이픈이 남는 경우 ===')
  let k = 0
  for (const e of todo) {
    const p = pt(e.korean)
    if (p.includes('-')) { k++; if (k <= 15) console.log(`  id=${e.id} ${e.slug} "${e.korean}" → "${p}"`) }
  }
  console.log(`총 ${k}개`)

  console.log('\n=== 물결 제거로 어색해지는 패턴(원문에 중간 ~ 있던 것) ===')
  let t = 0
  for (const e of todo) {
    const raw = e.korean.split('/')[0].replace(/^~/, '')
    if (raw.includes('~')) { t++; console.log(`  id=${e.id} ${e.slug.padEnd(26)} "${e.korean}" → "${pt(e.korean)}"`) }
  }
  console.log(`총 ${t}개`)
}

main().catch(e => { console.error(e); process.exit(1) })
