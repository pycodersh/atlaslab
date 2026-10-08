/**
 * 영문 글로벌 아티클 자동 생성 파이프라인.
 *
 * blog.atlaslabstudios.com(별도 저장소 atlaslab-blog)의
 * scripts/generate-blog-post.mjs 구조(Gemini, 모델 폴백, 자가 수정 재시도,
 * 검증 규칙)를 가져오되 세 가지가 다르다:
 *   - Google Search 그라운딩을 쓰지 않는다. 무료 티어 키는 그라운딩 호출이 429 라서
 *     모델 자체 지식만으로 쓴다(비용 0원 운영). 그래서 요금·수수료 같이 바뀌는 수치는
 *     프롬프트에서 "약 ~원 안팎" 또는 "공식 사이트 확인 권장"으로만 쓰게 막아 둔다.
 *   - 출력 대상이 파일(content/posts/*.md)이 아니라 Supabase blog_posts 행이다.
 *     이 사이트(atlaslabstudios.com / patto 저장소)는 블로그가 100% DB 기반이고
 *     파일 기반 글이 없다.
 *   - 썸네일은 코드맵이 아니라 blog_posts.thumbnail 컬럼(2026-10-01 마이그레이션
 *     032_blog_posts_thumbnail.sql)에 Pexels 이미지 URL을 직접 저장한다.
 *     로컬 파일을 받지 않으므로 배포를 기다릴 필요가 없다.
 *
 * 카테고리는 Life in Korea / Korean food 둘뿐이다. Korean phrases 는
 * 유튜브 쇼츠 연계로 수동 작성하므로 이 파이프라인 대상이 아니다.
 *
 * 검증을 통과하면 생성 즉시 공개(is_paused: false)된다. 단 대기열 항목에 sensitive: true 가
 * 있거나 키워드가 SENSITIVE_RE(비자·계좌·임대차·보험 등)에 걸리면 자동으로 초안이 된다(--publish 로 무시).
 * 검수 후 올리고 싶으면 --draft 를 붙인다 — 그러면 비공개로 들어가고, 나중에
 *   npx tsx scripts/publish-global-draft.ts <slug>
 * 로 공개 전환한다.
 *
 *   node scripts/generate-global-post.mjs              대기열 최상위 1건 생성 + 즉시 공개
 *   node scripts/generate-global-post.mjs --draft       생성만 하고 비공개(초안)로 넣기
 *   node scripts/generate-global-post.mjs --dry-run     DB에 쓰지 않고 결과만 출력
 *   node scripts/generate-global-post.mjs --id 2        특정 키워드 id 로 생성
 *   node scripts/generate-global-post.mjs --keyword "..." --category life-in-korea   대기열 밖 즉석 생성
 *
 * 환경변수 (patto/.env.local 또는 셸):
 *   GEMINI_API_KEY              필수
 *   GEMINI_MODEL                선택, Flash 계열만 허용 (기본 gemini-3.8-flash → 3.5-flash → 3.1-flash-lite 순)
 *                               GEMINI_API_KEY 는 결제수단이 연결되지 않은 무료 티어 키여야 한다(402 면 즉시 중단).
 *   PEXELS_API_KEY               필수(없으면 썸네일 없이 생성 — 중단하지 않는다)
 *   NEXT_PUBLIC_SUPABASE_URL             필수
 *   SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY   필수(서비스 롤 — RLS 우회 INSERT)
 *
 * 출력물
 *   blog_posts 행 1개 (기본 is_paused: false — 생성 즉시 공개. --draft 면 true)
 *   scripts/data/generated-global/<slug>.json   참고 출처 + 실행 기록 (git 제외)
 *   scripts/keywords-global.json                해당 항목 status: published 로 갱신
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const ROOT = process.cwd()
const QUEUE_PATH = path.join(ROOT, 'scripts', 'keywords-global.json')
const LOG_DIR = path.join(ROOT, 'scripts', 'data', 'generated-global')

// life-in-korea / korean-food 만 대상이다. korean-phrase 는 수동(유튜브 쇼츠 연계)이라 제외.
const CATEGORIES = {
  'life-in-korea': { label: 'Life in Korea', app: 'k-patto', category: 'Korean Culture' },
  'korean-food':   { label: 'Korean food',   app: 'k-pantry', category: 'Cooking Basics' },
}
const MIN_WORDS = 1200
const MAX_WORDS = 1500

// 법·규정·금액이 민감한 주제는 검색 그라운딩 없이 쓰면 틀린 수치가 나갈 수 있다.
// 대기열 항목에 sensitive: true 가 있거나 키워드가 아래 패턴에 걸리면 자동으로 초안(비공개)으로
// 넣는다. 공개는 검수 후 publish-global-draft.ts 로. 그래도 즉시 공개하려면 --publish.
const SENSITIVE_RE = /\b(visa|alien registration|ARC card|bank account|banking|insurance|jeonse|wolse|rental deposit|lease|tenancy|immigration|work permit|residence permit|tax refund|income tax|pension)\b/i

/* ---------- 작은 유틸 ---------- */

