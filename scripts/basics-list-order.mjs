// 목록 순서를 읽는다(dev 서버 localhost:3001 필요) → out/remotion/list-order.json. 다음은 scripts/basics-thumb-colors.mjs
import { chromium } from 'playwright'
import fs from 'node:fs'
const b = await chromium.launch()
const p = await (await b.newContext({ viewport: { width: 1280, height: 1000 }, locale: 'en-US' })).newPage()
const slugsOf = async url => { await p.goto(url, { waitUntil: 'networkidle', timeout: 120000 }); return p.$$eval('a.bl-card', as => as.map(a => a.getAttribute('href').split('/').pop())) }
const all = [...await slugsOf('http://localhost:3001/blog?tab=basics'), ...await slugsOf('http://localhost:3001/blog?tab=basics&page=2')]
const subs = await p.$$eval('a', as => as.filter(a => /sub=/.test(a.href)).map(a => [a.textContent.trim(), a.href]))
const res = { all, subs: {} }
for (const [name, href] of subs) { const s = [...await slugsOf(href)]; const u = new URL(href); u.searchParams.set('page', '2'); res.subs[name] = [...s, ...await slugsOf(u.toString())] }
fs.writeFileSync('out/remotion/list-order.json', JSON.stringify(res, null, 1))
console.log(all.length, Object.entries(res.subs).map(([k, v]) => k + ':' + v.length).join(' | '))
await b.close()
