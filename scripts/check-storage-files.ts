/**
 * Supabase 스토리지 dialogues/epXX 폴더 실제 파일 목록 확인
 * npx tsx scripts/check-storage-files.ts
 */
import { config } from 'dotenv'; config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
const BUCKET = 'audio'

async function listFolder(epNum: number) {
  const epStr = String(epNum).padStart(2, '0')
  const folder = `dialogues/ep${epStr}`
  const { data, error } = await sb.storage.from(BUCKET).list(folder, { limit: 200 })
  if (error) { console.log(`  EP${epNum}: 오류 — ${error.message}`); return }
  const files = (data ?? []).filter(f => f.name !== '.emptyFolderPlaceholder')
  console.log(`\nEP${epNum} (${files.length}파일): ${folder}/`)
  for (const f of files.sort((a,b) => a.name.localeCompare(b.name))) {
    const sizeKb = f.metadata?.size ? `${(f.metadata.size/1024).toFixed(0)}KB` : '?KB'
    console.log(`  ${f.name}  (${sizeKb})`)
  }
}

async function main() {
  for (const epNum of [46, 47, 48, 60]) {
    await listFolder(epNum)
  }
}
main().catch(console.error)
