/**
 * EP31~100 재구축
 * 1. kpatto_scripts_confirmed_31~100.md 파싱
 * 2. kp_scenes DELETE (EP31~100) → INSERT
 * 3. kp_dialogues INSERT (EP31~100)
 * 4. kp_dialogue_expressions INSERT (PATTERN_MAP 기준)
 * 5. kp_challenges 생성 → JSON export (DB 미확정)
 */
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

const MD_PATH = 'C:/Users/msj15/Downloads/kpatto_scripts_confirmed_31~100.md'
const CHALLENGES_OUT = 'C:/Users/msj15/Downloads/kpatto_challenges_ep31_100_export.json'

// ── Speaker 매핑 ────────────────────────────────────────────────────────────
const SPEAKER_MAP: Record<string, string> = {
  '에마': 'emma', '지수': 'jisu', '민준': 'minjun', '소피': 'sophie',
  '직원': 'staff', '점원': 'staff', '알바생': 'staff',
  '상인': 'merchant', '사장님': 'merchant',
  '의사': 'doctor', '의사 선생님': 'doctor',
  '약사': 'pharmacist',
  '교수': 'professor', '교수님': 'professor',
  '운전기사': 'driver', '기사': 'driver', '기사님': 'driver',
  '아저씨': 'stranger', '낯선 사람': 'stranger',
  '학생들': 'students', '학생': 'students',
  '모두': 'all', '일동': 'all',
  '접수': 'receptionist', '접수원': 'receptionist',
}
function toSpeakerId(ko: string): string {
  return SPEAKER_MAP[ko.trim()] ?? ko.trim().toLowerCase().replace(/\s+/g, '_')
}

