/**
 * 잠긴 레시피의 조리 단계 — 공개 키로는 RLS 에 막히므로 서버 경로(/api/kpantry/recipe-steps)로 받는다.
 * 서버가 패스 쿠키·Pro 구독을 확인한다. 권한이 없으면(403) null.
 */
export async function fetchRecipeSteps(slug: string): Promise<any[] | null> {
  try {
    const res = await fetch(`/api/kpantry/recipe-steps?slug=${encodeURIComponent(slug)}`, {
      credentials: 'same-origin',
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    return Array.isArray(json?.steps) ? json.steps : null
  } catch {
    return null
  }
}
