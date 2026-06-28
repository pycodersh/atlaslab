/**
 * Pattern 연습 예문 — 패턴별 5문장 (PATTO Phase 1 품질 기준)
 *
 * 각 패턴(patternId)마다 예문 5개:
 *   [0] = Story에 등장하는 대표 예문 (Context 연결)
 *   [1~4] = 실제 회화용 추가 예문 (생활/회사/여행/인간관계/돌발 영역을 골고루)
 *
 * 작성 기준은 docs/PATTO_STYLE_GUIDE.md 참고.
 * - 평균 8~15단어, 원어민이 실제로 쓰는 자연스러운 문장
 * - domain 태그로 5개 예문이 서로 다른 장면을 보여주도록 구성
 */

/** 예문 영역 — 5개 예문이 골고루 커버하도록 (PATTO Style Guide §2) */
export type ExampleDomain = '생활' | '회사' | '여행' | '인간관계' | '돌발'

export type PracticeExample = { en: string; ko: string; domain?: ExampleDomain }

export const patternExamples: Record<string, PracticeExample[]> = {
  // ── Story 1 · 새로운 시작 ───────────────────────────────────────────────
  'pt1-1': [
    { en: 'I want to start something new this time.', ko: '이번엔 새로운 걸 시작하고 싶어.', domain: '생활' },
    { en: 'I want to bring this up with my manager before the meeting.', ko: '회의 전에 이 얘기를 매니저한테 꺼내고 싶어.', domain: '회사' },
    { en: 'I want to grab a quick bite before we catch the train.', ko: '기차 타기 전에 간단히 뭐 좀 먹고 싶어.', domain: '여행' },
    { en: 'I want to make it up to you for missing your birthday.', ko: '네 생일 놓친 거 만회하고 싶어.', domain: '인간관계' },
    { en: 'I want to fix this before it turns into a bigger problem.', ko: '더 큰 문제가 되기 전에 이걸 해결하고 싶어.', domain: '돌발' },
  ],
  'pt1-2': [
    { en: "I'm thinking about keeping a short journal every night.", ko: '매일 밤 짧은 일기를 쓸까 생각 중이야.', domain: '생활' },
    { en: "I'm thinking about switching to a job with shorter hours.", ko: '근무 시간이 더 짧은 직장으로 옮길까 생각 중이야.', domain: '회사' },
    { en: "I'm thinking about booking the early flight to avoid the crowds.", ko: '사람 많은 걸 피하려고 이른 비행기를 예약할까 생각 중이야.', domain: '여행' },
    { en: "I'm thinking about calling her to clear things up.", ko: '오해를 풀려고 그녀한테 전화할까 생각 중이야.', domain: '인간관계' },
    { en: "I'm thinking about taking a different route since the road is blocked.", ko: '길이 막혀서 다른 길로 갈까 생각 중이야.', domain: '돌발' },
  ],
  'pt1-3': [
    { en: 'I should write down one good thing too.', ko: '좋은 일 하나도 적어야 할 것 같아.', domain: '생활' },
    { en: 'I should double-check the numbers before I send the report.', ko: '보고서 보내기 전에 숫자를 다시 확인해야 할 것 같아.', domain: '회사' },
    { en: 'I should charge my phone before we head to the airport.', ko: '공항 가기 전에 폰을 충전해야 할 것 같아.', domain: '여행' },
    { en: 'I should apologize to him for snapping earlier.', ko: '아까 짜증 낸 거 그한테 사과해야 할 것 같아.', domain: '인간관계' },
    { en: 'I should call someone before the rain gets any worse.', ko: '비가 더 심해지기 전에 누군가한테 전화해야 할 것 같아.', domain: '돌발' },
  ],
  'pt1-4': [
    { en: 'The reason is I forget the small moments too quickly.', ko: '이유는 작은 순간들을 너무 빨리 잊어버리기 때문이야.', domain: '생활' },
    { en: 'The reason is the client changed the deadline at the last minute.', ko: '이유는 고객이 마감을 막판에 바꿨기 때문이야.', domain: '회사' },
    { en: 'The reason is the trains stop running after midnight here.', ko: '이유는 여기 기차가 자정 이후엔 안 다니기 때문이야.', domain: '여행' },
    { en: "The reason is I didn't want to worry you for nothing.", ko: '이유는 괜히 너 걱정시키고 싶지 않아서야.', domain: '인간관계' },
    { en: 'The reason is the power went out across the whole building.', ko: '이유는 건물 전체가 정전됐기 때문이야.', domain: '돌발' },
  ],
  'pt1-5': [
    { en: 'It turns out it only took five minutes.', ko: '알고 보니 5분밖에 안 걸렸어.', domain: '생활' },
    { en: 'It turns out we were both working on the exact same thing.', ko: '알고 보니 우리 둘이 완전히 똑같은 걸 하고 있었더라.', domain: '회사' },
    { en: 'It turns out the hotel is right across from the station.', ko: '알고 보니 호텔이 역 바로 맞은편이더라.', domain: '여행' },
    { en: 'It turns out she was just as nervous as I was.', ko: '알고 보니 그녀도 나만큼 긴장했더라.', domain: '인간관계' },
    { en: "It turns out the noise was just the neighbor's dog.", ko: '알고 보니 그 소리는 그냥 옆집 개였더라.', domain: '돌발' },
  ],

  // ── Story 2 · 나를 만드는 시간 ─────────────────────────────────────────
  'pt2-1': [
    { en: "I'm planning to tell her about everything that changed.", ko: '바뀐 모든 것에 대해 그녀에게 이야기할 계획이야.', domain: '인간관계' },
    { en: "I'm planning to ask for some time off after this project.", ko: '이 프로젝트 끝나면 휴가를 좀 낼 계획이야.', domain: '회사' },
    { en: "I'm planning to spend a few days by the coast this summer.", ko: '이번 여름엔 해안에서 며칠 보낼 계획이야.', domain: '여행' },
    { en: "I'm planning to cook more at home and eat out less.", ko: '집에서 더 해 먹고 외식은 줄일 계획이야.', domain: '생활' },
    { en: "I'm planning to leave early in case the traffic gets bad.", ko: '차 막힐까 봐 일찍 출발할 계획이야.', domain: '돌발' },
  ],
  'pt2-2': [
    { en: 'I used to cancel plans whenever I felt tired.', ko: '예전에는 피곤할 때마다 약속을 취소하곤 했어.', domain: '인간관계' },
    { en: 'I used to dread Mondays, but this job changed that.', ko: '예전엔 월요일이 너무 싫었는데, 이 직장이 그걸 바꿔놨어.', domain: '회사' },
    { en: 'I used to travel with a huge suitcase for every trip.', ko: '예전엔 여행 갈 때마다 큰 캐리어를 들고 다녔어.', domain: '여행' },
    { en: 'I used to skip breakfast all the time in my twenties.', ko: '이십 대 땐 늘 아침을 걸렀어.', domain: '생활' },
    { en: 'I used to panic whenever something went wrong at the last minute.', ko: '예전엔 막판에 뭔가 잘못되면 늘 당황했어.', domain: '돌발' },
  ],
  'pt2-3': [
    { en: "I'm sorry for being so distant last year.", ko: '작년에 너무 멀어져서 미안해.', domain: '인간관계' },
    { en: "I'm sorry for sending that email before checking with you.", ko: '너한테 확인 안 하고 그 이메일 보내서 미안해.', domain: '회사' },
    { en: "I'm sorry for keeping everyone waiting at the gate.", ko: '모두를 게이트에서 기다리게 해서 미안해.', domain: '여행' },
    { en: "I'm sorry for leaving the kitchen in such a mess.", ko: '부엌을 이렇게 엉망으로 두고 가서 미안해.', domain: '생활' },
    { en: "I'm sorry for calling so late, but it's an emergency.", ko: '이렇게 늦게 전화해서 미안한데, 급한 일이야.', domain: '돌발' },
  ],
  'pt2-4': [
    { en: 'It seems like she has changed too.', ko: '그녀도 변한 것 같아.', domain: '인간관계' },
    { en: 'It seems like the meeting is going to run long again.', ko: '회의가 또 길어질 것 같아.', domain: '회사' },
    { en: "It seems like the next bus isn't coming for a while.", ko: '다음 버스가 한참 동안 안 올 것 같아.', domain: '여행' },
    { en: 'It seems like the milk has gone bad already.', ko: '우유가 벌써 상한 것 같아.', domain: '생활' },
    { en: "It seems like something's wrong with the heater again.", ko: '히터에 또 뭔가 문제가 있는 것 같아.', domain: '돌발' },
  ],
  'pt2-5': [
    { en: "I'm looking forward to seeing her every month.", ko: '매달 그녀를 만나는 게 기대돼.', domain: '인간관계' },
    { en: "I'm looking forward to working with the new team next week.", ko: '다음 주에 새 팀이랑 일하는 게 기대돼.', domain: '회사' },
    { en: "I'm looking forward to trying the street food over there.", ko: '거기 길거리 음식 먹어보는 게 기대돼.', domain: '여행' },
    { en: "I'm looking forward to a quiet weekend with nothing planned.", ko: '아무 계획 없는 조용한 주말이 기대돼.', domain: '생활' },
    { en: "I'm looking forward to getting this whole thing behind us.", ko: '이 모든 게 빨리 끝나서 홀가분해지면 좋겠어.', domain: '돌발' },
  ],

  // ── Story 3 · 일상의 기초 ──────────────────────────────────────────────
  'pt3-1': [
    { en: 'I have to leave by eight today.', ko: '오늘은 8시까지 나가야 해.', domain: '생활' },
    { en: 'I have to finish this report before the meeting starts.', ko: '회의 시작 전에 이 보고서를 끝내야 해.', domain: '회사' },
    { en: 'I have to be at the gate thirty minutes before boarding.', ko: '탑승 30분 전에 게이트에 가 있어야 해.', domain: '여행' },
    { en: 'I have to pick up my sister from the airport tonight.', ko: '오늘 밤 공항에서 여동생을 데려와야 해.', domain: '인간관계' },
    { en: 'I have to deal with this leak before it floods the floor.', ko: '바닥이 물에 잠기기 전에 이 누수를 처리해야 해.', domain: '돌발' },
  ],
  'pt3-2': [
    { en: "I don't drink coffee in the morning.", ko: '나는 아침에 커피를 안 마셔.', domain: '생활' },
    { en: "I don't usually check my email after I leave the office.", ko: '보통 퇴근하고 나선 이메일을 확인 안 해.', domain: '회사' },
    { en: "I don't really enjoy long flights without a window seat.", ko: '창가 자리 없이 긴 비행은 별로 안 좋아해.', domain: '여행' },
    { en: "I don't want to make a big deal out of it.", ko: '그걸 크게 만들고 싶지 않아.', domain: '인간관계' },
    { en: "I don't have my wallet on me right now.", ko: '지금 지갑을 안 갖고 있어.', domain: '돌발' },
  ],
  'pt3-3': [
    { en: 'Let me help you look.', ko: '내가 같이 찾아줄게.', domain: '생활' },
    { en: 'Let me walk you through the slides real quick.', ko: '슬라이드 빠르게 설명해 줄게.', domain: '회사' },
    { en: 'Let me grab the tickets while you watch the bags.', ko: '네가 짐 보는 동안 내가 표 가져올게.', domain: '여행' },
    { en: 'Let me know if you ever need someone to talk to.', ko: '얘기할 사람 필요하면 언제든 말해.', domain: '인간관계' },
    { en: 'Let me handle this — you go check on the others.', ko: '이건 내가 처리할게, 넌 가서 다른 사람들 살펴봐.', domain: '돌발' },
  ],
  'pt3-4': [
    { en: 'Thank you for helping me.', ko: '도와줘서 고마워.', domain: '인간관계' },
    { en: 'Thank you for covering my shift on such short notice.', ko: '갑자기인데 내 근무 대신해 줘서 고마워.', domain: '회사' },
    { en: 'Thank you for showing us around the old town today.', ko: '오늘 구시가지 구경시켜 줘서 고마워.', domain: '여행' },
    { en: 'Thank you for picking up groceries on your way home.', ko: '집에 오는 길에 장 봐줘서 고마워.', domain: '생활' },
    { en: 'Thank you for staying calm while we sorted everything out.', ko: '우리가 다 해결하는 동안 침착하게 있어줘서 고마워.', domain: '돌발' },
  ],
  'pt3-5': [
    { en: 'I just grabbed my bag and headed for the door.', ko: '나는 그냥 가방을 들고 문으로 향했어.', domain: '생활' },
    { en: 'I just sent over the file you asked for.', ko: '요청한 파일 방금 보냈어.', domain: '회사' },
    { en: 'I just checked in, so I have an hour to kill.', ko: '방금 체크인해서 한 시간 정도 비어.', domain: '여행' },
    { en: "I just wanted to see how you're holding up.", ko: '그냥 너 어떻게 지내나 보고 싶었어.', domain: '인간관계' },
    { en: 'I just realized I left the stove on at home.', ko: '방금 집에 가스레인지 켜둔 게 생각났어.', domain: '돌발' },
  ],

  // ── Story 4 · 계획과 준비 ──────────────────────────────────────────────
  'pt4-1': [
    { en: "I can do this — I've practiced for a whole week.", ko: '나는 할 수 있어 — 일주일 내내 연습했어.', domain: '회사' },
    { en: 'I can have the draft ready by tomorrow morning.', ko: '내일 아침까지 초안 준비해 둘 수 있어.', domain: '회사' },
    { en: "I can show you the way if you're heading downtown.", ko: '시내 가는 거면 내가 길 알려줄 수 있어.', domain: '여행' },
    { en: 'I can pick you up on my way to work.', ko: '출근하는 길에 너 태워줄 수 있어.', domain: '인간관계' },
    { en: 'I can lend you my charger if your phone dies.', ko: '폰 꺼지면 내 충전기 빌려줄 수 있어.', domain: '돌발' },
  ],
  'pt4-2': [
    { en: "I'm still a little nervous.", ko: '아직도 조금 긴장돼.', domain: '생활' },
    { en: "I'm still waiting to hear back about the job offer.", ko: '아직도 그 일자리 제안에 대한 답을 기다리고 있어.', domain: '회사' },
    { en: "I'm still trying to figure out the subway map here.", ko: '여기 지하철 노선도 아직도 파악하는 중이야.', domain: '여행' },
    { en: "I'm still not over how kind they were to us.", ko: '그들이 우리한테 얼마나 친절했는지 아직도 잊히질 않아.', domain: '인간관계' },
    { en: "I'm still stuck in traffic, so start without me.", ko: '아직 차 막혀서, 나 빼고 먼저 시작해.', domain: '돌발' },
  ],
  'pt4-3': [
    { en: 'I keep checking my notes again and again.', ko: '나는 자꾸 메모를 보고 또 봐.', domain: '회사' },
    { en: 'I keep getting interrupted every time I start working.', ko: '일 시작할 때마다 자꾸 방해를 받게 돼.', domain: '회사' },
    { en: 'I keep forgetting which platform our train leaves from.', ko: '우리 기차가 어느 플랫폼에서 떠나는지 자꾸 까먹어.', domain: '여행' },
    { en: 'I keep meaning to call her, but I never do.', ko: '그녀한테 전화하려고 계속 마음먹는데, 결국 못 해.', domain: '인간관계' },
    { en: 'I keep hearing a strange noise coming from the engine.', ko: '엔진에서 자꾸 이상한 소리가 들려.', domain: '돌발' },
  ],
  'pt4-4': [
    { en: "I'm about to turn off the lights.", ko: '막 불을 끄려던 참이야.', domain: '생활' },
    { en: "I'm about to jump on a call, can I text you later?", ko: '막 통화 들어가려던 참인데, 이따 문자해도 될까?', domain: '회사' },
    { en: "I'm about to board, so I'll message you when I land.", ko: '막 탑승하려던 참이라, 도착하면 연락할게.', domain: '여행' },
    { en: "I'm about to head out — do you need anything?", ko: '막 나가려던 참인데, 뭐 필요한 거 있어?', domain: '인간관계' },
    { en: "I'm about to lose signal, so call me right back.", ko: '곧 신호가 끊길 것 같으니까, 바로 다시 전화해.', domain: '돌발' },
  ],
  'pt4-5': [
    { en: "I'm supposed to arrive at nine sharp.", ko: '9시 정각에 도착하기로 되어 있어.', domain: '회사' },
    { en: "I'm supposed to hand this in by the end of the day.", ko: '오늘 안으로 이걸 제출하기로 되어 있어.', domain: '회사' },
    { en: "I'm supposed to meet my guide in the lobby at ten.", ko: '10시에 로비에서 가이드를 만나기로 되어 있어.', domain: '여행' },
    { en: "I'm supposed to call my mom back, but I keep forgetting.", ko: '엄마한테 다시 전화하기로 했는데 자꾸 까먹어.', domain: '인간관계' },
    { en: "I'm supposed to head outside if the alarm goes off.", ko: '알람이 울리면 밖으로 나가기로 되어 있어.', domain: '돌발' },
  ],

  // ── Story 5 · 생각과 느낌 ──────────────────────────────────────────────
  'pt5-1': [
    { en: "I'm going to make one real change this month.", ko: '이번 달에 진짜 변화 하나를 만들 거야.', domain: '생활' },
    { en: "I'm going to bring this up at tomorrow's team meeting.", ko: '내일 팀 회의에서 이 얘기를 꺼낼 거야.', domain: '회사' },
    { en: "I'm going to pack light and just bring a carry-on.", ko: '짐 가볍게 싸서 기내용 가방만 가져갈 거야.', domain: '여행' },
    { en: "I'm going to surprise her with dinner this Friday.", ko: '이번 금요일에 그녀를 저녁으로 깜짝 놀라게 해줄 거야.', domain: '인간관계' },
    { en: "I'm going to call the front desk about the broken lock.", ko: '고장 난 잠금장치 때문에 프런트에 전화할 거야.', domain: '돌발' },
  ],
  'pt5-2': [
    { en: "I'm going to try waking up an hour earlier.", ko: '한 시간 더 일찍 일어나 볼 거야.', domain: '생활' },
    { en: "I'm going to try setting clearer boundaries with my coworkers.", ko: '동료들이랑 더 분명한 선을 그어볼 거야.', domain: '회사' },
    { en: "I'm going to try ordering everything in the local language.", ko: '모든 걸 현지 언어로 주문해 볼 거야.', domain: '여행' },
    { en: "I'm going to try listening more and talking less.", ko: '더 많이 듣고 덜 말해볼 거야.', domain: '인간관계' },
    { en: "I'm going to try rebooting it before I call for help.", ko: '도움 부르기 전에 일단 재부팅해 볼 거야.', domain: '돌발' },
  ],
  'pt5-3': [
    { en: "I've been feeling tired for a while now.", ko: '나는 한동안 계속 피곤함을 느끼고 있어.', domain: '생활' },
    { en: "I've been putting in extra hours to meet the deadline.", ko: '마감 맞추려고 계속 야근하고 있어.', domain: '회사' },
    { en: "I've been saving up for this trip all year.", ko: '이 여행을 위해 일 년 내내 돈을 모으고 있었어.', domain: '여행' },
    { en: "I've been meaning to thank you for the other day.", ko: '지난번 일에 대해 계속 고맙다고 하고 싶었어.', domain: '인간관계' },
    { en: "I've been trying to reach you all morning.", ko: '아침 내내 너한테 연락하려고 했어.', domain: '돌발' },
  ],
  'pt5-4': [
    { en: 'I think mornings suit me better than nights.', ko: '밤보다 아침이 나에게 더 잘 맞는 것 같아.', domain: '생활' },
    { en: 'I think we should go with the simpler option here.', ko: '여기선 더 단순한 쪽으로 가는 게 좋을 것 같아.', domain: '회사' },
    { en: 'I think we took a wrong turn somewhere back there.', ko: '아까 어디선가 길을 잘못 든 것 같아.', domain: '여행' },
    { en: 'I think she just needs a little space right now.', ko: '그녀는 지금 그냥 좀 혼자 있을 시간이 필요한 것 같아.', domain: '인간관계' },
    { en: 'I think we should leave now before it gets worse.', ko: '더 나빠지기 전에 지금 나가는 게 좋을 것 같아.', domain: '돌발' },
  ],
  'pt5-5': [
    { en: 'I feel like a small change can open a new door.', ko: '작은 변화가 새로운 문을 열 수 있을 것 같은 느낌이야.', domain: '생활' },
    { en: 'I feel like my ideas finally got heard in that meeting.', ko: '그 회의에서 드디어 내 의견이 받아들여진 느낌이야.', domain: '회사' },
    { en: 'I feel like staying in and resting tonight instead.', ko: '오늘 밤은 그냥 안에서 쉬고 싶은 기분이야.', domain: '여행' },
    { en: "I feel like we've gotten a lot closer lately.", ko: '우리 요즘 훨씬 가까워진 느낌이야.', domain: '인간관계' },
    { en: "I feel like something's off, but I can't say what.", ko: '뭔가 이상한 느낌인데, 뭐라고 말은 못 하겠어.', domain: '돌발' },
  ],

  // ── Story 6 · 판단과 의견 ──────────────────────────────────────────────
  'pt6-1': [
    { en: "I'm not sure which one is better.", ko: '어느 쪽이 더 나은지 모르겠어.', domain: '회사' },
    { en: "I'm not sure we'll hit the deadline at this rate.", ko: '이 속도로는 마감을 맞출 수 있을지 모르겠어.', domain: '회사' },
    { en: "I'm not sure if this train even stops at our station.", ko: '이 기차가 우리 역에 서기는 하는지 모르겠어.', domain: '여행' },
    { en: "I'm not sure what to say to make her feel better.", ko: '그녀 기분이 나아지게 뭐라고 해야 할지 모르겠어.', domain: '인간관계' },
    { en: "I'm not sure how this happened, but let's fix it.", ko: '어쩌다 이렇게 됐는지 모르겠지만, 일단 고치자.', domain: '돌발' },
  ],
  'pt6-2': [
    { en: 'I tend to overthink big decisions.', ko: '나는 큰 결정을 지나치게 고민하는 편이야.', domain: '회사' },
    { en: 'I tend to take on too much and burn myself out.', ko: '나는 일을 너무 많이 떠안고 지쳐버리는 편이야.', domain: '회사' },
    { en: 'I tend to get to the airport way too early.', ko: '나는 공항에 너무 일찍 가는 편이야.', domain: '여행' },
    { en: "I tend to go quiet when something's bothering me.", ko: '나는 뭔가 신경 쓰이면 말이 없어지는 편이야.', domain: '인간관계' },
    { en: 'I tend to freeze up a bit when things go wrong.', ko: '나는 일이 잘못되면 약간 얼어붙는 편이야.', domain: '돌발' },
  ],
  'pt6-3': [
    { en: 'It depends on which one I value more.', ko: '어느 쪽을 더 중요하게 여기느냐에 달려 있어.', domain: '회사' },
    { en: 'It depends on whether the client approves the budget.', ko: '그건 고객이 예산을 승인하느냐에 달려 있어.', domain: '회사' },
    { en: 'It depends on how bad the traffic is tomorrow.', ko: '그건 내일 차가 얼마나 막히느냐에 달려 있어.', domain: '여행' },
    { en: 'It depends on how she takes the news.', ko: '그건 그녀가 그 소식을 어떻게 받아들이느냐에 달려 있어.', domain: '인간관계' },
    { en: 'It depends on whether the power comes back soon.', ko: '그건 전기가 곧 들어오느냐에 달려 있어.', domain: '돌발' },
  ],
  'pt6-4': [
    { en: "I'm trying to listen to myself instead of others.", ko: '다른 사람보다 내 마음에 귀 기울이려고 노력 중이야.', domain: '인간관계' },
    { en: "I'm trying to stay focused with everything going on.", ko: '이것저것 많은 와중에 집중하려고 애쓰고 있어.', domain: '회사' },
    { en: "I'm trying to stick to a budget on this trip.", ko: '이번 여행에선 예산을 지키려고 노력 중이야.', domain: '여행' },
    { en: "I'm trying to cut back on how much coffee I drink.", ko: '커피를 줄이려고 노력하고 있어.', domain: '생활' },
    { en: "I'm trying to stay calm until help arrives.", ko: '도움이 올 때까지 침착하려고 애쓰고 있어.', domain: '돌발' },
  ],
  'pt6-5': [
    { en: "Even though I'm still unsure, I feel calmer now.", ko: '아직 확신은 없지만, 이제 마음이 더 차분해.', domain: '인간관계' },
    { en: 'Even though it was a long day, the meeting went well.', ko: '긴 하루였지만, 회의는 잘 풀렸어.', domain: '회사' },
    { en: 'Even though it rained all day, we still had fun.', ko: '하루 종일 비가 왔지만, 그래도 즐거웠어.', domain: '여행' },
    { en: "Even though I was exhausted, I couldn't fall asleep.", ko: '너무 지쳤는데도, 잠이 안 왔어.', domain: '생활' },
    { en: 'Even though the flight was delayed, we made the connection.', ko: '비행기가 지연됐지만, 환승은 제때 했어.', domain: '돌발' },
  ],

  // ── Story 7 · 조건과 결과 ──────────────────────────────────────────────
  'pt7-1': [
    { en: "As long as the weather is clear, we'll go.", ko: '날씨가 맑기만 하면 갈 거야.', domain: '여행' },
    { en: 'As long as we hit the main goals, the rest can wait.', ko: '핵심 목표만 달성하면, 나머지는 나중에 해도 돼.', domain: '회사' },
    { en: "As long as you're honest with me, we'll be fine.", ko: '나한테 솔직하기만 하면, 우린 괜찮을 거야.', domain: '인간관계' },
    { en: "As long as I get some sleep, I'll be okay tomorrow.", ko: '잠만 좀 자면, 내일은 괜찮을 거야.', domain: '생활' },
    { en: "As long as nobody's hurt, everything else can be replaced.", ko: '아무도 안 다쳤으면, 나머지는 다 다시 마련하면 돼.', domain: '돌발' },
  ],
  'pt7-2': [
    { en: 'No wonder I feel so tired this morning.', ko: '오늘 아침 이렇게 피곤한 게 당연하지.', domain: '생활' },
    { en: "No wonder the team's stressed with three deadlines this week.", ko: '이번 주에 마감이 셋이니 팀이 스트레스받는 게 당연하지.', domain: '회사' },
    { en: 'No wonder the beach was packed on a holiday weekend.', ko: '연휴 주말이니 해변이 붐비는 게 당연하지.', domain: '여행' },
    { en: 'No wonder she was upset after waiting all evening.', ko: '저녁 내내 기다렸으니 그녀가 화난 게 당연하지.', domain: '인간관계' },
    { en: 'No wonder the lights went out — a tree hit the line.', ko: '전선에 나무가 부딪혔으니 정전된 게 당연하지.', domain: '돌발' },
  ],
  'pt7-3': [
    { en: "I'd rather take the longer, easier path.", ko: '차라리 더 길고 쉬운 길로 가겠어.', domain: '여행' },
    { en: "I'd rather finish this now than rush it tomorrow.", ko: '내일 급하게 하느니 차라리 지금 끝내겠어.', domain: '회사' },
    { en: "I'd rather talk it out than stay upset all night.", ko: '밤새 속상해하느니 차라리 얘기로 풀겠어.', domain: '인간관계' },
    { en: "I'd rather cook at home than wait for a table.", ko: '자리 기다리느니 차라리 집에서 해 먹겠어.', domain: '생활' },
    { en: "I'd rather be safe and wait for the storm to pass.", ko: '그냥 안전하게 폭풍이 지나갈 때까지 기다리겠어.', domain: '돌발' },
  ],
  'pt7-4': [
    { en: 'We ended up staying there for a whole hour.', ko: '결국 거기서 한 시간이나 머물게 됐어.', domain: '여행' },
    { en: 'I ended up staying late to fix the last few bugs.', ko: '마지막 버그 몇 개 고치느라 결국 늦게까지 남게 됐어.', domain: '회사' },
    { en: 'We ended up missing the train and taking a taxi.', ko: '결국 기차를 놓쳐서 택시를 타게 됐어.', domain: '여행' },
    { en: 'We ended up talking for hours about everything.', ko: '결국 우리는 온갖 얘기를 몇 시간이나 하게 됐어.', domain: '인간관계' },
    { en: 'I ended up calling a locksmith after losing my keys.', ko: '열쇠를 잃어버려서 결국 열쇠공을 부르게 됐어.', domain: '돌발' },
  ],
  'pt7-5': [
    { en: 'Can you take a photo of me?', ko: '내 사진 좀 찍어줄 수 있어?', domain: '여행' },
    { en: 'Can you send me the latest version of the file?', ko: '파일 최신 버전 좀 보내줄 수 있어?', domain: '회사' },
    { en: 'Can you tell me which way the station is?', ko: '역이 어느 쪽인지 알려줄 수 있어?', domain: '여행' },
    { en: 'Can you keep this between us for now?', ko: '이거 당분간 우리끼리만 알고 있어 줄 수 있어?', domain: '인간관계' },
    { en: 'Can you give me a hand with this for a second?', ko: '이거 잠깐만 좀 도와줄 수 있어?', domain: '돌발' },
  ],

  // ── Story 8 · 부탁과 제안 ──────────────────────────────────────────────
  'pt8-1': [
    { en: 'Could you give us a table by the window?', ko: '창가 자리로 주실 수 있나요?', domain: '여행' },
    { en: 'Could you go over this part one more time for me?', ko: '이 부분 한 번만 더 짚어주실 수 있나요?', domain: '회사' },
    { en: 'Could you let me know when we reach my stop?', ko: '제 정류장에 도착하면 알려주실 수 있나요?', domain: '여행' },
    { en: 'Could you give me a moment to think it over?', ko: '잠깐 생각해 볼 시간을 주실 수 있나요?', domain: '인간관계' },
    { en: 'Could you call an ambulance? Someone just collapsed.', ko: '구급차 좀 불러주실 수 있나요? 방금 누가 쓰러졌어요.', domain: '돌발' },
  ],
  'pt8-2': [
    { en: "I'd like to try the seafood pasta.", ko: '해산물 파스타를 먹어보고 싶은데요.', domain: '여행' },
    { en: "I'd like to go over the schedule before we wrap up.", ko: '마무리하기 전에 일정을 한번 짚고 싶은데요.', domain: '회사' },
    { en: "I'd like to check in early if a room is ready.", ko: '방이 준비됐으면 일찍 체크인하고 싶은데요.', domain: '여행' },
    { en: "I'd like to make it up to you somehow.", ko: '어떻게든 너한테 만회하고 싶은데.', domain: '인간관계' },
    { en: "I'd like to report a problem with my room, please.", ko: '제 방에 문제가 있어서 알리고 싶은데요.', domain: '돌발' },
  ],
  'pt8-3': [
    { en: "Why don't we share a dessert?", ko: '우리 디저트 하나 나눠 먹는 게 어때?', domain: '인간관계' },
    { en: "Why don't we pick this up again after lunch?", ko: '우리 점심 먹고 다시 이어서 하는 게 어때?', domain: '회사' },
    { en: "Why don't we walk instead of waiting for a cab?", ko: '택시 기다리지 말고 우리 걷는 게 어때?', domain: '여행' },
    { en: "Why don't we stay in and watch a movie tonight?", ko: '오늘 밤은 집에서 영화나 보는 게 어때?', domain: '생활' },
    { en: "Why don't we split up to find them faster?", ko: '더 빨리 찾게 우리 흩어지는 게 어때?', domain: '돌발' },
  ],
  'pt8-4': [
    { en: 'Would you mind turning on your phone light?', ko: '핸드폰 불빛 좀 켜줄 수 있어요?', domain: '여행' },
    { en: 'Would you mind taking notes during the call?', ko: '통화하는 동안 메모 좀 해줄 수 있어요?', domain: '회사' },
    { en: 'Would you mind watching my bag for a minute?', ko: '잠깐만 제 가방 좀 봐줄 수 있어요?', domain: '여행' },
    { en: 'Would you mind giving us a moment alone?', ko: '저희 잠깐 둘이 있게 해줄 수 있어요?', domain: '인간관계' },
    { en: "Would you mind moving your car? You're blocking the exit.", ko: '차 좀 빼주실 수 있어요? 출구를 막고 계세요.', domain: '돌발' },
  ],
  'pt8-5': [
    { en: 'Is it okay if I leave a little early?', ko: '조금 일찍 가도 괜찮아?', domain: '회사' },
    { en: 'Is it okay if I push our meeting to three?', ko: '우리 회의를 3시로 미뤄도 괜찮아?', domain: '회사' },
    { en: 'Is it okay if we check out an hour later?', ko: '한 시간 늦게 체크아웃해도 괜찮아?', domain: '여행' },
    { en: 'Is it okay if I bring a friend along tonight?', ko: '오늘 밤 친구 한 명 데려가도 괜찮아?', domain: '인간관계' },
    { en: 'Is it okay if I borrow your phone? Mine just died.', ko: '폰 좀 빌려도 괜찮아? 내 거 방금 꺼졌어.', domain: '돌발' },
  ],

  // ── Story 9 · 질문하기 ─────────────────────────────────────────────────
  'pt9-1': [
    { en: 'Make sure you bring your passport.', ko: '여권 꼭 챙겨.', domain: '여행' },
    { en: 'Make sure you cc me on that email to the client.', ko: '고객한테 보내는 그 이메일에 나 꼭 참조 넣어.', domain: '회사' },
    { en: 'Make sure you keep your boarding pass somewhere handy.', ko: '탑승권 꼭 잘 챙겨둬.', domain: '여행' },
    { en: 'Make sure you text me when you get home safe.', ko: '집에 잘 도착하면 꼭 문자해.', domain: '인간관계' },
    { en: 'Make sure you unplug everything before the storm hits.', ko: '폭풍 오기 전에 꼭 다 코드 뽑아둬.', domain: '돌발' },
  ],
  'pt9-2': [
    { en: 'Do you prefer the beach or the old town?', ko: '너는 해변이 좋아, 아니면 구시가지가 좋아?', domain: '여행' },
    { en: 'Do you have a few minutes to go over this?', ko: '이거 잠깐 같이 볼 시간 있어?', domain: '회사' },
    { en: 'Do you know if this place takes credit cards?', ko: '여기 카드 받는지 알아?', domain: '여행' },
    { en: 'Do you ever think about how we first met?', ko: '우리 처음 어떻게 만났는지 가끔 생각해?', domain: '인간관계' },
    { en: 'Do you smell something burning in the kitchen?', ko: '부엌에서 뭔가 타는 냄새 안 나?', domain: '돌발' },
  ],
  'pt9-3': [
    { en: 'Have you ever tried fresh oysters?', ko: '신선한 굴 먹어본 적 있어?', domain: '여행' },
    { en: 'Have you ever worked with this client before?', ko: '전에 이 고객이랑 일해본 적 있어?', domain: '회사' },
    { en: 'Have you ever traveled somewhere completely on your own?', ko: '완전히 혼자서 어딘가 여행해 본 적 있어?', domain: '여행' },
    { en: 'Have you ever just told someone exactly how you feel?', ko: '누군가한테 네 감정을 있는 그대로 말해본 적 있어?', domain: '인간관계' },
    { en: 'Have you ever had your card declined at the worst time?', ko: '하필 가장 곤란할 때 카드 거절당해 본 적 있어?', domain: '돌발' },
  ],
  'pt9-4': [
    { en: 'Do you know a good place to stay there?', ko: '거기 묵을 만한 좋은 곳 알아?', domain: '여행' },
    { en: "Do you know who's leading the project now?", ko: '지금 누가 그 프로젝트를 맡고 있는지 알아?', domain: '회사' },
    { en: 'Do you know how far the station is from here?', ko: '여기서 역까지 얼마나 먼지 알아?', domain: '여행' },
    { en: 'Do you know what would actually cheer her up?', ko: '그녀를 진짜로 기분 좋게 할 게 뭔지 알아?', domain: '인간관계' },
    { en: 'Do you know where the nearest pharmacy is?', ko: '가장 가까운 약국이 어디 있는지 알아?', domain: '돌발' },
  ],
  'pt9-5': [
    { en: 'What if we leave on Friday night instead?', ko: '차라리 금요일 밤에 떠나면 어떨까?', domain: '여행' },
    { en: 'What if we tried a totally different approach here?', ko: '여기서 완전히 다른 방식을 시도해 보면 어떨까?', domain: '회사' },
    { en: "What if the hotel can't find our reservation?", ko: '호텔에서 우리 예약을 못 찾으면 어떡하지?', domain: '여행' },
    { en: 'What if we just talked about it over dinner?', ko: '우리 그냥 저녁 먹으면서 얘기해 보면 어떨까?', domain: '인간관계' },
    { en: 'What if we get stuck out here after dark?', ko: '어두워진 뒤에 여기 발이 묶이면 어떡하지?', domain: '돌발' },
  ],

  // ── Story 10 · 감정 표현 ───────────────────────────────────────────────
  'pt10-1': [
    { en: 'What do you think about my decision?', ko: '내 결정에 대해 어떻게 생각해?', domain: '인간관계' },
    { en: 'What do you think about pushing the launch to next month?', ko: '출시를 다음 달로 미루는 거 어떻게 생각해?', domain: '회사' },
    { en: 'What do you think about renting bikes for the day?', ko: '하루 동안 자전거 빌리는 거 어떻게 생각해?', domain: '여행' },
    { en: 'What do you think about repainting the living room?', ko: '거실 다시 칠하는 거 어떻게 생각해?', domain: '생활' },
    { en: 'What do you think about leaving before the storm starts?', ko: '폭풍 시작되기 전에 떠나는 거 어떻게 생각해?', domain: '돌발' },
  ],
  'pt10-2': [
    { en: 'I wonder what my new life will be like.', ko: '내 새로운 삶이 어떨지 궁금해.', domain: '인간관계' },
    { en: "I wonder how they'll react to the new plan.", ko: '그들이 새 계획에 어떻게 반응할지 궁금해.', domain: '회사' },
    { en: 'I wonder if the view is worth the early hike.', ko: '그 풍경이 이른 등산을 할 만한 가치가 있을지 궁금해.', domain: '여행' },
    { en: 'I wonder if he even remembers that day.', ko: '그가 그날을 기억이나 하는지 궁금해.', domain: '인간관계' },
    { en: "I wonder what's taking the ambulance so long.", ko: '구급차가 왜 이렇게 오래 걸리는지 궁금해.', domain: '돌발' },
  ],
  'pt10-3': [
    { en: "I can't wait to decorate my own little apartment.", ko: '내 작은 아파트를 꾸밀 게 너무 기대돼.', domain: '생활' },
    { en: "I can't wait to finally wrap up this project.", ko: '이 프로젝트를 드디어 끝내는 게 너무 기대돼.', domain: '회사' },
    { en: "I can't wait to see the sunset from the harbor.", ko: '항구에서 보는 노을이 너무 기대돼.', domain: '여행' },
    { en: "I can't wait to introduce you to my family.", ko: '너를 우리 가족한테 소개하는 게 너무 기대돼.', domain: '인간관계' },
    { en: "I can't wait for this long week to finally be over.", ko: '이 긴 한 주가 드디어 끝나는 게 너무 기대돼.', domain: '돌발' },
  ],
  'pt10-4': [
    { en: "I'm glad my family supports me so much.", ko: '가족이 나를 이렇게 응원해줘서 다행이야.', domain: '인간관계' },
    { en: "I'm glad we caught that mistake before sending it out.", ko: '보내기 전에 그 실수를 잡아서 다행이야.', domain: '회사' },
    { en: "I'm glad we booked the hotel ahead of time.", ko: '호텔을 미리 예약해 둬서 다행이야.', domain: '여행' },
    { en: "I'm glad you made it home before the rain started.", ko: '비 오기 전에 집에 도착해서 다행이야.', domain: '생활' },
    { en: "I'm glad everyone got out of the building safely.", ko: '모두 건물에서 무사히 나와서 다행이야.', domain: '돌발' },
  ],
  'pt10-5': [
    { en: "I'm worried about making new friends.", ko: '새 친구를 사귀는 게 걱정돼.', domain: '인간관계' },
    { en: "I'm worried about finishing everything before the deadline.", ko: '마감 전에 다 끝낼 수 있을지 걱정돼.', domain: '회사' },
    { en: "I'm worried about missing our connection with this delay.", ko: '이 지연 때문에 환승을 놓칠까 봐 걱정돼.', domain: '여행' },
    { en: "I'm worried about how she's been doing lately.", ko: '그녀가 요즘 어떻게 지내는지 걱정돼.', domain: '인간관계' },
    { en: "I'm worried about driving home in this heavy fog.", ko: '이 짙은 안개 속에서 집까지 운전하는 게 걱정돼.', domain: '돌발' },
  ],
}

/** patternId로 연습 예문 5개를 반환 (없으면 빈 배열) */
export function getPatternExamples(patternId: string): PracticeExample[] {
  return patternExamples[patternId] ?? []
}
