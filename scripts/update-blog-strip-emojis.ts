/**
 * 블로그 글 본문에서 장식용 이모지를 걷어 낸다 (2026-10-28, 편집 지면 톤으로)
 *
 * 머리글 · 불릿 · 팁 상자 · 요약 카드의 ✈️ 🌊 🎟️ 📍 💡 🎰 📌 🍽️ ♨️ 🎨 🚌 ⏰ 같은 그림 이모지와 뒤따르는 빈칸을 지운다.
 * 뜻이 있는 기호는 남긴다: ↗(새 탭으로 열림) · © ® ™ · ①②③ 같은 번호 · 화살표.
 *
 * 안전장치: 저장 전에 사이트와 같은 MDX 컴파일러(remark-gfm)로 컴파일해 보고, 실패하면 쓰지 않는다.
 * 쓰기 직전에 다시 읽어 그 사이 본문이 바뀌었으면 쓰지 않는다. 바꾸기 전 본문은 scripts/backups/ 에 남긴다.
 *
 * 실행: npx tsx scripts/update-blog-strip-emojis.ts <slug> [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const SLUG = process.argv[2]
const DRY = process.argv.includes('--dry-run')
if (!SLUG || SLUG.startsWith('--')) { console.error('사용법: npx tsx scripts/update-blog-strip-emojis.ts <slug> [--dry-run]'); process.exit(1) }

// 그림 이모지(+ 변형 선택자 · ZWJ 연결) — 지운다. 아래 KEEP 은 그림 문자로 분류돼도 남긴다.
const EMOJI = /\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*️?/gu
const KEEP = new Set(['↗', '↘', '↙', '↖', '↔', '↕', '©', '®', '™', '‼', '⁉'])

function strip(src: string) {
  const removed: string[] = []
  const out = src
    .split('\n')
    .map(line => line.replace(new RegExp(`(${EMOJI.source})[ \\t]?`, 'gu'), (m, e: string) => {
      if (KEEP.has(e.replace(/️/g, ''))) return m
      removed.push(e)
      return ''
    }))
    .join('\n')
  return { out, removed }
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')
  const { data: post, error } = await sb.from('blog_posts').select('id, content').eq('slug', SLUG).single()
  if (error) throw new Error(error.message)
  const before = post.content as string
  const { out, removed } = strip(before)
  if (!removed.length) { console.log('· 지울 이모지가 없다'); return }

  const counts = new Map<string, number>(); for (const e of removed) counts.set(e, (counts.get(e) ?? 0) + 1)
  console.log(`지울 이모지 ${removed.length}개: ${[...counts].map(([e, n]) => `${e}×${n}`).join(' ')}`)
  const changed = before.split('\n').map((l, i) => [l, out.split('\n')[i]] as const).filter(([a, b]) => a !== b)
  for (const [a, b] of changed) console.log(`  - ${a.trim().slice(0, 90)}\n  + ${b.trim().slice(0, 90)}`)

  const { compile } = await import('@mdx-js/mdx')
  const remarkGfm = (await import('remark-gfm')).default
  await compile(out, { remarkPlugins: [remarkGfm] })   // 실패하면 여기서 throw — 쓰지 않는다
  console.log('MDX compile OK')
  if (DRY) return

  const dir = path.resolve(process.cwd(), 'scripts', 'backups'); fs.mkdirSync(dir, { recursive: true })
  const bak = path.join(dir, `${SLUG}-${new Date().toISOString().replace(/[:.]/g, '-')}.md`)
  fs.writeFileSync(bak, before)
  // 본문 전체를 조건(eq)으로 걸면 URL 이 너무 길어 400 이 난다 — 쓰기 직전에 다시 읽어 비교한다
  const { data: again } = await sb.from('blog_posts').select('content').eq('id', post.id).single()
  if (again?.content !== before) { console.log('⚠ 그 사이 본문이 바뀌어 쓰지 않았다'); return }
  const { error: upErr } = await sb.from('blog_posts').update({ content: out }).eq('id', post.id)
  if (upErr) throw new Error(upErr.message)
  console.log(`✅ 저장 (백업: ${path.relative(process.cwd(), bak)})`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
