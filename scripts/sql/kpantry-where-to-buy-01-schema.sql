-- TARGET: patto Supabase project — ref eecvvgkihtcgfikaimao
-- (NOT the old kpantry project. Check the ref in the SQL Editor URL before running.)
--
-- K-Pantry "Where to Buy" — adds purchase-info columns to pantry_ingredients.
-- No new table: recipe ↔ ingredient mapping already keys on pantry_ingredients.id.
-- English name = existing `name` column (no english_name column added).
-- All columns are nullable and additive; existing rows/values are untouched.

begin;

alter table public.pantry_ingredients
  add column if not exists slug             text,
  add column if not exists romanized        text,   -- e.g. gochujang, ganjang (shown on the page under the Korean name)
  add column if not exists store_level      text,
  add column if not exists price_tier       text,
  add column if not exists what_it_is       text,
  add column if not exists shopping_tip     text,
  add column if not exists label_hint       text,
  add column if not exists substitute       text,
  add column if not exists shelf_life       text,
  add column if not exists buy_query        text,
  add column if not exists buy_info_updated date;

do $do$
begin
  if not exists (select 1 from pg_constraint where conname = 'pantry_ingredients_slug_key') then
    alter table public.pantry_ingredients add constraint pantry_ingredients_slug_key unique (slug);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pantry_ingredients_store_level_check') then
    alter table public.pantry_ingredients add constraint pantry_ingredients_store_level_check
      check (store_level is null or store_level in ('regular', 'korean_asian', 'common'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pantry_ingredients_price_tier_check') then
    alter table public.pantry_ingredients add constraint pantry_ingredients_price_tier_check
      check (price_tier is null or price_tier in ('$', '$$', '$$$'));
  end if;
end $do$;

commit;

-- Verify:
-- select column_name, data_type from information_schema.columns
--  where table_schema = 'public' and table_name = 'pantry_ingredients' order by ordinal_position;
