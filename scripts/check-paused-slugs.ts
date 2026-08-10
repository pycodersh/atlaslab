import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, app, is_paused')
    .eq('app', 'k-patto')
    .eq('is_paused', true)
    .limit(3)

  if (error) console.error(error)
  else console.log(JSON.stringify(data, null, 2))
}

main()
