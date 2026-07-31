import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

function extractHighlight(korean: string, epNum: number): string | null {
  const k = korean.replace(/\n/g, ' ').trim()

  switch (epNum) {
    case 1: {
      // Patterns: 주세요, 뭐예요?, 이에요/예요, 있어요/없어요, 얼마예요?
      if (k.includes('얼마예요')) return '얼마예요'
      if (k.includes('뭐예요')) return '뭐예요'
      if (k.includes('주세요')) return '주세요'
      if (k.includes('없어요')) return '없어요'
      if (k.includes('있어요')) return '있어요'
      if (k.includes('이에요')) return '이에요'
      if (k.includes('예요')) return '예요'
      break
    }
    case 2: {
      // Patterns: 어디예요?, 가고 싶어요, 어떻게 가요?, 주세요, 좋아요
      if (k.includes('어디예요')) return '어디예요'
      const gm2 = k.match(/[가-힣]+고 싶어요/)
      if (gm2) return gm2[0]
      if (k.includes('어떻게 가요')) return '어떻게 가요'
      if (k.includes('주세요')) return '주세요'
      if (k.includes('좋아요')) return '좋아요'
      break
    }
    case 3: {
      // Patterns: 고 싶어요, 수 있어요/없어요, 아니에요, 못 ~, 맞아요?
      const gm3 = k.match(/[가-힣]+고 싶어요/)
      if (gm3) return gm3[0]
      const cm3 = k.match(/[가-힣]+ 수 [있없]어요/)
      if (cm3) return cm3[0]
      if (k.includes('아니에요')) return '아니에요'
      const nm3 = k.match(/못\s?[가-힣]+요/)
      if (nm3) return nm3[0]
      if (k.includes('맞아요')) return '맞아요'
      break
    }
    case 4: {
      // Patterns: 해도 돼요?, 어때요?, 로 할게요, 얼마나 걸려요?
      const rm4 = k.match(/[가-힣]+(로|으로) 할게요/)
      if (rm4) return rm4[0]
      const dm4 = k.match(/[가-힣]+[아어]도 돼요/)
      if (dm4) return dm4[0]
      if (k.includes('어때요')) return '어때요'
      if (k.includes('얼마나 걸려요')) return '얼마나 걸려요'
      break
    }
    case 5: {
      // Patterns: 주실 수 있어요?, 추천해 주세요, 해 본 적 있어요?, 살 수 있어요, 맛있어요
      if (k.includes('주실 수 있어요')) return '주실 수 있어요'
      if (k.includes('추천해 주세요')) return '추천해 주세요'
      const bm5 = k.match(/[가-힣]+[아어] 본 적 있어요/)
      if (bm5) return bm5[0]
      if (k.includes('살 수 있어요')) return '살 수 있어요'
      if (k.includes('맛있어요')) return '맛있어요'
      break
    }
    case 6: {
      // Patterns: 좋아해요, 진짜요?/대박!, 너무 ~해요, 잘해요/못해요, 또 오고 싶어요
      if (k.includes('좋아해요')) return '좋아해요'
      if (k.includes('진짜요')) return '진짜요'
      if (k.includes('대박')) return '대박'
      const nm6 = k.match(/너무[^!?。\r\n]+/)
      if (nm6) return nm6[0].trim()
      if (k.includes('잘해요')) return '잘해요'
      const mm6 = k.match(/못\s?[가-힣]+요/)
      if (mm6) return mm6[0]
      if (k.includes('오고 싶어요')) return '오고 싶어요'
      break
    }
    case 7: {
      // Patterns: 깎아 주세요, 다 해서 얼마예요?, 조금만 더 주세요, 맛봐요!, 신기해요
      if (k.includes('깎아 주세요')) return '깎아 주세요'
      if (k.includes('다 해서 얼마예요')) return '다 해서 얼마예요'
      if (k.includes('조금만 더 주세요')) return '조금만 더 주세요'
      if (k.includes('맛봐요')) return '맛봐요'
      else if (k.includes('맛봐')) return '맛봐'
      if (k.includes('신기해요')) return '신기해요'
      break
    }
    case 8: {
      // Patterns: 추천해 주세요, 뭐 써요?, 어떤 게 좋아요?, 써봤어요?, 피부에 좋아요
      if (k.includes('추천해 주세요')) return '추천해 주세요'
      if (k.includes('뭐 써요')) return '뭐 써요'
      if (k.includes('어떤 게 좋아요')) return '어떤 게 좋아요'
      if (k.includes('써봤어요')) return '써봤어요'
      if (k.includes('피부에 좋아요')) return '피부에 좋아요'
      break
    }
    case 9: {
      // Patterns: 날씨 너무 좋다, 배달 돼요?, 생각보다 ~해요, 다 같이 있어서 좋아요, 이미 ~해요
      if (k.includes('너무 좋다')) return '너무 좋다'
      if (k.includes('배달 돼요')) return '배달 돼요'
      if (k.includes('배달이 돼요')) return '배달이 돼요'
      if (k.includes('생각보다')) return '생각보다'
      if (k.includes('다 같이')) return '다 같이'
      if (k.includes('이미 ') || k.endsWith('이미')) return '이미'
      break
    }
    case 10: {
      // Patterns: 에서 왔어요, 전공이에요, 잘 부탁드려요, 떨려요, 할 수 있었어요
      if (k.includes('에서 왔어요')) return '에서 왔어요'
      if (k.includes('전공이에요')) return '전공이에요'
      if (k.includes('잘 부탁드려요')) return '잘 부탁드려요'
      if (k.includes('떨려요')) return '떨려요'
      if (k.includes('할 수 있었어요')) return '할 수 있었어요'
      break
    }
  }
  return null
}

async function main() {
  const { data: episodes, error: epErr } = await supabase
    .from('kp_episodes')
    .select('id, episode_num')
    .order('episode_num')
  if (epErr) throw epErr

  let totalUpdated = 0
  let totalSkipped = 0
  let totalNull = 0

  for (const ep of episodes!) {
    const { data: bubbles, error: bErr } = await supabase
      .from('kp_bubbles')
      .select('id, korean, highlight_text')
      .eq('episode_id', ep.id)
      .order('id')
    if (bErr) throw bErr

    console.log(`\n=== EP${ep.episode_num} (${(bubbles ?? []).length} bubbles) ===`)

    for (const b of (bubbles ?? [])) {
      const hl = extractHighlight(b.korean, ep.episode_num)
      const koShort = b.korean.replace(/\n/g, '↵').slice(0, 40)

      if (!hl) {
        totalNull++
        continue
      }

      if (!b.korean.includes(hl)) {
        console.warn(`  WARN: "${hl}" not in "${koShort}"`)
        continue
      }

      if (b.highlight_text === hl) {
        totalSkipped++
        console.log(`  SKIP [${hl}] ${koShort}`)
        continue
      }

      const { error } = await supabase
        .from('kp_bubbles')
        .update({ highlight_text: hl })
        .eq('id', b.id)

      if (error) {
        console.error(`  FAIL id=${b.id}: ${error.message}`)
      } else {
        totalUpdated++
        console.log(`  OK   [${hl}] ${koShort}`)
      }
    }
  }

  console.log(`\n✓ Done — updated: ${totalUpdated}, already set: ${totalSkipped}, no pattern: ${totalNull}`)
}

main().catch(e => { console.error(e); process.exit(1) })
