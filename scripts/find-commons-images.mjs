/**
 * Wikimedia Commons 에서 상업적 이용이 가능한 이미지 후보를 찾아 터미널에 출력한다(검수용).
 * 글에는 아무것도 적용하지 않고, DB 도 건드리지 않는다. 링크를 눌러 눈으로 확인한 뒤 고르는 용도다.
 *
 * 실행: node scripts/find-commons-images.mjs <config.json>
 *   config 예) { "menus": [ { "name": "바지락칼국수", "queries": ["bajirak kalguksu"], "categories": ["Bajirakkalguksu"], "note": "..." } ] }
 *   옵션: --per 5   메뉴당 출력 후보 수(기본 5)
 *
 * 필터
 *  - 라이선스: CC0 / 퍼블릭 도메인 / CC BY / CC BY-SA 만(상업 이용 가능). NC·ND 는 뺀다.
 *    BY·BY-SA 는 출처(작성자·라이선스) 표기가 의무라서 출력에 함께 적는다. BY-SA 는 변형본에도 같은 조건이 붙는다.
 *  - 형식: jpg/png/webp, 가로 600px 이상
 *  - 설명·파일명에 검색어의 핵심 단어가 하나도 안 들어간 것은 점수를 낮춘다(엉뚱한 사진 거르기)
 *
 * Commons API 는 가벼운 사용만 허용한다. 요청 사이에 간격을 두고 User-Agent 를 밝힌다.
 */
import * as fs from 'fs'

const argv = process.argv.slice(2)
const cfgPath = argv.find(a => !a.startsWith('--'))
const per = Number(argv[argv.indexOf('--per') + 1]) || 5
if (!cfgPath) { console.error('사용법: node scripts/find-commons-images.mjs <config.json> [--per 5]'); process.exit(1) }
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))

const UA = { 'User-Agent': 'AtlasLabStudios-ImageFinder/1.0 (https://www.atlaslabstudios.com; contact via site) node-fetch' }
const API = 'https://commons.wikimedia.org/w/api.php'
const sleep = ms => new Promise(r => setTimeout(r, ms))
const strip = s => String(s ?? '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

const ALLOWED = [/^cc0/i, /public domain/i, /^pd[- ]/i, /^cc[- ]by(?![- ]?(nc|nd))/i, /^cc[- ]by[- ]sa/i]
const BLOCKED = /\b(nc|nd)\b|-nc|-nd|non-?commercial|no derivatives/i
const licenseOk = (short) => short && !BLOCKED.test(short) && ALLOWED.some(r => r.test(short))

async function search(q) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrsearch: q, gsrlimit: '20',
    prop: 'imageinfo', iiprop: 'url|extmetadata|mime|size', iiurlwidth: '800',
  })
  const res = await fetch(`${API}?${params}`, { headers: UA })
  if (!res.ok) throw new Error(`Commons ${res.status}`)
  const j = await res.json()
  return Object.values(j.query?.pages ?? {})
}

/** Commons 분류(Category) 안의 파일 목록. 검색어로 안 잡히는 세부 메뉴는 분류로 찾는 편이 정확하다. */
async function fromCategory(cat) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', generator: 'categorymembers', gcmtitle: cat.startsWith('Category:') ? cat : `Category:${cat}`,
    gcmtype: 'file', gcmlimit: '60', prop: 'imageinfo', iiprop: 'url|extmetadata|mime|size', iiurlwidth: '800',
  })
  const res = await fetch(`${API}?${params}`, { headers: UA })
  if (!res.ok) throw new Error(`Commons ${res.status}`)
  const j = await res.json()
  return Object.values(j.query?.pages ?? {})
}

function score(p, words) {
  const md = p.imageinfo?.[0]?.extmetadata ?? {}
  const hay = `${p.title} ${strip(md.ImageDescription?.value)} ${strip(md.Categories?.value)}`.toLowerCase()
  return words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0)
}

for (const menu of cfg.menus) {
  console.log(`\n━━ ${menu.name} ━━`)
  const seen = new Map()
  const words = [...new Set(menu.queries.flatMap(q => q.toLowerCase().split(/\s+/)))].filter(w => w.length > 2)
  for (const q of menu.queries) {
    try {
      for (const p of await search(q)) if (!seen.has(p.pageid)) seen.set(p.pageid, p)
    } catch (e) { console.warn(`  (검색 실패 "${q}": ${e.message})`) }
    await sleep(700)
  }
  for (const cat of menu.categories ?? []) {
    try {
      for (const p of await fromCategory(cat)) if (!seen.has(p.pageid)) seen.set(p.pageid, p)
    } catch (e) { console.warn(`  (분류 조회 실패 "${cat}": ${e.message})`) }
    await sleep(700)
  }
  const cands = []
  for (const p of seen.values()) {
    const ii = p.imageinfo?.[0]
    if (!ii) continue
    const md = ii.extmetadata ?? {}
    const lic = strip(md.LicenseShortName?.value)
    if (!/^image\/(jpeg|png|webp)$/.test(ii.mime)) continue
    if (ii.width < 600) continue
    if (!licenseOk(lic)) continue
    cands.push({
      title: p.title.replace(/^File:/, ''),
      url: ii.descriptionurl,                 // 파일 설명 페이지(라이선스·작성자 확인용)
      direct: ii.url,
      size: `${ii.width}x${ii.height}`,
      license: lic,
      author: strip(md.Artist?.value).slice(0, 60),
      desc: strip(md.ImageDescription?.value).slice(0, 110),
      score: Math.max(score(p, words), (menu.categories ?? []).some(c => strip(md.Categories?.value).toLowerCase().includes(c.replace(/^Category:/, '').toLowerCase().replace(/_/g, ' '))) ? 1 : 0),
    })
  }
  cands.sort((a, b) => b.score - a.score || b.size.localeCompare(a.size))
  if (!cands.length) console.log('  (조건에 맞는 후보 없음 — 검색어를 바꿔 보거나 다른 출처를 쓴다)')
  cands.slice(0, per).forEach((c, i) => {
    console.log(`  ${i + 1}. [${menu.name}] - ${c.title} - ${c.url}`)
    console.log(`     ${c.size} · ${c.license} · by ${c.author || '(작성자 미상)'}${c.score ? '' : '  ⚠ 설명에 검색어 없음(엉뚱한 사진일 수 있음)'}`)
    if (c.desc) console.log(`     "${c.desc}"`)
  })
}
console.log('\n※ 아무것도 적용하지 않았다. 마음에 드는 번호를 알려 주면 그 파일만 내려받아 WebP 로 변환하고, 작성자·라이선스를 캡션에 적어 넣는다.')
