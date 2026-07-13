// ── Trainer system – shared types ─────────────────────────────────────────────

export type TrainerPage = 'home' | 'story' | 'pattern' | 'essay' | 'progress' | 'library' | 'session' | 'other'

/** Orb visual state */
export type OrbState = 'idle' | 'waiting' | 'guiding' | 'paused'

/** What happens when user taps Orb */
export type OrbTapMode = 'menu' | 'done'

/** Session phase — the step-by-step flow for a story session */
export type SessionPhase =
  | 'inactive'
  | 'ready'            // "Ready?" — waiting for first tap
  | 'para-listen'      // paragraph audio playing
  | 'para-your-turn'   // waiting for user speech + Orb tap
  | 'para-nice'        // brief "Nice." transition
  | 'story-done'       // all paragraphs done → "Great."
  | 'pat-listen'       // pattern phrase audio
  | 'pat-your-turn-1'  // first "Your turn."
  | 'pat-again'        // "Again." + replay audio
  | 'pat-your-turn-2'  // second "Your turn."
  | 'pat-next'         // "Next." → advance card
  | 'session-done'     // "Done." → complete
  | 'paused'

/** Round-based guidance tier */
export type GuidanceTier = 'full' | 'lite' | 'minimal' | 'silent'

export function guidanceTier(round: number): GuidanceTier {
  if (round <= 1) return 'full'    // 1–2회차: step-by-step
  if (round === 2) return 'lite'   // 3회차: reduced
  if (round === 3) return 'minimal' // 4회차: occasional
  return 'silent'                  // 5회차+: almost nothing
}

/** Config passed from MagazineEngine to startSession() */
export interface TrainerSessionConfig {
  storyId: number
  paragraphs: Array<{ idx: number; text: string; audioUrl?: string | null }>
  patterns:   Array<{ idx: number; id: string; phraseText: string; phraseAudioUrl?: string | null }>
  round: number   // 0-indexed completed rounds
  playParagraphAudio: (paraIdx: number, onEnd: () => void) => void
  playPatternAudio:   (patternIdx: number, onEnd: () => void) => void
  stopAudio: () => void
  scrollToParagraph:  (paraIdx: number) => void
  scrollToPatterns:   () => void
  advancePatternCard: (toIdx: number) => void
  onSessionComplete:  () => void
  onExit:             () => void
}

/** Per-session progress saved to localStorage */
export interface SessionProgress {
  storyId: number
  phase: SessionPhase
  paraIdx: number
  patternIdx: number
  savedAt: number  // timestamp
}

/** Per-user pace data (localStorage, future Supabase) */
export interface PaceData {
  storyId: number
  avgResponseMs: number
  sessionCount: number
  lastUpdated: number
}
