/**
 * Life in Korea(= category "Korean Culture") 에 있던 언어 학습 성격의 글 3편을
 * Korean basics 탭으로 옮긴다. category 컬럼만 바꾸고 나머지는 건드리지 않는다.
 *
 * "Korean basics" 라는 단일 category 값은 없다. 그 탭은 DB 의 네 값을 묶은 것이라
 * (Hangul & Pronunciation 9 / Korean Grammar 9 / Grammar 3 / Getting Started 2)
 * 글 내용에 맞는 값을 하나씩 고른다. Grammar 대신 Korean Grammar 를 쓰는 이유는
 * 둘이 사실상 같은 뜻인데 Korean Grammar 가 다수라서다.
 *
 * --apply 없이 실행하면 계획만 출력한다(기본 dry-run).
 * 실행: npx tsx scripts/move-3-posts-to-basics.ts [--apply]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import { topicSectionKey } from '../lib/blog/sections'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')

const MOVES: { slug: string; to: string; why: string }[] = [
  {
    slug: 'what-k-drama-titles-teach-you-about-korean',
    to: 'Korean Grammar',
    why: '소제목이 전부 문법 형태(의 / 에서 온 / 을까 / 하라)',
  },
  {
    slug: 'korean-vs-japanese-what-transfers',
    to: 'Korean Grammar',
    why: '두 언어의 구조·존댓말 비교',
  },
  {
    slug: 'busan-dialect-vs-seoul-korean',
    to: 'Hangul & Pronunciation',
    why: '억양과 어미 발음 차이가 본문의 축',
  },
]

async function main() {
  console.log(APPLY ? '=== 적용 모드 (--apply) ===\n' : '=== dry-run (적용하려면 --apply) ===\n')

  const planned: { slug: string; to: string }[] = []

  for (const m of MOVES) {
    const { data, error } = await sb
      .from('blog_posts')
      .select('id, slug, title, app, category')
      .eq('slug', m.slug)
      .single()
    if (error || !data) { console.error(`⛔ ${m.slug} 조회 실패 — 중단`); process.exit(1) }

    const before = data.category
    const sectionBefore = topicSectionKey(data.app, before)
    const sectionAfter = topicSectionKey(data.app, m.to)

    if (sectionAfter !== 'basics') {
      console.error(`⛔ "${m.to}" 는 basics 탭으로 가지 않는다 — 중단`)
      process.exit(1)
    }

    console.log(`── ${data.slug}`)
    console.log(`   "${data.title}"`)
    console.log(`   category: "${before}" → "${m.to}"`)
    console.log(`   섹션:     ${sectionBefore} → ${sectionAfter}`)
    console.log(`   근거:     ${m.why}\n`)

    if (before === m.to) { console.log('   ↷ 이미 적용됨 — 건너뜀\n'); continue }
    planned.push({ slug: data.slug, to: m.to })
  }

  if (!APPLY) { console.log(`dry-run 종료 — 적용 대상 ${planned.length}편`); return }

  for (const p of planned) {
    const { error } = await sb.from('blog_posts').update({ category: p.to }).eq('slug', p.slug)
    if (error) throw new Error(`${p.slug} UPDATE 실패: ${error.message}`)
    console.log(`✅ ${p.slug} → "${p.to}"`)
  }

  // 적용 후 두 섹션 글 수 확인
  const now = new Date().toISOString()
  const { data: all } = await sb
    .from('blog_posts')
    .select('app, category')
    .eq('is_paused', false)
    .lte('published_at', now)
  const count = (key: string) =>
    (all ?? []).filter(p => topicSectionKey(p.app, p.category) === key).length
  console.log(`\nLife in Korea: ${count('life')}편 / Korean basics: ${count('basics')}편`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
