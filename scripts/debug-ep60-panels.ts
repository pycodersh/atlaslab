/**
 * EP60 kp_panels 구조 조사 — hasGaps / hasOrderConflict 분기 확인
 * npx tsx scripts/debug-ep60-panels.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const createAdminClient = () => createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

const EP_NUMS = [3, 11, 30, 60]

async function main() {
  const sb = createAdminClient()

  for (const epNum of EP_NUMS) {
    const { data: ep } = await sb.from('kp_episodes').select('id').eq('episode_num', epNum).single()
    if (!ep) { console.log(`EP${epNum}: 에피소드 없음`); continue }

    const { data: panels } = await sb.from('kp_panels')
      .select('id, order_num, type, height_ratio')
      .eq('episode_id', ep.id)
      .order('order_num')

    const panelList = panels ?? []
    const hasGaps = panelList.some(p => p.type === 'gap')
    const gapOrderSet = new Set(panelList.filter(p => p.type === 'gap').map(p => p.order_num))
    const hasOrderConflict = panelList.some(p => p.type === 'panel' && gapOrderSet.has(p.order_num))

    console.log(`\n── EP${epNum} ──────────────────────────────────`)
    console.log(`  panels 수: ${panelList.length} (gap: ${panelList.filter(p=>p.type==='gap').length}, panel: ${panelList.filter(p=>p.type==='panel').length})`)
    console.log(`  hasGaps: ${hasGaps}, hasOrderConflict: ${hasOrderConflict}`)
    console.log(`  gap order_nums: [${[...gapOrderSet].sort((a,b)=>a-b).join(', ')}]`)
    console.log(`  image order_nums: [${panelList.filter(p=>p.type==='panel').map(p=>p.order_num).join(', ')}]`)

    // bubble 샘플 — highlight_text, expression_id 확인
    const { data: bubbles } = await sb.from('kp_bubbles')
      .select('id, order_num, panel_id, korean, dialogue_id, highlight_text, expression_id')
      .eq('episode_id', ep.id)
      .not('expression_id', 'is', null)
      .order('order_num')
      .limit(5)

    console.log(`  expression 연결 bubble (최대 5건):`)
    for (const b of (bubbles ?? [])) {
      const panelType = panelList.find(p => p.id === b.panel_id)?.type ?? '?'
      console.log(`    id=${b.id} panel_id=${b.panel_id}(${panelType}) dialogue_id=${b.dialogue_id} expression_id=${b.expression_id} highlight_text="${b.highlight_text}" ko="${b.korean.slice(0,20)}..."`)
    }
  }
}

main().catch(console.error)
