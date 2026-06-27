/**
 * PATTO Story Factory — Package Builder
 *
 * Generator 출력을 받아 StoryPackage 하나를 완성한다.
 * QC 자동 실행 → quality 필드 포함.
 *
 * 사용법:
 *   const pkg = buildPackage({ storyId: 1, storyOutput, metadataOutput, ... })
 */

import type {
  StoryPackage,
  StoryAssets,
  PackageVersion,
  FactoryParagraph,
  FactoryScene,
  FactoryPattern,
  TTSQueueItem,
  StoryGeneratorOutput,
  SceneGeneratorOutput,
  PatternExtractorOutput,
  PromptGeneratorOutput,
  MetadataGeneratorOutput,
} from '@/types/factory'
import { runQC, toPackageQuality } from './quality'

// ── Asset 경로 생성 규칙 ──────────────────────────────────────────────────────
// 모든 경로는 여기서 결정한다 — 나중에 CDN 변경 시 이 함수만 수정

function assetPaths(storyId: number) {
  const pad = String(storyId).padStart(3, '0')
  return {
    sceneVideo:   `/videos/story${pad}-scene.mp4`,
    scenePoster:  `/images/story${pad}-poster.jpg`,
    ambience:     `/audio/ambience/story${pad}.mp3`,
    storyTtsBase: (paragraphId: string) => `/audio/tts/story${pad}-${paragraphId}.mp3`,
    sceneImage:   (sceneId: string) => `/images/story${pad}-${sceneId}.jpg`,
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 2).length
}

// ── BuildPackageInput ─────────────────────────────────────────────────────────

export type BuildPackageInput = {
  storyId: number
  storyOutput: StoryGeneratorOutput
  metadataOutput: MetadataGeneratorOutput
  sceneOutput: SceneGeneratorOutput
  patternOutput: PatternExtractorOutput
  promptOutput: PromptGeneratorOutput
  voice?: string
  generatedBy?: string
  ambienceType?: string
  ambienceVolume?: number
}

// ── 핵심: buildPackage ────────────────────────────────────────────────────────

export function buildPackage(input: BuildPackageInput): StoryPackage {
  const {
    storyId,
    storyOutput,
    metadataOutput,
    sceneOutput,
    patternOutput,
    promptOutput,
    voice = 'us-female',
    generatedBy = 'ai',
    ambienceType = 'ambient',
    ambienceVolume = 0.25,
  } = input

  const now   = new Date().toISOString()
  const paths = assetPaths(storyId)
  const pad   = String(storyId).padStart(3, '0')

  // ── Paragraphs ──────────────────────────────────────────────────────────────
  const paragraphs: FactoryParagraph[] = storyOutput.paragraphs.map((p, i) => ({
    id: `p${storyId}-${i + 1}`,
    english: p.english,
    koreanTranslation: p.koreanTranslation,
    keyExpressions: p.keyExpressions,
  }))

  // ── Patterns ────────────────────────────────────────────────────────────────
  const patterns: FactoryPattern[] = patternOutput.patterns.map((p, i) => ({
    id: `pt${storyId}-${i + 1}`,
    ...p,
  }))

  // ── Scenes ──────────────────────────────────────────────────────────────────
  const promptMap = Object.fromEntries(promptOutput.scenes.map(s => [s.id, s]))

  const scenes: FactoryScene[] = sceneOutput.scenes.map((scene, i) => {
    const sceneId = `s${storyId}-${i + 1}`
    const prompts = promptMap[sceneId] ?? {}
    const pIds = scene.paragraphIndexes
      ? scene.paragraphIndexes.map(idx => `p${storyId}-${idx + 1}`)
      : scene.paragraphIds
    return {
      id: sceneId,
      title: scene.title,
      titleKo: scene.titleKo,
      summary: scene.summary,
      paragraphIds: pIds,
      patternIds: scene.patternIds ?? [],
      imagePrompt:   prompts.imagePrompt   ?? '',
      videoPrompt:   prompts.videoPrompt   ?? '',
      ambiencePrompt: prompts.ambiencePrompt ?? '',
    }
  })

  // ── TTS Queue ────────────────────────────────────────────────────────────────
  const ttsQueue: TTSQueueItem[] = paragraphs.map(p => ({
    paragraphId: p.id,
    text: p.english,
    voice,
    status: 'pending',
  }))

  // ── Assets ──────────────────────────────────────────────────────────────────
  const storyTtsUrls: Record<string, string> = {}
  paragraphs.forEach(p => { storyTtsUrls[p.id] = paths.storyTtsBase(p.id) })

  const assets: StoryAssets = {
    sceneVideo: {
      status: 'missing',
      url: paths.sceneVideo,
      poster: paths.scenePoster,
    },
    scenePoster: {
      status: 'missing',
      url: paths.scenePoster,
    },
    ambience: {
      status: 'missing',
      url: paths.ambience,
      type: ambienceType,
      volume: ambienceVolume,
    },
    storyTts: {
      voice,
      urls: storyTtsUrls,
    },
    sceneImages: {
      enabled: false,
      status: 'missing' as const,
      syncMode: 'scene' as const,
      transition: 'fade' as const,
      kenBurns: true,
      images: scenes.map((s, i) => ({
        id: `scene-${String(i + 1).padStart(2, '0')}`,
        url: paths.sceneImage(s.id),
        alt: s.titleKo ?? s.title,
        prompt: s.imagePrompt ?? '',
        linkedParagraphIds: s.paragraphIds,
        durationSec: 8,
        status: 'missing' as const,
      })),
    },
  }

  // ── Metadata ─────────────────────────────────────────────────────────────────
  const allText   = paragraphs.map(p => p.english).join(' ')
  const wordCount = countWords(allText)
  const storyLength = paragraphs.reduce((sum, p) => sum + countSentences(p.english), 0)

  const metadata = {
    ...metadataOutput,
    storyLength,
    wordCount,
    sceneCount: scenes.length,
    patternCount: patterns.length,
  }

  // ── Version History ──────────────────────────────────────────────────────────
  const initialVersion: PackageVersion = {
    version: 'v1',
    createdAt: now,
    createdBy: generatedBy,
    changes: ['Initial package created'],
  }

  // ── Assemble Package ─────────────────────────────────────────────────────────
  const pkg: StoryPackage = {
    schemaVersion: '2.0',
    packageId: `story-${pad}`,
    language: 'en',
    createdAt: now,
    updatedAt: now,
    currentVersion: 'v1',
    history: [initialVersion],
    metadata,
    story: {
      id: storyId,
      title: storyOutput.title,
      subtitleKo: metadataOutput.titleKo,
      storyNote: storyOutput.storyNote,
      highlightPhrases: storyOutput.highlightPhrases,
    },
    assets,
    paragraphs,
    scenes,
    patterns,
    ttsQueue,
  }

  // ── QC 자동 실행 ──────────────────────────────────────────────────────────────
  const report = runQC(pkg)
  pkg.quality  = toPackageQuality(report)

  return pkg
}

