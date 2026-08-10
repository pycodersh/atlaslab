import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { CATEGORIES } from '@/lib/kpatto/expressions-config'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const grammarCat = CATEGORIES.find(c => c.key === 'grammar-particles')!
  console.log('grammar-particles ids 수:', grammarCat.ids.length)

  const { data, error } = await sb
    .from('kp_expressions')
    .select('id, korean, slug')
    .in('id', grammarCat.ids)
    .order('id')

  if (error) { console.error(error); return }

  console.log('DB에 있는 grammar-particles 수:', data?.length)
  const missing = grammarCat.ids.filter(id => !(data ?? []).some(r => r.id === id))
  console.log('DB에 없는 ids:', missing.length, missing.length > 0 ? JSON.stringify(missing.slice(0,10)) : '')

  // slug 필드도 확인
  const withoutSlug = (data ?? []).filter(r => !r.slug)
  const withSlug = (data ?? []).filter(r => r.slug)
  console.log('DB slug 있음:', withSlug.length)
  console.log('DB slug 없음:', withoutSlug.length)

  // 전체 325개도 확인
  const { data: all, error: e2 } = await sb
    .from('kp_expressions')
    .select('id', { count: 'exact' })
  console.log('\n전체 kp_expressions 수:', all?.length, 'count:', e2 ? 'error' : 'ok')

  // id 범위 확인
  const { data: minmax } = await sb
    .from('kp_expressions')
    .select('id')
    .order('id', { ascending: false })
    .limit(5)
  console.log('최대 id:', minmax?.map(r => r.id))
}

main()
