import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY'])

const { data: ep } = await supabase.from('kp_episodes').select('id, episode_num').eq('episode_num', 45).single()
console.log('Episode row:', ep)

// All panels for this episode (no type filter)
const { data: allPanels } = await supabase
  .from('kp_panels').select('id, order_num, type, layout').eq('episode_id', ep.id).order('order_num')
console.log('\nAll kp_panels for EP45:', JSON.stringify(allPanels, null, 2))

// All bubbles for this episode
const { data: bubbles } = await supabase
  .from('kp_bubbles').select('panel_id, order_num, speaker, korean').eq('episode_id', ep.id).order('order_num')
console.log('\nAll kp_bubbles for EP45:', JSON.stringify(bubbles, null, 2))

// Show which panel_ids in bubbles are NOT in allPanels
const panelIdSet = new Set((allPanels ?? []).map(p => p.id))
const orphanBubbles = (bubbles ?? []).filter(b => !panelIdSet.has(b.panel_id))
console.log('\nBubbles with panel_id NOT in kp_panels:', JSON.stringify(orphanBubbles, null, 2))
