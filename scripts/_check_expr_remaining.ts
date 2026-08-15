/** 남은 표현 음성 대상 점검 (읽기 전용) */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function fetchAll() {
  const out: any[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb
      .from('kp_expressions')
      .select('id, slug, first_episode, korean, examples, audio_urls, audio_url, audio_hash')
      .order('id').range(from, from + 999)
    if (error) throw error
    out.push(...(data ?? []))
    if (!data || data.length < 1000) break
  }
  return out
}

function patternText(korean: string): string {
  return korean.replace(/^~/, '').split('/')[0].replace(/[.!?]$/, '').trim()
}

async function main() {
  const all = await fetchAll()
  console.log(`kp_expressions 전체: ${all.length}개`)

  const done = all.filter(e => e.audio_urls)
  const todo = all.filter(e => !e.audio_urls)
  console.log(`audio_urls 있음(skip 대상): ${done.length}개`)
  console.log(`audio_urls 없음(생성 대상): ${todo.length}개 → × 4 = ${todo.length * 4}건\n`)

  // slug 건전성 — 경로가 slug로 결정되므로 중복/누락이면 덮어쓰기 사고
  const noSlug = todo.filter(e => !e.slug || !String(e.slug).trim())
  console.log(`slug 없음: ${noSlug.length}개 ${noSlug.map(e => e.id).slice(0, 20).join(',')}`)
  const slugCount = new Map<string, number[]>()
  for (const e of all) if (e.slug) slugCount.set(e.slug, [...(slugCount.get(e.slug) ?? []), e.id])
  const dup = [...slugCount.entries()].filter(([, ids]) => ids.length > 1)
  console.log(`slug 중복: ${dup.length}건`)
  for (const [s, ids] of dup.slice(0, 20)) console.log(`   ${s} → id ${ids.join(', ')}`)
  const badChar = todo.filter(e => e.slug && !/^[a-z0-9._-]+$/i.test(e.slug))
  console.log(`slug에 경로 부적합 문자: ${badChar.length}개 ${badChar.map(e => `${e.id}:${e.slug}`).slice(0, 10).join(', ')}`)

  // 예문 개수
  const exCount = new Map<number, number>()
  for (const e of todo) {
    const ex = typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples
    const n = Array.isArray(ex) ? ex.filter((x: any) => x?.ko?.trim()).length : 0
    exCount.set(n, (exCount.get(n) ?? 0) + 1)
  }
  console.log(`\n예문 개수 분포: ${[...exCount.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}개:${v}표현`).join(', ')}`)
  const few = todo.filter(e => {
    const ex = typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples
    return !Array.isArray(ex) || ex.filter((x: any) => x?.ko?.trim()).length < 3
  })
  console.log(`예문 3개 미만: ${few.length}개`)
  for (const e of few.slice(0, 15)) {
    const ex = typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples
    console.log(`   id=${e.id} ${e.slug} "${e.korean}" → 예문 ${Array.isArray(ex) ? ex.length : 0}개`)
  }

  // 패턴 텍스트 건전성
  const emptyPat = todo.filter(e => !patternText(e.korean ?? ''))
  console.log(`\n패턴 텍스트 비어 있음: ${emptyPat.length}개 ${emptyPat.map(e => `${e.id}:${e.korean}`).slice(0, 10).join(', ')}`)
  const lens = new Map<number, number>()
  for (const e of todo) {
    const n = patternText(e.korean ?? '').replace(/\s/g, '').length
    lens.set(n, (lens.get(n) ?? 0) + 1)
  }
  const short = [...lens.entries()].filter(([k]) => k <= 3).reduce((s, [, v]) => s + v, 0)
  console.log(`패턴 글자수 분포(공백 제외): ${[...lens.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}자:${v}`).join(', ')}`)
  console.log(`2~3자(길이 검증 대상) 패턴: ${short}개`)

  // 물결(~) 포함 패턴 — TTS가 이상하게 읽을 수 있음
  const tilde = todo.filter(e => patternText(e.korean ?? '').includes('~'))
  console.log(`\n패턴에 ~ 남아 있음: ${tilde.length}개`)
  for (const e of tilde.slice(0, 15)) console.log(`   id=${e.id} ${e.slug} → "${patternText(e.korean)}"`)

  // 비용·시간 추산
  let chars = 0
  for (const e of todo) {
    const ex = typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples
    chars += patternText(e.korean ?? '').length
    for (const x of (Array.isArray(ex) ? ex.slice(0, 3) : [])) chars += (x?.ko ?? '').length
  }
  console.log(`\n총 문자수 추산: ${chars.toLocaleString()}자 → 약 $${(chars * 12 / 1_000_000).toFixed(3)}`)
  console.log(`예상 소요: 약 ${Math.round(todo.length * 4 * 2.5 / 60)}분 (건당 ~2.5초 가정)`)

  // first_episode 분포
  const eps = new Map<number, number>()
  for (const e of todo) eps.set(e.first_episode ?? 0, (eps.get(e.first_episode ?? 0) ?? 0) + 1)
  const sorted = [...eps.entries()].sort((a, b) => a[0] - b[0])
  console.log(`\nfirst_episode 범위: ${sorted[0]?.[0]} ~ ${sorted.at(-1)?.[0]}`)
  console.log(`EP05 이하인데 생성 대상인 것: ${todo.filter(e => (e.first_episode ?? 99) <= 5).length}개`)
}

main().catch(e => { console.error(e); process.exit(1) })
