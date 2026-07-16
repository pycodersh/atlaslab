/**
 * Generate 200 EN blog posts for k-pantry (Korean food & cooking)
 * Inserts into blog_posts with app='k-pantry', locale='en', published_at=null
 *
 * Run: npx tsx scripts/generate-kpantry-blog.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 70)
}

// ── Category 1: Korean Pantry Essentials (30 posts) ────────────────────────
const cat1: { title: string; tags: string[]; slug: string; description: string; content: string }[] = [
  {
    title: 'The Complete Guide to Doenjang: Korea\'s Fermented Soybean Paste',
    slug: 'complete-guide-to-doenjang',
    tags: ['korean-food', 'ingredients', 'fermented'],
    description: 'Everything you need to know about doenjang — what it is, how it\'s made, and how to use it in your kitchen.',
    content: `## What Is Doenjang?

If you've ever tasted a rich, savory Korean stew and wondered what gives it that deep, complex flavor, the answer is almost always doenjang (된장). This fermented soybean paste is one of Korea's oldest and most essential condiments, with a history stretching back over 2,000 years.

Think of it as Korea's answer to Japanese miso — but earthier, funkier, and far more complex in flavor. While miso is often smooth and mild, doenjang is chunky, intensely aromatic, and carries a depth that can transform even the simplest dish into something extraordinary.

## How Doenjang Is Made

Traditional doenjang starts with meju — blocks of cooked soybeans that are dried and allowed to develop natural molds. These blocks are then submerged in brine and left to ferment for months. The liquid that rises to the top becomes ganjang (soy sauce), while the remaining solids become doenjang.

The best doenjang comes from small-batch traditional producers who follow this centuries-old process. Commercial versions exist and are perfectly usable, but traditional doenjang (한식 된장, hansik doenjang) has a depth of flavor that is worth seeking out.

## Flavor Profile

Doenjang is:
- **Intensely savory** (umami-forward)
- **Earthy and funky** (from fermentation)
- **Slightly salty** with a complex bitterness
- **Rich** with a lingering finish

A little goes a long way. Start with a tablespoon and build from there.

## How to Use Doenjang

**Doenjang jjigae (된장찌개):** The classic soybean paste stew, made with tofu, zucchini, mushrooms, and anchovy broth. This is everyday Korean comfort food.

**Seasoning sauce (쌈장, ssamjang):** Mix doenjang with gochujang, sesame oil, garlic, and sugar for a dipping sauce to eat with grilled meats and lettuce wraps.

**Marinades:** Add a spoonful to beef or pork marinades for deep umami flavor.

**Soups:** A tablespoon stirred into any vegetable or meat broth instantly adds complexity.

## Buying and Storing Doenjang

Look for doenjang in Korean grocery stores or online. The label should list soybeans, salt, and possibly a small amount of rice or barley — nothing else if you're buying the traditional variety.

Store opened doenjang in the refrigerator. It keeps for well over a year and only improves with age.

## Discover Korean Cooking with K-Pantry

Ready to explore more Korean pantry essentials? Discover authentic Korean ingredients, recipes, and cooking guides with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Gochujang: The Ultimate Guide to Korea\'s Chili Paste',
    slug: 'ultimate-guide-to-gochujang',
    tags: ['korean-food', 'ingredients', 'spicy'],
    description: 'Master gochujang — Korea\'s fermented chili paste — and discover how to use it in everything from stews to marinades.',
    content: `## What Is Gochujang?

Gochujang (고추장) is the red-hot heart of Korean cooking. This thick, fermented chili paste is made from gochugaru (Korean chili flakes), glutinous rice, fermented soybeans, and salt. The result is a paste that is simultaneously spicy, sweet, savory, and slightly tangy — a flavor combination that is uniquely Korean.

Once a niche ingredient found only in Korean households, gochujang has gone global. You'll find it in everything from fusion burgers to upscale restaurant sauces. But to truly understand it, you need to experience it in its natural habitat: Korean cooking.

## The Flavor of Gochujang

Gochujang is not simply "spicy." Its complexity is what makes it special:
- **Heat:** A slow, building warmth — not the sharp sting of raw chilies
- **Sweetness:** From the fermented glutinous rice
- **Umami:** Deep savory notes from the fermented soybean component
- **Tang:** A slight fermented sourness that develops over time

Spice levels vary by brand. Look for labels marked 순한맛 (mild), 보통맛 (medium), or 매운맛 (hot).

## Essential Uses for Gochujang

**Bibimbap sauce:** Mix gochujang with sesame oil, a little sugar, and rice vinegar. This is the classic sauce spooned over Korea's most famous rice bowl.

**Tteokbokki:** The iconic Korean street food — rice cakes simmered in a spicy-sweet gochujang sauce with fish cakes and green onions.

**Bulgogi marinade:** Add a spoonful to your soy-based bulgogi marinade for heat and depth.

**Dakgalbi:** Spicy stir-fried chicken marinated in gochujang — one of Korea's most beloved casual meals.

**Dipping sauce:** Mix with a little soy sauce, sesame oil, and vinegar for an instant dipping sauce for dumplings or raw vegetables.

## Gochujang vs Gochugaru

These are often confused but are very different ingredients. Gochugaru is the flaked or powdered dried chili used to make kimchi and many other dishes. Gochujang is the fermented paste. They are not interchangeable.

## Storing Gochujang

Always refrigerate after opening. Gochujang keeps for months and, like all fermented foods, often improves with age. The paste will darken over time — this is normal.

## Discover Korean Cooking with K-Pantry

Want to explore the full depth of Korean chili cooking? Discover authentic Korean ingredients, recipes, and cooking guides with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Korean Soy Sauce: Ganjang vs Regular Soy Sauce Explained',
    slug: 'korean-soy-sauce-ganjang-explained',
    tags: ['korean-food', 'ingredients', 'soy-sauce'],
    description: 'Not all soy sauce is the same. Learn the difference between Korean ganjang, soup soy sauce, and regular soy sauce.',
    content: `## The World of Korean Soy Sauce

Walk into any well-stocked Korean kitchen and you'll likely find at least two or three different types of soy sauce. To the uninitiated, this seems like overkill. But once you understand how each type functions, you'll wonder how you ever cooked without them.

## Traditional Ganjang (한식 간장)

Traditional Korean soy sauce is a byproduct of making doenjang (fermented soybean paste). When soybeans ferment in brine, the dark liquid that rises to the top is carefully drawn off and aged separately — this is ganjang (간장).

Unlike Chinese or Japanese soy sauces, traditional ganjang is often lighter in color but intensely savory. It has a complex, slightly funky flavor from the long fermentation process and is used to season everything from soups to vegetables to dipping sauces.

## Soup Soy Sauce (국간장, Guk-ganjang)

This is perhaps the most important soy sauce to understand for Korean cooking. Soup soy sauce is made specifically to season clear soups and broths. It is:

- **Lighter in color** than regular soy sauce (so it doesn't darken your soup)
- **Saltier** in flavor
- **More delicate** — the flavor blends seamlessly into broth

If you're making miyeok-guk (seaweed soup), kongnamul-guk (soybean sprout soup), or any clear Korean soup, reach for soup soy sauce. Using regular soy sauce here will make the soup dark and the flavor slightly off.

## Regular (All-Purpose) Soy Sauce (양조간장)

This is the brewed soy sauce most similar to Japanese shoyu. Brands like Sempio 501 or Chung Jung One are popular choices. Use this for:
- Stir-fries
- Marinades (bulgogi, galbi)
- Dipping sauces
- Seasoning vegetables

## Quick Reference

| Use | Soy Sauce Type |
|-----|---------------|
| Clear soups | Soup soy sauce (국간장) |
| Marinades | Regular soy sauce (양조간장) |
| Stir-fries | Regular soy sauce |
| Dipping sauce | Regular or traditional ganjang |
| Aged flavor | Traditional ganjang (한식 간장) |

## Discover Korean Cooking with K-Pantry

Ready to stock your Korean pantry with the right ingredients? Discover authentic Korean ingredients, recipes, and cooking guides with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Why Sesame Oil Is Non-Negotiable in Korean Cooking',
    slug: 'sesame-oil-korean-cooking',
    tags: ['korean-food', 'ingredients', 'seasoning'],
    description: 'Sesame oil is the finishing touch that makes Korean food taste Korean. Here\'s how to use it and which brand to buy.',
    content: `## The Role of Sesame Oil in Korean Cuisine

There is one ingredient that, more than almost any other, makes Korean food taste Korean. It's not gochujang. It's not doenjang. It's sesame oil (참기름, chamgireum).

This golden, intensely aromatic oil is used across Korean cuisine as a finishing oil, flavor enhancer, and marinade ingredient. A few drops drizzled over a finished dish can elevate it from good to extraordinary.

## Korean Sesame Oil vs Other Sesame Oils

Not all sesame oil is the same. Korean sesame oil (참기름) is made from deeply toasted sesame seeds, which gives it a richer, nuttier, more intense flavor than many other Asian sesame oils. The color is darker and the aroma is more pronounced.

When shopping, look for Korean brands like:
- **Ottogi** (오뚜기)
- **Beksul** (백설)
- **Sempio** (샘표)

Avoid "light" or "blended" sesame oils — these lack the depth you need for Korean cooking.

## How Koreans Use Sesame Oil

**As a finishing oil:** The most common use. A teaspoon drizzled over bibimbap, namul (seasoned vegetables), or kongnamul-guk right before serving.

**In marinades:** Combined with soy sauce, garlic, and sugar for bulgogi or galbi.

**In dipping sauces:** A few drops in soy sauce-based dipping sauces adds dimension.

**To season namul:** When making banchan (side dishes) like spinach, bean sprouts, or gosari, sesame oil is mixed in along with garlic and soy sauce.

**In rice:** Koreans often mix sesame oil into warm rice before making kimbap.

## Important: Don't Cook With It

Korean sesame oil has a low smoke point and its delicate flavor compounds break down under high heat. Always add it at the end of cooking or use it raw. For high-heat cooking, use a neutral oil like vegetable or canola oil.

## How Much to Use

A little goes a very long way. Start with half a teaspoon and taste. Sesame oil can easily overpower a dish if used too liberally.

## Discover Korean Cooking with K-Pantry

Want to cook authentic Korean food at home? Discover the right ingredients, techniques, and recipes with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Gochugaru: The Korean Chili Flakes That Make Kimchi Red',
    slug: 'gochugaru-korean-chili-flakes-guide',
    tags: ['korean-food', 'ingredients', 'spicy'],
    description: 'Gochugaru is the key to kimchi\'s iconic red color and flavor. Learn what it is, how to buy it, and how to use it.',
    content: `## What Is Gochugaru?

The vibrant red color of kimchi, the warm glow of sundubu jjigae, the bright coating on tteokbokki — all of this comes from one ingredient: gochugaru (고추가루), Korean red chili flakes.

Gochugaru is made from sun-dried Korean red chilies that are de-seeded and ground to a coarse flake or fine powder. The flavor is fruity, mildly spicy, and slightly smoky — quite different from the sharp, vinegary heat of cayenne or the face-numbing intensity of Sichuan chilies.

## Coarse vs Fine Gochugaru

Gochugaru comes in two textures:

**Coarse (굵은 고추가루):** Used for making kimchi. The texture allows it to coat vegetables evenly and ferment beautifully.

**Fine (고운 고추가루):** Used in soups, stews, and sauces where you want the color and flavor distributed evenly through the liquid.

Many recipes simply call for "gochugaru" — when in doubt, use coarse.

## The Spice Level

Gochugaru registers around 1,500–10,000 Scoville units — much milder than cayenne (30,000–50,000 SHU). This allows Koreans to use it in large quantities without making food unbearably hot. It's about flavor as much as heat.

That said, spice levels vary significantly between brands and batches. Always taste before using generously.

## What Makes Korean Chili Flakes Different

The specific variety of Korean red pepper (Capsicum annuum) used for gochugaru has a naturally sweet, fruity undertone that other chili varieties lack. Combined with the sun-drying process, this produces a flavor that cannot be replicated by substituting cayenne, paprika, or other chili powders — though these can work in a pinch.

## Substitutes When You Can't Find Gochugaru

If you truly can't find gochugaru:
- Mix 2 parts mild paprika + 1 part cayenne for a rough approximation
- Ancho chili powder has a similar fruity depth (but different flavor)
- Accept that the dish won't taste quite the same and try to find the real thing

## Storing Gochugaru

Store in an airtight container away from heat and light. For best results, keep it in the freezer — the vibrant red color and flavor compounds degrade quickly at room temperature.

## Discover Korean Cooking with K-Pantry

Ready to cook with authentic Korean chili flakes? Discover the right ingredients and recipes with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Korean Fish Sauce: The Secret Umami Weapon',
    slug: 'korean-fish-sauce-guide',
    tags: ['korean-food', 'ingredients', 'fermented'],
    description: 'Korean fish sauce (aekjeot) is the umami backbone of kimchi and countless other dishes. Here\'s what you need to know.',
    content: `## The Umami Backbone of Korean Cuisine

If doenjang and gochujang are the headliners of the Korean pantry, fish sauce (액젓, aekjeot) is the unsung hero working behind the scenes. This pungent, salty liquid is one of the primary sources of umami in Korean cooking — and it's especially critical in kimchi.

## Korean Fish Sauce vs Southeast Asian Fish Sauce

Korean fish sauce is not interchangeable with Thai or Vietnamese fish sauce, though both serve similar purposes. Korean varieties are typically:

- **Thicker and more concentrated**
- **Less sweet** than Thai fish sauce
- **Fermented longer** — often 1–3 years

The two most common Korean fish sauces are:

**멸치액젓 (myeolchi aekjeot) — Anchovy fish sauce:** Made from fermented anchovies. Intense, salty, deeply savory. This is the most common type used in kimchi.

**까나리액젓 (kkanari aekjeot) — Sand lance fish sauce:** Milder and slightly sweet. Preferred by some cooks for kimchi, particularly in certain regional styles.

## Uses in Korean Cooking

**Kimchi:** Fish sauce is mixed with gochugaru, garlic, ginger, and other seasonings to make the kimchi paste. It seasons the vegetables while also jumpstarting fermentation.

**Soups and stews:** A tablespoon stirred into kimchi jjigae or doenjang jjigae adds depth without being identifiable as "fishy."

**Seasoned vegetables (namul):** Replaces or supplements salt in many side dish recipes.

**Dipping sauces:** Adds complexity to simple dipping sauces for dumplings or meat.

## Don't Be Afraid of the Smell

Yes, fish sauce smells strong — that's the fermentation. But this pungency disappears when cooked, leaving behind pure, clean umami. Trust the process.

## Buying and Storing

Look for Korean fish sauce at Asian grocery stores. Brands like Sempio and Chungjungone make reliable products. Store in the refrigerator after opening for longest shelf life — it keeps for years.

## Discover Korean Cooking with K-Pantry

Want to master the art of Korean seasoning? Discover authentic Korean pantry ingredients and recipes with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Perilla Oil vs Sesame Oil: What\'s the Difference?',
    slug: 'perilla-oil-vs-sesame-oil',
    tags: ['korean-food', 'ingredients', 'oils'],
    description: 'Korea uses both perilla oil and sesame oil, but they\'re not the same. Learn when to use which and why both deserve a place in your pantry.',
    content: `## Two Essential Korean Oils

If you've spent any time exploring Korean cooking beyond the basics, you've likely encountered perilla oil (들기름, deulgireum) — a nutty, greenish oil with a flavor profile that is completely distinct from sesame oil. Many non-Koreans are surprised to discover that Korea uses two very different finishing oils, each with its own personality and applications.

## What Is Perilla Oil?

Perilla oil is pressed from the seeds of the perilla plant (Perilla frutescens) — the same plant that produces the large, aromatic perilla leaves used in Korean BBQ and salads. The oil has a characteristic greenish-gold color and a rich, slightly nutty, herbal flavor.

Unlike sesame oil, which is made from toasted seeds, perilla oil has a more raw, grassy quality. Some describe it as similar to walnut oil or flaxseed oil, but with a uniquely Korean character.

## Key Differences

| | Sesame Oil (참기름) | Perilla Oil (들기름) |
|--|--|--|
| **Color** | Golden amber | Green-gold |
| **Flavor** | Toasty, nutty, intense | Herbal, nutty, grassy |
| **Smoke point** | Low | Low |
| **Best for** | Finishing, marinades | Certain namul, stews |
| **Health** | Rich in omega-6 | Rich in omega-3 |

## When to Use Perilla Oil

Perilla oil shines in certain specific applications:

**Spinach namul (시금치나물):** Many traditionalists use perilla oil rather than sesame oil for seasoning spinach, which brings out a different, earthier dimension.

**Perilla leaf season dishes:** Any dish featuring perilla leaves is enhanced by perilla oil.

**Certain doenjang jjigae variations:** Some regional recipes call for perilla oil added at the end.

**Raw vegetable salads:** Its lighter, herbal quality pairs beautifully with fresh greens.

## Health Perspective

Perilla oil is notably high in alpha-linolenic acid (ALA), an omega-3 fatty acid — one of the highest concentrations of any plant-based oil. It is considered highly nutritious and has long been used in Korean traditional medicine.

## Discover Korean Cooking with K-Pantry

Want to explore the full depth of Korean ingredients? Discover authentic pantry essentials and recipes with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Rice Vinegar in Korean Cooking: A Practical Guide',
    slug: 'rice-vinegar-korean-cooking',
    tags: ['korean-food', 'ingredients', 'seasoning'],
    description: 'Rice vinegar plays a key but often overlooked role in Korean cooking. Here\'s how Koreans use it and what to look for.',
    content: `## The Quiet Balancer

In Korean cooking, rice vinegar (식초, sikcho) often works invisibly — cutting through the richness of fried dishes, brightening dipping sauces, and adding the essential tang to certain kimchi styles. It rarely takes center stage, but remove it from a recipe and you'll notice something is off.

## Types of Vinegar Used in Korean Cooking

**Rice vinegar (쌀식초):** The most commonly used. Mild, slightly sweet, with clean acidity. This is the default for most Korean recipes.

**Apple cider vinegar (사과식초):** Fruity and slightly more complex. Used in some modern Korean recipes and health drinks.

**Brown rice vinegar (현미식초):** Nuttier and richer. Used in certain health-conscious preparations.

For most Korean cooking, standard rice vinegar (쌀식초) is the right choice. Major brands like Ottogi, Sempio, and CJ all make reliable versions.

## How Koreans Use Rice Vinegar

**Cucumber side dish (오이무침):** Sliced cucumbers seasoned with rice vinegar, gochugaru, garlic, and sesame oil — a refreshing banchan that relies on vinegar for its bright tang.

**Japchae:** A small splash of rice vinegar sometimes added to the noodle seasoning for balance.

**Dipping sauces:** Mixed with soy sauce, garlic, and chili for a tangy dipping sauce for dumplings or pajeon.

**Quick-pickled vegetables:** Rice vinegar is used to quick-pickle radish, onion, or other vegetables served as accompaniments.

**Cold noodle dishes (냉면, naengmyeon):** The broth or sauce for cold noodles always includes rice vinegar for that characteristic refreshing tang.

## What About White Vinegar?

White distilled vinegar can substitute for rice vinegar in a pinch, but the flavor is noticeably harsher. Use half the amount and dilute with water if substituting. For best results, seek out actual rice vinegar.

## Discover Korean Cooking with K-Pantry

Ready to stock your Korean pantry? Discover authentic Korean ingredients and recipes with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Doenjang Substitute: What to Use When You Can\'t Find It',
    slug: 'doenjang-substitute-guide',
    tags: ['korean-food', 'ingredients', 'substitutes'],
    description: 'Can\'t find doenjang? Here are the best substitutes and how to use them without ruining your Korean dish.',
    content: `## When You Can't Find Doenjang

Doenjang (된장) — Korean fermented soybean paste — has a very specific flavor profile that is difficult to replicate exactly. But sometimes you need a substitute, and knowing which alternatives work best for which dishes can save your meal.

## The Best Doenjang Substitute: Japanese Miso

The closest widely available substitute for doenjang is Japanese hatcho miso or red miso (赤味噌). These aged misos have a deeper, earthier flavor than white or yellow miso and more closely approximate doenjang's funky complexity.

**Substitution ratio:** Use slightly less miso than the doenjang called for, as miso can be saltier and more pungent when used in large quantities.

**What you'll lose:** Doenjang has a chunkier texture and more intense funk. Red miso is smoother and somewhat milder. The dish will still be delicious — just slightly different.

## For Doenjang Jjigae

The most common recipe requiring doenjang, doenjang jjigae (soybean paste stew), works reasonably well with red miso. Some chefs add a small amount of Korean soybean paste powder, fish sauce, or marmite to deepen the flavor.

**Tip:** If using red miso, reduce the amount by about 20% and taste as you go. Add fish sauce or a small amount of soy sauce to boost umami.

## For Ssamjang

Ssamjang (the dipping paste for Korean BBQ) is typically made by mixing doenjang with gochujang, sesame oil, and aromatics. If substituting miso, add slightly more gochujang to compensate for miso's milder flavor.

## What Doesn't Work

- **White or shiro miso:** Too mild and sweet. This substitution produces a noticeably different flavor.
- **Regular soy sauce alone:** Cannot replicate the paste texture or fermented depth.
- **Miso powder:** Passable in small amounts in soups but lacks texture for paste applications.

## The Real Answer: Find the Real Thing

Korean grocery stores, Asian supermarkets, and online retailers all carry doenjang. It keeps for a very long time in the refrigerator. Once you cook with real doenjang, you'll understand why substitutes always feel slightly inadequate.

## Discover Korean Cooking with K-Pantry

Looking for authentic Korean pantry ingredients and where to find them? Discover K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Korean Fermented Black Bean Paste: What Is Chunjang?',
    slug: 'chunjang-korean-black-bean-paste',
    tags: ['korean-food', 'ingredients', 'fermented'],
    description: 'Chunjang is the rich black bean paste behind Korea\'s beloved jajangmyeon. Here\'s everything you need to know about this unique ingredient.',
    content: `## The Dark, Rich Paste Behind Jajangmyeon

If you've ever eaten jajangmyeon (짜장면) — Korea's beloved black bean noodle dish — you've tasted chunjang (춘장). This intensely savory, dark brown paste is the defining ingredient of one of Korea's most popular comfort foods, yet many home cooks remain unfamiliar with it.

## What Is Chunjang?

Chunjang is a fermented black soybean paste that was introduced to Korea by Chinese immigrants in the late 19th century. It is related to Chinese tianmian sauce and douchi but has evolved into a distinctly Korean ingredient over generations of adaptation.

The paste is made from fermented soybeans, caramel coloring, and flour. Raw chunjang has a somewhat bitter, astringent taste — the crucial step before using it is to fry it in oil, which transforms the flavor into something rich, complex, and slightly sweet.

## The Critical Step: Frying Chunjang

Unlike doenjang or gochujang, which can be used directly, chunjang must be cooked in oil before it's useful. This step is called 춘장 볶기 (chunjang bokki):

1. Heat vegetable oil in a wok or heavy pan over medium heat
2. Add the chunjang and stir constantly
3. Fry for 3–5 minutes until the paste deepens in color and smells rich and nutty
4. The paste is now ready to use

Skipping this step results in a noticeably bitter dish.

## Main Use: Jajangmyeon

The classic application is jajangmyeon — thick, chewy noodles topped with a rich sauce made from fried chunjang, diced pork, onions, zucchini, and potato. This dish is so beloved in Korea that April 14th is actually "Black Day" (블랙데이), when singles eat jajangmyeon together.

**Other uses:**
- Jajangbap (black bean sauce over rice)
- Jjamppong base (as a dark flavor component)
- Braised dishes requiring deep color and savory depth

## Buying Chunjang

Look for chunjang at Korean grocery stores — it's inexpensive and keeps for months in the refrigerator. Common brands include Haechandle (해찬들) and CJ.

## Discover Korean Cooking with K-Pantry

Want to make authentic Korean noodle dishes at home? Discover recipes and ingredients with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
]

// Generate remaining cat1 posts programmatically
const cat1Extra = [
  { title: 'How to Use Korean Soup Soy Sauce (Guk-ganjang)', slug: 'how-to-use-guk-ganjang', tags: ['korean-food', 'soy-sauce', 'seasoning'] },
  { title: 'Korean Anchovy Stock: The Base of Almost Every Soup', slug: 'korean-anchovy-stock-guide', tags: ['korean-food', 'broth', 'technique'] },
  { title: 'What Is Maesil-cheong? Korean Plum Syrup Explained', slug: 'maesil-cheong-korean-plum-syrup', tags: ['korean-food', 'ingredients', 'sweet'] },
  { title: 'Korean Rice: Which Type to Buy and Why It Matters', slug: 'korean-rice-guide', tags: ['korean-food', 'ingredients', 'rice'] },
  { title: 'Mirin vs Korean Mirim: What\'s the Difference?', slug: 'mirin-vs-korean-mirim', tags: ['korean-food', 'ingredients', 'substitutes'] },
  { title: 'Toasted vs Untoasted Sesame Seeds in Korean Cooking', slug: 'sesame-seeds-korean-cooking', tags: ['korean-food', 'ingredients', 'seasoning'] },
  { title: 'What Is Dasida? Korean Beef Bouillon Powder Guide', slug: 'dasida-korean-beef-bouillon', tags: ['korean-food', 'ingredients', 'stock'] },
  { title: 'Korean Radish (Mu) vs Daikon: Are They the Same?', slug: 'korean-radish-mu-vs-daikon', tags: ['korean-food', 'vegetables', 'ingredients'] },
  { title: 'Understanding Korean Tteok: Types of Rice Cakes', slug: 'korean-rice-cake-tteok-types', tags: ['korean-food', 'ingredients', 'tteok'] },
  { title: 'Gamja-tang Essential: What Is Perilla Seed Powder?', slug: 'perilla-seed-powder-korean-cooking', tags: ['korean-food', 'ingredients', 'spices'] },
  { title: 'Dried Anchovies in Korean Cooking: A Complete Guide', slug: 'dried-anchovies-korean-cooking', tags: ['korean-food', 'ingredients', 'broth'] },
  { title: 'Korean Kelp (Dashima/Kombu): Stock, Snacks, and More', slug: 'korean-kelp-dashima-guide', tags: ['korean-food', 'ingredients', 'seaweed'] },
  { title: 'Glass Noodles (Dangmyeon) for Japchae and Beyond', slug: 'dangmyeon-glass-noodles-guide', tags: ['korean-food', 'noodles', 'ingredients'] },
  { title: 'How to Stock a Korean Pantry on a Budget', slug: 'korean-pantry-on-a-budget', tags: ['korean-food', 'pantry', 'shopping'] },
  { title: 'Sikhye: Korea\'s Traditional Sweet Rice Drink', slug: 'sikhye-korean-sweet-rice-drink', tags: ['korean-food', 'drinks', 'traditional'] },
  { title: 'Makgeolli Basics: Korea\'s Milky Rice Wine', slug: 'makgeolli-korean-rice-wine-basics', tags: ['korean-food', 'drinks', 'traditional'] },
  { title: 'Gim (Dried Seaweed Sheets): How Koreans Use Them', slug: 'gim-dried-seaweed-korean-uses', tags: ['korean-food', 'seaweed', 'ingredients'] },
  { title: 'Korean Fermented Shrimp (Saeujeot) in Kimchi', slug: 'saeujeot-fermented-shrimp-kimchi', tags: ['korean-food', 'fermented', 'kimchi'] },
  { title: 'What Is Soy Sauce Eggs? Korean Gyeran Jangjorim Guide', slug: 'gyeran-jangjorim-soy-sauce-eggs', tags: ['korean-food', 'banchan', 'eggs'] },
  { title: 'Korean Cooking Wines: Cheongju, Makgeolli, and More', slug: 'korean-cooking-wines-guide', tags: ['korean-food', 'ingredients', 'cooking-wine'] },
].map(p => ({
  ...p,
  description: `A guide to ${p.title.toLowerCase()} and how it fits into Korean home cooking.`,
  content: `## Introduction\n\n${p.title} is an important part of Korean cuisine. Whether you\'re a beginner or an experienced cook, understanding this ingredient will elevate your Korean cooking.\n\n## What You Need to Know\n\nKorean home cooking relies on a deep pantry of fermented, dried, and fresh ingredients. Each plays a specific role in creating the layered flavors that Korean food is known for.\n\n## How to Use It\n\nStart with small amounts and taste as you go. Korean cooking is about balance — the interplay of sweet, salty, spicy, and savory.\n\n## Where to Buy\n\nLook for this ingredient at Korean grocery stores, Asian supermarkets, or reputable online retailers. Quality varies by brand, so it\'s worth seeking out traditional or well-reviewed options.\n\n## Discover Korean Cooking with K-Pantry\n\nReady to explore the full world of Korean pantry essentials? Discover authentic ingredients, recipes, and cooking guides with K-Pantry. [Coming soon → atlaslabstudios.com]`
}))

// ── Category 2: Cooking Methods & Techniques (40 posts) ────────────────────
const cat2: { title: string; slug: string; tags: string[]; description: string; content: string }[] = [
  {
    title: 'How to Make Korean Stir-Fry (Bokkeum): A Beginner\'s Guide',
    slug: 'korean-stir-fry-bokkeum-guide',
    tags: ['korean-food', 'technique', 'cooking-method'],
    description: 'Bokkeum is Korea\'s signature stir-fry technique. Learn how to get the wok hot, season right, and cook like a Korean home cook.',
    content: `## The Art of Korean Stir-Fry

Korean stir-fry, or bokkeum (볶음), is one of the most versatile cooking methods in Korean cuisine. The word literally means "stir-fried" and applies to a whole category of dishes from spicy squid stir-fry (ojingeo-bokkeum) to pork with kimchi (kimchi-bokkeum) to the beloved tteokbokki.

## What Makes Korean Bokkeum Different

Unlike Chinese stir-fry, which typically uses extremely high heat and a well-seasoned wok, Korean bokkeum often incorporates fermented pastes (gochujang, doenjang) and sweeteners into the sauce, and the cooking is slightly slower to allow these thick sauces to coat the ingredients properly.

## The Basic Technique

**Step 1: Prepare your sauce first.** Korean stir-fry almost always uses a pre-made sauce. Combine your gochujang, soy sauce, sesame oil, sugar, garlic, and any other seasonings in a bowl before you start cooking.

**Step 2: Get your pan hot.** Heat a wide pan or wok over high heat. Add neutral oil (vegetable or canola) and heat until shimmering.

**Step 3: Cook aromatics first.** Garlic and onion typically go in first, cooked briefly until fragrant.

**Step 4: Add proteins.** If using meat or seafood, cook until nearly done.

**Step 5: Add vegetables.** Add harder vegetables first (carrots, zucchini), then softer ones (mushrooms, scallions).

**Step 6: Add sauce.** Pour in your pre-made sauce and toss everything to coat.

**Step 7: Finish with sesame.** Remove from heat and drizzle with sesame oil, sprinkle with toasted sesame seeds.

## Essential Korean Stir-Fry Dishes to Master

- **Kimchi bokkeum (김치볶음):** Kimchi stir-fried with pork belly or tuna
- **Ojingeo bokkeum (오징어볶음):** Spicy stir-fried squid
- **Dubu jorim (두부조림):** Braised spicy tofu (technically jorim, but very similar)
- **Sogogi bokkeum (소고기볶음):** Beef stir-fry with vegetables

## Discover Korean Cooking with K-Pantry

Want to cook authentic Korean stir-fry at home? Discover essential ingredients and recipes with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'How to Make Korean Soup (Guk): The Foundation of Every Meal',
    slug: 'how-to-make-korean-soup-guk',
    tags: ['korean-food', 'technique', 'soup'],
    description: 'Korean soup (guk) appears at almost every meal. Learn the stocks, seasoning methods, and key recipes to master this essential dish.',
    content: `## Soup Is Not Optional in Korea

In Korea, a meal without soup is unusual. Guk (국) — the broad category of Korean soups — appears at breakfast, lunch, and dinner in most Korean households. From the delicate seaweed soup (miyeok-guk) served on birthdays to the hearty bean sprout soup (kongnamul-guk) served the morning after drinking, soup is woven into the rhythm of Korean daily life.

## The Foundation: Stock

Good Korean soup starts with good stock. The most common base is:

**멸치 다시마 육수 (Myeolchi-dashima yuksu) — Anchovy and kelp stock:**
Simmer dried anchovies and dashima (kelp) in cold water for 15–20 minutes. Remove and discard solids. This creates a clean, savory broth that forms the base of most guk.

**Beef bone broth (사골 육수):** Requires long simmering but produces a rich, milky broth used in dishes like seolleongtang.

**Chicken stock:** Used in lighter soups like dakguk.

**Plain water:** Many simple vegetable soups use plain water, seasoned entirely with guk-ganjang (soup soy sauce) and doenjang.

## The Three Key Seasonings

Most Korean guk is seasoned with some combination of:
1. **Guk-ganjang (국간장):** Soup soy sauce — lighter in color, saltier in flavor than regular soy sauce
2. **Doenjang (된장):** Fermented soybean paste — adds depth and umami
3. **Salt:** For final adjustment

## Basic Guk Formula

1. Make stock (anchovy-kelp or buy pre-made)
2. Sauté aromatics (garlic, gochugaru for spicy soups)
3. Add protein and harder vegetables
4. Pour in stock
5. Bring to boil, reduce to simmer
6. Season with guk-ganjang and salt
7. Add soft vegetables and green onions at the end
8. Finish with sesame oil

## Discover Korean Cooking with K-Pantry

Ready to make authentic Korean soup at home? Discover the ingredients and techniques with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
  {
    title: 'Korean Marinating Techniques: How to Season Like a Korean',
    slug: 'korean-marinating-techniques',
    tags: ['korean-food', 'technique', 'marinades'],
    description: 'Korean marinades go deeper than Western ones. Learn the flavor principles and timing that make bulgogi, galbi, and dakgalbi so irresistible.',
    content: `## Why Korean Marinades Are Different

Korean marinades (양념, yangnyeom) are not just about adding flavor — they are engineered to tenderize meat, create caramelization during cooking, and balance the fundamental Korean flavor profile of savory, sweet, and spicy.

## The Korean Flavor Formula

Most Korean meat marinades are built on some combination of:

- **Soy sauce:** Provides salt and umami
- **Sugar or sweetener:** Pear, apple, or Asian pear juice is traditional; adds sweetness and tenderizes via enzymes
- **Sesame oil:** Adds aroma and prevents sticking
- **Garlic:** Essential, always
- **Ginger:** Used in many marinades, especially for pork
- **Scallions:** Add freshness
- **Black pepper:** Used liberally in many recipes

**For spicy dishes:** Gochujang or gochugaru is added.

## The Secret Ingredient: Fruit

Korean cooks have long known that Asian pear (배, bae) juice contains natural enzymes that tenderize meat beautifully. If you don't have Asian pear, a regular pear or even a small amount of kiwi can substitute. Grated apple also works.

This is why well-made bulgogi practically melts in your mouth.

## Timing Matters

**Bulgogi (thinly sliced beef):** 30 minutes to 2 hours. Over-marinating makes the texture mushy.

**Galbi (short ribs):** 4–24 hours. The thicker cut needs more time.

**Dakgalbi (chicken):** 30 minutes to 2 hours.

**Daeji-bokkeum (pork belly):** 30 minutes minimum; overnight is better.

## Apply Before Cooking

Unlike Western marinades, Korean yangnyeom is often also used as a cooking sauce — a portion kept separate is added during stir-frying or grilling to build a caramelized coating.

## Discover Korean Cooking with K-Pantry

Want to master Korean marinades at home? Discover authentic recipes and techniques with K-Pantry. [Coming soon → atlaslabstudios.com]`
  },
]

// Remaining cat2 topics
const cat2Extra = [
  { title: 'How to Make Korean Stew (Jjigae): The Fundamentals', slug: 'how-to-make-korean-jjigae', tags: ['korean-food', 'technique', 'stew'] },
  { title: 'Korean Steaming Techniques (Jjim): Fish, Ribs, and More', slug: 'korean-steaming-jjim-techniques', tags: ['korean-food', 'technique', 'steaming'] },
  { title: 'How to Make Korean Seasoned Vegetables (Namul)', slug: 'korean-seasoned-vegetables-namul', tags: ['korean-food', 'technique', 'banchan'] },
  { title: 'Blanching Vegetables the Korean Way: Tips and Timing', slug: 'blanching-vegetables-korean-style', tags: ['korean-food', 'technique', 'vegetables'] },
  { title: 'Korean Grilling Techniques: How to BBQ at Home', slug: 'korean-grilling-techniques-bbq', tags: ['korean-food', 'technique', 'grilling'] },
  { title: 'How to Make Kimchi: The Complete Fermentation Guide', slug: 'how-to-make-kimchi-fermentation-guide', tags: ['korean-food', 'technique', 'fermentation'] },
  { title: 'Making Korean Rice Dishes: Bibimbap, Bokkeum-bap, and More', slug: 'korean-rice-dishes-guide', tags: ['korean-food', 'technique', 'rice'] },
  { title: 'Korean Braising (Jorim): Sweet, Soy-Glazed Perfection', slug: 'korean-braising-jorim-technique', tags: ['korean-food', 'technique', 'braising'] },
  { title: 'Deep Frying Korean Style: Tuigim and Jeon Compared', slug: 'korean-deep-frying-tuigim-jeon', tags: ['korean-food', 'technique', 'frying'] },
  { title: 'How to Make Korean Pan-Fried Dishes (Jeon)', slug: 'korean-jeon-pan-fried-dishes', tags: ['korean-food', 'technique', 'jeon'] },
  { title: 'Korean Porridge (Juk): Healing Comfort in a Bowl', slug: 'korean-porridge-juk-guide', tags: ['korean-food', 'technique', 'porridge'] },
  { title: 'How to Use a Korean Stone Pot (Dolsot) at Home', slug: 'korean-stone-pot-dolsot-guide', tags: ['korean-food', 'technique', 'cookware'] },
  { title: 'Making Korean Dipping Sauces: Soy, Vinegar, and More', slug: 'korean-dipping-sauces-guide', tags: ['korean-food', 'technique', 'sauces'] },
  { title: 'How to Prepare Korean BBQ Side Dishes (Banchan)', slug: 'korean-bbq-banchan-preparation', tags: ['korean-food', 'technique', 'banchan'] },
  { title: 'How to Make Dakgalbi: The Spicy Chuncheon Chicken', slug: 'how-to-make-dakgalbi', tags: ['korean-food', 'technique', 'chicken'] },
  { title: 'Korean Noodle Cooking: Boiling, Rinsing, and Seasoning', slug: 'korean-noodle-cooking-techniques', tags: ['korean-food', 'technique', 'noodles'] },
  { title: 'How to Make Anchovy Stock from Scratch', slug: 'anchovy-stock-from-scratch', tags: ['korean-food', 'technique', 'broth'] },
  { title: 'Korean Egg Dishes: Gyeran-jjim, Gyeran-mari, and More', slug: 'korean-egg-dishes-guide', tags: ['korean-food', 'technique', 'eggs'] },
  { title: 'How to Season a Korean Dolsot (Stone Bowl) for the First Time', slug: 'season-korean-dolsot-stone-bowl', tags: ['korean-food', 'technique', 'cookware'] },
  { title: 'Wok vs Korean Pan: What Equipment Do You Actually Need?', slug: 'wok-vs-korean-pan-equipment', tags: ['korean-food', 'technique', 'equipment'] },
  { title: 'How to Pound and Tenderize Meat Korean Style', slug: 'tenderize-meat-korean-style', tags: ['korean-food', 'technique', 'meat'] },
  { title: 'Korean Sauce Layering: Building Flavor in Multiple Steps', slug: 'korean-sauce-layering-technique', tags: ['korean-food', 'technique', 'seasoning'] },
  { title: 'How to Cook Tteok (Rice Cakes) Without Them Sticking', slug: 'how-to-cook-tteok-rice-cakes', tags: ['korean-food', 'technique', 'tteok'] },
  { title: 'Korean Pressure Cooker Recipes for Beginners', slug: 'korean-pressure-cooker-recipes', tags: ['korean-food', 'technique', 'pressure-cooker'] },
  { title: 'How to Make Sundubu (Soft Tofu) from Store-Bought Tofu', slug: 'how-to-prepare-sundubu', tags: ['korean-food', 'technique', 'tofu'] },
  { title: 'Scoring and Cutting: Korean Knife Skills for Home Cooks', slug: 'korean-knife-skills-home-cooks', tags: ['korean-food', 'technique', 'knife-skills'] },
  { title: 'How to Make Korean Radish Kimchi (Kkakdugi)', slug: 'how-to-make-kkakdugi-radish-kimchi', tags: ['korean-food', 'technique', 'kimchi'] },
  { title: 'The Science of Korean Fermentation at Home', slug: 'science-korean-fermentation-home', tags: ['korean-food', 'technique', 'fermentation'] },
  { title: 'How to Make Korean Dumplings (Mandu) from Scratch', slug: 'how-to-make-mandu-dumplings', tags: ['korean-food', 'technique', 'dumplings'] },
  { title: 'How to Cook Dried Ingredients: Gosari, Doraji, and More', slug: 'cooking-dried-korean-ingredients', tags: ['korean-food', 'technique', 'dried-ingredients'] },
  { title: 'How to Make Korean Cold Broth for Naengmyeon', slug: 'korean-cold-broth-naengmyeon', tags: ['korean-food', 'technique', 'noodles'] },
  { title: 'Tempering Heat in Korean Cooking: Controlling Spice Levels', slug: 'controlling-spice-korean-cooking', tags: ['korean-food', 'technique', 'spicy'] },
  { title: 'How to Make Haemul-pajeon (Seafood Scallion Pancake)', slug: 'how-to-make-haemul-pajeon', tags: ['korean-food', 'technique', 'pancake'] },
  { title: 'Korean Meal Prep: Make a Week of Banchan in 2 Hours', slug: 'korean-meal-prep-banchan', tags: ['korean-food', 'technique', 'meal-prep'] },
  { title: 'How to Cook Korean Short Ribs (Galbi) at Home', slug: 'how-to-cook-galbi-short-ribs', tags: ['korean-food', 'technique', 'beef'] },
  { title: 'Making Jeon Batter: The Perfect Korean Pancake Texture', slug: 'jeon-batter-korean-pancake-texture', tags: ['korean-food', 'technique', 'pancake'] },
  { title: 'How to Store Korean Fermented Pastes (Gochujang, Doenjang)', slug: 'storing-korean-fermented-pastes', tags: ['korean-food', 'technique', 'storage'] },
].map(p => ({
  ...p,
  description: `A practical guide to ${p.title.toLowerCase()} using authentic Korean methods and ingredients.`,
  content: `## Introduction\n\n${p.title} is a fundamental part of Korean home cooking. This guide walks you through everything you need to know to get it right.\n\n## What You Need\n\nGather your ingredients and equipment before starting. Korean cooking rewards preparation — have everything measured and ready before the heat goes on.\n\n## Step-by-Step Method\n\nFollow the technique carefully. Korean cooking has a logic to it: certain ingredients go in first, sauces are added at specific moments, and finishing touches like sesame oil are always added last, off the heat.\n\n## Tips for Success\n\n- Taste and adjust as you go\n- Don\'t rush the caramelization — that brown coating is flavor\n- Fresh garlic makes a significant difference\n- When in doubt, serve with rice and let the dish speak for itself\n\n## Discover Korean Cooking with K-Pantry\n\nWant to master Korean cooking techniques? Discover authentic recipes and ingredients with K-Pantry. [Coming soon → atlaslabstudios.com]`
}))

// ── Category 3: Dish-by-Dish Guides (50 posts) ─────────────────────────────
const cat3 = [
  { title: 'Complete Guide to Kimchi Jjigae (Kimchi Stew)', slug: 'complete-guide-kimchi-jjigae', tags: ['korean-food', 'recipe', 'stew'] },
  { title: 'How to Make Bulgogi at Home: Authentic Recipe', slug: 'how-to-make-bulgogi-at-home', tags: ['korean-food', 'recipe', 'beef'] },
  { title: 'Bibimbap Assembly Guide: Layers, Sauce, and Technique', slug: 'bibimbap-assembly-guide', tags: ['korean-food', 'recipe', 'rice'] },
  { title: 'Tteokbokki from Scratch: Spicy Rice Cakes at Home', slug: 'tteokbokki-from-scratch', tags: ['korean-food', 'recipe', 'spicy'] },
  { title: 'Japchae Step by Step: Glass Noodle Stir-Fry Guide', slug: 'japchae-step-by-step', tags: ['korean-food', 'recipe', 'noodles'] },
  { title: 'Sundubu Jjigae: The Perfect Soft Tofu Stew', slug: 'sundubu-jjigae-guide', tags: ['korean-food', 'recipe', 'tofu'] },
  { title: 'Doenjang Jjigae: Classic Soybean Paste Stew Recipe', slug: 'doenjang-jjigae-recipe', tags: ['korean-food', 'recipe', 'stew'] },
  { title: 'Samgyeopsal at Home: Korean Pork Belly BBQ Guide', slug: 'samgyeopsal-at-home', tags: ['korean-food', 'recipe', 'bbq'] },
  { title: 'Korean Fried Chicken: Crispier Than You Think Possible', slug: 'korean-fried-chicken-recipe', tags: ['korean-food', 'recipe', 'chicken'] },
  { title: 'Dakgalbi: Spicy Stir-Fried Chicken from Chuncheon', slug: 'dakgalbi-spicy-chicken-recipe', tags: ['korean-food', 'recipe', 'chicken'] },
  { title: 'Kong-Guksu: Chilled Soybean Noodle Soup for Summer', slug: 'kong-guksu-chilled-soybean-noodles', tags: ['korean-food', 'recipe', 'summer'] },
  { title: 'Miyeok-Guk: Korean Seaweed Soup for Birthdays and Beyond', slug: 'miyeok-guk-seaweed-soup', tags: ['korean-food', 'recipe', 'soup'] },
  { title: 'Galbi: Korean Braised or Grilled Short Ribs Recipe', slug: 'galbi-korean-short-ribs', tags: ['korean-food', 'recipe', 'beef'] },
  { title: 'Pajeon: Korean Scallion Pancake Recipe', slug: 'pajeon-korean-scallion-pancake', tags: ['korean-food', 'recipe', 'pancake'] },
  { title: 'Haemul Pajeon: Crispy Seafood Scallion Pancakes', slug: 'haemul-pajeon-seafood-pancake', tags: ['korean-food', 'recipe', 'seafood'] },
  { title: 'Naengmyeon: Korean Cold Noodles in Summer', slug: 'naengmyeon-korean-cold-noodles', tags: ['korean-food', 'recipe', 'noodles'] },
  { title: 'Kimbap Making Guide: Korea\'s Beloved Rice Rolls', slug: 'kimbap-making-guide', tags: ['korean-food', 'recipe', 'rice'] },
  { title: 'Soondubu: Silken Tofu Stew in 20 Minutes', slug: 'soondubu-quick-guide', tags: ['korean-food', 'recipe', 'quick'] },
  { title: 'Gyeran-jjim: Steamed Egg Custard Korean Style', slug: 'gyeran-jjim-steamed-egg', tags: ['korean-food', 'recipe', 'eggs'] },
  { title: 'Gamjatang: Spicy Pork Neck Bone Stew Recipe', slug: 'gamjatang-pork-neck-bone-stew', tags: ['korean-food', 'recipe', 'stew'] },
  { title: 'Kongnamul-Guk: Simple Soybean Sprout Soup', slug: 'kongnamul-guk-sprout-soup', tags: ['korean-food', 'recipe', 'soup'] },
  { title: 'Budae-Jjigae: Army Stew and Its Fascinating History', slug: 'budae-jjigae-army-stew', tags: ['korean-food', 'recipe', 'history'] },
  { title: 'Hobak-Juk: Korean Pumpkin Porridge for Cold Days', slug: 'hobak-juk-pumpkin-porridge', tags: ['korean-food', 'recipe', 'porridge'] },
  { title: 'Jajangmyeon at Home: Black Bean Noodle Recipe', slug: 'jajangmyeon-at-home', tags: ['korean-food', 'recipe', 'noodles'] },
  { title: 'Mul-Naengmyeon: Icy Cold Broth Noodles', slug: 'mul-naengmyeon-cold-broth', tags: ['korean-food', 'recipe', 'noodles'] },
  { title: 'Doenjang Samgyetang: Korean Ginseng Chicken Soup', slug: 'samgyetang-ginseng-chicken-soup', tags: ['korean-food', 'recipe', 'soup'] },
  { title: 'Tteokguk: New Year\'s Rice Cake Soup Recipe', slug: 'tteokguk-rice-cake-soup', tags: ['korean-food', 'recipe', 'traditional'] },
  { title: 'Seolleongtang: Milky Ox Bone Soup from Seoul', slug: 'seolleongtang-ox-bone-soup', tags: ['korean-food', 'recipe', 'soup'] },
  { title: 'Ganjang-gejang: Soy Sauce Marinated Raw Crab', slug: 'ganjang-gejang-marinated-crab', tags: ['korean-food', 'recipe', 'seafood'] },
  { title: 'Doenjang-Guk vs Doenjang-Jjigae: What\'s the Difference?', slug: 'doenjang-guk-vs-jjigae', tags: ['korean-food', 'recipe', 'explainer'] },
  { title: 'Ojingeo-Bokkeum: Spicy Stir-Fried Squid Recipe', slug: 'ojingeo-bokkeum-spicy-squid', tags: ['korean-food', 'recipe', 'seafood'] },
  { title: 'Korean Fried Rice (Bokkeum-bap): Better Than Takeout', slug: 'korean-fried-rice-bokkeum-bap', tags: ['korean-food', 'recipe', 'rice'] },
  { title: 'Sundae: Korean Blood Sausage Explained and How to Serve It', slug: 'sundae-korean-blood-sausage', tags: ['korean-food', 'recipe', 'traditional'] },
  { title: 'Hotteok: Sweet Korean Street Pancakes Recipe', slug: 'hotteok-sweet-street-pancake', tags: ['korean-food', 'recipe', 'street-food'] },
  { title: 'Tteok-galbi: Grilled Minced Galbi Patties Recipe', slug: 'tteok-galbi-grilled-patties', tags: ['korean-food', 'recipe', 'beef'] },
  { title: 'Bibim-naengmyeon: Spicy Mixed Cold Noodles', slug: 'bibim-naengmyeon-spicy-cold', tags: ['korean-food', 'recipe', 'noodles'] },
  { title: 'Doraegi-Gui: Korean Grilled Pork Cheek', slug: 'doraegi-gui-grilled-pork-cheek', tags: ['korean-food', 'recipe', 'bbq'] },
  { title: 'Patbingsu: Korean Shaved Ice Dessert at Home', slug: 'patbingsu-shaved-ice-dessert', tags: ['korean-food', 'recipe', 'dessert'] },
  { title: 'Bugeo-Guk: Dried Pollock Soup for Hangover Recovery', slug: 'bugeo-guk-dried-pollock-soup', tags: ['korean-food', 'recipe', 'soup'] },
  { title: 'Galbijjim: Braised Short Ribs for Special Occasions', slug: 'galbijjim-braised-short-ribs', tags: ['korean-food', 'recipe', 'beef'] },
  { title: 'Kkakdugi: Cubed Radish Kimchi in Under an Hour', slug: 'kkakdugi-radish-kimchi-recipe', tags: ['korean-food', 'recipe', 'kimchi'] },
  { title: 'Ganjang-bokkeum: Soy Sauce Butter Stir-Fry', slug: 'ganjang-bokkeum-soy-butter', tags: ['korean-food', 'recipe', 'stir-fry'] },
  { title: 'Chapaguri (Ram-don): The Parasite Noodle Dish', slug: 'chapaguri-parasite-noodles', tags: ['korean-food', 'recipe', 'noodles'] },
  { title: 'Sigeumchi-namul: Korean Spinach Banchan Recipe', slug: 'sigeumchi-namul-spinach-banchan', tags: ['korean-food', 'recipe', 'banchan'] },
  { title: 'Nakji-bokkeum: Spicy Stir-Fried Octopus', slug: 'nakji-bokkeum-spicy-octopus', tags: ['korean-food', 'recipe', 'seafood'] },
  { title: 'Gamja-jorim: Korean Braised Potatoes Banchan', slug: 'gamja-jorim-braised-potatoes', tags: ['korean-food', 'recipe', 'banchan'] },
  { title: 'Kongnamul-muchim: Soybean Sprout Salad Banchan', slug: 'kongnamul-muchim-sprout-salad', tags: ['korean-food', 'recipe', 'banchan'] },
  { title: 'Dubu-jorim: Braised Spicy Tofu Recipe', slug: 'dubu-jorim-braised-spicy-tofu', tags: ['korean-food', 'recipe', 'tofu'] },
  { title: 'Mapo Tofu Korean Style: How Korea Made It Its Own', slug: 'mapo-tofu-korean-style', tags: ['korean-food', 'recipe', 'fusion'] },
  { title: 'Sagol-Guk: Bone Broth Soup Korean Style', slug: 'sagol-guk-bone-broth-soup', tags: ['korean-food', 'recipe', 'soup'] },
].map(p => ({
  ...p,
  description: p.description || `A complete step-by-step guide to making ${p.title.replace('Complete Guide to ', '').replace('How to Make ', '').replace(': ', ' — ')} at home.`,
  content: `## Introduction\n\nOf all the dishes in Korean cuisine, ${p.title.split(':')[0]} holds a special place. It's the kind of food that warms you from the inside out — the dish you crave on a cold day, or share with family during the holidays.\n\n## What You Need\n\nThe key to this dish is using authentic Korean ingredients. Substitutions exist, but if you can find the real thing at a Korean grocery store, the difference is remarkable.\n\n**Essential ingredients:**\n- Quality Korean pantry staples (gochugaru, gochujang, or doenjang depending on the dish)\n- Fresh aromatics: garlic, ginger, green onions\n- Your main protein or vegetable\n- Good anchovy-kelp stock (for soup-based dishes)\n\n## Step-by-Step Instructions\n\n**Prep (15–20 minutes):** Slice proteins thinly against the grain. Chop vegetables into bite-sized pieces. Measure out your seasonings.\n\n**Cook (20–40 minutes):** Follow the recipe's specific technique — whether stir-frying, simmering, or steaming. Don't rush this part.\n\n**Season and Finish:** Taste and adjust. Add sesame oil and seeds at the end. The finishing touch matters.\n\n## Serving\n\nServe immediately with steamed white rice, and arrange any accompanying banchan (side dishes) around the main dish. The more colorful, the more Korean.\n\n## Discover Korean Cooking with K-Pantry\n\nReady to cook more authentic Korean dishes? Discover recipes, ingredients, and cooking guides with K-Pantry. [Coming soon → atlaslabstudios.com]`
}))

// ── Category 4: Substitutes & Shopping (30 posts) ──────────────────────────
const cat4 = [
  { title: 'Gochujang Substitutes for Western Kitchens', slug: 'gochujang-substitutes-western', tags: ['korean-food', 'substitutes', 'shopping'] },
  { title: 'Where to Buy Korean Ingredients Online: Best Stores', slug: 'where-to-buy-korean-ingredients-online', tags: ['korean-food', 'shopping', 'pantry'] },
  { title: 'Asian Grocery Store Shopping Guide for Korean Food', slug: 'asian-grocery-shopping-korean-food', tags: ['korean-food', 'shopping', 'guide'] },
  { title: 'How to Store Korean Fermented Pastes Long-Term', slug: 'store-korean-fermented-pastes', tags: ['korean-food', 'storage', 'pantry'] },
  { title: 'Making Korean Chili Paste (Gochujang) from Scratch', slug: 'homemade-gochujang-from-scratch', tags: ['korean-food', 'recipe', 'fermented'] },
  { title: 'Korean Perilla Leaves vs Japanese Shiso: Are They the Same?', slug: 'korean-perilla-vs-shiso', tags: ['korean-food', 'ingredients', 'comparison'] },
  { title: 'Rice Cake Alternatives: What to Use When You Can\'t Find Tteok', slug: 'rice-cake-alternatives-tteok', tags: ['korean-food', 'substitutes', 'tteok'] },
  { title: 'Can You Substitute Miso for Doenjang? The Honest Answer', slug: 'miso-vs-doenjang-substitute', tags: ['korean-food', 'substitutes', 'ingredients'] },
  { title: 'Best Korean Grocery Store Brands You Can Trust', slug: 'best-korean-grocery-brands', tags: ['korean-food', 'shopping', 'brands'] },
  { title: 'How to Read Korean Food Labels When Shopping', slug: 'read-korean-food-labels', tags: ['korean-food', 'shopping', 'guide'] },
  { title: 'Buying Korean Ingredients in Europe: A Practical Guide', slug: 'korean-ingredients-in-europe', tags: ['korean-food', 'shopping', 'international'] },
  { title: 'How to Make Korean Fish Sauce at Home', slug: 'homemade-korean-fish-sauce', tags: ['korean-food', 'recipe', 'fermented'] },
  { title: 'Korean vs Chinese vs Japanese Soy Sauce: Which to Buy', slug: 'korean-vs-chinese-vs-japanese-soy-sauce', tags: ['korean-food', 'comparison', 'shopping'] },
  { title: 'Sesame Oil Buying Guide: What to Look for on the Label', slug: 'sesame-oil-buying-guide', tags: ['korean-food', 'shopping', 'oils'] },
  { title: 'How to Keep Korean Greens Fresh Longer', slug: 'keep-korean-greens-fresh', tags: ['korean-food', 'storage', 'vegetables'] },
  { title: 'Freezing Korean Ingredients: What Works and What Doesn\'t', slug: 'freezing-korean-ingredients', tags: ['korean-food', 'storage', 'tips'] },
  { title: 'Making Your Own Korean Chili Flakes (Gochugaru)', slug: 'homemade-gochugaru-chili-flakes', tags: ['korean-food', 'recipe', 'ingredients'] },
  { title: 'What to Buy First: A Beginner\'s Korean Pantry Checklist', slug: 'beginners-korean-pantry-checklist', tags: ['korean-food', 'pantry', 'guide'] },
  { title: 'Korean Pantry vs Japanese Pantry: Key Differences', slug: 'korean-pantry-vs-japanese-pantry', tags: ['korean-food', 'comparison', 'guide'] },
  { title: 'How to Substitute Korean Cooking Wine (Cheongju)', slug: 'korean-cooking-wine-substitutes', tags: ['korean-food', 'substitutes', 'ingredients'] },
  { title: 'Online Korean Grocery Store Reviews: Gmarket, Hmart, and More', slug: 'online-korean-grocery-reviews', tags: ['korean-food', 'shopping', 'online'] },
  { title: 'Can You Find Korean Ingredients at Whole Foods or Trader Joe\'s?', slug: 'korean-ingredients-whole-foods', tags: ['korean-food', 'shopping', 'mainstream'] },
  { title: 'How to Make Kimchi Without Fish Sauce (Vegan Version)', slug: 'vegan-kimchi-without-fish-sauce', tags: ['korean-food', 'vegan', 'kimchi'] },
  { title: 'Storing Fresh Kimchi: Container, Temperature, and Timing', slug: 'storing-fresh-kimchi-guide', tags: ['korean-food', 'storage', 'kimchi'] },
  { title: 'Korean Ingredients Shelf Life: What Expires and What Doesn\'t', slug: 'korean-ingredients-shelf-life', tags: ['korean-food', 'storage', 'pantry'] },
  { title: 'Making Doenjang at Home: The Traditional Method', slug: 'homemade-doenjang-traditional', tags: ['korean-food', 'recipe', 'fermented'] },
  { title: 'Anchovy Substitute in Korean Cooking: Your Options', slug: 'anchovy-substitute-korean-cooking', tags: ['korean-food', 'substitutes', 'broth'] },
  { title: 'Korean Tofu Types: Sundubu, Dubu, Yeon-dubu Explained', slug: 'korean-tofu-types-explained', tags: ['korean-food', 'ingredients', 'tofu'] },
  { title: 'How to Find Authentic Ingredients Outside of Korea', slug: 'authentic-korean-ingredients-abroad', tags: ['korean-food', 'shopping', 'international'] },
  { title: 'Organic Korean Ingredients: Are They Worth the Price?', slug: 'organic-korean-ingredients-worth-it', tags: ['korean-food', 'shopping', 'guide'] },
].map(p => ({
  ...p,
  description: p.description || `Practical guide to ${p.title.toLowerCase()} for anyone cooking Korean food outside Korea.`,
  content: `## Introduction\n\nOne of the biggest challenges for Korean food enthusiasts outside Korea is finding the right ingredients. This guide addresses ${p.title.toLowerCase()} with practical, real-world advice.\n\n## What You Need to Know\n\nAuthenticity matters in Korean cooking, but adaptability matters too. Knowing when to seek out the real ingredient and when a good substitute works is part of the art.\n\n## Practical Recommendations\n\nLook for Korean grocery stores in major cities — they almost always carry a wider range of authentic ingredients than mainstream supermarkets. Online options like H-Mart, Hanahreum, and various specialty retailers ship throughout most countries.\n\nWhen substituting, understand the function of the ingredient in the dish. Is it providing salt? Umami? Fermented funk? Choosing the right substitute means matching the function, not just the flavor.\n\n## Tips for Shopping Smart\n\n- Buy in larger quantities when possible — most Korean pantry staples keep for months\n- Learn to read the essential Korean characters for common ingredients\n- Ask grocery store staff — they love helping people find the right product\n\n## Discover Korean Cooking with K-Pantry\n\nDiscover authentic Korean ingredients, where to find them, and how to use them with K-Pantry. [Coming soon → atlaslabstudios.com]`
}))

// ── Category 5: K-Food Culture (30 posts) ──────────────────────────────────
const cat5 = [
  { title: 'Korean Table Setting (Hansik): A Complete Guide', slug: 'korean-table-setting-hansik-guide', tags: ['korean-food', 'culture', 'etiquette'] },
  { title: 'Korean Holiday Foods: What Koreans Eat on Chuseok and Seollal', slug: 'korean-holiday-foods-guide', tags: ['korean-food', 'culture', 'holiday'] },
  { title: 'Korean Street Food Guide: 20 Must-Try Snacks', slug: 'korean-street-food-guide', tags: ['korean-food', 'culture', 'street-food'] },
  { title: 'Korean BBQ Culture and Etiquette for Foreigners', slug: 'korean-bbq-culture-etiquette', tags: ['korean-food', 'culture', 'bbq'] },
  { title: 'The History of Kimchi: From Ancient Korea to Global Phenomenon', slug: 'history-of-kimchi', tags: ['korean-food', 'culture', 'history'] },
  { title: 'Why Koreans Eat Rice at Every Meal', slug: 'why-koreans-eat-rice-every-meal', tags: ['korean-food', 'culture', 'rice'] },
  { title: 'Korean Drinking Food (Anju) Culture Explained', slug: 'korean-anju-drinking-food-culture', tags: ['korean-food', 'culture', 'drinks'] },
  { title: 'Korean Convenience Store Food Guide: CU, GS25, and 7-Eleven', slug: 'korean-convenience-store-food', tags: ['korean-food', 'culture', 'convenience'] },
  { title: 'Mukbang Culture: Why Watching Koreans Eat Is an Art Form', slug: 'mukbang-culture-explained', tags: ['korean-food', 'culture', 'digital'] },
  { title: 'Regional Korean Food: How Cuisine Differs Across Korea', slug: 'regional-korean-food-differences', tags: ['korean-food', 'culture', 'regional'] },
  { title: 'Why Korean Food Is Going Global: The K-Food Wave', slug: 'korean-food-going-global', tags: ['korean-food', 'culture', 'global'] },
  { title: 'Korean Food in K-Dramas: Every Dish You\'ve Seen on Screen', slug: 'korean-food-in-kdramas', tags: ['korean-food', 'culture', 'kdrama'] },
  { title: 'Korean Drinking Culture: Soju, Makgeolli, and Maekju', slug: 'korean-drinking-culture-guide', tags: ['korean-food', 'culture', 'drinks'] },
  { title: 'How Koreans Eat: Shared Dishes vs Individual Portions', slug: 'how-koreans-eat-shared-individual', tags: ['korean-food', 'culture', 'etiquette'] },
  { title: 'Korean Hospital Food: Why Patients Get Seaweed Soup', slug: 'korean-hospital-food-seaweed-soup', tags: ['korean-food', 'culture', 'health'] },
  { title: 'Banchan Culture: Why Korean Meals Come With So Many Side Dishes', slug: 'banchan-culture-explained', tags: ['korean-food', 'culture', 'banchan'] },
  { title: 'Korean Food as Medicine: Hanbang and Healing Ingredients', slug: 'korean-food-as-medicine-hanbang', tags: ['korean-food', 'culture', 'health'] },
  { title: 'The Rise of K-Food in America: From Koreatown to Mainstream', slug: 'k-food-rise-in-america', tags: ['korean-food', 'culture', 'global'] },
  { title: 'Korean School Lunch Culture: What Korean Kids Eat', slug: 'korean-school-lunch-culture', tags: ['korean-food', 'culture', 'daily-life'] },
  { title: 'Why Black Day (April 14) Is All About Jajangmyeon', slug: 'black-day-april-jajangmyeon', tags: ['korean-food', 'culture', 'holiday'] },
  { title: 'Korean Delivery Culture: The World\'s Most Advanced Food Delivery', slug: 'korean-delivery-culture', tags: ['korean-food', 'culture', 'modern'] },
  { title: 'Halal Korean Food: What to Know Before You Cook or Travel', slug: 'halal-korean-food-guide', tags: ['korean-food', 'culture', 'dietary'] },
  { title: 'Vegetarian and Vegan Korean Food: Temple Cuisine and Beyond', slug: 'vegetarian-vegan-korean-food', tags: ['korean-food', 'culture', 'vegan'] },
  { title: 'How Kimchi Became UNESCO Intangible Heritage', slug: 'kimchi-unesco-heritage', tags: ['korean-food', 'culture', 'history'] },
  { title: 'Korean Food Superstitions and Food-Related Beliefs', slug: 'korean-food-superstitions', tags: ['korean-food', 'culture', 'traditional'] },
  { title: 'K-Snacks: Korean Snack Culture and Convenience Store Hauls', slug: 'k-snacks-culture', tags: ['korean-food', 'culture', 'snacks'] },
  { title: 'Pojangmacha: Korea\'s Iconic Street Food Tents', slug: 'pojangmacha-korean-street-tents', tags: ['korean-food', 'culture', 'street-food'] },
  { title: 'Korean Food Delivery Unwritten Rules and Etiquette', slug: 'korean-food-delivery-etiquette', tags: ['korean-food', 'culture', 'modern'] },
  { title: 'What Koreans Eat for Breakfast: Morning Food Culture', slug: 'korean-breakfast-food-culture', tags: ['korean-food', 'culture', 'daily-life'] },
  { title: 'Jesa Food: Korean Ancestral Rites and the Dishes They Require', slug: 'jesa-food-korean-ancestral-rites', tags: ['korean-food', 'culture', 'traditional'] },
].map(p => ({
  ...p,
  description: p.description || `An inside look at ${p.title.toLowerCase()} and what it reveals about Korean society and identity.`,
  content: `## Introduction\n\nFood and culture are inseparable in Korea. ${p.title} is not just a food story — it's a window into the way Koreans live, gather, celebrate, and connect.\n\n## The Cultural Context\n\nKorea's food culture developed over thousands of years and reflects a society that values communal eating, seasonal ingredients, fermentation, and the balance of flavors. Understanding these values helps explain why Korean food works the way it does.\n\n## What Makes This Unique\n\nWhether it\'s the shared-dish tradition, the presence of soup at every meal, or the ritual of wrapping meat in fresh leaves at the grill — Korean food culture has distinctive patterns that surprise and delight newcomers.\n\n## For Visitors and Home Cooks\n\nYou don't need to be in Korea to experience Korean food culture. Many of these traditions can be recreated at home with the right ingredients and a willingness to eat together.\n\n## Discover Korean Cooking with K-Pantry\n\nReady to dive deeper into Korean food culture and cooking? Discover authentic ingredients, recipes, and cultural guides with K-Pantry. [Coming soon → atlaslabstudios.com]`
}))

// ── Category 6: Health & Nutrition (20 posts) ──────────────────────────────
const cat6 = [
  { title: 'Why Korean Food Is Among the Healthiest in the World', slug: 'why-korean-food-is-healthy', tags: ['korean-food', 'health', 'nutrition'] },
  { title: 'Fermented Foods and Gut Health: The Korean Connection', slug: 'fermented-foods-gut-health-korean', tags: ['korean-food', 'health', 'fermented'] },
  { title: 'Kimchi Nutrition Facts: What You Get in Every Serving', slug: 'kimchi-nutrition-facts', tags: ['korean-food', 'health', 'kimchi'] },
  { title: 'Korean Diet Secrets: How Koreans Stay Slim', slug: 'korean-diet-secrets', tags: ['korean-food', 'health', 'diet'] },
  { title: 'Low-Calorie Korean Dishes for Healthy Eating', slug: 'low-calorie-korean-dishes', tags: ['korean-food', 'health', 'diet'] },
  { title: 'Korean Superfoods: 10 Ingredients with Exceptional Nutrients', slug: 'korean-superfoods', tags: ['korean-food', 'health', 'nutrition'] },
  { title: 'Anti-Inflammatory Korean Ingredients and Dishes', slug: 'anti-inflammatory-korean-ingredients', tags: ['korean-food', 'health', 'anti-inflammatory'] },
  { title: 'How Korean Cooking Uses Less Oil Than You Think', slug: 'korean-cooking-low-oil', tags: ['korean-food', 'health', 'technique'] },
  { title: 'Probiotics in Korean Food: Beyond Kimchi', slug: 'probiotics-in-korean-food', tags: ['korean-food', 'health', 'fermented'] },
  { title: 'Doenjang and Cancer Prevention: What the Research Says', slug: 'doenjang-cancer-prevention-research', tags: ['korean-food', 'health', 'fermented'] },
  { title: 'Gochugaru and Metabolism: The Science Behind Spicy Food', slug: 'gochugaru-metabolism-spicy-food', tags: ['korean-food', 'health', 'spicy'] },
  { title: 'Korean Food for Gut Health: A Week of Probiotic-Rich Meals', slug: 'korean-food-gut-health-week', tags: ['korean-food', 'health', 'meal-plan'] },
  { title: 'Sodium in Korean Food: How Much Is Too Much?', slug: 'sodium-in-korean-food', tags: ['korean-food', 'health', 'nutrition'] },
  { title: 'Balanced Korean Meal: How to Build a Complete Plate', slug: 'balanced-korean-meal-guide', tags: ['korean-food', 'health', 'nutrition'] },
  { title: 'Korean Foods for Energy: What Athletes in Korea Eat', slug: 'korean-foods-for-energy', tags: ['korean-food', 'health', 'athletes'] },
  { title: 'Is Korean BBQ Actually Healthy? A Nutritional Analysis', slug: 'is-korean-bbq-healthy', tags: ['korean-food', 'health', 'bbq'] },
  { title: 'Korean Food for Weight Loss: The Principles That Work', slug: 'korean-food-weight-loss', tags: ['korean-food', 'health', 'diet'] },
  { title: 'Ginseng in Korean Cooking: Benefits and How to Use It', slug: 'ginseng-korean-cooking-benefits', tags: ['korean-food', 'health', 'traditional'] },
  { title: 'Vegetable-Heavy Korean Banchan: How to Eat More Plants', slug: 'vegetable-heavy-korean-banchan', tags: ['korean-food', 'health', 'vegetables'] },
  { title: 'Korean Soup for Colds and Recovery: Traditional Remedies', slug: 'korean-soup-cold-recovery', tags: ['korean-food', 'health', 'traditional'] },
].map(p => ({
  ...p,
  description: p.description || `The science and tradition behind ${p.title.toLowerCase()} — why Korean food nourishes body and mind.`,
  content: `## Introduction\n\nKorean cuisine has attracted global attention not just for its bold flavors, but for its potential health benefits. ${p.title} explores the intersection of Korean food traditions and modern nutritional science.\n\n## The Evidence\n\nKorea consistently ranks among countries with the highest life expectancy and lowest obesity rates. While lifestyle factors play a role, the Korean diet — rich in fermented foods, vegetables, and lean proteins — is widely credited as a significant contributor.\n\n## Key Principles\n\n**Fermentation:** Kimchi, doenjang, and gochujang all contain live cultures that support gut health. Fermented foods have been part of Korean eating for millennia — not as a trend, but as a survival necessity.\n\n**Vegetables at every meal:** A typical Korean meal includes 2–4 vegetable side dishes (banchan). This means most Koreans naturally consume far more plant matter than typical Western diets.\n\n**Minimal processing:** Traditional Korean cooking starts from whole ingredients. The pantry-heavy approach means flavor comes from fermentation, not additives.\n\n## Practical Takeaways\n\nYou don't need to eat entirely Korean to benefit from Korean dietary principles. Adding fermented foods, increasing vegetable variety, and using traditional Korean seasonings can support better health within any eating pattern.\n\n## Discover Korean Cooking with K-Pantry\n\nReady to cook healthier with Korean ingredients? Discover authentic pantry staples and recipes with K-Pantry. [Coming soon → atlaslabstudios.com]`
}))

// Combine all posts
const allPosts = [
  ...cat1,
  ...cat1Extra,
  ...cat2,
  ...cat2Extra,
  ...cat3,
  ...cat4,
  ...cat5,
  ...cat6,
]

async function insertBatch(posts: typeof allPosts, batchNum: number) {
  console.log(`\nBatch ${batchNum}: inserting ${posts.length} posts...`)
  for (const post of posts) {
    const { error } = await supabase.from('blog_posts').upsert({
      app: 'k-pantry',
      locale: 'en',
      slug: post.slug,
      title: post.title,
      description: post.description,
      content: post.content,
      tags: post.tags,
      pattern_id: null,
      published_at: null,
    }, { onConflict: 'slug,locale' })
    if (error) console.error(`  ✗ ${post.slug}:`, error.message)
    else console.log(`  ✓ ${post.slug}`)
  }
  console.log(`Batch ${batchNum} done.`)
}

async function schedulePosts() {
  console.log('\nScheduling 200 k-pantry posts...')
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id')
    .eq('app', 'k-pantry')
    .eq('locale', 'en')
    .order('id')

  if (error || !posts) { console.error('Failed to fetch posts:', error); return }
  console.log(`Found ${posts.length} posts to schedule`)

  const startDate = new Date()
  startDate.setUTCHours(0, 0, 0, 0)

  for (let i = 0; i < posts.length; i++) {
    const dayOffset = Math.floor(i / 5)
    const date = new Date(startDate)
    date.setDate(date.getDate() + dayOffset)
    const randomMinutes = Math.floor(Math.random() * 660)
    date.setUTCMinutes(randomMinutes)

    const { error: updateErr } = await supabase
      .from('blog_posts')
      .update({ published_at: date.toISOString() })
      .eq('id', posts[i].id)

    if (updateErr) console.error(`  ✗ id=${posts[i].id}:`, updateErr.message)
  }
  console.log(`Done! ${posts.length} posts scheduled, 5/day, KST 9:00–20:00`)
}

async function run() {
  const BATCH_SIZE = 20
  for (let i = 0; i < allPosts.length; i += BATCH_SIZE) {
    await insertBatch(allPosts.slice(i, i + BATCH_SIZE), Math.floor(i / BATCH_SIZE) + 1)
  }
  console.log(`\nTotal posts defined: ${allPosts.length}`)
  await schedulePosts()
}

run().catch(console.error)
