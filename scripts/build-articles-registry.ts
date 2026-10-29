/**
 * 전체 아티클 레지스트리 생성 — docs/articles-registry.json (2026-10-29)
 *
 * 새 글을 기획하기 전에 이 파일에서 주제 · 키워드 중복을 먼저 확인한다(docs/CONTENT_GUIDELINES.md).
 * 대상: 주제 사이트 글(app = k-patto · k-pantry · kpantry, locale en). patto(한국인 대상 영어 학습 글)는 별도 섹션이라 뺀다.
 *
 *   status   Active     공개 중(is_paused = false, 발행일 지남)
 *            Scheduled  공개 예약(is_paused = false, 발행일이 미래)
 *            Deprecated 숨김(is_paused = true) — 7~8월 초기 일괄 생성분 대부분이 여기다
 *            Planned    아직 없는 글 — 아래 PLANNED 목록(파일에서 손으로 관리)
 *   category 홈 · 목록 그룹(Phrases · Basics · Explore Korea · Food · Life) — lib/blog/sections 와 같은 분류
 *   target_keywords  DB tags(없으면 제목에서 뽑은 낱말)
 *   summary  DB description
 *
 * 실행: npx tsx scripts/build-articles-registry.ts [--active-only]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'
import { BLOG_GROUPS, groupKeyOf, TOPIC_APPS } from '../lib/blog/sections'

const OUT = path.resolve(process.cwd(), 'docs', 'articles-registry.json')
const ACTIVE_ONLY = process.argv.includes('--active-only')

type Entry = {
  id: string
  category: string
  title: string
  slug: string
  url: string | null
  target_keywords: string[]
  status: 'Active' | 'Scheduled' | 'Deprecated' | 'Planned'
  last_updated: string
  summary: string
  db_category?: string | null
}

/** 아직 없는 글 — 쓰면 DB 에 들어가 Active 로 바뀌므로 여기서 지운다 */
const PLANNED: Omit<Entry, 'url' | 'status' | 'last_updated'>[] = [
  { id: 'planned-myeongdong-street-food', category: 'Food', title: 'Myeongdong Street Food: What to Eat, Prices, and How to Order', slug: 'myeongdong-street-food-guide', target_keywords: ['myeongdong street food', 'seoul street food prices', 'myeongdong night market'], summary: 'Stall-by-stall guide to Myeongdong evening street food with price ranges and ordering phrases.' },
  // 레지스트리로 걸러 뺀 것(이미 있음): 광장시장(gwangjang-market-guide) · 편의점 추천(korean-convenience-store-combo-meals) · 카페 주문(how-to-order-at-a-korean-cafe)
  { id: 'planned-myeongdong-shopping', category: 'Life', title: 'Myeongdong Shopping Guide: K-Beauty Streets, Tax Refunds, and Money Exchange', slug: 'myeongdong-shopping-guide', target_keywords: ['myeongdong shopping', 'myeongdong money exchange', 'myeongdong cosmetics'], summary: 'Where to shop, exchange money and claim tax refunds in Myeongdong.' },
  { id: 'planned-gyeongbokgung-hanbok', category: 'Explore Korea', title: 'Gyeongbokgung in a Hanbok: Rental Shops, Free Entry, and Photo Tips', slug: 'gyeongbokgung-hanbok-rental-guide', target_keywords: ['gyeongbokgung hanbok', 'hanbok rental seoul', 'gyeongbokgung free entry hanbok'], summary: 'How hanbok rental works near Gyeongbokgung, free palace entry in hanbok, and etiquette.' },
  { id: 'planned-ikseon-dong', category: 'Life', title: 'Ikseon-dong Hanok Alley: Cafes, Photo Spots, and When to Go', slug: 'ikseon-dong-hanok-alley-guide', target_keywords: ['ikseondong', 'ikseon-dong hanok village', 'seoul hanok cafe'], summary: 'A short guide to Ikseon-dong hanok alleys, cafes and crowd-free timing.' },
]

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'how', 'what', 'why', 'your', 'you', 'is', 'it', 'with', 'on', 'at', 'vs', 'guide'])
const keywordsFromTitle = (t: string) =>
  [...new Set(t.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !STOP.has(w)))].slice(0, 5)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  type Row = { id: string; app: string; slug: string; title: string; description: string | null; tags: string[] | null; category: string | null; is_paused: boolean; published_at: string; created_at: string }
  const rows: Row[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('blog_posts')
      .select('id, app, locale, slug, title, description, tags, category, is_paused, published_at, created_at')
      .in('app', [...TOPIC_APPS]).eq('locale', 'en')
      .order('published_at', { ascending: true }).range(from, from + 999)
    if (error) throw new Error(error.message)
    rows.push(...data!)
    if (data!.length < 1000) break
  }

  const now = Date.now()
  const groupTitle = new Map<string, string>(BLOG_GROUPS.map(g => [g.key, g.title]))
  const db: Entry[] = rows.map(p => {
    const status: Entry['status'] = p.is_paused ? 'Deprecated' : new Date(p.published_at).getTime() > now ? 'Scheduled' : 'Active'
    const tags: string[] = Array.isArray(p.tags) && p.tags.length ? p.tags : keywordsFromTitle(p.title)
    return {
      id: p.id,
      // category 가 비어 있으면 사이트는 Basics 로 떨어뜨리지만(FALLBACK_SECTION), 레지스트리에서는 미분류로 드러낸다
      category: p.category ? groupTitle.get(groupKeyOf(p.app, p.category) ?? '') ?? 'Other' : 'Uncategorized',
      title: p.title,
      slug: p.slug,
      url: status === 'Deprecated' ? null : `/blog/en/${p.app}/${p.slug}`,
      target_keywords: tags,
      status,
      last_updated: (p.published_at ?? p.created_at ?? '').slice(0, 10),
      summary: p.description ?? '',
      db_category: p.category,
    }
  })

  const liveSlugs = new Set(db.filter(e => e.status !== 'Deprecated').map(e => e.slug))
  const planned: Entry[] = PLANNED
    .filter(p => !liveSlugs.has(p.slug))
    .map(p => ({ ...p, url: null, status: 'Planned', last_updated: new Date().toISOString().slice(0, 10) }))

  const ORDER = ['Phrases', 'Basics', 'Explore Korea', 'Food', 'Life', 'Other', 'Uncategorized']
  const STATUS_ORDER = ['Active', 'Scheduled', 'Planned', 'Deprecated']
  const all = [...db, ...planned]
    .filter(e => !ACTIVE_ONLY || e.status === 'Active')
    .sort((a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      ORDER.indexOf(a.category) - ORDER.indexOf(b.category) ||
      b.last_updated.localeCompare(a.last_updated))

  const counts: Record<string, Record<string, number>> = {}
  for (const e of all) { (counts[e.status] ??= {})[e.category] = (counts[e.status][e.category] ?? 0) + 1 }

  const out = {
    _readme: 'Check this list before planning a new article (docs/CONTENT_GUIDELINES.md). Rebuild: npx tsx scripts/build-articles-registry.ts',
    generated_at: new Date().toISOString(),
    counts,
    articles: all,
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`✅ ${path.relative(process.cwd(), OUT)} — ${all.length}편`)
  console.log(JSON.stringify(counts, null, 2))
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
