import * as dotenv from 'dotenv'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local' })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  console.log('=== kp_bubbles 행 수 ===')

  for (const speaker of ['emma', 'sophie', 'jisu', 'minjun']) {
    const { count } = await sb
      .from('kp_bubbles')
      .select('*', { count: 'exact', head: true })
      .eq('speaker', speaker)
    console.log(`  ${speaker}: ${count}행`)
  }

  // 지수야 등장 횟수 (kp_bubbles, emma만)
  const { data: jisuyaBubbles } = await sb
    .from('kp_bubbles')
    .select('id, speaker, korean')
    .eq('speaker', 'emma')
    .like('korean', '%지수야%')
  console.log(`\n  '지수야' in kp_bubbles (emma): ${jisuyaBubbles?.length}행`)
  jisuyaBubbles?.forEach(r => console.log(`    id=${r.id} | ${r.korean}`))

  console.log('\n=== kp_bubbles 샘플 (korean 텍스트) ===')
  for (const speaker of ['emma', 'sophie', 'jisu', 'minjun']) {
    const { data } = await sb
      .from('kp_bubbles')
      .select('id, speaker, korean')
      .eq('speaker', speaker)
      .order('id')
      .limit(5)
    console.log(`\n  [${speaker}]`)
    data?.forEach(r => console.log(`    id=${r.id} | ${r.korean}`))
  }

  console.log('\n=== kp_dialogues 행 수 ===')
  for (const speaker of ['emma', 'sophie', 'jisu', 'minjun']) {
    const { count } = await sb
      .from('kp_dialogues')
      .select('*', { count: 'exact', head: true })
      .eq('speaker', speaker)
    console.log(`  ${speaker}: ${count}행`)
  }

  // 지수야 등장 (kp_dialogues, emma)
  const { data: jisuyaDlg } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .eq('speaker', 'emma')
    .like('text_ko', '%지수야%')
  console.log(`\n  '지수야' in kp_dialogues (emma): ${jisuyaDlg?.length}행`)
  jisuyaDlg?.forEach(r => console.log(`    id=${r.id} | ${r.text_ko}`))

  console.log('\n=== kp_dialogues 샘플 ===')
  for (const speaker of ['emma', 'sophie', 'jisu', 'minjun']) {
    const { data } = await sb
      .from('kp_dialogues')
      .select('id, speaker, text_ko')
      .eq('speaker', speaker)
      .order('id')
      .limit(5)
    console.log(`\n  [${speaker}]`)
    data?.forEach(r => console.log(`    id=${r.id} | ${r.text_ko}`))
  }

  // 전체 dump (검토용)
  const { data: allBubbles } = await sb
    .from('kp_bubbles')
    .select('id, speaker, korean')
    .in('speaker', ['emma', 'sophie', 'jisu', 'minjun'])
    .order('speaker').order('id')
  fs.writeFileSync('scripts/speech-style-bubbles.json', JSON.stringify(allBubbles, null, 2))

  const { data: allDlg } = await sb
    .from('kp_dialogues')
    .select('id, speaker, text_ko')
    .in('speaker', ['emma', 'sophie', 'jisu', 'minjun'])
    .order('speaker').order('id')
  fs.writeFileSync('scripts/speech-style-dialogues.json', JSON.stringify(allDlg, null, 2))

  console.log('\n✅ speech-style-bubbles.json / speech-style-dialogues.json 저장')
}
main().catch(console.error)
