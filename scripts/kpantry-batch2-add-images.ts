/**
 * 지역 음식 batch2 5편 content 에 이미지 9장을 삽입한다.
 * content 외 컬럼은 건드리지 않는다.
 *
 * 삽입 위치: 지정 heading 다음의 "첫 일반 문단" 뒤.
 * heading 바로 뒤가 표(|)나 목록(-)으로 시작하는 섹션이 있어서, 그대로 넣으면
 * 표가 깨진다. 그래서 블록 단위로 훑어 표/목록/인용을 건너뛰고 첫 문단을 찾는다.
 * 다음 heading 을 만나면 그 섹션에는 문단이 없다는 뜻이라 중단하고 보고한다.
 *
 * --apply 없이 실행하면 계획만 출력한다(기본 dry-run).
 * 실행: npx tsx scripts/kpantry-batch2-add-images.ts [--apply]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const APPLY = process.argv.includes('--apply')
const BASE =
  'https://eecvvgkihtcgfikaimao.supabase.co/storage/v1/object/public/pantry-recipe-images'

/** heading 대신 쓰는 표식 — 첫 h2 앞의 도입 문단 뒤에 넣는다 */
const INTRO = '__INTRO__'

type Ins = { heading: string; file: string; alt: string }

const PLAN: Record<string, Ins[]> = {
  'kimchi-differs-by-region': [
    { heading: '## The north-south split', file: 'kimchi-regional-01.jpg', alt: 'Regional Kimchi' },
    { heading: '## Salted seafood is the deciding ingredient', file: 'jeotgal-varieties-02.jpg', alt: 'Jeotgal Varieties' },
  ],
  'mackerel-jorim-vs-galchi-jorim': [
    { heading: '## Two fish, two problems to solve', file: 'godeungeo-jorim-01.jpg', alt: 'Braised Mackerel' },
    { heading: '## Hairtail: delicate, and it will fall apart', file: 'galchi-jorim-02.jpg', alt: 'Braised Hairtail' },
  ],
  'gyeongju-ssambap-what-is-it': [
    { heading: '## Why so many plates', file: 'gyeongju-ssambap-01.jpg', alt: 'Gyeongju Ssambap' },
    { heading: '## The order of operations', file: 'ssam-wrapping-02.jpg', alt: 'Wrapping Ssam' },
  ],
  'sundae-differs-by-region': [
    { heading: '## What sundae is', file: 'sundae-plate-01.jpg', alt: 'Korean Sundae' },
    { heading: '## The dipping map', file: 'sundae-dipping-02.jpg', alt: 'Sundae Dipping Sauces' },
  ],
  'regional-korean-food-map': [
    // "## The map" 섹션은 표만 있고 일반 문단이 없어서 heading 기준으로는 넣을 수 없다.
    // 첫 h2 앞의 도입 문단 뒤에 넣는다.
    { heading: INTRO, file: 'korean-regional-table-01.jpg', alt: 'Korean Regional Dishes' },
  ],
}

/** 문단(일반 텍스트 블록)인가 — 표/목록/인용/heading/구분선은 제외 */
function isParagraph(block: string): boolean {
  const t = block.trim()
  if (!t) return false
  if (t.startsWith('|')) return false            // 표
  if (t.startsWith('#')) return false            // heading
  if (t.startsWith('>')) return false            // 인용
  if (t.startsWith('---')) return false          // 구분선
  if (t.startsWith('!['))  return false          // 이미지(이미 있는 것)
  if (/^[-*+]\s/.test(t)) return false           // 불릿
  if (/^\d+\.\s/.test(t)) return false           // 번호 목록
  return true
}

/**
 * heading 다음 첫 문단 블록의 끝 인덱스를 찾는다.
 * 못 찾으면 null.
 */
