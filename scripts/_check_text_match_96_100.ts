/**
 * EP96~100 대사↔버블 텍스트 글자 단위 일치 점검 (읽기 전용)
 *
 * EP78에서 대사(존댓말)와 버블(반말)이 달라 화면과 음성이 어긋날 뻔한 사고 방지용.
 * 정규화 없이 === 로 비교한다. 공백·문장부호 차이도 불일치로 잡는다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const EPS = [96, 97, 98, 99, 100]

async function main() {
  const { data: dlg } = await sb.from('kp_dialogues')
    .select('id, episode_id, order_num, speaker, text_ko, audio_url')
    .in('episode_id', EPS).order('episode_id').order('order_num')
  const { data: bub } = await sb.from('kp_bubbles')
    .select('id, episode_id, speaker, korean, audio_url').in('episode_id', EPS)

  const clean: number[] = []
  const dirty: number[] = []
  const issues: Array<{ ep: number; kind: string; detail: string }> = []

  console.log('EP | 대사 | 버블 | 정확일치 | 불일치 | 버블없음 | 중복매칭 | 판정')
  for (const ep of EPS) {
    const d = (dlg ?? []).filter(x => x.episode_id === ep)
    const b = (bub ?? []).filter(x => x.episode_id === ep)
    const usedBubbleIds = new Set<number>()
    let exact = 0, mismatch = 0, missing = 0, dup = 0

    for (const x of d) {
      const hits = b.filter(y => y.korean === x.text_ko)          // 글자 단위 정확 비교
      if (hits.length === 1) { exact++; usedBubbleIds.add(hits[0].id); continue }
      if (hits.length > 1) {
        dup++
        issues.push({ ep, kind: '중복매칭', detail: `대사 id=${x.id} "${x.text_ko}" → 버블 ${hits.map(h => h.id).join(',')}` })
        continue
      }
      // 정확 일치 0건 — 정규화하면 맞는지, 아예 없는지 구분
      const norm = (s: string) => s.replace(/\s+/g, ' ').trim()
      const near = b.filter(y => norm(y.korean) === norm(x.text_ko))
      if (near.length > 0) {
        mismatch++
        issues.push({ ep, kind: '공백차이', detail: `대사 id=${x.id} ${JSON.stringify(x.text_ko)} vs 버블 id=${near[0].id} ${JSON.stringify(near[0].korean)}` })
      } else {
        // 비슷한 문장이 있는지(앞 6글자) 찾아 불일치인지 누락인지 판정
        const head = x.text_ko.slice(0, 6)
        const similar = b.filter(y => y.korean.startsWith(head) && !usedBubbleIds.has(y.id))
        if (similar.length > 0) {
          mismatch++
          issues.push({ ep, kind: '문장불일치', detail: `대사 id=${x.id} ${JSON.stringify(x.text_ko)}\n           vs 버블 id=${similar[0].id} ${JSON.stringify(similar[0].korean)}` })
        } else {
          missing++
          issues.push({ ep, kind: '버블없음', detail: `대사 id=${x.id} [${x.speaker}] ${JSON.stringify(x.text_ko)}` })
        }
      }
    }

    const ok = mismatch === 0 && missing === 0 && dup === 0 && d.length === b.length
    if (ok) clean.push(ep); else dirty.push(ep)
    console.log(
      `${ep} | ${String(d.length).padStart(4)} | ${String(b.length).padStart(4)} | ${String(exact).padStart(8)} | ` +
      `${String(mismatch).padStart(6)} | ${String(missing).padStart(8)} | ${String(dup).padStart(8)} | ${ok ? '✅' : '❌'}`
    )
  }

  if (issues.length) {
    console.log(`\n=== 문제 상세 ${issues.length}건 ===`)
    for (const i of issues) console.log(`  EP${i.ep} [${i.kind}] ${i.detail}`)
  }

  console.log(`\n진행 가능한 화: ${clean.length}개 — ${clean.join(',')}`)
  console.log(`제외할 화:     ${dirty.length}개 — ${dirty.join(',') || '없음'}`)
  const cleanCount = (dlg ?? []).filter(d => clean.includes(d.episode_id)).length
  console.log(`진행 대상 대사: ${cleanCount}건 / 전체 ${dlg?.length}건`)

  const sp: Record<string, number> = {}
  for (const d of (dlg ?? []).filter(d => clean.includes(d.episode_id))) sp[d.speaker] = (sp[d.speaker] ?? 0) + 1
  console.log(`화자별(진행분): ${Object.entries(sp).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(', ')}`)
}

main().catch(e => { console.error(e); process.exit(1) })
