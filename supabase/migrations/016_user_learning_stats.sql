-- user_learning_stats: stores per-user adaptive learning data
-- Synced from localStorage; localStorage remains the source of truth.

create table if not exists public.user_learning_stats (
  user_id                uuid primary key references auth.users(id) on delete cascade,
  visit_count            integer      not null default 0,
  total_sessions         integer      not null default 0,
  total_patterns_learned integer      not null default 0,
  current_streak         integer      not null default 0,
  longest_streak         integer      not null default 0,
  avg_response_time      integer      not null default 4000,  -- ms
  challenge_correct_rate numeric(4,3) not null default 1.0,
  last_session_at        date,
  last_visit_at          date,
  weak_patterns          text[]       not null default '{}',
  created_at             timestamptz  not null default now(),
  updated_at             timestamptz  not null default now()
);

-- RLS
alter table public.user_learning_stats enable row level security;

create policy "Users can read own stats"
  on public.user_learning_stats for select
  using (auth.uid() = user_id);

create policy "Users can upsert own stats"
  on public.user_learning_stats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own stats"
  on public.user_learning_stats for update
  using (auth.uid() = user_id);
