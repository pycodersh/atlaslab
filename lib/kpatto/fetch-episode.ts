import { createClient } from '@/lib/supabase/client'
import type { KPattoPattern, KPattoExpression } from '@/data/kpatto/types'
import type {
  WebtoonEpisodeData,
  WebtoonSection,
  WebtoonBubble,
  BubbleTailData,
} from '@/data/kpatto/webtoon-types'
import type { Question, TranslationQuestion, FillBlankQuestion, WordOrderQuestion } from '@/components/kpatto/ChallengeSection'

export async function fetchWebtoonEpisode(episodeId: string): Promise<WebtoonEpisodeData | null> {
  const match = episodeId.match(/kp-ep-(\d+)/)
  if (!match) return null

  const supabase = createClient()

  const { data: ep } = await supabase
    .from('kp_episodes')
    .select('id, episode_num, title, theme')
    .eq('episode_num', parseInt(match[1]))
    .single()
  if (!ep) return null

  const [{ data: panels }, { data: bubbles }] = await Promise.all([
    supabase
      .from('kp_panels')
      .select('id, order_num, type, image_url, layout, height_ratio')
      .eq('episode_id', ep.id)
      .order('order_num'),
    supabase
      .from('kp_bubbles')
      .select('panel_id, order_num, speaker, korean, translations, position, tail, dialogue_id, audio_url, highlight_text, expression_id')
      .eq('episode_id', ep.id)
      .order('order_num'),
  ])
  if (!panels) return null

  type DBBubble = {
    panel_id: number
    order_num: number
    speaker: string
    korean: string
    translations: Record<string, string> | null
    position: Record<string, unknown> | null
    tail: BubbleTailData | null
    dialogue_id: number | null
    audio_url: string | null
    highlight_text: string | null
    expression_id: number | null
  }

  const bubbleList = (bubbles ?? []) as DBBubble[]

  // kp_dialogues is the single source of truth for dialogue text.
  // Fetch text_ko for all linked bubbles; fall back to kp_bubbles.korean for unlinked ones (dialogue_id = null).
  const dialogueIds = [...new Set(bubbleList.filter(b => b.dialogue_id != null).map(b => b.dialogue_id as number))]
  const dialogueTextMap = new Map<number, string>()     // dialogue_id → text_ko
  const dialogueExpressionMap = new Map<number, number>() // dialogue_id → expression_id
  const highlightMap = new Map<number, string>()           // dialogue_id → matched_text (for orange text)
  if (dialogueIds.length > 0) {
    const [{ data: dialogueRows }, { data: focusMappings }] = await Promise.all([
      supabase.from('kp_dialogues').select('id, text_ko').in('id', dialogueIds),
      supabase.from('kp_dialogue_expressions').select('dialogue_id, matched_text, expression_id').in('dialogue_id', dialogueIds).eq('role', 'focus'),
    ])
    for (const d of (dialogueRows ?? [])) {
      if (d.text_ko != null) dialogueTextMap.set(d.id as number, d.text_ko as string)
    }
    for (const m of (focusMappings ?? [])) {
      if (m.expression_id != null) dialogueExpressionMap.set(m.dialogue_id as number, m.expression_id as number)
      if (m.matched_text != null) highlightMap.set(m.dialogue_id as number, m.matched_text as string)
    }
  }

  const byPanel = new Map<number, DBBubble[]>()
  for (const b of bubbleList) {
    if (!byPanel.has(b.panel_id)) byPanel.set(b.panel_id, [])
    byPanel.get(b.panel_id)!.push(b)
  }

  type DBPanel = {
    id: number; order_num: number; type: string
    image_url: string | null; layout: string | null; height_ratio: number | null
  }
  const panelList = (panels ?? []) as DBPanel[]
  const hasGaps = panelList.some(p => p.type === 'gap')

  let gapCount = 0
  let panelCount = 0

  const mapBubble = (b: DBBubble, id: string): WebtoonBubble => ({
    id,
    bubbleKey:      (b.position?.bubbleKey as string) ?? 'bubble-oval',
    xPct:           (b.position?.xPct     as number) ?? 0,
    yPct:           (b.position?.yPct     as number) ?? 0,
    widthPct:       (b.position?.widthPct as number) ?? 50,
    korean:         (b.dialogue_id != null ? dialogueTextMap.get(b.dialogue_id) : undefined) ?? b.korean,
    translation:    b.translations?.en ?? '',
    speaker:        b.speaker,
    lines:          ((b.position?.lines as 1 | 2 | 3) ?? 1),
    tail:           b.tail ?? { anchor: 0.25, tipX: 0.5, tipY: 1.1, baseWidth: 0.12 },
    highlight_text: (b.dialogue_id != null ? highlightMap.get(b.dialogue_id) : undefined) ?? b.highlight_text ?? undefined,
    expression_id:  (b.dialogue_id != null ? dialogueExpressionMap.get(b.dialogue_id) : undefined) ?? b.expression_id ?? undefined,
    audio_url:      b.audio_url ?? undefined,
  })

  let sections: WebtoonSection[]

  if (hasGaps) {
    // Detect whether any gap shares an order_num with a panel (EP31+ pipeline issue).
    // EP01-30: gaps have unique order_nums after their panels → simple map works.
    // EP31-100: gaps share order_nums with panels → need row-grouping to fix ordering.
    const gapOrderSet = new Set(panelList.filter(p => p.type === 'gap').map(p => p.order_num))
    const hasOrderConflict = panelList.some(p => p.type === 'panel' && gapOrderSet.has(p.order_num))

    if (hasOrderConflict) {
      // EP31-100 path: group image panels into visual rows, then match each row to
      // the gap whose order_num exactly matches the row's last panel order_num.
      // Gap is placed BEFORE its row (dialogue-before-scene, same as EP01-30 pattern).
      // This keeps split pairs consecutive and prevents gaps from appearing mid-row.
      const imgPanels = panelList.filter(p => p.type === 'panel') as DBPanel[]
      const sortedGapRows = [...panelList.filter(p => p.type === 'gap')].sort((a, b) => a.order_num - b.order_num) as DBPanel[]

      const rowsL: DBPanel[][] = []
      let curL: DBPanel[] = [], wSumL = 0
      for (const p of imgPanels) {
        const lay = (p.layout ?? 'wide') as string
        if (lay === 'wide') {
          if (curL.length) { rowsL.push(curL); curL = []; wSumL = 0 }
          rowsL.push([p])
        } else if (lay.startsWith('split:')) {
          curL.push(p); wSumL += parseFloat(lay.slice(6))
          if (wSumL >= 99) { rowsL.push(curL); curL = []; wSumL = 0 }
        } else if (lay.startsWith('stack-t:')) {
          curL.push(p); wSumL += parseFloat(lay.slice(8))
        } else if (lay === 'stack-b') {
          curL.push(p); rowsL.push(curL); curL = []; wSumL = 0
        }
      }
      if (curL.length) rowsL.push(curL)

      const gapQ = [...sortedGapRows]
      sections = []

      for (const row of rowsL) {
        const lastOrd = row[row.length - 1].order_num
        // First gap at order_num >= last panel of this row
        const gi = gapQ.findIndex(g => g.order_num >= lastOrd)
        if (gi >= 0) {
          const [gRow] = gapQ.splice(gi, 1)
          const bs = (byPanel.get(gRow.id) ?? []).sort((a, b) => a.order_num - b.order_num)
          const gapId = `gap-${gapCount++}`
          // Gap goes BEFORE the row's panels (dialogue-before-scene pattern)
          sections.push({
            type: 'gap' as const, id: gapId,
            heightRatio: gRow.height_ratio ?? 0.88,
            bubbles: bs.map((b, i) => mapBubble(b, `b-${gapId}-${i + 1}`)),
          })
        }
        for (const rp of row) {
          panelCount++
          sections.push({ type: 'panel' as const, id: `cut-${panelCount}`, imageUrl: rp.image_url ?? '', layout: (rp.layout ?? 'wide') as string })
        }
      }

      // Remaining gaps (trailing closing dialogue): appended at episode bottom.
      for (const gRow of gapQ) {
        const bs = (byPanel.get(gRow.id) ?? []).sort((a, b) => a.order_num - b.order_num)
        const gapId = `gap-${gapCount++}`
        sections.push({
          type: 'gap' as const, id: gapId,
          heightRatio: gRow.height_ratio ?? 0.88,
          bubbles: bs.map((b, i) => mapBubble(b, `b-${gapId}-${i + 1}`)),
        })
      }
    } else {
      // EP01-30 path: gap order_nums are sequential and unique; simple map preserves order.
      sections = panelList.map(p => {
        if (p.type === 'gap') {
          return {
            type: 'gap' as const,
            id: `gap-${gapCount++}`,
            heightRatio: p.height_ratio ?? 0.88,
            bubbles: (byPanel.get(p.id) ?? []).map((b, i) => mapBubble(b, `b-${p.order_num}-${i + 1}`)),
          }
        } else if (p.type === 'panel') {
          panelCount++
          return { type: 'panel' as const, id: `cut-${panelCount}`, imageUrl: p.image_url ?? '', layout: (p.layout ?? 'wide') as string }
        } else {
          return { type: 'crop-panel' as const, id: `crop-${p.order_num}`, imageUrl: p.image_url ?? '', srcW: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 }
        }
      })
    }
  } else {
    // New style (EP31+): image panels only; generate gap sections dynamically.
    // Group consecutive panels into visual rows using layout-width accumulation:
    //   wide      → 1-panel row
    //   split:X   → accumulate; end row when sum ≥ 99%
    //   stack-t:X → accumulate; don't end (stack-b follows)
    //   stack-b   → end row
    const rows: DBPanel[][] = []
    let cur: DBPanel[] = [], wSum = 0
    for (const p of panelList) {
      const lay = (p.layout ?? 'wide') as string
      if (lay === 'wide') {
        if (cur.length) { rows.push(cur); cur = []; wSum = 0 }
        rows.push([p])
      } else if (lay.startsWith('split:')) {
        cur.push(p); wSum += parseFloat(lay.slice(6))
        if (wSum >= 99) { rows.push(cur); cur = []; wSum = 0 }
      } else if (lay.startsWith('stack-t:')) {
        cur.push(p); wSum += parseFloat(lay.slice(8))
      } else if (lay === 'stack-b') {
        cur.push(p); rows.push(cur); cur = []; wSum = 0
      }
    }
    if (cur.length) rows.push(cur)

    sections = []
    sections.push({ type: 'gap' as const, id: `gap-${gapCount++}`, heightRatio: 0.55, bubbles: [] })

    for (const row of rows) {
      for (const rp of row) {
        panelCount++
        const lay = (rp.layout ?? 'wide') as string
        sections.push({ type: 'panel' as const, id: `cut-${panelCount}`, imageUrl: rp.image_url ?? '', layout: lay })

        const panelBubbles = (byPanel.get(rp.id) ?? []).sort((a, b) => a.order_num - b.order_num)
        const isWide = lay === 'wide'
        const gapId = `gap-${gapCount++}`
        sections.push({
          type: 'gap' as const,
          id: gapId,
          heightRatio: isWide ? 200 / 430 : 160 / 430,
          fixedHeightPx: isWide ? 200 : 160,
          bubbles: panelBubbles.map((b, i) => mapBubble(b, `b-${gapId}-${i + 1}`)),
        })
      }
    }
  }

  return {
    id: episodeId,
    episode: ep.episode_num,
    title: ep.title,
    theme: ep.theme ?? '',
    sections,
  }
}

