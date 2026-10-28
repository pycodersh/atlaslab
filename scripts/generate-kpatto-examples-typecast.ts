/**
 * K-PATTO 패턴 예문 음성(활성 패턴 300개 × 예문 3개 = 900개) — Typecast 현민(Hyunmin) 보이스로 교체
 *
 * 문장은 DB(kp_expressions.examples[0..2].ko, is_active)에서 바로 읽는다 — 앱이 보여 주는 그대로.
 *   로컬   audio/patterns-typecast/{slug}/exN.mp3
 *   업로드 Supabase Storage  audio/patterns-typecast/{slug}/exN.mp3   (기존 expressions/{slug}/exN.mp3 서현 파일은 그대로 둔다)
 *   DB     kp_expressions.audio_urls 의 ex1~ex3 만 바꾼다(pattern 키는 그대로)
 * 바꾸기 전 audio_urls 전체를 audio/patterns-typecast/backup-<시각>.json 에 남긴다 — 되돌리기는 그 JSON 을 다시 쓰면 된다.
 * 이미 새 URL 이 걸려 있고 로컬 파일이 있는 예문은 건너뛴다(중간에 끊겨도 다시 돌리면 이어진다).
 *
 * 실행:
 *   npx tsx scripts/generate-kpatto-examples-typecast.ts --dry-run
 *   npx tsx scripts/generate-kpatto-examples-typecast.ts
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const DRY = process.argv.includes('--dry-run')
const CONCURRENCY = 5
const MODEL = 'ssfm-v30'
const VOICE = { name: 'Hyunmin', id: 'tc_627ae61ffdf53ef0bb6902cd' }
const API = 'https://api.typecast.ai'
const BUCKET = 'audio'
const PREFIX = 'patterns-typecast'
const LOCAL = path.resolve(process.cwd(), 'audio', PREFIX)

function typecastKey(): string {
  const env = path.resolve(process.cwd(), '..', 'shortform-studio', '.env')
  for (const line of fs.readFileSync(env, 'utf8').replace(/^﻿/, '').split(/\r?\n/)) {
    const m = line.match(/^\s*TYPECAST_API_KEY\s*=\s*["']?([^"'\s]+)/)
    if (m) return m[1]
  }
  throw new Error('TYPECAST_API_KEY 없음 (shortform-studio/.env)')
}
const KEY = typecastKey()
const H = { 'X-API-KEY': KEY, 'User-Agent': 'Mozilla/5.0' }

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

async function credits() {
  const d = await (await fetch(`${API}/v1/users/me/subscription`, { headers: H })).json() as { plan: string; credits: { plan_credits: number; used_credits: number } }
  return { plan: d.plan, used: d.credits.used_credits, total: d.credits.plan_credits }
}

async function synth(text: string): Promise<Buffer> {
  const body = {
    voice_id: VOICE.id, text, model: MODEL, language: 'kor',
    prompt: { emotion_type: 'preset', emotion_preset: 'normal', emotion_intensity: 1.0 },
    output: { audio_format: 'mp3', audio_tempo: 1.0 },
  }
  let last = ''
  for (let n = 0; n < 5; n++) {
    const r = await fetch(`${API}/v1/text-to-speech`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer())
      if (buf.length > 1000) return buf
      last = 'too small'
    } else {
      last = `${r.status} ${(await r.text()).slice(0, 120)}`
      if (![429, 500, 502, 503].includes(r.status)) break
    }
    await new Promise(res => setTimeout(res, 3000 * (n + 1)))
  }
  throw new Error(last)
}

type Row = { id: number; slug: string; examples: { ko: string }[]; audio_urls: Record<string, string | null> | null; first_episode: number | null }
type Job = { row: Row; n: 1 | 2 | 3; text: string; file: string; storagePath: string; url: string }

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')

  const { data, error } = await sb.from('kp_expressions').select('id, slug, examples, audio_urls, first_episode').eq('is_active', true)
  if (error) throw new Error(error.message)
  const rows = (data as Row[]).sort((a, b) => (a.first_episode ?? 1e9) - (b.first_episode ?? 1e9) || a.id - b.id)

  const jobs: Job[] = []
  for (const row of rows) {
    if (!row.slug) throw new Error(`#${row.id} slug 없음`)
    row.examples.slice(0, 3).forEach((e, i) => {
      const n = (i + 1) as 1 | 2 | 3
      const storagePath = `${PREFIX}/${row.slug}/ex${n}.mp3`
      jobs.push({ row, n, text: e.ko, file: path.join(LOCAL, row.slug, `ex${n}.mp3`), storagePath,
        url: sb.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl })
    })
  }
  const todo = jobs.filter(j => !(j.row.audio_urls?.[`ex${j.n}`] === j.url && fs.existsSync(j.file)))
  const chars = jobs.reduce((s, j) => s + j.text.length, 0), todoChars = todo.reduce((s, j) => s + j.text.length, 0)
  const c0 = await credits()
  console.log(`엔진: Typecast | Model: ${MODEL} | 키: TYPECAST_API_KEY(…${KEY.slice(-4)}) | 플랜 ${c0.plan} ${c0.used.toLocaleString()}/${c0.total.toLocaleString()}`)
  console.log(`범위: 활성 패턴 ${rows.length}개 × 예문 3 = ${jobs.length}문장 · ${chars.toLocaleString()}자 | 목소리 ${VOICE.name}(${VOICE.id}) | 동시 ${CONCURRENCY}`)
  console.log(`새로 만들 문장: ${todo.length} (${todoChars.toLocaleString()}자)`)
  if (todoChars > c0.total - c0.used) { console.log('✗ 남은 크레딧이 모자란다 — 중단'); process.exit(1) }
  if (DRY) return

  fs.mkdirSync(LOCAL, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  fs.writeFileSync(path.join(LOCAL, `backup-${stamp}.json`), JSON.stringify(rows.map(r => ({ id: r.id, slug: r.slug, audio_urls: r.audio_urls })), null, 1))

  // 패턴 하나의 ex1~3 을 다 만든 뒤 audio_urls 를 한 번에 갱신한다(동시에 같은 행을 고치지 않게)
  const byRow = new Map<number, Job[]>()
  for (const j of todo) byRow.set(j.row.id, [...(byRow.get(j.row.id) ?? []), j])
  const queue = [...byRow.values()]
  let done = 0, made = 0
  const failed: string[] = []
  async function worker() {
    for (let group = queue.shift(); group; group = queue.shift()) {
      const row = group[0].row
      const next = { ...(row.audio_urls ?? {}) }
      for (const j of group) {
        try {
          const buf = await synth(j.text)
          fs.mkdirSync(path.dirname(j.file), { recursive: true }); fs.writeFileSync(j.file, buf)
          const { error: upErr } = await sb.storage.from(BUCKET).upload(j.storagePath, buf, { contentType: 'audio/mpeg', upsert: true })
          if (upErr) throw new Error(`업로드 실패: ${upErr.message}`)
          next[`ex${j.n}`] = j.url
          made++
        } catch (e) {
          failed.push(`${row.slug}/ex${j.n}: ${(e as Error).message}`)
          console.log(`  ✗ ${row.slug}/ex${j.n} ${(e as Error).message}`)
        }
        if (++done % 50 === 0) {
          const pct = Math.round(done / todo.length * 100)
          console.log(`── [${'█'.repeat(Math.round(pct / 5)).padEnd(20, '·')}] ${done}/${todo.length} (${pct}%) 실패 ${failed.length}`)
        }
      }
      const { error: dErr } = await sb.from('kp_expressions').update({ audio_urls: next }).eq('id', row.id)
      if (dErr) failed.push(`#${row.id} audio_urls 갱신 실패: ${dErr.message}`)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  await new Promise(res => setTimeout(res, 5000))   // 크레딧 집계가 몇 초 늦다
  const c1 = await credits()
  console.log(`\n완료: 생성 ${made} · 건너뜀 ${jobs.length - todo.length} · 실패 ${failed.length} / ${jobs.length}`)
  console.log(`크레딧 ${c0.used.toLocaleString()} → ${c1.used.toLocaleString()} (차감 ${(c1.used - c0.used).toLocaleString()}) | 잔여 ${(c1.total - c1.used).toLocaleString()}`)
  if (failed.length) { console.log('실패 목록:\n  ' + failed.join('\n  ')); process.exit(1) }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
