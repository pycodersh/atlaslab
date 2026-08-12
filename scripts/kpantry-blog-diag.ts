/**
 * kpantry-blog-diag.ts
 * 1. Find existing kpantry/k-pantry posts → determine correct `app` value
 * 2. List blog_posts columns (via information_schema)
 * 3. Check slug conflicts with the 10 new posts
 */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
)

const NEW_SLUGS = [
  'gochujang-vs-gochugaru-vs-doenjang',
  'gochujang-substitutes',
  'korean-soy-sauce-types',
  'korean-anchovy-stock-guide',
  'korean-pantry-first-ingredients',
  'how-to-buy-store-and-use-kimchi',
  'sesame-oil-vs-perilla-oil',
  'korean-dishes-with-kimchi-rice-and-eggs',
  'how-to-cook-korean-rice',
  'korean-namul-vegetable-side-dishes',
]

async function main() {
  // 1. All blog_posts rows that might be kpantry (any app value)
  const { data: allPosts, error: e1 } = await supabase
    .from('blog_posts')
    .select('id, app, locale, slug, title, is_paused, published_at')
    .order('published_at', { ascending: false })

  if (e1) { console.error('Query error:', e1); process.exit(1) }

  const allApps = [...new Set((allPosts || []).map(p => p.app))].sort()
  console.log('\n=== ALL DISTINCT app VALUES IN blog_posts ===')
  console.log(allApps)

  const pantryPosts = (allPosts || []).filter(p =>
    p.app.toLowerCase().includes('pantry') || p.app.toLowerCase().includes('kpantry')
  )
  console.log('\n=== EXISTING K-PANTRY POSTS ===')
  console.log(pantryPosts.length === 0
    ? '(none found)'
    : pantryPosts.map(p => `  app="${p.app}" slug="${p.slug}" is_paused=${p.is_paused}`)
  )

  // 2. Slug conflicts (all existing slugs for locale=en)
  const existingEnSlugs = new Set(
    (allPosts || [])
      .filter(p => p.locale === 'en')
      .map(p => p.slug)
  )
  console.log('\n=== SLUG CONFLICT CHECK ===')
  let hasConflict = false
  for (const s of NEW_SLUGS) {
    if (existingEnSlugs.has(s)) {
      console.log(`  CONFLICT: "${s}" already exists`)
      hasConflict = true
    } else {
      console.log(`  OK: "${s}"`)
    }
  }
  if (!hasConflict) console.log('  → no conflicts')

  // 3. Total public post count
  const publicPosts = (allPosts || []).filter(p => {
    if (p.is_paused) return false
    if (!p.published_at) return false
    return new Date(p.published_at) <= new Date()
  })
  console.log(`\n=== PUBLIC POST COUNT (currently) ===`)
  console.log(`  ${publicPosts.length} public posts`)
  const byApp = publicPosts.reduce<Record<string, number>>((acc, p) => {
    acc[p.app] = (acc[p.app] ?? 0) + 1; return acc
  }, {})
  console.log('  By app:', byApp)

  // 4. Sample a blog_post row to infer columns
  if (allPosts && allPosts.length > 0) {
    const { data: sample } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(1)
      .single()
    if (sample) {
      console.log('\n=== blog_posts COLUMNS (from sample row) ===')
      console.log(Object.keys(sample).join(', '))
    }
  }
}

main().catch(err => { console.error(err); process.exit(1) })
