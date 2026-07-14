import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedPosts() {
  const locales = ['en', 'ko']

  for (const locale of locales) {
    const dir = path.join(process.cwd(), 'content/blog/patto', locale)
    if (!fs.existsSync(dir)) continue

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8')
      const { data, content } = matter(raw)

      const { error } = await supabase.from('blog_posts').upsert({
        pattern_id: null,
        locale,
        slug: data.slug,
        title: data.title,
        description: data.description,
        content,
        tags: data.tags || [],
        published_at: new Date(data.date).toISOString(),
      }, { onConflict: 'slug,locale' })

      if (error) {
        console.error(`Error inserting ${file}:`, error.message)
      } else {
        console.log(`✓ Seeded: ${locale}/${file}`)
      }
    }
  }
  console.log('Done!')
}

seedPosts()
