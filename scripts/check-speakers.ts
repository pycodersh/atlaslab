import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
async function run() {
  const { data } = await sb.from('kp_bubbles').select('speaker, korean').not('korean', 'is', null).neq('korean', '')
  const speakerSet = new Map<string, number>()
  for (const b of (data ?? []) as any[]) {
    const s = b.speaker ?? '(null)'
    speakerSet.set(s, (speakerSet.get(s) ?? 0) + 1)
  }
  const sorted = [...speakerSet.entries()].sort((a, b) => b[1] - a[1])
  console.log('speaker 목록:')
  for (const [s, cnt] of sorted) console.log(`  "${s}": ${cnt}건`)
}
run().catch(console.error)
