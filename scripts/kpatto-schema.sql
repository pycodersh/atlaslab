-- K-PATTO DB Schema
-- Run this FIRST in Supabase SQL Editor before running seed-kpatto.ts
-- Note: kp_patterns has an extra `code` column (original TS id) for challenge mapping

CREATE TABLE IF NOT EXISTS kp_episodes (
  id           SERIAL PRIMARY KEY,
  episode_num  INT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  theme        TEXT,
  is_free      BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kp_panels (
  id           SERIAL PRIMARY KEY,
  episode_id   INT REFERENCES kp_episodes(id),
  order_num    INT NOT NULL,
  type         TEXT NOT NULL,   -- 'panel' | 'gap' | 'crop-panel'
  image_url    TEXT,
  layout       TEXT,
  height_ratio FLOAT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kp_bubbles (
  id           SERIAL PRIMARY KEY,
  panel_id     INT REFERENCES kp_panels(id),
  episode_id   INT REFERENCES kp_episodes(id),
  order_num    INT NOT NULL,
  speaker      TEXT NOT NULL,
  korean       TEXT NOT NULL,
  translations JSONB,           -- { en: "...", ja: "...", es: "..." }
  audio_url    TEXT,
  position     JSONB,           -- { xPct, yPct, widthPct, bubbleKey, lines }
  tail         JSONB,           -- { anchor, tipX, tipY, baseWidth } | null
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kp_patterns (
  id           SERIAL PRIMARY KEY,
  code         TEXT UNIQUE,     -- original TS id e.g. 'kp-ep-001-p001'
  episode_id   INT REFERENCES kp_episodes(id),
  order_num    INT NOT NULL,
  pattern      TEXT NOT NULL,
  structure    TEXT,
  examples     JSONB,           -- [{ korean, translations: {en,...} }]
  level        TEXT DEFAULT 'beginner',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kp_challenges (
  id           SERIAL PRIMARY KEY,
  episode_id   INT REFERENCES kp_episodes(id),
  pattern_id   INT REFERENCES kp_patterns(id),
  order_num    INT NOT NULL,
  type         TEXT,            -- 'mc' | 'wb'
  question     JSONB,           -- { prompt: "..." }
  options      JSONB,           -- mc: ["answer","d1","d2","d3"] | wb: { answerBlocks, extraBlocks }
  answer       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kp_voices (
  speaker      TEXT PRIMARY KEY,
  voice_id     TEXT NOT NULL,
  language     TEXT DEFAULT 'ko-KR',
  pitch        FLOAT DEFAULT 0,
  speed        FLOAT DEFAULT 1.0
);
