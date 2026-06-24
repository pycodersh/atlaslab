-- Migration: 006_rearrange_story_patterns.sql
-- Story 1~10 패턴 재배치 + 제목/설명 업데이트
-- Story 11~12 (복습 스토리)는 변경 없음

DO $$
DECLARE
  lang_en UUID;

  s01 UUID; s02 UUID; s03 UUID; s04 UUID; s05 UUID;
  s06 UUID; s07 UUID; s08 UUID; s09 UUID; s10 UUID;

  p01 UUID; p02 UUID; p03 UUID; p04 UUID; p05 UUID;
  p06 UUID; p07 UUID; p08 UUID; p09 UUID; p10 UUID;
  p11 UUID; p12 UUID; p13 UUID; p14 UUID; p15 UUID;
  p16 UUID; p17 UUID; p18 UUID; p19 UUID; p20 UUID;
  p21 UUID; p22 UUID; p23 UUID; p24 UUID; p25 UUID;
  p26 UUID; p27 UUID; p28 UUID; p29 UUID; p30 UUID;
  p31 UUID; p32 UUID; p33 UUID; p34 UUID; p35 UUID;
  p36 UUID; p37 UUID; p38 UUID; p39 UUID; p40 UUID;
  p41 UUID; p42 UUID; p43 UUID; p44 UUID; p45 UUID;
  p46 UUID; p47 UUID; p48 UUID; p49 UUID; p50 UUID;
BEGIN

SELECT id INTO lang_en FROM languages WHERE code = 'en';

-- ============================================================
-- Story ID 조회
-- ============================================================
SELECT id INTO s01 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 1;
SELECT id INTO s02 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 2;
SELECT id INTO s03 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 3;
SELECT id INTO s04 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 4;
SELECT id INTO s05 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 5;
SELECT id INTO s06 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 6;
SELECT id INTO s07 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 7;
SELECT id INTO s08 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 8;
SELECT id INTO s09 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 9;
SELECT id INTO s10 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 10;

-- ============================================================
-- Pattern ID 조회
-- ============================================================
SELECT id INTO p01 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 1;
SELECT id INTO p02 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 2;
SELECT id INTO p03 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 3;
SELECT id INTO p04 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 4;
SELECT id INTO p05 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 5;
SELECT id INTO p06 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 6;
SELECT id INTO p07 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 7;
SELECT id INTO p08 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 8;
SELECT id INTO p09 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 9;
SELECT id INTO p10 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 10;
SELECT id INTO p11 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 11;
SELECT id INTO p12 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 12;
SELECT id INTO p13 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 13;
SELECT id INTO p14 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 14;
SELECT id INTO p15 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 15;
SELECT id INTO p16 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 16;
SELECT id INTO p17 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 17;
SELECT id INTO p18 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 18;
SELECT id INTO p19 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 19;
SELECT id INTO p20 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 20;
SELECT id INTO p21 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 21;
SELECT id INTO p22 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 22;
SELECT id INTO p23 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 23;
SELECT id INTO p24 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 24;
SELECT id INTO p25 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 25;
SELECT id INTO p26 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 26;
SELECT id INTO p27 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 27;
SELECT id INTO p28 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 28;
SELECT id INTO p29 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 29;
SELECT id INTO p30 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 30;
SELECT id INTO p31 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 31;
SELECT id INTO p32 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 32;
SELECT id INTO p33 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 33;
SELECT id INTO p34 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 34;
SELECT id INTO p35 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 35;
SELECT id INTO p36 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 36;
SELECT id INTO p37 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 37;
SELECT id INTO p38 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 38;
SELECT id INTO p39 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 39;
SELECT id INTO p40 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 40;
SELECT id INTO p41 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 41;
SELECT id INTO p42 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 42;
SELECT id INTO p43 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 43;
SELECT id INTO p44 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 44;
SELECT id INTO p45 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 45;
SELECT id INTO p46 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 46;
SELECT id INTO p47 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 47;
SELECT id INTO p48 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 48;
SELECT id INTO p49 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 49;
SELECT id INTO p50 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 50;

-- ============================================================
-- 기존 story_patterns 삭제 (Story 1~10)
-- ============================================================
DELETE FROM story_patterns
WHERE story_id IN (s01,s02,s03,s04,s05,s06,s07,s08,s09,s10);

