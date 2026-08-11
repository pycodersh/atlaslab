/**
 * 스토리지의 OLD ID 파일을 NEW 대사에 텍스트 내용 기반으로 재연결
 *
 * 동작 원리:
 * 1. 스토리지 파일(11394.wav 등) → Supabase에 직접 audio_hash는 없으니,
 *    generate 스크립트가 contentHash를 kp_dialogues.audio_hash에 저장했다면
 *    "현재 대사 hash와 일치하는 old 파일"을 찾아야 함.
 * 2. 그런데 old 대사가 삭제되어 hash 매핑이 없음.
 * 3. 대신: 파일 순서(정렬) × episode_id × 대사 순서가 1:1 대응이라고 가정해 매칭.
 *
 * --dry : 실행 없이 계획만 출력
 * npx tsx scripts/relink-audio-by-content.ts --dry
 * npx tsx scripts/relink-audio-by-content.ts
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
function prompt(text: string) { return `또박또박, 자연스럽게 읽어줘:\n${text}` }
function contentHash(text: string, voice: string): string {
  const p = prompt(text)
  return createHash('sha256').update(text + '|' + voice + '|' + p, 'utf8').digest('hex').slice(0, 16)
}

const DRY = process.argv.includes('--dry')
const EPS = [46, 47, 48, 60]

async function main() {
  console.log(`\n음성 재연결 (텍스트 순서 매칭)${DRY ? ' [DRY]' : ''}\n`)

  // 백업 파일에서 구 대사 읽기 (있으면)
  let oldDlgsByEp = new Map<number, { id: number; speaker: string; text_ko: string; audio_url: string | null; order_num: number }[]>()
  try {
    const fs = await import('fs')
    const raw = fs.readFileSync('data/backup/kp_tables_1786436899254.json', 'utf8')
    const backup = JSON.parse(raw)
    const dlgs = backup.kp_dialogues as { id: number; speaker: string; text_ko: string; audio_url: string | null; order_num: number; episode_id: number }[]
    for (const d of (dlgs ?? [])) {
      if (EPS.includes(d.episode_id)) {
        const arr = oldDlgsByEp.get(d.episode_id) ?? []
        arr.push(d)
        oldDlgsByEp.set(d.episode_id, arr)
      }
    }
    console.log(`백업 로드: ${[...oldDlgsByEp.values()].flat().length}건`)
  } catch {
    console.log('백업 파일 없음 — 구 대사 데이터 없이 진행')
  }

  let totalRelinked = 0
  const genuinelyMissing: { epNum: number; id: number; speaker: string; text: string }[] = []

  for (const epNum of EPS) {
    const epStr = String(epNum).padStart(2, '0')
    const folder = `dialogues/ep${epStr}`

    // 스토리지 파일 목록 (정렬)
    const { data: storageFiles } = await sb.storage.from(BUCKET).list(folder, { limit: 200 })
    const sortedFiles = (storageFiles ?? [])
      .filter(f => f.name.endsWith('.wav') && f.name !== '.emptyFolderPlaceholder')
      .sort((a, b) => a.name.localeCompare(b.name))

    // 현재 대사 (order_num 순)
    const { data: newDlgs } = await sb.from('kp_dialogues')
      .select('id, speaker, text_ko, audio_url, audio_hash, order_num')
      .eq('episode_id', epNum)
      .order('order_num')
    const newList = (newDlgs ?? []) as { id: number; speaker: string; text_ko: string; audio_url: string | null; audio_hash: string | null; order_num: number }[]

    // 구 대사 (백업에서, order_num 순)
    const oldList = (oldDlgsByEp.get(epNum) ?? []).sort((a, b) => a.order_num - b.order_num)

    console.log(`\n── EP${epNum} ──`)
    console.log(`  storage 파일: ${sortedFiles.length}개 (${sortedFiles.map(f=>f.name).join(', ')})`)
    console.log(`  new 대사: ${newList.length}건, old 대사(백업): ${oldList.length}건`)

    // 텍스트 매칭: old 대사 text_ko = new 대사 text_ko 비교
    // old_text → storage 파일 (order_num 순서로 매칭)
    const oldTextToFile = new Map<string, string>()  // text_ko → filename
    if (oldList.length === sortedFiles.length) {
      // old 순서 = 파일 순서
      for (let i = 0; i < oldList.length; i++) {
        oldTextToFile.set(oldList[i].text_ko, sortedFiles[i].name)
      }
    } else if (oldList.length === 0 && sortedFiles.length > 0) {
      // 백업 없음 — 순서로 추정 (new 순서 = 파일 순서)
      for (let i = 0; i < Math.min(newList.length, sortedFiles.length); i++) {
        oldTextToFile.set(newList[i].text_ko, sortedFiles[i].name)
      }
      console.log('  ⚠ 백업 없음 — 파일/대사 순서 동일 가정')
    }

    for (const d of newList) {
      const voice = VOICE_MAP[d.speaker]
      if (!voice) { console.log(`  SKIP id=${d.id} [${d.speaker}] — VOICE_MAP 미등록`); continue }

      const newHash = contentHash(d.text_ko, voice)
      const fileName = oldTextToFile.get(d.text_ko)
      if (!fileName) {
        console.log(`  ✗ 매칭 없음 id=${d.id} [${d.speaker}] "${d.text_ko.slice(0,25)}"`)
        genuinelyMissing.push({ epNum, id: d.id, speaker: d.speaker, text: d.text_ko })
        continue
      }

      const storagePath = `${folder}/${fileName}`
      const publicUrl = sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl

      if (d.audio_url === publicUrl && d.audio_hash === newHash) {
        console.log(`  ✓ OK  id=${d.id} [${d.speaker}] "${d.text_ko.slice(0,25)}"`)
        continue
      }

      console.log(`  → RELINK id=${d.id} [${d.speaker}] "${d.text_ko.slice(0,25)}" → ${fileName}`)
      if (!DRY) {
        const { error } = await sb.from('kp_dialogues')
          .update({ audio_url: publicUrl, audio_hash: newHash })
          .eq('id', d.id)
        if (error) {
          console.error(`    ERROR: ${error.message}`)
          genuinelyMissing.push({ epNum, id: d.id, speaker: d.speaker, text: d.text_ko })
        } else {
          await sb.from('kp_bubbles').update({ audio_url: publicUrl }).eq('episode_id', epNum).eq('korean', d.text_ko)
          totalRelinked++
        }
      } else {
        totalRelinked++
      }
    }
  }

  console.log('\n' + '═'.repeat(60))
  console.log(`재연결 완료${DRY ? ' [DRY]' : ''}: ${totalRelinked}건`)
  if (genuinelyMissing.length > 0) {
    console.log(`\n🔴 진짜 재생성 필요 (${genuinelyMissing.length}건):`)
    for (const m of genuinelyMissing) {
      console.log(`  EP${m.epNum} id=${m.id} [${m.speaker}] "${m.text}"`)
    }
  } else {
    console.log('✓ 재생성 필요 없음')
  }
}
main().catch(console.error)
