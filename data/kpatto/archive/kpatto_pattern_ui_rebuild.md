# K-PATTO 패턴카드 UI 개편 지시문

## UI 구조 변경

### 현재 (제거할 것)
- 패턴 카드 + 예문 + How to use 박스(별도) 구조
- ❗ 아이콘
- How to use 박스 (테두리/배경 있는 별도 섹션)
- 예문 중복

### 변경 후 구조
```
[연두색 패턴 칩] ← 기존 유지
PATTERN 001                    🔖
~주세요
Use this to ask for something

💡 How to use
[슬롯 공식]
[조합 예시 (필요시)]
[추가 설명 (규칙 있는 패턴만)]

―――――――――――――――――――――――
예문 1 한국어.                  🔊
English translation.

예문 2 한국어.                  🔊
English translation.

예문 3 한국어.                  🔊
English translation.
```

### 변경 규칙
- ❗ 아이콘 제거
- How to use 박스 테두리/배경 제거 — 그냥 인라인 텍스트
- 예문은 패턴 칩 + How to use 아래 한 번만
- 북마크 🔖 는 유지
- 구분선(―――)으로 How to use 와 예문 영역 분리

---

## EP01~10 패턴 설명 텍스트 전체

> 규칙 있는 패턴: 슬롯 공식 + 조합 예시 + 규칙 설명
> 단순한 패턴: 슬롯 공식만

---

### EP01 — 카페에서

**PATTERN 001: ~이에요 / 예요**
```
💡 How to use
Put a noun before 이에요 or 예요 to say what something IS.

[noun ending in consonant] + 이에요
[noun ending in vowel] + 예요

학생 → 학생이에요 ✓  (학생 ends in consonant ㅇ)
커피 → 커피예요 ✓    (커피 ends in vowel ㅣ)

Tip: Not sure which to use? Say the noun out loud —
if it ends in a hard sound, add 이에요. If it trails off softly, add 예요.
```

**PATTERN 002: ~주세요**
```
💡 How to use
Put what you want BEFORE 주세요. That's it!

[what you want] + 주세요

물 주세요 / 커피 주세요 / 메뉴 주세요
Swap any noun in front — works every time.
```

**PATTERN 003: ~뭐예요?**
```
💡 How to use
Point at something and ask what it is.

이거 (this) + 뭐예요? → What is this?
저거 (that) + 뭐예요? → What is that?

이름이 뭐예요? → What is your name?
(이름 = name, 이 = subject marker)
```

**PATTERN 004: ~있어요 / 없어요**
```
💡 How to use
Ask if something exists or is available — or say it doesn't.

[noun] + 있어요? → Do you have ~? / Is there ~?
[noun] + 없어요  → There is no ~ / I don't have ~

와이파이 있어요? → Is there Wi-Fi?
자리 없어요.    → There are no seats.

Tip: 있어요 and 없어요 are opposites — learn them together!
```

**PATTERN 005: ~얼마예요?**
```
💡 How to use
Ask the price of anything — just put the item first.

[noun] + 얼마예요?

이거 얼마예요? → How much is this?
(Just point and ask — works everywhere in Korea!)
```

---

### EP02 — 지하철에서

**PATTERN 001: ~어디예요?**
```
💡 How to use
Ask where something is — put the place or thing first.

[place/thing] + 어디예요?

화장실 어디예요? → Where is the bathroom?
(Swap the noun to ask about anything!)
```

**PATTERN 002: ~에 가고 싶어요**
```
💡 How to use
Say where you want to go.

[place] + 에 가고 싶어요

홍대에 가고 싶어요. → I want to go to Hongdae.

Why 에? In Korean, 에 marks the destination — like "to" in English.
에 always attaches directly to the place name, no space.
```

**PATTERN 003: ~어떻게 가요?**
```
💡 How to use
Ask for directions to any place — no particle needed!

[place] + 어떻게 가요?

홍대 어떻게 가요? → How do I get to Hongdae?
(Unlike 어디예요, no 에 or 이/가 needed here — just place + 어떻게 가요?)
```

