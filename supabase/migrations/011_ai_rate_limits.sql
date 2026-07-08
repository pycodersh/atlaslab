-- PATTO AI Rate Limits & Caching
-- Migration: 011_ai_rate_limits.sql

-- ============================================================
-- Add plan column to user_profiles
-- ============================================================
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'premium'));

-- ============================================================
-- AI API Logs  (service-role writes, user can read own)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_api_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint       TEXT NOT NULL,           -- 'essays/review' | 'essays/suggest' | 'translate'
  model          TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('success', 'failed', 'cached', 'rejected')),
  reason         TEXT,                    -- 'daily_limit' | 'duplicate' | 'word_limit' | 'cache_hit' | 'unauthenticated' | 'openai_error' | null
  input_tokens   INT,
  output_tokens  INT,
  estimated_cost NUMERIC(10, 6),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_logs_user       ON ai_api_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_endpoint   ON ai_api_logs(endpoint, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_status     ON ai_api_logs(status, created_at DESC);

ALTER TABLE ai_api_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own logs; service role (server) inserts freely (bypasses RLS)
CREATE POLICY "ai_logs_own_select" ON ai_api_logs
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- AI Daily Usage  (per user / per endpoint / per UTC date)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_daily_usage (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   TEXT NOT NULL,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  count      INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_daily_usage ON ai_daily_usage(user_id, endpoint, date);

ALTER TABLE ai_daily_usage ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; anon/authenticated only read own rows
CREATE POLICY "ai_daily_usage_own_select" ON ai_daily_usage
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- Translation Cache  (shared across all users, indexed by key)
-- ============================================================
CREATE TABLE IF NOT EXISTS translation_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key     TEXT NOT NULL UNIQUE,   -- '{type}:{normalised_text}:{lang}'
  item_type     TEXT NOT NULL CHECK (item_type IN ('word', 'phrase', 'pattern')),
  original_text TEXT NOT NULL,
  target_lang   TEXT NOT NULL,
  translation   TEXT NOT NULL,
  hit_count     INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_translation_cache_key ON translation_cache(cache_key);

ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read; service role writes (RLS bypassed on server)
CREATE POLICY "translation_cache_public_read" ON translation_cache
  FOR SELECT USING (true);

-- ============================================================
-- Essay Review Cache  (shared, keyed by normalised content hash)
-- ============================================================
CREATE TABLE IF NOT EXISTS essay_review_cache (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_hash TEXT NOT NULL UNIQUE,
  review_json  JSONB NOT NULL,
  hit_count    INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_essay_review_cache_hash ON essay_review_cache(content_hash);

ALTER TABLE essay_review_cache ENABLE ROW LEVEL SECURITY;

-- Anyone can read; service role writes
CREATE POLICY "essay_review_cache_public_read" ON essay_review_cache
  FOR SELECT USING (true);

-- ============================================================
-- RPC: atomic upsert + increment for ai_daily_usage
-- Called by server with service role (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_ai_usage(
  p_user_id UUID,
  p_endpoint TEXT,
  p_date     DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO ai_daily_usage (user_id, endpoint, date, count, updated_at)
  VALUES (p_user_id, p_endpoint, p_date, 1, now())
  ON CONFLICT (user_id, endpoint, date)
  DO UPDATE SET count = ai_daily_usage.count + 1,
                updated_at = now();
END;
$$;
