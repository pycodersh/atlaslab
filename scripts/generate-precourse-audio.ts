/**
 * K-PATTO Pre-Course 음성 파일 생성 스크립트 (Google TTS)
 *
 * 사용법:
 *   npx tsx scripts/generate-precourse-audio.ts
 *   npx tsx scripts/generate-precourse-audio.ts --lesson 1
 *   npx tsx scripts/generate-precourse-audio.ts --dry-run   (업로드 없이 목록만 출력)
 *
 * 생성 대상:
 *   - 레슨 1~6 (required)의 word-practice 단어 (한국어)
 *   - card-flip-grid 카드 앞면 (한글 자모/단어)
 *   - combine-anim 결과 글자
 *   - stack-anim 받침 예시 단어
 *
 * 업로드 경로: audio/kpatto/precourse/{lessonId}/{slug}.mp3
 * URL 패턴:   {SUPABASE_URL}/storage/v1/object/public/audio/kpatto/precourse/{lessonId}/{slug}.mp3
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!
const GOOGLE_TTS_KEY = process.env.GOOGLE_TTS_API_KEY!
const BUCKET = 'audio'
const PREFIX = 'kpatto/precourse'

const args = process.argv.slice(2)
const lessonArg = args.includes('--lesson') ? Number(args[args.indexOf('--lesson') + 1]) : null
const dryRun = args.includes('--dry-run')

if (!GOOGLE_TTS_KEY) {
  console.error('GOOGLE_TTS_API_KEY가 .env.local에 없습니다.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ── 텍스트 → slug 변환 ──────────────────────────────────────────────────────
function toSlug(text: string): string {
  // 한글 유니코드를 그대로 hex로 인코딩 (파일명 안전)
  return Array.from(text)
    .map(c => c.codePointAt(0)!.toString(16).padStart(4, '0'))
    .join('-')
}

// ── Google TTS REST API 호출 ──────────────────────────────────────────────
async function synthesize(text: string): Promise<Buffer> {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_KEY}`
  const body = {
    input: { text },
    voice: {
      languageCode: 'ko-KR',
      name: 'ko-KR-Wavenet-A',   // 자연스러운 한국어 여성 음성
      ssmlGender: 'FEMALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.85,         // 학습자용 — 약간 느리게
      pitch: 0,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Google TTS 오류 [${res.status}]: ${err}`)
  }

  const json = await res.json() as { audioContent: string }
  return Buffer.from(json.audioContent, 'base64')
}

// ── Supabase Storage 업로드 ──────────────────────────────────────────────
async function upload(storagePath: string, buffer: Buffer): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: 'audio/mpeg', upsert: true })

  if (error) throw new Error(`업로드 실패 [${storagePath}]: ${error.message}`)
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
}

// ── 음성화할 항목 목록 ───────────────────────────────────────────────────
interface AudioItem {
  lessonId: number
  text: string          // TTS에 보낼 한국어 텍스트
  slug: string          // 파일명 (확장자 제외)
  description: string   // 로그용
}

function collectItems(): AudioItem[] {
  const items: AudioItem[] = []

  // 레슨 1~6 데이터 (lessons.ts를 직접 import하지 않고 inline 정의)
  // → 스크립트 실행 환경(Node)에서 Next.js 경로 alias(@/)가 없으므로 필요한 데이터만 복사
  const lessonWords: Record<number, { korean: string; label: string }[]> = {
    1: [
      // combine-anim results
      { korean: '가', label: 'combine-가' },
      { korean: '나', label: 'combine-나' },
      { korean: '다', label: 'combine-다' },
    ],
    2: [
      // card-flip-grid vowels (발음 확인용)
      { korean: 'ㅏ', label: 'vowel-ㅏ' },
      { korean: 'ㅓ', label: 'vowel-ㅓ' },
      { korean: 'ㅗ', label: 'vowel-ㅗ' },
      { korean: 'ㅜ', label: 'vowel-ㅜ' },
      { korean: 'ㅡ', label: 'vowel-ㅡ' },
      { korean: 'ㅣ', label: 'vowel-ㅣ' },
      { korean: 'ㅐ', label: 'vowel-ㅐ' },
      { korean: 'ㅔ', label: 'vowel-ㅔ' },
      // word-practice
      { korean: '아이', label: 'word-아이' },
      { korean: '우유', label: 'word-우유' },
      { korean: '오이', label: 'word-오이' },
    ],
    3: [
      // stroke-grid consonants
      { korean: 'ㄱ', label: 'cons-ㄱ' },
      { korean: 'ㄴ', label: 'cons-ㄴ' },
      { korean: 'ㄷ', label: 'cons-ㄷ' },
      { korean: 'ㄹ', label: 'cons-ㄹ' },
      { korean: 'ㅁ', label: 'cons-ㅁ' },
      { korean: 'ㅂ', label: 'cons-ㅂ' },
      { korean: 'ㅅ', label: 'cons-ㅅ' },
      { korean: 'ㅈ', label: 'cons-ㅈ' },
      { korean: 'ㅇ', label: 'cons-ㅇ' },
      { korean: 'ㅋ', label: 'cons-ㅋ' },
      { korean: 'ㅌ', label: 'cons-ㅌ' },
      { korean: 'ㅍ', label: 'cons-ㅍ' },
      { korean: 'ㅊ', label: 'cons-ㅊ' },
      { korean: 'ㅎ', label: 'cons-ㅎ' },
      // word-practice
      { korean: '나비', label: 'word-나비' },
      { korean: '바나나', label: 'word-바나나' },
      { korean: '가방', label: 'word-가방' },
      { korean: '모자', label: 'word-모자' },
      { korean: '사진', label: 'word-사진' },
    ],
    4: [
      // combine-anim results
      { korean: '가', label: 'combine-가' },
      { korean: '너', label: 'combine-너' },
      { korean: '비', label: 'combine-비' },
      { korean: '고', label: 'combine-고' },
      { korean: '누', label: 'combine-누' },
      { korean: '브', label: 'combine-브' },
      // word-practice
      { korean: '고기', label: 'word-고기' },
      { korean: '도시', label: 'word-도시' },
      { korean: '커피', label: 'word-커피' },
      { korean: '기차', label: 'word-기차' },
      { korean: '버스', label: 'word-버스' },
    ],
    5: [
      // diphthong-grid
      { korean: 'ㅑ', label: 'diph-ㅑ' },
      { korean: 'ㅕ', label: 'diph-ㅕ' },
      { korean: 'ㅛ', label: 'diph-ㅛ' },
      { korean: 'ㅠ', label: 'diph-ㅠ' },
      { korean: 'ㅘ', label: 'diph-ㅘ' },
      { korean: 'ㅝ', label: 'diph-ㅝ' },
      { korean: 'ㅢ', label: 'diph-ㅢ' },
      { korean: 'ㅚ', label: 'diph-ㅚ' },
      { korean: 'ㅟ', label: 'diph-ㅟ' },
      { korean: 'ㅒ', label: 'diph-ㅒ' },
      { korean: 'ㅖ', label: 'diph-ㅖ' },
      { korean: 'ㅙ', label: 'diph-ㅙ' },
      { korean: 'ㅞ', label: 'diph-ㅞ' },
      // word-practice
      { korean: '야구', label: 'word-야구' },
      { korean: '여자', label: 'word-여자' },
      { korean: '요리', label: 'word-요리' },
      { korean: '유리', label: 'word-유리' },
      { korean: '와이파이', label: 'word-와이파이' },
      { korean: '의사', label: 'word-의사' },
    ],
    6: [
      // stack-anim examples + coda words
      { korean: '갈', label: 'stack-갈' },
      { korean: '남', label: 'stack-남' },
      { korean: '국', label: 'word-국' },
      { korean: '한', label: 'word-한' },
      { korean: '말', label: 'word-말' },
      { korean: '봄', label: 'word-봄' },
      { korean: '밥', label: 'word-밥' },
      { korean: '맛', label: 'word-맛' },
      { korean: '강', label: 'word-강' },
      // word-practice
      { korean: '한국', label: 'word-한국' },
      { korean: '물', label: 'word-물' },
      { korean: '강남', label: 'word-강남' },
      { korean: '일', label: 'word-일' },
    ],
  }

  for (const [lessonIdStr, words] of Object.entries(lessonWords)) {
    const lessonId = Number(lessonIdStr)
    if (lessonArg && lessonId !== lessonArg) continue

    // 중복 제거 (같은 글자가 여러 레슨에 등장할 수 있음 — 레슨별로는 허용)
    const seen = new Set<string>()
    for (const w of words) {
      if (seen.has(w.korean)) continue
      seen.add(w.korean)
      items.push({
        lessonId,
        text: w.korean,
        slug: toSlug(w.korean),
        description: `L${lessonId} ${w.label}`,
      })
    }
  }

  return items
}

// ── 메인 ─────────────────────────────────────────────────────────────────
async function main() {
  const items = collectItems()
  console.log(`\n총 ${items.length}개 항목 처리 예정${dryRun ? ' (dry-run)' : ''}\n`)

  const results: { path: string; url: string; status: 'ok' | 'skip' | 'error'; msg?: string }[] = []

  for (const item of items) {
    const storagePath = `${PREFIX}/${item.lessonId}/${item.slug}.mp3`

    if (dryRun) {
      console.log(`[DRY] ${item.description} → ${storagePath}`)
      results.push({ path: storagePath, url: '', status: 'skip' })
      continue
    }

    // 이미 존재하면 skip
    const { data: existing } = await supabase.storage
      .from(BUCKET)
      .list(`${PREFIX}/${item.lessonId}`, { search: `${item.slug}.mp3` })

    if (existing && existing.length > 0) {
      const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`
      console.log(`[SKIP] ${item.description}  (이미 존재)`)
      results.push({ path: storagePath, url, status: 'skip' })
      continue
    }

    try {
      process.stdout.write(`[TTS ] ${item.description} "${item.text}" ... `)
      const buffer = await synthesize(item.text)
      const url = await upload(storagePath, buffer)
      console.log(`✓  (${buffer.length} bytes)`)
      results.push({ path: storagePath, url, status: 'ok' })

      // Google TTS 무료 할당량 보호용 딜레이 (100ms)
      await new Promise(r => setTimeout(r, 100))
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`✗  ${msg}`)
      results.push({ path: storagePath, url: '', status: 'error', msg })
    }
  }

  // ── 결과 요약 ────────────────────────────────────────────────────────
  const ok    = results.filter(r => r.status === 'ok')
  const skip  = results.filter(r => r.status === 'skip')
  const error = results.filter(r => r.status === 'error')

  console.log('\n──────────────────────────────────────────')
  console.log(`✓ 생성: ${ok.length}  ⟳ 스킵: ${skip.length}  ✗ 오류: ${error.length}`)

  if (ok.length > 0) {
    console.log('\n생성된 파일:')
    ok.forEach(r => console.log(`  ${r.path}`))
  }

  if (error.length > 0) {
    console.log('\n오류 목록:')
    error.forEach(r => console.log(`  ${r.path} — ${r.msg}`))
    process.exit(1)
  }

  // AudioButton에서 사용할 URL 예시 출력
  if (ok.length > 0 || skip.length > 0) {
    const sample = (ok[0] ?? skip[0])
    console.log('\nURL 패턴 예시:')
    console.log(`  ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${PREFIX}/{lessonId}/{slug}.mp3`)
    console.log(`  예) ${sample?.url || `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${PREFIX}/2/${toSlug('아이')}.mp3`}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
