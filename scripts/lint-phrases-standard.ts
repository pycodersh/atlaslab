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
    if (fm.category !== 'Real-Life Korean') errs.push(`category 가 Real-Life Korean 이 아니다 (${fm.category})`)
    if (!String(fm.description ?? '').trim()) errs.push('description 이 비었다')
    if (!Array.isArray(fm.tags) || !fm.tags.length) errs.push('tags 가 비었다')

    const ctas = (c.match(/<KpattoCta\s+variant="end"\s*\/>/g) ?? []).length
    if (ctas !== 1) errs.push(`<KpattoCta variant="end" /> 가 ${ctas}개 (1개여야 한다)`)
    else if (!c.endsWith('<KpattoCta variant="end" />')) errs.push('<KpattoCta variant="end" /> 가 본문 끝에 있지 않다')
    if (/\[K-PATTO\]\(/.test(c)) errs.push('옛 글자 CTA 링크 [K-PATTO](…) 가 남아 있다')

    // 말투 안내: 대조표가 기본이고, 글 전체가 한 말투(존댓말)면 그 말투를 짚는 안내(반말 · -습니다 · polite -요 언급)로 갈음한다
    const levelTable = /^## Polite or casual\?/m.test(c) || /^\|[^\n]*Casual[^\n]*Polite|^\|[^\n]*Polite[^\n]*Casual/im.test(c)
    const levelNote = /반말|-습니다|polite \*\*-요\*\*|casual speech|formal \*\*/i.test(c)
    if (!levelTable && !levelNote) errs.push('말투 안내가 없다 (## Polite or casual? 표 또는 반말 · -습니다 · -요 안내)')
    // 상대가 하는 말: ## 절이나 Callout 제목
    const hearHeading = /^## .*(You'll hear|What (staff|they|the [a-z]+) (will|might|may) (say|ask|tell)|What staff)/im.test(c)
    const hearCallout = /<Callout[^>]*title="[^"]*(You'll hear|hear back|staff (say|ask))[^"]*"/i.test(c)
    if (!hearHeading && !hearCallout) errs.push("상대가 하는 말이 없다 (## What staff will … / You'll hear … 절이나 Callout)")

    // 링크 주소(slug)는 하이픈이 많아 로마자 검사에서 뺀다
    const prose = c.replace(/\]\([^)]*\)/g, ']()').replace(/<[A-Z]\w*[^>]*\/>/g, '')
    // 문장 첫머리 대문자(All-you-can-eat)도 한 낱말로 잡아야 허용 목록과 맞는다
    const splitRom = [...prose.matchAll(/\b[a-zA-Z]{1,5}(?:-[a-zA-Z]{1,5}){2,}\b/g)].map(m => m[0].toLowerCase())
      .filter(w => !/^(drop-off|pick-up|check-in|check-out|self-service|one-on-one|face-to-face|step-by-step|up-to-date|day-to-day|all-you-can-eat|ready-to-eat|made-to-order|first-come-first-served)$/.test(w))
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
