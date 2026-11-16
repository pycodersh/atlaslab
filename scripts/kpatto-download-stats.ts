/**
 * 무료 PDF 내려받기 집계 — kp_downloads(app/downloads/k-patto-free-sample.pdf 가 남긴다).
 *
 * 실행: npx tsx scripts/kpatto-download-stats.ts [일수=30]
 * 출력: 전체 누적 · 버튼별(source) · 최근 N일 날짜별(한국 시간).
 * 2026-11-16 이전 내려받기는 기록이 없다(그 전에는 정적 파일 직접 링크라 세지 않았다) — 그 기간은 GA4 file_download 로 본다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })
import { createClient } from '@supabase/supabase-js'

const DAYS = Number(process.argv[2] ?? 30)

async function main() {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })
  const rows: { file: string; source: string | null; created_at: string }[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from('kp_downloads').select('file, source, created_at').order('created_at').range(from, from + 999)
    if (error) throw new Error(error.message)
    rows.push(...data)
    if (data.length < 1000) break
  }
  const kst = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10)
  const by = <T,>(xs: T[], k: (x: T) => string) => xs.reduce<Record<string, number>>((m, x) => ((m[k(x)] = (m[k(x)] ?? 0) + 1), m), {})

  for (const [file, n] of Object.entries(by(rows, r => r.file))) {
    const mine = rows.filter(r => r.file === file)
    console.log(`\n${file}: ${n} downloads total (first ${kst(mine[0].created_at)}, last ${kst(mine.at(-1)!.created_at)}, KST)`)
    for (const [src, c] of Object.entries(by(mine, r => r.source ?? 'direct')).sort((a, b) => b[1] - a[1])) console.log(`  ${src.padEnd(8)} ${c}`)
    const since = Date.now() - DAYS * 86400_000
    const daily = by(mine.filter(r => new Date(r.created_at).getTime() >= since), r => kst(r.created_at))
    console.log(`  last ${DAYS} days:`)
    for (const [d, c] of Object.entries(daily).sort()) console.log(`    ${d}  ${c}`)
  }
  if (!rows.length) console.log('No downloads recorded yet.')
}
main().catch(e => { console.error(e.message ?? e); process.exit(1) })
