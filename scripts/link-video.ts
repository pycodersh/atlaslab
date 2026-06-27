/**
 * PATTO Video Link Script
 *
 * AI 도구로 생성한 MP4를 StoryPackage에 자동으로 연결한다.
 *
 * 사용법:
 *   npm run link-video -- --story 1
 *   npm run link-video -- --story 1 --dry-run
 *
 * 동작:
 *   1. public/videos/story{id}-scene.mp4 존재 여부 확인
 *   2. 파일 크기 / 유효성 검사
 *   3. story-{id}-package.ts 자동 업데이트:
 *      sceneVideo.source: 'test' → 'ai'
 *      sceneVideo.status: 'missing' → 'ready'
 *      sceneVideo.url: test → scene
 *      videoProduction.status: → 'linked'
 *      videoProduction.linkedAt: ISO date 추가
 */

import * as fs from 'fs'
import * as path from 'path'

// ── CLI 인자 파싱 ──────────────────────────────────────────────────────────
const args = process.argv.slice(2)

const storyArg = args.includes('--story')
  ? args[args.indexOf('--story') + 1]
  : null

const dryRun = args.includes('--dry-run')

if (!storyArg || isNaN(Number(storyArg))) {
  console.error('\n  Usage: npm run link-video -- --story <id>')
  console.error('  Example: npm run link-video -- --story 1\n')
  process.exit(1)
}

const storyId     = String(Number(storyArg)).padStart(3, '0')
const storyNum    = Number(storyArg)
const videoFile   = `story${storyId}-scene.mp4`
const testFile    = `story${storyId}-test.mp4`
const videoPath   = path.resolve(process.cwd(), `public/videos/${videoFile}`)
const packagePath = path.resolve(process.cwd(), `data/factory/story-${storyId}-package.ts`)

console.log(`\n  ── PATTO Video Link ─────────────────────────────────`)
console.log(`  Story   : ${storyId} ${dryRun ? '[DRY RUN]' : ''}`)
console.log(`  Video   : public/videos/${videoFile}`)
console.log(`  Package : data/factory/story-${storyId}-package.ts`)
console.log(`  ──────────────────────────────────────────────────────\n`)

// ── 1. 영상 파일 확인 ─────────────────────────────────────────────────────
if (!fs.existsSync(videoPath)) {
  console.log(`  ✗  ${videoFile} not found\n`)
  console.log(`  생성 방법:`)
  console.log(`  1. data/factory/story-${storyId}-video-production.ts 의 prompt 확인`)
  console.log(`     → story${storyNum >= 10 ? storyNum : '0' + storyNum}SubmitKit.tools.runway (또는 kling / veo)`)
  console.log(`  2. AI 영상 도구에서 Scene 1 / 2 / 3 각 8초 생성`)
  console.log(`  3. 3개 Scene을 순서대로 편집하여 24초 MP4로 합치기`)
  console.log(`  4. public/videos/${videoFile} 로 저장`)
  console.log(`  5. 다시 실행: npm run link-video -- --story ${storyArg}\n`)
  process.exit(1)
}

// ── 2. 파일 유효성 검사 ───────────────────────────────────────────────────
const stat   = fs.statSync(videoPath)
const sizeMB = (stat.size / 1024 / 1024).toFixed(2)
const sizeKB = Math.round(stat.size / 1024)

console.log(`  ✓  Video file found`)
console.log(`     Size     : ${sizeMB} MB (${sizeKB} KB)`)
console.log(`     Modified : ${stat.mtime.toLocaleString()}`)

if (stat.size < 50_000) {
  console.warn(`\n  ⚠  File size is very small (${sizeKB} KB)`)
  console.warn(`     유효한 MP4가 맞는지 확인하세요.\n`)
}

// MP4 magic bytes 확인 (최소 검증)
const buf = Buffer.alloc(12)
const fd  = fs.openSync(videoPath, 'r')
fs.readSync(fd, buf, 0, 12, 0)
fs.closeSync(fd)
const isMp4 = buf.slice(4, 8).toString('ascii') === 'ftyp'
if (!isMp4) {
  console.warn(`  ⚠  파일이 MP4 형식이 아닐 수 있습니다 (ftyp signature 없음)`)
}

// ── 3. Package 파일 확인 ──────────────────────────────────────────────────
if (!fs.existsSync(packagePath)) {
  console.error(`\n  ✗  Package not found: ${packagePath}\n`)
  process.exit(1)
}

// ── 4. Package 업데이트 ───────────────────────────────────────────────────
let pkg = fs.readFileSync(packagePath, 'utf-8')
const original = pkg
const now = new Date().toISOString()

// sceneVideo.source: 'test' → 'ai'
pkg = pkg.replace(/source:\s*'test'/, "source: 'ai'")

// sceneVideo.status: 'missing' → 'ready' (sceneVideo 블록 안에서만)
// sceneVideo 블록을 찾아서 첫 번째 status만 교체
pkg = pkg.replace(
  /(sceneVideo:\s*\{[\s\S]*?status:\s*)'missing'/,
  "$1'ready'"
)

// sceneVideo.url: test → scene
pkg = pkg.replace(
  `url: '/videos/story${storyId}-test.mp4'`,
  `url: '/videos/story${storyId}-scene.mp4'`
)

// videoProduction.status → 'linked'
pkg = pkg.replace(
  /videoProduction:\s*\{([\s\S]*?)status:\s*'[^']+'/,
  (match, inner) => `videoProduction: {${inner}status: 'linked'`
)

// videoProduction.linkedAt 추가 (없으면)
if (!pkg.includes('linkedAt:')) {
  pkg = pkg.replace(
    /videoProduction:\s*\{([\s\S]*?)status:\s*'linked'/,
    (match, inner) => `videoProduction: {${inner}status: 'linked',\n    linkedAt: '${now}'`
  )
}

// 변경 사항 확인
if (pkg === original) {
  console.log(`\n  ⚠  Package already up to date — no changes needed`)
  console.log(`     (이미 source: 'ai', status: 'ready' 상태일 수 있습니다)\n`)
} else if (!dryRun) {
  fs.writeFileSync(packagePath, pkg, 'utf-8')
  console.log(`\n  ✓  Package updated`)
  console.log(`     sceneVideo.source  : test → ai`)
  console.log(`     sceneVideo.url     : test → scene`)
  console.log(`     videoProduction    : → linked (${now})`)
} else {
  console.log(`\n  [dry-run] Package would be updated:`)
  console.log(`     sceneVideo.source  : test → ai`)
  console.log(`     sceneVideo.url     : test → scene`)
  console.log(`     videoProduction    : → linked`)
}

// ── 5. 테스트 파일 안내 ───────────────────────────────────────────────────
const testPath = path.resolve(process.cwd(), `public/videos/${testFile}`)
if (fs.existsSync(testPath)) {
  console.log(`\n  ℹ  Placeholder still exists: public/videos/${testFile}`)
  console.log(`     더 이상 필요 없으면 삭제하세요:`)
  console.log(`     del public\\videos\\${testFile}`)
}

// ── 완료 ─────────────────────────────────────────────────────────────────
console.log(`\n  ✓  Done!`)
console.log(`     Preview: http://localhost:3001/stories/${storyNum}\n`)
