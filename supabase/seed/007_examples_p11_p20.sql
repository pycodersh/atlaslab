-- PATTO 예문 Seed: 패턴 11~20
-- 패턴당 Normal 5 / Advanced 5 / Native 5 = 15개
-- 총 150개 예문 + 150개 한국어 번역

DO $$
DECLARE
  lang_en UUID;
  p11 UUID; p12 UUID; p13 UUID; p14 UUID; p15 UUID;
  p16 UUID; p17 UUID; p18 UUID; p19 UUID; p20 UUID;
BEGIN
  SELECT id INTO lang_en FROM languages WHERE code = 'en';

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

  -- ============================================================
  -- P11: I have to ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p11, 'normal',   1, 'I have to wake up early for work.'),
    (p11, 'normal',   2, 'I have to finish this before dinner.'),
    (p11, 'normal',   3, 'I have to call my mom tonight.'),
    (p11, 'normal',   4, 'I have to study for my exam tomorrow.'),
    (p11, 'normal',   5, 'I have to clean my room right now.'),
    (p11, 'advanced', 1, 'I have to submit the report by the end of the day.'),
    (p11, 'advanced', 2, 'I have to figure out how to fix this before the meeting.'),
    (p11, 'advanced', 3, 'I have to apologize to her, even though it''s going to be awkward.'),
    (p11, 'advanced', 4, 'I have to be honest with you — I wasn''t ready for this.'),
    (p11, 'advanced', 5, 'I have to remind myself to take breaks when I''m working late.'),
    (p11, 'native',   1, 'I have to say, this place is way better than I expected.'),
    (p11, 'native',   2, 'I have to stop scrolling and actually get some sleep.'),
    (p11, 'native',   3, 'Look, I have to be real with you — this isn''t working.'),
    (p11, 'native',   4, 'I have to give you credit, that was actually pretty impressive.'),
    (p11, 'native',   5, 'I have to run — can we talk about this later?');

  -- ============================================================
  -- P12: I don't ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p12, 'normal',   1, 'I don''t drink coffee after 6 p.m.'),
    (p12, 'normal',   2, 'I don''t usually eat breakfast on weekdays.'),
    (p12, 'normal',   3, 'I don''t know what to say right now.'),
    (p12, 'normal',   4, 'I don''t think that''s a good idea.'),
    (p12, 'normal',   5, 'I don''t have time to watch TV tonight.'),
    (p12, 'advanced', 1, 'I don''t really care what other people think about my choices.'),
    (p12, 'advanced', 2, 'I don''t understand why she reacted that way to a simple question.'),
    (p12, 'advanced', 3, 'I don''t usually stay up past midnight, but I made an exception.'),
    (p12, 'advanced', 4, 'I don''t want to make assumptions before I hear your side.'),
    (p12, 'advanced', 5, 'I don''t feel comfortable talking about this in front of everyone.'),
    (p12, 'native',   1, 'I don''t know, it just doesn''t feel right to me.'),
    (p12, 'native',   2, 'I don''t do mornings — don''t even talk to me before coffee.'),
    (p12, 'native',   3, 'I don''t buy it. Something about this whole thing feels off.'),
    (p12, 'native',   4, 'I don''t mind helping, but a heads-up would''ve been nice.'),
    (p12, 'native',   5, 'I don''t know how she does it — she never seems stressed.');

  -- ============================================================
  -- P13: Let me ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p13, 'normal',   1, 'Let me think about it for a second.'),
    (p13, 'normal',   2, 'Let me show you how to do this.'),
    (p13, 'normal',   3, 'Let me grab my jacket and we can go.'),
    (p13, 'normal',   4, 'Let me know if you need anything else.'),
    (p13, 'normal',   5, 'Let me check if there are any seats available.'),
    (p13, 'advanced', 1, 'Let me explain why I didn''t respond to your message right away.'),
    (p13, 'advanced', 2, 'Let me be clear — I''m not trying to blame anyone here.'),
    (p13, 'advanced', 3, 'Let me take a look at this and get back to you by tomorrow.'),
    (p13, 'advanced', 4, 'Let me put it another way so it makes more sense.'),
    (p13, 'advanced', 5, 'Let me handle this one — you''ve been doing a lot already.'),
    (p13, 'native',   1, 'Let me get this straight — you''ve never tried pizza before?'),
    (p13, 'native',   2, 'Let me know when you''re free and we''ll figure something out.'),
    (p13, 'native',   3, 'Let me guess — you forgot your charger again, didn''t you?'),
    (p13, 'native',   4, 'Let me jump in here before this gets out of hand.'),
    (p13, 'native',   5, 'Let me sleep on it and I''ll give you an answer tomorrow.');

  -- ============================================================
  -- P14: Thank you for ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p14, 'normal',   1, 'Thank you for helping me with my homework.'),
    (p14, 'normal',   2, 'Thank you for picking me up from school.'),
    (p14, 'normal',   3, 'Thank you for always being there for me.'),
    (p14, 'normal',   4, 'Thank you for cooking dinner for us tonight.'),
    (p14, 'normal',   5, 'Thank you for waiting for me at the station.'),
    (p14, 'advanced', 1, 'Thank you for taking the time to explain everything so clearly.'),
    (p14, 'advanced', 2, 'Thank you for being patient with me while I figured things out.'),
    (p14, 'advanced', 3, 'Thank you for covering my shift — I really owe you one.'),
    (p14, 'advanced', 4, 'Thank you for not making a big deal out of my mistake.'),
    (p14, 'advanced', 5, 'Thank you for believing in me when I didn''t believe in myself.'),
    (p14, 'native',   1, 'Thank you for the heads-up — I had no idea that was happening.'),
    (p14, 'native',   2, 'Thank you for putting up with me during that rough patch.'),
    (p14, 'native',   3, 'Thank you for saying that — it actually means a lot.'),
    (p14, 'native',   4, 'Thank you for keeping it real with me. I needed to hear that.'),
    (p14, 'native',   5, 'Thank you for everything — you''ve been amazing through all of this.');

  -- ============================================================
  -- P15: I just ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p15, 'normal',   1, 'I just woke up five minutes ago.'),
    (p15, 'normal',   2, 'I just got a text from her.'),
    (p15, 'normal',   3, 'I just want to relax at home tonight.'),
    (p15, 'normal',   4, 'I just need some time to think.'),
    (p15, 'normal',   5, 'I just finished all my homework for today.'),
    (p15, 'advanced', 1, 'I just realized I''ve been saying her name wrong this whole time.'),
    (p15, 'advanced', 2, 'I just had the most uncomfortable meeting of my life.'),
    (p15, 'advanced', 3, 'I just wanted to check in and see how you''ve been doing.'),
    (p15, 'advanced', 4, 'I just got off the phone with my landlord — not great news.'),
    (p15, 'advanced', 5, 'I just can''t stop thinking about what she said yesterday.'),
    (p15, 'native',   1, 'I just can''t with this weather — it''s been raining for a week.'),
    (p15, 'native',   2, 'I just need five more minutes, I promise — I''m almost ready.'),
    (p15, 'native',   3, 'I just had a feeling something like this was going to happen.'),
    (p15, 'native',   4, 'I just want to say — no pressure, but you''re kind of amazing.'),
    (p15, 'native',   5, 'I just realized I left my phone on the train. Perfect.');

  -- ============================================================
  -- P16: I can ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p16, 'normal',   1, 'I can meet you after work today.'),
    (p16, 'normal',   2, 'I can help you move this weekend.'),
    (p16, 'normal',   3, 'I can drive you to the airport.'),
    (p16, 'normal',   4, 'I can finish the project by Friday.'),
    (p16, 'normal',   5, 'I can speak a little Spanish too.'),
    (p16, 'advanced', 1, 'I can see where you''re coming from, but I still disagree.'),
    (p16, 'advanced', 2, 'I can take on more responsibility if the team needs support.'),
    (p16, 'advanced', 3, 'I can already tell this is going to be a long week.'),
    (p16, 'advanced', 4, 'I can work from home on Thursdays if that''s more convenient for you.'),
    (p16, 'advanced', 5, 'I can make it work, but I''ll need a bit more time.'),
    (p16, 'native',   1, 'I can get behind that idea — let''s give it a shot.'),
    (p16, 'native',   2, 'I can relate to that so much — I''ve been there.'),
    (p16, 'native',   3, 'I can walk and chew gum at the same time, you know.'),
    (p16, 'native',   4, 'I can see myself doing that — yeah, count me in.'),
    (p16, 'native',   5, 'I can make it happen. Just give me a little room to work.');

  -- ============================================================
  -- P17: I'm still ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p17, 'normal',   1, 'I''m still at the office right now.'),
    (p17, 'normal',   2, 'I''m still waiting for her to reply.'),
    (p17, 'normal',   3, 'I''m still learning how to cook new things.'),
    (p17, 'normal',   4, 'I''m still a little tired from last night.'),
    (p17, 'normal',   5, 'I''m still not sure what I want to do.'),
    (p17, 'advanced', 1, 'I''m still processing everything that happened during the meeting today.'),
    (p17, 'advanced', 2, 'I''m still not over the fact that they cancelled the trip.'),
    (p17, 'advanced', 3, 'I''m still figuring out how to balance work and my personal life.'),
    (p17, 'advanced', 4, 'I''m still getting used to waking up early for the new schedule.'),
    (p17, 'advanced', 5, 'I''m still a bit upset about it, but I''m trying to move on.'),
    (p17, 'native',   1, 'I''m still on my first cup of coffee — don''t push me.'),
    (p17, 'native',   2, 'I''m still not over that ending. What were the writers thinking?'),
    (p17, 'native',   3, 'I''m still here if you need me — take all the time you need.'),
    (p17, 'native',   4, 'I''m still figuring it out, honestly. I''ll let you know when I do.'),
    (p17, 'native',   5, 'I''m still kind of in shock — I didn''t expect that at all.');

  -- ============================================================
  -- P18: I keep ~ing
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p18, 'normal',   1, 'I keep forgetting to charge my phone at night.'),
    (p18, 'normal',   2, 'I keep waking up in the middle of the night.'),
    (p18, 'normal',   3, 'I keep checking my phone every five minutes.'),
    (p18, 'normal',   4, 'I keep making the same mistakes over and over.'),
    (p18, 'normal',   5, 'I keep running into her at the coffee shop.'),
    (p18, 'advanced', 1, 'I keep telling myself I''ll start exercising, but I never actually do.'),
    (p18, 'advanced', 2, 'I keep getting distracted whenever I try to sit down and focus.'),
    (p18, 'advanced', 3, 'I keep putting off this conversation, but I know it has to happen.'),
    (p18, 'advanced', 4, 'I keep comparing myself to others, and it''s really not helping me.'),
    (p18, 'advanced', 5, 'I keep going back to that restaurant — the food there is just unreal.'),
    (p18, 'native',   1, 'I keep meaning to call her, but something always comes up.'),
    (p18, 'native',   2, 'I keep telling myself it''ll get easier, and honestly, it does.'),
    (p18, 'native',   3, 'I keep saying I''ll cut back on coffee, but here we are.'),
    (p18, 'native',   4, 'I keep finding myself thinking about that conversation we had last week.'),
    (p18, 'native',   5, 'I keep starting new shows and never finishing them — it''s a problem.');

  -- ============================================================
  -- P19: I'm about to ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p19, 'normal',   1, 'I''m about to head out — are you ready?'),
    (p19, 'normal',   2, 'I''m about to order food. Do you want anything?'),
    (p19, 'normal',   3, 'I''m about to send the email right now.'),
    (p19, 'normal',   4, 'I''m about to leave the house in five minutes.'),
    (p19, 'normal',   5, 'I''m about to run out of battery on my phone.'),
    (p19, 'advanced', 1, 'I''m about to go into a meeting, so can we talk later?'),
    (p19, 'advanced', 2, 'I''m about to give up on this project after four failed attempts.'),
    (p19, 'advanced', 3, 'I''m about to try something I''ve never done before, which is terrifying.'),
    (p19, 'advanced', 4, 'I''m about to have a very honest conversation with my manager.'),
    (p19, 'advanced', 5, 'I''m about to book the tickets — last chance to change your mind.'),
    (p19, 'native',   1, 'I''m about to lose it if this meeting doesn''t end soon.'),
    (p19, 'native',   2, 'I''m about to grab coffee — you want your usual?'),
    (p19, 'native',   3, 'I''m about to make a move on this — wish me luck.'),
    (p19, 'native',   4, 'I''m about to say something that might sound crazy, but hear me out.'),
    (p19, 'native',   5, 'I''m about to snap — can everyone just lower their voice for a sec?');

  -- ============================================================
  -- P20: I'm supposed to ~
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p20, 'normal',   1, 'I''m supposed to be there by seven.'),
    (p20, 'normal',   2, 'I''m supposed to meet her at the library.'),
    (p20, 'normal',   3, 'I''m supposed to call him back before noon.'),
    (p20, 'normal',   4, 'I''m supposed to finish the report by Friday.'),
    (p20, 'normal',   5, 'I''m supposed to bring something to the party.'),
    (p20, 'advanced', 1, 'I''m supposed to give a presentation tomorrow, but I''m not even close to ready.'),
    (p20, 'advanced', 2, 'I''m supposed to be resting, but I can''t stop checking my emails.'),
    (p20, 'advanced', 3, 'I''m supposed to know the answer to this, but I''m honestly not sure.'),
    (p20, 'advanced', 4, 'I''m supposed to go to dinner with my family, but I''m exhausted.'),
    (p20, 'advanced', 5, 'I''m supposed to hear back from them by end of day, but nothing yet.'),
    (p20, 'native',   1, 'I''m supposed to be off today, but here I am answering emails.'),
    (p20, 'native',   2, 'I''m supposed to be the responsible one, but even I needed a break.'),
    (p20, 'native',   3, 'I''m supposed to meet up with them, but I''m kind of dreading it.'),
    (p20, 'native',   4, 'I''m supposed to act like everything''s fine, but honestly, I''m struggling.'),
    (p20, 'native',   5, 'I''m supposed to be over it by now, but it still bothers me.');

