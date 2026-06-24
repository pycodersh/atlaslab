# PATTO 현황 분석 보고서

> 작성일: 2026-06-23  
> 분석 대상: 전체 소스 코드 (app/, components/, lib/, data/, hooks/, types/)

---

## 1. 현재 구현 완료 기능

### UI / 화면

| 화면 | 경로 | 상태 |
|------|------|------|
| 학습 화면 | `/learn` | ✅ 완성 |
| 기록 화면 | `/records` | ✅ UI만 완성 (데이터 하드코딩) |
| 설정 화면 | `/settings` | ✅ UI만 완성 (클릭 미동작) |

### 핵심 학습 컴포넌트

| 컴포넌트 | 기능 |
|----------|------|
| `PatternCard` | 카드 앞면(패턴+이미지 플레이스홀더) / 뒷면(예문 5개) 플립 애니메이션 |
| `StoryCardEngine` | 카드 인덱스 관리, 앞/뒤 이동, MiniStory 전환, 페이지 넘김 애니메이션 |
| `MiniStory` | 패턴 5개를 하나의 문장으로 연결한 미니 스토리 표시, 읽기 횟수 카운터 |
| `StoryProgress` | 현재 카드 위치 / 전체 스토리 진행 표시 |
| `BottomNav` | 학습·기록·설정 탭 네비게이션 |
| `AudioButton` | 버튼 UI 존재 (실제 재생 미연결) |

### 데이터 / 로직

| 항목 | 상태 |
|------|------|
| SRS(간격 반복 학습) 엔진 | ✅ 완성 — 6단계 복습 스케줄 (1/3/7/14/30/60일) |
| 학습 진도 localStorage 저장 | ✅ 완성 |
| 연속 학습일(streak) 계산 | ✅ 완성 |
| 즐겨찾기 문장 저장 | ✅ 완성 (타입/로직) |
| 오늘의 큐 빌더 | ✅ 완성 (신규+복습 혼합) |
| 예문 생성기 (`exampleGenerator`) | ✅ 완성 (하드코딩 예문 풀에서 선택) |
| 미니스토리 생성기 (`storyGenerator`) | ✅ 완성 (예문 합성 방식) |
| 사용자 설정 타입 | ✅ 완성 |

---

## 2. 미완성 기능

| 기능 | 현재 상태 | 비고 |
|------|-----------|------|
| 오디오 재생 | 버튼만 있고 실제 재생 없음 | `AudioButton.onClick` 미연결 |
| 설정 변경 | UI만 있고 저장/반영 없음 | `settings/page.tsx` 정적 |
| 기록 화면 실데이터 | 하드코딩 캘린더 dots | `useLearningProgress` 미사용 |
| 패턴 이미지 | ImageIcon 플레이스홀더 | 실제 이미지 없음 |
| 즐겨찾기 UI | 타입/로직은 있으나 UI 없음 | `FavoriteButton.tsx` 존재하나 어디에도 미사용 |
| 복습 화면 | 로직은 완성, 라우트/UI 없음 | `/review` 페이지 없음 |
| 인증 (로그인) | 없음 | Supabase Auth 미연결 |
| 다음 스토리로 이동 | 스토리 1개만 하드코딩 | `stories[0]` 고정 |
| 오늘의 큐 연동 | `buildTodayQueue` 완성이나 미사용 | `learn/page.tsx`가 직접 `stories[0]` 사용 |

---

## 3. Mock 데이터 사용 부분

### 하드코딩 데이터

| 위치 | 내용 |
|------|------|
| `data/stories.ts` | 스토리 1개, 패턴 5개, 예문 각 5개 — 전부 하드코딩 |
| `data/review-examples.ts` | 복습용 예문 패턴 ID 1~5번에만 하드코딩 |
| `lib/ai/exampleGenerator.ts` | 예문 생성이 Claude API가 아닌 **로컬 하드코딩 배열**에서 선택 |
| `lib/ai/storyGenerator.ts` | 미니스토리도 하드코딩 예문 조합 |
| `app/records/page.tsx` | 캘린더 `calendarDots` 배열 하드코딩 (`Mock` 배지까지 표시됨) |
| `app/settings/page.tsx` | 설정값 배열 하드코딩 (`"입문"`, `"일상"` 등) |
| `app/learn/page.tsx` | `stories[0]` 고정 — 항상 1번 스토리만 표시 |
| `StoryCardEngine.tsx` | `totalStories = 100` 하드코딩 |

