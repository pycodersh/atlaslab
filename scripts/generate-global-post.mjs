/**
 * 영문 글로벌 아티클 자동 생성 파이프라인.
 *
 * blog.atlaslabstudios.com(별도 저장소 atlaslab-blog)의
 * scripts/generate-blog-post.mjs 구조(Gemini + Google Search Grounding,
 * 모델 폴백, 자가 수정 재시도, 검증 규칙)를 그대로 가져오되 두 가지가 다르다:
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
 * 애드센스 심사 중이라 전부 초안(is_paused: true)으로 넣는다. 사람이 확인한 뒤
 *   npx tsx scripts/publish-global-draft.ts <slug>
 * 로 공개 전환한다.
 *
 *   node scripts/generate-global-post.mjs              대기열 최상위 1건 생성 + 삽입
 *   node scripts/generate-global-post.mjs --dry-run     DB에 쓰지 않고 결과만 출력
 *   node scripts/generate-global-post.mjs --id 2        특정 키워드 id 로 생성
 *   node scripts/generate-global-post.mjs --keyword "..." --category life-in-korea   대기열 밖 즉석 생성
 *
 * 환경변수 (patto/.env.local 또는 셸):
 *   GEMINI_API_KEY              필수
 *   GEMINI_MODEL                선택 (기본 gemini-3.1-pro-preview, 404면 gemini-3.8-flash 로 재시도)
 *   PEXELS_API_KEY               필수(없으면 썸네일 없이 생성 — 중단하지 않는다)
 *   NEXT_PUBLIC_SUPABASE_URL             필수
 *   SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY   필수(서비스 롤 — RLS 우회 INSERT)
 *
 * 출력물
 *   blog_posts 행 1개 (is_paused: true)
 *   scripts/data/generated-global/<slug>.json   참고 출처 + 실행 기록 (git 제외)
 *   scripts/keywords-global.json                해당 항목 status: published 로 갱신
 *     (= "생성 완료". 실제 공개 여부는 is_paused 가 결정한다.)
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
const MIN_WORDS = 800
const MAX_WORDS = 1200

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
- Clear, direct, professional factual sentences (imperative or declarative — "Do this", "This costs X").

[Structure]
- The first 1-2 sentences must give the direct, core answer to what the reader is searching for (a Quick Verdict). Do not open with history or general background.
- Do not generate a table of contents. Do not use generic filler headings like "Introduction", "Overview", "Conclusion", or "Final Thoughts".
- 3-4 H2 (##) sections. Use H3 only when genuinely needed inside a section.
- Include at least one markdown comparison table (cost, pros/cons, or option comparison), at least one blockquote (>), and at least one bullet list.
- Include a clear step-by-step action guide (Step 1, Step 2, Step 3) the reader can follow immediately.
- Use Google Search to verify current Korean regulations, prices, and procedures before writing. State only facts you can verify. If a number cannot be confirmed through search, omit it rather than guessing, and do not invent a source.

[Length]
- Body (excluding frontmatter) must be ${MIN_WORDS}-${MAX_WORDS} words. Aim for about ${Math.round((MIN_WORDS + MAX_WORDS) / 2)}.

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
readTime: 3
---
- slug: lowercase English letters, numbers and hyphens only, 3-7 words summarizing the keyword.
- pexelsQuery: 2-4 words naming a concrete, visual, photographable thing (a place, object, or scene) — not an abstract concept. Example: "seoul subway platform", "convenience store snacks", "korean apartment door lock".`

const userPrompt = (keyword, categoryKey) => `Write one article for the following keyword.

Keyword: ${keyword}
Category: ${categoryKey} (${CATEGORIES[categoryKey].label})
Reference date: ${nowKst().date} (KST)

Use Google Search to confirm current facts (prices, rules, deadlines, procedures) for this keyword before writing. Only include numbers and rules you can verify through search.`

/* ---------- Gemini 호출 ---------- */

async function callGemini({ model, apiKey, system, prompt }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }],
      // gemini-3 계열은 '생각'에도 토큰을 쓰고 maxOutputTokens 안에 같이 잡힌다. 넉넉히 둔다.
      generationConfig: { temperature: 0.6, maxOutputTokens: 32768 },
    }),
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json?.error?.message || `HTTP ${res.status}`
    const err = new Error(`Gemini 응답 ${res.status}: ${msg}`)
    err.status = res.status
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

const models = [process.env.GEMINI_MODEL, 'gemini-3.1-pro-preview', 'gemini-3.8-flash'].filter(Boolean)
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
      if (e.status === 404) break // 다음 모델로
    }
  }
}

if (!result) {
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

console.log(`\n검색 질의 ${result.queries.length}건, 참고 출처 ${result.sources.length}건`)
for (const s of result.sources.slice(0, 10)) console.log(`  - ${s.title || s.uri}`)

const thumb = await fetchPexelsThumbnail(fm.pexelsQuery)

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
  // 애드센스 심사 기간 정책: 전부 초안으로 넣는다. 검수 후
  // npx tsx scripts/publish-global-draft.ts <slug> 로 공개 전환한다.
  is_paused: true,
}

if (flag('dry-run')) {
  console.log('\n--- dry-run: DB 에 쓰지 않는다 ---\n')
  console.log(JSON.stringify({ ...row, content: `${body.slice(0, 200)}... (${result.words}단어)` }, null, 2))
  process.exit(0)
}

const { data: inserted, error: insErr } = await sb.from('blog_posts').insert(row)
  .select('id, slug, app, category, tags, thumbnail, published_at, is_paused').single()
if (insErr) throw new Error(`INSERT 실패: ${insErr.message}`)

console.log(`\n✅ INSERT 완료 (초안, 비공개)\n${JSON.stringify(inserted, null, 2)}`)
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
  queue[idx] = { ...queue[idx], status: 'published', publishedAt: nowKst().iso, slug }
  fs.writeFileSync(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`, 'utf8')
  console.log(`대기열 갱신: id ${item.id} -> published (= 생성 완료, 공개 여부는 is_paused 가 결정)`)
}

console.log('\n⚠️  초안 상태(is_paused: true)다. 검수 후 다음으로 공개 전환한다:')
console.log(`   npx tsx scripts/publish-global-draft.ts ${slug}`)