// ── kp_dialogue_expressions 연결용 패턴 맵 ──────────────────────────────────
interface PatternLink { id: number; episodes: number[]; searchTerms: string[] }
const PATTERN_MAP: PatternLink[] = [
  { id: 1241, episodes: [3],       searchTerms: ['먹을 수 있어'] },
  { id: 1242, episodes: [8],       searchTerms: ['할지 모르겠어요', '야 할지 모르겠어요'] },
  { id: 1243, episodes: [12],      searchTerms: ['들어가 있어요', '들어가 있'] },
  { id: 1244, episodes: [16],      searchTerms: ['야겠다', '아야겠다', '어야겠다'] },
  { id: 1245, episodes: [17],      searchTerms: ['가 아파요', '이 아파요', '아파요'] },
  { id: 1246, episodes: [21],      searchTerms: ['었어', '았어', '봤어'] },
  { id: 1247, episodes: [22],      searchTerms: ['거야', '올 거야', '갈 거야'] },
  { id: 1248, episodes: [33],      searchTerms: ['사귀고 싶어요', '친구를 사귀'] },
  { id: 1249, episodes: [41],      searchTerms: ['거든요'] },
  { id: 1250, episodes: [41],      searchTerms: ['더라고요'] },
  { id: 1251, episodes: [45],      searchTerms: ['줄게요', '어 줄게요', '아 줄게요'] },
  { id: 1252, episodes: [50],      searchTerms: ['이 제일 좋아', '가 제일 좋아', '제일 좋아'] },
  { id: 1253, episodes: [51],      searchTerms: ['ㄹ 거예요', '할 거예요', '갈 거예요', '거예요'] },
  { id: 1254, episodes: [53],      searchTerms: ['봤어', '먹어 봤어', '가 봤어'] },
  { id: 1255, episodes: [54],      searchTerms: ['가르쳐 줄 수 있어', '가르쳐 줄'] },
  { id: 1256, episodes: [54],      searchTerms: ['어떻게 해요', '어떻게 하'] },
  { id: 1257, episodes: [57],      searchTerms: ['해봤어요', '봤어요'] },
  { id: 1258, episodes: [57],      searchTerms: ['어땠어요'] },
  { id: 1259, episodes: [57],      searchTerms: ['도전해 볼게요', '도전'] },
  { id: 1260, episodes: [61],      searchTerms: ['나쁘지 않은데요', '나쁘지 않'] },
  { id: 1261, episodes: [61],      searchTerms: ['그렇게 생각해요', '저도 그렇게'] },
  { id: 1262, episodes: [67],      searchTerms: ['이렇게 예뻐요', '이렇게 매워요', '이렇게'] },
  { id: 1263, episodes: [67],      searchTerms: ['이때가 제일 좋아요', '이때가 제일'] },
  { id: 1264, episodes: [67],      searchTerms: ['은 어때요', '는 어때요', '어때요'] },
  { id: 1265, episodes: [68],      searchTerms: ['잘못했어요', '제가 잘못'] },
  { id: 1266, episodes: [68],      searchTerms: ['려고 할게요', '하려고 할게요'] },
  { id: 1267, episodes: [70],      searchTerms: ['어디에 버려요', '버려요'] },
  { id: 1268, episodes: [70],      searchTerms: ['철저히 해요', '철저히'] },
  { id: 1269, episodes: [70],      searchTerms: ['신경 써야겠어요', '신경 써야'] },
  { id: 1270, episodes: [71],      searchTerms: ['설레요', '뭔가 설레'] },
  { id: 1271, episodes: [71],      searchTerms: ['이런 순간이 소중해요', '소중해요', '순간이 소중'] },
  { id: 1272, episodes: [72],      searchTerms: ['오해가 있었던', '오해가'] },
  { id: 1273, episodes: [72],      searchTerms: ['뜻이 아니었어요', '그런 뜻이 아니'] },
  { id: 1274, episodes: [72],      searchTerms: ['충분히 이해해요', '충분히 이해'] },
  { id: 1275, episodes: [73],      searchTerms: ['않길 잘했어요', '지 않길'] },
  { id: 1276, episodes: [76],      searchTerms: ['알고 보면'] },
  { id: 1277, episodes: [76],      searchTerms: ['차이가 뭐예요', '차이가 뭐'] },
  { id: 1278, episodes: [76],      searchTerms: ['포인트예요', '이게 포인트'] },
  { id: 1279, episodes: [78],      searchTerms: ['싶긴 해요', '고 싶긴', '싶긴'] },
  { id: 1280, episodes: [78],      searchTerms: ['꿈을 위해', '를 위해', '을 위해', '위해'] },
  { id: 1281, episodes: [81],      searchTerms: ['다고 하던데요', '하던데요'] },
  { id: 1282, episodes: [81],      searchTerms: ['다더라고요'] },
  { id: 1283, episodes: [81, 86],  searchTerms: ['줄 몰랐어요', '을 줄 몰랐어요'] },
  { id: 1284, episodes: [86],      searchTerms: ['흔한 일이에요', '흔한 일'] },
  { id: 1285, episodes: [86],      searchTerms: ['생각보다 훨씬', '훨씬'] },
  { id: 1286, episodes: [91],      searchTerms: ['그렇긴 한데요', '좀 그렇긴'] },
  { id: 1287, episodes: [91],      searchTerms: ['아니라고 할 순 없죠', '할 순 없죠'] },
  { id: 1288, episodes: [91],      searchTerms: ['꼭 그런 건 아니에요', '그런 건 아니에요'] },
  { id: 1289, episodes: [94],      searchTerms: ['상대방 입장에서', '입장에서 생각해'] },
  { id: 1290, episodes: [94],      searchTerms: ['옆에 있을게요', '제가 옆에'] },
  { id: 1291, episodes: [100],     searchTerms: ['이제 시작이에요', '시작이에요'] },
  { id: 1292, episodes: [100],     searchTerms: ['꿈을 이룰 거예요', '꿈을 이룰'] },
  { id: 1293, episodes: [100],     searchTerms: ['계속돼요', '계속돼'] },
]

// ── MD 파싱 ──────────────────────────────────────────────────────────────────
interface DialogueLine { speaker: string; text: string }
interface SceneData { cutNum: number; location: string; dialogues: DialogueLine[] }
interface EpData { epNum: number; title: string; scenes: SceneData[]; focusPatterns: string[]; exposurePatterns: string[] }

