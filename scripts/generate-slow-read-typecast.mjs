/**
 * 「Korean Slow Read-Along」 릴스 음성 — Typecast ssfm-v30, 항목 하나당 mp3 하나.
 *
 *   입력  remotion/SlowRead/readalong.json   { <id>: { items: [{ ko, ... }] } }
 *   출력  public/audio/slow-read/<id>/NN.mp3
 *         remotion/SlowRead/audio.generated.json  { <id>: [{ file, total, start, end }] }  (초, ffmpeg silencedetect -45dB)
 *   키    ../shortform-studio/.env 의 TYPECAST_API_KEY (patto/.env.local 에는 없다)
 *
 * 파일이 이미 있으면 다시 사지 않고 길이만 다시 잰다(--force 로 재생성).
 * 실행: node scripts/generate-slow-read-typecast.mjs [--dry-run] [--force] [id ...]
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const args = process.argv.slice(2)
const DRY = args.includes('--dry-run')
const FORCE = args.includes('--force')
const only = args.filter(a => !a.startsWith('--'))

const MODEL = 'ssfm-v30'
const VOICE = { name: 'Hyunmin', id: 'tc_627ae61ffdf53ef0bb6902cd' }
const TEMPO = 0.88
const API = 'https://api.typecast.ai'

function typecastKey() {
  const env = path.resolve(root, '..', 'shortform-studio', '.env')
  for (const line of fs.readFileSync(env, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*TYPECAST_API_KEY\s*=\s*["']?([^"'\s]+)/)
    if (m) return m[1]
  }
  throw new Error('TYPECAST_API_KEY 없음 (shortform-studio/.env)')
}

const pkgs = path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages')
let FF = 'ffmpeg'
for (const d of fs.existsSync(pkgs) ? fs.readdirSync(pkgs).filter(d => d.startsWith('Gyan.FFmpeg')) : [])
  for (const s of fs.readdirSync(path.join(pkgs, d))) { const e = path.join(pkgs, d, s, 'bin', 'ffmpeg.exe'); if (fs.existsSync(e)) FF = e }

/** 전체 길이와, 앞뒤 무음을 뺀 실제 말소리 구간 */
function measure(file) {
  const log = spawnSync(FF, ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-45dB:d=0.12', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const total = Number(log.match(/Duration: (\d+):(\d+):([\d.]+)/).slice(1).reduce((a, x, i) => a + Number(x) * [3600, 60, 1][i], 0))
  const starts = [...log.matchAll(/silence_start: (-?[\d.]+)/g)].map(m => Math.max(0, Number(m[1])))
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map(m => Number(m[1]))
  let start = 0, end = total
  if (starts.length && starts[0] < 0.02 && ends[0] != null) start = ends[0]
  const lastStart = starts[starts.length - 1]
  if (starts.length && (ends.length < starts.length || ends[ends.length - 1] >= total - 0.05) && lastStart > start) end = lastStart
  return { total: +total.toFixed(3), start: +start.toFixed(3), end: +end.toFixed(3) }
}

async function synth(key, text) {
  const body = {
    voice_id: VOICE.id, text, model: MODEL, language: 'kor',
    prompt: { emotion_type: 'preset', emotion_preset: 'normal', emotion_intensity: 1.0 },
    output: { audio_format: 'mp3', audio_tempo: TEMPO },
  }
  let last = ''
  for (let n = 0; n < 5; n++) {
    const r = await fetch(`${API}/v1/text-to-speech`, { method: 'POST', headers: { 'X-API-KEY': key, 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer())
      if (buf.length > 1000) return buf
      last = 'too small'
    } else {
      last = `${r.status} ${(await r.text()).slice(0, 160)}`
      if (![429, 500, 502, 503].includes(r.status)) break
    }
    await new Promise(res => setTimeout(res, 3000 * (n + 1)))
  }
  throw new Error(last)
}

const data = JSON.parse(fs.readFileSync(path.join(root, 'remotion', 'SlowRead', 'readalong.json'), 'utf8'))
const outJson = path.join(root, 'remotion', 'SlowRead', 'audio.generated.json')
const result = fs.existsSync(outJson) ? JSON.parse(fs.readFileSync(outJson, 'utf8')) : {}
const ids = only.length ? only : Object.keys(data)
const key = typecastKey()
console.log(`engine Typecast ${MODEL} · voice ${VOICE.name} (${VOICE.id}) · tempo ${TEMPO} · key TYPECAST_API_KEY …${key.slice(-4)}`)

for (const id of ids) {
  const dir = path.join(root, 'public', 'audio', 'slow-read', id)
  fs.mkdirSync(dir, { recursive: true })
  const rows = []
  for (const [i, it] of data[id].items.entries()) {
    const name = `${String(i + 1).padStart(2, '0')}.mp3`
    const file = path.join(dir, name)
    const text = `${it.ko}.`
    if (DRY) { console.log(id, name, text); continue }
    if (FORCE || !fs.existsSync(file)) {
      fs.writeFileSync(file, await synth(key, text))
      console.log('made', id, name, text)
    }
    rows.push({ file: `audio/slow-read/${id}/${name}`, ...measure(file) })
  }
  if (!DRY) result[id] = rows
}
if (!DRY) {
  fs.writeFileSync(outJson, JSON.stringify(result, null, 1) + '\n')
  for (const id of ids) console.log(id, result[id].map(r => (r.end - r.start).toFixed(2)).join(' '))
}
