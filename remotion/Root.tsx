import { Composition } from 'remotion'
import { DangerPronounsVideo, DANGER_PRONOUNS } from './KoreanBasic/DangerPronounsVideo'
import { TemplateVideo, BASICS_VIDEO } from './KoreanBasic/TemplateVideo'
import { BASICS_VIDEOS } from './KoreanBasic/videos'

/**
 * Remotion CLI 진입점이 등록하는 컴포지션 목록 — 렌더는 package.json 의 render:* 스크립트로.
 * Basics 쇼트는 slug 가 곧 컴포지션 id 다: npx remotion render remotion/index.ts <slug> out/remotion/<slug>.mp4
 */
export function RemotionRoot() {
  return (
    <>
      <Composition id="DangerPronouns" component={DangerPronounsVideo} {...DANGER_PRONOUNS} />
      {Object.entries(BASICS_VIDEOS).map(([slug, data]) => (
        <Composition key={slug} id={slug} component={TemplateVideo} defaultProps={{ data }} {...BASICS_VIDEO} />
      ))}
    </>
  )
}
