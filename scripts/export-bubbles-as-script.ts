/**
 * kp_bubbles.korean 데이터를 kpatto_scripts_confirmed.md 형식으로 변환
 * EP01~30 대상
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

const SPEAKER_KO: Record<string, string> = {
  emma: '에마', jisu: '지수', jisoo: '지수', minjun: '민준', sophie: '소피',
  merchant: '상인', staff: '점원', doctor: '의사', pharmacist: '약사',
  professor: '교수', driver: '운전기사', stranger: '아저씨',
  students: '학생들', all: '모두', receptionist: '접수',
}
function toKoSpeaker(en: string): string {
  return SPEAKER_KO[en?.toLowerCase()] ?? en ?? '?'
}

async function main() {
  // EP01~30 에피소드 조회
  const { data: episodes } = await sb.from('kp_episodes')
    .select('id, episode_num, title')
    .gte('episode_num', 1).lte('episode_num', 30)
    .order('episode_num')

  // 씬 조회 (location_note)
  const { data: allScenes } = await sb.from('kp_scenes')
    .select('id, episode_id, scene_number, location_note')
    .order('scene_number')

  // 패널 조회 (type=panel만, gap 제외)
  const { data: allPanels } = await sb.from('kp_panels')
    .select('id, episode_id, order_num, type')
    .order('order_num')

  // 버블 조회 (korean 있는 것만)
  const rows: any[] = []
  let from = 0
  const PAGE = 1000
  while (true) {
    const { data } = await sb.from('kp_bubbles')
      .select('id, panel_id, episode_id, order_num, speaker, korean')
      .not('korean', 'is', null)
      .neq('korean', '')
      .range(from, from + PAGE - 1)
      .order('order_num')
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE) break
    from += PAGE
  }

  // kp_dialogue_expressions (삭제됐으므로 빈 결과 예상)
  const { data: dexRows } = await sb.from('kp_dialogue_expressions')
    .select('dialogue_id, expression_id, role, kp_expressions(korean)')

  // 인덱스 구성
  const scenesByEp = new Map<number, any[]>()
  for (const s of allScenes ?? []) {
    if (!scenesByEp.has(s.episode_id)) scenesByEp.set(s.episode_id, [])
    scenesByEp.get(s.episode_id)!.push(s)
  }

  // gap 패널에 버블이 연결됨 (panel 타입은 이미지 컷)
  const gapPanelsByEp = new Map<number, any[]>()
  for (const p of allPanels ?? []) {
    if (p.type !== 'gap') continue
    if (!gapPanelsByEp.has(p.episode_id)) gapPanelsByEp.set(p.episode_id, [])
    gapPanelsByEp.get(p.episode_id)!.push(p)
  }

  const bubblesByPanel = new Map<number, any[]>()
  for (const b of rows) {
    if (!bubblesByPanel.has(b.panel_id)) bubblesByPanel.set(b.panel_id, [])
    bubblesByPanel.get(b.panel_id)!.push(b)
  }

  // dex: dialogue_id는 null이므로 episode_id 기반으로는 연결 불가 → 빈 처리
  // (kp_dialogue_expressions 삭제 후라 0건)
  const focusByEp = new Map<number, string[]>()
  const exposureByEp = new Map<number, string[]>()
  // (현재 데이터 없음)

  const lines: string[] = []
  lines.push('# K-PATTO EP01~30 대본 (kp_bubbles 기반 복원)')
  lines.push('')
  lines.push('> 형식: bubble.korean + speaker 기반 복원본')
  lines.push('> Focus/Exposure Pattern: kp_dialogue_expressions 삭제로 미포함')
  lines.push('')
  lines.push('---')
  lines.push('')

  for (const ep of episodes ?? []) {
    const epNum = String(ep.episode_num).padStart(2, '0')
    const title = ep.title ?? `EP${epNum}`
    lines.push(`## EP${epNum} — ${title}`)
    lines.push('')

    const scenes = (scenesByEp.get(ep.id) ?? []).sort((a, b) => a.scene_number - b.scene_number)
    // gap 패널 순서대로 (각 gap이 하나의 컷 대사)
    const panels = (gapPanelsByEp.get(ep.id) ?? []).sort((a, b) => a.order_num - b.order_num)

    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i]
      const scene = scenes[i]
      const location = scene?.location_note ?? ''
      const cutNum = i + 1

      const bubbles = (bubblesByPanel.get(panel.id) ?? []).sort((a, b) => a.order_num - b.order_num)
      // 대사 없는 컷(빈 gap)은 헤더째 생략
      if (bubbles.length === 0) { lines.push(''); continue }

      lines.push(`**[컷${cutNum}${location ? ` — ${location}` : ''}]**`)

      if (false) {
        // unused branch
      } else {
        for (const b of bubbles) {
          const speaker = toKoSpeaker(b.speaker)
          // 개행 포함된 korean은 줄별로 분리
          const texts = (b.korean as string).split(/\r?\n/).map((t: string) => t.trim()).filter((t: string) => t)
          for (const t of texts) lines.push(`${speaker}: ${t}`)
        }
      }
      lines.push('')
    }

    const focus = focusByEp.get(ep.id) ?? []
    const exposure = exposureByEp.get(ep.id) ?? []
    lines.push(`**Focus Pattern:** ${focus.length ? focus.join(' / ') : '(미포함 — kp_dialogue_expressions 삭제됨)'}`)
    lines.push(`**Exposure Pattern:** ${exposure.length ? exposure.join(' / ') : '(미포함 — kp_dialogue_expressions 삭제됨)'}`)
    lines.push('')
    lines.push('---')
    lines.push('')
  }

  const outPath = 'C:/Users/msj15/Downloads/kpatto_scripts_ep01_30_from_bubbles.md'
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8')
  console.log(`저장 완료: ${outPath}`)
  console.log(`총 ${lines.length}줄`)
}

main().catch(console.error)
