# 검토 대상 41개 — 예문 vs 웹툰 하이라이트 대조표

> 읽기 전용 문서. DB·JSON 원본은 수정하지 않았다. 기준: `kpatto_patterns_fixed.json`(예문) / DB `kp_bubbles`(말풍선 하이라이트) · `kp_dialogue_expressions`+`kp_dialogues`(대사 하이라이트).
> A·B 분류는 pattern_quality_audit.md 와 같다 (A=예문 중 패턴과 글자 그대로 같은 것이 있음, B=예문이 전부 패턴으로 시작). 하이라이트된 글자는 **굵게** 표시.

대상 41개 (A 30 / B 11)

## 요약

| 등급 | ID | EP | 패턴명 | English | 말풍선 하이라이트 | 대사 하이라이트 |
|---|---|---|---|---|---|---|
| A | 797 | 6 | 또 오고 싶어요 | I want to come here again. | 1 | 1 |
| A | 787 | 9 | 다 같이 있어서 좋아요 | I'm happy we're all together. | 1 | 1 |
| A | 791 | 10 | 잘 부탁드려요 | I look forward to it. | 1 | 1 |
| A | 818 | 18 | 취미가 뭐예요? | What are your hobbies? | 1 | 1 |
| A | 822 | 19 | 같이 사진 찍어요 | Let's take a photo together. | 1 | 1 |
| A | 825 | 20 | 잘 지냈어요? | How have you been? | 1 | 1 |
| A | 826 | 20 | 다음에 또 봐요 | See you again next time. | 1 | 1 |
| A | 862 | 32 | 언제든지 연락해요 | Contact me anytime. | 1 | 1 |
| A | 864 | 33 | 팔로우해도 돼요? | May I follow you? | 1 | 1 |
| A | 867 | 34 | 더치페이 해요? | Shall we split the bill? | 1 | 1 |
| A | 868 | 34 | 밥 한번 먹어요 | Let's grab a meal sometime. | 1 | 1 |
| A | 875 | 36 | 오늘은 여기까지만 해요 | Let's stop here for today. | 1 | 1 |
| A | 877 | 37 | 신청곡 있어요? | Any song requests? | 1 | 1 |
| A | 878 | 37 | 한 곡 더 해요 | One more song. | 1 | 1 |
| A | 879 | 38 | 같이 춰요 | Let's dance together. | 1 | 1 |
| A | 880 | 38 | 어렵지만 재미있어요 | It's hard but fun. | 1 | 1 |
| A | 881 | 38 | 하다 보면 늘어요 | You'll improve as you go. | 1 | 1 |
| A | 883 | 39 | 달달한 거 있어요? | Do you have anything sweet? | 1 | 1 |
| A | 884 | 39 | 오래 있어도 돼요? | Is it okay to stay a long time? | 1 | 1 |
| A | 909 | 48 | 배달 얼마나 걸려요? | How long does delivery take? | 1 | 1 |
| A | 934 | 56 | 카드로 할게요 | I'll pay by card. | 0 | 1 |
| A | 938 | 58 | 어디가 아파요? | Where does it hurt? | 1 | 1 |
| A | 1021 | 61 | 솔직하게 말해도 돼요? | Can I be honest? | 1 | 1 |
| A | 982 | 73 | 드디어 해냈어요 | I finally did it. | 2 | 2 |
| A | 1013 | 84 | 좀 더 생각해 봐야겠어요 | I can't decide right now. | 1 | 1 |
| A | 1022 | 87 | 이제 많이 편해졌어요 | I've gotten much more comfortable now. | 1 | 1 |
| A | 1049 | 98 | 이제 한국어로 생각해요 | I think in Korean now. | 1 | 1 |
| A | 1050 | 98 | 번역 안 해도 이해돼요 | I understand without translating. | 1 | 1 |
| A | 1052 | 99 | 같이 성장한 것 같아요 | I think we grew together. | 1 | 1 |
| A | 1053 | 99 | 덕분에 정말 많이 배웠어요 | I learned so much thanks to you. | 1 | 1 |
| B | 806 | 14 | 길을 잃었어요 | I'm lost. | 1 | 1 |
| B | 819 | 18 | 저도요 | Me too. | 1 | 1 |
| B | 829 | 21 | 처음이었는데 | It was my first time, but ~ | 1 | 1 |
| B | 861 | 32 | 요즘 좀 힘들어요 | Things have been a bit hard lately. | 1 | 1 |
| B | 863 | 33 | 카카오톡 해요? | Do you use KakaoTalk? | 1 | 1 |
| B | 873 | 36 | 술 마셔요? | Do you drink? | 1 | 1 |
| B | 887 | 40 | 처음엔 낯설었는데 | It felt strange at first, but ~ | 1 | 1 |
| B | 914 | 50 | 한국 생활 어때? | How's life in Korea? | 1 | 1 |
| B | 993 | 77 | 처음 만났을 때 | when we first met | 1 | 1 |
| B | 1012 | 84 | 잘 모르겠는데요 | I'm not really sure. | 1 | 1 |
| B | 1017 | 85 | 딱 봐도 알겠어요 | I can tell just by looking. | 1 | 1 |

