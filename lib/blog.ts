import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  tags: string[]
  author: string
  slug: string
}

export interface Post {
  frontmatter: PostFrontmatter
  content: string
}

const contentRoot = path.join(process.cwd(), 'content/blog')

export function getAllPosts(locale: string, app: string): PostFrontmatter[] {
  const dir = path.join(contentRoot, app, locale)
  if (!fs.existsSync(dir)) return []

  return fs
    .readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(filename => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf-8')
      const { data } = matter(raw)
      return data as PostFrontmatter
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(locale: string, app: string, slug: string): Post | null {
  const dir = path.join(contentRoot, app, locale)
  if (!fs.existsSync(dir)) return null

  const filename = fs.readdirSync(dir).find(f => {
    const raw = fs.readFileSync(path.join(dir, f), 'utf-8')
    const { data } = matter(raw)
    return data.slug === slug
  })

  if (!filename) return null

  const raw = fs.readFileSync(path.join(dir, filename), 'utf-8')
  const { data, content } = matter(raw)
  return { frontmatter: data as PostFrontmatter, content }
}
