/**
 * PATTO Pattern Example DB v2 — Phase 1 검수본 (30 patterns × 3 examples = 90 examples)
 *
 * 작성 기준:
 *  - 원어민이 실제 쓰는 자연스러운 영어
 *  - 각 패턴마다 주어·시제·문장 구조를 다르게 (I / You / He / She / They / We 등)
 *  - Relative Clause / Passive / Gerund / Infinitive / That Clause /
 *    If Clause / Comparative / Idiomatic / Phrasal Verb 등을 균형 있게 포함
 *  - 한국어 번역은 직역보다 자연스러운 의미 전달 우선
 *
 * Phase 1 범위: Story 1–6 (pt1-1 ~ pt6-5)
 * → 검수 통과 후 pt7-1 ~ pt100-5 (470패턴) 동일 기준으로 제작 예정
 */

export type PracticeExampleV2 = {
  en: string
  ko: string
}

export const patternExamplesV2: Record<string, PracticeExampleV2[]> = {

  // ── Story 1 · A New Start ───────────────────────────────────────────────────

  // I want to ~.  (~하고 싶어)
  'pt1-1': [
    {
      en: 'She wants to move somewhere she can actually walk to work.',
      ko: '그녀는 걸어서 출근할 수 있는 곳으로 이사가고 싶어해.',
    },
    {
      en: 'We want to try that new place before everyone else discovers it.',
      ko: '다들 알기 전에 그 새 식당을 먼저 가보고 싶어.',
    },
    {
      en: "Do you want to grab a quick coffee before the meeting starts?",
      ko: '회의 시작 전에 커피 한잔 빠르게 할래?',
    },
  ],

  // I'm thinking about ~ing.  (~을 생각 중이야)
  'pt1-2': [
    {
      en: "He's thinking about switching jobs — the commute alone is killing him.",
      ko: '그는 이직을 생각 중이야 — 출퇴근만으로도 너무 힘들대.',
    },
    {
      en: 'Are you thinking about cutting your hair short before summer hits?',
      ko: '여름 되기 전에 머리 짧게 자를까 생각 중이야?',
    },
    {
      en: "They're thinking about adopting a dog once they find a bigger place.",
      ko: '그들은 더 넓은 집을 구하면 강아지를 입양할까 생각 중이야.',
    },
  ],

  // I should ~.  (~해야 할 것 같아)
  'pt1-3': [
    {
      en: 'You should double-check the address before you head out.',
      ko: '나가기 전에 주소 한번 더 확인해봐.',
    },
    {
      en: 'She should have called them back sooner — now it just looks bad.',
      ko: '그녀가 더 빨리 다시 전화했어야 했는데 — 이제 안 좋아 보여.',
    },
    {
      en: 'We should look into whether there are any cheaper options first.',
      ko: '더 저렴한 옵션이 있는지 먼저 알아봐야 할 것 같아.',
    },
  ],

  // That's because ~.  (그건 ~ 때문이야)
  'pt1-4': [
    {
      en: "That's because nobody told him the plan had changed.",
      ko: '그건 아무도 그에게 계획이 바뀌었다고 말하지 않았기 때문이야.',
    },
    {
      en: "That's because she's been pulling back-to-back shifts all week.",
      ko: '그건 그녀가 일주일 내내 연속으로 일했기 때문이야.',
    },
    {
      en: "That's because the earlier you book, the better the price gets.",
      ko: '그건 일찍 예약할수록 가격이 더 좋아지기 때문이야.',
    },
  ],

  // It turns out ~.  (알고 보니 ~이더라)
  'pt1-5': [
    {
      en: 'It turns out the shortcut actually takes longer during rush hour.',
      ko: '알고 보니 그 지름길은 러시아워에 오히려 더 오래 걸리더라.',
    },
    {
      en: 'It turns out she had been living just two blocks from me the whole time.',
      ko: '알고 보니 그녀는 쭉 나에게서 두 블록 떨어진 곳에 살고 있었더라.',
    },
    {
      en: 'It turns out what we needed had been sitting in the drawer all along.',
      ko: '알고 보니 우리가 필요했던 게 처음부터 서랍 안에 있었더라.',
    },
  ],

  // ── Story 2 · An Old Friend ─────────────────────────────────────────────────

  // I'm planning to ~.  (~할 계획이야)
  'pt2-1': [
    {
      en: "He's planning to ask for a promotion before the year ends.",
      ko: '그는 연말 전에 승진을 요청할 계획이야.',
    },
    {
      en: 'Are you planning to stay at your parents\' place over the long weekend?',
      ko: '연휴에 부모님 댁에 있을 계획이야?',
    },
    {
      en: "They're planning to throw her a surprise party if she gets the offer.",
      ko: '그들은 그녀가 제안을 받으면 깜짝 파티를 열 계획이야.',
    },
  ],

  // I used to ~.  (예전에 ~했었어)
  'pt2-2': [
    {
      en: 'He used to run every morning before his back injury slowed him down.',
      ko: '그는 허리 부상이 생기기 전엔 매일 아침 달리기를 했었어.',
    },
    {
      en: 'Did you use to pack your own lunch back when you were still in school?',
      ko: '학교 다닐 때 도시락을 직접 챙기곤 했어?',
    },
    {
      en: 'They used to argue about everything, but now they barely speak.',
      ko: '예전에 그들은 모든 것에 대해 다퉜는데, 이제는 말도 거의 안 해.',
    },
  ],

  // I'm sorry for ~ing.  (~해서 미안해)
  'pt2-3': [
    {
      en: "She's sorry for snapping at you — she was under a lot of pressure.",
      ko: '그녀가 너한테 쏘아붙여서 미안하대 — 압박이 많이 있었대.',
    },
    {
      en: "I'm sorry for taking so long to get back to you.",
      ko: '답장이 이렇게 늦어져서 미안해.',
    },
    {
      en: "He's sorry for bringing it up at the worst possible time.",
      ko: '그는 최악의 타이밍에 그걸 꺼내서 미안하대.',
    },
  ],

  // It seems like ~.  (~인 것 같아)
  'pt2-4': [
    {
      en: "It seems like they've already made up their minds.",
      ko: '그들은 이미 마음을 정한 것 같아.',
    },
    {
      en: 'It seems like the more you rush it, the worse the result gets.',
      ko: '서두르면 서두를수록 결과가 더 안 좋아지는 것 같아.',
    },
    {
      en: 'It seems like nobody reads the instructions before setting things up.',
      ko: '다들 설치하기 전에 설명서를 읽지 않는 것 같아.',
    },
  ],

  // I'm looking forward to ~ing.  (~이 기대돼)
  'pt2-5': [
    {
      en: "She's looking forward to finally getting some real time off.",
      ko: '그녀는 드디어 제대로 쉬는 시간이 생기는 게 기대된대.',
    },
    {
      en: "We're looking forward to seeing how the whole thing turns out.",
      ko: '우리는 그게 어떻게 결과가 나올지 기대돼.',
    },
    {
      en: "He's looking forward to meeting the people he'll be working alongside.",
      ko: '그는 함께 일하게 될 동료들을 만나는 게 기대된대.',
    },
  ],

  // ── Story 3 · An Ordinary Morning ──────────────────────────────────────────

  // I have to ~.  (~해야 해)
  'pt3-1': [
    {
      en: 'She has to renew her visa before it expires at the end of next month.',
      ko: '그녀는 다음 달 말에 만료되기 전에 비자를 갱신해야 해.',
    },
    {
      en: 'We have to find a way to get this done without going over budget.',
      ko: '예산을 초과하지 않고 이걸 끝낼 방법을 찾아야 해.',
    },
    {
      en: 'Do you have to be there in person, or can you just dial in?',
      ko: '직접 거기 가야 해, 아니면 그냥 전화로 참여할 수 있어?',
    },
  ],

  // I don't ~.  (~하지 않아)
  'pt3-2': [
    {
      en: "She doesn't eat red meat, so keep that in mind when you're ordering.",
      ko: '그녀는 붉은 고기를 안 먹으니까 주문할 때 기억해.',
    },
    {
      en: "We don't usually leave this early, but traffic's been unpredictable lately.",
      ko: '우리는 보통 이렇게 일찍 안 떠나는데, 요즘 교통이 예측하기 어려워서.',
    },
    {
      en: "He doesn't seem to realize how much effort everyone else is putting in.",
      ko: '그는 다른 사람들이 얼마나 많은 노력을 하고 있는지 모르는 것 같아.',
    },
  ],

  // Let me ~.  (내가 ~할게)
  'pt3-3': [
    {
      en: "Let me check if there's any availability this weekend before you book.",
      ko: '예약하기 전에 이번 주말에 자리가 있는지 내가 먼저 확인해볼게.',
    },
    {
      en: "Let me know when you're done and I'll come pick you up.",
      ko: '다 끝나면 알려줘, 내가 데리러 갈게.',
    },
    {
      en: "Let me handle the awkward part — you just follow my lead.",
      ko: '어색한 부분은 내가 처리할게 — 너는 그냥 나를 따라와.',
    },
  ],

  // Thank you for ~ing.  (~해줘서 고마워)
  'pt3-4': [
    {
      en: 'Thank you for covering my shift on such short notice.',
      ko: '이렇게 갑작스럽게 교대 대신해줘서 고마워.',
    },
    {
      en: 'She thanked him for staying calm when everything was falling apart.',
      ko: '그녀는 모든 게 무너져 내릴 때 그가 차분하게 있어줘서 고마워했어.',
    },
    {
      en: 'Thank you for pointing that out — I would have missed it completely.',
      ko: '그걸 짚어줘서 고마워 — 완전히 놓쳤을 거야.',
    },
  ],

  // I just wanted to ~.  (그냥 ~하고 싶었어)
  'pt3-5': [
    {
      en: 'She just wanted to make sure you got home safely.',
      ko: '그녀는 그냥 네가 집에 잘 도착했는지 확인하고 싶었어.',
    },
    {
      en: 'I just wanted to drop by and see how you were doing.',
      ko: '그냥 잠깐 들러서 어떻게 지내는지 보고 싶었어.',
    },
    {
      en: 'He just wanted to finish the chapter before turning off the light.',
      ko: '그는 그냥 불 끄기 전에 챕터를 끝내고 싶었어.',
    },
  ],

  // ── Story 4 · The Night Before ──────────────────────────────────────────────

  // I can ~.  (~할 수 있어)
  'pt4-1': [
    {
      en: 'She can get us the tickets at a discount through her company.',
      ko: '그녀는 회사를 통해 우리에게 할인된 티켓을 구해줄 수 있어.',
    },
    {
      en: "I can tell something's wrong just by the way you're texting me.",
      ko: '네가 문자 보내는 방식만 봐도 뭔가 잘못됐다는 걸 알 수 있어.',
    },
    {
      en: 'He can take over the presentation if you need to step out.',
      ko: '네가 자리를 비워야 하면 그가 발표를 넘겨받을 수 있어.',
    },
  ],

  // I'm still ~.  (아직도 ~해)
  'pt4-2': [
    {
      en: "She's still not sure whether to accept the offer or wait it out.",
      ko: '그녀는 제안을 수락할지 기다릴지 아직도 모르겠대.',
    },
    {
      en: "We're still looking for someone reliable who can cover weekends.",
      ko: '우리는 아직도 주말을 담당해줄 믿을 만한 사람을 찾고 있어.',
    },
    {
      en: "He's still the sharpest at catching mistakes that everyone else walks right past.",
      ko: '그는 아직도 다른 사람들이 그냥 지나치는 실수를 잡아내는 걸 제일 잘해.',
    },
  ],

  // I keep ~ing.  (자꾸 ~하게 돼)
  'pt4-3': [
    {
      en: 'She keeps leaving her badge at home and having to buzz in every time.',
      ko: '그녀는 자꾸 집에 배지를 두고 와서 매번 인터폰을 눌러야 해.',
    },
    {
      en: 'He keeps bringing up things that happened years ago.',
      ko: '그는 자꾸 몇 년 전 일을 꺼내.',
    },
    {
      en: "They keep pushing the deadline back without giving a real explanation.",
      ko: '그들은 자꾸 제대로 된 설명도 없이 마감을 미루고 있어.',
    },
  ],

  // I'm about to ~.  (막 ~하려던 참이야)
  'pt4-4': [
    {
      en: "She's about to submit the report — just doing one last check on the numbers.",
      ko: '그녀는 막 보고서를 제출하려던 참이야 — 숫자만 마지막으로 한 번 더 확인하고.',
    },
    {
      en: "We're about to run out of time, so let's start wrapping this up.",
      ko: '시간이 거의 다 됐으니까 이제 마무리하기 시작하자.',
    },
    {
      en: 'He was about to leave when she called out and asked him to stay.',
      ko: '그는 막 나가려던 참이었는데 그녀가 불러서 있어달라고 했어.',
    },
  ],

  // I'm supposed to ~.  (~하기로 되어 있어)
  'pt4-5': [
    {
      en: "She's supposed to lead tomorrow's meeting, but she's not feeling well.",
      ko: '그녀가 내일 회의를 진행하기로 되어 있는데, 몸이 안 좋대.',
    },
    {
      en: "We're supposed to hand in the draft by Friday — is that still happening?",
      ko: '우리 초안을 금요일까지 제출하기로 되어 있는데 — 그게 아직 맞아?',
    },
    {
      en: 'He was supposed to pick her up, but he got stuck in traffic.',
      ko: '그가 그녀를 데리러 가기로 되어 있었는데, 차가 막혔어.',
    },
  ],

  // ── Story 5 · By the Window ─────────────────────────────────────────────────

  // I'm going to ~.  (~할 거야)
  'pt5-1': [
    {
      en: "She's going to quit smoking — she's been saying it for months, and this time she means it.",
      ko: '그녀는 담배를 끊을 거야 — 몇 달째 말하고 있는데, 이번엔 진심이래.',
    },
    {
      en: "We're going to need a bigger space if the team keeps growing at this rate.",
      ko: '팀이 이 속도로 계속 커지면 더 넓은 공간이 필요할 거야.',
    },
    {
      en: "He's going to regret skipping the meeting once he sees what was decided.",
      ko: '그는 뭐가 결정됐는지 보고 나면 회의를 빠진 걸 후회할 거야.',
    },
  ],

  // I'm going to try ~ing.  (~해볼 거야)
  'pt5-2': [
    {
      en: "She's going to try meal-prepping on Sundays to save time during the week.",
      ko: '그녀는 주중에 시간을 아끼려고 일요일에 밀프렙을 해볼 거야.',
    },
    {
      en: "He's going to try cycling to work now that the weather's finally getting nicer.",
      ko: '날씨가 드디어 좋아지니까 그는 자전거로 출근해볼 거야.',
    },
    {
      en: "We're going to try setting up a shared calendar so nothing slips through the cracks.",
      ko: '우리는 아무것도 빠뜨리지 않도록 공유 캘린더를 만들어볼 거야.',
    },
  ],

  // I've been ~ing.  (계속 ~하고 있어)
  'pt5-3': [
    {
      en: "She's been waking up before sunrise just to get her workout in.",
      ko: '그녀는 운동을 하려고 해가 뜨기 전에 일어나고 있어.',
    },
    {
      en: "We've been trying to cut back on takeout, but it's harder than we expected.",
      ko: '우리는 배달음식을 줄이려고 하고 있는데, 생각보다 어려워.',
    },
    {
      en: "He's been meaning to call her back since last week but keeps getting sidetracked.",
      ko: '그는 지난주부터 그녀에게 다시 전화하려고 하는데, 자꾸 딴 데 정신이 팔려.',
    },
  ],

  // I think ~.  (~인 것 같아)
  'pt5-4': [
    {
      en: 'I think what he really needs right now is a break, not a solution.',
      ko: '그가 지금 진짜 필요한 건 해결책이 아니라 휴식인 것 같아.',
    },
    {
      en: 'She thinks the earlier version was better, and honestly, so do I.',
      ko: '그녀는 이전 버전이 더 나았다고 생각하는데, 솔직히 나도 그래.',
    },
    {
      en: 'Do you think there is a way to do this without pulling everyone in?',
      ko: '모두를 끌어들이지 않고 이걸 할 방법이 있다고 생각해?',
    },
  ],

  // I feel like ~.  (~인 느낌이야)
  'pt5-5': [
    {
      en: "She feels like everyone at the party already knows each other except her.",
      ko: '그녀는 파티에서 자기만 빼고 다들 서로 아는 것 같은 느낌이래.',
    },
    {
      en: "I feel like we've been going around in circles and not actually getting anywhere.",
      ko: '우리가 제자리를 맴돌면서 사실 아무데도 못 가고 있는 느낌이야.',
    },
    {
      en: "He feels like something's been off with the group lately, but he can't quite put his finger on it.",
      ko: '그는 요즘 그룹 내에서 뭔가 이상한 것 같은 느낌인데, 딱 꼬집어 말하기가 어렵대.',
    },
  ],

  // ── Story 6 · Two Roads ─────────────────────────────────────────────────────

  // I'm not sure ~.  (~인지 모르겠어)
  'pt6-1': [
    {
      en: "She's not sure whether to take the job or hold out for something that's a better fit.",
      ko: '그녀는 그 일을 받을지 아니면 더 잘 맞는 걸 기다릴지 모르겠대.',
    },
    {
      en: "I'm not sure why he suddenly stopped responding to messages.",
      ko: '그가 갑자기 왜 메시지에 답을 안 하기 시작했는지 모르겠어.',
    },
    {
      en: "We're not sure if the client wants actual changes or if they're just testing us.",
      ko: '고객이 정말 변경을 원하는 건지 아니면 그냥 우리를 테스트하는 건지 모르겠어.',
    },
  ],

  // I tend to ~.  (~하는 편이야)
  'pt6-2': [
    {
      en: 'She tends to speak too fast when nervous, and people end up missing things.',
      ko: '그녀는 긴장하면 너무 빨리 말하는 편이라, 사람들이 놓치는 게 생겨.',
    },
    {
      en: 'He tends to underestimate how long things are actually going to take.',
      ko: '그는 얼마나 오래 걸릴지 과소평가하는 편이야.',
    },
    {
      en: 'They tend to avoid confrontation, which means problems never really get resolved.',
      ko: '그들은 대면을 피하는 편이라, 문제가 제대로 해결되지 않아.',
    },
  ],

  // It depends on ~.  (~에 달려 있어)
  'pt6-3': [
    {
      en: 'It depends on how much time you are actually willing to put into it.',
      ko: '네가 거기에 실제로 얼마나 시간을 쏟을 의향이 있느냐에 달려 있어.',
    },
    {
      en: 'It depends on whether the budget gets approved before the end of the quarter.',
      ko: '분기 말 전에 예산이 승인되느냐에 달려 있어.',
    },
    {
      en: 'Whether it works out really depends on how well the two of them communicate.',
      ko: '그게 잘 될지는 정말 둘이 얼마나 잘 소통하느냐에 달려 있어.',
    },
  ],

  // I'm trying to ~.  (~하려고 노력 중이야)
  'pt6-4': [
    {
      en: "She's trying to stay off her phone after nine PM — with mixed results so far.",
      ko: '그녀는 밤 9시 이후에 폰을 안 보려고 노력 중인데, 아직까진 결과가 들쭉날쭉이야.',
    },
    {
      en: "We're trying to put together a schedule that actually works for everyone involved.",
      ko: '우리는 관련된 모든 사람에게 실제로 맞는 일정을 짜려고 노력 중이야.',
    },
    {
      en: "He's trying to be more patient with people who see things differently from him.",
      ko: '그는 자신과 다르게 보는 사람들에게 더 인내심을 갖으려고 노력 중이야.',
    },
  ],

  // Even though ~.  (~임에도 불구하고)
  'pt6-5': [
    {
      en: 'Even though she was exhausted, she stayed until the very last guest had left.',
      ko: '그녀는 지쳤음에도 불구하고 마지막 손님이 나갈 때까지 있었어.',
    },
    {
      en: 'Even though we disagreed on the approach, we still managed to finish on time.',
      ko: '접근 방식에 의견이 달랐음에도 불구하고, 제때 끝낼 수 있었어.',
    },
    {
      en: 'Even though the weather was awful all day, the whole trip ended up being great.',
      ko: '하루 종일 날씨가 최악이었음에도 불구하고, 여행이 결국 정말 좋게 끝났어.',
    },
  ],
}
