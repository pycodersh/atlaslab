/**
 * apply-kpatto-line-breaks.ts
 * 말풍선에 줄바꿈 위치를 override에 자동 저장.
 *
 * 사용법:
 *   npx tsx scripts/apply-kpatto-line-breaks.ts            # EP02~100 (기본)
 *   npx tsx scripts/apply-kpatto-line-breaks.ts --ep 1     # EP01만
 *   npx tsx scripts/apply-kpatto-line-breaks.ts --ep 1-100 # EP01~100
 *   npx tsx scripts/apply-kpatto-line-breaks.ts --ep 10 --ep 11 # EP10·11만
 *
 * 규칙:
 *  - kp_bubbles.korean 원문 절대 수정 금지
 *  - 문장 부호(. ? !) 뒤 어절 경계에서 끊기 (마지막 어절 제외)
 *  - 단문(공백 제거 10자 이하) 또는 문장 부호가 중간에 없으면 제외
 *  - 기존 override의 다른 필드(위치·꼬리 등)는 그대로 유지
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import { fetchWebtoonEpisode } from '../lib/kpatto/fetch-episode'
import type { WebtoonBubble } from '../data/kpatto/webtoon-types'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ── 줄바꿈 위치 계산 ─────────────────────────────────────────────────────────
// 반환: 1-indexed 어절 위치 배열 (끊을 위치 바로 앞 어절 번호)
// null → 적용 불필요
function calcLineBreaks(korean: string): number[] | null {
  const words = korean.trim().split(/\s+/)
  if (words.length <= 1) return null // 단어 1개 이하 → 무의미

  const breaks: number[] = []
  for (let i = 0; i < words.length - 1; i++) {
    // 어절이 문장 부호로 끝나면 그 뒤를 끊는다
    if (/[.?!]$/.test(words[i])) {
      breaks.push(i + 1) // 1-indexed
    }
  }
  if (breaks.length === 0) return null

  // 공백 제거 기준 10자 이하 → 한 줄에 충분히 들어감 → 제외
  const compact = korean.replace(/\s/g, '')
  if (compact.length <= 10) return null

  return breaks
}

// ── 표본 미리보기 ─────────────────────────────────────────────────────────────
function preview(korean: string, breaks: number[]): string {
  const words = korean.split(/\s+/)
  const breakSet = new Set(breaks)
  let out = ''
  for (let i = 0; i < words.length; i++) {
    out += words[i]
    if (i < words.length - 1) out += breakSet.has(i + 1) ? ' / ' : ' '
  }
  return out
}

// ── CLI 파싱 ─────────────────────────────────────────────────────────────────
// --ep N      → 단일 화
// --ep N-M    → 범위
// --ep N --ep M → 개별 복수
// (인자 없음)  → EP02~100 기본값
function parseEpArgs(): { nums: Set<number> | null; min: number; max: number } {
  const args = process.argv.slice(2)
  const rawEps: string[] = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--ep' && args[i + 1]) rawEps.push(args[++i])
  }

  if (rawEps.length === 0) return { nums: null, min: 2, max: 100 } // 기본값

  const nums = new Set<number>()
  for (const raw of rawEps) {
    const rangeMatch = raw.match(/^(\d+)-(\d+)$/)
    if (rangeMatch) {
      const lo = parseInt(rangeMatch[1]), hi = parseInt(rangeMatch[2])
      for (let n = lo; n <= hi; n++) nums.add(n)
    } else {
      const n = parseInt(raw)
      if (!isNaN(n)) nums.add(n)
    }
  }
  const sorted = [...nums].sort((a, b) => a - b)
  return { nums, min: sorted[0], max: sorted[sorted.length - 1] }
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  const { nums: targetNums, min: epMin, max: epMax } = parseEpArgs()

  // 표본: 지정 범위 첫 화·중간·마지막 화 자동 선정 (최대 3개)
  const SAMPLE_EPS = targetNums
    ? (() => {
        const arr = [...targetNums].sort((a, b) => a - b)
        return new Set([arr[0], arr[Math.floor(arr.length / 2)], arr[arr.length - 1]])
      })()
    : new Set([2, 50, 99])

  // 에피소드 목록 조회
  let query = sb.from('kp_episodes').select('id, episode_num').order('episode_num')
  if (targetNums) {
    query = query.in('episode_num', [...targetNums]) as typeof query
  } else {
    query = query.gte('episode_num', epMin).lte('episode_num', epMax) as typeof query
  }
  const { data: episodes, error: epErr } = await query

  if (epErr || !episodes) {
    console.error('에피소드 조회 실패:', epErr)
    process.exit(1)
  }

  const rangeLabel = targetNums && targetNums.size === 1
    ? `EP${String(epMin).padStart(2, '0')}`
    : `EP${String(epMin).padStart(2, '0')}~${String(epMax).padStart(2, '0')}`
  console.log(`\n=== 말풍선 줄바꿈 자동 적용 — ${rangeLabel} (${episodes.length}화) ===\n`)
  console.log(`   EP  적용  제외`)
  console.log('─'.repeat(22))

  let totalApplied = 0
  let totalExcluded = 0
  const sampleLines: string[] = []

  for (const ep of episodes) {
    const epNum = ep.episode_num
    const epLabel = `EP${String(epNum).padStart(2, '0')}`
    const epId = `kp-ep-${String(epNum).padStart(3, '0')}`

    // fetchWebtoonEpisode로 버블 ID 포함 전체 구조 로드
    const data = await fetchWebtoonEpisode(epId, sb)
    if (!data) {
      console.log(`  ${epLabel}  (데이터 없음)`)
      continue
    }

    // 전체 버블 수집
    const allBubbles: WebtoonBubble[] = []
    for (const s of data.sections) {
      if (s.type === 'gap') allBubbles.push(...s.bubbles)
    }

    if (allBubbles.length === 0) {
      console.log(`  ${epLabel}  (말풍선 없음)`)
      continue
    }

    // 기존 override 로드
    const { data: layoutRow } = await sb
      .from('kpatto_webtoon_layouts')
      .select('overrides')
      .eq('episode_id', ep.id)
      .maybeSingle()

    const existingOverrides: Record<string, Record<string, unknown>> =
      ((layoutRow?.overrides ?? {}) as Record<string, Record<string, unknown>>)

    let applied = 0
    let excluded = 0
    const newOverrides: Record<string, Record<string, unknown>> = { ...existingOverrides }
    const epSamples: string[] = []

    for (const bubble of allBubbles) {
      const breaks = calcLineBreaks(bubble.korean)

      if (breaks === null) {
        excluded++
        continue
      }

      // 기존 override 필드 보존, lineBreaks만 추가/갱신
      const prev = newOverrides[bubble.id] ?? {}
      newOverrides[bubble.id] = { ...prev, lineBreaks: breaks }
      applied++

      if (SAMPLE_EPS.has(epNum) && epSamples.length < 4) {
        epSamples.push(`    [${bubble.id}] "${preview(bubble.korean, breaks)}"`)
      }
    }

    // DB 저장 (UPSERT) — episode_id는 "kp-ep-NNN" 문자열 사용 (kp_episodes.id는 정수)
    if (applied > 0) {
      const { error: upsertErr } = await sb
        .from('kpatto_webtoon_layouts')
        .upsert({ episode_id: epId, overrides: newOverrides }, { onConflict: 'episode_id' })

      if (upsertErr) {
        console.error(`  ${epLabel} 저장 오류: ${upsertErr.message}`)
        continue
      }
    }

    totalApplied += applied
    totalExcluded += excluded
    console.log(`  ${epLabel}  ${String(applied).padStart(4)}  ${String(excluded).padStart(4)}`)

    if (SAMPLE_EPS.has(epNum) && epSamples.length > 0) {
      sampleLines.push(`\n  ▶ ${epLabel} 표본:`)
      sampleLines.push(...epSamples)
    }
  }

  console.log('─'.repeat(20))
  console.log(`  합계  ${String(totalApplied).padStart(4)}  ${String(totalExcluded).padStart(4)}`)
  console.log(`\n전체 적용: ${totalApplied}건 / 제외(단문): ${totalExcluded}건`)

  if (sampleLines.length > 0) {
    console.log('\n=== 표본 확인 (/ = 줄바꿈 위치) ===')
    sampleLines.forEach(l => console.log(l))
  }
}

main().catch(e => { console.error(e); process.exit(1) })
