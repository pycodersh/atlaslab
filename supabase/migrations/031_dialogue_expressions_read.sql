-- ============================================================
-- Migration 031: kp_dialogue_expressions SELECT 정책 추가
-- ============================================================
-- 배경:
--   029_write_lockdown.sql 에서 kp_dialogue_expressions 에
--   RLS를 켰지만 SELECT 정책은 추가하지 않아 anon/authenticated
--   클라이언트에서 0건이 반환됨.
--
-- 영향:
--   fetch-episode.ts 가 kp_dialogue_expressions 를 publishable key
--   로 조회해 highlightMap(dialogue_id → matched_text[]) 을 만드는데,
--   이 쿼리가 0건을 반환하므로 복수 하이라이트가 표시되지 않음.
--   (kp_bubbles.highlight_text 폴백은 단일 문자열이라 1개만 반환)
--
-- 조치:
--   kp_expressions 와 동일하게 USING(true) SELECT 정책 추가.
--   INSERT·UPDATE·DELETE 는 정책 없음 → 029의 쓰기 차단 유지.
--
-- kp_dialogues 는 text_ko·audio_url 모두 kp_bubbles 에서 폴백
-- 가능하므로 Phase 1 수준의 "SELECT 차단" 을 이번에는 건드리지 않음.
--
-- 적용일: 2026-08-15
-- ============================================================

ALTER TABLE kp_dialogue_expressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kp_dialogue_expressions_public_read" ON kp_dialogue_expressions;

CREATE POLICY "kp_dialogue_expressions_public_read"
  ON kp_dialogue_expressions FOR SELECT TO anon, authenticated
  USING (true);

-- ── ROLLBACK ─────────────────────────────────────────────────
-- DROP POLICY IF EXISTS "kp_dialogue_expressions_public_read" ON kp_dialogue_expressions;
-- (RLS는 029에서 이미 ON이므로 DISABLE 하지 않음)
