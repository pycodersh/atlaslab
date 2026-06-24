-- PATTO Initial Schema
-- Migration: 001_initial_schema.sql
-- Created: 2026-06-23

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE difficulty_level AS ENUM ('normal', 'advanced', 'native');

CREATE TYPE pattern_status AS ENUM ('unseen', 'learning', 'reviewing', 'mastered');

-- ============================================================
-- LANGUAGES
-- ============================================================
CREATE TABLE languages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PATTERN IMAGES
-- ============================================================
CREATE TABLE pattern_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL UNIQUE,
  alt_text    TEXT,
  style       TEXT NOT NULL DEFAULT 'minimal_3d',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- PATTERNS
-- ============================================================
CREATE TABLE patterns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id  UUID NOT NULL REFERENCES languages(id),
  level        SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
  order_index  INT NOT NULL,
  image_id     UUID REFERENCES pattern_images(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (language_id, level, order_index)
);

CREATE INDEX idx_patterns_language_level ON patterns(language_id, level);
CREATE INDEX idx_patterns_published ON patterns(is_published);

-- ============================================================
-- PATTERN TRANSLATIONS
-- ============================================================
CREATE TABLE pattern_translations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id   UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  ui_lang      TEXT NOT NULL REFERENCES languages(code),
  pattern_text TEXT NOT NULL,
  meaning      TEXT NOT NULL,
  UNIQUE (pattern_id, ui_lang)
);

CREATE INDEX idx_pattern_translations_pattern ON pattern_translations(pattern_id);

-- ============================================================
-- EXAMPLES
-- ============================================================
CREATE TABLE examples (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id  UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  difficulty  difficulty_level NOT NULL,
  order_index SMALLINT NOT NULL CHECK (order_index BETWEEN 1 AND 5),
  sentence    TEXT NOT NULL,
  audio_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pattern_id, difficulty, order_index)
);

CREATE INDEX idx_examples_pattern_difficulty ON examples(pattern_id, difficulty);

-- ============================================================
-- EXAMPLE TRANSLATIONS
-- ============================================================
CREATE TABLE example_translations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  example_id  UUID NOT NULL REFERENCES examples(id) ON DELETE CASCADE,
  ui_lang     TEXT NOT NULL REFERENCES languages(code),
  translation TEXT NOT NULL,
  UNIQUE (example_id, ui_lang)
);

-- ============================================================
-- STORIES
-- ============================================================
CREATE TABLE stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id  UUID NOT NULL REFERENCES languages(id),
  level        SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
  order_index  INT NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (language_id, level, order_index)
);

CREATE INDEX idx_stories_language_level ON stories(language_id, level);

-- ============================================================
-- STORY TRANSLATIONS
-- ============================================================
CREATE TABLE story_translations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  ui_lang     TEXT NOT NULL REFERENCES languages(code),
  title       TEXT NOT NULL,
  description TEXT,
  UNIQUE (story_id, ui_lang)
);

-- ============================================================
-- STORY PATTERNS (junction)
-- ============================================================
CREATE TABLE story_patterns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  pattern_id  UUID NOT NULL REFERENCES patterns(id),
  order_index SMALLINT NOT NULL CHECK (order_index BETWEEN 1 AND 5),
  UNIQUE (story_id, order_index),
  UNIQUE (story_id, pattern_id)
);

-- ============================================================
-- USER PROFILES (linked to Supabase Auth)
-- ============================================================
CREATE TABLE user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ui_lang    TEXT NOT NULL DEFAULT 'ko' REFERENCES languages(code),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- USER LANGUAGE SETTINGS
-- ============================================================
CREATE TABLE user_language_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  native_lang   TEXT NOT NULL REFERENCES languages(code),
  learning_lang TEXT NOT NULL REFERENCES languages(code),
  difficulty    difficulty_level NOT NULL DEFAULT 'normal',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, native_lang, learning_lang)
);

-- ============================================================
-- USER PATTERN PROGRESS
-- ============================================================
CREATE TABLE user_pattern_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_id    UUID NOT NULL REFERENCES patterns(id),
  difficulty    difficulty_level NOT NULL,
  status        pattern_status NOT NULL DEFAULT 'unseen',
  review_count  INT NOT NULL DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  next_review   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pattern_id, difficulty)
);

CREATE INDEX idx_progress_user_status ON user_pattern_progress(user_id, status);
CREATE INDEX idx_progress_next_review ON user_pattern_progress(user_id, next_review);

-- ============================================================
-- USER STORY PROGRESS
-- ============================================================
CREATE TABLE user_story_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  story_id     UUID NOT NULL REFERENCES stories(id),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, story_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- languages: 모두 읽기 허용
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "languages_public_read" ON languages FOR SELECT USING (true);

-- pattern_images: 모두 읽기 허용
ALTER TABLE pattern_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "images_public_read" ON pattern_images FOR SELECT USING (true);

-- patterns: 발행된 것만 읽기 허용
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patterns_published_read" ON patterns FOR SELECT USING (is_published = true);

-- pattern_translations: 모두 읽기 허용
ALTER TABLE pattern_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pattern_translations_public_read" ON pattern_translations FOR SELECT USING (true);

-- examples: 모두 읽기 허용
ALTER TABLE examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "examples_public_read" ON examples FOR SELECT USING (true);

-- example_translations: 모두 읽기 허용
ALTER TABLE example_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "example_translations_public_read" ON example_translations FOR SELECT USING (true);

-- stories: 발행된 것만 읽기 허용
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stories_published_read" ON stories FOR SELECT USING (is_published = true);

-- story_translations: 모두 읽기 허용
ALTER TABLE story_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_translations_public_read" ON story_translations FOR SELECT USING (true);

-- story_patterns: 모두 읽기 허용
ALTER TABLE story_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "story_patterns_public_read" ON story_patterns FOR SELECT USING (true);

-- user_profiles: 본인만 접근
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_profiles_own" ON user_profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- user_language_settings: 본인만 접근
ALTER TABLE user_language_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_language_settings_own" ON user_language_settings
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- user_pattern_progress: 본인만 접근
ALTER TABLE user_pattern_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_pattern_progress_own" ON user_pattern_progress
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- user_story_progress: 본인만 접근
ALTER TABLE user_story_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_story_progress_own" ON user_story_progress
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- FUNCTION: auto-create user_profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, ui_lang)
  VALUES (NEW.id, 'ko')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
