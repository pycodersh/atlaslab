# K-PATTO Pattern Popup 감사 보고서

생성일시: 2026-08-01T04:18:56.941Z
스크립트 기준: kpatto_scripts_confirmed.md (v2 최종)
DB 테이블: kp_expressions (팝업 데이터) + kp_dialogue_expressions (에피소드 연결)

---

## 요약 통계

| 항목 | 수 |
|------|-----|
| 스크립트 Focus Pattern 총 수 | 298 |
| DB focus 팝업 총 수 | 288 |
| 완전 일치 (exact) | 244 |
| 표기 차이 (~ 유무 등) | 0 |
| 패턴 의미 다름 | 0 |
| DB에 없음 (누락) | 54 |
| 스크립트에 없는 DB 항목 | 43 |
| 중복 DB 항목 | 0 |
| Literal 누락 | 0 |
| Usage 누락 | 1 |
| Examples 누락 | 1 |
| 팝업 정보 완전한 항목 | 243 |

---

## 실제 화면 데이터 출처 및 우선순위

```
kp_dialogue_expressions (role=focus) → expression_id 획득
       ↓
kp_expressions.id → english / description / examples 렌더링 (ExpressionPopup.tsx)
       ↓
kpatto-popup-patterns.ts → 로컬 파일 (현재 앱에서 import 안 함, DB seed 준비용)

우선순위: DB kp_expressions 단독 (fallback 없음)
```

---

## 에피소드별 비교

### EP01

스크립트 Focus Patterns: `~뭐예요? / ~주세요 / ~있어요?`

#### 패턴: `~뭐예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 771  |  **DB korean**: `~뭐예요?`
- **연결 에피소드**: EP01, EP03
- **Literal**: What is ~?
- **Usage**: Used to ask what something is when you don't know its name or identity.
- **Examples**: 3개 ✅

#### 패턴: `~주세요`

- **상태**: ✅ 완전 일치
- **DB id**: 770  |  **DB korean**: `~주세요`
- **연결 에피소드**: EP01, EP02
- **Literal**: Give me ~, please.
- **Usage**: Used to politely request something or place an order.
- **Examples**: 3개 ✅

#### 패턴: `~있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 772  |  **DB korean**: `~있어요?`
- **연결 에피소드**: EP01
- **Literal**: Is there ~? / Do you have ~?
- **Usage**: Used to ask whether something exists or is available.
- **Examples**: 3개 ✅

### EP02

스크립트 Focus Patterns: `~가고 싶어요 / ~어떻게 가요? / ~어디서 타요?`

#### 패턴: `~가고 싶어요`

- **상태**: ✅ 완전 일치
- **DB id**: 774  |  **DB korean**: `~가고 싶어요`
- **연결 에피소드**: EP02
- **Literal**: I want to go to ~.
- **Usage**: Used to say that you want to go to a place.
- **Examples**: 3개 ✅

#### 패턴: `~어떻게 가요?`

- **상태**: ✅ 완전 일치
- **DB id**: 773  |  **DB korean**: `~어떻게 가요?`
- **연결 에피소드**: EP02
- **Literal**: How do I get to ~?
- **Usage**: Used to ask for directions to a place.
- **Examples**: 3개 ✅

#### 패턴: `~어디서 타요?`

- **상태**: ✅ 완전 일치
- **DB id**: 792  |  **DB korean**: `~어디서 타요?`
- **연결 에피소드**: 없음
- **Literal**: Where do I catch ~?
- **Usage**: Ask where to board a specific type of transport. Just place a noun before 어디서 타요…
- **Examples**: 3개 ✅

### EP03

스크립트 Focus Patterns: `~먹고 싶어요 / ~먹을 수 있어요? / ~못 먹어요`

#### 패턴: `~먹고 싶어요`

- **상태**: ✅ 완전 일치
- **DB id**: 793  |  **DB korean**: `~먹고 싶어요`
- **연결 에피소드**: EP03
- **Literal**: I want to eat ~
- **Usage**: Say what food you want to eat right now. Just place a noun before 먹고 싶어요 — no co…
- **Examples**: 3개 ✅

#### 패턴: `~먹을 수 있어요?`

- **DB**: 없음 ❌

#### 패턴: `~못 먹어요`

- **상태**: ✅ 완전 일치
- **DB id**: 794  |  **DB korean**: `~못 먹어요`
- **연결 에피소드**: EP03
- **Literal**: I can't eat ~
- **Usage**: Say what you cannot eat due to allergy or preference. Say what you need, then ad…
- **Examples**: 3개 ✅

### EP04

스크립트 Focus Patterns: `~로 할게요 / ~먹어도 돼요? / ~얼마나 걸려요?`

#### 패턴: `~로 할게요`

- **상태**: ✅ 완전 일치
- **DB id**: 776  |  **DB korean**: `~로 할게요`
- **연결 에피소드**: EP04, EP12
- **Literal**: I'll have ~
- **Usage**: Decide on one option when ordering or choosing. Just place a noun before 로 할게요 —…
- **Examples**: 3개 ✅

#### 패턴: `~먹어도 돼요?`

- **상태**: ✅ 완전 일치
- **DB id**: 795  |  **DB korean**: `~먹어도 돼요?`
- **연결 에피소드**: EP04
- **Literal**: Can I eat ~?
- **Usage**: Ask permission before eating something. Just place a noun before 먹어도 돼요 — no con…
- **Examples**: 3개 ✅

#### 패턴: `~얼마나 걸려요?`

- **상태**: ✅ 완전 일치
- **DB id**: 1235  |  **DB korean**: `~얼마나 걸려요?`
- **연결 에피소드**: EP04
- **Literal**: ~얼마나 걸려요?
- **Usage**: ❌ 없음
- **Examples**: 0개 ❌

### EP05

스크립트 Focus Patterns: `~해 본 적 있어요? / ~추천해 주세요 / ~주실 수 있어요?`

#### 패턴: `~해 본 적 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 777  |  **DB korean**: `~해 본 적 있어요?`
- **연결 에피소드**: EP05
- **Literal**: Have you ever ~?
- **Usage**: Ask if someone has ever experienced something before. It works in casual and pol…
- **Examples**: 3개 ✅

#### 패턴: `~추천해 주세요`

- **상태**: ✅ 완전 일치
- **DB id**: 778  |  **DB korean**: `~추천해 주세요`
- **연결 에피소드**: EP05, EP08
- **Literal**: Please recommend ~
- **Usage**: Ask someone to give you a recommendation. Just place a noun before 추천해 주세요 — no …
- **Examples**: 3개 ✅

#### 패턴: `~주실 수 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 779  |  **DB korean**: `~주실 수 있어요?`
- **연결 에피소드**: EP05
- **Literal**: Could you ~?
- **Usage**: Politely request someone to do something for you. Say what you need, then add 주실…
- **Examples**: 3개 ✅

### EP06

스크립트 Focus Patterns: `~좋아해요 / ~불러도 돼요? / 또 오고 싶어요`

#### 패턴: `~좋아해요`

- **상태**: ✅ 완전 일치
- **DB id**: 780  |  **DB korean**: `~좋아해요`
- **연결 에피소드**: EP06
- **Literal**: I like ~
- **Usage**: Say what you like or enjoy. Say what you need, then add 좋아해요 at the end. Common …
- **Examples**: 3개 ✅

#### 패턴: `~불러도 돼요?`

- **상태**: ✅ 완전 일치
- **DB id**: 796  |  **DB korean**: `~불러도 돼요?`
- **연결 에피소드**: EP06
- **Literal**: Can I call you ~?
- **Usage**: Ask permission to call someone by a certain name. Just place a noun before 불러도 돼…
- **Examples**: 3개 ✅

#### 패턴: `또 오고 싶어요`

- **상태**: ✅ 완전 일치
- **DB id**: 797  |  **DB korean**: `또 오고 싶어요`
- **연결 에피소드**: EP06, EP19
- **Literal**: I want to come here
- **Usage**: Say you'd like to come back to a place again. Just place a noun before 또 오고 싶어요 …
- **Examples**: 3개 ✅

### EP07

스크립트 Focus Patterns: `신기해요 / ~더 주세요 / ~깎아 주세요`

#### 패턴: `신기해요`

- **상태**: ✅ 완전 일치
- **DB id**: 781  |  **DB korean**: `신기해요`
- **연결 에피소드**: EP07
- **Literal**: This food is fascinating
- **Usage**: Express that something is surprisingly fascinating or unique. Say what you need,…
- **Examples**: 3개 ✅

#### 패턴: `~더 주세요`

- **상태**: ✅ 완전 일치
- **DB id**: 782  |  **DB korean**: `~더 주세요`
- **연결 에피소드**: 없음
- **Literal**: More ~, please
- **Usage**: Ask for more of something you already have. Just place a noun before 더 주세요 — no …
- **Examples**: 3개 ✅

#### 패턴: `~깎아 주세요`

- **상태**: ✅ 완전 일치
- **DB id**: 783  |  **DB korean**: `~깎아 주세요`
- **연결 에피소드**: 없음
- **Literal**: Discount on ~, please
- **Usage**: Politely ask for a lower price on something. Just place a noun before 깎아 주세요 — n…
- **Examples**: 3개 ✅

### EP08

스크립트 Focus Patterns: `~써봤어요? / ~아/어야 할지 모르겠어요 / ~어떤 게 좋아요?`

#### 패턴: `~써봤어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 784  |  **DB korean**: `~써봤어요?`
- **연결 에피소드**: EP08
- **Literal**: Have you tried ~?
- **Usage**: Ask if someone has ever tried using something. Say what you need, then add 써봤어요 …
- **Examples**: 3개 ✅

#### 패턴: `~아/어야 할지 모르겠어요`

- **DB**: 없음 ❌

#### 패턴: `~어떤 게 좋아요?`

- **상태**: ✅ 완전 일치
- **DB id**: 785  |  **DB korean**: `~어떤 게 좋아요?`
- **연결 에피소드**: EP08
- **Literal**: Which ~ is good?
- **Usage**: Ask which option someone prefers. It works in casual and polite speech alike. Co…
- **Examples**: 3개 ✅

### EP09

스크립트 Focus Patterns: `생각보다 ~해요 / 다 같이 있어서 좋아요 / 이미 ~해요`

#### 패턴: `생각보다 ~해요`

- **상태**: ✅ 완전 일치
- **DB id**: 786  |  **DB korean**: `생각보다 ~해요`
- **연결 에피소드**: EP09
- **Literal**: More ~ than expected
- **Usage**: Say something is more or less than you expected. It works in casual and polite s…
- **Examples**: 3개 ✅

#### 패턴: `다 같이 있어서 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 787  |  **DB korean**: `다 같이 있어서 좋아요`
- **연결 에피소드**: EP09
- **Literal**: I'm so happy we're all together
- **Usage**: Express happiness that everyone is gathered together. It works in casual and pol…
- **Examples**: 3개 ✅

#### 패턴: `이미 ~해요`

- **상태**: ✅ 완전 일치
- **DB id**: 788  |  **DB korean**: `이미 ~해요`
- **연결 에피소드**: 없음
- **Literal**: Already ~
- **Usage**: Say that something has already been done. It works in casual and polite speech a…
- **Examples**: 3개 ✅

### EP10

스크립트 Focus Patterns: `떨려요 / ~에서 왔어요 / 잘 부탁드려요`

#### 패턴: `떨려요`

- **상태**: ✅ 완전 일치
- **DB id**: 789  |  **DB korean**: `떨려요`
- **연결 에피소드**: EP10
- **Literal**: I'm so nervous
- **Usage**: Say you feel nervous or excited about something important. Just place a noun bef…
- **Examples**: 3개 ✅

#### 패턴: `~에서 왔어요`

- **상태**: ✅ 완전 일치
- **DB id**: 790  |  **DB korean**: `~에서 왔어요`
- **연결 에피소드**: EP10
- **Literal**: I'm from ~
- **Usage**: Say which country or city you come from. Just place a noun before 에서 왔어요 — no co…
- **Examples**: 3개 ✅

#### 패턴: `잘 부탁드려요`

- **상태**: ✅ 완전 일치
- **DB id**: 791  |  **DB korean**: `잘 부탁드려요`
- **연결 에피소드**: EP10
- **Literal**: Nice to meet you. Please
- **Usage**: Use when meeting someone to ask for their cooperation. Say what you need, then a…
- **Examples**: 3개 ✅

### EP11

스크립트 Focus Patterns: `~타요 / ~에서 내려요 / ~까지 가 주세요`

#### 패턴: `~타요`

- **상태**: ✅ 완전 일치
- **DB id**: 798  |  **DB korean**: `~타요`
- **연결 에피소드**: EP11
- **Literal**: ~타요
- **Usage**: Say which mode of transport you are taking. Just place a noun before 타요 — no con…
- **Examples**: 3개 ✅

#### 패턴: `~에서 내려요`

- **상태**: ✅ 완전 일치
- **DB id**: 799  |  **DB korean**: `~에서 내려요`
- **연결 에피소드**: EP11
- **Literal**: ~에서 내려요
- **Usage**: Say where you get off a bus or subway. Say what you need, then add 에서 내려요 at the…
- **Examples**: 3개 ✅

#### 패턴: `~까지 가 주세요`

- **상태**: ✅ 완전 일치
- **DB id**: 800  |  **DB korean**: `~까지 가 주세요`
- **연결 에피소드**: EP11
- **Literal**: ~까지 가 주세요
- **Usage**: Tell a driver where you want to be taken. Just place a noun before 까지 가 주세요 — no…
- **Examples**: 3개 ✅

