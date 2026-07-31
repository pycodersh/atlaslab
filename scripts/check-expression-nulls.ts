import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  const { data, error } = await sb
    .from('kp_dialogue_expressions')
    .select(`
      expression_id,
      kp_expressions!inner(id, korean, description, examples)
    `)
    .eq('role', 'focus')

  if (error) { console.error(error); return }

  const unique = new Map<number, any>()
  for (const r of data ?? []) {
    const expr = (r as any).kp_expressions
    if (!unique.has(expr.id)) unique.set(expr.id, expr)
  }

  const all = [...unique.values()]
  const noDesc = all.filter(e => e.description === null || e.description === '')
  const noEx   = all.filter(e => e.examples === null || (Array.isArray(e.examples) && e.examples.length === 0))
  const either = all.filter(e =>
    (e.description === null || e.description === '') ||
    (e.examples === null || (Array.isArray(e.examples) && e.examples.length === 0))
  )

  console.log(`focus 표현 고유 expression 수: ${all.length}`)
  console.log(`description null/empty: ${noDesc.length}개`)
  console.log(`examples null/empty: ${noEx.length}개`)
  console.log(`둘 중 하나라도 null: ${either.length}개`)

  if (either.length > 0) {
    console.log('\n--- 목록 ---')
    either.forEach(e => {
      const flags = []
      if (e.description === null || e.description === '') flags.push('desc없음')
      if (e.examples === null || (Array.isArray(e.examples) && e.examples.length === 0)) flags.push('examples없음')
      console.log(`  id=${e.id} [${flags.join(', ')}] ${e.korean}`)
    })
  }
}

main().catch(console.error)
