import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  author: string
  content: string
}

function getContentDir(locale: string, app: string) {
  return path.join(process.cwd(), 'content', 'blog', app, locale)
}

export async function getAllPosts(locale: string, app: string): Promise<Omit<BlogPost, 'content'>[]> {
  const dir = getContentDir(locale, app)
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
  const posts = files.map(filename => {
    const raw = fs.readFileSync(path.join(dir, filename), 'utf8')
    const { data } = matter(raw)
    return {
      slug: data.slug || filename.replace('.mdx', ''),
      title: data.title || '',
      description: data.description || '',
      date: data.date || '',
      tags: data.tags || [],
      author: data.author || 'Patto Team',
    }
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(locale: string, app: string, slug: string): Promise<BlogPost | null> {
  const dir = getContentDir(locale, app)
  if (!fs.existsSync(dir)) return null

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'))
  for (const filename of files) {
    const raw = fs.readFileSync(path.join(dir, filename), 'utf8')
    const { data, content } = matter(raw)
    const postSlug = data.slug || filename.replace('.mdx', '')
    if (postSlug === slug) {
      return {
        slug: postSlug,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        tags: data.tags || [],
        author: data.author || 'Patto Team',
        content,
      }
    }
  }
  return null
}