### EP12

스크립트 Focus Patterns: `덜 ~게 해 주세요 / ~이/가 들어가 있어요? / ~리필 돼요?`

#### 패턴: `덜 ~게 해 주세요`

- **상태**: ✅ 완전 일치
- **DB id**: 801  |  **DB korean**: `덜 ~게 해 주세요`
- **연결 에피소드**: EP12
- **Literal**: 덜 ~게 해 주세요
- **Usage**: Ask for food to be prepared with less of a certain quality. It works in casual a…
- **Examples**: 3개 ✅

#### 패턴: `~이/가 들어가 있어요?`

- **DB**: 없음 ❌

#### 패턴: `~리필 돼요?`

- **상태**: ✅ 완전 일치
- **DB id**: 802  |  **DB korean**: `~리필 돼요?`
- **연결 에피소드**: EP12
- **Literal**: ~리필 돼요?
- **Usage**: Ask if a food or drink can be refilled for free. Just place a noun before 리필 돼요 …
- **Examples**: 3개 ✅

### EP13

스크립트 Focus Patterns: `~에 뭐 해요? / 같이 ~ㄹ래요? / 조금 늦을 것 같아요`

#### 패턴: `~에 뭐 해요?`

- **상태**: ✅ 완전 일치
- **DB id**: 803  |  **DB korean**: `~에 뭐 해요?`
- **연결 에피소드**: EP13
- **Literal**: ~에 뭐 해요?
- **Usage**: Ask what someone is doing at a time or place. Just place a noun before 에 뭐 해요 — …
- **Examples**: 3개 ✅

#### 패턴: `같이 ~ㄹ래요?`

- **상태**: ✅ 완전 일치
- **DB id**: 804  |  **DB korean**: `같이 ~ㄹ래요?`
- **연결 에피소드**: EP13
- **Literal**: 같이 ~ㄹ래요?
- **Usage**: Invite someone to do something together with you. It works in casual and polite …
- **Examples**: 3개 ✅

#### 패턴: `조금 늦을 것 같아요`

- **상태**: ✅ 완전 일치
- **DB id**: 805  |  **DB korean**: `조금 늦을 것 같아요`
- **연결 에피소드**: EP13
- **Literal**: 조금 늦을 것 같아요
- **Usage**: Tell someone you are going to be a little late. It works in casual and polite sp…
- **Examples**: 3개 ✅

### EP14

스크립트 Focus Patterns: `길을 잃었어요 / 쭉 가면 돼요 / ~으로 꺾으면 돼요`

#### 패턴: `길을 잃었어요`

- **상태**: ✅ 완전 일치
- **DB id**: 806  |  **DB korean**: `길을 잃었어요`
- **연결 에피소드**: EP14
- **Literal**: 길을 잃었어요
- **Usage**: Tell someone you are lost and need directions. It works in casual and polite spe…
- **Examples**: 3개 ✅

#### 패턴: `쭉 가면 돼요`

- **상태**: ✅ 완전 일치
- **DB id**: 807  |  **DB korean**: `쭉 가면 돼요`
- **연결 에피소드**: EP14
- **Literal**: 쭉 가면 돼요
- **Usage**: Tell someone to simply go straight ahead. Say what you need, then add 쭉 가면 돼요 at…
- **Examples**: 3개 ✅

#### 패턴: `~으로 꺾으면 돼요`

- **상태**: ✅ 완전 일치
- **DB id**: 808  |  **DB korean**: `~으로 꺾으면 돼요`
- **연결 에피소드**: EP14
- **Literal**: ~으로 꺾으면 돼요
- **Usage**: Tell someone which direction to turn. Just place a noun before 으로 꺾으면 돼요 — no co…
- **Examples**: 3개 ✅

### EP15

스크립트 Focus Patterns: `~봤어요? / 재미있어요 / 강추예요`

#### 패턴: `~봤어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 809  |  **DB korean**: `~봤어요?`
- **연결 에피소드**: EP15
- **Literal**: ~봤어요?
- **Usage**: Ask if someone has seen or watched something. Say what you need, then add 봤어요 at…
- **Examples**: 3개 ✅

#### 패턴: `재미있어요`

- **상태**: ✅ 완전 일치
- **DB id**: 810  |  **DB korean**: `재미있어요`
- **연결 에피소드**: EP15
- **Literal**: 재미있어요
- **Usage**: Say that something is fun or interesting. Say what you need, then add 재미있어요 at t…
- **Examples**: 3개 ✅

#### 패턴: `강추예요`

- **상태**: ✅ 완전 일치
- **DB id**: 811  |  **DB korean**: `강추예요`
- **연결 에피소드**: EP15
- **Literal**: 강추예요
- **Usage**: Strongly recommend something you found great. Say what you need, then add 강추예요 a…
- **Examples**: 3개 ✅

### EP16

스크립트 Focus Patterns: `~날씨 어때요? / ~올 것 같아요 / ~아/어야겠다`

#### 패턴: `~날씨 어때요?`

- **상태**: ✅ 완전 일치
- **DB id**: 812  |  **DB korean**: `~날씨 어때요?`
- **연결 에피소드**: EP16
- **Literal**: ~날씨 어때요?
- **Usage**: Ask about the weather in a place or at a time. Just place a noun before 날씨 어때요 —…
- **Examples**: 3개 ✅

#### 패턴: `~올 것 같아요`

- **상태**: ✅ 완전 일치
- **DB id**: 813  |  **DB korean**: `~올 것 같아요`
- **연결 에피소드**: EP16
- **Literal**: ~올 것 같아요
- **Usage**: Say it looks like rain, snow, or something is coming. Just place a noun before 올…
- **Examples**: 3개 ✅

#### 패턴: `~아/어야겠다`

- **DB**: 없음 ❌

### EP17

스크립트 Focus Patterns: `~이/가 아파요 / ~약 있어요? / 안 먹는 게 나아요`

#### 패턴: `~이/가 아파요`

- **DB**: 없음 ❌

#### 패턴: `~약 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 816  |  **DB korean**: `~약 있어요?`
- **연결 에피소드**: EP17
- **Literal**: ~약 있어요?
- **Usage**: Ask if there is medicine for a specific ailment. Just place a noun before 약 있어요 …
- **Examples**: 3개 ✅

#### 패턴: `안 먹는 게 나아요`

- **상태**: ✅ 완전 일치
- **DB id**: 817  |  **DB korean**: `안 먹는 게 나아요`
- **연결 에피소드**: EP17
- **Literal**: 안 먹는 게 나아요
- **Usage**: Advise that it is better not to eat something. Say what you need, then add 안 먹는 …
- **Examples**: 3개 ✅

### EP18

스크립트 Focus Patterns: `취미가 뭐예요? / 저도요 / ~별로예요`

#### 패턴: `취미가 뭐예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 818  |  **DB korean**: `취미가 뭐예요?`
- **연결 에피소드**: EP18
- **Literal**: 취미가 뭐예요?
- **Usage**: Ask someone what their hobby or interests are. It works in casual and polite spe…
- **Examples**: 3개 ✅

#### 패턴: `저도요`

- **상태**: ✅ 완전 일치
- **DB id**: 819  |  **DB korean**: `저도요`
- **연결 에피소드**: EP18
- **Literal**: 저도요
- **Usage**: Quickly agree by saying you feel the same way. It works in casual and polite spe…
- **Examples**: 3개 ✅

#### 패턴: `~별로예요`

- **상태**: ✅ 완전 일치
- **DB id**: 820  |  **DB korean**: `~별로예요`
- **연결 에피소드**: EP18
- **Literal**: ~별로예요
- **Usage**: Say something is not great or doesn't meet expectations. Say what you need, then…
- **Examples**: 3개 ✅

### EP19

스크립트 Focus Patterns: `여기서 유명한 게 뭐예요? / 같이 사진 찍어요 / 사진이 잘 나왔어요?`

#### 패턴: `여기서 유명한 게 뭐예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 821  |  **DB korean**: `여기서 유명한 게 뭐예요?`
- **연결 에피소드**: EP19
- **Literal**: 여기서 유명한 게 뭐예요?
- **Usage**: Ask what's famous or popular at a specific place. It works in casual and polite …
- **Examples**: 3개 ✅

#### 패턴: `같이 사진 찍어요`

- **상태**: ✅ 완전 일치
- **DB id**: 822  |  **DB korean**: `같이 사진 찍어요`
- **연결 에피소드**: EP19
- **Literal**: 같이 사진 찍어요
- **Usage**: Invite someone to take a photo together. Just place a noun before 같이 사진 찍어요 — no…
- **Examples**: 3개 ✅

#### 패턴: `사진이 잘 나왔어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 823  |  **DB korean**: `사진이 잘 나왔어요?`
- **연결 에피소드**: EP19
- **Literal**: 사진이 잘 나왔어요?
- **Usage**: Ask if the photo turned out well. It works in casual and polite speech alike. Co…
- **Examples**: 3개 ✅

### EP20

스크립트 Focus Patterns: `오랜만이에요 / 잘 지냈어요? / 다음에 또 봐요`

#### 패턴: `오랜만이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 824  |  **DB korean**: `오랜만이에요`
- **연결 에피소드**: EP20
- **Literal**: 오랜만이에요
- **Usage**: Greet someone you haven't seen in a while. It works in casual and polite speech …
- **Examples**: 3개 ✅

#### 패턴: `잘 지냈어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 825  |  **DB korean**: `잘 지냈어요?`
- **연결 에피소드**: EP20
- **Literal**: 잘 지냈어요?
- **Usage**: Ask someone how they've been doing. Just place a noun before 잘 지냈어요 — no conjuga…
- **Examples**: 3개 ✅

#### 패턴: `다음에 또 봐요`

- **상태**: ✅ 완전 일치
- **DB id**: 826  |  **DB korean**: `다음에 또 봐요`
- **연결 에피소드**: EP20
- **Literal**: 다음에 또 봐요
- **Usage**: A warm goodbye that leaves the door open to meet again. Say what you need, then …
- **Examples**: 3개 ✅

### EP21

스크립트 Focus Patterns: `~었어/았어 / ~어땠어? / 처음이었는데`

#### 패턴: `~었어/았어`

- **DB**: 없음 ❌

#### 패턴: `~어땠어?`

- **상태**: ✅ 완전 일치
- **DB id**: 828  |  **DB korean**: `~어땠어?`
- **연결 에피소드**: EP21
- **Literal**: ~어땠어?
- **Usage**: Casually ask how something was. Just place a noun before 어땠어 — no conjugation ne…
- **Examples**: 3개 ✅

#### 패턴: `처음이었는데`

- **상태**: ✅ 완전 일치
- **DB id**: 829  |  **DB korean**: `처음이었는데`
- **연결 에피소드**: EP21
- **Literal**: 처음이었는데
- **Usage**: Say 'it was my first time, but...' to describe a new experience. It works in cas…
- **Examples**: 3개 ✅

### EP22

스크립트 Focus Patterns: `~것 같아요 / ~나 봐요 / ~ㄹ/을 거야`

#### 패턴: `~것 같아요`

- **상태**: ✅ 완전 일치
- **DB id**: 830  |  **DB korean**: `~것 같아요`
- **연결 에피소드**: EP22
- **Literal**: ~것 같아요
- **Usage**: Softly express a guess or opinion with 'I think' or 'it seems.' Say what you nee…
- **Examples**: 3개 ✅

#### 패턴: `~나 봐요`

- **상태**: ✅ 완전 일치
- **DB id**: 831  |  **DB korean**: `~나 봐요`
- **연결 에피소드**: EP22
- **Literal**: ~나 봐요
- **Usage**: Make a casual inference: 'it seems like' or 'I guess.' Say what you need, then a…
- **Examples**: 3개 ✅

#### 패턴: `~ㄹ/을 거야`

- **DB**: 없음 ❌

### EP23

스크립트 Focus Patterns: `~해야 해 / ~하지 마 / ~잊지 마`

#### 패턴: `~해야 해`

- **상태**: ✅ 완전 일치
- **DB id**: 833  |  **DB korean**: `~해야 해`
- **연결 에피소드**: EP23
- **Literal**: ~해야 해
- **Usage**: Say you have to or must do something. Just place a noun before 해야 해 — no conjuga…
- **Examples**: 3개 ✅

#### 패턴: `~하지 마`

- **상태**: ✅ 완전 일치
- **DB id**: 834  |  **DB korean**: `~하지 마`
- **연결 에피소드**: EP23
- **Literal**: ~하지 마
- **Usage**: Tell someone not to do something, casually. Just place a noun before 하지 마 — no c…
- **Examples**: 3개 ✅

#### 패턴: `~잊지 마`

- **상태**: ✅ 완전 일치
- **DB id**: 835  |  **DB korean**: `~잊지 마`
- **연결 에피소드**: EP23
- **Literal**: ~잊지 마
- **Usage**: Remind someone not to forget something important. Just place a noun before 잊지 마 …
- **Examples**: 3개 ✅

### EP24

스크립트 Focus Patterns: `~어떻게 생각해요? / 맞는 말이에요 / 저는 좀 달라요`

#### 패턴: `~어떻게 생각해요?`

- **상태**: ✅ 완전 일치
- **DB id**: 836  |  **DB korean**: `~어떻게 생각해요?`
- **연결 에피소드**: EP24
- **Literal**: ~어떻게 생각해요?
- **Usage**: Ask for someone's opinion on a specific topic. Say what you need, then add 어떻게 생…
- **Examples**: 3개 ✅