---

## 4. 실제 DB 연결이 필요한 부분

| 항목 | 연결해야 할 테이블 |
|------|-------------------|
| 패턴 데이터 로딩 | `patterns` + `pattern_translations` |
| 예문 데이터 로딩 | `examples` + `example_translations` |
| 스토리 데이터 로딩 | `stories` + `story_translations` + `story_patterns` |
| 패턴 이미지 | `pattern_images` + Supabase Storage |
| 오디오 재생 | `examples.audio_url` + Supabase Storage |
| 학습 진도 저장 | `user_pattern_progress` (현재 localStorage) |
| 스토리 완료 기록 | `user_story_progress` (현재 localStorage) |
| 사용자 설정 | `user_language_settings` (현재 localStorage) |
| 즐겨찾기 | `user_pattern_progress` 또는 별도 테이블 |
| 기록 화면 캘린더 | `user_pattern_progress.last_reviewed` |

---

## 5. 현재 구조의 문제점

### 5-1. 데이터 구조 불일치

현재 `types/story.ts` 의 타입과 DB 스키마가 다르다.

```ts
// 현재 타입 (localStorage 기반)
type Pattern = {
  patternId: number        // ← 정수 ID
  patternText: string
  originalExamples: string[]  // ← 예문이 배열로 평탄화
}

// DB 스키마
patterns.id = UUID
examples = 별도 테이블 (difficulty별로 분리)
```

DB 연결 시 타입을 전면 교체해야 하며, 이에 의존하는 컴포넌트 전체를 수정해야 한다.

### 5-2. 예문 난이도 구조 없음

현재는 예문 난이도(normal/advanced/native) 개념이 없다.  
`originalExamples: string[]` 하나의 배열에 모두 담겨 있다.  
DB에는 난이도가 분리되어 있으나 UI에 선택 기능이 없다.

### 5-3. 이미지가 전혀 없음

카드 앞면의 이미지 영역이 `ImageIcon` 플레이스홀더로만 구현됨.  
PATTO의 핵심 설계 원칙인 **이미지 연상 학습**이 현재 동작하지 않는다.

### 5-4. 오디오가 전혀 없음

`AudioButton`이 클릭해도 아무것도 안 된다. `onClick` prop을 넘겨주는 쪽도 없다.

### 5-5. 학습 진도가 브라우저에 갇혀 있음

모든 진도가 `localStorage`에만 저장된다.  
- 다른 기기에서 이어서 학습 불가
- 브라우저 캐시 삭제 시 데이터 소멸
- 사용자 통계 분석 불가

### 5-6. 스토리 1개만 존재

`data/stories.ts`에 스토리가 1개뿐이고, `learn/page.tsx`가 `stories[0]`을 하드코딩으로 사용한다.  
다음 스토리로 넘어가는 로직 자체가 없다.

### 5-7. AI 예문 생성이 가짜

`lib/ai/` 폴더가 있고 `generateExamples`, `generateMiniStory` 함수가 있지만,  
실제 Claude API 호출이 없다. 하드코딩 배열에서 예문을 선택하는 방식이다.  
파일명과 폴더명(`ai/`)이 실제 동작을 오해하게 만든다.

### 5-8. 복습 기능이 미완성

SRS 엔진(`lib/learning-progress.ts`)은 정교하게 구현되어 있으나  
복습 화면(`/review`)이 없어서 동작하지 않는다.  
`buildTodayQueue`도 완성됐으나 아무 데서도 호출되지 않는다.

---

## 6. 향후 4,000 패턴 확장 시 병목 예상 구간

### 6-1. 가장 위험: localStorage 용량 한계

현재 진도 전체를 `localStorage` 단일 JSON으로 저장한다.  
4,000개 패턴 × 3 난이도 × 복습 기록 = 수만 건의 데이터가 하나의 키에 쌓인다.  
localStorage 한도는 약 5MB이며, 즐겨찾기·생성예문까지 누적되면 **한도 초과로 데이터 소실** 위험이 있다.

### 6-2. 예문 생성기 패턴 ID 하드코딩