// ── updatePackageVersion: 기존 패키지 업데이트 ────────────────────────────────

export type VersionUpdate = {
  changes: string[]
  updatedBy?: string
  assetUpdates?: Partial<StoryAssets>
}

export function updatePackageVersion(pkg: StoryPackage, update: VersionUpdate): StoryPackage {
  const now     = new Date().toISOString()
  const prevVer = parseInt(pkg.currentVersion.replace('v', ''), 10)
  const nextVer = `v${prevVer + 1}`

  const newVersion: PackageVersion = {
    version: nextVer,
    createdAt: now,
    createdBy: update.updatedBy ?? 'human',
    changes: update.changes,
  }

  const updatedAssets: StoryAssets = update.assetUpdates
    ? { ...pkg.assets, ...update.assetUpdates }
    : pkg.assets

  const updated: StoryPackage = {
    ...pkg,
    updatedAt: now,
    currentVersion: nextVer,
    history: [...pkg.history, newVersion],
    assets: updatedAssets,
  }

  // 에셋 변경 시 QC 재실행
  if (update.assetUpdates) {
    const report  = runQC(updated)
    updated.quality = toPackageQuality(report)
  }

  return updated
}

// ── markAssetReady: 에셋 하나를 ready로 전환 ──────────────────────────────────

export function markAssetReady(
  pkg: StoryPackage,
  asset: 'sceneVideo' | 'scenePoster' | 'ambience',
  url?: string,
  meta?: { model?: string; generatedAt?: string },
): StoryPackage {
  const assets = { ...pkg.assets }

  if (asset === 'sceneVideo') {
    assets.sceneVideo = {
      ...assets.sceneVideo,
      status: 'ready',
      ...(url ? { url } : {}),
      ...(meta ?? {}),
    }
  } else if (asset === 'scenePoster') {
    assets.scenePoster = { ...assets.scenePoster, status: 'ready', ...(url ? { url } : {}) }
  } else if (asset === 'ambience') {
    assets.ambience = { ...assets.ambience, status: 'ready', ...(url ? { url } : {}) }
  }

  return updatePackageVersion(pkg, {
    changes: [`${asset} marked as ready${url ? ` (${url})` : ''}`],
    updatedBy: 'system',
    assetUpdates: assets,
  })
}
