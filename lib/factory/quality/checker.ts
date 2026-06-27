/**
 * PATTO Story Factory — QC Checker (순수 함수)
 *
 * AI 호출 없이 로직만으로 검사 가능한 10개 항목.
 * 각 함수는 독립적으로 호출 가능하다.
 */

import type { FactoryParagraph, FactoryPattern, FactoryScene, StoryMetadata } from '@/types/factory'
import type { QCCheck } from '@/types/quality'

// ── 유틸 ──────────────────────────────────────────────────────────────────────

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 2).length
}

function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
}

function wordFrequency(words: string[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const w of words) map.set(w, (map.get(w) ?? 0) + 1)
  return map
}

// CEFR별 허용 어휘 난이도 기준 (고급 단어 비율 임계값)
const CEFR_HARD_WORD_THRESHOLD: Record<string, number> = {
  A1: 0.02, A2: 0.05, B1: 0.10, B2: 0.18, C1: 0.28, C2: 1.0,
}

// 비교적 고급 단어 (B2 이상) 샘플 목록 — 실제 서비스에서는 CEFR 사전으로 대체
const HARD_WORDS = new Set([
  'nevertheless', 'consequently', 'simultaneously', 'meticulously', 'ambiguous',
  'inevitable', 'predominantly', 'eloquent', 'intricate', 'perseverance',
  'reconcile', 'tenacious', 'melancholy', 'serendipity', 'discrepancy',
  'exacerbate', 'plausible', 'scrutinize', 'ubiquitous', 'zealous',
])

// ── 검사 1: Story 길이 (18~22문장) ────────────────────────────────────────────

export function checkStoryLength(paragraphs: FactoryParagraph[]): QCCheck {
  const total = paragraphs.reduce((sum, p) => sum + countSentences(p.english), 0)
  const passed = total >= 18 && total <= 22
  const score = passed ? 100 : total < 18 ? Math.round((total / 18) * 100) : Math.round((22 / total) * 100)

  return {
    id: 'story-length',
    label: 'Story 길이 (18–22문장)',
    passed,
    score,
    weight: 10,
    detail: passed ? undefined : `현재 ${total}문장. 목표: 18–22문장.`,
    autoFixable: false,
  }
}

// ── 검사 2: Pattern 수 (정확히 5개) ───────────────────────────────────────────

export function checkPatternCount(patterns: FactoryPattern[]): QCCheck {
  const count = patterns.length
  const passed = count === 5
  const score = passed ? 100 : Math.round((Math.min(count, 5) / 5) * 100)

  return {
    id: 'pattern-count',
    label: 'Pattern 수 (정확히 5개)',
    passed,
    score,
    weight: 10,
    detail: passed ? undefined : `현재 ${count}개. 정확히 5개 필요.`,
    autoFixable: count < 5,
  }
}

// ── 검사 3: Pattern 자연스러움 (Story 안에서 실제 사용) ───────────────────────

export function checkPatternNaturalness(
  patterns: FactoryPattern[],
  paragraphs: FactoryParagraph[],
): QCCheck {
  const allText = paragraphs.map(p => p.english).join(' ').toLowerCase()
  const failures: string[] = []

  for (const pt of patterns) {
    // 문장 부호 제거 후 첫 25자로 비교 (마침표/쉼표 불일치 허용)
    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ').trim()
    const needle = normalize(pt.storySentence).slice(0, 25)
    if (needle.length > 5 && !normalize(allText).includes(needle)) {
      failures.push(`"${pt.pattern}" — storySentence가 Story 본문에 없음`)
    }
  }

  const passed = failures.length === 0
  const score = Math.round(((patterns.length - failures.length) / Math.max(patterns.length, 1)) * 100)

  return {
    id: 'pattern-naturalness',
    label: 'Pattern 자연스러움 (Story 안 실제 사용)',
    passed,
    score,
    weight: 15,
    detail: failures.length > 0 ? failures.join('\n') : undefined,
    autoFixable: false,
  }
}

// ── 검사 4: 난이도 일치 (CEFR) ────────────────────────────────────────────────

