/** EP61~70 오디오 현황 점검 (읽기 전용) */
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
  const { data: eps, error: e1 } = await sb
    .from('kp_episodes')
    .select('id, episode_num, title')
    .gte('episode_num', 61).lte('episode_num', 70)
    .order('episode_num')
  if (e1) throw e1
  console.log('=== kp_episodes 61~70 ===')
  for (const e of eps!) console.log(`EP${e.episode_num}  id=${e.id}  (${typeof e.id})  ${e.title}`)

  const epIds = eps!.map(e => e.id)
  const numById = new Map(eps!.map(e => [e.id, e.episode_num]))

  // kp_dialogues: episode_id 타입 확인
  const { data: dSample } = await sb.from('kp_dialogues').select('*').limit(1)
  console.log('\n=== kp_dialogues 컬럼 ===')
  console.log(Object.entries(dSample![0]).map(([k, v]) => `${k}: ${typeof v} = ${JSON.stringify(v)?.slice(0, 60)}`).join('\n'))

  const { data: bSample } = await sb.from('kp_bubbles').select('*').limit(1)
  console.log('\n=== kp_bubbles 컬럼 ===')
  console.log(Object.entries(bSample![0]).map(([k, v]) => `${k}: ${typeof v} = ${JSON.stringify(v)?.slice(0, 60)}`).join('\n'))

  // 대사 현황 (정수 episode_id 가정)
  const { data: dlg, error: e2 } = await sb
    .from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url, audio_hash')
    .gte('episode_id', 61).lte('episode_id', 70)
    .order('episode_id').order('order_num')
  if (e2) console.log('kp_dialogues int query error:', e2.message)

  console.log('\n=== kp_dialogues EP61~70 ===')
  console.log('총', dlg?.length ?? 0, '건')
  const byEp: Record<number, any[]> = {}
  for (const d of dlg ?? []) (byEp[d.episode_id] ??= []).push(d)
  for (const k of Object.keys(byEp).sort((a, b) => +a - +b)) {
    const list = byEp[+k]
    const withUrl = list.filter(d => d.audio_url).length
    const kinds = new Set(list.map(d => (d.audio_url ?? '').includes('/dialogues/') ? 'gemini-wav' : d.audio_url ? 'other' : 'none'))
    console.log(`EP${k}: ${list.length}건, audio_url ${withUrl}건, ${[...kinds].join('+')}`)
  }
  console.log('화자 목록:', [...new Set((dlg ?? []).map(d => d.speaker))].join(', '))

  // 버블 현황 (UUID episode_id)
  const { data: bub, error: e3 } = await sb
    .from('kp_bubbles')
    .select('id, episode_id, order_num, speaker, korean, audio_url')
    .in('episode_id', epIds)
    .order('order_num')
  if (e3) console.log('kp_bubbles uuid query error:', e3.message)
  console.log('\n=== kp_bubbles EP61~70 ===')
  console.log('총', bub?.length ?? 0, '건')
  const bByEp: Record<number, any[]> = {}
  for (const b of bub ?? []) (bByEp[numById.get(b.episode_id) as number] ??= []).push(b)
  for (const k of Object.keys(bByEp).sort((a, b) => +a - +b)) {
    const list = bByEp[+k]
    const withUrl = list.filter(b => b.audio_url).length
    const sampleUrl = list.find(b => b.audio_url)?.audio_url ?? '(없음)'
    console.log(`EP${k}: ${list.length}건, audio_url ${withUrl}건, ex=${sampleUrl.split('/').slice(-3).join('/')}`)
  }
  console.log('버블 화자 목록:', [...new Set((bub ?? []).map(b => b.speaker))].join(', '))

  // 대사 <-> 버블 텍스트 매칭 확인
  console.log('\n=== 대사↔버블 텍스트 매칭 ===')
  for (const k of Object.keys(byEp).sort((a, b) => +a - +b)) {
    const epNum = +k
    const dl = byEp[epNum]
    const bl = bByEp[epNum] ?? []
    const bkeys = new Set(bl.map(b => b.korean.trim()))
    const unmatched = dl.filter(d => !bkeys.has(d.text_ko.trim()))
    console.log(`EP${epNum}: 대사 ${dl.length} / 버블 ${bl.length} / 매칭안됨 ${unmatched.length}`)
    for (const u of unmatched.slice(0, 5)) console.log(`   대사만: [${u.speaker}] ${u.text_ko}`)
  }

  // EP60 비교 (Gemini 기준)
  const { data: ep60 } = await sb.from('kp_dialogues')
    .select('id, speaker, text_ko, audio_url').eq('episode_id', 60).order('order_num')
  console.log('\n=== EP60 (Gemini 기준) 샘플 ===')
  for (const d of (ep60 ?? []).slice(0, 3)) console.log(`  [${d.speaker}] ${d.audio_url}`)

  const { data: ep60b } = await sb.from('kp_bubbles')
    .select('id, audio_url').eq('episode_id', eps!.length ? null as any : null).limit(0)
  void ep60b
}

main().catch(e => { console.error(e); process.exit(1) })
