# K-PATTO 프리코스 수정 지시사항

## 작업 1: 콘텐츠 번역 (한글 → 영어)

현재 레슨 제목은 영어인데 콘텐츠 내용이 한글로 되어있음.
모든 프리코스 레슨 콘텐츠를 영어로 번역해줘.
(사용자가 한국어를 배우러 온 외국인이므로 UI/설명은 전부 영어)

### 번역 대상
- 레슨 카드 본문 텍스트
- 설명 문구
- 퀴즈 문제 및 보기
- 안내 문구

### 번역 예시 (Lesson 01)
현재:
```
세계에서 가장 배우기 쉬운 문자예요
영어를 배울 때 알파벳을 먼저 배우죠?
한국어는 한글을 먼저 배워요.
한글은 하루면 읽을 수 있어요.
```
번역:
```
The easiest writing system in the world
Just like you learn the alphabet before English,
you learn Hangeul before Korean.
You can read Hangeul in just one day.
```

한글로 유지해야 하는 것 (번역 제외):
- 학습 대상 한글 글자 자체 (ㄱ, ㅏ, 가 등)
- 한글 예시 단어 (아이, 우유 등)
- 퀴즈에서 한글 답안

---

## 작업 2: Next 버튼 하단 고정

모든 프리코스 레슨 화면에서 Next → 버튼을
화면 하단에 고정시켜줘.

```css
/* Next 버튼 고정 */
.next-button-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  background: linear-gradient(
    to bottom,
    transparent,
    #fff 40%
  );
  z-index: 10;
}
```

- 버튼은 항상 화면 맨 아래 고정
- 스크롤해도 버튼 위치 유지
- 버튼 위에 그라디언트 페이드 효과 (콘텐츠가 뒤에 있을 때 자연스럽게)
- iOS safe area 적용 (홈 인디케이터 가리지 않도록)
- 콘텐츠 영역 하단에 버튼 높이만큼 padding-bottom 추가
  (버튼에 가려지지 않도록)

적용 범위: 모든 프리코스 레슨 화면 (Lesson 01 ~ 10)
