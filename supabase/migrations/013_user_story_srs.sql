-- Migration: 013_user_story_srs.sql
-- SRS round tracking for magazine stories (integer story IDs 1-100)
-- Separate from the UUID-based user_story_progress table in 001.

CREATE TABLE IF NOT EXISTS user_story_srs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id        INTEGER NOT NULL CHECK (story_id >= 1),
  current_round   SMALLINT NOT NULL DEFAULT 1 CHECK (current_round BETWEEN 1 AND 5),
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_review_at  TIMESTAMPTZ,
  is_mastered     BOOLEAN NOT NULL DEFAULT false,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, story_id)
);

CREATE INDEX IF NOT EXISTS idx_user_story_srs_user  ON user_story_srs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_story_srs_review ON user_story_srs(user_id, next_review_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER user_story_srs_updated_at
  BEFORE UPDATE ON user_story_srs
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS: each user can only read/write their own rows
ALTER TABLE user_story_srs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_story_srs_own_select" ON user_story_srs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_story_srs_own_insert" ON user_story_srs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_story_srs_own_update" ON user_story_srs
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
