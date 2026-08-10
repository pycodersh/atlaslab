/**
 * _audit_content_similarity.ts
 * 블로그 본문 유사도 전수조사
 * - 전체 1000건 대상 (발행 + 예약)
 * - 복붙 쌍·그룹 식별 (본문 Jaccard 유사도)
 * - thin content 판정
 * - 앱별·발행상태별 비율 집계
 * 실행: npx ts-node -e "require('dotenv').config({path:'.env.local'})" scripts/_audit_content_similarity.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ─── 유틸 ────────────────────────────────────────────────────────────────────

/** 단어 trigram 집합 생성 */
function shingles(text: string, k = 4): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w가-힣\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1)
  const s = new Set<string>()
  for (let i = 0; i <= words.length - k; i++)
    s.add(words.slice(i, i + k).join('·'))
  return s
}

/** Jaccard 유사도 (0~1) */
function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1
  if (a.size === 0 || b.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / (a.size + b.size - inter)
}

/** 제목을 본문에서 제거해 템플릿 탐지에 사용 */
function normalizeBody(content: string, title: string): string {
  const t = (title ?? '').trim()
  return t.length > 5
    ? content.replace(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '<<TITLE>>')
    : content
}

/** thin content 판정 */
function classifyThin(content: string): { thin: boolean; reason: string } {
  const c = (content ?? '').trim()
  if (c.length === 0) return { thin: true, reason: 'empty' }

  const words = c.split(/\s+/).length
  const sections = (c.match(/^#{1,3} /gm) ?? []).length
  const hasTemplate = /step \d+:|apply the technique|described in this post'?s title|패턴을 연습|핵심 표현을 익히|이 글의 제목에 설명된/i.test(c)
  const bodyWords = c.replace(/^#{1,3} .+$/gm, '').trim().split(/\s+/).length

  if (hasTemplate) return { thin: true, reason: 'template_fill' }
  if (words < 150)  return { thin: true, reason: `too_short(${words}w)` }
  if (sections < 2 && bodyWords < 250) return { thin: true, reason: `no_structure(${bodyWords}w)` }
  return { thin: false, reason: '' }
}

// ─── 메인 ────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date().toISOString()

  console.log('📥 전체 blog_posts 조회 중…')
  const { data: all, error } = await sb
    .from('blog_posts')
    .select('id, locale, app, slug, title, description, content, published_at')

  if (error || !all) { console.error('조회 실패:', error?.message); process.exit(1) }
  console.log(`✅ ${all.length}건 로드 완료\n`)

  const published   = all.filter(r => r.published_at != null && r.published_at <= now)
  const unpublished = all.filter(r => r.published_at == null || r.published_at >  now)

  // ─── 사전 처리: shingle 계산 ──────────────────────────────────────────────
  type PostMeta = {
    id: number; locale: string; app: string; slug: string
    title: string; published_at: string | null
    bodyLen: number; wordCount: number
    shin: Set<string>; shinNorm: Set<string>
    thin: { thin: boolean; reason: string }
  }

  console.log('🔧 shingle 계산 중…')
  const posts: PostMeta[] = all.map(r => {
    const c    = (r.content ?? '').trim()
    const norm = normalizeBody(c, r.title)
    return {
      id: r.id,
      locale: r.locale,
      app: r.app,
      slug: r.slug,
      title: r.title ?? '',
      published_at: r.published_at,
      bodyLen: c.length,
      wordCount: c.split(/\s+/).filter(Boolean).length,
      shin:     shingles(c),
      shinNorm: shingles(norm),
      thin: classifyThin(c),
    }
  })

  // ─── 1. thin content 집계 ─────────────────────────────────────────────────
  console.log('═'.repeat(72))
  console.log('1. Thin Content 집계')
  console.log('═'.repeat(72))

  const thinAll  = posts.filter(p => p.thin.thin)
  const thinPub  = thinAll.filter(p => p.published_at != null && p.published_at <= now)
  const thinSch  = thinAll.filter(p => p.published_at == null || p.published_at > now)

  console.log(`\n전체 thin: ${thinAll.length}건 / ${all.length}건 (${(thinAll.length/all.length*100).toFixed(1)}%)`)
  console.log(`  발행 thin: ${thinPub.length}건 / ${published.length}건 (${(thinPub.length/published.length*100).toFixed(1)}%)`)
  console.log(`  예약 thin: ${thinSch.length}건 / ${unpublished.length}건 (${(thinSch.length/unpublished.length*100).toFixed(1)}%)`)

  // 앱별 thin 비율
  console.log('\n앱별 thin 비율:')
  const apps = [...new Set(all.map(r => r.app))].sort()
  for (const app of apps) {
    const appPosts = posts.filter(p => p.app === app)
    const appThin  = appPosts.filter(p => p.thin.thin)
    console.log(`  ${app.padEnd(16)} ${appThin.length.toString().padStart(4)}건 / ${appPosts.length.toString().padStart(4)}건  (${(appThin.length/appPosts.length*100).toFixed(1)}%)`)
  }

  // thin 사유별
  console.log('\nthin 사유별:')
  const reasons: Record<string, number> = {}
  for (const p of thinAll) {
    const r = p.thin.reason.replace(/\(\d+.*?\)/, '')
    reasons[r] = (reasons[r] ?? 0) + 1
  }
  for (const [r, n] of Object.entries(reasons).sort((a, b) => b[1] - a[1]))
    console.log(`  ${r.padEnd(20)} ${n}건`)

  // thin 발행 예시 10건
  console.log('\n발행 thin 예시 (최대 10건):')
  for (const p of thinPub.slice(0, 10))
    console.log(`  [${p.locale}/${p.app}] "${p.title.slice(0,60)}"  → ${p.thin.reason}  (${p.wordCount}w)`)

  // ─── 2. 복붙 쌍 탐지 (앱 내, Jaccard ≥ 0.85) ─────────────────────────────
  console.log('\n' + '═'.repeat(72))
  console.log('2. 복붙 쌍·그룹 탐지  (앱 내 Jaccard ≥ 0.85, 정규화 본문 기준)')
  console.log('═'.repeat(72))

  // 앱별로 pairwise 비교 (앱 경계는 다른 상품군이라 교차 제외)
  type DupPair = {
    sim: number; simRaw: number
    a: PostMeta; b: PostMeta
  }
  const dupPairs: DupPair[] = []
  const THRESHOLD = 0.85

  for (const app of apps) {
    const group = posts.filter(p => p.app === app)
    console.log(`  [${app}] ${group.length}건 pairwise 비교…`)

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i], b = group[j]
        // 정규화 본문 유사도 (제목 제거 후) — 템플릿 탐지
        const simNorm = jaccard(a.shinNorm, b.shinNorm)
        if (simNorm >= THRESHOLD) {
          const simRaw = jaccard(a.shin, b.shin)
          dupPairs.push({ sim: simNorm, simRaw, a, b })
        }
      }
    }
  }

  dupPairs.sort((a, b) => b.sim - a.sim)
  console.log(`\n복붙 쌍 총 ${dupPairs.length}건 (정규화 Jaccard ≥ ${THRESHOLD})`)

  // 통계: 고유 포스트 관여 수
  const dupIds = new Set<number>()
  for (const { a, b } of dupPairs) { dupIds.add(a.id); dupIds.add(b.id) }
  console.log(`복붙에 관여된 고유 포스트: ${dupIds.size}건`)

  // 앱별 복붙 쌍 수
  console.log('\n앱별 복붙 쌍:')
  for (const app of apps) {
    const cnt = dupPairs.filter(p => p.a.app === app).length
    if (cnt > 0) console.log(`  ${app.padEnd(16)} ${cnt}쌍`)
  }

  // 발행 상태별
  const pubPub = dupPairs.filter(p => p.a.published_at != null && p.a.published_at <= now &&
                                       p.b.published_at != null && p.b.published_at <= now)
  const pubSch = dupPairs.filter(p => (p.a.published_at != null && p.a.published_at <= now) !==
                                       (p.b.published_at != null && p.b.published_at <= now))
  const schSch = dupPairs.filter(p => (p.a.published_at == null || p.a.published_at > now) &&
                                       (p.b.published_at == null || p.b.published_at > now))
  console.log(`\n발행×발행 쌍: ${pubPub.length}건  ← 이미 색인될 수 있음`)
  console.log(`발행×예약 쌍: ${pubSch.length}건`)
  console.log(`예약×예약 쌍: ${schSch.length}건`)

  // 상위 30쌍 상세
  console.log('\n상위 30쌍 상세 (Jaccard 내림차순):')
  for (const { sim, simRaw, a, b } of dupPairs.slice(0, 30)) {
    const aStatus = a.published_at != null && a.published_at <= now ? '발행' : '예약'
    const bStatus = b.published_at != null && b.published_at <= now ? '발행' : '예약'
    console.log(`  sim=${sim.toFixed(3)} (raw=${simRaw.toFixed(3)})  [${a.locale}/${a.app}/${aStatus}]`)
    console.log(`    A: "${a.title.slice(0, 70)}"`)
    console.log(`    B: "${b.title.slice(0, 70)}"`)
  }

  // ─── 3. 복붙 그룹 클러스터링 (Union-Find) ────────────────────────────────
  console.log('\n' + '═'.repeat(72))
  console.log('3. 복붙 그룹 (클러스터) — Union-Find')
  console.log('═'.repeat(72))

  const parent: Record<number, number> = {}
  function find(x: number): number {
    if (parent[x] === undefined) parent[x] = x
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }
  function union(x: number, y: number) { parent[find(x)] = find(y) }

  for (const { a, b } of dupPairs) union(a.id, b.id)

  const clusters: Map<number, PostMeta[]> = new Map()
  for (const p of posts) {
    if (!dupIds.has(p.id)) continue
    const root = find(p.id)
    if (!clusters.has(root)) clusters.set(root, [])
    clusters.get(root)!.push(p)
  }

  const clusterList = [...clusters.values()].sort((a, b) => b.length - a.length)
  console.log(`\n복붙 그룹 수: ${clusterList.length}개`)
  console.log(`그룹별 크기 분포:`)
  const sizeDist: Record<number, number> = {}
  for (const cl of clusterList) sizeDist[cl.length] = (sizeDist[cl.length] ?? 0) + 1
  for (const [size, cnt] of Object.entries(sizeDist).sort((a, b) => +b[0] - +a[0]))
    console.log(`  ${size.toString().padStart(4)}개짜리 그룹: ${cnt}개`)

  console.log('\n상위 10개 그룹 상세:')
  for (const [idx, cl] of clusterList.slice(0, 10).entries()) {
    const pubCnt = cl.filter(p => p.published_at != null && p.published_at <= now).length
    console.log(`\n  그룹 #${idx + 1}  (${cl.length}편, 발행 ${pubCnt}편)`)
    for (const p of cl) {
      const status = p.published_at != null && p.published_at <= now ? '발행' : '예약'
      console.log(`    [${p.locale}/${p.app}/${status}] "${p.title.slice(0, 70)}"`)
    }
  }

  // ─── 4. 전체 요약 ─────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(72))
  console.log('4. 전체 요약')
  console.log('═'.repeat(72))

  const totalClusterPosts = clusterList.reduce((s, cl) => s + cl.length, 0)
  const clusterPubPosts   = clusterList.reduce((s, cl) =>
    s + cl.filter(p => p.published_at != null && p.published_at <= now).length, 0)

  console.log(`
전체 포스트:     ${all.length}건  (발행 ${published.length} / 예약 ${unpublished.length})

복붙 관련:
  복붙 쌍:       ${dupPairs.length}쌍  (Jaccard ≥ ${THRESHOLD})
  복붙 그룹:     ${clusterList.length}개
  복붙 포함 글:  ${totalClusterPosts}건  (발행 ${clusterPubPosts}건)

Thin content:
  전체:          ${thinAll.length}건 (${(thinAll.length/all.length*100).toFixed(1)}%)
  발행 중 thin:  ${thinPub.length}건 (${(thinPub.length/published.length*100).toFixed(1)}%)
  예약 중 thin:  ${thinSch.length}건 (${(thinSch.length/unpublished.length*100).toFixed(1)}%)

복붙이거나 thin인 글 (중복 제거):`)

  const problematic = new Set<number>([
    ...thinAll.map(p => p.id),
    ...dupIds,
  ])
  const probPub = posts.filter(p => problematic.has(p.id) && p.published_at != null && p.published_at <= now)
  const probSch = posts.filter(p => problematic.has(p.id) && (p.published_at == null || p.published_at > now))
  console.log(`  발행 중 문제: ${probPub.length}건 / ${published.length}건 (${(probPub.length/published.length*100).toFixed(1)}%)`)
  console.log(`  예약 중 문제: ${probSch.length}건 / ${unpublished.length}건 (${(probSch.length/unpublished.length*100).toFixed(1)}%)`)
}

main().catch(e => { console.error(e); process.exit(1) })
