/** 진단용 — readThumbnail 로 글별 썸네일 소스를 집계한다. 읽기 전용. */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
import { readThumbnail } from '../lib/blog/thumbnail'
import { topicSectionKey, PATTO_TAB } from '../lib/blog/sections'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data, error } = await sb.from('blog_posts')
    .select('slug, app, category, content')
    .eq('is_paused', false).lte('published_at', new Date().toISOString())
  if (error) throw new Error(error.message)

  const counts: Record<string, number> = { youtube: 0, image: 0, none: 0 }
  const bySection: Record<string, Record<string, number>> = {}
  const imageSamples: string[] = []

  for (const p of data!) {
    const t = readThumbnail(p.content)
    const kind = t ? t.kind : 'none'
    counts[kind]++
    const sec = p.app === PATTO_TAB.app ? 'patto' : (topicSectionKey(p.app, p.category) ?? '?')
    bySection[sec] ??= { youtube: 0, image: 0, none: 0 }
    bySection[sec][kind]++
    if (t?.kind === 'image' && imageSamples.length < 5) imageSamples.push(`${p.slug}  →  ${t.src.slice(0, 78)}`)
  }

  console.log(`전체 ${data!.length}편`)
  console.log('=== 썸네일 소스 ===')
  for (const [k, v] of Object.entries(counts)) console.log(`  ${String(v).padStart(3)}  ${k}`)
  console.log('\n=== 섹션별 ===')
  for (const [sec, c] of Object.entries(bySection)) {
    console.log(`  ${sec.padEnd(9)} youtube=${String(c.youtube).padStart(2)}  image=${String(c.image).padStart(2)}  none=${String(c.none).padStart(2)}`)
  }
  console.log('\n=== 본문 이미지 샘플 ===')
  for (const s of imageSamples) console.log('  ' + s)
}
main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
