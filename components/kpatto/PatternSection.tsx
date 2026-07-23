'use client'

import { useEffect, useState } from 'react'
import { Volume2, Bookmark, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react'
import type { KPattoPattern, KPattoLanguage } from '@/data/kpatto/types'
import { isPatternSaved, savePattern, unsavePattern } from '@/lib/kpatto/savedPatterns'
import { useAuth } from '@/contexts/AuthContext'

const ACCENT = '#D4873A'

const PATTERN_DESCS: Record<string, string> = {
  // EP01
  'kp-005': 'Use this to say what something IS',
  'kp-003': 'Use this to ask for something',
  'kp-004': 'Use this to ask what something is',
  'kp-006': 'Use this to ask if something exists',
  'kp-007': 'Use this to ask the price',
  // EP02
  'kp-ep-002-p001': 'Use this to ask where something is',
  'kp-ep-002-p002': 'Use this to say where you want to go',
  'kp-ep-002-p003': 'Use this to ask how to get somewhere',
  'kp-ep-002-p004': 'Use this to ask for a quantity of something',
  'kp-ep-002-p005': 'Use this to say you like something',
  // EP03
  'kp-ep-003-p001': 'Use this to say what you want to do',
  'kp-ep-003-p002': 'Use this to say what you can or cannot do',
  'kp-ep-003-p003': 'Use this to say what something is NOT',
  'kp-ep-003-p004': "Use this to say you can't do something",
  'kp-ep-003-p005': 'Use this to check if something is correct',
  // EP04
  'kp-ep-004-p001': 'Use this to ask for permission',
  'kp-ep-004-p002': 'Use this to say something is not allowed',
  'kp-ep-004-p003': 'Use this to ask for an opinion or suggestion',
  'kp-ep-004-p004': "Use this to say what you'll choose",
  'kp-ep-004-p005': 'Use this to ask how long something takes',
  // EP05
  'kp-ep-005-p001': 'Use this to make a polite request',
  'kp-ep-005-p002': 'Use this to ask for a recommendation',
  'kp-ep-005-p003': 'Use this to ask if someone has done something',
  'kp-ep-005-p004': 'Use this to ask where to buy something',
  'kp-ep-005-p005': 'Use this to express how food tastes',
  // EP06
  'kp-ep-006-p001': 'Use this to say what you like or dislike',
  'kp-ep-006-p002': 'Use this to ask if someone knows something',
  'kp-ep-006-p003': 'Use this to ask someone to teach you',
  'kp-ep-006-p004': 'Use this to ask if you can do something together',
  'kp-ep-006-p005': 'Use this to say you love something',
  // EP07
  'kp-ep-007-p001': 'Use this to ask for a little more',
  'kp-ep-007-p002': 'Use this to ask for a discount',
  'kp-ep-007-p003': 'Use this to suggest doing something together',
  'kp-ep-007-p004': 'Use this to express fascination',
  'kp-ep-007-p005': 'Use this to ask the total price',
  // EP08
  'kp-ep-008-p001': 'Use this to ask if something is good for skin',
  'kp-ep-008-p002': 'Use this to ask if someone has tried something',
  'kp-ep-008-p003': 'Use this to ask which option is better',
  'kp-ep-008-p004': "Use this to say you're planning to gift something",
  'kp-ep-008-p005': 'Use this to ask for a skin-type recommendation',
  // EP09
  'kp-ep-009-p001': 'Use this to invite someone to do something together',
  'kp-ep-009-p002': 'Use this to comment on great weather',
  'kp-ep-009-p003': 'Use this to say something exceeded expectations',
  "kp-ep-009-p004": "Use this to say it's your first time",
  'kp-ep-009-p005': 'Use this to say you love this kind of thing',
  // EP10
  'kp-ep-010-p001': 'Use this to introduce yourself',
  "kp-ep-010-p002": "Use this to say where you're from",
  'kp-ep-010-p003': 'Use this to say what your major is',
  'kp-ep-010-p004': 'A polite phrase for new relationships',
  'kp-ep-010-p005': 'Use this to ask someone to speak Korean slowly',
}

const PATTERN_EXPLANATIONS: Record<string, string> = {
  // ── EP01 ──────────────────────────────────────────────────────────────────
  'kp-005': `💡 How to use
Put a noun before 이에요 or 예요 to say what something IS.

[noun ending in consonant] + 이에요
[noun ending in vowel] + 예요

학생 → 학생이에요 ✓  (학생 ends in consonant ㅇ)
커피 → 커피예요 ✓    (커피 ends in vowel ㅣ)

Tip: Not sure which to use? Say the noun out loud —
if it ends in a hard sound, add 이에요. If it trails off softly, add 예요.`,

  'kp-003': `💡 How to use
Put what you want BEFORE 주세요. That's it!

[what you want] + 주세요

물 주세요 / 커피 주세요 / 메뉴 주세요
Swap any noun in front — works every time.`,

  'kp-004': `💡 How to use
Point at something and ask what it is.

이거 (this) + 뭐예요? → What is this?
저거 (that) + 뭐예요? → What is that?

이름이 뭐예요? → What is your name?
(이름 = name, 이 = subject marker)`,

  'kp-006': `💡 How to use
Ask if something exists or is available — or say it doesn't.

[noun] + 있어요? → Do you have ~? / Is there ~?
[noun] + 없어요  → There is no ~ / I don't have ~

와이파이 있어요? → Is there Wi-Fi?
자리 없어요.    → There are no seats.

Tip: 있어요 and 없어요 are opposites — learn them together!`,

  'kp-007': `💡 How to use
Ask the price of anything — just put the item first.

[noun] + 얼마예요?

이거 얼마예요? → How much is this?
(Just point and ask — works everywhere in Korea!)`,

  // ── EP02 ──────────────────────────────────────────────────────────────────
  'kp-ep-002-p001': `💡 How to use
Ask where something is — put the place or thing first.

[place/thing] + 어디예요?

화장실 어디예요? → Where is the bathroom?
(Swap the noun to ask about anything!)`,

  'kp-ep-002-p002': `💡 How to use
Say where you want to go.

[place] + 에 가고 싶어요

홍대에 가고 싶어요. → I want to go to Hongdae.

Why 에? In Korean, 에 marks the destination — like "to" in English.
에 always attaches directly to the place name, no space.`,

  'kp-ep-002-p003': `💡 How to use
Ask for directions to any place — no particle needed!

[place] + 어떻게 가요?

홍대 어떻게 가요? → How do I get to Hongdae?
(Unlike 어디예요, no 에 or 이/가 needed here — just place + 어떻게 가요?)`,

  'kp-ep-002-p004': `💡 How to use
Order a specific quantity — item first, then number + counter.

[item] + [number] + [counter] + 주세요

표 두 장 주세요 → Two tickets, please
물 한 병 주세요 → One bottle of water, please

Common counters:
장 = flat things (tickets, papers)
병 = bottles
개 = general items`,

  'kp-ep-002-p005': `💡 How to use
Say you like something — or that something is good.

[noun] + 좋아요

서울 좋아요 → I like Seoul / Seoul is good
(Works for both meanings — context makes it clear!)`,

  // ── EP03 ──────────────────────────────────────────────────────────────────
  'kp-ep-003-p001': `💡 How to use
Say what you WANT to do — attach to a verb stem.

[verb stem] + 고 싶어요

먹다 → 먹 + 고 싶어요 → 먹고 싶어요 (I want to eat)
가다 → 가 + 고 싶어요 → 가고 싶어요 (I want to go)

How to find the stem: remove 다 from the dictionary form.`,

  'kp-ep-003-p002': `💡 How to use
Say what you CAN or CANNOT do.

[verb stem] + ㄹ/을 수 있어요 → can
[verb stem] + ㄹ/을 수 없어요 → can't

먹다 → 먹을 수 있어요 (stem ends in consonant → 을)
가다 → 갈 수 있어요   (stem ends in vowel → ㄹ)

Tip: 수 literally means "way" — so it's like saying "there is a way to do it"!`,

  'kp-ep-003-p003': `💡 How to use
Say what something is NOT.

[noun ending in consonant] + 이 아니에요
[noun ending in vowel] + 가 아니에요

학생 → 학생이 아니에요 ✓ (consonant ending)
커피 → 커피가 아니에요 ✓ (vowel ending)

Tip: Same 이/가 rule as subject markers — if you know those, you know this!`,

  'kp-ep-003-p004': `💡 How to use
Say you CAN'T do something — shorter and more natural in conversation.

못 + [verb]

못 먹어요 → I can't eat (it)
못 해요   → I can't do (it)

못 goes BEFORE the verb — don't move it!
More casual than ~할 수 없어요, but means the same thing.`,

  'kp-ep-003-p005': `💡 How to use
Double-check if something is correct.

[noun/place] + 맞아요?

이게 떡볶이 맞아요? → Is this tteokbokki?
여기 홍대 맞아요?   → Is this Hongdae?

Tip: 맞다 means "to be correct" — so you're literally asking "Is this correct?"
Great for confirming orders, directions, or names!`,

  // ── EP04 ──────────────────────────────────────────────────────────────────
  'kp-ep-004-p001': `💡 How to use
Ask for permission politely.

[verb stem] + 아/어도 돼요?

찍다 → 찍어도 돼요? (May I take a photo?)
먹다 → 먹어도 돼요? (Is it okay to eat here?)

Rule: verb stem ends in ㅏ/ㅗ → 아도 돼요 / all others → 어도 돼요
This is one of the most useful polite phrases in Korean!`,

  'kp-ep-004-p002': `💡 How to use
Say something is NOT allowed.

[verb stem] + 으면/면 안 돼요

피우다 → 피우면 안 돼요 (stem ends in vowel → 면)
찍다  → 찍으면 안 돼요  (stem ends in consonant → 으면)

안 돼요 literally means "it doesn't work/go" — used for all prohibitions!`,

  'kp-ep-004-p003': `💡 How to use
Ask for an opinion or make a suggestion.

[noun ending in vowel] + 는 어때요?
[noun ending in consonant] + 은 어때요?

이거는 어때요?  → How about this? (vowel ending)
이 책은 어때요? → What do you think of this book? (consonant ending)`,

  'kp-ep-004-p004': `💡 How to use
Say what you'll choose or go with.

[noun ending in vowel] + 로 할게요
[noun ending in consonant] + 으로 할게요

카드로 할게요   → I'll pay by card (vowel ending)
현금으로 할게요 → I'll pay by cash (consonant ending)

할게요 = "I will do" — a soft, decisive statement of choice.`,

  'kp-ep-004-p005': `💡 How to use
Ask how long something takes.

[subject/action] + 얼마나 걸려요?

얼마나 = how much/how long
걸리다 = to take (time)

배달 얼마나 걸려요? → How long does delivery take?
(You can also just say 얼마나 걸려요? on its own — totally natural!)`,

  // ── EP05 ──────────────────────────────────────────────────────────────────
  'kp-ep-005-p001': `💡 How to use
[action] + 주실 수 있어요?

받침 규칙 없음 — 동사 뒤에 그대로 붙임
주세요보다 더 정중한 표현 → 직원, 어른, 처음 만나는 사람에게 사용`,

  'kp-ep-005-p002': `💡 How to use
[category] + 추천해 주세요

추천하다 = to recommend
추천해 주세요 = please recommend (for me) → 식당, 카페, 숍 어디서나 사용 가능`,

  'kp-ep-005-p003': `💡 How to use
[verb stem] + 아/어 본 적 있어요?

먹다 → 먹어 본 적 있어요? (stem ends in consonant)
가다 → 가 본 적 있어요? (stem ends in vowel)
본 적 없어요 = I've never done it`,

  'kp-ep-005-p004': `💡 How to use
[noun] + 어디서 살 수 있어요?

어디서 = where (at/from)
살 수 있어요 = can buy
사다(to buy) + ㄹ 수 있어요 → 살 수 있어요`,

  'kp-ep-005-p005': `💡 How to use
[food] + 맛있어요 → delicious
[food] + 맛없어요 → not good

맛 = taste / 있어요 = exists / 없어요 = doesn't exist
"taste exists" vs "taste doesn't exist" — 한국어다운 표현!`,

  // ── EP06 ──────────────────────────────────────────────────────────────────
  'kp-ep-006-p001': `💡 How to use
Express ongoing likes and dislikes — different from 좋아요!

[noun] + 좋아해요 → I like ~ (ongoing preference)
[noun] + 싫어해요 → I don't like ~

좋아요 vs 좋아해요:
좋아요 = It's good / I like it (in this moment)
좋아해요 = I like it (as a general preference/habit)

케이팝 좋아해요 → I like K-pop (always, in general)`,

  'kp-ep-006-p002': `💡 How to use
Ask if someone knows something — super simple!

[noun] + 알아요?

이 노래 알아요? → Do you know this song?
(알다 = to know — just add 아요 and attach to the topic!)`,

  'kp-ep-006-p003': `💡 How to use
Ask someone to teach you something.

[subject] + 가르쳐 주세요

이 노래 가르쳐 주세요 → Please teach me this song
한국어 가르쳐 주세요  → Please teach me Korean

가르치다 = to teach / 주세요 = please give/do
Together: "please give me the teaching of ~"`,

  'kp-ep-006-p004': `💡 How to use
Ask if you can do something TOGETHER.

같이 + [verb] + 해도 돼요?

같이 불러도 돼요? → Can we sing together?
같이 가도 돼요?   → Can I come with you?

같이 = together — adding it makes the request feel warm and inclusive!`,

  'kp-ep-006-p005': `💡 How to use
Say you LOVE something — stronger than 좋아요.

[noun] + 너무 좋아요!

이 노래 너무 좋아요! → I love this song so much!

너무 = so much / too much (in casual speech, always positive!)
In formal writing 너무 can mean "too much (in a bad way)"
but in everyday conversation it just means "really/so much"!`,

  // ── EP07 ──────────────────────────────────────────────────────────────────
  'kp-ep-007-p001': `💡 How to use
Ask for a little more — great at markets and restaurants!

조금만 더 주세요 → A little more, please

조금 = a little
만 = only / just
더 = more

You can also specify what you want more of:
이거 조금만 더 주세요 → Just a little more of this, please`,

  'kp-ep-007-p002': `💡 How to use
Ask for a discount — essential at Korean traditional markets!

좀 깎아 주세요     → Please give me a discount
조금만 깎아 주세요 → Just a small discount, please

깎다 = to cut / reduce / shave off
Works best at 재래시장 (traditional markets) — not in regular stores!`,

  'kp-ep-007-p003': `💡 How to use
Suggest doing something together — casual and friendly.

같이 + [verb]해요

같이 먹어요 → Let's eat together
같이 가요   → Let's go together

같이 = together
This form (~해요) is softer than a command — more like an invitation!`,

  'kp-ep-007-p004': `💡 How to use
React to something fascinating or unique.

[noun] + 신기해요!

이거 신기해요! → This is so interesting/unique!

신기하다 = to find something novel, fascinating, or surprisingly unique
Not just "interesting" (재미있다) — more like "wow, I've never seen this before!"`,

  'kp-ep-007-p005': `💡 How to use
Ask for the total price when buying multiple things.

다 해서 얼마예요? → How much is it all together?

다 = all
해서 = adding up / coming to
얼마예요 = how much?

Use this after picking several items at a market stall!`,

  // ── EP08 ──────────────────────────────────────────────────────────────────
  'kp-ep-008-p001': `💡 How to use
Ask if a product is good for your skin.

[product] + 피부에 좋아요?

이거 피부에 좋아요?   → Is this good for skin?
민감한 피부에 좋아요? → Is it good for sensitive skin?

피부 = skin / 에 = for/on / 좋아요 = is good
Skin types: 건성 (dry) / 지성 (oily) / 민감성 (sensitive) / 복합성 (combination)`,

  'kp-ep-008-p002': `💡 How to use
Ask if someone has tried using something.

[product] + 써봤어요?

이 크림 써봤어요?  → Have you tried this cream?
마스크팩 써봤어요? → Have you tried sheet masks?

쓰다 = to use / 봤어요 = have tried/seen
Together: "have you tried using ~?"`,

  'kp-ep-008-p003': `💡 How to use
Ask which option is better or recommended.

어떤 게 좋아요? → Which one is good?
제 피부엔 어떤 게 좋아요? → Which is good for my skin?

어떤 = which (type/kind)
게 = casual form of 것이 (thing that)
에 = for (my skin)`,

  'kp-ep-008-p004': `💡 How to use
Say you're planning to give something as a gift.

[person] + 한테 선물하려고요

친구한테 선물하려고요 → I'm planning to give it to my friend
엄마한테 선물하려고요 → I'm planning to give it to my mom

한테 = to (a person)
~하려고요 = I'm planning to / I intend to`,

  'kp-ep-008-p005': `💡 How to use
Ask for a product recommendation suited to your skin type.

제 피부 타입에 맞는 거 추천해 주세요
→ Please recommend something for my skin type.

맞는 거 = something that fits/suits
This full sentence works perfectly as-is — memorize it!
Staff will often ask 피부 타입이 어떻게 돼요? (What's your skin type?) in response.`,

  // ── EP09 ──────────────────────────────────────────────────────────────────
  'kp-ep-009-p001': `💡 How to use
Invite someone to do something together — warm and casual.

같이 + [verb]해요!

같이 먹어요! → Let's eat together!
같이 앉아요! → Let's sit together!

같이 = together
The ~해요 ending is an invitation, not a command — it's soft and friendly!`,

  'kp-ep-009-p002': `💡 How to use
React to great weather — this is the casual, natural way to say it.

날씨 좋다! → The weather is so nice!
오늘 날씨 너무 좋다! → Today's weather is amazing!

좋다 = casual/informal version of 좋아요
Use with friends — not with strangers or elders!
날씨 = weather / 오늘 = today`,

  'kp-ep-009-p003': `💡 How to use
Say something is better, worse, or different than you expected.

생각보다 + [adjective/description]

생각보다 맛있어요 → More delicious than I expected
생각보다 넓어요   → Bigger than I expected
생각보다 매워요   → Spicier than I expected

생각 = thought / 보다 = compared to
Literally: "compared to what I thought"`,

  'kp-ep-009-p004': `💡 How to use
Say it's your first time experiencing something.

[noun/experience] + 처음이에요

한강 피크닉 처음이에요 → It's my first Han River picnic
한국 치킨 처음이에요   → It's my first Korean fried chicken

처음 = first time
Great for sharing new experiences — Koreans love hearing this!`,

  'kp-ep-009-p005': `💡 How to use
Express that you love this kind of moment or experience.

이런 거 너무 좋아요 → I love this kind of thing
이런 순간 너무 좋아요 → I love moments like this

이런 = this kind of
거 = thing (casual for 것)
A heartfelt expression — use it when you genuinely mean it!`,

  // ── EP10 ──────────────────────────────────────────────────────────────────
  'kp-ep-010-p001': `💡 How to use
Introduce yourself — say who you ARE.

저는 + [name or identity] + 이에요/예요

저는 에마예요      → I'm Emma (vowel ending)
저는 미국 사람이에요 → I'm American (consonant ending)

저는 = I (polite form — always use in formal introductions!)
나는 = I (casual — use only with close friends)`,

  'kp-ep-010-p002': `💡 How to use
Say where you're from.

[country or city] + 에서 왔어요

미국에서 왔어요  → I'm from America
서울에서 왔어요? → Are you from Seoul?

에서 = from (a place)
왔어요 = came (past tense of 오다, to come)
Literally: "I came from ~"`,

  'kp-ep-010-p003': `💡 How to use
Say what your major is — essential for university life!

[major] + 전공이에요

경영학 전공이에요 → My major is business
뭐 전공이에요?    → What's your major?

전공 = major / specialty
Common majors: 경영학 (business) / 컴퓨터공학 (CS) / 한국어 (Korean) / 디자인 (design)`,

  'kp-ep-010-p004': `💡 How to use
A uniquely Korean phrase said when starting a new relationship.
Hard to translate directly — it expresses humility and goodwill.

잘 부탁드려요 → Please take care of me / I look forward to working with you

잘 = well
부탁드려요 = I humbly request (very polite form of 부탁하다)

Always said at introductions, first meetings, and when joining a new group.
Koreans will appreciate this more than almost anything else you say!`,

  'kp-ep-010-p005': `💡 How to use
Ask someone to speak Korean slowly — this sentence will save you!

한국어로 천천히 말해줄 수 있어요?
→ Can you speak Korean slowly?

한국어로 = in Korean
천천히   = slowly
말해줄 수 있어요? = can you speak/say (for me)?

You can also just say 천천히 말해주세요 (Please speak slowly) for short!`,
}

// ── Inline renderer: [slot] pills + → color ──────────────────────────────────
function renderInline(text: string): React.ReactNode {
  const slotRe = /(\[[^\]]+\])/g
  const parts = text.split(slotRe)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return (
            <span key={i} style={{
              display: 'inline-block',
              background: 'none',
              padding: '1px 0',
              fontSize: 11,
              fontWeight: 700,
              color: '#2a7a52',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}>
              {part}
            </span>
          )
        }
        // Color → arrows
        const arrowParts = part.split('→')
        if (arrowParts.length === 1) return <span key={i}>{part}</span>
        return (
          <span key={i}>
            {arrowParts.map((seg, ai) => (
              <span key={ai}>
                {seg}
                {ai < arrowParts.length - 1 && (
                  <span style={{ color: ACCENT, fontWeight: 700 }}>→</span>
                )}
              </span>
            ))}
          </span>
        )
      })}
    </>
  )
}

