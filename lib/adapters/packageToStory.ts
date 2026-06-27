/**
 * StoryPackage → MagazineStory Adapter
 *
 * Reader는 MagazineStory 타입을 그대로 쓰고,
 * 데이터 원본을 StoryPackage 하나로 통일한다.
 *
 * 우선순위:
 *   Poster  : assets.sceneVideo.poster → assets.scenePoster.url → ''
 *   Video   : status='ready' && url 있음 → sceneVideo 전달, 아니면 missing 전달
 *   Ambience: assets.ambience.url만 사용
 */

import type { StoryPackage } from '@/types/factory'
import type {
  MagazineStory,
  MagazineParagraph,
  MagazinePattern,
  MagazineScene,
  SceneVideo,
  StoryAmbience,
  StorySlideImage,
  AmbienceId,
  AmbienceType,
} from '@/types/magazine'

export function packageToStory(pkg: StoryPackage): MagazineStory {
  const { story, assets, paragraphs, patterns, scenes, metadata } = pkg

  // ── 개발 모드 검증 ────────────────────────────────────────────────────────
  if (process.env.NODE_ENV === 'development') {
    const sid = String(story.id).padStart(3, '0')
    if (!assets.sceneVideo.url.includes(`story${sid}`) && assets.sceneVideo.status === 'ready') {
      console.warn(`[StoryPackage] Asset mismatch: story=${sid} video=${assets.sceneVideo.url}`)
    }
    if (!assets.ambience.url.includes(`story${sid}`) && assets.ambience.status === 'ready') {
      console.warn(`[StoryPackage] Asset mismatch: story=${sid} ambience=${assets.ambience.url}`)
    }
    console.log(`[StoryPackage] Loaded story-${sid}: "${story.title}" (${paragraphs.length}p / ${patterns.length}pt)`)
  }

  // ── Poster 우선순위 ───────────────────────────────────────────────────────
  const imageUrl =
    assets.sceneVideo.poster ??
    (assets.scenePoster.status === 'ready' ? assets.scenePoster.url : '') ??
    ''

  // ── SceneVideo 매핑 ───────────────────────────────────────────────────────
  const sceneVideo: SceneVideo = {
    status: assets.sceneVideo.status,
    url: assets.sceneVideo.url,
    poster: assets.sceneVideo.poster,
    source: assets.sceneVideo.source as SceneVideo['source'],
    prompt: assets.sceneVideo.prompt,
  }

  // ── Ambience 매핑 ─────────────────────────────────────────────────────────
  const ambience: StoryAmbience = {
    enabled: assets.ambience.status === 'ready',
    url: assets.ambience.url,
    type: assets.ambience.type as AmbienceType,
    volume: assets.ambience.volume,
  }

  // ── Paragraphs 매핑 ───────────────────────────────────────────────────────
  const mappedParagraphs: MagazineParagraph[] = paragraphs.map(p => ({
    id: p.id,
    english: p.english,
    koreanTranslation: p.koreanTranslation,
    keyExpressions: p.keyExpressions,
  }))

  // ── Patterns 매핑 ─────────────────────────────────────────────────────────
  const mappedPatterns: MagazinePattern[] = patterns.map(pt => ({
    id: pt.id,
    pattern: pt.pattern,
    meaningKo: pt.meaningKo,
    storySentence: pt.storySentence,
    storySentenceKo: pt.storySentenceKo,
    variationSentence: pt.variationSentence,
    variationSentenceKo: pt.variationSentenceKo,
    explanation: pt.explanation,
    examples: pt.examples,
  }))

  // ── Scenes 매핑 ───────────────────────────────────────────────────────────
  const mappedScenes: MagazineScene[] = scenes.map(sc => ({
    id: sc.id,
    title: sc.title,
    titleKo: sc.titleKo,
    paragraphIds: sc.paragraphIds,
    patternIds: sc.patternIds,
    imagePrompt: sc.imagePrompt,
    videoPrompt: sc.videoPrompt,
    ambiencePrompt: sc.ambiencePrompt,
  }))

  // ── Scene Images → Slide Images 매핑 ────────────────────────────────────────
  // status: 'missing'인 이미지도 그대로 전달 (Slider에서 placeholder 처리)
  const slideImages: StorySlideImage[] | undefined = assets.sceneImages?.enabled
    ? assets.sceneImages.images.map(img => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        status: img.status,
        sceneId: img.id,
        linkedParagraphIds: img.linkedParagraphIds,
        durationSec: img.durationSec,
      }))
    : undefined

  const slideshowInterval = assets.sceneImages?.images?.[0]?.durationSec ?? 8
  const slideshowKenBurns = assets.sceneImages?.kenBurns ?? true

  return {
    id: story.id,
    title: story.title,
    subtitleKo: story.subtitleKo,
    imageUrl,
    imageAlt: metadata.title,
    storyNote: story.storyNote,
    highlightPhrases: story.highlightPhrases,
    ambienceId: story.ambienceId as AmbienceId | undefined,
    sceneVideo,
    ambience,
    paragraphs: mappedParagraphs,
    patterns: mappedPatterns,
    scenes: mappedScenes,
    slideImages,
    slideshowInterval,
    slideshowKenBurns,
  }
}
