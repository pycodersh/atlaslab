/**
 * kpantry-blog-batch4-insert.ts
 * kpantry-blog-batch4.json 5편 삽입
 *
 * 매칭 실패 (줄 삭제):
 *   {{IMG:INGREDIENT:Dried Anchovies}} — ingredients에 없음
 *   {{IMG:INGREDIENT:Perilla Leaves}}  — ingredients에 없음 (Perilla Oil만 존재)
 *
 * published_at: 2026-08-13 09:05~09:09 UTC (batch3 이후 연속)
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
const ingMap = buildLookup(readFileSync(`${BASE}/pantry_ingredients.csv`, 'utf8'), 0, 1)
const recMap = buildLookup(readFileSync(`${BASE}/pantry_recipes.csv`,     'utf8'), 0, 3)

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

// ── 포스트 데이터 (batch4.json 5편) ─────────────────────────────────────────
const RAW_POSTS = [
  {
    slug: 'is-korean-food-vegetarian-friendly',
    locale: 'en',
    app: 'k-pantry',
    category: 'Ingredients & Pantry',
    tags: ['vegetarian', 'vegan', 'kimchi', 'korean food'],
    title: 'Is Korean Food Vegetarian-Friendly? What to Watch Out For',
    description: "Many Korean dishes look vegetarian but aren't. Here's where hidden seafood shows up, and which dishes are genuinely safe.",
    content: `Korean food looks like it should be easy for vegetarians. Enormous quantities of vegetables, tofu in everything, rice at the center of every meal. In practice it's trickier than it appears, because the seasonings that make Korean food taste Korean are frequently seafood-based.

This isn't a reason to give up. It's a reason to know what to check.

## The three hidden ingredients

Almost every surprise comes from one of these.

**Fish sauce (aekjeot).** Anchovy or sand lance based. Used in most kimchi, and in seasoning vegetable side dishes. It's the number one reason a plate of seasoned spinach isn't vegetarian.

**Salted shrimp (saeujeot).** A cloudy, intensely salty shrimp paste. Standard in kimchi, and used to season some soups and steamed dishes.

**Anchovy stock (myeolchi yuksu).** The default broth base for a huge number of Korean soups and stews, including many that contain no visible meat or fish. Doenjang jjigae is usually built on it. So is the broth in most noodle dishes.

{{IMG:INGREDIENT:Dried Anchovies}}

The pattern is worth internalizing: **Korean food hides seafood in the background rather than the foreground.** A dish can be entirely vegetables and still be seasoned with fish.

## Is kimchi vegan?

Usually not. Traditional kimchi contains fish sauce, salted shrimp, or both.

However:

- **Temple kimchi** (sachal kimchi) is made without any animal products, and also without garlic and onion, following Korean Buddhist practice.
- **Commercial vegan kimchi** is now widely available and labeled as such. Read the ingredients rather than assuming.
- **Making it yourself** is straightforward — replace the fish sauce with soy sauce or a doenjang slurry, and the salted shrimp with a bit more salt. The result ferments the same way and tastes close.

White kimchi (baek kimchi) is not automatically vegan either, despite having no chili. Check the same way.

## Dishes that are genuinely vegetarian

These don't typically hide seafood, though it's still worth asking at a restaurant.

- **Bibimbap without egg or beef** — ask for it without gochujang if you're strict, since some brands contain small amounts of seafood extract, though most don't.
- **Japchae** — the base is sweet potato noodles, soy sauce, sesame oil, and vegetables. Commonly made without meat.
- **Gyeranjjim** — steamed egg, if eggs are acceptable to you.
- **Kongguksu** — cold noodles in chilled soybean broth. Genuinely vegan.
- **Pajeon or kimchijeon made at home** — the batter is flour and water; only the fillings vary.
- **Namul** — seasoned vegetable dishes, when made with soy sauce and sesame oil rather than fish sauce.

{{IMG:RECIPE:Japchae}}

## Building a vegetarian Korean pantry

The one substitution that unlocks most recipes is the stock.

Replace anchovy stock with **dried shiitake and kelp** simmered together — this is the standard Korean Buddhist temple base, not an improvised workaround. It has real depth and works anywhere anchovy stock is called for.

Beyond that:

- **Soy sauce** in place of fish sauce, roughly one to one, with a little extra salt
- **Doenjang** for savory weight — check the label, but most is soybean only
- **Gochujang** — most brands are vegetarian; a few contain seafood extract, so read once and stick to that brand
- **Dried shiitake** stems and caps, kept in the cupboard

With those, doenjang jjigae, sundubu jjigae, noodle soups, and most vegetable banchan all become available.

## What to ask at a restaurant

Saying "I don't eat meat" often isn't enough, since fish sauce and anchovy stock aren't thought of as meat. The more useful question is whether the dish contains **fish sauce, shrimp paste, or anchovy broth** specifically.

Writing it down in Korean before you go helps considerably.

---

**Cooking vegetarian Korean food at home?** K-Pantry shows you which dishes work with the ingredients you already have, and what to swap in when something's missing.`,
  },
  {
    slug: 'what-is-tteokbokki-how-spicy',
    locale: 'en',
    app: 'k-pantry',
    category: 'Ingredients & Pantry',
    tags: ['tteokbokki', 'street food', 'spicy', 'korean food'],
    title: 'What Is Tteokbokki? And How Spicy Is It Really',
    description: "Chewy rice cakes in a sweet-spicy red sauce. Here's what it actually tastes like, how hot it is, and how to make it milder.",
    content: `You've seen it in dramas and in every Korean street food video: a shallow pan of orange-red sauce with thick white cylinders bobbing in it, being ladled into paper cups. That's tteokbokki, and it's probably the single most recognizable piece of Korean street food.

If you're wondering whether you'd actually like it, here's a straight answer.

## What it is

**Tteok** are rice cakes — made from short-grain rice flour, steamed and pounded into a dense, chewy dough, then shaped into cylinders. **Bokki** means stir-fried, though modern tteokbokki is really simmered in sauce rather than fried.

The texture is the thing people either love or don't. It's genuinely chewy, springy, and substantial — closer to a very dense mochi than to pasta or dumplings. Rice cakes have almost no flavor of their own; they're a vehicle for the sauce.

The sauce is gochujang, gochugaru, sugar, soy sauce, and stock, reduced until it clings. The dominant note is **sweet before spicy**, which surprises people.

{{IMG:RECIPE:Tteokbokki}}

## How spicy is it, honestly

Standard street tteokbokki sits somewhere around a medium — noticeably hot, building as you eat, but not painful. The sugar in the sauce blunts the chili considerably. If you comfortably eat Thai curry or a hot salsa, you'll be fine.

The variation is enormous though. Some shops sell a mild version aimed at children. Others sell versions specifically marketed as extreme. If you're buying from a street stall, the color is a decent guide — deeper, darker red usually means more gochugaru.

Homemade is where you have full control, and it's the reason a lot of people who found street tteokbokki too hot end up liking their own.

## The common variations

**Gungjung tteokbokki** is the older, royal court version. Soy sauce based, no chili at all, with beef and vegetables. If you can't handle heat and want to try rice cakes, this is the one.

**Rosé tteokbokki** adds cream and milk to the standard sauce. Now extremely common in Korea, mild, and probably the easiest entry point.

**Cheese tteokbokki** is standard sauce with melted mozzarella over the top.

**Rabokki** combines tteokbokki with instant ramyeon noodles in the same pan.

## Making it milder without ruining it

The sauce is easy to adjust because the heat comes from two separate ingredients.

- **Cut the gochugaru first, keep the gochujang.** Gochujang carries the fermented flavor and color; gochugaru carries most of the raw heat. Halving the flakes changes the heat a lot and the flavor a little.
- **Add more sugar or a spoon of honey.** This is what commercial mild versions do.
- **Stir in milk or cream** at the end for a rosé version.
- **Add a slice of cheese** off the heat.

{{IMG:INGREDIENT:Gochujang}}

## A note on buying rice cakes

Fresh tteok is soft and ready to cook. Frozen or refrigerated tteok has usually hardened and should be **soaked in cold water for twenty to thirty minutes** before cooking, or it'll stay tough in the middle.

This is the most common reason homemade tteokbokki disappoints. The sauce is right, the rice cakes are stiff.

## What it's usually eaten with

Fish cake sheets (eomuk), boiled eggs, and cabbage go straight into the pan. Fried mandu or a portion of gimbap on the side, dipped into the leftover sauce, is the standard street-stall combination.

Don't throw out the remaining sauce. Rice stirred into it is the accepted ending.

---

**Want to try making it?** K-Pantry tells you whether you have what you need for tteokbokki tonight, and what to substitute if you don't.`,
  },
  {
    slug: 'how-long-do-korean-pantry-staples-last',
    locale: 'en',
    app: 'k-pantry',
    category: 'Cooking Basics',
    tags: ['storage', 'gochujang', 'pantry', 'food safety'],
    title: 'How Long Do Korean Pantry Staples Last? A Storage Guide',
    description: 'Does gochujang go bad? How long does kimchi keep? Practical shelf-life answers for the jars sitting in your fridge.',
    content: `You bought a tub of gochujang for one recipe six months ago. It's still in the fridge, it's gone darker, and you're not sure whether that's a problem.

Here's what actually happens to Korean pantry staples over time, and when to worry.

## Fermented pastes: much longer than you think

**Gochujang** keeps for **one to two years refrigerated** after opening, and it doesn't so much spoil as change. It darkens, deepens in flavor, and gets saltier as moisture evaporates. All of that is normal.

What to watch for: fuzzy mold on the surface, or a sharp alcohol smell. Neither is common if you keep it covered and use a clean spoon. A thin white film is usually harmless surface yeast, but scraping it off and using the rest is a judgment call.

Store it in the fridge after opening, even though it's shelf-stable unopened.

{{IMG:INGREDIENT:Gochujang}}

**Doenjang** is similar and arguably even more durable — **two years or more**. Traditional Korean doenjang was aged for years by design. Darkening is expected.

**Ssamjang** is shorter, around **six months to a year**, because it's mixed with other ingredients like sesame oil and garlic.

## Gochugaru: the one that actually degrades

Chili flake doesn't spoil, but it **loses color and aroma within about six months** at room temperature, and that's the whole point of it.

Keep it **in the freezer**. Korean households routinely do this. It stops the red from fading to brown and preserves the fruity aroma. It doesn't clump if it's dry when it goes in, and you can use it straight from frozen.

If yours has gone brownish and smells like dust, it will make dull food. Replace it.

## Kimchi: it doesn't expire, it changes

Kimchi keeps fermenting indefinitely in the fridge. There isn't a point at which it becomes unsafe under normal storage. What changes is what it's good for.

- **Week one to two** — crisp, mildly sour. Best eaten as a side dish.
- **One to two months** — noticeably sour, softer. Still fine fresh, and now good for cooking.
- **Three months and beyond** — quite sour, soft. This is **the good stuff for kimchi jjigae, kimchi fried rice, and kimchi pancakes.**

Keep it submerged in its own liquid and press it down after taking some out. Exposure to air is what causes surface mold.

Discard if you see fuzzy colored mold, or if it smells genuinely rotten rather than sour. Sour and pungent is expected; putrid isn't.

{{IMG:INGREDIENT:Kimchi}}

## The rest, briefly

| Item | Storage | Roughly how long |
|---|---|---|
| Soy sauce (opened) | Fridge or cool cupboard | 1–2 years |
| Sesame oil | Cool, dark cupboard | 6–12 months, goes rancid |
| Dried anchovies | Freezer | 6 months+ |
| Dried kelp | Airtight cupboard | 1 year+ |
| Rice cakes (tteok) | Freezer | 3 months |
| Sweet potato noodles | Cupboard | 2 years |
| Perilla oil | Fridge | 3–6 months, rancid quickly |

Sesame oil and perilla oil are the two that genuinely go bad rather than just fading. If either smells sharp or like old crayons, it's rancid. Perilla oil is especially fragile and belongs in the fridge.

## The practical takeaway

The pastes will almost certainly outlast your interest in them, so buying a tub for one recipe isn't a waste. The things to actually keep an eye on are the oils and the chili flake — the two that quietly lose quality without ever looking spoiled.

---

**Not sure what to cook with what's still good?** K-Pantry matches Korean recipes to the ingredients you already have on hand.`,
  },
  {
    slug: 'easy-korean-dishes-for-beginners',
    locale: 'en',
    app: 'k-pantry',
    category: 'Cooking Basics',
    tags: ['beginners', 'easy recipes', 'korean cooking', 'weeknight'],
    title: '5 Korean Dishes Beginners Can Actually Make at Home',
    description: 'Five dishes with short ingredient lists, forgiving methods, and no specialty equipment — ordered from easiest to hardest.',
    content: `Most "easy Korean recipes" lists assume you already own six fermented pastes and know what soup soy sauce is. These five don't. They're ordered from least to most demanding, and each one teaches something you'll reuse.

## 1. Gyeranjjim (steamed egg)

**Why start here:** four ingredients, ten minutes, almost impossible to ruin.

Beat three eggs with about 150ml of water or stock and a pinch of salt. Pour into a small pot, cook over low heat while stirring gently until it starts to set, then cover and steam for three minutes until puffed and custardy. Scatter green onion on top.

**What it teaches:** how much gentler Korean egg dishes are than you'd expect, and how far a small amount of sesame oil goes as a finish.

## 2. Kongnamul muchim (seasoned soybean sprouts)

**Why it's here:** this single method covers roughly half of all Korean vegetable side dishes.

Boil soybean sprouts for five minutes with the lid on — important, since lifting the lid partway through makes them smell grassy. Drain, cool, and toss with minced garlic, sesame oil, salt, and toasted sesame seeds.

**What it teaches:** the blanch-squeeze-season template. Swap in spinach, zucchini, or cucumber and the method barely changes.

## 3. Bulgogi

**Why it's here:** the most crowd-pleasing Korean dish, and every ingredient is in a normal supermarket.

Marinate thinly sliced beef in soy sauce, sugar, grated pear or apple, minced garlic, sesame oil, and black pepper for at least thirty minutes. Sear in a hot pan in batches, not all at once.

**What it teaches:** the soy-garlic-sesame-sweet base that underpins an enormous amount of Korean cooking. Cook this once and a lot of other recipes stop looking unfamiliar.

{{IMG:RECIPE:Bulgogi}}

## 4. Kimchi fried rice

**Why it's here:** it's the best use for kimchi that's gone too sour to eat plain, and it's a complete meal in fifteen minutes.

Chop a cup of well-fermented kimchi and fry it in oil for three or four minutes until it darkens. Add day-old cold rice, break it up, and stir in a spoon of gochujang and a splash of the kimchi juice. Fry until the rice picks up color. Fried egg on top.

**What it teaches:** that frying kimchi before adding anything else transforms it. This step shows up in kimchi jjigae and kimchi pancakes too.

## 5. Doenjang jjigae

**Why it's last:** it needs one specialty ingredient, but it's the most genuinely everyday Korean dish on this list.

Simmer chunks of onion and potato in about 500ml of water. Dissolve two heaped tablespoons of doenjang into it. Add zucchini, mushrooms, and cubed tofu. Simmer another five minutes. Green onion at the end.

**What it teaches:** the fermented soybean flavor that runs underneath so much Korean food, and how a stew is built in layers rather than all at once.

{{IMG:RECIPE:Doenjang Jjigae}}

## What to buy before you start

For the first three dishes, nothing you don't already have except sesame oil and toasted sesame seeds.

For the last two, one tub of gochujang and one of doenjang. Both keep for a year or more in the fridge, so buying them for a single recipe isn't a waste.

## A realistic first week

Make gyeranjjim and kongnamul muchim on the same evening — together they take twenty minutes and give you a rice-plus-two-sides meal. Do bulgogi on a weekend when you're less rushed. Keep kimchi fried rice in reserve for a night when there's nothing in the fridge.

That's a functioning Korean cooking rotation, built from five recipes.

---

**Wondering which of these you could make tonight?** K-Pantry checks the ingredients you have and tells you what's ready to cook, and what's one item away.`,
  },
  {
    slug: 'what-is-perilla-leaf-substitute',
    locale: 'en',
    app: 'k-pantry',
    category: 'Ingredients & Pantry',
    tags: ['perilla', 'kkaennip', 'substitutes', 'ingredients'],
    title: "What Is Perilla Leaf? And What to Use If You Can't Find It",
    description: "Kkaennip isn't shiso, and it isn't mint. Here's what it tastes like, where it's used, and the closest substitutes when it's unavailable.",
    content: `If you've eaten Korean barbecue, you've probably wrapped meat in a large, jagged-edged green leaf that tasted like nothing else you've had. That's kkaennip — perilla leaf — and it's one of the ingredients people miss most when they can't source it.

## What it actually tastes like

Perilla is in the mint family, and you can tell, but the flavor goes in an unexpected direction. It's aromatic and slightly anise-like, with a mild bitterness and something close to the smell of licorice or basil, but earthier than either.

The leaves are large, round, deeply veined, and softly fuzzy. They're sturdy enough to wrap food without tearing, which is a large part of why they're used the way they are.

It's a strong flavor. People rarely feel neutral about it.

{{IMG:INGREDIENT:Perilla Leaves}}

## Perilla is not shiso

This confusion is everywhere, including on grocery store labels.

Korean perilla (*Perilla frutescens* var. *frutescens*) and Japanese shiso (*Perilla frutescens* var. *crispa*) are different varieties of the same species. They're related, but they don't taste the same.

- **Korean perilla** — large, round, flat-edged, soft. Anise and licorice notes. Milder.
- **Japanese shiso** — smaller, pointed, serrated, firmer. Sharper, more like cinnamon and citrus.

Shiso is the closest available substitute, but if you use it expecting perilla you'll notice immediately. Green shiso is closer than red.

## Where it's used

**As a wrap (ssam).** The classic use. Grilled pork belly, a smear of ssamjang, a slice of raw garlic, all wrapped in a perilla leaf. The leaf's bitterness cuts through the fat, which is precisely the point.

**Pickled (kkaennip jangajji).** Layered with soy sauce, garlic, and chili, then eaten a leaf at a time with rice. Keeps for weeks and is intensely flavored.

**In stews.** Added near the end of spicy stews and seafood dishes, where it perfumes the broth.

**Battered and fried (jeon).** Stuffed with seasoned meat, dipped in egg and flour, pan fried.

## Substitutes, ranked honestly

None of these are equivalent. Here's how close each gets.

**Shiso** — closest by a wide margin, since it's the same species. Available at Japanese grocers and increasingly in mainstream stores. Use slightly less, since it's stronger.

**Sesame leaf** — sometimes sold under this name, and confusingly, this is often just perilla mislabeled. Worth checking, because you may already have found it.

**Thai basil** — shares the anise note. The texture is wrong for wrapping, but for adding to a stew at the end it works acceptably.

**Butter lettuce or red leaf lettuce** — for wrapping purposes only. You lose the flavor entirely but keep the function. Korean barbecue is usually served with lettuce alongside perilla anyway, so this isn't as much of a compromise as it sounds.

**Mint** — often suggested online. Don't. The flavor pulls in an entirely different direction and it will make the dish taste wrong.

## The easiest solution: grow it

Perilla grows aggressively from seed, tolerates pots, and is genuinely hard to kill. Seeds are cheap and available online. One plant produces more leaves than a household can use, and it self-seeds if you let it.

This is what a lot of Korean families abroad do, and it's the only way to get the real thing consistently if you don't live near a Korean grocer.

## And perilla oil, briefly

Perilla oil (deulgireum) is pressed from the seeds, not the leaves, and tastes nothing like the leaf — nutty, rich, and used to season vegetable side dishes. It goes rancid quickly, so keep it in the fridge and buy small bottles.

It is not interchangeable with sesame oil, though the two are used in similar ways.

---

**Missing an ingredient for a recipe?** K-Pantry tells you what you can cook with what you have, and which substitutions actually work.`,
  },
]

async function main() {
  // ── 토큰 치환 ───────────────────────────────────────────────────────────────
  const posts = RAW_POSTS.map(p => ({ ...p, content: replaceTokens(p.content) }))

  console.log('\n=== 토큰 치환 결과 ===')
  if (missed.length === 0) {
    console.log('  ✅ 모든 토큰 매칭 성공')
  } else {
    console.log(`  ⚠️  매칭 실패 → 줄 삭제 (${missed.length}건):`)
    missed.forEach(m => console.log(`    ${m}`))
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

  // ── published_at (batch3 이후 연속: 09:05~09:09 UTC) ──────────────────────
  const BASE_DATE = new Date('2026-08-13T09:05:00Z')
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
