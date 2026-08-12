/**
 * kpantry-slug-fix.ts
 * 1. korean-anchovy-stock-guide (is_paused=true)  → korean-anchovy-stock-guide-old
 * 2. korean-anchovy-stock-guide-2 (is_paused=false) → korean-anchovy-stock-guide
 * is_paused 값은 건드리지 않음.
 */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  // Step 1: old paused row → -old
  const { data: r1, error: e1 } = await supabase
    .from('blog_posts')
    .update({ slug: 'korean-anchovy-stock-guide-old' })
    .eq('slug', 'korean-anchovy-stock-guide')
    .eq('is_paused', true)
    .select('id, slug, is_paused')

  if (e1) { console.error('Step 1 error:', e1); process.exit(1) }
  console.log('Step 1 — renamed old paused row:', r1)

  // Step 2: new public row → canonical slug
  const { data: r2, error: e2 } = await supabase
    .from('blog_posts')
    .update({ slug: 'korean-anchovy-stock-guide' })
    .eq('slug', 'korean-anchovy-stock-guide-2')
    .eq('is_paused', false)
    .select('id, slug, is_paused')

  if (e2) { console.error('Step 2 error:', e2); process.exit(1) }
  console.log('Step 2 — renamed new public row:', r2)

  // Verify both
  const { data: check } = await supabase
    .from('blog_posts')
    .select('id, slug, is_paused, published_at')
    .in('slug', ['korean-anchovy-stock-guide', 'korean-anchovy-stock-guide-old', 'korean-anchovy-stock-guide-2'])

  console.log('\n=== VERIFICATION ===')
  check?.forEach(r => console.log(`  slug="${r.slug}" is_paused=${r.is_paused}`))

  const conflict = check?.find(r => r.slug === 'korean-anchovy-stock-guide-2')
  if (conflict) {
    console.error('❌ OLD slug -2 still exists — rename failed')
    process.exit(1)
  }
  const canonical = check?.find(r => r.slug === 'korean-anchovy-stock-guide' && !r.is_paused)
  if (!canonical) {
    console.error('❌ canonical slug not found as public')
    process.exit(1)
  }
  console.log('\n✅ Slugs are clean.')
}

main().catch(err => { console.error(err); process.exit(1) })
