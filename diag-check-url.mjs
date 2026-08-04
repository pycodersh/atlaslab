import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
const env = Object.fromEntries(
  readFileSync('C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']
const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const { data: ep } = await supabase.from('kp_episodes').select('id').eq('episode_num', 31).single()
const { data: panels } = await supabase.from('kp_panels').select('image_url').eq('episode_id', ep.id).eq('type','panel').limit(1)
const imgPath = panels[0].image_url  // e.g. /kpatto/ep-031/ep31_c1.png

console.log('image_url:', imgPath)

// Try 1: Public URL (no auth)
const publicUrl = `${SUPABASE_URL}/storage/v1/object/public${imgPath}`
const r1 = await fetch(publicUrl, { signal: AbortSignal.timeout(5000) })
console.log('Public URL status:', r1.status, publicUrl)

// Try 2: With service role auth
const r2 = await fetch(publicUrl, {
  headers: { Authorization: `Bearer ${SERVICE_KEY}` },
  signal: AbortSignal.timeout(5000)
})
console.log('Auth URL status:', r2.status)

// Try 3: Download URL via Supabase client
const pathParts = imgPath.replace(/^\//, '').split('/')
const bucket = pathParts[0]  // 'kpatto'
const path = pathParts.slice(1).join('/')  // 'ep-031/ep31_c1.png'
console.log('Bucket:', bucket, 'Path:', path)

const { data: signedData } = await supabase.storage.from(bucket).createSignedUrl(path, 60)
console.log('Signed URL:', signedData?.signedUrl?.slice(0, 80))

if (signedData?.signedUrl) {
  const r3 = await fetch(signedData.signedUrl, { headers: { Range: 'bytes=0-31' }, signal: AbortSignal.timeout(5000) })
  console.log('Signed URL status:', r3.status)
  const buf = await r3.arrayBuffer()
  const bytes = new Uint8Array(buf)
  console.log('First 8 bytes:', [...bytes.slice(0,8)].map(b => '0x'+b.toString(16).padStart(2,'0')).join(' '))
}
