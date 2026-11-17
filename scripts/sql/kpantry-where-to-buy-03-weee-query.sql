-- TARGET: patto Supabase project — ref eecvvgkihtcgfikaimao
--
-- K-Pantry "Where to Buy" — Weee! 전용 검색어.
-- Weee! 검색은 긴 검색어에 약하다(2026-11-17 실측: "korean soy sauce jin ganjang" → 짜장면,
-- "korean anchovy fish sauce myeolchi aekjeot" → 마른 멸치). Amazon 은 buy_query 그대로 잘 찾는다.
-- weee_query 가 비면 buy_query 를 쓴다. 값은 -02-data.sql(빌더)이 채운다.

begin;
alter table public.pantry_ingredients add column if not exists weee_query text;
commit;
