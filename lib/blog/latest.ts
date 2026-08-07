import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)

export type LatestPost = {
  locale: string
  app: string
  slug: string
  title: string
  published_at: string
}

export async function getLatestPosts(limit = 5): Promise<LatestPost[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('locale, app, slug, title, published_at')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as LatestPost[]
  } catch {
    return []
  }
}
