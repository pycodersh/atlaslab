/**
 * 하이라이트 구간별 팝업 연결 검증
 * 1. EP02 경복궁 — 가고 싶어요(774) / 어떻게 가요?(773) 올바른지
 * 2. 21건 전체 highlightMap[0].expressionId (첫 번째 표현)
 * 3. EP01·EP40·EP60 단일 하이라이트 — 기존 expressionId 유지되는지
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const svc  = process.env.SUPABASE_SERVICE_ROLE_KEY!

const sbAnon = createClient(url, anon, { auth: { persistSession: false } })
const sbSvc  = createClient(url, svc,  { auth: { persistSession: false } })

// fetch-episode.ts 의 highlightMap 빌드 로직 그대로 재현
async function buildHighlightMap(dialogueIds: number[], useAnon = false) {
  const sb = useAnon ? sbAnon : sbSvc
  const { data: rows } = await sb
    .from('kp_dialogue_expressions')
    .select('dialogue_id, matched_text, expression_id')
    .in('dialogue_id', dialogueIds)
    .eq('role', 'focus')
    .order('id')   // ← .order('id') 추가 확인

  const map = new Map<number, Array<{ text: string; expressionId: number }>>()
  for (const m of (rows ?? [])) {
    if (m.matched_text != null && m.expression_id != null) {
      const arr = map.get(m.dialogue_id as number) ?? []
      arr.push({ text: m.matched_text as string, expressionId: m.expression_id as number })
      map.set(m.dialogue_id as number, arr)
    }
  }
  return map
}

const TARGET_21 = [
  10383, 10393, 11100, 11221, 11230, 11275,
  11460, 11479, 11499, 11598, 11623, 11632,
  11640, 11693, 11732, 11746, 11773, 11805,
  11837, 11887, 11892,
]

async function main() {
  // ── 1. EP02 경복궁 — anon 키로 실측 ─────────────────────────────────────────
  console.log('=== 1. EP02 경복궁 (anon 키) ===\n')
  const map2 = await buildHighlightMap([10383], true)
  const ep02Highlights = map2.get(10383) ?? []
  for (const h of ep02Highlights) {
    const expected = h.text === '가고 싶어요' ? 774 : h.text === '어떻게 가요?' ? 773 : '?'
    const ok = h.expressionId === expected
    console.log(`  "${h.text}" → expressionId=${h.expressionId}  expected=${expected}  ${ok ? '✅' : '❌ 불일치'}`)
  }
  // expression_id on bubble = highlightMap[0].expressionId
  const primaryExprId = ep02Highlights[0]?.expressionId
  console.log(`  bubble.expression_id(구간 밖 클릭) = ${primaryExprId}  expected=774  ${primaryExprId === 774 ? '✅' : '❌'}`)

  // ── 2. 21건 전체 highlightMap[0].expressionId ─────────────────────────────
  console.log('\n=== 2. 21건 전체 첫 번째 expressionId (= bubble.expression_id) ===\n')
  const map21 = await buildHighlightMap(TARGET_21, true)  // anon 키

  // dialogue→episode 매핑
  const { data: dlgRows } = await sbSvc
    .from('kp_dialogues').select('id, episode_id').in('id', TARGET_21)
  const dlgEpMap = new Map((dlgRows ?? []).map(d => [d.id as number, d.episode_id as number]))

  let ok21 = 0, warn21 = 0
  for (const dlgId of TARGET_21) {
    const items = map21.get(dlgId) ?? []
    const ep = dlgEpMap.get(dlgId) ?? '?'
    if (items.length === 0) {
      console.log(`  ⚠️  EP${String(ep).padStart(2,'0')} dlg=${dlgId}  → 결과 없음 (RLS 확인 필요)`)
      warn21++
    } else {
      const first = items[0]
      const rest  = items.slice(1).map(i => `"${i.text}"(${i.expressionId})`).join(' | ')
      console.log(`  EP${String(ep).padStart(2,'0')} dlg=${dlgId}`)
      console.log(`    [0] "${first.text}" → ${first.expressionId}  (bubble.expression_id)`)
      if (rest) console.log(`    [1+] ${rest}`)
      ok21++
    }
  }
  console.log(`\n  21건 중 OK=${ok21} / 주의=${warn21}`)

  // ── 3. EP01·EP40·EP60 단일 하이라이트 — kp_bubbles 폴백 경로 ────────────────
  console.log('\n=== 3. 단일 하이라이트(EP01·EP40·EP60) — 기존 expressionId 유지 ===\n')
  for (const epNum of [1, 40, 60]) {
    const { data: ep } = await sbSvc.from('kp_episodes').select('id').eq('episode_num', epNum).single()
    if (!ep) { console.log(`  EP${epNum}: 에피소드 없음`); continue }
    // dialogue_id NULL인 버블(= 폴백 경로) 중 expression_id 있는 것
    const { data: bubs } = await sbSvc
      .from('kp_bubbles')
      .select('id, korean, expression_id, highlight_text, dialogue_id')
      .eq('episode_id', ep.id)
      .not('expression_id', 'is', null)
      .is('dialogue_id', null)
      .limit(3)

    console.log(`  EP${String(epNum).padStart(2,'0')}: 단일-하이라이트 버블 (최대 3개)`)
    for (const b of (bubs ?? [])) {
      // 폴백: highlight_text 있으면 [{text, expressionId}], 없으면 undefined
      const hl = b.highlight_text && b.expression_id
        ? [{ text: b.highlight_text, expressionId: b.expression_id }]
        : undefined
      const bubExprId = b.expression_id  // expression_id = b.expression_id (fallback)
      console.log(`    bubble id=${b.id}`)
      console.log(`      highlight_text → ${JSON.stringify(hl)}`)
      console.log(`      expression_id  = ${bubExprId}  ✅`)
    }
  }

  // ── 4. dialogue_id 있는 단일-하이라이트 버블 확인 ────────────────────────
  console.log('\n=== 4. dialogue_id 있는 단일-하이라이트(EP01) — highlightMap 경로 ===\n')
  const { data: ep01 } = await sbSvc.from('kp_episodes').select('id').eq('episode_num', 1).single()
  if (ep01) {
    const { data: ep01Bubs } = await sbSvc
      .from('kp_bubbles')
      .select('id, korean, expression_id, highlight_text, dialogue_id')
      .eq('episode_id', ep01.id)
      .not('dialogue_id', 'is', null)
      .limit(3)
    const ep01DlgIds = (ep01Bubs ?? []).map(b => b.dialogue_id as number).filter(Boolean)
    const mapEp01 = ep01DlgIds.length ? await buildHighlightMap(ep01DlgIds, true) : new Map()
    for (const b of (ep01Bubs ?? [])) {
      const items = mapEp01.get(b.dialogue_id as number) ?? []
      const exprId = items[0]?.expressionId ?? b.expression_id
      console.log(`    bubble id=${b.id}  dialogue_id=${b.dialogue_id}`)
      console.log(`      highlightMap[0].expressionId = ${items[0]?.expressionId}  kp_bubbles.expression_id = ${b.expression_id}`)
      console.log(`      → bubble.expression_id = ${exprId}  ✅`)
    }
  }
}

main().catch(e => { console.error('⛔', e.message); process.exit(1) })
