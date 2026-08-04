/**
 * EP01~30 kp_dialogues 재구축
 * kp_bubbles.korean + speaker 데이터 → kp_dialogues INSERT
 * episode_num + order_num 기준
 * - gap 패널 순서 = 컷 순서 → kp_scenes.scene_number 매칭
 * - bubble.speaker(EN) → kp_dialogues.speaker 그대로 사용
 * - 멀티라인 korean은 줄마다 별도 dialogue row
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

async function main() {
  // EP01~30 에피소드
  const { data: episodes } = await sb.from('kp_episodes')
    .select('id, episode_num').gte('episode_num', 1).lte('episode_num', 30).order('episode_num')
  if (!episodes?.length) { console.error('에피소드 없음'); return }
  console.log(`에피소드: ${episodes.length}개`)

  const epIds = episodes.map((e: any) => e.id as number)

  // kp_scenes (EP01~30)
  const { data: allScenes } = await sb.from('kp_scenes')
    .select('id, episode_id, scene_number')
    .in('episode_id', epIds).order('scene_number')

  // kp_panels (EP01~30, gap 타입만)
  const { data: gapPanels } = await sb.from('kp_panels')
    .select('id, episode_id, order_num, type')
    .in('episode_id', epIds).eq('type', 'gap').order('order_num')

  // kp_bubbles (EP01~30, korean 있는 것)
  const bubbleRows: any[] = []
  let from = 0
  while (true) {
    const { data } = await sb.from('kp_bubbles')
      .select('id, panel_id, episode_id, order_num, speaker, korean')
      .in('episode_id', epIds).not('korean', 'is', null).neq('korean', '')
      .range(from, from + 999).order('order_num')
    if (!data?.length) break
    bubbleRows.push(...data)
    if (data.length < 1000) break
    from += 1000
  }
  console.log(`gap 패널: ${gapPanels?.length}개, 버블: ${bubbleRows.length}건`)

  // 인덱스 구성
  const sceneByEpAndNum = new Map<string, number>() // `${epId}_${sceneNum}` → scene.id
  for (const s of allScenes ?? []) {
    sceneByEpAndNum.set(`${s.episode_id}_${s.scene_number}`, s.id)
  }

  const gapsByEp = new Map<number, any[]>()
  for (const p of gapPanels ?? []) {
    if (!gapsByEp.has(p.episode_id)) gapsByEp.set(p.episode_id, [])
    gapsByEp.get(p.episode_id)!.push(p)
  }

  const bubblesByPanel = new Map<number, any[]>()
  for (const b of bubbleRows) {
    if (!bubblesByPanel.has(b.panel_id)) bubblesByPanel.set(b.panel_id, [])
    bubblesByPanel.get(b.panel_id)!.push(b)
  }

  // INSERT kp_dialogues
  let dialInserted = 0, dialFailed = 0
  const toInsert: any[] = []

  for (const ep of episodes as any[]) {
    const epId = ep.id as number
    const gaps = (gapsByEp.get(epId) ?? []).sort((a: any, b: any) => a.order_num - b.order_num)

    for (let i = 0; i < gaps.length; i++) {
      const panel = gaps[i]
      const sceneNum = i + 1
      const sceneId = sceneByEpAndNum.get(`${epId}_${sceneNum}`)
      if (!sceneId) {
        console.warn(`  EP${ep.episode_num} 컷${sceneNum}: scene 없음 건너뜀`)
        continue
      }

      const bubbles = (bubblesByPanel.get(panel.id) ?? []).sort((a: any, b: any) => a.order_num - b.order_num)
      let orderNum = 1
      for (const b of bubbles) {
        const lines = (b.korean as string).split(/\r?\n/).map((t: string) => t.trim()).filter((t: string) => t)
        for (const line of lines) {
          toInsert.push({
            episode_id: epId,
            scene_id: sceneId,
            speaker: b.speaker ?? 'unknown',
            text_ko: line,
            order_num: orderNum++,
          })
        }
      }
    }
  }

  console.log(`\nINSERT 준비: ${toInsert.length}건`)

  const BATCH = 100
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await sb.from('kp_dialogues').insert(batch)
    if (error) {
      console.error(`  배치 ${i}~${i+batch.length-1} 실패:`, error.message)
      for (const row of batch) {
        const { error: e2 } = await sb.from('kp_dialogues').insert(row)
        if (e2) { console.error(`    [FAIL] ep${row.episode_id} scene${row.scene_id} order${row.order_num}:`, e2.message); dialFailed++ }
        else dialInserted++
      }
    } else {
      dialInserted += batch.length
    }
  }

  // 최종 집계
  const { count: scTotal } = await sb.from('kp_dialogues').select('*', { count: 'exact', head: true }).in('episode_id', epIds)
  console.log('\n══════════════════════════════════════════')
  console.log(`kp_dialogues (EP01~30) INSERT: ${dialInserted}건 성공, ${dialFailed}건 실패`)
  console.log(`kp_dialogues (EP01~30) 총: ${scTotal}건`)
  console.log('══════════════════════════════════════════')
}

main().catch(console.error)