#### 패턴: `맞는 말이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 837  |  **DB korean**: `맞는 말이에요`
- **연결 에피소드**: EP24
- **Literal**: 맞는 말이에요
- **Usage**: Agree with and validate what someone just said. It works in casual and polite sp…
- **Examples**: 3개 ✅

#### 패턴: `저는 좀 달라요`

- **상태**: ✅ 완전 일치
- **DB id**: 838  |  **DB korean**: `저는 좀 달라요`
- **연결 에피소드**: 없음
- **Literal**: 저는 좀 달라요
- **Usage**: Politely say you're a bit different or have your own preference. It works in cas…
- **Examples**: 3개 ✅

### EP25

스크립트 Focus Patterns: `~에 가 봤어요? / 꼭 가 보세요 / 언제 시간 돼요?`

#### 패턴: `~에 가 봤어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 839  |  **DB korean**: `~에 가 봤어요?`
- **연결 에피소드**: EP25
- **Literal**: ~에 가 봤어요?
- **Usage**: Ask if someone has ever visited a particular place. Just place a noun before 에 가…
- **Examples**: 3개 ✅

#### 패턴: `꼭 가 보세요`

- **상태**: ✅ 완전 일치
- **DB id**: 840  |  **DB korean**: `꼭 가 보세요`
- **연결 에피소드**: EP25
- **Literal**: 꼭 가 보세요
- **Usage**: Strongly recommend that someone visit a place. Say what you need, then add 꼭 가 보…
- **Examples**: 3개 ✅

#### 패턴: `언제 시간 돼요?`

- **상태**: ✅ 완전 일치
- **DB id**: 841  |  **DB korean**: `언제 시간 돼요?`
- **연결 에피소드**: EP25
- **Literal**: 언제 시간 돼요?
- **Usage**: Ask when someone is free or available to meet. It works in casual and polite spe…
- **Examples**: 3개 ✅

### EP26

스크립트 Focus Patterns: `요즘 뭐 봐요? / 완전 빠져들었어요 / 다음 화가 기대돼요`

#### 패턴: `요즘 뭐 봐요?`

- **상태**: ✅ 완전 일치
- **DB id**: 842  |  **DB korean**: `요즘 뭐 봐요?`
- **연결 에피소드**: EP26
- **Literal**: 요즘 뭐 봐요?
- **Usage**: Ask what shows or content someone is watching these days. It works in casual and…
- **Examples**: 3개 ✅

#### 패턴: `완전 빠져들었어요`

- **상태**: ✅ 완전 일치
- **DB id**: 843  |  **DB korean**: `완전 빠져들었어요`
- **연결 에피소드**: EP26
- **Literal**: 완전 빠져들었어요
- **Usage**: Say you're totally hooked or obsessed with something. Say what you need, then ad…
- **Examples**: 3개 ✅

#### 패턴: `다음 화가 기대돼요`

- **상태**: ✅ 완전 일치
- **DB id**: 844  |  **DB korean**: `다음 화가 기대돼요`
- **연결 에피소드**: EP26
- **Literal**: 다음 화가 기대돼요
- **Usage**: Express excitement and anticipation for the next episode. It works in casual and…
- **Examples**: 3개 ✅

### EP27

스크립트 Focus Patterns: `이 노래 알아요? / 가사가 무슨 뜻이에요? / 중독성 있어요`

#### 패턴: `이 노래 알아요?`

- **상태**: ✅ 완전 일치
- **DB id**: 845  |  **DB korean**: `이 노래 알아요?`
- **연결 에피소드**: EP27
- **Literal**: 이 노래 알아요?
- **Usage**: Ask if someone knows or recognizes a particular song. It works in casual and pol…
- **Examples**: 3개 ✅

#### 패턴: `가사가 무슨 뜻이에요?`

- **상태**: ✅ 완전 일치
- **DB id**: 846  |  **DB korean**: `가사가 무슨 뜻이에요?`
- **연결 에피소드**: EP27
- **Literal**: 가사가 무슨 뜻이에요?
- **Usage**: Ask what a song's lyrics mean. Say what you need, then add 가사가 무슨 뜻이에요 at the en…
- **Examples**: 3개 ✅

#### 패턴: `중독성 있어요`

- **상태**: ✅ 완전 일치
- **DB id**: 847  |  **DB korean**: `중독성 있어요`
- **연결 에피소드**: EP27
- **Literal**: 중독성 있어요
- **Usage**: Say something is catchy or impossible to stop enjoying. Say what you need, then …
- **Examples**: 3개 ✅

### EP28

스크립트 Focus Patterns: `~관리 어떻게 해요? / ~효과 있어요? / 후기가 좋아요`

#### 패턴: `~관리 어떻게 해요?`

- **상태**: ✅ 완전 일치
- **DB id**: 848  |  **DB korean**: `~관리 어떻게 해요?`
- **연결 에피소드**: EP28
- **Literal**: ~관리 어떻게 해요?
- **Usage**: Ask how someone takes care of or manages something. Just place a noun before 관리 …
- **Examples**: 3개 ✅

#### 패턴: `~효과 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 849  |  **DB korean**: `~효과 있어요?`
- **연결 에피소드**: EP28
- **Literal**: ~효과 있어요?
- **Usage**: Ask if something actually works or makes a difference. Say what you need, then a…
- **Examples**: 3개 ✅

#### 패턴: `후기가 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 850  |  **DB korean**: `후기가 좋아요`
- **연결 에피소드**: EP28
- **Literal**: 후기가 좋아요
- **Usage**: Say the reviews or word-of-mouth for something are great. Say what you need, the…
- **Examples**: 3개 ✅

### EP29

스크립트 Focus Patterns: `얼마나 자주 해요? / 건강에 좋아요 / 꾸준히 하고 있어요`

#### 패턴: `얼마나 자주 해요?`

- **상태**: ✅ 완전 일치
- **DB id**: 851  |  **DB korean**: `얼마나 자주 해요?`
- **연결 에피소드**: EP29
- **Literal**: 얼마나 자주 해요?
- **Usage**: Ask how often someone does a particular activity. Just place a noun before 얼마나 자…
- **Examples**: 3개 ✅

#### 패턴: `건강에 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 852  |  **DB korean**: `건강에 좋아요`
- **연결 에피소드**: EP29
- **Literal**: 건강에 좋아요
- **Usage**: Say that something is good for your health. Just place a noun before 건강에 좋아요 — n…
- **Examples**: 3개 ✅

#### 패턴: `꾸준히 하고 있어요`

- **상태**: ✅ 완전 일치
- **DB id**: 853  |  **DB korean**: `꾸준히 하고 있어요`
- **연결 에피소드**: EP29
- **Literal**: 꾸준히 하고 있어요
- **Usage**: Say you've been keeping up with something consistently. Say what you need, then …
- **Examples**: 3개 ✅

### EP30

스크립트 Focus Patterns: `~어디 살아요? / 혼자 살아요? / ~근처에 뭐 있어?`

#### 패턴: `~어디 살아요?`

- **상태**: ✅ 완전 일치
- **DB id**: 854  |  **DB korean**: `~어디 살아요?`
- **연결 에피소드**: EP30
- **Literal**: ~어디 살아요?
- **Usage**: Ask where someone currently lives. Just place a noun before 어디 살아요 — no conjugat…
- **Examples**: 3개 ✅

#### 패턴: `혼자 살아요?`

- **상태**: ✅ 완전 일치
- **DB id**: 855  |  **DB korean**: `혼자 살아요?`
- **연결 에피소드**: EP30
- **Literal**: 혼자 살아요?
- **Usage**: Ask if someone lives by themselves. It works in casual and polite speech alike. …
- **Examples**: 3개 ✅

#### 패턴: `~근처에 뭐 있어?`

- **상태**: ✅ 완전 일치
- **DB id**: 856  |  **DB korean**: `~근처에 뭐 있어?`
- **연결 에피소드**: EP30
- **Literal**: ~근처에 뭐 있어?
- **Usage**: Casually ask what places or things are near somewhere. Just place a noun before …
- **Examples**: 3개 ✅

### EP31

스크립트 Focus Patterns: `기분이 어때? / ~라서 행복해 / 설레`

#### 패턴: `기분이 어때?`

- **상태**: ✅ 완전 일치
- **DB id**: 857  |  **DB korean**: `기분이 어때?`
- **연결 에피소드**: 없음
- **Literal**: How are you feeling today?
- **Usage**: Casually check in and ask how someone is feeling. Just place a noun before 기분이 어…
- **Examples**: 3개 ✅

#### 패턴: `~라서 행복해`

- **상태**: ✅ 완전 일치
- **DB id**: 858  |  **DB korean**: `~라서 행복해`
- **연결 에피소드**: 없음
- **Literal**: Happy because of ~
- **Usage**: Express happiness by stating the reason with 'because.' It works in casual and p…
- **Examples**: 3개 ✅

#### 패턴: `설레`

- **상태**: ✅ 완전 일치
- **DB id**: 859  |  **DB korean**: `설레`
- **연결 에피소드**: 없음
- **Literal**: I'm so excited!
- **Usage**: Describe that fluttery, giddy feeling of excited anticipation. Say what you need…
- **Examples**: 3개 ✅

### EP32

스크립트 Focus Patterns: `괜찮아요? / 요즘 좀 힘들어요 / 언제든지 연락해요`

#### 패턴: `괜찮아요?`

- **상태**: ✅ 완전 일치
- **DB id**: 860  |  **DB korean**: `괜찮아요?`
- **연결 에피소드**: 없음
- **Literal**: Are you okay?
- **Usage**: Check in to make sure someone is okay. Say what you need, then add 괜찮아요 at the e…
- **Examples**: 3개 ✅

#### 패턴: `요즘 좀 힘들어요`

- **상태**: ✅ 완전 일치
- **DB id**: 861  |  **DB korean**: `요즘 좀 힘들어요`
- **연결 에피소드**: 없음
- **Literal**: Things have been a bit
- **Usage**: Share honestly that things have been a bit tough lately. It works in casual and …
- **Examples**: 3개 ✅

#### 패턴: `언제든지 연락해요`

- **상태**: ✅ 완전 일치
- **DB id**: 862  |  **DB korean**: `언제든지 연락해요`
- **연결 에피소드**: 없음
- **Literal**: If you need help, contact
- **Usage**: Tell someone they can reach out to you any time. Say what you need, then add 언제든…
- **Examples**: 3개 ✅

### EP33

스크립트 Focus Patterns: `카카오톡 해요? / 팔로우해도 돼요? / 한국 친구를 사귀고 싶어요`

#### 패턴: `카카오톡 해요?`

- **상태**: ✅ 완전 일치
- **DB id**: 863  |  **DB korean**: `카카오톡 해요?`
- **연결 에피소드**: 없음
- **Literal**: Do you use KakaoTalk? I'll
- **Usage**: Ask if someone uses KakaoTalk to swap contact info. It works in casual and polit…
- **Examples**: 3개 ✅

#### 패턴: `팔로우해도 돼요?`

- **상태**: ✅ 완전 일치
- **DB id**: 864  |  **DB korean**: `팔로우해도 돼요?`
- **연결 에피소드**: 없음
- **Literal**: Can I follow you on
- **Usage**: Politely ask permission to follow someone on social media. Just place a noun bef…
- **Examples**: 3개 ✅

#### 패턴: `한국 친구를 사귀고 싶어요`

- **DB**: 없음 ❌

### EP34

스크립트 Focus Patterns: `제가 살게요 / 더치페이 해요? / 밥 한번 먹어요`

#### 패턴: `제가 살게요`

- **상태**: ✅ 완전 일치
- **DB id**: 866  |  **DB korean**: `제가 살게요`
- **연결 에피소드**: 없음
- **Literal**: It's on me today. You
- **Usage**: Offer to treat someone by saying 'it's on me.' Just place a noun before 제가 살게요 —…
- **Examples**: 3개 ✅

#### 패턴: `더치페이 해요?`

- **상태**: ✅ 완전 일치
- **DB id**: 867  |  **DB korean**: `더치페이 해요?`
- **연결 에피소드**: 없음
- **Literal**: Shall we split the bill?
- **Usage**: Ask if everyone is splitting the bill equally. It works in casual and polite spe…
- **Examples**: 3개 ✅

#### 패턴: `밥 한번 먹어요`

- **상태**: ✅ 완전 일치
- **DB id**: 868  |  **DB korean**: `밥 한번 먹어요`
- **연결 에피소드**: 없음
- **Literal**: Let's grab a meal together
- **Usage**: Casually suggest grabbing a meal together sometime. Say what you need, then add …
- **Examples**: 3개 ✅

### EP35

스크립트 Focus Patterns: `~입어 봤어? / 명절에 뭐 해? / 이게 무슨 뜻이야?`

#### 패턴: `~입어 봤어?`

- **상태**: ✅ 완전 일치
- **DB id**: 870  |  **DB korean**: `~입어 봤어?`
- **연결 에피소드**: 없음
- **Literal**: Have you tried this on?
- **Usage**: Casually ask if someone has ever tried wearing something. Say what you need, the…
- **Examples**: 3개 ✅

#### 패턴: `명절에 뭐 해?`

- **상태**: ✅ 완전 일치
- **DB id**: 871  |  **DB korean**: `명절에 뭐 해?`
- **연결 에피소드**: 없음
- **Literal**: What do you do on
- **Usage**: Ask what someone does or plans for Korean holidays. It works in casual and polit…
- **Examples**: 3개 ✅

#### 패턴: `이게 무슨 뜻이야?`