**PATTERN 004: [수량] ~ 주세요**
```
💡 How to use
Order a specific quantity — item first, then number + counter.

[item] + [number] + [counter] + 주세요

표 두 장 주세요 → Two tickets, please
물 한 병 주세요 → One bottle of water, please

Common counters:
장 = flat things (tickets, papers)
병 = bottles
개 = general items
```

**PATTERN 005: ~좋아요**
```
💡 How to use
Say you like something — or that something is good.

[noun] + 좋아요

서울 좋아요 → I like Seoul / Seoul is good
(Works for both meanings — context makes it clear!)
```

---

### EP03 — 떡볶이 가게에서

**PATTERN 001: ~하고 싶어요**
```
💡 How to use
Say what you WANT to do — attach to a verb stem.

[verb stem] + 고 싶어요

먹다 → 먹 + 고 싶어요 → 먹고 싶어요 (I want to eat)
가다 → 가 + 고 싶어요 → 가고 싶어요 (I want to go)

How to find the stem: remove 다 from the dictionary form.
```

**PATTERN 002: ~할 수 있어요 / 없어요**
```
💡 How to use
Say what you CAN or CANNOT do.

[verb stem] + ㄹ/을 수 있어요 → can
[verb stem] + ㄹ/을 수 없어요 → can't

먹다 → 먹을 수 있어요 (stem ends in consonant → 을)
가다 → 갈 수 있어요   (stem ends in vowel → ㄹ)

Tip: 수 literally means "way" — so it's like saying "there is a way to do it"!
```

**PATTERN 003: ~이/가 아니에요**
```
💡 How to use
Say what something is NOT.

[noun ending in consonant] + 이 아니에요
[noun ending in vowel] + 가 아니에요

학생 → 학생이 아니에요 ✓ (consonant ending)
커피 → 커피가 아니에요 ✓ (vowel ending)

Tip: Same 이/가 rule as subject markers — if you know those, you know this!
```

**PATTERN 004: ~못해요**
```
💡 How to use
Say you CAN'T do something — shorter and more natural in conversation.

못 + [verb]

못 먹어요 → I can't eat (it)
못 해요   → I can't do (it)

못 goes BEFORE the verb — don't move it!
More casual than ~할 수 없어요, but means the same thing.
```

**PATTERN 005: ~맞아요?**
```
💡 How to use
Double-check if something is correct.

[noun/place] + 맞아요?

이게 떡볶이 맞아요? → Is this tteokbokki?
여기 홍대 맞아요?   → Is this Hongdae?

Tip: 맞다 means "to be correct" — so you're literally asking "Is this correct?"
Great for confirming orders, directions, or names!
```

---

### EP04 — 편의점에서

**PATTERN 001: ~해도 돼요?**
```
💡 How to use
Ask for permission politely.

[verb stem] + 아/어도 돼요?

찍다 → 찍어도 돼요? (May I take a photo?)
먹다 → 먹어도 돼요? (Is it okay to eat here?)

Rule: verb stem ends in ㅏ/ㅗ → 아도 돼요 / all others → 어도 돼요
This is one of the most useful polite phrases in Korean!
```

**PATTERN 002: ~하면 안 돼요**
```
💡 How to use
Say something is NOT allowed.

[verb stem] + 으면/면 안 돼요

피우다 → 피우면 안 돼요 (stem ends in vowel → 면)
찍다  → 찍으면 안 돼요  (stem ends in consonant → 으면)

안 돼요 literally means "it doesn't work/go" — used for all prohibitions!
```

**PATTERN 003: ~는/은 어때요?**
```
💡 How to use
Ask for an opinion or make a suggestion.

[noun ending in vowel] + 는 어때요?
[noun ending in consonant] + 은 어때요?

이거는 어때요?  → How about this? (vowel ending)
이 책은 어때요? → What do you think of this book? (consonant ending)
```

**PATTERN 004: ~로 할게요**
```
💡 How to use
Say what you'll choose or go with.

[noun ending in vowel] + 로 할게요
[noun ending in consonant] + 으로 할게요

카드로 할게요   → I'll pay by card (vowel ending)
현금으로 할게요 → I'll pay by cash (consonant ending)

할게요 = "I will do" — a soft, decisive statement of choice.
```

