# Article Content Guidelines (Food · Life)

These rules cover every new article in the **Food** and **Life** groups (and Explore Korea guides). **Phrases** and **Basics** keep their current format.
The automatic generator (`scripts/generate-global-post.mjs`) uses the same rules, so hand-written and generated posts match.

> **Before you plan a new article, check `docs/articles-registry.json`.**
> If an Active or Planned entry already covers the topic or its main keyword, update that article instead of writing a new one.
> To rebuild the registry from the database, run `npx tsx scripts/build-articles-registry.ts`.

---

## 1. Length and structure
- **Length:** 800–1,200 words in the body, about 3 minutes of reading on a phone.
- **H2 sections:** 4–6. Use specific headings such as "How to order at a Hongdae street stall". Never use "Introduction", "Overview" or "Conclusion".
- **No table of contents**, no greetings, no rhetorical questions, no emoji.

## 2. Quick summary above the fold
- **Intro:** at most 2 sentences, and they give the direct answer first.
- **Right after the intro,** place a `<KeyTakeaways>` card with 3–4 bullets: what to do, what it costs, and the one mistake to avoid.

```mdx
Two-sentence answer to the search intent.

<KeyTakeaways>

- **Best time:** weekday afternoons, before 5 pm
- **Budget:** around 10,000–20,000 KRW per person
- **Avoid:** ordering at the counter when there is a kiosk

</KeyTakeaways>
```

Leave a blank line inside the tags on both sides of the list, so the markdown inside the card is parsed.

## 3. One screen, one visual
- **Never more than two text-only paragraphs in a row.** Every phone screen (roughly 2–3 paragraphs) gets one of these:
  - A markdown table: menu items, price ranges, step-by-step ordering, comparisons
  - `<Dialogue>` speech bubbles
  - `<DoDont>` box
  - `<Callout>`: tip, warning or note
  - A photo, or a 2-column `post-gallery`
- **Minimum per article:** 1 table, 1 `<Dialogue>`, 1 `<DoDont>`.
- **Prices, fares and opening hours change.** Write them as ranges ("about 4,000–6,000 KRW"), or tell the reader to check the official source.

## 4. Dialogue blocks
Put the must-know exchanges for each situation in a `<Dialogue>` block, never in a bullet list.
- **Each line has:** Korean, romanization and English.
- **`me`** puts the reader's line on the right (dark bubble).

```mdx
<Dialogue title="At the counter">
  <Line who="Staff" ko="포장이세요, 드시고 가세요?" rom="Pojang-iseyo, deusigo gaseyo?" en="To go, or eating here?" />
  <Line me who="You" ko="포장이요." rom="Pojang-iyo." en="To go, please." />
</Dialogue>
```

- **Size:** 2–6 lines per block, at most 2 blocks per article.
- **Phrasing:** natural polite speech (-요 / -세요), the way locals really say it.

## 5. Do's and Don'ts
Put common mistakes in one box:

```mdx
<DoDont>
<Do>

- Clear your own tray
- Take a number ticket

</Do>
<Dont>

- Stick chopsticks upright in rice
- Wave staff over with one finger

</Dont>
</DoDont>
```

## 6. CTAs and internal links (required)
- **Middle of the article** (after section 2 or 3): `<KpattoCta />` shows the K-Patto Interactive Webtoon Ep.1 button and the Free 10-Pattern PDF download.
- **Bottom** (before the FAQ): `<KpattoCta variant="end" />`.
- **Internal links:** 2–3 to related live articles (check slugs in the registry), written as normal markdown links: `[Han River guide](/blog/en/k-patto/han-river-parks-seoul-guide)`.
- **The app banner** (K-Patto / K-Pantry) under the article is added by the page template. Don't add it to the body.

## 7. SEO and FAQ
- **Title:** under 65 characters and includes the main keyword.
- **Description:** 1–2 sentences that answer the question.
- **Slug:** lowercase kebab-case, 3–7 words.
- **FAQ section, required as the last section:** `## Frequently Asked Questions` with **3–4** Q&As. Bold the question (ending in `?`) on its own line, with the answer as a plain paragraph right under it.

```mdx
## Frequently Asked Questions

**Can I pay by card at street stalls?**
Most stalls in Hongdae take cards, but carry some cash for the smaller carts.
```

  The page reads this section on its own and outputs **FAQPage** structured data (`lib/blog/faq.ts`).
  Note: since 2023 Google shows the FAQ rich result only for well-known government and health sites. The schema is still valid and helps search and AI answers understand the page, but don't promise a visible FAQ snippet in search results.

## 8. Facts and safety
- **No search grounding:** never invent statistics, quotes or sources.
- **Tax refunds, visas, insurance and rental deposits:** give ranges plus the official source. The generator saves these topics as drafts automatically.
- **No placeholder text or images** visible to readers. If there's no illustration yet, use a `<Dialogue>` or a table instead.

## 9. Pre-publish checklist
- [ ] Topic checked against `docs/articles-registry.json` (no duplicate)
- [ ] 800–1,200 words; intro is 2 sentences or fewer; `<KeyTakeaways>` comes right after it
- [ ] No more than 2 text-only paragraphs in a row; at least 1 table, 1 `<Dialogue>` and 1 `<DoDont>`
- [ ] `<KpattoCta />` in the middle and `<KpattoCta variant="end" />` near the end
- [ ] 2–3 internal links
- [ ] `## Frequently Asked Questions` with 3–4 bold-question Q&As
- [ ] MDX compiles (insert scripts check this before saving)
- [ ] Registry rebuilt after publishing

## Component reference
Defined in `components/blog/ArticleBlocks.tsx` and styled in `lib/blog/proseCss.ts`.

| Component | Props | Use |
| :--- | :--- | :--- |
| `<KeyTakeaways>` | `title?` | Summary card under the intro |
| `<Dialogue>` / `<Line />` | `title?` / `who ko rom en me?` | Situation dialogue as speech bubbles |
| `<DoDont>` + `<Do>` `<Dont>` | `title?` | Common mistakes, 2 columns (1 column on phones) |
| `<Callout>` | `type="tip \| warn \| info"`, `title?` | Tips and warnings |
| `<KpattoCta />` | `variant="mid \| end"` | Webtoon Ep.1 and free PDF buttons |
