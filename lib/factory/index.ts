/**
 * PATTO Story Factory — 진입점
 *
 * 사용법:
 *   import { buildStoryPrompt, buildScenePrompt, ... } from '@/lib/factory'
 *
 * 각 Generator는 독립적으로 사용 가능.
 * 전체 Pipeline: buildStoryPackage() 순서대로 호출.
 */

export {
  buildStoryPrompt,
  buildScenePrompt,
  buildPatternExtractorPrompt,
  buildImagePrompt,
  buildVideoPrompt,
  buildAmbiencePrompt,
  buildExampleGeneratorPrompt,
  buildMetadataPrompt,
  buildTranslationValidatorPrompt,
} from './prompts'

export type {
  StoryGeneratorInput,
  PromptGeneratorInput,
} from './prompts'

export type {
  CEFRLevel,
  StoryTheme,
  StoryMood,
  StoryMetadata,
  FactoryParagraph,
  FactoryPattern,
  FactoryScene,
  FactorySceneVideo,
  TTSQueueItem,
  StoryPackage,
  StoryGeneratorOutput,
  SceneGeneratorOutput,
  PatternExtractorOutput,
  PromptGeneratorOutput,
  ExampleGeneratorOutput,
  MetadataGeneratorOutput,
} from '@/types/factory'

/**
 * Story Package 생성 순서 (Pipeline)
 *
 * 1. buildStoryPrompt()       → AI → StoryGeneratorOutput (paragraphs + title)
 * 2. buildMetadataPrompt()    → AI → StoryMetadata
 * 3. buildScenePrompt()       → AI → SceneGeneratorOutput (scene 분할)
 * 4. buildPatternExtractorPrompt() → AI → PatternExtractorOutput (pattern 5개)
 * 5. buildExampleGeneratorPrompt() × 5 → AI → ExampleGeneratorOutput (패턴별 예문)
 * 6. buildImagePrompt()       → AI → Scene별 imagePrompt
 * 7. buildVideoPrompt()       → AI → Scene별 videoPrompt
 * 8. buildAmbiencePrompt()    → AI → Scene별 ambiencePrompt
 * 9. buildTranslationValidatorPrompt() → AI → 번역 검수
 * 10. assembleStoryPackage()  → StoryPackage JSON 완성
 *
 * 실제 AI 호출은 이 파일에서 하지 않는다.
 * 각 buildXxxPrompt()가 반환하는 문자열을 AI에 전달한 뒤,
 * 응답 JSON을 assembleStoryPackage()에 넣어 완성한다.
 */

import type {
  StoryPackage,
  StoryGeneratorOutput,
  SceneGeneratorOutput,
  PatternExtractorOutput,
  PromptGeneratorOutput,
  MetadataGeneratorOutput,
  FactoryParagraph,
  FactoryScene,
  FactoryPattern,
  TTSQueueItem,
} from '@/types/factory'

type AssembleInput = {
  storyId: number
  storyOutput: StoryGeneratorOutput
  metadataOutput: MetadataGeneratorOutput
  sceneOutput: SceneGeneratorOutput
  patternOutput: PatternExtractorOutput
  promptOutput: PromptGeneratorOutput
  voice?: string
}

export function assembleStoryPackage(input: AssembleInput): StoryPackage {
  const {
    storyId,
    storyOutput,
    metadataOutput,
    sceneOutput,
    patternOutput,
    promptOutput,
    voice = 'us-female',
  } = input

  // Paragraphs with generated IDs
  const paragraphs: FactoryParagraph[] = storyOutput.paragraphs.map((p, i) => ({
    id: `p${storyId}-${i + 1}`,
    english: p.english,
    koreanTranslation: p.koreanTranslation,
    keyExpressions: p.keyExpressions,
  }))

  // Patterns with generated IDs
  const patterns: FactoryPattern[] = patternOutput.patterns.map((p, i) => ({
    id: `pt${storyId}-${i + 1}`,
    pattern: p.pattern,
    meaningKo: p.meaningKo,
    explanation: p.explanation,
    storySentence: p.storySentence,
    storySentenceKo: p.storySentenceKo,
    variationSentence: p.variationSentence,
    variationSentenceKo: p.variationSentenceKo,
    examples: p.examples,
  }))

  // Scenes: merge scene structure + media prompts
  const promptMap = Object.fromEntries(
    promptOutput.scenes.map(s => [s.id, s])
  )

  const scenes: FactoryScene[] = sceneOutput.scenes.map((scene, i) => {
    const sceneId = `s${storyId}-${i + 1}`
    const prompts = promptMap[sceneId] ?? {}
    return {
      id: sceneId,
      title: scene.title,
      titleKo: scene.titleKo,
      summary: scene.summary,
      paragraphIds: scene.paragraphIndexes
        ? scene.paragraphIndexes.map(idx => `p${storyId}-${idx + 1}`)
        : scene.paragraphIds,
      patternIds: [],
      imagePrompt: prompts.imagePrompt ?? '',
      videoPrompt: prompts.videoPrompt ?? '',
      ambiencePrompt: prompts.ambiencePrompt ?? '',
    }
  })

  // TTS queue — one item per paragraph
  const ttsQueue: TTSQueueItem[] = paragraphs.map(p => ({
    paragraphId: p.id,
    text: p.english,
    voice,
    status: 'pending',
  }))

  return {
    version: '1.0',
    packageId: `story-${String(storyId).padStart(3, '0')}`,
    generatedAt: new Date().toISOString(),
    generatedBy: 'claude-opus-4',

    metadata: {
      ...metadataOutput,
      sceneCount: scenes.length,
      patternCount: patterns.length,
    },

    story: {
      id: storyId,
      title: storyOutput.title,
      subtitleKo: metadataOutput.titleKo,
      storyNote: storyOutput.storyNote,
      highlightPhrases: storyOutput.highlightPhrases,
      ambienceId: undefined,
      sceneVideo: {
        status: 'missing',
        url: `/videos/story${storyId}-scene.mp4`,
        poster: undefined,
        prompt: scenes[0]?.videoPrompt ?? '',
        source: 'ai',
      },
    },

    paragraphs,
    scenes,
    patterns,
    ttsQueue,
  }
}
