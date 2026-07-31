import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// keyword → target order_num per episode
// Only episodes that ACTUALLY need changes: EP03, EP06, EP09, EP10
const EPISODE_RULES: Record<number, { keyword: string; order: number }[]> = {
  3: [
    { keyword: '하고 싶어요',  order: 1 },
    { keyword: '수 있어요',    order: 2 },
    { keyword: '못',           order: 3 },
    { keyword: '맞아요',       order: 4 },
    { keyword: '아니에요',     order: 5 },
  ],
  6: [
    { keyword: '좋아해요',     order: 1 },
    { keyword: '너무',         order: 2 },
    { keyword: '잘해요',       order: 3 },
    { keyword: '진짜요',       order: 4 },
    { keyword: '오고 싶어요',  order: 5 },
  ],
  9: [
    { keyword: '날씨',         order: 1 },
    { keyword: '배달',         order: 2 },
    { keyword: '생각보다',     order: 3 },
    { keyword: '다 같이',      order: 4 },
    { keyword: '이미',         order: 5 },
  ],
  10: [
    { keyword: '떨려요',       order: 1 },
    { keyword: '왔어요',       order: 2 },
    { keyword: '전공',         order: 3 },
    { keyword: '부탁',         order: 4 },
    { keyword: '있었어요',     order: 5 },
  ],
}

// All episodes to DISPLAY in result (EP02-10)
const DISPLAY_EPS = [2,3,4,5,6,7,8,9,10]

async function main() {
  // Get episode id map
  const { data: episodes } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .in('episode_num', [2,3,4,5,6,7,8,9,10])
    .order('episode_num')
  const epMap = new Map<number, number>()
  for (const e of episodes ?? []) epMap.set(e.episode_num, e.id)

  // Get all patterns for EP02-10
  const epIds = [...epMap.values()]
  const { data: allPatterns } = await supabase
    .from('kp_patterns')
    .select('id, episode_id, order_num, pattern')
    .in('episode_id', epIds)
    .order('episode_id')
    .order('order_num')

  // Apply reordering for episodes that need changes
  for (const [epNum, rules] of Object.entries(EPISODE_RULES)) {
    const num = Number(epNum)
    const epId = epMap.get(num)
    if (!epId) { console.warn(`EP${num} id not found`); continue }

    const epPats = (allPatterns ?? []).filter(p => p.episode_id === epId)
    console.log(`\nEP${num} 현재:`)
    epPats.forEach(p => console.log(`  p${p.order_num}: ${p.pattern}`))

    const updates: { id: number; newOrder: number }[] = []
    for (const rule of rules) {
      const match = epPats.find(p => p.pattern.includes(rule.keyword))
      if (!match) { console.warn(`  ⚠ 매칭 실패: "${rule.keyword}"`); continue }
      if (match.order_num !== rule.order) {
        updates.push({ id: match.id, newOrder: rule.order })
      }
    }

    if (!updates.length) { console.log('  → 이미 정확'); continue }

    // Phase 1: temp offset (+100)
    for (const u of updates) {
      await supabase.from('kp_patterns').update({ order_num: u.newOrder + 100 }).eq('id', u.id)
    }
    // Phase 2: real values
    for (const u of updates) {
      const { error } = await supabase.from('kp_patterns').update({ order_num: u.newOrder }).eq('id', u.id)
      if (error) console.error(`  FAIL id=${u.id}: ${error.message}`)
      else console.log(`  ✓ id=${u.id} → order_num=${u.newOrder}`)
    }
  }

  // Final result for EP02-10
  console.log('\n\n=== 최종 패턴 순서 (EP02~10) ===')
  const { data: finalPatterns } = await supabase
    .from('kp_patterns')
    .select('id, episode_id, order_num, pattern')
    .in('episode_id', epIds)
    .order('episode_id')
    .order('order_num')

  for (const epNum of DISPLAY_EPS) {
    const epId = epMap.get(epNum)
    if (!epId) continue
    const pats = (finalPatterns ?? []).filter(p => p.episode_id === epId)
    console.log(`\nEP${epNum}:`)
    pats.forEach(p => console.log(`  p${p.order_num}: ${p.pattern}`))
  }

  console.log('\n✓ 완료')
}

main().catch(e => { console.error(e); process.exit(1) })
