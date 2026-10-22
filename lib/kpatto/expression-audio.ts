/**
 * 표현(kp_expressions) 음성의 캐시 무효화 버전.
 *
 * Storage 경로(expressions/{slug}/{name}.mp3)를 바꾸지 않고 파일만 덮어쓰기 때문에,
 * 브라우저·CDN 이 이전 mp3 를 계속 내줄 수 있다. 쿼리스트링은 캐시 키에 포함되므로
 * 음성을 다시 만들 때마다 이 값을 올리면 모든 기기가 새 파일을 받는다.
 * (2: 2026-10-22 Edge-TTS ko-KR-SunHiNeural 로 전체 교체
 *  3: 같은 날 의문문 pitch +14% 재합성 + 슬롯 패턴 13개 예문 교체
 *  4: 의문문을 '?' 어절만 pitch +20% 로 다시 합성)
 */
export const EXPRESSION_AUDIO_VERSION = '4'

export function versionedExpressionAudio<T extends string | null | undefined>(url: T): T {
  if (!url) return url
  return `${url}${url.includes('?') ? '&' : '?'}v=${EXPRESSION_AUDIO_VERSION}` as T
}