웹툰에 하이라이트 연결이 하나도 없는 패턴: 0개

## 상세

### [A] ID 797 · EP6 — 또 오고 싶어요 / I want to come here again.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 또 오고 싶어요! | I want to come here again! |
| 예문 2 | 한국 또 오고 싶어요. | I want to come back to Korea. |
| 예문 3 | 이 카페 또 오고 싶어요! | I want to come back to this café! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #2779 | 6 | emma | 목이 아파요. 근데 **또 오고 싶어요**. | 또 오고 싶어요 | My throat hurts. But I want to come again. |
| 대사 #10429 (focus) | 6 | emma | 목이 아파요. 근데 **또 오고 싶어요**. | 또 오고 싶어요 |  |

### [A] ID 787 · EP9 — 다 같이 있어서 좋아요 / I'm happy we're all together.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 다 같이 있어서 좋아요! | I'm so happy we're all together! |
| 예문 2 | 가족이랑 다 같이 있어서 좋아요. | I'm happy to be together with my whole family. |
| 예문 3 | 친구들이랑 다 같이 있어서 좋아요! | It's great to be together with all my friends! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #2810 | 9 | emma | 괜찮아요. **다 같이 있어서 좋아요**. | 다 같이 있어서 좋아요 | It's fine. I'm glad we're all together. |
| 대사 #10460 (focus) | 9 | emma | 괜찮아요. **다 같이 있어서 좋아요**. | 다 같이 있어서 좋아요 |  |

### [A] ID 791 · EP10 — 잘 부탁드려요 / I look forward to it.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 잘 부탁드려요! | Please take care of me! |
| 예문 2 | 앞으로 잘 부탁드려요. | I look forward to working with you. |
| 예문 3 | 오늘 잘 부탁드려요! | Please take care of me today! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #2817 | 10 | emma | 앞으로 **잘 부탁드려요**. | 잘 부탁드려요 | I look forward to studying with you. |
| 대사 #10467 (focus) | 10 | emma | 앞으로 **잘 부탁드려요**. | 잘 부탁드려요 |  |

### [A] ID 818 · EP18 — 취미가 뭐예요? / What are your hobbies?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 취미가 뭐예요? | What are your hobbies? |
| 예문 2 | 요즘 취미가 뭐예요? | What are your hobbies these days? |
| 예문 3 | 취미가 뭐예요? 저는 사진이에요! | What are your hobbies? Mine is photography! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4201 | 18 | emma | 민준 씨는 **취미가 뭐예요?** | 취미가 뭐예요? | Minjun, what's your hobby? |
| 대사 #11850 (focus) | 18 | emma | 민준 씨는 **취미가 뭐예요?** | 취미가 뭐예요? |  |

### [A] ID 822 · EP19 — 같이 사진 찍어요 / Let's take a photo together.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 같이 사진 찍어요! | Let's take a photo together! |
| 예문 2 | 경복궁 앞에서 같이 사진 찍어요! | Let's take a photo together in front of Gyeongbokgung! |
| 예문 3 | 여기서 같이 사진 찍어요! | Let's take a photo here together! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3530 | 19 | emma | 우리 **같이 사진 찍어요**! | 같이 사진 찍어요 | Let's take a photo together! |
| 대사 #11179 (focus) | 19 | emma | 우리 **같이 사진 찍어요**! | 같이 사진 찍어요 |  |

