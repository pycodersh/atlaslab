# PATTO Content Style Guide (v2 · Gold Standard)

> 이 문서는 PATTO의 **콘텐츠 품질 기준(Standard)** 이다.
> 앞으로 제작되는 모든 Pattern · Example · Story · 이미지 · 음성은 이 가이드를 따른다.
>
> 핵심 원칙: **양보다 품질.**
> PATTO는 새로운 콘텐츠를 계속 쏟아내는 앱이 아니라,
> **핵심 Pattern을 반복하여 자동화하는 영어 학습 플랫폼**이다.

---

## ★ Gold Standard 50 (기준 콘텐츠)

현재 확정된 **Pattern 50 · Example 250 · Story 10**이 PATTO의 Gold Standard다.
앞으로 만들 100 / 500 / 1000 / 4000개의 모든 콘텐츠는 이 50개를 기준으로 확장한다.

목표 수준: **"이 50개만 반복해도 영어 실력이 눈에 띄게 좋아진다."**

### Pattern 통과 기준 (1주일 테스트)
모든 Pattern은 다음 질문에 YES여야 한다.

> **"원어민이 일주일 안에 실제로 사용할 가능성이 높은가?"**

YES가 아니면 수정한다. 교과서 영어가 아니라 **실제 회화**를 우선한다.
(중복·저빈도·문법 중심 패턴은 제거. Pattern은 한 번 확정되면 ID가 고정되므로 신중히.)

### 톤·스타일 통일
50개가 한 권의 책처럼 일관되도록 — 문장 길이, 어휘 수준, 대화 톤,
Story 스타일, Example 스타일을 모두 일정하게 유지한다.

---

## 0. 제작 순서 (가장 중요)

```
Pattern 선정  →  Example 5개 확정  →  Story 제작
```

- **Story를 위해 Pattern을 만들지 않는다. Pattern을 위해 Story를 만든다.**
- Example이 먼저 확정되고, Story는 그 핵심 Example들이 자연스럽게 녹아드는 Context로 작성한다.
- Story의 역할은 "정보 전달"이 아니라 **Pattern을 기억하게 만드는 것**이다.

Phase 1 목표: **Pattern 50 · Example 250 · Story 10.**

---

## 1. Pattern 선정 기준

핵심 Pattern은 한 번 확정되면 **바뀌지 않는 핵심 데이터**다. 신중하게 선정한다.

- **사용 빈도 최우선**: 원어민이 실제 회화에서 매우 자주 쓰는 표현
- **회화 중심**: 문어체·시험 영어가 아니라 말로 하는 표현
- **문법보다 빈도**: 문법 카테고리를 채우기 위한 패턴 금지
- **중복 제거**: 의미·기능이 겹치는 패턴은 하나만
- **난이도 순 배치**: 쉬운 표현 → 어려운 표현 순서로 50개를 배열
- **자기완결성**: 패턴 하나가 하나의 명확한 의사소통 기능을 가져야 함

PATTO Level 1 Top 50은 다음 흐름으로 난이도 순 배열한다 (Story 1→10, 각 5개):

| 그룹 | 기능 | 예 |
|---|---|---|
| 1 새로운 시작 | 의도·생각 | I want to ~ / I'm thinking about ~ |
| 2 나를 만드는 시간 | 계획·회상 | I'm planning to ~ / I used to ~ |
| 3 일상의 기초 | 필수 일상 | I have to ~ / Let me ~ / Thank you for ~ |
| 4 계획과 준비 | 능력·상태 | I can ~ / I keep ~ing / I'm supposed to ~ |
| 5 생각과 느낌 | 의지·감각 | I'm going to ~ / I think ~ / I feel like ~ |
| 6 판단과 의견 | 판단·태도 | I'm not sure ~ / It depends on ~ / Even though ~ |
| 7 조건과 결과 | 논리·결과 | As long as ~ / No wonder ~ / I'd rather ~ |
| 8 부탁과 제안 | 요청·제안 | Could you ~? / Why don't we ~? / Would you mind ~? |
| 9 질문하기 | 질문 | Do you ~? / Have you ever ~? / What if ~? |
| 10 감정 표현 | 감정 | I can't wait to ~ / I'm glad ~ / I'm worried about ~ |

