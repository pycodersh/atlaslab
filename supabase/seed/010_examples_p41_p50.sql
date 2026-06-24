-- PATTO 예문 Seed: 패턴 41~50
-- 패턴당 Normal 5 / Advanced 5 / Native 5 = 15개
-- 총 150개 예문 + 150개 한국어 번역

DO $$
DECLARE
  lang_en UUID;
  p41 UUID; p42 UUID; p43 UUID; p44 UUID; p45 UUID;
  p46 UUID; p47 UUID; p48 UUID; p49 UUID; p50 UUID;
BEGIN
  SELECT id INTO lang_en FROM languages WHERE code = 'en';

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
  -- P41: Make sure ~  (꼭 ~해)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p41, 'normal',   1, 'Make sure you lock the door before you leave.'),
    (p41, 'normal',   2, 'Make sure you eat breakfast this morning.'),
    (p41, 'normal',   3, 'Make sure you bring your ID with you.'),
    (p41, 'normal',   4, 'Make sure you call me when you get there.'),
    (p41, 'normal',   5, 'Make sure you drink enough water throughout the day.'),
    (p41, 'advanced', 1, 'Make sure you read through the whole contract before you sign anything.'),
    (p41, 'advanced', 2, 'Make sure everyone is on the same page before the meeting starts.'),
    (p41, 'advanced', 3, 'Make sure you back up your files before you update the system.'),
    (p41, 'advanced', 4, 'Make sure you get enough rest — you have a big day tomorrow.'),
    (p41, 'advanced', 5, 'Make sure you double-check the time zone before you send out the invites.'),
    (p41, 'native',   1, 'Make sure you actually mean it before you say it — words stick.'),
    (p41, 'native',   2, 'Make sure you take care of yourself too, not just everyone else.'),
    (p41, 'native',   3, 'Make sure you charge your phone before you leave — don''t be that person.'),
    (p41, 'native',   4, 'Make sure you''re doing this for the right reasons, not just to prove a point.'),
    (p41, 'native',   5, 'Make sure you get the last word in — I know how important that is to you.');

  -- ============================================================
  -- P42: Do you ~?  (~해?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p42, 'normal',   1, 'Do you want to grab some coffee?'),
    (p42, 'normal',   2, 'Do you remember where we parked the car?'),
    (p42, 'normal',   3, 'Do you know how to get there?'),
    (p42, 'normal',   4, 'Do you have any plans for tonight?'),
    (p42, 'normal',   5, 'Do you need help carrying all of that?'),
    (p42, 'advanced', 1, 'Do you ever feel like you''re the only one who notices these things?'),
    (p42, 'advanced', 2, 'Do you mind if I ask what made you change your mind?'),
    (p42, 'advanced', 3, 'Do you think there''s a way we can fix this without starting over?'),
    (p42, 'advanced', 4, 'Do you find it hard to focus when there''s too much going on at once?'),
    (p42, 'advanced', 5, 'Do you ever wonder if things would have turned out differently?'),
    (p42, 'native',   1, 'Do you ever just sit back and think about how wild life actually is?'),
    (p42, 'native',   2, 'Do you realize what you just said? Because I''m not sure you do.'),
    (p42, 'native',   3, 'Do you always do this, or am I just lucky enough to catch it today?'),
    (p42, 'native',   4, 'Do you have any idea how long I''ve been waiting for this moment?'),
    (p42, 'native',   5, 'Do you want the honest answer, or the one that makes you feel better?');

  -- ============================================================
  -- P43: Have you ever ~?  (~해본 적 있어?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p43, 'normal',   1, 'Have you ever tried making sushi at home?'),
    (p43, 'normal',   2, 'Have you ever been to a live concert?'),
    (p43, 'normal',   3, 'Have you ever stayed up all night for an exam?'),
    (p43, 'normal',   4, 'Have you ever traveled abroad completely on your own?'),
    (p43, 'normal',   5, 'Have you ever met someone really famous in person?'),
    (p43, 'advanced', 1, 'Have you ever had a conversation that completely changed the way you see something?'),
    (p43, 'advanced', 2, 'Have you ever said something in the heat of the moment and immediately regretted it?'),
    (p43, 'advanced', 3, 'Have you ever worked so hard on something only to have it fall through at the end?'),
    (p43, 'advanced', 4, 'Have you ever gone back to a childhood place and felt completely different about it?'),
    (p43, 'advanced', 5, 'Have you ever given someone a second chance and actually been glad that you did?'),
    (p43, 'native',   1, 'Have you ever just skipped a social event and felt absolutely zero guilt about it?'),
    (p43, 'native',   2, 'Have you ever been so tired you couldn''t even figure out what you were tired of?'),
    (p43, 'native',   3, 'Have you ever laughed so hard you couldn''t breathe and then forgot what was even funny?'),
    (p43, 'native',   4, 'Have you ever wanted to say something so badly but bit your tongue at the last second?'),
    (p43, 'native',   5, 'Have you ever met someone for five minutes and felt like you''d known them your whole life?');

  -- ============================================================
  -- P44: Do you know ~?  (~알아?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p44, 'normal',   1, 'Do you know where the bathroom is?'),
    (p44, 'normal',   2, 'Do you know what time the store closes?'),
    (p44, 'normal',   3, 'Do you know how to get to the station?'),
    (p44, 'normal',   4, 'Do you know her phone number by any chance?'),
    (p44, 'normal',   5, 'Do you know a good place to eat around here?'),
    (p44, 'advanced', 1, 'Do you know why she''s been so quiet lately? I''m starting to get worried.'),
    (p44, 'advanced', 2, 'Do you know if there''s a way to fix this without involving anyone else?'),
    (p44, 'advanced', 3, 'Do you know how long it''s been since we last did something like this?'),
    (p44, 'advanced', 4, 'Do you know what actually happened at the end of the meeting? I had to leave.'),
    (p44, 'advanced', 5, 'Do you know anyone who might be able to help with something like this?'),
    (p44, 'native',   1, 'Do you know how good that sounds right now? I''m absolutely starving.'),
    (p44, 'native',   2, 'Do you know what gets me? It''s not what she said — it''s how she said it.'),
    (p44, 'native',   3, 'Do you know how rare it is to find someone who actually gets you like that?'),
    (p44, 'native',   4, 'Do you know what I think? I think you already know the answer to this one.'),
    (p44, 'native',   5, 'Do you know how long I''ve been trying to say this? Just... thank you.');

  -- ============================================================
  -- P45: What if ~?  (~하면 어떨까?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p45, 'normal',   1, 'What if we try a different approach?'),
    (p45, 'normal',   2, 'What if I can''t make it in time?'),
    (p45, 'normal',   3, 'What if we leave a little earlier today?'),
    (p45, 'normal',   4, 'What if she actually says no to this?'),
    (p45, 'normal',   5, 'What if we split the bill this time?'),
    (p45, 'advanced', 1, 'What if we look at this from a completely different angle?'),
    (p45, 'advanced', 2, 'What if the problem isn''t the plan but the way we''re executing it?'),
    (p45, 'advanced', 3, 'What if we give it one more week before making any final calls?'),
    (p45, 'advanced', 4, 'What if I told you the reason this isn''t working has nothing to do with skill?'),
    (p45, 'advanced', 5, 'What if we each wrote down our concerns first before we started talking?'),
    (p45, 'native',   1, 'What if I told you I''ve been thinking about this for way longer than you know?'),
    (p45, 'native',   2, 'What if we just stopped overthinking it and actually did the thing?'),
    (p45, 'native',   3, 'What if this is actually the best thing that could''ve happened to us?'),
    (p45, 'native',   4, 'What if nobody''s actually right here and we''re all just missing the point?'),
    (p45, 'native',   5, 'What if the worst-case scenario isn''t actually that bad when you think about it?');

  -- ============================================================
  -- P46: What do you think about ~?  (~에 대해 어떻게 생각해?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p46, 'normal',   1, 'What do you think about the new menu?'),
    (p46, 'normal',   2, 'What do you think about going there this weekend?'),
    (p46, 'normal',   3, 'What do you think about her idea?'),
    (p46, 'normal',   4, 'What do you think about taking a short break?'),
    (p46, 'normal',   5, 'What do you think about the new place?'),
    (p46, 'advanced', 1, 'What do you think about bringing someone in from outside to get a fresh perspective?'),
    (p46, 'advanced', 2, 'What do you think about the way things have been going between the two of them lately?'),
    (p46, 'advanced', 3, 'What do you think about pushing the deadline back by just a few days?'),
    (p46, 'advanced', 4, 'What do you think about trying to sort this out before we bring anyone else in?'),
    (p46, 'advanced', 5, 'What do you think about what she said in the meeting today? I couldn''t read her at all.'),
    (p46, 'native',   1, 'What do you think about that? And please be honest — I can handle it.'),
    (p46, 'native',   2, 'What do you think about us just being upfront with each other from now on?'),
    (p46, 'native',   3, 'What do you think about all of this? Because I genuinely have no idea anymore.'),
    (p46, 'native',   4, 'What do you think about taking a step back before this goes any further?'),
    (p46, 'native',   5, 'What do you think about the whole thing? I don''t want to put words in your mouth.');

  -- ============================================================
  -- P47: I wonder ~  (~인지 궁금해)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p47, 'normal',   1, 'I wonder what she''s doing right now.'),
    (p47, 'normal',   2, 'I wonder if it will rain today.'),
    (p47, 'normal',   3, 'I wonder why he didn''t come today.'),
    (p47, 'normal',   4, 'I wonder if there''s a faster way to do this.'),
    (p47, 'normal',   5, 'I wonder what that place is actually like.'),
    (p47, 'advanced', 1, 'I wonder if she knows how much that one comment actually meant to me.'),
    (p47, 'advanced', 2, 'I wonder what things would have been like if I''d made a different choice back then.'),
    (p47, 'advanced', 3, 'I wonder if he said something like that to everyone or just to me specifically.'),
    (p47, 'advanced', 4, 'I wonder what they were really thinking when they made that decision.'),
    (p47, 'advanced', 5, 'I wonder if we''ll look back on this and think we were worried over nothing.'),
    (p47, 'native',   1, 'I wonder if they even realize how that came across. Probably not.'),
    (p47, 'native',   2, 'I wonder what life would look like if I''d just said yes that one time.'),
    (p47, 'native',   3, 'I wonder if it ever bothers them, or if they''ve just gotten used to it by now.'),
    (p47, 'native',   4, 'I wonder why it''s always the smallest things that end up hitting the hardest.'),
    (p47, 'native',   5, 'I wonder what she thinks when she sees my name come up. Probably nothing.');

  -- ============================================================
  -- P48: I can't wait to ~  (~하는 게 너무 기대돼)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p48, 'normal',   1, 'I can''t wait to see you again.'),
    (p48, 'normal',   2, 'I can''t wait to try that restaurant.'),
    (p48, 'normal',   3, 'I can''t wait to get home tonight.'),
    (p48, 'normal',   4, 'I can''t wait to open my present.'),
    (p48, 'normal',   5, 'I can''t wait to meet your family.'),
    (p48, 'advanced', 1, 'I can''t wait to finally have some time to myself after this crazy week.'),
    (p48, 'advanced', 2, 'I can''t wait to see how she reacts when she finds out about the surprise.'),
    (p48, 'advanced', 3, 'I can''t wait to get started on this — I''ve had the idea in my head for weeks.'),
    (p48, 'advanced', 4, 'I can''t wait to show you what I''ve been working on all this time.'),
    (p48, 'advanced', 5, 'I can''t wait to be done with this chapter and start something completely new.'),
    (p48, 'native',   1, 'I can''t wait to get out of this city for a few days and just breathe.'),
    (p48, 'native',   2, 'I can''t wait for you to try this — you are going to lose your mind.'),
    (p48, 'native',   3, 'I can''t wait for it to just be over so we can all finally move on.'),
    (p48, 'native',   4, 'I can''t wait to look back on this and realize it was all worth it.'),
    (p48, 'native',   5, 'I can''t wait to tell her — she is going to absolutely freak out.');

  -- ============================================================
  -- P49: I'm excited about ~  (~가 정말 기대돼)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p49, 'normal',   1, 'I''m excited about the trip next week.'),
    (p49, 'normal',   2, 'I''m excited about starting my new job.'),
    (p49, 'normal',   3, 'I''m excited about trying something from the new menu.'),
    (p49, 'normal',   4, 'I''m excited about finally meeting everyone tonight.'),
    (p49, 'normal',   5, 'I''m excited about the concert this Saturday.'),
    (p49, 'advanced', 1, 'I''m excited about the direction we''re heading — it finally feels like things are clicking.'),
    (p49, 'advanced', 2, 'I''m excited about this project even though I know it''s going to be a lot of work.'),
    (p49, 'advanced', 3, 'I''m excited about the changes, but I''m also a little nervous about what''s ahead.'),
    (p49, 'advanced', 4, 'I''m excited about seeing how far we''ve come when we look back a year from now.'),
    (p49, 'advanced', 5, 'I''m excited about working with people who actually care about what they''re doing.'),
    (p49, 'native',   1, 'I''m excited about this in a way I haven''t felt in a really long time.'),
    (p49, 'native',   2, 'I''m excited about it, but I''m also trying not to hype it up too much.'),
    (p49, 'native',   3, 'I''m excited about seeing you — I''ve been looking forward to this all week.'),
    (p49, 'native',   4, 'I''m excited about what''s next — I feel like something good is finally coming.'),
    (p49, 'native',   5, 'I''m excited about all of it, honestly — I just don''t want to jinx it.');

  -- ============================================================
  -- P50: I'm worried about ~  (~가 걱정돼)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p50, 'normal',   1, 'I''m worried about the big exam tomorrow.'),
    (p50, 'normal',   2, 'I''m worried about her — she hasn''t been herself lately.'),
    (p50, 'normal',   3, 'I''m worried about being late for the meeting.'),
    (p50, 'normal',   4, 'I''m worried about the weather this weekend.'),
    (p50, 'normal',   5, 'I''m worried about running out of time.'),
    (p50, 'advanced', 1, 'I''m worried about how things are going to play out if we don''t address this soon.'),
    (p50, 'advanced', 2, 'I''m worried about him — he''s been quiet in a way that doesn''t feel like his usual quiet.'),
    (p50, 'advanced', 3, 'I''m worried about putting too much pressure on something that''s only just started.'),
    (p50, 'advanced', 4, 'I''m worried about setting a precedent we won''t be able to walk back later.'),
    (p50, 'advanced', 5, 'I''m worried about getting my hopes up only to be disappointed all over again.'),
    (p50, 'native',   1, 'I''m worried about this in a way that''s hard to explain — it just doesn''t feel right.'),
    (p50, 'native',   2, 'I''m worried about her, but every time I bring it up she shuts it right down.'),
    (p50, 'native',   3, 'I''m probably worried about nothing — but I can''t seem to stop overthinking it.'),
    (p50, 'native',   4, 'I''m worried about what comes after — the thing itself I can handle, it''s the aftermath.'),
    (p50, 'native',   5, 'I''m worried about saying the wrong thing and making everything worse than it already is.');