### [A] ID 825 · EP20 — 잘 지냈어요? / How have you been?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 잘 지냈어요? | Have you been well? |
| 예문 2 | 요즘 잘 지냈어요? | Have you been well lately? |
| 예문 3 | 잘 지냈어요? 많이 바빴어요? | Have you been well? Were you very busy? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3539 | 20 | emma | **잘 지냈어요?** | 잘 지냈어요? | How have you been? |
| 대사 #11188 (focus) | 20 | emma | **잘 지냈어요?** | 잘 지냈어요? |  |

### [A] ID 826 · EP20 — 다음에 또 봐요 / See you again next time.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 다음에 또 봐요! | Let's meet again soon! |
| 예문 2 | 꼭 다음에 또 봐요! | We definitely have to meet again! |
| 예문 3 | 다음에 또 봐요, 오늘 즐거웠어요! | See you again — today was really fun! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3543 | 20 | emma | **다음에 또 봐요**! | 다음에 또 봐요 | See you again soon! |
| 대사 #11192 (focus) | 20 | emma | **다음에 또 봐요**! | 다음에 또 봐요 |  |

### [A] ID 862 · EP32 — 언제든지 연락해요 / Contact me anytime.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 언제든지 연락해요! | Stay in touch anytime! |
| 예문 2 | 힘들면 언제든지 연락해요. | If you're struggling, contact me anytime. |
| 예문 3 | 언제든지 연락해요, 항상 여기 있어요! | Contact me anytime — I'm always here! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3637 | 32 | emma | **언제든지 연락해요**. 제가 들어 줄게요. | 언제든지 연락해요 | Call me anytime. I'll listen. |
| 대사 #11286 (focus) | 32 | emma | **언제든지 연락해요**. 제가 들어 줄게요. | 언제든지 연락해요 |  |

### [A] ID 864 · EP33 — 팔로우해도 돼요? / May I follow you?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 팔로우해도 돼요? | Is it okay to follow you? |
| 예문 2 | 인스타 팔로우해도 돼요? | Is it okay to follow you on Instagram? |
| 예문 3 | 팔로우해도 돼요? 저도 팔로우할게요! | Is it okay to follow you? I'll follow you back! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3644 | 33 | emma | **팔로우해도 돼요?** | 팔로우해도 돼요? | May I follow you? |
| 대사 #11293 (focus) | 33 | emma | **팔로우해도 돼요?** | 팔로우해도 돼요? |  |

### [A] ID 867 · EP34 — 더치페이 해요? / Shall we split the bill?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 더치페이 해요? | Should we split the bill? |
| 예문 2 | 오늘 더치페이 해요! | Let's split the bill today! |
| 예문 3 | 더치페이 해요? 아니면 제가 낼게요! | Should we split it? Or I can pay! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4222 | 34 | emma | 그럼 **더치페이 해요?** | 더치페이 해요? | Then should we split the bill? |
| 대사 #11871 (focus) | 34 | emma | 그럼 **더치페이 해요?** | 더치페이 해요? |  |

### [A] ID 868 · EP34 — 밥 한번 먹어요 / Let's grab a meal sometime.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 밥 한번 먹어요! | Let's grab a meal sometime! |
| 예문 2 | 다음에 밥 한번 먹어요! | Let's grab a meal next time! |
| 예문 3 | 밥 한번 먹어요, 제가 살게요! | Let's grab a meal — it's on me! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4225 | 34 | emma | 우리 또 **밥 한번 먹어요**! | 밥 한번 먹어요 | Let's grab a meal together again! |
| 대사 #11874 (focus) | 34 | emma | 우리 또 **밥 한번 먹어요**! | 밥 한번 먹어요 |  |

### [A] ID 875 · EP36 — 오늘은 여기까지만 해요 / Let's stop here for today.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 오늘은 여기까지만 해요! | Let's call it here for today! |
| 예문 2 | 오늘은 여기까지만 해요, 내일 또 해요! | Let's stop here for today — let's continue tomorrow! |
| 예문 3 | 피곤하니까 오늘은 여기까지만 해요. | I'm tired, so let's call it here for today. |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3672 | 36 | emma | **오늘은 여기까지만 해요**! | 오늘은 여기까지만 해요 | Let's stop here for today! |
| 대사 #11321 (focus) | 36 | emma | **오늘은 여기까지만 해요**! | 오늘은 여기까지만 해요 |  |

