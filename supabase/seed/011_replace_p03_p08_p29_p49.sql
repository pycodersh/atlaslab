-- PATTO Level 1 Top 50 확정 — 패턴 교체
-- 대상: order_index 3, 8, 29, 49
--   #3  There's a chance ~  → I should ~
--   #8  I can't help ~ing   → I'm sorry for ~
--   #29 It's worth ~ing     → I'm trying to ~
--   #49 I'm excited about ~ → I'm glad ~
-- 작업: pattern_translations UPDATE + 기존 examples 삭제 + 신규 examples 삽입

DO $$
DECLARE
  lang_en UUID;
  p03 UUID; p08 UUID; p29 UUID; p49 UUID;
BEGIN
  SELECT id INTO lang_en FROM languages WHERE code = 'en';

  SELECT id INTO p03 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 3;
  SELECT id INTO p08 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 8;
  SELECT id INTO p29 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 29;
  SELECT id INTO p49 FROM patterns WHERE language_id = lang_en AND level = 1 AND order_index = 49;

  -- ============================================================
  -- 1. pattern_translations 교체
  -- ============================================================
  UPDATE pattern_translations SET
    pattern_text = 'I should ~',
    meaning      = '~해야 할 것 같아'
  WHERE pattern_id = p03 AND ui_lang = 'ko';

  UPDATE pattern_translations SET
    pattern_text = 'I''m sorry for ~',
    meaning      = '~해서 미안해'
  WHERE pattern_id = p08 AND ui_lang = 'ko';

  UPDATE pattern_translations SET
    pattern_text = 'I''m trying to ~',
    meaning      = '~하려고 노력 중이야'
  WHERE pattern_id = p29 AND ui_lang = 'ko';

  UPDATE pattern_translations SET
    pattern_text = 'I''m glad ~',
    meaning      = '~해서 기뻐/다행이야'
  WHERE pattern_id = p49 AND ui_lang = 'ko';

  -- ============================================================
  -- 2. 기존 예문 삭제 (example_translations 먼저, 그 다음 examples)
  -- ============================================================
  DELETE FROM example_translations
  WHERE example_id IN (
    SELECT id FROM examples WHERE pattern_id IN (p03, p08, p29, p49)
  );

  DELETE FROM examples WHERE pattern_id IN (p03, p08, p29, p49);

  -- ============================================================
  -- 3. 신규 예문 삽입
  -- ============================================================

  -- P03: I should ~
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p03, 'normal',   1, 'I should probably get some sleep tonight.'),
    (p03, 'normal',   2, 'I should call her back right now.'),
    (p03, 'normal',   3, 'I should eat something before we leave.'),
    (p03, 'normal',   4, 'I should study more for this test.'),
    (p03, 'normal',   5, 'I should apologize for what I said.'),
    (p03, 'advanced', 1, 'I should have told you about this much earlier.'),
    (p03, 'advanced', 2, 'I should reach out to her before things get more awkward.'),
    (p03, 'advanced', 3, 'I should think twice before committing to something like this.'),
    (p03, 'advanced', 4, 'I should be more careful about what I say in front of others.'),
    (p03, 'advanced', 5, 'I should probably set some limits on how much time I spend on this.'),
    (p03, 'native',   1, 'I should''ve just kept my mouth shut — I knew better.'),
    (p03, 'native',   2, 'I should probably stop while I''m ahead — I''m pushing my luck here.'),
    (p03, 'native',   3, 'I should cut him some slack — he''s going through a lot right now.'),
    (p03, 'native',   4, 'I should know better by now, but here we are again.'),
    (p03, 'native',   5, 'I should take a step back before this turns into something bigger.');

  -- P08: I'm sorry for ~
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p08, 'normal',   1, 'I''m sorry for being so late today.'),
    (p08, 'normal',   2, 'I''m sorry for not calling you back.'),
    (p08, 'normal',   3, 'I''m sorry for saying that last night.'),
    (p08, 'normal',   4, 'I''m sorry for missing your message this morning.'),
    (p08, 'normal',   5, 'I''m sorry for making you wait so long.'),
    (p08, 'advanced', 1, 'I''m sorry for snapping at you — I was stressed and took it out on you.'),
    (p08, 'advanced', 2, 'I''m sorry for not being fully present when you needed me most.'),
    (p08, 'advanced', 3, 'I''m sorry for assuming the worst without even hearing your side of things.'),
    (p08, 'advanced', 4, 'I''m sorry for the confusion — I should have been clearer from the beginning.'),
    (p08, 'advanced', 5, 'I''m sorry for dropping the ball on this — I''ll make sure it doesn''t happen again.'),
    (p08, 'native',   1, 'I''m sorry for the way things went down — that was not okay at all.'),
    (p08, 'native',   2, 'I''m sorry for bailing on you like that — you deserved so much better.'),
    (p08, 'native',   3, 'I''m sorry for making you feel like you had to deal with this alone.'),
    (p08, 'native',   4, 'I''m sorry for reading the room wrong — I didn''t mean to push.'),
    (p08, 'native',   5, 'I''m sorry for everything, honestly — I don''t even know where to start.');

  -- P29: I'm trying to ~
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p29, 'normal',   1, 'I''m trying to eat healthier these days.'),
    (p29, 'normal',   2, 'I''m trying to save money this month.'),
    (p29, 'normal',   3, 'I''m trying to get enough sleep lately.'),
    (p29, 'normal',   4, 'I''m trying to learn how to cook.'),
    (p29, 'normal',   5, 'I''m trying to be more patient with everyone.'),
    (p29, 'advanced', 1, 'I''m trying to find a better balance between work and my personal life.'),
    (p29, 'advanced', 2, 'I''m trying to stop taking things personally, but it''s a lot harder than it sounds.'),
    (p29, 'advanced', 3, 'I''m trying to give her the space she needs without feeling shut out.'),
    (p29, 'advanced', 4, 'I''m trying to focus on what I can control instead of everything I can''t.'),
    (p29, 'advanced', 5, 'I''m trying to be honest with myself about whether this is still working for me.'),
    (p29, 'native',   1, 'I''m trying to keep it together, but some days are harder than others.'),
    (p29, 'native',   2, 'I''m trying, and I know it doesn''t look like much from the outside, but I am.'),
    (p29, 'native',   3, 'I''m trying to let it go, but it keeps coming back when I least expect it.'),
    (p29, 'native',   4, 'I''m trying to be the bigger person here — it''s just taking a little longer than expected.'),
    (p29, 'native',   5, 'I''m trying to figure out what I actually want instead of just going through the motions.');

  -- P49: I'm glad ~
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p49, 'normal',   1, 'I''m glad you could make it tonight.'),
    (p49, 'normal',   2, 'I''m glad everything turned out okay in the end.'),
    (p49, 'normal',   3, 'I''m glad we talked about this finally.'),
    (p49, 'normal',   4, 'I''m glad you told me about it.'),
    (p49, 'normal',   5, 'I''m glad I brought an umbrella today.'),
    (p49, 'advanced', 1, 'I''m glad you brought that up — I was wondering how to bring it up myself.'),
    (p49, 'advanced', 2, 'I''m glad we cleared the air before things got more complicated.'),
    (p49, 'advanced', 3, 'I''m glad you had someone to talk to when I wasn''t around.'),
    (p49, 'advanced', 4, 'I''m glad it didn''t turn out the way I thought it would.'),
    (p49, 'advanced', 5, 'I''m glad we decided to try something different instead of sticking with the same approach.'),
    (p49, 'native',   1, 'I''m glad you said that — I was starting to think I was alone on this.'),
    (p49, 'native',   2, 'I''m glad that''s over. I don''t think I could''ve handled one more day of it.'),
    (p49, 'native',   3, 'I''m glad you reached out — I was too stubborn to do it first.'),
    (p49, 'native',   4, 'I''m glad someone finally said it out loud. I''ve been thinking it for weeks.'),
    (p49, 'native',   5, 'I''m glad you''re here. I mean it — it makes a real difference.');

