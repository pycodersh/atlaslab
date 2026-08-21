/**
 * 릴스 보이스오버 생성 — OpenAI gpt-4o-mini-tts
 *
 * 대상: "이거 / 저거 / 그거" 릴스 (Scene 1~5) + 한국어 문구 단독 클립
 * 출력: reels-audio/{slug}/*.mp3  — 로컬 파일만, DB·Storage 갱신 없음
 *
 * 사용: npx tsx scripts/generate-reels-vo.ts [--voice sage] [--dry-run]
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import OpenAI from 'openai'

const MODEL = 'gpt-4o-mini-tts'

const argv = process.argv.slice(2)
const DRY_RUN = argv.includes('--dry-run')
const VOICE = (() => { const i = argv.indexOf('--voice'); return i >= 0 ? (argv[i + 1] ?? 'sage') : 'sage' })()
/** --say "Great job!" [--out great-job] : 한 줄만 같은 목소리·톤으로 추가 생성 */
const SAY = (() => { const i = argv.indexOf('--say'); return i >= 0 ? (argv[i + 1] ?? '') : '' })()
const OUT_NAME = (() => { const i = argv.indexOf('--out'); return i >= 0 ? (argv[i + 1] ?? '') : '' })()

// 영어 내레이션: 소셜 릴스 톤 — 밝고 또렷하게, 너무 빠르지 않게
const INSTR_VO = 'Speak like a friendly, upbeat language teacher narrating a short social media reel. Clear and energetic, warm but not shouty. Keep a steady, easy-to-follow pace. Pronounce the Korean phrases carefully and distinctly.'
// 한국어 단독 클립: 앱 표현 음성과 같은 규칙
const INSTR_KO = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone. Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner. This is a question — raise the pitch clearly at the end.'

const CTA = 'Master three hundred plus Korean expressions just like this. Check the link in bio!'

type Clip = { file: string; label: string; text: string }
type Reel = { slug: string; title: string; scenes: Clip[]; ko: Clip[] }

const REELS: Reel[] = [
  {
    slug: 'igeo-jeogeo-geugeo',
    title: '이거 / 저거 / 그거',
    scenes: [
      { file: 'scene1-hook',   label: 'Scene 1 (Hook)', text: "Today's expression! How do you ask, \"What is this?\" in Korean?" },
      { file: 'scene2-igeo',   label: 'Scene 2 (이거)', text: 'When something is close to you, you say: 이거 뭐예요?' },
      { file: 'scene3-jeogeo', label: 'Scene 3 (저거)', text: 'When something is far away, you say: 저거 뭐예요?' },
      { file: 'scene4-geugeo', label: 'Scene 4 (그거)', text: "And when it's near the other person, or already mentioned, you say: 그거 뭐예요?" },
      { file: 'scene5-cta',    label: 'Scene 5 (CTA)',  text: CTA },
    ],
    ko: [
      { file: 'ko-pattern', label: '패턴', text: '뭐예요?' },
      { file: 'ko-igeo',    label: '이거', text: '이거 뭐예요?' },
      { file: 'ko-jeogeo',  label: '저거', text: '저거 뭐예요?' },
      { file: 'ko-geugeo',  label: '그거', text: '그거 뭐예요?' },
    ],
  },
  {
    slug: 'cafe-isseoyo',
    title: '카페 필수 생존 표현 (있어요?)',
    scenes: [
      { file: 'scene1-hook',      label: 'Scene 1 (Hook)',   text: "Traveling or visiting a cafe in Korea? Let's learn essential expressions!" },
      { file: 'scene2-jari',      label: 'Scene 2 (자리)',   text: 'First, when you look for a table, you can ask: 자리 있어요?' },
      { file: 'scene3-hwajangsil', label: 'Scene 3 (화장실)', text: 'Need to find the restroom? You say: 화장실 있어요?' },
      { file: 'scene4-wifi',      label: 'Scene 4 (와이파이)', text: 'And looking for internet? Ask: 와이파이 있어요?' },
      { file: 'scene5-cta',       label: 'Scene 5 (CTA)',    text: CTA },
    ],
    ko: [
      { file: 'ko-pattern',     label: '패턴',   text: '있어요?' },
      { file: 'ko-jari',        label: '자리',   text: '자리 있어요?' },
      { file: 'ko-hwajangsil',  label: '화장실', text: '화장실 있어요?' },
      { file: 'ko-wifi',        label: '와이파이', text: '와이파이 있어요?' },
    ],
  },
]

const REEL = (() => {
  const i = argv.indexOf('--reel')
  const slug = i >= 0 ? argv[i + 1] : REELS[0].slug
  const found = REELS.find(r => r.slug === slug)
  if (!found) {
    console.error(`--reel "${slug}" 을(를) 찾을 수 없습니다. 사용 가능: ${REELS.map(r => r.slug).join(', ')}`)
    process.exit(1)
  }
  return found
})()

