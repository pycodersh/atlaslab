import type { RawQuestion, RawMC, RawWB } from '@/data/kpatto/challenge-pool-ep001'
import type { Question } from '@/components/kpatto/ChallengeSection'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

export function generateChallenge(pool: RawQuestion[]): Question[] {
  const mcByPattern: Record<string, RawMC[]> = {}
  const wbs: RawWB[] = []

  for (const q of pool) {
    if (q.type === 'mc') {
      (mcByPattern[q.patternId] ??= []).push(q)
    } else {
      wbs.push(q)
    }
  }

  // 패턴 5개 중 3개 랜덤 선택 → 각 패턴에서 mc 1개 → 3문제
  const mcSelected: Question[] = shuffle(Object.values(mcByPattern)).slice(0, 3).map(group => {
    const raw = pick(group)
    const choices = shuffle([raw.answer, ...raw.distractors])
    return {
      type: 'mc',
      prompt: `"${raw.prompt}"`,
      choices,
      correctIdx: choices.indexOf(raw.answer),
    }
  })

  // 2 wb random from pool
  const wbSelected: Question[] = shuffle(wbs).slice(0, 2).map(raw => ({
    type: 'build',
    prompt: `"${raw.prompt}"`,
    words: shuffle([...raw.answerBlocks, ...raw.extraBlocks]),
    answer: raw.answerBlocks,
  }))

  // total 5, shuffled
  return shuffle([...mcSelected, ...wbSelected])
}
