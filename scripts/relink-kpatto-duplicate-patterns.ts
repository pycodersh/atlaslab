/**
 * K-PATTO 중복 패턴 하이라이트 재연결 (2026-10-27)
 *
 * #986 중독성 있어 · #1007 ~게 됐어요 는 활성 패턴인데 어느 대사에도 하이라이트가 없었다.
 * 같은 대사의 하이라이트를 먼저 생긴 비슷한 패턴(#847 중독성 있어요 · #1303 -게 되다)이 가져갔기 때문이다.
 * 그 두 대사만 새 패턴으로 돌린다. 옛 패턴은 자기 화(ep27 · ep80)에 하이라이트가 남는다.
 *
 * 1) ep74 대사 11623 「…진짜 중독성 있어.」 링크 5915: 847 → 986
 * 2) ep82 대사 11684 「…찾아오게 됐어요.」 링크 5944: 1303 → 1007
 * 3) 같은 ep82 말풍선 4035 (dialogue_id 없음 → 앱이 말풍선 자체 값을 읽는다): 1303 → 1007
 *    ep74 말풍선 3974 는 대사에 연결돼 있어 링크만 바꾸면 된다(자체 값 984 '먹어 봐'는 첫 하이라이트 그대로).
 * 4) #1303 episodes [80,82] → [80]
 * 5) #1007 뜻풀이 'I ended up living in ~' → "I ended up ~ / I've come to ~."
 *
 * 안전장치: 각 행이 처음 확인한 값 그대로일 때만 바꾼다. 다시 돌리면 "이미 적용됨" 으로 넘어간다.
 *
 * 실행: npx tsx scripts/relink-kpatto-duplicate-patterns.ts
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

type Change = { table: string; id: number; field: string; from: unknown; to: unknown }

const CHANGES: Change[] = [
  { table: 'kp_dialogue_expressions', id: 5915, field: 'expression_id', from: 847,  to: 986 },
  { table: 'kp_dialogue_expressions', id: 5944, field: 'expression_id', from: 1303, to: 1007 },
  { table: 'kp_bubbles',              id: 4035, field: 'expression_id', from: 1303, to: 1007 },
  { table: 'kp_expressions',          id: 1303, field: 'episodes',      from: [80, 82], to: [80] },
  { table: 'kp_expressions',          id: 1007, field: 'english',       from: 'I ended up living in ~', to: "I ended up ~ / I've come to ~." },
]

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) {
    throw new Error('patto Supabase 가 아니다 — 중단')
  }

  console.log('── changes')
  for (const c of CHANGES) {
    const label = `${c.table} id=${c.id} ${c.field}`
    const { data: cur, error: readErr } = await sb.from(c.table).select(c.field).eq('id', c.id).single()
    if (readErr) throw new Error(`${label}: ${readErr.message}`)
    const value = (cur as Record<string, unknown>)[c.field]
    if (same(value, c.to)) { console.log(`  · ${label} 이미 적용됨`); continue }
    if (!same(value, c.from)) { console.log(`  ⚠ ${label} 값이 달라 건너뜀: ${JSON.stringify(value)}`); continue }
    // 배열 값은 eq 로 비교하기 어려워 스칼라만 조건에 건다(배열은 바로 위에서 읽어 확인했다)
    let q = sb.from(c.table).update({ [c.field]: c.to }).eq('id', c.id)
    if (!Array.isArray(c.from)) q = q.eq(c.field, c.from as string | number)
    const { data, error } = await q.select('id')
    if (error) throw new Error(`${label}: ${error.message}`)
    console.log(data?.length ? `  ✅ ${label} ${JSON.stringify(c.from)} → ${JSON.stringify(c.to)}` : `  ⚠ ${label} 그 사이 값이 바뀌어 건너뜀`)
  }

  // ── 확인: 모든 활성 패턴에 하이라이트 링크가 하나 이상 있는가
  const active: { id: number; korean: string }[] = []
  for (let i = 0; ; i += 1000) {
    const { data, error } = await sb.from('kp_expressions').select('id, korean').eq('is_active', true).range(i, i + 999)
    if (error) throw new Error(error.message)
    active.push(...data); if (data.length < 1000) break
  }
  const linked = new Set<number>()
  for (let i = 0; ; i += 1000) {
    const { data, error } = await sb.from('kp_dialogue_expressions').select('expression_id')
      .eq('role', 'focus').not('expression_id', 'is', null).range(i, i + 999)
    if (error) throw new Error(error.message)
    for (const r of data) linked.add(r.expression_id as number)
    if (data.length < 1000) break
  }
  const missing = active.filter(e => !linked.has(e.id))
  console.log('── verify')
  console.log(`  active patterns ${active.length}, without a highlight link: ${missing.length}${missing.length ? ' — ' + missing.map(e => `#${e.id} ${e.korean}`).join(', ') : ''}`)
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
