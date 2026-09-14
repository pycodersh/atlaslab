/**
 * 진단용 — 공용 상수(lib/blog/sections)로 탭별 글 수를 계산하고,
 * 실제 /blog 페이지가 같은 결과를 내는지 대조한다. 읽기 전용.
 *
 * 실행: npx tsx scripts/_verify-blog-tabs.ts [baseUrl]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import {
  BLOG_SECTIONS,
  BLOG_TABS,
  PATTO_TAB,
  postMatchesTab,
  topicSectionKey,
} from '../lib/blog/sections'

const BASE = process.argv[2] ?? 'http://localhost:3001'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const now = new Date().toISOString()
  const { data, error } = await sb
    .from('blog_posts')
    .select('slug, app, locale, category, published_at')
    .eq('is_paused', false)
    .lte('published_at', now)
    .order('published_at', { ascending: false })
  if (error) throw new Error(error.message)
  const posts = data!

  console.log(`공개 글 총합: ${posts.length}편\n`)

  // ── category 분포 ──
  const byCat = new Map<string, number>()
  for (const p of posts) byCat.set(p.category ?? '(null)', (byCat.get(p.category ?? '(null)') ?? 0) + 1)

  // 매핑에 없는 category (주제 대상 app 안에서)
  const known = new Set(BLOG_SECTIONS.flatMap(s => s.categories as readonly string[]))
  const unmapped = new Map<string, number>()
  for (const p of posts) {
    if (topicSectionKey(p.app, p.category) === null) continue
    if (!p.category || !known.has(p.category)) {
      unmapped.set(p.category ?? '(null)', (unmapped.get(p.category ?? '(null)') ?? 0) + 1)
    }
  }

  console.log('=== category 분포 ===')
  for (const [k, v] of [...byCat].sort((a, b) => b[1] - a[1])) console.log(`  ${String(v).padStart(3)}  ${k}`)

  console.log('\n=== 주제 탭 대상(k-patto/k-pantry) 중 매핑에 없는 category ===')
  if (unmapped.size === 0) console.log('  없음')
  else for (const [k, v] of unmapped) console.log(`  ${String(v).padStart(3)}  ${k}  → Korean basics 로 흡수`)

  // ── 탭별 기대치 (locale 별로) ──
  console.log('\n=== 탭별 글 수 (공용 상수 기준) ===')
  const expected: Record<string, { en: number; ko: number }> = {}
  for (const t of BLOG_TABS) {
    const en = posts.filter(p => p.locale === 'en' && postMatchesTab(p, t.key)).length
    const ko = posts.filter(p => p.locale === 'ko' && postMatchesTab(p, t.key)).length
    expected[t.key] = { en, ko }
    console.log(`  ${t.label.padEnd(20)} EN=${String(en).padStart(3)}  KO=${String(ko).padStart(3)}`)
  }

  // ── patto 글이 주제 탭에 섞였는지 ──
  const leaked = posts.filter(
    p => p.app === PATTO_TAB.app && BLOG_SECTIONS.some(s => postMatchesTab(p, s.key)),
  )
  console.log(`\n=== Patto 글이 주제 탭에 섞였는지: ${leaked.length === 0 ? '✅ 없음' : `❌ ${leaked.length}편`} ===`)

  // ── 실제 페이지와 대조 ──
  console.log(`\n=== 실제 페이지 대조 (${BASE}) ===`)
  for (const t of BLOG_TABS) {
    const isPatto = t.key === PATTO_TAB.key
    const url = t.key === 'all' ? `${BASE}/blog` : `${BASE}/blog?tab=${t.key}`
    const html = await fetch(url).then(r => r.text())

    const cards = [...html.matchAll(/href="(\/blog\/[a-z]+\/[a-z-]+\/[^"]+)"/g)].map(m => m[1])
    const apps = new Set(cards.map(h => h.split('/')[3]))
    // Patto 탭은 KO 강제, 나머지는 기본 EN
    const exp = isPatto ? expected[t.key].ko : expected[t.key].en
    const onPage = Math.min(exp, 20)
    const ok = cards.length === onPage
    console.log(
      `  ${t.label.padEnd(20)} 기대 ${String(exp).padStart(3)}편(1p ${onPage}) / 실제 ${String(cards.length).padStart(3)}  ${ok ? '✅' : '❌'}  app=${[...apps].join(',') || '-'}`,
    )
  }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