- **상태**: ✅ 완전 일치
- **DB id**: 872  |  **DB korean**: `이게 무슨 뜻이야?`
- **연결 에피소드**: 없음
- **Literal**: What does this mean? I've
- **Usage**: Ask a friend casually what a word or expression means. It works in casual and po…
- **Examples**: 3개 ✅

### EP36

스크립트 Focus Patterns: `술 마셔요? / 건배해요 / 오늘은 여기까지만 해요`

#### 패턴: `술 마셔요?`

- **상태**: ✅ 완전 일치
- **DB id**: 873  |  **DB korean**: `술 마셔요?`
- **연결 에피소드**: 없음
- **Literal**: Do you drink? Want to
- **Usage**: Ask someone politely if they drink alcohol. It works in casual and polite speech…
- **Examples**: 3개 ✅

#### 패턴: `건배해요`

- **상태**: ✅ 완전 일치
- **DB id**: 874  |  **DB korean**: `건배해요`
- **연결 에피소드**: 없음
- **Literal**: Everyone's here, so let's toast
- **Usage**: Say cheers and raise your glass together. Say what you need, then add 건배해요 at th…
- **Examples**: 3개 ✅

#### 패턴: `오늘은 여기까지만 해요`

- **상태**: ✅ 완전 일치
- **DB id**: 875  |  **DB korean**: `오늘은 여기까지만 해요`
- **연결 에피소드**: 없음
- **Literal**: You're tired, right? Let's stop
- **Usage**: Politely wrap up a session or activity for the day. Say what you need, then add …
- **Examples**: 3개 ✅

### EP37

스크립트 Focus Patterns: `이 노래 같이 불러요 / 신청곡 있어요? / 한 곡 더 해요`

#### 패턴: `이 노래 같이 불러요`

- **상태**: ✅ 완전 일치
- **DB id**: 876  |  **DB korean**: `이 노래 같이 불러요`
- **연결 에피소드**: 없음
- **Literal**: Let's sing this song together!
- **Usage**: Invite someone to sing a song together with you. It works in casual and polite s…
- **Examples**: 3개 ✅

#### 패턴: `신청곡 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 877  |  **DB korean**: `신청곡 있어요?`
- **연결 에피소드**: 없음
- **Literal**: Do you have a song
- **Usage**: Ask if someone has a song they'd like to request. It works in casual and polite …
- **Examples**: 3개 ✅

#### 패턴: `한 곡 더 해요`

- **상태**: ✅ 완전 일치
- **DB id**: 878  |  **DB korean**: `한 곡 더 해요`
- **연결 에피소드**: 없음
- **Literal**: This is fun — let's
- **Usage**: Suggest doing just one more song before finishing. Just place a noun before 한 곡 …
- **Examples**: 3개 ✅

### EP38

스크립트 Focus Patterns: `같이 춰요 / 어렵지만 재미있어요 / 하다 보면 늘어요`

#### 패턴: `같이 춰요`

- **상태**: ✅ 완전 일치
- **DB id**: 879  |  **DB korean**: `같이 춰요`
- **연결 에피소드**: 없음
- **Literal**: The music is great —
- **Usage**: Invite someone to get up and dance with you. Say what you need, then add 같이 춰요 a…
- **Examples**: 3개 ✅

#### 패턴: `어렵지만 재미있어요`

- **상태**: ✅ 완전 일치
- **DB id**: 880  |  **DB korean**: `어렵지만 재미있어요`
- **연결 에피소드**: 없음
- **Literal**: Studying Korean is difficult but
- **Usage**: Express that something is challenging but genuinely enjoyable. Say what you need…
- **Examples**: 3개 ✅

#### 패턴: `하다 보면 늘어요`

- **상태**: ✅ 완전 일치
- **DB id**: 881  |  **DB korean**: `하다 보면 늘어요`
- **연결 에피소드**: 없음
- **Literal**: Don't worry. You'll get better
- **Usage**: Encourage someone that consistent practice leads to improvement. Say what you ne…
- **Examples**: 3개 ✅

### EP39

스크립트 Focus Patterns: `분위기 좋아요 / 달달한 거 있어요? / 오래 있어도 돼요?`

#### 패턴: `분위기 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 882  |  **DB korean**: `분위기 좋아요`
- **연결 에피소드**: 없음
- **Literal**: This café has a great
- **Usage**: Compliment the vibe or atmosphere of a place. Say what you need, then add 분위기 좋아…
- **Examples**: 3개 ✅

#### 패턴: `달달한 거 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 883  |  **DB korean**: `달달한 거 있어요?`
- **연결 에피소드**: 없음
- **Literal**: I'm hungry — do you
- **Usage**: Ask if there's something sweet available to eat or drink. Just place a noun befo…
- **Examples**: 3개 ✅

#### 패턴: `오래 있어도 돼요?`

- **상태**: ✅ 완전 일치
- **DB id**: 884  |  **DB korean**: `오래 있어도 돼요?`
- **연결 에피소드**: 없음
- **Literal**: Is it okay to stay
- **Usage**: Politely ask whether it's okay to stay for a long time. Say what you need, then …
- **Examples**: 3개 ✅

### EP40

스크립트 Focus Patterns: `나라마다 달라요 / 이제 적응이 됐어요 / 처음엔 낯설었는데`

#### 패턴: `나라마다 달라요`

- **상태**: ✅ 완전 일치
- **DB id**: 885  |  **DB korean**: `나라마다 달라요`
- **연결 에피소드**: 없음
- **Literal**: The way you greet people
- **Usage**: Point out that customs or practices differ by country. Say what you need, then a…
- **Examples**: 3개 ✅

#### 패턴: `이제 적응이 됐어요`

- **상태**: ✅ 완전 일치
- **DB id**: 886  |  **DB korean**: `이제 적응이 됐어요`
- **연결 에피소드**: 없음
- **Literal**: I've finally adjusted to life
- **Usage**: Say you've finally adjusted and settled into a new situation. Say what you need,…
- **Examples**: 3개 ✅

#### 패턴: `처음엔 낯설었는데`

- **상태**: ✅ 완전 일치
- **DB id**: 887  |  **DB korean**: `처음엔 낯설었는데`
- **연결 에피소드**: 없음
- **Literal**: It felt unfamiliar at first,
- **Usage**: Start a story by saying something felt strange or unfamiliar at first. It works …
- **Examples**: 3개 ✅

### EP41

스크립트 Focus Patterns: `~는데 / ~거든요 / ~더라고요`

#### 패턴: `~는데`

- **상태**: ✅ 완전 일치
- **DB id**: 888  |  **DB korean**: `~는데`
- **연결 에피소드**: 없음
- **Literal**: I'm hungry — what should we ~?
- **Usage**: Connect two ideas or give soft background context before your point. It works in…
- **Examples**: 3개 ✅

#### 패턴: `~거든요`

- **DB**: 없음 ❌

#### 패턴: `~더라고요`

- **DB**: 없음 ❌

### EP42

스크립트 Focus Patterns: `~면 어때요? / ~면 좋겠어요 / ~면 돼요`

#### 패턴: `~면 어때요?`

- **상태**: ✅ 완전 일치
- **DB id**: 891  |  **DB korean**: `~면 어때요?`
- **연결 에피소드**: 없음
- **Literal**: How about meeting ~?
- **Usage**: Politely suggest an idea or alternative to someone. Say what you need, then add …
- **Examples**: 3개 ✅

#### 패턴: `~면 좋겠어요`

- **상태**: ✅ 완전 일치
- **DB id**: 892  |  **DB korean**: `~면 좋겠어요`
- **연결 에피소드**: 없음
- **Literal**: I hope the weather is nice ~
- **Usage**: Express a gentle wish or hope about a situation. Say what you need, then add 면 좋…
- **Examples**: 3개 ✅

#### 패턴: `~면 돼요`

- **상태**: ✅ 완전 일치
- **DB id**: 893  |  **DB korean**: `~면 돼요`
- **연결 에피소드**: 없음
- **Literal**: You can ~
- **Usage**: Tell someone the only thing they need to do is one simple action. Say what you n…
- **Examples**: 3개 ✅

### EP43

스크립트 Focus Patterns: `~때문에 / ~덕분에 / ~보다`

#### 패턴: `~때문에`

- **상태**: ✅ 완전 일치
- **DB id**: 894  |  **DB korean**: `~때문에`
- **연결 에피소드**: 없음
- **Literal**: I couldn't go out because of the ~
- **Usage**: State the cause or reason for something using 'because of.' Just place a noun be…
- **Examples**: 3개 ✅

#### 패턴: `~덕분에`

- **상태**: ✅ 완전 일치
- **DB id**: 895  |  **DB korean**: `~덕분에`
- **연결 에피소드**: 없음
- **Literal**: Thanks to my teacher, my Korean has ~
- **Usage**: Credit someone or something for a positive outcome. Just place a noun before 덕분에…
- **Examples**: 3개 ✅

#### 패턴: `~보다`

- **상태**: ✅ 완전 일치
- **DB id**: 896  |  **DB korean**: `~보다`
- **연결 에피소드**: 없음
- **Literal**: Korean is harder than I ~
- **Usage**: Compare two things, saying one is more or less than the other. Say what you need…
- **Examples**: 3개 ✅

### EP44

스크립트 Focus Patterns: `~는 동안 / ~고 나서 / ~기 전에`

#### 패턴: `~는 동안`

- **상태**: ✅ 완전 일치
- **DB id**: 897  |  **DB korean**: `~는 동안`
- **연결 에피소드**: 없음
- **Literal**: Shall we have coffee while we ~?
- **Usage**: Describe what happens or happened during a period of time. Just place a noun bef…
- **Examples**: 3개 ✅

#### 패턴: `~고 나서`

- **상태**: ✅ 완전 일치
- **DB id**: 898  |  **DB korean**: `~고 나서`
- **연결 에피소드**: 없음
- **Literal**: Shall we take a walk after ~?
- **Usage**: Describe what you do or did after finishing an action. Say what you need, then a…
- **Examples**: 3개 ✅

#### 패턴: `~기 전에`

- **상태**: ✅ 완전 일치
- **DB id**: 899  |  **DB korean**: `~기 전에`
- **연결 에피소드**: 없음
- **Literal**: Don't look at your phone before ~
- **Usage**: Say what you do or should do before a certain action. Just place a noun before 기…
- **Examples**: 3개 ✅

### EP45

스크립트 Focus Patterns: `~아/어 줄게요 / 해 드릴까요? / 죄송한데요 혹시 ~`

#### 패턴: `~아/어 줄게요`

- **DB**: 없음 ❌

#### 패턴: `해 드릴까요?`

- **상태**: ✅ 완전 일치
- **DB id**: 901  |  **DB korean**: `해 드릴까요?`
- **연결 에피소드**: 없음
- **Literal**: Shall I take a photo
- **Usage**: Politely offer to do something for someone, especially a stranger. It works in c…
- **Examples**: 3개 ✅

#### 패턴: `죄송한데요 혹시 ~`

- **상태**: ✅ 완전 일치
- **DB id**: 902  |  **DB korean**: `죄송한데요 혹시 ~`
- **연결 에피소드**: 없음
- **Literal**: Excuse me, could you ~?
- **Usage**: Politely interrupt a stranger to ask a question or small favor. It works in casu…
- **Examples**: 3개 ✅

### EP46

스크립트 Focus Patterns: `~지 얼마나 됐어요? / 아직 ~는 중이에요 / 거의 다 됐어요`

#### 패턴: `~지 얼마나 됐어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 903  |  **DB korean**: `~지 얼마나 됐어요?`
- **연결 에피소드**: 없음
- **Literal**: How long has it been since you came to ~?
- **Usage**: Ask how long it has been since something started or happened. Say what you need,…
- **Examples**: 3개 ✅

#### 패턴: `아직 ~는 중이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 904  |  **DB korean**: `아직 ~는 중이에요`
- **연결 에피소드**: 없음
- **Literal**: 아직 ~
- **Usage**: Say you're still in the middle of doing something. It works in casual and polite…
- **Examples**: 3개 ✅

#### 패턴: `거의 다 됐어요`

- **상태**: ✅ 완전 일치
- **DB id**: 905  |  **DB korean**: `거의 다 됐어요`
- **연결 에피소드**: 없음
- **Literal**: Wait just a little. It's
- **Usage**: Tell someone you're almost finished with what you're doing. Say what you need, t…
- **Examples**: 3개 ✅

### EP47

스크립트 Focus Patterns: `~스타일 좋아해요? / ~잘 어울려요 / 요즘 유행이에요`

#### 패턴: `~스타일 좋아해요?`

- **상태**: ✅ 완전 일치
- **DB id**: 906  |  **DB korean**: `~스타일 좋아해요?`
- **연결 에피소드**: 없음
- **Literal**: What music style do you ~?
- **Usage**: Ask someone about their preferences in style or taste. Say what you need, then a…
- **Examples**: 3개 ✅

#### 패턴: `~잘 어울려요`

- **상태**: ✅ 완전 일치
- **DB id**: 907  |  **DB korean**: `~잘 어울려요`
- **연결 에피소드**: 없음
- **Literal**: That outfit suits you really ~!
- **Usage**: Compliment someone by saying something suits them really well. Say what you need…
- **Examples**: 3개 ✅

#### 패턴: `요즘 유행이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 908  |  **DB korean**: `요즘 유행이에요`
- **연결 에피소드**: 없음
- **Literal**: This color is trending these
- **Usage**: Tell someone something is currently on trend. Say what you need, then add 요즘 유행이…
- **Examples**: 3개 ✅

