import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local before creating Supabase client
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf-8').replace(/^﻿/, '')
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq < 0) continue
    process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim()
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[~\(\)\/\\]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function getEnMistakes(patternText: string): string {
  const p = patternText.toLowerCase()

  // ~ing ending required
  if (p.includes('~ing') || p.includes('ing?')) {
    return `- **Forgetting the -ing form.** "${patternText}" requires a gerund after it. Saying *"I'm thinking about go"* instead of *"I'm thinking about going"* is the #1 mistake learners make with this pattern. Always add -ing to the verb that follows.
- **Using an infinitive instead.** Some learners write *"I ended up to leave"* by mistake. This pattern specifically needs -ing — there's no exception. Drill it until it feels automatic.
- **Dropping the preposition.** Depending on the full pattern, forgetting the linking word (about, for, of) before the -ing form changes the meaning entirely. Keep the full structure intact.`
  }

  // Questions
  if (p.includes('?')) {
    return `- **Intonation falling instead of rising.** In English, yes/no questions use rising intonation at the end. "${patternText}" loses its questioning feel if your voice drops. Practice saying it out loud with a slight rise.
- **Translating word-for-word from your native language.** This pattern has a fixed word order in English that may not match how you'd phrase it in Korean. Memorize the structure as a chunk, not word by word.
- **Using it too formally.** "${patternText}" is conversational — in very formal writing or presentations, a slightly different phrasing may be more appropriate. Know your context.`
  }

  // Modals: should, have to, can, could, would
  if (p.includes('should') || p.includes('have to') || p.includes('must')) {
    return `- **Confusing obligation levels.** "${patternText}" carries a specific degree of necessity. Using it interchangeably with stronger or weaker alternatives ("must", "need to") changes the tone significantly — sometimes making you sound too demanding or too casual.
- **Leaving out the base verb.** After "${patternText}", always follow with the base form of a verb (no -ing, no -ed). Saying *"I should going"* is a common slip that sounds unnatural to native ears.
- **Overusing it.** Repeating this pattern in every sentence makes speech sound robotic. Vary your expression while keeping this pattern as your go-to for the right situations.`
  }

  // Past / used to / ended up
  if (p.includes('used to') || p.includes('ended up') || p.includes('have been') || p.includes("i've been")) {
    return `- **Confusing it with the simple past.** "${patternText}" implies something more than a one-time action — it suggests habit, process, or result. Saying *"I used to ate"* instead of *"I used to eat"* or mixing up the tense is a frequent error.
- **Using it for present habits.** This structure describes past states or completed processes, not current routines. Applying it to things happening right now sounds grammatically off to native speakers.
- **Forgetting the -ing when required.** If the pattern ends with -ing (like "ended up ~ing"), the verb that follows must also be in gerund form. This is non-negotiable in natural English.`
  }

  // Future / planning / going to / about to
  if (p.includes('going to') || p.includes('planning') || p.includes('about to') || p.includes('supposed to')) {
    return `- **Contracting "going to" in writing.** "Gonna" is fine in casual speech but looks unprofessional in written English. Know when to use the full form.
- **Using it for things that already happened.** "${patternText}" signals intention or near-future action. Applying it to past events confuses your listener about the timeline.
- **Mixing up "will" and "${patternText}".** "Will" expresses a decision made in the moment; "${patternText}" signals something already planned. They're not interchangeable — native speakers notice the difference immediately.`
  }

  // Default — general mistakes
  return `- **Word-for-word translation.** Many learners mentally translate "${patternText}" from their native language, which often produces unnatural word order. Instead, learn the whole pattern as a fixed chunk and produce it as a unit.
- **Hesitating mid-pattern.** Pausing between words in a set phrase signals to native speakers that you're constructing it in real time. The goal is to produce the full expression smoothly — which only comes from repetition out loud, not silent study.
- **Using it in the wrong register.** "${patternText}" fits naturally in everyday conversation. Dropping it into formal writing or academic contexts without adjustment can sound too casual. Always consider your audience.`
}

