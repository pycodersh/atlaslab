/**
 * 스토리지 파일이 이미 있는 대사에 audio_url만 재연결 (API 호출 없음)
 * npx tsx scripts/reconnect-audio.ts --ep 46 --ep 47 --ep 48 --ep 60
 * --dry  : 재연결 실행 없이 목록만 출력
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
const BUCKET = 'audio'

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

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const epIdxs = args.reduce<number[]>((acc, a, i) => (a === '--ep' ? [...acc, parseInt(args[i+1])] : acc), [])
const EPS = epIdxs.length > 0 ? epIdxs : [46, 47, 48, 60]

async function listStorageFolder(folder: string): Promise<Set<string>> {
  // folder 예: dialogues/ep46
  const { data, error } = await sb.storage.from(BUCKET).list(folder, { limit: 1000 })
  if (error) {
    console.warn(`  storage.list(${folder}) 오류: ${error.message}`)
    return new Set()
  }
  return new Set((data ?? []).map(f => f.name))  // e.g. "12345.wav"
}

async function main() {
  const DRY_TAG = DRY ? ' [DRY-RUN]' : ''
  console.log(`\n음성 재연결${DRY_TAG}: EP ${EPS.join(', ')}\n`)

  let totalFound = 0, totalMissing = 0, totalHashMismatch = 0, totalRelinked = 0

  const missing: { epNum: number; id: number; speaker: string; text: string; reason: string }[] = []

  for (const epNum of EPS) {
    const epStr = String(epNum).padStart(2, '0')
    const folder = `dialogues/ep${epStr}`

    // 스토리지 파일 목록
    const storageFiles = await listStorageFolder(folder)

    // DB 대사 목록
    const { data: dialogues } = await sb.from('kp_dialogues')
      .select('id, speaker, text_ko, audio_url, audio_hash')
      .eq('episode_id', epNum)
      .order('order_num')

    const rows = dialogues ?? []
    console.log(`\n── EP${epNum} (${rows.length}건, storage ${storageFiles.size}파일) ──`)

    for (const d of rows) {
      const id   = d.id as number
      const text = d.text_ko as string
      const spk  = d.speaker as string
      const voice = VOICE_MAP[spk]
      const fileName = `${id}.wav`
      const storagePath = `${folder}/${fileName}`

      if (!voice) {
        console.log(`  SKIP id=${id} [${spk}] — VOICE_MAP 미등록`)
        continue
      }

      const prompt  = dialoguePrompt(text)
      const newHash = contentHash(text, voice, prompt)

      const fileExists = storageFiles.has(fileName)
      const publicUrl  = fileExists
        ? sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl
        : null

      if (!fileExists) {
        console.log(`  ✗ MISSING  id=${id} [${spk}] "${text.slice(0,30)}"`)
        missing.push({ epNum, id, speaker: spk, text, reason: '파일 없음' })
        totalMissing++
        continue
      }

      // 파일 있음 — hash 검사
      const storedHash = d.audio_hash as string | null
      const hashOk = storedHash === newHash

      if (!hashOk) {
        // 텍스트/화자가 바뀐 대사: 파일은 있지만 내용이 다름 → 재생성 필요
        console.log(`  ⚠ HASH-DIFF id=${id} [${spk}] "${text.slice(0,30)}"`)
        console.log(`    stored_hash=${storedHash?.slice(0,8)} new_hash=${newHash.slice(0,8)}`)
        missing.push({ epNum, id, speaker: spk, text, reason: `hash 불일치 (파일 내용 다름)` })
        totalHashMismatch++
        continue
      }

      // 파일 있고 hash도 맞음 → 재연결
      if (d.audio_url === publicUrl) {
        console.log(`  ✓ OK       id=${id} [${spk}] "${text.slice(0,30)}" — 이미 연결됨`)
        totalFound++
        continue
      }

      console.log(`  → RELINK   id=${id} [${spk}] "${text.slice(0,30)}"`)
      if (!DRY) {
        const { error } = await sb.from('kp_dialogues')
          .update({ audio_url: publicUrl, audio_hash: newHash })
          .eq('id', id)
        if (error) {
          console.error(`    ERROR: ${error.message}`)
        } else {
          // kp_bubbles도 동기화 (episode_id + text 일치)
          await sb.from('kp_bubbles').update({ audio_url: publicUrl }).eq('episode_id', epNum).eq('korean', text)
          totalRelinked++
        }
      } else {
        totalRelinked++
      }
      totalFound++
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log(`재연결 완료${DRY_TAG}: ${totalRelinked}건`)
  console.log(`이미 연결됨: ${totalFound - totalRelinked}건`)
  console.log(`파일 없음:   ${totalMissing}건`)
  console.log(`Hash 불일치: ${totalHashMismatch}건`)

  if (missing.length > 0) {
    console.log(`\n🔴 재생성 필요 목록 (${missing.length}건):`)
    for (const m of missing) {
      console.log(`  EP${m.epNum} id=${m.id} [${m.speaker}] "${m.text}" — ${m.reason}`)
    }
  } else {
    console.log('\n✓ 재생성 필요 없음')
  }
}
main().catch(console.error)
