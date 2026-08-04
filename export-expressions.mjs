import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const { data, error } = await sb
  .from('kp_expressions')
  .select('id, korean, english, description, examples')
  .order('id')

if (error) { console.error('오류:', error.message); process.exit(1) }

console.log(`총 ${data.length}개 표현 로드`)

const lines = ['# K-PATTO Expressions Review\n', `총 ${data.length}개 | 생성일: ${new Date().toISOString().slice(0,10)}\n`]

for (const e of data) {
  lines.push(`---\n`)
  lines.push(`## [${e.id}] ${e.korean ?? '(없음)'}`)
  lines.push(``)
  lines.push(`- **literal_en**: ${e.english ?? '—'}`)
  lines.push(`- **usage_en**: ${e.description ?? '—'}`)
  if (e.examples?.length) {
    lines.push(`- **examples**:`)
    for (const ex of e.examples) {
      lines.push(`  - ko: ${ex.ko}`)
      lines.push(`    en: ${ex.en}`)
    }
  } else {
    lines.push(`- **examples**: (없음)`)
  }
  lines.push(``)
}

const out = lines.join('\n')
writeFileSync('data/kpatto/source/expressions_review.md', out, 'utf8')
console.log('✓ data/kpatto/source/expressions_review.md 생성 완료')
