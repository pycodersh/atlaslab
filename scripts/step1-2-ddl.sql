-- ============================================================
-- STEP 1: kp_patterns 아카이브
-- ============================================================
ALTER TABLE kp_patterns RENAME TO kp_patterns_archived;

-- ============================================================
-- STEP 2: 기존 kp_episodes 컬럼 추가 + 새 테이블 생성
-- ============================================================

-- 기존 테이블에 컬럼 추가
ALTER TABLE kp_episodes
  ADD COLUMN IF NOT EXISTS location   TEXT,
  ADD COLUMN IF NOT EXISTS characters TEXT[],
  ADD COLUMN IF NOT EXISTS is_free    BOOLEAN DEFAULT false;

-- 씬
CREATE TABLE IF NOT EXISTS kp_scenes (
  id            SERIAL PRIMARY KEY,
  episode_id    INT REFERENCES kp_episodes(id) ON DELETE CASCADE,
  scene_number  INT NOT NULL,
  location_note TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 대사
CREATE TABLE IF NOT EXISTS kp_dialogues (
  id         SERIAL PRIMARY KEY,
  scene_id   INT REFERENCES kp_scenes(id) ON DELETE CASCADE,
  episode_id INT REFERENCES kp_episodes(id) ON DELETE CASCADE,
  speaker    TEXT NOT NULL,
  text_ko    TEXT NOT NULL,
  text_en    TEXT,
  order_num  INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 대사-표현 연결
CREATE TABLE IF NOT EXISTS kp_dialogue_expressions (
  id            SERIAL PRIMARY KEY,
  dialogue_id   INT REFERENCES kp_dialogues(id) ON DELETE CASCADE,
  expression_id INT REFERENCES kp_expressions(id) ON DELETE CASCADE,
  matched_text  TEXT,
  role          TEXT CHECK (role IN ('focus', 'exposure')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 비활성화 (공개 콘텐츠)
ALTER TABLE kp_scenes             DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_dialogues          DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_dialogue_expressions DISABLE ROW LEVEL SECURITY;
