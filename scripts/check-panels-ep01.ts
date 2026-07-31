import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

async function main() {
  // kp_panels 스키마 확인 (첫 1개)
  const { data: schema } = await supabase.from('kp_panels').select('*').limit(1)
  if (schema?.length) {
    console.log('kp_panels 컬럼:', Object.keys(schema[0]).join(', '))
  }

  // episode_num=1 또는 kp_episodes.episode_num=1 via join
  // 먼저 episode_id 기반 조회 시도
  const { data: ep1 } = await supabase
    .from('kp_episodes')
    .select('id')
    .eq('episode_num', 1)
    .single()

  const ep1Id = ep1?.id

  // kp_panels 전체 (episode_num 컬럼이 있을 수도 있고 episode_id일 수도 있음)
  let panels: any[] = []

  // episode_num 직접 있는 경우
  const { data: byEpNum, error: e1 } = await supabase
    .from('kp_panels')
    .select('*')
    .eq('episode_num', 1)
    .order('panel_number')

  if (!e1 && byEpNum?.length) {
    panels = byEpNum
    console.log(`\n[episode_num=1 조회] ${panels.length}개\n`)
  } else if (ep1Id) {
    const { data: byEpId } = await supabase
      .from('kp_panels')
      .select('*')
      .eq('episode_id', ep1Id)
      .order('panel_number')
    panels = byEpId ?? []
    console.log(`\n[episode_id=${ep1Id} 조회] ${panels.length}개\n`)
  }

  for (const p of panels) {
    console.log(JSON.stringify(p, null, 2))
  }

  // image_url 목록 추출
  const urls = panels.map(p => p.image_url).filter(Boolean)
  if (!urls.length) {
    console.log('\nimage_url 없음')
    return
  }

  console.log('\n=== image_url 목록 ===')
  for (const url of urls) console.log(' ', url)

  // Supabase Storage에서 파일 존재 확인
  // URL에서 버킷/경로 파싱: .../storage/v1/object/public/{bucket}/{path}
  console.log('\n=== Storage 존재 확인 ===')
  for (const url of urls) {
    const m = url.match(/\/storage\/v1\/object\/(?:public\/)?([^/]+)\/(.+)/)
    if (!m) { console.log(`  [파싱 불가] ${url}`); continue }
    const bucket = m[1]
    const filePath = m[2]

    const { data, error } = await supabase.storage.from(bucket).list(
      filePath.includes('/') ? filePath.split('/').slice(0, -1).join('/') : '',
      { search: filePath.split('/').at(-1) }
    )
    const exists = !error && (data?.some(f => filePath.endsWith(f.name)) ?? false)
    console.log(`  [${exists ? '✓ 존재' : '✗ 없음'}] ${bucket}/${filePath}`)
    if (error) console.log(`    오류: ${error.message}`)
  }
}

main().catch(console.error)
