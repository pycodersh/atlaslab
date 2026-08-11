/**
 * 음성 재생성 대상 미리보기 (dry-run)
 * audio_url=NULL 또는 hash 불일치 대사를 화별로 출력
 * npx tsx scripts/preview-audio-targets.ts --ep 46 --ep 48
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const VOICE_MAP: Record<string, string> = {
  emma: 'Kore', jisu: 'Zephyr', jisoo: 'Zephyr', minjun: 'Umbriel', sophie: 'Aoede',
  staff: 'Zephyr', 직원: 'Zephyr', stranger: 'Kore', 행인: 'Kore',
  doctor: 'Rasalgethi', 의사: 'Rasalgethi', pharmacist: 'Algieba', 약사: 'Algieba',
  간호사: 'Vindemiatrix', merchant: 'Charon', 상인: 'Charon',
  professor: 'Charon', 교수님: 'Charon', driver: 'Puck', 기사: 'Puck',
  clerk: 'Zephyr', receptionist: 'Vindemiatrix', announcement: 'Iapetus',
  students: 'Kore', student: 'Kore',
}

function dialoguePrompt(text: string): string {
  return `또박또박, 자연스럽게 읽어줘:\n${text}`
}

function contentHash(text: string, voice: string, prompt: string): string {
  return createHash('sha256').update(text + '|' + voice + '|' + prompt, 'utf8').digest('hex').slice(0, 16)
}

const EPS = process.argv.filter(a => a.match(/^\d+$/)).map(Number)
const epList = EPS.length > 0 ? EPS : [46, 48]

async function main() {
  let totalTarget = 0
  for (const epNum of epList) {
    const { data: dialogues } = await sb.from('kp_dialogues')
      .select('id, speaker, text_ko, audio_url, audio_hash')
      .eq('episode_id', epNum)
      .order('order_num')

    const targets: { id: number; speaker: string; text: string; reason: string }[] = []

    for (const d of (dialogues ?? [])) {
      const voice = VOICE_MAP[d.speaker as string]
      if (!voice) {
        console.warn(`  EP${epNum} SKIP — VOICE_MAP 미등록 speaker: "${d.speaker}"`)
        continue
      }
      const prompt = dialoguePrompt(d.text_ko as string)
      const hash   = contentHash(d.text_ko as string, voice, prompt)
      if (!d.audio_url) {
        targets.push({ id: d.id as number, speaker: d.speaker as string, text: d.text_ko as string, reason: 'audio_url=NULL' })
      } else if (d.audio_hash !== hash) {
        targets.push({ id: d.id as number, speaker: d.speaker as string, text: d.text_ko as string, reason: `hash 불일치 (stored=${d.audio_hash?.slice(0,8)}, new=${hash.slice(0,8)})` })
      }
    }

    console.log(`\n[EP${epNum}] 재생성 대상 ${targets.length}건 / 전체 ${(dialogues ?? []).length}건`)
    for (const t of targets) {
      console.log(`  id=${t.id} [${t.speaker}] "${t.text}" — ${t.reason}`)
    }
    totalTarget += targets.length
  }
  console.log(`\n합계: ${totalTarget}건`)
}
main().catch(console.error)
