/**
 * blog_posts 본문 보강(기존 슬러그·URL·published_at 유지, 기존 문장은 수정하지 않고 섹션만 삽입)
 *
 *  1. hands-free-seoul-subway-lockers-guide  — T-Luggage·보관 방식 비교(3-Step 앞), 자정 이후·만석 대처(끝)
 *  2. korean-internet-slang-guide            — 누락 초성 3개(Laughing 앞), 3초 답장 조합(Fandom 앞)
 *
 * blog_posts 에는 updated_at 컬럼이 없어 날짜 갱신은 하지 않는다(published_at 은 목록 순서가 바뀌므로 그대로 둔다).
 * 원본은 BACKUP_DIR 에 저장한다.
 *
 * 실행: BACKUP_DIR=<경로> npx tsx scripts/update-posts-lockers-and-slang.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROD = 'https://www.atlaslabstudios.com'
const frag = (n: string) => fs.readFileSync(path.resolve(process.cwd(), 'scripts', n), 'utf8').trim()

type Patch = { slug: string; apply: (c: string) => string; inserted: string[] }

function insertBefore(content: string, anchor: string, block: string): string {
  const n = content.split(anchor).length - 1
  if (n !== 1) throw new Error(`앵커가 ${n}회 나옴(1회여야 함): ${anchor}`)
  return content.replace(anchor, `${block}\n\n${anchor}`)
}

const HF_A = frag('_patch-hands-free-tluggage.md')
const HF_B = frag('_patch-hands-free-tail.md')
const SL_A = frag('_patch-slang-initials.md')
const SL_B = frag('_patch-slang-replies.md')

const PATCHES: Patch[] = [
  {
    slug: 'hands-free-seoul-subway-lockers-guide',
    inserted: [HF_A, HF_B],
    apply: c => {
      let out = insertBefore(c, '## 3-Step Protocol for Storing and Moving Luggage', HF_A)
      out = out.trimEnd() + '\n\n' + HF_B
      return out
    },
  },
  {
    slug: 'korean-internet-slang-guide',
    inserted: [SL_A, SL_B],
    apply: c => {
      let out = insertBefore(c, '## Laughing and crying', SL_A + '\n\n---')
      out = insertBefore(out, '## Fandom vocabulary', SL_B + '\n\n---')
      return out
    },
  },
]

async function main() {
  const backupDir = process.env.BACKUP_DIR
  if (!backupDir) throw new Error('BACKUP_DIR 필요')
  fs.mkdirSync(backupDir, { recursive: true })

  for (const p of PATCHES) {
    const { data, error } = await sb.from('blog_posts').select('id, slug, content, is_paused, published_at').eq('slug', p.slug)
    if (error) throw error
    if (!data || data.length !== 1) throw new Error(`${p.slug}: 행 ${data?.length ?? 0}개 — 중단`)
    const row = data[0]
    const before = row.content as string
    if (before.includes(p.inserted[0].split('\n')[0])) throw new Error(`${p.slug}: 이미 보강된 글 — 중단`)
    fs.writeFileSync(path.join(backupDir, `${p.slug}.before.md`), before)

    const after = p.apply(before)
    // 기존 문장이 그대로인지: 삽입분을 빼면 원문과 같아야 한다(구분선 포함 정리 후 비교)
    let stripped = after
    for (const ins of p.inserted) stripped = stripped.replace(ins + '\n\n---\n\n', '').replace(ins + '\n\n', '').replace('\n\n' + ins, '')
    if (stripped.trimEnd() !== before.trimEnd()) throw new Error(`${p.slug}: 삽입분 제거 후 원문과 다름 — 중단`)

    const { error: upErr, data: upd } = await sb.from('blog_posts').update({ content: after }).eq('id', row.id).select('id, slug, published_at, is_paused')
    if (upErr) throw new Error(`${p.slug} UPDATE 실패: ${upErr.message}`)
    if (!upd || upd.length !== 1) throw new Error(`${p.slug}: UPDATE 대상 ${upd?.length ?? 0}행`)
    console.log(`✅ ${p.slug}  ${before.length} → ${after.length} chars  (published_at ${upd[0].published_at}, paused=${upd[0].is_paused})`)
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
