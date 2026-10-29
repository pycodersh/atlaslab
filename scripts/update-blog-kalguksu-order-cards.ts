/**
 * 칼국수 글(kalguksu-knife-cut-noodle-soup-ordering-guide) — 메뉴별 회화 박스 6개 정리 (2026-10-29)
 *
 * 'Order-Ready Cards' 의 tip-box 6개(메뉴마다 Say: · Handy: 반복)를 걷어 내고,
 *   1) 메뉴 표를 맛 · 국물 베이스 · 맵기 · 추천 대상 열로 다시 짠다(맵기 이모지 → 글자)
 *   2) 표 아래에 주문 공식 콜아웃 하나(<Callout>)로 묶는다 — [메뉴] 하나 주세요 · 덜 맵게 해 주세요 · 저기요
 * 바지락칼국수 사진 · 곁들임 · 예절 · 아래 'Essential Korean Phrases' · FAQ 는 그대로 둔다.
 *
 * 안전장치: 바꿀 구간(표 소개 문단 ~ 마지막 tip-box)이 본문에 정확히 한 번 있을 때만 쓴다.
 * MDX 컴파일을 통과해야 쓰고, 바꾸기 전 본문은 scripts/backups/ 에 남긴다. 다시 돌리면 이미 바뀐 것을 알아보고 멈춘다.
 *
 * 실행: npx tsx scripts/update-blog-kalguksu-order-cards.ts [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const SLUG = 'kalguksu-knife-cut-noodle-soup-ordering-guide'
const DRY = process.argv.includes('--dry-run')
const START = 'Different regions and specialty shops across South Korea feature unique variations of kalguksu.'
const END_MARK = '**얼큰칼국수 · Eolkeun Kalguksu (spicy)**'
const PHOTO = `<figure className="post-figure post-figure-auto">
<img src="https://eecvvgkihtcgfikaimao.supabase.co/storage/v1/object/public/blog-covers/kalguksu-knife-cut-noodle-soup-ordering-guide-bajirak.webp" alt="Bajirak-kalguksu: knife-cut noodles in a clear broth with Manila clams" loading="lazy" />
<figcaption>Bajirak-kalguksu (knife-cut noodles with Manila clams). Photo: Suh Jeong-ho (CC0), via Wikimedia Commons</figcaption>
</figure>`

const NEXT = `Different regions and specialty shops across South Korea feature unique variations of kalguksu. Use the table below to pick a bowl at a glance.

### Menu Matrix: Which Bowl Should You Order?

| Menu (Korean / English) | Flavor | Broth base | Spice | Best for |
| :--- | :--- | :--- | :--- | :--- |
| **바지락칼국수** Bajirak (Manila clam) | Clean, briny, light | Clam and kelp | None | Seafood lovers who want a light, clear bowl |
| **멸치칼국수** Myeolchi (anchovy) | Savory, simple, everyday | Dried anchovy and kelp | None | First-timers and budget meals |
| **닭칼국수** Dak (chicken) | Rich, garlicky, comforting | Whole-chicken stock | None | Cold days and comfort-food cravings |
| **사골칼국수** Sagol (ox bone) | Milky, mild, rounded | Long-simmered ox bone | None | Mild palates, kids, Korean-soup beginners |
| **들깨칼국수** Deulkkae (perilla seed) | Thick, nutty, earthy | Anchovy or vegetable stock with ground perilla | None | Fans of creamy, nutty flavors |
| **얼큰칼국수** Eolkeun (spicy) | Bold, fiery, savory | Seafood or beef stock with chili | Hot | Spice lovers, cold weather, hangover mornings |

Any bowl can be made hotter at the table with a spoon of *dadaegi* (chili seasoning).

${PHOTO}

<Callout type="tip" title="Quick Ordering Formula">

Get attention with **저기요** (*jeogiyo*, "excuse me"), then name the bowl from the table:

- **[메뉴] 하나 주세요.** (*[menu] hana juseyo*) — One [menu], please. For example, **바지락칼국수 하나 주세요.**
- **덜 맵게 해 주세요.** (*deol maepge hae juseyo*) — Less spicy, please.

</Callout>`

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const { data: post, error } = await sb.from('blog_posts').select('id, content').eq('slug', SLUG).eq('is_paused', false).single()
  if (error) throw new Error(error.message)
  const before = post.content as string
  const src = before.replace(/\r\n/g, '\n')
  if (src.includes('title="Quick Ordering Formula"')) { console.log('· 이미 적용됨 — 바꿀 것 없음'); return }

  // 구간: 표 소개 문단 시작 ~ 마지막(얼큰) tip-box 의 닫는 </div>
  const s = src.indexOf(START)
  const e0 = src.indexOf(END_MARK)
  const e = e0 === -1 ? -1 : src.indexOf('</div>', e0) + '</div>'.length
  if (s === -1 || e0 === -1 || src.indexOf(START, s + 1) !== -1 || src.indexOf(END_MARK, e0 + 1) !== -1 || e < s) {
    throw new Error('바꿀 구간을 정확히 한 번 찾지 못했다 — 아무것도 쓰지 않고 중단')
  }
  const old = src.slice(s, e)
  const boxes = (old.match(/<div className="tip-box">/g) ?? []).length
  if (boxes !== 6 || !old.includes(PHOTO)) throw new Error(`구간 안 tip-box ${boxes}개 · 사진 ${old.includes(PHOTO)} — 예상과 달라 중단`)
  const next = src.slice(0, s) + NEXT + src.slice(e)

  for (const keep of ['### Popular Side Dish Pairings', '## Essential Korean Phrases', '## Frequently Asked Questions', '## Pro Tips']) {
    if (!next.includes(keep)) throw new Error(`'${keep}' 가 사라졌다 — 중단`)
  }
  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default
  await compile(next, { remarkPlugins: [remarkGfm] })
  console.log(`tip-box 6개 제거 · 표 재구성 · 콜아웃 1개 — 단어 ${src.split(/\s+/).length} → ${next.split(/\s+/).length}, MDX OK`)
  if (DRY) return

  const dir = path.resolve(process.cwd(), 'scripts', 'backups'); fs.mkdirSync(dir, { recursive: true })
  const bak = path.join(dir, `${SLUG}-${new Date().toISOString().replace(/[:.]/g, '-')}.md`)
  fs.writeFileSync(bak, before)
  const { data: again } = await sb.from('blog_posts').select('content').eq('id', post.id).single()
  if (again?.content !== before) throw new Error('그 사이 본문이 바뀌었다 — 쓰지 않고 중단')
  const { error: upErr } = await sb.from('blog_posts').update({ content: next }).eq('id', post.id)
  if (upErr) throw new Error(upErr.message)
  console.log(`✅ 저장 (백업: ${path.relative(process.cwd(), bak)})`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
