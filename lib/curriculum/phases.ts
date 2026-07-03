/**
 * Patto 커리큘럼 Phase 시스템.
 *
 * Phase I (Foundation) 만 현재 콘텐츠가 존재하며 unlocked = true.
 * Phase II–IV 는 향후 콘텐츠 추가 시 unlocked 를 true 로 변경한다.
 */

export type PhaseId = 1 | 2 | 3 | 4

export type Phase = {
  id: PhaseId
  name: string
  nameKo: string
  storiesInPhase: number
  patternsInPhase: number
  storiesCumulative: number
  patternsCumulative: number
  unlocked: boolean
}

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Foundation',
    nameKo: '기초 완성',
    storiesInPhase: 100,
    patternsInPhase: 500,
    storiesCumulative: 100,
    patternsCumulative: 500,
    unlocked: true,
  },
  {
    id: 2,
    name: 'Everyday English',
    nameKo: '일상 회화',
    storiesInPhase: 150,
    patternsInPhase: 1500,
    storiesCumulative: 250,
    patternsCumulative: 2000,
    unlocked: false,
  },
  {
    id: 3,
    name: 'Advanced Communication',
    nameKo: '고급 표현',
    storiesInPhase: 150,
    patternsInPhase: 1500,
    storiesCumulative: 400,
    patternsCumulative: 3500,
    unlocked: false,
  },
  {
    id: 4,
    name: 'Native Mastery',
    nameKo: '원어민 완성',
    storiesInPhase: 100,
    patternsInPhase: 500,
    storiesCumulative: 500,
    patternsCumulative: 4000,
    unlocked: false,
  },
]

export function getCurrentPhase(learnedPatterns: number): Phase {
  for (const phase of PHASES) {
    if (learnedPatterns < phase.patternsCumulative) return phase
  }
  return PHASES[PHASES.length - 1]
}

/** 현재 Phase 내 진행률 (0–100) */
export function getPhaseProgress(phase: Phase, learnedPatterns: number): number {
  const prevCumulative = PHASES[phase.id - 2]?.patternsCumulative ?? 0
  const done = Math.max(0, Math.min(learnedPatterns - prevCumulative, phase.patternsInPhase))
  return Math.round((done / phase.patternsInPhase) * 100)
}