### [A] ID 877 · EP37 — 신청곡 있어요? / Any song requests?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 신청곡 있어요? | Do you have a song request? |
| 예문 2 | 신청곡 있어요? 제가 틀어줄게요! | Do you have a song request? I'll put it on! |
| 예문 3 | 신청곡 있어요? 뭐 듣고 싶어요? | Do you have a request? What do you want to hear? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3676 | 37 | jisu | **신청곡 있어?** 내가 넣어 줄게. | 신청곡 있어? | Any requests? I'll queue it up. |
| 대사 #11325 (focus) | 37 | jisu | **신청곡 있어?** 내가 넣어 줄게. | 신청곡 있어? |  |

### [A] ID 878 · EP37 — 한 곡 더 해요 / One more song.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 한 곡 더 해요! | Let's do one more song! |
| 예문 2 | 한 곡 더 해요, 이번엔 제가 불러요! | One more song — this time I'll sing! |
| 예문 3 | 재미있으니까 한 곡 더 해요! | It's so fun — let's do one more song! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3680 | 37 | sophie | **한 곡 더 해요**! | 한 곡 더 해요 | One more song! |
| 대사 #11329 (focus) | 37 | sophie | **한 곡 더 해요**! | 한 곡 더 해요 |  |

### [A] ID 879 · EP38 — 같이 춰요 / Let's dance together.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 같이 춰요! | Let's dance together! |
| 예문 2 | 같이 춰요, 이 노래에 맞춰서! | Let's dance together — to this song! |
| 예문 3 | 같이 춰요, 제가 가르쳐줄게요! | Let's dance together — I'll teach you! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3684 | 38 | emma | 저도 **같이 춰요**! | 같이 춰요 | Let me dance with you! |
| 대사 #11333 (focus) | 38 | emma | 저도 **같이 춰요**! | 같이 춰요 |  |

### [A] ID 880 · EP38 — 어렵지만 재미있어요 / It's hard but fun.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 어렵지만 재미있어요! | It's hard but fun! |
| 예문 2 | 처음엔 어렵지만 재미있어요. | It's hard at first, but it's fun. |
| 예문 3 | 어렵지만 재미있어요, 계속 할게요! | It's hard but fun — I'll keep going! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3687 | 38 | emma | **어렵지만 재미있어요**! | 어렵지만 재미있어요 | It's hard but fun! |
| 대사 #11336 (focus) | 38 | emma | **어렵지만 재미있어요**! | 어렵지만 재미있어요 |  |

### [A] ID 881 · EP38 — 하다 보면 늘어요 / You'll improve as you go.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 하다 보면 늘어요! | The more you do it, the better you get! |
| 예문 2 | 연습하다 보면 늘어요. | The more you practice, the better you get. |
| 예문 3 | 매일 하다 보면 늘어요! | If you do it every day, you'll improve! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3688 | 38 | jisu | **하다 보면 늘어**. 잘하고 있어! | 하다 보면 늘어 | You'll improve as you go. You're doing great! |
| 대사 #11337 (focus) | 38 | jisu | **하다 보면 늘어**. 잘하고 있어! | 하다 보면 늘어 |  |

### [A] ID 883 · EP39 — 달달한 거 있어요? / Do you have anything sweet?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 달달한 거 있어요? | Do you have anything sweet? |
| 예문 2 | 달달한 거 있어요? 카라멜 라떼 있어요? | Do you have anything sweet? Is there caramel latte? |
| 예문 3 | 달달한 거 있어요? 오늘 당기네요! | Do you have anything sweet? I'm craving it today! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3691 | 39 | emma | **달달한 거 있어요?** | 달달한 거 있어요? | Do you have anything sweet? |
| 대사 #11340 (focus) | 39 | emma | **달달한 거 있어요?** | 달달한 거 있어요? |  |

