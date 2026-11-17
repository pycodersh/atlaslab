/**
 * Basics 영상 메인 트랙에서 말소리가 나는 구간을 뽑는다 → remotion/KoreanBasic/speech.generated.json { slug: [[시작초, 끝초], ...] }
 * 플레이어의 Sound 안내가 이 구간에만 이퀄라이저를 움직인다. ffmpeg silencedetect(-40dB, 0.25초 이상 무음)의 반대 구간이다.
 * 상황 장면 대사는 line-audio.generated.json 의 길이로 플레이어가 따로 더한다.
 * 실행: node scripts/basics-speech-intervals.mjs   (오디오를 다시 만들면 다시 돌린다)
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'

const root = process.cwd()
const pkgs = path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages')
let FF = 'ffmpeg'
for (const d of fs.existsSync(pkgs) ? fs.readdirSync(pkgs).filter(d => d.startsWith('Gyan.FFmpeg')) : [])
  for (const s of fs.readdirSync(path.join(pkgs, d))) { const e = path.join(pkgs, d, s, 'bin', 'ffmpeg.exe'); if (fs.existsSync(e)) FF = e }

const videos = JSON.parse(fs.readFileSync(path.join(root, 'remotion', 'KoreanBasic', 'videos.json'), 'utf8'))
const out = {}
for (const [slug, v] of Object.entries(videos)) {
  const file = path.join(root, 'public', v.audio)
  const r = spawnSync(FF, ['-hide_banner', '-i', file, '-af', 'silencedetect=noise=-40dB:d=0.25', '-f', 'null', '-'], { encoding: 'utf8' })
  const log = r.stderr
  const total = Number(log.match(/Duration: (\d+):(\d+):([\d.]+)/).slice(1).reduce((a, x, i) => a + Number(x) * [3600, 60, 1][i], 0))
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map(m => Number(m[1]))
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map(m => Number(m[1]))
  const segs = []
  let cur = 0
  for (let i = 0; i < starts.length; i++) {
    if (starts[i] - cur > 0.05) segs.push([+cur.toFixed(2), +starts[i].toFixed(2)])
    cur = ends[i] ?? total
  }
  if (total - cur > 0.05) segs.push([+cur.toFixed(2), +total.toFixed(2)])
  out[slug] = segs
}
fs.writeFileSync(path.join(root, 'remotion', 'KoreanBasic', 'speech.generated.json'), JSON.stringify(out) + '\n')
console.log(Object.keys(out).length, JSON.stringify(out['korean-because-aseo-vs-euni-kka']))
