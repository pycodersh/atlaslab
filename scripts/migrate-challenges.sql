-- Run this in Supabase Studio SQL editor
-- Adds challenge_type and word_pieces columns to kp_challenges

ALTER TABLE kp_challenges
  ADD COLUMN IF NOT EXISTS challenge_type TEXT,
  ADD COLUMN IF NOT EXISTS word_pieces JSONB;

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'kp_challenges'
ORDER BY ordinal_position;
