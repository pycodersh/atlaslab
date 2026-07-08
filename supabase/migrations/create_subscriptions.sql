-- Paddle 구독 상태를 저장하는 테이블
-- Supabase Dashboard > SQL Editor 에서 실행하세요

create table if not exists public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  paddle_subscription_id  text unique,
  paddle_customer_id      text,
  status              text not null default 'free',
  -- status: 'free' | 'active' | 'past_due' | 'canceled' | 'trialing'
  plan                text,
  -- plan: 'monthly' | 'annual'
  current_period_end  timestamptz,
  cancel_at_period_end boolean default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- 유저당 하나의 구독 레코드만 허용
create unique index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);

-- RLS 활성화
alter table public.subscriptions enable row level security;

-- 본인 구독만 읽기 가능
create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 서버(service role)만 쓰기 가능 — 클라이언트는 직접 수정 불가
create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role');