### [A] ID 884 · EP39 — 오래 있어도 돼요? / Is it okay to stay a long time?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 오래 있어도 돼요? | Is it okay to stay a long time? |
| 예문 2 | 공부하려고요, 오래 있어도 돼요? | I'm going to study — is it okay to stay long? |
| 예문 3 | 노트북 써도 되고 오래 있어도 돼요? | Can I use my laptop and stay a long time? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3694 | 39 | emma | 저기요, 여기 **오래 있어도 돼요?** | 오래 있어도 돼요? | Excuse me, is it okay to stay a long time here? |
| 대사 #11343 (focus) | 39 | emma | 저기요, 여기 **오래 있어도 돼요?** | 오래 있어도 돼요? |  |

### [A] ID 909 · EP48 — 배달 얼마나 걸려요? / How long does delivery take?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 배달 얼마나 걸려요? | How long does delivery take? |
| 예문 2 | 여기까지 배달 얼마나 걸려요? | How long does delivery take to here? |
| 예문 3 | 배달 얼마나 걸려요? 빨리 왔으면 좋겠어요! | How long does delivery take? I hope it comes quickly! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4300 | 48 | emma | **배달 얼마나 걸려요?** | 배달 얼마나 걸려요? | How long does delivery take? |
| 대사 #11949 (focus) | 48 | emma | **배달 얼마나 걸려요?** | 배달 얼마나 걸려요? |  |

### [A] ID 934 · EP56 — 카드로 할게요 / I'll pay by card.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 카드로 할게요! | I'll pay by card! |
| 예문 2 | 신용카드로 할게요. | I'll pay with a credit card. |
| 예문 3 | 카드로 할게요, 괜찮아요? | I'll pay by card — is that okay? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 대사 #11479 (focus) | 56 | sophie | 현금이 만 원밖에 없어서 **카드로 할게요**. | 카드로 할게요 |  |

### [A] ID 938 · EP58 — 어디가 아파요? / Where does it hurt?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 어디가 아파요? | Where does it hurt? |
| 예문 2 | 어디가 아파요? 많이 아파요? | Where does it hurt? Does it hurt a lot? |
| 예문 3 | 어디가 아파요? 병원 같이 가요. | Where does it hurt? Let's go to the hospital together. |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3843 | 58 | 간호사 | **어디가 아파요?** | 어디가 아파요? | Where does it hurt? |
| 대사 #11492 (focus) | 58 | 간호사 | **어디가 아파요?** | 어디가 아파요? |  |

### [A] ID 1021 · EP61 — 솔직하게 말해도 돼요? / Can I be honest?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 솔직하게 말해도 돼요? | Is it okay to speak honestly? |
| 예문 2 | 솔직하게 말해도 돼요? 상처받지 않을게요. | Is it okay to speak honestly? I won't be hurt. |
| 예문 3 | 솔직하게 말해도 돼요! 저 괜찮아요. | Please speak honestly! I'm okay with it. |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4246 | 61 | emma | **솔직하게 말해도 돼요?** | 솔직하게 말해도 돼요? | Can I be honest? |
| 대사 #11895 (focus) | 61 | emma | **솔직하게 말해도 돼요?** | 솔직하게 말해도 돼요? |  |

### [A] ID 982 · EP73 — 드디어 해냈어요 / I finally did it.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 드디어 해냈어요! | I finally did it! |
| 예문 2 | 1년이 걸렸는데 드디어 해냈어요! | It took a year, but I finally did it! |
| 예문 3 | 드디어 해냈어요, 포기 안 하길 잘했어요! | I finally did it — I'm glad I didn't give up! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3963 | 73 | emma | **드디어 해냈어요**! | 드디어 해냈어요 | I finally did it! |
| 말풍선 #4022 | 80 | emma | **드디어 해냈어요**! | 드디어 해냈어요 | I finally did it! |
| 대사 #11612 (focus) | 73 | emma | **드디어 해냈어요**! | 드디어 해냈어요 |  |
| 대사 #11671 (focus) | 80 | emma | **드디어 해냈어요**! | 드디어 해냈어요 |  |

