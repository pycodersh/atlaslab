-- Migration: 010_pattern_note_column.sql
-- Add optional note column to pattern_translations for nuance/usage notes

ALTER TABLE pattern_translations
  ADD COLUMN IF NOT EXISTS note TEXT;
