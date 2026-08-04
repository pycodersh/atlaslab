import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

// Check multi-bubble gaps for EP31-100: get position data
const { data: episodes } = await supabase.from('kp_episodes').select('id, episode_num')
  .gte('episode_num', 31).lte('episode_num', 100).order('episode_num')

// Find gap panels that have >1 bubble
const results = []
for (const ep of episodes) {
  const { data: gapPanels } = await supabase.from('kp_panels').select('id, order_num')
    .eq('episode_id', ep.id).eq('type', 'gap')
  const gapIds = (gapPanels ?? []).map(g => g.id)
  if (gapIds.length === 0) continue

  const { data: bubbles } = await supabase.from('kp_bubbles')
    .select('panel_id, order_num, speaker, korean, position')
    .in('panel_id', gapIds).order('panel_id').order('order_num')

  const byGap = new Map()
  for (const b of (bubbles ?? [])) {
    if (!byGap.has(b.panel_id)) byGap.set(b.panel_id, [])
    byGap.get(b.panel_id).push(b)
  }
  for (const [gapId, bs] of byGap) {
    if (bs.length > 1) results.push({ ep: ep.episode_num, gapId, bubbles: bs })
  }
}

console.log(`Multi-bubble gaps found: ${results.length}`)
for (const r of results.slice(0, 10)) {
  console.log(`\nEP${r.ep} gap_panel_id=${r.gapId}:`)
  for (const b of r.bubbles) {
    const pos = b.position ?? {}
    console.log(`  [${b.order_num}] ${b.speaker}: "${b.korean.slice(0,30)}"`)
    console.log(`       xPct=${pos.xPct} yPct=${pos.yPct} widthPct=${pos.widthPct}`)
  }
}
