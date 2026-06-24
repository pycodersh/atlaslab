-- Seed: 언어 초기 데이터
-- Migration: 001_languages.sql

INSERT INTO languages (code, name, is_active) VALUES
  ('en', 'English',  true),
  ('ko', '한국어',    false),
  ('ja', '日本語',    false),
  ('es', 'Español',  false)
ON CONFLICT (code) DO NOTHING;
