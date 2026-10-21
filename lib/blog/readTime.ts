/** 읽는 데 걸리는 시간(분). 200 단어/분 기준의 흔한 어림값이다. 홈·/blog 목록이 같이 쓴다. */
export function readMinutes(content: string | null | undefined): number {
  const words = (content ?? '').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
