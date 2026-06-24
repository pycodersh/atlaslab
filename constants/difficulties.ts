export const DIFFICULTIES = ['normal', 'advanced', 'native'] as const
export type Difficulty = typeof DIFFICULTIES[number]
