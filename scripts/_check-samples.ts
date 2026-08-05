import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import { fetchWebtoonEpisode } from '../lib/kpatto/fetch-episode'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const targets = [
    { epId: 'kp-ep-031', label: 'EP31' },
    { epId: 'kp-ep-089', label: 'EP89' },
  ]

  for (const { epId, label } of targets) {
    // 1) fetch webtoon episode to get bubble text by computed ID
    const epData = await fetchWebtoonEpisode(epId, sb)
    const bubbleMap = new Map<string, string>() // computed_id → korean text
    for (const section of epData?.sections ?? []) {
      if (section.type === 'gap') {
        for (const bubble of section.bubbles ?? []) {
          bubbleMap.set(bubble.id, bubble.korean ?? '')
        }
      }
    }

    // 2) fetch overrides
    const { data: layout } = await sb.from('kpatto_webtoon_layouts')
      .select('overrides').eq('episode_id', epId).single()
    const ov = (layout?.overrides ?? {}) as Record<string, any>
    const lbEntries = Object.entries(ov).filter(([_, v]) => v.lineBreaks)

    console.log(`\n▶ ${label} (${epId}) — lineBreaks ${lbEntries.length}건:`)
    if (!lbEntries.length) { console.log('  (없음)'); continue }

    for (const [bid, fields] of lbEntries) {
      const korean = bubbleMap.get(bid) ?? '(버블 없음 — ID 불일치)'
      const words = korean.trim().split(/\s+/)
      const lb = fields.lineBreaks as number[]
      let result = ''
      for (let i = 0; i < words.length; i++) {
        if (i > 0 && lb.includes(i)) result += ' / '
        else if (i > 0) result += ' '
        result += words[i]
      }
      console.log(`  [${bid}] "${result}"`)
    }
  }
}

main().catch(e => { console.error(e); process.exit(1) })
