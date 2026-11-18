-- TARGET: patto Supabase project — ref eecvvgkihtcgfikaimao
--
-- K-Pantry "Where to Buy" 2차 — 링크가 하나도 없던 korean_asian 재료(9개)에 Weee! 전용 검색어.
-- buy_query(Amazon)는 비워 둔다: Amazon 은 신선·냉장 재료를 사실상 팔지 않는다 → 화면에 Weee! 링크만 나온다.
-- 검색어는 2026-11-18 weee.com 검색 결과 상위 상품을 확인하고 골랐다(스크립트 주석에 결과 요약).
-- 콩비지(kongbiji)는 Weee! 에 맞는 상품이 없어 비워 둔다 → 화면에 "Fresh — check the refrigerated section".
-- 스키마 변경 없음. 원문은 scripts/data/kpantry-buy-info.source.mjs 에도 같은 값이 있다.

begin;

update public.pantry_ingredients set weee_query = 'soybean sprouts'      where slug = 'soybean-sprouts';  -- Soy Bean Sprouts 1 lb
update public.pantry_ingredients set weee_query = 'garlic chives'        where slug = 'garlic-chives';    -- Garlic Chives with Flower
update public.pantry_ingredients set weee_query = 'korean radish'        where slug = 'korean-radish';    -- Korean Radish 2.7-3.5 lb
update public.pantry_ingredients set weee_query = 'soft tofu tube'       where slug = 'soft-tofu';        -- Pulmuone Soon Tofu Tube
update public.pantry_ingredients set weee_query = 'korean fish cake'     where slug = 'fish-cake';        -- Wang Korea Busan Fish Cake
update public.pantry_ingredients set weee_query = 'pollock roe'          where slug = 'fish-roe';         -- Seasoned Alaskan Pollock Roe / Mentaiko
update public.pantry_ingredients set weee_query = 'soondae'              where slug = 'sundae';           -- Seoul Soondae Korean Sausage
update public.pantry_ingredients set weee_query = 'korean mustard'       where slug = 'korean-mustard';   -- Otoki Prepared Mustard (상온 — 신선 재료 아님)

commit;

-- Verify:
-- select slug, buy_query, weee_query from pantry_ingredients
--  where store_level = 'korean_asian' and coalesce(buy_query, '') = '' order by slug;
