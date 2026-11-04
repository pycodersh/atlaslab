/**
 * Basics 쇼트에서 목록 카드 썸네일을 뽑는다 — public/images/blog/basics/<slug>.webp (960×540, 16:9)
 *
 * 대상: remotion/KoreanBasic/videos.json 의 slug 전부(slug 가 곧 컴포지션 id). 번들은 한 번만 만든다.
 * 프레임: Scene 2(규칙 대비) 시작 + 2초 — 대조 카드 두 장이 자리를 잡고 아래 규칙 배너까지 다 올라온 뒤.
 *   Scene 2 시작은 videos.json 의 timing.scenes[1][0](이중 보이스판), 없으면 4초(12초판)다.
 *   처음엔 Scene 1 의 빨간 X 장면을 썼는데, 40장이 다 경고 표시라 목록 전체가 부정적으로 보였다(2026-11-04 교체).
 *   배너는 장면 1.6초쯤 튀어 올라 1~1.5초 지점에서는 아직 없다 — 그래서 2초다.
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

const FPS = 30
const AFTER_SCENE2 = 2.0
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
/** Scene 2 시작 + 2초의 프레임 번호 */
const frameOf = slug => Math.round(((videos[slug].timing?.scenes?.[1]?.[0] ?? 4) + AFTER_SCENE2) * FPS)

console.log(`${slugs.length}편 — Scene 2 + ${AFTER_SCENE2}s, 960×540 webp`)
if (!slugs.length) process.exit(0)

const serveUrl = await bundle({ entryPoint: path.join(root, 'remotion', 'index.ts') })
for (const slug of slugs) {
  const composition = await selectComposition({ serveUrl, id: slug })
  const png = path.join(tmpDir, `${slug}.png`)
  const frame = frameOf(slug)
  await renderStill({ composition, serveUrl, frame, scale: 0.5, output: png })
  const out = path.join(outDir, `${slug}.webp`)
  await sharp(png).webp({ quality: 82 }).toFile(out)
  console.log(`✓ ${slug} frame ${frame} (${Math.round(fs.statSync(out).size / 1024)} KB)`)
}
