/**
 * Basics 쇼트에서 목록 카드 썸네일을 뽑는다 — public/images/blog/basics/<slug>.webp (960×540, 16:9)
 *
 * 대상: remotion/KoreanBasic/videos.json 의 slug 전부(slug 가 곧 컴포지션 id). 번들은 한 번만 만든다.
 * 프레임: Scene 1 의 90프레임(3초) — 흔한 실수 카드 두 장 위에 빨간 X 도장이 내려앉고 경고 자막이 뜬 뒤.
 *   작은 카드에서도 '이건 틀린 말' 이라는 뜻이 바로 읽히는 장면이고, 길이가 가변인 이중 보이스판도 Scene 1 이 4초 이상이라 같은 자리다.
 * 카드에 쓰는 쪽은 lib/blog/thumbnail 의 cardThumbnailForPost — 글 상세 상단에는 쓰지 않는다(영상이 이미 있다).
 *
 * 실행: node scripts/render-basics-thumbnails.mjs            # 아직 없는 것만
 *       node scripts/render-basics-thumbnails.mjs --force    # 전부 다시
 *       node scripts/render-basics-thumbnails.mjs <slug> ... # 지정한 것만 다시
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { bundle } from '@remotion/bundler'
import { selectComposition, renderStill } from '@remotion/renderer'

const FRAME = 90
const root = process.cwd()
const outDir = path.join(root, 'public', 'images', 'blog', 'basics')
const tmpDir = path.join(root, 'out', 'remotion', 'thumbs')
const videos = JSON.parse(fs.readFileSync(path.join(root, 'remotion', 'KoreanBasic', 'videos.json'), 'utf8'))

const args = process.argv.slice(2)
const force = args.includes('--force')
const wanted = args.filter(a => !a.startsWith('--'))
const unknown = wanted.filter(s => !(s in videos))
if (unknown.length) throw new Error(`videos.json 에 없는 slug: ${unknown.join(', ')}`)
const slugs = (wanted.length ? wanted : Object.keys(videos))
  .filter(s => force || wanted.length || !fs.existsSync(path.join(outDir, `${s}.webp`)))

fs.mkdirSync(outDir, { recursive: true })
fs.mkdirSync(tmpDir, { recursive: true })
console.log(`${slugs.length}편 — frame ${FRAME}, 960×540 webp`)
if (!slugs.length) process.exit(0)

const serveUrl = await bundle({ entryPoint: path.join(root, 'remotion', 'index.ts') })
for (const slug of slugs) {
  const composition = await selectComposition({ serveUrl, id: slug })
  const png = path.join(tmpDir, `${slug}.png`)
  await renderStill({ composition, serveUrl, frame: FRAME, scale: 0.5, output: png })
  const out = path.join(outDir, `${slug}.webp`)
  await sharp(png).webp({ quality: 82 }).toFile(out)
  console.log(`✓ ${slug} (${Math.round(fs.statSync(out).size / 1024)} KB)`)
}
