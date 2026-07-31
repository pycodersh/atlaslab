import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
)

async function main() {
  const fixes = [
    {
      id: 93,
      korean: '이런 거 너무 좋아요.\n다 같이 있어서 좋아요.',
      highlight_text: null, // static 파일에 highlight 없음
    },
    {
      id: 95,
      korean: '한국에 온 지 얼마 안 됐는데...\n이미 너무 좋아요.',
      highlight_text: null,
    },
  ]

  for (const fix of fixes) {
    const { error } = await sb
      .from('kp_bubbles')
      .update({ korean: fix.korean, highlight_text: fix.highlight_text })
      .eq('id', fix.id)

    if (error) {
      console.error(`id=${fix.id} 실패:`, error)
    } else {
      console.log(`id=${fix.id} 수정 완료: "${fix.korean.replace('\n', '\\n')}"`)
    }
  }

  // 검증
  const { data } = await sb
    .from('kp_bubbles')
    .select('id, korean, highlight_text')
    .in('id', [93, 95])
  console.log('\n검증:')
  for (const b of data ?? []) {
    console.log(`  id=${b.id}: "${b.korean}" | highlight=${b.highlight_text ?? '(없음)'}`)
  }
}

main().catch(console.error)
