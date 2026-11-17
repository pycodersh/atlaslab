-- TARGET: patto Supabase project — ref eecvvgkihtcgfikaimao
--
-- K-Pantry 잠긴 레시피 조리 단계 보호 (2026-11-17)
--
-- 전: pantry_recipe_steps 는 공개 읽기(qual true) — 화면만 잠겨 있고, 공개 키로 93개 유료 레시피 단계를 다 읽을 수 있었다.
-- 후: anon·authenticated 는 무료 레시피(pantry_recipes.is_free) 단계, 또는 로그인 계정에 활성 Pro 구독이 있을 때만 읽는다.
--     Gumroad 패스(쿠키 kpantry_pass, 로그인 없음) 보유자는 RLS 가 알아볼 수 없으므로
--     서버 경로 GET /api/kpantry/recipe-steps 가 패스 서명을 확인한 뒤 서비스 롤로 내준다.
--
-- 함께 닫는 구멍: pantry_subscriptions 정책이 "본인 행 ALL" 이라 로그인 사용자가 자기 행을 plan='pro' 로
-- 직접 INSERT 할 수 있었다(이 표로 구독자를 판정하는 순간 우회로가 된다). 앱 코드는 이 표를 읽기만 하므로
-- 본인 행 SELECT 만 남기고 쓰기는 서비스 롤 전용으로 둔다. (적용 시점 행 0개)
--
-- 무료 목록은 lib/kpantry/access.ts 의 FREE_RECIPE_SLUGS 와 같아야 한다. 바꿀 땐 둘 다 바꾼다.

begin;

-- 1. 무료 레시피 표시
alter table public.pantry_recipes add column if not exists is_free boolean not null default false;

update public.pantry_recipes
   set is_free = slug in (
     'bibimbap', 'kimchi-fried-rice', 'gimbap', 'bulgogi', 'samgyeopsal',
     'haemul-pajeon', 'kimchi-jjigae', 'japchae', 'tteokbokki', 'hotteok'
   );

-- 2. 구독 표: 본인 행 읽기만
drop policy if exists pantry_subscriptions_own on public.pantry_subscriptions;
drop policy if exists pantry_subscriptions_own_read on public.pantry_subscriptions;
create policy pantry_subscriptions_own_read on public.pantry_subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

-- 3. 조리 단계: 무료 레시피 또는 활성 Pro 구독자만
drop policy if exists pantry_rs_public_read on public.pantry_recipe_steps;
drop policy if exists pantry_rs_read_free_or_pro on public.pantry_recipe_steps;
create policy pantry_rs_read_free_or_pro on public.pantry_recipe_steps
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.pantry_recipes r
       where r.id = pantry_recipe_steps.recipe_id and r.is_free
    )
    or exists (
      select 1 from public.pantry_subscriptions s
       where s.user_id = (select auth.uid())
         and s.plan = 'pro' and s.status = 'active'
         and (s.expires_at is null or s.expires_at > now())
    )
  );

alter table public.pantry_recipe_steps enable row level security;

commit;

-- Verify (as anon, via the publishable key — see scripts/sql/verify-kpantry-recipe-lock.mjs):
--   locked recipe steps  → 0 rows
--   free recipe steps    → rows
