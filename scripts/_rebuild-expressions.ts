/**
 * K-PATTO 핵심표현 DB 재구축 (Final Rev.1)
 * - kp_expressions 현재 524행 → 목표 323행
 * - 236개 유지 (JSON 244 - 8 삭제)
 * - 87개 신규 삽입 (id 1301~1387)
 * - 나머지 280+ 행 전량 삭제
 *
 * usage: npx tsx scripts/_rebuild-expressions.ts [--dry-run]
 *
 * DB 컬럼 매핑:
 *   korean      = pattern_ko
 *   english     = literal_en
 *   description = usage_en
 *   compare     = (신규 컬럼)
 *   episodes    = (신규 컬럼, JSONB int[])
 *   first_episode = episodes[0]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const DRY = process.argv.includes('--dry-run')

// ── §5 배분표 (EP → pattern_ko 텍스트) ──────────────────────────────────────
const EPISODE_MAP: Record<number, string[]> = {
  1:  ['~주세요','~뭐예요?','~있어요?','~이에요/예요'],
  2:  ['~가고 싶어요','~어떻게 가요?','~어디서 타요?','~으로'],
  3:  ['~뭐예요?','~먹고 싶어요','~못 먹어요','~하고'],
  4:  ['~로 할게요','~먹어도 돼요?','~얼마나 걸려요?','~밖에'],
  5:  ['~해 본 적 있어요?','~추천해 주세요','~주실 수 있어요?','~부터 ~까지'],
  6:  ['~좋아해요','~불러도 돼요?','또 오고 싶어요','~을래요?'],
  7:  ['신기해요','~더 주세요','~깎아 주세요','~보다'],
  8:  ['~써봤어요?','~추천해 주세요','~어떤 게 좋아요?','-거나'],
  9:  ['생각보다 ~해요','다 같이 있어서 좋아요','이미 ~해요','~처럼'],
  10: ['떨려요','~에서 왔어요','잘 부탁드려요','-습니다'],
  11: ['~타요','~에서 내려요','~까지 가 주세요','~에서부터','-으십시오'],
  12: ['~로 할게요','덜 ~게 해 주세요','~리필 돼요?','~만'],
  13: ['~에 뭐 해요?','같이 ~ㄹ래요?','조금 늦을 것 같아요','-자마자'],
  14: ['길을 잃었어요','쭉 가면 돼요','~으로 꺾으면 돼요','-으러 가다'],
  15: ['~봤어요?','재미있어요','강추예요','~에게/한테'],
  16: ['~날씨 어때요?','~올 것 같아요','-겠-','-으면서'],
  17: ['~약 있어요?','안 먹는 게 나아요','-으면 안 되다','~한테서'],
  18: ['취미가 뭐예요?','저도요','~별로예요','~마다'],
  19: ['여기서 유명한 게 뭐예요?','같이 사진 찍어요','사진이 잘 나왔어요?','~께서'],
  20: ['오랜만이에요','잘 지냈어요?','다음에 또 봐요','-은 지'],
  21: ['~어땠어?','처음이었는데','-았/었-','-니?'],
  22: ['~것 같아요','~나 봐요','-을걸','-나 싶다'],
  23: ['~해야 해','~하지 마','~잊지 마','-도록'],
  24: ['~어떻게 생각해요?','맞는 말이에요','저는 좀 달라요','-는다고'],
  25: ['~에 가 봤어요?','꼭 가 보세요','-은 후에','-어 보다'],
  26: ['요즘 뭐 봐요?','완전 빠져들었어요','다음 화가 기대돼요','-는 대로'],
  27: ['이 노래 알아요?','가사가 무슨 뜻이에요?','중독성 있어요','~뿐'],
  28: ['~관리 어떻게 해요?','~효과 있어요?','후기가 좋아요','~만큼'],
  29: ['얼마나 자주 해요?','건강에 좋아요','꾸준히 하고 있어요','-어 오다'],
  30: ['~어디 살아요?','혼자 살아요?','~근처에 뭐 있어?','-은 지'],
  31: ['기분이 어때?','~라서 행복해','설레','-거든'],
  32: ['괜찮아요?','요즘 좀 힘들어요','언제든지 연락해요','-느라고'],
  33: ['카카오톡 해요?','팔로우해도 돼요?','-어 두다','-을게'],
  34: ['제가 살게요','더치페이 해요?','밥 한번 먹어요','~에게/한테'],
  35: ['~입어 봤어?','명절에 뭐 해?','이게 무슨 뜻이야?','-다시피'],
  36: ['술 마셔요?','건배해요','오늘은 여기까지만 해요','-읍시다'],
  37: ['이 노래 같이 불러요','신청곡 있어요?','한 곡 더 해요','-어 주다'],
  38: ['같이 춰요','어렵지만 재미있어요','하다 보면 늘어요','-도록'],
  39: ['분위기 좋아요','달달한 거 있어요?','오래 있어도 돼요?','-어 있다'],
  40: ['나라마다 달라요','이제 적응이 됐어요','처음엔 낯설었는데','~과/와'],
  41: ['~는데','-지만','-으니까','-어서'],
  42: ['~면 어때요?','~면 좋겠어요','~면 돼요','-더라도'],
  43: ['~때문에','~덕분에','~보다','-는 바람에'],
  44: ['~는 동안','~고 나서','~기 전에','-자마자'],
  45: ['해 드릴까요?','죄송한데요 혹시 ~','-어 드리다','-을까요?'],
  46: ['~지 얼마나 됐어요?','아직 ~는 중이에요','거의 다 됐어요','-어 가다'],
  47: ['~스타일 좋아해요?','~잘 어울려요','요즘 유행이에요','~처럼'],
  48: ['배달 시켜요','배달 얼마나 걸려요?','가성비 좋아요','-어 놓다'],
  49: ['여행 계획 있어요?','며칠이나 있을 거예요?','꼭 봐야 할 게 뭐예요?','-을 테니'],
  50: ['한국 생활 어때?','이제 익숙해졌어','-어지다','-을수록'],
  51: ['~려고 해요','~고 싶어요','-을 거예요','-기로 하다'],
  52: ['~기로 했어요','마음먹었어요','예전보다 늘었어요','-고 말다'],
  53: ['~보니까','~추천해줬어','-더라','-던데'],
  54: ['~맞아?','-잖아','-는지','-어 주다'],
  55: ['~만들어봤어?','~얼마나 넣어?','~하면 돼','-어 놓다'],
  56: ['~살 거예요','이거 어때요?','카드로 할게요','~밖에'],
  57: ['-습니다','-습니까?','-으십시오','-어 드리다'],
  58: ['~받고 싶어요','어디가 아파요?','언제부터 아팠어요?','-으면 안 되다'],
  59: ['~와 봤어요?','~하기 좋아요','-어 있다','~만큼'],
  60: ['~중에 뭐가 제일 좋아요?','~라서 중독성 있어요','~이랑 달라요','-는 대신에'],
  61: ['솔직하게 말해도 돼요?','~이란','-는 게 아니라','-나 싶다'],
  62: ['~어때요?','~때문에 바빠요','무리하지 마세요','-느라고'],
  63: ['~많이 해?','~유행이야?','~올렸더니','-는 바람에'],
  64: ['~도전해요','재료가 있어요?','다음엔 더 잘할 거예요','-어 버리다'],
  65: ['~루틴 있어요?','~하고 나서','꼭 ~해야 해요','-은 다음에'],
  66: ['많이 늘었어요','비결이 뭐예요?','~이 헷갈려요','~만큼'],
  67: ['~처럼','-어 있다','-더라도','-을 텐데'],
  68: ['서운했어요','-는 줄 알았다','-을걸','-거든'],
  69: ['꿈이 뭐예요?','~가 되고 싶어요','포기하고 싶어요','-습니다'],
  70: ['-으면 안 되다','-도록','~밖에','-어야겠다'],
  71: ['딱 이 느낌이에요','-을 때마다','~처럼','-어지다'],
  72: ['-는 줄 알았다','-을 텐데','-더라도','-고서'],
  73: ['합격했어요','드디어 해냈어요','-기에','-을 수밖에 없다'],
  74: ['~먹어봐','생각보다 훨씬 ~해','중독성 있어','-어 보다'],
  75: ['행복해요','~하는 게 좋아요','이런 일상이 소중해요','-을 때마다'],
  76: ['~만큼','~뿐','-는 대신에','-을수록'],
  77: ['다 같이 모이니까 좋아요','처음 만났을 때','여러분 덕분이에요','~께'],
  78: ['얼마나 있을 거예요?','-을 테니','-기 위해','-을 텐데'],
  79: ['줄 서야 해요','-을 수밖에 없다','-는 김에','-나 보다'],
  80: ['드디어 해냈어요','-어 오다','-게 되다','-은 지'],
  81: ['-는다고','-는다면서?','-더군','~이란'],
  82: ['~게 됐어요','~다 보니까','~하다 보면','-어지다'],
  83: ['~한 것치고는','아무리 그래도','은근히 ~해','-는 편이다'],
  84: ['잘 모르겠는데요','좀 더 생각해 봐야겠어요','일단은 ~해요','-나 싶다'],
  85: ['눈치챘어요?','감이 잡혀요','딱 봐도 알겠어요','-다시피'],
  86: ['-다시피','~처럼','-는 편이다','~커녕'],
  87: ['부담스러워요','이제 많이 편해졌어요','-어지다','-던'],
  88: ['외국인 티 나요?','이제 한국말이 편해요','한국어로 꿈도 꿔요','~만큼'],
  89: ['관광지보다 로컬이 좋아','현지인들이 가는 곳이야','숨겨진 명소야','-는 김에'],
  90: ['요즘 핫해요','완전 대세예요','떠오르는 중이에요','-는다고'],
  91: ['-을걸','-나 싶다','-는 것 같기도','~이나마'],
  92: ['말이 되네요','앞뒤가 안 맞아요','결국엔 ~','-기에'],
  93: ['속상했어요','억울했어요','말하고 나니까 후련해요','-을 수밖에 없다'],
  94: ['마음은 알아요','-을 텐데','-더라도','-어 주다'],
  95: ['반전 있어요','여운이 남아요','몰입이 돼요','-더군'],
  96: ['왠지 모르게 ~해요','이 느낌 알아요?','말로 표현하기 어려워요','-나 싶다'],
  97: ['떠나기 싫어','~이 그리울 것 같아','꼭 다시 올게','~커녕'],
  98: ['이제 한국어로 생각해요','번역 안 해도 이해돼요','실력이 많이 늘었어요','-어 오다'],
  99: ['앞으로도 잘 부탁해요','같이 성장한 것 같아요','덕분에 정말 많이 배웠어요','~께'],
  100: ['-을 테니','-도록','-기 위해','-을 거예요'],
}

// §3 JSON 내 삭제 대상 ID (8개)
const JSON_DELETE_IDS = new Set([841, 913, 999, 1000, 1001, 1002, 1003, 1235])

async function main() {
  // ── §1 스키마 확인 ───────────────────────────────────────────────────────
  console.log('── §1 스키마 확인 ──')
  const { data: sample1 } = await sb.from('kp_expressions').select('id,compare,episodes').limit(1)
  const row0 = sample1?.[0] ?? {}
  const hasCompare  = 'compare'  in row0
  const hasEpisodes = 'episodes' in row0
  if (!hasCompare || !hasEpisodes) {
    console.log('⚠ 스키마 변경 필요 — Supabase Dashboard SQL Editor에서 실행:')
    if (!hasCompare)  console.log('  ALTER TABLE kp_expressions ADD COLUMN compare TEXT NULL;')
    if (!hasEpisodes) console.log('  ALTER TABLE kp_expressions ADD COLUMN episodes JSONB NULL;')
    if (!DRY) {
      console.log('\n실행 후 다시 실행하세요.')
      process.exit(1)
    }
    console.log('\n[dry-run] 스키마 없이 데이터 로직만 검증합니다.\n')
  }
  console.log('✓ compare, episodes 컬럼 존재\n')

  // ── 파일 읽기 ─────────────────────────────────────────────────────────────
  const existing: any[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'data/kpatto/source/kp_expressions_with_examples.json'), 'utf-8')
  )
  const newExprs: any[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), 'data/kpatto/source/kpatto_new_expressions_87.json'), 'utf-8')
  )

  // ── 배분표 → episodes 맵 구축 (기존 표현용) ──────────────────────────────
  const textToEps = new Map<string, number[]>()
  for (const [epStr, texts] of Object.entries(EPISODE_MAP)) {
    const ep = parseInt(epStr)
    for (const t of texts) {
      if (!textToEps.has(t)) textToEps.set(t, [])
      textToEps.get(t)!.push(ep)
    }
  }

  // 유지할 기존 236개: ID → row 맵
  const keepExisting = new Map<number, any>()
  const unmatched: {id: number; pattern_ko: string}[] = []
  for (const e of existing) {
    if (JSON_DELETE_IDS.has(e.id)) continue
    const eps = textToEps.get(e.pattern_ko) ?? []
    keepExisting.set(e.id, { ...e, _episodes: [...eps].sort((a,b) => a-b) })
    if (eps.length === 0) unmatched.push({ id: e.id, pattern_ko: e.pattern_ko })
  }

  if (unmatched.length > 0) {
    console.log(`⚠ 배분표 미매칭 (episodes=[]) ${unmatched.length}건:`)
    for (const u of unmatched) console.log(`  id=${u.id}  ${u.pattern_ko}`)
    console.log()
  }

  // 신규 87개 id 집합
  const newIdSet = new Set(newExprs.map((e: any) => e.id))

  // ── DB 현황 파악 ─────────────────────────────────────────────────────────
  console.log('── DB 현황 ──')
  const { data: dbRows } = await sb.from('kp_expressions').select('id').order('id')
  const dbIds = new Set((dbRows ?? []).map((r: any) => r.id as number))
  console.log(`현재 DB 행 수: ${dbIds.size}`)

  // 삭제 대상: DB에 있는데 target 323에 없는 것들
  const targetIds = new Set([...keepExisting.keys(), ...newIdSet])
  const toDeleteFromDb: number[] = []
  for (const id of dbIds) {
    if (!targetIds.has(id)) toDeleteFromDb.push(id)
  }
  console.log(`삭제 예정: ${toDeleteFromDb.length}행 (비대상 DB 행 + §3 8개 포함)`)
  console.log(`유지/업데이트: ${keepExisting.size}행 (기존 236)`)
  console.log(`신규 삽입: ${newExprs.length}행\n`)

  // ── §2 exposure 확인 ─────────────────────────────────────────────────────
  const { count: expCount } = await sb.from('kp_dialogue_expressions')
    .select('id', { count: 'exact', head: true }).eq('role', 'exposure')
  if ((expCount ?? 0) > 0) {
    console.log(`── §2 exposure ${expCount}건 삭제`)
    if (!DRY) {
      await sb.from('kp_dialogue_expressions').delete().eq('role', 'exposure')
      console.log('  ✓')
    } else console.log('  [dry-run]')
  } else {
    console.log('── §2 exposure 0건 (이미 완료)\n')
  }

  // ── §3 삭제 (비대상 전량 + §3 8개) ──────────────────────────────────────
  console.log(`── §3 삭제: ${toDeleteFromDb.length}행`)
  if (!DRY && toDeleteFromDb.length > 0) {
    // FK 해제: kp_dialogue_expressions, kp_bubbles
    await sb.from('kp_dialogue_expressions').delete().in('expression_id', toDeleteFromDb)
    await sb.from('kp_bubbles').delete().in('expression_id', toDeleteFromDb)

    // 1000개 단위로 분할 삭제 (Supabase 제한 고려)
    const CHUNK = 500
    let deleted = 0
    for (let i = 0; i < toDeleteFromDb.length; i += CHUNK) {
      const chunk = toDeleteFromDb.slice(i, i + CHUNK)
      const { error } = await sb.from('kp_expressions').delete().in('id', chunk)
      if (error) { console.error('  삭제 오류:', error.message); process.exit(1) }
      deleted += chunk.length
    }
    console.log(`  ✓ ${deleted}행 삭제\n`)
  } else if (DRY) {
    console.log('  [dry-run]\n')
  }

  // ── §4 신규 87개 삽입 ────────────────────────────────────────────────────
  console.log(`── §4 신규 87개 삽입`)
  const newRows = newExprs.map((e: any) => ({
    id:            e.id,
    korean:        e.pattern_ko,
    english:       e.literal_en,
    description:   e.usage_en,
    category:      'focus',
    examples:      e.examples,
    compare:       e.compare ?? null,
    episodes:      e.episodes ?? null,
    first_episode: e.episodes?.[0] ?? null,
  }))

  if (!DRY) {
    const { error } = await sb.from('kp_expressions').upsert(newRows, { onConflict: 'id' })
    if (error) { console.error('  삽입 오류:', error.message); process.exit(1) }
    console.log(`  ✓ ${newRows.length}행 삽입\n`)
  } else {
    console.log(`  [dry-run] ${newRows.length}행 예정\n`)
  }

  // ── §5 기존 236개 episodes 업데이트 ──────────────────────────────────────
  console.log(`── §5 기존 236개 episodes 업데이트`)
  let updOk = 0, updFail = 0
  for (const [id, row] of keepExisting) {
    const eps: number[] = row._episodes
    if (DRY) { updOk++; continue }
    const { error } = await sb.from('kp_expressions').update({
      episodes:      eps.length > 0 ? eps : null,
      first_episode: eps.length > 0 ? eps[0] : null,
    }).eq('id', id)
    if (error) { console.error(`  ✗ id=${id}:`, error.message); updFail++ }
    else updOk++
  }
  console.log(`  ✓ ${updOk}행 업데이트${updFail > 0 ? `, 실패 ${updFail}` : ''}\n`)

  // ── §8 리포트 ────────────────────────────────────────────────────────────
  console.log('══════════════════ 최종 리포트 ══════════════════')
  if (!DRY) {
    const { count: total }   = await sb.from('kp_expressions').select('id', { count: 'exact', head: true })
    const { count: cmpFill } = await sb.from('kp_expressions').select('id', { count: 'exact', head: true }).not('compare', 'is', null)
    const { count: epEmpty } = await sb.from('kp_expressions').select('id', { count: 'exact', head: true }).is('episodes', null)
    const { count: expFin }  = await sb.from('kp_dialogue_expressions').select('id', { count: 'exact', head: true }).eq('role', 'exposure')
    console.log(`kp_expressions        ${total}행 (재사용 ${keepExisting.size} / 신규 ${newExprs.length} / 삭제 ${toDeleteFromDb.length})`)
    console.log(`  compare 채워진 항목   ${cmpFill}`)
    console.log(`  episodes 비어있는 항목  ${epEmpty}  ${epEmpty === 0 ? '✓' : '← ⚠ 0이 아님!'}`)
    console.log(`kp_dialogue_expressions  exposure ${expFin}행`)
    console.log('스키마                 compare, episodes 컬럼 추가 완료')
  } else {
    const kept = keepExisting.size
    console.log(`[dry-run] 목표: ${kept + newExprs.length}행 (재사용 ${kept} / 신규 ${newExprs.length})`)
    console.log(`[dry-run] 삭제 예정: ${toDeleteFromDb.length}행`)
    console.log(`[dry-run] episodes 미배정: ${unmatched.length}건${unmatched.length > 0 ? ' ← ⚠' : ' ✓'}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
