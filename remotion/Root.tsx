import { Composition } from 'remotion'
import { DangerPronounsVideo, DANGER_PRONOUNS } from './KoreanBasic/DangerPronounsVideo'

/** Remotion CLI 진입점이 등록하는 컴포지션 목록 — 렌더는 package.json 의 render:* 스크립트로 */
export function RemotionRoot() {
  return (
    <>
      <Composition id="DangerPronouns" component={DangerPronounsVideo} {...DANGER_PRONOUNS} />
    </>
  )
}
