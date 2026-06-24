-- PATTO Level 1 패턴 50개 전체 정의
-- Seed: 004_level1_50patterns.sql
--
-- order_index 1-10: 002_sample_patterns.sql 에서 이미 삽입됨
-- order_index 11-50: 이 파일에서 삽입
--
-- Category 분류:
--   DC = Daily Conversation
--   PL = Planning
--   OP = Opinion
--   RQ = Request
--   QU = Question
--   EM = Emotion

DO $$
DECLARE
  lang_en UUID;

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
-- PATTERNS 11-50
-- ============================================================
INSERT INTO patterns (id, language_id, level, order_index, is_published) VALUES
  (gen_random_uuid(), lang_en, 1, 11, true),  -- I have to ~           DC
  (gen_random_uuid(), lang_en, 1, 12, true),  -- I don't ~             DC
  (gen_random_uuid(), lang_en, 1, 13, true),  -- Let me ~              DC
  (gen_random_uuid(), lang_en, 1, 14, true),  -- Thank you for ~       DC
  (gen_random_uuid(), lang_en, 1, 15, true),  -- I just ~              DC
  (gen_random_uuid(), lang_en, 1, 16, true),  -- I can ~               DC
  (gen_random_uuid(), lang_en, 1, 17, true),  -- I'm still ~           DC
  (gen_random_uuid(), lang_en, 1, 18, true),  -- I keep ~ing           DC
  (gen_random_uuid(), lang_en, 1, 19, true),  -- I'm about to ~        PL
  (gen_random_uuid(), lang_en, 1, 20, true),  -- I'm supposed to ~     PL
  (gen_random_uuid(), lang_en, 1, 21, true),  -- I'm going to ~        PL
  (gen_random_uuid(), lang_en, 1, 22, true),  -- I'm going to try ~    PL
  (gen_random_uuid(), lang_en, 1, 23, true),  -- I've been ~ing        PL
  (gen_random_uuid(), lang_en, 1, 24, true),  -- I think ~             OP
  (gen_random_uuid(), lang_en, 1, 25, true),  -- I feel like ~         OP
  (gen_random_uuid(), lang_en, 1, 26, true),  -- I'm not sure ~        OP
  (gen_random_uuid(), lang_en, 1, 27, true),  -- I tend to ~           OP
  (gen_random_uuid(), lang_en, 1, 28, true),  -- It depends on ~       OP
  (gen_random_uuid(), lang_en, 1, 29, true),  -- It's worth ~ing       OP
  (gen_random_uuid(), lang_en, 1, 30, true),  -- Even though ~         OP
  (gen_random_uuid(), lang_en, 1, 31, true),  -- As long as ~          OP
  (gen_random_uuid(), lang_en, 1, 32, true),  -- No wonder ~           OP
  (gen_random_uuid(), lang_en, 1, 33, true),  -- I'd rather ~          OP
  (gen_random_uuid(), lang_en, 1, 34, true),  -- I ended up ~ing       OP
  (gen_random_uuid(), lang_en, 1, 35, true),  -- Can you ~?            RQ
  (gen_random_uuid(), lang_en, 1, 36, true),  -- Could you ~?          RQ
  (gen_random_uuid(), lang_en, 1, 37, true),  -- I'd like to ~         RQ
  (gen_random_uuid(), lang_en, 1, 38, true),  -- Why don't we ~?       RQ
  (gen_random_uuid(), lang_en, 1, 39, true),  -- Would you mind ~ing?  RQ
  (gen_random_uuid(), lang_en, 1, 40, true),  -- Is it okay if ~?      RQ
  (gen_random_uuid(), lang_en, 1, 41, true),  -- Make sure ~           RQ
  (gen_random_uuid(), lang_en, 1, 42, true),  -- Do you ~?             QU
  (gen_random_uuid(), lang_en, 1, 43, true),  -- Have you ever ~?      QU
  (gen_random_uuid(), lang_en, 1, 44, true),  -- Do you know ~?        QU
  (gen_random_uuid(), lang_en, 1, 45, true),  -- What if ~?            QU
  (gen_random_uuid(), lang_en, 1, 46, true),  -- What do you think about ~? QU
  (gen_random_uuid(), lang_en, 1, 47, true),  -- I wonder ~            QU
  (gen_random_uuid(), lang_en, 1, 48, true),  -- I can't wait to ~     EM
  (gen_random_uuid(), lang_en, 1, 49, true),  -- I'm excited about ~   EM
  (gen_random_uuid(), lang_en, 1, 50, true);  -- I'm worried about ~   EM

