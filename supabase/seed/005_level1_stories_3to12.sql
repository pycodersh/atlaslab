-- PATTO Level 1 Stories 3-12
-- 패턴 11-50을 5개씩 묶어 스토리 10개 구성
-- 예문 없음 — 카드 앞면(패턴명/의미) 노출 검증용

DO $$
DECLARE
  lang_en UUID;

  -- 스토리 UUID
  s03 UUID; s04 UUID; s05 UUID; s06 UUID; s07 UUID;
  s08 UUID; s09 UUID; s10 UUID; s11 UUID; s12 UUID;

  -- 패턴 UUID (order_index 11-50)
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

-- 패턴 ID 조회
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
-- STORIES 3-12
-- ============================================================
INSERT INTO stories (id, language_id, level, order_index, is_published) VALUES
  (gen_random_uuid(), lang_en, 1,  3, true),   -- 일상의 기초
  (gen_random_uuid(), lang_en, 1,  4, true),   -- 계획과 준비
  (gen_random_uuid(), lang_en, 1,  5, true),   -- 생각과 느낌
  (gen_random_uuid(), lang_en, 1,  6, true),   -- 판단과 의견
  (gen_random_uuid(), lang_en, 1,  7, true),   -- 조건과 결과
  (gen_random_uuid(), lang_en, 1,  8, true),   -- 부탁과 제안
  (gen_random_uuid(), lang_en, 1,  9, true),   -- 질문하기
  (gen_random_uuid(), lang_en, 1, 10, true),   -- 감정 표현
  (gen_random_uuid(), lang_en, 1, 11, true),   -- 확신과 망설임
  (gen_random_uuid(), lang_en, 1, 12, true);   -- 나를 돌아보며

-- 스토리 ID 조회
SELECT id INTO s03 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 3;
SELECT id INTO s04 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 4;
SELECT id INTO s05 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 5;
SELECT id INTO s06 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 6;
SELECT id INTO s07 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 7;
SELECT id INTO s08 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 8;
SELECT id INTO s09 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 9;
SELECT id INTO s10 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 10;
SELECT id INTO s11 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 11;
SELECT id INTO s12 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 12;

-- ============================================================
-- STORY TRANSLATIONS
-- ============================================================
INSERT INTO story_translations (story_id, ui_lang, title, description) VALUES
  (s03, 'ko', '일상의 기초',   '매일 쓰는 필수 표현들'),
  (s04, 'ko', '계획과 준비',   '앞으로의 일을 이야기할 때'),
  (s05, 'ko', '생각과 느낌',   '내 생각을 영어로 말하기'),
  (s06, 'ko', '판단과 의견',   '상황을 분석하고 의견 전달하기'),
  (s07, 'ko', '조건과 결과',   '논리적으로 말하는 패턴'),
  (s08, 'ko', '부탁과 제안',   '정중하게 요청하고 제안하기'),
  (s09, 'ko', '질문하기',      '자연스럽게 질문하는 방법'),
  (s10, 'ko', '감정 표현',     '감정을 솔직하게 영어로'),
  (s11, 'ko', '확신과 망설임', '확실할 때와 모를 때 표현'),
  (s12, 'ko', '나를 돌아보며', '습관과 성향을 말하는 패턴');

-- ============================================================
-- STORY PATTERNS (각 스토리에 패턴 5개씩)
-- ============================================================

-- Story 3: 일상의 기초 (p11-15)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s03, p11, 1), (s03, p12, 2), (s03, p13, 3), (s03, p14, 4), (s03, p15, 5);

-- Story 4: 계획과 준비 (p16-20)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s04, p16, 1), (s04, p17, 2), (s04, p18, 3), (s04, p19, 4), (s04, p20, 5);

-- Story 5: 생각과 느낌 (p21-25)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s05, p21, 1), (s05, p22, 2), (s05, p23, 3), (s05, p24, 4), (s05, p25, 5);

-- Story 6: 판단과 의견 (p26-30)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s06, p26, 1), (s06, p27, 2), (s06, p28, 3), (s06, p29, 4), (s06, p30, 5);

-- Story 7: 조건과 결과 (p31-35)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s07, p31, 1), (s07, p32, 2), (s07, p33, 3), (s07, p34, 4), (s07, p35, 5);

-- Story 8: 부탁과 제안 (p36-40)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s08, p36, 1), (s08, p37, 2), (s08, p38, 3), (s08, p39, 4), (s08, p40, 5);

-- Story 9: 질문하기 (p41-45)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s09, p41, 1), (s09, p42, 2), (s09, p43, 3), (s09, p44, 4), (s09, p45, 5);

-- Story 10: 감정 표현 (p46-50)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s10, p46, 1), (s10, p47, 2), (s10, p48, 3), (s10, p49, 4), (s10, p50, 5);

-- Story 11: 확신과 망설임 (p21,p24,p25,p26,p47 — 의견/감정 혼합)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s11, p21, 1), (s11, p24, 2), (s11, p25, 3), (s11, p26, 4), (s11, p47, 5);

-- Story 12: 나를 돌아보며 (p18,p23,p27,p34,p17 — 습관/성향)
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s12, p18, 1), (s12, p23, 2), (s12, p27, 3), (s12, p34, 4), (s12, p17, 5);

END $$;

-- 검증 쿼리
SELECT s.order_index AS story, st.title, COUNT(sp.pattern_id) AS pattern_count
FROM stories s
JOIN story_translations st ON st.story_id = s.id AND st.ui_lang = 'ko'
JOIN story_patterns sp ON sp.story_id = s.id
WHERE s.level = 1
GROUP BY s.order_index, st.title
ORDER BY s.order_index;