**PATTERN 005: ~얼마나 걸려요?**
```
💡 How to use
Ask how long something takes.

[subject/action] + 얼마나 걸려요?

얼마나 = how much/how long
걸리다 = to take (time)

배달 얼마나 걸려요? → How long does delivery take?
(You can also just say 얼마나 걸려요? on its own — totally natural!)
```

---

### EP05 — 식당에서

**PATTERN 001: ~주실 수 있어요?**
```
💡 How to use
Make a polite request — more respectful than 주세요.

[action] + 주실 수 있어요?

천천히 말해주실 수 있어요? → Could you speak slowly?
물 더 주실 수 있어요?      → Could you bring more water?

주실 수 있어요 = "would you be able to give/do" — very polite!
Use this with staff, elders, or anyone you want to be extra respectful with.
```

**PATTERN 002: ~추천해 주세요**
```
💡 How to use
Ask for a recommendation — put the category first.

[category] + 추천해 주세요

메뉴 추천해 주세요     → Please recommend a menu item
맛있는 거 추천해 주세요 → Please recommend something delicious

Works at restaurants, shops, cafés — anywhere!
```

**PATTERN 003: ~해 본 적 있어요?**
```
💡 How to use
Ask if someone has ever experienced something.

[verb stem] + 아/어 본 적 있어요?

먹다 → 먹어 본 적 있어요? → Have you ever eaten ~?
가다 → 가 본 적 있어요?   → Have you ever been to ~?

본 적 있어요 = "have the experience of having done"
본 적 없어요 = never done it
```

**PATTERN 004: ~어디서 살 수 있어요?**
```
💡 How to use
Ask where you can buy something.

[noun] + 어디서 살 수 있어요?

이거 어디서 살 수 있어요? → Where can I buy this?

어디서 = where (at/from)
살 수 있어요 = can buy (사다 + ㄹ 수 있어요)
```

**PATTERN 005: ~맛있어요 / 맛없어요**
```
💡 How to use
Say how food tastes — the two most useful food words!

[food] + 맛있어요 → It's delicious!
[food] + 맛없어요 → It's not good.

맛 = taste / 있어요 = exists / 없어요 = doesn't exist
Literally: "taste exists" vs "taste doesn't exist" — poetic, right?
```

---

### EP06 — 노래방에서

**PATTERN 001: ~좋아해요 / 싫어해요**
```
💡 How to use
Express ongoing likes and dislikes — different from 좋아요!

[noun] + 좋아해요 → I like ~ (ongoing preference)
[noun] + 싫어해요 → I don't like ~

좋아요 vs 좋아해요:
좋아요 = It's good / I like it (in this moment)
좋아해요 = I like it (as a general preference/habit)

케이팝 좋아해요 → I like K-pop (always, in general)
```

**PATTERN 002: ~알아요?**
```
💡 How to use
Ask if someone knows something — super simple!

[noun] + 알아요?

이 노래 알아요? → Do you know this song?
(알다 = to know — just add 아요 and attach to the topic!)
```

**PATTERN 003: ~가르쳐 주세요**
```
💡 How to use
Ask someone to teach you something.

[subject] + 가르쳐 주세요

이 노래 가르쳐 주세요 → Please teach me this song
한국어 가르쳐 주세요  → Please teach me Korean

가르치다 = to teach / 주세요 = please give/do
Together: "please give me the teaching of ~"
```

**PATTERN 004: 같이 ~해도 돼요?**
```
💡 How to use
Ask if you can do something TOGETHER.

같이 + [verb] + 해도 돼요?

같이 불러도 돼요? → Can we sing together?
같이 가도 돼요?   → Can I come with you?

같이 = together — adding it makes the request feel warm and inclusive!
```

**PATTERN 005: ~너무 좋아요!**
```
💡 How to use
Say you LOVE something — stronger than 좋아요.

[noun] + 너무 좋아요!

이 노래 너무 좋아요! → I love this song so much!

너무 = so much / too much (in casual speech, always positive!)
In formal writing 너무 can mean "too much (in a bad way)"
but in everyday conversation it just means "really/so much"!
```

