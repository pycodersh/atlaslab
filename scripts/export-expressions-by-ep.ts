/**
 * kp_expressions에서 EP31~100 해당 패턴 추출
 * - 기존 패턴: first_episode 필드 기준
 * - 신규 패턴(1241~1293): 하드코딩 episode 맵 사용 (first_episode=NULL이므로)
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

// insert-missing-patterns.ts의 episodes 맵 (신규 53개)
const NEW_PATTERN_EPISODES: Record<number, number[]> = {
  1241: [3],   1242: [8],   1243: [12],  1244: [16],  1245: [17],
  1246: [21],  1247: [22],  1248: [33],  1249: [41],  1250: [41],
  1251: [45],  1252: [50],  1253: [51],  1254: [53],  1255: [54],
  1256: [54],  1257: [57],  1258: [57],  1259: [57],  1260: [61],
  1261: [61],  1262: [67],  1263: [67],  1264: [67],  1265: [68],
  1266: [68],  1267: [70],  1268: [70],  1269: [70],  1270: [71],
  1271: [71],  1272: [72],  1273: [72],  1274: [72],  1275: [73],
  1276: [76],  1277: [76],  1278: [76],  1279: [78],  1280: [78],
  1281: [81],  1282: [81],  1283: [81, 86], 1284: [86], 1285: [86],
  1286: [91],  1287: [91],  1288: [91],  1289: [94],  1290: [94],
  1291: [100], 1292: [100], 1293: [100],
}

async function main() {
  // 전체 kp_expressions 조회
  const rows: any[] = []
  let from = 0
  while (true) {
    const { data } = await sb.from('kp_expressions')
      .select('id, korean, english, category, first_episode')
      .range(from, from + 999)
      .order('id')
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < 1000) break
    from += 1000
  }
  console.log(`kp_expressions 총 ${rows.length}건 로드`)

  // episode별 패턴 맵 구성
  const byEp = new Map<number, { focus: any[], exposure: any[] }>()
  const initEp = (ep: number) => {
    if (!byEp.has(ep)) byEp.set(ep, { focus: [], exposure: [] })
  }

  for (const r of rows) {
    const id = r.id as number
    const cat = (r.category as string)?.toLowerCase() ?? 'focus'

    // 신규 패턴: 하드코딩 맵 우선
    if (NEW_PATTERN_EPISODES[id]) {
      for (const ep of NEW_PATTERN_EPISODES[id]) {
        initEp(ep)
        const bucket = cat === 'exposure' ? byEp.get(ep)!.exposure : byEp.get(ep)!.focus
        bucket.push(r)
      }
      continue
    }

    // 기존 패턴: first_episode 필드
    const fe = r.first_episode as number | null
    if (!fe) continue
    initEp(fe)
    const bucket = cat === 'exposure' ? byEp.get(fe)!.exposure : byEp.get(fe)!.focus
    bucket.push(r)
  }

  // EP31~100 필터링 후 파일 생성
  const lines: string[] = []
  lines.push('# K-PATTO EP31~100 Focus/Exposure 패턴 목록')
  lines.push('')
  lines.push('> kp_expressions 기반 (first_episode + 신규 패턴 하드코딩 맵)')
  lines.push('')
  lines.push('---')
  lines.push('')

  const epNums = [...byEp.keys()].filter(ep => ep >= 31 && ep <= 100).sort((a, b) => a - b)
  console.log(`EP31~100 중 패턴 있는 에피소드: ${epNums.length}개`)

  for (const ep of epNums) {
    const { focus, exposure } = byEp.get(ep)!
    lines.push(`## EP${String(ep).padStart(2, '0')}`)
    lines.push('')
    if (focus.length > 0) {
      lines.push(`**Focus Pattern:** ${focus.map(r => r.korean).join(' / ')}`)
    }
    if (exposure.length > 0) {
      lines.push(`**Exposure Pattern:** ${exposure.map(r => r.korean).join(' / ')}`)
    }
    if (focus.length === 0 && exposure.length === 0) {
      lines.push('(패턴 없음)')
    }
    lines.push('')
  }

  // EP31~100 중 패턴 없는 에피소드 목록
  const missing = []
  for (let ep = 31; ep <= 100; ep++) {
    if (!byEp.has(ep)) missing.push(ep)
  }
  if (missing.length > 0) {
    lines.push('---')
    lines.push('')
    lines.push(`## 패턴 미할당 에피소드 (${missing.length}개)`)
    lines.push(missing.map(ep => `EP${String(ep).padStart(2, '0')}`).join(', '))
    lines.push('')
  }

  const outPath = 'C:/Users/msj15/Downloads/kpatto_expressions_ep31_100.md'
  fs.writeFileSync(outPath, lines.join('\n'), 'utf-8')
  console.log(`\n저장 완료: ${outPath}`)
  console.log(`패턴 있는 EP: ${epNums.length}개, 미할당 EP: ${missing.length}개`)
}

main().catch(console.error)