`exampleGenerator.ts`의 `ageExamples`, `interestExamples`, `fallbackByPattern`이  
패턴 ID 1~5번에만 매핑되어 있다.  
4,000패턴으로 확장하면 **예문 풀을 4,000 × (연령대 4 + 관심분야 6) 개 항목으로 하드코딩**해야 하는데, 이는 불가능하다.  
→ 사전 구축 DB 방식으로 전환 필수.

### 6-3. 데이터 로딩 — 초기 번들 크기

`data/stories.ts`가 현재는 1개 스토리(소량)지만,  
4,000패턴 × 예문 데이터를 정적 파일로 임포트하면 번들이 수MB가 된다.  
→ DB 조회 + 페이지네이션 구조로 전환 필수.

### 6-4. 이미지 관리

4,000개 패턴 × 1 이미지 = 4,000개 WebP 파일.  
Supabase Storage 버킷 구조와 CDN 캐싱 전략 없이는 느린 로딩이 불가피하다.

### 6-5. 오디오 관리

패턴당 예문 15개(난이도 3 × 5개) × 4,000패턴 = 60,000개 MP3 파일.  
사전 생성 방식이면 스토리지 비용과 빌드 시간이 급증한다.  
→ TTS API 온디맨드 방식 또는 웹 Speech API 대안 검토 필요.

### 6-6. SRS 복습 큐 규모

사용자가 모든 패턴을 학습하면 복습 큐가 최대 4,000 × 6단계 = 24,000개 항목이 된다.  
현재는 전체를 메모리에 로드 후 필터링하는 방식이라 성능 저하가 예상된다.  
→ DB 쿼리에서 `next_review <= today` 조건으로 필터링해야 한다.

---

## 7. 우선순위별 TODO 리스트

### P0 — 지금 당장 (MVP 완성 전제)

| # | 작업 | 이유 |
|---|------|------|
| 1 | `data/stories.ts` → DB 연결로 교체 | 스토리 1개로는 앱 의미 없음 |
| 2 | `types/story.ts` DB 스키마 맞게 재정의 | 타입 불일치가 모든 작업을 막고 있음 |
| 3 | Level 1 패턴 데이터 최소 10개 DB 삽입 | 실제 학습 흐름 테스트 가능 |
| 4 | 다음 스토리로 이동 로직 연결 | 현재 1번 스토리 무한 반복 |

### P1 — 핵심 기능 완성

| # | 작업 | 이유 |
|---|------|------|
| 5 | 예문 난이도 선택 UI | PATTO 설계 원칙의 핵심 |
| 6 | 패턴 이미지 표시 | 이미지 연상 학습이 핵심 차별점 |
| 7 | 오디오 재생 연결 (Web Speech API 또는 Supabase Storage) | 청각 학습 없이 패턴 체화 어려움 |
| 8 | 기록 화면 실데이터 연결 | 현재 완전히 가짜 |
| 9 | 설정 화면 실제 저장/반영 | 클릭해도 아무것도 안 됨 |

### P2 — 사용자 경험 향상

| # | 작업 | 이유 |
|---|------|------|
| 10 | 복습 화면(`/review`) 구현 | SRS 엔진이 완성됐는데 진입점 없음 |
| 11 | 즐겨찾기 UI 구현 | `FavoriteButton`이 존재하나 연결 안 됨 |
| 12 | 오늘의 큐(`buildTodayQueue`) 학습 화면에 연결 | 신규/복습 혼합 학습 가능 |
| 13 | 학습 진도 localStorage → Supabase 마이그레이션 | 멀티디바이스, 데이터 안전성 |

### P3 — 확장 준비

| # | 작업 | 이유 |
|---|------|------|
| 14 | Supabase Auth 로그인 구현 | 진도 클라우드 저장의 전제 |
| 15 | `lib/ai/` 폴더명 → `lib/local/`로 변경 | 진짜 AI가 아닌 코드가 AI처럼 보임 |
| 16 | Level 1 패턴 500개 전체 DB 삽입 | 실제 서비스 가능 상태 |
| 17 | 이미지 500개 생성 및 Storage 업로드 | 시각 학습 완성 |
| 18 | 다국어 UI 대응 (`next-intl` 도입) | 한국어 외 UI 지원 |
