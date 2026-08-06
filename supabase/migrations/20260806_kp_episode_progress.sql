-- kp_episode_progress: 에피소드 완료 진행도 (챌린지 통과 = 완료)
-- 2026-08-06

CREATE TABLE IF NOT EXISTS kp_episode_progress (
  user_id         UUID     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  episode_num     SMALLINT NOT NULL CHECK (episode_num BETWEEN 1 AND 100),
  completed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_count SMALLINT    NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, episode_num)
);

ALTER TABLE kp_episode_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ep_progress_select"
  ON kp_episode_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "ep_progress_insert"
  ON kp_episode_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ep_progress_update"
  ON kp_episode_progress FOR UPDATE
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
