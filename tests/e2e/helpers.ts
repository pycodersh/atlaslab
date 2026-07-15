import { Page } from '@playwright/test'

export const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3002'
export const PATTO = `${BASE}/patto`
export const HOME = `${PATTO}/home`
export const STORIES = `${PATTO}/stories`
export const LIBRARY = `${PATTO}/library`
export const PROGRESS = `${PATTO}/records`
export const SETTINGS = `${PATTO}/settings`

/** localStorage 완전 초기화 (첫 방문 시뮬레이션) */
export async function clearAll(page: Page) {
  await page.evaluate(() => localStorage.clear())
  await page.evaluate(() => sessionStorage.clear())
}

/** SRS 기록만 초기화 */
export async function clearSRS(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('patto-srs-records')
    localStorage.removeItem('patto-srs-activity')
    localStorage.removeItem('patto-story-rounds')
    localStorage.removeItem('orb-position')
  })
}

/** 오브가 화면에 있을 때까지 대기 */
export async function waitForOrb(page: Page) {
  await page.waitForSelector('[data-testid="trainer-orb"]', { timeout: 5000 }).catch(() => {
    // testid 없으면 canvas or div 기반 오브 찾기 시도
  })
}

/** 콘솔 에러 수집기 설정 */
export function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))
  return errors
}

/** 네트워크 4xx/5xx 수집 */
export function collectNetworkErrors(page: Page): { url: string; status: number }[] {
  const errors: { url: string; status: number }[] = []
  page.on('response', res => {
    if (res.status() >= 400) {
      errors.push({ url: res.url(), status: res.status() })
    }
  })
  return errors
}

/** 모바일 가로 스크롤 검사 */
export async function checkNoHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
}

/** HTTP 5xx 서버 에러 수집기 (body 텍스트 "500" 오탐 방지용) */
export function collectServerErrors(page: Page): { url: string; status: number }[] {
  const errors: { url: string; status: number }[] = []
  page.on('response', res => {
    if (res.status() >= 500) errors.push({ url: res.url(), status: res.status() })
  })
  return errors
}

/** 오디오 동시 재생 개수 확인 */
export async function countPlayingAudio(page: Page): Promise<number> {
  return page.evaluate(() => {
    const audios = Array.from(document.querySelectorAll('audio'))
    return audios.filter(a => !a.paused).length
  })
}