function getKoMistakes(patternText: string): string {
  const p = patternText.toLowerCase()

  if (p.includes('~ing') || p.includes('ing?')) {
    return `- **-ing를 빼먹는 실수.** "${patternText}" 다음에는 반드시 동사에 -ing를 붙여야 합니다. *"I'm thinking about go"*처럼 원형 동사를 쓰는 건 가장 흔한 오류입니다. 이 구조는 예외가 없으니 통째로 외워두세요.
- **부정사(to + 동사)와 혼동.** 비슷한 표현처럼 느껴져서 *"I ended up to leave"* 식으로 쓰는 경우가 있습니다. 이 패턴은 반드시 -ing가 따라옵니다.
- **전치사 생략.** 패턴 중간에 있는 전치사(about, for, of 등)를 빼면 의미가 달라지거나 비문이 됩니다. 패턴 전체를 하나의 단위로 기억하세요.`
  }

  if (p.includes('?')) {
    return `- **억양을 내리는 실수.** 영어 의문문은 끝에서 억양이 올라가야 합니다. "${patternText}"도 마찬가지입니다. 억양이 내려가면 질문이 아닌 선언처럼 들립니다.
- **모국어 어순대로 번역.** 한국어 어순을 그대로 영어로 옮기면 어색한 문장이 됩니다. 이 패턴은 한 덩어리로 통째로 암기하는 것이 효과적입니다.
- **격식 상황에서 그대로 사용.** "${patternText}"는 구어체에 어울립니다. 공식적인 자리나 문서에서는 더 격식 있는 표현이 적합할 수 있습니다.`
  }

  if (p.includes('should') || p.includes('have to') || p.includes('must')) {
    return `- **의무 강도 혼동.** "${patternText}"가 나타내는 강제성은 "must"나 "need to"와 다릅니다. 상황에 맞지 않는 강도의 표현을 쓰면 의도와 다른 뉘앙스가 전달됩니다.
- **뒤에 오는 동사 형태 오류.** 이 패턴 뒤에는 동사 원형이 와야 합니다. *"I should going"*처럼 -ing를 붙이는 건 원어민에게 매우 어색하게 들립니다.
- **과도한 반복 사용.** 매 문장마다 같은 패턴을 반복하면 대화가 로봇처럼 들립니다. 이 패턴이 필요한 상황을 정확히 파악해서 적절히 사용하세요.`
  }

  return `- **단어별 직역.** "${patternText}"를 한국어에서 단어 하나씩 번역하면 어색한 영어가 됩니다. 전체 패턴을 하나의 청크(chunk)로 외워두는 것이 훨씬 효과적입니다.
- **패턴 중간에 멈추는 습관.** 말하다가 중간에 멈추면 원어민 눈에는 패턴을 실시간으로 조립하는 것처럼 보입니다. 반복 연습으로 패턴 전체가 자연스럽게 나오도록 만드세요.
- **상황에 맞지 않는 사용.** "${patternText}"는 일상 대화에서 자연스럽습니다. 격식 있는 글이나 발표에서 그대로 쓰면 너무 가볍게 느껴질 수 있으니 상황을 고려하세요.`
}

