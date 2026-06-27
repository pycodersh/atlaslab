/**
 * PATTO Story Factory — Master Prompt Templates
 *
 * 각 Generator에서 AI에게 전달할 프롬프트를 정의한다.
 * 실제 AI 호출은 하지 않는다 — 프롬프트를 복사해 Claude / GPT-4o에 붙여 넣으면 된다.
 */

import type { CEFRLevel, StoryTheme, StoryMood } from '@/types/factory'

// ── 1. Story Generator ─────────────────────────────────────────────────────────

export type StoryGeneratorInput = {
  storyId: number
  theme: StoryTheme
  mood: StoryMood
  difficulty: CEFRLevel
  setting?: string    // 선택 힌트 (예: 'rainy day in a small bookshop')
}

export function buildStoryPrompt(input: StoryGeneratorInput): string {
  return `You are a professional English story writer for Korean adult learners.
Write a short story for PATTO, an English learning app.

## Requirements

- Theme: ${input.theme}
- Mood: ${input.mood}
- CEFR difficulty: ${input.difficulty}
- Story ID: ${input.storyId}
${input.setting ? `- Setting hint: ${input.setting}` : ''}

## Story Rules

1. Written in natural, everyday English — the way a native speaker would actually talk or write in their journal
2. Length: exactly 5 paragraphs
3. Each paragraph: 3–5 sentences
4. Total sentences: 18–22
5. Must naturally contain exactly 5 core sentence patterns (see Pattern rules below)
6. No forced grammar drills — patterns must feel natural in the story flow
7. Story must have a beginning, middle, and end
8. End with a quiet, satisfying conclusion (not dramatic)
9. Vocabulary: appropriate for ${input.difficulty} — avoid idioms above this level
10. First person narration ("I")

## Pattern Rules

The story must naturally contain these 5 sentence pattern types:
- A "want to / would like to" pattern
- A "have to / need to / should" pattern
- A "don't / doesn't / didn't" negation pattern
- A "just / only / simply" minimizer pattern
- A "can / could / might" ability or possibility pattern

Do NOT label them. They must appear naturally inside the story.

## Output Format (JSON)

Return ONLY valid JSON, no markdown fences:

{
  "title": "string (max 6 words, evocative, not a grammar title)",
  "titleKo": "string (Korean translation of title)",
  "storyNote": "string (one warm sentence in Korean — the story's emotional takeaway, written as if a friend is sharing a thought)",
  "highlightPhrases": ["array of 6–8 short phrases from the story text that learners should notice"],
  "paragraphs": [
    {
      "english": "string (full paragraph text)",
      "koreanTranslation": "string (natural Korean translation, not literal)",
      "keyExpressions": ["1–2 key expressions from this paragraph"]
    }
  ]
}
`
}

// ── 2. Scene Generator ─────────────────────────────────────────────────────────

export function buildScenePrompt(storyText: string): string {
  return `You are a story structure analyst for PATTO, an English learning app.

Given a story, divide it into 2–3 scenes (narrative units).
Each scene should feel like a natural visual moment — something a cinematographer would film as one continuous shot.

## Story

${storyText}

## Scene Rules

1. 2–3 scenes total (most stories: 3)
2. Scene boundaries follow natural narrative shifts — a change in location, time, or emotional beat
3. Each scene has exactly 1–2 paragraphs
4. Scene title: short, evocative (max 5 words), in English
5. Scene summary: 1–2 sentences describing what happens visually and emotionally

## Output Format (JSON)

Return ONLY valid JSON:

{
  "scenes": [
    {
      "title": "string",
      "titleKo": "string",
      "summary": "string (1–2 sentences describing this scene visually and emotionally)",
      "paragraphIndexes": [0, 1]
    }
  ]
}

paragraphIndexes: 0-based index of paragraphs that belong to this scene.
`
}

// ── 3. Pattern Extractor ───────────────────────────────────────────────────────

export function buildPatternExtractorPrompt(storyText: string): string {
  return `You are an English pattern analyst for PATTO, an English learning app targeting Korean adult learners.

Extract exactly 5 core sentence patterns from the story below.
Patterns must come from sentences that actually appear in the story — do not invent new ones.

## Story

${storyText}

## Pattern Rules

1. Extract exactly 5 patterns
2. Each pattern must be a real sentence in the story
3. Pattern format: use "~" as placeholder (예: "I want to ~", "I have to ~", "I didn't ~")
4. Pattern must be broadly applicable — learners can use it in their own life
5. Explanation in Korean: 3 lines max, plain language, no grammar jargon
6. Examples: 5 natural example sentences per pattern (not the story sentence)
7. One variation sentence that a learner might say about their own life

## Output Format (JSON)

Return ONLY valid JSON:

{
  "patterns": [
    {
      "pattern": "string (예: 'I want to ~.')",
      "meaningKo": "string (예: '~하고 싶다')",
      "explanation": "string (Korean, 3 lines max, \\n-separated)",
      "storySentence": "string (exact sentence from the story)",
      "storySentenceKo": "string (Korean translation)",
      "variationSentence": "string (learner's own life example)",
      "variationSentenceKo": "string",
      "examples": [
        { "en": "string", "ko": "string" }
      ]
    }
  ]
}
`
}

