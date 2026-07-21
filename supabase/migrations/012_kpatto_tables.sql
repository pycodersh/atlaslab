-- K-PATTO content and progress tables
-- Designed for 100-episode multilingual Korean learning app

-- ── Stories ───────────────────────────────────────────────────────────────────
create table if not exists kpatto_stories (
  id            text primary key,
  episode       integer not null,
  title         text not null,
  level         text not null check (level in ('beginner', 'intermediate', 'advanced')),
  theme         text not null,
  tags          text[] not null default '{}',   -- pattern ids
  vocabulary_ids text[] not null default '{}',
  panels        jsonb not null default '[]',    -- KPattoPanel[]
  thumbnail_url text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Patterns ──────────────────────────────────────────────────────────────────
create table if not exists kpatto_patterns (
  id           text primary key,
  korean       text not null,
  structure    text not null,
  translations jsonb not null default '{}',    -- { en, ja, zh-cn, ... }
  examples     jsonb not null default '[]',    -- [{ korean, translations, audio_url }]
  level        text not null check (level in ('beginner', 'intermediate', 'advanced')),
  created_at   timestamptz not null default now()
);

-- ── Vocabulary ────────────────────────────────────────────────────────────────
create table if not exists kpatto_vocabulary (
  id           text primary key,
  korean       text not null,
  translations jsonb not null default '{}',
  audio_url    text,
  category     text not null,
  level        text not null check (level in ('beginner', 'intermediate', 'advanced')),
  created_at   timestamptz not null default now()
);

-- ── User progress ─────────────────────────────────────────────────────────────
create table if not exists kpatto_user_progress (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  completed_stories   text[] not null default '{}',
  story_progress      jsonb not null default '{}',   -- { [story_id]: { completed, last_panel_index, completed_at } }
  learned_patterns    text[] not null default '{}',
  learned_vocabulary  text[] not null default '{}',
  streak_days         integer not null default 0,
  last_study_date     date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id)
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
alter table kpatto_stories   enable row level security;
alter table kpatto_patterns  enable row level security;
alter table kpatto_vocabulary enable row level security;
alter table kpatto_user_progress enable row level security;

-- Public read for content tables
create policy "kpatto_stories_public_read"
  on kpatto_stories for select using (true);

create policy "kpatto_patterns_public_read"
  on kpatto_patterns for select using (true);

create policy "kpatto_vocabulary_public_read"
  on kpatto_vocabulary for select using (true);

-- Users manage only their own progress
create policy "kpatto_progress_owner_select"
  on kpatto_user_progress for select using (auth.uid() = user_id);

create policy "kpatto_progress_owner_insert"
  on kpatto_user_progress for insert with check (auth.uid() = user_id);

create policy "kpatto_progress_owner_update"
  on kpatto_user_progress for update using (auth.uid() = user_id);

-- ── Helpers ───────────────────────────────────────────────────────────────────
-- Auto-update updated_at on kpatto_user_progress
create or replace function kpatto_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger kpatto_user_progress_updated_at
  before update on kpatto_user_progress
  for each row execute function kpatto_set_updated_at();

create trigger kpatto_stories_updated_at
  before update on kpatto_stories
  for each row execute function kpatto_set_updated_at();
