-- STEP 1: kp_expressions 테이블 생성 + kp_bubbles에 expression_id 컬럼 추가
-- Supabase 대시보드 > SQL Editor에서 실행하세요.

CREATE TABLE IF NOT EXISTS kp_expressions (
  id            SERIAL PRIMARY KEY,
  korean        TEXT NOT NULL,
  english       TEXT NOT NULL,
  description   TEXT,
  structure     TEXT,
  category      TEXT,
  examples      JSONB,
  tip           TEXT,
  first_episode INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE kp_bubbles
ADD COLUMN IF NOT EXISTS expression_id INT REFERENCES kp_expressions(id);
