/**
 * '너 vs 당신' 12초 쇼트 — Basics 글 korean-never-say-dangsin-neo 상단 영상(첫 번째 Basics 쇼트).
 *
 * 모션은 TemplateVideo 공통 템플릿이고, 문구는 videos.json 의 korean-never-say-dangsin-neo 항목이다.
 * MP4 는 `npm run render:dangsin` (remotion/index.ts 의 DangerPronouns 컴포지션)으로 뽑는다.
 */
import { TemplateVideo, BASICS_VIDEO } from './TemplateVideo'
import { BASICS_VIDEOS } from './videos'

export const DANGER_PRONOUNS = BASICS_VIDEO

export function DangerPronounsVideo() {
  return <TemplateVideo data={BASICS_VIDEOS['korean-never-say-dangsin-neo']} />
}
