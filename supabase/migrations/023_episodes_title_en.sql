-- Add English title to kp_episodes for SEO slug + bilingual UI
ALTER TABLE kp_episodes
  ADD COLUMN IF NOT EXISTS title_en TEXT;
