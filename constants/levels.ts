export const LEVELS = [1, 2, 3] as const
export type Level = typeof LEVELS[number]

export const PATTERNS_PER_LEVEL: Record<Level, number> = {
  1: 500,
  2: 1500,
  3: 2000,
}

export const PATTERNS_PER_STORY = 5
