import { createClient } from '@/lib/supabase/client'
import type { KPattoPattern, KPattoExpression } from '@/data/kpatto/types'
import type {
  WebtoonEpisodeData,
  WebtoonSection,
  WebtoonBubble,
  BubbleTailData,
} from '@/data/kpatto/webtoon-types'

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
      .select('panel_id, order_num, speaker, korean, translations, position, tail, highlight_text, expression_id, dialogue_id')
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
    highlight_text: string | null
    expression_id: number | null
    dialogue_id: number | null
  }

  const bubbleList = (bubbles ?? []) as DBBubble[]

  // Fetch matched_text from focus mappings (authoritative highlight source)
  const dialogueIds = [...new Set(bubbleList.filter(b => b.dialogue_id != null).map(b => b.dialogue_id as number))]
  const focusMap = new Map<number, string>()
  if (dialogueIds.length > 0) {
    const { data: focusMappings } = await supabase
      .from('kp_dialogue_expressions')
      .select('dialogue_id, matched_text')
      .in('dialogue_id', dialogueIds)
      .eq('role', 'focus')
    for (const m of (focusMappings ?? [])) {
      focusMap.set(m.dialogue_id as number, m.matched_text as string)
    }
  }

  const byPanel = new Map<number, DBBubble[]>()
  for (const b of bubbleList) {
    if (!byPanel.has(b.panel_id)) byPanel.set(b.panel_id, [])
    byPanel.get(b.panel_id)!.push(b)
  }

  let gapCount = 0
  let panelCount = 0
  const sections: WebtoonSection[] = (panels as Array<{
    id: number
    order_num: number
    type: string
    image_url: string | null
    layout: string | null
    height_ratio: number | null
  }>).map(p => {
    if (p.type === 'gap') {
      const panelBubbles: WebtoonBubble[] = (byPanel.get(p.id) ?? []).map((b, i) => ({
        id: `b-${p.order_num}-${i + 1}`,
        bubbleKey: (b.position?.bubbleKey as string) ?? 'bubble-oval',
        xPct: (b.position?.xPct as number) ?? 0,
        yPct: (b.position?.yPct as number) ?? 0,
        widthPct: (b.position?.widthPct as number) ?? 50,
        korean: b.korean,
        translation: b.translations?.en ?? '',
        speaker: b.speaker,
        lines: ((b.position?.lines as 1 | 2 | 3) ?? 1),
        tail: b.tail ?? undefined,
        highlight_text: b.expression_id != null
          ? (b.dialogue_id != null ? focusMap.get(b.dialogue_id) : undefined) ?? b.highlight_text ?? undefined
          : undefined,
        expression_id: b.expression_id ?? undefined,
      }))
      return {
        type: 'gap' as const,
        id: `gap-${gapCount++}`,
        heightRatio: p.height_ratio ?? 0.88,
        bubbles: panelBubbles,
      }
    } else if (p.type === 'panel') {
      panelCount++
      return {
        type: 'panel' as const,
        id: `cut-${panelCount}`,
        imageUrl: p.image_url ?? '',
        layout: (p.layout ?? 'wide') as 'wide' | 'medium-right' | 'medium-left' | 'small-center' | 'small-center-l',
      }
    } else {
      return {
        type: 'crop-panel' as const,
        id: `crop-${p.order_num}`,
        imageUrl: p.image_url ?? '',
        srcW: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0,
      }
    }
  })

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
