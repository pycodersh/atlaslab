/**
 * K-PATTO QA 스크립트
 * 사용법:
 *   npx tsx scripts/kpatto-qa.ts --episode=11
 *   npx tsx scripts/kpatto-qa.ts --all
 *   npx tsx scripts/kpatto-qa.ts --fix --episode=11
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ── 화자별 말투 규칙 ────────────────────────────────────────────────────────
const SPEECH_RULES: Record<string, { default?: string; early?: string; late?: string; threshold?: number }> = {
  emma:      { early: 'formal', late: 'mixed', threshold: 20 },
  jisu:      { default: 'informal' },
  minjun:    { default: 'informal' },
  sophie:    { default: 'informal' },
  staff:     { default: 'formal' },
  vendor:    { default: 'formal' },
  professor: { default: 'formal' },
}

const FORMAL_ENDINGS   = ['요', '세요', '습니다', 'ㅂ니다', '주세요', '이에요', '예요', '이죠', '이었어요', '했어요', '가요', '와요', '해요', '봐요']
const INFORMAL_ENDINGS = ['야', '아', '지', '어', '봐', '해', '해?', '지?', '어?', '냐', '나?', '잖아', '인데']

function detectSpeechStyle(text: string): 'formal' | 'informal' | 'unknown' {
  const sentences = text.replace(/\n/g, ' ').split(/[.!?]/).map(s => s.trim()).filter(Boolean)
  let formalCount = 0, informalCount = 0
  for (const s of sentences) {
    if (FORMAL_ENDINGS.some(e => s.endsWith(e))) formalCount++
    else if (INFORMAL_ENDINGS.some(e => s.endsWith(e))) informalCount++
  }
  if (formalCount > informalCount) return 'formal'
  if (informalCount > formalCount) return 'informal'
  return 'unknown'
}

function getExpectedStyle(speaker: string, epNum: number): string {
  const rule = SPEECH_RULES[speaker.toLowerCase()]
  if (!rule) return 'unknown'
  if (rule.default) return rule.default
  if (rule.early && rule.late && rule.threshold) {
    return epNum < rule.threshold ? rule.early : rule.late
  }
  return 'unknown'
}

// ── 패턴 키워드 추출 (단수, 첫 변형) ───────────────────────────────────────
function extractPatternKeyword(pattern: string): string {
  return extractPatternKeywords(pattern)[0] ?? ''
}

// ── 패턴 키워드 추출 (복수 변형 지원) ──────────────────────────────────────
// "~이에요 / 예요" → ["이에요", "예요"]
// "[수량] ~ 주세요" → ["주세요"]
// "~어디예요?" → ["어디예요"]
// "~하고 싶어요" → ["하고 싶어요"]
function extractPatternKeywords(pattern: string): string[] {
  // 구조적 마커 제거: [수량], [장소] 등
  let s = pattern.replace(/\[.*?\]/g, '').trim()
  // / 로 변형 분리
  const parts = s.split('/')
  const result: string[] = []
  for (const part of parts) {
    const kw = part.trim()
      .replace(/^~+\s*/, '')  // 앞 ~ 제거
      .replace(/\?$/, '')      // 끝 ? 제거
      .trim()
    if (kw.length > 0) result.push(kw)
  }
  return result.filter(k => k.length > 0)
}

