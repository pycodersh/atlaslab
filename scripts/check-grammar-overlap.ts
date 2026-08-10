import { SLUG_TO_ID, SEO_EXPRESSION_IDS, CATEGORIES } from '@/lib/kpatto/expressions-config'

const slugIds = new Set(Object.values(SLUG_TO_ID))
console.log('SLUG_TO_ID IDs 수:', slugIds.size)
console.log('SEO_EXPRESSION_IDS 수:', SEO_EXPRESSION_IDS.length)
console.log('SEO_EXPRESSION_IDS === SLUG_TO_ID values:', JSON.stringify([...slugIds].sort((a,b)=>a-b)) === JSON.stringify([...new Set(SEO_EXPRESSION_IDS)].sort((a,b)=>a-b)))

// grammar-particles 카테고리 확인
const grammarCat = CATEGORIES.find(c => c.key === 'grammar-particles')
if (!grammarCat) { console.log('grammar-particles 카테고리 없음!'); process.exit(1) }

console.log('\ngrammar-particles ids:', grammarCat.ids.length, '개')
const notInSlug = grammarCat.ids.filter(id => !slugIds.has(id))
const inSlug = grammarCat.ids.filter(id => slugIds.has(id))
console.log('SLUG_TO_ID에 있는 grammar ids:', inSlug.length)
console.log('SLUG_TO_ID에 없는 grammar ids:', notInSlug.length, notInSlug.length > 0 ? JSON.stringify(notInSlug) : '')

// SEO_EXPRESSION_IDS와 grammar-particles ids 교집합
const seoSet = new Set(SEO_EXPRESSION_IDS)
const grammarInSeo = grammarCat.ids.filter(id => seoSet.has(id))
console.log('SEO_EXPRESSION_IDS에 있는 grammar ids:', grammarInSeo.length)

// 전체 카테고리 vs SLUG_TO_ID 비교
console.log('\n=== 카테고리별 SLUG_TO_ID 포함 여부 ===')
for (const cat of CATEGORIES) {
  const missing = cat.ids.filter(id => !slugIds.has(id))
  console.log(`${cat.key}: ${cat.ids.length}개 중 ${missing.length}개 누락${missing.length > 0 ? ': '+JSON.stringify(missing.slice(0,5)) : ''}`)
}
