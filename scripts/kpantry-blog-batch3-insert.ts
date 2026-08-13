/**
 * kpantry-blog-batch3-insert.ts
 * kpantry-blog-batch3.json 5편 삽입
 *
 * - {{IMG:INGREDIENT:이름}} → pantry_ingredients.image_url (마크다운 이미지)
 * - {{IMG:RECIPE:영문명}}   → pantry_recipes.hero_image_url (마크다운 이미지)
 * - 매칭 실패 시 해당 줄 전체 삭제 (깨진 이미지 금지)
 * - slug 중복 시 중단
 * - published_at: 2026-08-13, 1분 간격
 * - is_paused: false
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
)

// ── CSV 파서 (RFC 4180) ───────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let field = '', fields: string[] = [], inQ = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (ch === '"') inQ = false
      else field += ch
    } else {
      if (ch === '"') inQ = true
      else if (ch === ',') { fields.push(field); field = '' }
      else if (ch === '\n') { fields.push(field); rows.push(fields); fields = []; field = '' }
      else if (ch !== '\r') field += ch
    }
  }
  if (field || fields.length) { fields.push(field); rows.push(fields) }
  return rows
}

function buildLookup(csv: string, keyCol: number, valCol: number): Map<string, string> {
  const rows = parseCSV(csv)
  const map = new Map<string, string>()
  for (const row of rows.slice(1)) {
    const k = row[keyCol]?.trim()
    const v = row[valCol]?.trim()
    if (k && v) map.set(k.toLowerCase(), v)
  }
  return map
}

// ── CSV 로드 ─────────────────────────────────────────────────────────────────
const BASE = 'C:/Users/msj15/OneDrive/바탕 화면/ClaudeCode/patto'
const ingMap  = buildLookup(readFileSync(`${BASE}/pantry_ingredients.csv`, 'utf8'), 0, 1) // name → image_url
const recMap  = buildLookup(readFileSync(`${BASE}/pantry_recipes.csv`,     'utf8'), 0, 3) // name_en → hero_image_url

// ── 토큰 치환 ────────────────────────────────────────────────────────────────
const missed: string[] = []

function replaceTokens(content: string): string {
  return content
    .split('\n')
    .map(line => {
      return line.replace(/\{\{IMG:(INGREDIENT|RECIPE):([^}]+)\}\}/g, (_match, type, name) => {
        const key = name.trim().toLowerCase()
        const url = type === 'INGREDIENT' ? ingMap.get(key) : recMap.get(key)
        if (!url) {
          missed.push(`{{IMG:${type}:${name}}}`)
          return '__DELETE_LINE__'
        }
        return `![${name.trim()}](${url})`
      })
    })
    .filter(line => !line.includes('__DELETE_LINE__'))
    .join('\n')
}

// ── 포스트 데이터 (batch3.json 5편) ─────────────────────────────────────────
const RAW_POSTS = [
  {
    slug: 'is-korean-food-spicy',
    locale: 'en',
    app: 'k-pantry',
    category: 'Ingredients & Pantry',
    tags: ['korean food', 'spicy', 'beginners', 'gochujang'],
    title: 'Is Korean Food Always Spicy? A Guide to Heat Levels',
    description: 'Not all Korean food is spicy. Here is what actually brings the heat, which dishes are mild, and how to adjust the ones that aren\'t.',
    content: `If your only exposure to Korean food is fire noodle challenges on YouTube, you would be forgiven for thinking every Korean meal is an endurance test. It isn't. A large share of the Korean home cooking repertoire has no chili in it at all, and most of the dishes that do have chili can be dialed down without ruining them.

Here is the honest picture.

## Only three ingredients bring real heat

Korean spiciness comes from a short list, and once you can recognize them you can predict how a dish will taste before you cook it.

**Gochugaru** is coarse Korean chili flake. It is what makes kimchi red and what gives most stews their color. On its own it is fruity and moderately hot, closer to a mild ancho than to cayenne.

{{IMG:INGREDIENT:Gochugaru}}

**Gochujang** is fermented chili paste. It is thick, sweet, salty, and only mildly hot on its own, because the chili is diluted by rice syrup and fermented soybean. People often assume gochujang is the spiciest thing in the kitchen. It usually isn't.

**Fresh green chilies** show up sliced into stews near the end of cooking. These are the wild card, since heat varies from pepper to pepper.

If a recipe has none of these three, it is not going to be spicy. That covers a lot more dishes than most beginners expect.

## Dishes that are not spicy at all

These are all mainstream, everyday Korean food, not obscure exceptions.

- **Bulgogi** — marinated beef in soy sauce, pear, garlic, and sesame oil. Sweet and savory, zero chili.
- **Japchae** — sweet potato noodles stir fried with vegetables and soy sauce.
- **Galbitang** — clear beef short rib soup. Clean and gentle.
- **Gyeranjjim** — steamed egg custard, soft and mild.
- **Kongnamul muchim** — seasoned soybean sprouts with sesame oil.
- **Doenjang jjigae** — soybean paste stew, savory and funky rather than hot, as long as you skip the chili flakes.

{{IMG:RECIPE:Bulgogi}}

If you are cooking for someone who genuinely cannot handle chili, you can build an entire table from this list and it will still read as unmistakably Korean.

## Dishes that are spicy but adjustable

Most red Korean dishes are seasoned at a specific point in the cooking process, which means you control the dose.

**Kimchi jjigae** gets its heat from the kimchi itself plus added gochugaru. Use kimchi that has fermented longer and skip the extra chili flakes, and it lands somewhere near a mild chili con carne.

**Tteokbokki** is where heat is hardest to remove, because gochujang sauce is the entire point. But you can cut the gochujang with more sugar and add a slice of cheese at the end, which is how a lot of Korean people eat it anyway.

**Buldak** and fire noodles are the genuine outliers. These are engineered to be extreme and are not representative of anything served at a normal dinner table.

## How to lower the heat without losing the flavor

The mistake beginners make is simply using less seasoning, which leaves the dish thin and underseasoned rather than mild.

- Replace some gochugaru with **sweet paprika**. You keep the red color and body, lose the heat.
- Add **sugar or a spoon of honey**. Sweetness blunts capsaicin noticeably.
- Stir in **dairy** at the end — a slice of cheese in tteokbokki, a splash of milk in a cream-based ramyeon.
- Increase the **soy sauce and sesame oil** to carry the savory weight that the chili was providing.
- Add **more broth or vegetables** to dilute rather than removing seasoning outright.

## Start here if you are unsure

Cook bulgogi first. It is mild, it is forgiving, it uses ingredients you can find in any supermarket, and it will tell you whether you like the Korean flavor base of soy sauce, garlic, and sesame oil before you commit to buying a tub of gochujang.

From there, doenjang jjigae is the natural next step, and kimchi jjigae after that once you know how much chili you actually want.

---

**Not sure what you can cook with what's already in your kitchen?** K-Pantry matches Korean recipes to the ingredients you have on hand, and tells you exactly what you're missing.`,
  },
  {
    slug: 'cook-korean-food-without-korean-grocery-store',
    locale: 'en',
    app: 'k-pantry',
    category: 'Ingredients & Pantry',
    tags: ['korean food', 'substitutes', 'grocery', 'beginners'],
    title: 'Can You Cook Korean Food Without a Korean Grocery Store?',
    description: 'Yes — with a handful of substitutions from a regular supermarket. Here\'s what translates well, what doesn\'t, and what to buy online instead.',
    content: `The most common reason people give up on cooking Korean food at home is that the nearest Korean grocery store is an hour away, or simply doesn't exist. It is a real obstacle, but a smaller one than it looks.

Most Korean home cooking rests on a base of soy sauce, garlic, sesame oil, and sugar. All four are in any ordinary supermarket. What you can't easily replace is a much shorter list than you'd think.

## What you can buy anywhere

- **Soy sauce** — a Japanese brand works fine for most cooking. Korean soup soy sauce is different, but that difference matters mainly in clear soups.
- **Garlic** — used in enormous quantities, and it's the same garlic.
- **Sesame oil** — check it's toasted, which is what you want.
- **Rice** — short grain or sushi rice is the closest match.
- **Green onions, onions, carrots, zucchini, potatoes, eggs, tofu** — all standard.
- **Sugar, honey, black pepper** — standard.

That list alone gets you bulgogi, japchae with regular noodles, seasoned vegetables, steamed egg, and most soy-based braises.

## What substitutes acceptably

These aren't perfect, but they land close enough that the dish still works.

| Korean ingredient | Workable substitute |
|---|---|
| Gochugaru | Sweet paprika plus a pinch of cayenne |
| Korean pear (in marinades) | Bosc pear, or grated apple |
| Perilla leaf | Shiso, or young basil in a pinch |
| Soup soy sauce | Regular soy sauce plus a bit of salt |
| Rice syrup | Corn syrup or honey, slightly less |
| Mirin | Dry sherry with a little sugar |

The gochugaru substitute deserves a note. Paprika and cayenne together give you the color and some heat, but not the fruity, slightly smoky quality of real Korean chili flake. It's a workable bridge, not a permanent solution.

{{IMG:INGREDIENT:Gochujang}}

## What genuinely doesn't substitute

Be honest with yourself about these three.

**Gochujang.** Sriracha, harissa, and miso mixed with chili are all sometimes recommended online. None of them taste like gochujang, because none of them are fermented soybean plus chili plus rice starch. If you want to cook Korean food regularly, this is the one jar worth ordering online.

**Doenjang.** Japanese miso is the usual suggestion and it is genuinely the closest thing, but doenjang is funkier, saltier, and coarser. A stew made with miso is a good soup, but it isn't doenjang jjigae.

**Kimchi.** Sauerkraut is not a substitute in any meaningful way — different fermentation, different seasoning, different texture. Fortunately kimchi is now stocked in a lot of mainstream supermarkets, and it's also the easiest of the three to make yourself.

## The minimum viable order

If you're going to order anything online, order these three and nothing else at first:

1. **Gochujang** — one tub lasts months in the fridge
2. **Gochugaru** — buy the coarse grind, not fine
3. **Doenjang** — optional if you already have miso and want to wait

That's under thirty dollars in most places and it unlocks the overwhelming majority of Korean home recipes. Everything else on the standard "Korean pantry essentials" lists is genuinely optional at the start.

## Start with what translates cleanly

Rather than trying to force a substitution into a dish that depends on the real thing, start with recipes that were never going to need it. Bulgogi, japchae, seasoned spinach, steamed egg, and soy-braised potatoes all use ingredients you already have.

Cook those first. Order the three jars. Then expand.

{{IMG:RECIPE:Japchae}}

---

**Want to know what you can make right now?** K-Pantry looks at the ingredients you already have and shows you which Korean dishes are ready to go, and which need one or two more items.`,
  },
  {
    slug: 'what-is-banchan-korean-side-dishes',
    locale: 'en',
    app: 'k-pantry',
    category: 'Ingredients & Pantry',
    tags: ['banchan', 'side dishes', 'korean dining', 'beginners'],
    title: 'What Is Banchan? Why Korean Meals Come With So Many Side Dishes',
    description: 'The small plates that arrive before your order aren\'t appetizers. Here\'s what banchan is, why it\'s free, and how it works at home.',
    content: `You sit down at a Korean restaurant, order one dish, and six small plates arrive that you didn't ask for. Nobody explains them. You're not sure whether you're supposed to eat them first, or whether you'll be charged.

Those are banchan, and understanding them changes how you eat Korean food.

## Banchan are not appetizers

This is the single most useful thing to know. In most Western meal structures, small dishes come first and then the main course arrives. Banchan don't work that way. They sit on the table for the entire meal and are eaten **alongside** the rice and the main dish, in rotation.

The intended rhythm is: a bite of rice, a bite of the main dish, a bite of one banchan, back to rice. You're building each mouthful yourself rather than working through courses.

This is also why they're refillable at no charge in Korea. They aren't a paid course. They're part of how the meal is constructed.

## Why there are so many

A traditional Korean meal is described by how many banchan it includes — three, five, seven, and so on. The logic behind it is balance. Rice is bland and neutral, so the surrounding dishes supply everything it lacks: salt, sourness, spice, crunch, and different textures.

A well-composed banchan spread usually includes:

- Something **fermented and sour** — kimchi, almost always
- Something **seasoned and green** — spinach, soybean sprouts, or another namul
- Something **salty and protein-based** — braised tofu, fish cake, or eggs
- Something **crunchy** — pickled radish or fresh vegetables

If you notice a meal feeling flat, it's usually because one of these categories is missing.

{{IMG:INGREDIENT:Kimchi}}

## The most common ones you'll meet

**Kimchi** — the default, present at nearly every meal. Napa cabbage is the usual version, but cubed radish kimchi is also common.

**Kongnamul muchim** — soybean sprouts, blanched and seasoned with sesame oil, garlic, and salt. Mild, nutty, and a good entry point.

**Sigeumchi namul** — spinach, prepared the same way. Sweeter than the sprouts.

**Danmuji** — bright yellow pickled radish, sweet and sharp, usually served alongside heavier dishes.

**Myeolchi bokkeum** — tiny stir-fried anchovies, sweet and salty, eaten whole. Divisive with newcomers but genuinely good.

**Gyeran mari** — rolled omelette, sliced. Mild and always popular.

## Making banchan at home is easier than it looks

The surprise for most people is that the vegetable banchan take about ten minutes each and follow a single template.

Blanch the vegetable briefly. Squeeze out the water. Season with sesame oil, minced garlic, salt, and toasted sesame seeds. Toss. Done.

That one method gives you spinach, soybean sprouts, zucchini, and several others. Once you've made one, you've effectively learned all of them.

Make two or three on a Sunday, keep them in the fridge, and a weeknight dinner becomes rice plus a simple main plus whatever's already prepared. That's the actual everyday Korean meal — not an elaborate production, but a small stock of things made in advance.

## Restaurant etiquette, briefly

Use the serving chopsticks if they're provided. Take from the shared plates directly if they aren't — it's normal. Ask for refills of anything you finish; it's expected, not rude. And don't feel obligated to finish everything, since portions are calibrated for sharing.

---

**Building a Korean meal at home?** K-Pantry suggests what to cook based on the ingredients you already have, including quick banchan you can make in ten minutes.`,
  },
  {
    slug: 'instant-ramyeon-upgrade-guide',
    locale: 'en',
    app: 'k-pantry',
    category: 'Cooking Basics',
    tags: ['ramyeon', 'instant noodles', 'quick meals', 'cooking tips'],
    title: 'How to Make Instant Ramyeon Taste Like a Restaurant Dish',
    description: 'Six additions that turn a packet of Korean instant noodles into an actual meal, plus the two mistakes that ruin it.',
    content: `Korean instant ramyeon is already good. That's not the question. The question is why the bowl you make at home tastes thinner than the one served at a Korean restaurant or a convenience store in Seoul, when it's the same packet.

The answer is mostly technique, and partly three or four cheap additions.

## Fix the water first

This is the mistake almost everyone makes. The packet tells you to use a specific amount of water, and most people eyeball it, add too much, and end up with a diluted broth.

Use slightly **less** water than the package says — around 450ml instead of 550ml for a single serving. The broth should coat the noodles, not swim around them. If you're adding vegetables that release water, cut back further.

The second technique mistake is cooking the noodles too long. Pull them a minute early. They keep cooking in the hot broth on the way to the table, and Korean ramyeon is meant to have real chew.

## The egg question

There are two schools, and they produce genuinely different bowls.

**Cracked in whole, undisturbed** — drop it in during the last minute and don't stir. You get a poached egg sitting on top, with a runny yolk to break into the broth. This is the restaurant look.

**Beaten and stirred in** — pour it in a thin stream while the broth is at a rolling boil, then stir once. You get silky egg ribbons throughout and a slightly thickened, cloudier broth. This is the convenience store version.

Neither is wrong. If you can't decide, the whole egg is more forgiving.

## Five additions that actually matter

Ranked by how much they change the bowl relative to effort.

**Kimchi.** The single biggest upgrade. Add it early, with a spoon of its juice, so it has time to soften and release acidity into the broth. Older, more fermented kimchi works better here than fresh.

**A slice of processed cheese.** Sounds wrong, works completely. Lay it on top after you turn off the heat and let it melt without stirring. It rounds off the salt and cuts the heat. This is standard in Korea, not a novelty.

**Green onion, added at the end.** Raw, sliced thin, scattered on top. Contributes freshness that the packet has no way to provide.

**A spoon of gochujang or doenjang.** Half a teaspoon is enough. It adds fermented depth underneath the packet seasoning rather than more heat.

**Leftover rice, at the end.** Once you've eaten the noodles, tip the rice into the remaining broth. This isn't a garnish — it's the accepted second half of the meal.

{{IMG:INGREDIENT:Kimchi}}

## Two things to skip

**Don't add the whole seasoning packet if you're also adding kimchi, cheese, and gochujang.** You'll end up with something aggressively salty. Use about three quarters of it when you're layering other seasoned ingredients.

**Don't add raw vegetables that release a lot of water** — zucchini, mushrooms, cabbage — without adjusting the liquid down. This is the most common cause of a bowl that tastes weak despite everything you added.

## A combination worth trying

Less water, kimchi and its juice added at the start, noodles pulled a minute early, egg cracked in whole and left alone, heat off, cheese slice on top, green onion scattered, rice on standby.

That's about seven minutes and it does not taste like a packet of instant noodles.

---

**Have kimchi, eggs, and not much else?** K-Pantry finds Korean dishes you can actually make with what's in your kitchen right now.`,
  },
  {
    slug: 'kimchi-jjigae-vs-doenjang-jjigae',
    locale: 'en',
    app: 'k-pantry',
    category: 'Cooking Basics',
    tags: ['jjigae', 'stew', 'kimchi', 'doenjang', 'beginners'],
    title: 'Kimchi Jjigae vs Doenjang Jjigae: Which Korean Stew Should You Try First?',
    description: 'Two stews, two completely different flavors. Here\'s how they differ, which is easier for a beginner, and how to make each one properly.',
    content: `Jjigae is the everyday Korean stew — thicker than soup, served bubbling, meant to be shared from the pot with rice. Two of them account for most of what Korean households actually eat, and they taste nothing alike.

If you're going to cook one Korean stew, this is the choice you're making.

## The short version

**Kimchi jjigae** is sour, spicy, and red. The dominant flavor is fermented cabbage, sharpened by chili. It's bold and it announces itself.

**Doenjang jjigae** is savory, earthy, and brown. The dominant flavor is fermented soybean paste — nutty, salty, slightly funky, closer to a rich miso soup with more body. It's quieter and more of an everyday dish.

Koreans eat doenjang jjigae far more often. Kimchi jjigae is the one foreigners tend to encounter first.

{{IMG:RECIPE:Kimchi Jjigae}}

## Which is easier to make

**Doenjang jjigae is easier**, for one specific reason: it doesn't depend on the quality of your kimchi.

Kimchi jjigae is only as good as the kimchi that goes into it, and it specifically needs **old, sour kimchi** — the kind that's been in the fridge for weeks and tastes too sharp to eat plain. Fresh kimchi from a supermarket produces a flat, disappointing stew. This catches out a lot of first attempts.

Doenjang jjigae needs a tub of doenjang, some vegetables, and tofu. The paste does the work, and the paste is shelf-stable and consistent.

## How to make doenjang jjigae

About twenty minutes.

1. Bring roughly 500ml of anchovy stock (or plain water) to a boil with a piece of onion and a potato, cut into chunks.
2. Dissolve **two heaped tablespoons of doenjang** into the liquid. Push it through a spoon or whisk so it doesn't clump.
3. Simmer until the potato is nearly tender, around eight minutes.
4. Add sliced zucchini, mushrooms, and a block of tofu cut into cubes.
5. Simmer another five minutes. Add sliced green chili and green onion at the very end.

Don't boil it aggressively after the doenjang goes in — hard boiling makes it harsh. Keep it at a steady simmer.

## How to make kimchi jjigae

Similar time, different order.

1. Sauté **a cup of well-fermented kimchi**, roughly chopped, in a little oil for three or four minutes. This step matters — it deepens the flavor considerably.
2. Add pork belly or canned tuna if you're using it, and cook briefly.
3. Pour in about 400ml of water or stock, plus **two tablespoons of the kimchi juice** from the jar.
4. Add a teaspoon of gochugaru and a small spoon of gochujang.
5. Simmer fifteen minutes, then add tofu and green onion for the last three.

If your kimchi isn't sour enough, a splash of rice vinegar at the end helps, though it isn't a full replacement for proper fermentation.

## Which one to start with

Start with **doenjang jjigae** if you're new to Korean cooking. It's forgiving, it doesn't depend on ingredient quality you can't control, it isn't spicy, and it teaches you the fermented-soybean flavor that runs underneath a great deal of Korean food.

Move to **kimchi jjigae** once you have a jar of kimchi that's gone properly sour in your fridge — which, conveniently, happens on its own if you just wait.

{{IMG:RECIPE:Doenjang Jjigae}}

---

**Not sure which one you have the ingredients for?** K-Pantry checks what's in your kitchen and tells you which Korean dishes are ready to cook tonight.`,
  },
]

async function main() {
  // ── 토큰 치환 ───────────────────────────────────────────────────────────────
  const posts = RAW_POSTS.map(p => ({ ...p, content: replaceTokens(p.content) }))

  console.log('\n=== 토큰 치환 결과 ===')
  if (missed.length === 0) {
    console.log('  ✅ 모든 토큰 매칭 성공 (0 미스)')
  } else {
    console.error('  ❌ 매칭 실패 토큰:', missed)
  }

  // ── slug 중복 체크 ──────────────────────────────────────────────────────────
  const slugs = posts.map(p => p.slug)
  console.log('\n=== slug 중복 확인 ===')
  const { data: existing, error: checkErr } = await supabase
    .from('blog_posts')
    .select('slug, is_paused')
    .in('slug', slugs)

  if (checkErr) { console.error('체크 실패:', checkErr); process.exit(1) }

  if (existing && existing.length > 0) {
    console.error('  ❌ 중복 slug 발견 — 삽입 중단:')
    existing.forEach(r => console.error(`    slug=${r.slug}  is_paused=${r.is_paused}`))
    process.exit(1)
  }
  console.log('  ✅ 중복 없음')

  // ── published_at 설정 (2026-08-13, 1분 간격) ────────────────────────────────
  const BASE_DATE = new Date('2026-08-13T09:00:00Z')
  const rows = posts.map((p, i) => ({
    app: p.app,
    locale: p.locale,
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    tags: p.tags,
    content: p.content,
    is_paused: false,
    pattern_id: null,
    published_at: new Date(BASE_DATE.getTime() + i * 60 * 1000).toISOString(),
  }))

  console.log('\n=== 삽입 예정 ===')
  rows.forEach((r, i) => console.log(`  [${i + 1}] ${r.slug}  |  ${r.published_at}`))

  // ── 삽입 ───────────────────────────────────────────────────────────────────
  const { data: inserted, error } = await supabase
    .from('blog_posts')
    .insert(rows)
    .select('id, slug, published_at')

  if (error) {
    console.error('\n❌ 삽입 실패:', error)
    process.exit(1)
  }

  console.log(`\n✅ ${inserted?.length}건 삽입 완료:`)
  inserted?.forEach(r => console.log(`   id=${r.id}  |  ${r.slug}  |  ${r.published_at}`))
}

main().catch(e => { console.error(e); process.exit(1) })
