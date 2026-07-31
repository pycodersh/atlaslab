import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

const FILE = 'C:\\Users\\msj15\\Downloads\\kpatto_scripts_confirmed.md'

// EP34, EP36: 에마→민준 대사 / EP77: 그룹(민준 포함) 대사 복원
const FIXES: { before: string; after: string; dbId: number }[] = [
  // EP34 에마→민준 (존댓말 복원)
  { before: '에마: 아, 감사해!',         after: '에마: 아, 감사해요!',         dbId: 343 },
  { before: '에마: 오빠, 배달 시켜?',    after: '에마: 오빠, 배달 시켜요?',    dbId: 346 },
  { before: '에마: 우리 앞으로 자주 같이 먹어!', after: '에마: 우리 앞으로 자주 같이 먹어요!', dbId: 348 },
  { before: '에마: 너무 맛있었어!',      after: '에마: 너무 맛있었어요!',      dbId: 350 },
  // EP36 에마→민준 (존댓말 복원)
  { before: '에마: 조금!',              after: '에마: 조금요!',               dbId: 363 },
  { before: '에마: 다음에 또 마셔!',    after: '에마: 다음에 또 마셔요!',     dbId: 370 },
  // EP77 에마 그룹 발화 (민준 포함이므로 존댓말)
  { before: '에마: 다 같이 모이니까 너무 좋아!', after: '에마: 다 같이 모이니까 너무 좋아요!', dbId: 772 },
  { before: '에마: 앞으로도 잘 부탁해!', after: '에마: 앞으로도 잘 부탁해요!', dbId: 780 },
]

async function main() {
  // 1. 파일 수정
  let content = fs.readFileSync(FILE, 'utf-8')
  for (const fix of FIXES) {
    const old = fix.before
    const neu = fix.after
    if (content.includes(old)) {
      content = content.replace(old, neu)
      console.log(`[FILE] "${old}" → "${neu}"`)
    } else {
      console.log(`[FILE SKIP] 없음: "${old}"`)
    }
  }
  fs.writeFileSync(FILE, content, 'utf-8')
  console.log('\n파일 저장 완료\n')

  // 2. DB 수정
  for (const fix of FIXES) {
    const newText = fix.after.replace(/^[^:]+:\s*/, '')
    const { error } = await sb
      .from('kp_dialogues')
      .update({ text_ko: newText })
      .eq('id', fix.dbId)
    if (error) {
      console.log(`[DB ERROR] id=${fix.dbId}: ${error.message}`)
    } else {
      console.log(`[DB OK] id=${fix.dbId}: "${newText}"`)
    }
  }

  console.log('\n=== 복원 완료 ===')
}

main().catch(console.error)
