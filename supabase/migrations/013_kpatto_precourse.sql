-- Add pre-course progress column to kpatto_user_progress for cloud sync
ALTER TABLE kpatto_user_progress
  ADD COLUMN IF NOT EXISTS precourse_progress jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN kpatto_user_progress.precourse_progress IS
  'K-PATTO pre-course lesson progress. Shape: { lessons: Record<lessonId, { completed, quiz_passed, completed_at }>, story_unlocked: boolean }';
