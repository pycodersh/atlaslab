-- PATTO Sample Data: Level 1, 10 patterns, 2 stories
-- Seed: 002_sample_patterns.sql

DO $$
DECLARE
  lang_en UUID;

  p01 UUID; p02 UUID; p03 UUID; p04 UUID; p05 UUID;
  p06 UUID; p07 UUID; p08 UUID; p09 UUID; p10 UUID;

  s01 UUID; s02 UUID;
BEGIN

-- ============================================================
-- 언어 ID 조회
-- ============================================================
SELECT id INTO lang_en FROM languages WHERE code = 'en';

-- ============================================================
-- PATTERNS (10개)
-- ============================================================
INSERT INTO patterns (id, language_id, level, order_index, is_published)
VALUES
  (gen_random_uuid(), lang_en, 1, 1,  true),
  (gen_random_uuid(), lang_en, 1, 2,  true),
  (gen_random_uuid(), lang_en, 1, 3,  true),
  (gen_random_uuid(), lang_en, 1, 4,  true),
  (gen_random_uuid(), lang_en, 1, 5,  true),
  (gen_random_uuid(), lang_en, 1, 6,  true),
  (gen_random_uuid(), lang_en, 1, 7,  true),
  (gen_random_uuid(), lang_en, 1, 8,  true),
  (gen_random_uuid(), lang_en, 1, 9,  true),
  (gen_random_uuid(), lang_en, 1, 10, true);

-- ID 조회
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

-- ============================================================
-- PATTERN TRANSLATIONS (한국어 의미)
-- ============================================================
INSERT INTO pattern_translations (pattern_id, ui_lang, pattern_text, meaning) VALUES
  (p01, 'ko', 'I want to ~',           '~하고 싶어'),
  (p02, 'ko', 'I''m thinking about ~', '~을 생각 중이야'),
  (p03, 'ko', 'There''s a chance ~',   '~할 가능성이 있어'),
  (p04, 'ko', 'The reason is ~',       '이유는 ~ 때문이야'),
  (p05, 'ko', 'It turns out ~',        '알고 보니 ~이더라'),
  (p06, 'ko', 'I''m planning to ~',    '~할 계획이야'),
  (p07, 'ko', 'I used to ~',           '예전에 ~했었어'),
  (p08, 'ko', 'I can''t help ~ing',    '~하지 않을 수 없어'),
  (p09, 'ko', 'It seems like ~',       '~인 것 같아'),
  (p10, 'ko', 'I''m looking forward to ~', '~이 기대돼');

-- ============================================================
-- EXAMPLES — Pattern 01: "I want to ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  -- normal
  (p01, 'normal',   1, 'I want to learn English.'),
  (p01, 'normal',   2, 'I want to sleep early tonight.'),
  (p01, 'normal',   3, 'I want to eat something good.'),
  (p01, 'normal',   4, 'I want to take a walk outside.'),
  (p01, 'normal',   5, 'I want to call my friend.'),
  -- advanced
  (p01, 'advanced', 1, 'I want to improve my communication skills at work.'),
  (p01, 'advanced', 2, 'I want to start building a consistent morning routine.'),
  (p01, 'advanced', 3, 'I want to save enough money to travel next year.'),
  (p01, 'advanced', 4, 'I want to find a job that aligns with my values.'),
  (p01, 'advanced', 5, 'I want to spend more quality time with my family.'),
  -- native
  (p01, 'native',   1, 'I want to get my foot in the door at a decent company.'),
  (p01, 'native',   2, 'I want to cut back on screen time and actually live my life.'),
  (p01, 'native',   3, 'I want to finally pull the trigger on starting my own thing.'),
  (p01, 'native',   4, 'I want to stop overthinking and just go for it.'),
  (p01, 'native',   5, 'I want to carve out some me-time before the week gets crazy.');

-- ============================================================
-- EXAMPLES — Pattern 02: "I'm thinking about ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p02, 'normal',   1, 'I''m thinking about going home.'),
  (p02, 'normal',   2, 'I''m thinking about changing my hairstyle.'),
  (p02, 'normal',   3, 'I''m thinking about watching a movie tonight.'),
  (p02, 'normal',   4, 'I''m thinking about ordering pizza.'),
  (p02, 'normal',   5, 'I''m thinking about taking a nap.'),
  (p02, 'advanced', 1, 'I''m thinking about switching to a different career path.'),
  (p02, 'advanced', 2, 'I''m thinking about enrolling in an online course this semester.'),
  (p02, 'advanced', 3, 'I''m thinking about moving to a smaller city for a quieter life.'),
  (p02, 'advanced', 4, 'I''m thinking about negotiating a raise with my manager.'),
  (p02, 'advanced', 5, 'I''m thinking about starting a side project on weekends.'),
  (p02, 'native',   1, 'I''m thinking about jumping ship before things get worse.'),
  (p02, 'native',   2, 'I''m thinking about going off the grid for a bit to clear my head.'),
  (p02, 'native',   3, 'I''m thinking about pulling back from social media for good.'),
  (p02, 'native',   4, 'I''m thinking about pivoting my whole approach to this project.'),
  (p02, 'native',   5, 'I''m thinking about giving freelancing a real shot this year.');

