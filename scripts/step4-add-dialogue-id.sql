-- kp_bubbles에 dialogue_id 컬럼 추가
ALTER TABLE kp_bubbles
  ADD COLUMN IF NOT EXISTS dialogue_id INTEGER REFERENCES kp_dialogues(id) ON DELETE SET NULL;

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_kp_bubbles_dialogue_id ON kp_bubbles(dialogue_id);
