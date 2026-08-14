/**
 * k-patto 영어 블로그 5편 삽입
 * locale='en', app='k-patto', is_paused=false
 * published_at: patto KO 10편(03:04 UTC)보다 나중인 과거 시각, 1분 간격
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)
const PROD = 'https://www.atlaslabstudios.com'

// ── 삽입할 5편 ─────────────────────────────────────────────────────────────
const POSTS = [
  {
    slug: 'is-korean-hard-to-learn-for-english-speakers',
    locale: 'en', app: 'k-patto',
    category: 'Getting Started',
    tags: ['learn korean', 'beginners', 'difficulty', 'hangul'],
    title: 'Is Korean Hard to Learn for English Speakers?',
    description: 'The honest answer: the alphabet is easy, the grammar is genuinely different, and the hard part isn\'t where most beginners expect.',
    content: `You'll find two kinds of answers online. One says Korean is impossible and takes 2,200 hours. The other says you can read Hangul in an hour so it's easy.\n\nBoth are true, and neither is useful. Here's a breakdown of what's actually hard and what isn't.\n\n## What's genuinely easy\n\n**The writing system.** Hangul was designed in the 15th century to be learnable, and it shows. It's 24 letters, fully phonetic, with consonant shapes that hint at how your mouth makes the sound. Most people can sound out words within a few days.\n\nThis is a real advantage. With Japanese or Chinese you'd spend months before you could read anything at all.\n\n**Pronunciation.** Korean has no tones. Vowel and consonant sounds map reasonably well onto English ones, with a handful of exceptions. You'll have an accent, but people will understand you.\n\n**No gendered nouns, no plurals to worry about, no verb conjugation by person.** English speakers coming from Spanish or French find this a relief. The verb doesn't change based on who's doing the action.\n\n## What's genuinely hard\n\n**Word order.** Korean puts the verb at the end. \`I ate lunch at the cafe\` becomes something closer to \`I cafe-at lunch ate\`. This sounds like a small thing and isn't. It means you can't translate as you listen — you have to hold the whole sentence and wait for the verb to find out what happened.\n\nThis is the single biggest adjustment, and it takes months to stop feeling backwards.\n\n**Particles.** Korean marks the role of each word with a small tag attached to it. 은/는 marks the topic, 이/가 the subject, 을/를 the object. English does this with word order instead, so there's no equivalent to lean on. The distinction between 은/는 and 이/가 in particular takes a long time to feel natural.\n\n**Speech levels.** Korean changes its verb endings based on who you're talking to. The same sentence has a casual form, a polite form, and a formal one. You can't opt out — every sentence you say picks one. Getting it wrong isn't grammatically incorrect so much as socially off.\n\n**Vocabulary shares almost nothing with English.** With French or German you get thousands of free words. With Korean you don't, apart from loanwords. Every word is new.\n\n## Where the difficulty actually sits\n\nNotice that the hard parts aren't the ones beginners worry about.\n\nMost people start by worrying about Hangul and pronunciation. Those are the easy parts, and they're done in a week or two.\n\nThe difficulty is in **restructuring how you build a sentence** — verb last, particles marking roles, endings shifting by relationship. That's not memorization. It's rewiring, and it takes exposure over time.\n\n## What this means practically\n\nThe US Foreign Service Institute puts Korean in its hardest category for English speakers, roughly 2,200 class hours to professional working proficiency. That number scares people, but it's aimed at a very high bar — reading newspapers, handling negotiations.\n\nFor ordering food, asking directions, and holding a simple conversation, you're looking at a fraction of that. Beginners regularly reach basic conversational ability in months, not years.\n\nAnd the curve is front-loaded in a good way. Because Hangul is fast and pronunciation is manageable, you get to "I can read this and say something" much sooner than the FSI number suggests.\n\n## The approach that helps\n\nGiven where the difficulty sits, a few things follow.\n\n**Learn phrases, not words.** Because word order is unfamiliar, assembling sentences from vocabulary is slow and error-prone at the start. Learning whole patterns — \`___ 주세요\` for requests, \`___ 어떻게 가요?\` for directions — sidesteps the assembly problem entirely.\n\n**Pick one speech level first.** The polite 요 form covers almost every situation a learner will be in. Learn it thoroughly before worrying about the others.\n\n**Don't drill particles in isolation.** 은/는 vs 이/가 doesn't yield to explanation alone. It comes from seeing them used in context, many times.\n\n---\n\n**K-PATTO teaches Korean through webtoon stories**, one expression pattern at a time — 325 phrases with audio, in the order you'd actually need them.`,
  },
  {
    slug: 'eun-neun-vs-i-ga-difference',
    locale: 'en', app: 'k-patto',
    category: 'Grammar',
    tags: ['korean particles', 'grammar', '은는', '이가'],
    title: '은/는 vs 이/가: What\'s the Actual Difference?',
    description: 'Both get translated as nothing in English, which is why the usual explanations don\'t stick. Here\'s the difference in terms you can actually use.',
    content: `This is the question every Korean learner hits, usually in week three, and the standard answer — "은/는 is the topic marker, 이/가 is the subject marker" — helps almost nobody. English has no topic marker, so the label explains nothing.\n\nHere's a way in that's more useful.\n\n## Start with what they do, not what they're called\n\n**이/가 points at something.** It picks one thing out and says: this one, specifically.\n\n**은/는 sets the frame.** It says: as for this thing, here's what I want to say about it.\n\nThat difference in feel drives most of the usage.\n\n(Which form you use is just sound. 이 and 은 go after a consonant, 가 and 는 after a vowel. That part is mechanical.)\n\n## The clearest case: answering a question\n\nSomeone asks **누가 왔어요?** — who came?\n\nYou answer **에마가 왔어요.** Emma came.\n\nYou use 가 because the question is *which person*, and you're pointing at the answer. Using 는 here would sound off.\n\nNow someone asks **에마는 뭐 해요?** — what's Emma doing?\n\nYou answer **에마는 공부해요.** Emma is studying.\n\nHere 는 is right, because Emma isn't the new information. She's the frame. The new part is what she's doing.\n\n**Rule of thumb: 이/가 marks new information, 은/는 marks information already on the table.**\n\n## The second big use: contrast\n\n은/는 quietly implies a comparison. This is where learners feel something is odd without knowing why.\n\n**저는 커피 좋아해요.** — I like coffee. (…others might not. Or: as for me, specifically.)\n\nIf someone says **김치는 좋아해요**, a Korean ear hears an unfinished thought — I like *kimchi*, implying there's something else they don't like. It's a small implication, but it's there.\n\nThis is why 는 can sound slightly defensive or pointed if you use it where 가 belongs.\n\n## Introducing vs continuing\n\nWatch what happens across two sentences.\n\n**친구가 왔어요. 그 친구는 미국 사람이에요.**\nA friend came. That friend is American.\n\nFirst mention uses 가 — new person, pointed at. Second mention uses 는 — now established, so it becomes the frame for the next statement.\n\nThis pattern shows up constantly in stories and conversation. New thing enters with 이/가, then continues with 은/는.\n\n## Why explanations only get you so far\n\nYou can understand everything above and still pick wrong in conversation. That's normal, and it's not a sign you've misunderstood.\n\nParticles operate below the level of conscious rules for native speakers. They're chosen by feel, from thousands of hours of exposure. You're building that same feel, and rules can only point you in the direction.\n\nWhat helps:\n\n**Notice, don't drill.** When you read or listen, pay attention to which particle appears and ask why. Ten noticed examples beat a hundred fill-in-the-blank exercises.\n\n**Learn them inside phrases.** \`저는 ___예요\` and \`제 이름은 ___예요\` come as units. Learn the unit and the particle comes free.\n\n**Accept a long tail.** Advanced learners still occasionally pick the less natural one. It rarely blocks communication — people will understand you either way.\n\n## The short version\n\n- Answering *which one* → 이/가\n- Talking *about* something already known → 은/는\n- Implying a contrast → 은/는\n- First mention → 이/가, after that → 은/는\n\nThese cover most everyday cases. The exceptions come later, and by then you'll have enough exposure that they'll feel less arbitrary.\n\n---\n\n**K-PATTO teaches particles the way you'll actually meet them** — inside real sentences from webtoon scenes, with audio, rather than as isolated grammar rules.`,
  },
  {
    slug: 'why-korean-has-two-number-systems',
    locale: 'en', app: 'k-patto',
    category: 'Grammar',
    tags: ['korean numbers', 'sino-korean', 'native korean', 'counters'],
    title: 'Why Korean Has Two Number Systems (And When to Use Each)',
    description: '하나 둘 셋 or 일 이 삼? Both are correct — for different things. Here\'s the rule that decides it.',
    content: `You learn 하나, 둘, 셋. Then you learn 일, 이, 삼. Then you find out Koreans use both, sometimes in the same sentence, and the logic isn't obvious.\n\nIt's less arbitrary than it looks.\n\n## Where the two systems come from\n\n**Native Korean numbers** (하나, 둘, 셋, 넷, 다섯...) are the original Korean count words. They only go up to 99 in practical use.\n\n**Sino-Korean numbers** (일, 이, 삼, 사, 오...) came from Chinese, the way Latin numerals came into English. They go up indefinitely.\n\nThis is roughly like English having both *one, two, three* and *mono-, di-, tri-*. Two sets, different jobs.\n\n## The rule that covers most cases\n\n**Native Korean for counting things you can see and count.** People, bottles, hours, cups, books, animals.\n\n**Sino-Korean for abstract or fixed numbers.** Money, dates, phone numbers, minutes, addresses, floors, anything above 99.\n\nIf you can point at the things and count them one by one, it's usually native. If it's a figure written on something, it's usually Sino.\n\n## The one that trips everyone up: time\n\nTelling time uses **both in a single expression.**\n\n**세 시 삼십 분** — three thirty.\n\n세 (native) for the hour, 삼십 (Sino) for the minutes. Every single time.\n\nThe reason fits the rule above: hours are things you count, minutes are a written figure. It feels strange for about a week and then becomes automatic.\n\n## Counters\n\nNative numbers almost never stand alone. They pair with a counter word depending on what you're counting.\n\n- 사람 for people — **세 사람** (three people)\n- 개 for general objects — **사과 세 개** (three apples)\n- 병 for bottles — **맥주 두 병** (two beers)\n- 잔 for cups/glasses — **커피 한 잔** (one coffee)\n- 마리 for animals — **고양이 두 마리** (two cats)\n\nEnglish does this too, just less often: *two sheets of paper*, *three head of cattle*. Korean does it for everything countable.\n\nAnd note the shape change: 하나 → 한, 둘 → 두, 셋 → 세, 넷 → 네 when a counter follows. \`하나 개\` is wrong; \`한 개\` is right.\n\n## What to learn first\n\nDon't try to master both systems at once. Beginners get the most out of this order.\n\n1. **Native 1 to 10 with 개 and 명** — covers ordering food and counting people\n2. **Sino 1 to 10, plus 백/천/만** — covers prices, which you'll need immediately\n3. **Hours in native, minutes in Sino** — covers telling time\n4. **Dates in Sino** — months and days\n5. Everything else as it comes up\n\nSteps 1 to 3 handle a surprising share of daily situations.\n\n## A note on money\n\nKorean counts in units of 만 (10,000), not thousands. So 30,000 won is **삼만 원**, literally three ten-thousands.\n\nThis is a genuine adjustment for English speakers, who chunk numbers in thousands. Prices in Korea are the fastest way to get used to it, since you'll hear them constantly.\n\n## The short version\n\n- Countable things → native (하나, 둘, 셋) + a counter\n- Money, dates, minutes, phone numbers, big numbers → Sino (일, 이, 삼)\n- Time → hour native, minute Sino\n- Native numbers change shape before counters: 한, 두, 세, 네\n\nThat's most of it. The remaining exceptions are few enough to pick up as you meet them.\n\n---\n\n**K-PATTO drills numbers where you'd actually use them** — ordering, paying, telling time — inside webtoon scenes with audio, rather than as a table to memorize.`,
  },
  {
    slug: 'formal-vs-casual-korean-when-to-drop-yo',
    locale: 'en', app: 'k-patto',
    category: 'Grammar',
    tags: ['speech levels', '존댓말', '반말', 'korean etiquette'],
    title: 'Formal vs Casual Korean: When Can You Drop the 요?',
    description: 'Every Korean sentence picks a politeness level — there\'s no neutral option. Here\'s which one to learn first and when it\'s safe to switch.',
    content: `In English, politeness lives in word choice. *Could you possibly pass the salt* versus *pass the salt*. The verb doesn't change.\n\nIn Korean, politeness is built into the verb ending, and **every sentence has to pick one.** There's no neutral setting. This catches learners off guard, because it means you're making a social decision with every single thing you say.\n\n## The three you'll actually meet\n\nKorean textbooks sometimes list seven speech levels. In practice, modern spoken Korean uses three.\n\n**해요체 — the 요 form.** \`가요\`, \`먹어요\`, \`좋아요\`. Polite but not stiff. This is what you'll hear most in daily life, and it's what a learner should default to.\n\n**합니다체 — the formal form.** \`갑니다\`, \`먹습니다\`, \`좋습니다\`. Used in announcements, news broadcasts, presentations, military settings, and by service staff. Correct but distant; using it with a friend sounds odd.\n\n**반말 — the casual form.** \`가\`, \`먹어\`, \`좋아\`. Used with close friends, people clearly younger, and family. Just the 요 form with 요 removed, in most cases.\n\n## Learn the 요 form first, thoroughly\n\nIf you learn only one, learn 해요체.\n\nIt's appropriate with strangers, shopkeepers, coworkers, classmates, and anyone older. It's never rude. At worst it's slightly more polite than needed, which is a harmless place to land.\n\nThe formal 합니다 form is worth recognizing when you hear it — announcements and staff will use it with you — but you rarely need to produce it as a beginner.\n\n## When you can drop the 요\n\nHere's the part that isn't obvious to English speakers: **switching to 반말 isn't just casualness. It's a statement about the relationship.**\n\nIn most cases it's negotiated, not assumed. A Korean speaker will often ask something like **말 놓아도 될까요?** — is it okay if I speak casually? — before switching. That question exists because the switch means something.\n\nSafe to use 반말:\n\n- With close friends your own age, after you've established that\n- With children\n- Talking to yourself, or in inner monologue\n- When the other person has invited it\n\nNot safe:\n\n- With anyone noticeably older, even if they're friendly\n- With someone you just met, however casual the setting\n- At work with anyone senior to you\n- With service staff\n\n**The asymmetry matters.** An older person may speak 반말 to you while you speak 요 back. That's normal, not an insult, and it doesn't mean you can switch.\n\n## What happens if you get it wrong\n\nAs a foreign learner, the risk is smaller than you fear. Korean speakers are generally forgiving with learners and won't take offense at a misused ending.\n\nThe practical consequence of erring polite is nothing at all. The consequence of erring casual is a moment of awkwardness. So the safe default is obvious.\n\nThe one thing to avoid is **mixing levels inside one conversation** with the same person. Ending one sentence with 요 and the next without reads as unsteady rather than casual.\n\n## The mechanics are simpler than the etiquette\n\nThe good news: converting between levels is mostly mechanical.\n\n- 요 form → 반말: drop 요. \`먹어요\` → \`먹어\`, \`좋아요\` → \`좋아\`\n- 요 form → 합니다 form: different ending, but a regular pattern\n\nThe hard part isn't conjugation. It's knowing which to use, and that's social knowledge picked up from watching real interactions.\n\nThis is one reason story-based material helps here — you see who is speaking to whom, and the ending follows from the relationship rather than from a chart.\n\n## The short version\n\n- Default to the 요 form; it's correct in almost every situation you'll be in\n- Recognize 합니다 when you hear it, don't worry about producing it yet\n- Don't switch to 반말 until the relationship makes it clear, or you're invited\n- Erring polite costs nothing\n\n---\n\n**K-PATTO shows expressions in context**, so you see which speech level a character uses and why — with audio for each form, inside webtoon scenes.`,
  },
  {
    slug: 'how-long-to-learn-hangul',
    locale: 'en', app: 'k-patto',
    category: 'Getting Started',
    tags: ['hangul', 'korean alphabet', 'beginners', 'reading'],
    title: 'How Long Does It Take to Learn Hangul?',
    description: 'Most people can read Korean letters within a few days. Here\'s a realistic timeline, and the two things that actually slow beginners down.',
    content: `Hangul is the easiest part of learning Korean, and it's worth knowing that before you start, because the internet will tell you Korean is one of the hardest languages for English speakers. That's true of the grammar. It isn't true of the alphabet.\n\n## A realistic timeline\n\n**Day 1 to 2 — the letters.** 14 consonants and 10 basic vowels. Most people can recognize all of them in a couple of focused sessions.\n\n**Day 3 to 5 — assembling blocks.** Korean stacks letters into syllable blocks rather than writing them in a line. 한 is ㅎ + ㅏ + ㄴ arranged in a square. Once you see the pattern, it clicks quickly.\n\n**Week 1 to 2 — reading slowly.** You can sound out signs and menus, letter by letter. Slow, but it works.\n\n**Month 1 to 3 — reading fluently.** Blocks stop being decoded and start being recognized whole, the way you read English words. This part just takes mileage.\n\nSo: **reading at all takes days. Reading comfortably takes a few months.** Both numbers are far better than any other East Asian writing system.\n\n## Why it's this fast\n\nHangul was created deliberately in the 15th century, not evolved from pictures. The design shows.\n\n**Consonant shapes reflect the mouth.** ㄱ is the shape of the tongue at the back of the mouth. ㅁ is the shape of closed lips. Related sounds share a shape with an extra stroke added — ㄱ, ㅋ, ㄲ are the same family.\n\n**Vowels are built from three pieces.** A vertical line, a horizontal line, and a short stroke. ㅏ ㅓ ㅗ ㅜ are all the same two elements in different arrangements.\n\n**Spelling is close to phonetic.** Unlike English, letters mostly say what they say. There's no *through / though / tough* problem.\n\n## The two things that actually slow people down\n\nAlmost everyone hits the same two walls, and neither is the letters themselves.\n\n**1. Similar-looking letters.** ㅓ and ㅏ. ㅗ and ㅜ. ㅂ and ㅁ. ㄹ and ㄷ. These are genuinely easy to confuse at speed, and confusion here makes reading feel harder than it is.\n\nThe fix is contrast practice — read pairs side by side (어/아, 오/우) rather than one at a time.\n\n**2. Sound-change rules.** This is the real surprise. Korean doesn't always pronounce what's written, because adjacent sounds affect each other.\n\n신라 is written *sin-ra* but pronounced *sil-la*. 좋다 is written *joh-da* but pronounced *jo-ta*. 한국말 becomes *han-gung-mal*.\n\nBeginners often assume they've learned Hangul wrong when this happens. They haven't. These are regular rules, they're learned gradually, and reading aloud with audio is how they sink in.\n\n## What not to do\n\n**Don't use romanization as a crutch.** Reading *annyeonghaseyo* instead of 안녕하세요 feels faster for a week and slows you down for months. Romanization can't represent Korean sounds accurately, and it prevents your eye from learning the blocks. Drop it as early as you can stand to.\n\n**Don't learn all 40+ letters before reading anything.** Learn ten letters, then read words made from those ten. Application beats completeness here.\n\n**Don't skip audio.** Reading Hangul silently teaches your eyes but not your ears. Every letter you learn should come with its sound.\n\n## A practical first week\n\n- **Days 1–2:** Basic consonants and vowels. Read simple two-letter blocks aloud.\n- **Days 3–4:** Blocks with a final consonant (받침). Read real words — 사람, 학교, 친구.\n- **Days 5–6:** Double consonants and compound vowels. Read signs and shop names from photos.\n- **Day 7:** Read a short dialogue aloud without romanization, slowly.\n\nSlow is expected. Speed comes from months of reading, not from more study of the letters.\n\n## After Hangul\n\nOnce you can sound words out, the alphabet stops being the task and exposure becomes the task. The fastest way forward is reading things you actually want to read, with audio alongside, so the sound-change rules settle in without being memorized.\n\n---\n\n**K-PATTO shows every expression in Hangul with native audio and romanization you can move past**, inside webtoon scenes — so reading practice comes with something worth reading.`,
  },
]

async function main() {
  // 1. slug 충돌 확인
  const slugs = POSTS.map(p => p.slug)
  const { data: existing, error: chkErr } = await sb
    .from('blog_posts')
    .select('slug, app, is_paused')
    .in('slug', slugs)
  if (chkErr) throw new Error(`충돌 확인 실패: ${chkErr.message}`)

  if (existing && existing.length > 0) {
    console.error('\n⛔ slug 충돌 발견 — 중단')
    for (const e of existing) console.error(`  slug=${e.slug} app=${e.app} is_paused=${e.is_paused}`)
    process.exit(1)
  }
  console.log(`slug 충돌 없음 (${slugs.length}개 확인)\n`)

  // 2. patto KO 마지막 published_at 확인 (그보다 나중 시각 사용)
  const { data: lastKo } = await sb
    .from('blog_posts')
    .select('published_at')
    .eq('app', 'patto')
    .eq('is_paused', false)
    .order('published_at', { ascending: false })
    .limit(1)

  // patto KO 마지막 시각 + 1분부터 시작
  const baseTime = lastKo?.[0]?.published_at
    ? new Date(new Date(lastKo[0].published_at).getTime() + 60_000)
    : new Date(Date.now() - 10 * 60_000)
  console.log(`기준 시각(patto KO 마지막+1분): ${baseTime.toISOString()}`)

  // 3. 삽입
  const rows = POSTS.map((p, i) => {
    const t = new Date(baseTime.getTime() + i * 60_000)
    return {
      slug:        p.slug,
      locale:      p.locale,
      app:         p.app,
      category:    p.category,
      tags:        p.tags,
      title:       p.title,
      description: p.description,
      content:     p.content,
      is_paused:   false,
      published_at: t.toISOString(),
    }
  })

  const { error: insErr } = await sb.from('blog_posts').insert(rows)
  if (insErr) throw new Error(`삽입 실패: ${insErr.message}`)
  console.log(`✅ ${rows.length}편 삽입 완료`)
  console.log('\n삽입된 published_at:')
  for (const r of rows) console.log(`  ${r.slug}  →  ${r.published_at}`)

  // 4. HTTP 200 검증
  console.log('\n── HTTP 200 검증 ──────────────────────────────')
  let passCount = 0
  for (const p of POSTS) {
    const url = `${PROD}/blog/en/k-patto/${p.slug}`
    const res = await fetch(url)
    const icon = res.status === 200 ? '✅' : '❌'
    if (res.status === 200) passCount++
    console.log(`  ${icon} ${res.status}  ${url}`)
  }

  // 5. 사이트맵 등재 확인
  console.log('\n── 사이트맵 확인 ──────────────────────────────')
  const xml = await fetch(`${PROD}/sitemap.xml`).then(r => r.text())
  let smCount = 0
  for (const p of POSTS) {
    if (xml.includes(p.slug)) { console.log(`  ✅ ${p.slug}`); smCount++ }
    else                      { console.log(`  ❌ ${p.slug}`) }
  }

  // 6. 홈 "From the blog" 섹션 확인
  console.log('\n── 홈 From the blog 확인 ──────────────────────')
  const home = await fetch(`${PROD}`).then(r => r.text())
  const newTitleFound = POSTS.some(p => home.includes(p.title.slice(0, 20)))
  console.log(newTitleFound ? '  ✅ 홈에 새 글 제목 노출' : '  ⚠️  홈에 아직 미노출 (CDN 캐시 가능)')

  // 7. 공개 글 총합
  const { count } = await sb
    .from('blog_posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_paused', false)
    .lte('published_at', new Date().toISOString())
  console.log(`\n공개 글 총합: ${count}편`)
  console.log(count === 75 ? '✅ 75편 정확' : `⚠️  예상 75편, 실제 ${count}편`)

  console.log(`\n완료: ${passCount}/${POSTS.length} 200 OK  |  사이트맵: ${smCount}/${POSTS.length}`)
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
