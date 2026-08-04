import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const FIXES: { id: number; prompt: string }[] = [
  { id: 652,  prompt: 'What is that?' },
  { id: 637,  prompt: 'I want to go to Hongdae.' },
  { id: 642,  prompt: 'How do I get to Hongdae?' },
  { id: 657,  prompt: 'I want to eat tteokbokki.' },
  { id: 929,  prompt: "I'm a bit different." },
  { id: 1257, prompt: 'Korean food is the best!' },
  { id: 1287, prompt: 'Have you tried sundae?' },
  { id: 1305, prompt: 'Is this expression correct?' },
  { id: 1368, prompt: 'Have you been here before?' },
  { id: 1438, prompt: 'Do you have all the ingredients?' },
  { id: 1454, prompt: 'Do you have a morning and evening routine?' },
  { id: 1469, prompt: 'Is spring in Korea always this beautiful?' },
  { id: 1592, prompt: 'Is this expression correct?' },
]

async function main() {
  let ok = 0
  let fail = 0

  for (const fix of FIXES) {
    const { error } = await sb
      .from('kp_challenges')
      .update({ question: { prompt: fix.prompt } })
      .eq('id', fix.id)

    if (error) {
      console.error(`❌ id=${fix.id} 실패: ${error.message}`)
      fail++
    } else {
      console.log(`✅ id=${fix.id}  → "${fix.prompt}"`)
      ok++
    }
  }

  console.log(`\n완료: ${ok}건 성공, ${fail}건 실패`)
}

main().catch(console.error)