-- ============================================================
-- Story 제목/설명 업데이트
-- ============================================================
UPDATE story_translations SET
  title = '일상 표현',
  description = '하루 일상에서 가장 자주 쓰는 기초 패턴'
WHERE story_id = s01 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '계획과 의도',
  description = '앞으로 할 일을 영어로 말하는 패턴'
WHERE story_id = s02 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '대화와 소통',
  description = '자연스러운 일상 대화를 위한 표현'
WHERE story_id = s03 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '질문하기',
  description = '경험, 사실, 의견을 묻는 질문 패턴'
WHERE story_id = s04 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '일정과 습관',
  description = '반복되는 일정과 나의 습관을 말하기'
WHERE story_id = s05 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '감정 표현',
  description = '기대, 흥분, 걱정을 솔직하게 표현하기'
WHERE story_id = s06 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '생각 말하기',
  description = '추측, 느낌, 확신의 정도를 표현하기'
WHERE story_id = s07 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '부탁하기',
  description = '정중하게 요청하고 허락을 구하는 패턴'
WHERE story_id = s08 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '설명과 논리',
  description = '이유, 가능성, 결과를 논리적으로 말하기'
WHERE story_id = s09 AND ui_lang = 'ko';

UPDATE story_translations SET
  title = '심화 표현',
  description = '경향, 가치, 조건을 담은 고급 패턴'
WHERE story_id = s10 AND ui_lang = 'ko';

-- ============================================================
-- 새 story_patterns 삽입
-- ============================================================

-- Story 1 ⭐  Daily Life: #1 #11 #12 #15 #16
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s01, p01, 1), (s01, p11, 2), (s01, p12, 3), (s01, p15, 4), (s01, p16, 5);

-- Story 2 ⭐  Planning: #2 #6 #19 #21 #22
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s02, p02, 1), (s02, p06, 2), (s02, p19, 3), (s02, p21, 4), (s02, p22, 5);

-- Story 3 ⭐⭐ Social: #13 #14 #32 #38 #41
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s03, p13, 1), (s03, p14, 2), (s03, p32, 3), (s03, p38, 4), (s03, p41, 5);

-- Story 4 ⭐⭐ Question: #42 #43 #44 #45 #46
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s04, p42, 1), (s04, p43, 2), (s04, p44, 3), (s04, p45, 4), (s04, p46, 5);

-- Story 5 ⭐⭐ Habits: #7 #17 #18 #20 #23
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s05, p07, 1), (s05, p17, 2), (s05, p18, 3), (s05, p20, 4), (s05, p23, 5);

-- Story 6 ⭐⭐ Emotion: #8 #10 #48 #49 #50
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s06, p08, 1), (s06, p10, 2), (s06, p48, 3), (s06, p49, 4), (s06, p50, 5);

-- Story 7 ⭐⭐ Opinion: #9 #24 #25 #26 #47
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s07, p09, 1), (s07, p24, 2), (s07, p25, 3), (s07, p26, 4), (s07, p47, 5);

-- Story 8 ⭐⭐ Request: #35 #36 #37 #39 #40
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s08, p35, 1), (s08, p36, 2), (s08, p37, 3), (s08, p39, 4), (s08, p40, 5);

-- Story 9 ⭐⭐⭐ Reasoning: #3 #4 #5 #28 #34
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s09, p03, 1), (s09, p04, 2), (s09, p05, 3), (s09, p28, 4), (s09, p34, 5);

-- Story 10 ⭐⭐⭐ Advanced: #27 #29 #30 #31 #33
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s10, p27, 1), (s10, p29, 2), (s10, p30, 3), (s10, p31, 4), (s10, p33, 5);

END $$;

-- ============================================================
-- 검증 쿼리
-- ============================================================
SELECT
  s.order_index   AS story,
  st.title,
  COUNT(sp.id)    AS pattern_count,
  STRING_AGG('#' || p.order_index || ' ' || pt.pattern_text, ' / ' ORDER BY sp.order_index) AS patterns
FROM stories s
JOIN story_translations st ON st.story_id = s.id AND st.ui_lang = 'ko'
JOIN story_patterns sp     ON sp.story_id = s.id
JOIN patterns p            ON p.id = sp.pattern_id
JOIN pattern_translations pt ON pt.pattern_id = p.id AND pt.ui_lang = 'ko'
WHERE s.level = 1
GROUP BY s.order_index, st.title
ORDER BY s.order_index;
