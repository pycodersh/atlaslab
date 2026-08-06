/**
 * K-PATTO 표현 북마크 관리
 *
 * - 비로그인: localStorage 전용
 * - 로그인:   localStorage ∪ DB → DB에 업서트, 이후 DB 우선
 * - 쓰기(토글): 로컬 + DB 동시 갱신
 *
 * kp_saved_expressions 스키마:
 *   user_id UUID PK, expression_id INT PK, saved_at TIMESTAMPTZ
 */
import { createClient } from '@/lib/supabase/client'

const SAVED_KEY = 'kpatto-saved-expressions'

// ── localStorage 헬퍼 ────────────────────────────────────────────────────────
function readLocal(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch { return [] }
}

function writeLocal(ids: number[]): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(ids)) } catch { /* noop */ }
}

/** ExpressionPopup에서 직접 읽는 경우를 위한 동기 함수 */
export function getSavedFromLocal(): Set<number> {
  return new Set(readLocal())
}

// ── DB 헬퍼 ──────────────────────────────────────────────────────────────────
async function fetchDbIds(userId: string): Promise<number[]> {
  const sb = createClient()
  const { data } = await sb
    .from('kp_saved_expressions')
    .select('expression_id')
    .eq('user_id', userId)
  return (data ?? []).map(r => r.expression_id as number)
}

async function upsertToDb(userId: string, ids: number[]): Promise<void> {
  if (!ids.length) return
  const sb = createClient()
  await sb
    .from('kp_saved_expressions')
    .upsert(
      ids.map(eid => ({ user_id: userId, expression_id: eid })),
      { onConflict: 'user_id,expression_id' },
    )
}

async function deleteFromDb(userId: string, expressionId: number): Promise<void> {
  const sb = createClient()
  await sb
    .from('kp_saved_expressions')
    .delete()
    .eq('user_id', userId)
    .eq('expression_id', expressionId)
}

// ── 공개 API ─────────────────────────────────────────────────────────────────

/**
 * 북마크된 표현 ID 집합을 반환한다.
 * - 비로그인: localStorage 읽기
 * - 로그인:   localStorage ∪ DB 합집합을 DB에 업서트 후 전체 반환
 */
export async function getSavedIds(): Promise<Set<number>> {
  const localIds = readLocal()
  const sb       = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return new Set(localIds)

  let dbIds: number[]
  try {
    dbIds = await fetchDbIds(user.id)
  } catch {
    return new Set(localIds)   // DB 실패 시 로컬 폴백
  }

  // localStorage에만 있는 항목 → DB에 업서트 (합집합)
  const onlyLocal = localIds.filter(id => !dbIds.includes(id))
  if (onlyLocal.length > 0) {
    try { await upsertToDb(user.id, onlyLocal) } catch { /* noop */ }
  }

  return new Set([...dbIds, ...localIds])   // 합집합 반환
}

/**
 * 북마크를 토글한다.  현재 상태를 알아서 저장/삭제.
 * @returns saved - 토글 후 저장 상태
 */
export async function toggleSaved(exprId: number): Promise<{ saved: boolean }> {
  const local   = readLocal()
  const isSaved = local.includes(exprId)

  if (isSaved) {
    // ── 삭제 ──────────────────────────────────────────────────────────
    writeLocal(local.filter(id => id !== exprId))
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (user) {
      try { await deleteFromDb(user.id, exprId) } catch { /* noop */ }
    }
    return { saved: false }
  } else {
    // ── 저장 ──────────────────────────────────────────────────────────
    writeLocal([...local, exprId])
    const sb = createClient()
    const { data: { user } } = await sb.auth.getUser()
    if (user) {
      try { await upsertToDb(user.id, [exprId]) } catch { /* noop */ }
    }
    return { saved: true }
  }
}
