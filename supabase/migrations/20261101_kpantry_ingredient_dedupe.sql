-- K-Pantry 식재료 마스터 정합성 정리 (2026-11-01)
--
-- 배경: pantry_ingredients 95개 중 11개는 어느 레시피에도 연결돼 있지 않다.
-- 실측해 보니 9개는 레시피가 이미 쓰는 다른 이름 재료의 중복이었다(옛 seed 두 벌이 섞였다).
-- 중복 쪽에만 한국어 이름·별칭이 들어 있고, 실제로 쓰이는 쪽은 비어 있었다.
--
--   중복(레시피 0)   → 실제로 쓰는 재료(레시피 수)
--   Tuna             → Canned Tuna (1)
--   Rice Cake        → Korean Rice Cakes (6)
--   Cheese           → American Cheese (3), Mozzarella Cheese (3)
--   Jujube           → Dried Jujubes (1, 삼계탕)
--   Pork             → Pork Belly (9), Pork Shoulder (2)
--   Soondae          → Korean Blood Sausage (2)
--   Chives           → Garlic Chives (1)   — 부추 = garlic chives
--   Mustard          → Korean Mustard Paste (1)
--   Whole Chicken    → 삼계탕이 Chicken 으로 연결돼 있었다(조리 단계는 "small whole chicken")
--   Coriander, Wild Parsley → 103개 레시피 어디에도 안 나온다
--
-- 이 마이그레이션이 하는 일(행 삭제 없음, 한 트랜잭션):
--   1) 중복 쪽의 한국어 이름·별칭을 실제 재료로 옮긴다 → 검색(이름·한국어·별칭)에서 '참치'·'tuna' 등으로 찾힌다
--   2) 삼계탕의 Chicken 연결을 Whole Chicken 으로 바꾼다 → Whole Chicken 이 실제 재료가 된다
--   3) 사용자 저장 pantry·장보기 목록에 중복 id 가 있으면 실제 재료 id 로 옮긴다
-- 레시피 0개 재료는 앱이 목록에서 뺀다(lib/kpantry/ingredients.ts getIngredients) — 행은 남겨 두어 되돌리기 쉽다.

BEGIN;

-- 별칭 합치기: 기존 별칭 ∪ 새 별칭, 소문자, 중복 제거
CREATE OR REPLACE FUNCTION pg_temp.merge_aliases(cur TEXT[], extra TEXT[])
RETURNS TEXT[] LANGUAGE sql IMMUTABLE AS $$
  SELECT ARRAY(SELECT DISTINCT lower(a) FROM unnest(coalesce(cur, '{}') || extra) AS a WHERE a <> '' ORDER BY 1)
$$;

-- 1) 한국어 이름·별칭 옮기기
UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '참치'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['tuna', 'canned tuna'])
  WHERE name = 'Canned Tuna';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '떡볶이 떡'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['rice cake', 'rice cakes', 'tteok'])
  WHERE name = 'Korean Rice Cakes';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '슬라이스 치즈'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['cheese', 'sliced cheese'])
  WHERE name = 'American Cheese';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '모짜렐라 치즈'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['cheese', 'mozzarella'])
  WHERE name = 'Mozzarella Cheese';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '대추'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['jujube', 'red dates', 'korean jujube'])
  WHERE name = 'Dried Jujubes';

UPDATE pantry_ingredients SET
  aliases = pg_temp.merge_aliases(aliases, ARRAY['pork', 'pork slices'])
  WHERE name = 'Pork Belly';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '돼지 앞다리살'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['pork'])
  WHERE name = 'Pork Shoulder';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '순대'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['soondae', 'sundae', 'blood sausage', 'korean sausage'])
  WHERE name = 'Korean Blood Sausage';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '부추'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['chives', 'buchu', 'korean chives'])
  WHERE name = 'Garlic Chives';

UPDATE pantry_ingredients SET name_ko = coalesce(name_ko, '겨자'),
  aliases = pg_temp.merge_aliases(aliases, ARRAY['mustard', 'korean mustard'])
  WHERE name = 'Korean Mustard Paste';

-- 2) 삼계탕: Chicken → Whole Chicken (UNIQUE(recipe_id, ingredient_id) 라 Whole Chicken 행이 없을 때만)
UPDATE pantry_recipe_ingredients ri
SET ingredient_id = wc.id
FROM pantry_recipes r, pantry_ingredients c, pantry_ingredients wc
WHERE ri.recipe_id = r.id AND r.slug = 'samgyetang'
  AND ri.ingredient_id = c.id AND c.name = 'Chicken'
  AND wc.name = 'Whole Chicken'
  AND NOT EXISTS (
    SELECT 1 FROM pantry_recipe_ingredients x WHERE x.recipe_id = r.id AND x.ingredient_id = wc.id
  );

-- 3) 사용자 데이터의 중복 id → 실제 재료 id (Cheese·Pork 처럼 둘로 갈리는 건 대표 하나로)
CREATE TEMP TABLE dup_map ON COMMIT DROP AS
SELECT d.id AS dup_id, k.id AS keep_id
FROM (VALUES
  ('Tuna', 'Canned Tuna'),
  ('Rice Cake', 'Korean Rice Cakes'),
  ('Cheese', 'Mozzarella Cheese'),
  ('Jujube', 'Dried Jujubes'),
  ('Pork', 'Pork Belly'),
  ('Soondae', 'Korean Blood Sausage'),
  ('Chives', 'Garlic Chives'),
  ('Mustard', 'Korean Mustard Paste')
) AS m(dup_name, keep_name)
JOIN pantry_ingredients d ON d.name = m.dup_name
JOIN pantry_ingredients k ON k.name = m.keep_name;

-- pantry_user_items: UNIQUE(user_id, ingredient_id) — 이미 실제 재료를 가진 사용자는 중복 행만 지운다
INSERT INTO pantry_user_items (user_id, ingredient_id)
SELECT DISTINCT u.user_id, m.keep_id
FROM pantry_user_items u JOIN dup_map m ON u.ingredient_id = m.dup_id
WHERE NOT EXISTS (
  SELECT 1 FROM pantry_user_items x WHERE x.user_id = u.user_id AND x.ingredient_id = m.keep_id
);
DELETE FROM pantry_user_items u USING dup_map m WHERE u.ingredient_id = m.dup_id;

-- pantry_shopping_list: 같은 사용자에게 실제 재료 행이 이미 있으면 중복 행은 지우고, 없으면 id 만 바꾼다
DELETE FROM pantry_shopping_list s USING dup_map m
WHERE s.ingredient_id = m.dup_id
  AND EXISTS (SELECT 1 FROM pantry_shopping_list x WHERE x.user_id = s.user_id AND x.ingredient_id = m.keep_id);
UPDATE pantry_shopping_list s SET ingredient_id = m.keep_id
FROM dup_map m WHERE s.ingredient_id = m.dup_id;

COMMIT;

-- 확인용: 레시피에 연결된 재료 수(앱 목록에 보이는 수) — 적용 후 85 가 나와야 한다
-- SELECT count(DISTINCT ingredient_id) FROM pantry_recipe_ingredients;
