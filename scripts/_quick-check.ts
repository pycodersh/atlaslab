import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto', '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  // kp_expressions.korean 샘플
  const { data: e1 } = await sb.from('kp_expressions').select('id, korean, english').limit(3)
  console.log('kp_expressions.korean 샘플:', JSON.stringify(e1))

  // kp_dialogues text_en - EP01-30 vs EP31+
  const [{ count: c1 }, { count: c2 }] = await Promise.all([
    sb.from('kp_dialogues').select('*', { count: 'exact', head: true }).lte('episode_id', 30).not('text_en', 'is', null),
    sb.from('kp_dialogues').select('*', { count: 'exact', head: true }).gte('episode_id', 31).not('text_en', 'is', null),
  ])
  console.log(`kp_dialogues.text_en 있음: EP01-30=${c1}건, EP31-100=${c2}건`)

  // kp_dialogues EP01-30 샘플 (text_en 있는 것)
  const { data: d2 } = await sb.from('kp_dialogues').select('id, text_ko, text_en').lte('episode_id', 30).not('text_en', 'is', null).limit(2)
  console.log('EP01-30 dialogue with text_en:', JSON.stringify(d2))
}
main().catch(console.error)
