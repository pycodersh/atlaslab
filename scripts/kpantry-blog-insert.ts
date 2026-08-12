/**
 * kpantry-blog-insert.ts
 * Insert 10 K-Pantry blog posts from the two JSON batches.
 *
 * Decisions:
 * - app value: "k-pantry" (matches existing DB rows, NOT "kpantry" from JSON)
 * - slug conflict: "korean-anchovy-stock-guide" exists (paused) → renamed to
 *   "korean-anchovy-stock-guide-2" per instruction (no overwrite)
 * - pattern_id: null (column exists but is not in the JSON data)
 * - published_at: 10 timestamps spaced 1 min apart, all within the last 10 min
 *   → all visible in blog (lte now), all today's date, stable ordering
 */
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY!,
)

// ── Raw data from the two JSON batches ───────────────────────────────────────
const POSTS = [
  // ── Batch 1 ──────────────────────────────────────────────────────────────
  {
    slug: 'gochujang-vs-gochugaru-vs-doenjang',
    title: 'Gochujang, Gochugaru, Doenjang: How to Tell Them Apart',
    description: 'Three Korean pastes and powders that look interchangeable on the shelf and are not. What each one is, what happens when you swap them, and which to buy first.',
    category: 'Ingredients & Pantry',
    tags: ['gochujang', 'gochugaru', 'doenjang', 'ingredients'],
    content: `Walk down the Korean aisle and you will find a red tub, a red bag, and a brown tub. Recipes call for all three by unfamiliar names, and the packaging rarely explains itself in English.

They are not variations of the same thing. Two of them are fermented pastes and one is a dry spice, and substituting one for another changes the dish more than most people expect.

---

## The short version

| | What it is | Tastes like | Texture |
|---|---|---|---|
| **Gochujang** 고추장 | Fermented chili paste | Sweet, savory, mildly spicy | Thick, sticky |
| **Gochugaru** 고춧가루 | Dried chili flakes | Clean heat, slightly fruity | Dry powder or flakes |
| **Doenjang** 된장 | Fermented soybean paste | Salty, deeply funky, no heat | Thick, coarse |

Only one of the three is actually a chili paste. Doenjang has no chili in it at all.

---

## Gochujang: the sweet one

Gochujang is made from chili powder, glutinous rice, fermented soybean powder, and salt. The rice matters — it ferments into sugars, which is why gochujang tastes sweet before it tastes hot.

This is the part people miss. Gochujang is carrying **three** things into a dish: heat, sweetness, and fermented depth. If you treat it as "Korean hot sauce" you will be surprised when your dish comes out sweeter than expected.

Heat levels are printed on Korean packaging as GHU (고추장 매운맛 등급), usually 1 to 5. Most export brands sit around level 2 or 3, which is mild by Korean standards and noticeably milder than sriracha.

Use it in: tteokbokki, bibimbap sauce, spicy pork bulgogi, dipping sauces.

---

## Gochugaru: the one you should buy first

Gochugaru is just dried Korean chili peppers, deseeded and ground. No salt, no sugar, no fermentation. That makes it the most flexible of the three.

It comes in two grinds, and the difference is not cosmetic.

**Coarse (굵은 고춧가루)** is for kimchi. The flakes stay visible and release color slowly.

**Fine (고운 고춧가루)** dissolves into stews and sauces. Use it where you want the broth red rather than flecked.

If you buy one, buy coarse. It works in stews too, just with more visible flakes.

Korean chili is genuinely different from cayenne or generic chili powder — it is fruitier and much less hot, which is why Korean recipes call for tablespoons rather than teaspoons. Substituting cayenne one-for-one will make the dish inedible.

---

## Doenjang: the one with no chili

Doenjang is fermented soybean paste, the byproduct of making Korean soy sauce. It is often compared to miso, and that comparison is useful but incomplete — doenjang ferments longer, with whole soybean chunks, and tastes considerably stronger and saltier.

If a recipe wants doenjang and you use miso, the dish will be recognizable but flat. Use about 1.5 times the amount and accept that it will be milder.

Use it in: doenjang jjigae, vegetable seasoning (namul), ssamjang.

---

## Ssamjang, the fourth tub

You will also see ssamjang 쌈장, which is not a separate ingredient. It is gochujang and doenjang blended with sesame oil, garlic, and usually a little sugar, sold pre-mixed as a dipping sauce for grilled meat and lettuce wraps.

You can make it: roughly 2 parts doenjang to 1 part gochujang, plus a teaspoon of sesame oil and minced garlic.

---

## What happens when you swap them

**Gochujang in place of gochugaru** — common mistake in kimchi. The sugar in gochujang interferes with fermentation and the paste coats rather than distributes. The result is sweeter, cloudier, and ferments unpredictably.

**Gochugaru in place of gochujang** — the heat is there but the body is gone. Sauces that should cling will be thin. If you have to do it, add a little honey and a spoon of miso to replace the sweetness and depth.

**Doenjang in place of gochujang** — these are not substitutes for each other in any direction. One is spicy and sweet, the other is salty and funky.

---

## Storage

Gochujang and doenjang go in the fridge after opening and keep for a year or more. They may darken; that is fermentation continuing, not spoilage.

Gochugaru is the fragile one. It loses color and aroma at room temperature within a few months. **Keep it in the freezer** — this is standard practice in Korean homes and makes a visible difference.

---

## If you are buying one thing today

Buy gochugaru. It is the most used ingredient in Korean home cooking, it goes into more dishes than the other two combined, and it does not commit you to a particular flavor profile.

Gochujang second, doenjang third.

K-Pantry tells you which recipes each ingredient unlocks, so you can see what a purchase actually buys you before you make it. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    slug: 'gochujang-substitutes',
    title: 'Gochujang Substitutes That Actually Work',
    description: 'Gochujang carries heat, sweetness, and fermented depth at once, which is why most single-ingredient substitutes fall flat. Here are mixes that get close, with ratios.',
    category: 'Ingredients & Pantry',
    tags: ['gochujang', 'substitutes', 'ingredients'],
    content: `Most substitution advice for gochujang is some version of "use sriracha." It does not work, and it is worth understanding why before reaching for a replacement.

Gochujang is doing three jobs in a dish at once:

1. **Heat** — moderate, slow, not sharp
2. **Sweetness** — from fermented glutinous rice, not added sugar
3. **Umami and funk** — from fermented soybean

And a fourth thing that is easy to overlook: **body**. Gochujang is thick enough to cling to rice cakes and coat meat. A thin sauce will slide off.

Any substitute needs to cover at least three of those four.

---

## The mixes, ranked

### 1. Miso + gochugaru + honey — closest

| Ingredient | Amount |
|---|---|
| Red or white miso | 2 tbsp |
| Gochugaru | 1 tbsp |
| Honey or corn syrup | 1 tbsp |
| Soy sauce | 1 tsp |

Makes roughly 3 tbsp, replacing 3 tbsp gochujang.

This covers all four properties, which no single product does. Red miso gets you closer than white. Let it sit ten minutes before using so the gochugaru hydrates and stops tasting dusty.

Use for: stews, marinades, bibimbap sauce.

### 2. Miso + cayenne + sugar — when you have no gochugaru

| Ingredient | Amount |
|---|---|
| Red miso | 2 tbsp |
| Cayenne or paprika mix | 1/2 tsp |
| Sugar | 1 tbsp |
| Water | 1 tsp |

Note the cayenne amount. Korean chili is much milder than cayenne, so a one-for-one swap with gochugaru will overwhelm the dish. Start low.

Smoked paprika is tempting but adds a smokiness that is distinctly not Korean.

### 3. Sambal oelek + miso + sugar

Sambal is closer in texture than sriracha and has less vinegar. Two parts sambal, one part miso, plus a teaspoon of sugar per tablespoon.

### 4. Sriracha — heat only, and only in a pinch

Sriracha is thin, sharply vinegary, and garlicky. In a marinade where other ingredients dominate you may get away with it. In tteokbokki or bibimbap you will not.

If you use it, reduce or omit other vinegar in the recipe and add a little honey.

---

## What does not work

**Harissa.** The chili base is fine but harissa carries caraway, coriander, and cumin. Those read as North African, and they are noticeable in a Korean dish rather than blending in.

**Ketchup and chili flakes.** This circulates online. Ketchup's sweetness is sharp and tomato-forward, and the acidity is wrong. It produces something edible but not Korean.

**Chili garlic sauce alone.** No sweetness, no fermented depth, thin.

---

## Dishes where you should not substitute

Some dishes are gochujang delivery systems. If gochujang is the primary flavor rather than a component, a substitute will not read as the dish.

- **Tteokbokki** — the sauce is essentially gochujang
- **Bibimbap sauce** — same
- **Gochujang jjigae** — the name is the ingredient

For these, it is worth waiting until you can buy the real thing. A tub costs a few dollars and lasts a year in the fridge.

Where substitutes work fine: marinades for grilled meat, stir-fried vegetables, soups where gochujang is one of several seasonings.

---

## A note on heat

Export gochujang is usually milder than people expect — around level 2 or 3 on the Korean 1-to-5 scale. If your substitute tastes hotter than the dish should be, you have overcorrected.

The test: gochujang should taste sweet first, then warm. Not sharp.

---

## Making a small batch worth it

Mixed substitutes keep about a week in the fridge. Make three tablespoons at a time rather than a jar — the gochugaru dulls quickly once wet, and the mix is fast enough to redo.

If you find yourself making it more than twice, buy gochujang. You have already spent more on the components.

K-Pantry shows which recipes you can make with what you already have, and which ones need one more ingredient before they work. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    slug: 'korean-soy-sauce-types',
    title: 'Korean Soy Sauce: Why There Are Three Kinds and Which to Buy',
    description: 'Korean recipes call for jin ganjang, guk ganjang, or just soy sauce, and they are not interchangeable. What each does, and whether Japanese soy sauce can stand in.',
    category: 'Ingredients & Pantry',
    tags: ['soy-sauce', 'ganjang', 'ingredients'],
    content: `A Korean recipe will ask for 간장 and expect you to know which one. There are three in common use, they sit next to each other on the shelf in near-identical bottles, and swapping them produces predictable problems.

---

## The three

| Name | Korean | Color | Salt | Use |
|---|---|---|---|---|
| **Jin ganjang** | 진간장 | Dark | Moderate | Braising, marinades, stir-fry |
| **Guk ganjang** | 국간장 | Light amber | **High** | Soups, seasoning vegetables |
| **Yangjo ganjang** | 양조간장 | Dark | Moderate | All-purpose, dipping |

The crucial pair is jin ganjang and guk ganjang. They are not stronger and weaker versions of one thing — they do opposite jobs.

---

## Guk ganjang: light in color, heavy in salt

Also called 조선간장 or soup soy sauce. It is the traditional Korean type, made as a byproduct of doenjang production, and it is the one most likely to trip you up.

Two things about it:

**It is much saltier.** Often 1.5 to 2 times the sodium of regular soy sauce. Measuring it like ordinary soy sauce will ruin a soup.

**It barely colors the broth.** That is the entire point. Korean soups are seasoned to be clear — a pale, clean broth with full savory depth. Dark soy sauce would make miyeok-guk or seaweed soup look muddy.

It also tastes distinctly more fermented, closer to doenjang than to what most people think of as soy sauce.

Use it in: soups, seasoned vegetables (namul), blanched greens.

---

## Jin ganjang: the workhorse

Darker, sweeter, less aggressively salty. This is what goes into braised dishes, meat marinades, and stir-fries — anywhere you want the sauce to darken and glaze.

Modern jin ganjang is usually brewed or blended rather than traditionally fermented, and it is the closest of the three to Japanese soy sauce.

Use it in: jangjorim, galbi jjim, bulgogi marinade, japchae.

---

## Can Japanese soy sauce substitute?

For jin ganjang, yes, mostly.

Kikkoman-style shoyu is slightly sweeter and less salty than jin ganjang but close enough that most dishes will work. Use the same amount and taste.

**For guk ganjang, no.** This is the substitution that fails. Japanese soy sauce is darker and less salty, so you get a broth that is both too dark and under-seasoned. Adding more to fix the seasoning makes the color worse.

If you have no guk ganjang and need to season a soup, the better workaround is **salt plus a small spoon of doenjang** — that gets you the salinity and some of the fermented depth without the color.

Tamari behaves like Japanese soy sauce here, with the same limitation.

---

## The others you will see

**맛간장 (mat ganjang)** — seasoned soy sauce, pre-mixed with aromatics, sometimes sugar. Convenient, but you lose control of the sweetness. Fine for dipping, awkward in recipes that also call for sugar.

**어간장 / fish sauce blends** — regional and specialized. Not needed early.

---

## If you are buying one bottle

Buy jin ganjang or a general-purpose Korean brewed soy sauce. It covers most of what a beginner cooks — marinades, stir-fries, braises.

Add guk ganjang when you start making soups regularly, which in Korean cooking happens sooner than you expect. Almost every home meal includes one.

---

## A practical seasoning note

Korean recipes often season soups with guk ganjang **and** salt together rather than one or the other. The soy sauce carries fermented flavor, and salt adjusts the final salinity without adding more of that flavor.

If your soup tastes flat but salty enough, that usually means you used only salt. If it tastes muddy and too strong, you used only soy sauce.

K-Pantry tracks which of these you have and shows what you can cook right now with them. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    // RENAMED: was "korean-anchovy-stock-guide" but that slug exists (paused)
    slug: 'korean-anchovy-stock-guide-2',
    title: 'Anchovy Stock: The Base Under Most Korean Soups',
    description: 'Myeolchi yuksu takes twenty minutes and changes almost every Korean soup and stew you make. Ratios, the two mistakes that make it bitter, and how to store it.',
    category: 'Cooking Basics',
    tags: ['stock', 'anchovy', 'dashima', 'soup'],
    content: `If your Korean soups taste thin compared to what you have eaten in restaurants, the missing piece is usually not a seasoning. It is the stock.

Most Korean soups and stews start from 멸치육수, anchovy and kelp stock. It takes about twenty minutes of mostly unattended time, and the difference between using it and using water is not subtle.

---

## What you need

| Ingredient | Amount per 1 liter water |
|---|---|
| Dried anchovies (국물용) | 10–15, about 20g |
| Dried kelp (다시마) | one 10cm square |

That is the base. Everything else is optional.

**Buy the right anchovies.** Korean stores sell at least two sizes. The small ones (볶음용, 2–3cm) are for stir-frying as a side dish and will not give you much stock. You want the large ones (국물용, 6–8cm), sold in bigger bags and usually cheaper per gram.

---

## The two mistakes

### 1. Leaving the guts in

Large dried anchovies have a dark digestive tract along the belly. It is bitter. Pinch the head off, split the body with your thumb, and flick the black strip out.

Opinions differ on the heads — many Korean cooks keep them for depth, some remove them for a cleaner taste. The guts are not optional. Removing them takes about two minutes for a full batch, and you can prep a week's worth at once.

### 2. Boiling the kelp

Kelp releases glutamates quickly and then releases slime and bitterness. **Take it out after about ten minutes**, before or just as the water reaches a boil.

This is the single most common reason homemade Korean stock tastes vaguely bitter and looks cloudy.

---

## The method

1. Put anchovies and kelp in 1 liter of **cold** water. Cold start extracts more from the kelp.
2. Bring to a gentle simmer over medium heat, about 10 minutes.
3. **Remove the kelp** as it approaches a boil.
4. Simmer the anchovies another 10–15 minutes, uncovered.
5. Strain.

You should end up with roughly 800ml of pale golden stock from 1 liter of water.

Do not boil hard. A rolling boil makes the stock cloudy and pushes bitterness out of the anchovies.

---

## Optional additions

Each of these changes the character. Add one or two, not all.

- **Dried shiitake** (1–2) — deeper, earthier, good for doenjang jjigae
- **Onion, halved** — sweetness, rounds out sharp edges
- **Green onion roots** — mild aromatic lift
- **Radish, a few slices** — clean sweetness, standard in soup stocks
- **Dried shrimp** — sharper seafood note

A very standard home version is anchovy, kelp, onion, and radish.

---

## Storage

Refrigerated, three days. It goes off faster than you expect.

Better: freeze it flat in a zip bag, or in an ice cube tray for small amounts. It keeps two to three months and drops straight into a hot pot.

Most Korean home cooks make a large batch on the weekend and freeze it in portions. Two liters covers a week of soups.

---

## The shortcut

Korean grocery stores sell 육수팩 — stock packets, essentially large tea bags with anchovy, kelp, and aromatics already inside. Drop one in boiling water for ten minutes and pull it out.

They are genuinely convenient and reasonably good. The stock is a little flatter than made-from-scratch and you cannot adjust the ratio, but for a weeknight it is a fair trade.

---

## Vegetarian version

Kelp plus dried shiitake plus radish and onion. Same method, and take the kelp out at the same point.

It is lighter than anchovy stock and slightly sweeter. For doenjang jjigae the difference is small. For soups where the seafood note carries the dish, it is noticeable.

---

## What it changes

Swap water for anchovy stock in doenjang jjigae, kimchi jjigae, tteokguk, sundubu, or any noodle soup and the dish gains a savory floor it was missing. It is the closest thing Korean home cooking has to a single trick that improves many dishes at once.

K-Pantry shows which recipes you can make with the ingredients you already have, including the ones that only need stock. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    slug: 'korean-pantry-first-ingredients',
    title: 'The First Eight Things to Buy for a Korean Pantry',
    description: 'Korean recipes assume a stocked pantry, and the shopping list looks overwhelming from outside. Here is the order to buy in, and what each purchase actually unlocks.',
    category: 'Ingredients & Pantry',
    tags: ['pantry', 'shopping', 'beginner', 'ingredients'],
    content: `The barrier to cooking Korean food at home is rarely technique. Most home dishes are simple. The barrier is that recipes assume a pantry you do not have, so a single dish turns into a forty-dollar shopping trip.

The way around this is to buy in an order where each purchase unlocks several dishes rather than one.

---

## The order

### 1. Gochugaru (Korean chili flakes)

The highest-value first purchase. It appears in kimchi, most stews, seasoned vegetables, and stir-fries, and it has no real substitute — cayenne is far hotter and lacks the fruitiness.

Buy coarse grind if choosing one. Store it in the freezer; it fades fast at room temperature.

### 2. Soy sauce

A Korean brewed soy sauce or jin ganjang. Marinades, braises, stir-fries, seasoning.

Japanese soy sauce works acceptably here if you already have it. Save the money for something you cannot substitute.

### 3. Sesame oil

Toasted, not the pale untoasted kind. It is a finishing oil, not a cooking oil — added off the heat, at the end, in small amounts.

This is the ingredient that makes food taste specifically Korean rather than generically Asian. A small bottle lasts a long time.

### 4. Garlic

Fresh, and more than you think. Korean cooking uses garlic at a volume that surprises people.

Buying pre-minced in a jar is common in Korean homes too, and it is fine. Frozen minced garlic cubes are better than the jarred kind in oil.

### 5. Gochujang

Now the spicy staples open up: tteokbokki, bibimbap, spicy marinades, dipping sauces.

One tub lasts a year in the fridge.

### 6. Doenjang

Fermented soybean paste. Doenjang jjigae alone justifies it, and it also seasons vegetables and makes ssamjang when combined with gochujang.

Miso can stand in at reduced strength if you already have it, but the two are not the same.

### 7. Dried anchovies and kelp

These two together make the stock that sits under most Korean soups. Bought as a pair because neither does the job alone.

If that feels like a step too far, stock packets (육수팩) are a reasonable substitute for a while.

### 8. Short-grain rice

Korean meals are built around it, and long-grain rice genuinely changes the meal — the texture is meant to be slightly sticky.

Japanese short-grain rice is the same category and works.

---

## What not to buy yet

The specialty items that appear in single recipes and then sit unused:

- Perilla oil — distinctive, but narrow
- Fish sauce (액젓) — mostly for kimchi making
- Corn syrup (물엿) — sugar and honey cover it
- Rice cakes — buy when you make tteokbokki, they do not keep well
- Gim, dried anchovies for stir-frying, specialty pastes

None of these are wrong. They are just poor value at the start.

---

## Rough cost

All eight run about 50–70 USD at a Korean grocery, most of it in items that last six months to a year. The recurring cost after that is garlic, rice, and vegetables.

The expensive-feeling part is that it lands in one trip. Splitting it across two visits — items 1 to 4, then 5 to 8 — makes it easier and still lets you cook after the first trip.

---

## Where to buy

**Korean grocery stores** are cheapest and have the widest range. H Mart in North America, oriental supermarkets in most European cities.

**General Asian grocers** will have soy sauce, sesame oil, and rice, and often gochujang. Gochugaru and guk ganjang are less reliable.

**Online** works for shelf-stable items and is sometimes the only option. Check the gochugaru is Korean rather than generic chili flakes — the packaging usually says 고춧가루.

---

## The point of the order

After items 1 to 4 you can already cook a surprising amount: seasoned vegetables, stir-fried dishes, simple marinated meat, egg dishes. That is enough to find out whether you will keep cooking this way before committing to the rest.

K-Pantry works from the same idea in reverse — you tell it what you have, and it shows what you can make now and what one more ingredient would unlock. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },

  // ── Batch 2 ──────────────────────────────────────────────────────────────
  {
    slug: 'how-to-buy-store-and-use-kimchi',
    title: 'Kimchi: How to Buy It, Store It, and Use It When It Turns Sour',
    description: 'Kimchi does not expire, it ferments, and sour kimchi is an ingredient rather than a problem. How to choose a jar, keep it well, and tell fermentation from spoilage.',
    category: 'Ingredients & Pantry',
    tags: ['kimchi', 'storage', 'fermentation', 'ingredients'],
    content: `Kimchi is the one Korean ingredient most people buy before they know what to do with it. Then it sits in the fridge, gets sharper every week, and at some point you wonder whether it has gone off.

It almost certainly has not. Kimchi is a living ferment, and the stage it is at determines what you should cook with it — not whether you should throw it out.

---

## What is on the shelf

| Korean | What it is |
|---|---|
| 포기김치 | Whole cabbage halves, cut before serving |
| 맛김치 | Same thing, pre-cut. Easier for beginners |
| 깍두기 | Cubed radish, crunchy, good with soups |
| 총각김치 | Small whole radishes with greens attached |
| 겉절이 | Fresh, unfermented, eaten like a salad |

Start with 맛김치. Cutting a whole cabbage half without making a mess takes practice, and there is no flavor difference.

---

## Reading the jar

Look for the **production date**, not the expiry date. Kimchi sold in Western supermarkets is often already several weeks old and well into fermentation, which is fine but means it will turn sour quickly.

A few things worth checking:

- **Fish products.** Most kimchi contains 젓갈 — fermented shrimp or anchovy. If you need it vegan, look for 비건 or a vegetarian label specifically; "vegetable kimchi" does not guarantee it.
- **Sugar and additives.** Some export brands add noticeable sugar. The ingredient list is short in good kimchi.
- **Liquid level.** The cabbage should be sitting in brine, not dry at the top.

---

## Storing it

**Keep it submerged.** Press the kimchi down so the brine covers it whenever you take some out. Exposed kimchi at the surface dries, discolors, and grows yeast faster.

**Use a clean utensil.** Every time. Kimchi keeps for months precisely because its own environment is hostile to spoilage bacteria, and the usual way people ruin a jar is introducing something else.

**Glass or a proper kimchi container.** Plastic holds the smell permanently, and kimchi produces gas as it ferments — a container with a bit of headroom is worth it.

It keeps refrigerated for months. It will simply keep getting more sour.

---

## Fresh, ripe, sour: three different ingredients

This is the part that changes how you cook.

**Fresh (days old).** Crisp, mildly sweet, lightly spicy. Eat it as a side dish. Do not cook with it — heat wastes the crunch and it lacks the acidity that cooked kimchi dishes rely on.

**Ripe (2–4 weeks).** The everyday stage. Good raw, good in pancakes.

**Sour (신김치, 1 month+).** Sharp, soft, deeply savory. **This is what Korean recipes actually want** for kimchi jjigae, kimchi fried rice, and kimchi pancake. Many Korean households deliberately keep a container of sour kimchi for cooking.

If a kimchi stew you made tasted flat, young kimchi is the usual reason.

---

## When it has actually gone bad

Three signals, in order of how often they worry people unnecessarily.

**White film on the surface.** Usually 골마지 — a harmless kahm yeast that forms on exposed ferments. Skim it off, push the kimchi back under the brine. It affects flavor slightly and signals that air is getting in.

**Fuzzy or colored mold.** Green, black, or blue fuzz is different. Discard the jar.

**Slimy texture or an off, rotten smell** rather than a sour one. Discard.

Sour and strong-smelling on its own is not spoilage. That is the point of the food.

---

## Making sour kimchi easier to eat

If it is too sharp even for cooking, a pinch of sugar in the pan balances the acid. Rinsing kimchi in water is sometimes suggested but strips the seasoning along with the sourness — use it as a last resort.

The kimchi juice at the bottom of the jar is worth keeping. It goes into fried rice, stews, and cold noodle broths, and it is the most concentrated flavor in the container.

---

## The practical summary

Buy pre-cut. Keep it under the brine. Let it get sour and treat that as an upgrade rather than a countdown.

K-Pantry shows what you can cook right now with the kimchi in your fridge and whatever else is in there. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    slug: 'sesame-oil-vs-perilla-oil',
    title: 'Sesame Oil vs Perilla Oil: Two Bottles That Look the Same',
    description: 'Chamgireum and deulgireum sit side by side in Korean stores and do different jobs. What each tastes like, where it belongs, and why one of them goes rancid fast.',
    category: 'Ingredients & Pantry',
    tags: ['sesame-oil', 'perilla-oil', 'ingredients'],
    content: `Two small bottles, similar labels, similar amber color, similar price. One is 참기름 (chamgireum, toasted sesame oil) and the other is 들기름 (deulgireum, perilla oil).

Most English recipes only mention sesame oil, so perilla oil goes unbought and a lot of Korean side dishes end up tasting almost but not quite right.

---

## What they are

| | 참기름 Sesame | 들기름 Perilla |
|---|---|---|
| From | Toasted sesame seeds | Perilla seeds (들깨) |
| Flavor | Nutty, roasted, round | Grassy, herbal, slightly bitter edge |
| Color | Deep amber | Lighter, greenish-gold |
| Shelf life | Months | **Weeks after opening** |
| Storage | Cool cupboard is acceptable | Refrigerate |

Perilla is not shiso, though the plants are related. Korean perilla leaves (깻잎) and Japanese shiso taste noticeably different, and the oil comes from the seed rather than the leaf.

---

## Both are finishing oils

This is the mistake that matters more than choosing between them.

Neither of these is a cooking oil. Both are aromatic oils added **off the heat, at the end**, usually by the teaspoon. Heating them hard destroys the aroma you paid for and, in perilla's case, turns it bitter.

If a recipe says to stir-fry in sesame oil, it usually means a neutral oil with a little sesame oil added at the finish. Korean home cooking uses ordinary vegetable oil for the actual frying.

---

## Where sesame oil goes

It is the default. Bibimbap, most namul, marinades, dipping sauces, a drizzle over rice, seasoning for gim.

A useful mental note: sesame oil is what makes food read as *Korean* rather than generically East Asian. It is used more liberally than in Chinese cooking and more often than in Japanese.

Buy small bottles. It keeps well but the aroma fades once opened, and a large bottle will go flat before you finish it.

---

## Where perilla oil goes

Perilla is the specialist, and in the dishes it belongs to it is not really replaceable.

- **Namul made from stronger greens** — 취나물, 고사리, dried vegetable dishes
- **Roasting gim** (seaweed sheets) — brushed on before toasting with salt
- **들깨 dishes** — perilla seed stews and soups, where the oil reinforces the ground seed
- **Buckwheat noodles and some cold dishes**

If you have eaten a Korean vegetable side dish that tasted herbal in a way you could not place, it was probably perilla oil.

---

## The rancidity problem

Perilla oil has a high proportion of unsaturated fat, which is why it goes off much faster than sesame oil. Left in a cupboard, an opened bottle can turn within a couple of months.

Rancid perilla oil smells like old paint or crayons rather than grass. It is unpleasant enough that you will notice, but people often assume that is just what the oil tastes like and stop buying it.

**Refrigerate it after opening.** Buy the smallest bottle available. Check the production date rather than the expiry.

---

## Can you substitute one for the other?

Functionally yes, in that both are aromatic finishing oils. Flavor-wise, they are clearly different.

Using sesame oil where perilla is called for gives you a dish that works but tastes more conventional. Using perilla where sesame is called for is more noticeable — the grassy note stands out in sweet or meat-based dishes.

If you own one, own sesame oil. Add perilla when you start making vegetable side dishes regularly.

---

## A note on buying

Korean pressed sesame oil (often labeled 참기름 100%) is stronger than the blended sesame oils sold in general supermarkets, some of which are mostly soybean oil with sesame added for flavor. Check the ingredient list — it should say one thing.

The difference is easy to taste side by side and easy to miss otherwise.

K-Pantry keeps track of which of these you have and shows what they unlock. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    slug: 'korean-dishes-with-kimchi-rice-and-eggs',
    title: 'Kimchi, Rice, and Eggs: What You Can Actually Make',
    description: 'Three ingredients most people already have, and the Korean dishes they cover. Plus what one more ingredient would unlock, and the technique that separates good kimchi fried rice from bad.',
    category: 'Cooking Basics',
    tags: ['kimchi', 'fried-rice', 'eggs', 'beginner'],
    content: `Kimchi, cooked rice, and eggs. If you have those three, you can already make several Korean meals without another trip to the store.

This is worth knowing because Korean recipes usually read as though you need a full pantry. Most weeknight Korean home cooking does not.

---

## What the three cover on their own

**Kimchi fried rice (김치볶음밥)** — the obvious one, and the best use of sour kimchi.

**Rice with a fried egg and kimchi** — barely a recipe, but it is a real meal in Korea. Runny yolk stirred through hot rice, kimchi on the side.

**Kimchi jeon-ish pancake** — works with flour, but egg alone binds a thin one.

**Bokkeumbap variations** — rice fried with kimchi juice, no other seasoning needed.

---

## The technique that matters

Most kimchi fried rice made outside Korea goes wrong in the same way: everything goes into the pan at once and comes out wet and pink rather than concentrated and deep red.

The order fixes it.

1. **Oil, then kimchi alone.** Medium-high heat. Cook the kimchi by itself for three or four minutes until the edges darken and it stops smelling raw. This is the step people skip and it is where the flavor comes from.
2. **Add the kimchi juice** and let it reduce for a minute. The pan should look almost dry.
3. **Then the rice.** Break it up, coat it, keep it moving.
4. **Sesame oil off the heat**, egg on top.

Cold day-old rice works better than fresh — fresh rice steams and clumps.

---

## Two small things Korean cooks do

**A pinch of sugar.** Sour kimchi is sharp, and a small amount of sugar rounds it without making the dish sweet. Half a teaspoon for two servings.

**Butter at the end.** Common in Korea, and it does something sesame oil does not — it softens the acidity and makes the whole thing taste richer. A teaspoon is enough.

---

## What one more ingredient unlocks

This is the useful way to think about a thin pantry.

| Add | You can now make |
|---|---|
| **Tofu** | Kimchi jjigae, kimchi tofu (두부김치) |
| **Pork belly or bacon** | Proper kimchi fried rice, kimchi jjigae with depth |
| **Gochujang** | Bibimbap-style rice bowl |
| **Flour** | Kimchi pancake (김치전) |
| **Spam or canned tuna** | Two of the most-cooked Korean home versions of fried rice |
| **Gim (seaweed sheets)** | Kimchi gimbap, or crumbled over rice |

None of these is expensive, and each opens several dishes rather than one.

---

## Kimchi jjigae with almost nothing

If you have kimchi, rice, and one protein, kimchi jjigae is more forgiving than its reputation suggests.

Sour kimchi, a little of its juice, water or stock, and pork or tofu. Simmer twenty minutes. That is the whole dish. Gochugaru if you want it redder, a spoon of gochujang if you want it thicker and sweeter — both optional.

The common failure is using fresh kimchi, which produces a stew that tastes like hot cabbage water. Sour kimchi is the requirement.

---

## Eggs, the Korean way

A few uses beyond frying:

- **Gyeran-mari (계란말이)** — rolled omelette, usually with chopped vegetables. A standard lunchbox item.
- **Gyeran-jjim (계란찜)** — steamed egg, soft and savory, made with stock if you have it
- **Half-boiled on rice** — the way most Koreans actually eat eggs at home

---

## The point

Most people underestimate what is already in their kitchen and overestimate what a Korean recipe requires. Starting from what you have rather than from a recipe list is usually the faster way in.

That is the idea K-Pantry is built on — tell it what is in your fridge, and it shows what you can cook now and what one more ingredient would add. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    slug: 'how-to-cook-korean-rice',
    title: 'Korean Rice: Why It Is Different and How to Cook It',
    description: 'Korean rice is meant to be slightly sticky and eaten with a spoon. The grain, the washing, the water ratio, and why long-grain rice changes the meal more than you would expect.',
    category: 'Cooking Basics',
    tags: ['rice', 'basics', 'beginner'],
    content: `Rice is not a side in a Korean meal. It is the center, and everything else is seasoned to be eaten with it. Which means getting it right changes the meal more than any single dish does.

It also means long-grain rice does not really work, and it is worth understanding why before assuming rice is rice.

---

## The grain

Korean rice is **short-grain** (단립종), the same broad category as Japanese rice. Cooked, it is slightly sticky and the grains hold together in loose clumps.

That stickiness is functional. Korean meals are eaten with a spoon and metal chopsticks, and food is often wrapped in lettuce or perilla leaves. Rice that falls apart makes both awkward.

Jasmine or basmati produce a fine dish of rice but a different eating experience. If short-grain is unavailable, Japanese rice is the same category and works without adjustment. Calrose is an acceptable middle ground.

---

## Washing

Rinse until the water runs mostly clear — usually three or four changes.

Use your hand to swirl and lightly rub the grains rather than scrubbing. Modern milled rice does not need aggressive washing, and broken grains make the result gluey.

The first rinse should be quick. Dry rice absorbs water fast, and you do not want it taking on the starchy water from the first pass.

---

## Soaking

Thirty minutes, in the water you will cook it in.

Soaked rice cooks more evenly and comes out with a better texture — the center hydrates rather than staying firm while the outside softens. Rice cookers with a soak cycle build this in; if yours does not, add the time yourself.

In a hurry, twenty minutes still helps. Skipping it entirely gives a noticeably firmer result.

---

## Water ratio

Here is where most people go wrong, because the ratios they know are for long-grain rice.

| Rice state | Water |
|---|---|
| Soaked short-grain | **1 : 1** by volume |
| Unsoaked short-grain | 1 : 1.2 |

Compare that to the 1:1.5 or 1:2 common for long-grain and you can see why using a familiar ratio produces mush.

The traditional check: the water should sit about one knuckle above the surface of the leveled rice. It works because the depth of water needed scales with surface area rather than volume.

---

## Stovetop method

1. Washed and soaked rice in a heavy pot with a tight lid.
2. High heat until it boils, about 5 minutes.
3. **Lowest heat, lid on, 12–13 minutes.** Do not lift the lid.
4. Heat off, **rest 10 minutes**, still covered.
5. Fluff from the bottom with a rice paddle or spatula.

The rest is not optional. Rice straight off the heat is wet at the bottom and dry at the top; ten minutes of residual steam evens it out.

---

## Rice cookers

A basic rice cooker does all of the above automatically and is the reason nearly every Korean household owns one. If you cook rice more than twice a week, it is worth the counter space.

Korean pressure rice cookers produce a noticeably different texture — glossier and slightly chewier. That difference is real, though not necessary for good rice.

---

## Nurungji, the bit at the bottom

In a stovetop pot, the layer that lightly scorches on the bottom is 누룽지, and it is not a mistake. It is eaten as a snack, or hot water is poured over it to make 숭늉, a mild toasted rice tea served at the end of a meal.

To make it deliberately: after the rice is done, turn the heat back to high for one to two minutes.

---

## Leftover rice

Korean households portion cooked rice into single servings and freeze it while still warm — the trapped steam is what keeps it from drying out. Microwaved from frozen, it comes back close to fresh.

Refrigerated rice goes hard and is better repurposed than reheated. That is exactly what makes it ideal for fried rice.

K-Pantry starts from what you already have, including yesterday's rice. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
  {
    slug: 'korean-namul-vegetable-side-dishes',
    title: 'Namul: One Method for a Dozen Vegetable Side Dishes',
    description: 'Korean vegetable banchan look like a dozen separate recipes and are mostly one technique. Blanch, squeeze, season by hand — and the step almost everyone skips.',
    category: 'Cooking Basics',
    tags: ['namul', 'banchan', 'vegetables', 'basics'],
    content: `The small side dishes that arrive with a Korean meal look like a lot of separate cooking. Most of them are the same three steps applied to different vegetables.

Once you have the method, spinach, bean sprouts, zucchini, and radish are variations rather than new recipes.

---

## The method

1. **Blanch** briefly in salted water
2. **Shock** in cold water to stop cooking
3. **Squeeze out the water** — hard
4. **Season by hand** with garlic, sesame oil, salt, sesame seeds

That is it. The seasoning is close to identical across vegetables, and the differences are in blanching time and how firmly you squeeze.

---

## The step people skip

Squeezing. It feels excessive and it is not.

Blanched spinach holds an enormous amount of water. If you leave it in, the seasoning dilutes, the dish weeps in the fridge, and it tastes flat no matter how much sesame oil you add.

Gather the vegetable into a ball in both hands and press until water stops running. Then press again. Spinach should reduce to a fraction of its blanched volume.

This single step is the difference between namul that tastes seasoned and namul that tastes wet.

---

## Season with your hands

Korean cooks mix namul by hand, not with a spoon, and it is not superstition. Hands distribute a small amount of oil and salt across a large volume of leafy vegetable in a way utensils do not, and you can feel when the coating is even.

Start with less seasoning than you think, taste, and add. Namul should taste like the vegetable with support, not like sesame oil.

---

## Blanching times

| Vegetable | Time | Notes |
|---|---|---|
| Spinach (시금치) | 20–30 sec | Stems first if thick |
| Soybean sprouts (콩나물) | 5–7 min | See the lid rule below |
| Mung bean sprouts (숙주) | 30 sec | Much faster than soybean |
| Zucchini (애호박) | Not blanched — salted, then pan-fried | |
| Radish (무) | Not blanched — salted, then simmered in its own water | |

Spinach in particular is over-blanched constantly. Thirty seconds is enough; the residual heat finishes it.

---

## The bean sprout lid rule

Soybean sprouts have a rule that sounds like folklore and is worth following: **either keep the lid on the whole time or leave it off the whole time.** Lifting it partway through is said to produce a beany, raw smell.

The usual explanation is that opening the pot drops the temperature and interrupts cooking unevenly. Whatever the mechanism, the outcome is consistent enough that every Korean cook follows it.

Soybean sprouts (콩나물, with the yellow head) need real cooking time. Mung bean sprouts (숙주) do not — treat them like spinach.

---

## The base seasoning

For one bunch of spinach or one large handful of blanched vegetable:

- 1 clove garlic, minced
- 1 tsp sesame oil
- 1/4 tsp salt, or 1 tsp guk ganjang
- 1 tsp toasted sesame seeds
- Optional: a little chopped green onion

Salt gives a cleaner result, soup soy sauce gives a deeper, more fermented one. Both are correct.

For stronger or dried vegetables, perilla oil in place of sesame oil is standard and tastes markedly different.

---

## How long they keep

Three to four days refrigerated. Namul is made in batches for exactly this reason — two or three at once on a weekend covers a week of meals.

They are also the components of bibimbap. If you have three namul in the fridge, bibimbap is rice, an egg, and gochujang away.

---

## Why it is worth learning first

Namul is the cheapest and fastest part of Korean home cooking, it uses vegetables you can buy anywhere, and it needs almost nothing from the Korean aisle — garlic, sesame oil, salt.

It is the part of a Korean meal you can start making before your pantry is stocked.

K-Pantry shows which dishes your current vegetables already cover. [Try K-Pantry](https://www.atlaslabstudios.com/kpantry)`,
  },
]

async function main() {
  // Base time: 10 minutes ago, then +1 min per post → all <= now, all today
  const baseMs = Date.now() - 10 * 60 * 1000

  const rows = POSTS.map((p, i) => ({
    app: 'k-pantry',
    locale: 'en',
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    tags: p.tags,
    content: p.content,
    is_paused: false,
    pattern_id: null,
    published_at: new Date(baseMs + i * 60 * 1000).toISOString(),
  }))

  console.log('\n=== ABOUT TO INSERT ===')
  rows.forEach((r, i) => console.log(`  [${i + 1}] ${r.slug} | published_at: ${r.published_at}`))

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(rows)
    .select('id, slug, app, published_at')

  if (error) {
    console.error('\n❌ Insert failed:', error)
    process.exit(1)
  }

  console.log(`\n✅ Inserted ${data?.length ?? 0} rows:`)
  data?.forEach(r => console.log(`   id=${r.id} | ${r.slug}`))

  // Verify public count after insert
  const { data: all } = await supabase
    .from('blog_posts')
    .select('id, app, is_paused, published_at')

  const publicNow = (all || []).filter(p => {
    if (p.is_paused) return false
    if (!p.published_at) return false
    return new Date(p.published_at) <= new Date()
  })
  console.log(`\n=== POST-INSERT PUBLIC COUNT: ${publicNow.length} ===`)

  const byApp = publicNow.reduce<Record<string, number>>((acc, p) => {
    acc[p.app] = (acc[p.app] ?? 0) + 1; return acc
  }, {})
  console.log('  By app:', byApp)
}

main().catch(err => { console.error(err); process.exit(1) })