### EP48

스크립트 Focus Patterns: `배달 시켜요 / 배달 얼마나 걸려요? / 가성비 좋아요`

#### 패턴: `배달 시켜요`

- **상태**: ✅ 완전 일치
- **DB id**: 869  |  **DB korean**: `배달 시켜요`
- **연결 에피소드**: 없음
- **Literal**: I don't want to go
- **Usage**: Suggest ordering food delivery instead of going out. Say what you need, then add…
- **Examples**: 3개 ✅

#### 패턴: `배달 얼마나 걸려요?`

- **상태**: ✅ 완전 일치
- **DB id**: 909  |  **DB korean**: `배달 얼마나 걸려요?`
- **연결 에피소드**: 없음
- **Literal**: How long does delivery take?
- **Usage**: Ask how long a delivery will take to arrive. It works in casual and polite speec…
- **Examples**: 3개 ✅

#### 패턴: `가성비 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 910  |  **DB korean**: `가성비 좋아요`
- **연결 에피소드**: 없음
- **Literal**: This restaurant is great value.
- **Usage**: Say something offers great value for the price paid. Say what you need, then add…
- **Examples**: 3개 ✅

### EP49

스크립트 Focus Patterns: `여행 계획 있어요? / 며칠이나 있을 거예요? / 꼭 봐야 할 게 뭐예요?`

#### 패턴: `여행 계획 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 911  |  **DB korean**: `여행 계획 있어요?`
- **연결 에피소드**: 없음
- **Literal**: Do you have any travel
- **Usage**: Ask if someone has any upcoming travel plans. Say what you need, then add 여행 계획 …
- **Examples**: 3개 ✅

#### 패턴: `며칠이나 있을 거예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 912  |  **DB korean**: `며칠이나 있을 거예요?`
- **연결 에피소드**: 없음
- **Literal**: How many days will you
- **Usage**: Ask how many days someone plans to stay somewhere. Just place a noun before 며칠이나…
- **Examples**: 3개 ✅

#### 패턴: `꼭 봐야 할 게 뭐예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 913  |  **DB korean**: `꼭 봐야 할 게 뭐예요?`
- **연결 에피소드**: 없음
- **Literal**: What's a must-see in Seoul
- **Usage**: Ask for a must-see recommendation when visiting a place. Just place a noun befor…
- **Examples**: 3개 ✅

### EP50

스크립트 Focus Patterns: `한국 생활 어때? / 이제 익숙해졌어 / ~이/가 제일 좋아`

#### 패턴: `한국 생활 어때?`

- **상태**: ✅ 완전 일치
- **DB id**: 914  |  **DB korean**: `한국 생활 어때?`
- **연결 에피소드**: 없음
- **Literal**: How's life in Korea? Is
- **Usage**: Ask a friend casually how they're finding life in Korea. It works in casual and …
- **Examples**: 3개 ✅

#### 패턴: `이제 익숙해졌어`

- **상태**: ✅ 완전 일치
- **DB id**: 915  |  **DB korean**: `이제 익숙해졌어`
- **연결 에피소드**: 없음
- **Literal**: It was tough at first,
- **Usage**: Tell a friend you've gotten used to something now. Say what you need, then add 이…
- **Examples**: 3개 ✅

#### 패턴: `~이/가 제일 좋아`

- **DB**: 없음 ❌

### EP51

스크립트 Focus Patterns: `~ㄹ/을 거예요 / ~려고 해요 / ~고 싶어요`

#### 패턴: `~ㄹ/을 거예요`

- **DB**: 없음 ❌

#### 패턴: `~려고 해요`

- **상태**: ✅ 완전 일치
- **DB id**: 918  |  **DB korean**: `~려고 해요`
- **연결 에피소드**: 없음
- **Literal**: I'm planning to take a Korean exam next ~
- **Usage**: Say you intend or are planning to do something soon. Say what you need, then add…
- **Examples**: 3개 ✅

#### 패턴: `~고 싶어요`

- **상태**: ✅ 완전 일치
- **DB id**: 919  |  **DB korean**: `~고 싶어요`
- **연결 에피소드**: 없음
- **Literal**: I want to ~
- **Usage**: Express what you want or wish to do right now. Say what you need, then add 고 싶어요…
- **Examples**: 3개 ✅

### EP52

스크립트 Focus Patterns: `~기로 했어요 / 마음먹었어요 / 예전보다 늘었어요`

#### 패턴: `~기로 했어요`

- **상태**: ✅ 완전 일치
- **DB id**: 920  |  **DB korean**: `~기로 했어요`
- **연결 에피소드**: 없음
- **Literal**: I've decided to live in ~
- **Usage**: Share a decision you've made with someone. Say what you need, then add 기로 했어요 at…
- **Examples**: 3개 ✅

#### 패턴: `마음먹었어요`

- **상태**: ✅ 완전 일치
- **DB id**: 921  |  **DB korean**: `마음먹었어요`
- **연결 에피소드**: 없음
- **Literal**: I've made up my mind
- **Usage**: Say you've firmly made up your mind about something. Say what you need, then add…
- **Examples**: 3개 ✅

#### 패턴: `예전보다 늘었어요`

- **상태**: ✅ 완전 일치
- **DB id**: 922  |  **DB korean**: `예전보다 늘었어요`
- **연결 에피소드**: 없음
- **Literal**: My Korean has improved compared
- **Usage**: Say a skill or ability has improved compared to before. Say what you need, then …
- **Examples**: 3개 ✅

### EP53

스크립트 Focus Patterns: `~어/아 봤어? / ~보니까 / ~추천해줬어`

#### 패턴: `~어/아 봤어?`

- **DB**: 없음 ❌

#### 패턴: `~보니까`

- **상태**: ✅ 완전 일치
- **DB id**: 924  |  **DB korean**: `~보니까`
- **연결 에피소드**: 없음
- **Literal**: Now that I've studied Korean, it's more fun than I ~
- **Usage**: Share a realization or finding after trying or doing something. Say what you nee…
- **Examples**: 3개 ✅

#### 패턴: `~추천해줬어`

- **상태**: ✅ 완전 일치
- **DB id**: 925  |  **DB korean**: `~추천해줬어`
- **연결 에피소드**: 없음
- **Literal**: My friend recommended this restaurant. They say it's ~
- **Usage**: Tell someone who recommended something to you. Say what you need, then add 추천해줬어…
- **Examples**: 3개 ✅

### EP54

스크립트 Focus Patterns: `~가르쳐 줄 수 있어? / ~맞아? / ~어떻게 해요?`

#### 패턴: `~가르쳐 줄 수 있어?`

- **DB**: 없음 ❌

#### 패턴: `~맞아?`

- **상태**: ✅ 완전 일치
- **DB id**: 927  |  **DB korean**: `~맞아?`
- **연결 에피소드**: 없음
- **Literal**: This is Hongdae station, ~?
- **Usage**: Casually check if your understanding or information is correct. Say what you nee…
- **Examples**: 3개 ✅

#### 패턴: `~어떻게 해요?`

- **DB**: 없음 ❌

### EP55

스크립트 Focus Patterns: `~만들어봤어? / ~얼마나 넣어? / ~하면 돼`

#### 패턴: `~만들어봤어?`

- **상태**: ✅ 완전 일치
- **DB id**: 929  |  **DB korean**: `~만들어봤어?`
- **연결 에피소드**: 없음
- **Literal**: Have you ever tried making kimchi? Is it ~?
- **Usage**: Ask a friend if they've ever tried making something themselves. Just place a nou…
- **Examples**: 3개 ✅

#### 패턴: `~얼마나 넣어?`

- **상태**: ✅ 완전 일치
- **DB id**: 930  |  **DB korean**: `~얼마나 넣어?`
- **연결 에피소드**: 없음
- **Literal**: How much sugar do you add? I think it'll be too ~
- **Usage**: Ask how much of an ingredient to add when cooking. Just place a noun before 얼마나 …
- **Examples**: 3개 ✅

#### 패턴: `~하면 돼`

- **상태**: ✅ 완전 일치
- **DB id**: 931  |  **DB korean**: `~하면 돼`
- **연결 에피소드**: 없음
- **Literal**: Just press this button. It's ~
- **Usage**: Tell a friend casually that they just need to do one thing. It works in casual a…
- **Examples**: 3개 ✅

### EP56

스크립트 Focus Patterns: `~살 거예요 / 이거 어때요? / 카드로 할게요`

#### 패턴: `~살 거예요`

- **상태**: ✅ 완전 일치
- **DB id**: 932  |  **DB korean**: `~살 거예요`
- **연결 에피소드**: 없음
- **Literal**: I'm going to buy new sneakers ~
- **Usage**: Tell someone what you're planning to buy. Say what you need, then add 살 거예요 at t…
- **Examples**: 3개 ✅

#### 패턴: `이거 어때요?`

- **상태**: ✅ 완전 일치
- **DB id**: 933  |  **DB korean**: `이거 어때요?`
- **연결 에피소드**: 없음
- **Literal**: How is this outfit? Does
- **Usage**: Ask for someone's honest opinion on a specific item. It works in casual and poli…
- **Examples**: 3개 ✅

#### 패턴: `카드로 할게요`

- **상태**: ✅ 완전 일치
- **DB id**: 934  |  **DB korean**: `카드로 할게요`
- **연결 에피소드**: 없음
- **Literal**: I'll pay by card. I
- **Usage**: Tell a cashier or server you'll be paying by card. It works in casual and polite…
- **Examples**: 3개 ✅

### EP57

스크립트 Focus Patterns: `~해봤어요? / 어땠어요? / 도전해 볼게요`

#### 패턴: `~해봤어요?`

- **DB**: 없음 ❌

#### 패턴: `어땠어요?`

- **DB**: 없음 ❌

#### 패턴: `도전해 볼게요`

- **DB**: 없음 ❌

### EP58

스크립트 Focus Patterns: `~받고 싶어요 / 어디가 아파요? / 언제부터 아팠어요?`

#### 패턴: `~받고 싶어요`

- **상태**: ✅ 완전 일치
- **DB id**: 937  |  **DB korean**: `~받고 싶어요`
- **연결 에피소드**: 없음
- **Literal**: I want to receive flowers for my ~
- **Usage**: Express something you'd like to receive as a gift or gesture. Say what you need,…
- **Examples**: 3개 ✅

#### 패턴: `어디가 아파요?`

- **상태**: ✅ 완전 일치
- **DB id**: 938  |  **DB korean**: `어디가 아파요?`
- **연결 에피소드**: 없음
- **Literal**: Where does it hurt? Do
- **Usage**: Ask a patient or friend where they're feeling pain. It works in casual and polit…
- **Examples**: 3개 ✅

#### 패턴: `언제부터 아팠어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 939  |  **DB korean**: `언제부터 아팠어요?`
- **연결 에피소드**: 없음
- **Literal**: Since when have you been
- **Usage**: Ask when someone's pain or illness first started. It works in casual and polite …
- **Examples**: 3개 ✅

### EP59

스크립트 Focus Patterns: `~와 봤어요? / ~하기 좋아요`

#### 패턴: `~와 봤어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 940  |  **DB korean**: `~와 봤어요?`
- **연결 에피소드**: 없음
- **Literal**: Have you been to Jeju Island ~?
- **Usage**: Ask politely if someone has visited a particular place before. Just place a noun…
- **Examples**: 3개 ✅

#### 패턴: `~하기 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 941  |  **DB korean**: `~하기 좋아요`
- **연결 에피소드**: 없음
- **Literal**: This place is great for taking ~
- **Usage**: Say a place or season is great for doing a particular thing. It works in casual …
- **Examples**: 3개 ✅

### EP60

스크립트 Focus Patterns: `~중에 뭐가 제일 좋아요? / ~라서 중독성 있어요 / ~이랑 달라요`

#### 패턴: `~중에 뭐가 제일 좋아요?`

- **상태**: ✅ 완전 일치
- **DB id**: 942  |  **DB korean**: `~중에 뭐가 제일 좋아요?`
- **연결 에피소드**: 없음
- **Literal**: What's your favorite among Korean ~?
- **Usage**: Ask someone to pick their favorite from a set of options. Say what you need, the…
- **Examples**: 3개 ✅

#### 패턴: `~라서 중독성 있어요`

- **상태**: ✅ 완전 일치
- **DB id**: 943  |  **DB korean**: `~라서 중독성 있어요`
- **연결 에피소드**: 없음
- **Literal**: This song is addictive because the melody is so ~
- **Usage**: Explain exactly why something is so addictive or hard to stop. It works in casua…
- **Examples**: 3개 ✅

#### 패턴: `~이랑 달라요`

- **상태**: ✅ 완전 일치
- **DB id**: 944  |  **DB korean**: `~이랑 달라요`
- **연결 에피소드**: 없음
- **Literal**: It's different from my country. So ~
- **Usage**: Point out how something differs from something else. Say what you need, then add…
- **Examples**: 3개 ✅

### EP61

스크립트 Focus Patterns: `나쁘지 않은데요 / 솔직하게 말해도 돼요? / 저도 그렇게 생각해요`

#### 패턴: `나쁘지 않은데요`

- **DB**: 없음 ❌

#### 패턴: `솔직하게 말해도 돼요?`

- **상태**: ✅ 완전 일치
- **DB id**: 1021  |  **DB korean**: `솔직하게 말해도 돼요?`
- **연결 에피소드**: 없음
- **Literal**: Can I be honest? I'm
- **Usage**: Politely ask permission before giving an honest or direct opinion. It works in c…
- **Examples**: 3개 ✅