const argv = process.argv.slice(2)
const flag = name => argv.includes(`--${name}`)
const option = name => {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null
}

/** .env.local 로더. 값 앞에 BOM(U+FEFF)이 붙어 들어오는 사고가 있어서 떼고 읽는다. */
function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local')
  if (!fs.existsSync(p)) return
  for (const raw of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const line = raw.replace(/^﻿/, '').trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim().replace(/^﻿/, '')
    if (/^["'].*["']$/.test(value)) value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}

function nowKst() {
  const kst = new Date(Date.now() + 9 * 3600 * 1000)
  const p = n => String(n).padStart(2, '0')
  return {
    date: `${kst.getUTCFullYear()}-${p(kst.getUTCMonth() + 1)}-${p(kst.getUTCDate())}`,
    iso: new Date().toISOString(),
  }
}

const wordCount = s => s.trim().split(/\s+/).filter(Boolean).length

/* ---------- 프롬프트 ---------- */

const SYSTEM_INSTRUCTION = `You are the senior global guide editor for "Atlas Lab — Life in Korea", writing practical action guides in English for foreign travelers, international students, and expats living in Korea.

[Tone]
- Minimal magazine style. No warm greetings, no rhetorical questions ("Have you ever...?"), no emoji.
- Clear, direct, professional sentences (imperative or declarative — "Do this", "Expect to pay roughly X").

[Structure]
- The first 1-2 sentences must give the direct, core answer to what the reader is searching for (a Quick Verdict). Do not open with history or general background.
- Do not generate a table of contents. Do not use generic filler headings like "Introduction", "Overview", "Conclusion", or "Final Thoughts".
- 3-5 H2 (##) sections. Use H3 only when genuinely needed inside a section.
- Include at least one markdown table (cost, options, flavor profile, phrases, or pros/cons — it does not need to pit two things against each other), at least one blockquote (>), and at least one bullet list.
- Include a clear step-by-step action guide (Step 1, Step 2, Step 3) the reader can follow immediately.

[Format — do not default to "A vs B"]
- Do NOT build every article as a head-to-head "A vs B" comparison. Only use a comparison structure when the keyword itself names two or more things to compare (it contains "vs" or "versus"). Never invent a rival item just to create a contrast, and never put "vs" in the title unless the keyword does.
- When the keyword is about ONE food, place, custom, service, or situation, write an in-depth single-subject deep-dive guide that covers that one subject thoroughly. Build the H2 sections from this template (write descriptive headings specific to the subject, never the template labels themselves; combine or reorder when it reads better):
  1. What it is and where it comes from — a short story, origin, or background that makes the subject click (the Quick Verdict above still comes first).
  2. How locals order, use, or enjoy it — practical tips: where to go, what to say, what to pick, how it is served or done.
  3. Flavor, character, and best pairings (food) or what to expect and best ways to do it (place, custom, service) — include a table here (e.g., variations, flavor profile, or recommended combinations).
  4. Common mistakes and etiquette — what foreigners often get wrong, and what to avoid.
  5. Must-know Korean phrases — 3-4 phrases in Hangul with romanization and a plain English meaning (a list or table).
  The Step 1-2-3 guide can live inside section 2. Keep the whole article inside the word range; do not pad.

[Practical content]
- Write from the point of view of a foreign tourist or resident. Make it friendly, detailed, and genuinely useful.
- Include concrete, practical tips: real Korean expressions with Hangul and romanization (for example "카드로 결제할게요 / kadeu-ro gyeolje-halgeyo"), step-by-step methods, and cultural etiquette (what locals do, what to avoid, common mistakes).
- Prefer specific, actionable detail over general statements: where to look, what to tap or say, what happens next.

[Facts — no web search is available]
- You have no search tool. Write from your own knowledge and do not claim to have checked anything online. Never invent a source, statistic, or quote.
- Do not state exact figures that change over time as if they were certain: subway and bus fares, taxi fares, visa fees, administrative or insurance costs, prices, opening hours, deadlines, quotas, or recently changed rules.
- Write such figures as rough ranges ("approx. 1,000-2,000 KRW", "around 10,000 KRW or so"), or leave the number out and point the reader to the official website, the Korean app, or the on-site ticket machine or counter ("check the current fare on the official website or at the ticket machine").
- Stable facts (how a system works, terms, etiquette, step order, name of an app or office) can be stated plainly. If you are unsure whether something is still true, say so briefly and recommend checking the official source.

[Length]
- Body (excluding frontmatter) must be ${MIN_WORDS}-${MAX_WORDS} words. Aim for about ${Math.round((MIN_WORDS + MAX_WORDS) / 2)}. Reach the length with useful detail (examples, phrases, etiquette, common mistakes), not repetition.

[Output format]
- Output ONLY YAML frontmatter starting with '---', followed by the markdown body. Do not wrap the output in a code fence.
- Frontmatter fields, in this exact order:
---
title: "Clear, high-CTR title solving the reader's specific search intent"
description: "1-2 sentence concise executive summary"
slug: "english-kebab-case-slug"
category: "life-in-korea | korean-food"
tags: ["tag1", "tag2", "tag3", "tag4"]
pexelsQuery: "short concrete English search query for a representative stock photo"
readTime: 6
---
- slug: lowercase English letters, numbers and hyphens only, 3-7 words summarizing the keyword.
- pexelsQuery: 2-4 words naming a concrete, visual, photographable thing (a place, object, or scene) — not an abstract concept. Example: "seoul subway platform", "convenience store snacks", "korean apartment door lock".`

// 키워드에 vs 가 있을 때만 비교형. 나머지는 단일 주제 심층 가이드로 못 박는다(모델 재량에 맡기면 비교형으로 쏠린다).
const isComparisonKeyword = keyword => /\b(vs\.?|versus)\b/i.test(keyword)

const formatDirective = keyword => isComparisonKeyword(keyword)
  ? 'Format: this keyword names things to compare, so a comparison structure is appropriate. Still give each item real depth and a clear recommendation for who should pick which.'
  : 'Format: this keyword is about ONE subject. Write an in-depth single-subject deep-dive guide following the single-subject template. Do not turn it into an "A vs B" comparison and do not put "vs" in the title.'

const userPrompt = (keyword, categoryKey) => `Write one article for the following keyword.

Keyword: ${keyword}
Category: ${categoryKey} (${CATEGORIES[categoryKey].label})
Reference date: ${nowKst().date} (KST)
${formatDirective(keyword)}

No search tool is available: write from your own knowledge, give practical tips for foreign visitors and residents, and express any price, fare, fee, or deadline as an approximate range or tell the reader to check the official source.`

/* ---------- Gemini 호출 ---------- */

async function callGemini({ model, apiKey, system, prompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // tools(Google Search 그라운딩) 없음 — 무료 티어에서는 그라운딩 호출이 429 라서 쓰지 않는다.
      // gemini-3 계열은 '생각'에도 토큰을 쓰고 maxOutputTokens 안에 같이 잡힌다. 넉넉히 둔다.
      generationConfig: { temperature: 0.6, maxOutputTokens: 32768 },
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`
    const err = new Error(`Gemini 응답 ${res.status}: ${msg}`)
    err.status = res.status
    // 429 응답에는 "몇 초 뒤에 다시"가 들어 있다(RetryInfo.retryDelay, 예: "34s")
    const d = json?.error?.details?.find(x => String(x['@type'] ?? '').includes('RetryInfo'))?.retryDelay
    err.retryAfter = d ? parseFloat(d) : null
    throw err
  }
  const cand = json.candidates?.[0]
  const text = cand?.content?.parts?.map(p => p.text).filter(Boolean).join('') ?? ''
  if (!text.trim()) throw new Error(`본문이 비어 있다 (finishReason: ${cand?.finishReason ?? '?'})`)
  if (cand?.finishReason === 'MAX_TOKENS') {
    throw new Error(`출력이 토큰 한도에서 잘렸다 (생각 ${json.usageMetadata?.thoughtsTokenCount ?? '?'} + 본문 ${json.usageMetadata?.candidatesTokenCount ?? '?'})`)
  }
  const sources = (cand?.groundingMetadata?.groundingChunks ?? [])
    .map(c => c.web).filter(Boolean).map(w => ({ title: w.title ?? '', uri: w.uri ?? '' }))
  const queries = cand?.groundingMetadata?.webSearchQueries ?? []
  return { text, sources, queries, usage: json.usageMetadata ?? null }
}

/* ---------- Pexels ---------- */

async function fetchPexelsThumbnail(query) {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) { console.warn('PEXELS_API_KEY 없음 — 썸네일 없이 진행'); return null }
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=landscape&per_page=1&size=large`
    const res = await fetch(url, { headers: { Authorization: apiKey } })
    if (!res.ok) { console.warn(`Pexels 응답 ${res.status} — 썸네일 없이 진행`); return null }
    const json = await res.json()
    const photo = json.photos?.[0]
    if (!photo) { console.warn(`Pexels 결과 없음(query="${query}") — 썸네일 없이 진행`); return null }
    return {
      url: photo.src?.large2x ?? photo.src?.large ?? photo.src?.original,
      photographer: photo.photographer ?? null,
      pexelsUrl: photo.url ?? null,
    }
  } catch (e) {
    console.warn(`Pexels 호출 실패: ${e.message} — 썸네일 없이 진행`)
    return null
  }
}

/* ---------- 검증 ---------- */

const BANNED = [
  { re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, why: '이모지' },
  { re: /^#{1,6}\s*(Introduction|Overview|Conclusion|Final Thoughts|Table of Contents|Wrapping Up|In Summary|Getting Started)\s*$/im, why: '목차·상투적 소제목' },
  { re: /\b(Have you ever|Let'?s dive in|Welcome to|In today'?s (post|article)|In this (post|article))\b/i, why: '감성 인사·상투적 도입구' },
  { re: /^```/m, why: '코드펜스' },
]

function validate(raw) {
  const problems = []
  const cleaned = raw.replace(/^\s*```(?:markdown|md)?\s*\n/, '').replace(/\n```\s*$/, '').trim()
  if (!cleaned.startsWith('---')) problems.push('프론트매터로 시작하지 않는다')

  let parsed = null
  try {
    parsed = matter(cleaned)
  } catch (e) {
    problems.push(`프론트매터 파싱 실패: ${e.message}`)
    return { problems, cleaned, parsed: null }
  }

  const fm = parsed.data
  for (const key of ['title', 'description', 'slug', 'category', 'tags', 'pexelsQuery']) {
    if (!fm[key]) problems.push(`프론트매터 ${key} 누락`)
  }
  if (fm.category && !CATEGORIES[fm.category]) problems.push(`알 수 없는 카테고리: ${fm.category} (life-in-korea | korean-food 만 허용)`)
  if (fm.slug && !/^[a-z0-9][a-z0-9-]{3,70}$/.test(fm.slug)) problems.push(`slug 형식 오류: ${fm.slug}`)
  if (Array.isArray(fm.tags) && (fm.tags.length < 3 || fm.tags.length > 5)) problems.push('태그 개수는 3~5개')

  const body = parsed.content.trim()
  const words = wordCount(body)
  if (words < MIN_WORDS) problems.push(`본문이 ${words}단어로 짧습니다. ${MIN_WORDS}~${MAX_WORDS}단어로 맞추세요. 섹션을 늘리거나 조건·금액·절차를 더 구체적으로 적으세요.`)
  else if (words > MAX_WORDS) problems.push(`본문이 ${words}단어로 깁니다. ${MIN_WORDS}~${MAX_WORDS}단어로 맞추세요. 중복 설명을 먼저 지우세요.`)
  if (!/^\|.+\|$/m.test(body)) problems.push('마크다운 표 없음')
  if (!/^>\s/m.test(body)) problems.push('인용구 없음')
  if (!/^[*-]\s/m.test(body)) problems.push('불릿 목록 없음')
  if ((body.match(/^##\s/gm) ?? []).length < 2) problems.push('H2 소제목이 2개 미만')
  for (const { re, why } of BANNED) if (re.test(body)) problems.push(`금지 표현: ${why}`)

  return { problems, cleaned, parsed, words }
}

/* ---------- 메인 ---------- */

loadEnvLocal()

const geminiKey = process.env.GEMINI_API_KEY
if (!geminiKey) {
  console.error('GEMINI_API_KEY 가 없다. patto/.env.local 에 GEMINI_API_KEY=... 를 넣고 다시 실행한다.')
  process.exit(1)
}
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
if (!supabaseUrl || !supabaseKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 없다.')
  process.exit(1)
}
const sb = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } })

const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, 'utf8'))
const adhocKeyword = option('keyword')
let item = null

if (adhocKeyword) {
  const category = option('category') ?? 'life-in-korea'
  if (!CATEGORIES[category]) throw new Error(`알 수 없는 카테고리: ${category}`)
  item = { id: null, keyword: adhocKeyword, category, priority: 0, status: 'pending' }
} else if (option('id')) {
  const id = Number(option('id'))
  item = queue.find(k => k.id === id)
  if (!item) throw new Error(`id ${id} 키워드가 대기열에 없다`)
  if (item.status !== 'pending' && !flag('force')) throw new Error(`id ${id} 는 이미 ${item.status} 상태다 (--force 로 강제)`)
} else {
  item = queue
    .filter(k => k.status === 'pending' && CATEGORIES[k.category])
    .sort((a, b) => a.priority - b.priority || a.id - b.id)[0]
  if (!item) {
    console.log('대기열에 pending 키워드가 없다. scripts/keywords-global.json 에 추가한다.')
    process.exit(0)
  }
}

console.log(`키워드: ${item.keyword}  (${item.category} / ${CATEGORIES[item.category].label})`)

// 무료 티어(Free Tier) 전용: Flash 계열만 쓴다. Pro 계열은 무료 한도가 없거나 매우 적고,
// 선결제 크레딧이 바닥나면 402 로 전부 막힌다(2026-10-05 장애). 모델별로 무료 한도가
// 따로 잡히므로 서로 다른 Flash 모델을 순서대로 시도한다.
// GEMINI_MODEL 로 바꿀 수는 있지만 이름에 flash 가 들어간 것만 받는다.
const FREE_TIER_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite']
const envModel = /flash/i.test(process.env.GEMINI_MODEL ?? '') ? process.env.GEMINI_MODEL : null
if (process.env.GEMINI_MODEL && !envModel) console.warn(`GEMINI_MODEL=${process.env.GEMINI_MODEL} 는 Flash 계열이 아니라 무시한다(무료 티어 전용).`)
const models = [...new Set([envModel, ...FREE_TIER_MODELS].filter(Boolean))]
const sleep = ms => new Promise(r => setTimeout(r, ms))
let result = null
let usedModel = null
let lastErr = null
let lastText = null

outer: for (const model of models) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const prompt = attempt === 1 || !lastText
        ? userPrompt(item.keyword, item.category)
        : `Below is the previous draft for the same keyword. Fix only the issues listed and output the full article again.
Keep the facts and numbers already confirmed in the draft — do not invent new numbers.

[Issues]
- ${lastErr}

[Previous draft]
${lastText}`
      const r = await callGemini({ model, apiKey: geminiKey, system: SYSTEM_INSTRUCTION, prompt })
      const v = validate(r.text)
      if (v.problems.length) {
        lastErr = v.problems.join('\n- ')
        lastText = v.cleaned
        console.warn(`  [${model} 시도 ${attempt}] 검증 실패:\n  - ${lastErr}`)
        continue
      }
      result = { ...r, ...v }
      usedModel = model
      break outer
    } catch (e) {
      lastErr = e.message
      console.warn(`  [${model} 시도 ${attempt}] ${e.message}`)
      if (e.status === 402) {
        // 결제·선결제 크레딧이 필요하다는 뜻 = 무료 키가 아니다. 다른 모델·재시도로는 해결되지 않는다.
        console.error('⛔ 402: 이 키는 유료(선결제) 키이고 크레딧이 없다. 결제수단이 연결되지 않은 무료 티어 키로 GEMINI_API_KEY 를 교체한다.')
        process.exit(1)
      }
      if (e.status === 404 || e.status === 403) break // 이 키로 못 쓰는 모델 → 다음 모델로
      if (e.status === 429) {
        // 무료 한도(분당/일일) 초과. 짧게 기다릴 수 있으면 같은 모델로 재시도, 아니면 다음 모델로.
        // 서버가 대기 시간(retryDelay)을 알려주지 않는 429 는 일일 한도 성격이라 기다려도 소용없다.
        const wait = e.retryAfter
        if (wait != null && attempt < 3 && wait <= 60) { console.warn(`  429 — ${wait}초 대기 후 재시도`); await sleep((wait + 1) * 1000); continue }
        break
      }
      if (e.status === 500 || e.status === 503) {
        // 일시적 과부하("high demand") — 잠깐 쉬었다가 같은 모델로 다시
        if (attempt < 3) { console.warn('  일시 과부하 — 15초 대기 후 재시도'); await sleep(15000); continue }
        break
      }
    }
  }
}

if (!result) {
  if (/429/.test(lastErr ?? '')) console.error('무료 티어 한도(분당/일일)를 모두 소진했다. 한도가 풀릴 때(태평양시 자정 이후) 다시 돌거나 실행 횟수를 줄인다.')
  console.error(`생성 실패. 마지막 사유:\n- ${lastErr}`)
  process.exit(1)
}

const fm = result.parsed.data
const slug = fm.slug
const { app, category } = CATEGORIES[fm.category]
const body = result.parsed.content.trim()

// 슬러그 충돌 확인 — 비공개(초안) 포함. 있으면 멈춘다(임의로 -2 를 붙이지 않는다).
const { data: existing, error: chkErr } = await sb
  .from('blog_posts')
  .select('slug, app, locale, is_paused')
  .eq('slug', slug)
if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)
if (existing && existing.length) {
  console.error(`⛔ slug 충돌 — 중단: ${JSON.stringify(existing)}`)
  process.exit(1)
}

console.log('\n그라운딩 없음 — 모델 자체 지식으로 작성(변동 수치는 근사치/공식 확인 권장 표현)')

const thumb = await fetchPexelsThumbnail(fm.pexelsQuery)

const sensitive = item.sensitive === true || SENSITIVE_RE.test(item.keyword)
const asDraft = flag('draft') || (sensitive && !flag('publish'))
if (asDraft && !flag('draft')) console.log('\n민감 주제(법·규정·금액) — 자동으로 초안(비공개)으로 넣는다. 즉시 공개하려면 --publish.')

const row = {
  slug,
  locale: 'en',
  app,
  category,
  tags: fm.tags,
  title: fm.title,
  description: fm.description,
  content: body,
  thumbnail: thumb?.url ?? null,
  published_at: nowKst().iso,
  // 기본은 생성 즉시 공개(is_paused: false). 검수 후 올리고 싶으면 --draft 를 붙인다
  // (그 경우 npx tsx scripts/publish-global-draft.ts <slug> 로 나중에 공개 전환한다).
  is_paused: asDraft,
}

if (flag('dry-run')) {
  console.log('\n--- dry-run: DB 에 쓰지 않는다 ---\n')
  // --full 이면 본문 전체를 그대로 출력한다(발행 전에 수치 표현을 눈으로 확인할 때)
  console.log(JSON.stringify({ ...row, content: flag('full') ? body : `${body.slice(0, 200)}... (${result.words}단어)` }, null, 2))
  if (flag('full')) console.log(`\n(${result.words}단어)`)
  process.exit(0)
}

const { data: inserted, error: insErr } = await sb.from('blog_posts').insert(row)
  .select('id, slug, app, category, tags, thumbnail, published_at, is_paused').single()
if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)

console.log(`\n✅ INSERT 완료 (${inserted.is_paused ? '초안, 비공개' : '공개'})\n${JSON.stringify(inserted, null, 2)}`)
console.log(`본문 ${result.words}단어, 모델 ${usedModel}`)
console.log(thumb ? `썸네일: ${thumb.url} (Pexels, ${thumb.photographer})` : '썸네일: 없음 (Pexels 결과 없음/키 없음)')

fs.mkdirSync(LOG_DIR, { recursive: true })
fs.writeFileSync(
  path.join(LOG_DIR, `${slug}.json`),
  JSON.stringify({
    slug, keyword: item.keyword, category: item.category, model: usedModel,
    generatedAt: nowKst().iso, searchQueries: result.queries, sources: result.sources,
    usage: result.usage, pexelsQuery: fm.pexelsQuery, thumbnail: thumb,
  }, null, 2),
  'utf8'
)

if (item.id !== null) {
  const idx = queue.findIndex(k => k.id === item.id)
  queue[idx] = { ...queue[idx], status: inserted.is_paused ? 'draft' : 'published', publishedAt: nowKst().iso, slug }
  fs.writeFileSync(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`, 'utf8')
  console.log(`대기열 갱신: id ${item.id} -> ${queue[idx].status}`)
}

if (inserted.is_paused) {
  console.log('\n⚠️  초안 상태(is_paused: true)다. 검수 후 다음으로 공개 전환한다:')
  console.log(`   npx tsx scripts/publish-global-draft.ts ${slug}`)
} else {
  const url = `https://www.atlaslabstudios.com/blog/${row.locale}/${row.app}/${row.slug}`
  // Vercel 배포와 무관하게 DB 글은 바로 보이지만, 방금 배포 중이면 잠깐 404 일 수 있다.
  const res = await fetch(url).catch(() => null)
  console.log(`\n${res?.status === 200 ? '✅' : '⏳'} ${url}  ${res ? `HTTP ${res.status}` : '(확인 실패, 잠시 후 재확인)'}`)
}
