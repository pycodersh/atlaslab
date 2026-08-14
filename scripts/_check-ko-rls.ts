import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const PUB = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY!
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

const sbPub = createClient(URL, PUB, { auth: { persistSession: false } })
const sbSvc = createClient(URL, SVC, { auth: { persistSession: false } })
const now = new Date().toISOString()

async function main() {
  // 1. PUBLISHABLE KEY: 전체 locale 분포
  const { data: dist, error: dErr } = await sbPub
    .from('blog_posts').select('locale').eq('is_paused', false)
  console.log('PUBLISHABLE KEY - 전체 locale 분포:')
  if (dErr) { console.log('  오류:', dErr.message); }
  else {
    const m: Record<string, number> = {}
    ;(dist ?? []).forEach(r => { m[r.locale] = (m[r.locale] ?? 0) + 1 })
    console.log(' ', JSON.stringify(m))
  }

  // 2. PUBLISHABLE KEY: locale='ko' 직접 쿼리
  const { data: pub, error: pErr } = await sbPub
    .from('blog_posts').select('id,slug,locale,app')
    .eq('locale', 'ko').eq('is_paused', false).lte('published_at', now)
  console.log('\nPUBLISHABLE KEY - locale=ko:', pub?.length ?? 0, '건')
  if (pErr) console.log('  오류:', pErr.message)

  // 3. SERVICE KEY: locale='ko' 직접 쿼리
  const { data: svc, error: sErr } = await sbSvc
    .from('blog_posts').select('id,slug,locale,app')
    .eq('locale', 'ko').eq('is_paused', false).lte('published_at', now)
  console.log('SERVICE KEY - locale=ko:', svc?.length ?? 0, '건')
  if (sErr) console.log('  오류:', sErr.message)

  // 4. PUBLISHABLE KEY: app='patto' 직접 쿼리 (locale 무시)
  const { data: appQ } = await sbPub
    .from('blog_posts').select('id,locale,app').eq('app', 'patto').eq('is_paused', false)
  console.log('\nPUBLISHABLE KEY - app=patto:', appQ?.length ?? 0, '건')
  if (appQ?.length) console.log('  locale 분포:', [...new Set(appQ.map(r => r.locale))])
}

main().catch(e => { console.error(e); process.exit(1) })
