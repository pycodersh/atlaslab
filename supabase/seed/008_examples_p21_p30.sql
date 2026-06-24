-- PATTO 예문 Seed: 패턴 21~30
-- 패턴당 Normal 5 / Advanced 5 / Native 5 = 15개
-- 총 150개 예문 + 150개 한국어 번역

DO $$
DECLARE
  lang_en UUID;
  p21 UUID; p22 UUID; p23 UUID; p24 UUID; p25 UUID;
  p26 UUID; p27 UUID; p28 UUID; p29 UUID; p30 UUID;
BEGIN
  SELECT id INTO lang_en FROM languages WHERE code = 'en';

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

  -- ============================================================
  -- P21: I'm going to ~  (~할 거야)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p21, 'normal',   1, 'I''m going to call her after dinner.'),
    (p21, 'normal',   2, 'I''m going to try a new restaurant tonight.'),
    (p21, 'normal',   3, 'I''m going to take a nap right now.'),
    (p21, 'normal',   4, 'I''m going to visit my parents this weekend.'),
    (p21, 'normal',   5, 'I''m going to buy a new phone soon.'),
    (p21, 'advanced', 1, 'I''m going to apply for that job even though I''m nervous about it.'),
    (p21, 'advanced', 2, 'I''m going to have a serious talk with him before things get worse.'),
    (p21, 'advanced', 3, 'I''m going to take a few days off and just recharge.'),
    (p21, 'advanced', 4, 'I''m going to stop making excuses and actually do something about it.'),
    (p21, 'advanced', 5, 'I''m going to start waking up earlier so I can have a better morning routine.'),
    (p21, 'native',   1, 'I''m going to need a minute — that was a lot to take in.'),
    (p21, 'native',   2, 'I''m going to be honest with you: I have no idea what I''m doing.'),
    (p21, 'native',   3, 'I''m going to pretend I didn''t hear that and we''ll just move on.'),
    (p21, 'native',   4, 'I''m going to go out on a limb and say this might actually work.'),
    (p21, 'native',   5, 'I''m going to call it a night — I''m running on empty.');

  -- ============================================================
  -- P22: I'm going to try ~  (~해볼 거야)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p22, 'normal',   1, 'I''m going to try making pasta this weekend.'),
    (p22, 'normal',   2, 'I''m going to try waking up at six.'),
    (p22, 'normal',   3, 'I''m going to try that new coffee shop downtown.'),
    (p22, 'normal',   4, 'I''m going to try speaking more in class.'),
    (p22, 'normal',   5, 'I''m going to try running three times a week.'),
    (p22, 'advanced', 1, 'I''m going to try meditating every morning and see if it helps with stress.'),
    (p22, 'advanced', 2, 'I''m going to try not to overthink every little decision I make.'),
    (p22, 'advanced', 3, 'I''m going to try explaining it a different way so it makes more sense.'),
    (p22, 'advanced', 4, 'I''m going to try cutting back on social media during the week.'),
    (p22, 'advanced', 5, 'I''m going to try being more patient, even when things get really hard.'),
    (p22, 'native',   1, 'I''m going to try not to take it personally, but honestly it''s tough.'),
    (p22, 'native',   2, 'I''m going to try something different this time — the same approach isn''t working.'),
    (p22, 'native',   3, 'I''m going to try keeping my mouth shut and see how this plays out.'),
    (p22, 'native',   4, 'I''m going to try talking to her first before I jump to any conclusions.'),
    (p22, 'native',   5, 'I''m going to try my luck — worst they can say is no.');

  -- ============================================================
  -- P23: I've been ~ing  (계속 ~하고 있어)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p23, 'normal',   1, 'I''ve been waiting for your call all day.'),
    (p23, 'normal',   2, 'I''ve been studying for the test since morning.'),
    (p23, 'normal',   3, 'I''ve been feeling a bit tired lately.'),
    (p23, 'normal',   4, 'I''ve been watching this show for hours.'),
    (p23, 'normal',   5, 'I''ve been thinking about what you said.'),
    (p23, 'advanced', 1, 'I''ve been trying to reach her for two days but she''s not picking up.'),
    (p23, 'advanced', 2, 'I''ve been putting off this dentist appointment for so long it''s embarrassing.'),
    (p23, 'advanced', 3, 'I''ve been working on this project nonstop and I still can''t get it right.'),
    (p23, 'advanced', 4, 'I''ve been meaning to apologize to you for a while, and I''m finally doing it.'),
    (p23, 'advanced', 5, 'I''ve been sleeping terribly this week — I wake up more tired than before.'),
    (p23, 'native',   1, 'I''ve been telling you for weeks — I knew this was going to happen.'),
    (p23, 'native',   2, 'I''ve been going back and forth on this and I still can''t make up my mind.'),
    (p23, 'native',   3, 'I''ve been low-key stressed about this for days and didn''t want to say anything.'),
    (p23, 'native',   4, 'I''ve been carrying this around for so long — it feels good to finally say it out loud.'),
    (p23, 'native',   5, 'I''ve been on edge all day and I don''t even know why.');

  -- ============================================================
  -- P24: I think ~  (~인 것 같아)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p24, 'normal',   1, 'I think we should leave a little early.'),
    (p24, 'normal',   2, 'I think the meeting starts at three.'),
    (p24, 'normal',   3, 'I think this is the wrong address.'),
    (p24, 'normal',   4, 'I think you need to get more rest.'),
    (p24, 'normal',   5, 'I think she forgot about our plans today.'),
    (p24, 'advanced', 1, 'I think we need to talk about this more carefully before making a final decision.'),
    (p24, 'advanced', 2, 'I think the reason she''s upset is that nobody asked for her opinion.'),
    (p24, 'advanced', 3, 'I think it would be better to wait and see what happens first.'),
    (p24, 'advanced', 4, 'I think you''re being too hard on yourself over something that wasn''t your fault.'),
    (p24, 'advanced', 5, 'I think what bothers me most is that nobody told me about the change.'),
    (p24, 'native',   1, 'I think you''re overthinking it — just go with your gut on this one.'),
    (p24, 'native',   2, 'I think there''s more to this than meets the eye.'),
    (p24, 'native',   3, 'I think we''ve all been there at some point — no need to feel bad.'),
    (p24, 'native',   4, 'I think I need to hear that again — did you just say yes?'),
    (p24, 'native',   5, 'I think the vibe was a little off in there — didn''t you feel that?');

  -- ============================================================
  -- P25: I feel like ~  (~인 느낌이야)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p25, 'normal',   1, 'I feel like I''ve seen this movie before.'),
    (p25, 'normal',   2, 'I feel like she''s hiding something from me.'),
    (p25, 'normal',   3, 'I feel like today is going to be a good day.'),
    (p25, 'normal',   4, 'I feel like we''ve been waiting here for hours.'),
    (p25, 'normal',   5, 'I feel like having something spicy for dinner tonight.'),
    (p25, 'advanced', 1, 'I feel like no matter how hard I try, it never seems like enough.'),
    (p25, 'advanced', 2, 'I feel like everyone around me has their life figured out except me.'),
    (p25, 'advanced', 3, 'I feel like I''ve been carrying this on my own for way too long.'),
    (p25, 'advanced', 4, 'I feel like every time we talk, something important gets lost in translation.'),
    (p25, 'advanced', 5, 'I feel like the decision was already made before anyone asked for my input.'),
    (p25, 'native',   1, 'I feel like we''ve been going around in circles on this for way too long.'),
    (p25, 'native',   2, 'I feel like I''m the only one who sees what''s really going on here.'),
    (p25, 'native',   3, 'I feel like something''s off, but I can''t quite put my finger on it.'),
    (p25, 'native',   4, 'I feel like I''m talking to a wall sometimes — you know what I mean?'),
    (p25, 'native',   5, 'I feel like this is one of those things I''ll look back on and laugh about.');

  -- ============================================================
  -- P26: I'm not sure ~  (~인지 모르겠어)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p26, 'normal',   1, 'I''m not sure where to go for dinner.'),
    (p26, 'normal',   2, 'I''m not sure if she got my message.'),
    (p26, 'normal',   3, 'I''m not sure what time it starts.'),
    (p26, 'normal',   4, 'I''m not sure if I locked the door.'),
    (p26, 'normal',   5, 'I''m not sure how to answer that question.'),
    (p26, 'advanced', 1, 'I''m not sure how to bring this up without making things awkward.'),
    (p26, 'advanced', 2, 'I''m not sure if I made the right call, but I had to decide fast.'),
    (p26, 'advanced', 3, 'I''m not sure what she meant by that, and I''m honestly afraid to ask.'),
    (p26, 'advanced', 4, 'I''m not sure I''m ready for something this big just yet.'),
    (p26, 'advanced', 5, 'I''m not sure whether to say something now or just let this one go.'),
    (p26, 'native',   1, 'I''m not sure I follow — can you back up a little for me?'),
    (p26, 'native',   2, 'I''m not sure how I feel about it yet — give me a second to think.'),
    (p26, 'native',   3, 'I''m not sure that''s the whole story, to be completely honest with you.'),
    (p26, 'native',   4, 'I''m not sure I''m the right person to ask about that one.'),
    (p26, 'native',   5, 'I''m not sure if I''m being dramatic or if this is actually a big deal.');

  -- ============================================================
  -- P27: I tend to ~  (~하는 경향이 있어)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p27, 'normal',   1, 'I tend to stay up too late on weekends.'),
    (p27, 'normal',   2, 'I tend to forget people''s names pretty easily.'),
    (p27, 'normal',   3, 'I tend to overthink things before making a decision.'),
    (p27, 'normal',   4, 'I tend to skip breakfast when I''m busy.'),
    (p27, 'normal',   5, 'I tend to talk too much when I''m nervous.'),
    (p27, 'advanced', 1, 'I tend to take on too much at once and then end up burning out.'),
    (p27, 'advanced', 2, 'I tend to say yes to things even when I really should say no.'),
    (p27, 'advanced', 3, 'I tend to focus on everything that went wrong instead of what went right.'),
    (p27, 'advanced', 4, 'I tend to avoid conflict until it builds up too much to ignore anymore.'),
    (p27, 'advanced', 5, 'I tend to work better under pressure, which probably isn''t the healthiest habit.'),
    (p27, 'native',   1, 'I tend to get quiet when I''m overwhelmed — please don''t take it personally.'),
    (p27, 'native',   2, 'I tend to overthink at night when everything gets too loud in my head.'),
    (p27, 'native',   3, 'Honestly, I tend to give people more chances than they probably deserve.'),
    (p27, 'native',   4, 'I tend to laugh when I''m uncomfortable — it''s a bad habit, I know.'),
    (p27, 'native',   5, 'I tend to avoid the hard conversations, but I''m really trying to work on it.');

  -- ============================================================
  -- P28: It depends on ~  (~에 달려있어)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p28, 'normal',   1, 'It depends on how I feel tomorrow.'),
    (p28, 'normal',   2, 'It depends on what time you get here.'),
    (p28, 'normal',   3, 'It depends on what the weather is like.'),
    (p28, 'normal',   4, 'It depends on how much it costs.'),
    (p28, 'normal',   5, 'It depends on who else is going.'),
    (p28, 'advanced', 1, 'It depends on whether we can get enough people on board before the deadline.'),
    (p28, 'advanced', 2, 'It depends on how the conversation goes — I''m keeping an open mind.'),
    (p28, 'advanced', 3, 'It depends on what kind of support you need — practical or emotional.'),
    (p28, 'advanced', 4, 'It depends on a lot of factors that we haven''t fully discussed yet.'),
    (p28, 'advanced', 5, 'It depends on your goals, honestly — there''s no one-size-fits-all answer here.'),
    (p28, 'native',   1, 'It depends on the day — some days I''m on top of it, some days I''m not.'),
    (p28, 'native',   2, 'It depends on your definition of "ready" — are we ever really ready for anything?'),
    (p28, 'native',   3, 'It depends, honestly. There are too many moving parts to give you a straight answer.'),
    (p28, 'native',   4, 'It depends on who you ask — you''ll get a completely different answer every time.'),
    (p28, 'native',   5, 'It depends on how you look at it, but I''m leaning toward no on this one.');

  -- ============================================================
  -- P29: It's worth ~ing  (~할 가치가 있어)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p29, 'normal',   1, 'It''s worth giving it a try at least once.'),
    (p29, 'normal',   2, 'It''s worth reading the whole thing before you decide.'),
    (p29, 'normal',   3, 'It''s worth asking if there''s a discount available.'),
    (p29, 'normal',   4, 'It''s worth checking the reviews before you go.'),
    (p29, 'normal',   5, 'It''s worth paying a little more for good quality.'),
    (p29, 'advanced', 1, 'It''s worth having the conversation even if it doesn''t go the way you hope.'),
    (p29, 'advanced', 2, 'It''s worth investing the time now so you don''t have to redo everything later.'),
    (p29, 'advanced', 3, 'It''s worth waiting for the right opportunity instead of settling for what''s available now.'),
    (p29, 'advanced', 4, 'It''s worth doing it properly the first time rather than cutting corners and regretting it.'),
    (p29, 'advanced', 5, 'It''s worth being upfront about your expectations before things go any further.'),
    (p29, 'native',   1, 'It''s worth a shot — what''s the worst that could happen?'),
    (p29, 'native',   2, 'It''s worth every penny, honestly — I''d pay twice the price without blinking.'),
    (p29, 'native',   3, 'It''s worth the awkward conversation now to avoid a much bigger mess later.'),
    (p29, 'native',   4, 'It''s worth sitting with the discomfort a bit longer before you make a move.'),
    (p29, 'native',   5, 'It''s worth it in the long run, even if it doesn''t feel like it right now.');

  -- ============================================================
  -- P30: Even though ~  (~이지만 / ~임에도 불구하고)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p30, 'normal',   1, 'Even though I''m tired, I have to finish this.'),
    (p30, 'normal',   2, 'Even though it''s expensive, the quality is really good.'),
    (p30, 'normal',   3, 'Even though I was nervous, I did my best.'),
    (p30, 'normal',   4, 'Even though she didn''t say much, I could tell.'),
    (p30, 'normal',   5, 'Even though it rained all day, we had a great time.'),
    (p30, 'advanced', 1, 'Even though I disagree with his decision, I still respect the way he handled it.'),
    (p30, 'advanced', 2, 'Even though things have been really tough lately, I''m trying to stay positive.'),
    (p30, 'advanced', 3, 'Even though I knew it was a long shot, I felt like I had to try.'),
    (p30, 'advanced', 4, 'Even though she apologized, it still took me a while to fully let it go.'),
    (p30, 'advanced', 5, 'Even though it wasn''t my fault, I ended up being the one who fixed it.'),
    (p30, 'native',   1, 'Even though I said I was fine, I really wasn''t — not even close.'),
    (p30, 'native',   2, 'Even though she drives me crazy sometimes, I''d still do anything for her.'),
    (p30, 'native',   3, 'Even though it didn''t work out, I genuinely don''t regret giving it a shot.'),
    (p30, 'native',   4, 'Even though I knew the answer, I second-guessed myself and got it wrong anyway.'),
    (p30, 'native',   5, 'Even though we barely talk anymore, some part of me still misses what we had.');