function findInsertPoint(content: string, heading: string): { index: number; skipped: string[] } | null {
  let afterHeading: number

  if (heading === INTRO) {
    // 도입부 — 글 맨 앞에서 시작해 첫 문단을 찾는다(첫 h2 를 만나면 중단).
    afterHeading = -1
  } else {
    const hIdx = content.indexOf(heading)
    if (hIdx === -1) return null
    // heading 줄 끝부터 시작
    afterHeading = content.indexOf('\n', hIdx)
    if (afterHeading === -1) return null
  }

  const rest = content.slice(afterHeading + 1)
  const blocks = rest.split(/\n\s*\n/)

  const skipped: string[] = []
  let cursor = afterHeading + 1

  for (const block of blocks) {
    const blockStart = content.indexOf(block, cursor)
    if (blockStart === -1) return null
    const blockEnd = blockStart + block.length

    const t = block.trim()
    if (t.startsWith('#')) return null            // 문단 없이 다음 heading — 중단

    if (isParagraph(block)) return { index: blockEnd, skipped }

    if (t) skipped.push(t.startsWith('|') ? '표' : /^[-*+]\s|^\d+\.\s/.test(t) ? '목록' : '기타')
    cursor = blockEnd
  }
  return null
}

async function main() {
  console.log(APPLY ? '=== 適用 모드 (--apply) ===\n' : '=== dry-run (적용하려면 --apply) ===\n')

  const updates: { slug: string; content: string; before: number; imgs: number }[] = []
  const skipped: { slug: string; heading: string; h2: string[] }[] = []

  for (const [slug, inserts] of Object.entries(PLAN)) {
    const { data, error } = await sb
      .from('blog_posts')
      .select('id, slug, content')
      .eq('slug', slug)
      .single()
    if (error || !data) { console.error(`⛔ ${slug} — 조회 실패`); process.exit(1) }

    let content: string = data.content ?? ''
    const before = content.length
    console.log(`── ${slug}  (${before} chars)`)

    // 한 군데라도 위치를 못 찾으면 그 글은 통째로 건너뛴다.
    // 임의 위치에 넣지 않는 게 이 작업의 핵심 제약이라, 부분 적용도 하지 않는다.
    let postFailed = false

    for (const ins of inserts) {
      const url = `${BASE}/${ins.file}`
      if (content.includes(url)) { console.log(`   ↷ 이미 있음: ${ins.file}`); continue }

      const point = findInsertPoint(content, ins.heading)
      if (!point) {
        const hasHeading = content.includes(ins.heading)
        console.error(
          `   ❌ ${ins.file} — ${hasHeading
            ? `"${ins.heading}" 은 있으나 그 섹션에 일반 문단이 없음(표/목록 뒤 바로 다음 heading)`
            : `"${ins.heading}" heading 자체를 못 찾음`}`,
        )
        postFailed = true
        continue
      }
      content =
        content.slice(0, point.index) +
        `\n\n![${ins.alt}](${url})` +
        content.slice(point.index)

      const via = point.skipped.length ? ` (${point.skipped.join('+')} 건너뜀)` : ''
      console.log(`   ✅ ${ins.file}  ← "${ins.heading}" 다음 첫 문단 뒤${via}`)
    }

    if (postFailed) {
      const h2 = (data.content ?? '').split('\n').filter((l: string) => l.startsWith('## '))
      skipped.push({ slug, heading: inserts.map(i => i.heading).join(', '), h2 })
      console.log(`   ⛔ 이 글은 건너뛴다(변경 없음)\n`)
      continue
    }

    const imgs = (content.match(/!\[/g) || []).length
    console.log(`   → ${before} → ${content.length} chars, ![ ${imgs}개\n`)
    updates.push({ slug, content, before, imgs })
  }

  if (!APPLY) {
    console.log(`dry-run 종료 — 적용 대상 ${updates.length}편, 건너뜀 ${skipped.length}편`)
  } else {
    for (const u of updates) {
      const { error } = await sb.from('blog_posts').update({ content: u.content }).eq('slug', u.slug)
      if (error) throw new Error(`${u.slug} UPDATE 실패: ${error.message}`)
      console.log(`✅ ${u.slug} 저장`)
    }
  }

  if (skipped.length) {
    console.log('\n══ 건너뛴 글 — 위치 재지정 필요 ══')
    for (const s of skipped) {
      console.log(`\n  ${s.slug}`)
      console.log(`  지정 heading: ${s.heading}`)
      console.log('  실제 h2 목록:')
      for (const h of s.h2) console.log(`    ${h}`)
    }
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
