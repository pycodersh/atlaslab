-- Migration: 003_progress_extensions.sql
-- user_pattern_progress에 즐겨찾기 컬럼 추가
-- user_story_progress에 낭독 횟수 컬럼 추가

ALTER TABLE user_pattern_progress
  ADD COLUMN IF NOT EXISTS is_favorited BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE user_story_progress
  ADD COLUMN IF NOT EXISTS read_count INT NOT NULL DEFAULT 0;