-- ID 조회
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
-- PATTERN TRANSLATIONS (한국어)
-- ============================================================
INSERT INTO pattern_translations (pattern_id, ui_lang, pattern_text, meaning) VALUES
  (p11, 'ko', 'I have to ~',              '~해야 해'),
  (p12, 'ko', 'I don''t ~',               '~하지 않아'),
  (p13, 'ko', 'Let me ~',                 '내가 ~할게'),
  (p14, 'ko', 'Thank you for ~',          '~해줘서 고마워'),
  (p15, 'ko', 'I just ~',                 '방금 ~/그냥 ~'),
  (p16, 'ko', 'I can ~',                  '~할 수 있어'),
  (p17, 'ko', 'I''m still ~',             '아직도 ~해'),
  (p18, 'ko', 'I keep ~ing',              '자꾸 ~하게 돼'),
  (p19, 'ko', 'I''m about to ~',          '막 ~하려던 참이야'),
  (p20, 'ko', 'I''m supposed to ~',       '~하기로 되어 있어'),
  (p21, 'ko', 'I''m going to ~',          '~할 거야'),
  (p22, 'ko', 'I''m going to try ~',      '~해볼 거야'),
  (p23, 'ko', 'I''ve been ~ing',          '계속 ~하고 있어'),
  (p24, 'ko', 'I think ~',               '~인 것 같아'),
  (p25, 'ko', 'I feel like ~',            '~인 느낌이야'),
  (p26, 'ko', 'I''m not sure ~',          '~인지 모르겠어'),
  (p27, 'ko', 'I tend to ~',              '~하는 경향이 있어'),
  (p28, 'ko', 'It depends on ~',          '~에 달려있어'),
  (p29, 'ko', 'It''s worth ~ing',         '~할 가치가 있어'),
  (p30, 'ko', 'Even though ~',            '~이지만 / ~임에도 불구하고'),
  (p31, 'ko', 'As long as ~',             '~하는 한 / ~이기만 하면'),
  (p32, 'ko', 'No wonder ~',              '~이니 당연하지'),
  (p33, 'ko', 'I''d rather ~',            '차라리 ~하겠어'),
  (p34, 'ko', 'I ended up ~ing',          '결국 ~하게 됐어'),
  (p35, 'ko', 'Can you ~?',              '~해줄 수 있어?'),
  (p36, 'ko', 'Could you ~?',            '~해주실 수 있나요?'),
  (p37, 'ko', 'I''d like to ~',           '~하고 싶은데요'),
  (p38, 'ko', 'Why don''t we ~?',         '우리 ~하는 게 어때?'),
  (p39, 'ko', 'Would you mind ~ing?',     '~해줄 수 있어요?'),
  (p40, 'ko', 'Is it okay if ~?',         '~해도 괜찮아?'),
  (p41, 'ko', 'Make sure ~',              '꼭 ~해'),
  (p42, 'ko', 'Do you ~?',               '~해?'),
  (p43, 'ko', 'Have you ever ~?',         '~해본 적 있어?'),
  (p44, 'ko', 'Do you know ~?',           '~알아?'),
  (p45, 'ko', 'What if ~?',              '~하면 어떨까?'),
  (p46, 'ko', 'What do you think about ~?', '~에 대해 어떻게 생각해?'),
  (p47, 'ko', 'I wonder ~',              '~인지 궁금해'),
  (p48, 'ko', 'I can''t wait to ~',       '~하는 게 너무 기대돼'),
  (p49, 'ko', 'I''m excited about ~',     '~가 정말 기대돼'),
  (p50, 'ko', 'I''m worried about ~',     '~가 걱정돼');

END $$;
