/**
 * PATTO Story Sentence Metadata Types
 *
 * Story 문장 단위 학습 메타데이터.
 * magazine-stories.ts의 paragraph.english를 문장 단위로 분리하고
 * Example DB와 동일한 청크 구조를 적용한다.
 *
 * 설계 원칙:
 * - Story와 Example이 동일한 메타데이터 구조를 공유
 * - 공용 PhraseEntry로 표현 중복 저장 방지
 * - audioUrl을 null로 미리 준비해 TTS 파이프라인에 즉시 연결 가능
 */

// ── Chunk ───────────────────────────────────────────────────────────────────

export type ChunkType =
  | 'phrasalVerb'
  | 'idiom'
  | 'fixedExpression'
  | 'collocation'
  | 'chunk'
  | 'prepPhrase'

export type SentenceChunk = {
  text: string
  type: ChunkType
  start: number   // 0-indexed in `en`, inclusive
  end: number     // exclusive — en.slice(start, end) === text
}

// ── Sentence ─────────────────────────────────────────────────────────────────

export type StorySentence = {
  id: string           // 'p{story}-{para}-s{n}'  e.g. 'p1-1-s1'
  story: number        // 1–100
  paragraph: number    // 1–5 within story
  sentence: number     // 1, 2, 3 within paragraph
  en: string
  ko: string
  level: 'A2' | 'B1' | 'B2' | 'C1'
  chunks: SentenceChunk[]
  grammar: string[]    // e.g. ['Present Perfect', 'I want to + V']
  audioUrl: string | null
}

// ── Shared Phrase Library ────────────────────────────────────────────────────

/** 표현이 등장한 위치 — Story 문장 또는 Example */
export type PhraseSource = {
  kind: 'story' | 'example'
  /** story: paragraph sentence ID, e.g. 'p1-1-s2' */
  sentenceId?: string
  /** example: example entry ID, e.g. 'pt1-1-ex1' */
  exampleId?: string
}

/**
 * 공용 표현 라이브러리 엔트리.
 * Story와 Example에서 동일한 표현이 등장해도 단 하나의 PhraseEntry로 관리.
 * sources[]에 출처를 누적해 "이 표현을 어디서 배웠는지" 추적 가능.
 */
export type PhraseEntry = {
  id: string            // 'ph_end_up', 'ph_look_forward_to' (snake_case)
  text: string          // 'end up'
  normalizedText: string // lowercase + trim — 검색/중복 제거에 사용
  type: ChunkType
  meaningKo: string     // '결국 ~하게 되다'
  sources: PhraseSource[]
}