### [A] ID 1013 · EP84 — 좀 더 생각해 봐야겠어요 / I can't decide right now.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 좀 더 생각해 봐야겠어요. | I need to think about it a bit more. |
| 예문 2 | 좀 더 생각해 봐야겠어요, 기다려줘요. | I need to think about it a bit more — please wait. |
| 예문 3 | 결정하기 전에 좀 더 생각해 봐야겠어요. | I need to think about it a bit more before deciding. |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4054 | 84 | emma | 맞아요. **좀 더 생각해 봐야겠어요**. | 좀 더 생각해 봐야겠어요 | You're right. I should think about it a bit more. |
| 대사 #11703 (focus) | 84 | emma | 맞아요. **좀 더 생각해 봐야겠어요**. | 좀 더 생각해 봐야겠어요 |  |

### [A] ID 1022 · EP87 — 이제 많이 편해졌어요 / I've gotten much more comfortable now.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 이제 많이 편해졌어요! | I've become much more comfortable now! |
| 예문 2 | 처음엔 어색했는데 이제 많이 편해졌어요. | It was awkward at first, but now I'm much more comfortable. |
| 예문 3 | 이제 많이 편해졌어요, 감사해요! | I've become so much more comfortable now — thank you! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4074 | 87 | emma | 저도 그랬어요. 그런데 **이제 많이 편해졌어요**. | 이제 많이 편해졌어요 | I was the same. But now I've gotten much more comfortable. |
| 대사 #11723 (focus) | 87 | emma | 저도 그랬어요. 그런데 **이제 많이 편해졌어요**. | 이제 많이 편해졌어요 |  |

### [A] ID 1049 · EP98 — 이제 한국어로 생각해요 / I think in Korean now.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 이제 한국어로 생각해요! | I think in Korean now! |
| 예문 2 | 꿈도 한국어로 꿔요, 이제 한국어로 생각해요! | I even dream in Korean now — I think in Korean! |
| 예문 3 | 이제 한국어로 생각해요? 대단해요! | You think in Korean now? That's amazing! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4162 | 98 | emma | **이제 한국어로 생각해요**. 머릿속에서 영어가 먼저 안 나와요. | 이제 한국어로 생각해요 | I think in Korean now. English doesn't come out first in my head. |
| 대사 #11811 (focus) | 98 | emma | **이제 한국어로 생각해요**. 머릿속에서 영어가 먼저 안 나와요. | 이제 한국어로 생각해요 |  |

### [A] ID 1050 · EP98 — 번역 안 해도 이해돼요 / I understand without translating.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 번역 안 해도 이해돼요! | I understand without even translating! |
| 예문 2 | 이제 번역 안 해도 이해돼요, 신기해요! | I understand without translating now — it's amazing! |
| 예문 3 | 번역 안 해도 이해돼요? 완전 늘었네요! | You understand without translating? You've really improved! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4165 | 98 | emma | 수업도 **번역 안 해도 이해돼요**. | 번역 안 해도 이해돼요 | I understand class without translating too. |
| 대사 #11814 (focus) | 98 | emma | 수업도 **번역 안 해도 이해돼요**. | 번역 안 해도 이해돼요 |  |

### [A] ID 1052 · EP99 — 같이 성장한 것 같아요 / I think we grew together.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 같이 성장한 것 같아요! | I feel like we've grown together! |
| 예문 2 | 같이 공부하면서 같이 성장한 것 같아요. | I feel like we grew together while studying together. |
| 예문 3 | 같이 성장한 것 같아요, 고마워요! | I feel like we've grown together — thank you! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4173 | 99 | emma | 우리 다 **같이 성장한 것 같아요**. | 같이 성장한 것 같아요 | I think we all grew together. |
| 대사 #11822 (focus) | 99 | emma | 우리 다 **같이 성장한 것 같아요**. | 같이 성장한 것 같아요 |  |

### [A] ID 1053 · EP99 — 덕분에 정말 많이 배웠어요 / I learned so much thanks to you.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 덕분에 정말 많이 배웠어요! | I've learned so much thanks to you! |
| 예문 2 | 여러분 덕분에 정말 많이 배웠어요! | I've learned so much thanks to all of you! |
| 예문 3 | 덕분에 정말 많이 배웠어요, 감사해요! | I've learned so much thanks to you — thank you! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4172 | 99 | sophie | 저도 에마 씨 **덕분에 정말 많이 배웠어요**. | 덕분에 정말 많이 배웠어요 | I learned so much thanks to you, Emma. |
| 대사 #11821 (focus) | 99 | sophie | 저도 에마 씨 **덕분에 정말 많이 배웠어요**. | 덕분에 정말 많이 배웠어요 |  |

