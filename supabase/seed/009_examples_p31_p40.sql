-- PATTO 예문 Seed: 패턴 31~40
-- 패턴당 Normal 5 / Advanced 5 / Native 5 = 15개
-- 총 150개 예문 + 150개 한국어 번역

DO $$
DECLARE
  lang_en UUID;
  p31 UUID; p32 UUID; p33 UUID; p34 UUID; p35 UUID;
  p36 UUID; p37 UUID; p38 UUID; p39 UUID; p40 UUID;
BEGIN
  SELECT id INTO lang_en FROM languages WHERE code = 'en';

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

  -- ============================================================
  -- P31: As long as ~  (~하는 한 / ~이기만 하면)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p31, 'normal',   1, 'As long as you''re happy, I''m happy.'),
    (p31, 'normal',   2, 'As long as it doesn''t rain, we can go.'),
    (p31, 'normal',   3, 'As long as you try your best, that''s enough.'),
    (p31, 'normal',   4, 'As long as I have my phone, I''m fine.'),
    (p31, 'normal',   5, 'As long as you''re safe, nothing else matters.'),
    (p31, 'advanced', 1, 'As long as we keep communication open, we can work through most problems.'),
    (p31, 'advanced', 2, 'As long as you''re making progress, don''t worry about how fast it''s happening.'),
    (p31, 'advanced', 3, 'As long as everyone does their part, we should be able to finish on time.'),
    (p31, 'advanced', 4, 'As long as you''re honest with me, I''ll support whatever decision you make.'),
    (p31, 'advanced', 5, 'As long as there''s a clear plan in place, I''m willing to give it a shot.'),
    (p31, 'native',   1, 'As long as you''re happy with it, that''s really all that matters to me.'),
    (p31, 'native',   2, 'As long as you give it your best shot, there''s nothing to be ashamed of.'),
    (p31, 'native',   3, 'As long as nobody gets hurt, I don''t care how we get there.'),
    (p31, 'native',   4, 'As long as we''re on the same page, I think we''ll be okay.'),
    (p31, 'native',   5, 'As long as you keep showing up, things have a way of working out.');

  -- ============================================================
  -- P32: No wonder ~  (~이니 당연하지)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p32, 'normal',   1, 'No wonder she''s tired — she worked all night.'),
    (p32, 'normal',   2, 'No wonder he''s popular — everyone loves him.'),
    (p32, 'normal',   3, 'No wonder you''re hungry, you skipped lunch.'),
    (p32, 'normal',   4, 'No wonder it''s so crowded here on weekends.'),
    (p32, 'normal',   5, 'No wonder the movie was good — it had great reviews.'),
    (p32, 'advanced', 1, 'No wonder she got the promotion — she''s been putting in extra hours for months.'),
    (p32, 'advanced', 2, 'No wonder he looks exhausted — he''s been dealing with that situation completely alone.'),
    (p32, 'advanced', 3, 'No wonder the place is always full — the food there is absolutely incredible.'),
    (p32, 'advanced', 4, 'No wonder you feel overwhelmed — you''ve been juggling way too many things at once.'),
    (p32, 'advanced', 5, 'No wonder they broke up — they were never on the same page about anything.'),
    (p32, 'native',   1, 'No wonder you''re stressed — that''s a ridiculous amount of pressure for one person.'),
    (p32, 'native',   2, 'No wonder I can''t sleep — I had three cups of coffee after dinner.'),
    (p32, 'native',   3, 'No wonder she looked confused — nobody actually explained what was going on.'),
    (p32, 'native',   4, 'No wonder the project fell apart — there was no clear leader from the start.'),
    (p32, 'native',   5, 'No wonder it felt off — we were all just going through the motions.');

  -- ============================================================
  -- P33: I'd rather ~  (차라리 ~하겠어)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p33, 'normal',   1, 'I''d rather stay home and watch a movie.'),
    (p33, 'normal',   2, 'I''d rather eat something light and simple today.'),
    (p33, 'normal',   3, 'I''d rather not talk about it right now.'),
    (p33, 'normal',   4, 'I''d rather go by myself than keep waiting.'),
    (p33, 'normal',   5, 'I''d rather ask someone than keep guessing.'),
    (p33, 'advanced', 1, 'I''d rather have an honest conversation now than pretend everything is fine.'),
    (p33, 'advanced', 2, 'I''d rather spend money on experiences than things that just collect dust.'),
    (p33, 'advanced', 3, 'I''d rather know the truth upfront, even if it''s not what I want to hear.'),
    (p33, 'advanced', 4, 'I''d rather take the long route and do it right than rush and regret it later.'),
    (p33, 'advanced', 5, 'I''d rather be upfront about my limits than overpromise and let everyone down.'),
    (p33, 'native',   1, 'I''d rather just rip the bandage off and deal with it than keep putting it off.'),
    (p33, 'native',   2, 'I''d rather admit I was wrong than double down on something I know isn''t working.'),
    (p33, 'native',   3, 'I''d rather be a little awkward and honest than smooth and completely fake.'),
    (p33, 'native',   4, 'I''d rather sit in silence than fill the room with noise that means nothing.'),
    (p33, 'native',   5, 'I''d rather try and fail than spend the rest of my life wondering "what if."');

  -- ============================================================
  -- P34: I ended up ~ing  (결국 ~하게 됐어)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p34, 'normal',   1, 'I ended up staying home all night.'),
    (p34, 'normal',   2, 'I ended up ordering pizza for dinner again.'),
    (p34, 'normal',   3, 'I ended up missing the last train home.'),
    (p34, 'normal',   4, 'I ended up sleeping right through my alarm.'),
    (p34, 'normal',   5, 'I ended up watching it all in one night.'),
    (p34, 'advanced', 1, 'I ended up apologizing even though I was pretty sure it wasn''t my fault.'),
    (p34, 'advanced', 2, 'I ended up enjoying the trip way more than I thought I would.'),
    (p34, 'advanced', 3, 'I ended up having a long conversation with a total stranger on the train.'),
    (p34, 'advanced', 4, 'I ended up changing my mind at the very last minute.'),
    (p34, 'advanced', 5, 'I ended up taking the job even though the timing wasn''t great.'),
    (p34, 'native',   1, 'I ended up staying way longer than I planned — the conversation just kept going.'),
    (p34, 'native',   2, 'I ended up crying at that movie, which I absolutely did not see coming.'),
    (p34, 'native',   3, 'I ended up being the one who calmed everyone down, which was kind of ironic.'),
    (p34, 'native',   4, 'I ended up texting first, even though I said I definitely wasn''t going to.'),
    (p34, 'native',   5, 'I ended up loving it — I had zero expectations and it completely blew me away.');

  -- ============================================================
  -- P35: Can you ~?  (~해줄 수 있어?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p35, 'normal',   1, 'Can you pass me the salt, please?'),
    (p35, 'normal',   2, 'Can you help me with this bag?'),
    (p35, 'normal',   3, 'Can you turn the volume down a bit?'),
    (p35, 'normal',   4, 'Can you send me the address again?'),
    (p35, 'normal',   5, 'Can you wait outside for a minute?'),
    (p35, 'advanced', 1, 'Can you walk me through what happened before I jumped in?'),
    (p35, 'advanced', 2, 'Can you double-check the numbers before we send this to the client?'),
    (p35, 'advanced', 3, 'Can you give me a rough timeline for when this will be done?'),
    (p35, 'advanced', 4, 'Can you try to keep your part under ten minutes for the presentation?'),
    (p35, 'advanced', 5, 'Can you let me know when you''re free so we can figure this out?'),
    (p35, 'native',   1, 'Can you do me a favor and just not bring that up again?'),
    (p35, 'native',   2, 'Can you just be straight with me for once? I can handle the truth.'),
    (p35, 'native',   3, 'Can you give me a heads-up next time? That really caught me off guard.'),
    (p35, 'native',   4, 'Can you keep this between us for now? I''m not ready for everyone to know.'),
    (p35, 'native',   5, 'Can you remind me why we''re doing this again? I''m starting to lose the plot.');

  -- ============================================================
  -- P36: Could you ~?  (~해주실 수 있나요?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p36, 'normal',   1, 'Could you say that one more time, please?'),
    (p36, 'normal',   2, 'Could you hold the door for me?'),
    (p36, 'normal',   3, 'Could you move over just a little?'),
    (p36, 'normal',   4, 'Could you explain what that word means again?'),
    (p36, 'normal',   5, 'Could you lend me your charger for a bit?'),
    (p36, 'advanced', 1, 'Could you give me a few minutes before we get into the details?'),
    (p36, 'advanced', 2, 'Could you take a look at this and let me know what you think?'),
    (p36, 'advanced', 3, 'Could you phrase that in a way that''s a little easier to follow?'),
    (p36, 'advanced', 4, 'Could you let me know as soon as you hear something back from them?'),
    (p36, 'advanced', 5, 'Could you handle that side of things while I focus on this one?'),
    (p36, 'native',   1, 'Could you maybe not mention this to anyone else just yet?'),
    (p36, 'native',   2, 'Could you just hear me out before you react? I promise it''ll make sense.'),
    (p36, 'native',   3, 'Could you do me a solid and cover for me just this once?'),
    (p36, 'native',   4, 'Could you give it one more shot before we call it a lost cause?'),
    (p36, 'native',   5, 'Could you tone it down a little? You''re kind of making everyone uncomfortable.');

  -- ============================================================
  -- P37: I'd like to ~  (~하고 싶은데요)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p37, 'normal',   1, 'I''d like to order the pasta, please.'),
    (p37, 'normal',   2, 'I''d like to take a short break now.'),
    (p37, 'normal',   3, 'I''d like to try something from the new menu.'),
    (p37, 'normal',   4, 'I''d like to book a table for two.'),
    (p37, 'normal',   5, 'I''d like to speak with the manager, please.'),
    (p37, 'advanced', 1, 'I''d like to get your honest opinion before I make a final decision.'),
    (p37, 'advanced', 2, 'I''d like to address a few things before we wrap up the meeting.'),
    (p37, 'advanced', 3, 'I''d like to take this opportunity to thank everyone who supported the project.'),
    (p37, 'advanced', 4, 'I''d like to understand your perspective better before I respond to that.'),
    (p37, 'advanced', 5, 'I''d like to revisit this topic once everyone has had a chance to think it over.'),
    (p37, 'native',   1, 'I''d like to think I''m over it, but every time her name comes up, I''m not so sure.'),
    (p37, 'native',   2, 'I''d like to believe she meant well, but the timing was really suspicious.'),
    (p37, 'native',   3, 'I''d like to say I saw that coming, but I was completely caught off guard.'),
    (p37, 'native',   4, 'I''d like to keep things casual — no pressure, just a relaxed conversation.'),
    (p37, 'native',   5, 'I''d like to put this whole thing behind us and start fresh, if that''s okay.');

  -- ============================================================
  -- P38: Why don't we ~?  (우리 ~하는 게 어때?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p38, 'normal',   1, 'Why don''t we go for a walk?'),
    (p38, 'normal',   2, 'Why don''t we order some food first?'),
    (p38, 'normal',   3, 'Why don''t we take a short break?'),
    (p38, 'normal',   4, 'Why don''t we meet at the café?'),
    (p38, 'normal',   5, 'Why don''t we try a different place?'),
    (p38, 'advanced', 1, 'Why don''t we take some time to think before we make any decisions?'),
    (p38, 'advanced', 2, 'Why don''t we split the work so neither of us gets overwhelmed?'),
    (p38, 'advanced', 3, 'Why don''t we just talk it out instead of letting this thing get any bigger?'),
    (p38, 'advanced', 4, 'Why don''t we come back to this after the weekend when everyone''s had a rest?'),
    (p38, 'advanced', 5, 'Why don''t we set a deadline so this doesn''t keep getting pushed back?'),
    (p38, 'native',   1, 'Why don''t we call it even and just move on from this?'),
    (p38, 'native',   2, 'Why don''t we just flip a coin? We''ve been going back and forth forever.'),
    (p38, 'native',   3, 'Why don''t we sleep on it and see how we feel in the morning?'),
    (p38, 'native',   4, 'Why don''t we step outside for a second and get some air?'),
    (p38, 'native',   5, 'Why don''t we give it one more week before we make any big decisions?');

  -- ============================================================
  -- P39: Would you mind ~ing?  (~해줄 수 있어요?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p39, 'normal',   1, 'Would you mind moving your bag a bit?'),
    (p39, 'normal',   2, 'Would you mind turning the TV down?'),
    (p39, 'normal',   3, 'Would you mind opening the window for me?'),
    (p39, 'normal',   4, 'Would you mind taking a photo of us?'),
    (p39, 'normal',   5, 'Would you mind waiting a few more minutes?'),
    (p39, 'advanced', 1, 'Would you mind going over that one more time? I missed part of it.'),
    (p39, 'advanced', 2, 'Would you mind giving me some space to think before I respond to that?'),
    (p39, 'advanced', 3, 'Would you mind keeping the noise down? There''s a call going on next door.'),
    (p39, 'advanced', 4, 'Would you mind letting me handle this part? I think I''ve got it covered.'),
    (p39, 'advanced', 5, 'Would you mind sending me a summary of the key points after the meeting?'),
    (p39, 'native',   1, 'Would you mind not doing that? It''s a little distracting and I''m trying to focus.'),
    (p39, 'native',   2, 'Would you mind giving us a minute? We''re kind of in the middle of something.'),
    (p39, 'native',   3, 'Would you mind toning it down a notch? People are starting to stare.'),
    (p39, 'native',   4, 'Would you mind checking if that''s still available? I don''t want to miss out.'),
    (p39, 'native',   5, 'Would you mind holding that thought? I want to finish this before I lose it.');

  -- ============================================================
  -- P40: Is it okay if ~?  (~해도 괜찮아?)
  -- ============================================================
  INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
    (p40, 'normal',   1, 'Is it okay if I sit here?'),
    (p40, 'normal',   2, 'Is it okay if I leave a little early?'),
    (p40, 'normal',   3, 'Is it okay if I open the window?'),
    (p40, 'normal',   4, 'Is it okay if I bring a friend?'),
    (p40, 'normal',   5, 'Is it okay if I call you later?'),
    (p40, 'advanced', 1, 'Is it okay if I take a few days to think before giving you an answer?'),
    (p40, 'advanced', 2, 'Is it okay if I step out for a second? I''ll be right back.'),
    (p40, 'advanced', 3, 'Is it okay if we reschedule? Something came up that I really can''t ignore.'),
    (p40, 'advanced', 4, 'Is it okay if I''m honest with you about something I''ve been holding back?'),
    (p40, 'advanced', 5, 'Is it okay if we keep this just between the two of us for now?'),
    (p40, 'native',   1, 'Is it okay if I just vent for a second? I won''t take long.'),
    (p40, 'native',   2, 'Is it okay if we skip the small talk today? I''m running a little low.'),
    (p40, 'native',   3, 'Is it okay if I pass on this one? I''m just not feeling it tonight.'),
    (p40, 'native',   4, 'Is it okay if I push back a little? I''m not fully on board yet.'),
    (p40, 'native',   5, 'Is it okay if we just wing it? I think we''ve planned more than enough.');

