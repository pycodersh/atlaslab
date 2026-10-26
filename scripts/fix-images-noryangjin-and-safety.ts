/**
 * add-images-noryangjin-and-safety.ts 의 본문 이미지 위치 바로잡기
 *
 * 두 글의 content 는 줄바꿈이 CRLF(\r\n)다. 첫 스크립트가 문단 끝을 '\n\n' 으로만 찾아서
 * 못 찾고 본문 맨 끝(K-PATTO 안내 뒤)에 <img> 를 붙였다. 이 스크립트는
 *   1) 맨 끝에 붙은 '\n\n<img …>' 를 떼어 내고
 *   2) 기준 문장이 든 문단 바로 뒤(CRLF 빈 줄 기준)에 사이트 표준 <figure> 로 다시 넣는다.
 * 세로 사진·정사각 일러스트라 post-figure-auto(자르지 않음) + post-figure-narrow(폭 520px)로 둔다.
 * 썸네일은 건드리지 않는다.
 *
 * 실행: npx tsx scripts/fix-images-noryangjin-and-safety.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const PROJECT_REF = 'eecvvgkihtcgfikaimao'
const PROD = 'https://www.atlaslabstudios.com'

const JOBS = [
  {
    slug: 'noryangjin-fish-market-guide-how-to-eat-hoe',
    urlPath: '/blog/en/k-pantry/noryangjin-fish-market-guide-how-to-eat-hoe',
    file: 'noryangjin-fish-market-guide-how-to-eat-hoe-tanks.jpg',
    caption: 'Live seafood tanks on the ground floor, each priced by the piece or by weight',
    after: 'The market is a large building filled with stalls selling live seafood from tanks, with restaurants on the upper floor.',
    next: 'Getting there is easy',
  },
  {
    slug: 'is-korea-safe-emergency-numbers-tourists',
    urlPath: '/blog/en/k-patto/is-korea-safe-emergency-numbers-tourists',
    file: 'is-korea-safe-emergency-numbers-tourists-responders.jpg',
    caption: 'Police for 112, fire and ambulance for 119. Illustration: Freepik',
    after: 'You dial these like any phone number, with no area code.',
    next: '## How Safe Is Korea, Really?',
  },
]

async function main() {
  const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]
  if (ref !== PROJECT_REF) { console.error(`⛔ Supabase 프로젝트가 ${ref} — 중단`); process.exit(1) }

  for (const job of JOBS) {
    console.log(`\n■ ${job.slug}`)
    const { data: row, error } = await sb.from('blog_posts').select('id, content').eq('slug', job.slug).single()
    if (error) throw error
    let content = String(row.content)
    const eol = content.includes('\r\n') ? '\r\n' : '\n'

    // 1) 맨 끝에 잘못 붙은 <img> 떼기 — 정확히 그 모양일 때만
    const tail = content.match(/\n\n(<img src="[^"]*" alt="([^"]*)" loading="lazy" \/>)$/)
    if (!tail || !tail[1].includes(job.file)) throw new Error('맨 끝의 잘못 붙은 <img> 를 찾지 못했다 — 중단(이미 고쳤는지 확인)')
    const imgTag = tail[1]
    content = content.slice(0, content.length - tail[0].length)
    if (content.includes(job.file)) throw new Error('본문 다른 곳에도 같은 이미지가 있다 — 중단')

    // 2) 기준 문단 뒤에 figure 넣기
    const hits = content.split(job.after).length - 1
    if (hits !== 1) throw new Error(`기준 문구가 ${hits}번 — 중단`)
    const start = content.indexOf(job.after)
    const gap = /\r?\n\r?\n/g
    gap.lastIndex = start
    const m = gap.exec(content)
    if (!m) throw new Error('기준 문단 끝(빈 줄)을 찾지 못했다 — 중단')
    const figure = [
      '<figure className="post-figure post-figure-auto post-figure-narrow">',
      imgTag,
      `<figcaption>${job.caption}</figcaption>`,
      '</figure>',
    ].join(eol)
    content = content.slice(0, m.index) + eol + eol + figure + content.slice(m.index)

    // 다음 문단보다 앞에 들어갔는지
    const fi = content.indexOf(job.file), ni = content.indexOf(job.next)
    if (!(start < fi && fi < ni)) throw new Error('삽입 위치가 기대와 다르다 — 중단(UPDATE 안 함)')

    const { error: upErr } = await sb.from('blog_posts').update({ content }).eq('id', row.id)
    if (upErr) throw new Error(`UPDATE 실패: ${upErr.message}`)
    console.log(`   ✅ UPDATE id=${row.id} — 기준 문단 뒤, "${job.next.slice(0, 30)}" 앞`)

    const html = await fetch(`${PROD}${job.urlPath}`).then(r => r.text())
    const a = html.indexOf(job.after.slice(0, 40)), i = html.indexOf(job.file), n = html.indexOf(job.next.replace(/^## /, ''))
    const once = html.split(job.file).length - 1
    console.log(`   ${a < i && i < n ? '✅' : '❌'} 페이지 순서: 기준 문단 < 이미지 < 다음 문단  (등장 ${once}회)`)
    console.log(`   ${html.includes('post-figure-narrow') ? '✅' : '❌'} figure 클래스 렌더링`)
  }
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
