/**
 * K-PATTO 데이터 정리 (2026-10-27)
 *
 * 1) 영어 뜻이 한국어로 남아 있던 패턴 6개(kp_expressions.english)를 영어로 채운다.
 *    문구는 각 화의 실제 대사 쓰임과 기존 뜻풀이 문체(예: 'It's more ~ than I expected.')에 맞췄다.
 * 2) 화자 ID '간호사' 를 다른 화자들처럼 영어 'nurse' 로 바꾼다(kp_bubbles · kp_dialogues).
 *    음성 생성 스크립트의 VOICE_MAP 에도 nurse 를 같은 목소리로 추가해야 한다 — 미등록 화자는 건너뛴다.
 *    목소리가 같으니 audio_hash(text|voice|prompt)도 같아서 기존 음성은 다시 만들지 않는다.
 *
 * 안전장치: 각 행이 처음 확인한 값 그대로일 때만 바꾼다(그 사이 누가 고쳤으면 건드리지 않고 알린다).
 * 다시 돌려도 이미 바뀐 행은 "이미 적용됨" 으로 넘어간다.
 *
 * 실행: npx tsx scripts/fix-kpatto-glosses-and-nurse.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

const GLOSSES: { id: number; from: string; to: string }[] = [
  { id: 904,  from: '아직 ~',         to: "I'm still ~ing." },
  { id: 958,  from: '꼭 ~',           to: 'You really have to ~.' },
  { id: 985,  from: '생각보다 훨씬 ~', to: "It's way more ~ than I expected." },
  { id: 947,  from: '은근히 ~',       to: "You're surprisingly ~ / It's surprisingly ~." },
  { id: 1014, from: '일단은 ~',       to: 'For now, ~.' },
  { id: 976,  from: '왠지 모르게 ~',  to: 'Somehow, it feels ~.' },
]

const SPEAKER_ROWS: { table: 'kp_bubbles' | 'kp_dialogues'; id: number }[] = [
  { table: 'kp_bubbles', id: 3843 },
  { table: 'kp_dialogues', id: 11492 },
]

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) {
    throw new Error('patto Supabase 가 아니다 — 중단')
  }

  console.log('── glosses (kp_expressions.english)')
  for (const g of GLOSSES) {
    const { data, error } = await sb.from('kp_expressions')
      .update({ english: g.to }).eq('id', g.id).eq('english', g.from).select('id, korean, english')
    if (error) throw new Error(`id=${g.id}: ${error.message}`)
    if (data?.length) { console.log(`  ✅ id=${g.id} ${data[0].korean} → ${data[0].english}`); continue }
    const { data: cur } = await sb.from('kp_expressions').select('english').eq('id', g.id).single()
    console.log(cur?.english === g.to ? `  · id=${g.id} 이미 적용됨` : `  ⚠ id=${g.id} 값이 달라 건너뜀: "${cur?.english}"`)
  }

  console.log('── speaker 간호사 → nurse')
  for (const r of SPEAKER_ROWS) {
    const { data, error } = await sb.from(r.table)
      .update({ speaker: 'nurse' }).eq('id', r.id).eq('speaker', '간호사').select('id, speaker')
    if (error) throw new Error(`${r.table} id=${r.id}: ${error.message}`)
    if (data?.length) { console.log(`  ✅ ${r.table} id=${r.id} → ${data[0].speaker}`); continue }
    const { data: cur } = await sb.from(r.table).select('speaker').eq('id', r.id).single()
    console.log(cur?.speaker === 'nurse' ? `  · ${r.table} id=${r.id} 이미 적용됨` : `  ⚠ ${r.table} id=${r.id} 값이 달라 건너뜀: "${cur?.speaker}"`)
  }

  // ── 확인
  const { data: left } = await sb.from('kp_expressions').select('id, korean, english').eq('is_active', true)
  const stillKorean = (left ?? []).filter(x => /[가-힣]/.test(x.english))
  const b = await sb.from('kp_bubbles').select('id', { count: 'exact', head: false }).eq('speaker', '간호사').range(0, 0)
  const d = await sb.from('kp_dialogues').select('id', { count: 'exact', head: false }).eq('speaker', '간호사').range(0, 0)
  if (b.count == null || d.count == null) throw new Error('확인 쿼리 count 가 null')
  console.log('── verify')
  console.log(`  active patterns with Korean in the English gloss: ${stillKorean.length}`)
  console.log(`  rows still using speaker '간호사': kp_bubbles ${b.count}, kp_dialogues ${d.count}`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
