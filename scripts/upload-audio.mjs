/**
 * Patto Audio Upload — Supabase Storage
 * patto 디렉토리에서 실행: node scripts/upload-audio.mjs
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// BOM 포함 .env.local 파싱
function loadEnv(envPath) {
  const raw = fs.readFileSync(envPath, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}
const BASE = 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto'
loadEnv(`${BASE}/.env.local`)

const SUPA_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_SERVICE = process.env.SUPABASE_SECRET_KEY
const AUDIO_DIR    = `${BASE}/public/audio-generated`
const BUCKET       = 'audio'
const CONCURRENCY  = 10

if (!SUPA_URL || !SUPA_SERVICE) {
  console.error('Supabase env vars missing')
  console.error('URL:', SUPA_URL ? '✓' : '✗')
  console.error('KEY:', SUPA_SERVICE ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(SUPA_URL, SUPA_SERVICE, {
  auth: { persistSession: false },
})

async function main() {
  const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'))
  console.log(`\n☁  Supabase Storage 업로드`)
  console.log(`버킷: ${BUCKET} · 파일: ${files.length}개 · 동시: ${CONCURRENCY}`)
  console.log(`소스: ${AUDIO_DIR}\n`)

  // 버킷 접근 확인
  const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets()
  if (bucketErr) {
    console.error('버킷 접근 실패:', bucketErr.message)
    console.error('→ SUPABASE_SECRET_KEY가 service role key인지 확인하세요')
    process.exit(1)
  }
  const bucket = buckets?.find(b => b.name === BUCKET)
  if (!bucket) {
    console.log(`버킷 '${BUCKET}' 없음 → 생성 중...`)
    const { error: createErr } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (createErr) { console.error('버킷 생성 실패:', createErr.message); process.exit(1) }
    console.log(`✓ 버킷 '${BUCKET}' 생성 완료`)
  } else {
    console.log(`✓ 버킷 '${BUCKET}' 확인`)
  }

  let uploaded = 0, failed = 0, skipped = 0

  // 병렬 업로드 풀
  let i = 0
  async function worker() {
    while (i < files.length) {
      const filename = files[i++]
      const localPath = path.join(AUDIO_DIR, filename)
      try {
        const buf = fs.readFileSync(localPath)
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(filename, buf, { contentType: 'audio/mpeg', upsert: true })
        if (error) throw new Error(error.message)
        uploaded++
        if (uploaded % 200 === 0 || uploaded === files.length) {
          console.log(`  ↑ ${uploaded}/${files.length} (실패: ${failed})`)
        }
      } catch (e) {
        failed++
        if (failed <= 5) console.error(`  ✗ ${filename}: ${e.message}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  console.log(`\n${'='.repeat(50)}`)
  console.log(`✅ 업로드 완료`)
  console.log(`   성공: ${uploaded}개`)
  console.log(`   실패: ${failed}개`)
  console.log(`   공개 URL: ${SUPA_URL}/storage/v1/object/public/${BUCKET}/`)
  console.log(`${'='.repeat(50)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
