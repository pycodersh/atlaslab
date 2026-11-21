/**
 * Basics 캐릭터 에셋 — 손그림 캐릭터 시트 한 장(남녀 × confused · happy · curious 6명)을 잘라 배경을 투명하게 만든다.
 *
 *   입력  assets/characters/character-sheet.png  (가로로 6명: A confused · B confused · A happy · B happy · A curious · B curious)
 *   출력  public/images/characters/{a|b}-{confused|happy|curious}.png  (투명 배경, 높이 1000px)
 *         public/images/characters/(확인용 미리보기는 out/remotion/characters-preview.png)
 *
 * 배경 지우기: 종이색(시트 네 귀퉁이 평균)과 가까운 픽셀을 가장자리에서부터 채워 나가며(flood fill) 배경으로 본다.
 *   흐린 연필선 사이 틈으로 옷 · 얼굴 안쪽까지 새지 않게, 옅은 선까지 반경 WALL_R 로 크게 부풀린 '벽'을 만들고 그 벽을 넘지 않게 채운 뒤
 *   SHRINK 만큼 다시 깎는다(모폴로지 닫기). 선 바깥에 몇 px 종이 테두리가 남아 스티커처럼 붙는다.
 *   그 뒤 실루엣 가장자리를 1px 부드럽게 해 크림 배경 위에서 계단이 지지 않게 한다.
 *   옆 사람의 손끝처럼 잘린 조각(자르기 경계에 닿은 작은 덩어리)은 지운다.
 *   실루엣 안쪽 종이색은 사이트 크림(#F7F5F2)으로 살짝 맞춰 카드 · 영상 배경과 이어지게 한다.
 *
 * 시트를 바꾸면 BOXES(원본 픽셀 기준 x 범위)만 고치면 된다.
 * 실행: node scripts/basics-character-assets.mjs [시트 경로]
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const SRC = process.argv[2] ?? path.join(root, 'assets', 'characters', 'character-sheet.png')
const OUT = path.join(root, 'public', 'images', 'characters')
/** 원본 3692×1120 기준 각 인물의 가로 범위(이웃과 조금 겹쳐도 된다 — 경계에 닿은 작은 조각은 지운다) */
const BOXES = [
  ['a-confused', 60, 660],
  ['b-confused', 670, 1400],
  ['a-happy', 1365, 1960],
  ['b-happy', 1905, 2545],
  ['a-curious', 2590, 3125],
  ['b-curious', 3130, 3680],
]
const OUT_H = 1000
const INK_T = 26 // 종이색과 이만큼 다르면 선으로 본다 — 흐린 연필선까지
const WALL_R = 16 // 선을 부풀리는 반경(px) — 흐린 선 사이 틈까지 막는다
const SHRINK = 12 // 다시 깎는 폭 — 선 바깥에 WALL_R - SHRINK px 종이 테두리가 남는다

/** 정사각 팽창(분리형 최댓값 필터) */
function dilate(src, w, h, r) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) { let cnt = 0; const row = y * w
    for (let x = -r; x < w; x++) { const add = x + r; if (add < w && src[row + add]) cnt++; const rem = x - r - 1; if (rem >= 0 && src[row + rem]) cnt--; if (x >= 0) tmp[row + x] = cnt > 0 ? 1 : 0 } }
  for (let x = 0; x < w; x++) { let cnt = 0
    for (let y = -r; y < h; y++) { const add = y + r; if (add < h && tmp[add * w + x]) cnt++; const rem = y - r - 1; if (rem >= 0 && tmp[rem * w + x]) cnt--; if (y >= 0) out[y * w + x] = cnt > 0 ? 1 : 0 } }
  return out
}
const PAPER = [247, 245, 242] // #F7F5F2

const img = sharp(SRC).ensureAlpha()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const W = info.width, H = info.height, C = info.channels
const px = (x, y) => (y * W + x) * C

// 종이색 — 네 귀퉁이 40×40 평균
const corner = [[0, 0], [W - 40, 0], [0, H - 40], [W - 40, H - 40]]
let bg = [0, 0, 0], n = 0
for (const [cx, cy] of corner) for (let y = cy; y < cy + 40; y++) for (let x = cx; x < cx + 40; x++) { const i = px(x, y); bg[0] += data[i]; bg[1] += data[i + 1]; bg[2] += data[i + 2]; n++ }
bg = bg.map(v => v / n)
console.log('종이색', bg.map(Math.round).join(','))
const dist = i => Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2])

