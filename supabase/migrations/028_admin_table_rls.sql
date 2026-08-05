-- ============================================================
-- Migration 028: Restrict write access on admin-only tables
-- ============================================================
-- Problem: kp_episodes, kp_panels, kp_expressions, kp_challenges,
--          kp_dialogues had no INSERT/UPDATE/DELETE RLS policies.
--          An anon key could successfully INSERT into kp_episodes (201).
--
-- Fix: Enable RLS where missing + deny all writes for anon/authenticated.
--      Only service_role (admin server) may mutate these tables.
-- ============================================================

-- 1. Enable RLS on all kp_ content tables (idempotent)
ALTER TABLE kp_episodes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE kp_panels      ENABLE ROW LEVEL SECURITY;
ALTER TABLE kp_expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kp_challenges  ENABLE ROW LEVEL SECURITY;
ALTER TABLE kp_dialogues   ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing open policies before creating restricted ones
DROP POLICY IF EXISTS "anon read kp_episodes"    ON kp_episodes;
DROP POLICY IF EXISTS "anon read kp_panels"      ON kp_panels;
DROP POLICY IF EXISTS "anon read kp_expressions" ON kp_expressions;
DROP POLICY IF EXISTS "anon read kp_challenges"  ON kp_challenges;
DROP POLICY IF EXISTS "anon read kp_dialogues"   ON kp_dialogues;

-- 3. READ: allow anyone to SELECT (public content)
CREATE POLICY "anon read kp_episodes"
  ON kp_episodes FOR SELECT
  USING (true);

CREATE POLICY "anon read kp_panels"
  ON kp_panels FOR SELECT
  USING (true);

CREATE POLICY "anon read kp_expressions"
  ON kp_expressions FOR SELECT
  USING (true);

CREATE POLICY "anon read kp_challenges"
  ON kp_challenges FOR SELECT
  USING (true);

CREATE POLICY "anon read kp_dialogues"
  ON kp_dialogues FOR SELECT
  USING (true);

-- 4. WRITE: no explicit policy → RLS denies all INSERT/UPDATE/DELETE
--    for anon and authenticated roles by default.
--    service_role bypasses RLS entirely (Supabase default behaviour).

-- Verify: after applying, run these to confirm:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename LIKE 'kp_%';
-- SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE tablename LIKE 'kp_%' ORDER BY 1,4;
