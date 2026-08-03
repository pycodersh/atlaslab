import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const { data: bubbles, error } = await supabase
  .from('kp_bubbles')
  .select('episode_id, bubble_type')

if (error) { console.error('error:', error.message); process.exit(1) }

const byType = {}
const thoughtByEp = {}

for (const b of (bubbles ?? [])) {
  byType[b.bubble_type ?? 'null'] = (byType[b.bubble_type ?? 'null'] ?? 0) + 1
  if (b.bubble_type === 'thought') {
    thoughtByEp[b.episode_id] = (thoughtByEp[b.episode_id] ?? 0) + 1
  }
}

console.log('=== bubble_type 집계 ===')
for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t}: ${c}`)
}

if (Object.keys(thoughtByEp).length > 0) {
  console.log('\n=== thought 말풍선 episode_id별 ===')
  // episode_id → episode_num 조회
  const epIds = Object.keys(thoughtByEp).map(Number)
  const { data: eps } = await supabase.from('kp_episodes').select('id, episode_num').in('id', epIds)
  const epMap = Object.fromEntries((eps ?? []).map(e => [e.id, e.episode_num]))
  for (const [eid, cnt] of Object.entries(thoughtByEp).sort((a, b) => a[0] - b[0])) {
    console.log(`  EP${String(epMap[eid] ?? '?').padStart(2,'0')}: ${cnt}개`)
  }
} else {
  console.log('\n⚠ thought 말풍선 없음 (kp_bubbles에 bubble_type=thought 행 0개)')
}
