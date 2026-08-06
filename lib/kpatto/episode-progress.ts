/**
 * episode-progress.ts
 *
 * 에피소드 완료 진행도의 단일 진실 공급원(single source of truth).
 * "완료" = 챌린지 1회 통과.
 *
 * ┌────────────┬───────────────────────────────────────┐
 * │ 사용자     │ 저장 위치                             │
 * ├────────────┼───────────────────────────────────────┤
 * │ 비로그인   │ localStorage ('kpatto-ep-progress')   │
 * │ 로그인     │ Supabase kp_episode_progress + local  │
 * └────────────┴───────────────────────────────────────┘
 *
 * 충돌 해결: DB 우선 (로컬만 있는 항목은 DB로 병합, 양쪽에 있으면 DB 값 유지)
 */

import { createClient } from '@/lib/supabase/client'

// ── 타입 ─────────────────────────────────────────────────────────────────────

export type EpProgressRecord = {
  completed_at:    string   // ISO 8601
  completed_count: number   // 챌린지 통과 횟수
}

/** episode_num → { completed_at, completed_count } */
export type EpProgressMap = Map<number, EpProgressRecord>

// ── localStorage ──────────────────────────────────────────────────────────────

const LOCAL_KEY = 'kpatto-ep-progress'

function readLocal(): Record<number, EpProgressRecord> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{}') } catch { return {} }
}

function writeLocal(store: Record<number, EpProgressRecord>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_KEY, JSON.stringify(store))
}

// ── Sync guard (세션당 1회) ──────────────────────────────────────────────────

let _syncedThisSession = false

// ── DB 조회 ──────────────────────────────────────────────────────────────────

async function fetchDbMap(userId: string): Promise<EpProgressMap> {
  const sb = createClient()
  const { data } = await sb
    .from('kp_episode_progress')
    .select('episode_num, completed_at, completed_count')
    .eq('user_id', userId)
  const map: EpProgressMap = new Map()
  for (const r of data ?? []) {
    map.set(r.episode_num as number, {
      completed_at:    r.completed_at    as string,
      completed_count: r.completed_count as number,
    })
  }
  return map
}

// ── Local → DB 병합 ──────────────────────────────────────────────────────────
//
// 병합 규칙 (max count 우선):
//   - DB에 없는 항목 → INSERT
//   - 양쪽에 있는 항목 → completed_count가 큰 쪽으로 upsert
//                         (같으면 completed_at이 더 늦은 쪽)
//   - DB가 더 크거나 같으면 → 변경 없음
//   - 병합 후 localStorage는 그대로 유지

async function mergeLocalToDb(userId: string, dbMap: EpProgressMap): Promise<void> {
  const local = readLocal()

  const toUpsert = Object.entries(local)
    .filter(([ep, rec]) => {
      const dbRec = dbMap.get(Number(ep))
      if (!dbRec) return true                                    // DB에 없음 → 삽입
      return rec.completed_count > dbRec.completed_count         // local이 더 많음 → 갱신
    })
    .map(([ep, rec]) => {
      const dbRec = dbMap.get(Number(ep))
      // completed_at: 두 타임스탬프 중 더 늦은 쪽
      const laterAt = dbRec
        ? (rec.completed_at > dbRec.completed_at ? rec.completed_at : dbRec.completed_at)
        : rec.completed_at
      return {
        user_id:         userId,
        episode_num:     Number(ep),
        completed_at:    laterAt,
        completed_count: rec.completed_count,   // 이미 local > db 또는 db 없음
      }
    })

  if (toUpsert.length === 0) return
  const sb = createClient()
  await sb
    .from('kp_episode_progress')
    .upsert(toUpsert, { onConflict: 'user_id,episode_num' })
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * 전체 완료 진행도 맵을 반환한다.
 * 로그인 상태이면 DB(+ 세션당 1회 local→DB 병합), 비로그인이면 localStorage.
 */
export async function getEpisodeProgressMap(): Promise<EpProgressMap> {
  const sb   = createClient()
  const { data: { user } } = await sb.auth.getUser()

  if (user) {
    const dbMap = await fetchDbMap(user.id)
    if (!_syncedThisSession) {
      _syncedThisSession = true
      await mergeLocalToDb(user.id, dbMap)
      return fetchDbMap(user.id)   // 병합 후 재조회
    }
    return dbMap
  }

  // 비로그인: localStorage
  const local = readLocal()
  const map: EpProgressMap = new Map()
  for (const [ep, rec] of Object.entries(local)) {
    map.set(Number(ep), rec)
  }
  return map
}

/**
 * 완료된 에피소드 번호의 Set을 반환한다.
 */
export async function getCompletedEpisodeSet(): Promise<Set<number>> {
  const map = await getEpisodeProgressMap()
  return new Set(map.keys())
}

/**
 * 가장 높은 완료 에피소드 번호를 반환한다. 없으면 0.
 */
export async function getMaxCompletedEpisode(): Promise<number> {
  const map = await getEpisodeProgressMap()
  if (map.size === 0) return 0
  return Math.max(...map.keys())
}

/**
 * 에피소드를 완료로 표시한다 (챌린지 1회 통과 시 호출).
 * localStorage는 항상 갱신, 로그인 상태면 DB도 갱신.
 */
export async function markEpisodeComplete(episodeNum: number): Promise<void> {
  const now = new Date().toISOString()

  // 1. localStorage 갱신 (항상)
  const local = readLocal()
  const prev  = local[episodeNum]
  local[episodeNum] = {
    completed_at:    now,
    completed_count: (prev?.completed_count ?? 0) + 1,
  }
  writeLocal(local)

  // 2. DB 갱신 (로그인 시)
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return

  const { data: existing } = await sb
    .from('kp_episode_progress')
    .select('completed_count')
    .eq('user_id', user.id)
    .eq('episode_num', episodeNum)
    .maybeSingle()

  const nextCount = (existing?.completed_count ?? 0) + 1

  await sb
    .from('kp_episode_progress')
    .upsert(
      {
        user_id:         user.id,
        episode_num:     episodeNum,
        completed_at:    now,
        completed_count: nextCount,
      },
      { onConflict: 'user_id,episode_num' },
    )
}