export async function fetchEpisodePatterns(episodeId: string): Promise<KPattoPattern[]> {
  const match = episodeId.match(/kp-ep-(\d+)/)
  if (!match) return []

  const supabase = createClient()
  const { data: ep } = await supabase
    .from('kp_episodes')
    .select('id')
    .eq('episode_num', parseInt(match[1]))
    .single()
  if (!ep) return []

  const { data, error } = await supabase
    .from('kp_patterns')
    .select('code, pattern, structure, examples, level')
    .eq('episode_id', ep.id)
    .order('order_num')
  if (error) throw error

  return (data ?? []).map(row => ({
    id: row.code as string,
    korean: row.pattern as string,
    structure: (row.structure ?? '') as string,
    translations: {},
    examples: (row.examples ?? []) as KPattoPattern['examples'],
    level: (row.level ?? 'beginner') as KPattoPattern['level'],
  }))
}

export async function fetchExpression(expressionId: number): Promise<KPattoExpression | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kp_expressions')
    .select('*')
    .eq('id', expressionId)
    .single()
  if (error) return null
  return data as KPattoExpression
}

export async function fetchAllExpressions(): Promise<KPattoExpression[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kp_expressions')
    .select('*')
    .order('first_episode', { ascending: true })
  if (error) return []
  return (data ?? []) as KPattoExpression[]
}

