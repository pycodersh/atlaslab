/**
 * 신규 패턴(1241~1293) kp_dialogue_expressions 하드코딩 재연결 v2
 * insert-missing-patterns.ts의 episodes/searchTerms를 직접 사용
 * first_episode에 의존하지 않음
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } })

interface PatternLink {
  id: number
  episodes: number[]
  searchTerms: string[]
}

const PATTERN_MAP: PatternLink[] = [
  { id: 1241, episodes: [3],       searchTerms: ['먹을 수 있어요'] },
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
  { id: 1262, episodes: [67],      searchTerms: ['이렇게 예뻐요', '이렇게 매워요', '이렇게 빨라요', '이렇게'] },
  { id: 1263, episodes: [67],      searchTerms: ['이때가 제일 좋아요', '제일 좋아요', '이때가 제일'] },
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
  { id: 1283, episodes: [81, 86],  searchTerms: ['줄 몰랐어요', 'ㄹ 줄 몰랐어요', '을 줄 몰랐어요'] },
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

function findDialogue(dialogues: Array<{ id: number; text_ko: string }>, searchTerms: string[]): number | null {
  for (const term of searchTerms) {
    for (const d of dialogues) {
      if (d.text_ko && d.text_ko.includes(term)) return d.id
    }
  }
  return null
}

async function main() {
  // 에피소드 번호 → id 맵
  const { data: epRows } = await sb.from('kp_episodes').select('id, episode_num').gte('episode_num', 1).lte('episode_num', 100)
  const epNumToId = new Map((epRows ?? []).map((e: any) => [e.episode_num as number, e.id as number]))
  console.log(`에피소드 맵 로드: ${epNumToId.size}개\n`)

  // 현재 연결 현황 조회
  const { data: existingLinks } = await sb.from('kp_dialogue_expressions')
    .select('expression_id, dialogue_id, role')
    .gte('expression_id', 1241).lte('expression_id', 1293)
  const linkedSet = new Set((existingLinks ?? []).map((r: any) => `${r.expression_id}:${r.dialogue_id}:${r.role}`))
  const linkedByExpr = new Map<number, number[]>()
  for (const r of (existingLinks ?? []) as any[]) {
    if (!linkedByExpr.has(r.expression_id)) linkedByExpr.set(r.expression_id, [])
    linkedByExpr.get(r.expression_id)!.push(r.dialogue_id)
  }
  console.log(`현재 연결된 신규 패턴 레코드: ${existingLinks?.length ?? 0}건\n`)

  let linked = 0, skipped = 0, failed = 0
  const failList: string[] = []

  for (const pat of PATTERN_MAP) {
    for (const epNum of pat.episodes) {
      const epId = epNumToId.get(epNum)
      if (!epId) {
        failList.push(`[NO_EP] id=${pat.id} EP${epNum}`)
        failed++
        continue
      }

      // 에피소드 내 대사 조회
      const { data: dials } = await sb.from('kp_dialogues')
        .select('id, text_ko')
        .eq('episode_id', epId)
        .order('id')

      const dialogueId = findDialogue((dials ?? []) as any[], pat.searchTerms)
      if (!dialogueId) {
        failList.push(`[NOT_FOUND] id=${pat.id} EP${epNum} terms=[${pat.searchTerms.slice(0,2).join(',')}]`)
        failed++
        continue
      }

      const dedupeKey = `${pat.id}:${dialogueId}:focus`
      if (linkedSet.has(dedupeKey)) {
        console.log(`  SKIP (이미 연결): id=${pat.id} EP${epNum} → dial=${dialogueId}`)
        skipped++
        continue
      }

      const { data: dial } = await sb.from('kp_dialogues').select('text_ko').eq('id', dialogueId).single()
      const matchedText = (dial as any)?.text_ko ?? ''

      const { error } = await sb.from('kp_dialogue_expressions').insert({
        expression_id: pat.id,
        dialogue_id: dialogueId,
        role: 'focus',
        matched_text: matchedText,
      })

      if (error) {
        failList.push(`[INSERT_ERR] id=${pat.id} EP${epNum}: ${error.message}`)
        failed++
      } else {
        console.log(`  ✅ id=${pat.id} EP${epNum} → dial=${dialogueId} "${matchedText.substring(0, 30)}"`)
        linkedSet.add(dedupeKey)
        linked++
      }
    }
  }

  console.log(`\n연결 성공: ${linked} / 스킵: ${skipped} / 실패: ${failed}`)
  if (failList.length > 0) {
    console.log('\n실패 목록:')
    failList.forEach(f => console.log('  ' + f))
  }

  const { count: finalCnt } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true })
  const { count: newCnt } = await sb.from('kp_dialogue_expressions').select('*', { count: 'exact', head: true }).gte('expression_id', 1241).lte('expression_id', 1293)
  console.log(`\n최종 kp_dialogue_expressions: ${finalCnt}건`)
  console.log(`최종 신규 패턴(1241~1293) 연결: ${newCnt}건`)
}

main().catch(console.error)
