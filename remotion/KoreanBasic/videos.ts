import type { BasicsVideoData } from './TemplateVideo'
import raw from './videos.json'

/**
 * Basics 쇼트 데이터 — slug → TemplateVideo 에 넣을 문구. 원본은 videos.json(보이스오버 스크립트도 같은 파일을 읽는다).
 * JSON 은 튜플 · 리터럴 타입을 잃어서 여기서 한 번만 단언한다.
 */
export const BASICS_VIDEOS = raw as unknown as Record<string, BasicsVideoData>

export type BasicsVideoSlug = keyof typeof raw
