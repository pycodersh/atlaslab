# Korean Basics 문장 음성 매핑

- 엔진: Edge-TTS · ko-KR-SunHiNeural · rate -5% · 24kHz mono mp3 96k → 앞뒤 무음 제거(기존 6편 이중 보이스 조각과 같은 설정)
- 재사용: 기존 조각(out/remotion/vo) 또는 같은 글의 같은 문장 예문 파일을 옮김
- 저장 위치: public/audio/korean-basic/lines/<slug>/<id>.mp3 · 원본 목록: remotion/KoreanBasic/lines.json · 생성: scripts/generate-basics-lines.py
- 합계 198줄: 새로 171 · 재사용 20 · 숨김 7 (장면 대사 42줄 포함). Avoid 카드 틀린 문장은 버튼 없음

| 글 | id | 화면 문장 | 읽는 문장 | 출처 |
|---|---|---|---|---|
| busan-dialect-vs-seoul-korean | ex-1 | 맞나? | 맞나? | 새로 생성 |
| busan-dialect-vs-seoul-korean | ex-2 | 밥 뭇나? | 밥 뭇나? | 새로 생성 |
| busan-dialect-vs-seoul-korean | ex-3 | 어디 가노? | 어디 가노? | 새로 생성 |
| busan-dialect-vs-seoul-korean | ex-4 | 억수로 | 억수로 | 새로 생성 |
| common-pronunciation-mistakes-korean-learners-make | ex-1 | 서다 · 소다 | 서다, 소다 | 새로 생성 |
| common-pronunciation-mistakes-korean-learners-make | ex-2 | 그 · 구 | 그, 구 | 새로 생성 |
| common-pronunciation-mistakes-korean-learners-make | ex-3 | 사다 · 싸다 | 사다, 싸다 | 새로 생성 |
| common-pronunciation-mistakes-korean-learners-make | ex-4 | 한국말 → [한궁말] | 한국말 | 새로 생성 |
| eun-neun-vs-i-ga-difference | scene-wrong | 에마는 왔어요. | 에마는 왔어요. | 새로 생성 |
| eun-neun-vs-i-ga-difference | scene-correct | 에마가 왔어요. | 에마가 왔어요. | 재사용 ex-1.mp3 |
| eun-neun-vs-i-ga-difference | ex-1 | 에마가 왔어요. | 에마가 왔어요. | 새로 생성 |
| eun-neun-vs-i-ga-difference | ex-2 | 에마는 공부해요. | 에마는 공부해요. | 새로 생성 |
| eun-neun-vs-i-ga-difference | ex-3 | 친구가 왔어요. | 친구가 왔어요. | 새로 생성 |
| eun-neun-vs-i-ga-difference | ex-4 | 그 친구는 미국 사람이에요. | 그 친구는 미국 사람이에요. | 새로 생성 |
| formal-vs-casual-korean-when-to-drop-yo | scene-wrong | 같이 먹어. | 같이 먹어. | 새로 생성 |
| formal-vs-casual-korean-when-to-drop-yo | scene-correct | 같이 먹어요. | 같이 먹어요. | 새로 생성 |
| formal-vs-casual-korean-when-to-drop-yo | ex-1 | 가요 · 먹어요 · 좋아요 | 가요, 먹어요, 좋아요 | 새로 생성 |
| formal-vs-casual-korean-when-to-drop-yo | ex-2 | 갑니다 | 갑니다 | 새로 생성 |
| formal-vs-casual-korean-when-to-drop-yo | ex-3 | 말 놓아도 될까요? | 말 놓아도 될까요? | 새로 생성 |
| formal-vs-casual-korean-when-to-drop-yo | ex-4 | 좋아 | 좋아 | 새로 생성 |
| how-long-to-learn-hangul | ex-1 | 한 = ㅎ + ㅏ + ㄴ | 한 | 새로 생성 |
| how-long-to-learn-hangul | ex-2 | 사람 · 학교 · 친구 | 사람, 학교, 친구 | 새로 생성 |
| how-long-to-learn-hangul | ex-3 | 신라 → [실라] | 신라 | 새로 생성 |
| how-long-to-learn-hangul | ex-4 | 좋다 → [조타] | 좋다 | 새로 생성 |
| how-to-read-hangul-in-one-day | ex-1 | ㄱ + ㅏ = 가 | 가 | 새로 생성 |
| how-to-read-hangul-in-one-day | ex-2 | ㄱ + ㅗ = 고 | 고 | 새로 생성 |
| how-to-read-hangul-in-one-day | ex-3 | 가 + ㅁ = 감 | 감 | 새로 생성 |
| how-to-read-hangul-in-one-day | ex-4 | 비빔밥 | 비빔밥 | 새로 생성 |
| how-to-type-korean-phone-computer | ex-1 | Shift + ㅂ = ㅃ | — | 숨김 (자판 조작 설명) |
| how-to-type-korean-phone-computer | ex-2 | 감 + ㅏ = 가마 | — | 숨김 (자판 조작 설명) |
| how-to-type-korean-phone-computer | ex-3 | 한/영 | — | 숨김 (자판 키 이름) |
| how-to-type-korean-phone-computer | ex-4 | 김치 | 김치 | 새로 생성 |
| is-korean-hard-to-learn-for-english-speakers | ex-1 | 물 주세요. | 물 주세요. | 새로 생성 |
| is-korean-hard-to-learn-for-english-speakers | ex-2 | 역 어떻게 가요? | 역 어떻게 가요? | 새로 생성 |
| is-korean-hard-to-learn-for-english-speakers | ex-3 | 카페에서 점심 먹었어요. | 카페에서 점심 먹었어요. | 새로 생성 |
| is-korean-hard-to-learn-for-english-speakers | ex-4 | 저는 학생이에요. | 저는 학생이에요. | 새로 생성 |
| korean-age-sal-man-nai | scene-wrong | 몇 살이에요? | 몇 살이에요? | 새로 생성 |
| korean-age-sal-man-nai | scene-correct | 나이가 어떻게 되세요? | 나이가 어떻게 되세요? | 재사용 ex-3.mp3 |
| korean-age-sal-man-nai | ex-1 | 스무 살이에요. | 스무 살이에요. | 재사용 s1-2-ko.wav |
| korean-age-sal-man-nai | ex-2 | 서른두 살이에요. | 서른두 살이에요. | 새로 생성 |
| korean-age-sal-man-nai | ex-3 | 나이가 어떻게 되세요? | 나이가 어떻게 되세요? | 재사용 s3-2-ko.wav |
| korean-age-sal-man-nai | ex-4 | 만 25세 | 만 25세 | 새로 생성 |
| korean-an-vs-mot-negation | scene-wrong | 한국어를 안 해요. | 한국어를 안 해요. | 새로 생성 |
| korean-an-vs-mot-negation | scene-correct | 한국어를 못 해요. | 한국어를 못 해요. | 새로 생성 |
| korean-an-vs-mot-negation | ex-1 | 오늘은 못 가요. | 오늘은 못 가요. | 새로 생성 |
| korean-an-vs-mot-negation | ex-2 | 매운 음식을 못 먹어요. | 매운 음식을 못 먹어요. | 새로 생성 |
| korean-an-vs-mot-negation | ex-3 | 안 매워요. | 안 매워요. | 새로 생성 |
| korean-an-vs-mot-negation | ex-4 | 학생이 아니에요. | 학생이 아니에요. | 새로 생성 |
| korean-batchim-final-consonants-explained | ex-1 | 옷 · 있 · 낮 | 옷, 있, 낮 | 새로 생성 |
| korean-batchim-final-consonants-explained | ex-2 | 음악 → [으막] | 음악 | 새로 생성 |
| korean-batchim-final-consonants-explained | ex-3 | 좋아요 → [조아요] | 좋아요 | 새로 생성 |
| korean-batchim-final-consonants-explained | ex-4 | 한국말 → [한궁말] | 한국말 | 새로 생성 |
| korean-because-aseo-vs-euni-kka | scene-wrong | 늦었으니까 죄송해요. | 늦었으니까 죄송해요. | 새로 생성 |
| korean-because-aseo-vs-euni-kka | scene-correct | 늦어서 죄송해요. | 늦어서 죄송해요. | 재사용 s2-2-ko.wav |
| korean-because-aseo-vs-euni-kka | ex-1 | 늦어서 죄송해요. | 늦어서 죄송해요. | 재사용 s2-2-ko.wav |
| korean-because-aseo-vs-euni-kka | ex-2 | 와 주셔서 감사합니다. | 와 주셔서 감사합니다. | 새로 생성 |
| korean-because-aseo-vs-euni-kka | ex-3 | 추우니까 창문 닫아 주세요. | 추우니까 창문 닫아 주세요. | 재사용 s3-2-ko.wav |
| korean-because-aseo-vs-euni-kka | ex-4 | 시간 없으니까 택시 타자. | 시간 없으니까 택시 타자. | 새로 생성 |
| korean-can-su-itda-eopda | scene-wrong | 가을 수 있어요. | 가을 수 있어요. | 새로 생성 |
| korean-can-su-itda-eopda | scene-correct | 갈 수 있어요. | 갈 수 있어요. | 새로 생성 |
| korean-can-su-itda-eopda | ex-1 | 카드로 결제할 수 있어요? | 카드로 결제할 수 있어요? | 새로 생성 |
| korean-can-su-itda-eopda | ex-2 | 여기서 사진을 찍을 수 있어요? | 여기서 사진을 찍을 수 있어요? | 새로 생성 |
| korean-can-su-itda-eopda | ex-3 | 짐을 맡길 수 있을까요? | 짐을 맡길 수 있을까요? | 새로 생성 |
| korean-can-su-itda-eopda | ex-4 | 비가 올 수도 있어요. | 비가 올 수도 있어요. | 새로 생성 |
| korean-connecting-go-vs-myeonseo | scene-wrong | 걷고 전화했어요. | 걷고 전화했어요. | 새로 생성 |
| korean-connecting-go-vs-myeonseo | scene-correct | 걸으면서 전화했어요. | 걸으면서 전화했어요. | 새로 생성 |
| korean-connecting-go-vs-myeonseo | ex-1 | 밥을 먹고 TV를 봤어요. | 밥을 먹고 TV를 봤어요. | 새로 생성 |
| korean-connecting-go-vs-myeonseo | ex-2 | 밥을 먹으면서 TV를 봤어요. | 밥을 먹으면서 TV를 봤어요. | 새로 생성 |
| korean-connecting-go-vs-myeonseo | ex-3 | 지하철을 타고 가요. | 지하철을 타고 가요. | 새로 생성 |
| korean-connecting-go-vs-myeonseo | ex-4 | 음악을 들으면서 공부해요. | 음악을 들으면서 공부해요. | 새로 생성 |
| korean-consonants-19-basic-sounds | ex-1 | ㄱ · ㅋ · ㄲ | — | 숨김 (낱자 이름만 읽힌다) |
| korean-consonants-19-basic-sounds | ex-2 | 자다 · 짜다 | 자다, 짜다 | 새로 생성 |
| korean-consonants-19-basic-sounds | ex-3 | 달 · 딸 | 달, 딸 | 새로 생성 |
| korean-consonants-19-basic-sounds | ex-4 | 라면 | 라면 | 새로 생성 |
| korean-counters-gae-myeong-jan-byeong | scene-wrong | 두 커피 주세요. | 두 커피 주세요. | 새로 생성 |
| korean-counters-gae-myeong-jan-byeong | scene-correct | 커피 두 잔 주세요. | 커피 두 잔 주세요. | 재사용 ex-1.mp3 |
| korean-counters-gae-myeong-jan-byeong | ex-1 | 커피 두 잔 주세요. | 커피 두 잔 주세요. | 재사용 s3-2-ko.wav |
| korean-counters-gae-myeong-jan-byeong | ex-2 | 두 명이에요. | 두 명이에요. | 새로 생성 |
| korean-counters-gae-myeong-jan-byeong | ex-3 | 맥주 한 병 주세요. | 맥주 한 병 주세요. | 새로 생성 |
| korean-counters-gae-myeong-jan-byeong | ex-4 | 이거 세 개 주세요. | 이거 세 개 주세요. | 새로 생성 |
| korean-dates-days-of-week | ex-1 | 11월 15일 | 11월 15일 | 새로 생성 |
| korean-dates-days-of-week | ex-2 | 오늘 며칠이에요? | 오늘 며칠이에요? | 새로 생성 |
| korean-dates-days-of-week | ex-3 | 무슨 요일이에요? | 무슨 요일이에요? | 새로 생성 |
| korean-dates-days-of-week | ex-4 | 토요일에 예약하고 싶어요. | 토요일에 예약하고 싶어요. | 재사용 s3-2-ko.wav |
| korean-future-tense-eul-geoyeyo | scene-wrong | 제가 할 거예요. | 제가 할 거예요. | 새로 생성 |
| korean-future-tense-eul-geoyeyo | scene-correct | 제가 할게요. | 제가 할게요. | 재사용 ex-4.mp3 |
| korean-future-tense-eul-geoyeyo | ex-1 | 내일 갈 거예요. | 내일 갈 거예요. | 새로 생성 |
| korean-future-tense-eul-geoyeyo | ex-2 | 먹을 거예요. | 먹을 거예요. | 새로 생성 |
| korean-future-tense-eul-geoyeyo | ex-3 | 비가 올 거예요. | 비가 올 거예요. | 새로 생성 |
| korean-future-tense-eul-geoyeyo | ex-4 | 제가 할게요. | 제가 할게요. | 새로 생성 |
| korean-have-you-ever-eo-boda | scene-wrong | 아침에 밥을 먹어 봤어요. | 아침에 밥을 먹어 봤어요. | 새로 생성 |
| korean-have-you-ever-eo-boda | scene-correct | 아침에 밥을 먹었어요. | 아침에 밥을 먹었어요. | 새로 생성 |
| korean-have-you-ever-eo-boda | ex-1 | 이거 한번 먹어 보세요. | 이거 한번 먹어 보세요. | 새로 생성 |
| korean-have-you-ever-eo-boda | ex-2 | 입어 봐도 돼요? | 입어 봐도 돼요? | 새로 생성 |
| korean-have-you-ever-eo-boda | ex-3 | 한국에 가 본 적이 있어요. | 한국에 가 본 적이 있어요. | 새로 생성 |
| korean-have-you-ever-eo-boda | ex-4 | 김치 먹어 봤어요? | 김치 먹어 봤어요? | 새로 생성 |
| korean-irregular-verbs-seven-types | scene-wrong | 오늘 덥어요. | 오늘 덥어요. | 새로 생성 |
| korean-irregular-verbs-seven-types | scene-correct | 오늘 더워요. | 오늘 더워요. | 새로 생성 |
| korean-irregular-verbs-seven-types | ex-1 | 더워요 | 더워요 | 새로 생성 |
| korean-irregular-verbs-seven-types | ex-2 | 몰라요 | 몰라요 | 새로 생성 |
| korean-irregular-verbs-seven-types | ex-3 | 바빠요 | 바빠요 | 새로 생성 |
| korean-irregular-verbs-seven-types | ex-4 | 이거 어때요? | 이거 어때요? | 새로 생성 |
| korean-object-particle-eul-reul | scene-wrong | 커피를 좋아요. | 커피를 좋아요. | 새로 생성 |
| korean-object-particle-eul-reul | scene-correct | 커피를 좋아해요. | 커피를 좋아해요. | 재사용 ex-2.mp3 |
| korean-object-particle-eul-reul | ex-1 | 김치를 먹어요. | 김치를 먹어요. | 새로 생성 |
| korean-object-particle-eul-reul | ex-2 | 커피를 좋아해요. | 커피를 좋아해요. | 새로 생성 |
| korean-object-particle-eul-reul | ex-3 | 시간이 없어요. | 시간이 없어요. | 새로 생성 |
| korean-object-particle-eul-reul | ex-4 | 버스를 타요. | 버스를 타요. | 새로 생성 |
| korean-particle-euro-by-to-as | scene-wrong | 버스에 가요. | 버스에 가요. | 새로 생성 |
| korean-particle-euro-by-to-as | scene-correct | 버스로 가요. | 버스로 가요. | 새로 생성 |
| korean-particle-euro-by-to-as | ex-1 | 카드로 결제할게요. | 카드로 결제할게요. | 새로 생성 |
| korean-particle-euro-by-to-as | ex-2 | 이 주소로 가 주세요. | 이 주소로 가 주세요. | 새로 생성 |
| korean-particle-euro-by-to-as | ex-3 | 오른쪽으로 가세요. | 오른쪽으로 가세요. | 새로 생성 |
| korean-particle-euro-by-to-as | ex-4 | 이걸로 주세요. | 이걸로 주세요. | 새로 생성 |
| korean-particles-e-vs-eseo | scene-wrong | 카페에 공부해요. | 카페에 공부해요. | 새로 생성 |
| korean-particles-e-vs-eseo | scene-correct | 카페에서 공부해요. | 카페에서 공부해요. | 새로 생성 |
| korean-particles-e-vs-eseo | ex-1 | 집에 있어요. | 집에 있어요. | 새로 생성 |
| korean-particles-e-vs-eseo | ex-2 | 집에서 쉬어요. | 집에서 쉬어요. | 새로 생성 |
| korean-particles-e-vs-eseo | ex-3 | 한국에서 왔어요. | 한국에서 왔어요. | 새로 생성 |
| korean-particles-e-vs-eseo | ex-4 | 세 시에 만나요. | 세 시에 만나요. | 새로 생성 |
| korean-past-tense-explained | scene-wrong | 저는 결혼해요. | 저는 결혼해요. | 새로 생성 |
| korean-past-tense-explained | scene-correct | 저는 결혼했어요. | 저는 결혼했어요. | 새로 생성 |
| korean-past-tense-explained | ex-1 | 먹어요 → 먹었어요 | 먹어요, 먹었어요 | 새로 생성 |
| korean-past-tense-explained | ex-2 | 가요 → 갔어요 | 가요, 갔어요 | 새로 생성 |
| korean-past-tense-explained | ex-3 | 해요 → 했어요 | 해요, 했어요 | 새로 생성 |
| korean-past-tense-explained | ex-4 | 결혼했어요. | 결혼했어요. | 새로 생성 |
| korean-politeness-levels-explained | scene-wrong | 고마워. | 고마워. | 새로 생성 |
| korean-politeness-levels-explained | scene-correct | 고마워요. | 고마워요. | 재사용 ex-3.mp3 |
| korean-politeness-levels-explained | ex-1 | 밥 먹었어요? | 밥 먹었어요? | 새로 생성 |
| korean-politeness-levels-explained | ex-2 | 어디 가요? | 어디 가요? | 새로 생성 |
| korean-politeness-levels-explained | ex-3 | 고마워요. | 고마워요. | 새로 생성 |
| korean-politeness-levels-explained | ex-4 | 말 놓으세요. | 말 놓으세요. | 새로 생성 |
| korean-prices-money-eolmayeyo | ex-1 | 오천 원 | 오천 원 | 새로 생성 |
| korean-prices-money-eolmayeyo | ex-2 | 만 오천 원 | 만 오천 원 | 새로 생성 |
| korean-prices-money-eolmayeyo | ex-3 | 삼만 오천 원 | 삼만 오천 원 | 재사용 s2-2-ko.wav |
| korean-prices-money-eolmayeyo | ex-4 | 이거 얼마예요? | 이거 얼마예요? | 재사용 s3-2-ko.wav |
| korean-requests-a-eo-juseyo | scene-wrong | 여기 세우세요. | 여기 세우세요. | 새로 생성 |
| korean-requests-a-eo-juseyo | scene-correct | 여기 세워 주세요. | 여기 세워 주세요. | 재사용 s2-2-ko.wav |
| korean-requests-a-eo-juseyo | ex-1 | 여기 세워 주세요. | 여기 세워 주세요. | 재사용 s2-2-ko.wav |
| korean-requests-a-eo-juseyo | ex-2 | 덜 맵게 해 주세요. | 덜 맵게 해 주세요. | 재사용 s3-2-ko.wav |
| korean-requests-a-eo-juseyo | ex-3 | 사진 좀 찍어 주세요. | 사진 좀 찍어 주세요. | 새로 생성 |
| korean-requests-a-eo-juseyo | ex-4 | 포장해 주세요. | 포장해 주세요. | 재사용 s3-4-ko.wav |
| korean-romanization-two-spellings | ex-1 | 부산 | 부산 | 새로 생성 |
| korean-romanization-two-spellings | ex-2 | 김포 | 김포 | 새로 생성 |
| korean-romanization-two-spellings | ex-3 | 신라 | 신라 | 새로 생성 |
| korean-romanization-two-spellings | ex-4 | 사다 · 싸다 | 사다, 싸다 | 새로 생성 |
| korean-sentence-structure-sov-why-the-verb-goes-last | scene-wrong | 저는 가요 안. | 저는 가요 안. | 새로 생성 |
| korean-sentence-structure-sov-why-the-verb-goes-last | scene-correct | 저는 안 가요. | 저는 안 가요. | 새로 생성 |
| korean-sentence-structure-sov-why-the-verb-goes-last | ex-1 | 저는 김치를 먹어요. | 저는 김치를 먹어요. | 새로 생성 |
| korean-sentence-structure-sov-why-the-verb-goes-last | ex-2 | 저는 술을 안 마셔요. | 저는 술을 안 마셔요. | 새로 생성 |
| korean-sentence-structure-sov-why-the-verb-goes-last | ex-3 | 제가 어제 산 차 | 제가 어제 산 차 | 새로 생성 |
| korean-sentence-structure-sov-why-the-verb-goes-last | ex-4 | 어디 가요? | 어디 가요? | 새로 생성 |
| korean-syllable-structure-why-every-block-matters | ex-1 | 가 · 너 · 지 | 가, 너, 지 | 새로 생성 |
| korean-syllable-structure-why-every-block-matters | ex-2 | 고 · 누 · 스 | 고, 누, 스 | 새로 생성 |
| korean-syllable-structure-why-every-block-matters | ex-3 | 곰 · 물 · 국 | 곰, 물, 국 | 새로 생성 |
| korean-syllable-structure-why-every-block-matters | ex-4 | 안녕하세요 | 안녕하세요 | 새로 생성 |
| korean-topic-vs-subject-particle | scene-wrong | 지수는 왔어요. | 지수는 왔어요. | 새로 생성 |
| korean-topic-vs-subject-particle | scene-correct | 지수가 왔어요. | 지수가 왔어요. | 재사용 ex-1.mp3 |
| korean-topic-vs-subject-particle | ex-1 | 지수가 왔어요. | 지수가 왔어요. | 새로 생성 |
| korean-topic-vs-subject-particle | ex-2 | 지수는 어제 왔어요. | 지수는 어제 왔어요. | 새로 생성 |
| korean-topic-vs-subject-particle | ex-3 | 한국 음식은 매워요. | 한국 음식은 매워요. | 새로 생성 |
| korean-topic-vs-subject-particle | ex-4 | 저는 커피가 좋아요. | 저는 커피가 좋아요. | 새로 생성 |
| korean-two-number-systems | ex-1 | 커피 한 잔 | 커피 한 잔 | 새로 생성 |
| korean-two-number-systems | ex-2 | 세 시 삼십 분 | 세 시 삼십 분 | 새로 생성 |
| korean-two-number-systems | ex-3 | 스무 살 | 스무 살 | 새로 생성 |
| korean-two-number-systems | ex-4 | 삼만 원 | 삼만 원 | 새로 생성 |
| korean-verb-conjugation-ayo-eoyo | scene-wrong | 커피 마시아요. | 커피 마시아요. | 새로 생성 |
| korean-verb-conjugation-ayo-eoyo | scene-correct | 커피 마셔요. | 커피 마셔요. | 새로 생성 |
| korean-verb-conjugation-ayo-eoyo | ex-1 | 가다 → 가요 | 가다, 가요 | 새로 생성 |
| korean-verb-conjugation-ayo-eoyo | ex-2 | 먹다 → 먹어요 | 먹다, 먹어요 | 새로 생성 |
| korean-verb-conjugation-ayo-eoyo | ex-3 | 마시다 → 마셔요 | 마시다, 마셔요 | 새로 생성 |
| korean-verb-conjugation-ayo-eoyo | ex-4 | 공부하다 → 공부해요 | 공부하다, 공부해요 | 새로 생성 |
| korean-vowels-all-21-explained | ex-1 | ㅏ → ㅑ | — | 숨김 (낱자 이름만 읽힌다) |
| korean-vowels-all-21-explained | ex-2 | ㅏ + ㅣ = ㅐ | 애 | 새로 생성 |
| korean-vowels-all-21-explained | ex-3 | ㅗ + ㅏ = ㅘ | 와 | 새로 생성 |
| korean-vowels-all-21-explained | ex-4 | 서다 · 소다 | 서다, 소다 | 새로 생성 |
| korean-vs-japanese-what-transfers | ex-1 | 은/는 | 은, 는 | 새로 생성 |
| korean-vs-japanese-what-transfers | ex-2 | 이/가 | 이, 가 | 새로 생성 |
| korean-vs-japanese-what-transfers | ex-3 | 도서관 | 도서관 | 새로 생성 |
| korean-vs-japanese-what-transfers | ex-4 | 약속 | 약속 | 새로 생성 |
| what-k-drama-titles-teach-you-about-korean | ex-1 | 사랑의 불시착 | 사랑의 불시착 | 새로 생성 |
| what-k-drama-titles-teach-you-about-korean | ex-2 | 별에서 온 그대 | 별에서 온 그대 | 새로 생성 |
| what-k-drama-titles-teach-you-about-korean | ex-3 | 김비서가 왜 그럴까 | 김비서가 왜 그럴까 | 새로 생성 |
| what-k-drama-titles-teach-you-about-korean | ex-4 | 뭐 먹을까? | 뭐 먹을까? | 새로 생성 |
| why-hangul-is-called-scientific-alphabet | ex-1 | ㄱ → ㅋ | — | 숨김 (낱자 이름만 읽힌다) |
| why-hangul-is-called-scientific-alphabet | ex-2 | ㄱ → ㄲ | — | 숨김 (낱자 이름만 읽힌다) |
| why-hangul-is-called-scientific-alphabet | ex-3 | ㅁ | ㅁ | 새로 생성 |
| why-hangul-is-called-scientific-alphabet | ex-4 | 한 | 한 | 새로 생성 |
| why-korean-has-no-articles | scene-wrong | 그 커피를 마셨어요. | 그 커피를 마셨어요. | 새로 생성 |
| why-korean-has-no-articles | scene-correct | 커피를 마셨어요. | 커피를 마셨어요. | 새로 생성 |
| why-korean-has-no-articles | ex-1 | 책 읽었어요. | 책 읽었어요. | 새로 생성 |
| why-korean-has-no-articles | ex-2 | 남자가 왔어요. | 남자가 왔어요. | 새로 생성 |
| why-korean-has-no-articles | ex-3 | 그 남자는 키가 컸어요. | 그 남자는 키가 컸어요. | 새로 생성 |
| why-korean-has-no-articles | ex-4 | 학생들이 왔어요. | 학생들이 왔어요. | 새로 생성 |
| why-korean-has-two-number-systems | ex-1 | 맥주 두 병 | 맥주 두 병 | 새로 생성 |
| why-korean-has-two-number-systems | ex-2 | 고양이 두 마리 | 고양이 두 마리 | 새로 생성 |
| why-korean-has-two-number-systems | ex-3 | 세 시 삼십 분 | 세 시 삼십 분 | 새로 생성 |
| why-korean-has-two-number-systems | ex-4 | 삼만 원 | 삼만 원 | 새로 생성 |
