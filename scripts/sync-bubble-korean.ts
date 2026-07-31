/**
 * kp_bubbles.korean을 kp_dialogues.text_ko와 동기화
 * dialogue_id가 연결된 모든 버블에 대해 korean = dialogue.text_ko 로 업데이트
 *
 * 실행: npx tsx scripts/sync-bubble-korean.ts          (DRY RUN)
 * 적용: npx tsx scripts/sync-bubble-korean.ts --apply
 */
import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)
const APPLY = process.argv.includes('--apply')

async function main() {
  // dialogue_id가 있는 모든 버블
  const { data: bubbles } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, speaker, korean, dialogue_id')
    .not('dialogue_id', 'is', null)
    .order('episode_id').order('id')

  if (!bubbles?.length) { console.log('연결된 버블 없음'); return }

  const dlgIds = [...new Set((bubbles as any[]).map(b => b.dialogue_id as number))]
  const { data: dlgs } = await sb.from('kp_dialogues').select('id, text_ko').in('id', dlgIds)
  const dlgMap = new Map((dlgs ?? []).map((d: any) => [d.id as number, d.text_ko as string]))

  // 에피소드 번호 미리 로드 (필터용)
  const { data: eps } = await sb.from('kp_episodes').select('id, episode_num')
  const epNumMap = new Map((eps ?? []).map((e: any) => [e.id as number, e.episode_num as number]))

  // EP06/EP08 등에서 speaker-positional로 완전히 다른 내용이 연결된 케이스가 있음
  // EP21+ 은 전체 sync (confirmed script 기준 새 내용)
  // EP01~20은 내용 유사도가 높은 경우만 sync (말투/무대지문 변경)
  function shouldSync(old_: string, new_: string, epNum: number): boolean {
    if (epNum >= 21) return true  // EP21+ 는 무조건 sync
    // 텍스트 유사도 체크: 핵심 내용이 비슷해야 sync 허용
    const normalize = (s: string) => s.replace(/^\([^)]*\)\s*/, '').replace(/요([.!?]|$)/g, '$1').replace(/\s+/g, ' ').trim()
    const n1 = normalize(old_)
    const n2 = normalize(new_)
    // 완전히 다른 내용이면 skip (공통 단어가 적으면)
    const words1 = new Set(n1.split(/\s+/).filter(w => w.length >= 2))
    const words2 = n2.split(/\s+/).filter(w => w.length >= 2)
    if (words1.size === 0) return true
    const overlap = words2.filter(w => words1.has(w)).length
    const similarity = overlap / Math.max(words1.size, words2.length)
    return similarity >= 0.3  // 30% 이상 단어 겹쳐야 sync
  }

  const diffs: { id: number; epId: number; speaker: string; old: string; new_: string; dlgId: number }[] = []
  for (const b of (bubbles as any[])) {
    const newText = dlgMap.get(b.dialogue_id)
    if (newText && newText !== b.korean) {
      const epNum = epNumMap.get(b.episode_id) ?? 0
      if (shouldSync(b.korean, newText, epNum)) {
        diffs.push({ id: b.id, epId: b.episode_id, speaker: b.speaker, old: b.korean, new_: newText, dlgId: b.dialogue_id })
      }
    }
  }

  if (!diffs.length) { console.log('모두 동기화됨 (변경 없음)'); return }

  console.log(`\n변경 대상: ${diffs.length}건`)

  // (에피소드 번호 맵은 위에서 이미 로드됨)

  // 에피소드별 요약
  const byEp: Record<number, number> = {}
  for (const d of diffs) {
    const epNum = epNumMap.get(d.epId) ?? 0
    byEp[epNum] = (byEp[epNum] ?? 0) + 1
  }
  console.log('에피소드별:')
  for (const [ep, cnt] of Object.entries(byEp).sort((a,b) => Number(a[0])-Number(b[0]))) {
    console.log(`  EP${String(ep).padStart(2,'0')}: ${cnt}건`)
  }

  if (!APPLY) {
    console.log('\n상세 변경 (처음 20건):')
    for (const d of diffs.slice(0, 20)) {
      const epNum = epNumMap.get(d.epId) ?? '?'
      console.log(`  EP${String(epNum).padStart(2,'0')} [${d.speaker}] bubble=${d.id} dlg=${d.dlgId}`)
      console.log(`    "${d.old}"`)
      console.log(`    → "${d.new_}"`)
    }
    console.log('\n──── DRY RUN ────')
    console.log('적용: npx tsx scripts/sync-bubble-korean.ts --apply')
    return
  }

  console.log('\n──── DB 적용 ────')
  let ok = 0, fail = 0
  for (const d of diffs) {
    const { error } = await sb.from('kp_bubbles').update({ korean: d.new_ }).eq('id', d.id)
    if (error) { console.error(`❌ bubble=${d.id}: ${error.message}`); fail++ }
    else ok++
  }
  console.log(`\n완료: ✅ ${ok}건 / ❌ ${fail}건`)
}
main().catch(console.error)