---

### EP07 — 시장에서

**PATTERN 001: 조금만 더 주세요**
```
💡 How to use
Ask for a little more — great at markets and restaurants!

조금만 더 주세요 → A little more, please

조금 = a little
만 = only / just
더 = more

You can also specify what you want more of:
이거 조금만 더 주세요 → Just a little more of this, please
```

**PATTERN 002: ~깎아 주세요**
```
💡 How to use
Ask for a discount — essential at Korean traditional markets!

좀 깎아 주세요     → Please give me a discount
조금만 깎아 주세요 → Just a small discount, please

깎다 = to cut / reduce / shave off
Works best at 재래시장 (traditional markets) — not in regular stores!
```

**PATTERN 003: 같이 ~해요**
```
💡 How to use
Suggest doing something together — casual and friendly.

같이 + [verb]해요

같이 먹어요 → Let's eat together
같이 가요   → Let's go together

같이 = together
This form (~해요) is softer than a command — more like an invitation!
```

**PATTERN 004: ~신기해요!**
```
💡 How to use
React to something fascinating or unique.

[noun] + 신기해요!

이거 신기해요! → This is so interesting/unique!

신기하다 = to find something novel, fascinating, or surprisingly unique
Not just "interesting" (재미있다) — more like "wow, I've never seen this before!"
```

**PATTERN 005: 다 해서 얼마예요?**
```
💡 How to use
Ask for the total price when buying multiple things.

다 해서 얼마예요? → How much is it all together?

다 = all
해서 = adding up / coming to
얼마예요 = how much?

Use this after picking several items at a market stall!
```

---

### EP08 — 뷰티숍에서

**PATTERN 001: 피부에 좋아요?**
```
💡 How to use
Ask if a product is good for your skin.

[product] + 피부에 좋아요?

이거 피부에 좋아요?      → Is this good for skin?
민감한 피부에 좋아요?    → Is it good for sensitive skin?

피부 = skin / 에 = for/on / 좋아요 = is good
Skin types: 건성 (dry) / 지성 (oily) / 민감성 (sensitive) / 복합성 (combination)
```

**PATTERN 002: ~써봤어요?**
```
💡 How to use
Ask if someone has tried using something.

[product] + 써봤어요?

이 크림 써봤어요?  → Have you tried this cream?
마스크팩 써봤어요? → Have you tried sheet masks?

쓰다 = to use / 봤어요 = have tried/seen
Together: "have you tried using ~?"
```

**PATTERN 003: 어떤 게 좋아요?**
```
💡 How to use
Ask which option is better or recommended.

어떤 게 좋아요? → Which one is good?
제 피부엔 어떤 게 좋아요? → Which is good for my skin?

어떤 = which (type/kind)
게 = casual form of 것이 (thing that)
에 = for (my skin)
```

**PATTERN 004: ~선물하려고요**
```
💡 How to use
Say you're planning to give something as a gift.

[person] + 한테 선물하려고요

친구한테 선물하려고요 → I'm planning to give it to my friend
엄마한테 선물하려고요 → I'm planning to give it to my mom

한테 = to (a person)
~하려고요 = I'm planning to / I intend to
```

**PATTERN 005: 제 피부 타입에 맞는 거 추천해 주세요**
```
💡 How to use
Ask for a product recommendation suited to your skin type.

제 피부 타입에 맞는 거 추천해 주세요
→ Please recommend something for my skin type.

맞는 거 = something that fits/suits
This full sentence works perfectly as-is — memorize it!
Staff will often ask 피부 타입이 어떻게 돼요? (What's your skin type?) in response.
```

---

### EP09 — 한강에서

**PATTERN 001: 같이 ~해요**
```
💡 How to use
Invite someone to do something together — warm and casual.

같이 + [verb]해요!

같이 먹어요! → Let's eat together!
같이 앉아요! → Let's sit together!

같이 = together
The ~해요 ending is an invitation, not a command — it's soft and friendly!
```

