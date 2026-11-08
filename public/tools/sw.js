/*
 * /tools/* 전용 서비스 워커 — 지하철 · 식당처럼 전파가 약한 곳에서도 도구가 열리게 한다.
 * scope 가 /tools/ 라 푸시를 맡는 OneSignal 워커(scope /)와 겹치지 않는다.
 *   페이지       network-first, 3초 안에 응답이 없거나 실패하면 캐시
 *   /_next/static  cache-first (파일명에 해시가 있어 내용이 바뀌지 않는다)
 * 캐시 구조를 바꾸면 CACHE 의 숫자를 올린다(옛 캐시는 activate 때 지운다).
 */
const CACHE = 'atlas-tools-v1'
const PAGES = ['/tools/order-builder', '/tools/subway-timer', '/tools/krw-converter']
const NETWORK_WAIT_MS = 3000

async function precache() {
  const cache = await caches.open(CACHE)
  const assets = new Set()
  await Promise.allSettled(PAGES.map(async page => {
    const res = await fetch(page, { cache: 'no-cache' })
    if (!res.ok) return
    const html = await res.clone().text()
    await cache.put(page, res)
    for (const m of html.matchAll(/\/_next\/static\/[^"'\\\s)]+/g)) assets.add(m[0])
  }))
  // 세 도구를 한 번에 받아 두어, 하나만 열어 본 사람도 나머지를 오프라인에서 열 수 있게 한다
  await Promise.allSettled([...assets].map(url => cache.add(url)))
}

self.addEventListener('install', event => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(k => k.startsWith('atlas-tools-') && k !== CACHE).map(k => caches.delete(k)))
    await self.clients.claim()
  })())
})

async function staticAsset(request) {
  const cache = await caches.open(CACHE)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res.ok) await cache.put(request, res.clone())
  return res
}

function page(event, path) {
  const update = (async () => {
    const res = await fetch(event.request)
    if (res.ok) {
      const cache = await caches.open(CACHE)
      await cache.put(path, res.clone())
    }
    return res
  })()
  event.waitUntil(update.catch(() => undefined))

  return (async () => {
    const cached = await caches.match(path)
    if (!cached) return update
    return Promise.race([
      update.catch(() => cached),
      new Promise(resolve => setTimeout(() => resolve(cached), NETWORK_WAIT_MS)),
    ])
  })()
}

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(staticAsset(request))
  } else if (request.mode === 'navigate' && PAGES.includes(url.pathname)) {
    event.respondWith(page(event, url.pathname))
  }
})
