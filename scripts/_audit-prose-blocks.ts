import * as dotenv from 'dotenv'; import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY??process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false}})
async function main(){
  const {data}=await sb.from('blog_posts').select('slug,app,locale,title,content').eq('is_paused',false).lte('published_at',new Date().toISOString())
  const bq=[], indent=[], fence=[], age=[]
  for(const p of data!){
    const c:string=p.content??''
    if(/(^|\n)> /.test(c)) bq.push(`${p.slug} (${(c.match(/(^|\n)> /g)||[]).length}개)`)
    if(/(^|\n)( {4}|\t)\S/.test(c)) indent.push(p.slug)
    if(/```/.test(c)) fence.push(p.slug)
    if(/빠른 년생|Korean age|korean-age/i.test(c+p.slug+p.title)) age.push(`${p.locale}/${p.app}/${p.slug}  "${p.title}"`)
  }
  console.log(`전체 ${data!.length}편\n`)
  console.log(`=== blockquote(> ) 사용 글: ${bq.length}편 ===`); bq.forEach(s=>console.log('  '+s))
  console.log(`\n=== 4칸 들여쓰기/탭 블록: ${indent.length}편 ===`); indent.forEach(s=>console.log('  '+s))
  console.log(`\n=== 코드펜스(\`\`\`): ${fence.length}편 ===`); fence.forEach(s=>console.log('  '+s))
  console.log(`\n=== Korean Age 관련: ${age.length}편 ===`); age.forEach(s=>console.log('  '+s))
}
main().catch(e=>{console.error(e.message);process.exit(1)})