-- ============================================================
-- EXAMPLES — Pattern 03: "There's a chance ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p03, 'normal',   1, 'There''s a chance it will rain today.'),
  (p03, 'normal',   2, 'There''s a chance he will call you back.'),
  (p03, 'normal',   3, 'There''s a chance the store is closed.'),
  (p03, 'normal',   4, 'There''s a chance we will be late.'),
  (p03, 'normal',   5, 'There''s a chance she already knows.'),
  (p03, 'advanced', 1, 'There''s a chance the project might get delayed due to budget issues.'),
  (p03, 'advanced', 2, 'There''s a chance they will offer me a better position after the review.'),
  (p03, 'advanced', 3, 'There''s a chance the market will recover by the end of the quarter.'),
  (p03, 'advanced', 4, 'There''s a chance this approach could backfire if we''re not careful.'),
  (p03, 'advanced', 5, 'There''s a chance the new policy will affect our timeline significantly.'),
  (p03, 'native',   1, 'There''s a chance this whole thing blows up in our faces.'),
  (p03, 'native',   2, 'There''s a slim chance they''ll actually follow through on that promise.'),
  (p03, 'native',   3, 'There''s a chance he''s just stringing us along to buy more time.'),
  (p03, 'native',   4, 'There''s a decent chance the deal falls through at the last minute.'),
  (p03, 'native',   5, 'There''s a chance she''s reading too much into the whole situation.');

-- ============================================================
-- EXAMPLES — Pattern 04: "The reason is ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p04, 'normal',   1, 'The reason is I was tired.'),
  (p04, 'normal',   2, 'The reason is it was too expensive.'),
  (p04, 'normal',   3, 'The reason is I forgot.'),
  (p04, 'normal',   4, 'The reason is I was busy.'),
  (p04, 'normal',   5, 'The reason is I didn''t know.'),
  (p04, 'advanced', 1, 'The reason is I''ve been struggling to maintain a clear schedule.'),
  (p04, 'advanced', 2, 'The reason is the team lacked proper communication from the start.'),
  (p04, 'advanced', 3, 'The reason is the initial plan didn''t account for potential risks.'),
  (p04, 'advanced', 4, 'The reason is I haven''t been taking care of my physical health.'),
  (p04, 'advanced', 5, 'The reason is I kept putting off the difficult conversations.'),
  (p04, 'native',   1, 'The reason is I dropped the ball and didn''t follow up in time.'),
  (p04, 'native',   2, 'The reason is we got blindsided by a last-minute change in direction.'),
  (p04, 'native',   3, 'The reason is I bit off more than I could chew this quarter.'),
  (p04, 'native',   4, 'The reason is nobody wanted to be the one to rock the boat.'),
  (p04, 'native',   5, 'The reason is I let perfect be the enemy of good for too long.');

-- ============================================================
-- EXAMPLES — Pattern 05: "It turns out ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p05, 'normal',   1, 'It turns out I was wrong.'),
  (p05, 'normal',   2, 'It turns out she was right.'),
  (p05, 'normal',   3, 'It turns out the movie was great.'),
  (p05, 'normal',   4, 'It turns out he lives nearby.'),
  (p05, 'normal',   5, 'It turns out I like coffee.'),
  (p05, 'advanced', 1, 'It turns out the shortcut actually made things more complicated.'),
  (p05, 'advanced', 2, 'It turns out the skills I learned back then are now incredibly relevant.'),
  (p05, 'advanced', 3, 'It turns out getting enough sleep makes a huge difference in productivity.'),
  (p05, 'advanced', 4, 'It turns out the first candidate we interviewed was the strongest one.'),
  (p05, 'advanced', 5, 'It turns out the feedback I dreaded receiving was actually very helpful.'),
  (p05, 'native',   1, 'It turns out I was way off base with my initial read of the situation.'),
  (p05, 'native',   2, 'It turns out the so-called shortcut was a complete dead end.'),
  (p05, 'native',   3, 'It turns out burning bridges early in your career really does come back to haunt you.'),
  (p05, 'native',   4, 'It turns out gut feelings are worth something after all.'),
  (p05, 'native',   5, 'It turns out the whole thing was a misunderstanding from the very beginning.');