#### 패턴: `저도 그렇게 생각해요`

- **DB**: 없음 ❌

### EP62

스크립트 Focus Patterns: `~어때요? / ~때문에 바빠요 / 무리하지 마세요`

#### 패턴: `~어때요?`

- **상태**: ✅ 완전 일치
- **DB id**: 775  |  **DB korean**: `~어때요?`
- **연결 에피소드**: 없음
- **Literal**: How is ~?
- **Usage**: Ask for someone's opinion about something. Say what you need, then add 어때요 at th…
- **Examples**: 3개 ✅

#### 패턴: `~때문에 바빠요`

- **상태**: ✅ 완전 일치
- **DB id**: 948  |  **DB korean**: `~때문에 바빠요`
- **연결 에피소드**: 없음
- **Literal**: I'm busy because of exams. I'll contact you ~
- **Usage**: Explain what is keeping you busy right now. Just place a noun before 때문에 바빠요 — n…
- **Examples**: 3개 ✅

#### 패턴: `무리하지 마세요`

- **상태**: ✅ 완전 일치
- **DB id**: 949  |  **DB korean**: `무리하지 마세요`
- **연결 에피소드**: 없음
- **Literal**: If you're not feeling well,
- **Usage**: Advise someone not to push themselves too hard. Say what you need, then add 무리하지…
- **Examples**: 3개 ✅

### EP63

스크립트 Focus Patterns: `~많이 해? / ~유행이야? / ~올렸더니`

#### 패턴: `~많이 해?`

- **상태**: ✅ 완전 일치
- **DB id**: 950  |  **DB korean**: `~많이 해?`
- **연결 에피소드**: 없음
- **Literal**: Do you exercise a lot? You look ~
- **Usage**: Ask casually if someone does something frequently or a lot. Just place a noun be…
- **Examples**: 3개 ✅

#### 패턴: `~유행이야?`

- **상태**: ✅ 완전 일치
- **DB id**: 951  |  **DB korean**: `~유행이야?`
- **연결 에피소드**: 없음
- **Literal**: Is this style trendy these ~?
- **Usage**: Ask if something is currently trendy or popular. Say what you need, then add 유행이…
- **Examples**: 3개 ✅

#### 패턴: `~올렸더니`

- **상태**: ✅ 완전 일치
- **DB id**: 952  |  **DB korean**: `~올렸더니`
- **연결 에피소드**: 없음
- **Literal**: After I posted the photo, I got a lot of ~
- **Usage**: Share what happened after you posted or uploaded something online. Just place a …
- **Examples**: 3개 ✅

### EP64

스크립트 Focus Patterns: `~도전해요 / 재료가 있어요? / 다음엔 더 잘할 거예요`

#### 패턴: `~도전해요`

- **상태**: ✅ 완전 일치
- **DB id**: 953  |  **DB korean**: `~도전해요`
- **연결 에피소드**: 없음
- **Literal**: I'm going to take on cooking this ~
- **Usage**: Announce you're taking on a new challenge or trying something for the first time…
- **Examples**: 3개 ✅

#### 패턴: `재료가 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 954  |  **DB korean**: `재료가 있어요?`
- **연결 에피소드**: 없음
- **Literal**: I want to make kimchi
- **Usage**: Check if the necessary ingredients are available. Say what you need, then add 재료…
- **Examples**: 3개 ✅

#### 패턴: `다음엔 더 잘할 거예요`

- **상태**: ✅ 완전 일치
- **DB id**: 955  |  **DB korean**: `다음엔 더 잘할 거예요`
- **연결 에피소드**: 없음
- **Literal**: I made a mistake this
- **Usage**: Encourage yourself or someone else that next time will be better. Say what you n…
- **Examples**: 3개 ✅

### EP65

스크립트 Focus Patterns: `~루틴 있어요? / ~하고 나서 / 꼭 ~해야 해요`

#### 패턴: `~루틴 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 956  |  **DB korean**: `~루틴 있어요?`
- **연결 에피소드**: 없음
- **Literal**: Do you have a morning routine? How do you start your ~?
- **Usage**: Ask if someone has a regular habit or routine for something. Just place a noun b…
- **Examples**: 3개 ✅

#### 패턴: `~하고 나서`

- **상태**: ✅ 완전 일치
- **DB id**: 957  |  **DB korean**: `~하고 나서`
- **연결 에피소드**: 없음
- **Literal**: Let's take a walk after ~
- **Usage**: Say what you plan to do or did after completing an action. It works in casual an…
- **Examples**: 3개 ✅

#### 패턴: `꼭 ~해야 해요`

- **상태**: ✅ 완전 일치
- **DB id**: 958  |  **DB korean**: `꼭 ~해야 해요`
- **연결 에피소드**: 없음
- **Literal**: 꼭 ~
- **Usage**: Insist that something absolutely must be done. It works in casual and polite spe…
- **Examples**: 3개 ✅

### EP66

스크립트 Focus Patterns: `많이 늘었어요 / 비결이 뭐예요? / ~이 헷갈려요`

#### 패턴: `많이 늘었어요`

- **상태**: ✅ 완전 일치
- **DB id**: 959  |  **DB korean**: `많이 늘었어요`
- **연결 에피소드**: 없음
- **Literal**: Your Korean has improved so
- **Usage**: Compliment someone by saying their skill has improved a lot. Just place a noun b…
- **Examples**: 3개 ✅

#### 패턴: `비결이 뭐예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 960  |  **DB korean**: `비결이 뭐예요?`
- **연결 에피소드**: 없음
- **Literal**: Your skin looks amazing. What's
- **Usage**: Ask what someone's secret or key to success is. Say what you need, then add 비결이 …
- **Examples**: 3개 ✅

#### 패턴: `~이 헷갈려요`

- **상태**: ✅ 완전 일치
- **DB id**: 961  |  **DB korean**: `~이 헷갈려요`
- **연결 에피소드**: 없음
- **Literal**: Formal and informal speech are still confusing to ~
- **Usage**: Say that something is confusing or hard to tell apart. It works in casual and po…
- **Examples**: 3개 ✅

### EP67

스크립트 Focus Patterns: `~이/가 이렇게 ~해요? / 이때가 제일 좋아요 / ~은/는 어때요?`

#### 패턴: `~이/가 이렇게 ~해요?`

- **DB**: 없음 ❌

#### 패턴: `이때가 제일 좋아요`

- **DB**: 없음 ❌

#### 패턴: `~은/는 어때요?`

- **DB**: 없음 ❌

### EP68

스크립트 Focus Patterns: `서운했어요 / 제가 잘못했어요 / ~려고 할게요`

#### 패턴: `서운했어요`

- **상태**: ✅ 완전 일치
- **DB id**: 965  |  **DB korean**: `서운했어요`
- **연결 에피소드**: 없음
- **Literal**: I felt hurt because there
- **Usage**: Share that you felt hurt or let down because of someone's actions. Say what you …
- **Examples**: 3개 ✅

#### 패턴: `제가 잘못했어요`

- **DB**: 없음 ❌

#### 패턴: `~려고 할게요`

- **DB**: 없음 ❌

### EP69

스크립트 Focus Patterns: `꿈이 뭐예요? / ~가 되고 싶어요 / 포기하고 싶어요`

#### 패턴: `꿈이 뭐예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 968  |  **DB korean**: `꿈이 뭐예요?`
- **연결 에피소드**: 없음
- **Literal**: What's your dream? What do
- **Usage**: Ask someone what their dream or aspiration in life is. It works in casual and po…
- **Examples**: 3개 ✅

#### 패턴: `~가 되고 싶어요`

- **상태**: ✅ 완전 일치
- **DB id**: 969  |  **DB korean**: `~가 되고 싶어요`
- **연결 에피소드**: 없음
- **Literal**: I want to become a Korean ~
- **Usage**: Say what profession or role you want to become in the future. It works in casual…
- **Examples**: 3개 ✅

#### 패턴: `포기하고 싶어요`

- **상태**: ✅ 완전 일치
- **DB id**: 970  |  **DB korean**: `포기하고 싶어요`
- **연결 에피소드**: 없음
- **Literal**: It's so hard that I
- **Usage**: Confess that you feel like giving up on something difficult. Say what you need, …
- **Examples**: 3개 ✅

### EP70

스크립트 Focus Patterns: `~어디에 버려요? / ~철저히 해요? / ~신경 써야겠어요`

#### 패턴: `~어디에 버려요?`

- **DB**: 없음 ❌

#### 패턴: `~철저히 해요?`

- **DB**: 없음 ❌

#### 패턴: `~신경 써야겠어요`

- **DB**: 없음 ❌

### EP71

스크립트 Focus Patterns: `딱 이 느낌이에요 / 뭔가 설레요 / 이런 순간이 소중해요`

#### 패턴: `딱 이 느낌이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 977  |  **DB korean**: `딱 이 느낌이에요`
- **연결 에피소드**: 없음
- **Literal**: This is exactly the feeling
- **Usage**: Say something perfectly matches an exact feeling or expectation. Say what you ne…
- **Examples**: 3개 ✅

#### 패턴: `뭔가 설레요`

- **DB**: 없음 ❌

#### 패턴: `이런 순간이 소중해요`

- **DB**: 없음 ❌

### EP72

스크립트 Focus Patterns: `오해가 있었던 것 같아요 / ~뜻이 아니었어요 / 충분히 이해해요`

#### 패턴: `오해가 있었던 것 같아요`

- **DB**: 없음 ❌

#### 패턴: `~뜻이 아니었어요`

- **DB**: 없음 ❌

#### 패턴: `충분히 이해해요`

- **DB**: 없음 ❌

### EP73

스크립트 Focus Patterns: `합격했어요 / 드디어 해냈어요 / ~지 않길 잘했어요`

#### 패턴: `합격했어요`

- **상태**: ✅ 완전 일치
- **DB id**: 981  |  **DB korean**: `합격했어요`
- **연결 에피소드**: 없음
- **Literal**: I passed the exam
- **Usage**: Announce that you or someone passed an exam or was accepted somewhere. Just plac…
- **Examples**: 3개 ✅

#### 패턴: `드디어 해냈어요`

- **상태**: ✅ 완전 일치
- **DB id**: 982  |  **DB korean**: `드디어 해냈어요`
- **연결 에피소드**: 없음
- **Literal**: I finally did it! I
- **Usage**: Celebrate finally accomplishing something after a long effort. It works in casua…
- **Examples**: 3개 ✅

#### 패턴: `~지 않길 잘했어요`

- **DB**: 없음 ❌

### EP74

스크립트 Focus Patterns: `~먹어봐 / 생각보다 훨씬 ~해 / 중독성 있어`

#### 패턴: `~먹어봐`

- **상태**: ✅ 완전 일치
- **DB id**: 984  |  **DB korean**: `~먹어봐`
- **연결 에피소드**: 없음
- **Literal**: Try this. It's really ~
- **Usage**: Recommend trying a particular food to a friend. Say what you need, then add 먹어봐 …
- **Examples**: 3개 ✅

#### 패턴: `생각보다 훨씬 ~해`

- **상태**: ✅ 완전 일치
- **DB id**: 985  |  **DB korean**: `생각보다 훨씬 ~해`
- **연결 에피소드**: 없음
- **Literal**: 생각보다 훨씬 ~
- **Usage**: Say something is far more or less than you expected. It works in casual and poli…
- **Examples**: 3개 ✅

#### 패턴: `중독성 있어`

- **상태**: ✅ 완전 일치
- **DB id**: 986  |  **DB korean**: `중독성 있어`
- **연결 에피소드**: 없음
- **Literal**: This song is addictive. I
- **Usage**: Tell a friend something is so addictive you can't stop enjoying it. Say what you…
- **Examples**: 3개 ✅

### EP75

스크립트 Focus Patterns: `행복해요 / ~하는 게 좋아요 / 이런 일상이 소중해요`

#### 패턴: `행복해요`

- **상태**: ✅ 완전 일치
- **DB id**: 987  |  **DB korean**: `행복해요`
- **연결 에피소드**: 없음
- **Literal**: I'm happy in this moment
- **Usage**: Simply express that you feel genuinely happy in the present moment. Say what you…
- **Examples**: 3개 ✅

#### 패턴: `~하는 게 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 988  |  **DB korean**: `~하는 게 좋아요`
- **연결 에피소드**: 없음
- **Literal**: I like listening to ~
- **Usage**: Express that you enjoy a particular activity or type of thing. It works in casua…
- **Examples**: 3개 ✅

#### 패턴: `이런 일상이 소중해요`

- **상태**: ✅ 완전 일치
- **DB id**: 989  |  **DB korean**: `이런 일상이 소중해요`
- **연결 에피소드**: 없음
- **Literal**: These everyday moments of eating
- **Usage**: Say that ordinary everyday moments feel precious and meaningful. Say what you ne…
- **Examples**: 3개 ✅

### EP76

스크립트 Focus Patterns: `알고 보면 ~해요 / ~차이가 뭐예요? / 이게 포인트예요`

#### 패턴: `알고 보면 ~해요`

- **DB**: 없음 ❌

#### 패턴: `~차이가 뭐예요?`

- **DB**: 없음 ❌

#### 패턴: `이게 포인트예요`

- **DB**: 없음 ❌

### EP77

스크립트 Focus Patterns: `다 같이 모이니까 좋아요 / 처음 만났을 때 / 여러분 덕분이에요`

#### 패턴: `다 같이 모이니까 좋아요`

