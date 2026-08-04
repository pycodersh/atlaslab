/**
 * english/description/examples 미완성 kp_expressions 목록을 파일로 저장
 * 실행: npx tsx scripts/export-expressions-todo.ts
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const { data, error } = await sb
    .from('kp_expressions')
    .select('id, korean, english, description, category, examples, first_episode')
    .order('first_episode', { ascending: true })
    .order('id', { ascending: true })

  if (error) { console.error(error.message); process.exit(1) }

  const empty = (data ?? []).filter((e: any) =>
    !e.english || e.english === e.korean ||
    !e.description ||
    !Array.isArray(e.examples) || e.examples.length < 3
  )

  const lines: string[] = [
    '# kp_expressions 미완성 목록',
    '# 형식: id | category | EP | korean',
    `# 총 ${empty.length}개 — english / description / examples 채워야 함`,
    '',
  ]

  for (const e of empty as any[]) {
    const ep = String(e.first_episode ?? 0).padStart(2, '0')
    lines.push(`${e.id} | ${e.category} | EP${ep} | ${e.korean}`)
  }

  const outPath = 'C:/Users/msj15/Downloads/expressions_todo.txt'
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8')
  console.log(`저장 완료: ${outPath}`)
  console.log(`총 ${empty.length}개`)

  // 카테고리별 집계
  const bycat: Record<string, number> = {}
  for (const e of empty as any[]) {
    const c = e.category ?? 'null'
    bycat[c] = (bycat[c] ?? 0) + 1
  }
  for (const [k, v] of Object.entries(bycat).sort()) {
    console.log(`  ${k}: ${v}개`)
  }
}

main().catch(console.error)
