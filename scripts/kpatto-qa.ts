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

// ── 패턴 키워드 추출 (예: "~가고 싶어요" → "가고 싶어요") ─────────────────
function extractPatternKeyword(pattern: string): string {
  return pattern.replace(/^[~\s]+/, '').split('/')[0].trim()
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
      const kw = extractPatternKeyword(p.pattern)
      const found = allKorean.find(k => k.includes(kw))
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
  const patternKeywords = (patterns ?? []).map(p => extractPatternKeyword(p.pattern))
  const fixUpdates: Array<{ id: number; highlight_text: string }> = []

  for (const b of sortedBubbles) {
    const txt = b.korean ?? ''
    const matchedKws = patternKeywords.filter(kw => txt.includes(kw))
    if (!matchedKws.length) continue

    if (matchedKws.length > 1) {
      console.log(`  ⚠️  분리 필요 — "${txt.replace(/\n/g,'↵')}" (패턴 ${matchedKws.length}개: ${matchedKws.join(', ')})`)
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

  // ── CHECK 4: 말투 검수 ─────────────────────────────────────────────────
  console.log('\nCHECK 4 말투:')
  const speakerBubbles = new Map<string, string[]>()
  for (const b of sortedBubbles) {
    const sp = (b.speaker ?? 'unknown').toLowerCase()
    if (!speakerBubbles.has(sp)) speakerBubbles.set(sp, [])
    speakerBubbles.get(sp)!.push(b.korean ?? '')
  }

  for (const [sp, texts] of speakerBubbles) {
    const expected = getExpectedStyle(sp, epNum)
    if (expected === 'unknown' || expected === 'mixed') {
      console.log(`  ⚪ ${sp}: 말투 규칙 미정의`)
      continue
    }
    const violations: string[] = []
    for (const txt of texts) {
      const detected = detectSpeechStyle(txt)
      if (detected !== 'unknown' && detected !== expected) {
        violations.push(`"${txt.replace(/\n/g,'↵').substring(0,30)}" → ${detected}`)
      }
    }
    if (violations.length) {
      console.log(`  ⚠️  ${sp} (${expected} 기대):`)
      violations.forEach(v => console.log(`      ${v}`))
      warnCount++
    } else {
      console.log(`  ✅ ${sp} (EP${epNum}, ${expected}): 말투 확인`)
    }
  }

  // ── CHECK 5: 중복 패턴 감지 ───────────────────────────────────────────
  console.log('\nCHECK 5 중복 패턴:')
  if (patterns?.length) {
    const { data: prevPatterns } = await supabase
      .from('kp_patterns')
      .select('pattern, kp_episodes!inner(episode_num)')
      .lt('kp_episodes.episode_num', epNum)

    const prevKeywords = new Set(
      (prevPatterns ?? []).map((p: any) => extractPatternKeyword(p.pattern))
    )

    let dupFound = false
    for (const p of patterns) {
      const kw = extractPatternKeyword(p.pattern)
      if (prevKeywords.has(kw)) {
        // 어느 에피소드인지 찾기
        const prev = (prevPatterns ?? []).find((x: any) => extractPatternKeyword(x.pattern) === kw) as any
        const prevEp = prev?.kp_episodes?.episode_num ?? '?'
        console.log(`  ⚠️  "${p.pattern}" → EP${String(prevEp).padStart(2,'0')}에서 이미 등장`)
        warnCount++
        dupFound = true
      }
    }
    if (!dupFound) console.log('  ✅ 중복 패턴 없음')
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
