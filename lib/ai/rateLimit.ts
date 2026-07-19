/**
 * Server-side rate limiting, usage tracking, and API call logging.
 * Import only from API routes — never from client components.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// ── Limits ─────────────────────────────────────────────────────────────────────

export const REVIEW_DAILY_FREE    = 2
export const REVIEW_DAILY_PREMIUM = 10

// ── Estimated cost per 1 000 tokens (USD) ─────────────────────────────────────

const COST_PER_1K: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini':               { input: 0.000150, output: 0.000600 },
  'claude-haiku-4-5-20251001': { input: 0.000800, output: 0.004000 },
}

function estimateCost(model: string, input?: number, output?: number): number | undefined {
  const r = COST_PER_1K[model]
  if (!r || input == null) return undefined
  return (input / 1000) * r.input + ((output ?? 0) / 1000) * r.output
}

// ── User + plan ────────────────────────────────────────────────────────────────

export type UserPlan = 'free' | 'premium'
export type AuthedUser = { id: string; plan: UserPlan }

/** Resolves user from session cookies and reads plan from user_profiles. */
export async function getUserWithPlan(
  sessionClient: SupabaseClient,
): Promise<AuthedUser | null> {
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return null

  const { data: profile } = await sessionClient
    .from('user_profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  return { id: user.id, plan: (profile?.plan ?? 'free') as UserPlan }
}

// ── Daily usage ────────────────────────────────────────────────────────────────

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export async function getDailyUsage(
  adminClient: SupabaseClient,
  userId: string,
  endpoint: string,
): Promise<number> {
  const { data } = await adminClient
    .from('ai_daily_usage')
    .select('count')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .eq('date', todayUTC())
    .single()
  return data?.count ?? 0
}

/** Atomically inserts or increments the daily counter via DB function. */
export async function incrementDailyUsage(
  adminClient: SupabaseClient,
  userId: string,
  endpoint: string,
): Promise<void> {
  await adminClient.rpc('increment_ai_usage', {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_date: todayUTC(),
  })
}

// ── Rate limit check ───────────────────────────────────────────────────────────

export type RateLimitResult =
  | { allowed: true;  used: number; limit: number }
  | { allowed: false; used: number; limit: number }

export async function checkRateLimit(
  adminClient: SupabaseClient,
  userId: string,
  endpoint: string,
  plan: UserPlan,
): Promise<RateLimitResult> {
  const limit = plan === 'premium' ? REVIEW_DAILY_PREMIUM : REVIEW_DAILY_FREE
  const used  = await getDailyUsage(adminClient, userId, endpoint)
  return used < limit
    ? { allowed: true,  used, limit }
    : { allowed: false, used, limit }
}

// ── API call logging ───────────────────────────────────────────────────────────

export type LogStatus = 'success' | 'failed' | 'cached' | 'rejected'

export interface LogEntry {
  userId:       string | null
  endpoint:     string
  model:        string
  status:       LogStatus
  reason?:      string
  inputTokens?: number
  outputTokens?: number
}

/** Fire-and-forget log write. Never throws — logging must not break request flow. */
export async function logApiCall(
  adminClient: SupabaseClient,
  entry: LogEntry,
): Promise<void> {
  try {
    await adminClient.from('ai_api_logs').insert({
      user_id:        entry.userId,
      endpoint:       entry.endpoint,
      model:          entry.model,
      status:         entry.status,
      reason:         entry.reason ?? null,
      input_tokens:   entry.inputTokens ?? null,
      output_tokens:  entry.outputTokens ?? null,
      estimated_cost: estimateCost(entry.model, entry.inputTokens, entry.outputTokens) ?? null,
    })
  } catch (err) {
    console.error('[ai/log] write failed:', err)
  }
}