### [B] ID 806 · EP14 — 길을 잃었어요 / I'm lost.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 길을 잃었어요, 도와주세요. | I'm lost, please help me. |
| 예문 2 | 길을 잃었어요, 홍대가 어디예요? | I'm lost — where is Hongdae? |
| 예문 3 | 길을 잃었어요, 지도 좀 봐도 돼요? | I'm lost — can I look at your map? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3486 | 14 | emma | 저기요, **길을 잃었어요**. | 길을 잃었어요 | Excuse me, I'm lost. |
| 대사 #11135 (focus) | 14 | emma | 저기요, **길을 잃었어요**. | 길을 잃었어요 |  |

### [B] ID 819 · EP18 — 저도요 / Me too.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 저도요! 저도 케이팝 좋아요! | Me too! I love K-pop too! |
| 예문 2 | 저도요, 진짜 맛있어요! | Me too — it's really delicious! |
| 예문 3 | 저도요! 같이 가요! | Me too! Let's go together! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4203 | 18 | emma | **저도요**! 학교에서 사진 동아리 했어요. | 저도요 | Me too! I was in a photography club at school. |
| 대사 #11852 (focus) | 18 | emma | **저도요**! 학교에서 사진 동아리 했어요. | 저도요 |  |

### [B] ID 829 · EP21 — 처음이었는데 / It was my first time, but ~

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 처음이었는데 진짜 맛있었어! | It was my first time, but it was really delicious! |
| 예문 2 | 처음이었는데 생각보다 쉬웠어. | It was my first time, but it was easier than I thought. |
| 예문 3 | 처음이었는데 또 가고 싶어! | It was my first time, but I want to go again! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3547 | 21 | emma | 근데 치킨은 **처음이었는데**… 좀 짰어요. | 처음이었는데 | But it was my first time having chicken... and it was a bit salty. |
| 대사 #11196 (focus) | 21 | emma | 근데 치킨은 **처음이었는데**… 좀 짰어요. | 처음이었는데 |  |

### [B] ID 861 · EP32 — 요즘 좀 힘들어요 / Things have been a bit hard lately.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 요즘 좀 힘들어요, 공부가 어려워요. | I've been struggling lately — studying is hard. |
| 예문 2 | 요즘 좀 힘들어요, 많이 바빠요. | I've been having a hard time lately — I'm very busy. |
| 예문 3 | 요즘 좀 힘들어요, 그래도 괜찮아요! | I've been struggling lately, but I'm okay! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3634 | 32 | jisu | **요즘 좀 힘들어**… | 요즘 좀 힘들어 | Things have been a bit hard lately... |
| 대사 #11283 (focus) | 32 | jisu | **요즘 좀 힘들어**… | 요즘 좀 힘들어 |  |

### [B] ID 863 · EP33 — 카카오톡 해요? / Do you use KakaoTalk?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 카카오톡 해요? 아이디 알려줘요! | Do you use KakaoTalk? Tell me your ID! |
| 예문 2 | 카카오톡 해요? 친구 추가할게요! | Do you use KakaoTalk? I'll add you as a friend! |
| 예문 3 | 카카오톡 해요? 거기서 연락해요! | Do you use KakaoTalk? Let's message there! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3640 | 33 | emma | 민준 씨, **카카오톡 해요?** | 카카오톡 해요? | Minjun, do you use KakaoTalk? |
| 대사 #11289 (focus) | 33 | emma | 민준 씨, **카카오톡 해요?** | 카카오톡 해요? |  |

### [B] ID 873 · EP36 — 술 마셔요? / Do you drink?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 술 마셔요? 저는 조금만요! | Do you drink? Just a little for me! |
| 예문 2 | 술 마셔요? 같이 한잔 해요! | Do you drink? Let's have a drink together! |
| 예문 3 | 술 마셔요? 오늘은 못 마셔요. | Do you drink? I can't drink today. |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3665 | 36 | emma | 민준 씨, **술 마셔요?** | 술 마셔요? | Minjun, do you drink? |
| 대사 #11314 (focus) | 36 | emma | 민준 씨, **술 마셔요?** | 술 마셔요? |  |

