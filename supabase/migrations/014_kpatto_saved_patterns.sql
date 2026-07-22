-- K-PATTO saved (bookmarked) patterns
create table if not exists kpatto_saved_patterns (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  pattern_id text not null,
  episode_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, pattern_id)
);

alter table kpatto_saved_patterns enable row level security;

create policy "kpatto_saved_patterns_owner_select"
  on kpatto_saved_patterns for select using (auth.uid() = user_id);

create policy "kpatto_saved_patterns_owner_insert"
  on kpatto_saved_patterns for insert with check (auth.uid() = user_id);

create policy "kpatto_saved_patterns_owner_delete"
  on kpatto_saved_patterns for delete using (auth.uid() = user_id);
