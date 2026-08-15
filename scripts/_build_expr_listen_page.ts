/**
 * audio-test/expressions.html 용 데이터 생성 (읽기 전용 + 로컬 파일 복사)
 *  - 대상 slug의 실제 텍스트와 라이브 URL을 expr-data.json으로 출력
 *  - 덮어쓰기 직전 백업본(audio-backup/expr-zephyr)을 audio-test/zephyr-expr/로 복사
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
const ROOT   = process.cwd()
const BACKUP = path.join(ROOT, 'audio-backup', 'expr-zephyr')
const DEST   = path.join(ROOT, 'audio-test', 'zephyr-expr')
const OUTJSON = path.join(ROOT, 'audio-test', 'expr-data.json')

async function main() {
  const { data, error } = await sb
    .from('kp_expressions').select('id, slug, korean, english, examples, audio_urls').in('slug', SLUGS)
  if (error) throw error

  const out = SLUGS.map(slug => {
    const e = data!.find(r => r.slug === slug)!
    const ex = (typeof e.examples === 'string' ? JSON.parse(e.examples) : e.examples) as Array<{ ko: string }>
    const urls = e.audio_urls as Record<string, string>
    const texts: Record<string, string> = {
      pattern: e.korean.replace(/^~/, '').split('/')[0].replace(/[.!?]$/, '').trim(),
      ex1: ex[0]?.ko ?? '', ex2: ex[1]?.ko ?? '', ex3: ex[2]?.ko ?? '',
    }
    const parts = ['pattern', 'ex1', 'ex2', 'ex3'].map(key => {
      const src = path.join(BACKUP, slug, `${key}.mp3`)
      let backup: string | null = null
      if (fs.existsSync(src)) {
        const dir = path.join(DEST, slug)
        fs.mkdirSync(dir, { recursive: true })
        fs.copyFileSync(src, path.join(dir, `${key}.mp3`))
        backup = `zephyr-expr/${slug}/${key}.mp3`
      }
      return { key, text: texts[key], liveUrl: urls[key], backup }
    })
    return { id: e.id, slug, korean: e.korean, english: e.english, parts }
  })

  fs.writeFileSync(OUTJSON, JSON.stringify(out, null, 2))
  console.log(`✓ ${OUTJSON}`)
  for (const e of out) {
    console.log(`\n${e.slug} (${e.korean})`)
    for (const p of e.parts) console.log(`  ${p.key.padEnd(8)} "${p.text}"  백업 ${p.backup ? '있음' : '없음'}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
