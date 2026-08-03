# K-PATTO 패턴 설명 텍스트 (❗ 아코디언)

## 작성 규칙
- 영어로 작성 (1차 지원 언어)
- 3줄 이내로 간결하게
- 구조: 💡 How to use + 슬롯 공식 + 예시 1개
- 슬롯 공식: [   ] 로 빈칸 표시
- 나중에 ja/es 번역 추가 예정 (구조 동일)

---

## EP01 — 카페에서

### PATTERN 001: ~이에요 / 예요
```
💡 How to use
Use this to say what something IS.

[noun] + 이에요 (ends in consonant)
[noun] + 예요 (ends in vowel)

김치 + 예요 → 김치예요. (This is kimchi.)
학생 + 이에요 → 학생이에요. (I'm a student.)
```

### PATTERN 002: ~주세요
```
💡 How to use
Put what you want BEFORE 주세요.

[what you want] + 주세요

물 + 주세요 → 물 주세요. (Water, please.)
Any noun works — just swap it in!
```

### PATTERN 003: ~뭐예요?
```
💡 How to use
Point at something and ask what it is.

[this/that] + 뭐예요?

이거 = this / 저거 = that
이거 뭐예요? (What is this?)
```

### PATTERN 004: ~있어요 / 없어요
```
💡 How to use
Ask if something exists or is available.

[noun] + 있어요? → Does ~ exist? / Do you have ~?
[noun] + 없어요. → There is no ~ / I don't have ~

와이파이 있어요? (Is there Wi-Fi?)
자리 없어요. (There are no seats.)
```

### PATTERN 005: ~얼마예요?
```
💡 How to use
Ask the price of anything.

[noun] + 얼마예요?

이거 얼마예요? (How much is this?)
Just point and ask — works everywhere!
```

---

## EP02 — 지하철에서

### PATTERN 001: ~어디예요?
```
💡 How to use
Ask where something is.

[place/thing] + 어디예요?

화장실 어디예요? (Where is the bathroom?)
Swap the noun to ask about anything!
```

### PATTERN 002: ~에 가고 싶어요
```
💡 How to use
Say where you want to go.

[place] + 에 가고 싶어요

홍대에 가고 싶어요. (I want to go to Hongdae.)
~에 = "to" a place / 가고 싶어요 = want to go
```

### PATTERN 003: ~어떻게 가요?
```
💡 How to use
Ask for directions to any place.

[place] + 어떻게 가요?

홍대 어떻게 가요? (How do I get to Hongdae?)
No particle needed — just place + 어떻게 가요?
```

### PATTERN 004: [수량] ~ 주세요
```
💡 How to use
Order or request a specific quantity.

[item] + [number + counter] + 주세요

표 두 장 주세요. (Two tickets, please.)
물 한 병 주세요. (One bottle of water, please.)
```

### PATTERN 005: ~좋아요
```
💡 How to use
Say you like something or it's good.

[noun] + 좋아요

서울 좋아요. (I like Seoul.)
Works for both "I like ~" and "~ is good!"
```

---

## 앞으로 에피소드 작성 템플릿

새 에피소드 패턴 설명 작성 시 아래 형식 그대로 복사해서 사용:

```
### PATTERN 00X: [패턴형태]
\`\`\`
💡 How to use
[한 줄 설명 — 언제/왜 쓰는지]

[슬롯 공식]
[noun/verb] + [패턴]

[예시 1] ([영어 번역])
[한 줄 팁 또는 추가 예시]
\`\`\`
```

### 작성 체크리스트
- [ ] 3줄 이내
- [ ] 슬롯 공식 [ ] 표기
- [ ] 예시 최소 1개
- [ ] 끝에 팁 1줄 (선택)
- [ ] 영어로 작성
- [ ] ja/es 칸 비워두기 (나중에 추가)

---

## Claude Code 지시사항

### 구현 내용
1. 패턴 카드 우상단 ❗ 아이콘 추가 (북마크 🔖 왼쪽)
2. ❗ 클릭 시 패턴 카드와 예문 사이에 설명 블록 아코디언으로 삽입
3. 한 번 더 클릭하면 닫힘
4. 설명 블록 스타일:
   - 배경: 연한 그린 (기존 패턴 카드 색상 참고)
   - 폰트: 모노스페이스 또는 본문체
   - 슬롯 공식은 굵게 표시
5. EP01 패턴 5개 + EP02 패턴 5개 설명 텍스트 위 내용으로 적용
6. 앞으로 에피소드 추가 시 동일 구조로 확장 가능하게 설계