type NewDBChallenge = {
  id: number
  type: string
  slot: string
  round_no: number
  question: string
  hint: string | null
  answer: string
  options: string[] | null
  tokens: string[] | null
  variant: string | null
}

/** Returns 5 challenges for the current round (MC×2, FB×2, SB×1).
 *  Round is read from kp_challenge_progress; defaults to 1 when no record exists. */
export async function fetchEpisodeChallenges(episodeId: string): Promise<Question[]> {
  const match = episodeId.match(/kp-ep-(\d+)/)
  if (!match) return []
  const epNo = parseInt(match[1])

  const supabase = createClient()

  let roundNo = 1
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: progress } = await supabase
      .from('kp_challenge_progress')
      .select('round_no')
      .eq('user_id', user.id)
      .eq('ep_no', epNo)
      .maybeSingle()
    if (progress) roundNo = progress.round_no
  }

  const { data: rows } = await supabase
    .from('kp_challenges')
    .select('id, type, slot, round_no, question, hint, answer, options, tokens, variant')
    .eq('ep_no', epNo)
    .eq('round_no', roundNo)
    .order('slot')
  if (!rows || rows.length === 0) return []

  // Render order: multiple_choice → fill_blank → sentence_build
  const typeOrder: Record<string, number> = { multiple_choice: 0, fill_blank: 1, sentence_build: 2 }
  const sorted = [...rows].sort((a, b) => {
    const ca = a as NewDBChallenge
    const cb = b as NewDBChallenge
    const ta = typeOrder[ca.type] ?? 3
    const tb = typeOrder[cb.type] ?? 3
    return ta !== tb ? ta - tb : ca.slot.localeCompare(cb.slot)
  })

  return (sorted as NewDBChallenge[]).map((c): Question => {
    if (c.type === 'multiple_choice') {
      const opts = c.options ?? []
      const correctIdx = opts.indexOf(c.answer)
      const q: TranslationQuestion = {
        type: 'translation',
        prompt: c.question,
        choices: opts,
        correctIdx: correctIdx >= 0 ? correctIdx : 0,
      }
      return q
    } else if (c.type === 'fill_blank') {
      const opts = c.options ?? []
      const correctIdx = opts.indexOf(c.answer)
      const q: FillBlankQuestion = {
        type: 'fill_blank',
        prompt: c.question,
        choices: opts,
        correctIdx: correctIdx >= 0 ? correctIdx : 0,
        ...(c.hint ? { hint_en: c.hint } : {}),
      }
      return q
    } else {
      const q: WordOrderQuestion = {
        type: 'word_order',
        prompt: c.question,
        pieces: c.tokens ?? [],
        answer: c.answer.split(' '),
      }
      return q
    }
  })
}

/** Advances kp_challenge_progress to the next round after completing current round. */
export async function advanceEpisodeRound(episodeId: string): Promise<void> {
  const match = episodeId.match(/kp-ep-(\d+)/)
  if (!match) return
  const epNo = parseInt(match[1])

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: progress } = await supabase
    .from('kp_challenge_progress')
    .select('round_no')
    .eq('user_id', user.id)
    .eq('ep_no', epNo)
    .maybeSingle()

  const nextRound = ((progress?.round_no ?? 1) % 3) + 1

  await supabase
    .from('kp_challenge_progress')
    .upsert(
      { user_id: user.id, ep_no: epNo, round_no: nextRound, cleared_at: new Date().toISOString() },
      { onConflict: 'user_id,ep_no' },
    )
}
