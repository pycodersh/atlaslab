/**
 * 기존 글 2편에 사진 추가 — 노량진 수산시장(01·02), 한국 안전/긴급번호(03·04)
 *
 * 규칙: 이미지가 2장이면 1장은 썸네일(thumbnail 컬럼), 나머지는 본문의 해당 문구 바로 아래에 넣는다.
 * 저장 위치·이름·태그는 기존 글을 따른다:
 *   blog-covers 버킷(public) · `{slug}-cover.jpg` · 본문은 <img src alt loading="lazy" />
 *
 * 바꾸는 것은 두 행의 thumbnail 과 content 뿐이다. 이미 들어간 이미지는 다시 넣지 않고,
 * 같은 이름의 파일이 버킷에 있으면 덮어쓰지 않고 멈춘다. 본문 기준 문구가 정확히 한 번 있을 때만 넣는다.
 *
 * 실행: npx tsx scripts/add-images-noryangjin-and-safety.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import * as os from 'os'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROJECT_REF = 'eecvvgkihtcgfikaimao'
const BUCKET = 'blog-covers'
const PROD = 'https://www.atlaslabstudios.com'
const SRC = path.join(os.homedir(), 'Downloads')

type Job = {
  slug: string
  urlPath: string
  cover: { file: string }
  body: { file: string; name: string; alt: string; after: string }
}

const JOBS: Job[] = [
  {
    slug: 'noryangjin-fish-market-guide-how-to-eat-hoe',
    urlPath: '/blog/en/k-pantry/noryangjin-fish-market-guide-how-to-eat-hoe',
    cover: { file: '01.jpg' },
    body: {
      file: '02.jpg',
      name: 'tanks',
      alt: 'Live seafood tanks at Noryangjin Fisheries Market with snow crabs, scallops and other shellfish, each labeled with a price',
      after: 'The market is a large building filled with stalls selling live seafood from tanks, with restaurants on the upper floor.',
    },
  },
  {
    slug: 'is-korea-safe-emergency-numbers-tourists',
    urlPath: '/blog/en/k-patto/is-korea-safe-emergency-numbers-tourists',
    cover: { file: '03.jpg' },
    body: {
      file: '04.jpg',
      name: 'responders',
      alt: 'Illustration of a doctor, a firefighter and a police officer',
      after: 'You dial these like any phone number, with no area code.',
    },
  },
]

const publicUrl = (key: string) => sb.storage.from(BUCKET).getPublicUrl(key).data.publicUrl

async function upload(key: string, file: string) {
  const { data: listed, error: listErr } = await sb.storage.from(BUCKET).list('', { search: key })
  if (listErr) throw new Error(`버킷 조회 실패: ${listErr.message}`)
  if (listed?.some(o => o.name === key)) throw new Error(`이미 있는 파일 — 덮어쓰지 않는다: ${key}`)
  const buf = fs.readFileSync(path.join(SRC, file))
  const { error } = await sb.storage.from(BUCKET).upload(key, buf, { contentType: 'image/jpeg', upsert: false })
  if (error) throw new Error(`업로드 실패 ${key}: ${error.message}`)
  console.log(`   ↑ ${file} → ${key} (${(buf.length / 1024).toFixed(0)} KB)`)
  return publicUrl(key)
}

/** 기준 문장이 든 문단이 끝나는 곳(빈 줄 앞) 뒤에 이미지 문단을 넣는다.
 *  ※ 첫 실행 때는 '\n\n' 만 찾아서 CRLF 글에서 문단 끝을 못 찾고 맨 끝에 붙었다 —
 *    fix-images-noryangjin-and-safety.ts 로 바로잡았고, 여기는 CRLF·LF 둘 다 찾도록 고쳤다.
 *    빈 줄을 못 찾으면 맨 끝에 붙이지 않고 멈춘다. */
function insertAfterParagraph(content: string, anchor: string, block: string): string {
  const hits = content.split(anchor).length - 1
  if (hits !== 1) throw new Error(`기준 문구가 ${hits}번 — 정확히 1번이어야 한다: "${anchor.slice(0, 40)}…"`)
  const eol = content.includes('\r\n') ? '\r\n' : '\n'
  const gap = /\r?\n\r?\n/g
  gap.lastIndex = content.indexOf(anchor)
  const m = gap.exec(content)
  if (!m) throw new Error('기준 문단 끝(빈 줄)을 찾지 못했다 — 맨 끝에 붙이지 않고 중단')
  return content.slice(0, m.index) + eol + eol + block + content.slice(m.index)
}

async function main() {
  const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]
  if (ref !== PROJECT_REF) { console.error(`⛔ Supabase 프로젝트가 ${ref} — 중단`); process.exit(1) }

  for (const job of JOBS) {
    console.log(`\n■ ${job.slug}`)
    const { data: rows, error } = await sb.from('blog_posts').select('id, thumbnail, content').eq('slug', job.slug)
    if (error) throw error
    if (rows?.length !== 1) throw new Error(`행이 ${rows?.length}개 — 정확히 1개여야 한다`)
    const row = rows[0]

    const coverKey = `${job.slug}-cover.jpg`
    const bodyKey = `${job.slug}-${job.body.name}.jpg`
    if (row.thumbnail) throw new Error(`이미 thumbnail 이 있다: ${row.thumbnail} — 중단`)
    if (String(row.content).includes(bodyKey)) throw new Error('본문에 이미 이미지가 있다 — 중단')

    const coverUrl = await upload(coverKey, job.cover.file)
    const bodyUrl = await upload(bodyKey, job.body.file)

    const img = `<img src="${bodyUrl}" alt="${job.body.alt}" loading="lazy" />`
    const content = insertAfterParagraph(String(row.content), job.body.after, img)

    const { error: upErr } = await sb.from('blog_posts').update({ thumbnail: coverUrl, content }).eq('id', row.id)
    if (upErr) throw new Error(`UPDATE 실패: ${upErr.message}`)
    console.log(`   ✅ UPDATE id=${row.id}\n      thumbnail = ${coverUrl}\n      본문 이미지 = ${bodyUrl}`)

    // 확인 — 상세 페이지는 force-dynamic 이라 바로 반영된다
    const html = await fetch(`${PROD}${job.urlPath}`).then(r => r.text())
    console.log(`   ${html.includes(coverKey) ? '✅' : '❌'} 페이지에 썸네일(${coverKey})`)
    console.log(`   ${html.includes(bodyKey) ? '✅' : '❌'} 페이지에 본문 이미지(${bodyKey})`)
    for (const u of [coverUrl, bodyUrl]) {
      const r = await fetch(u, { method: 'HEAD' })
      console.log(`   ${r.ok ? '✅' : '❌'} ${r.status} ${r.headers.get('content-type')}  ${u.split('/').pop()}`)
    }
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
