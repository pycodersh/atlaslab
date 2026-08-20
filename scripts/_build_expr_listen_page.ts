/**
 * audio-test/expressions.html 용 데이터 생성 (읽기 전용 + 로컬 파일 복사)
 *  - 대상 slug의 실제 텍스트와 라이브 URL을 expr-data.json으로 출력
 *  - 비교 열 3종을 audio-test/ 아래로 복사
 *      · zephyr-expr/   : 최초 Gemini Zephyr판 (audio-backup/expr-zephyr)
 *      · preq-expr/     : 의문형 재생성 직전 OpenAI판 (audio-backup/expr-pattern-preq)
 *    라이브 URL은 항상 최신본
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const SLUGS = ['mwoyeyo', 'isseoyo', 'eotteoke-gayo']
const ROOT     = process.cwd()
const BK_ZEPH  = path.join(ROOT, 'audio-backup', 'expr-zephyr')
const BK_PREQ  = path.join(ROOT, 'audio-backup', 'expr-pattern-preq')
const DEST_ZEPH = path.join(ROOT, 'audio-test', 'zephyr-expr')
const DEST_PREQ = path.join(ROOT, 'audio-test', 'preq-expr')
const OUTJSON   = path.join(ROOT, 'audio-test', 'expr-data.json')

function copyIfExists(src: string, destDir: string, name: string, webPrefix: string): string | null {
  if (!fs.existsSync(src)) return null
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, path.join(destDir, name))
  return `${webPrefix}/${name}`
}

async function main() {
  const { data, error } = await sb
    .from('kp_expressions').select('id, slug, korean, english, examples, audio_urls').in('slug', SLUGS)
  if (error) throw error

  const out = SLUGS.map(slug => {
    const e = data!.find(r => r.slug === slug)!
    const ex = (typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples) as Array<{ ko: string }>
    const urls = e.audio_urls as Record<string, string>
    const texts: Record<string, string> = {
      pattern: e.korean.split('/')[0].replace(/~/g, '').replace(/^-+|-+$/g, '').replace(/[.!?]$/, '').replace(/\s+/g, ' ').trim(),
      ex1: ex[0]?.ko ?? '', ex2: ex[1]?.ko ?? '', ex3: ex[2]?.ko ?? '',
    }
    const parts = ['pattern', 'ex1', 'ex2', 'ex3'].map(key => ({
      key,
      text: texts[key],
      isQuestion: /[?？]\s*$/.test(key === 'pattern' ? e.korean : texts[key]),
      liveUrl: urls[key],
      preq: key === 'pattern'
        ? copyIfExists(path.join(BK_PREQ, slug, 'pattern.mp3'), path.join(DEST_PREQ, slug), 'pattern.mp3', `preq-expr/${slug}`)
        : null,
      zephyr: copyIfExists(path.join(BK_ZEPH, slug, `${key}.mp3`), path.join(DEST_ZEPH, slug), `${key}.mp3`, `zephyr-expr/${slug}`),
    }))
    return { id: e.id, slug, korean: e.korean, english: e.english, parts }
  })

  fs.writeFileSync(OUTJSON, JSON.stringify(out, null, 2))
  console.log(`✓ ${OUTJSON}`)
  for (const e of out) {
    console.log(`\n${e.slug} (${e.korean})`)
    for (const p of e.parts)
      console.log(`  ${p.key.padEnd(8)} "${p.text}"  라이브 ${p.liveUrl ? '있음' : '없음'} · 재생성전 ${p.preq ? '있음' : '—'} · Zephyr ${p.zephyr ? '있음' : '없음'}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
