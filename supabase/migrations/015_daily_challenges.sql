-- Daily Challenges: 사용자가 세션 완료 후 푼 챌린지 기록
CREATE TABLE IF NOT EXISTS daily_challenges (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id        INTEGER     NOT NULL,
  challenge_type  TEXT        NOT NULL CHECK (challenge_type IN ('complete','translate','make_your_own','story_recall')),
  user_answer     TEXT        NOT NULL DEFAULT '',
  is_correct      BOOLEAN,        -- NULL for translate / make_your_own
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS daily_challenges_user_id_idx ON daily_challenges (user_id);
CREATE INDEX IF NOT EXISTS daily_challenges_created_at_idx ON daily_challenges (user_id, created_at DESC);

-- RLS: 본인 행만 접근
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own challenges"
  ON daily_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own challenges"
  ON daily_challenges FOR SELECT
  USING (auth.uid() = user_id);
