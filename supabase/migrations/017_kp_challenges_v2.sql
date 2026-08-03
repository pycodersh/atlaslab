-- kp_challenges 재설계: 스펙 §5-1 기준
-- 기존 구 구조(episode_id, pattern_id 등) 삭제 후 신규 스키마 생성

drop table if exists public.kp_challenges;

create table public.kp_challenges (
  id             bigint generated always as identity primary key,
  ep_no          integer not null,
  slot           text    not null,           -- MC1..MC6, FB1..FB6, SB1..SB3
  round_no       integer not null,           -- 1, 2, 3
  type           text    not null check (type in ('multiple_choice','fill_blank','sentence_build')),
  question       text    not null,
  hint           text,                       -- fill_blank·sentence_build용
  answer         text    not null,
  options        jsonb,                      -- MC: 4-elem string[], FB: 4-elem pattern array
  tokens         jsonb,                      -- sentence_build 전용 string[]
  expression_id  integer references public.kp_expressions(id),
  example_index  integer,                    -- 0, 1, 2
  unique (ep_no, slot)
);

alter table public.kp_challenges enable row level security;
create policy "kp_challenges_public_read" on public.kp_challenges for select using (true);

-- kp_challenge_progress 신규 (스펙 §5-2)
create table if not exists public.kp_challenge_progress (
  user_id     uuid references auth.users(id) on delete cascade,
  ep_no       integer not null,
  round_no    integer not null default 1,
  cleared_at  timestamptz not null default now(),
  primary key (user_id, ep_no)
);

alter table public.kp_challenge_progress enable row level security;
create policy "kp_challenge_progress_owner" on public.kp_challenge_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
