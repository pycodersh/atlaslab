/**
 * '너 vs 당신' 12초 쇼트 — Basics 글 korean-never-say-dangsin-neo 상단 영상(첫 번째 Basics 쇼트).
 *
 * 모션은 TemplateVideo 공통 템플릿이고, 문구는 videos.json 의 korean-never-say-dangsin-neo 항목이다.
 * MP4 는 `npm run render:dangsin` (remotion/index.ts 의 DangerPronouns 컴포지션)으로 뽑는다.
 */
import { TemplateVideo, BASICS_VIDEO, videoLayout } from './TemplateVideo'
import { BASICS_VIDEOS } from './videos'

/** 길이는 오디오 · 상황극에 맞춘다(2026-11-17 이중 보이스판으로 바꾼 뒤 12초 고정이 아니다) */
export const DANGER_PRONOUNS = { ...BASICS_VIDEO, durationInFrames: videoLayout(BASICS_VIDEOS['korean-never-say-dangsin-neo']).total }

export function DangerPronounsVideo() {
  return <TemplateVideo data={BASICS_VIDEOS['korean-never-say-dangsin-neo']} />
}
