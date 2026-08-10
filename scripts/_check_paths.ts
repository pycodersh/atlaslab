import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!)

async function main() {
  // 모든 EP31~100 에피소드의 hasGaps 여부 확인
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num').gte('episode_num', 31).order('episode_num')
  
  const pathC: number[] = []
  const pathB: number[] = []
  
  for (const ep of (eps ?? [])) {
    const { data: panels } = await sb.from('kp_panels').select('type').eq('episode_id', ep.id)
    const hasGaps = (panels ?? []).some((p:any) => p.type === 'gap')
    if (hasGaps) pathB.push(ep.episode_num)
    else pathC.push(ep.episode_num)
  }
  
  console.log('Path B (hasGaps):', pathB.join(','))
  console.log('Path C (no gaps):', pathC.join(','))
  
  // Path C 에피소드 중 override가 있는 것
  const { data: layouts } = await sb.from('kpatto_webtoon_layouts').select('episode_id')
  const layoutEps = (layouts ?? []).map((l:any) => l.episode_id)
  console.log('Overrides exist for:', layoutEps.join(','))
}
main().catch(console.error)