function renderExplanation(text: string) {
  // Split lines; skip the heading line (starts with 💡) and the first non-empty description line after it
  const lines = text.split('\n')
  let skipNext = false
  const filtered: { line: string; li: number }[] = []
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]
    if (line.startsWith('💡')) { skipNext = true; continue } // skip heading
    if (skipNext) {
      if (line === '') { skipNext = false; continue } // skip blank after heading too
      skipNext = false; continue // skip the one-liner description
    }
    filtered.push({ line, li })
  }

  return filtered.map(({ line, li }) => {
    if (line === '') return <div key={li} style={{ height: 6 }} />
    const isTip = line.startsWith('Tip:') || line.startsWith('Note:')
    return (
      <div key={li} style={{
        fontSize: 12,
        fontWeight: 400,
        fontStyle: isTip ? 'italic' : 'normal',
        color: isTip ? '#AAAAAA' : '#888888',
        lineHeight: 1.75,
      }}>
        {renderInline(line)}
      </div>
    )
  })
}

// ── Audio ─────────────────────────────────────────────────────────────────────
function speakAll(sentences: string[], onDone: () => void) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  let idx = 0
  const next = () => {
    if (idx >= sentences.length) { onDone(); return }
    const utt = new SpeechSynthesisUtterance(sentences[idx++])
    utt.lang = 'ko-KR'; utt.rate = 0.9; utt.onend = next
    window.speechSynthesis.speak(utt)
  }
  next()
}

