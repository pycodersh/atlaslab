-- kp_challenges에 variant 컬럼 추가 (FB-A: 'blank', FB-B: 'identify')
alter table public.kp_challenges
  add column if not exists variant text;
