/**
 * korean-age-system-explained 의 소제목 "## 빠른 년생" 에 영문을 병기한다.
 *   ## 빠른 년생  →  ## 빠른 년생 (The "Early-Year" Social Age)
 *
 * content 외 컬럼은 건드리지 않는다. 이미 반영돼 있으면 아무것도 하지 않는다.
 * --apply 없이 실행하면 계획만 출력한다(기본 dry-run).
 *
 * 실행: npx tsx scripts/update-korean-age-heading.ts [--apply]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')
const SLUG = 'korean-age-system-explained'
const FROM = '## 빠른 년생'
const TO = '## 빠른 년생 (The "Early-Year" Social Age)'

async function main() {
  const { data, error } = await sb
    .from('blog_posts')
    .select('id, slug, content')
    .eq('slug', SLUG)
    .single()
  if (error || !data) { console.error(`⛔ ${SLUG} 조회 실패`); process.exit(1) }

  const content: string = data.content ?? ''

  if (content.includes(TO)) {
    console.log('↷ 이미 병기돼 있음 — 변경 없음')
    return
  }

  // 줄 전체가 정확히 "## 빠른 년생" 인 경우만 바꾼다(부분 일치로 오작동하지 않게)
  const lines = content.split('\n')
  const idx = lines.findIndex(l => l.trim() === FROM)
  if (idx === -1) {
    console.error(`⛔ "${FROM}" 줄을 못 찾음 — 중단`)
    console.error('   실제 h2 목록:')
    for (const l of lines.filter(l => l.startsWith('## '))) console.error(`     ${l}`)
    process.exit(1)
  }

  lines[idx] = TO
  const next = lines.join('\n')

  console.log(`대상: ${SLUG}`)
  console.log(`  ${idx + 1}번째 줄`)
  console.log(`  before: ${FROM}`)
  console.log(`  after : ${TO}`)
  console.log(`  ${content.length} → ${next.length} chars`)

  if (!APPLY) { console.log('\ndry-run 종료 — 변경 없음'); return }

  const { error: updErr } = await sb.from('blog_posts').update({ content: next }).eq('id', data.id)
  if (updErr) throw new Error(`UPDATE 실패: ${updErr.message}`)
  console.log('\n✅ 저장 완료')
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