fs.mkdirSync(OUT, { recursive: true })
const tiles = []
for (const [name, x0, x1] of BOXES) {
  const w = x1 - x0
  // 1) 선(배경과 조금이라도 다른 픽셀 — 흐린 연필선까지) → 크게 부풀려 벽을 만든다
  const ink = new Uint8Array(w * H)
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) ink[y * w + x] = dist(px(x0 + x, y)) > INK_T ? 1 : 0
  const wall = dilate(ink, w, H, WALL_R)
  // 2) 가장자리에서 벽을 넘지 않게 배경을 채운다
  const isBg = new Uint8Array(w * H)
  const q = []
  const push = (x, y) => { const k = y * w + x; if (!isBg[k] && !wall[k]) { isBg[k] = 1; q.push(k) } }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, H - 1) }
  for (let y = 0; y < H; y++) { push(0, y); push(w - 1, y) }
  while (q.length) { const k = q.pop(), x = k % w, y = (k / w) | 0; if (x > 0) push(x - 1, y); if (x < w - 1) push(x + 1, y); if (y > 0) push(x, y - 1); if (y < H - 1) push(x, y + 1) }
  // 3) 벽 두께만큼 부푼 실루엣을 다시 깎는다(배경을 SHRINK 만큼 넓힌다) — 선 바깥에 몇 px 종이 테두리만 남는다
  const grown = dilate(isBg, w, H, SHRINK)
  for (let k = 0; k < w * H; k++) if (grown[k] && !ink[k]) isBg[k] = 1
  // 4) 경계에 닿은 작은 덩어리(옆 사람 조각) 지우기
  const label = new Int32Array(w * H).fill(-1)
  const comps = []
  for (let k = 0; k < w * H; k++) {
    if (isBg[k] || label[k] >= 0) continue
    const id = comps.length, stack = [k]; label[k] = id
    let size = 0, edge = false
    while (stack.length) {
      const c = stack.pop(); size++
      const x = c % w, y = (c / w) | 0
      if (x === 0 || x === w - 1) edge = true
      for (const d of [c - 1, c + 1, c - w, c + w]) {
        if (d < 0 || d >= w * H) continue
        if ((d === c - 1 && x === 0) || (d === c + 1 && x === w - 1)) continue
        if (!isBg[d] && label[d] < 0) { label[d] = id; stack.push(d) }
      }
    }
    comps.push({ size, edge })
  }
  const biggest = Math.max(...comps.map(c => c.size))
  const main = comps.findIndex(c => c.size === biggest)
  // 4-1) 상반신은 화면 아래까지 이어진다 — 열마다 본체의 가장 윗점부터 맨 아래까지를 채워,
  //      흐린 선 때문에 얼굴 · 몸통 안쪽에 난 투명 구멍을 메운다(작은 소품 — 땀 · 물음표는 그대로)
  //      본체 = 큰 덩어리들(흐린 선 때문에 얼굴과 몸이 갈라져도 함께 본다). 열마다 본체의 맨 위 ~ 맨 아래 사이만 채운다
  const body = new Set(comps.map((c, i) => (c.size > biggest * 0.06 && !(c.edge && c.size < biggest * 0.15) ? i : -1)).filter(i => i >= 0))
  for (let x = 0; x < w; x++) {
    let top = -1, bot = -1
    for (let y = 0; y < H; y++) if (body.has(label[y * w + x])) { if (top < 0) top = y; bot = y }
    if (top < 0) continue
    for (let y = top; y <= bot; y++) { const k = y * w + x; if (!body.has(label[k])) { isBg[k] = 0; label[k] = main } }
  }
  // 5) RGBA 만들기 — 배경 0, 실루엣 255, 가장자리 1px 반투명. 안쪽 종이색은 사이트 크림으로
  const out = Buffer.alloc(w * H * 4)
  let minY = H, maxY = 0, minX = w, maxX = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < w; x++) {
    const k = y * w + x, i = px(x0 + x, y), o = k * 4
    const comp = label[k] >= 0 ? comps[label[k]] : null
    // 자르기 경계에 닿은 작은 덩어리 = 옆 사람 손끝 · 소매 조각
    const keep = comp && !(label[k] !== main && !body.has(label[k]) && comp.edge && comp.size < biggest * 0.15)
    if (!keep) continue
    const edgePx = (x > 0 && isBg[k - 1]) || (x < w - 1 && isBg[k + 1]) || (y > 0 && isBg[k - w]) || (y < H - 1 && isBg[k + w])
    const paperLike = dist(i) < 40
    for (let c = 0; c < 3; c++) out[o + c] = paperLike ? PAPER[c] : data[i + c]
    out[o + 3] = edgePx && paperLike ? 120 : 255
    if (y < minY) minY = y; if (y > maxY) maxY = y; if (x < minX) minX = x; if (x > maxX) maxX = x
  }
  const pad = 8
  const crop = { left: Math.max(0, minX - pad), top: Math.max(0, minY - pad), width: Math.min(w, maxX + pad) - Math.max(0, minX - pad), height: Math.min(H, maxY + pad) - Math.max(0, minY - pad) }
  const file = path.join(OUT, `${name}.png`)
  await sharp(out, { raw: { width: w, height: H, channels: 4 } }).extract(crop).resize({ height: OUT_H }).png({ compressionLevel: 9 }).toFile(file)
  const meta = await sharp(file).metadata()
  console.log(`✓ ${name}.png ${meta.width}×${meta.height} (${Math.round(fs.statSync(file).size / 1024)} KB)`)
  tiles.push(file)
}

// 확인용 — 크림 배경 위에 6장
const metas = await Promise.all(tiles.map(f => sharp(f).metadata()))
const totalW = metas.reduce((s, m) => s + m.width + 40, 40)
await sharp({ create: { width: totalW, height: OUT_H + 80, channels: 4, background: { r: PAPER[0], g: PAPER[1], b: PAPER[2], alpha: 1 } } })
  .composite(tiles.map((input, i) => ({ input, left: 40 + metas.slice(0, i).reduce((s, m) => s + m.width + 40, 0), top: 40 })))
  .png().toFile(path.join(root, 'out', 'remotion', 'characters-preview.png'))
console.log('preview.png')