END $$;

-- ============================================================
-- 한국어 번역 삽입
-- ============================================================
INSERT INTO example_translations (example_id, ui_lang, translation)
SELECT e.id, 'ko', t.ko
FROM (VALUES
  -- P21 Normal
  (21, 'normal',   1, '저녁 먹고 그녀에게 전화할 거야.'),
  (21, 'normal',   2, '오늘 밤 새 식당에 가볼 거야.'),
  (21, 'normal',   3, '나 지금 잠깐 낮잠 잘 거야.'),
  (21, 'normal',   4, '이번 주말에 부모님 찾아뵐 거야.'),
  (21, 'normal',   5, '곧 새 폰 살 거야.'),
  -- P21 Advanced
  (21, 'advanced', 1, '긴장되지만 그 일에 지원해볼 거야.'),
  (21, 'advanced', 2, '상황이 더 나빠지기 전에 그에게 진지하게 얘기할 거야.'),
  (21, 'advanced', 3, '며칠 쉬면서 에너지를 충전할 거야.'),
  (21, 'advanced', 4, '핑계 그만 대고 실제로 뭔가 해볼 거야.'),
  (21, 'advanced', 5, '더 좋은 아침 루틴을 위해 일찍 일어나기 시작할 거야.'),
  -- P21 Native
  (21, 'native',   1, '잠깐 시간 좀 줘 — 소화하기에 너무 많은 정보였어.'),
  (21, 'native',   2, '솔직히 말할게: 나 지금 뭘 하는지 전혀 모르겠어.'),
  (21, 'native',   3, '못 들은 걸로 하고 그냥 넘어가자.'),
  (21, 'native',   4, '모험을 걸어보는 거야 — 이게 진짜 될 수도 있을 것 같아.'),
  (21, 'native',   5, '오늘은 이만 자야겠어 — 완전히 방전됐어.'),
  -- P22 Normal
  (22, 'normal',   1, '이번 주말에 파스타 만들어볼 거야.'),
  (22, 'normal',   2, '6시에 일어나볼 거야.'),
  (22, 'normal',   3, '시내에 새로 생긴 커피숍 가볼 거야.'),
  (22, 'normal',   4, '수업 시간에 더 많이 말해볼 거야.'),
  (22, 'normal',   5, '일주일에 세 번 달리기를 해볼 거야.'),
  -- P22 Advanced
  (22, 'advanced', 1, '스트레스에 도움이 되는지 매일 아침 명상을 해볼 거야.'),
  (22, 'advanced', 2, '사소한 결정 하나하나를 너무 과도하게 생각하지 않으려고 노력해볼 거야.'),
  (22, 'advanced', 3, '더 이해하기 쉽게 다른 방식으로 설명해볼게.'),
  (22, 'advanced', 4, '주중에는 SNS를 좀 줄여볼 거야.'),
  (22, 'advanced', 5, '정말 힘들어도 더 참을성 있게 해볼 거야.'),
  -- P22 Native
  (22, 'native',   1, '기분 나쁘게 받아들이지 않으려고 노력해볼 건데, 솔직히 쉽지 않아.'),
  (22, 'native',   2, '이번엔 다른 방법을 시도해볼 거야 — 같은 방식은 안 통하고 있거든.'),
  (22, 'native',   3, '입 다물고 이게 어떻게 되는지 지켜볼 거야.'),
  (22, 'native',   4, '섣불리 판단하기 전에 먼저 그녀에게 직접 얘기해볼 거야.'),
  (22, 'native',   5, '한번 운을 떼볼 거야 — 최악의 경우 거절당하는 거잖아.'),
  -- P23 Normal
  (23, 'normal',   1, '하루 종일 네 전화를 기다리고 있었어.'),
  (23, 'normal',   2, '아침부터 시험 공부하고 있었어.'),
  (23, 'normal',   3, '요즘 좀 피곤한 느낌이야.'),
  (23, 'normal',   4, '몇 시간째 이 드라마를 보고 있었어.'),
  (23, 'normal',   5, '네가 한 말 계속 생각하고 있었어.'),
  -- P23 Advanced
  (23, 'advanced', 1, '이틀 동안 그녀에게 연락하려고 했는데 계속 전화를 안 받아.'),
  (23, 'advanced', 2, '치과 예약을 너무 오래 미뤄왔어서 민망할 지경이야.'),
  (23, 'advanced', 3, '이 프로젝트를 쉬지 않고 하고 있는데 아직도 제대로 안 돼.'),
  (23, 'advanced', 4, '한참 전부터 사과하려고 했는데, 지금 드디어 하는 거야.'),
  (23, 'advanced', 5, '이번 주 내내 잠을 못 자고 있어 — 자고 일어나면 오히려 더 피곤해.'),
  -- P23 Native
  (23, 'native',   1, '몇 주 동안 말했잖아 — 이럴 줄 알았다고.'),
  (23, 'native',   2, '이것 때문에 계속 왔다 갔다 하고 있는데 아직도 결정을 못 하겠어.'),
  (23, 'native',   3, '며칠 동안 속으로만 스트레스 받고 있었는데 말하기 싫었어.'),
  (23, 'native',   4, '이걸 너무 오래 끌어안고 살았는데 — 이제 털어놓으니 후련해.'),
  (23, 'native',   5, '오늘 하루 종일 예민하게 굴고 있는데 이유도 모르겠어.'),
  -- P24 Normal
  (24, 'normal',   1, '조금 일찍 출발하는 게 좋을 것 같아.'),
  (24, 'normal',   2, '회의가 3시에 시작하는 것 같아.'),
  (24, 'normal',   3, '이 주소가 잘못된 것 같아.'),
  (24, 'normal',   4, '너 좀 더 쉬어야 할 것 같아.'),
  (24, 'normal',   5, '그녀가 우리 약속을 잊은 것 같아.'),
  -- P24 Advanced
  (24, 'advanced', 1, '최종 결정을 내리기 전에 이걸 더 신중하게 얘기해야 할 것 같아.'),
  (24, 'advanced', 2, '그녀가 화가 난 이유는 아무도 의견을 묻지 않았기 때문인 것 같아.'),
  (24, 'advanced', 3, '먼저 어떻게 되는지 지켜보는 편이 나을 것 같아.'),
  (24, 'advanced', 4, '네 잘못도 아닌 일인데 스스로를 너무 몰아붙이는 것 같아.'),
  (24, 'advanced', 5, '가장 거슬리는 건 변경 사항을 아무도 나한테 알려주지 않았다는 거야.'),
  -- P24 Native
  (24, 'native',   1, '너무 과하게 생각하는 것 같아 — 그냥 직감대로 해봐.'),
  (24, 'native',   2, '솔직히 이 상황엔 겉으로 보이는 것보다 더 많은 게 있는 것 같아.'),
  (24, 'native',   3, '우리 다 그런 경험 있잖아 — 너무 자책하지 마.'),
  (24, 'native',   4, '다시 한번 말해줄래 — 방금 그게 맞다고 한 거야?'),
  (24, 'native',   5, '거기 분위기가 좀 이상했던 것 같아 — 너도 느꼈지?'),
  -- P25 Normal
  (25, 'normal',   1, '이 영화 전에 본 것 같은 느낌이야.'),
  (25, 'normal',   2, '그녀가 뭔가 숨기고 있는 것 같은 느낌이야.'),
  (25, 'normal',   3, '오늘 좋은 하루가 될 것 같은 느낌이야.'),
  (25, 'normal',   4, '여기서 몇 시간은 기다린 것 같은 느낌이야.'),
  (25, 'normal',   5, '오늘 저녁에 매운 게 땡기는 느낌이야.'),
  -- P25 Advanced
  (25, 'advanced', 1, '아무리 열심히 해도 충분하지 않은 것 같은 느낌이야.'),
  (25, 'advanced', 2, '나만 빼고 주변 사람들은 다 자기 삶이 잘 풀리는 것 같은 느낌이야.'),
  (25, 'advanced', 3, '이걸 너무 오랫동안 혼자 떠안아온 것 같은 느낌이야.'),
  (25, 'advanced', 4, '얘기할 때마다 중요한 게 서로 전달이 안 되는 것 같은 느낌이야.'),
  (25, 'advanced', 5, '내 의견을 묻기도 전에 이미 결정이 난 것 같은 느낌이야.'),
  -- P25 Native
  (25, 'native',   1, '이 문제를 놓고 너무 오래 같은 얘기만 반복하고 있는 것 같아.'),
  (25, 'native',   2, '여기서 진짜 무슨 일이 일어나고 있는지 나만 보이는 것 같아.'),
  (25, 'native',   3, '뭔가 이상한 느낌인데 딱 집어서 말하기가 어려워.'),
  (25, 'native',   4, '가끔 벽에다 대고 얘기하는 느낌이야 — 무슨 말인지 알지?'),
  (25, 'native',   5, '언젠가 이 일을 돌아보면서 웃을 수 있을 것 같은 느낌이야.'),
  -- P26 Normal
  (26, 'normal',   1, '저녁 어디서 먹을지 모르겠어.'),
  (26, 'normal',   2, '그녀가 내 메시지를 받았는지 모르겠어.'),
  (26, 'normal',   3, '몇 시에 시작하는지 모르겠어.'),
  (26, 'normal',   4, '문 잠그고 나왔는지 모르겠어.'),
  (26, 'normal',   5, '그 질문에 어떻게 대답해야 할지 모르겠어.'),
  -- P26 Advanced
  (26, 'advanced', 1, '어색해지지 않게 이걸 어떻게 꺼내야 할지 모르겠어.'),
  (26, 'advanced', 2, '옳은 결정이었는지 모르겠지만, 빠르게 결정해야 했어.'),
  (26, 'advanced', 3, '그녀가 무슨 뜻으로 한 말인지 모르겠고 솔직히 물어보기도 무서워.'),
  (26, 'advanced', 4, '이렇게 큰 일을 할 준비가 됐는지 아직 모르겠어.'),
  (26, 'advanced', 5, '지금 말을 해야 할지 그냥 넘어가야 할지 모르겠어.'),
  -- P26 Native
  (26, 'native',   1, '잘 이해가 안 되는데 — 조금 전으로 돌아가서 다시 설명해줄 수 있어?'),
  (26, 'native',   2, '아직 어떻게 느끼는지 모르겠어 — 잠깐 생각할 시간 줘.'),
  (26, 'native',   3, '솔직히 말하면, 그게 전부가 아닌 것 같아.'),
  (26, 'native',   4, '그 부분은 내가 대답하기에 적절한 사람인지 모르겠어.'),
  (26, 'native',   5, '내가 유난인 건지 아니면 진짜 큰 문제인 건지 모르겠어.'),
  -- P27 Normal
  (27, 'normal',   1, '나는 주말에 너무 늦게까지 깨어 있는 경향이 있어.'),
  (27, 'normal',   2, '나는 사람 이름을 꽤 쉽게 잊어버리는 경향이 있어.'),
  (27, 'normal',   3, '나는 결정하기 전에 모든 걸 과하게 생각하는 경향이 있어.'),
  (27, 'normal',   4, '바쁠 때 아침을 거르는 경향이 있어.'),
  (27, 'normal',   5, '긴장하면 말이 많아지는 경향이 있어.'),
  -- P27 Advanced
  (27, 'advanced', 1, '한 번에 너무 많이 떠맡다가 결국 번아웃이 오는 경향이 있어.'),
  (27, 'advanced', 2, '진짜 거절해야 할 때도 네 소리를 하는 경향이 있어.'),
  (27, 'advanced', 3, '잘된 것보다 잘못된 것에 집중하는 경향이 있어.'),
  (27, 'advanced', 4, '갈등을 너무 쌓아두다가 더 이상 무시할 수 없을 때까지 피하는 경향이 있어.'),
  (27, 'advanced', 5, '압박이 있을 때 더 잘하는 경향이 있는데, 그게 건강한 습관은 아닌 것 같아.'),
  -- P27 Native
  (27, 'native',   1, '압도될 때 조용해지는 경향이 있어 — 기분 나쁘게 받아들이지 마.'),
  (27, 'native',   2, '밤에 머릿속이 너무 시끄러워질 때 과하게 생각하는 경향이 있어.'),
  (27, 'native',   3, '솔직히 말하면 사람들한테 필요 이상으로 기회를 주는 경향이 있어.'),
  (27, 'native',   4, '불편할 때 웃음이 나오는 경향이 있어 — 나쁜 습관인 거 알아.'),
  (27, 'native',   5, '어려운 대화를 피하는 경향이 있는데, 지금 고치려고 노력 중이야.'),
  -- P28 Normal
  (28, 'normal',   1, '내일 기분이 어떠냐에 달려있어.'),
  (28, 'normal',   2, '네가 몇 시에 오냐에 달려있어.'),
  (28, 'normal',   3, '날씨가 어떠냐에 달려있어.'),
  (28, 'normal',   4, '얼마나 하냐에 달려있어.'),
  (28, 'normal',   5, '누가 가냐에 달려있어.'),
  -- P28 Advanced
  (28, 'advanced', 1, '마감 전에 충분한 사람을 설득할 수 있느냐에 달려있어.'),
  (28, 'advanced', 2, '대화가 어떻게 흘러가느냐에 달려있어 — 열린 마음으로 임할 거야.'),
  (28, 'advanced', 3, '어떤 종류의 지원이 필요한지에 달려있어 — 실질적인 건지, 감정적인 건지.'),
  (28, 'advanced', 4, '아직 다 얘기하지 못한 여러 요소들에 달려있어.'),
  (28, 'advanced', 5, '솔직히 네 목표에 달려있어 — 모두에게 맞는 정답은 없어.'),
  -- P28 Native
  (28, 'native',   1, '그날그날 달라 — 어떤 날은 잘 되고, 어떤 날은 아니야.'),
  (28, 'native',   2, '"준비됐다"는 게 어떤 의미냐에 달려있어 — 우리 정말 준비가 되는 날이 오긴 해?'),
  (28, 'native',   3, '솔직히 상황에 따라 달라. 변수가 너무 많아서 딱 잘라 말하기 어려워.'),
  (28, 'native',   4, '누구한테 물어보냐에 달려있어 — 물어볼 때마다 다른 대답이 나와.'),
  (28, 'native',   5, '어떻게 보느냐에 달려있는데, 나는 안 하는 쪽으로 기울어.'),
  -- P29 Normal
  (29, 'normal',   1, '적어도 한 번은 시도해볼 가치가 있어.'),
  (29, 'normal',   2, '결정하기 전에 처음부터 끝까지 읽어볼 가치가 있어.'),
  (29, 'normal',   3, '할인이 있는지 물어볼 가치가 있어.'),
  (29, 'normal',   4, '가기 전에 후기를 확인해볼 가치가 있어.'),
  (29, 'normal',   5, '좋은 품질을 위해 조금 더 쓸 가치가 있어.'),
  -- P29 Advanced
  (29, 'advanced', 1, '원하는 방향으로 안 되더라도 그 대화를 나눠볼 가치는 있어.'),
  (29, 'advanced', 2, '나중에 다시 처음부터 해야 하는 상황을 피하려면 지금 시간을 투자할 가치가 있어.'),
  (29, 'advanced', 3, '지금 구할 수 있는 것에 타협하지 말고 적절한 기회를 기다릴 가치가 있어.'),
  (29, 'advanced', 4, '나중에 후회하는 것보다 처음부터 제대로 하는 게 가치 있어.'),
  (29, 'advanced', 5, '일이 더 진행되기 전에 기대치를 솔직하게 말해두는 게 가치 있어.'),
  -- P29 Native
  (29, 'native',   1, '한번 해볼 가치는 있어 — 최악의 경우가 뭐가 있겠어?'),
  (29, 'native',   2, '솔직히 그만한 가치가 있어 — 두 배를 내도 아깝지 않을 것 같아.'),
  (29, 'native',   3, '나중에 큰 문제가 생기지 않으려면 지금 어색한 대화를 나눌 가치가 있어.'),
  (29, 'native',   4, '행동하기 전에 그 불편함을 좀 더 느껴볼 가치가 있어.'),
  (29, 'native',   5, '지금은 그렇게 느껴지지 않더라도 길게 보면 할 가치가 있어.'),
  -- P30 Normal
  (30, 'normal',   1, '피곤하지만 이걸 끝내야 해.'),
  (30, 'normal',   2, '비싸지만 퀄리티가 정말 좋아.'),
  (30, 'normal',   3, '긴장했지만 최선을 다했어.'),
  (30, 'normal',   4, '그녀가 많이 말하진 않았지만 알 수 있었어.'),
  (30, 'normal',   5, '하루 종일 비가 왔지만 정말 즐거웠어.'),
  -- P30 Advanced
  (30, 'advanced', 1, '그의 결정에 동의하지 않지만 그가 처리한 방식은 여전히 존중해.'),
  (30, 'advanced', 2, '요즘 정말 힘들지만 긍정적으로 지내려고 노력하고 있어.'),
  (30, 'advanced', 3, '가능성이 낮다는 걸 알면서도 일단 시도해야 할 것 같았어.'),
  (30, 'advanced', 4, '그녀가 사과했지만 완전히 받아들이는 데 시간이 좀 걸렸어.'),
  (30, 'advanced', 5, '내 잘못이 아니었지만 결국 내가 수습하게 됐어.'),
  -- P30 Native
  (30, 'native',   1, '괜찮다고 했지만 솔직히 전혀 안 괜찮았어.'),
  (30, 'native',   2, '가끔 나를 미치게 만들어도 그녀를 위해서라면 뭐든 할 수 있어.'),
  (30, 'native',   3, '잘 안 됐지만 시도했다는 것 자체는 후회하지 않아.'),
  (30, 'native',   4, '답을 알고 있었는데 스스로 의심하다가 결국 틀렸어.'),
  (30, 'native',   5, '거의 연락이 없어졌지만 우리가 함께했던 시간이 가끔 그리워.')
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
WHERE p.level = 1 AND p.order_index BETWEEN 21 AND 30
GROUP BY p.order_index, pt.pattern_text, e.difficulty
ORDER BY p.order_index, e.difficulty;