// ── 단일 에피소드 QA ────────────────────────────────────────────────────────
async function runEpisodeQA(epNum: number, fix: boolean) {
  const { data: ep } = await supabase
    .from('kp_episodes')
    .select('id, title')
    .eq('episode_num', epNum)
    .single()
  if (!ep) { console.log(`EP${String(epNum).padStart(2,'0')} — 데이터 없음 (스킵)`); return }

  const { data: patterns } = await supabase
    .from('kp_patterns')
    .select('id, code, pattern, order_num')
    .eq('episode_id', ep.id)
    .order('order_num')

  const { data: panels } = await supabase
    .from('kp_panels')
    .select('id, order_num')
    .eq('episode_id', ep.id)
    .order('order_num')

  const panelOrder = new Map<number, number>()
  panels?.forEach(p => panelOrder.set(p.id, p.order_num))

  const { data: bubbles } = await supabase
    .from('kp_bubbles')
    .select('id, panel_id, order_num, speaker, korean, highlight_text')
    .eq('episode_id', ep.id)

  // bubble 등장 순서: (panel.order_num, bubble.order_num)
  const sortedBubbles = (bubbles ?? []).sort((a, b) => {
    const pa = panelOrder.get(a.panel_id) ?? 999
    const pb = panelOrder.get(b.panel_id) ?? 999
    return pa !== pb ? pa - pb : a.order_num - b.order_num
  })

  const allKorean = sortedBubbles.map(b => b.korean ?? '')
  const fullText  = allKorean.join('\n')

  console.log(`\n${'='.repeat(44)}`)
  console.log(`EP${String(epNum).padStart(2,'0')} QA 리포트 — ${ep.title}`)
  console.log('='.repeat(44))

  let errCount = 0, warnCount = 0

  // ── CHECK 1: 패턴 커버리지 ─────────────────────────────────────────────
  console.log('\nCHECK 1 패턴 커버리지:')
  if (!patterns?.length) {
    console.log('  ⚠️  패턴 데이터 없음')
    warnCount++
  } else {
    for (const p of patterns) {
      const kws = extractPatternKeywords(p.pattern)
      const found = allKorean.find(k => kws.some(kw => k.includes(kw)))
      if (found) {
        console.log(`  ✅ ${p.pattern} — "${found.replace(/\n/g,'↵').substring(0,40)}"`)
      } else {
        console.log(`  ❌ ${p.pattern} — 대사 미등장`)
        errCount++
      }
    }
  }

  // ── CHECK 2: highlight_text ────────────────────────────────────────────
  console.log('\nCHECK 2 highlight_text:')
  // 패턴별 (첫 키워드, 전체 키워드 배열) 맵
  const patternKeywords = (patterns ?? []).map(p => extractPatternKeyword(p.pattern))
  const patternKeywordsAll = (patterns ?? []).map(p => extractPatternKeywords(p.pattern))
  const fixUpdates: Array<{ id: number; highlight_text: string }> = []

  for (const b of sortedBubbles) {
    const txt = b.korean ?? ''
    // 버블 텍스트가 어떤 패턴의 키워드를 포함하는지 확인 (다중 변형 지원)
    const matchedPatternIndices = patternKeywordsAll
      .map((kws, i) => ({ i, matched: kws.some(kw => txt.includes(kw)) }))
      .filter(x => x.matched)
      .map(x => x.i)

    if (!matchedPatternIndices.length) continue

    // 매칭된 패턴의 대표 키워드 (highlight 후보)
    const matchedKws = matchedPatternIndices.map(i => patternKeywords[i])

    if (matchedPatternIndices.length > 1) {
      console.log(`  ⚠️  분리 필요 — "${txt.replace(/\n/g,'↵')}" (패턴 ${matchedPatternIndices.length}개: ${matchedKws.join(', ')})`)
      warnCount++
    } else if (!b.highlight_text) {
      console.log(`  ❌ highlight_text NULL — "${txt.replace(/\n/g,'↵')}" (후보: ${matchedKws[0]})`)
      errCount++
      if (fix) fixUpdates.push({ id: b.id, highlight_text: matchedKws[0] })
    } else {
      console.log(`  ✅ "${txt.replace(/\n/g,'↵').substring(0,30)}" → highlight: ${b.highlight_text}`)
    }
  }

  if (fix && fixUpdates.length) {
    for (const u of fixUpdates) {
      const { error } = await supabase.from('kp_bubbles').update({ highlight_text: u.highlight_text }).eq('id', u.id)
      if (error) console.log(`  ⚠️  fix 실패 id=${u.id}: ${error.message}`)
      else console.log(`  🔧 AUTO-FIX: id=${u.id} highlight_text="${u.highlight_text}"`)
    }
  }

  // ── CHECK 3: 패턴 순서 vs 대사 등장 순서 ──────────────────────────────
  console.log('\nCHECK 3 패턴 순서:')
  if (patterns && patterns.length > 1) {
    // 각 패턴의 첫 등장 버블 index
    const appearanceOrder = patterns.map(p => {
      const kw = extractPatternKeyword(p.pattern)
      const idx = sortedBubbles.findIndex(b => (b.korean ?? '').includes(kw))
      return { pattern: p.pattern, orderNum: p.order_num, appearanceIdx: idx }
    }).filter(x => x.appearanceIdx >= 0)

    const byOrderNum   = [...appearanceOrder].sort((a,b) => a.orderNum - b.orderNum)
    const byAppearance = [...appearanceOrder].sort((a,b) => a.appearanceIdx - b.appearanceIdx)

    let orderOk = true
    for (let i = 0; i < byOrderNum.length; i++) {
      if (byOrderNum[i].pattern !== byAppearance[i].pattern) {
        orderOk = false
        break
      }
    }

    if (orderOk) {
      console.log(`  ✅ 패턴 순서 일치`)
    } else {
      console.log(`  ⚠️  패턴 순서 불일치`)
      console.log(`  현재 order_num: ${byOrderNum.map(x => extractPatternKeyword(x.pattern)).join('→')}`)
      console.log(`  대사 등장 순서: ${byAppearance.map(x => extractPatternKeyword(x.pattern)).join('→')}`)
      warnCount++
    }
  } else {
    console.log('  ✅ 단일 패턴 (순서 검사 불필요)')
  }

  // ── CHECK 4: 챌린지 검증 ─────────────────────────────────────────────────
  console.log('\nCHECK 4 챌린지 검증:')
  const { data: challenges } = await supabase
    .from('kp_challenges')
    .select('id, order_num, type, question, options, answer')
    .eq('episode_id', ep.id)
    .order('order_num')

  if (!challenges?.length) {
    console.log('  ⚠️  챌린지 데이터 없음')
    warnCount++
  } else {
    // 미래 에피소드 패턴 키워드 (이 에피소드 챌린지에 나오면 안 됨)
    const { data: futurePatterns } = await supabase
      .from('kp_patterns')
      .select('pattern, kp_episodes!inner(episode_num)')
      .gt('kp_episodes.episode_num' as any, epNum)

    const futureKeywords = new Set<string>(
      (futurePatterns ?? [])
        .map((p: any) => extractPatternKeyword(p.pattern))
        .filter(kw => !patternKeywords.includes(kw))
    )

    let challengeIssues = 0
    for (const c of challenges) {
      const answer = (c.answer as string) ?? ''
      const qPrompt = ((c.question as any)?.prompt ?? '').substring(0, 35)
      const matchedEpKws = patternKeywordsAll
      .flat()
      .filter(kw => answer.includes(kw))

      // options/blocks에서 미래 패턴 사용 여부 확인
      const allTexts: string[] = [answer]
      if (Array.isArray(c.options)) {
        allTexts.push(...(c.options as string[]))
      } else if (c.options && typeof c.options === 'object') {
        const opts = c.options as Record<string, string[]>
        Object.values(opts).forEach(arr => allTexts.push(...arr))
      }
      const futureFound = allTexts.flatMap(t =>
        [...futureKeywords].filter(kw => t.includes(kw))
      )
      const uniqueFuture = [...new Set(futureFound)]

      if (matchedEpKws.length === 0) {
        console.log(`  ❌ [${c.type}] "${qPrompt}" — 에피소드 패턴 미포함 (A: "${answer.substring(0,25)}")`)
        errCount++
        challengeIssues++
      } else if (uniqueFuture.length) {
        console.log(`  ⚠️  [${c.type}] "${qPrompt}" — 미래 패턴 사용: ${uniqueFuture.join(', ')}`)
        warnCount++
        challengeIssues++
      }
    }
    if (challengeIssues === 0) {
      console.log(`  ✅ 전체 ${challenges.length}개 챌린지 — 패턴 범위 정상`)
    }
  }

  // ── 요약 ───────────────────────────────────────────────────────────────
  console.log(`\n${'='.repeat(44)}`)
  console.log(`총 이슈: ❌ ${errCount}개 / ⚠️  ${warnCount}개`)
  console.log('='.repeat(44))
}

// ── 메인 ───────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const episodeArg = args.find(a => a.startsWith('--episode='))
  const allFlag    = args.includes('--all')
  const fixFlag    = args.includes('--fix')

  if (!episodeArg && !allFlag) {
    console.log('사용법:')
    console.log('  npx tsx scripts/kpatto-qa.ts --episode=11')
    console.log('  npx tsx scripts/kpatto-qa.ts --all')
    console.log('  npx tsx scripts/kpatto-qa.ts --fix --episode=11')
    return
  }

  if (allFlag) {
    const { data: eps } = await supabase
      .from('kp_episodes')
      .select('episode_num')
      .order('episode_num')
    for (const ep of eps ?? []) {
      await runEpisodeQA(ep.episode_num, fixFlag)
    }
  } else {
    const epNum = parseInt(episodeArg!.split('=')[1])
    await runEpisodeQA(epNum, fixFlag)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
