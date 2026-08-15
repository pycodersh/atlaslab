/**
 * 짧은 패턴 길이 측정 프로브 (로컬 파일만, Storage·DB 미변경)
 * 지정 instructions가 2~3자 패턴을 1.5~2.5초에 넣을 수 있는지 확인
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const OUT = path.resolve(process.cwd(), 'audio-test', 'probe')

const B1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0]
const B2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]
const R1 = [44100,48000,32000], R2 = [22050,24000,16000], R25 = [11025,12000,8000]
function dur(buf: Buffer): number {
  let i = 0
  if (buf.toString('ascii', 0, 3) === 'ID3') i = 10 + (((buf[6]&0x7f)<<21)|((buf[7]&0x7f)<<14)|((buf[8]&0x7f)<<7)|(buf[9]&0x7f))
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

const SPEC   = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone. Speak slowly.'
const STRONG = 'Speak like a female Korean announcer. Clear and articulate, slightly bright tone. Speak very slowly, enunciating each syllable distinctly, as if teaching a beginner.'

const VARIANTS = [
  { name: 'A. 지정 instructions',            instructions: SPEC,   speed: undefined },
  { name: 'B. 지정 + speed 0.8',             instructions: SPEC,   speed: 0.8 },
  { name: 'C. 강한 instructions',            instructions: STRONG, speed: undefined },
  { name: 'D. 강한 instructions + speed 0.85', instructions: STRONG, speed: 0.85 },
]
const TEXTS = ['주세요', '으로', '밖에']

async function main() {
  fs.mkdirSync(OUT, { recursive: true })
  console.log(`모델 gpt-4o-mini-tts · 목소리 sage · 목표 1.5~2.5초\n`)
  for (const v of VARIANTS) {
    const durs: number[] = []
    console.log(`${v.name}${v.speed ? ` (speed=${v.speed})` : ''}`)
    for (const text of TEXTS) {
      const params: Record<string, unknown> = {
        model: 'gpt-4o-mini-tts', voice: 'sage', input: text,
        instructions: v.instructions, response_format: 'mp3',
      }
      if (v.speed !== undefined) params.speed = v.speed
      let buf: Buffer
      try {
        const res = await openai.audio.speech.create(params as never)
        buf = Buffer.from(await res.arrayBuffer())
      } catch (e: any) {
        console.log(`  ${text.padEnd(5)} ⛔ ${e?.status ?? ''} ${String(e?.message ?? e).slice(0, 160)}`)
        continue
      }
      const d = dur(buf)
      durs.push(d)
      const tag = v.name[0]
      fs.writeFileSync(path.join(OUT, `${tag}-${text}.mp3`), buf)
      const ok = d >= 1.5 && d <= 2.5
      console.log(`  ${text.padEnd(5)} ${d.toFixed(2)}s  ${(text.length / d).toFixed(2)}자/초  ${ok ? '✓ 범위내' : d < 1.5 ? '✗ 너무 빠름' : '✗ 너무 느림'}`)
    }
    if (durs.length) console.log(`  → 평균 ${(durs.reduce((a, b) => a + b, 0) / durs.length).toFixed(2)}s, 범위내 ${durs.filter(d => d >= 1.5 && d <= 2.5).length}/${durs.length}\n`)
    else console.log('')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
