import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  const { data } = await sb
    .from('kp_expressions')
    .select('id, korean, description, examples')
    .not('description', 'is', null)
    .limit(5)

  for (const r of data ?? []) {
    console.log(`\nid=${r.id} | ${r.korean}`)
    console.log('desc:', r.description)
    console.log('examples:', JSON.stringify(r.examples, null, 2))
  }
}

main().catch(console.error)