const SLUG    = REEL.slug
const OUT     = path.resolve(process.cwd(), 'reels-audio', SLUG)
const SCENES  = REEL.scenes.map(s => ({ ...s, instructions: INSTR_VO }))
const KO_CLIPS = REEL.ko

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── MP3 길이 ──────────────────────────────────────────────────────────────────
const B1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
const B2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
const R1 = [44100,48000,32000], R2 = [22050,24000,16000], R25 = [11025,12000,8000]
function mp3Seconds(buf: Buffer): number {
  let i = 0
  if (buf.toString('ascii', 0, 3) === 'ID3' && buf.length > 10)
    i = 10 + (((buf[6]&0x7f)<<21)|((buf[7]&0x7f)<<14)|((buf[8]&0x7f)<<7)|(buf[9]&0x7f))
  let sec = 0
  while (i + 4 <= buf.length) {
    if (buf[i] !== 0xff || (buf[i+1] & 0xe0) !== 0xe0) { i++; continue }
    const ver=(buf[i+1]>>3)&3, layer=(buf[i+1]>>1)&3, br=(buf[i+2]>>4)&15, sr=(buf[i+2]>>2)&3, pad=(buf[i+2]>>1)&1
    if (layer!==1||ver===1||br===0||br===15||sr===3) { i++; continue }
    const isV1=ver===3, bitrate=(isV1?B1[br]:B2[br])*1000
    const rate=(ver===3?R1:ver===2?R2:R25)[sr], samples=isV1?1152:576
    const len=Math.floor((samples/8)*bitrate/rate)+pad
    if (len<=4) { i++; continue }
    sec += samples/rate; i += len
  }
  return sec
}

async function tts(text: string, instructions: string): Promise<Buffer> {
  const res = await openai.audio.speech.create({
    model: MODEL, voice: VOICE, input: text, instructions, response_format: 'mp3',
  })
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length === 0) throw new Error('TTS 응답 0바이트')
  return buf
}

async function main() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY 없음')

  console.log(`\n=== 릴스 보이스오버 생성 — ${REEL.title} ===`)
  console.log(`엔진: OpenAI  |  모델: ${MODEL}  |  목소리: ${VOICE}`)
  console.log(`키: OPENAI_API_KEY(…${(process.env.OPENAI_API_KEY ?? '').slice(-4)})`)
  console.log(`대상: 내레이션 ${SCENES.length}개 + 한국어 단독 ${KO_CLIPS.length}개 = ${SCENES.length + KO_CLIPS.length}파일`)
  console.log(`출력: ${OUT}`)
  console.log(`DB·Storage 갱신: 없음 (로컬 파일만)\n`)

  if (DRY_RUN) {
    for (const s of [...SCENES, ...KO_CLIPS]) console.log(`  ${s.file.padEnd(16)} "${s.text}"`)
    console.log('\n--dry-run: 호출하지 않고 종료')
    return
  }

  fs.mkdirSync(OUT, { recursive: true })

  // --say: 한 줄만 같은 목소리·톤으로 추가 생성하고 종료
  if (SAY) {
    const name = OUT_NAME || SAY.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
    const buf = await tts(SAY, INSTR_VO)
    const sec = mp3Seconds(buf)
    const file = path.join(OUT, `${name}.mp3`)
    fs.writeFileSync(file, buf)
    console.log(`▶ 단일 클립`)
    console.log(`  "${SAY}"`)
    console.log(`  ${name}.mp3  ${sec.toFixed(2)}s  ${(buf.length / 1024).toFixed(1)}KB`)
    console.log(`  → ${file}`)
    return
  }
  const rows: Array<{ file: string; label: string; text: string; sec: number; kb: number }> = []

  console.log('▶ 영어 내레이션')
  for (const s of SCENES) {
    const buf = await tts(s.text, s.instructions)
    const sec = mp3Seconds(buf)
    fs.writeFileSync(path.join(OUT, `${s.file}.mp3`), buf)
    rows.push({ file: `${s.file}.mp3`, label: s.label, text: s.text, sec, kb: buf.length / 1024 })
    console.log(`  ${s.file.padEnd(16)} ${sec.toFixed(2)}s  ${(buf.length / 1024).toFixed(1)}KB`)
  }

  console.log('\n▶ 한국어 단독 클립 (인라인 한국어 대체용)')
  for (const k of KO_CLIPS) {
    const buf = await tts(k.text, INSTR_KO)
    const sec = mp3Seconds(buf)
    fs.writeFileSync(path.join(OUT, `${k.file}.mp3`), buf)
    rows.push({ file: `${k.file}.mp3`, label: k.label, text: k.text, sec, kb: buf.length / 1024 })
    console.log(`  ${k.file.padEnd(16)} ${sec.toFixed(2)}s  ${(buf.length / 1024).toFixed(1)}KB  "${k.text}"`)
  }

  // 타임라인 참고용 시트
  const total = rows.slice(0, SCENES.length).reduce((s, r) => s + r.sec, 0)
  let cursor = 0
  const lines = ['scene,file,start,end,duration,text']
  for (const r of rows.slice(0, SCENES.length)) {
    lines.push(`${r.label},${r.file},${cursor.toFixed(2)},${(cursor + r.sec).toFixed(2)},${r.sec.toFixed(2)},"${r.text.replace(/"/g, '""')}"`)
    cursor += r.sec
  }
  fs.writeFileSync(path.join(OUT, 'timeline.csv'), lines.join('\n'))

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`생성 ${rows.length}파일 · 0바이트 ${rows.filter(r => r.kb === 0).length}건`)
  console.log(`내레이션 총 길이(장면 5개 연속 재생 기준): ${total.toFixed(2)}초`)
  console.log(`타임라인 시트 → ${path.join(OUT, 'timeline.csv')}`)
  const chars = rows.reduce((s, r) => s + r.text.length, 0)
  console.log(`문자수 ${chars}자 → 약 $${(chars * 12 / 1_000_000).toFixed(4)}`)
}

main().catch(e => { console.error('\n⛔ [중단]', e?.stack ?? e); process.exit(1) })
