import { SLUG_TO_ID, CATEGORIES } from '@/lib/kpatto/expressions-config'
const slugCount = Object.keys(SLUG_TO_ID).length
console.log('SLUG_TO_ID slug 수:', slugCount)
console.log('카테고리별 ids:')
CATEGORIES.forEach(c => console.log(` ${c.key}: ${c.ids.length}개`))
const catTotal = CATEGORIES.reduce((s, c) => s + c.ids.length, 0)
console.log('카테고리 ids 합계:', catTotal)
console.log('slug 전체 IDs:', JSON.stringify(Object.values(SLUG_TO_ID).sort((a,b)=>a-b)))
