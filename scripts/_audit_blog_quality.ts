import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function similarity(a: string, b: string): number {
  const la = a.toLowerCase().trim()
  const lb = b.toLowerCase().trim()
  if (la === lb) return 1.0
  const m = la.length, n = lb.length
  if (m === 0 || n === 0) return 0
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = la[i-1] === lb[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return 1 - dp[m][n] / Math.max(m, n)
}

async function main() {
  const now = new Date().toISOString()

  const { data: all, error } = await sb
    .from('blog_posts')
    .select('id, locale, app, slug, title, description, tags, published_at, content')
  if (error || !all) { console.error('조회 실패:', error?.message); process.exit(1) }

  const published   = all.filter(r => r.published_at != null && r.published_at <= now)
  const unpublished = all.filter(r => r.published_at == null || r.published_at > now)

  console.log(`\n전체 ${all.length}건 / 발행 ${published.length}건 / 미발행 ${unpublished.length}건\n`)

  // ════════════════════════════════════════════════════════════════════
  // 1. 요약문(description) 중복
  // ════════════════════════════════════════════════════════════════════
  console.log('═'.repeat(64))
  console.log('1. 요약문(description) 중복 실태  (발행 기준)')
  console.log('═'.repeat(64))

  // 1a. 완전히 동일한 요약문
  const descMap: Record<string, { count: number; titles: string[] }> = {}
  for (const r of published) {
    const d = (r.description ?? '').trim()
    if (!d) continue
    if (!descMap[d]) descMap[d] = { count: 0, titles: [] }
    descMap[d].count++
    descMap[d].titles.push(`[${r.locale}/${r.app}] ${r.title}`)
  }
  const dupDescs = Object.entries(descMap).filter(([, v]) => v.count > 1)
    .sort((a, b) => b[1].count - a[1].count)
  console.log(`\n완전히 동일한 요약문: ${dupDescs.length}종 (중복 사용 횟수 기준 상위 표시)`)
  for (const [desc, v] of dupDescs.slice(0, 12)) {
    console.log(`  [${v.count}회] "${desc.slice(0, 90)}${desc.length > 90 ? '…' : ''}"`)
    for (const t of v.titles.slice(0, 3)) console.log(`           → ${t}`)
    if (v.titles.length > 3) console.log(`           … 외 ${v.titles.length - 3}건`)
  }

  // 1b. 3회 이상 등장하는 템플릿 문장
  const phrases: Record<string, number> = {}
  for (const r of published) {
    const parts = (r.description ?? '').split(/[.!?。]/).map((s: string) => s.trim()).filter((s: string) => s.length >= 25)
    for (const p of parts) phrases[p] = (phrases[p] ?? 0) + 1
  }
  const templates = Object.entries(phrases).filter(([, v]) => v >= 3).sort((a, b) => b[1] - a[1])
  console.log(`\n3회 이상 등장하는 템플릿 문장: ${templates.length}종`)
  for (const [phrase, cnt] of templates.slice(0, 15))
    console.log(`  [${cnt}회] "${phrase.slice(0, 95)}${phrase.length > 95 ? '…' : ''}"`)

  // 1c. 제목을 요약문에 그대로 반복
  let titleRepeatCount = 0; const titleRepeatExamples: string[] = []
  for (const r of published) {
    const t = (r.title ?? '').trim().toLowerCase()
    const d = (r.description ?? '').trim().toLowerCase()
    if (t.length > 8 && d.includes(t)) {
      titleRepeatCount++
      if (titleRepeatExamples.length < 5)
        titleRepeatExamples.push(`  "${r.title}"\n   desc: "${(r.description ?? '').slice(0, 80)}…"`)
    }
  }
  console.log(`\n제목을 요약문에 그대로 포함: ${titleRepeatCount}건`)
  for (const s of titleRepeatExamples) console.log(s)

  // ════════════════════════════════════════════════════════════════════
  // 2. 주제 중복
  // ════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(64))
  console.log('2. 주제 중복  (발행 기준)')
  console.log('═'.repeat(64))

  // 2a. 동일 태그 조합
  const tagMap: Record<string, string[]> = {}
  for (const r of published) {
    const key = (r.tags ?? []).slice().sort().join(' | ')
    if (!key) continue
    if (!tagMap[key]) tagMap[key] = []
    tagMap[key].push(`[${r.locale}/${r.app}] ${r.title}`)
  }
  const dupTags = Object.entries(tagMap).filter(([, v]) => v.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
  console.log(`\n태그 조합이 완전히 같은 그룹: ${dupTags.length}개`)
  for (const [tags, titles] of dupTags.slice(0, 20)) {
    console.log(`  [${titles.length}편] {${tags}}`)
    for (const t of titles.slice(0, 5)) console.log(`    → ${t}`)
    if (titles.length > 5) console.log(`    … 외 ${titles.length - 5}편`)
  }

  // 2b. 유사 제목 쌍 (같은 app, 유사도 ≥ 0.70)
  console.log('\n유사 제목 쌍 (같은 app 내, 유사도 ≥ 0.70):')
  const byApp: Record<string, typeof published> = {}
  for (const r of published) { if (!byApp[r.app]) byApp[r.app] = []; byApp[r.app].push(r) }
  let pairCount = 0
  for (const [app, posts] of Object.entries(byApp)) {
    for (let i = 0; i < posts.length; i++) {
      for (let j = i + 1; j < posts.length; j++) {
        const sim = similarity(posts[i].title ?? '', posts[j].title ?? '')
        if (sim >= 0.70) {
          pairCount++
          if (pairCount <= 20) {
            console.log(`  [${app}] sim=${sim.toFixed(2)}`)
            console.log(`    A[${posts[i].locale}]: "${posts[i].title}"`)
            console.log(`    B[${posts[j].locale}]: "${posts[j].title}"`)
          }
        }
      }
    }
  }
  if (pairCount === 0) console.log('  없음')
  else if (pairCount > 20) console.log(`  … 총 ${pairCount}쌍 (상위 20쌍만 표시)`)

  // ════════════════════════════════════════════════════════════════════
  // 3. 본문 표본 — k-patto 발행분 무작위 5편
  // ════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(64))
  console.log('3. 본문 표본 — k-patto 발행분 무작위 5편 (전문)')
  console.log('═'.repeat(64))

  const kpattoPub = published.filter(r => r.app === 'k-patto')
  const sample: typeof published = []
  const pool = [...kpattoPub]
  while (sample.length < 5 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length)
    sample.push(pool.splice(idx, 1)[0])
  }

  for (const r of sample) {
    const content = (r.content ?? '').trim()
    const sections = (content.match(/^#{1,3} .+$/gm) ?? []).map((s: string) => s.trim())
    console.log(`\n${'─'.repeat(64)}`)
    console.log(`[${r.locale}] "${r.title}"`)
    console.log(`slug: ${r.slug}  |  published: ${r.published_at?.slice(0,10)}`)
    console.log(`글자수: ${content.length}자  |  섹션 ${sections.length}개: ${sections.join(' > ') || '없음'}`)
    console.log(`요약: ${(r.description ?? '').slice(0, 120)}`)
    console.log(`\n[본문 전문]`)
    console.log(content)
  }

  // ════════════════════════════════════════════════════════════════════
  // 4. 미발행 658건 성격 분석
  // ════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(64))
  console.log('4. 미발행 658건 성격 분석')
  console.log('═'.repeat(64))

  const nullDate   = unpublished.filter(r => r.published_at == null)
  const futureDate = unpublished.filter(r => r.published_at != null && r.published_at > now)

  console.log(`\npublished_at = NULL  (미완성/폐기 후보): ${nullDate.length}건`)
  console.log(`published_at = 미래  (예약 발행):         ${futureDate.length}건`)

  // NULL 앱별 분포
  console.log('\n  NULL 앱별:')
  const nullByApp: Record<string, number> = {}
  for (const r of nullDate) nullByApp[r.app] = (nullByApp[r.app] ?? 0) + 1
  for (const [app, cnt] of Object.entries(nullByApp).sort((a, b) => b[1] - a[1]))
    console.log(`    ${app.padEnd(15)} ${cnt}건`)

  // 예약 발행 일정
  if (futureDate.length > 0) {
    console.log(`\n  예약 발행 일정 (가장 빠른 순):`)
    const sorted = futureDate.slice().sort((a, b) => a.published_at.localeCompare(b.published_at))
    // 날짜별 집계
    const futByDate: Record<string, number> = {}
    for (const r of sorted) {
      const d = r.published_at.slice(0, 10)
      futByDate[d] = (futByDate[d] ?? 0) + 1
    }
    for (const [date, cnt] of Object.entries(futByDate).sort((a, b) => a[0].localeCompare(b[0])).slice(0, 20))
      console.log(`    ${date}  ${cnt}건`)
    if (Object.keys(futByDate).length > 20) console.log(`    … 외 ${Object.keys(futByDate).length - 20}일`)

    // 앱별 예약 분포
    console.log(`\n  예약 발행 앱별:`)
    const futByApp: Record<string, number> = {}
    for (const r of sorted) futByApp[r.app] = (futByApp[r.app] ?? 0) + 1
    for (const [app, cnt] of Object.entries(futByApp).sort((a, b) => b[1] - a[1]))
      console.log(`    ${app.padEnd(15)} ${cnt}건`)

    // 가장 가까운 예약 3건
    console.log(`\n  가장 빠른 예약 발행 3건:`)
    for (const r of sorted.slice(0, 3))
      console.log(`    ${r.published_at.slice(0,16)}  [${r.locale}/${r.app}] "${(r.title ?? '').slice(0,60)}"`)
  }

  // NULL 건 — 본문 있는지 없는지
  const nullWithContent    = nullDate.filter(r => (r.content ?? '').trim().length > 100)
  const nullWithoutContent = nullDate.filter(r => (r.content ?? '').trim().length <= 100)
  console.log(`\n  NULL 건 내용 여부:`)
  console.log(`    본문 있음(>100자): ${nullWithContent.length}건  → 완성됐으나 published_at 미설정 (폐기? 실수?)`)
  console.log(`    본문 없음(≤100자): ${nullWithoutContent.length}건  → 미완성 초안`)
}

main().catch(e => { console.error(e); process.exit(1) })
