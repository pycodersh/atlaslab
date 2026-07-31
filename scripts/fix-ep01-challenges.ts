import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  const fixes = [
    // "Water, please." → "Dalgona latte, please." (translation)
    {
      id: 629,
      update: { question: { prompt: 'Dalgona latte, please.' } },
    },
    // "Water, please." → "Dalgona latte, please." + word_pieces 수정
    {
      id: 633,
      update: {
        question: { prompt: 'Dalgona latte, please.' },
        word_pieces: ['달고나', '라떼', '주세요', '없어요'],
      },
    },
    // "Is there a seat?" → "Is there WiFi?" (translation)
    {
      id: 634,
      update: { question: { prompt: 'Is there WiFi?' } },
    },
    // "Is there a seat?" → "Is there WiFi?" (word_order)
    {
      id: 636,
      update: { question: { prompt: 'Is there WiFi?' } },
    },
  ]

  for (const fix of fixes) {
    const { error } = await sb.from('kp_challenges').update(fix.update).eq('id', fix.id)
    if (error) {
      console.error(`❌ id=${fix.id}:`, error.message)
    } else {
      console.log(`✅ id=${fix.id} updated`)
    }
  }

  console.log('\n완료')
}

main().catch(console.error)
