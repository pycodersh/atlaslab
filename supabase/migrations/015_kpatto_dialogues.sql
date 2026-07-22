-- K-PATTO 대사 테이블
create table if not exists public.kpatto_dialogues (
  key       text primary key,
  ko        text not null,
  en        text not null,
  character text not null
);

-- EP02 대사 데이터
insert into public.kpatto_dialogues (key, ko, en, character) values
  ('ep02-c1-b1', '와... 사람이 너무 많다!',               'Wow... there are so many people!',              'emma'),
  ('ep02-c2-b1', '저기요, 홍대 어떻게 가요?',              'Excuse me, how do I get to Hongdae?',           'emma'),
  ('ep02-c3-b1', '지수야! 홍대 가고 싶어요... 어디예요?',   'Jisu! I want to go to Hongdae... where is it?', 'emma'),
  ('ep02-c3-b2', '에마야! 여기서 뭐 해?',                  'Emma! What are you doing here?',                'jisu'),
  ('ep02-c4-b1', '표 두 장 주세요!',                       'Two tickets, please!',                          'emma'),
  ('ep02-c4-b2', '완벽해!',                                'Perfect!',                                      'jisu'),
  ('ep02-c5-b1', '와, 서울 진짜 좋아요!',                  'Wow, I really like Seoul!',                     'emma'),
  ('ep02-c5-b2', '그치? 나도 좋아!',                       'Right? Me too!',                                'jisu')
on conflict (key) do update
  set ko = excluded.ko,
      en = excluded.en,
      character = excluded.character;
