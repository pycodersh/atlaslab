/**
 * PATTO Story Factory — QC AI 보조 검사 프롬프트
 *
 * 로직만으로는 판단하기 어려운 두 가지 항목을 AI로 보완한다:
 *   - translation-quality: 번역이 자연스러운 한국어인지
 *   - pattern-naturalness-deep: 패턴이 맥락상 억지스럽지 않은지
 *
 * 사용법: 프롬프트를 Claude / GPT-4o에 전달 → JSON 응답 파싱 → QCCheck 생성
 */

import type { FactoryParagraph, FactoryPattern } from '@/types/factory'

// ── 번역 품질 검사 ─────────────────────────────────────────────────────────────

export function buildTranslationQCPrompt(paragraphs: FactoryParagraph[]): string {
  const pairs = paragraphs
    .map((p, i) => `[단락 ${i + 1}]\n영어: ${p.english}\n한국어: ${p.koreanTranslation}`)
    .join('\n\n')

  return `You are a Korean language editor reviewing English→Korean translations for a language learning app.

Evaluate each paragraph's Korean translation on these criteria:

1. **자연스러움** — 직역투가 아닌, 한국 성인이 자연스럽게 말하거나 쓸 법한 표현인가?
2. **어조 일치** — 영어 원문의 감정, 문체, 톤이 유지되는가?
3. **과잉 번역** — 원문에 없는 내용을 추가하거나 축소하지 않았는가?

## 번역 쌍

${pairs}

## 출력 형식 (JSON only, no markdown)

{
  "passed": boolean,
  "score": number (0–100, 5점 단위),
  "issues": [
    {
      "paragraphIndex": number (0-based),
      "problem": "string (문제 설명)",
      "suggestion": "string (수정 제안)"
    }
  ],
  "summary": "string (전체 번역 품질 한 줄 요약, 한국어)"
}
`
}

// ── Pattern 자연스러움 심층 검사 ──────────────────────────────────────────────

export function buildPatternNaturalnessQCPrompt(
  patterns: FactoryPattern[],
  storyFullText: string,
): string {
  const patternList = patterns
    .map((p, i) => `[패턴 ${i + 1}] ${p.pattern}\n문장: "${p.storySentence}"`)
    .join('\n\n')

  return `You are an English language pedagogy expert reviewing sentence patterns for a Korean English learning app.

Check whether each pattern feels natural in context — not forced, not grammatically drilled.

## Story (full text)

${storyFullText}

## Patterns to evaluate

${patternList}

## Criteria

1. Does the pattern sentence feel like a native speaker would naturally say it in this situation?
2. Is the pattern clearly identifiable by a learner without being labeled?
3. Is it free from over-simplified "textbook English" feel?
4. Does it fit the story's tone and level?

## Output format (JSON only)

{
  "passed": boolean,
  "score": number (0–100),
  "issues": [
    {
      "patternIndex": number (0-based),
      "problem": "string",
      "suggestion": "string"
    }
  ],
  "summary": "string (one line in English)"
}
`
}

// ── Prompt 불일치 심층 검사 ────────────────────────────────────────────────────

export type ScenePromptCheckInput = {
  sceneId: string
  sceneTitle: string
  sceneSummary: string
  imagePrompt: string
  videoPrompt: string
  ambiencePrompt: string
}

export function buildPromptConsistencyQCPrompt(scenes: ScenePromptCheckInput[]): string {
  const sceneList = scenes.map(s => `
Scene ID: ${s.sceneId}
Title: ${s.sceneTitle}
Summary: ${s.sceneSummary}

imagePrompt: ${s.imagePrompt}
videoPrompt: ${s.videoPrompt}
ambiencePrompt: ${s.ambiencePrompt}
`).join('\n---\n')

  return `You are a content consistency reviewer for an AI media generation pipeline.

For each scene, check whether the imagePrompt, videoPrompt, and ambiencePrompt accurately reflect the scene's content and mood.

A FAIL occurs when:
- The prompt describes a completely different setting (e.g., scene is "party indoors" but prompt says "train station")
- The mood or tone is mismatched (e.g., scene is peaceful but prompt says "dramatic storm")
- Key elements from the scene summary are missing from all three prompts

A PASS occurs when:
- The prompts capture the setting, mood, and key visual/audio elements of the scene
- Minor differences in detail are acceptable

## Scenes to evaluate

${sceneList}

## Output format (JSON only)

{
  "passed": boolean,
  "score": number (0–100),
  "issues": [
    {
      "sceneId": "string",
      "field": "imagePrompt | videoPrompt | ambiencePrompt",
      "problem": "string",
      "severity": "error | warning"
    }
  ],
  "summary": "string (one line in English)"
}
`
}
