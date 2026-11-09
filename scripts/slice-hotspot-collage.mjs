/**
 * 콜라주 세 장을 스팟별 정사각 webp 로 자른다.
 *   node scripts/slice-hotspot-collage.mjs <콜라주1.png> <콜라주2.png> <누락 이미지.png> [대조표.jpg]
 * 칸 경계는 흰 여백을 읽어 찾는다 — 콜라주마다 칸 크기가 조금씩 달라 균등 분할하면 어긋난다.
 * 결과: public/images/hotspots/spot-*.webp, data/hotspotPhotos.ts(스팟 이름 → 경로)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

// 시트별 격자 [행, 열]
const GRID = { 1: [9, 6], 2: [9, 6], 3: [3, 5] }
const OUT = 256
const INSET = 0.04

// [콜라주, 행, 열] — 사진에 실제로 찍힌 곳 기준
const MAP = {
  'Gyeongbokgung Palace': [1, 1, 1], 'Bukchon Hanok Village': [1, 1, 2], 'Ikseon-dong Hanok Alley': [1, 1, 5], 'Changdeokgung & Secret Garden': [1, 1, 4],
  'Myeongdong Street & Night Market': [1, 2, 1], 'N Seoul Tower': [1, 2, 3], 'Namdaemun Market': [1, 2, 2],
  'Hongdae Busking & Walk Street': [2, 1, 3], 'Yeonnam-dong Forest Trail': [2, 3, 4], 'Mangwon Market': [2, 3, 5], 'Hapjeong & Sangsu Cafe Lanes': [1, 1, 3],
  'Yeonmujang-gil Pop-up Street': [2, 1, 5], 'Seoul Forest Park': [2, 4, 1],
  'Yeouido Hangang Park': [2, 2, 5], 'The Hyundai Seoul': [1, 2, 5], 'National Museum of Korea': [1, 3, 1],
  'Starfield Library at COEX': [1, 3, 3], 'Lotte World Tower & Seoul Sky': [1, 3, 6], 'Seokchon Lake Trail': [2, 3, 1], 'Apgujeong Rodeo Street': [2, 8, 4],
  'Haeundae Beach': [1, 4, 1], 'Gwangalli Beach': [1, 4, 2], 'Gamcheon Culture Village': [1, 4, 3], 'Huinnyeoul Culture Village': [1, 4, 6], 'Jagalchi Market': [1, 4, 4], 'Haedong Yonggungsa Temple': [1, 4, 5],
  'Hwangnidan-gil': [1, 5, 5], 'Daereungwon Tomb Complex': [1, 5, 3], 'Cheomseongdae Observatory': [1, 5, 2], 'Donggung Palace and Wolji Pond': [1, 5, 6], 'Bulguksa Temple': [1, 5, 1],
  'Jeonju Hanok Village': [1, 7, 1], 'Gyeonggijeon Shrine': [1, 7, 2],
  'Anmok Beach Coffee Street': [1, 7, 4], 'Jungang Market': [2, 3, 3],
  'Sokcho Tourist and Fishery Market': [1, 7, 6], Yeonggeumjeong: [2, 8, 6],
  'Yeosu Maritime Cable Car': [1, 8, 1], 'Odongdo Island': [1, 8, 2], 'Nangman Pocha Street': [2, 9, 2],
  'Dongseongno and Spark Land': [1, 9, 3], 'Seomun Night Market': [1, 9, 1], 'Kim Gwangseok Street': [1, 9, 2], 'Apsan Observatory': [1, 9, 4],
  'Hahoe Folk Village': [1, 8, 5], 'Woryeonggyo Bridge': [1, 8, 6],
  'Nami Island': [1, 9, 5], 'LEGOLAND Korea': [1, 9, 6],
  'DDP & Cheonggyecheon': [3, 1, 1], 'Daelim Changgo Gallery': [3, 1, 2], 'Ttukseom Cafe Street': [3, 1, 3], 'Hannam-dong Designer Street': [3, 1, 4], 'Nambu Night Market': [3, 1, 5],
  'Jaman Mural Village': [3, 2, 1], 'ARTE Museum Gangneung': [3, 2, 2], 'Jeongdongjin Sea Fan Trail': [3, 2, 3], 'Sokcho Eye': [3, 2, 4], 'Seoraksan Cable Car': [3, 2, 5],
  'Yi Sun-sin Square Food Street': [3, 3, 1], 'Andong Jjimdak Alley': [3, 3, 2], 'Myeongdong Dakgalbi Street': [3, 3, 3], 'Dongmun Night Market': [3, 3, 4], Soesokkak: [3, 3, 5],
  'Seongsan Ilchulbong': [1, 6, 1], 'Hamdeok Beach': [1, 6, 3], 'Osulloc Tea Museum': [1, 6, 5],
}

const slug = name => name.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** 균등 분할 위치 부근에서 가장 흰 줄을 여백으로 잡아 칸 구간을 돌려준다 — 구름 낀 하늘도 흰색이라 임계값만으로는 갈린다 */
function bands(ratio, count, reach) {
  const size = ratio.length / count
  const gutters = [[-1, -1]]
  for (let k = 1; k < count; k++) {
    const center = Math.round(k * size)
    let peak = center
    for (let i = center - reach; i <= center + reach; i++) if (ratio[i] > ratio[peak]) peak = i
    if (ratio[peak] < 0.5) throw new Error(`여백을 못 찾았다: ${k}번째, 흰색 비율 ${ratio[peak]}`)
    let from = peak, to = peak
    while (ratio[from - 1] > ratio[peak] * 0.6) from--
    while (ratio[to + 1] > ratio[peak] * 0.6) to++
    gutters.push([from, to])
  }
  gutters.push([ratio.length, ratio.length])
  // 바깥 여백은 양끝에서 흰 줄을 걷어 낸다
  let head = 0, tail = ratio.length - 1
  while (ratio[head] > 0.6) head++
  while (ratio[tail] > 0.6) tail--
  return Array.from({ length: count }, (_, i) => [i === 0 ? head : gutters[i][1] + 1, i === count - 1 ? tail + 1 : gutters[i + 1][0]])
}

