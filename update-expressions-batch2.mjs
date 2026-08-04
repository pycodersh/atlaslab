import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const sb = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const batch2 = JSON.parse(readFileSync('data/kpatto/source/expressions_rule_batch2.json', 'utf8'))

// 896 ~보다 수동 항목 추가
const extra = {
  id: 896,
  literal_en: 'than ~',
  usage_en: 'Used to compare two things. Attach 보다 to the one you are comparing against, and it means \'more than that\'.\n\nRule: 보다 attaches directly to the noun with no space (마트보다). The thing you are comparing against comes first, so 마트보다 싸요 means cheaper than the supermarket. 더 is often added before the adjective for emphasis.',
}

const allItems = [...batch2, extra]
const allIds = allItems.map(i => i.id)

// ── 1. 백업 ──────────────────────────────────────────────────
const { data: backup, error: backupErr } = await sb
  .from('kp_expressions')
  .select('id, english, description, examples')
  .in('id', allIds)
  .order('id')

if (backupErr) { console.error('백업 조회 실패:', backupErr.message); process.exit(1) }

const backupPath = `data/kpatto/source/expressions_backup_batch2_${Date.now()}.json`
writeFileSync(backupPath, JSON.stringify(backup, null, 2))
console.log(`✅ 백업 저장: ${backupPath} (${backup.length}건)`)

// ── 2. 업데이트 ───────────────────────────────────────────────
let ok = 0, fail = 0
const errors = []

for (const item of allItems) {
  const patch = {
    english: item.literal_en,
    description: item.usage_en,
  }
  if (item.examples) patch.examples = item.examples

  const { error } = await sb.from('kp_expressions').update(patch).eq('id', item.id)
  if (error) {
    fail++
    errors.push(`id=${item.id}: ${error.message}`)
  } else {
    ok++
  }
}

console.log(`\n업데이트 결과: 성공 ${ok}건 / 실패 ${fail}건`)
if (errors.length) { console.log('오류:\n' + errors.join('\n')) }

// ── 3. 검증 ─────────────────────────────────────────────────
console.log('\n── 검증 ──────────────────────────────────')

const { data: updated } = await sb
  .from('kp_expressions')
  .select('id, korean, english, description, examples')
  .in('id', allIds)
  .order('id')

// 3-1. english에 한글이 남아 있는 것
const koreanRegex = /[가-힣]/
const hasKorean = updated.filter(e => e.english && koreanRegex.test(e.english))
console.log(`영어 부제목에 한글 포함: ${hasKorean.length}건`)
for (const e of hasKorean) console.log(`  id=${e.id}  ${e.korean}  english="${e.english}"`)

// 3-2. description이 80자 이하인 것 (잘림 의심)
const mayTrunc = updated.filter(e => e.description && [...e.description].length <= 80)
console.log(`\ndescription ≤80자(잘림 의심): ${mayTrunc.length}건`)
for (const e of mayTrunc) console.log(`  id=${e.id}  ${e.korean}  (${[...e.description].length}자) "${e.description}"`)

// 3-3. 803 예문에 "내일에" 포함 여부
const e803 = updated.find(e => e.id === 803)
if (e803) {
  const naileInExamples = (e803.examples ?? []).some(ex => (ex.ko ?? '').includes('내일에') || (ex.en ?? '').includes('내일에'))
  console.log(`\n803 예문 "내일에" 포함: ${naileInExamples ? '⚠️ 남아있음' : '✅ 없음'}`)
  console.log('803 현재 예문:')
  for (const ex of (e803.examples ?? [])) console.log(`  ko: ${ex.ko}  |  en: ${ex.en}`)
}

// 3-4. 896 ~보다 확인
const e896 = updated.find(e => e.id === 896)
if (e896) {
  console.log(`\n896 ~보다 english="${e896.english}"`)
  console.log(`896 description=${[...( e896.description ?? '')].length}자`)
}