- **상태**: ✅ 완전 일치
- **DB id**: 992  |  **DB korean**: `다 같이 모이니까 좋아요`
- **연결 에피소드**: 없음
- **Literal**: It's great that we're all
- **Usage**: Express happiness about getting together as a group. Just place a noun before 다 …
- **Examples**: 3개 ✅

#### 패턴: `처음 만났을 때`

- **상태**: ✅ 완전 일치
- **DB id**: 993  |  **DB korean**: `처음 만났을 때`
- **연결 에피소드**: 없음
- **Literal**: I was very nervous when
- **Usage**: Recall or refer to the time when you first met someone. It works in casual and p…
- **Examples**: 3개 ✅

#### 패턴: `여러분 덕분이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 994  |  **DB korean**: `여러분 덕분이에요`
- **연결 에피소드**: 없음
- **Literal**: I was able to come
- **Usage**: Credit everyone around you for your success or happiness. Say what you need, the…
- **Examples**: 3개 ✅

### EP78

스크립트 Focus Patterns: `얼마나 있을 거예요? / ~고 싶긴 해요 / ~을/를 위해 ~할 거예요`

#### 패턴: `얼마나 있을 거예요?`

- **상태**: ✅ 완전 일치
- **DB id**: 996  |  **DB korean**: `얼마나 있을 거예요?`
- **연결 에피소드**: 없음
- **Literal**: How long will you be
- **Usage**: Ask how long someone plans to stay at a place. Just place a noun before 얼마나 있을 거…
- **Examples**: 3개 ✅

#### 패턴: `~고 싶긴 해요`

- **DB**: 없음 ❌

#### 패턴: `~을/를 위해 ~할 거예요`

- **DB**: 없음 ❌

### EP79

스크립트 Focus Patterns: `줄 서야 해요 / 웨이팅 있어요? / 꼭 와봐야 할 곳이에요`

#### 패턴: `줄 서야 해요`

- **상태**: ✅ 완전 일치
- **DB id**: 998  |  **DB korean**: `줄 서야 해요`
- **연결 에피소드**: 없음
- **Literal**: It's a popular restaurant, so
- **Usage**: Warn that you have to wait in line at a popular place. Just place a noun before …
- **Examples**: 3개 ✅

#### 패턴: `웨이팅 있어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 999  |  **DB korean**: `웨이팅 있어요?`
- **연결 에피소드**: 없음
- **Literal**: Is there a wait right
- **Usage**: Ask if there is currently a wait or waitlist at a restaurant. Just place a noun …
- **Examples**: 3개 ✅

#### 패턴: `꼭 와봐야 할 곳이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 1000  |  **DB korean**: `꼭 와봐야 할 곳이에요`
- **연결 에피소드**: 없음
- **Literal**: Gyeongbokgung Palace is a place
- **Usage**: Strongly recommend a place as an absolute must-visit destination. Just place a n…
- **Examples**: 3개 ✅

### EP80

스크립트 Focus Patterns: `믿기지 않아 / 처음에 비하면 / 포기 안 하길 잘했어`

#### 패턴: `믿기지 않아`

- **상태**: ✅ 완전 일치
- **DB id**: 1001  |  **DB korean**: `믿기지 않아`
- **연결 에피소드**: 없음
- **Literal**: I passed. I can't believe
- **Usage**: Express shock or disbelief at something surprising or incredible. Just place a n…
- **Examples**: 3개 ✅

#### 패턴: `처음에 비하면`

- **상태**: ✅ 완전 일치
- **DB id**: 1002  |  **DB korean**: `처음에 비하면`
- **연결 에피소드**: 없음
- **Literal**: Compared to the beginning, my
- **Usage**: Compare the present situation to how things were at the very start. It works in …
- **Examples**: 3개 ✅

#### 패턴: `포기 안 하길 잘했어`

- **상태**: ✅ 완전 일치
- **DB id**: 1003  |  **DB korean**: `포기 안 하길 잘했어`
- **연결 에피소드**: 없음
- **Literal**: It was hard, but I'm
- **Usage**: Reflect that it was the right choice not to give up. Just place a noun before 포기…
- **Examples**: 3개 ✅

### EP81

스크립트 Focus Patterns: `~다고 하던데요 / ~다더라고요 / ~(으)ㄹ 줄 몰랐어요`

#### 패턴: `~다고 하던데요`

- **DB**: 없음 ❌

#### 패턴: `~다더라고요`

- **DB**: 없음 ❌

#### 패턴: `~(으)ㄹ 줄 몰랐어요`

- **DB**: 없음 ❌

### EP82

스크립트 Focus Patterns: `~게 됐어요 / ~다 보니까 / ~하다 보면`

#### 패턴: `~게 됐어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1007  |  **DB korean**: `~게 됐어요`
- **연결 에피소드**: 없음
- **Literal**: I ended up living in ~
- **Usage**: Describe naturally how something came to happen or change. Say what you need, th…
- **Examples**: 3개 ✅

#### 패턴: `~다 보니까`

- **상태**: ✅ 완전 일치
- **DB id**: 1008  |  **DB korean**: `~다 보니까`
- **연결 에피소드**: 없음
- **Literal**: As I kept practicing every day, my skills ~
- **Usage**: Describe a gradual result that came from repeatedly doing something. Say what yo…
- **Examples**: 3개 ✅

#### 패턴: `~하다 보면`

- **상태**: ✅ 완전 일치
- **DB id**: 1009  |  **DB korean**: `~하다 보면`
- **연결 에피소드**: 없음
- **Literal**: If you keep practicing, you'll get ~
- **Usage**: Encourage that natural improvement comes with continued effort. Say what you nee…
- **Examples**: 3개 ✅

### EP83

스크립트 Focus Patterns: `~한 것치고는 / 아무리 그래도 / 은근히 ~해`

#### 패턴: `~한 것치고는`

- **상태**: ✅ 완전 일치
- **DB id**: 1010  |  **DB korean**: `~한 것치고는`
- **연결 에피소드**: 없음
- **Literal**: For a first attempt, you did really ~
- **Usage**: Say someone does surprisingly well given their circumstances. Just place a noun …
- **Examples**: 3개 ✅

#### 패턴: `아무리 그래도`

- **상태**: ✅ 완전 일치
- **DB id**: 1011  |  **DB korean**: `아무리 그래도`
- **연결 에피소드**: 없음
- **Literal**: Even so, that's too much
- **Usage**: Say that even so, certain limits or principles still apply. It works in casual a…
- **Examples**: 3개 ✅

#### 패턴: `은근히 ~해`

- **상태**: ✅ 완전 일치
- **DB id**: 947  |  **DB korean**: `은근히 ~해`
- **연결 에피소드**: 없음
- **Literal**: 은근히 ~
- **Usage**: Say something has a quality in a subtle or surprisingly strong way. It works in …
- **Examples**: 3개 ✅

### EP84

스크립트 Focus Patterns: `잘 모르겠는데요 / 좀 더 생각해 봐야겠어요 / 일단은 ~해요`

#### 패턴: `잘 모르겠는데요`

- **상태**: ✅ 완전 일치
- **DB id**: 1012  |  **DB korean**: `잘 모르겠는데요`
- **연결 에피소드**: 없음
- **Literal**: I'm not really sure about
- **Usage**: Politely say you're not really sure about something. Say what you need, then add…
- **Examples**: 3개 ✅

#### 패턴: `좀 더 생각해 봐야겠어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1013  |  **DB korean**: `좀 더 생각해 봐야겠어요`
- **연결 에피소드**: 없음
- **Literal**: I can't decide right now.
- **Usage**: Say you need more time to think something through before deciding. Say what you …
- **Examples**: 3개 ✅

#### 패턴: `일단은 ~해요`

- **상태**: ✅ 완전 일치
- **DB id**: 1014  |  **DB korean**: `일단은 ~해요`
- **연결 에피소드**: 없음
- **Literal**: 일단은 ~
- **Usage**: Suggest doing something as a first step for now. It works in casual and polite s…
- **Examples**: 3개 ✅

### EP85

스크립트 Focus Patterns: `눈치챘어요? / 감이 잡혀요 / 딱 봐도 알겠어요`

#### 패턴: `눈치챘어요?`

- **상태**: ✅ 완전 일치
- **DB id**: 1015  |  **DB korean**: `눈치챘어요?`
- **연결 에피소드**: 없음
- **Literal**: Did you notice that I
- **Usage**: Ask if someone noticed or picked up on something subtle. Say what you need, then…
- **Examples**: 3개 ✅

#### 패턴: `감이 잡혀요`

- **상태**: ✅ 완전 일치
- **DB id**: 1016  |  **DB korean**: `감이 잡혀요`
- **연결 에피소드**: 없음
- **Literal**: After hearing the explanation, I'm
- **Usage**: Say you're starting to get the feel or hang of something. Say what you need, the…
- **Examples**: 3개 ✅

#### 패턴: `딱 봐도 알겠어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1017  |  **DB korean**: `딱 봐도 알겠어요`
- **연결 에피소드**: 없음
- **Literal**: You can tell just by
- **Usage**: Say something is obvious just from looking at it. It works in casual and polite …
- **Examples**: 3개 ✅

### EP86

스크립트 Focus Patterns: `흔한 일이에요? / ~(으)ㄹ 줄 몰랐어요 / 생각보다 훨씬 ~해요`

#### 패턴: `흔한 일이에요?`

- **DB**: 없음 ❌

#### 패턴: `~(으)ㄹ 줄 몰랐어요`

- **DB**: 없음 ❌

#### 패턴: `생각보다 훨씬 ~해요`

- **DB**: 없음 ❌

### EP87

스크립트 Focus Patterns: `부담스러워요 / 이제 많이 편해졌어요`

#### 패턴: `부담스러워요`

- **상태**: ✅ 완전 일치
- **DB id**: 1020  |  **DB korean**: `부담스러워요`
- **연결 에피소드**: 없음
- **Literal**: The gift is so big
- **Usage**: Express feeling pressured or overwhelmed by expectations or a situation. Say wha…
- **Examples**: 3개 ✅

#### 패턴: `이제 많이 편해졌어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1022  |  **DB korean**: `이제 많이 편해졌어요`
- **연결 에피소드**: 없음
- **Literal**: Life in Korea has become
- **Usage**: Say you have become much more comfortable in a situation. Say what you need, the…
- **Examples**: 3개 ✅

### EP88

스크립트 Focus Patterns: `외국인 티 나요? / 이제 한국말이 편해요 / 한국어로 꿈도 꿔요`

#### 패턴: `외국인 티 나요?`

- **상태**: ✅ 완전 일치
- **DB id**: 1023  |  **DB korean**: `외국인 티 나요?`
- **연결 에피소드**: 없음
- **Literal**: Do I seem like a
- **Usage**: Ask honestly whether you come across as a foreigner. Say what you need, then add…
- **Examples**: 3개 ✅

#### 패턴: `이제 한국말이 편해요`

- **상태**: ✅ 완전 일치
- **DB id**: 1024  |  **DB korean**: `이제 한국말이 편해요`
- **연결 에피소드**: 없음
- **Literal**: It was hard at first,
- **Usage**: Say that Korean now feels comfortable and natural to use. Say what you need, the…
- **Examples**: 3개 ✅

#### 패턴: `한국어로 꿈도 꿔요`

- **상태**: ✅ 완전 일치
- **DB id**: 1025  |  **DB korean**: `한국어로 꿈도 꿔요`
- **연결 에피소드**: 없음
- **Literal**: Lately, I even dream in
- **Usage**: Show deep fluency by mentioning you even dream in Korean now. Just place a noun …
- **Examples**: 3개 ✅

### EP89

스크립트 Focus Patterns: `관광지보다 로컬이 좋아 / 현지인들이 가는 곳이야 / 숨겨진 명소야`

#### 패턴: `관광지보다 로컬이 좋아`

- **상태**: ✅ 완전 일치
- **DB id**: 1026  |  **DB korean**: `관광지보다 로컬이 좋아`
- **연결 에피소드**: 없음
- **Literal**: I prefer local spots over
- **Usage**: Say you prefer local hidden spots over typical tourist attractions. Just place a…
- **Examples**: 3개 ✅

#### 패턴: `현지인들이 가는 곳이야`

- **상태**: ✅ 완전 일치
- **DB id**: 1027  |  **DB korean**: `현지인들이 가는 곳이야`
- **연결 에피소드**: 없음
- **Literal**: This is a place locals
- **Usage**: Describe a place as somewhere locals actually go, not a tourist trap. Just place…
- **Examples**: 3개 ✅

#### 패턴: `숨겨진 명소야`

- **상태**: ✅ 완전 일치
- **DB id**: 1028  |  **DB korean**: `숨겨진 명소야`
- **연결 에피소드**: 없음
- **Literal**: This place is a hidden
- **Usage**: Call out a lesser-known but wonderful hidden gem of a place. Just place a noun b…
- **Examples**: 3개 ✅

### EP90

스크립트 Focus Patterns: `요즘 핫해요 / 완전 대세예요 / 떠오르는 중이에요`

#### 패턴: `요즘 핫해요`

- **상태**: ✅ 완전 일치
- **DB id**: 1029  |  **DB korean**: `요즘 핫해요`
- **연결 에피소드**: 없음
- **Literal**: This cafe is really popular
- **Usage**: Tell someone something is very popular and trending right now. Say what you need…
- **Examples**: 3개 ✅

#### 패턴: `완전 대세예요`

