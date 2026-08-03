import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const rows = [
    {
      id: 1388,
      korean: '~얼마나 걸려요?',
      english: 'How long does ~ take?',
      description: 'Used to ask how much time something will take, such as travel, delivery, or cooking.',
      examples: [
        { ko: '여기서 얼마나 걸려요?', en: 'How long does it take from here?' },
        { ko: '요리하는 데 얼마나 걸려요?', en: 'How long does it take to cook?' },
        { ko: '지하철로 얼마나 걸려요?', en: 'How long does it take by subway?' },
      ],
      compare: null,
      episodes: [4],
    },
    {
      id: 1389,
      korean: '꼭 봐야 할 게 뭐예요?',
      english: "What's a must-see?",
      description: 'Used to ask what you should not miss when visiting a place.',
      examples: [
        { ko: '제주도에서 꼭 봐야 할 게 뭐예요?', en: "What's a must-see in Jeju?" },
        { ko: '서울에서 꼭 봐야 할 게 뭐예요?', en: "What's a must-see in Seoul?" },
        { ko: '이 동네에서 꼭 봐야 할 게 뭐예요?', en: "What's a must-see in this neighborhood?" },
      ],
      compare: null,
      episodes: [49],
    },
  ]

  for (const row of rows) {
    const { error } = await sb.from('kp_expressions').insert(row)
    if (error) {
      console.error(`  ✗ id=${row.id} 삽입 오류:`, error.message)
      process.exit(1)
    }
    console.log(`  ✓ id=${row.id}  korean="${row.korean}"  삽입 완료`)
  }

  const { count } = await sb.from('kp_expressions').select('*', { count: 'exact', head: true })
  console.log(`\n  kp_expressions 총계: ${count}`)
  if (count !== 325) console.warn('  ⚠ 기대값 325와 다릅니다!')
}

main().catch(e => { console.error(e); process.exit(1) })
