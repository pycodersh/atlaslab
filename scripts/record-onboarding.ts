/**
 * Patto 온보딩 Playwright 녹화 스크립트
 *
 * 흐름:
 *  1. 홈 진입 (first_visit 상태) → 2초 대기
 *  2. 트레이너 환영 메시지 + Ask카드 "PATTO 소개를 받아볼까요?" 등장
 *  3. Intro 버튼 클릭 → OnboardingModal Scene1 진입
 *  4. Scene1 (말이 안 나올까?) → 7초 대기 (Block A→B→C 크로스페이드 완료)
 *  5. 탭 → Scene2 (PATTO와 함께라면) → 7초 대기 (어셈블 애니메이션 완료)
 *  6. 탭 → Scene3 (반복이 자신감) → 2초 대기
 *  7. 탭 → Scene4 (CTA) → 1.5초 대기 → Start 클릭
 *  8. 홈 화면 복귀 → 2초 대기
 */

import { chromium } from 'playwright'
import * as path from 'path'
import * as fs from 'fs'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const PORT     = 3001
const BASE_URL = `http://localhost:${PORT}/patto/home`
const VIDEO_DIR = path.resolve('./videos')

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

;(async () => {
  if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true })

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 390, height: 844 },
    },
    // 60fps hint (Playwright 내부 기본은 25fps이지만 최대한 부드럽게)
  })

  // first_visit 상태 강제 세팅
  await context.addInitScript(() => {
    localStorage.clear()
    // visit_count를 0으로 → first_visit 판정
    localStorage.setItem('patto_visit_count', '0')
  })

  const page = await context.newPage()

  // ── 1. 홈 진입 ─────────────────────────────────────────────────────────────
  console.log('[1] 홈 진입...')
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await sleep(2000)

  // ── 2. 트레이너 환영 + Ask 카드 대기 ──────────────────────────────────────
  // 트레이너 say()가 1.5~2초 딜레이 후 실행됨
  // 환영 메시지 2초 + 전환 딜레이 2.3초 = 약 4.5초 대기
  console.log('[2] 트레이너 등장 대기...')
  await sleep(5000)

  // Intro 버튼 등장 확인
  const introBtn = page.locator('button, [role="button"]').filter({ hasText: 'Intro' })
  await introBtn.waitFor({ timeout: 8000 }).catch(() => {
    console.warn('Intro 버튼 못 찾음 — URL param 방식으로 fallback')
  })

  // ── 3. Intro 클릭 ──────────────────────────────────────────────────────────
  console.log('[3] Intro 클릭...')
  try {
    await introBtn.click()
  } catch {
    // fallback: ?showIntro=1 파라미터로 직접 진입
    console.warn('fallback: ?showIntro=1 사용')
    await page.goto(`${BASE_URL}?showIntro=1`, { waitUntil: 'networkidle' })
  }

  // OnboardingModal 등장 대기
  await sleep(500)

  // ── 4. Scene1 — 텍스트 블록 A→B→C 완료 대기 (7초) ─────────────────────
  console.log('[4] Scene1 관람 중... (7초)')
  await sleep(7000)

  // ── 5. Scene2 진입 (탭) + 어셈블 애니메이션 대기 (7초) ─────────────────
  console.log('[5] Scene2 진입 탭...')
  await page.mouse.click(195, 422)
  await sleep(7000)

  // ── 6. Scene3 진입 (탭) ─────────────────────────────────────────────────
  console.log('[6] Scene3 진입 탭...')
  await page.mouse.click(195, 422)
  await sleep(2500)

  // ── 7. Scene4 진입 (탭) ─────────────────────────────────────────────────
  console.log('[7] Scene4 진입 탭...')
  await page.mouse.click(195, 422)
  await sleep(1500)

  // ── 8. Start 버튼 클릭 ──────────────────────────────────────────────────
  console.log('[8] Start 버튼 클릭...')
  // Scene4는 onClick이 block-level이라 텍스트 포함 버튼 직접 클릭
  const startBtn = page.getByRole('button', { name: 'Start' }).last()
  try {
    await startBtn.waitFor({ state: 'visible', timeout: 4000 })
    await startBtn.click({ force: true })
    console.log('Start 클릭 성공')
  } catch {
    // 좌표로 직접 클릭 (Scene4 Start 버튼은 우측 절반, 하단 카드 안)
    console.warn('버튼 못 찾음, 좌표로 클릭')
    await page.mouse.click(293, 700)
  }
  await sleep(2000)

  // ── 저장 ────────────────────────────────────────────────────────────────
  console.log('[9] 비디오 저장 중...')
  const videoPath = await page.video()?.path()
  await context.close()
  await browser.close()

  if (videoPath) {
    const webmDest = path.join(VIDEO_DIR, 'patto-onboarding.webm')
    const mp4Dest  = path.join(VIDEO_DIR, 'patto-onboarding.mp4')
    fs.renameSync(videoPath, webmDest)
    console.log(`\n✅ WebM 저장: ${webmDest}`)
    console.log('🔄 MP4 변환 중...')
    await new Promise<void>((resolve, reject) => {
      ffmpeg(webmDest)
        .videoCodec('libx264')
        .outputOptions(['-pix_fmt yuv420p', '-movflags +faststart'])
        .save(mp4Dest)
        .on('end', () => {
          const stats = fs.statSync(mp4Dest)
          console.log(`✅ MP4 저장 완료: ${mp4Dest}`)
          console.log(`   크기: ${(stats.size / 1024 / 1024).toFixed(1)} MB`)
          resolve()
        })
        .on('error', (err: Error) => {
          console.error('❌ MP4 변환 실패:', err.message)
          reject(err)
        })
    })
  } else {
    console.error('❌ 비디오 경로를 찾을 수 없습니다.')
  }
})()
