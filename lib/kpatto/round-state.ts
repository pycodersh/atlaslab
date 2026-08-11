/**
 * round-state.ts
 *
 * 에피소드 학습 회차의 진행 중 상태(세 조건)를 localStorage에 저장·조회.
 *
 * 키: kpatto-ep-round-{epNum}
 *
 * 확정된 회차(completed_count / completed_at)는
 * kp_episode_progress(DB) + kpatto-ep-progress(localStorage)가 정본.
 * 이 모듈은 현재 진행 중인 회차의 상태(세 조건)만 추적한다.
 *
 * ┌─────────────────┬────────────────────────────────────────────────────┐
 * │ listen_done     │ audio_url이 있는 말풍선 + 표현 음성을 모두 재생 시작  │
 * │ read_done       │ 사용자가 "완료" 버튼을 탭                           │
 * │ challenge_done  │ 챌린지 5문제를 모두 제출                             │
 * └─────────────────┴────────────────────────────────────────────────────┘
 */

export type RoundState = {
  listen_done:           boolean
  read_done:             boolean
  challenge_done:        boolean
  /** audio_url이 있는 말풍선 중 재생을 시작한 ID 목록 */
  played_bubble_ids:     string[]
  /** audio_url이 있는 표현 중 재생을 시작한 ID 목록 */
  played_expression_ids: number[]
}

const KEY_PREFIX = 'kpatto-ep-round-'

function getKey(epNum: number): string {
  return `${KEY_PREFIX}${epNum}`
}

export function defaultRoundState(): RoundState {
  return {
    listen_done:           false,
    read_done:             false,
    challenge_done:        false,
    played_bubble_ids:     [],
    played_expression_ids: [],
  }
}

export function readRoundState(epNum: number): RoundState {
  if (typeof window === 'undefined') return defaultRoundState()
  try {
    const raw = localStorage.getItem(getKey(epNum))
    if (!raw) return defaultRoundState()
    const p = JSON.parse(raw) as Partial<RoundState>
    return {
      listen_done:           p.listen_done           ?? false,
      read_done:             p.read_done             ?? false,
      challenge_done:        p.challenge_done        ?? false,
      played_bubble_ids:     p.played_bubble_ids     ?? [],
      played_expression_ids: p.played_expression_ids ?? [],
    }
  } catch { return defaultRoundState() }
}

export function writeRoundState(epNum: number, state: RoundState): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(getKey(epNum), JSON.stringify(state)) } catch { /* noop */ }
}

export function clearRoundState(epNum: number): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(getKey(epNum)) } catch { /* noop */ }
}

// ── Listening 판정 내부 헬퍼 ────────────────────────────────────────────────

function checkListenDone(
  playedBubbles:      Set<string>,
  playedExprs:        Set<number>,
  audioBubbleIds:     Set<string>,
  audioExpressionIds: Set<number>,
): boolean {
  // 이 화에 음성이 하나도 없으면 → Listening 자동 완료
  if (audioBubbleIds.size === 0 && audioExpressionIds.size === 0) return true
  const bubblesDone = audioBubbleIds.size === 0
    || [...audioBubbleIds].every(id => playedBubbles.has(id))
  const exprsDone   = audioExpressionIds.size === 0
    || [...audioExpressionIds].every(id => playedExprs.has(id))
  return bubblesDone && exprsDone
}

// ── 공개 업데이트 헬퍼 ───────────────────────────────────────────────────────

/**
 * 말풍선 음성 재생을 기록하고 Listening 조건을 갱신한다.
 * 이미 기록된 말풍선이면 동일 객체 참조를 반환한다(불필요한 re-render 방지).
 */
export function onBubblePlayed(
  state:              RoundState,
  bubbleId:           string,
  audioBubbleIds:     Set<string>,
  audioExpressionIds: Set<number>,
): RoundState {
  if (state.played_bubble_ids.includes(bubbleId)) return state
  const newPlayedBubbles = [...state.played_bubble_ids, bubbleId]
  const listen_done = state.listen_done || checkListenDone(
    new Set(newPlayedBubbles),
    new Set(state.played_expression_ids),
    audioBubbleIds,
    audioExpressionIds,
  )
  return { ...state, played_bubble_ids: newPlayedBubbles, listen_done }
}

/**
 * 표현 팝업 음성 재생을 기록하고 Listening 조건을 갱신한다.
 * 이미 기록된 표현이면 동일 객체 참조를 반환한다.
 */
export function onExpressionPlayed(
  state:              RoundState,
  expressionId:       number,
  audioBubbleIds:     Set<string>,
  audioExpressionIds: Set<number>,
): RoundState {
  if (state.played_expression_ids.includes(expressionId)) return state
  const newPlayedExprs = [...state.played_expression_ids, expressionId]
  const listen_done = state.listen_done || checkListenDone(
    new Set(state.played_bubble_ids),
    new Set(newPlayedExprs),
    audioBubbleIds,
    audioExpressionIds,
  )
  return { ...state, played_expression_ids: newPlayedExprs, listen_done }
}

/**
 * 음성이 없는 화에서 Listening을 자동 완료 처리한다.
 * audioBubbleIds · audioExpressionIds 둘 다 empty이면 listen_done = true.
 */
export function autoCompleteListenIfNoAudio(
  state:              RoundState,
  audioBubbleIds:     Set<string>,
  audioExpressionIds: Set<number>,
): RoundState {
  if (state.listen_done) return state
  if (audioBubbleIds.size === 0 && audioExpressionIds.size === 0) {
    return { ...state, listen_done: true }
  }
  return state
}
