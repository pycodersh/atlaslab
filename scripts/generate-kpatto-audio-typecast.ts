/**
 * K-PATTO 대사 음성 — Typecast (ssfm-v30) 일괄 생성 · 업로드 · DB 연결
 *
 * 말풍선(kp_bubbles, 앱이 실제로 보여 주는 대사) 단위로 만든다.
 *   파일   audio/typecast/epXX/epXX_NN_speaker.mp3   (로컬 사본, NN = 화 안에서 말풍선 순서)
 *   업로드 Supabase Storage  audio/dialogues-typecast/epXX/epXX_NN_speaker.mp3
 *   DB     kp_bubbles.audio_url, 연결된 kp_dialogues.audio_url (+ audio_hash = 'tc-…')
 * 기존 Gemini 음성 URL 은 바꾸기 전에 audio/typecast/backup-<시각>.json 에 남긴다(되돌리기용).
 * Gemini 스크립트는 dialogues-typecast URL 이 붙은 대사를 --force 없이는 건드리지 않는다.
 *
 * 배역(2026-10-28 확정) — 단역은 화 · 대사별로 따로 정한다(OVERRIDES).
 * 키: ../shortform-studio/.env 의 TYPECAST_API_KEY (끝 4자리만 출력). Lite 플랜 동시 요청 5개.
 *
 * 실행:
 *   npx tsx scripts/generate-kpatto-audio-typecast.ts --from 1 --to 30 --dry-run   (생성 없이 배역 · 글자 수만)
 *   npx tsx scripts/generate-kpatto-audio-typecast.ts --from 1 --to 30
 * 문구 · 목소리가 그대로인 줄(대사 audio_hash 일치)은 건너뛴다 — 배역을 바꾸고 다시 돌리면 그 줄만 새로 만든다.
 * 다시 만든 파일은 같은 경로에 덮어쓰고 URL 에 ?v= 를 붙여 캐시를 피한다. --force 는 전부 다시 만든다.
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { createHash } from 'crypto'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

import { createClient } from '@supabase/supabase-js'

const argv = process.argv.slice(2)
const arg = (name: string, def: number) => { const i = argv.indexOf(name); return i >= 0 ? parseInt(argv[i + 1]) : def }
const FROM = arg('--from', 1), TO = arg('--to', FROM), CONCURRENCY = arg('--concurrency', 5)
const DRY = argv.includes('--dry-run'), FORCE = argv.includes('--force')

const MODEL = 'ssfm-v30'
const API = 'https://api.typecast.ai'
const BUCKET = 'audio'
const LOCAL = path.resolve(process.cwd(), 'audio', 'typecast')

const V = {
  Moonjung: 'tc_68f9c6a72f0f04a417bb136f',  // Emma
  Eunkyung: 'tc_6a7446c19f2d7dfed990a900',  // Jisu (은경)
  Hyemin:   'tc_667ce80314cb3a612d6959e8',  // Sophie
  Igyeom:   'tc_67bfd35fda120cfcc76b9cb9',  // Minjun (이겸)
  Yumi:     'tc_65e96ab52564d1136ecb1d67',  // 젊은 여성 점원 · 약사 · 간호사 / 안내방송
  Sooni:    'tc_60ad0841061ee28740ec2e1c',  // 시장 할머니
  Siwon:    'tc_62849c0bb958a8ed96096c1c',  // ep2 젊은 남자 행인
  Byunghun: 'tc_694395d43f2c8d9d43e9a897',  // ep14 중년 남자 행인 · ep7 남자 상인 (병훈 — Sangdo 발음이 어색해 교체)
  Jiseon:   'tc_6a4f2130d153a5cac8e19996',  // 교수(ep10) · 30대 직원(ep8)
  Jinwoo:   'tc_632293f759d649937b97f323',  // 의사
  Taewoo:   'tc_6800a387534948f191cc952b',  // 학생(ep10)
} as const
type VoiceName = keyof typeof V

const BY_SPEAKER: Record<string, VoiceName> = {
  emma: 'Moonjung', jisu: 'Eunkyung', sophie: 'Hyemin', minjun: 'Igyeom',
  clerk: 'Yumi', pharmacist: 'Yumi', nurse: 'Yumi', staff: 'Yumi',
  merchant_f: 'Sooni', stranger: 'Siwon',
  professor: 'Jiseon', doctor: 'Jinwoo', student: 'Taewoo', announcement: 'Yumi',
}
/** 화 · 대사별 예외 — 그림 속 인물에 맞춘다. text 가 있으면 그 대사만. */
const OVERRIDES: { ep: number; speaker: string; text?: string; voice: VoiceName }[] = [
  { ep: 14, speaker: 'stranger', voice: 'Byunghun' },                                   // 모자 쓴 중년 남자
  { ep: 8,  speaker: 'staff',    voice: 'Jiseon' },                                     // 30대 화장품 가게 직원
  { ep: 7,  speaker: 'merchant_f', text: '만 원이야. 싸게 주는 거야.', voice: 'Byunghun' }, // 4컷 남자 상인이 민준과 흥정
  { ep: 7,  speaker: 'merchant_f', text: '하하, 그럼 팔천 원!',        voice: 'Byunghun' },
]

