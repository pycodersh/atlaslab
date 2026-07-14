import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserWithPlan, getDailyUsage, incrementDailyUsage, logApiCall } from '@/lib/ai/rateLimit'

const ENDPOINT        = 'writing_studio'
const MODEL           = 'gpt-4o-mini'
const FREE_DAILY      = 3
const PREMIUM_DAILY   = 10
const MIN_WORDS       = 5
const MAX_WORDS       = 50

// ── Word counter ───────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// ── System prompt builder ──────────────────────────────────────────────────────

function buildSystemPrompt(todayPattern: string): string {
  return `You are an English writing coach for Korean learners. The user will submit 1-5 English sentences (max 50 words).
Your task:
1. Check if the input is valid English (not Korean, not gibberish)
2. Find grammar or unnatural expression errors
3. For each error: quote the wrong part and suggest correction
4. If the user used today's pattern correctly, praise them
5. Do NOT rewrite the whole sentence with strikethrough
Today's pattern: ${todayPattern}
Respond in JSON only: { "isValid": boolean, "invalidReason": string | null, "feedbacks": [ { "type": "fix" | "good" | "pattern", "wrong": string | null, "correct": string | null, "text": string } ] }`
}

// ── GET /api/writing — remaining count ────────────────────────────────────────

export async function GET() {
  const sessionClient = await createServerClient()
  const authedUser    = await getUserWithPlan(sessionClient)
  if (!authedUser) return NextResponse.json({ remaining: 0, limit: FREE_DAILY, plan: 'free' })

  const adminClient = createAdminClient()
  const { id: userId, plan } = authedUser
  const dailyLimit = plan === 'premium' ? PREMIUM_DAILY : FREE_DAILY
  const used       = await getDailyUsage(adminClient, userId, ENDPOINT)

  // Fetch last 10 records
  const { data: records } = await adminClient
    .from('writing_records')
    .select('id, mode, original, feedbacks, pattern, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    remaining: Math.max(0, dailyLimit - used),
    used,
    limit: dailyLimit,
    plan,
    records: records ?? [],
  })
}

// ── POST /api/writing ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.text || typeof body.text !== 'string') {
    return NextResponse.json({ error: 'text required' }, { status: 400 })
  }

  const { text, todayPattern = '', mode = 'free' } = body as {
    text: string
    todayPattern: string
    mode: 'free' | 'translation'
  }

  // ── Word validation ──────────────────────────────────────────────────────────
  const wc = countWords(text)
  if (wc < MIN_WORDS) {
    return NextResponse.json({ error: 'too_short', message: '조금 더 써보세요. 최소 5단어 이상이어야 해요.' }, { status: 422 })
  }
  if (wc > MAX_WORDS) {
    return NextResponse.json({ error: 'too_long' }, { status: 422 })
  }

  // ── Auth & plan ──────────────────────────────────────────────────────────────
  const sessionClient = await createServerClient()
  const authedUser    = await getUserWithPlan(sessionClient)
  const adminClient   = createAdminClient()

  if (!authedUser) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }

  const { id: userId, plan } = authedUser
  const dailyLimit = plan === 'premium' ? PREMIUM_DAILY : FREE_DAILY
  const used       = await getDailyUsage(adminClient, userId, ENDPOINT)

  if (used >= dailyLimit) {
    return NextResponse.json({
      error: 'rate_limited',
      used,
      limit: dailyLimit,
      plan,
    }, { status: 429 })
  }

  // ── OpenAI call ──────────────────────────────────────────────────────────────
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  let result: { isValid: boolean; invalidReason: string | null; feedbacks: unknown[] }
  let inputTokens: number | undefined
  let outputTokens: number | undefined

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildSystemPrompt(todayPattern) },
        { role: 'user',   content: text },
      ],
      max_tokens: 600,
      temperature: 0.3,
    })

    inputTokens  = completion.usage?.prompt_tokens
    outputTokens = completion.usage?.completion_tokens
    const raw    = completion.choices[0]?.message?.content ?? '{}'
    result       = JSON.parse(raw)
  } catch (err) {
    await logApiCall(adminClient, { userId, endpoint: ENDPOINT, model: MODEL, status: 'failed', reason: String(err) })
    return NextResponse.json({ error: 'ai_error' }, { status: 502 })
  }

  // ── Persist usage & record ───────────────────────────────────────────────────
  await incrementDailyUsage(adminClient, userId, ENDPOINT)
  await logApiCall(adminClient, { userId, endpoint: ENDPOINT, model: MODEL, status: 'success', inputTokens, outputTokens })

  // Save writing record (best-effort)
  try {
    await adminClient.from('writing_records').insert({
      user_id:   userId,
      mode,
      original:  text,
      feedbacks: result.feedbacks,
      pattern:   todayPattern,
    })
  } catch { /* table may not exist yet — non-fatal */ }

  return NextResponse.json({
    feedbacks:     result.feedbacks ?? [],
    isValid:       result.isValid ?? true,
    invalidReason: result.invalidReason ?? null,
    used:          used + 1,
    limit:         dailyLimit,
    plan,
  })
}