async function gridOf(file, [ROWS, COLS]) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const white = (x, y) => { const p = (y * width + x) * channels; return data[p] > 238 && data[p + 1] > 238 && data[p + 2] > 238 }
  const rowRatio = Array.from({ length: height }, (_, y) => { let n = 0; for (let x = 0; x < width; x++) if (white(x, y)) n++; return n / width })
  const rows = bands(rowRatio, ROWS, 38)
  return rows.map(([top, bottom]) => {
    const colRatio = Array.from({ length: width }, (_, x) => { let n = 0; for (let y = top; y < bottom; y++) if (white(x, y)) n++; return n / (bottom - top) })
    return { top, bottom, cols: bands(colRatio, COLS, 28) }
  })
}

const [one, two, three, sheetPath] = process.argv.slice(2)
if (!one || !two || !three) throw new Error('콜라주 세 장의 경로가 필요하다')
const files = { 1: one, 2: two, 3: three }
const grids = { 1: await gridOf(one, GRID[1]), 2: await gridOf(two, GRID[2]), 3: await gridOf(three, GRID[3]) }

mkdirSync('public/images/hotspots', { recursive: true })
const entries = []
const tiles = []
for (const [name, [sheet, row, col]] of Object.entries(MAP)) {
  const r = grids[sheet][row - 1]
  const [l, right] = r.cols[col - 1]
  const w = right - l, h = r.bottom - r.top
  const side = Math.floor(Math.min(w, h) * (1 - INSET * 2))
  const box = { left: l + Math.floor((w - side) / 2), top: r.top + Math.floor((h - side) / 2), width: side, height: side }
  const id = slug(name)
  const png = await sharp(files[sheet]).removeAlpha().extract(box).resize(OUT, OUT).toBuffer()
  await sharp(png).webp({ quality: 78 }).toFile(`public/images/hotspots/spot-${id}.webp`)
  entries.push([name, `/images/hotspots/spot-${id}.webp`])
  tiles.push({ name, png })
}

const body = entries.map(([n, p]) => `  ${JSON.stringify(n)}: '${p}',`).join('\n')
writeFileSync('data/hotspotPhotos.ts', `// scripts/slice-hotspot-collage.mjs 가 만든다. 손으로 고치지 말 것\nexport const HOTSPOT_PHOTOS: Record<string, string> = {\n${body}\n}\n`)
console.log(`${entries.length} spots`)

if (sheetPath) {
  const size = 150, cols = 9, labelH = 30
  const rows = Math.ceil(tiles.length / cols)
  const esc = s => s.replace(/&/g, '&amp;')
  const composites = (await Promise.all(tiles.map(async (t, i) => {
    const left = (i % cols) * size, top = Math.floor(i / cols) * (size + labelH)
    const label = Buffer.from(`<svg width="${size}" height="${labelH}"><rect width="100%" height="100%" fill="#111"/><text x="4" y="19" font-size="11" fill="#fff" font-family="sans-serif">${esc(t.name.slice(0, 24))}</text></svg>`)
    return [{ input: await sharp(t.png).resize(size, size).toBuffer(), left, top }, { input: label, left, top: top + size }]
  }))).flat()
  await sharp({ create: { width: cols * size, height: rows * (size + labelH), channels: 3, background: '#fff' } }).composite(composites).jpeg({ quality: 82 }).toFile(sheetPath)
}
