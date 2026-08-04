-- Add audio_hash columns for idempotent TTS generation
-- hash = SHA-256 prefix of source text; if audio_url exists and hash matches, skip regeneration
ALTER TABLE kp_dialogues   ADD COLUMN IF NOT EXISTS audio_hash text;
ALTER TABLE kp_expressions ADD COLUMN IF NOT EXISTS audio_hash text;
