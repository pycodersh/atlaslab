# PATTO QA 알려진 이슈 — 2026-07-15

## BUG-001: 영어 모드에서 로그인 버튼 한국어 하드코딩

| 항목 | 내용 |
|---|---|
| **ID** | BUG-001 |
| **심각도** | High |
| **카테고리** | 다국어 / i18n |
| **발견 경로** | `localization.spec.ts` — 영어 모드 한글 버튼 검사 |
| **재현율** | 5/5 (항상 재현) |
| **경로** | `/patto/settings` |

**증상**
영어 언어 설정(`patto-lang: 'en'`) 상태에서 Settings 페이지의 소셜 로그인 버튼이 한국어로 표시됨:
- "Google로 계속하기" (기대: "Continue with Google")
- "이메일로 계속하기" (기대: "Continue with Email")
- "카카오로 계속하기" (기대: "Continue with Kakao")

**추정 원인**
`components/auth/AuthButtons.tsx` 내 버튼 텍스트가 i18n 훅을 사용하지 않고 한국어 문자열로 하드코딩됨.

**수정 방향**
```tsx
// Before
<button>Google로 계속하기</button>

// After
<button>{t('auth.continueWithGoogle')}</button>
```

---

## BUG-002: 영어 모드에서 PWA 설치 배너 한국어 하드코딩

| 항목 | 내용 |
|---|---|
| **ID** | BUG-002 |
| **심각도** | Medium |
| **카테고리** | 다국어 / i18n |
| **발견 경로** | `localization.spec.ts` — 영어 모드 한글 버튼 검사 |
| **재현율** | 5/5 (항상 재현) |
| **경로** | `/patto/settings` |

**증상**
영어 언어 설정 상태에서 PWA 설치 배너가 한국어로 표시됨:
- "PATTO를 홈 화면에 추가" (기대: "Add PATTO to Home Screen")
- "더 빠르게 PATTO를 실행할 수 있어요." (기대: "Launch PATTO faster from your home screen.")
- "나중에" (기대: "Later")
- "추가하기" (기대: "Add")

**추정 원인**
PWA 설치 배너 컴포넌트가 번역 시스템 밖에 있음.

**수정 방향**
번역 키 추가 후 `useT()` 또는 `usePreferences().lang` 적용.

---

## BUG-003: 온보딩 오브 액션 카드 — headless 환경 미표시 (조사 필요)

| 항목 | 내용 |
|---|---|
| **ID** | BUG-003 |
| **심각도** | Medium (조사 중) |
| **카테고리** | 온보딩 / TrainerOrb |
| **발견 경로** | `onboarding.spec.ts` — 첫 방문 오브 액션 카드 표시 |
| **재현율** | 5/5 (headless에서 항상 재현) |
| **경로** | `/patto/home` (first_visit 시뮬레이션) |

**증상**
`patto_visit_count` 를 제거하고 홈에 접속해도 TrainerOrb의 액션 카드("PATTO 소개를 받아볼까요?")가 10초 내에 DOM에 나타나지 않음. 실제 브라우저에서는 표시될 수 있음.

**가능한 원인 후보**
1. `patto_visit_count` 가 아닌 다른 localStorage 키로 first_visit 판별
2. TrainerOrb의 visit count 읽기 로직이 hydration 이후 실행되어 headless 타이밍 이슈
3. 오브 렌더링이 특정 CSS animation 또는 조건부 렌더 로직에 의존
4. 실제 앱에서는 `patto_visit_count === undefined` 일 때 첫 방문으로 처리하지 않을 수 있음

**현재 테스트 처리**
`console.warn('[WARN] BUG-003')` 로 경고 후 콘솔 에러 체크만 수행 (soft assertion).

**조사 필요 파일**
- `components/TrainerOrb.tsx` 또는 유사 파일 — visit count 읽기 로직 확인
- localStorage key 이름 확인 (`patto_visit_count` vs `patto-visit-count`)

---

## 테스트 환경 이슈 (앱 버그 아님)

### ENV-001: Supabase WebSocket — networkidle 미도달

**설명**: Supabase 리얼타임 연결이 브라우저의 `networkidle` 상태를 방해해 30s 내 `waitForLoadState('networkidle')` 타임아웃. `domcontentloaded`로 교체하여 해결.

### ENV-002: Turbopack 첫 빌드 지연

**설명**: 첫 테스트 실행 시 Turbopack이 청크를 컴파일하느라 첫 goto가 15-20s 걸릴 수 있음. 테스트 timeout을 60s로 설정하거나 warm-up 단계 추가 권장.

### ENV-003: Writing Studio textarea — 게스트 비활성화 (설계된 동작)

**설명**: `GET /patto/api/writing` 가 비로그인 사용자에게 `{remaining: 0}` 을 반환하여 textarea가 `disabled` 상태. 이는 버그가 아닌 의도된 설계. 테스트는 이 동작을 검증하도록 수정됨.

---

*업데이트: 2026-07-15*