**PATTERN 002: 날씨 좋다!**
```
💡 How to use
React to great weather — this is the casual, natural way to say it.

날씨 좋다! → The weather is so nice!
오늘 날씨 너무 좋다! → Today's weather is amazing!

좋다 = casual/informal version of 좋아요
Use with friends — not with strangers or elders!
날씨 = weather / 오늘 = today
```

**PATTERN 003: 생각보다 ~**
```
💡 How to use
Say something is better, worse, or different than you expected.

생각보다 + [adjective/description]

생각보다 맛있어요 → More delicious than I expected
생각보다 넓어요   → Bigger than I expected
생각보다 매워요   → Spicier than I expected

생각 = thought / 보다 = compared to
Literally: "compared to what I thought"
```

**PATTERN 004: ~처음이에요**
```
💡 How to use
Say it's your first time experiencing something.

[noun/experience] + 처음이에요

한강 피크닉 처음이에요 → It's my first Han River picnic
한국 치킨 처음이에요   → It's my first Korean fried chicken

처음 = first time
Great for sharing new experiences — Koreans love hearing this!
```

**PATTERN 005: 이런 거 너무 좋아요**
```
💡 How to use
Express that you love this kind of moment or experience.

이런 거 너무 좋아요 → I love this kind of thing
이런 순간 너무 좋아요 → I love moments like this

이런 = this kind of
거 = thing (casual for 것)
A heartfelt expression — use it when you genuinely mean it!
```

---

### EP10 — 학교에서

**PATTERN 001: 저는 ~이에요/예요**
```
💡 How to use
Introduce yourself — say who you ARE.

저는 + [name or identity] + 이에요/예요

저는 에마예요      → I'm Emma (vowel ending)
저는 미국 사람이에요 → I'm American (consonant ending)

저는 = I (polite form — always use in formal introductions!)
나는 = I (casual — use only with close friends)
```

**PATTERN 002: ~에서 왔어요**
```
💡 How to use
Say where you're from.

[country or city] + 에서 왔어요

미국에서 왔어요  → I'm from America
서울에서 왔어요? → Are you from Seoul?

에서 = from (a place)
왔어요 = came (past tense of 오다, to come)
Literally: "I came from ~"
```

**PATTERN 003: ~전공이에요**
```
💡 How to use
Say what your major is — essential for university life!

[major] + 전공이에요

경영학 전공이에요 → My major is business
뭐 전공이에요?    → What's your major?

전공 = major / specialty
Common majors: 경영학 (business) / 컴퓨터공학 (CS) / 한국어 (Korean) / 디자인 (design)
```

**PATTERN 004: 잘 부탁드려요**
```
💡 How to use
A uniquely Korean phrase said when starting a new relationship.
Hard to translate directly — it expresses humility and goodwill.

잘 부탁드려요 → Please take care of me / I look forward to working with you

잘 = well
부탁드려요 = I humbly request (very polite form of 부탁하다)

Always said at introductions, first meetings, and when joining a new group.
Koreans will appreciate this more than almost anything else you say!
```

**PATTERN 005: 한국어로 천천히 말해줄 수 있어요?**
```
💡 How to use
Ask someone to speak Korean slowly — this sentence will save you!

한국어로 천천히 말해줄 수 있어요?
→ Can you speak Korean slowly?

한국어로 = in Korean
천천히   = slowly
말해줄 수 있어요? = can you speak/say (for me)?

You can also just say 천천히 말해주세요 (Please speak slowly) for short!
```

---

## Claude Code 구현 지시사항

1. 패턴 카드 UI 위 내용으로 개편
   - ❗ 아이콘 제거
   - How to use 별도 박스/배경 제거 — 인라인 텍스트로
   - 구분선으로 How to use 와 예문 영역 분리
   - 북마크 🔖 유지

2. 위 설명 텍스트 EP01~10 전체 적용

3. 슬롯 공식 `[noun]` 부분 시각적으로 강조
   (회색 배경 pill 또는 굵은 폰트)

4. 조합 예시 `→` 화살표 부분도 시각적으로 구분

5. EP01~02는 즉시 적용
   EP03~10은 데이터 등록 후 에피소드 추가 시 자동 연결
