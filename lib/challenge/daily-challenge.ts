/**
 * Daily Challenge — 4가지 챌린지 타입 생성 및 localStorage 순환 관리
 */

import type { MagazineStory } from '@/types/magazine'

export type ChallengeType = 'complete' | 'translate' | 'make_your_own' | 'story_recall'

export interface CompleteChallenge {
  type: 'complete'
  sentence: string      // "I ___ to start something new."
  answer: string        // "want"
  options: string[]     // 3 choices (shuffled)
  patternLabel: string  // original pattern shown as hint
}

export interface TranslateChallenge {
  type: 'translate'
  koreanSentence: string
  naturalAnswer: string
}

export interface MakeYourOwnChallenge {
  type: 'make_your_own'
  pattern: string
  meaningKo: string
}

export interface StoryRecallChallenge {
  type: 'story_recall'
  sentence: string   // "It's Sunday night, and a new week is ___."
  answer: string
  options: string[]
}

export type ChallengeData =
  | CompleteChallenge
  | TranslateChallenge
  | MakeYourOwnChallenge
  | StoryRecallChallenge

// ── Helpers ────────────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','to','in','on','at','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','may','might',
  'shall','of','for','and','or','but','so','yet','nor','as','if','than','that',
  'which','who','whom','whose','with','by','from','it','its','this','these','those',
  'he','she','they','we','you','i','me','my','our','your','his','her','their',
  'just','very','too','about','up','out','not','can','new','one','also','more',
  'into','then','now','all','when','what','how','where','there','here','some',
  'get','got','let','go','come','take','make','see','know','think','say','tell',
  'give','use','want','feel','seem','need','am','each','every','few','own','same',
])

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** 패턴 문자열에서 핵심 키워드 추출 (~ 마커 제거 후 첫 번째 콘텐츠 단어) */
function extractKeyWord(pattern: string): string {
  const clean = pattern
    .replace(/~[a-z]*/gi, '')
    .replace(/[.,!?'"()]/g, '')
    .trim()
  const words = clean.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w))
  return words[0] ?? ''
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean)
}

// ── Challenge generators ───────────────────────────────────────────────────────

function makeComplete(story: MagazineStory): CompleteChallenge | null {
  const pats = shuffle([...story.patterns])
  for (const pat of pats) {
    const fillWord = extractKeyWord(pat.pattern)
    if (!fillWord || fillWord.length < 3) continue

    const sentence = pat.storySentence
    const regex = new RegExp(`\\b(${fillWord})\\b`, 'i')
    const match = sentence.match(regex)
    if (!match) continue

    const answer = match[1]  // preserve original case
    const blanked = sentence.replace(regex, '___')

    // Distractors from other patterns' keywords
    const distractors = pats
      .filter(p => p.id !== pat.id)
      .map(p => extractKeyWord(p.pattern))
      .filter(w => w && w.toLowerCase() !== fillWord.toLowerCase() && w.length > 2)
    const unique = [...new Set(distractors)].slice(0, 2)
    if (unique.length < 2) continue

    return {
      type: 'complete',
      sentence: blanked,
      answer,
      options: shuffle([answer, ...unique]),
      patternLabel: pat.pattern,
    }
  }
  return null
}

function makeTranslate(story: MagazineStory): TranslateChallenge | null {
  const pats = shuffle([...story.patterns])
  const pat = pats.find(p => p.storySentenceKo?.trim() && p.storySentence?.trim())
  if (!pat) return null
  return {
    type: 'translate',
    koreanSentence: pat.storySentenceKo,
    naturalAnswer: pat.storySentence,
  }
}

function makeMakeYourOwn(story: MagazineStory): MakeYourOwnChallenge {
  const pat = story.patterns[Math.floor(Math.random() * story.patterns.length)]
  return {
    type: 'make_your_own',
    pattern: pat.pattern,
    meaningKo: pat.meaningKo,
  }
}

function makeStoryRecall(story: MagazineStory): StoryRecallChallenge | null {
  const paras = shuffle([...story.paragraphs])
  for (const para of paras) {
    const sentences = shuffle(
      splitSentences(para.english).filter(s => {
        const wc = s.split(/\s+/).length
        return wc >= 5 && wc <= 14 && s.length < 110
      })
    )
    for (const sentence of sentences) {
      const words = sentence.split(/\s+/)
      const candidates = words.filter(w => {
        const clean = w.replace(/[.,!?'"]/g, '').toLowerCase()
        return clean.length >= 4 && !STOP_WORDS.has(clean)
      })
      if (!candidates.length) continue

      const target = candidates[Math.floor(Math.random() * candidates.length)]
      const answer = target.replace(/[.,!?'"]/g, '')
      const blanked = sentence.replace(target, '___')

      // Distractors from all paragraphs
      const pool = story.paragraphs
        .flatMap(p => splitSentences(p.english).flatMap(s => s.split(/\s+/)))
        .map(w => w.replace(/[.,!?'"]/g, ''))
        .filter(w => w.length >= 4 && !STOP_WORDS.has(w.toLowerCase()) && w.toLowerCase() !== answer.toLowerCase())
      const unique = [...new Set(pool)]
      const distractors = shuffle(unique).slice(0, 2)
      if (distractors.length < 2) continue

      return {
        type: 'story_recall',
        sentence: blanked,
        answer,
        options: shuffle([answer, ...distractors]),
      }
    }
  }
  return null
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function generateChallenge(type: ChallengeType, story: MagazineStory): ChallengeData | null {
  switch (type) {
    case 'complete':       return makeComplete(story)
    case 'translate':      return makeTranslate(story)
    case 'make_your_own':  return makeMakeYourOwn(story)
    case 'story_recall':   return makeStoryRecall(story)
  }
}

// ── localStorage rotation ──────────────────────────────────────────────────────

const ROTATION: ChallengeType[] = ['complete', 'translate', 'make_your_own', 'story_recall']
const LS_KEY = 'patto_last_challenge'

interface Saved { type: ChallengeType; storyId: number; date: string }

export function getTodayChallengeType(storyId: number): ChallengeType {
  try {
    const raw = localStorage.getItem(LS_KEY)
    const today = new Date().toISOString().slice(0, 10)
    if (raw) {
      const saved = JSON.parse(raw) as Saved
      if (saved.date === today && saved.storyId === storyId) return saved.type
      const idx = ROTATION.indexOf(saved.type)
      return ROTATION[(idx + 1) % ROTATION.length]
    }
  } catch {}
  return ROTATION[0]
}

export function saveChallengeType(type: ChallengeType, storyId: number): void {
  try {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(LS_KEY, JSON.stringify({ type, storyId, date: today }))
  } catch {}
}