function generateEnContent(
  patternText: string,
  meaning: string,
  note: string | null,
  examples: Array<{ sentence: string; translation: string }>
): { title: string; description: string; content: string; tags: string[] } {
  const slug = slugify(patternText)
  const title = `How to Use "${patternText}" in English — Real Examples & When to Say It`
  const description = `Master the English pattern "${patternText}" with real examples, common mistakes, and tips to sound natural in everyday conversation.`

  const exampleLines = examples.slice(0, 3).map((e, i) => `
**Example ${i + 1}:** *${e.sentence}*
${e.translation ? `*(${e.translation})*` : ''}

This shows how "${patternText}" works naturally in context — ${i === 0 ? 'in a direct, everyday situation' : i === 1 ? 'when expressing something more personal' : 'when used in a slightly different setting'}.`).join('\n')

  const content = `## When Do You Actually Need This Pattern?

Imagine you're in a conversation and you want to express something naturally — not stiff, not textbook-sounding. That's exactly where **"${patternText}"** comes in.

This pattern means: *${meaning}*.${note ? ` ${note}` : ''}

It's one of those phrases that native English speakers use without even thinking about it. Once you internalize it, you'll start hearing it everywhere — in movies, conversations, and everyday life.

---

## What Does "${patternText}" Really Mean?

At its core, this pattern is used to **${meaning.toLowerCase()}**. It's direct, natural, and widely understood across all English-speaking contexts.

What makes it powerful is its versatility. You can use it in casual conversations with friends, in professional settings, and even in writing. The key is knowing when to reach for it — and once you do, it becomes automatic.

${note ? `**Important note:** ${note}\n\n---\n` : '---\n'}

## Real Examples in Context

Here are three examples pulled directly from Patto's pattern library:
${exampleLines}

---

## Common Mistakes to Avoid

${getEnMistakes(patternText)}

---

## Quick Practice Tip

The fastest way to make any pattern automatic? Use it three times today in a real sentence — out loud. It doesn't matter if no one hears you. The act of producing the pattern (not just recognizing it) is what builds fluency.

Try this right now:
1. Write a sentence using "${patternText}" about your morning
2. Say it out loud
3. Change one word and say it again

That's it. Three reps, and your brain starts treating it as familiar territory.

---

Practice this pattern inside Patto's story-based lessons. [Start for free →](/patto/home)`

  const tags = ['patterns', 'english', 'speaking', slug.split('-')[0] || 'conversation']

  return { title, description, content, tags }
}

function generateKoContent(
  patternText: string,
  meaning: string,
  note: string | null,
  examples: Array<{ sentence: string; translation: string }>
): { title: string; description: string; content: string; tags: string[] } {
  const title = `"${patternText}" 완벽 가이드 — 원어민처럼 자연스럽게 쓰는 법`
  const description = `영어 패턴 "${patternText}"의 뜻과 실제 사용법, 흔한 실수까지 — 원어민처럼 자연스럽게 말하는 방법을 배워보세요.`

  const exampleLines = examples.slice(0, 3).map((e, i) => `
**예문 ${i + 1}:** *${e.sentence}*
${e.translation ? `→ ${e.translation}` : ''}

${i === 0 ? '일상적인 상황에서' : i === 1 ? '좀 더 개인적인 표현으로' : '다른 맥락에서'} "${patternText}"가 어떻게 자연스럽게 쓰이는지 보여줍니다.`).join('\n')

  const content = `## 이 패턴이 왜 필요할까요?

영어로 대화할 때 자연스럽게 말하고 싶은데, 교과서 같은 표현만 떠오른 적 있으신가요? 바로 그때 필요한 것이 **"${patternText}"** 패턴입니다.

이 패턴의 의미: *${meaning}*.${note ? ` ${note}` : ''}

원어민들은 이 표현을 거의 무의식적으로 사용합니다. 한번 익혀두면 영화, 드라마, 일상 대화 어디서나 들리기 시작할 거예요.

---

## "${patternText}"는 정확히 무슨 뜻인가요?

이 패턴의 핵심은 **${meaning}**하는 것입니다. 격식 없는 친구와의 대화부터 직장 환경까지, 다양한 상황에서 활용할 수 있습니다.

이 패턴이 강력한 이유는 **범용성** 때문입니다. 언제 써야 할지 감이 오면, 자동으로 튀어나올 만큼 자연스러워집니다.

${note ? `**참고:** ${note}\n\n---\n` : '---\n'}

## 실제 예문으로 배우기

Patto의 패턴 라이브러리에서 가져온 실제 예문입니다:
${exampleLines}

---

## 이런 실수는 피하세요

${getKoMistakes(patternText)}

---

## 빠른 연습 팁

어떤 패턴이든 자동화하는 가장 빠른 방법은? 오늘 실제 문장으로 세 번 소리 내어 말해보는 것입니다. 아무도 듣지 않아도 괜찮습니다. 패턴을 인식하는 것이 아니라 **직접 만들어내는** 것이 유창함을 만듭니다.

지금 바로 해보세요:
1. 오늘 아침 일과를 "${patternText}"를 사용해 문장으로 만들기
2. 소리 내어 말하기
3. 단어 하나 바꿔서 다시 말하기

딱 세 번만 반복하면 뇌가 이 표현을 익숙한 영역으로 받아들이기 시작합니다.

---

패토의 스토리 기반 학습으로 이 패턴을 연습해보세요. [무료로 시작하기 →](/patto/home)`

  const tags = ['패턴', '영어', '회화', '영어말하기']

  return { title, description, content, tags }
}