### [B] ID 887 · EP40 — 처음엔 낯설었는데 / It felt strange at first, but ~

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 처음엔 낯설었는데 이제 괜찮아요. | It was unfamiliar at first, but now it's fine. |
| 예문 2 | 처음엔 낯설었는데 지금은 좋아요! | It was unfamiliar at first, but now I love it! |
| 예문 3 | 처음엔 낯설었는데 하다 보니 익숙해졌어요. | It was unfamiliar at first, but I got used to it. |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3699 | 40 | emma | 처음엔 다 **낯설었는데**… | 낯설었는데 | At first everything felt strange... |
| 대사 #11348 (focus) | 40 | emma | **처음엔 다 낯설었는데**… | 처음엔 다 낯설었는데 |  |

### [B] ID 914 · EP50 — 한국 생활 어때? / How's life in Korea?

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 한국 생활 어때? 적응됐어? | How is life in Korea? Have you adapted? |
| 예문 2 | 한국 생활 어때? 힘든 점 없어? | How is life in Korea? Is there anything hard? |
| 예문 3 | 한국 생활 어때? 음식은 맛있어? | How is life in Korea? Is the food delicious? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3777 | 50 | jisu | **한국 생활 어때?** | 한국 생활 어때? | How's life in Korea? |
| 대사 #11426 (focus) | 50 | jisu | **한국 생활 어때?** | 한국 생활 어때? |  |

### [B] ID 993 · EP77 — 처음 만났을 때 / when we first met

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 처음 만났을 때 많이 떨렸어요! | I was so nervous when we first met! |
| 예문 2 | 처음 만났을 때 한국어 잘 못했어요. | When we first met, my Korean wasn't very good. |
| 예문 3 | 처음 만났을 때 기억해요? | Do you remember when we first met? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #3995 | 77 | minjun | 저기가 우리 **처음 만났을 때** 그 자리야. | 처음 만났을 때 | That's the spot where we first met. |
| 대사 #11644 (focus) | 77 | minjun | 저기가 우리 **처음 만났을 때** 그 자리야. | 처음 만났을 때 |  |

### [B] ID 1012 · EP84 — 잘 모르겠는데요 / I'm not really sure.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 잘 모르겠는데요, 좀 더 생각해볼게요. | I'm not sure — let me think about it a bit more. |
| 예문 2 | 잘 모르겠는데요, 알아보고 알려줄게요. | I'm not sure — let me look into it and let you know. |
| 예문 3 | 잘 모르겠는데요, 어떻게 생각해요? | I'm not sure — what do you think? |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4050 | 84 | emma | 사실 저도 **잘 모르겠는데요**. | 잘 모르겠는데요 | Honestly, I'm not really sure myself. |
| 대사 #11699 (focus) | 84 | emma | 사실 저도 **잘 모르겠는데요**. | 잘 모르겠는데요 |  |

### [B] ID 1017 · EP85 — 딱 봐도 알겠어요 / I can tell just by looking.

| 구분 | 한국어 | English |
|---|---|---|
| 예문 1 | 딱 봐도 알겠어요, 너무 맛있어 보여요! | I can tell just by looking — it looks so delicious! |
| 예문 2 | 딱 봐도 알겠어요, 그 표정이 다 말해줘요! | I can tell just by looking — your expression says it all! |
| 예문 3 | 딱 봐도 알겠어요, 진짜 행복해 보여요! | I can tell just by looking — you look truly happy! |

| 출처 | EP | 화자 | 하이라이트된 문장 | 하이라이트 글자 | 영어 |
|---|---|---|---|---|---|
| 말풍선 #4058 | 85 | emma | 알아요. **딱 봐도 알겠어요**. | 딱 봐도 알겠어요 | I know. I can tell just by looking. |
| 대사 #11707 (focus) | 85 | emma | 알아요. **딱 봐도 알겠어요**. | 딱 봐도 알겠어요 |  |