> 패턴 추가·교체 시 반드시 위 기준을 통과해야 하며, 기존 50개의 `patternId`(pt{story}-{n})는 학습 기록·복습 데이터의 키이므로 변경하지 않는다.

---

## 2. Example 작성 기준

각 Pattern마다 Example 5개를 만든다. **예문 하나하나가 실제 회화에서 바로 쓸 수 있는 문장**이어야 한다.

### 필수 원칙
- 원어민이 실제로 자연스럽게 쓰는 문장
- 생활에서 자주 등장하는 상황
- 단순 나열형("I want to eat.")이 아니라 **대화에서 통째로 쓸 수 있는 문장**
- 패턴이 문장 안에서 자연스럽게 드러나야 함 (억지로 끼워 넣지 않는다)
- 한국어 번역은 직역이 아니라 **실제로 그렇게 말하는 자연스러운 한국어**

### 5개 영역 골고루 (가능한 한)
한 패턴의 5개 예문은 다음 영역을 고르게 포함한다:

| 태그 | 영역 | 설명 |
|---|---|---|
| `생활` | 일상 | 집·식사·루틴 등 매일의 상황 |
| `회사` | 업무 | 회의·동료·마감 등 직장 상황 |
| `여행` | 이동·여행 | 공항·식당·길찾기·예약 |
| `인간관계` | 관계 | 친구·가족·연인·사과·감사 |
| `돌발` | 돌발상황 | 예상 못한 문제·부탁·긴급 |

- 첫 번째 예문(`index 0`)은 해당 **Story에 등장하는 대표 예문**이다 (Context와 연결).
- 나머지 4개는 다른 영역을 채워 5개가 서로 다른 장면을 보여주도록 한다.
- 영역이 자연스럽지 않으면 억지로 맞추지 말고 **자연스러움을 우선**한다.

데이터: `data/pattern-examples.ts` — `{ en, ko, domain }`.

---

## 3. Story 작성 기준

Story는 Pattern·Example을 설명하기 위한 **Context**다.

- 하나의 구체적인 장면(장소·시간·인물)을 가진다 — 추상적 설명문 금지
- 5개 단락, 각 단락에 패턴 1개가 자연스럽게 녹아든다
- **해당 Story의 핵심 Example이 본문에 그대로 등장**해야 한다 (대표 예문 = Example index 0)
- 영어 본문 + 자연스러운 한국어 번역 + keyExpressions 제공
- 감정의 흐름이 있는, 짧지만 여운이 있는 이야기 (storyNote로 마무리)
- 분량: 단락당 2~3문장, 학습자가 1~2분 안에 읽을 수 있는 길이

데이터: `data/magazine-stories.ts` (MagazineStory).

---

## 4. 이미지 선정 기준

각 Story는 **무료 라이선스 이미지(Unsplash) 4장**을 슬라이드로 사용한다.

- **Story 제목이 아니라 Story 전체 내용을 기준으로 선택**한다
- 장소 · 상황 · 인물 · 분위기 · 행동이 본문과 연결되어야 함
- 4장은 한 주제 안에서 자연스럽게 이어지도록 (한 장면의 흐름)
- 추상적 이미지보다 **실제 상황을 보여주는 구체적 사진** 우선
- 예: 카페 스토리 → 카페 내부 / 커피잔 / 두 사람 대화 / 카페 분위기
- AI 생성 이미지는 사용하지 않는다 (비용·일관성). 검증된 Unsplash 정적 URL만 사용
- 추가 전 URL이 실제 응답하는지(HTTP 200) 확인한다

데이터: `MagazineStory.slideImages` (`status: 'ready'`).

---

## 5. 음성 스타일 기준

Story와 Example은 **실제 대화 느낌의 자연스러운 보이스**를 목표로 한다.

