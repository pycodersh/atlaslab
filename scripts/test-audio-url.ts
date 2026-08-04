import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data: dlg } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko, audio_url')
    .not('audio_url', 'is', null)
    .order('id').limit(1)

  const row = dlg?.[0]
  if (!row) { console.log('audio_url 있는 대사 없음'); return }

  console.log(`id=${row.id} [${row.speaker}] "${row.text_ko}"`)
  console.log(`audio_url: ${row.audio_url}`)

  // URL 실제 접근 가능 여부
  const res = await fetch(row.audio_url, { method: 'HEAD' })
  console.log(`HTTP: ${res.status} ${res.statusText}`)
  console.log(`Content-Type: ${res.headers.get('content-type')}`)
  console.log(`Content-Length: ${res.headers.get('content-length')} bytes`)

  // expressions 확인
  const { data: ex } = await sb
    .from('kp_expressions')
    .select('id, korean, audio_url, examples_audio_url')
    .not('audio_url', 'is', null)
    .order('id').limit(1)
  const exRow = ex?.[0]
  if (exRow) {
    console.log(`\nexpr id=${exRow.id} "${exRow.korean}"`)
    console.log(`audio_url: ${exRow.audio_url}`)
    const res2 = await fetch(exRow.audio_url, { method: 'HEAD' })
    console.log(`HTTP: ${res2.status} ${res2.statusText}`)
    if (exRow.examples_audio_url) {
      console.log(`examples_audio_url: ${exRow.examples_audio_url}`)
      const res3 = await fetch(exRow.examples_audio_url, { method: 'HEAD' })
      console.log(`examples HTTP: ${res3.status} ${res3.statusText}`)
    }
  }
}

main().catch(console.error)
