-- Migration: 014_user_profiles_visit_count.sql
-- Adds visit tracking fields to user_profiles for Scenario Engine

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS visit_count   INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_visit_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_visit_at  TIMESTAMPTZ;