- **상태**: ✅ 완전 일치
- **DB id**: 1030  |  **DB korean**: `완전 대세예요`
- **연결 에피소드**: 없음
- **Literal**: This style is totally the
- **Usage**: Say something is totally dominating as the current mainstream trend. Say what yo…
- **Examples**: 3개 ✅

#### 패턴: `떠오르는 중이에요`

- **상태**: ✅ 완전 일치
- **DB id**: 1031  |  **DB korean**: `떠오르는 중이에요`
- **연결 에피소드**: 없음
- **Literal**: This singer is on the
- **Usage**: Say something or someone is currently rising in popularity. Say what you need, t…
- **Examples**: 3개 ✅

### EP91

스크립트 Focus Patterns: `좀 그렇긴 한데요 / 아니라고 할 순 없죠 / 꼭 그런 건 아니에요`

#### 패턴: `좀 그렇긴 한데요`

- **DB**: 없음 ❌

#### 패턴: `아니라고 할 순 없죠`

- **DB**: 없음 ❌

#### 패턴: `꼭 그런 건 아니에요`

- **DB**: 없음 ❌

### EP92

스크립트 Focus Patterns: `말이 되네요 / 앞뒤가 안 맞아요 / 결국엔 ~`

#### 패턴: `말이 되네요`

- **상태**: ✅ 완전 일치
- **DB id**: 1034  |  **DB korean**: `말이 되네요`
- **연결 에피소드**: 없음
- **Literal**: Thinking about it that way,
- **Usage**: Say an explanation or argument makes sense to you. Say what you need, then add 말…
- **Examples**: 3개 ✅

#### 패턴: `앞뒤가 안 맞아요`

- **상태**: ✅ 완전 일치
- **DB id**: 1035  |  **DB korean**: `앞뒤가 안 맞아요`
- **연결 에피소드**: 없음
- **Literal**: The story doesn't add up
- **Usage**: Point out that something is inconsistent or doesn't add up. Just place a noun be…
- **Examples**: 3개 ✅

#### 패턴: `결국엔 ~`

- **상태**: ✅ 완전 일치
- **DB id**: 1036  |  **DB korean**: `결국엔 ~`
- **연결 에피소드**: 없음
- **Literal**: In the end, ~
- **Usage**: State what happened or what will happen in the end. It works in casual and polit…
- **Examples**: 3개 ✅

### EP93

스크립트 Focus Patterns: `속상했어요 / 억울했어요 / 말하고 나니까 후련해요`

#### 패턴: `속상했어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1037  |  **DB korean**: `속상했어요`
- **연결 에피소드**: 없음
- **Literal**: I was really upset when
- **Usage**: Share that something hurt your feelings or made you feel upset. Say what you nee…
- **Examples**: 3개 ✅

#### 패턴: `억울했어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1038  |  **DB korean**: `억울했어요`
- **연결 에피소드**: 없음
- **Literal**: I felt wronged because I
- **Usage**: Express feeling wrongly blamed or treated unfairly. Say what you need, then add …
- **Examples**: 3개 ✅

#### 패턴: `말하고 나니까 후련해요`

- **상태**: ✅ 완전 일치
- **DB id**: 967  |  **DB korean**: `말하고 나니까 후련해요`
- **연결 에피소드**: 없음
- **Literal**: I feel relieved now that
- **Usage**: Express relief after finally saying something that was on your mind. It works in…
- **Examples**: 3개 ✅

### EP94

스크립트 Focus Patterns: `상대방 입장에서 생각해 봐요 / 마음은 알아요 / 제가 옆에 있을게요`

#### 패턴: `상대방 입장에서 생각해 봐요`

- **DB**: 없음 ❌

#### 패턴: `마음은 알아요`

- **상태**: ✅ 완전 일치
- **DB id**: 966  |  **DB korean**: `마음은 알아요`
- **연결 에피소드**: 없음
- **Literal**: I understand your feelings, but
- **Usage**: Acknowledge politely that you understand someone's feelings or intentions. It wo…
- **Examples**: 3개 ✅

#### 패턴: `제가 옆에 있을게요`

- **DB**: 없음 ❌

### EP95

스크립트 Focus Patterns: `반전 있어요 / 여운이 남아요 / 몰입이 돼요`

#### 패턴: `반전 있어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1042  |  **DB korean**: `반전 있어요`
- **연결 에피소드**: 없음
- **Literal**: This movie has a twist.
- **Usage**: Tease that a story or situation has a surprising twist ending. Say what you need…
- **Examples**: 3개 ✅

#### 패턴: `여운이 남아요`

- **상태**: ✅ 완전 일치
- **DB id**: 1043  |  **DB korean**: `여운이 남아요`
- **연결 에피소드**: 없음
- **Literal**: Even after watching this movie,
- **Usage**: Say something leaves a lingering impression long after it ends. Say what you nee…
- **Examples**: 3개 ✅

#### 패턴: `몰입이 돼요`

- **상태**: ✅ 완전 일치
- **DB id**: 1044  |  **DB korean**: `몰입이 돼요`
- **연결 에피소드**: 없음
- **Literal**: When I read this book,
- **Usage**: Say you get totally absorbed and lost in something you're doing. Say what you ne…
- **Examples**: 3개 ✅

### EP96

스크립트 Focus Patterns: `왠지 모르게 ~해요 / 이 느낌 알아요? / 말로 표현하기 어려워요`

#### 패턴: `왠지 모르게 ~해요`

- **상태**: ✅ 완전 일치
- **DB id**: 976  |  **DB korean**: `왠지 모르게 ~해요`
- **연결 에피소드**: 없음
- **Literal**: 왠지 모르게 ~
- **Usage**: Describe a feeling you have for no clear or explainable reason. It works in casu…
- **Examples**: 3개 ✅

#### 패턴: `이 느낌 알아요?`

- **상태**: ✅ 완전 일치
- **DB id**: 975  |  **DB korean**: `이 느낌 알아요?`
- **연결 에피소드**: 없음
- **Literal**: The nervous feeling before a
- **Usage**: Ask if someone relates to or understands a specific feeling you have. Say what y…
- **Examples**: 3개 ✅

#### 패턴: `말로 표현하기 어려워요`

- **상태**: ✅ 완전 일치
- **DB id**: 974  |  **DB korean**: `말로 표현하기 어려워요`
- **연결 에피소드**: 없음
- **Literal**: This feeling is hard to
- **Usage**: Say that feelings or ideas are hard to put into words. Say what you need, then a…
- **Examples**: 3개 ✅

### EP97

스크립트 Focus Patterns: `떠나기 싫어 / ~이 그리울 것 같아 / 꼭 다시 올게`

#### 패턴: `떠나기 싫어`

- **상태**: ✅ 완전 일치
- **DB id**: 1046  |  **DB korean**: `떠나기 싫어`
- **연결 에피소드**: 없음
- **Literal**: I love Korea so much
- **Usage**: Express not wanting to leave a place or moment you love. Say what you need, then…
- **Examples**: 3개 ✅

#### 패턴: `~이 그리울 것 같아`

- **상태**: ✅ 완전 일치
- **DB id**: 1047  |  **DB korean**: `~이 그리울 것 같아`
- **연결 에피소드**: 없음
- **Literal**: I think I'll miss Korean ~
- **Usage**: Anticipate missing something or someone after you leave. Say what you need, then…
- **Examples**: 3개 ✅

#### 패턴: `꼭 다시 올게`

- **상태**: ✅ 완전 일치
- **DB id**: 1048  |  **DB korean**: `꼭 다시 올게`
- **연결 에피소드**: 없음
- **Literal**: It was so good. I'll
- **Usage**: Make a firm promise to definitely come back to a place. Say what you need, then …
- **Examples**: 3개 ✅

### EP98

스크립트 Focus Patterns: `이제 한국어로 생각해요 / 번역 안 해도 이해돼요 / 실력이 많이 늘었어요`

#### 패턴: `이제 한국어로 생각해요`

- **상태**: ✅ 완전 일치
- **DB id**: 1049  |  **DB korean**: `이제 한국어로 생각해요`
- **연결 에피소드**: 없음
- **Literal**: These days, I now think
- **Usage**: Mark a fluency milestone: thinking directly in Korean without translating. Just …
- **Examples**: 3개 ✅

#### 패턴: `번역 안 해도 이해돼요`

- **상태**: ✅ 완전 일치
- **DB id**: 1050  |  **DB korean**: `번역 안 해도 이해돼요`
- **연결 에피소드**: 없음
- **Literal**: Now I understand without translating
- **Usage**: Say you now understand Korean directly without needing to translate. Just place …
- **Examples**: 3개 ✅

#### 패턴: `실력이 많이 늘었어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1051  |  **DB korean**: `실력이 많이 늘었어요`
- **연결 에피소드**: 없음
- **Literal**: My Korean skills have improved
- **Usage**: Note that someone's ability or skill has grown significantly. Just place a noun …
- **Examples**: 3개 ✅

### EP99

스크립트 Focus Patterns: `앞으로도 잘 부탁해요 / 같이 성장한 것 같아요 / 덕분에 정말 많이 배웠어요`

#### 패턴: `앞으로도 잘 부탁해요`

- **상태**: ✅ 완전 일치
- **DB id**: 995  |  **DB korean**: `앞으로도 잘 부탁해요`
- **연결 에피소드**: 없음
- **Literal**: Please continue to take care
- **Usage**: Ask politely for continued goodwill and support going forward. It works in casua…
- **Examples**: 3개 ✅

#### 패턴: `같이 성장한 것 같아요`

- **상태**: ✅ 완전 일치
- **DB id**: 1052  |  **DB korean**: `같이 성장한 것 같아요`
- **연결 에피소드**: 없음
- **Literal**: Studying together, I feel like
- **Usage**: Reflect that both of you have grown and improved through a shared journey. Say w…
- **Examples**: 3개 ✅

#### 패턴: `덕분에 정말 많이 배웠어요`

- **상태**: ✅ 완전 일치
- **DB id**: 1053  |  **DB korean**: `덕분에 정말 많이 배웠어요`
- **연결 에피소드**: 없음
- **Literal**: Thanks to all of you,
- **Usage**: Credit someone for helping you learn or grow a lot. Just place a noun before 덕분에…
- **Examples**: 3개 ✅

### EP100

스크립트 Focus Patterns: `제 ~은/는 이제 시작이에요 / ~로 꿈을 이룰 거예요 / ~은/는 계속돼요`

#### 패턴: `제 ~은/는 이제 시작이에요`

- **DB**: 없음 ❌

#### 패턴: `~로 꿈을 이룰 거예요`

- **DB**: 없음 ❌

#### 패턴: `~은/는 계속돼요`

- **DB**: 없음 ❌

---

## 스크립트 Focus에 없는 DB 항목

- id=1236  `100화가 끝이 아니라 시작이에요`  연결 EP: 없음
- id=1237  `한국어로 꿈을 이뤄요`  연결 EP: 없음
- id=1238  `한국어 여정은 계속돼요`  연결 EP: 없음
- id=814  `챙겨야겠어요`  연결 EP: EP16
- id=815  `~이 아파요`  연결 EP: EP17
- id=827  `~었어`  연결 EP: EP21
- id=832  `~ㄹ 거야`  연결 EP: EP22
- id=865  `한국 친구 사귀고 싶어요`  연결 EP: 없음
- id=889  `~거든`  연결 EP: 없음
- id=890  `~네`  연결 EP: 없음
- id=900  `~아 줄게요`  연결 EP: 없음
- id=916  `~이 제일 좋아`  연결 EP: 없음
- id=917  `~ㄹ 거예요`  연결 EP: 없음
- id=923  `~어 봤어?`  연결 EP: 없음
- id=926  `~가르쳐줄 수 있어?`  연결 EP: 없음
- id=928  `~어떻게 해?`  연결 EP: 없음
- id=935  `~해봤어?`  연결 EP: 없음
- id=945  `좀 그렇긴 한데`  연결 EP: 없음
- id=946  `솔직하게 말해도 돼?`  연결 EP: 없음
- id=962  `~이 이렇게 ~해?`  연결 EP: 없음
- id=963  `이때가 제일 좋아`  연결 EP: 없음
- id=964  `~은 어때?`  연결 EP: 없음
- id=971  `~어디에 버려?`  연결 EP: 없음
- id=972  `~철저히 해?`  연결 EP: 없음
- id=973  `~신경 써야겠어`  연결 EP: 없음
- id=978  `오해가 있었어`  연결 EP: 없음
- id=979  `~뜻이 아니었어`  연결 EP: 없음
- id=980  `충분히 이해해`  연결 EP: 없음
- id=983  `잘 이겨냈어요`  연결 EP: 없음
- id=990  `알고 보면 쉬워`  연결 EP: 없음
- id=991  `이게 포인트야`  연결 EP: 없음
- id=997  `꿈을 위해 할 거예요`  연결 EP: 없음
- id=1004  `~라고 하던데`  연결 EP: 없음
- id=1005  `~라더라`  연결 EP: 없음
- id=1006  `~는 줄 몰랐어`  연결 EP: 없음
- id=1018  `흔한 일이야`  연결 EP: 없음
- id=1019  `알고 보면 ~해`  연결 EP: 없음
- id=1032  `아니라고 할 순 없지`  연결 EP: 없음
- id=1033  `꼭 그런 건 아니야`  연결 EP: 없음
- id=1039  `상대방 입장에서 생각해봐`  연결 EP: 없음
- id=1040  `마음은 알아`  연결 EP: 없음
- id=1041  `내가 옆에 있을게`  연결 EP: 없음
- id=1045  `어딘가 모르게 끌려요`  연결 EP: 없음
