/**
 * kpantry-migrate-storage.ts
 *
 * k-pantry Supabase(mzcdowxmmuefowcayzfk) 의 Storage 버킷을
 * patto Supabase(eecvvgkihtcgfikaimao) 로 복사한다.
 *
 * 매핑:
 *   ingredients   → pantry-ingredients
 *   recipe-images → pantry-recipe-images
 *
 * 특성:
 *   - 이미 존재하는 객체는 건너뜀 (재실행 안전)
 *   - 동시 처리 최대 5개
 *   - 실패 목록을 마지막에 전체 출력
 *
 * 실행:
 *   npx tsx scripts/kpantry-migrate-storage.ts
 *
 * 전제:
 *   .env.local 에 SUPABASE_SECRET_KEY (patto admin key) 있어야 함
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

// ── 설정 ──────────────────────────────────────────────────────
const SRC_URL = 'https://mzcdowxmmuefowcayzfk.supabase.co'
const SRC_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16Y2Rvd3htbXVlZm93Y2F5emZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTA0NjM1MSwiZXhwIjoyMTAwNjIyMzUxfQ.TGy4ghXZv-CkYGTCSDBk3HsiSgyDrYqHnbj-gL7lRa0'

const DST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const DST_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

if (!DST_URL || !DST_KEY) {
  console.error('❌ .env.local 에 NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SECRET_KEY 없음')
  process.exit(1)
}

const BUCKET_MAP: Record<string, string> = {
  'ingredients':   'pantry-ingredients',
  'recipe-images': 'pantry-recipe-images',
}

const CONCURRENCY = 5

// ── Supabase 클라이언트 ────────────────────────────────────────
const src = createClient(SRC_URL, SRC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const dst = createClient(DST_URL, DST_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── 헬퍼: 버킷 내 모든 객체 경로를 재귀 수집 ─────────────────
async function listAll(
  client: SupabaseClient,
  bucket: string,
  prefix = '',
): Promise<string[]> {
  const { data, error } = await client.storage
    .from(bucket)
    .list(prefix, { limit: 1000, offset: 0 })

  if (error) throw new Error(`list(${bucket}/${prefix}): ${error.message}`)

  const paths: string[] = []
  for (const item of data ?? []) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name
    if (item.id) {
      // 파일
      paths.push(fullPath)
    } else {
      // 폴더 → 재귀
      const sub = await listAll(client, bucket, fullPath)
      paths.push(...sub)
    }
  }
  return paths
}

// ── 헬퍼: 동시성 제한 실행 ───────────────────────────────────
async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<PromiseSettledResult<T>[]> {
  const results: PromiseSettledResult<T>[] = []
  let idx = 0

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++
      try {
        const val = await tasks[i]()
        results[i] = { status: 'fulfilled', value: val }
      } catch (e) {
        results[i] = { status: 'rejected', reason: e }
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker())
  await Promise.all(workers)
  return results
}

// ── 메인 ──────────────────────────────────────────────────────
interface Result {
  path: string
  status: 'copied' | 'skipped' | 'failed'
  error?: string
}

async function migrateBucket(srcBucket: string, dstBucket: string): Promise<Result[]> {
  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📦 ${srcBucket}  →  ${dstBucket}`)
  console.log('─'.repeat(60))

  // 원본 목록
  console.log('  원본 목록 수집 중...')
  const srcPaths = await listAll(src, srcBucket)
  console.log(`  원본: ${srcPaths.length}개`)

  // 대상 기존 목록 (재실행 시 건너뛰기용)
  console.log('  대상 기존 목록 수집 중...')
  const dstPaths = new Set(await listAll(dst, dstBucket))
  console.log(`  대상 기존: ${dstPaths.size}개`)

  const toMigrate = srcPaths.filter(p => !dstPaths.has(p))
  const toSkip    = srcPaths.filter(p =>  dstPaths.has(p))

  console.log(`  신규 복사 대상: ${toMigrate.length}개 / 건너뜀: ${toSkip.length}개`)

  const results: Result[] = toSkip.map(p => ({ path: p, status: 'skipped' }))

  let done = 0
  const tasks = toMigrate.map(path => async () => {
    // 1. 다운로드
    const { data: blob, error: dlErr } = await src.storage
      .from(srcBucket)
      .download(path)

    if (dlErr || !blob) {
      throw new Error(`download: ${dlErr?.message ?? 'no data'}`)
    }

    // 2. ArrayBuffer → Uint8Array
    const buf = new Uint8Array(await blob.arrayBuffer())

    // 3. Content-Type 추론
    const ext = path.split('.').pop()?.toLowerCase() ?? ''
    const mime: Record<string, string> = {
      png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
      webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
    }
    const contentType = mime[ext] ?? 'application/octet-stream'

    // 4. 업로드 (upsert: false → 이미 있으면 에러, 위에서 필터했으므로 안전)
    const { error: upErr } = await dst.storage
      .from(dstBucket)
      .upload(path, buf, { contentType, upsert: false })

    if (upErr) throw new Error(`upload: ${upErr.message}`)

    done++
    if (done % 20 === 0 || done === toMigrate.length) {
      process.stdout.write(`  진행: ${done}/${toMigrate.length}\r`)
    }

    return { path, status: 'copied' as const }
  })

  const settled = await runConcurrent(tasks, CONCURRENCY)

  for (let i = 0; i < settled.length; i++) {
    const s = settled[i]
    if (s.status === 'fulfilled') {
      results.push(s.value)
    } else {
      results.push({
        path: toMigrate[i],
        status: 'failed',
        error: String((s as PromiseRejectedResult).reason),
      })
    }
  }

  console.log() // newline after \r progress
  return results
}

async function main() {
  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  K-PANTRY Storage 이전')
  console.log(`  출처: ${SRC_URL}`)
  console.log(`  대상: ${DST_URL}`)
  console.log('══════════════════════════════════════════════════════════')

  const allResults: Record<string, Result[]> = {}

  for (const [srcBucket, dstBucket] of Object.entries(BUCKET_MAP)) {
    allResults[srcBucket] = await migrateBucket(srcBucket, dstBucket)
  }

  // ── 검증 ────────────────────────────────────────────────────
  console.log('\n\n══════════════════════════════════════════════════════════')
  console.log('  검증 결과')
  console.log('══════════════════════════════════════════════════════════')

  let totalFailed = 0

  for (const [srcBucket, dstBucket] of Object.entries(BUCKET_MAP)) {
    const results = allResults[srcBucket]
    const copied  = results.filter(r => r.status === 'copied').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const failed  = results.filter(r => r.status === 'failed')

    // 최종 객체 수 재확인
    const srcCount = (await listAll(src, srcBucket)).length
    const dstCount = (await listAll(dst, dstBucket)).length

    console.log(`\n📦 ${srcBucket} → ${dstBucket}`)
    console.log(`  원본 객체 수:   ${srcCount}`)
    console.log(`  대상 객체 수:   ${dstCount}`)
    console.log(`  일치:          ${srcCount === dstCount ? '✅ YES' : '❌ NO (불일치!)'}`)
    console.log(`  신규 복사:     ${copied}`)
    console.log(`  건너뜀(기존):  ${skipped}`)
    console.log(`  실패:          ${failed.length}`)

    if (failed.length > 0) {
      console.log('\n  ❌ 실패 목록:')
      for (const f of failed) {
        console.log(`    - ${f.path}`)
        console.log(`      오류: ${f.error}`)
      }
      totalFailed += failed.length
    }

    // 원본에 있는데 대상에 없는 파일
    const srcAll = new Set(await listAll(src, srcBucket))
    const dstAll = new Set(await listAll(dst, dstBucket))
    const missing = [...srcAll].filter(p => !dstAll.has(p))

    if (missing.length > 0) {
      console.log(`\n  ⚠️  원본에는 있으나 대상에 없는 파일 (${missing.length}건):`)
      for (const p of missing) console.log(`    - ${p}`)
    }
  }

  console.log('\n══════════════════════════════════════════════════════════')
  if (totalFailed === 0) {
    console.log('✅ 전체 완료 — 실패 0건')
  } else {
    console.log(`❌ 실패 ${totalFailed}건 — 위 목록 확인 후 재실행하거나 수동 처리`)
    process.exit(1)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
