/**
 * 컨택트 시트(commons-contact-sheet.mjs)에서 고른 사진을 blog-covers 에 올리고, 본문에 넣을 figure 조각을 출력한다.
 *
 *   node scripts/upload-commons-picks.mjs <commons-preview/x.json> <글 slug> <id> [<id> …] [--dry-run]
 *   예) node scripts/upload-commons-picks.mjs commons-preview/gyeongju.json gyeongju-one-day-itinerary-bulguksa-daereungwon bulguksa-3 donggung-8
 *
 * - 원본을 받아 긴 변 1600px WebP 로 줄인다(올리는 파일 이름: <slug>-<명소 key>.webp).
 * - 캡션에 저작자 · 라이선스 · Commons 원본 링크를 넣는다(CC BY · BY-SA 의 표시 의무). CC0 · PD 도 출처는 적는다.
 * - 결과 JSON(commons-preview/<slug>-uploaded.json)에 id → url · 캡션을 남긴다. 본문 삽입은 그 파일을 보고 한다.
 */
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import sharp from 'sharp'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })

const UA = { 'User-Agent': 'AtlasLabStudios-PhotoPicker/1.0 (+https://www.atlaslabstudios.com)' }
const args = process.argv.slice(2).filter(a => !a.startsWith('--'))
const DRY = process.argv.includes('--dry-run')
const [sheetPath, slug, ...ids] = args
if (!sheetPath || !slug || !ids.length) { console.error('사용법: node scripts/upload-commons-picks.mjs <sheet.json> <slug> <id…> [--dry-run]'); process.exit(1) }
const sheet = JSON.parse(fs.readFileSync(sheetPath, 'utf8'))
const byId = new Map(sheet.spots.flatMap(s => s.candidates.map(c => [c.id, { ...c, spotKey: s.key, spotName: s.name }])))
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\{/g, '&#123;').replace(/\}/g, '&#125;')

async function main() {
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
  const out = {}
  const seen = new Map()   // 같은 명소에서 두 장 이상 고르면 파일 이름이 겹치지 않게 -2, -3 을 붙인다
  for (const id of ids) {
    const c = byId.get(id)
    if (!c) throw new Error(`없는 id: ${id}`)
    const n = (seen.get(c.spotKey) ?? 0) + 1
    seen.set(c.spotKey, n)
    const name = `${slug}-${c.spotKey}${n > 1 ? `-${n}` : ''}.webp`
    const res = await fetch(c.original, { headers: UA })
    if (!res.ok) throw new Error(`원본 받기 실패 ${id}: HTTP ${res.status}`)
    const buf = await sharp(Buffer.from(await res.arrayBuffer())).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
    const meta = await sharp(buf).metadata()
    let url = `(dry-run) ${name}`
    if (!DRY) {
      const { error } = await sb.storage.from('blog-covers').upload(name, buf, { contentType: 'image/webp', upsert: true })
      if (error) throw new Error(`업로드 실패 ${id}: ${error.message}`)
      url = sb.storage.from('blog-covers').getPublicUrl(name).data.publicUrl
    }
    const license = c.licenseUrl ? `<a href="${esc(c.licenseUrl)}" rel="noopener noreferrer" target="_blank">${esc(c.license)}</a>` : esc(c.license)
    const credit = `Photo: ${esc(c.artist)} (${license}), via <a href="${esc(c.page)}" rel="noopener noreferrer" target="_blank">Wikimedia Commons</a>`
    out[id] = { spotKey: c.spotKey, url, width: meta.width, height: meta.height, credit, title: c.title, license: c.license, artist: c.artist }
    console.log(`${id} → ${name} ${meta.width}x${meta.height} ${Math.round(buf.length / 1024)}KB · ${c.license} · ${c.artist}`)
  }
  const file = path.join('commons-preview', `${slug}-uploaded.json`)
  fs.writeFileSync(file, JSON.stringify(out, null, 2))
  console.log(`\n✅ ${file}`)
}
main().catch(e => { console.error('[중단]', e.message ?? e); process.exit(1) })