function voiceFor(ep: number, speaker: string, text: string): VoiceName | null {
  const o = OVERRIDES.find(x => x.ep === ep && x.speaker === speaker && (!x.text || x.text === text))
  return o?.voice ?? BY_SPEAKER[speaker] ?? null
}

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
  const r = await fetch(`${API}/v1/users/me/subscription`, { headers: H })
  const d = await r.json() as { plan: string; credits: { plan_credits: number; used_credits: number } }
  return { plan: d.plan, used: d.credits.used_credits, total: d.credits.plan_credits }
}

async function synth(voiceId: string, text: string): Promise<Buffer> {
  const body = {
    voice_id: voiceId, text, model: MODEL, language: 'kor',
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

type Job = { ep: number; idx: number; bubbleId: number; dialogueId: number | null; speaker: string; text: string; voice: VoiceName; file: string; storagePath: string; currentUrl: string | null }

/** 문구 · 목소리 · 설정이 같으면 같은 값 — 대사의 audio_hash 로 남겨, 다시 돌릴 때 바뀐 줄만 새로 만든다. */
const audioHash = (text: string, voice: VoiceName) =>
  'tc-' + createHash('sha256').update(`${text}|${voice}|1.0|normal`, 'utf8').digest('hex').slice(0, 13)

async function main() {
  if (!new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.startsWith('eecvvgkihtcgfikaimao')) throw new Error('patto Supabase 가 아니다 — 중단')

  const { data: bubbles, error } = await sb.from('kp_bubbles')
    .select('id, episode_id, speaker, korean, dialogue_id, audio_url').gte('episode_id', FROM).lte('episode_id', TO).order('id')
  if (error) throw new Error(error.message)
  const dIds = bubbles!.map(b => b.dialogue_id).filter(Boolean) as number[]
  const { data: linked } = dIds.length ? await sb.from('kp_dialogues').select('id, text_ko').in('id', dIds) : { data: [] }
  const linkedText = new Map((linked ?? []).map(d => [d.id, d.text_ko as string]))

  const jobs: Job[] = []; const unmapped: string[] = []
  const perEp = new Map<number, number>()
  for (const b of bubbles!) {
    const idx = (perEp.get(b.episode_id) ?? 0) + 1; perEp.set(b.episode_id, idx)
    const text = (b.dialogue_id != null ? linkedText.get(b.dialogue_id) : undefined) ?? b.korean   // 앱이 보여 주는 문구
    const voice = voiceFor(b.episode_id, b.speaker, text)
    if (!voice) { unmapped.push(`ep${b.episode_id} #${idx} ${b.speaker}`); continue }
    const ep2 = String(b.episode_id).padStart(2, '0'), name = `ep${ep2}_${String(idx).padStart(2, '0')}_${b.speaker}.mp3`
    jobs.push({ ep: b.episode_id, idx, bubbleId: b.id, dialogueId: b.dialogue_id, speaker: b.speaker, text, voice,
      file: path.join(LOCAL, `ep${ep2}`, name), storagePath: `dialogues-typecast/ep${ep2}/${name}`, currentUrl: b.audio_url })
  }

  const chars = jobs.reduce((s, j) => s + j.text.length, 0)
  const cast = new Map<string, number>(); for (const j of jobs) cast.set(`${j.speaker}→${j.voice}`, (cast.get(`${j.speaker}→${j.voice}`) ?? 0) + 1)
  const c0 = await credits()
  console.log(`엔진: Typecast | Model: ${MODEL} | 키: TYPECAST_API_KEY(…${KEY.slice(-4)}) | 플랜 ${c0.plan} ${c0.used.toLocaleString()}/${c0.total.toLocaleString()}`)
  console.log(`범위: EP${FROM}–${TO} | 말풍선 ${jobs.length}개 · ${chars.toLocaleString()}자 | 동시 ${CONCURRENCY} | tempo 1.0 · normal`)
  console.log('배역: ' + [...cast].map(([k, n]) => `${k} ${n}`).join(', '))
  if (unmapped.length) { console.log(`✗ 배역 없는 화자 ${unmapped.length}개 — 중단: ${unmapped.join(', ')}`); process.exit(1) }
  if (chars > c0.total - c0.used) { console.log('✗ 남은 크레딧이 모자란다 — 중단'); process.exit(1) }

  const { data: dlgNow } = await sb.from('kp_dialogues').select('id, episode_id, text_ko, audio_url, audio_hash').gte('episode_id', FROM).lte('episode_id', TO)
  const dlgByEpText = new Map<string, number[]>()
  for (const d of dlgNow ?? []) { const k = `${d.episode_id}|${d.text_ko}`; dlgByEpText.set(k, [...(dlgByEpText.get(k) ?? []), d.id]) }
  const dlgHash = new Map((dlgNow ?? []).map(d => [d.id, d.audio_hash as string | null]))
  // 대사: 연결된 것, 없으면 같은 화 · 같은 문구의 대사(하나일 때만)
  const targetsOf = (j: Job) => j.dialogueId != null ? [j.dialogueId] : (dlgByEpText.get(`${j.ep}|${j.text}`) ?? [])
  // 이미 같은 문구 · 목소리로 만든 줄은 건너뛴다(대사 행이 없으면 같은 파일 · URL 이 있을 때)
  const upToDate = (j: Job) => {
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(j.storagePath).data.publicUrl
    if (j.currentUrl?.split('?')[0] !== publicUrl || !fs.existsSync(j.file)) return false
    const t = targetsOf(j)
    return t.length === 1 ? dlgHash.get(t[0]) === audioHash(j.text, j.voice) : true
  }
  const todo = FORCE ? jobs : jobs.filter(j => !upToDate(j))
  console.log(`새로 만들 줄: ${todo.length} (${todo.reduce((s, j) => s + j.text.length, 0).toLocaleString()}자)` +
    (todo.length && todo.length < 20 ? '\n  ' + todo.map(j => `ep${j.ep} #${j.idx} ${j.speaker}→${j.voice} "${j.text}"`).join('\n  ') : ''))
  if (DRY) return

  // 되돌리기용: 지금 연결된 음성 URL
  fs.mkdirSync(LOCAL, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  fs.writeFileSync(path.join(LOCAL, `backup-ep${FROM}-${TO}-${stamp}.json`), JSON.stringify({ bubbles: bubbles!.map(b => ({ id: b.id, audio_url: b.audio_url })), dialogues: dlgNow }, null, 1))

  let done = 0, made = 0
  const skipped = jobs.length - todo.length
  const failed: string[] = []
  const queue = [...todo]
  async function worker() {
    for (let j = queue.shift(); j; j = queue.shift()) {
      const label = `ep${String(j.ep).padStart(2, '0')} #${String(j.idx).padStart(2, '0')} ${j.speaker}(${j.voice})`
      try {
        const hash = audioHash(j.text, j.voice)
        // 같은 경로에 덮어쓰므로 ?v= 로 주소를 바꿔 브라우저 · CDN 캐시의 옛 음성이 나오지 않게 한다
        const publicUrl = sb.storage.from(BUCKET).getPublicUrl(j.storagePath).data.publicUrl + `?v=${hash.slice(3, 11)}`
        const buf = await synth(V[j.voice], j.text)
        fs.mkdirSync(path.dirname(j.file), { recursive: true }); fs.writeFileSync(j.file, buf)
        const { error: upErr } = await sb.storage.from(BUCKET).upload(j.storagePath, buf, { contentType: 'audio/mpeg', upsert: true })
        if (upErr) throw new Error(`업로드 실패: ${upErr.message}`)
        const { error: bErr } = await sb.from('kp_bubbles').update({ audio_url: publicUrl }).eq('id', j.bubbleId)
        if (bErr) throw new Error(`kp_bubbles: ${bErr.message}`)
        const targets = targetsOf(j)
        if (targets.length === 1) {
          const { error: dErr } = await sb.from('kp_dialogues').update({ audio_url: publicUrl, audio_hash: hash }).eq('id', targets[0])
          if (dErr) throw new Error(`kp_dialogues: ${dErr.message}`)
        }
        made++
        console.log(`  ✓ ${label} ${buf.length.toLocaleString()}B "${j.text}"${targets.length === 1 ? '' : `  (대사 행 ${targets.length}개 — 말풍선만 연결)`}`)
      } catch (e) {
        failed.push(`${label}: ${(e as Error).message}`)
        console.log(`  ✗ ${label} ${(e as Error).message}`)
      } finally {
        if (++done % 50 === 0) console.log(`── ${done}/${todo.length}`)
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  await new Promise(res => setTimeout(res, 5000))   // 크레딧 집계가 몇 초 늦다
  const c1 = await credits()
  console.log(`\n완료: 생성 ${made} · 건너뜀 ${skipped} · 실패 ${failed.length} / ${jobs.length}`)
  console.log(`크레딧 ${c0.used.toLocaleString()} → ${c1.used.toLocaleString()} (차감 ${(c1.used - c0.used).toLocaleString()}) | 잔여 ${(c1.total - c1.used).toLocaleString()}`)
  if (failed.length) { console.log('실패 목록:\n  ' + failed.join('\n  ')); process.exit(1) }
}

main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