- 성우 낭독 톤이 아니라 **일상 대화 톤**
- Story마다 주인공의 성별·상황에 맞는 `narratorVoice`를 지정 (미국/영국 · 남/녀)
- 설명문(내레이션)은 차분하게, 대화문은 화자에 맞춰 (가능 시 `partnerVoice` 활용)
- **브라우저 기본 TTS에 의존하지 않는다.** 현재는 사전 생성 MP3(Supabase) → 없으면 브라우저 폴백 구조
- 향후 **고품질 음성 DB로 교체 가능**하도록 구조를 유지한다
  - 파일 경로 규칙: `story-{id}-{para}-{voice}.mp3`, `pattern-{patternId}-ex{n}-{voice}.mp3`
  - TTS 추상화: `lib/tts` (`ITTSProvider`) — provider만 교체하면 음원 소스 전환

---

## 6. 문장 길이 기준

- Example: **평균 8~15단어**. 너무 짧지도(<6) 너무 길지도(>18) 않게
- 단, Story 대표 예문(index 0)은 Context 우선이라 더 짧을 수 있다
- Story 단락: 문장당 8~16단어, 단락당 2~3문장
- 한 문장은 한 가지 정보만 — 접속사로 무리하게 잇지 않는다

---

## 7. 생활 어휘 사용 기준

- 일상에서 실제로 쓰는 **고빈도 생활 어휘** 사용
- 시험용·문어체 단어("commence", "utilize", "endeavor") 지양 → "start", "use", "try"
- 추상명사 나열보다 **구체적인 사물·행동·상황**
- 학습자가 오늘 바로 쓸 수 있는 단어 위주 (Level 1 기준 CEFR A2~B1)
- 고유명사는 최소화하고, 쓸 경우 보편적인 것(Busan, the airport)만
- **단어장을 따로 만들지 않는다.** 생활 어휘는 Example 안에서 자연스럽게 반복 학습되게 한다.

권장 생활 어휘 풀 (Example에 적극 활용):
`receipt, landlord, groceries, appointment, parking, sink, package, reservation,
schedule, charger, refund, deposit, leftovers, umbrella, elevator, pharmacy,
invoice, boarding pass, rental car, dentist, spare key, mechanic, plumber,
checkout, ATM, takeout, delivery, shift, haircut, rent, suitcase` 등.

---

## 8. 이디엄(관용구) 사용 기준

- **이디엄은 절제해서 사용**한다. Level 1에서는 직관적으로 이해되는 것만
- 허용: 의미가 투명하고 매우 흔한 표현 — "grab a coffee", "give me a hand", "keep an eye on", "make it on time", "get the hang of", "swing by", "heads-up", "catch up"
- 지양: 비유가 강해 직역이 막히는 표현 — "break the ice", "hit the sack", "under the weather", "cost an arm and a leg"
- 슬랭·비속어·지나친 구어 축약("gonna", "wanna")은 본문 표기에서 지양 (음성에서 자연 발화는 허용)
- 이디엄을 쓸 경우, 한국어 번역은 **뜻이 통하는 자연스러운 의역**으로 제공
- 자연스러운 **회화 응답 표현**도 적절히 (억지로 X, 실제 빈도 우선):
  "Sounds good", "No worries", "Here you go", "It's up to you", "I'm all set",
  "That makes sense", "Hang on", "I guess"

---

## 부록. 품질 체크리스트 (예문 1개 기준)

- [ ] 원어민이 실제로 이렇게 말하는가?
- [ ] 8~15단어인가? (대표 예문 제외)
- [ ] 패턴이 자연스럽게 드러나는가?
- [ ] 5개 영역 중 어디에 속하는가? (생활/회사/여행/인간관계/돌발)
- [ ] 같은 패턴의 다른 예문과 장면이 겹치지 않는가?
- [ ] 한국어 번역이 직역이 아니라 실제 말투인가?
- [ ] 시험용·문어체 단어를 쓰지 않았는가?
- [ ] 오늘 당장 대화에서 쓸 수 있는가?
