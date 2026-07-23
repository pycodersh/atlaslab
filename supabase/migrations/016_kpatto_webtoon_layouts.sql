-- K-PATTO webtoon bubble layout overrides (replaces local JSON files)
-- Stores editor-saved bubble positions per episode

create table if not exists kpatto_webtoon_layouts (
  episode_id  text primary key,
  overrides   jsonb not null default '{}',  -- Override per bubble id
  bubbles     jsonb not null default '{}',  -- Resolved bubble positions
  updated_at  timestamptz not null default now()
);

-- Public read (viewer loads overrides), admin write via service role key
alter table kpatto_webtoon_layouts enable row level security;

create policy "kpatto_webtoon_layouts_public_read"
  on kpatto_webtoon_layouts for select using (true);

-- Auto-update updated_at
create trigger kpatto_webtoon_layouts_updated_at
  before update on kpatto_webtoon_layouts
  for each row execute function kpatto_set_updated_at();
