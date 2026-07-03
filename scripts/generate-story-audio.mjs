/**
 * Patto Story Paragraph Audio — 500개 생성 + Supabase 업로드
 * story-{storyId}-{paraId}-{contentHash(text)}-{voiceKey}.mp3
 *
 * Voice mapping (OpenAI gpt-4o-mini-tts):
 *   us-female → shimmer
 *   us-male   → onyx
 *   uk-female → fable
 */
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const BASE = 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto'

function loadEnv(envPath) {
  const raw = fs.readFileSync(envPath, 'utf8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}
loadEnv(`${BASE}/.env.local`)

const OPENAI_KEY   = process.env.OPENAI_API_KEY
const SUPA_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_SERVICE = process.env.SUPABASE_SECRET_KEY
const AUDIO_DIR    = `${BASE}/public/audio-generated`
const STORIES_FILE = `${BASE}/data/magazine-stories.ts`
const CONCURRENCY  = 8

const VOICE_MAP = {
  'us-female': 'shimmer',
  'us-male':   'onyx',
  'uk-female': 'fable',
}

const INSTRUCTIONS = `
You're a warm, friendly narrator reading a short story excerpt.
Speak naturally — use connected speech, relaxed rhythm, and everyday contractions.
Don't perform or project. Don't narrate. Just talk.
Pronunciation should be clear and easy to follow, but never stiff or over-precise.
Let sentences flow together the way real conversation does.
Think: catching up over coffee, not reading a script.
Avoid: audiobook narration, radio announcing, language teacher voice, overacting.
`.trim()

// FNV-1a hash (must match audio-urls.ts)
function contentHash(text) {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36)
}

function parseStories(src) {
  // 1. narratorVoice per story id
  const voiceMap = {}
  for (const m of src.matchAll(/id:\s*(\d+),[\s\S]{0,2000}?narratorVoice:\s*['"](\S+)['"]/g)) {
    voiceMap[parseInt(m[1])] = m[2]
  }

  // 2. All paragraphs: id 'p{storyId}-{n}' + english (double or single quoted)
  const paragraphs = []
  const dqRe = /id:\s*'(p(\d+)-\d+)'[\s\S]{0,500}?english:\s*"((?:[^"\\]|\\.)*)"/g
  for (const m of src.matchAll(dqRe)) {
    const paraId = m[1], storyId = parseInt(m[2])
    const english = m[3].replace(/\\"/g, '"').replace(/\\'/g, "'")
    paragraphs.push({ paraId, storyId, english })
  }
  const sqRe = /id:\s*'(p(\d+)-\d+)'[\s\S]{0,500}?english:\s*'((?:[^'\\]|\\.)*)'/g
  for (const m of src.matchAll(sqRe)) {
    const paraId = m[1], storyId = parseInt(m[2])
    const english = m[3].replace(/\\'/g, "'").replace(/\\"/g, '"')
    if (!paragraphs.find(p => p.paraId === paraId)) {
      paragraphs.push({ paraId, storyId, english })
    }
  }

  // 3. Group by storyId
  const storyMap = {}
  for (const p of paragraphs) {
    if (!storyMap[p.storyId]) storyMap[p.storyId] = []
    storyMap[p.storyId].push({ id: p.paraId, english: p.english })
  }

  return Object.entries(storyMap).map(([id, paras]) => ({
    id: parseInt(id),
    narratorVoice: voiceMap[parseInt(id)] ?? 'us-female',
    paragraphs: paras,
  }))
}

async function generateAudio(text, openaiVoice) {
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: openaiVoice,
      input: text,
      instructions: INSTRUCTIONS,
      speed: 1.0,
      response_format: 'mp3',
    }),
  })
  if (!res.ok) throw new Error(`TTS ${res.status}: ${await res.text()}`)
  return Buffer.from(await res.arrayBuffer())
}

async function runPool(tasks, concurrency) {
  let i = 0, ok = 0, fail = 0
  async function worker() {
    while (i < tasks.length) {
      const task = tasks[i++]
      try { await task(); ok++; await new Promise(r => setTimeout(r, 150)) }
      catch (e) { fail++; console.error('\n  ✗', e.message) }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))
  return { ok, fail }
}

async function main() {
  const supabase = createClient(SUPA_URL, SUPA_SERVICE)

  const src = fs.readFileSync(STORIES_FILE, 'utf8')
  const stories = parseStories(src)

  console.log(`\n🎙  Patto Story Audio 생성`)
  console.log(`파싱된 스토리: ${stories.length}개`)
  console.log(`총 단락: ${stories.reduce((s, st) => s + st.paragraphs.length, 0)}개`)

  const existing = new Set(fs.readdirSync(AUDIO_DIR))

  // 생성 필요 목록 (로컬에 없는 것만)
  const toGenerate = []
  for (const story of stories) {
    const voiceKey = story.narratorVoice  // us-female, us-male, uk-female
    const openaiVoice = VOICE_MAP[voiceKey] ?? 'shimmer'
    for (const para of story.paragraphs) {
      const hash = contentHash(para.english)
      const filename = `story-${story.id}-${para.id}-${hash}-${voiceKey}.mp3`
      if (!existing.has(filename)) {
        toGenerate.push({ storyId: story.id, paraId: para.id, text: para.english, voiceKey, openaiVoice, filename })
      }
    }
  }

  if (toGenerate.length === 0) {
    console.log('\n✅ 모든 파일이 이미 로컬에 있습니다.')
  } else {
    console.log(`\n생성 필요: ${toGenerate.length}개 (로컬 없음)`)
    console.log(`Concurrency: ${CONCURRENCY}\n`)

    let done = 0
    const tasks = toGenerate.map(({ text, voiceKey, openaiVoice, filename }) => async () => {
      const buf = await generateAudio(text, openaiVoice)
      fs.writeFileSync(path.join(AUDIO_DIR, filename), buf)
      done++
      if (done % 50 === 0 || done === toGenerate.length) {
        process.stdout.write(`\r  생성 중: ${done}/${toGenerate.length}`)
      }
    })

    const genResult = await runPool(tasks, CONCURRENCY)
    console.log(`\n\n  생성 완료: ${genResult.ok}개 성공 / ${genResult.fail}개 실패`)
  }

  // 업로드: Supabase에 없는 것만 (로컬에 있는 story-*.mp3 전체 업로드)
  console.log('\n📤 Supabase 업로드 시작...')
  const storyFiles = fs.readdirSync(AUDIO_DIR).filter(f => f.startsWith('story-'))
  console.log(`업로드 대상: ${storyFiles.length}개\n`)

  let upDone = 0, upOk = 0, upFail = 0

  const upTasks = storyFiles.map(filename => async () => {
    const buf = fs.readFileSync(path.join(AUDIO_DIR, filename))
    const { error } = await supabase.storage
      .from('audio')
      .upload(filename, buf, { contentType: 'audio/mpeg', upsert: true })
    if (error) throw new Error(error.message)
    upOk++
    upDone++
    if (upDone % 50 === 0 || upDone === storyFiles.length) {
      process.stdout.write(`\r  업로드: ${upDone}/${storyFiles.length}`)
    }
  })

  const upResult = await runPool(upTasks, CONCURRENCY)
  console.log(`\n\n${'='.repeat(50)}`)
  console.log(`✅ 완료: 업로드 ${upResult.ok}개 성공 / ${upResult.fail}개 실패`)
  console.log(`${'='.repeat(50)}`)
}

main().catch(e => { console.error(e); process.exit(1) })
