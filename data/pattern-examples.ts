/**
 * Pattern 연습 예문 — 패턴별 5문장 (PATTO Phase 1 · Gold Standard)
 *
 * 각 패턴(patternId)마다 예문 5개:
 *   [0] = Story에 등장하는 대표 예문 (Context 연결 — 변경하지 않음)
 *   [1~4] = Gold Standard 회화 예문
 *
 * 작성 기준은 docs/PATTO_STYLE_GUIDE.md 참고.
 * - 원어민이 일주일 안에 실제 쓸 법한 문장만 (회화 우선)
 * - 평균 8~15단어, 생활 어휘(receipt, landlord, groceries, charger, refund …)를
 *   문장 안에서 자연스럽게 반복 학습
 * - domain 태그로 5개 예문이 일상생활/회사/여행/인간관계/돌발을 골고루 커버
 */

/** 예문 영역 — 5개 예문이 골고루 커버하도록 (PATTO Style Guide §2) */
export type ExampleDomain = '생활' | '회사' | '여행' | '인간관계' | '돌발'

export type PracticeExample = { en: string; ko: string; domain?: ExampleDomain }

export const patternExamples: Record<string, PracticeExample[]> = {
  // ── Story 1 · 새로운 시작 ───────────────────────────────────────────────
  'pt1-1': [
    { en: 'I want to start something new this time.', ko: '이번엔 새로운 걸 시작하고 싶어.', domain: '생활' },
    { en: 'I want to swap shifts with someone this weekend if I can.', ko: '가능하면 이번 주말에 누구랑 근무를 바꾸고 싶어.', domain: '회사' },
    { en: 'I want to get an aisle seat so I can stretch my legs.', ko: '다리 좀 펴게 통로 자리를 받고 싶어.', domain: '여행' },
    { en: 'I want to grab dinner and catch up sometime this week.', ko: '이번 주에 같이 저녁 먹으면서 얘기 좀 하고 싶어.', domain: '인간관계' },
    { en: 'I want to get a refund since it arrived broken.', ko: '깨진 채로 와서 환불받고 싶어.', domain: '돌발' },
  ],
  'pt1-2': [
    { en: "I'm thinking about keeping a short journal every night.", ko: '매일 밤 짧은 일기를 쓸까 생각 중이야.', domain: '생활' },
    { en: "I'm thinking about bringing up the parking issue at the meeting.", ko: '회의에서 주차 문제를 꺼낼까 생각 중이야.', domain: '회사' },
    { en: "I'm thinking about booking a window seat for the morning flight.", ko: '아침 비행기 창가 자리를 예약할까 생각 중이야.', domain: '여행' },
    { en: "I'm thinking about getting my mom flowers for her birthday.", ko: '엄마 생일에 꽃을 사드릴까 생각 중이야.', domain: '인간관계' },
    { en: "I'm thinking about calling a plumber before the leak gets worse.", ko: '누수가 더 심해지기 전에 배관공을 부를까 생각 중이야.', domain: '돌발' },
  ],
  'pt1-3': [
    { en: 'I should write down one good thing too.', ko: '좋은 일 하나도 적어야 할 것 같아.', domain: '생활' },
    { en: 'I should email my boss and ask to move the deadline.', ko: '상사한테 메일 보내서 마감을 미뤄도 되는지 물어봐야 할 것 같아.', domain: '회사' },
    { en: 'I should print my boarding pass in case my phone dies.', ko: '폰 꺼질까 봐 탑승권을 출력해 둬야 할 것 같아.', domain: '여행' },
    { en: "I should text her back before she thinks I'm ignoring her.", ko: '내가 무시한다고 생각하기 전에 답장해야 할 것 같아.', domain: '인간관계' },
    { en: 'I should grab the spare key before we lock ourselves out.', ko: '문 잠기기 전에 여분 열쇠를 챙겨야 할 것 같아.', domain: '돌발' },
  ],
  'pt1-4': [
    { en: 'The reason is I forget the small moments too quickly.', ko: '이유는 작은 순간들을 너무 빨리 잊어버리기 때문이야.', domain: '생활' },
    { en: 'The reason is the printer jammed right before the big meeting.', ko: '이유는 중요한 회의 직전에 프린터가 걸렸기 때문이야.', domain: '회사' },
    { en: 'The reason is our connecting flight got delayed two hours.', ko: '이유는 우리 환승 비행기가 두 시간 지연됐기 때문이야.', domain: '여행' },
    { en: "The reason is I didn't want to cancel on you last minute.", ko: '이유는 너한테 막판에 약속을 취소하고 싶지 않아서야.', domain: '인간관계' },
    { en: 'The reason is the elevator broke and I took the stairs.', ko: '이유는 엘리베이터가 고장 나서 계단으로 왔기 때문이야.', domain: '돌발' },
  ],
  'pt1-5': [
    { en: 'It turns out it only took five minutes.', ko: '알고 보니 5분밖에 안 걸렸어.', domain: '생활' },
    { en: 'It turns out the meeting got moved to Thursday afternoon.', ko: '알고 보니 회의가 목요일 오후로 옮겨졌더라.', domain: '회사' },
    { en: 'It turns out our hotel includes free breakfast and parking.', ko: '알고 보니 우리 호텔이 조식이랑 주차가 무료더라.', domain: '여행' },
    { en: 'It turns out we grew up just a few blocks apart.', ko: '알고 보니 우리 몇 블록 떨어진 데서 자랐더라.', domain: '인간관계' },
    { en: 'It turns out I left my umbrella on the subway again.', ko: '알고 보니 또 지하철에 우산을 두고 내렸더라.', domain: '돌발' },
  ],

  // ── Story 2 · 나를 만드는 시간 ─────────────────────────────────────────
  'pt2-1': [
    { en: "I'm planning to tell her about everything that changed.", ko: '바뀐 모든 것에 대해 그녀에게 이야기할 계획이야.', domain: '인간관계' },
    { en: "I'm planning to ask for a raise at my next review.", ko: '다음 평가 때 연봉 인상을 요청할 계획이야.', domain: '회사' },
    { en: "I'm planning to book the early train to beat the crowds.", ko: '사람 몰리는 걸 피하려고 이른 기차를 예약할 계획이야.', domain: '여행' },
    { en: "I'm planning to drop off my dry cleaning on the way home.", ko: '집에 가는 길에 드라이클리닝 맡길 계획이야.', domain: '생활' },
    { en: "I'm planning to swing by the pharmacy before it closes.", ko: '약국 문 닫기 전에 잠깐 들를 계획이야.', domain: '돌발' },
  ],
  'pt2-2': [
    { en: 'I used to cancel plans whenever I felt tired.', ko: '예전에는 피곤할 때마다 약속을 취소하곤 했어.', domain: '인간관계' },
    { en: 'I used to take the bus to work before I got my car.', ko: '차 생기기 전엔 버스 타고 출근했어.', domain: '회사' },
    { en: 'I used to lose my passport the night before every trip.', ko: '예전엔 여행 전날 밤마다 여권을 잃어버리곤 했어.', domain: '여행' },
    { en: 'I used to forget my umbrella every single time it rained.', ko: '예전엔 비 올 때마다 매번 우산을 깜빡했어.', domain: '생활' },
    { en: 'I used to panic when my card got declined at checkout.', ko: '예전엔 계산대에서 카드가 거절되면 당황하곤 했어.', domain: '돌발' },
  ],
  'pt2-3': [
    { en: "I'm sorry for being so distant last year.", ko: '작년에 너무 멀어져서 미안해.', domain: '인간관계' },
    { en: "I'm sorry for missing the call — I was stuck in a meeting.", ko: '전화 못 받아서 미안해, 회의에 묶여 있었어.', domain: '회사' },
    { en: "I'm sorry for booking the wrong dates for the hotel.", ko: '호텔 날짜를 잘못 예약해서 미안해.', domain: '여행' },
    { en: "I'm sorry for leaving my dishes in the sink again.", ko: '또 설거지를 싱크대에 쌓아둬서 미안해.', domain: '생활' },
    { en: "I'm sorry for the mess — a pipe burst this morning.", ko: '엉망이라 미안해, 아침에 파이프가 터졌어.', domain: '돌발' },
  ],
  'pt2-4': [
    { en: 'It seems like she has changed too.', ko: '그녀도 변한 것 같아.', domain: '인간관계' },
    { en: 'It seems like the printer is out of ink again.', ko: '프린터에 또 잉크가 떨어진 것 같아.', domain: '회사' },
    { en: 'It seems like our flight is going to be delayed.', ko: '우리 비행기가 지연될 것 같아.', domain: '여행' },
    { en: 'It seems like the package got delivered to the wrong address.', ko: '택배가 다른 주소로 배달된 것 같아.', domain: '생활' },
    { en: "It seems like the Wi-Fi is down across the whole building.", ko: '건물 전체 와이파이가 끊긴 것 같아.', domain: '돌발' },
  ],
  'pt2-5': [
    { en: "I'm looking forward to seeing her every month.", ko: '매달 그녀를 만나는 게 기대돼.', domain: '인간관계' },
    { en: "I'm looking forward to wrapping up this project by Friday.", ko: '금요일까지 이 프로젝트를 끝내는 게 기대돼.', domain: '회사' },
    { en: "I'm looking forward to checking into the hotel and unpacking.", ko: '호텔에 체크인하고 짐 푸는 게 기대돼.', domain: '여행' },
    { en: "I'm looking forward to sleeping in and skipping my alarm.", ko: '늦잠 자고 알람 끄는 게 기대돼.', domain: '생활' },
    { en: "I'm looking forward to getting my car back from the mechanic.", ko: '정비소에서 차 찾아오는 게 기대돼.', domain: '돌발' },
  ],

  // ── Story 3 · 일상의 기초 ──────────────────────────────────────────────
  'pt3-1': [
    { en: 'I have to leave by eight today.', ko: '오늘은 8시까지 나가야 해.', domain: '생활' },
    { en: 'I have to send this invoice before the end of the day.', ko: '오늘 안으로 이 청구서를 보내야 해.', domain: '회사' },
    { en: 'I have to check out by eleven or they charge another night.', ko: '11시까지 체크아웃 안 하면 하룻밤 더 청구돼.', domain: '여행' },
    { en: 'I have to drop my kids off at school first.', ko: '먼저 애들 학교에 데려다줘야 해.', domain: '인간관계' },
    { en: "I have to call the landlord — the heat isn't working.", ko: '집주인한테 전화해야 해, 난방이 안 돼.', domain: '돌발' },
  ],
  'pt3-2': [
    { en: "I don't drink coffee in the morning.", ko: '나는 아침에 커피를 안 마셔.', domain: '생활' },
    { en: "I don't usually take my lunch break until after two.", ko: '나는 보통 2시 넘어서야 점심을 먹어.', domain: '회사' },
    { en: "I don't have any cash, only my card on me.", ko: '현금은 없고 카드만 있어.', domain: '여행' },
    { en: "I don't really like making plans too far in advance.", ko: '나는 너무 미리 약속 잡는 걸 별로 안 좋아해.', domain: '인간관계' },
    { en: "I don't think the elevator's working — let's take the stairs.", ko: '엘리베이터 안 되는 것 같아, 계단으로 가자.', domain: '돌발' },
  ],
  'pt3-3': [
    { en: 'Let me help you look.', ko: '내가 같이 찾아줄게.', domain: '생활' },
    { en: 'Let me forward you the email with all the details.', ko: '상세 내용 담긴 이메일 전달해 줄게.', domain: '회사' },
    { en: 'Let me grab us a couple of waters for the road.', ko: '가는 길에 마실 물 몇 병 사 올게.', domain: '여행' },
    { en: 'Let me get this round — you got the last one.', ko: '이번 건 내가 살게, 저번엔 네가 샀잖아.', domain: '인간관계' },
    { en: 'Let me call the front desk about the broken AC.', ko: '에어컨 고장 났다고 프런트에 전화할게.', domain: '돌발' },
  ],
  'pt3-4': [
    { en: 'Thank you for helping me.', ko: '도와줘서 고마워.', domain: '인간관계' },
    { en: 'Thank you for covering the meeting while I was out sick.', ko: '나 아파서 빠진 동안 회의 대신해 줘서 고마워.', domain: '회사' },
    { en: 'Thank you for dropping me off at the airport so early.', ko: '이렇게 일찍 공항에 데려다줘서 고마워.', domain: '여행' },
    { en: 'Thank you for grabbing my package from the front door.', ko: '현관 앞에서 내 택배 챙겨줘서 고마워.', domain: '생활' },
    { en: 'Thank you for lending me your charger when mine died.', ko: '내 거 꺼졌을 때 충전기 빌려줘서 고마워.', domain: '돌발' },
  ],
  'pt3-5': [
    { en: 'I just grabbed my bag and headed for the door.', ko: '나는 그냥 가방을 들고 문으로 향했어.', domain: '생활' },
    { en: 'I just emailed you the updated schedule for next week.', ko: '다음 주 수정된 일정 방금 메일로 보냈어.', domain: '회사' },
    { en: 'I just dropped my bags at the hotel and headed out.', ko: '방금 호텔에 짐만 두고 나왔어.', domain: '여행' },
    { en: "I just wanted to check in and see how you're doing.", ko: '그냥 잘 지내는지 안부 물어보고 싶었어.', domain: '인간관계' },
    { en: 'I just noticed a big scratch on the rental car.', ko: '렌터카에 큰 스크래치 난 거 방금 봤어.', domain: '돌발' },
  ],

  // ── Story 4 · 계획과 준비 ──────────────────────────────────────────────
  'pt4-1': [
    { en: "I can do this — I've practiced for a whole week.", ko: '나는 할 수 있어 — 일주일 내내 연습했어.', domain: '회사' },
    { en: 'I can drop your laundry off when I run my errands.', ko: '나 볼일 보러 갈 때 네 빨래도 맡겨줄 수 있어.', domain: '생활' },
    { en: 'I can carry your suitcase up the stairs if you want.', ko: '원하면 캐리어 계단 위로 들어줄 수 있어.', domain: '여행' },
    { en: 'I can give you a ride to your dentist appointment.', ko: '치과 예약 시간에 태워다 줄 수 있어.', domain: '인간관계' },
    { en: 'I can lend you some cash until you find an ATM.', ko: '현금인출기 찾을 때까지 현금 좀 빌려줄 수 있어.', domain: '돌발' },
  ],
  'pt4-2': [
    { en: "I'm still a little nervous.", ko: '아직도 조금 긴장돼.', domain: '생활' },
    { en: "I'm still waiting on the receipt for my expense report.", ko: '경비 처리용 영수증을 아직 기다리고 있어.', domain: '회사' },
    { en: "I'm still trying to figure out the right subway transfer.", ko: '제대로 갈아타는 법을 아직 파악 중이야.', domain: '여행' },
    { en: "I'm still a little upset, but I'll get over it.", ko: '아직 좀 서운한데, 곧 괜찮아질 거야.', domain: '인간관계' },
    { en: "I'm still on hold with customer service after forty minutes.", ko: '고객센터에 40분째 아직 대기 중이야.', domain: '돌발' },
  ],
  'pt4-3': [
    { en: 'I keep checking my notes again and again.', ko: '나는 자꾸 메모를 보고 또 봐.', domain: '회사' },
    { en: 'I keep forgetting to pick up milk on the way home.', ko: '집에 오는 길에 우유 사는 걸 자꾸 까먹어.', domain: '생활' },
    { en: 'I keep mixing up the gate numbers at this airport.', ko: '이 공항에선 게이트 번호를 자꾸 헷갈려.', domain: '여행' },
    { en: 'I keep meaning to return the book I borrowed from you.', ko: '너한테 빌린 책 돌려주려고 계속 마음먹는데 자꾸 못 해.', domain: '인간관계' },
    { en: 'I keep getting an error every time I try to pay.', ko: '결제하려고 할 때마다 자꾸 오류가 나.', domain: '돌발' },
  ],
  'pt4-4': [
    { en: "I'm about to turn off the lights.", ko: '막 불을 끄려던 참이야.', domain: '생활' },
    { en: "I'm about to hop on a call — can I text you after?", ko: '막 통화 들어가려던 참인데, 이따 문자해도 될까?', domain: '회사' },
    { en: "I'm about to board, so I'll call you when I land.", ko: '막 탑승하려던 참이라, 도착하면 전화할게.', domain: '여행' },
    { en: "I'm about to head out — want me to grab you anything?", ko: '막 나가려던 참인데, 뭐 사다 줄까?', domain: '인간관계' },
    { en: "I'm about to run out of battery, so save my number.", ko: '곧 배터리 나갈 것 같으니까, 내 번호 저장해 둬.', domain: '돌발' },
  ],
  'pt4-5': [
    { en: "I'm supposed to arrive at nine sharp.", ko: '9시 정각에 도착하기로 되어 있어.', domain: '회사' },
    { en: "I'm supposed to drop the rent off to my landlord today.", ko: '오늘 집주인한테 월세를 내기로 되어 있어.', domain: '생활' },
    { en: "I'm supposed to pick up the rental car by noon.", ko: '정오까지 렌터카를 찾기로 되어 있어.', domain: '여행' },
    { en: "I'm supposed to meet her for coffee, but I'm running late.", ko: '그녀랑 커피 마시기로 했는데, 늦고 있어.', domain: '인간관계' },
    { en: "I'm supposed to water my neighbor's plants while they're away.", ko: '이웃이 없는 동안 화분에 물 주기로 되어 있어.', domain: '돌발' },
  ],

  // ── Story 5 · 생각과 느낌 ──────────────────────────────────────────────
  'pt5-1': [
    { en: "I'm going to make one real change this month.", ko: '이번 달에 진짜 변화 하나를 만들 거야.', domain: '생활' },
    { en: "I'm going to ask for the receipt so I can expense it.", ko: '경비 처리하게 영수증을 받을 거야.', domain: '회사' },
    { en: "I'm going to book a table for two near the window.", ko: '창가 쪽으로 2인 테이블을 예약할 거야.', domain: '여행' },
    { en: "I'm going to swing by my parents' place this weekend.", ko: '이번 주말에 부모님 댁에 잠깐 들를 거야.', domain: '인간관계' },
    { en: "I'm going to call the plumber about the leak under the sink.", ko: '싱크대 밑 누수 때문에 배관공을 부를 거야.', domain: '돌발' },
  ],
  'pt5-2': [
    { en: "I'm going to try waking up an hour earlier.", ko: '한 시간 더 일찍 일어나 볼 거야.', domain: '생활' },
    { en: "I'm going to try leaving the office on time this week.", ko: '이번 주는 정시에 퇴근해 볼 거야.', domain: '회사' },
    { en: "I'm going to try packing everything into one carry-on.", ko: '전부 기내용 가방 하나에 싸 볼 거야.', domain: '여행' },
    { en: "I'm going to try calling her instead of just texting.", ko: '문자만 하지 말고 전화를 해 볼 거야.', domain: '인간관계' },
    { en: "I'm going to try restarting the router before I call support.", ko: '고객센터 부르기 전에 공유기를 재부팅해 볼 거야.', domain: '돌발' },
  ],
  'pt5-3': [
    { en: "I've been feeling tired for a while now.", ko: '나는 한동안 계속 피곤함을 느끼고 있어.', domain: '생활' },
    { en: "I've been swamped with back-to-back meetings all week.", ko: '이번 주 내내 연달아 회의가 많아서 정신없었어.', domain: '회사' },
    { en: "I've been saving up for a trip to Japan this fall.", ko: '이번 가을 일본 여행을 위해 계속 돈을 모으고 있어.', domain: '여행' },
    { en: "I've been meaning to call you back all day, sorry.", ko: '하루 종일 다시 전화하려고 했는데, 미안해.', domain: '인간관계' },
    { en: "I've been on hold with the bank for half an hour.", ko: '은행에 30분째 대기하고 있어.', domain: '돌발' },
  ],
  'pt5-4': [
    { en: 'I think mornings suit me better than nights.', ko: '밤보다 아침이 나에게 더 잘 맞는 것 같아.', domain: '생활' },
    { en: 'I think we should split this task to save some time.', ko: '시간 아끼게 이 일을 나눠서 하는 게 좋을 것 같아.', domain: '회사' },
    { en: "I think we missed our stop — let's get off here.", ko: '우리 정류장 지나친 것 같아, 여기서 내리자.', domain: '여행' },
    { en: "I think she's just tired, not actually mad at you.", ko: '그녀가 화난 게 아니라 그냥 피곤한 것 같아.', domain: '인간관계' },
    { en: "I think the milk's gone bad — it smells a little off.", ko: '우유가 상한 것 같아, 냄새가 좀 이상해.', domain: '돌발' },
  ],
  'pt5-5': [
    { en: 'I feel like a small change can open a new door.', ko: '작은 변화가 새로운 문을 열 수 있을 것 같은 느낌이야.', domain: '생활' },
    { en: "I feel like I'm finally getting the hang of this job.", ko: '이제야 이 일에 좀 익숙해지는 느낌이야.', domain: '회사' },
    { en: 'I feel like grabbing some street food before the bus comes.', ko: '버스 오기 전에 길거리 음식 좀 먹고 싶은 기분이야.', domain: '여행' },
    { en: "I feel like we haven't really talked in ages.", ko: '우리 진짜 오랜만에 대화하는 느낌이야.', domain: '인간관계' },
    { en: "I feel like I forgot something, but I can't think what.", ko: '뭔가 깜빡한 느낌인데, 뭔지 모르겠어.', domain: '돌발' },
  ],

  // ── Story 6 · 판단과 의견 ──────────────────────────────────────────────
  'pt6-1': [
    { en: "I'm not sure which one is better.", ko: '어느 쪽이 더 나은지 모르겠어.', domain: '회사' },
    { en: "I'm not sure if I locked the door on my way out.", ko: '나올 때 문을 잠갔는지 모르겠어.', domain: '생활' },
    { en: "I'm not sure which gate our flight is leaving from.", ko: '우리 비행기가 어느 게이트에서 출발하는지 모르겠어.', domain: '여행' },
    { en: "I'm not sure if she's still upset about yesterday.", ko: '그녀가 어제 일로 아직 서운한지 모르겠어.', domain: '인간관계' },
    { en: "I'm not sure where I parked — this garage all looks the same.", ko: '어디 주차했는지 모르겠어, 이 주차장 다 똑같이 생겼어.', domain: '돌발' },
  ],
  'pt6-2': [
    { en: 'I tend to overthink big decisions.', ko: '나는 큰 결정을 지나치게 고민하는 편이야.', domain: '회사' },
    { en: 'I tend to leave the dishes until the next morning.', ko: '나는 설거지를 다음 날 아침까지 미루는 편이야.', domain: '생활' },
    { en: 'I tend to over-pack and pay for extra luggage.', ko: '나는 짐을 너무 많이 싸서 추가 수하물 요금을 내는 편이야.', domain: '여행' },
    { en: 'I tend to forget birthdays unless I set a reminder.', ko: '나는 알림을 안 맞춰두면 생일을 잊어버리는 편이야.', domain: '인간관계' },
    { en: 'I tend to panic when my phone hits one percent.', ko: '나는 폰 배터리가 1퍼센트가 되면 좀 당황하는 편이야.', domain: '돌발' },
  ],
  'pt6-3': [
    { en: 'It depends on which one I value more.', ko: '어느 쪽을 더 중요하게 여기느냐에 달려 있어.', domain: '회사' },
    { en: 'It depends on whether the landlord lets us keep a pet.', ko: '그건 집주인이 반려동물을 허락하느냐에 달려 있어.', domain: '생활' },
    { en: 'It depends on how much the hotel charges for late checkout.', ko: '그건 호텔이 레이트 체크아웃에 얼마를 받느냐에 달려 있어.', domain: '여행' },
    { en: "It depends on whether she's free this weekend.", ko: '그건 그녀가 이번 주말에 시간이 되느냐에 달려 있어.', domain: '인간관계' },
    { en: 'It depends on how long the repair is going to take.', ko: '그건 수리가 얼마나 걸리느냐에 달려 있어.', domain: '돌발' },
  ],
  'pt6-4': [
    { en: "I'm trying to listen to myself instead of others.", ko: '다른 사람보다 내 마음에 귀 기울이려고 노력 중이야.', domain: '인간관계' },
    { en: "I'm trying to clear my inbox before I leave today.", ko: '오늘 퇴근 전에 받은 메일을 다 처리하려고 애쓰고 있어.', domain: '회사' },
    { en: "I'm trying to find an ATM that doesn't charge a fee.", ko: '수수료 안 떼는 현금인출기를 찾으려고 하고 있어.', domain: '여행' },
    { en: "I'm trying to use up the leftovers before they go bad.", ko: '남은 음식 상하기 전에 다 먹어 치우려고 하고 있어.', domain: '생활' },
    { en: "I'm trying to reach the landlord about the broken heater.", ko: '고장 난 난방기 때문에 집주인한테 연락하려고 하고 있어.', domain: '돌발' },
  ],
  'pt6-5': [
    { en: "Even though I'm still unsure, I feel calmer now.", ko: '아직 확신은 없지만, 이제 마음이 더 차분해.', domain: '인간관계' },
    { en: 'Even though the deadline moved up, we still made it.', ko: '마감이 앞당겨졌지만, 그래도 맞췄어.', domain: '회사' },
    { en: 'Even though it poured all day, the trip was worth it.', ko: '하루 종일 비가 쏟아졌지만, 여행은 그럴 만했어.', domain: '여행' },
    { en: "Even though the elevator was out, I didn't mind the stairs.", ko: '엘리베이터가 안 됐지만, 계단도 괜찮았어.', domain: '생활' },
    { en: 'Even though my flight got cancelled, they rebooked me quickly.', ko: '비행기가 취소됐지만, 빨리 다시 예약해 줬어.', domain: '돌발' },
  ],

  // ── Story 7 · 조건과 결과 ──────────────────────────────────────────────
  'pt7-1': [
    { en: "As long as the weather is clear, we'll go.", ko: '날씨가 맑기만 하면 갈 거야.', domain: '여행' },
    { en: 'As long as I get the receipt, I can expense the lunch.', ko: '영수증만 받으면, 점심값은 경비 처리할 수 있어.', domain: '회사' },
    { en: "As long as you text me when you land, I won't worry.", ko: '도착해서 문자만 해주면, 걱정 안 할게.', domain: '인간관계' },
    { en: "As long as the landlord fixes the heat, I'm happy to stay.", ko: '집주인이 난방만 고쳐주면, 계속 살아도 좋아.', domain: '생활' },
    { en: "As long as we have a spare tire, we'll be fine.", ko: '스페어 타이어만 있으면, 괜찮을 거야.', domain: '돌발' },
  ],
  'pt7-2': [
    { en: 'No wonder I feel so tired this morning.', ko: '오늘 아침 이렇게 피곤한 게 당연하지.', domain: '생활' },
    { en: "No wonder I'm exhausted — I had five meetings today.", ko: '오늘 회의가 다섯 개였으니 지치는 게 당연하지.', domain: '회사' },
    { en: "No wonder the line is so long — it's a holiday weekend.", ko: '연휴 주말이니 줄이 이렇게 긴 게 당연하지.', domain: '여행' },
    { en: 'No wonder she was upset — you forgot her birthday again.', ko: '또 생일을 잊었으니 그녀가 서운한 게 당연하지.', domain: '인간관계' },
    { en: 'No wonder the sink is clogged — look at all this hair.', ko: '이 머리카락 좀 봐, 싱크대가 막힌 게 당연하지.', domain: '돌발' },
  ],
  'pt7-3': [
    { en: "I'd rather take the longer, easier path.", ko: '차라리 더 길고 쉬운 길로 가겠어.', domain: '여행' },
    { en: "I'd rather email them than sit through another long meeting.", ko: '또 긴 회의에 앉아 있느니 차라리 메일을 보내겠어.', domain: '회사' },
    { en: "I'd rather stay in tonight and order some takeout.", ko: '오늘 밤은 차라리 집에서 포장 음식 시켜 먹겠어.', domain: '인간관계' },
    { en: "I'd rather pay a little more and get it delivered.", ko: '돈 조금 더 내더라도 차라리 배달시키겠어.', domain: '생활' },
    { en: "I'd rather wait for the next train than squeeze onto this one.", ko: '이 기차에 끼여 타느니 차라리 다음 걸 기다리겠어.', domain: '돌발' },
  ],
  'pt7-4': [
    { en: 'We ended up staying there for a whole hour.', ko: '결국 거기서 한 시간이나 머물게 됐어.', domain: '여행' },
    { en: 'I ended up working through lunch to finish the report.', ko: '보고서 끝내느라 결국 점심도 거르고 일했어.', domain: '회사' },
    { en: 'We ended up talking on the phone until two in the morning.', ko: '결국 새벽 두 시까지 통화하게 됐어.', domain: '인간관계' },
    { en: "I ended up returning the shirt because it didn't fit.", ko: '셔츠가 안 맞아서 결국 반품하게 됐어.', domain: '생활' },
    { en: 'I ended up taking a taxi after I missed the last bus.', ko: '막차를 놓쳐서 결국 택시를 타게 됐어.', domain: '돌발' },
  ],
  'pt7-5': [
    { en: 'Can you take a photo of me?', ko: '내 사진 좀 찍어줄 수 있어?', domain: '여행' },
    { en: 'Can you forward me that email when you get a chance?', ko: '시간 될 때 그 이메일 좀 전달해줄 수 있어?', domain: '회사' },
    { en: 'Can you grab some milk and eggs on your way back?', ko: '돌아오는 길에 우유랑 계란 좀 사다 줄 수 있어?', domain: '생활' },
    { en: "Can you give me a heads-up if you're running late?", ko: '늦을 것 같으면 미리 알려줄 수 있어?', domain: '인간관계' },
    { en: "Can you call the front desk? The AC isn't working.", ko: '프런트에 전화해줄 수 있어? 에어컨이 안 돼.', domain: '돌발' },
  ],

  // ── Story 8 · 부탁과 제안 ──────────────────────────────────────────────
  'pt8-1': [
    { en: 'Could you give us a table by the window?', ko: '창가 자리로 주실 수 있나요?', domain: '여행' },
    { en: 'Could you send me the receipt for the team lunch?', ko: '팀 점심 영수증 좀 보내주실 수 있나요?', domain: '회사' },
    { en: "Could you keep it down a little? It's getting late.", ko: '소리 좀 줄여주실 수 있나요? 시간이 늦어서요.', domain: '생활' },
    { en: 'Could you give me a hand moving this couch?', ko: '이 소파 옮기는 것 좀 도와주실 수 있나요?', domain: '인간관계' },
    { en: 'Could you check the address? I think the package went missing.', ko: '주소 좀 확인해주실 수 있나요? 택배가 분실된 것 같아요.', domain: '돌발' },
  ],
  'pt8-2': [
    { en: "I'd like to try the seafood pasta.", ko: '해산물 파스타를 먹어보고 싶은데요.', domain: '여행' },
    { en: "I'd like to take Friday off if that works for everyone.", ko: '다들 괜찮으면 금요일에 쉬고 싶은데요.', domain: '회사' },
    { en: "I'd like to return this — I kept the receipt, though.", ko: '이거 반품하고 싶은데요, 영수증은 가지고 있어요.', domain: '생활' },
    { en: "I'd like to introduce you to a friend of mine.", ko: '내 친구 한 명을 너한테 소개하고 싶은데.', domain: '인간관계' },
    { en: "I'd like to report a leak coming from the apartment upstairs.", ko: '윗집에서 물이 새서 신고하고 싶은데요.', domain: '돌발' },
  ],
  'pt8-3': [
    { en: "Why don't we share a dessert?", ko: '우리 디저트 하나 나눠 먹는 게 어때?', domain: '인간관계' },
    { en: "Why don't we push the meeting to after lunch?", ko: '우리 회의를 점심 후로 미루는 게 어때?', domain: '회사' },
    { en: "Why don't we split a cab to the airport?", ko: '우리 공항까지 택시 같이 타고 가는 게 어때?', domain: '여행' },
    { en: "Why don't we just order in and watch a movie?", ko: '우리 그냥 배달 시켜서 영화 보는 게 어때?', domain: '생활' },
    { en: "Why don't we take the stairs since the elevator's stuck?", ko: '엘리베이터 멈췄으니 우리 계단으로 가는 게 어때?', domain: '돌발' },
  ],
  'pt8-4': [
    { en: 'Would you mind turning on your phone light?', ko: '핸드폰 불빛 좀 켜줄 수 있어요?', domain: '여행' },
    { en: 'Would you mind covering my shift on Saturday?', ko: '토요일에 제 근무 좀 대신해 줄 수 있어요?', domain: '회사' },
    { en: 'Would you mind keeping an eye on my groceries for a sec?', ko: '잠깐만 제 장본 거 좀 봐줄 수 있어요?', domain: '생활' },
    { en: 'Would you mind giving us a minute to talk?', ko: '저희 잠깐 얘기할 시간 좀 줄 수 있어요?', domain: '인간관계' },
    { en: 'Would you mind helping me jump-start my car?', ko: '제 차 점프 스타트 좀 도와줄 수 있어요?', domain: '돌발' },
  ],
  'pt8-5': [
    { en: 'Is it okay if I leave a little early?', ko: '조금 일찍 가도 괜찮아?', domain: '회사' },
    { en: 'Is it okay if I pay you back next week?', ko: '다음 주에 갚아도 괜찮아?', domain: '생활' },
    { en: 'Is it okay if we check in a couple hours early?', ko: '두어 시간 일찍 체크인해도 괜찮아?', domain: '여행' },
    { en: 'Is it okay if I bring my roommate to dinner?', ko: '저녁에 룸메이트 데려가도 괜찮아?', domain: '인간관계' },
    { en: 'Is it okay if I use your charger? Mine just died.', ko: '네 충전기 써도 괜찮아? 내 거 방금 꺼졌어.', domain: '돌발' },
  ],

  // ── Story 9 · 질문하기 ─────────────────────────────────────────────────
  'pt9-1': [
    { en: 'Make sure you bring your passport.', ko: '여권 꼭 챙겨.', domain: '여행' },
    { en: 'Make sure you save the receipt for the reimbursement.', ko: '환급받게 영수증 꼭 챙겨둬.', domain: '회사' },
    { en: 'Make sure you lock the door and turn off the stove.', ko: '문 꼭 잠그고 가스레인지도 끄고.', domain: '생활' },
    { en: 'Make sure you call your grandmother on her birthday.', ko: '할머니 생일에 꼭 전화드려.', domain: '인간관계' },
    { en: 'Make sure you keep a spare key with a neighbor.', ko: '이웃한테 여분 열쇠 하나 꼭 맡겨둬.', domain: '돌발' },
  ],
  'pt9-2': [
    { en: 'Do you prefer the beach or the old town?', ko: '너는 해변이 좋아, 아니면 구시가지가 좋아?', domain: '여행' },
    { en: 'Do you have a minute to look over my slides?', ko: '내 슬라이드 잠깐 봐줄 시간 있어?', domain: '회사' },
    { en: 'Do you have any cash, or should we find an ATM?', ko: '현금 있어, 아니면 인출기 찾아야 돼?', domain: '생활' },
    { en: 'Do you want to grab dinner after work tomorrow?', ko: '내일 퇴근하고 저녁 같이 먹을래?', domain: '인간관계' },
    { en: 'Do you know if the pharmacy is still open this late?', ko: '이 시간에 약국이 아직 여는지 알아?', domain: '돌발' },
  ],
  'pt9-3': [
    { en: 'Have you ever tried fresh oysters?', ko: '신선한 굴 먹어본 적 있어?', domain: '여행' },
    { en: 'Have you ever asked your boss to work from home?', ko: '상사한테 재택근무 부탁해 본 적 있어?', domain: '회사' },
    { en: 'Have you ever locked yourself out of your apartment?', ko: '집 문 밖에 갇혀본 적 있어?', domain: '생활' },
    { en: "Have you ever just shown up at a friend's door?", ko: '친구 집에 그냥 불쑥 찾아가 본 적 있어?', domain: '인간관계' },
    { en: 'Have you ever had a flight cancelled at the last second?', ko: '막판에 비행기가 취소된 적 있어?', domain: '돌발' },
  ],
  'pt9-4': [
    { en: 'Do you know a good place to stay there?', ko: '거기 묵을 만한 좋은 곳 알아?', domain: '여행' },
    { en: 'Do you know when the invoice is due?', ko: '그 청구서 언제까지 내야 하는지 알아?', domain: '회사' },
    { en: 'Do you know a good plumber? My sink keeps leaking.', ko: '괜찮은 배관공 알아? 싱크대가 자꾸 새.', domain: '생활' },
    { en: "Do you know if she's still mad about last night?", ko: '그녀가 어젯밤 일로 아직 화났는지 알아?', domain: '인간관계' },
    { en: "Do you know where the nearest ATM is? I'm out of cash.", ko: '가장 가까운 인출기 어디 있는지 알아? 현금이 다 떨어졌어.', domain: '돌발' },
  ],
  'pt9-5': [
    { en: 'What if we leave on Friday night instead?', ko: '차라리 금요일 밤에 떠나면 어떨까?', domain: '여행' },
    { en: 'What if we moved the deadline to next Monday?', ko: '마감을 다음 주 월요일로 옮기면 어떨까?', domain: '회사' },
    { en: 'What if we just got takeout instead of cooking tonight?', ko: '오늘 밤엔 요리 말고 그냥 포장해 오면 어떨까?', domain: '생활' },
    { en: 'What if I came over and we talked it through?', ko: '내가 가서 우리 차분히 얘기로 풀어보면 어떨까?', domain: '인간관계' },
    { en: "What if the landlord doesn't return our deposit?", ko: '집주인이 보증금을 안 돌려주면 어떡하지?', domain: '돌발' },
  ],

  // ── Story 10 · 감정 표현 ───────────────────────────────────────────────
  'pt10-1': [
    { en: 'What do you think about my decision?', ko: '내 결정에 대해 어떻게 생각해?', domain: '인간관계' },
    { en: 'What do you think about asking for a later deadline?', ko: '마감을 미뤄달라고 하는 거 어떻게 생각해?', domain: '회사' },
    { en: 'What do you think about splitting an Airbnb to save money?', ko: '돈 아끼게 에어비앤비 같이 쓰는 거 어떻게 생각해?', domain: '여행' },
    { en: 'What do you think about getting a haircut before the wedding?', ko: '결혼식 전에 머리 자르는 거 어떻게 생각해?', domain: '생활' },
    { en: 'What do you think about leaving early to beat the storm?', ko: '폭풍 피하게 일찍 떠나는 거 어떻게 생각해?', domain: '돌발' },
  ],
  'pt10-2': [
    { en: 'I wonder what my new life will be like.', ko: '내 새로운 삶이 어떨지 궁금해.', domain: '인간관계' },
    { en: 'I wonder if my boss noticed I left early yesterday.', ko: '어제 일찍 나간 거 상사가 눈치챘는지 궁금해.', domain: '회사' },
    { en: 'I wonder if our hotel has free parking and Wi-Fi.', ko: '우리 호텔에 무료 주차랑 와이파이가 있는지 궁금해.', domain: '여행' },
    { en: 'I wonder if the package will get here before the weekend.', ko: '택배가 주말 전에 올지 궁금해.', domain: '생활' },
    { en: 'I wonder why the heater keeps shutting off at night.', ko: '난방기가 밤마다 왜 자꾸 꺼지는지 궁금해.', domain: '돌발' },
  ],
  'pt10-3': [
    { en: "I can't wait to decorate my own little apartment.", ko: '내 작은 아파트를 꾸밀 게 너무 기대돼.', domain: '생활' },
    { en: "I can't wait to clock out and start the long weekend.", ko: '퇴근하고 긴 주말을 시작하는 게 너무 기대돼.', domain: '회사' },
    { en: "I can't wait to check into the hotel and drop my bags.", ko: '호텔 체크인하고 짐 내려놓는 게 너무 기대돼.', domain: '여행' },
    { en: "I can't wait to see everyone at the reunion next month.", ko: '다음 달 모임에서 다들 보는 게 너무 기대돼.', domain: '인간관계' },
    { en: "I can't wait for the repairs to be done so we can move back.", ko: '수리가 끝나서 다시 들어갈 수 있는 게 너무 기대돼.', domain: '돌발' },
  ],
  'pt10-4': [
    { en: "I'm glad my family supports me so much.", ko: '가족이 나를 이렇게 응원해줘서 다행이야.', domain: '인간관계' },
    { en: "I'm glad we kept the receipt — they gave us a full refund.", ko: '영수증 챙겨둬서 다행이야, 전액 환불해 줬어.', domain: '회사' },
    { en: "I'm glad we booked the hotel before the prices went up.", ko: '가격 오르기 전에 호텔 예약해 둬서 다행이야.', domain: '여행' },
    { en: "I'm glad I grabbed an umbrella before it started pouring.", ko: '비 쏟아지기 전에 우산 챙겨서 다행이야.', domain: '생활' },
    { en: "I'm glad the landlord fixed the heater before the cold snap.", ko: '한파 오기 전에 집주인이 난방기 고쳐줘서 다행이야.', domain: '돌발' },
  ],
  'pt10-5': [
    { en: "I'm worried about making new friends.", ko: '새 친구를 사귀는 게 걱정돼.', domain: '인간관계' },
    { en: "I'm worried about finishing everything before the deadline.", ko: '마감 전에 다 끝낼 수 있을지 걱정돼.', domain: '회사' },
    { en: "I'm worried about missing our connection with this delay.", ko: '이 지연 때문에 환승을 놓칠까 봐 걱정돼.', domain: '여행' },
    { en: "I'm worried about the rent going up again next year.", ko: '내년에 또 월세가 오를까 봐 걱정돼.', domain: '생활' },
    { en: "I'm worried about the leak spreading to the neighbor downstairs.", ko: '누수가 아랫집까지 번질까 봐 걱정돼.', domain: '돌발' },
  ],

  // ── Story 11 · 솔직해지는 용기 (Level 3) ────────────────────────────────
  'pt11-1': [
    { en: "I'm afraid I have some news you won't love.", ko: '유감이지만 네가 별로 안 좋아할 소식이 있어.', domain: '인간관계' },
    { en: "I'm afraid I can't make the meeting this afternoon.", ko: '유감이지만 오늘 오후 회의엔 못 갈 것 같아요.', domain: '회사' },
    { en: "I'm afraid our flight has been delayed again.", ko: '유감이지만 우리 비행기가 또 지연됐어.', domain: '여행' },
    { en: "I'm afraid I forgot to pay the rent this month.", ko: '유감이지만 이번 달 월세 내는 걸 깜빡했어.', domain: '생활' },
    { en: "I'm afraid your package was sent to the wrong address.", ko: '유감이지만 택배가 다른 주소로 갔어요.', domain: '돌발' },
  ],
  'pt11-2': [
    { en: "To be honest, I've felt this way for a while.", ko: '솔직히, 한동안 이런 기분이었어.', domain: '인간관계' },
    { en: 'To be honest, this deadline feels a little tight.', ko: '솔직히, 이 마감은 좀 빠듯한 것 같아요.', domain: '회사' },
    { en: "To be honest, I'd rather skip the museum tour.", ko: '솔직히, 박물관 투어는 건너뛰고 싶어.', domain: '여행' },
    { en: "To be honest, I don't really enjoy cooking that much.", ko: '솔직히, 나 요리를 그렇게 좋아하진 않아.', domain: '생활' },
    { en: 'To be honest, I have no idea what just happened.', ko: '솔직히, 방금 무슨 일이 있었는지 모르겠어.', domain: '돌발' },
  ],
  'pt11-3': [
    { en: "I don't think we want the same things anymore.", ko: '우리가 더는 같은 걸 원하는 것 같진 않아.', domain: '인간관계' },
    { en: "I don't think we'll finish this by the deadline.", ko: '마감까지 이걸 끝낼 수 있을 것 같진 않아요.', domain: '회사' },
    { en: "I don't think this train stops at our station.", ko: '이 기차가 우리 역에 서는 것 같진 않아.', domain: '여행' },
    { en: "I don't think the milk is still good.", ko: '우유가 아직 괜찮은 것 같진 않아.', domain: '생활' },
    { en: "I don't think the elevator is working again.", ko: '엘리베이터가 또 안 되는 것 같아.', domain: '돌발' },
  ],
  'pt11-4': [
    { en: "The thing is, I didn't know how to bring it up.", ko: '문제는, 어떻게 꺼내야 할지 몰랐어.', domain: '인간관계' },
    { en: 'The thing is, the client keeps changing the brief.', ko: '문제는, 고객이 자꾸 요구사항을 바꿔요.', domain: '회사' },
    { en: "The thing is, the hotel doesn't allow early check-in.", ko: '문제는, 그 호텔이 얼리 체크인을 안 해줘.', domain: '여행' },
    { en: 'The thing is, I already used up all the groceries.', ko: '문제는, 사다 놓은 식재료를 벌써 다 썼어.', domain: '생활' },
    { en: 'The thing is, my phone died before I could call.', ko: '문제는, 전화하기도 전에 폰이 꺼졌어.', domain: '돌발' },
  ],
  'pt11-5': [
    { en: 'I hope we can still be honest with each other.', ko: '우리가 그래도 서로 솔직할 수 있으면 좋겠어.', domain: '인간관계' },
    { en: "I hope the meeting doesn't run too long today.", ko: '오늘 회의가 너무 길어지지 않으면 좋겠어요.', domain: '회사' },
    { en: 'I hope our luggage made it onto the flight.', ko: '우리 짐이 비행기에 잘 실렸으면 좋겠어.', domain: '여행' },
    { en: 'I hope the package gets here before the weekend.', ko: '택배가 주말 전에 도착하면 좋겠어.', domain: '생활' },
    { en: 'I hope the landlord fixes the heater soon.', ko: '집주인이 난방기 빨리 고쳐주면 좋겠어.', domain: '돌발' },
  ],

  // ── Story 12 · 곁에 있어 주는 사람 (Level 3) ───────────────────────────
  'pt12-1': [
    { en: 'I was wondering if you could give me a ride.', ko: '혹시 나 좀 태워줄 수 있을까 해서.', domain: '인간관계' },
    { en: 'I was wondering if I could take Friday off.', ko: '혹시 금요일에 쉴 수 있을까 해서요.', domain: '회사' },
    { en: 'I was wondering if the hotel has airport pickup.', ko: '혹시 호텔에 공항 픽업이 있나 해서요.', domain: '여행' },
    { en: 'I was wondering if you could grab some groceries.', ko: '혹시 장 좀 봐다 줄 수 있을까 해서.', domain: '생활' },
    { en: 'I was wondering if you have a spare charger.', ko: '혹시 여분 충전기 있나 해서.', domain: '돌발' },
  ],
  'pt12-2': [
    { en: 'I really appreciate you dropping everything for me.', ko: '날 위해 다 제쳐두고 와줘서 정말 고마워.', domain: '인간관계' },
    { en: 'I appreciate you covering my shift on short notice.', ko: '갑자기인데 내 근무 대신해 줘서 고마워요.', domain: '회사' },
    { en: 'I appreciate you showing us around all afternoon.', ko: '오후 내내 구경시켜 줘서 고마워.', domain: '여행' },
    { en: 'I appreciate you grabbing my package while I was out.', ko: '나 없는 동안 택배 챙겨줘서 고마워.', domain: '생활' },
    { en: 'I appreciate you staying calm through the whole mess.', ko: '이 난리 통에 침착하게 있어줘서 고마워.', domain: '돌발' },
  ],
  'pt12-3': [
    { en: "Feel free to say no if it's too much.", ko: '너무 부담되면 편하게 거절해도 돼.', domain: '인간관계' },
    { en: 'Feel free to email me if anything comes up.', ko: '뭔가 생기면 편하게 메일 주세요.', domain: '회사' },
    { en: 'Feel free to use the Wi-Fi password on the desk.', ko: '책상 위에 적힌 와이파이 비번 편하게 쓰세요.', domain: '여행' },
    { en: 'Feel free to help yourself to the leftovers.', ko: '남은 음식 편하게 꺼내 먹어.', domain: '생활' },
    { en: 'Feel free to call me if it gets any worse.', ko: '더 심해지면 편하게 전화해.', domain: '돌발' },
  ],
  'pt12-4': [
    { en: 'Let me know if you need anything in return.', ko: '보답으로 뭐 필요한 거 있으면 알려줘.', domain: '인간관계' },
    { en: 'Let me know if the deadline needs to move.', ko: '마감 옮겨야 하면 알려주세요.', domain: '회사' },
    { en: 'Let me know if the reservation time works for you.', ko: '예약 시간 괜찮은지 알려줘.', domain: '여행' },
    { en: "Let me know if we're out of milk.", ko: '우유 떨어졌으면 알려줘.', domain: '생활' },
    { en: 'Let me know if the heater stops working again.', ko: '난방기 또 멈추면 알려줘.', domain: '돌발' },
  ],
  'pt12-5': [
    { en: 'Seriously, I owe you one for this.', ko: '진짜, 이건 내가 신세 졌어.', domain: '인간관계' },
    { en: 'You finished my report? I owe you one.', ko: '내 보고서 끝내줬어? 내가 신세 졌네.', domain: '회사' },
    { en: 'Thanks for carrying my suitcase — I owe you one.', ko: '내 캐리어 들어줘서 고마워, 신세 졌어.', domain: '여행' },
    { en: 'You walked my dog? I really owe you one.', ko: '우리 강아지 산책시켜 줬어? 진짜 신세 졌어.', domain: '생활' },
    { en: 'You lent me cash for the cab — I owe you one.', ko: '택시비 빌려줘서 고마워, 신세 졌어.', domain: '돌발' },
  ],

  // ── Story 13 · 첫 출근의 하루 (Level 4) ─────────────────────────────────
  'pt13-1': [
    { en: "I'll get back to you once I check the schedule.", ko: '일정 확인하고 다시 알려드릴게요.', domain: '회사' },
    { en: 'Let me ask my partner and get back to you.', ko: '파트너한테 물어보고 다시 알려줄게.', domain: '인간관계' },
    { en: "I'll get back to you after I confirm the booking.", ko: '예약 확정하고 다시 연락드릴게요.', domain: '여행' },
    { en: "I'll get back to you once the landlord replies.", ko: '집주인 답 오면 다시 알려줄게.', domain: '생활' },
    { en: "I'll get back to you as soon as the Wi-Fi is fixed.", ko: '와이파이 고쳐지는 대로 다시 알려줄게.', domain: '돌발' },
  ],
  'pt13-2': [
    { en: "Let's go over your tasks for the first week.", ko: '첫 주 업무를 같이 짚어볼게요.', domain: '회사' },
    { en: "Let's go over what we want to say to them.", ko: '그들한테 뭐라고 할지 같이 정리해보자.', domain: '인간관계' },
    { en: "Let's go over the itinerary before we pack.", ko: '짐 싸기 전에 일정을 같이 짚어보자.', domain: '여행' },
    { en: "Let's go over the bills before they're due.", ko: '납부일 전에 공과금을 같이 확인해보자.', domain: '생활' },
    { en: "Let's go over the plan in case something goes wrong.", ko: '뭔가 잘못될 경우를 대비해 계획을 짚어보자.', domain: '돌발' },
  ],
  'pt13-3': [
    { en: 'Just to confirm, the meeting starts at ten?', ko: '확인차 여쭤보는데, 회의가 10시에 시작하죠?', domain: '회사' },
    { en: "Just to confirm, you're still coming on Saturday?", ko: '확인차, 토요일에 오는 거 맞지?', domain: '인간관계' },
    { en: 'Just to confirm, checkout is at eleven?', ko: '확인차, 체크아웃이 11시 맞죠?', domain: '여행' },
    { en: 'Just to confirm, the rent is due on the first?', ko: '확인차, 월세가 1일에 나가는 거 맞지?', domain: '생활' },
    { en: 'Just to confirm, you already called the plumber?', ko: '확인차, 배관공은 이미 부른 거지?', domain: '돌발' },
  ],
  'pt13-4': [
    { en: "Don't worry, I'll take care of the paperwork.", ko: '걱정 마세요, 서류는 제가 처리할게요.', domain: '회사' },
    { en: "Don't worry, I'll take care of dinner.", ko: '걱정 마, 저녁은 내가 챙길게.', domain: '인간관계' },
    { en: "I'll take care of the hotel reservation tonight.", ko: '오늘 밤에 호텔 예약은 제가 할게요.', domain: '여행' },
    { en: "I'll take care of the groceries on my way home.", ko: '집에 오는 길에 장은 내가 봐 올게.', domain: '생활' },
    { en: "You go ahead — I'll take care of the leak.", ko: '먼저 가, 누수는 내가 처리할게.', domain: '돌발' },
  ],
  'pt13-5': [
    { en: 'Can you walk me through how the system works?', ko: '시스템이 어떻게 돌아가는지 차근차근 설명해줄래요?', domain: '회사' },
    { en: 'Can you walk me through what actually happened?', ko: '실제로 무슨 일이 있었는지 차근차근 말해줄래?', domain: '인간관계' },
    { en: 'Can you walk me through how to buy a transit pass?', ko: '교통카드 사는 법 좀 차근차근 알려줄래요?', domain: '여행' },
    { en: 'Can you walk me through how to set up the router?', ko: '공유기 설정하는 법 좀 차근차근 알려줄래?', domain: '생활' },
    { en: 'Can you walk me through what to do if it breaks again?', ko: '또 고장 나면 어떻게 하는지 차근차근 알려줄래?', domain: '돌발' },
  ],

  // ── Story 14 · 바쁜 하루를 굴리는 법 (Level 4) ──────────────────────────
  'pt14-1': [
    { en: 'Can we reschedule the call to Thursday?', ko: '통화를 목요일로 조정할 수 있을까요?', domain: '회사' },
    { en: 'Can we reschedule dinner to next week?', ko: '저녁 약속 다음 주로 미뤄도 될까?', domain: '인간관계' },
    { en: 'Can we reschedule the tour for tomorrow morning?', ko: '투어를 내일 아침으로 조정할 수 있을까요?', domain: '여행' },
    { en: 'Can we reschedule the delivery to the weekend?', ko: '배송을 주말로 조정할 수 있을까요?', domain: '생활' },
    { en: 'Can we reschedule? My car just broke down.', ko: '일정 미뤄도 될까? 차가 방금 고장 났어.', domain: '돌발' },
  ],
  'pt14-2': [
    { en: "I'll follow up with the client this afternoon.", ko: '오늘 오후에 고객한테 다시 연락할게요.', domain: '회사' },
    { en: "I'll follow up with her once she's had some space.", ko: '그녀가 좀 진정되면 다시 연락해 볼게.', domain: '인간관계' },
    { en: "I'll follow up with the hotel about the late checkout.", ko: '레이트 체크아웃 건은 호텔에 다시 문의할게.', domain: '여행' },
    { en: "I'll follow up with the landlord about the deposit.", ko: '보증금 건은 집주인한테 다시 연락할게.', domain: '생활' },
    { en: "I'll follow up with the bank about the declined card.", ko: '카드 거절 건은 은행에 다시 알아볼게.', domain: '돌발' },
  ],
  'pt14-3': [
    { en: "Let's circle back to the budget after lunch.", ko: '예산 얘기는 점심 후에 다시 하자.', domain: '회사' },
    { en: "Let's circle back to this when we're both calmer.", ko: '이건 우리 둘 다 진정되면 다시 얘기하자.', domain: '인간관계' },
    { en: "Let's circle back to the hotel options tonight.", ko: '호텔 후보는 오늘 밤에 다시 보자.', domain: '여행' },
    { en: "Let's circle back to the bills this weekend.", ko: '공과금은 이번 주말에 다시 보자.', domain: '생활' },
    { en: "Let's circle back to it once the power's back.", ko: '전기 들어오면 다시 얘기하자.', domain: '돌발' },
  ],
  'pt14-4': [
    { en: "I'll have the draft done by end of day.", ko: '초안은 오늘 안으로 끝내 둘게요.', domain: '회사' },
    { en: "I'll have the gift wrapped by her birthday.", ko: '선물은 그녀 생일 전에 포장해 둘게.', domain: '인간관계' },
    { en: "I'll have everything packed by tonight.", ko: '짐은 오늘 밤까지 다 싸 둘게.', domain: '여행' },
    { en: "I'll have the laundry done by the morning.", ko: '빨래는 아침까지 해 둘게.', domain: '생활' },
    { en: "I'll have it fixed by the time you get back.", ko: '네가 돌아올 때쯤엔 고쳐 둘게.', domain: '돌발' },
  ],
  'pt14-5': [
    { en: "No problem — I'm on it right now.", ko: '문제없어요, 지금 바로 할게요.', domain: '회사' },
    { en: 'Want me to text her? I\'m on it.', ko: '그녀한테 문자할까? 지금 바로 할게.', domain: '인간관계' },
    { en: "You grab the bags, I'm on the tickets.", ko: '넌 짐 챙겨, 표는 내가 맡을게.', domain: '여행' },
    { en: "The dishes? Don't worry, I'm on it.", ko: '설거지? 걱정 마, 내가 할게.', domain: '생활' },
    { en: "The alarm's going off — I'm on it.", ko: '경보 울린다, 내가 처리할게.', domain: '돌발' },
  ],

  // ── Story 15 · 꼬여도 침착하게 (Level 4) ────────────────────────────────
  'pt15-1': [
    { en: 'I brought a backup charger in case mine died.', ko: '내 거 꺼질 경우를 대비해 보조 충전기를 챙겼어.', domain: '돌발' },
    { en: 'Save the receipt in case we need to expense it.', ko: '경비 처리할 경우를 대비해 영수증 챙겨둬.', domain: '회사' },
    { en: 'Bring your passport in case they ask for ID.', ko: '신분증 요구할 경우를 대비해 여권 챙겨.', domain: '여행' },
    { en: 'I keep a spare key in case I lock myself out.', ko: '문 밖에 갇힐 경우를 대비해 여분 열쇠를 둬.', domain: '생활' },
    { en: "Text me in case you can't find the place.", ko: '장소를 못 찾을 경우를 대비해 문자해.', domain: '인간관계' },
  ],
  'pt15-2': [
    { en: "I'll call you as soon as I land.", ko: '도착하자마자 전화할게.', domain: '여행' },
    { en: "I'll send it as soon as the file finishes uploading.", ko: '파일 업로드 끝나는 대로 보낼게요.', domain: '회사' },
    { en: "I'll start dinner as soon as I get home.", ko: '집에 도착하자마자 저녁 준비할게.', domain: '생활' },
    { en: 'Call me as soon as you hear any news.', ko: '무슨 소식이든 듣자마자 전화해.', domain: '인간관계' },
    { en: 'We left as soon as the alarm went off.', ko: '경보가 울리자마자 우린 나갔어.', domain: '돌발' },
  ],
  'pt15-3': [
    { en: 'By the time we arrived, the store was closed.', ko: '우리가 도착할 때쯤엔 가게가 문을 닫았어.', domain: '여행' },
    { en: 'By the time I replied, the meeting was over.', ko: '내가 답할 때쯤엔 회의가 끝나 있었어.', domain: '회사' },
    { en: 'By the time I got home, the package was gone.', ko: '집에 도착할 때쯤엔 택배가 사라져 있었어.', domain: '생활' },
    { en: "By the time she called back, I'd already left.", ko: '그녀가 다시 전화할 때쯤엔 난 이미 떠난 뒤였어.', domain: '인간관계' },
    { en: 'By the time help arrived, the rain had stopped.', ko: '도움이 도착할 때쯤엔 비가 그쳐 있었어.', domain: '돌발' },
  ],
  'pt15-4': [
    { en: 'Once we find the problem, the fix is easy.', ko: '일단 문제만 찾으면, 고치는 건 쉬워.', domain: '돌발' },
    { en: "Once the budget's approved, we can hire someone.", ko: '일단 예산만 승인되면, 사람을 뽑을 수 있어요.', domain: '회사' },
    { en: "Once we check in, let's drop the bags and explore.", ko: '일단 체크인하면, 짐 두고 구경 나가자.', domain: '여행' },
    { en: "Once the laundry's done, I'll start cooking.", ko: '일단 빨래만 끝나면, 요리 시작할게.', domain: '생활' },
    { en: "Once you meet her, you'll see why I like her.", ko: '일단 그녀를 만나보면, 내가 왜 좋아하는지 알 거야.', domain: '인간관계' },
  ],
  'pt15-5': [
    { en: "That's why I always keep a spare key.", ko: '그래서 내가 항상 여분 열쇠를 두는 거야.', domain: '돌발' },
    { en: "That's why I double-check every invoice.", ko: '그래서 내가 청구서를 매번 다시 확인하는 거예요.', domain: '회사' },
    { en: "That's why I always book an aisle seat.", ko: '그래서 내가 항상 통로 자리를 예약하는 거야.', domain: '여행' },
    { en: "That's why I keep an umbrella by the door.", ko: '그래서 내가 문 옆에 우산을 두는 거야.', domain: '생활' },
    { en: "That's why she means so much to me.", ko: '그래서 그녀가 나한테 그렇게 소중한 거야.', domain: '인간관계' },
  ],

  // ── Story 16 · 함께 그리는 큰 그림 (Level 4) ────────────────────────────
  'pt16-1': [
    { en: "Now that the budget's approved, we can start.", ko: '이제 예산이 승인됐으니, 시작할 수 있어요.', domain: '회사' },
    { en: "Now that you're here, the night feels complete.", ko: '이제 네가 왔으니, 오늘 밤이 완벽해진 느낌이야.', domain: '인간관계' },
    { en: "Now that we've checked in, let's go explore.", ko: '이제 체크인했으니, 구경하러 나가자.', domain: '여행' },
    { en: "Now that the rent's paid, I can relax a little.", ko: '이제 월세 냈으니, 좀 한숨 돌릴 수 있어.', domain: '생활' },
    { en: "Now that the power's back, let's reset everything.", ko: '이제 전기 들어왔으니, 다 다시 켜자.', domain: '돌발' },
  ],
  'pt16-2': [
    { en: "Either way, we'll need it done by Friday.", ko: '어느 쪽이든, 금요일까지는 끝내야 해요.', domain: '회사' },
    { en: "Either way, I'm just glad you came.", ko: '어느 쪽이든, 네가 와줘서 그냥 기뻐.', domain: '인간관계' },
    { en: 'Either way, we should book the hotel tonight.', ko: '어느 쪽이든, 오늘 밤엔 호텔을 예약해야 해.', domain: '여행' },
    { en: "Either way, I'll need to do groceries this week.", ko: '어느 쪽이든, 이번 주엔 장을 봐야 해.', domain: '생활' },
    { en: 'Either way, we should keep a spare charger handy.', ko: '어느 쪽이든, 여분 충전기는 챙겨두는 게 좋아.', domain: '돌발' },
  ],
  'pt16-3': [
    { en: "Let's say the client wants more changes.", ko: '고객이 수정을 더 원한다고 치자.', domain: '회사' },
    { en: "Let's say she says yes — then what?", ko: '그녀가 좋다고 한다고 치자, 그럼 어떡할 거야?', domain: '인간관계' },
    { en: "Let's say the flight's delayed — what's our backup?", ko: '비행기가 지연된다고 치면, 대안은 뭐야?', domain: '여행' },
    { en: "Let's say we run out of milk; I'll grab some.", ko: '우유가 떨어진다고 치면, 내가 사 올게.', domain: '생활' },
    { en: "Let's say the car won't start; who do we call?", ko: '차가 시동이 안 걸린다고 치면, 누구한테 전화하지?', domain: '돌발' },
  ],
  'pt16-4': [
    { en: "I'd suggest starting with the easy parts.", ko: '쉬운 부분부터 시작하는 걸 추천해요.', domain: '회사' },
    { en: "I'd suggest just being honest with her.", ko: '그냥 그녀한테 솔직한 게 좋겠어.', domain: '인간관계' },
    { en: "I'd suggest booking the early train to be safe.", ko: '안전하게 이른 기차를 예약하는 걸 추천해.', domain: '여행' },
    { en: "I'd suggest keeping the receipt just in case.", ko: '혹시 모르니 영수증은 챙겨두는 게 좋겠어.', domain: '생활' },
    { en: "I'd suggest calling the plumber before it floods.", ko: '물 넘치기 전에 배관공 부르는 게 좋겠어.', domain: '돌발' },
  ],
  'pt16-5': [
    { en: 'It might be better to split this into two phases.', ko: '이걸 두 단계로 나누는 게 더 나을지도 몰라요.', domain: '회사' },
    { en: 'It might be better to talk in person.', ko: '직접 만나서 얘기하는 게 더 나을지도 몰라.', domain: '인간관계' },
    { en: 'It might be better to leave before rush hour.', ko: '러시아워 전에 출발하는 게 더 나을지도 몰라.', domain: '여행' },
    { en: 'It might be better to order in tonight.', ko: '오늘 밤은 배달시키는 게 더 나을지도 몰라.', domain: '생활' },
    { en: "It might be better to take the stairs — the elevator's stuck.", ko: '계단으로 가는 게 나을지도 몰라, 엘리베이터가 멈췄어.', domain: '돌발' },
  ],

  // ── Story 17 · 오랜만의 편한 수다 (Level 5) ─────────────────────────────
  'pt17-1': [
    { en: "Sounds like you've had a busy month.", ko: '한 달 내내 바빴던 것 같네.', domain: '인간관계' },
    { en: 'Sounds like the meeting went better than expected.', ko: '회의가 생각보다 잘 끝난 것 같네요.', domain: '회사' },
    { en: 'Sounds like a long flight — get some rest.', ko: '긴 비행인 것 같네, 좀 쉬어.', domain: '여행' },
    { en: 'Sounds like the perfect night to stay in.', ko: '집에 있기 딱 좋은 밤인 것 같네.', domain: '생활' },
    { en: "Sounds like the heater's acting up again.", ko: '난방기가 또 말썽인 것 같네.', domain: '돌발' },
  ],
  'pt17-2': [
    { en: 'It makes sense to take a break after all that.', ko: '그렇게 다 하고 나면 쉬는 게 맞지.', domain: '인간관계' },
    { en: 'It makes sense to confirm the budget first.', ko: '예산부터 확정하는 게 맞죠.', domain: '회사' },
    { en: 'It makes sense to book the hotel before prices rise.', ko: '가격 오르기 전에 호텔 예약하는 게 합리적이지.', domain: '여행' },
    { en: 'It makes sense to do the groceries on Sunday.', ko: '일요일에 장 보는 게 합리적이지.', domain: '생활' },
    { en: 'It makes sense to keep a spare key with a neighbor.', ko: '이웃한테 여분 열쇠를 맡겨두는 게 맞지.', domain: '돌발' },
  ],
  'pt17-3': [
    { en: "I'm all set with dinner if you're hungry.", ko: '배고프면, 저녁은 내가 다 준비해 놨어.', domain: '인간관계' },
    { en: "I'm all set with the slides for tomorrow.", ko: '내일 발표 슬라이드는 다 준비됐어요.', domain: '회사' },
    { en: "I'm all set with the boarding passes — let's go.", ko: '탑승권은 다 챙겼어, 가자.', domain: '여행' },
    { en: "I'm all set with the groceries for the week.", ko: '한 주치 장은 다 봐놨어.', domain: '생활' },
    { en: "I'm all set with a backup charger, just in case.", ko: '혹시 몰라 보조 충전기까지 다 챙겼어.', domain: '돌발' },
  ],
  'pt17-4': [
    { en: "Pick whatever you want — it's up to you.", ko: '먹고 싶은 거 골라, 네 마음이야.', domain: '인간관계' },
    { en: 'It\'s up to the manager to make the final call.', ko: '최종 결정은 매니저한테 달렸어요.', domain: '회사' },
    { en: 'Window or aisle? It\'s totally up to you.', ko: '창가 자리? 통로 자리? 완전히 네 마음이야.', domain: '여행' },
    { en: 'Takeout or cooking — it\'s up to you tonight.', ko: '배달이냐 요리냐, 오늘 밤은 네 마음이야.', domain: '생활' },
    { en: 'Whether we wait or go, it\'s up to you.', ko: '기다릴지 갈지, 네가 정해.', domain: '돌발' },
  ],
  'pt17-5': [
    { en: "I'm down for a movie if you are.", ko: '너만 괜찮으면 나는 영화 콜이야.', domain: '인간관계' },
    { en: "I'm down for a quick lunch meeting tomorrow.", ko: '내일 점심 미팅 가볍게 하는 거 좋아요.', domain: '회사' },
    { en: "I'm down for a day trip if the weather's nice.", ko: '날씨만 좋으면 당일치기 여행 콜이야.', domain: '여행' },
    { en: "I'm down for takeout instead of cooking.", ko: '요리 말고 배달시키는 거 좋아.', domain: '생활' },
    { en: "I'm down for the stairs since the elevator's out.", ko: '엘리베이터 안 되니까 계단 콜이야.', domain: '돌발' },
  ],

  // ── Story 18 · 아무것도 안 해도 좋은 날 (Level 5) ───────────────────────
  'pt18-1': [
    { en: "I guess I'll just stay in today.", ko: '그냥 오늘은 집에 있을 것 같아.', domain: '생활' },
    { en: "I guess we'll have to push the deadline.", ko: '마감을 미뤄야 할 것 같네요.', domain: '회사' },
    { en: 'I guess we missed the last train home.', ko: '막차를 놓친 것 같아.', domain: '여행' },
    { en: 'I guess she just needs some time.', ko: '그녀는 그냥 시간이 좀 필요한 것 같아.', domain: '인간관계' },
    { en: "I guess the power's out for the whole block.", ko: '이 동네 전체가 정전인 것 같아.', domain: '돌발' },
  ],
  'pt18-2': [
    { en: "I bet it's packed at the mall right now.", ko: '지금 쇼핑몰 분명 미어터질걸.', domain: '생활' },
    { en: 'I bet the meeting runs long again today.', ko: '오늘 회의 분명 또 길어질걸요.', domain: '회사' },
    { en: 'I bet the beach is gorgeous this time of year.', ko: '이맘때 해변 분명 끝내줄걸.', domain: '여행' },
    { en: "I bet she'd love that little café.", ko: '그녀 분명 그 작은 카페 좋아할걸.', domain: '인간관계' },
    { en: 'I bet the Wi-Fi went down across the whole building.', ko: '건물 전체 와이파이가 나간 게 분명해.', domain: '돌발' },
  ],
  'pt18-3': [
    { en: 'Chances are the café is closed on Sundays.', ko: '그 카페는 일요일엔 십중팔구 문 닫았을 거야.', domain: '생활' },
    { en: 'Chances are the client will want a few changes.', ko: '고객이 아마 수정을 몇 가지 원할 거예요.', domain: '회사' },
    { en: 'Chances are the flight will be delayed in this weather.', ko: '이런 날씨면 비행기는 아마 지연될 거야.', domain: '여행' },
    { en: "Chances are he's just running a little late.", ko: '그는 아마 그냥 조금 늦는 걸 거야.', domain: '인간관계' },
    { en: 'Chances are the package is stuck at the warehouse.', ko: '택배는 아마 물류창고에 묶여 있을 거야.', domain: '돌발' },
  ],
  'pt18-4': [
    { en: 'As far as I know, the bakery opens at nine.', ko: '내가 알기로는 그 빵집은 9시에 열어.', domain: '생활' },
    { en: 'As far as I know, the deadline is still Friday.', ko: '내가 알기로는 마감은 아직 금요일이에요.', domain: '회사' },
    { en: 'As far as I know, the hotel has free parking.', ko: '내가 알기로는 그 호텔은 주차가 무료야.', domain: '여행' },
    { en: 'As far as I know, they\'re still together.', ko: '내가 알기로는 그들 아직 사귀어.', domain: '인간관계' },
    { en: "As far as I know, the elevator's been fixed.", ko: '내가 알기로는 엘리베이터는 고쳐졌어.', domain: '돌발' },
  ],
  'pt18-5': [
    { en: "On second thought, let's just order in.", ko: '다시 생각해보니, 그냥 배달시키자.', domain: '생활' },
    { en: "On second thought, let's reschedule to Monday.", ko: '다시 생각해보니, 월요일로 미루죠.', domain: '회사' },
    { en: "On second thought, let's take the earlier flight.", ko: '다시 생각해보니, 더 이른 비행기로 가자.', domain: '여행' },
    { en: 'On second thought, I should just call her.', ko: '다시 생각해보니, 그냥 그녀한테 전화해야겠어.', domain: '인간관계' },
    { en: "On second thought, let's grab a spare charger first.", ko: '다시 생각해보니, 보조 충전기부터 챙기자.', domain: '돌발' },
  ],

  // ── Story 19 · 우리가 만난 날 (Level 5) ─────────────────────────────────
  'pt19-1': [
    { en: 'Long story short, we met by total accident.', ko: '간단히 말하면, 우린 완전 우연히 만났어.', domain: '인간관계' },
    { en: 'Long story short, the meeting got cancelled.', ko: '간단히 말하면, 회의가 취소됐어요.', domain: '회사' },
    { en: 'Long story short, we missed the train and laughed about it.', ko: '간단히 말하면, 기차 놓치고 그냥 웃어버렸어.', domain: '여행' },
    { en: 'Long story short, the sink flooded the kitchen.', ko: '간단히 말하면, 싱크대가 넘쳐서 부엌이 잠겼어.', domain: '생활' },
    { en: 'Long story short, my card got declined and a stranger helped.', ko: '간단히 말하면, 카드가 거절됐는데 모르는 사람이 도와줬어.', domain: '돌발' },
  ],
  'pt19-2': [
    { en: "Speaking of coffee, that's where it started.", ko: '커피 얘기가 나와서 말인데, 거기서 시작됐어.', domain: '인간관계' },
    { en: 'Speaking of deadlines, did you send the report?', ko: '마감 얘기 나와서 말인데, 보고서 보냈어요?', domain: '회사' },
    { en: 'Speaking of the trip, did you book the hotel yet?', ko: '여행 얘기 나와서 말인데, 호텔은 예약했어?', domain: '여행' },
    { en: "Speaking of groceries, we're almost out of milk.", ko: '장 얘기 나와서 말인데, 우유가 거의 떨어졌어.', domain: '생활' },
    { en: 'Speaking of the leak, did you call the landlord?', ko: '누수 얘기 나와서 말인데, 집주인한테 전화했어?', domain: '돌발' },
  ],
  'pt19-3': [
    { en: "The next thing I knew, we'd talked for hours.", ko: '정신 차려보니, 우린 몇 시간을 떠들고 있었어.', domain: '인간관계' },
    { en: 'The next thing I knew, the deadline was tomorrow.', ko: '정신 차려보니, 마감이 내일이었어요.', domain: '회사' },
    { en: "The next thing I knew, we'd missed our flight.", ko: '정신 차려보니, 우린 비행기를 놓쳤더라.', domain: '여행' },
    { en: 'The next thing I knew, the whole weekend was gone.', ko: '정신 차려보니, 주말이 다 지나가 있었어.', domain: '생활' },
    { en: 'The next thing I knew, the lights went out.', ko: '정신 차려보니, 불이 다 꺼졌더라.', domain: '돌발' },
  ],
  'pt19-4': [
    { en: "It's like we'd known each other for years.", ko: '마치 우리가 몇 년은 알고 지낸 사이 같았어.', domain: '인간관계' },
    { en: "It's like the meetings never actually end.", ko: '회의가 마치 영영 안 끝나는 것 같아요.', domain: '회사' },
    { en: "It's like the whole town shuts down on Sundays.", ko: '마치 이 동네 전체가 일요일엔 멈추는 것 같아.', domain: '여행' },
    { en: "It's like the week just flew by.", ko: '마치 이번 주가 그냥 휙 지나간 것 같아.', domain: '생활' },
    { en: "It's like everything broke down on the same day.", ko: '마치 모든 게 같은 날 고장 난 것 같아.', domain: '돌발' },
  ],
  'pt19-5': [
    { en: 'That reminds me, I still have her umbrella.', ko: '그러고 보니, 나 아직 그녀 우산 갖고 있어.', domain: '인간관계' },
    { en: 'That reminds me, I need to send that invoice.', ko: '그러고 보니, 나 그 청구서 보내야 해.', domain: '회사' },
    { en: "That reminds me, I haven't printed the boarding passes.", ko: '그러고 보니, 나 탑승권을 아직 출력 안 했어.', domain: '여행' },
    { en: 'That reminds me, the rent is due tomorrow.', ko: '그러고 보니, 월세가 내일이네.', domain: '생활' },
    { en: 'That reminds me, I should grab a spare charger.', ko: '그러고 보니, 보조 충전기 하나 챙겨야겠어.', domain: '돌발' },
  ],

  // ── Story 20 · 다음을 기약하며 (Level 5) ────────────────────────────────
  'pt20-1': [
    { en: "Let's grab lunch before you leave town.", ko: '떠나기 전에 점심 한번 하자.', domain: '인간관계' },
    { en: "Let's grab a quick coffee before the meeting.", ko: '회의 전에 커피 한 잔 가볍게 하자.', domain: '회사' },
    { en: "Let's grab a bite before we catch the train.", ko: '기차 타기 전에 간단히 뭐 좀 먹자.', domain: '여행' },
    { en: "Let's grab some groceries on the way home.", ko: '집에 가는 길에 장 좀 보자.', domain: '생활' },
    { en: "Let's grab a cab — we're going to be late.", ko: '택시 잡자, 우리 늦겠어.', domain: '돌발' },
  ],
  'pt20-2': [
    { en: "I'll text you the address tonight.", ko: '오늘 밤에 주소 문자할게.', domain: '인간관계' },
    { en: "I'll text you the meeting link in a minute.", ko: '잠시 후에 회의 링크 문자로 보낼게요.', domain: '회사' },
    { en: "I'll text you the gate number once I'm through security.", ko: '보안 검색 통과하면 게이트 번호 문자할게.', domain: '여행' },
    { en: "I'll text you the grocery list before you leave.", ko: '너 나가기 전에 장볼 목록 문자할게.', domain: '생활' },
    { en: "I'll text you if the plan changes last minute.", ko: '막판에 계획 바뀌면 문자할게.', domain: '돌발' },
  ],
  'pt20-3': [
    { en: 'Saturday works for me if it works for you.', ko: '너만 괜찮으면 토요일 나는 좋아.', domain: '인간관계' },
    { en: 'Two o\'clock works for me for the call.', ko: '통화는 2시면 저는 괜찮아요.', domain: '회사' },
    { en: 'An early flight works for me if it\'s cheaper.', ko: '더 싸면 이른 비행기도 나는 괜찮아.', domain: '여행' },
    { en: 'Saturday morning works for me for the delivery.', ko: '배송은 토요일 오전이면 나는 괜찮아.', domain: '생활' },
    { en: 'Whatever\'s fastest works for me right now.', ko: '지금은 제일 빠른 거면 나는 다 괜찮아.', domain: '돌발' },
  ],
  'pt20-4': [
    { en: "Don't worry about being late — I'll wait.", ko: '늦는 거 신경 쓰지 마, 기다릴게.', domain: '인간관계' },
    { en: "Don't worry about the report — I'll finish it.", ko: '보고서는 신경 쓰지 마세요, 제가 끝낼게요.', domain: '회사' },
    { en: "Don't worry about the bags, I've got them.", ko: '짐은 신경 쓰지 마, 내가 들게.', domain: '여행' },
    { en: "Don't worry about the bill, it's on me.", ko: '계산은 신경 쓰지 마, 내가 낼게.', domain: '생활' },
    { en: "Don't worry about the car — I called a mechanic.", ko: '차는 신경 쓰지 마, 정비사 불렀어.', domain: '돌발' },
  ],
  'pt20-5': [
    { en: "I'll catch you later this week, then.", ko: '그럼 이번 주 중에 또 보자.', domain: '인간관계' },
    { en: "I'll catch you after the meeting.", ko: '회의 끝나고 봐요.', domain: '회사' },
    { en: "I'll catch you at the gate in ten.", ko: '10분 뒤에 게이트에서 봐.', domain: '여행' },
    { en: "I'll catch you when I'm back from groceries.", ko: '장 보고 와서 봐.', domain: '생활' },
    { en: "Gotta run — I'll catch you later!", ko: '가봐야 해, 이따 봐!', domain: '돌발' },
  ],
}

/** patternId로 연습 예문 5개를 반환 (없으면 빈 배열) */
export function getPatternExamples(patternId: string): PracticeExample[] {
  return patternExamples[patternId] ?? []
}
