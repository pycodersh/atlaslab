import * as dotenv from 'dotenv'; import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!, {auth:{persistSession:false}})
const SLUGS=['kimchi-differs-by-region','mackerel-jorim-vs-galchi-jorim','gyeongju-ssambap-what-is-it','sundae-differs-by-region','regional-korean-food-map']
async function main(){
  for(const slug of SLUGS){
    const {data}=await sb.from('blog_posts').select('content').eq('slug',slug).single()
    const c: string = data!.content
    const imgs=[...c.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)]
    console.log(`\n── ${slug}  ${c.length} chars  ![ ${imgs.length}개`)
    for(const m of imgs){
      const i=m.index!
      const before=c.slice(Math.max(0,i-2),i)
      const after=c.slice(i+m[0].length, i+m[0].length+2)
      // 앞뒤 빈 줄
      const okBefore = before==='\n\n'
      const okAfter = after.startsWith('\n\n') || after.startsWith('\n')
      // 표/목록 중간인지: 바로 앞 비어있지 않은 줄
      const prevLines=c.slice(0,i).split('\n').filter(l=>l.trim()!=='')
      const prev=prevLines[prevLines.length-1]??''
      const nextLines=c.slice(i+m[0].length).split('\n').filter(l=>l.trim()!=='')
      const next=nextLines[0]??''
      const inTable = prev.trim().startsWith('|') || next.trim().startsWith('|')
      const inList = /^[-*+]\s|^\d+\.\s/.test(prev.trim()) || /^[-*+]\s|^\d+\.\s/.test(next.trim())
      console.log(`   ${okBefore&&okAfter?'✅':'❌'} 빈줄  ${inTable||inList?'❌ 표/목록 인접':'✅ 문단 사이'}  alt="${m[1]}"  ${m[2].split('/').pop()}`)
      console.log(`      앞: "${prev.slice(0,52)}"`)
      console.log(`      뒤: "${next.slice(0,52)}"`)
    }
  }
}
main().catch(e=>{console.error(e.message);process.exit(1)})