// ── 4. Prompt Generator (Image / Video / Ambience) ─────────────────────────────

export type PromptGeneratorInput = {
  sceneTitle: string
  sceneSummary: string
  storyTheme: StoryTheme
  storyMood: StoryMood
  paragraphText: string
}

export function buildImagePrompt(input: PromptGeneratorInput): string {
  return `You are a visual prompt engineer for AI image generation.

Write a professional image generation prompt for this story scene.

## Scene

Title: ${input.sceneTitle}
Summary: ${input.sceneSummary}
Story excerpt: "${input.paragraphText}"
Theme: ${input.storyTheme}
Mood: ${input.storyMood}

## Prompt Rules

- 2–4 sentences
- Describe: subject, setting, lighting, composition, mood, visual style
- Style: cinematic, magazine photography quality, realistic
- Avoid: text, watermarks, multiple panels, split screen
- End with: aspect ratio and quality tags

## Output

Return ONLY the image prompt text (no JSON, no explanation):
`
}

export function buildVideoPrompt(input: PromptGeneratorInput): string {
  return `You are a video prompt engineer for AI video generation (Runway Gen-3, Google Veo 2, Kling, Pika, Luma).

Write a professional video generation prompt for this story scene.

## Scene

Title: ${input.sceneTitle}
Summary: ${input.sceneSummary}
Story excerpt: "${input.paragraphText}"
Theme: ${input.storyTheme}
Mood: ${input.storyMood}

## Prompt Rules

- 3–5 sentences
- Describe: subject, action, camera movement, lighting, duration (5–8 seconds)
- Must work as a seamless loop (start and end frames match)
- No dialogue, no subtitles, no text on screen
- Include: ambient sound note (what the viewer would expect to hear)
- Style: cinematic, natural motion, not stylized or anime

## Output

Return ONLY the video prompt text (no JSON, no explanation):
`
}

export function buildAmbiencePrompt(input: PromptGeneratorInput): string {
  return `You are a sound design prompt engineer for AI ambience generation (ElevenLabs Sound Effects, AI Sound).

Write a professional ambient sound prompt for this story scene.

## Scene

Title: ${input.sceneTitle}
Summary: ${input.sceneSummary}
Theme: ${input.storyTheme}
Mood: ${input.storyMood}

## Prompt Rules

- 3–4 sentences
- Describe: primary sound layer, secondary sounds, texture, rhythm
- Must loop seamlessly
- Volume: background level (listener can talk over it)
- No music, no lyrics — pure ambient sound only

## Output

Return ONLY the ambience sound prompt text (no JSON, no explanation):
`
}

// ── 5. Example Generator ───────────────────────────────────────────────────────

export function buildExampleGeneratorPrompt(pattern: string, meaningKo: string): string {
  return `You are an English example sentence writer for Korean adult learners.

Generate 5 natural example sentences for this English pattern.

## Pattern

Pattern: ${pattern}
Korean meaning: ${meaningKo}

## Rules

1. Each sentence uses the pattern naturally
2. Situations: real everyday life (work, home, friends, health, weekend)
3. Vocabulary: B1 level (not too easy, not too hard)
4. Each sentence has a clear, natural Korean translation
5. Sentences must be different from each other in situation and vocabulary

## Output Format (JSON)

Return ONLY valid JSON:

{
  "examples": [
    { "en": "string", "ko": "string" }
  ]
}
`
}

// ── 6. Metadata Generator ─────────────────────────────────────────────────────

export function buildMetadataPrompt(storyTitle: string, storyText: string): string {
  return `You are a content metadata specialist for PATTO, an English learning app.

Analyze this story and generate structured metadata.

## Story

Title: ${storyTitle}
Text:
${storyText}

## Output Format (JSON)

Return ONLY valid JSON:

{
  "titleKo": "string (Korean translation of title)",
  "theme": "one of: friendship | travel | work | family | restaurant | shopping | daily-life | romance | health | education | technology | nature | city | celebration | loss | growth",
  "mood": "one of: warm | humorous | nostalgic | exciting | peaceful | bittersweet | motivating | reflective",
  "difficulty": "one of: A1 | A2 | B1 | B2 | C1 | C2",
  "languageLevel": "one of: A1 | A2 | B1 | B2 | C1 | C2",
  "estimatedMinutes": number (1–5, reading time estimate),
  "sceneCount": number,
  "patternCount": 5,
  "tags": ["array of 4–6 searchable tags in English"],
  "targetAudience": "string (one sentence describing the ideal learner for this story)",
  "setting": "string (one sentence: where and when this story takes place)"
}
`
}

// ── 7. Translation Validator ───────────────────────────────────────────────────

export function buildTranslationValidatorPrompt(english: string, korean: string): string {
  return `You are a Korean-English translation reviewer.

Review this English → Korean translation for natural fluency.
The translation is for Korean adult learners reading an English story.

## English

${english}

## Korean Translation

${korean}

## Review Criteria

1. Does it read naturally in Korean? (not word-for-word)
2. Does it preserve the emotional tone?
3. Are there any awkward phrases that should be rewritten?

## Output Format (JSON)

{
  "approved": boolean,
  "issues": ["list of issues if not approved, empty if approved"],
  "revisedKorean": "string (improved version, or same as input if approved)"
}
`
}