END $$;

-- ============================================================
-- 4. 한국어 번역 삽입
-- ============================================================
INSERT INTO example_translations (example_id, ui_lang, translation)
SELECT e.id, 'ko', t.ko
FROM (VALUES
  -- P03 (I should ~) Normal
  (3, 'normal',   1, '오늘 밤은 좀 자야 할 것 같아.'),
  (3, 'normal',   2, '지금 당장 그녀에게 다시 전화해야 할 것 같아.'),
  (3, 'normal',   3, '출발하기 전에 뭔가 먹어야 할 것 같아.'),
  (3, 'normal',   4, '이 시험을 위해 더 공부해야 할 것 같아.'),
  (3, 'normal',   5, '내가 한 말에 사과해야 할 것 같아.'),
  -- P03 Advanced
  (3, 'advanced', 1, '이걸 훨씬 더 일찍 말해줬어야 했는데.'),
  (3, 'advanced', 2, '더 어색해지기 전에 그녀에게 연락해야 할 것 같아.'),
  (3, 'advanced', 3, '이런 걸 약속하기 전에 두 번은 생각해야 할 것 같아.'),
  (3, 'advanced', 4, '다른 사람들 앞에서 말할 때 더 조심해야 할 것 같아.'),
  (3, 'advanced', 5, '이것에 쓰는 시간에 어느 정도 제한을 둬야 할 것 같아.'),
  -- P03 Native
  (3, 'native',   1, '그냥 입 다물었어야 했어 — 더 잘 알면서.'),
  (3, 'native',   2, '이쯤에서 멈추는 게 좋을 것 같아 — 운을 너무 믿고 있어.'),
  (3, 'native',   3, '그에게 좀 여유를 줘야 할 것 같아 — 지금 많이 힘든 상황이거든.'),
  (3, 'native',   4, '이제는 더 잘 알 때가 됐는데, 또 여기 있네.'),
  (3, 'native',   5, '이게 더 커지기 전에 한발 물러서야 할 것 같아.'),
  -- P08 (I'm sorry for ~) Normal
  (8, 'normal',   1, '오늘 너무 늦어서 미안해.'),
  (8, 'normal',   2, '다시 전화 못 해줘서 미안해.'),
  (8, 'normal',   3, '어젯밤에 그런 말을 해서 미안해.'),
  (8, 'normal',   4, '오늘 아침에 네 메시지를 놓쳐서 미안해.'),
  (8, 'normal',   5, '이렇게 오래 기다리게 해서 미안해.'),
  -- P08 Advanced
  (8, 'advanced', 1, '짜증을 낸 거 미안해 — 스트레스를 너한테 풀었어.'),
  (8, 'advanced', 2, '네가 가장 필요로 할 때 충분히 곁에 있어주지 못해서 미안해.'),
  (8, 'advanced', 3, '네 입장을 듣기도 전에 최악을 가정해서 미안해.'),
  (8, 'advanced', 4, '혼란을 드려서 미안해 — 처음부터 더 명확하게 했어야 했어.'),
  (8, 'advanced', 5, '이 일을 소홀히 해서 미안해 — 다시는 이런 일 없도록 할게.'),
  -- P08 Native
  (8, 'native',   1, '일이 그렇게 된 방식이 미안해 — 그건 진짜 아니었어.'),
  (8, 'native',   2, '그렇게 바람 맞혀서 미안해 — 너는 더 나은 대우를 받아야 했어.'),
  (8, 'native',   3, '이걸 혼자 감당하게 만들어서 미안해.'),
  (8, 'native',   4, '분위기를 잘못 읽어서 미안해 — 억지로 밀어붙이려던 건 아니었어.'),
  (8, 'native',   5, '솔직히 다 미안해 — 어디서부터 시작해야 할지도 모르겠어.'),
  -- P29 (I'm trying to ~) Normal
  (29, 'normal',   1, '요즘 더 건강하게 먹으려고 노력 중이야.'),
  (29, 'normal',   2, '이번 달에 돈을 아끼려고 노력 중이야.'),
  (29, 'normal',   3, '요즘 잠을 충분히 자려고 노력 중이야.'),
  (29, 'normal',   4, '요리를 배우려고 노력 중이야.'),
  (29, 'normal',   5, '모두에게 더 참을성 있게 대하려고 노력 중이야.'),
  -- P29 Advanced
  (29, 'advanced', 1, '일과 개인 생활 사이의 균형을 더 잘 맞추려고 노력 중이야.'),
  (29, 'advanced', 2, '일을 개인적으로 받아들이지 않으려고 노력 중인데, 말처럼 쉽지 않아.'),
  (29, 'advanced', 3, '소외된 느낌 없이 그녀에게 필요한 공간을 주려고 노력 중이야.'),
  (29, 'advanced', 4, '어쩔 수 없는 것 대신 내가 통제할 수 있는 것에 집중하려고 노력 중이야.'),
  (29, 'advanced', 5, '이게 아직도 나한테 맞는 건지 스스로에게 솔직해지려고 노력 중이야.'),
  -- P29 Native
  (29, 'native',   1, '버티려고 노력 중인데, 어떤 날은 다른 날보다 훨씬 힘들어.'),
  (29, 'native',   2, '노력 중이야, 겉에서는 별로 티가 안 나는 거 알아. 그래도 하고 있어.'),
  (29, 'native',   3, '내려놓으려고 노력 중인데, 예상치 못한 순간에 자꾸 다시 떠올라.'),
  (29, 'native',   4, '더 넓은 마음을 갖으려고 노력 중이야 — 예상보다 좀 더 걸리고 있을 뿐이야.'),
  (29, 'native',   5, '그냥 살아지는 대로가 아니라 내가 진짜 원하는 게 뭔지 알아내려고 노력 중이야.'),
  -- P49 (I'm glad ~) Normal
  (49, 'normal',   1, '오늘 밤 올 수 있어서 다행이야.'),
  (49, 'normal',   2, '결국 다 잘 됐다니 다행이야.'),
  (49, 'normal',   3, '드디어 이 얘기를 할 수 있어서 기뻐.'),
  (49, 'normal',   4, '나한테 말해줘서 다행이야.'),
  (49, 'normal',   5, '오늘 우산 챙겨온 게 다행이야.'),
  -- P49 Advanced
  (49, 'advanced', 1, '그 얘기를 꺼내줘서 다행이야 — 나도 어떻게 꺼낼지 고민하고 있었거든.'),
  (49, 'advanced', 2, '더 복잡해지기 전에 오해를 풀 수 있어서 다행이야.'),
  (49, 'advanced', 3, '내가 없을 때 얘기 나눌 사람이 있어서 다행이야.'),
  (49, 'advanced', 4, '생각했던 방향으로 흘러가지 않아서 다행이야.'),
  (49, 'advanced', 5, '같은 방식만 고집하지 않고 다른 걸 시도해보기로 해서 다행이야.'),
  -- P49 Native
  (49, 'native',   1, '네가 그 말을 해줘서 다행이야 — 나만 그렇게 느끼는 줄 알았거든.'),
  (49, 'native',   2, '이게 끝났다니 다행이야. 하루만 더 계속됐어도 못 버텼을 것 같아.'),
  (49, 'native',   3, '네가 먼저 연락해줘서 다행이야 — 나는 고집을 피워서 먼저 못 했을 거야.'),
  (49, 'native',   4, '누군가 드디어 소리 내서 말해줘서 다행이야. 몇 주째 속으로만 생각하고 있었어.'),
  (49, 'native',   5, '네가 여기 있어서 기뻐. 진심이야 — 정말 다르거든.')
) AS t(porder, diff, ord, ko)
JOIN languages l ON l.code = 'en'
JOIN patterns p  ON p.order_index = t.porder AND p.level = 1 AND p.language_id = l.id
JOIN examples e  ON e.pattern_id = p.id
                AND e.difficulty  = t.diff::difficulty_level
                AND e.order_index = t.ord;

-- ============================================================
-- 5. 검증
-- ============================================================
SELECT
  p.order_index,
  pt.pattern_text,
  pt.meaning,
  e.difficulty,
  COUNT(*) AS cnt
FROM patterns p
JOIN pattern_translations pt ON pt.pattern_id = p.id AND pt.ui_lang = 'ko'
JOIN examples e ON e.pattern_id = p.id
WHERE p.level = 1 AND p.order_index IN (3, 8, 29, 49)
GROUP BY p.order_index, pt.pattern_text, pt.meaning, e.difficulty
ORDER BY p.order_index, e.difficulty;