export function checkDifficultyMatch(
  metadata: Pick<StoryMetadata, 'difficulty'>,
  paragraphs: FactoryParagraph[],
): QCCheck {
  const allWords = tokenize(paragraphs.map(p => p.english).join(' '))
  const hardCount = allWords.filter(w => HARD_WORDS.has(w)).length
  const ratio = hardCount / Math.max(allWords.length, 1)
  const threshold = CEFR_HARD_WORD_THRESHOLD[metadata.difficulty] ?? 0.10

  // 설정 난이도보다 훨씬 어려운 어휘가 많으면 경고
  const overThreshold = ratio > threshold * 2
  const passed = !overThreshold
  const score = passed ? 100 : Math.round((threshold / ratio) * 100)

  return {
    id: 'difficulty-match',
    label: `난이도 일치 (${metadata.difficulty})`,
    passed,
    score: Math.min(score, 100),
    weight: 10,
    detail: overThreshold
      ? `고급 어휘 비율 ${(ratio * 100).toFixed(1)}% (${metadata.difficulty} 기준 ${(threshold * 100).toFixed(0)}% 이하 권장)`
      : undefined,
    autoFixable: false,
  }
}

// ── 검사 5: Story 흐름 (시작-전개-마무리) ─────────────────────────────────────

export function checkStoryFlow(paragraphs: FactoryParagraph[]): QCCheck {
  const issues: string[] = []

  if (paragraphs.length < 3) {
    issues.push('단락이 3개 미만 — 시작/전개/마무리 구조 불가능')
  }

  // 첫 단락: 배경 설정 키워드
  const firstPara = paragraphs[0]?.english.toLowerCase() ?? ''
  const hasOpening = /\b(it was|i was|one day|last|this morning|that day|when i)\b/.test(firstPara)
  if (!hasOpening) issues.push('첫 단락에 배경 설정 표현이 없음')

  // 마지막 단락: 마무리 키워드
  const lastPara = paragraphs[paragraphs.length - 1]?.english.toLowerCase() ?? ''
  const hasClosing = /\b(still|now|that night|on the way|looking back|i realized|i felt|i thought|i knew)\b/.test(lastPara)
  if (!hasClosing) issues.push('마지막 단락에 마무리 표현이 없음')

  const passed = issues.length === 0
  const score = Math.round(((3 - Math.min(issues.length, 3)) / 3) * 100)

  return {
    id: 'story-flow',
    label: 'Story 흐름 (시작-전개-마무리)',
    passed,
    score,
    weight: 10,
    detail: issues.length > 0 ? issues.join('\n') : undefined,
    autoFixable: false,
  }
}

// ── 검사 6: 반복 (과도한 단어/표현 반복) ──────────────────────────────────────

export function checkRepetition(paragraphs: FactoryParagraph[]): QCCheck {
  const STOP_WORDS = new Set(['i', 'a', 'the', 'and', 'was', 'to', 'it', 'in', 'of', 'that', 'my', 'me', 'had'])
  const allWords = tokenize(paragraphs.map(p => p.english).join(' '))
    .filter(w => !STOP_WORDS.has(w) && w.length > 3)

  const freq = wordFrequency(allWords)
  const overused: string[] = []

  freq.forEach((count, word) => {
    // 같은 내용어가 5회 이상 나오면 경고
    if (count >= 5) overused.push(`"${word}" (${count}회)`)
  })

  const passed = overused.length === 0
  const score = passed ? 100 : Math.max(0, 100 - overused.length * 15)

  return {
    id: 'repetition',
    label: '과도한 반복 없음',
    passed,
    score,
    weight: 10,
    detail: overused.length > 0 ? `과도 반복 단어: ${overused.join(', ')}` : undefined,
    autoFixable: false,
  }
}

// ── 검사 7: Scene 일관성 (Paragraph·Pattern ID 연결) ──────────────────────────

export function checkSceneConsistency(
  scenes: FactoryScene[],
  paragraphs: FactoryParagraph[],
  patterns: FactoryPattern[],
): QCCheck {
  const paragraphIds = new Set(paragraphs.map(p => p.id))
  const patternIds   = new Set(patterns.map(p => p.id))
  const issues: string[] = []

  for (const scene of scenes) {
    // 1. 모든 paragraphId가 실제로 존재하는지
    for (const pid of scene.paragraphIds) {
      if (!paragraphIds.has(pid)) {
        issues.push(`Scene "${scene.id}": 존재하지 않는 paragraphId "${pid}"`)
      }
    }
    // 2. 모든 patternId가 실제로 존재하는지
    for (const ptid of scene.patternIds ?? []) {
      if (!patternIds.has(ptid)) {
        issues.push(`Scene "${scene.id}": 존재하지 않는 patternId "${ptid}"`)
      }
    }
    // 3. Scene에 최소 1개 paragraph가 있는지
    if (scene.paragraphIds.length === 0) {
      issues.push(`Scene "${scene.id}": paragraph 없음`)
    }
  }

  // 4. 모든 paragraph가 최소 1개 scene에 속하는지
  const coveredParagraphIds = new Set(scenes.flatMap(s => s.paragraphIds))
  for (const pid of paragraphIds) {
    if (!coveredParagraphIds.has(pid)) {
      issues.push(`Paragraph "${pid}": 어느 Scene에도 포함되지 않음`)
    }
  }

  const passed = issues.length === 0
  const score = passed ? 100 : Math.max(0, 100 - issues.length * 20)

  return {
    id: 'scene-consistency',
    label: 'Scene ↔ Paragraph ↔ Pattern 연결',
    passed,
    score,
    weight: 15,
    detail: issues.length > 0 ? issues.join('\n') : undefined,
    autoFixable: false,
  }
}