END $$;

-- ============================================================
-- 한국어 번역 삽입
-- ============================================================
INSERT INTO example_translations (example_id, ui_lang, translation)
SELECT e.id, 'ko', t.ko
FROM (VALUES
  -- P31 Normal
  (31, 'normal',   1, '네가 행복하면 나도 행복해.'),
  (31, 'normal',   2, '비만 안 오면 우리 갈 수 있어.'),
  (31, 'normal',   3, '최선을 다하기만 하면 그걸로 충분해.'),
  (31, 'normal',   4, '폰만 있으면 나는 괜찮아.'),
  (31, 'normal',   5, '네가 안전하기만 하면 다른 건 중요하지 않아.'),
  -- P31 Advanced
  (31, 'advanced', 1, '소통의 창구를 열어두기만 하면 대부분의 문제는 해결할 수 있어.'),
  (31, 'advanced', 2, '발전하고 있는 한, 얼마나 빠른지는 걱정하지 마.'),
  (31, 'advanced', 3, '모두가 각자 역할을 다하는 한, 제때 끝낼 수 있을 거야.'),
  (31, 'advanced', 4, '나한테 솔직하기만 하면, 네가 내리는 어떤 결정이든 지지할게.'),
  (31, 'advanced', 5, '명확한 계획이 있는 한, 한번 해볼 의향이 있어.'),
  -- P31 Native
  (31, 'native',   1, '네가 만족한다면 나한테는 그게 전부야.'),
  (31, 'native',   2, '최선을 다하기만 하면 부끄러울 게 없어.'),
  (31, 'native',   3, '아무도 다치지 않는 한, 어떻게 거기 도달하든 상관없어.'),
  (31, 'native',   4, '서로 같은 생각이기만 하면 우리 괜찮을 것 같아.'),
  (31, 'native',   5, '계속 포기하지 않고 나오기만 하면, 일은 어떻게든 풀려.'),
  -- P32 Normal
  (32, 'normal',   1, '그녀가 피곤한 게 당연하지 — 밤새 일했잖아.'),
  (32, 'normal',   2, '그가 인기 있는 게 당연하지 — 모두가 좋아하잖아.'),
  (32, 'normal',   3, '배고픈 게 당연하지, 점심을 거렀잖아.'),
  (32, 'normal',   4, '주말에 여기가 사람 많은 게 당연하지.'),
  (32, 'normal',   5, '그 영화가 좋은 게 당연하지 — 리뷰가 엄청났잖아.'),
  -- P32 Advanced
  (32, 'advanced', 1, '그녀가 승진한 게 당연하지 — 몇 달째 초과근무를 해왔잖아.'),
  (32, 'advanced', 2, '그가 지쳐 보이는 게 당연하지 — 혼자서 그 상황을 감당해왔잖아.'),
  (32, 'advanced', 3, '그 가게가 항상 꽉 차 있는 게 당연하지 — 음식이 정말 말이 안 되게 맛있거든.'),
  (32, 'advanced', 4, '네가 압도되는 게 당연하지 — 한꺼번에 너무 많은 걸 하고 있잖아.'),
  (32, 'advanced', 5, '그들이 헤어진 게 당연하지 — 어떤 것도 같은 방향을 보지 않았잖아.'),
  -- P32 Native
  (32, 'native',   1, '네가 스트레스받는 게 당연하지 — 한 사람한테 말도 안 되는 양의 압박이잖아.'),
  (32, 'native',   2, '잠을 못 자는 게 당연하지 — 저녁 식사 후에 커피를 세 잔이나 마셨잖아.'),
  (32, 'native',   3, '그녀가 어리둥절한 게 당연하지 — 아무도 실제로 무슨 일인지 설명을 안 해줬잖아.'),
  (32, 'native',   4, '프로젝트가 무너진 게 당연하지 — 처음부터 명확한 리더가 없었잖아.'),
  (32, 'native',   5, '분위기가 어색한 게 당연하지 — 우리 모두 그냥 형식적으로 하고 있었잖아.'),
  -- P33 Normal
  (33, 'normal',   1, '차라리 집에서 영화나 볼게.'),
  (33, 'normal',   2, '차라리 오늘은 가볍고 간단한 걸 먹을게.'),
  (33, 'normal',   3, '지금은 차라리 그 얘기 안 하는 게 낫겠어.'),
  (33, 'normal',   4, '계속 기다리는 것보다 차라리 혼자 가는 게 낫겠어.'),
  (33, 'normal',   5, '계속 추측하는 것보다 차라리 누군가한테 물어보는 게 낫겠어.'),
  -- P33 Advanced
  (33, 'advanced', 1, '다 괜찮은 척하는 것보다 차라리 지금 솔직한 대화를 나누는 게 낫겠어.'),
  (33, 'advanced', 2, '먼지만 쌓이는 물건보다 차라리 경험에 돈을 쓰는 게 낫겠어.'),
  (33, 'advanced', 3, '듣기 싫은 소리라도 차라리 처음부터 진실을 아는 게 낫겠어.'),
  (33, 'advanced', 4, '서두르고 나중에 후회하는 것보다 차라리 돌아가더라도 제대로 하는 게 낫겠어.'),
  (33, 'advanced', 5, '약속을 지키지 못해 다들 실망시키는 것보다 차라리 솔직하게 한계를 말하는 게 낫겠어.'),
  -- P33 Native
  (33, 'native',   1, '질질 끄는 것보다 차라리 그냥 확 해결해버리는 게 낫겠어.'),
  (33, 'native',   2, '안 되고 있다는 걸 아는데 고집 부리는 것보다 차라리 틀렸다고 인정하는 게 낫겠어.'),
  (33, 'native',   3, '매끄럽지만 가식적인 것보다 차라리 약간 어색하더라도 솔직한 게 나아.'),
  (33, 'native',   4, '아무 의미 없는 말로 공기를 채우는 것보다 차라리 침묵 속에 있는 게 낫겠어.'),
  (33, 'native',   5, '"만약에 그랬다면"이라며 평생 후회하는 것보다 차라리 시도하고 실패하는 게 낫겠어.'),
  -- P34 Normal
  (34, 'normal',   1, '결국 밤새 집에 있게 됐어.'),
  (34, 'normal',   2, '결국 또 저녁으로 피자를 시키게 됐어.'),
  (34, 'normal',   3, '결국 막차를 놓치게 됐어.'),
  (34, 'normal',   4, '결국 알람을 그냥 자고 넘기게 됐어.'),
  (34, 'normal',   5, '결국 하룻밤에 다 보게 됐어.'),
  -- P34 Advanced
  (34, 'advanced', 1, '내 잘못이 아닌 것 같았는데도 결국 내가 사과하게 됐어.'),
  (34, 'advanced', 2, '생각했던 것보다 그 여행이 훨씬 좋아서 결국 즐기게 됐어.'),
  (34, 'advanced', 3, '결국 기차에서 완전히 모르는 사람이랑 긴 대화를 하게 됐어.'),
  (34, 'advanced', 4, '결국 마지막 순간에 마음을 바꾸게 됐어.'),
  (34, 'advanced', 5, '타이밍이 좋지 않았는데도 결국 그 일자리를 받아들이게 됐어.'),
  -- P34 Native
  (34, 'native',   1, '계획보다 훨씬 오래 있게 됐어 — 대화가 계속 이어지더라고.'),
  (34, 'native',   2, '그 영화에서 결국 울게 됐어, 전혀 예상 못 했는데.'),
  (34, 'native',   3, '결국 내가 모두를 진정시키는 역할이 됐어, 좀 아이러니하게도.'),
  (34, 'native',   4, '절대 먼저 문자 안 한다고 했는데 결국 내가 먼저 보내게 됐어.'),
  (34, 'native',   5, '결국 완전히 빠지게 됐어 — 기대가 없었는데 완전히 날려버렸어.'),
  -- P35 Normal
  (35, 'normal',   1, '소금 좀 건네줄 수 있어?'),
  (35, 'normal',   2, '이 가방 들어줄 수 있어?'),
  (35, 'normal',   3, '소리 좀 줄여줄 수 있어?'),
  (35, 'normal',   4, '주소 다시 보내줄 수 있어?'),
  (35, 'normal',   5, '잠깐 밖에서 기다려줄 수 있어?'),
  -- P35 Advanced
  (35, 'advanced', 1, '내가 끼어들기 전에 어떤 일이 있었는지 설명해줄 수 있어?'),
  (35, 'advanced', 2, '이거 고객한테 보내기 전에 수치 한번 다시 확인해줄 수 있어?'),
  (35, 'advanced', 3, '이게 언제쯤 될지 대략적인 일정을 알려줄 수 있어?'),
  (35, 'advanced', 4, '발표에서 네 파트를 10분 이내로 해줄 수 있어?'),
  (35, 'advanced', 5, '언제 시간 나는지 알려줄 수 있어? 같이 이 문제 해결해보자.'),
  -- P35 Native
  (35, 'native',   1, '부탁인데 그 얘기는 다시 꺼내지 않아줄 수 있어?'),
  (35, 'native',   2, '한 번만 솔직하게 말해줄 수 있어? 진실은 감당할 수 있어.'),
  (35, 'native',   3, '다음엔 미리 알려줄 수 있어? 진짜 완전히 허를 찔렸어.'),
  (35, 'native',   4, '일단 우리 둘만 알고 있을 수 있어? 아직 모두한테 알릴 준비가 안 됐어.'),
  (35, 'native',   5, '우리가 왜 이걸 하는 건지 다시 상기시켜줄 수 있어? 점점 갈피를 잃겠어.'),
  -- P36 Normal
  (36, 'normal',   1, '다시 한번 말씀해 주실 수 있나요?'),
  (36, 'normal',   2, '문 좀 잡아주실 수 있나요?'),
  (36, 'normal',   3, '조금만 옆으로 이동해 주실 수 있나요?'),
  (36, 'normal',   4, '저 단어가 무슨 뜻인지 다시 설명해 주실 수 있나요?'),
  (36, 'normal',   5, '충전기 잠깐 빌려주실 수 있나요?'),
  -- P36 Advanced
  (36, 'advanced', 1, '세부 내용에 들어가기 전에 잠깐 시간을 주실 수 있나요?'),
  (36, 'advanced', 2, '이거 한번 봐주시고 어떻게 생각하시는지 알려주실 수 있나요?'),
  (36, 'advanced', 3, '좀 더 이해하기 쉽게 말씀해 주실 수 있나요?'),
  (36, 'advanced', 4, '거기서 답변이 오는 대로 바로 알려주실 수 있나요?'),
  (36, 'advanced', 5, '제가 이쪽을 집중하는 동안 저쪽을 담당해 주실 수 있나요?'),
  -- P36 Native
  (36, 'native',   1, '혹시 이 얘기를 아직 다른 사람한테는 하지 않아주실 수 있나요?'),
  (36, 'native',   2, '반응하기 전에 제 말 끝까지 들어주실 수 있나요? 이해가 되실 거예요.'),
  (36, 'native',   3, '이번 한 번만 저 대신 봐주실 수 있나요?'),
  (36, 'native',   4, '포기하기 전에 한 번만 더 시도해 주실 수 있나요?'),
  (36, 'native',   5, '분위기를 좀 낮춰주실 수 있나요? 다들 불편해하는 것 같아요.'),
  -- P37 Normal
  (37, 'normal',   1, '파스타로 주문하고 싶은데요.'),
  (37, 'normal',   2, '잠깐 쉬고 싶은데요.'),
  (37, 'normal',   3, '새 메뉴에서 뭔가 먹어보고 싶은데요.'),
  (37, 'normal',   4, '2인 테이블 예약하고 싶은데요.'),
  (37, 'normal',   5, '매니저와 얘기하고 싶은데요.'),
  -- P37 Advanced
  (37, 'advanced', 1, '최종 결정을 내리기 전에 솔직한 의견을 듣고 싶은데요.'),
  (37, 'advanced', 2, '회의를 마무리하기 전에 몇 가지 말씀드리고 싶은데요.'),
  (37, 'advanced', 3, '이 기회를 빌려 프로젝트를 지원해주신 모든 분께 감사 인사를 드리고 싶어요.'),
  (37, 'advanced', 4, '답변하기 전에 먼저 상대방의 관점을 더 잘 이해하고 싶어요.'),
  (37, 'advanced', 5, '모두가 충분히 생각할 시간을 가진 후 이 주제를 다시 다루고 싶어요.'),
  -- P37 Native
  (37, 'native',   1, '이미 극복했다고 생각하고 싶은데, 그녀 이름이 나올 때마다 그게 아닌 것 같아.'),
  (37, 'native',   2, '좋은 의도였다고 믿고 싶은데, 타이밍이 너무 수상해.'),
  (37, 'native',   3, '예상했다고 말하고 싶은데, 완전히 허를 찔렸어.'),
  (37, 'native',   4, '편하게 가고 싶어 — 부담 없이 그냥 자연스럽게 얘기하자.'),
  (37, 'native',   5, '이 모든 걸 뒤로하고 새로 시작했으면 해, 괜찮다면.'),
  -- P38 Normal
  (38, 'normal',   1, '우리 산책하러 가는 게 어때?'),
  (38, 'normal',   2, '우리 먼저 음식 시키는 게 어때?'),
  (38, 'normal',   3, '우리 잠깐 쉬는 게 어때?'),
  (38, 'normal',   4, '우리 카페에서 만나는 게 어때?'),
  (38, 'normal',   5, '우리 다른 곳을 시도해보는 게 어때?'),
  -- P38 Advanced
  (38, 'advanced', 1, '결정하기 전에 좀 더 생각해보는 시간을 갖는 게 어때?'),
  (38, 'advanced', 2, '우리 둘 다 부담되지 않게 일을 나눠서 하는 게 어때?'),
  (38, 'advanced', 3, '이게 더 커지기 전에 그냥 솔직하게 얘기하는 게 어때?'),
  (38, 'advanced', 4, '다들 좀 쉬고 나서 주말 이후에 다시 이 얘기를 하는 게 어때?'),
  (38, 'advanced', 5, '계속 밀리지 않게 마감일을 정해두는 게 어때?'),
  -- P38 Native
  (38, 'native',   1, '서로 비긴 걸로 하고 이 문제에서 그냥 넘어가는 게 어때?'),
  (38, 'native',   2, '그냥 동전 던지는 게 어때? 너무 오래 왔다 갔다 했잖아.'),
  (38, 'native',   3, '하룻밤 자고 아침에 어떤 기분인지 보는 게 어때?'),
  (38, 'native',   4, '잠깐 밖에 나가서 바람 좀 쐬는 게 어때?'),
  (38, 'native',   5, '큰 결정을 내리기 전에 일주일만 더 지켜보는 게 어때?'),
  -- P39 Normal
  (39, 'normal',   1, '가방을 조금 옮겨주실 수 있나요?'),
  (39, 'normal',   2, 'TV 소리 좀 줄여주실 수 있나요?'),
  (39, 'normal',   3, '창문 좀 열어주실 수 있나요?'),
  (39, 'normal',   4, '저희 사진 좀 찍어주실 수 있나요?'),
  (39, 'normal',   5, '몇 분만 더 기다려주실 수 있나요?'),
  -- P39 Advanced
  (39, 'advanced', 1, '한 번 더 설명해 주실 수 있나요? 중간에 놓친 부분이 있어서요.'),
  (39, 'advanced', 2, '제가 대답하기 전에 생각할 시간을 좀 주실 수 있나요?'),
  (39, 'advanced', 3, '소리를 좀 줄여주실 수 있나요? 옆방에서 통화 중이에요.'),
  (39, 'advanced', 4, '이 부분은 제가 처리하게 해주실 수 있나요? 잘 할 수 있을 것 같아요.'),
  (39, 'advanced', 5, '회의 후에 핵심 내용을 정리해서 보내주실 수 있나요?'),
  -- P39 Native
  (39, 'native',   1, '그거 좀 그만해 주실 수 있나요? 집중하려는데 좀 방해돼서요.'),
  (39, 'native',   2, '잠깐 자리 좀 비워주실 수 있나요? 지금 중요한 얘기 중이에요.'),
  (39, 'native',   3, '좀 낮춰주실 수 있나요? 사람들이 쳐다보고 있어요.'),
  (39, 'native',   4, '아직 가능한지 확인해 주실 수 있나요? 놓치고 싶지 않아서요.'),
  (39, 'native',   5, '그 생각 잠깐 멈춰주실 수 있나요? 놓치기 전에 이것부터 끝내고 싶어요.'),
  -- P40 Normal
  (40, 'normal',   1, '여기 앉아도 괜찮아?'),
  (40, 'normal',   2, '조금 일찍 나가도 괜찮아?'),
  (40, 'normal',   3, '창문 열어도 괜찮아?'),
  (40, 'normal',   4, '친구 데려와도 괜찮아?'),
  (40, 'normal',   5, '나중에 전화해도 괜찮아?'),
  -- P40 Advanced
  (40, 'advanced', 1, '답변 드리기 전에 며칠 생각할 시간을 가져도 괜찮을까요?'),
  (40, 'advanced', 2, '잠깐 나갔다 와도 괜찮아? 금방 돌아올게.'),
  (40, 'advanced', 3, '일정 변경해도 괜찮을까요? 무시할 수 없는 일이 생겼어요.'),
  (40, 'advanced', 4, '계속 마음속에 담아뒀던 걸 솔직하게 얘기해도 괜찮을까요?'),
  (40, 'advanced', 5, '일단 우리 둘만 알고 있어도 괜찮을까요?'),
  -- P40 Native
  (40, 'native',   1, '잠깐 속에 있는 거 털어놔도 괜찮아? 오래 안 걸릴게.'),
  (40, 'native',   2, '오늘은 어색한 안부 인사 생략해도 괜찮아? 좀 기운이 없어서.'),
  (40, 'native',   3, '이번엔 빠져도 괜찮아? 오늘 밤엔 솔직히 별로 하고 싶지 않아.'),
  (40, 'native',   4, '살짝 반대 의견을 내도 괜찮아? 아직 완전히 동의하지 않아서.'),
  (40, 'native',   5, '그냥 즉흥적으로 해도 괜찮아? 충분히 계획한 것 같아.')
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
WHERE p.level = 1 AND p.order_index BETWEEN 31 AND 40
GROUP BY p.order_index, pt.pattern_text, e.difficulty
ORDER BY p.order_index, e.difficulty;
