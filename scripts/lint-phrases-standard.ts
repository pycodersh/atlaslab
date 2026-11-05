/**
 * Phrases 개편 표준 린트 — content/blog/<slug>.mdx 가 샘플 3편(2026-11-04)으로 정한 기준을 지키는지 본다.
 *
 * 오류(ERR, 있으면 반영하지 않는다)
 *   - frontmatter slug · category(Real-Life Korean) · description · tags
 *   - 끝 CTA 는 공통 카드 <KpattoCta variant="end" /> 한 번, 옛 글자 링크 [K-PATTO](…) 없음
 *   - 말투 안내('Polite or casual?' 표 · Casual/Polite 열, 한 말투뿐인 글은 반말 · -습니다 · -요 안내)
 *   - 상대가 하는 말('You'll hear' · 'What staff …' 류 절이나 Callout 제목)
 *   - 로마자를 음절마다 끊어 쓴 흔적(i-be-seo 처럼 하이픈 두 개 이상)
 *   - YouTube id 가 DB 의 지금 본문과 같다(대화 영상과 맞아야 한다)
 *   - 본문 속 /blog/en/<app>/<slug> 링크가 실제 공개 글이다
 * 경고(WARN): 분량 500~900단어 밖, 'Key Nuances' 인용 블록이 남아 있음(표 · 본문으로 옮기는 게 기준)
 *
 * 실행: npx tsx scripts/lint-phrases-standard.ts <slug> [...]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import matter from 'gray-matter'
import { createClient } from '@supabase/supabase-js'

const SLUGS = process.argv.slice(2).filter(a => !a.startsWith('--'))
/* --basics: Learn Korean > Basics 기준(2026-11-05 샘플 3편으로 확정)
 *   ERR 상단 <KoreanBasicVideo slug=…/> 가 본문 맨 앞에 있고 DB 와 같다(영상은 다시 렌더하지 않는다)
 *   ERR 중간 CTA(variant="mid") 없음 — 끝 카드 하나만
 *   ERR 표는 3열 이하(폰 375px 에서 가로 스크롤 없게. 로마자는 예문 아래로 내린다)
 *   ERR 로마자 안 하이픈(rom="…" · 로마자 열 · 기울임 로마자): 소리 나는 대로 붙여 쓴다(han-geul → hangeul)
 *   말투 · 상대가 하는 말 절은 문법 글이라 요구하지 않는다. 분량 경고는 500~900 */
const BASICS = process.argv.includes('--basics')
const BASICS_CATEGORIES = ['Korean Grammar', 'Hangul & Pronunciation', 'Getting Started', 'Grammar']
/* --places: Travel & Life > Explore Korea > Places 기준(2026-11-05 샘플 2편으로 확정)
 *   ERR 첫 ## 앞에 <KeyTakeaways title="At a glance"> 정보 카드(위치 · 가는 법 · 체류 시간 · 비용/예약)
 *   ERR 현장 한국어 표(| Korean | Romanization | … |) 하나 이상
 *   ERR 중간 CTA(<KpattoCta /> 맨 · variant="mid") 없음. 끝 카드 뒤에는 FAQ 절만 올 수 있다(FAQPage 스키마)
 *   ERR 표 3열 이하 · 로마자 하이픈 없음(Basics 와 같은 검사)
 *   Places 칩의 14편은 대표 category 가 셋으로 갈린다(Places 6 · 교차 노출 Cooking Basics 5 · Korean Culture 3) */
const PLACES = process.argv.includes('--places')
const PLACES_CATEGORIES = ['Places', 'Cooking Basics', 'Korean Culture']
// 영어 낱말인 하이픈 합성어 — 로마자가 아니다
const EN_HYPHEN = /^(drop-off|pick-up|check-in|check-out|self-service|one-on-one|face-to-face|step-by-step|up-to-date|day-to-day|all-you-can-eat|ready-to-eat|made-to-order|first-come-first-served|so-and-so|well-known|built-in|non-spicy|in-person|real-life|follow-up|long-term|short-term|full-time|part-time|high-pitched|left-to-right|top-to-bottom|right-to-left|sino-korean|native-korean|k-pop|k-drama|k-dramas|k-beauty|t-money|e-mail|x-ray|re-read|co-founder|so-called|old-fashioned|two-letter|one-letter|three-letter|double-letter|eye-opening|easy-to-read|hard-to-read|one-drink-per|pop-up|pop-ups|day-trip|day-trips|walk-in|walk-ins|sit-down|take-out|all-day|year-round|half-day|full-day)$/i
const basicVideo = (s: string) => [...s.matchAll(/<KoreanBasicVideo\s+slug="([^"]+)"/g)].map(m => m[1]).join(',')
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)
const ytIds = (s: string) => [...s.matchAll(/<YouTube\s+[^>]*id="([^"]+)"/g)].map(m => m[1]).sort().join(',')