// ── 검사 8: Prompt 일관성 (Prompt ↔ Scene 내용 일치) ─────────────────────────

export function checkPromptConsistency(scenes: FactoryScene[]): QCCheck {
  const issues: string[] = []

  for (const scene of scenes) {
    const summary = scene.summary.toLowerCase()

    // 핵심 키워드를 Scene summary에서 추출해 각 Prompt에 반영됐는지 확인
    // (단순 휴리스틱 — 정확한 검사는 AI 프롬프트로 보완)
    // 시각/청각 프롬프트용 키워드: summary + title 합산 (서사 단어 제외)
    // 위치·배경·감정 단어가 포함되면 통과로 간주
    const NARRATIVE_STOP = new Set(['changes', 'everything', 'narrator', 'switches', 'direction',
      'arrives', 'decides', 'realizes', 'someone', 'something', 'there'])
    const sourceWords = tokenize(`${scene.title} ${scene.summary}`)
      .filter(w => w.length > 4 && !NARRATIVE_STOP.has(w))

    const checks = [
      { field: 'imagePrompt', text: scene.imagePrompt },
      { field: 'videoPrompt', text: scene.videoPrompt },
      { field: 'ambiencePrompt', text: scene.ambiencePrompt },
    ]

    for (const { field, text } of checks) {
      // 로컬 검사: 존재 여부 + 최소 길이만 확인
      // 의미 일치(semantic consistency)는 AI 검사(buildPromptConsistencyQCPrompt)에서 처리
      if (!text || text.trim().length < 20) {
        issues.push(`Scene "${scene.id}" ${field}: 프롬프트가 비어 있거나 너무 짧음`)
      }
    }

    // sourceWords는 향후 AI 검사 프롬프트 컨텍스트용으로 보존
    void sourceWords
  }

  const passed = issues.length === 0
  const score = passed ? 100 : Math.max(0, 100 - issues.length * 15)

  return {
    id: 'prompt-consistency',
    label: 'Prompt ↔ Scene 내용 일치',
    passed,
    score,
    weight: 15,
    detail: issues.length > 0 ? issues.join('\n') : undefined,
    autoFixable: true,
  }
}

// ── 검사 9: Metadata 정확성 ────────────────────────────────────────────────────

export function checkMetadataAccuracy(
  metadata: StoryMetadata,
  paragraphs: FactoryParagraph[],
  scenes: FactoryScene[],
  patterns: FactoryPattern[],
): QCCheck {
  const issues: string[] = []

  if (metadata.patternCount !== patterns.length) {
    issues.push(`patternCount ${metadata.patternCount} ≠ 실제 ${patterns.length}개`)
  }
  if (metadata.sceneCount !== scenes.length) {
    issues.push(`sceneCount ${metadata.sceneCount} ≠ 실제 ${scenes.length}개`)
  }
  if (!metadata.title || metadata.title.trim().length < 2) {
    issues.push('title 누락')
  }
  if (!metadata.titleKo || metadata.titleKo.trim().length < 2) {
    issues.push('titleKo 누락')
  }
  if (!metadata.theme) {
    issues.push('theme 누락')
  }
  if (!metadata.difficulty) {
    issues.push('difficulty 누락')
  }
  // estimatedMinutes 범위 검사 (단락당 약 0.5분)
  const expectedMinutes = Math.round(paragraphs.length * 0.6)
  if (Math.abs(metadata.estimatedMinutes - expectedMinutes) > 2) {
    issues.push(`estimatedMinutes ${metadata.estimatedMinutes}분이 예상(${expectedMinutes}분)과 크게 다름`)
  }

  const passed = issues.length === 0
  const score = passed ? 100 : Math.max(0, 100 - issues.length * 20)

  return {
    id: 'metadata-accuracy',
    label: 'Metadata 정확성',
    passed,
    score,
    weight: 5,
    detail: issues.length > 0 ? issues.join('\n') : undefined,
    autoFixable: true,
  }
}
