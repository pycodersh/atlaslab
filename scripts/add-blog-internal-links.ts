/**
 * add-blog-internal-links.ts
 *
 * 40편 blog_posts content에 내부 링크를 추가한다.
 * - 기존 본문에 다른 포스트의 주제가 언급된 곳에만 링크 삽입
 * - 새 문장 없음, K-PATTO 앱 링크 불변
 * - 존재하지 않는 slug 절대 사용 안 함 (VALID_SLUGS 검증)
 * - 매칭 실패 시 SKIP으로 보고, DB는 건드리지 않음
 *
 * 실행: npx tsx scripts/add-blog-internal-links.ts
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ── 전체 40편 slug (죽은 링크 방지용) ──────────────────────────────────────
const VALID_SLUGS = new Set([
  'how-to-read-hangul-in-one-day',
  'korean-vowels-all-21-explained',
  'korean-consonants-19-basic-sounds',
  'korean-batchim-final-consonants-explained',
  'why-hangul-is-called-scientific-alphabet',
  'how-to-type-korean-phone-computer',
  'korean-romanization-two-spellings',
  'common-pronunciation-mistakes-korean-learners-make',
  'how-to-order-at-a-korean-cafe',
  'korean-subway-phrases-first-trip',
  'ordering-korean-street-food',
  'korean-convenience-store-phrases',
  'how-to-order-at-a-korean-restaurant',
  'korean-noraebang-phrases',
  'shopping-at-a-korean-traditional-market',
  'k-beauty-store-korean-vocabulary',
  'han-river-picnic-korean-phrases',
  'asking-for-directions-in-korean',
  'korean-pharmacy-what-to-say',
  'visiting-a-korean-palace-phrases',
  'ordering-food-delivery-in-korea',
  'buying-clothes-in-korean',
  'seeing-a-doctor-in-korea',
  'korean-topic-vs-subject-particle',
  'korean-object-particle-eul-reul',
  'why-korean-has-no-articles',
  'korean-politeness-levels-explained',
  'korean-sentence-structure-sov-why-the-verb-goes-last',
  'korean-verb-conjugation-ayo-eoyo',
  'korean-past-tense-explained',
  'korean-two-number-systems',
  'korean-irregular-verbs-seven-types',
  'what-k-drama-titles-teach-you-about-korean',
  'busan-dialect-vs-seoul-korean',
  'korean-age-system-explained',
  'korean-new-year-seollal-explained',
  'korean-vs-japanese-what-transfers',
  'korean-internet-slang-guide',
  'nunchi-korean-reading-the-room',
  'konglish-words-when-english-becomes-korean',
])

interface Patch {
  old: string
  new: string
}

// ── 교체 맵 ─────────────────────────────────────────────────────────────────
const PATCHES: Record<string, Patch[]> = {

  // ══ Hangul & Pronunciation ═══════════════════════════════════════════════

  'how-to-read-hangul-in-one-day': [
    // "batchim" 첫 언급 → batchim 포스트 링크
    {
      old: 'called *batchim*,',
      new: 'called [*batchim*](/blog/en/patto/korean-batchim-final-consonants-explained),',
    },
    // "Tense consonants" 항목 → consonants 포스트 링크
    {
      old: '**Tense consonants** (ㄲ ㄸ ㅃ ㅆ ㅉ)',
      new: '[**Tense consonants**](/blog/en/patto/korean-consonants-19-basic-sounds) (ㄲ ㄸ ㅃ ㅆ ㅉ)',
    },
  ],

  'korean-consonants-19-basic-sounds': [
    // 명시적 "the article on batchim" 언급
    {
      old: 'the article on batchim',
      new: '[the article on batchim](/blog/en/patto/korean-batchim-final-consonants-explained)',
    },
  ],

  'korean-romanization-two-spellings': [
    // "Learn Hangul first" → hangul 1-day 포스트
    {
      old: 'Learn Hangul first',
      new: '[Learn Hangul first](/blog/en/patto/how-to-read-hangul-in-one-day)',
    },
    // "Tense consonants disappear" → consonants 포스트
    {
      old: 'Tense consonants disappear',
      new: '[Tense consonants](/blog/en/patto/korean-consonants-19-basic-sounds) disappear',
    },
  ],

  'why-hangul-is-called-scientific-alphabet': [
    // "five base shapes" 언급 → consonants 포스트 (자음 구조 상세 설명)
    {
      old: 'the five base shapes and the two stroke rules',
      new: '[the five base shapes](/blog/en/patto/korean-consonants-19-basic-sounds) and the two stroke rules',
    },
  ],

  'how-to-type-korean-phone-computer': [
    // "the tense consonants" 언급 → consonants 포스트
    {
      old: 'the tense consonants',
      new: 'the [tense consonants](/blog/en/patto/korean-consonants-19-basic-sounds)',
    },
  ],

  'common-pronunciation-mistakes-korean-learners-make': [
    // 음절 연음 설명 → batchim 포스트 (연음 규칙 상세)
    {
      old: 'Sounds assimilate when syllables meet',
      new: '[Sounds assimilate](/blog/en/patto/korean-batchim-final-consonants-explained) when syllables meet',
    },
  ],

  // ══ Korean Grammar ════════════════════════════════════════════════════════

  'korean-sentence-structure-sov-why-the-verb-goes-last': [
    // "을/를 marks the object" → object particle 포스트
    {
      old: '을/를 marks the object',
      new: '[을/를](/blog/en/patto/korean-object-particle-eul-reul) marks the object',
    },
    // "은/는 marks the topic" → topic vs subject 포스트
    {
      old: '은/는 marks the topic',
      new: '[은/는](/blog/en/patto/korean-topic-vs-subject-particle) marks the topic',
    },
  ],

  'why-korean-has-no-articles': [
    // 명시적 "the article on 은/는 vs 이/가" 언급
    {
      old: 'the article on 은/는 vs 이/가',
      new: '[the article on 은/는 vs 이/가](/blog/en/patto/korean-topic-vs-subject-particle)',
    },
  ],

  'korean-verb-conjugation-ayo-eoyo': [
    // 표 안 "ate (past)" → past tense 포스트
    {
      old: '| 먹었어요 | ate (past) |',
      new: '| 먹었어요 | ate ([past tense](/blog/en/patto/korean-past-tense-explained)) |',
    },
  ],

  'korean-past-tense-explained': [
    // "the conjugation you already learned" → ayo/eoyo 포스트
    {
      old: 'the conjugation you already learned',
      new: 'the [conjugation you already learned](/blog/en/patto/korean-verb-conjugation-ayo-eoyo)',
    },
  ],

  'korean-irregular-verbs-seven-types': [
    // ㅂ 불규칙 첫 설명 "before a vowel ending" → ayo/eoyo 포스트
    {
      old: 'ㅂ becomes 우 before a vowel ending',
      new: 'ㅂ becomes 우 before a [vowel ending](/blog/en/patto/korean-verb-conjugation-ayo-eoyo)',
    },
  ],

  // ══ Korean Culture ════════════════════════════════════════════════════════

  'korean-age-system-explained': [
    // "Which speech level you use" → politeness 포스트
    {
      old: 'Which speech level you use',
      new: 'Which [speech level](/blog/en/patto/korean-politeness-levels-explained) you use',
    },
    // "native Korean numbers with 살" → two-number-systems 포스트
    {
      old: 'native Korean numbers with 살',
      new: '[native Korean numbers](/blog/en/patto/korean-two-number-systems) with 살',
    },
  ],

  'korean-new-year-seollal-explained': [
    // "the traditional age system" → age system 포스트
    {
      old: 'the traditional age system',
      new: '[the traditional age system](/blog/en/patto/korean-age-system-explained)',
    },
  ],

  'korean-vs-japanese-what-transfers': [
    // "은는/이가" → topic vs subject 포스트
    {
      old: '은는/이가',
      new: '[은/는 vs 이/가](/blog/en/patto/korean-topic-vs-subject-particle)',
    },
    // "speech levels (합니다체..." → politeness 포스트
    {
      old: 'speech levels (합니다체',
      new: '[speech levels](/blog/en/patto/korean-politeness-levels-explained) (합니다체',
    },
    // "Hangul is 24 letters learnable in a day" → hangul 1-day 포스트
    {
      old: 'Hangul is 24 letters learnable in a day',
      new: '[Hangul is 24 letters learnable in a day](/blog/en/patto/how-to-read-hangul-in-one-day)',
    },
  ],

  'what-k-drama-titles-teach-you-about-korean': [
    // "Konglish in titles" → konglish 포스트
    {
      old: 'Konglish in titles',
      new: '[Konglish](/blog/en/patto/konglish-words-when-english-becomes-korean) in titles',
    },
  ],

  'nunchi-korean-reading-the-room': [
    // "who uses 반말 with whom" → politeness 포스트
    {
      old: 'who uses 반말 with whom',
      new: 'who uses [반말](/blog/en/patto/korean-politeness-levels-explained) with whom',
    },
  ],

  // ══ Real-Life Korean ══════════════════════════════════════════════════════

  'korean-noraebang-phrases': [
    // 명시적 "the article on Konglish" 언급
    {
      old: 'the article on Konglish',
      new: '[the article on Konglish](/blog/en/patto/konglish-words-when-english-becomes-korean)',
    },
  ],

  'k-beauty-store-korean-vocabulary': [
    // "The Konglish trap" 섹션 → konglish 포스트
    {
      old: 'The Konglish trap',
      new: 'The [Konglish](/blog/en/patto/konglish-words-when-english-becomes-korean) trap',
    },
  ],

  'ordering-korean-street-food': [
    // "two number systems" 언급 → two-number-systems 포스트
    {
      old: 'two number systems',
      new: '[two number systems](/blog/en/patto/korean-two-number-systems)',
    },
  ],

  'han-river-picnic-korean-phrases': [
    // "반말 alongside" → politeness 포스트
    {
      old: '반말 alongside',
      new: '[반말](/blog/en/patto/korean-politeness-levels-explained) alongside',
    },
  ],

  'visiting-a-korean-palace-phrases': [
    // "하나, 둘, 셋" 세기 언급 → two-number-systems 포스트
    {
      old: 'count into a photo with 하나, 둘, 셋',
      new: 'count into a photo with [하나, 둘, 셋](/blog/en/patto/korean-two-number-systems)',
    },
  ],

  'seeing-a-doctor-in-korea': [
    // "to a nearby pharmacy" → pharmacy 포스트
    {
      old: 'to a nearby pharmacy',
      new: 'to a nearby [pharmacy](/blog/en/patto/korean-pharmacy-what-to-say)',
    },
  ],

  'korean-pharmacy-what-to-say': [
    // "would need a doctor elsewhere" → seeing-a-doctor 포스트
    {
      old: 'would need a doctor elsewhere',
      new: 'would need [a doctor](/blog/en/patto/seeing-a-doctor-in-korea) elsewhere',
    },
  ],

  'korean-internet-slang-guide': [
    // "used in actual cafes" → cafe 포스트
    {
      old: 'used in actual cafes',
      new: 'used in [actual cafes](/blog/en/patto/how-to-order-at-a-korean-cafe)',
    },
  ],

  'buying-clothes-in-korean': [
    // "Market stalls and small shops" → traditional market 포스트
    {
      old: 'Market stalls and small shops',
      new: '[Market stalls](/blog/en/patto/shopping-at-a-korean-traditional-market) and small shops',
    },
  ],
}

// ── 죽은 링크 사전 검증 ────────────────────────────────────────────────────
function validatePatches(): boolean {
  const urlRe = /\(\/blog\/en\/patto\/([^)]+)\)/g
  let ok = true
  for (const [slug, patches] of Object.entries(PATCHES)) {
    for (const p of patches) {
      let m: RegExpExecArray | null
      while ((m = urlRe.exec(p.new)) !== null) {
        const target = m[1]
        if (!VALID_SLUGS.has(target)) {
          console.error(`  ✗ INVALID SLUG in patch for "${slug}": "${target}"`)
          ok = false
        }
        if (target === slug) {
          console.error(`  ✗ SELF-LINK in "${slug}"`)
          ok = false
        }
      }
      urlRe.lastIndex = 0
    }
  }
  return ok
}

// ── 단일 교체 함수 (첫 번째 occurrence만) ───────────────────────────────────
function replaceFirst(content: string, oldText: string, newText: string): string {
  const idx = content.indexOf(oldText)
  if (idx === -1) return content
  return content.slice(0, idx) + newText + content.slice(idx + oldText.length)
}

async function main() {
  console.log('=== 내부 링크 추가 스크립트 ===\n')

  // 1. 패치 slug 검증
  console.log('── 1. 링크 유효성 사전 검증 ──')
  if (!validatePatches()) {
    console.error('\n❌ 유효하지 않은 slug 발견. 중단합니다.')
    process.exit(1)
  }
  const allTargetSlugs = new Set<string>()
  const urlRe = /\(\/blog\/en\/patto\/([^)]+)\)/g
  for (const patches of Object.values(PATCHES)) {
    for (const p of patches) {
      let m: RegExpExecArray | null
      while ((m = urlRe.exec(p.new)) !== null) allTargetSlugs.add(m[1])
      urlRe.lastIndex = 0
    }
  }
  console.log(`✓ 링크 대상 slug ${allTargetSlugs.size}종 모두 VALID_SLUGS 내 확인`)
  console.log(`  대상: ${[...allTargetSlugs].join(', ')}\n`)

  // 2. 영향받는 포스트 DB에서 한 번에 페치
  const slugsToFetch = Object.keys(PATCHES)
  console.log(`── 2. DB 조회: ${slugsToFetch.length}건 ──`)
  const { data: posts, error: fetchErr } = await sb
    .from('blog_posts')
    .select('id, slug, content')
    .eq('locale', 'en')
    .eq('app', 'k-patto')
    .in('slug', slugsToFetch)

  if (fetchErr) {
    console.error('DB 조회 실패:', fetchErr.message)
    process.exit(1)
  }
  if (!posts || posts.length === 0) {
    console.error('포스트를 찾을 수 없습니다.')
    process.exit(1)
  }

  const postMap = new Map<string, { id: string; content: string }>()
  for (const p of posts) postMap.set(p.slug, { id: p.id, content: p.content })

  const missingInDB = slugsToFetch.filter(s => !postMap.has(s))
  if (missingInDB.length > 0) {
    console.warn(`⚠️  DB에 없는 slug (${missingInDB.length}건): ${missingInDB.join(', ')}`)
  }
  console.log(`✓ ${postMap.size}건 조회 완료\n`)

  // 3. 교체 적용 + 보고
  console.log('── 3. 교체 적용 ──')
  const updates: { id: string; slug: string; content: string; linkCount: number }[] = []
  const skipped: { slug: string; old: string }[] = []

  for (const [slug, patches] of Object.entries(PATCHES)) {
    const row = postMap.get(slug)
    if (!row) {
      console.log(`  [SKIP - DB없음] ${slug}`)
      continue
    }

    let content = row.content
    let applied = 0

    for (const p of patches) {
      const before = content
      content = replaceFirst(content, p.old, p.new)
      if (content !== before) {
        applied++
        console.log(`  ✓ [${slug}]`)
        console.log(`      "${p.old.slice(0, 60)}"`)
        console.log(`    → "${p.new.slice(0, 80)}"`)
      } else {
        console.log(`  ✗ [${slug}] NOT FOUND: "${p.old.slice(0, 60)}"`)
        skipped.push({ slug, old: p.old })
      }
    }

    if (applied > 0) {
      updates.push({ id: row.id, slug, content, linkCount: applied })
    }
  }

  console.log()

  // 4. DB 업데이트
  console.log(`── 4. DB 업데이트: ${updates.length}건 ──`)
  let ok = 0; let fail = 0
  const failedSlugs: string[] = []

  for (const u of updates) {
    const { error } = await sb
      .from('blog_posts')
      .update({ content: u.content })
      .eq('id', u.id)

    if (error) {
      console.error(`  ✗ ${u.slug}: ${error.message}`)
      failedSlugs.push(u.slug)
      fail++
    } else {
      console.log(`  ✓ ${u.slug} (링크 +${u.linkCount})`)
      ok++
    }
  }

  // 5. 최종 보고
  console.log('\n══════════════════════════════════════════')
  console.log('글별 추가 링크 수:')
  for (const u of updates) {
    console.log(`  ${u.slug.padEnd(52)} +${u.linkCount}`)
  }

  if (skipped.length > 0) {
    console.log(`\n⚠️  매칭 실패 (NOT FOUND) ${skipped.length}건:`)
    for (const s of skipped) {
      console.log(`  [${s.slug}] "${s.old.slice(0, 60)}"`)
    }
  }

  const totalLinks = updates.reduce((s, u) => s + u.linkCount, 0)
  console.log(`\n완료: ${ok}건 업데이트 / ${fail}건 실패`)
  console.log(`추가된 내부 링크 총 ${totalLinks}개`)
  console.log(`NOT FOUND: ${skipped.length}건`)
  console.log('죽은 링크: 0건 (VALID_SLUGS 사전 검증 통과)')

  if (fail > 0) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) })