-- ============================================================
-- EXAMPLES — Pattern 06: "I'm planning to ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p06, 'normal',   1, 'I''m planning to go shopping tomorrow.'),
  (p06, 'normal',   2, 'I''m planning to cook dinner tonight.'),
  (p06, 'normal',   3, 'I''m planning to visit my parents this weekend.'),
  (p06, 'normal',   4, 'I''m planning to wake up early tomorrow.'),
  (p06, 'normal',   5, 'I''m planning to buy a new phone soon.'),
  (p06, 'advanced', 1, 'I''m planning to take a certification course to boost my career prospects.'),
  (p06, 'advanced', 2, 'I''m planning to restructure my monthly budget starting next week.'),
  (p06, 'advanced', 3, 'I''m planning to have a frank conversation with my manager about my goals.'),
  (p06, 'advanced', 4, 'I''m planning to dedicate at least an hour a day to personal development.'),
  (p06, 'advanced', 5, 'I''m planning to launch a small pilot project before committing fully.'),
  (p06, 'native',   1, 'I''m planning to lay low for a while until things cool down.'),
  (p06, 'native',   2, 'I''m planning to make a clean break and start fresh somewhere new.'),
  (p06, 'native',   3, 'I''m planning to put my foot down and stop taking on extra work.'),
  (p06, 'native',   4, 'I''m planning to touch base with some old contacts and see what''s out there.'),
  (p06, 'native',   5, 'I''m planning to step back from the day-to-day and focus on the big picture.');

-- ============================================================
-- EXAMPLES — Pattern 07: "I used to ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p07, 'normal',   1, 'I used to play soccer every day.'),
  (p07, 'normal',   2, 'I used to wake up late on weekends.'),
  (p07, 'normal',   3, 'I used to hate vegetables.'),
  (p07, 'normal',   4, 'I used to live in Busan.'),
  (p07, 'normal',   5, 'I used to read a lot as a kid.'),
  (p07, 'advanced', 1, 'I used to spend hours commuting, but working remotely changed everything.'),
  (p07, 'advanced', 2, 'I used to feel anxious in social settings, but I''ve grown a lot since then.'),
  (p07, 'advanced', 3, 'I used to think multitasking was a strength until I learned it actually hurts focus.'),
  (p07, 'advanced', 4, 'I used to prioritize work above everything, but my perspective has shifted.'),
  (p07, 'advanced', 5, 'I used to dismiss exercise as a waste of time, but now I can''t live without it.'),
  (p07, 'native',   1, 'I used to burn the candle at both ends and thought it made me productive.'),
  (p07, 'native',   2, 'I used to let people walk all over me before I learned to set boundaries.'),
  (p07, 'native',   3, 'I used to fly by the seat of my pants, but I''ve learned structure actually helps.'),
  (p07, 'native',   4, 'I used to sweep things under the rug instead of dealing with them head-on.'),
  (p07, 'native',   5, 'I used to think I had to have it all figured out before taking the first step.');

-- ============================================================
-- EXAMPLES — Pattern 08: "I can't help ~ing"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p08, 'normal',   1, 'I can''t help smiling when I see puppies.'),
  (p08, 'normal',   2, 'I can''t help eating snacks at night.'),
  (p08, 'normal',   3, 'I can''t help checking my phone all the time.'),
  (p08, 'normal',   4, 'I can''t help laughing when I''m nervous.'),
  (p08, 'normal',   5, 'I can''t help thinking about the weekend.'),
  (p08, 'advanced', 1, 'I can''t help feeling overwhelmed when deadlines pile up all at once.'),
  (p08, 'advanced', 2, 'I can''t help comparing myself to others even though I know it''s unhealthy.'),
  (p08, 'advanced', 3, 'I can''t help second-guessing my decisions when the stakes feel high.'),
  (p08, 'advanced', 4, 'I can''t help worrying about things that are completely out of my control.'),
  (p08, 'advanced', 5, 'I can''t help noticing small inefficiencies in the way we run meetings.'),
  (p08, 'native',   1, 'I can''t help cringing every time I look back at my early work.'),
  (p08, 'native',   2, 'I can''t help feeling like I''m always playing catch-up no matter what I do.'),
  (p08, 'native',   3, 'I can''t help rolling my eyes when people talk without actually saying anything.'),
  (p08, 'native',   4, 'I can''t help overthinking every little thing before I pull the trigger.'),
  (p08, 'native',   5, 'I can''t help reading between the lines even when I''m told to take things at face value.');