function parseScript(raw: string): EpData[] {
  const lines = raw.split(/\r?\n/)
  const episodes: EpData[] = []
  let curEp: EpData | null = null
  let curScene: SceneData | null = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    if (/^#\s+K-PATTO/.test(line)) continue
    if (/^\\?---/.test(line)) { curScene = null; continue }

    // Episode header
    const epM = line.match(/^##\s+EP(\d+)[\s—\-]+(.+)/)
    if (epM) {
      if (curEp) episodes.push(curEp)
      curEp = { epNum: +epM[1], title: epM[2].trim(), scenes: [], focusPatterns: [], exposurePatterns: [] }
      curScene = null
      continue
    }
    if (!curEp) continue

    // Skip 등장인물/장소
    if (/^\*\*(등장인물|장소):\*\*/.test(line)) continue

    // Cut header: **\[컷N — location]**
    const cutM = line.match(/^\*\*\\?\[컷(\d+)(?:[—\-\s]+(.+?))?\]/)
    if (cutM) {
      curScene = { cutNum: +cutM[1], location: (cutM[2] ?? '').replace(/\\\*\*$/, '').trim(), dialogues: [] }
      curEp.scenes.push(curScene)
      continue
    }

    // Focus/Exposure Pattern
    const focusM = line.match(/^\*\*Focus Pattern:\*\*\s*(.+)/)
    if (focusM) {
      curEp.focusPatterns = focusM[1].split('/').map(s => s.trim().replace(/^\\+/, ''))
      continue
    }
    const exposureM = line.match(/^\*\*Exposure Pattern:\*\*\s*(.+)/)
    if (exposureM) {
      curEp.exposurePatterns = exposureM[1].split('/').map(s => s.trim().replace(/^\\+/, ''))
      continue
    }

    // Dialogue — handle compound lines like "지수: 나도! / 민준: 나도."
    if (!curScene) continue
    const parts = line.split(/ \/ (?=[가-힣·\w\s]+:)/)
    for (const part of parts) {
      const dM = part.match(/^([가-힣·\w\s]+?):\s+(.+)$/)
      if (dM) {
        curScene.dialogues.push({ speaker: dM[1].trim(), text: dM[2].trim() })
      }
    }
  }
  if (curEp) episodes.push(curEp)
  return episodes
}

// ── 대사 검색 ─────────────────────────────────────────────────────────────────
function findDialogue(dials: Array<{ id: number; text_ko: string }>, terms: string[]): number | null {
  for (const term of terms) {
    for (const d of dials) {
      if (d.text_ko.includes(term)) return d.id
    }
  }
  return null
}

// ── 챌린지 생성 ───────────────────────────────────────────────────────────────
interface Challenge {
  episode_num: number
  expression_id: number
  type: string
  question: string
  answer: string
  choices: string[]
  hint?: string
}

function tokenize(sentence: string): string[] {
  return sentence.replace(/[.?!。\s]+$/, '').split(/\s+/).filter(Boolean)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeKeyToken(korean: string): string {
  return korean.replace(/^~/, '').replace(/[~\(\)\/]/g, '').trim().split(/[/\s]+/)[0] ?? ''
}

function generateChallenges(expr: any, epNum: number, allExprs: any[], exIdx: number): Challenge[] {
  const challenges: Challenge[] = []
  const exs = expr.examples as Array<{ ko: string; en: string }>
  if (!exs || exs.length === 0) return challenges

  // translation
  const tEx = exs[exIdx % exs.length]
  const wrongPool = allExprs.filter(e => e.id !== expr.id).map(e => (e.examples?.[0] as any)?.ko).filter(Boolean)
  const wrongs = shuffle(wrongPool).slice(0, 2)
  if (wrongs.length >= 2) {
    challenges.push({
      episode_num: epNum,
      expression_id: expr.id,
      type: 'translation',
      question: tEx.en,
      answer: tEx.ko,
      choices: shuffle([tEx.ko, ...wrongs]),
      hint: expr.english,
    })
  }

  // fill_blank
  const fbEx = exs[(exIdx + 1) % exs.length]
  const key = makeKeyToken(expr.korean)
  if (key && fbEx.ko.includes(key)) {
    const blank = fbEx.ko.replace(key, '___')
    challenges.push({
      episode_num: epNum,
      expression_id: expr.id,
      type: 'fill_blank',
      question: blank,
      answer: key,
      choices: [key],
      hint: fbEx.en,
    })
  }

  // word_order
  const woEx = exs[(exIdx + 2) % exs.length]
  const tokens = tokenize(woEx.ko)
  if (tokens.length >= 2) {
    const shuffled = shuffle(tokens)
    challenges.push({
      episode_num: epNum,
      expression_id: expr.id,
      type: 'word_order',
      question: woEx.en,
      answer: woEx.ko.replace(/[.?!。]$/, '').trim(),
      choices: shuffled,
      hint: expr.korean,
    })
  }

  return challenges
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  // 0. MD 파싱
  const raw = fs.readFileSync(MD_PATH, 'utf-8')
  const episodes = parseScript(raw).filter(e => e.epNum >= 31 && e.epNum <= 100)
  console.log(`파싱 완료: EP${episodes[0]?.epNum}~EP${episodes[episodes.length - 1]?.epNum}, ${episodes.length}개 에피소드`)
  const totalScenes = episodes.reduce((s, e) => s + e.scenes.length, 0)
  const totalDials = episodes.reduce((s, e) => s + e.scenes.reduce((ss, sc) => ss + sc.dialogues.length, 0), 0)
  console.log(`  씬: ${totalScenes}개, 대사: ${totalDials}건\n`)

  // 1. 에피소드 맵
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').gte('episode_num', 31).lte('episode_num', 100)
  const epNumToId = new Map((epRows ?? []).map((e: any) => [e.episode_num as number, e.id as number]))
  console.log(`에피소드 맵: ${epNumToId.size}개`)

  const epIds = [...epNumToId.values()]

  // 2. DELETE kp_scenes for EP31~100
  console.log('\n[1/5] kp_scenes DELETE (EP31~100)...')
  const { error: delErr, count: delCnt } = await sb.from('kp_scenes').delete({ count: 'exact' }).in('episode_id', epIds)
  if (delErr) { console.error('kp_scenes DELETE 실패:', delErr.message); return }
  console.log(`  삭제: ${delCnt}건`)

  // 3. INSERT kp_scenes + kp_dialogues
  console.log('\n[2/5] kp_scenes + kp_dialogues INSERT...')
  let sceneInserted = 0, dialInserted = 0
  // epNum → Map<sceneNum, {scene_id, dialogues}>
  const epSceneDialMap = new Map<number, Map<number, { sceneId: number; dials: Array<{ id: number; text_ko: string }> }>>()

  for (const ep of episodes) {
    const epId = epNumToId.get(ep.epNum)
    if (!epId) { console.warn(`  EP${ep.epNum}: episode_id 없음, 건너뜀`); continue }

    const sceneMap = new Map<number, { sceneId: number; dials: Array<{ id: number; text_ko: string }> }>()
    epSceneDialMap.set(ep.epNum, sceneMap)

    for (const scene of ep.scenes) {
      // INSERT kp_scenes
      const { data: sceneRow, error: sErr } = await sb.from('kp_scenes').insert({
        episode_id: epId,
        scene_number: scene.cutNum,
        location_note: scene.location || null,
      }).select('id').single()
      if (sErr || !sceneRow) { console.error(`  EP${ep.epNum} 컷${scene.cutNum} scene INSERT 실패:`, sErr?.message); continue }
      const sceneId = (sceneRow as any).id as number
      sceneInserted++

      const dialRows: Array<{ id: number; text_ko: string }> = []

      // INSERT kp_dialogues
      for (let i = 0; i < scene.dialogues.length; i++) {
        const dl = scene.dialogues[i]
        const { data: dialRow, error: dErr } = await sb.from('kp_dialogues').insert({
          episode_id: epId,
          scene_id: sceneId,
          speaker: toSpeakerId(dl.speaker),
          text_ko: dl.text,
          order_num: i + 1,
        }).select('id').single()
        if (dErr || !dialRow) { console.error(`  EP${ep.epNum} 컷${scene.cutNum} 대사${i+1} INSERT 실패:`, dErr?.message); continue }
        dialRows.push({ id: (dialRow as any).id, text_ko: dl.text })
        dialInserted++
      }

      sceneMap.set(scene.cutNum, { sceneId, dials: dialRows })
    }
  }
  console.log(`  kp_scenes: ${sceneInserted}건, kp_dialogues: ${dialInserted}건`)

  // 4. kp_dialogue_expressions INSERT (PATTERN_MAP 기준)
  console.log('\n[3/5] kp_dialogue_expressions INSERT...')
  let dexInserted = 0, dexFailed = 0

  // 에피소드별 전체 대사 맵 (검색용)
  const epAllDials = new Map<number, Array<{ id: number; text_ko: string }>>()
  for (const [epNum, scMap] of epSceneDialMap) {
    const all: Array<{ id: number; text_ko: string }> = []
    for (const { dials } of scMap.values()) all.push(...dials)
    epAllDials.set(epNum, all)
  }

  for (const pat of PATTERN_MAP) {
    for (const epNum of pat.episodes) {
      if (epNum < 31 || epNum > 100) continue
      const dials = epAllDials.get(epNum) ?? []
      const dialId = findDialogue(dials, pat.searchTerms)
      if (!dialId) {
        console.warn(`  [NOT_FOUND] id=${pat.id} EP${epNum} terms=[${pat.searchTerms.slice(0,2).join(',')}]`)
        dexFailed++
        continue
      }
      const matchedDial = dials.find(d => d.id === dialId)
      const { error } = await sb.from('kp_dialogue_expressions').insert({
        expression_id: pat.id,
        dialogue_id: dialId,
        role: 'focus',
        matched_text: matchedDial?.text_ko ?? '',
      })
      if (error) {
        console.error(`  [ERR] id=${pat.id} EP${epNum}:`, error.message)
        dexFailed++
      } else {
        dexInserted++
      }
    }
  }
  console.log(`  dex 연결: ${dexInserted}건 성공, ${dexFailed}건 실패`)

  // 5. kp_challenges 생성 (EP31~100 패턴)
  console.log('\n[4/5] kp_challenges 생성 (export only)...')

  // kp_expressions 전체 로드
  const allExprs: any[] = []
  let from = 0
  while (true) {
    const { data } = await sb.from('kp_expressions').select('id, korean, english, category, examples').range(from, from + 999)
    if (!data || data.length === 0) break
    allExprs.push(...data)
    if (data.length < 1000) break
    from += 1000
  }

  // EP31~100 패턴 필터 (PATTERN_MAP 기준)
  const ep31_100Patterns = PATTERN_MAP.filter(p => p.episodes.some(e => e >= 31 && e <= 100))
  const ep31_100ExprIds = new Set(ep31_100Patterns.map(p => p.id))
  const ep31_100Exprs = allExprs.filter(e => ep31_100ExprIds.has(e.id))

  const challenges: Challenge[] = []
  const perPatternTypeCounter: Record<string, number> = {}

  for (const pat of ep31_100Patterns) {
    // 대표 에피소드: 첫 번째 EP31+ 에피소드
    const primaryEp = pat.episodes.find(e => e >= 31) ?? pat.episodes[0]
    const expr = ep31_100Exprs.find(e => e.id === pat.id)
    if (!expr || !expr.examples?.length) continue

    const key = `${pat.id}`
    const cnt = perPatternTypeCounter[key] ?? 0
    const chs = generateChallenges(expr, primaryEp, allExprs, cnt)
    challenges.push(...chs)
    perPatternTypeCounter[key] = cnt + 1
  }

  fs.writeFileSync(CHALLENGES_OUT, JSON.stringify(challenges, null, 2), 'utf-8')
  console.log(`  챌린지 생성: ${challenges.length}건 → ${CHALLENGES_OUT}`)

  // 6. 최종 집계
  console.log('\n[5/5] 최종 집계...')
  const [sc, dl, dex] = await Promise.all([
    sb.from('kp_scenes').select('*', { count: 'exact', head: true }).in('episode_id', epIds),
    sb.from('kp_dialogues').select('*', { count: 'exact', head: true }).in('episode_id', epIds),
    sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true }),
  ])
  console.log('══════════════════════════════════════════')
  console.log(`kp_scenes (EP31~100)         : ${sc.count}건`)
  console.log(`kp_dialogues (EP31~100)      : ${dl.count}건`)
  console.log(`kp_dialogue_expressions (전체): ${dex.count}건`)
  console.log(`kp_challenges (export)       : ${challenges.length}건`)
  console.log('══════════════════════════════════════════')
}

main().catch(console.error)