END $$;

-- ============================================================
-- 한국어 번역 삽입
-- ============================================================
INSERT INTO example_translations (example_id, ui_lang, translation)
SELECT e.id, 'ko', t.ko
FROM (VALUES
  -- P11 Normal
  (11, 'normal',   1, '일 때문에 일찍 일어나야 해.'),
  (11, 'normal',   2, '저녁 먹기 전에 이걸 끝내야 해.'),
  (11, 'normal',   3, '오늘 밤에 엄마한테 전화해야 해.'),
  (11, 'normal',   4, '내일 시험 공부를 해야 해.'),
  (11, 'normal',   5, '지금 당장 방을 청소해야 해.'),
  -- P11 Advanced
  (11, 'advanced', 1, '오늘 중으로 보고서를 제출해야 해.'),
  (11, 'advanced', 2, '회의 전에 이걸 해결하는 방법을 찾아야 해.'),
  (11, 'advanced', 3, '어색하겠지만 그녀에게 사과해야 해.'),
  (11, 'advanced', 4, '솔직히 말할게 — 나 이거 준비가 안 됐었어.'),
  (11, 'advanced', 5, '야근할 때 쉬어가는 걸 스스로 챙겨야 해.'),
  -- P11 Native
  (11, 'native',   1, '솔직히 말해서, 여기 기대보다 훨씬 좋다.'),
  (11, 'native',   2, '스마트폰 그만 보고 진짜 자야겠다.'),
  (11, 'native',   3, '솔직하게 말할게 — 이건 안 되고 있어.'),
  (11, 'native',   4, '인정해야겠어, 그거 진짜 인상적이었어.'),
  (11, 'native',   5, '나 가봐야 해 — 이따가 얘기해도 될까?'),
  -- P12 Normal
  (12, 'normal',   1, '나는 오후 6시 이후에는 커피를 마시지 않아.'),
  (12, 'normal',   2, '평일에는 보통 아침을 먹지 않아.'),
  (12, 'normal',   3, '지금 뭐라고 해야 할지 모르겠어.'),
  (12, 'normal',   4, '그건 좋은 생각이 아닌 것 같아.'),
  (12, 'normal',   5, '오늘 밤에 TV 볼 시간이 없어.'),
  -- P12 Advanced
  (12, 'advanced', 1, '내 선택에 대해 다른 사람들이 어떻게 생각하든 별로 신경 안 써.'),
  (12, 'advanced', 2, '왜 그런 간단한 질문에 그렇게 반응했는지 이해가 안 돼.'),
  (12, 'advanced', 3, '평소에 자정 넘어까지 안 깨어 있는데, 이번엔 예외로 했어.'),
  (12, 'advanced', 4, '네 입장을 듣기 전에 섣불리 판단하고 싶지 않아.'),
  (12, 'advanced', 5, '이걸 모두 앞에서 얘기하는 건 불편해.'),
  -- P12 Native
  (12, 'native',   1, '모르겠어, 그냥 나한테는 뭔가 맞지 않는 느낌이야.'),
  (12, 'native',   2, '나 아침은 못 해 — 커피 마시기 전엔 말도 걸지 마.'),
  (12, 'native',   3, '믿기지 않아. 이 상황 전체가 뭔가 이상해.'),
  (12, 'native',   4, '도와주는 건 괜찮은데, 미리 말해줬으면 좋았을 텐데.'),
  (12, 'native',   5, '어떻게 하는 건지 모르겠어 — 걔는 절대 스트레스받아 보이지 않잖아.'),
  -- P13 Normal
  (13, 'normal',   1, '잠깐 생각해볼게.'),
  (13, 'normal',   2, '이걸 어떻게 하는지 보여줄게.'),
  (13, 'normal',   3, '재킷 챙기고 같이 가자.'),
  (13, 'normal',   4, '뭔가 더 필요하면 말해줘.'),
  (13, 'normal',   5, '자리가 있는지 확인해볼게.'),
  -- P13 Advanced
  (13, 'advanced', 1, '바로 답장하지 못한 이유를 설명할게.'),
  (13, 'advanced', 2, '분명히 말할게 — 나는 아무도 비난하려는 게 아니야.'),
  (13, 'advanced', 3, '이거 한번 살펴보고 내일까지 답변해줄게.'),
  (13, 'advanced', 4, '좀 더 이해하기 쉽게 다시 말해볼게.'),
  (13, 'advanced', 5, '이건 내가 처리할게 — 너 이미 많이 했잖아.'),
  -- P13 Native
  (13, 'native',   1, '잠깐, 정리해보자 — 피자를 한 번도 먹어본 적이 없다고?'),
  (13, 'native',   2, '언제 시간 되는지 알려줘, 그러면 뭔가 방법을 찾아볼게.'),
  (13, 'native',   3, '맞춰볼게 — 또 충전기 두고 왔지?'),
  (13, 'native',   4, '이게 손 쓸 수 없게 되기 전에 내가 끼어들게.'),
  (13, 'native',   5, '하룻밤 생각해보고 내일 답줄게.'),
  -- P14 Normal
  (14, 'normal',   1, '숙제 도와줘서 고마워.'),
  (14, 'normal',   2, '학교에서 데리러 와줘서 고마워.'),
  (14, 'normal',   3, '항상 내 곁에 있어줘서 고마워.'),
  (14, 'normal',   4, '오늘 밤 우리 저녁 만들어줘서 고마워.'),
  (14, 'normal',   5, '역에서 기다려줘서 고마워.'),
  -- P14 Advanced
  (14, 'advanced', 1, '이 모든 걸 그렇게 명확하게 설명해주는 데 시간 내줘서 고마워.'),
  (14, 'advanced', 2, '내가 헤매는 동안 참고 기다려줘서 고마워.'),
  (14, 'advanced', 3, '내 교대 대신해줘서 고마워 — 진짜 신세 졌어.'),
  (14, 'advanced', 4, '내 실수를 크게 만들지 않아줘서 고마워.'),
  (14, 'advanced', 5, '내가 스스로를 믿지 못할 때 날 믿어줘서 고마워.'),
  -- P14 Native
  (14, 'native',   1, '미리 알려줘서 고마워 — 그게 일어나고 있는지 전혀 몰랐어.'),
  (14, 'native',   2, '그 힘든 시기에 나를 참아줘서 고마워.'),
  (14, 'native',   3, '그렇게 말해줘서 고마워 — 진짜 많이 위로가 돼.'),
  (14, 'native',   4, '솔직하게 말해줘서 고마워. 그 말이 필요했어.'),
  (14, 'native',   5, '모든 것에 감사해 — 이 모든 과정에서 정말 대단했어.'),
  -- P15 Normal
  (15, 'normal',   1, '5분 전에 막 일어났어.'),
  (15, 'normal',   2, '방금 그녀한테 문자 받았어.'),
  (15, 'normal',   3, '오늘 밤엔 그냥 집에서 쉬고 싶어.'),
  (15, 'normal',   4, '그냥 생각할 시간이 좀 필요해.'),
  (15, 'normal',   5, '방금 오늘 숙제를 다 끝냈어.'),
  -- P15 Advanced
  (15, 'advanced', 1, '방금 내가 계속 그녀 이름을 잘못 발음하고 있었다는 걸 깨달았어.'),
  (15, 'advanced', 2, '방금 내 인생에서 가장 불편한 회의를 했어.'),
  (15, 'advanced', 3, '그냥 어떻게 지내나 안부 확인하고 싶었어.'),
  (15, 'advanced', 4, '방금 집주인이랑 통화했는데 — 좋은 소식이 아니야.'),
  (15, 'advanced', 5, '어제 그녀가 한 말이 머릿속에서 계속 맴돌아.'),
  -- P15 Native
  (15, 'native',   1, '이 날씨 진짜 못 하겠어 — 일주일째 비가 오고 있잖아.'),
  (15, 'native',   2, '딱 5분만 더, 약속해 — 거의 다 됐어.'),
  (15, 'native',   3, '이런 일이 일어날 것 같은 느낌이 있었어.'),
  (15, 'native',   4, '그냥 하고 싶은 말이 있어 — 부담 주려는 건 아닌데, 너 진짜 대단한 것 같아.'),
  (15, 'native',   5, '방금 기차에 폰 두고 내렸다는 걸 깨달았어. 완벽하군.'),
  -- P16 Normal
  (16, 'normal',   1, '오늘 퇴근 후에 만날 수 있어.'),
  (16, 'normal',   2, '이번 주말에 이사 도와줄 수 있어.'),
  (16, 'normal',   3, '공항에 데려다줄 수 있어.'),
  (16, 'normal',   4, '금요일까지 프로젝트 끝낼 수 있어.'),
  (16, 'normal',   5, '나도 스페인어 조금 할 수 있어.'),
  -- P16 Advanced
  (16, 'advanced', 1, '네 입장이 어디서 나오는지는 알겠어, 하지만 난 여전히 동의하지 않아.'),
  (16, 'advanced', 2, '팀이 지원이 필요하다면 내가 더 많은 책임을 맡을 수 있어.'),
  (16, 'advanced', 3, '이번 주가 길 것 같다는 게 벌써 느껴져.'),
  (16, 'advanced', 4, '목요일에 재택근무해도 돼, 그게 더 편하면.'),
  (16, 'advanced', 5, '어떻게든 해볼 수 있어, 하지만 시간이 좀 더 필요해.'),
  -- P16 Native
  (16, 'native',   1, '그 아이디어 지지할 수 있어 — 한번 해보자.'),
  (16, 'native',   2, '그 감정 너무 공감돼 — 나도 거기 있어봤어.'),
  (16, 'native',   3, '나 멀티태스킹 할 수 있어, 알지?'),
  (16, 'native',   4, '나도 그거 할 수 있을 것 같아 — 나도 끼워줘.'),
  (16, 'native',   5, '해낼 수 있어. 그냥 내가 일할 공간만 줘봐.'),
  -- P17 Normal
  (17, 'normal',   1, '나 지금도 아직 사무실에 있어.'),
  (17, 'normal',   2, '아직도 그녀의 답장을 기다리고 있어.'),
  (17, 'normal',   3, '아직도 새로운 요리를 배우고 있어.'),
  (17, 'normal',   4, '어젯밤 때문에 아직도 좀 피곤해.'),
  (17, 'normal',   5, '아직도 내가 무엇을 하고 싶은지 모르겠어.'),
  -- P17 Advanced
  (17, 'advanced', 1, '오늘 회의에서 있었던 일들을 아직도 소화하는 중이야.'),
  (17, 'advanced', 2, '그들이 여행을 취소했다는 사실을 아직도 받아들이지 못하겠어.'),
  (17, 'advanced', 3, '아직도 일과 개인 생활의 균형을 맞추는 방법을 찾고 있어.'),
  (17, 'advanced', 4, '새 일정 때문에 일찍 일어나는 것에 아직도 적응 중이야.'),
  (17, 'advanced', 5, '그것에 대해 아직도 좀 화가 나지만, 극복하려고 노력 중이야.'),
  -- P17 Native
  (17, 'native',   1, '아직 첫 번째 커피도 안 끝냈어 — 재촉하지 마.'),
  (17, 'native',   2, '그 결말 아직도 이해 못 하겠어. 작가들이 무슨 생각이었을까?'),
  (17, 'native',   3, '필요하면 나 아직 여기 있어 — 시간 얼마든지 가져.'),
  (17, 'native',   4, '솔직히 아직도 파악 중이야. 알게 되면 알려줄게.'),
  (17, 'native',   5, '아직도 좀 충격이야 — 전혀 예상 못 했거든.'),
  -- P18 Normal
  (18, 'normal',   1, '밤에 자꾸 폰 충전하는 걸 까먹어.'),
  (18, 'normal',   2, '자꾸 한밤중에 깨게 돼.'),
  (18, 'normal',   3, '5분마다 자꾸 폰을 확인하게 돼.'),
  (18, 'normal',   4, '자꾸 똑같은 실수를 반복하게 돼.'),
  (18, 'normal',   5, '커피숍에서 자꾸 그녀와 마주치게 돼.'),
  -- P18 Advanced
  (18, 'advanced', 1, '운동 시작하겠다고 자꾸 다짐하는데, 실제로 한 번도 안 해.'),
  (18, 'advanced', 2, '집중하려고 앉을 때마다 자꾸 딴 데 정신이 팔려.'),
  (18, 'advanced', 3, '이 대화를 자꾸 미루고 있는데, 꼭 해야 한다는 건 알아.'),
  (18, 'advanced', 4, '자꾸 남들이랑 나를 비교하게 되는데, 전혀 도움이 안 돼.'),
  (18, 'advanced', 5, '자꾸 그 식당에 다시 가게 돼 — 거기 음식이 진짜 말이 안 돼.'),
  -- P18 Native
  (18, 'native',   1, '그녀에게 전화하려고 자꾸 생각하는데, 항상 뭔가가 생겨.'),
  (18, 'native',   2, '자꾸 점점 나아질 거라고 스스로한테 말하는데, 솔직히 그게 맞아.'),
  (18, 'native',   3, '커피 줄이겠다고 자꾸 말하는데, 결국 여기 있네.'),
  (18, 'native',   4, '지난주에 우리가 나눈 대화를 자꾸 생각하게 돼.'),
  (18, 'native',   5, '새 드라마를 자꾸 시작하고 끝을 못 보는데 — 이거 문제야.'),
  -- P19 Normal
  (19, 'normal',   1, '막 나가려던 참이야 — 너 준비됐어?'),
  (19, 'normal',   2, '막 음식 주문하려던 참인데, 뭐 먹을 거 있어?'),
  (19, 'normal',   3, '막 이메일 보내려던 참이야.'),
  (19, 'normal',   4, '5분 후에 막 집에서 나가려던 참이야.'),
  (19, 'normal',   5, '폰 배터리가 막 다 되려던 참이야.'),
  -- P19 Advanced
  (19, 'advanced', 1, '막 회의에 들어가려던 참이라, 나중에 얘기해도 될까?'),
  (19, 'advanced', 2, '네 번이나 실패한 후에 이 프로젝트를 막 포기하려던 참이야.'),
  (19, 'advanced', 3, '지금까지 해본 적 없는 걸 막 시도하려던 참인데, 무서워.'),
  (19, 'advanced', 4, '상사와 매우 솔직한 대화를 막 하려던 참이야.'),
  (19, 'advanced', 5, '막 티켓을 예매하려던 참이야 — 마음 바꿀 마지막 기회야.'),
  -- P19 Native
  (19, 'native',   1, '이 회의가 곧 안 끝나면 나 폭발하기 직전이야.'),
  (19, 'native',   2, '막 커피 사러 가려던 참인데 — 늘 마시던 거 줄까?'),
  (19, 'native',   3, '이거에 대해 막 행동을 취하려던 참이야 — 행운을 빌어줘.'),
  (19, 'native',   4, '좀 이상하게 들릴 수 있는 말을 막 하려던 참인데, 들어봐.'),
  (19, 'native',   5, '나 터지기 직전이야 — 다들 잠깐만 목소리 낮춰줄 수 있어?'),
  -- P20 Normal
  (20, 'normal',   1, '7시까지 거기 있어야 하기로 되어 있어.'),
  (20, 'normal',   2, '도서관에서 그녀를 만나기로 되어 있어.'),
  (20, 'normal',   3, '정오 전에 그에게 다시 전화하기로 되어 있어.'),
  (20, 'normal',   4, '금요일까지 보고서를 끝내기로 되어 있어.'),
  (20, 'normal',   5, '파티에 뭔가 가져가기로 되어 있어.'),
  -- P20 Advanced
  (20, 'advanced', 1, '내일 발표를 해야 하는데, 준비가 전혀 안 됐어.'),
  (20, 'advanced', 2, '쉬어야 하는데, 이메일을 계속 확인하게 돼.'),
  (20, 'advanced', 3, '이것에 대한 답을 알아야 하는데, 솔직히 잘 모르겠어.'),
  (20, 'advanced', 4, '가족이랑 저녁 먹으러 가야 하는데, 너무 피곤해.'),
  (20, 'advanced', 5, '오늘 안으로 답변을 받아야 하는데, 아직 아무것도 없어.'),
  -- P20 Native
  (20, 'native',   1, '오늘 쉬어야 하는데, 어쩌다 보니 이메일 답장하고 있잖아.'),
  (20, 'native',   2, '내가 책임감 있는 사람이어야 하는데, 나도 쉬는 게 필요했어.'),
  (20, 'native',   3, '그들이랑 만나기로 했는데, 좀 가기 싫어.'),
  (20, 'native',   4, '다 괜찮은 척해야 하는데, 솔직히 힘들어.'),
  (20, 'native',   5, '이미 극복했어야 하는데, 아직도 신경 쓰여.')
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
WHERE p.level = 1 AND p.order_index BETWEEN 11 AND 20
GROUP BY p.order_index, pt.pattern_text, e.difficulty
ORDER BY p.order_index, e.difficulty;