-- ============================================================
-- EXAMPLES — Pattern 09: "It seems like ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p09, 'normal',   1, 'It seems like it''s going to rain.'),
  (p09, 'normal',   2, 'It seems like he is tired.'),
  (p09, 'normal',   3, 'It seems like the bus is late.'),
  (p09, 'normal',   4, 'It seems like she doesn''t like it.'),
  (p09, 'normal',   5, 'It seems like everyone is busy today.'),
  (p09, 'advanced', 1, 'It seems like the team is struggling to meet the original deadline.'),
  (p09, 'advanced', 2, 'It seems like there''s been a miscommunication somewhere along the way.'),
  (p09, 'advanced', 3, 'It seems like the market is shifting faster than anyone anticipated.'),
  (p09, 'advanced', 4, 'It seems like the decision has already been made behind closed doors.'),
  (p09, 'advanced', 5, 'It seems like our initial assumptions about the users were slightly off.'),
  (p09, 'native',   1, 'It seems like everyone is just going through the motions at this point.'),
  (p09, 'native',   2, 'It seems like we''re talking past each other no matter how hard we try.'),
  (p09, 'native',   3, 'It seems like things are finally starting to fall into place.'),
  (p09, 'native',   4, 'It seems like she''s got an axe to grind with the whole department.'),
  (p09, 'native',   5, 'It seems like we''ve been going around in circles without making any real progress.');

-- ============================================================
-- EXAMPLES — Pattern 10: "I'm looking forward to ~"
-- ============================================================
INSERT INTO examples (pattern_id, difficulty, order_index, sentence) VALUES
  (p10, 'normal',   1, 'I''m looking forward to the weekend.'),
  (p10, 'normal',   2, 'I''m looking forward to dinner tonight.'),
  (p10, 'normal',   3, 'I''m looking forward to your visit.'),
  (p10, 'normal',   4, 'I''m looking forward to the holiday.'),
  (p10, 'normal',   5, 'I''m looking forward to seeing you again.'),
  (p10, 'advanced', 1, 'I''m looking forward to gaining more hands-on experience in this new role.'),
  (p10, 'advanced', 2, 'I''m looking forward to finally taking a proper break after such a hectic quarter.'),
  (p10, 'advanced', 3, 'I''m looking forward to the collaboration opportunities this partnership will bring.'),
  (p10, 'advanced', 4, 'I''m looking forward to seeing how the team grows over the next six months.'),
  (p10, 'advanced', 5, 'I''m looking forward to building a stronger daily routine once things settle down.'),
  (p10, 'native',   1, 'I''m looking forward to finally getting some breathing room after all this chaos.'),
  (p10, 'native',   2, 'I''m looking forward to seeing if all this hard work actually pays off.'),
  (p10, 'native',   3, 'I''m looking forward to turning over a new leaf and leaving all that behind.'),
  (p10, 'native',   4, 'I''m really looking forward to hitting the ground running in the new role.'),
  (p10, 'native',   5, 'I''m looking forward to a time when I can actually do things at my own pace.');

-- ============================================================
-- EXAMPLE TRANSLATIONS (한국어)
-- ============================================================
-- Pattern 01 translations (normal)
INSERT INTO example_translations (example_id, ui_lang, translation)
SELECT e.id, 'ko', t.translation FROM examples e
JOIN (VALUES
  ('I want to learn English.',     '영어를 배우고 싶어.'),
  ('I want to sleep early tonight.', '오늘 밤 일찍 자고 싶어.'),
  ('I want to eat something good.', '맛있는 거 먹고 싶어.'),
  ('I want to take a walk outside.', '밖에서 산책하고 싶어.'),
  ('I want to call my friend.',    '친구한테 전화하고 싶어.')
) AS t(sentence, translation)
ON e.sentence = t.sentence AND e.pattern_id = p01 AND e.difficulty = 'normal';

-- ============================================================
-- STORIES (2개)
-- ============================================================
INSERT INTO stories (id, language_id, level, order_index, is_published)
VALUES
  (gen_random_uuid(), lang_en, 1, 1, true),
  (gen_random_uuid(), lang_en, 1, 2, true);

SELECT id INTO s01 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 1;
SELECT id INTO s02 FROM stories WHERE language_id = lang_en AND level = 1 AND order_index = 2;

-- ============================================================
-- STORY TRANSLATIONS
-- ============================================================
INSERT INTO story_translations (story_id, ui_lang, title, description) VALUES
  (s01, 'ko', '새로운 시작', '변화를 원하고, 생각하고, 가능성을 마주하는 이야기'),
  (s02, 'ko', '나를 만드는 시간', '계획하고, 돌아보고, 나아가는 이야기');

-- ============================================================
-- STORY PATTERNS (junction)
-- ============================================================
INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s01, p01, 1),
  (s01, p02, 2),
  (s01, p03, 3),
  (s01, p04, 4),
  (s01, p05, 5);

INSERT INTO story_patterns (story_id, pattern_id, order_index) VALUES
  (s02, p06, 1),
  (s02, p07, 2),
  (s02, p08, 3),
  (s02, p09, 4),
  (s02, p10, 5);

END $$;