async function main() {
  if (!SLUGS.length) throw new Error('slug 를 하나 이상 넘길 것')
  const { data: live, error } = await sb.from('blog_posts').select('slug, app, content, is_paused').eq('locale', 'en')
  if (error) throw new Error(error.message)
  const published = new Set(live!.filter(p => !p.is_paused).map(p => `${p.app}/${p.slug}`))
  const dbContent = new Map(live!.map(p => [p.slug, p.content as string]))

  let failed = 0
  for (const slug of SLUGS) {
    const errs: string[] = []
    const warns: string[] = []
    const file = path.resolve(process.cwd(), 'content', 'blog', `${slug}.mdx`)
    if (!fs.existsSync(file)) { console.log(`✗ ${slug}\n   ERR 파일이 없다`); failed++; continue }
    const { data: fm, content: raw } = matter(fs.readFileSync(file, 'utf8'))
    const c = raw.trim()

    if (fm.slug !== slug) errs.push(`frontmatter slug 가 다르다 (${fm.slug})`)
    const okCats = PLACES ? PLACES_CATEGORIES : BASICS ? BASICS_CATEGORIES : ['Real-Life Korean']
    if (!okCats.includes(fm.category)) errs.push(`category 가 ${okCats.join(' · ')} 중 하나가 아니다 (${fm.category})`)
    if (!String(fm.description ?? '').trim()) errs.push('description 이 비었다')
    if (!Array.isArray(fm.tags) || !fm.tags.length) errs.push('tags 가 비었다')

    const ctas = (c.match(/<KpattoCta\s+variant="end"\s*\/>/g) ?? []).length
    if (ctas !== 1) errs.push(`<KpattoCta variant="end" /> 가 ${ctas}개 (1개여야 한다)`)
    else {
      const after = c.slice(c.indexOf('<KpattoCta variant="end" />') + '<KpattoCta variant="end" />'.length).trim()
      // Places 글은 끝 카드 뒤에 FAQ 절(구조화 데이터)만 올 수 있다
      const faqOnly = PLACES && /^## (Frequently Asked Questions|FAQ)\b/.test(after) && !/^## /m.test(after.replace(/^## [^\n]*\n/, ''))
      if (after && !faqOnly) errs.push('<KpattoCta variant="end" /> 가 본문 끝에 있지 않다' + (PLACES ? ' (뒤에는 FAQ 절만)' : ''))
    }
    if (/\[K-PATTO\]\(/.test(c)) errs.push('옛 글자 CTA 링크 [K-PATTO](…) 가 남아 있다')

    if (!BASICS && !PLACES) {
      // 말투 안내: 대조표가 기본이고, 글 전체가 한 말투(존댓말)면 그 말투를 짚는 안내(반말 · -습니다 · polite -요 언급)로 갈음한다
      const levelTable = /^## Polite or casual\?/m.test(c) || /^\|[^\n]*Casual[^\n]*Polite|^\|[^\n]*Polite[^\n]*Casual/im.test(c)
      const levelNote = /반말|-습니다|polite \*\*-요\*\*|casual speech|formal \*\*/i.test(c)
      if (!levelTable && !levelNote) errs.push('말투 안내가 없다 (## Polite or casual? 표 또는 반말 · -습니다 · -요 안내)')
      // 상대가 하는 말: ## 절이나 Callout 제목
      const hearHeading = /^## .*(You'll hear|What (staff|they|the [a-z]+) (will|might|may) (say|ask|tell)|What staff)/im.test(c)
      const hearCallout = /<Callout[^>]*title="[^"]*(You'll hear|hear back|staff (say|ask))[^"]*"/i.test(c)
      if (!hearHeading && !hearCallout) errs.push("상대가 하는 말이 없다 (## What staff will … / You'll hear … 절이나 Callout)")
    } else {
      const db = dbContent.get(slug) ?? ''
      if (BASICS) {
        // 대부분 <KoreanBasicVideo slug=…/>, korean-never-say-dangsin-neo 만 전용 영상 <DangerPronounsVideo /> 를 쓴다
        if (!/^<(KoreanBasicVideo\s+slug="[^"]+"|DangerPronounsVideo)\s*\/>/.test(c)) errs.push('상단 영상(<KoreanBasicVideo /> 등)이 본문 맨 앞에 없다')
        if ((db.match(/<DangerPronounsVideo\s*\/>/g) ?? []).length !== (c.match(/<DangerPronounsVideo\s*\/>/g) ?? []).length) errs.push('DangerPronounsVideo 가 DB 와 다르다')
        if (basicVideo(db) !== basicVideo(c)) errs.push(`KoreanBasicVideo 가 DB 와 다르다 (${basicVideo(db) || '없음'} → ${basicVideo(c) || '없음'})`)
      }
      if (PLACES) {
        const head = c.split(/^## /m)[0]
        if (!/<KeyTakeaways\s+title="At a glance"\s*>/.test(head)) errs.push('첫 ## 앞에 <KeyTakeaways title="At a glance"> 정보 카드가 없다')
        if (!/^\|\s*Korean\s*\|\s*Romanization\s*\|/m.test(c)) errs.push('현장 한국어 표(| Korean | Romanization | … |)가 없다')
        if (/<KpattoCta\s*\/>/.test(c)) errs.push('맨 <KpattoCta /> (= 중간 CTA)가 남아 있다')
      }
      if (/<KpattoCta\s+variant="mid"/.test(c)) errs.push('중간 CTA(variant="mid")가 남아 있다')
      // 표 열 수: 머리줄의 칸 수
      for (const m of c.matchAll(/^\|(.+)\|\s*\n\|[\s:|-]+\|\s*$/gm)) {
        const cols = m[1].split('|').length
        if (cols > 3) errs.push(`${cols}열 표가 있다 (3열 이하): |${m[1].trim().slice(0, 50)}|`)
      }
      // 로마자 안 하이픈: rom 속성 · 로마자 열 · 기울임
      const romBits: string[] = []
      for (const m of c.matchAll(/\brom="([^"]*)"/g)) romBits.push(m[1])
      for (const t of c.matchAll(/^(\|[^\n]+\|)\s*\n\|[\s:|-]+\|\s*\n((?:\|[^\n]*\|\s*\n?)+)/gm)) {
        const head = t[1].split('|').slice(1, -1).map(h => h.trim())
        const ri = head.findIndex(h => /romani[sz]ation|sound|pronounc|reads? as|say it/i.test(h))
        if (ri < 0) continue
        for (const row of t[2].trim().split('\n')) romBits.push((row.split('|').slice(1, -1)[ri] ?? '').trim())
      }
      for (const m of c.matchAll(/(?<![*\w])\*([a-z][a-z' ?.,-]*-[a-z][a-z' ?.,-]*)\*(?!\*)/g)) romBits.push(m[1])
      const hy = romBits.flatMap(b => [...b.matchAll(/\b[a-zA-Z]+(?:-[a-zA-Z]+)+\b/g)].map(x => x[0])).filter(w => !EN_HYPHEN.test(w))
      if (hy.length) errs.push(`로마자에 하이픈: ${[...new Set(hy)].slice(0, 8).join(', ')}`)
    }

    // 링크 주소(slug)는 하이픈이 많아 로마자 검사에서 뺀다
    // 이미지 · 링크 주소(src · href · 파일명)도 하이픈이 많아 뺀다
    const prose = c.replace(/\]\([^)]*\)/g, ']()').replace(/<[A-Z]\w*[^>]*\/>/g, '').replace(/\b(src|href|srcSet|poster)=("[^"]*"|\{[^}]*\})/g, '')
    // 문장 첫머리 대문자(All-you-can-eat)도 한 낱말로 잡아야 허용 목록과 맞는다
    const splitRom = [...prose.matchAll(/\b[a-zA-Z]{1,5}(?:-[a-zA-Z]{1,5}){2,}\b/g)].map(m => m[0].toLowerCase())
      .filter(w => !EN_HYPHEN.test(w))
    if (splitRom.length) errs.push(`음절마다 끊은 로마자: ${[...new Set(splitRom)].slice(0, 6).join(', ')}`)

    const before = dbContent.get(slug)
    if (before == null) errs.push('DB 에 없는 slug')
    else if (ytIds(before) !== ytIds(c)) errs.push(`YouTube id 가 DB 와 다르다 (${ytIds(before) || '없음'} → ${ytIds(c) || '없음'})`)

    for (const m of c.matchAll(/\]\(\/blog\/en\/([\w-]+)\/([\w-]+)\)/g)) {
      if (!published.has(`${m[1]}/${m[2]}`)) errs.push(`없는 글로 가는 링크: /blog/en/${m[1]}/${m[2]}`)
    }

    const words = c.split(/\s+/).length
    if (words < 500 || words > 900) warns.push(`분량 ${words}단어 (500~900 권장)`)
    if (/Key Nuances/.test(c)) warns.push("'Key Nuances' 인용 블록이 남아 있다")

    if (errs.length) failed++
    console.log(`${errs.length ? '✗' : '✓'} ${slug} (${words}단어)`)
    for (const e of errs) console.log(`   ERR ${e}`)
    for (const w of warns) console.log(`   WARN ${w}`)
  }
  if (failed) { console.log(`\n${failed}/${SLUGS.length}편 실패`); process.exit(1) }
  console.log(`\n${SLUGS.length}편 모두 통과`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