function SpeakAllBtn({ sentences, size, color, activeColor }: { sentences: string[]; size: number; color: string; activeColor: string }) {
  const [playing, setPlaying] = useState(false)
  const handle = () => {
    if (playing) { window.speechSynthesis.cancel(); setPlaying(false); return }
    setPlaying(true)
    speakAll(sentences, () => setPlaying(false))
  }
  return (
    <button onClick={handle} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <Volume2 size={size} color={playing ? activeColor : color} strokeWidth={1.8} />
    </button>
  )
}

// ── Bookmark ──────────────────────────────────────────────────────────────────
function BookmarkBtn({ pattern, episodeId }: { pattern: KPattoPattern; episodeId: string }) {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) { setSaved(false); return }
    isPatternSaved(pattern.id).then(setSaved)
  }, [user, pattern.id])

  const handle = async () => {
    if (!user || loading) return
    setLoading(true)
    if (saved) { await unsavePattern(pattern.id); setSaved(false) }
    else { await savePattern(pattern.id, episodeId); setSaved(true) }
    setLoading(false)
  }

  return (
    <button onClick={handle} style={{ background: 'none', border: 'none', cursor: user ? 'pointer' : 'default', padding: 0, flexShrink: 0 }}>
      <Bookmark size={15} color={saved ? '#D4873A' : '#CCCCCC'} fill={saved ? '#D4873A' : 'none'} strokeWidth={1.8} />
    </button>
  )
}

