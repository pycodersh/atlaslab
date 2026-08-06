import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

async function main() {
  const { data } = await sb.from('kp_dialogues').select('episode_id, audio_url').gte('episode_id', 10).order('episode_id')
  const rows = data ?? []

  const byEp: Record<number, { total: number; done: number }> = {}
  for (const r of rows) {
    const ep = r.episode_id as number
    if (!byEp[ep]) byEp[ep] = { total: 0, done: 0 }
    byEp[ep].total++
    if (r.audio_url) byEp[ep].done++
  }

  console.log('EP    | total | done | pending')
  console.log('------+-------+------+--------')
  for (const [ep, v] of Object.entries(byEp).sort((a, b) => +a[0] - +b[0])) {
    const pending = v.total - v.done
    const epStr = `EP${String(ep).padStart(2, '0')}`
    console.log(`${epStr}  |  ${String(v.total).padStart(3)} |  ${String(v.done).padStart(3)} |  ${String(pending).padStart(3)}`)
  }

  const ep1011   = Object.entries(byEp).filter(([ep]) => +ep <= 11).reduce((s, [, v]) => s + (v.total - v.done), 0)
  const ep12plus = Object.entries(byEp).filter(([ep]) => +ep >= 12).reduce((s, [, v]) => s + (v.total - v.done), 0)
  const total    = Object.values(byEp).reduce((s, v) => s + (v.total - v.done), 0)

  console.log('')
  console.log(`EP10-11 pending : ${ep1011} 건`)
  console.log(`EP12+   pending : ${ep12plus} 건`)
  console.log(`전체    pending : ${total} 건`)
  console.log(`RPD 잔여 추산  : 100 - 1(expr789) = 99 회`)
  console.log(`EP10-11 실행 후 잔여 : ${99 - ep1011} 회`)
}
main().catch(console.error)