async function main() {
  console.log('Fetching patterns 1-50...')

  const { data: patterns, error } = await supabase
    .from('patterns')
    .select(`
      id,
      order_index,
      pattern_translations(pattern_text, meaning, ui_lang),
      examples(sentence, difficulty, order_index, example_translations(translation, ui_lang))
    `)
    .order('order_index')
    .range(250, 399)

  if (error) {
    console.error('Failed to fetch patterns:', error.message)
    process.exit(1)
  }

  if (!patterns || patterns.length === 0) {
    console.log('No patterns found.')
    process.exit(0)
  }

  console.log(`Found ${patterns.length} patterns. Generating posts...`)

  let successCount = 0
  const failures: string[] = []

  for (const pattern of patterns) {
    const translations = Array.isArray(pattern.pattern_translations)
      ? pattern.pattern_translations
      : [pattern.pattern_translations]

    const enTrans = translations.find((t: any) => t?.ui_lang === 'en')
    if (!enTrans?.pattern_text) {
      failures.push(`pattern #${pattern.order_index}: no EN translation`)
      continue
    }

    const patternText = enTrans.pattern_text
    const meaning = enTrans.meaning || ''
    const note = null

    // Get examples sorted by difficulty then order_index
    const allExamples = (Array.isArray(pattern.examples) ? pattern.examples : []) as any[]
    const normalExamples = allExamples
      .filter((e: any) => e.difficulty === 'normal')
      .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    const advancedExamples = allExamples
      .filter((e: any) => e.difficulty === 'advanced')
      .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))

    const examplesPool = [...normalExamples, ...advancedExamples].slice(0, 3)

    const examplesWithTranslation = examplesPool.map((e: any) => {
      const exTrans = Array.isArray(e.example_translations)
        ? e.example_translations
        : [e.example_translations]
      const koTrans = exTrans.find((t: any) => t?.ui_lang === 'ko')
      return {
        sentence: e.sentence || '',
        translation: koTrans?.translation || '',
      }
    })

    // Generate EN post
    try {
      const en = generateEnContent(patternText, meaning, note, examplesWithTranslation)
      const enSlug = slugify(patternText)

      const { error: enErr } = await supabase.from('blog_posts').upsert({
        pattern_id: pattern.id,
        locale: 'en',
        slug: enSlug,
        title: en.title,
        description: en.description,
        content: en.content,
        tags: en.tags,
        published_at: null,
      }, { onConflict: 'slug,locale' })

      if (enErr) throw enErr
      console.log(`✓ EN [${pattern.order_index}] ${patternText}`)
      successCount++
    } catch (err: any) {
      failures.push(`EN #${pattern.order_index} "${patternText}": ${err.message}`)
    }

    // Generate KO post
    try {
      const ko = generateKoContent(patternText, meaning, note, examplesWithTranslation)
      const koSlug = slugify(patternText) + '-ko'

      const { error: koErr } = await supabase.from('blog_posts').upsert({
        pattern_id: pattern.id,
        locale: 'ko',
        slug: koSlug,
        title: ko.title,
        description: ko.description,
        content: ko.content,
        tags: ko.tags,
        published_at: null,
      }, { onConflict: 'slug,locale' })

      if (koErr) throw koErr
      console.log(`✓ KO [${pattern.order_index}] ${patternText}`)
      successCount++
    } catch (err: any) {
      failures.push(`KO #${pattern.order_index} "${patternText}": ${err.message}`)
    }
  }

  console.log(`\n=== Done ===`)
  console.log(`✓ Inserted: ${successCount} posts`)
  if (failures.length > 0) {
    console.log(`✗ Failures (${failures.length}):`)
    failures.forEach(f => console.log('  -', f))
  }
}

main()