END $$;

-- ============================================================
-- 한국어 번역 삽입
-- ============================================================
INSERT INTO example_translations (example_id, ui_lang, translation)
SELECT e.id, 'ko', t.ko
FROM (VALUES
  -- P41 Normal
  (41, 'normal',   1, '나가기 전에 꼭 문을 잠가.'),
  (41, 'normal',   2, '오늘 아침은 꼭 아침밥 먹어.'),
  (41, 'normal',   3, '신분증 꼭 챙겨.'),
  (41, 'normal',   4, '도착하면 꼭 나한테 전화해.'),
  (41, 'normal',   5, '하루 종일 물 꼭 충분히 마셔.'),
  -- P41 Advanced
  (41, 'advanced', 1, '서명하기 전에 계약서 전체를 꼭 꼼꼼히 읽어.'),
  (41, 'advanced', 2, '회의 시작 전에 모두가 같은 내용을 공유하고 있는지 꼭 확인해.'),
  (41, 'advanced', 3, '시스템 업데이트하기 전에 파일을 꼭 백업해둬.'),
  (41, 'advanced', 4, '꼭 충분히 쉬어 — 내일 중요한 날이잖아.'),
  (41, 'advanced', 5, '초대장 보내기 전에 시간대를 꼭 다시 확인해.'),
  -- P41 Native
  (41, 'native',   1, '말하기 전에 진심인지 꼭 확인해 — 말은 기억에 남거든.'),
  (41, 'native',   2, '다른 사람만 챙기지 말고 꼭 너 자신도 챙겨.'),
  (41, 'native',   3, '나가기 전에 꼭 폰 충전해 — 그런 상황 만들지 마.'),
  (41, 'native',   4, '뭔가를 증명하려는 게 아니라 올바른 이유로 하는 건지 꼭 확인해.'),
  (41, 'native',   5, '꼭 마지막 말은 네가 해 — 그게 너한테 얼마나 중요한지 알아.'),
  -- P42 Normal
  (42, 'normal',   1, '커피 한잔 할래?'),
  (42, 'normal',   2, '우리 어디에 주차했는지 기억해?'),
  (42, 'normal',   3, '거기 가는 방법 알아?'),
  (42, 'normal',   4, '오늘 밤에 뭔가 계획 있어?'),
  (42, 'normal',   5, '그거 다 들고 오는 데 도움 필요해?'),
  -- P42 Advanced
  (42, 'advanced', 1, '이런 걸 알아채는 사람이 나뿐인 것 같은 느낌 들 때 있어?'),
  (42, 'advanced', 2, '생각을 바꾸게 된 계기가 뭔지 여쭤봐도 될까요?'),
  (42, 'advanced', 3, '처음부터 다시 시작하지 않고도 이걸 고칠 방법이 있을 것 같아?'),
  (42, 'advanced', 4, '한꺼번에 너무 많은 일이 있을 때 집중하기 어렵지 않아?'),
  (42, 'advanced', 5, '결과가 달라졌을 수도 있었을까 하는 생각 해본 적 있어?'),
  -- P42 Native
  (42, 'native',   1, '가끔 그냥 물러서서 인생이 얼마나 황당한지 실감할 때 있어?'),
  (42, 'native',   2, '방금 무슨 말을 한 건지 알아? 본인은 모르는 것 같던데.'),
  (42, 'native',   3, '항상 이러는 거야, 아니면 내가 운 좋게 오늘 딱 맞춰 온 거야?'),
  (42, 'native',   4, '내가 이 순간을 얼마나 오래 기다려왔는지 알아?'),
  (42, 'native',   5, '솔직한 대답을 원해, 아니면 기분 좋은 대답을 원해?'),
  -- P43 Normal
  (43, 'normal',   1, '집에서 스시 만들어본 적 있어?'),
  (43, 'normal',   2, '라이브 콘서트에 가본 적 있어?'),
  (43, 'normal',   3, '시험 때문에 밤을 새워본 적 있어?'),
  (43, 'normal',   4, '완전히 혼자 해외 여행을 가본 적 있어?'),
  (43, 'normal',   5, '정말 유명한 사람을 직접 만나본 적 있어?'),
  -- P43 Advanced
  (43, 'advanced', 1, '어떤 대화가 뭔가를 보는 시각을 완전히 바꿔놓은 경험 있어?'),
  (43, 'advanced', 2, '흥분한 상태에서 뭔가를 말하고 즉시 후회한 적 있어?'),
  (43, 'advanced', 3, '정말 열심히 한 일이 마지막에 무산된 경험 있어?'),
  (43, 'advanced', 4, '어린 시절에 갔던 곳에 다시 가봤는데 느낌이 완전히 달랐던 경험 있어?'),
  (43, 'advanced', 5, '누군가에게 두 번째 기회를 줬는데 그 결정을 잘했다고 느낀 적 있어?'),
  -- P43 Native
  (43, 'native',   1, '사회적 모임을 그냥 빠지고 죄책감을 전혀 안 느낀 적 있어?'),
  (43, 'native',   2, '너무 피곤해서 자기가 뭐에 지친 건지도 모를 만큼 지쳐본 적 있어?'),
  (43, 'native',   3, '너무 웃겨서 숨도 못 쉬다가 뭐가 웃겼는지도 잊어버린 적 있어?'),
  (43, 'native',   4, '정말 하고 싶은 말이 있었는데 마지막 순간에 참은 적 있어?'),
  (43, 'native',   5, '5분 만에 만난 사람인데 평생 알고 지낸 것 같은 느낌을 받은 적 있어?'),
  -- P44 Normal
  (44, 'normal',   1, '화장실이 어디에 있는지 알아?'),
  (44, 'normal',   2, '그 가게가 몇 시에 닫는지 알아?'),
  (44, 'normal',   3, '역까지 어떻게 가는지 알아?'),
  (44, 'normal',   4, '혹시 그녀의 전화번호를 알아?'),
  (44, 'normal',   5, '이 근처에 밥 먹기 좋은 곳 알아?'),
  -- P44 Advanced
  (44, 'advanced', 1, '그녀가 요즘 왜 그렇게 조용한지 알아? 슬슬 걱정이 되기 시작했어.'),
  (44, 'advanced', 2, '다른 사람 안 끼워도 이걸 해결할 방법이 있는지 알아?'),
  (44, 'advanced', 3, '우리가 이런 걸 같이 한 게 마지막으로 얼마나 됐는지 알아?'),
  (44, 'advanced', 4, '회의 마지막에 실제로 어떻게 됐는지 알아? 먼저 나가야 했거든.'),
  (44, 'advanced', 5, '이런 걸 도와줄 수 있는 사람 혹시 알아?'),
  -- P44 Native
  (44, 'native',   1, '지금 그 말이 얼마나 먹음직스럽게 들리는지 알아? 나 완전히 굶었거든.'),
  (44, 'native',   2, '뭐가 날 열받게 하는지 알아? 그녀가 한 말이 아니라 말한 방식이야.'),
  (44, 'native',   3, '너처럼 딱 맞는 사람을 찾는 게 얼마나 드문 일인지 알아?'),
  (44, 'native',   4, '내 생각에 뭔지 알아? 너는 이미 이 질문의 답을 알고 있는 것 같아.'),
  (44, 'native',   5, '이 말을 하려고 얼마나 오래 준비했는지 알아? 그냥... 고마워.'),
  -- P45 Normal
  (45, 'normal',   1, '다른 방법을 시도해보면 어떨까?'),
  (45, 'normal',   2, '제때 못 가면 어떡하지?'),
  (45, 'normal',   3, '오늘 좀 더 일찍 출발하면 어떨까?'),
  (45, 'normal',   4, '그녀가 진짜로 거절하면 어떡하지?'),
  (45, 'normal',   5, '이번엔 각자 계산하면 어떨까?'),
  -- P45 Advanced
  (45, 'advanced', 1, '이 문제를 완전히 다른 각도에서 바라보면 어떨까?'),
  (45, 'advanced', 2, '문제가 계획이 아니라 우리가 실행하는 방식에 있는 건 아닐까?'),
  (45, 'advanced', 3, '최종 결정을 내리기 전에 일주일만 더 지켜보면 어떨까?'),
  (45, 'advanced', 4, '이게 잘 안 되는 이유가 실력과는 전혀 관계없다면 어떨까?'),
  (45, 'advanced', 5, '얘기를 시작하기 전에 각자 걱정되는 점을 먼저 써보면 어떨까?'),
  -- P45 Native
  (45, 'native',   1, '내가 생각보다 훨씬 오래 이 생각을 해왔다고 하면 어떨 것 같아?'),
  (45, 'native',   2, '과도하게 생각하는 걸 그만두고 그냥 해버리면 어떨까?'),
  (45, 'native',   3, '이게 사실 우리한테 일어날 수 있는 최선의 일이라면 어떨까?'),
  (45, 'native',   4, '사실 여기서 아무도 맞지 않고 우리 모두 핵심을 놓치고 있는 거라면 어떨까?'),
  (45, 'native',   5, '잘 생각해보면 최악의 경우가 사실 그렇게 나쁘지 않은 거라면 어떨까?'),
  -- P46 Normal
  (46, 'normal',   1, '새 메뉴 어떻게 생각해?'),
  (46, 'normal',   2, '이번 주말에 거기 가는 거 어떻게 생각해?'),
  (46, 'normal',   3, '그녀의 아이디어 어떻게 생각해?'),
  (46, 'normal',   4, '잠깐 쉬는 거 어떻게 생각해?'),
  (46, 'normal',   5, '새로 생긴 그 곳 어떻게 생각해?'),
  -- P46 Advanced
  (46, 'advanced', 1, '신선한 관점을 얻기 위해 외부 사람을 데려오는 건 어떻게 생각해?'),
  (46, 'advanced', 2, '요즘 그 두 사람 사이가 어떻게 흘러가고 있는 것 같아?'),
  (46, 'advanced', 3, '마감을 며칠만 미루는 건 어떻게 생각해?'),
  (46, 'advanced', 4, '다른 사람을 끌어들이기 전에 우리끼리 해결해보는 건 어떻게 생각해?'),
  (46, 'advanced', 5, '오늘 회의에서 그녀가 한 말 어떻게 생각해? 나는 도무지 읽을 수가 없었어.'),
  -- P46 Native
  (46, 'native',   1, '그거 어떻게 생각해? 솔직하게 말해줘 — 감당할 수 있어.'),
  (46, 'native',   2, '앞으로는 서로 솔직하게 대하는 건 어떻게 생각해?'),
  (46, 'native',   3, '이 상황 전체를 어떻게 생각해? 나는 솔직히 이제 모르겠어.'),
  (46, 'native',   4, '더 진행되기 전에 일단 한발 물러서는 건 어떻게 생각해?'),
  (46, 'native',   5, '이 전체 상황을 어떻게 생각해? 내가 먼저 말하기는 싫어.'),
  -- P47 Normal
  (47, 'normal',   1, '그녀가 지금 뭘 하고 있는지 궁금해.'),
  (47, 'normal',   2, '오늘 비가 올지 궁금해.'),
  (47, 'normal',   3, '그가 왜 오늘 안 왔는지 궁금해.'),
  (47, 'normal',   4, '이걸 더 빨리 할 방법이 있는지 궁금해.'),
  (47, 'normal',   5, '그 곳이 실제로 어떤 곳인지 궁금해.'),
  -- P47 Advanced
  (47, 'advanced', 1, '그녀가 그 한 마디가 나한테 얼마나 큰 의미였는지 알고 있는지 궁금해.'),
  (47, 'advanced', 2, '그때 다른 선택을 했다면 어떻게 됐을지 궁금해.'),
  (47, 'advanced', 3, '그가 모두한테 그런 말을 한 건지 아니면 나한테만 한 건지 궁금해.'),
  (47, 'advanced', 4, '그 결정을 내릴 때 그들이 진짜 무슨 생각을 하고 있었는지 궁금해.'),
  (47, 'advanced', 5, '나중에 돌아봤을 때 괜한 걱정이었다고 생각하게 될지 궁금해.'),
  -- P47 Native
  (47, 'native',   1, '그들이 자기 말이 어떻게 들렸는지 알고는 있을지 궁금해. 아마 모르겠지.'),
  (47, 'native',   2, '그때 딱 한 번 "응"이라고 했다면 삶이 어떻게 됐을지 궁금해.'),
  (47, 'native',   3, '그게 아직도 신경 쓰이는지, 아니면 그냥 익숙해진 건지 궁금해.'),
  (47, 'native',   4, '왜 항상 사소한 것들이 제일 깊게 박히는 건지 궁금해.'),
  (47, 'native',   5, '내 이름이 뜰 때 그녀가 무슨 생각을 하는지 궁금해. 아마 아무 생각도 없겠지.'),
  -- P48 Normal
  (48, 'normal',   1, '너 다시 만나는 게 너무 기대돼.'),
  (48, 'normal',   2, '그 식당 가보는 게 너무 기대돼.'),
  (48, 'normal',   3, '오늘 밤 집에 가는 게 너무 기대돼.'),
  (48, 'normal',   4, '선물 열어보는 게 너무 기대돼.'),
  (48, 'normal',   5, '네 가족 만나는 게 너무 기대돼.'),
  -- P48 Advanced
  (48, 'advanced', 1, '이 정신없는 한 주가 끝나고 드디어 나만의 시간을 갖는 게 너무 기대돼.'),
  (48, 'advanced', 2, '깜짝 선물을 알게 됐을 때 그녀의 반응이 너무 기대돼.'),
  (48, 'advanced', 3, '이걸 시작하는 게 너무 기대돼 — 몇 주째 머릿속에서만 구상해왔거든.'),
  (48, 'advanced', 4, '지금까지 작업한 걸 보여줄 수 있게 되는 날이 너무 기대돼.'),
  (48, 'advanced', 5, '이 챕터를 마치고 완전히 새로운 걸 시작하는 게 너무 기대돼.'),
  -- P48 Native
  (48, 'native',   1, '며칠이라도 이 도시를 벗어나서 그냥 숨 좀 쉬는 게 너무 기대돼.'),
  (48, 'native',   2, '네가 이거 먹어보는 게 너무 기대돼 — 완전히 제정신 아니게 될 거야.'),
  (48, 'native',   3, '이 모든 게 그냥 끝나서 다 같이 앞으로 나아갈 수 있게 되는 게 너무 기대돼.'),
  (48, 'native',   4, '언젠가 돌아봤을 때 다 그럴 만한 가치가 있었다는 걸 알게 되는 날이 기대돼.'),
  (48, 'native',   5, '그녀한테 말해주는 게 너무 기대돼 — 완전히 뒤집어질 거야.'),
  -- P49 Normal
  (49, 'normal',   1, '다음 주 여행이 정말 기대돼.'),
  (49, 'normal',   2, '새 직장을 시작하는 게 정말 기대돼.'),
  (49, 'normal',   3, '새 메뉴에서 뭔가 먹어보는 게 정말 기대돼.'),
  (49, 'normal',   4, '오늘 밤 드디어 다 만나는 게 정말 기대돼.'),
  (49, 'normal',   5, '이번 토요일 콘서트가 정말 기대돼.'),
  -- P49 Advanced
  (49, 'advanced', 1, '우리가 나아가는 방향이 정말 기대돼 — 드디어 뭔가 맞아 떨어지는 느낌이야.'),
  (49, 'advanced', 2, '이 프로젝트가 엄청 힘들 거란 걸 알면서도 정말 기대돼.'),
  (49, 'advanced', 3, '변화가 기대되기도 하면서 앞으로 어떻게 될지 살짝 긴장도 돼.'),
  (49, 'advanced', 4, '1년 후에 돌아봤을 때 얼마나 멀리 왔는지 확인하는 게 기대돼.'),
  (49, 'advanced', 5, '자기 일에 진심인 사람들이랑 같이 일하게 되는 게 기대돼.'),
  -- P49 Native
  (49, 'native',   1, '이 기대감은 정말 오랜만에 느끼는 거야.'),
  (49, 'native',   2, '기대되는 건 맞는데, 너무 부풀리지 않으려고 노력 중이야.'),
  (49, 'native',   3, '네 얼굴 보는 게 정말 기대돼 — 이번 주 내내 이 날만 기다렸어.'),
  (49, 'native',   4, '다음이 정말 기대돼 — 드디어 뭔가 좋은 일이 올 것 같은 느낌이야.'),
  (49, 'native',   5, '솔직히 다 기대돼 — 그냥 징크스 날리기 싫어서 말을 아끼는 것뿐이야.'),
  -- P50 Normal
  (50, 'normal',   1, '내일 중요한 시험이 걱정돼.'),
  (50, 'normal',   2, '그녀가 걱정돼 — 요즘 영 자기답지 않아.'),
  (50, 'normal',   3, '회의에 늦을까봐 걱정돼.'),
  (50, 'normal',   4, '이번 주말 날씨가 걱정돼.'),
  (50, 'normal',   5, '시간이 모자랄까봐 걱정돼.'),
  -- P50 Advanced
  (50, 'advanced', 1, '이 문제를 빨리 해결하지 않으면 어떻게 될지 걱정돼.'),
  (50, 'advanced', 2, '그가 걱정돼 — 평소 조용한 것과는 다른 종류의 조용함이야.'),
  (50, 'advanced', 3, '이제 막 시작된 것에 너무 많은 압박을 줄까봐 걱정돼.'),
  (50, 'advanced', 4, '나중에 되돌릴 수 없는 선례를 남기게 될까봐 걱정돼.'),
  (50, 'advanced', 5, '기대를 너무 높였다가 또 실망하게 될까봐 걱정돼.'),
  -- P50 Native
  (50, 'native',   1, '설명하기 힘든 방식으로 이게 걱정돼 — 그냥 뭔가 이상한 느낌이야.'),
  (50, 'native',   2, '그녀가 걱정되는데, 꺼낼 때마다 그냥 차단해버려.'),
  (50, 'native',   3, '아마 괜한 걱정이겠지 — 그냥 과도하게 생각하는 게 안 멈춰져서.'),
  (50, 'native',   4, '그 이후가 걱정돼 — 상황 자체는 감당할 수 있어, 문제는 그 다음이야.'),
  (50, 'native',   5, '잘못된 말을 해서 상황을 더 나쁘게 만들까봐 걱정돼.')
) AS t(porder, diff, ord, ko)
JOIN languages l ON l.code = 'en'
JOIN patterns p  ON p.order_index = t.porder AND p.level = 1 AND p.language_id = l.id
JOIN examples e  ON e.pattern_id = p.id
                AND e.difficulty  = t.diff::difficulty_level
                AND e.order_index = t.ord;

-- 검증
SELECT
  p.order_index,
  pt.pattern_text,
  e.difficulty,
  COUNT(*) AS cnt
FROM patterns p
JOIN pattern_translations pt ON pt.pattern_id = p.id AND pt.ui_lang = 'ko'
JOIN examples e ON e.pattern_id = p.id
WHERE p.level = 1 AND p.order_index BETWEEN 41 AND 50
GROUP BY p.order_index, pt.pattern_text, e.difficulty
ORDER BY p.order_index, e.difficulty;