// ── Pattern card with collapsible How to use ─────────────────────────────────
function PatternCard({ p, i, lang, episodeId }: {
  p: KPattoPattern
  i: number
  lang: KPattoLanguage
  episodeId: string
}) {
  const [open, setOpen] = useState(true)
  const desc = PATTERN_DESCS[p.id] ?? p.structure
  const explanation = PATTERN_EXPLANATIONS[p.id]

  return (
    <div>
      {i > 0 && <div style={{ height: 1, background: '#F0EDE8', margin: '0 20px' }} />}
      <div style={{ padding: '20px 20px' }}>

        {/* Header chip */}
        <div style={{ background: '#EEF8EC', border: '1px solid #C9EAC4', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', letterSpacing: '0.5px', marginBottom: 6 }}>
                PATTERN {String(i + 1).padStart(3, '0')}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', lineHeight: 1.2, marginBottom: 6 }}>
                {p.korean}
              </div>
              <div style={{ fontSize: 13, color: '#666666' }}>{desc}</div>
            </div>
            <BookmarkBtn pattern={p} episodeId={episodeId} />
          </div>
        </div>

        {/* How to use — collapsible, default open */}
        {explanation && (
          <div style={{ marginBottom: 16 }}>
            {/* Section header with toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? 8 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Lightbulb size={16} color={ACCENT} strokeWidth={1.8} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#555555' }}>How to use</span>
              </div>
              <button
                onClick={() => setOpen(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', color: '#BBBBBB' }}
              >
                {open ? <ChevronUp size={15} strokeWidth={2} /> : <ChevronDown size={15} strokeWidth={2} />}
              </button>
            </div>
            {open && (
              <div>
                {renderExplanation(explanation)}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: '#D8D4CF', margin: '0 0 14px' }} />

        {/* Examples */}
        <div>
          {p.examples.map((ex, j) => {
            const translation = (ex.translations as Record<string, string>)[lang] ?? ex.translations.en
            return (
              <div key={j} style={{ paddingLeft: 8, marginBottom: j < p.examples.length - 1 ? 12 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A', paddingLeft: 6 }}>
                    {ex.korean}
                  </div>
                  <span style={{ marginRight: 12, flexShrink: 0 }}>
                    <SpeakAllBtn sentences={[ex.korean]} size={14} color="#CCCCCC" activeColor={ACCENT} />
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#999999', marginTop: 2, paddingLeft: 14 }}>
                  {translation}
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function PatternSection({
  tags, patternMap, lang, storyId, episodeId,
}: {
  tags: string[]
  patternMap: Record<string, KPattoPattern>
  lang: KPattoLanguage
  storyId: number
  episodeId: string
}) {
  const patterns = tags.map(id => patternMap[id]).filter(Boolean)
  if (patterns.length === 0) return null

  return (
    <div style={{ margin: '32px 0 0', padding: '0 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: '#999999', textTransform: 'uppercase', marginBottom: 16 }}>
        Patterns in this episode
      </div>

      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E8E4DF',
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {patterns.map((p, i) => (
          <PatternCard key={p.id} p={p} i={i} lang={lang} episodeId={episodeId} />
        ))}
      </div>
    </div>
  )
}
