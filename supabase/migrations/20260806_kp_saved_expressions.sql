-- kp_saved_expressions: 사용자 북마크 표현 저장 (로그인 사용자 전용)
-- 병합 정책: localStorage ∪ DB → DB에 업서트, 이후 DB 우선 읽기

CREATE TABLE IF NOT EXISTS kp_saved_expressions (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expression_id INT  NOT NULL REFERENCES kp_expressions(id) ON DELETE CASCADE,
  saved_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, expression_id)
);

ALTER TABLE kp_saved_expressions ENABLE ROW LEVEL SECURITY;

-- 본인 행만 SELECT
CREATE POLICY "kp_se_select" ON kp_saved_expressions
  FOR SELECT USING (auth.uid() = user_id);

-- 본인으로만 INSERT
CREATE POLICY "kp_se_insert" ON kp_saved_expressions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인 행만 DELETE
CREATE POLICY "kp_se_delete" ON kp_saved_expressions
  FOR DELETE USING (auth.uid() = user_id);
