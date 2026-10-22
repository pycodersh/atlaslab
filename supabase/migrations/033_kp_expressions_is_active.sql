-- 033: kp_expressions.is_active — 패턴 목록·퀴즈에서 빼되 행(과 웹툰 대사)은 보존하는 비활성 표시
-- 2026-10-22 패턴 정예화: 비패턴 25개를 비활성 처리해 활성 패턴을 300개로 맞춘다.
alter table public.kp_expressions
  add column if not exists is_active boolean not null default true;

update public.kp_expressions
set is_active = false
where id in (791, 806, 811, 819, 824, 825, 826, 837, 838, 862, 868, 874, 875,
             949, 981, 982, 987, 989, 994, 995, 1011, 1012, 1016, 1021, 1028);
