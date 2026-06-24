# PATTO 폴더 구조 제안서

> 작성일: 2026-06-23  
> 기준 스택: Next.js 16 (App Router) / React 19 / Tailwind CSS v4 / TypeScript / Supabase

---

## 1. 설계 원칙

| 원칙 | 내용 |
|------|------|
| App Router 기준 | `src/app/` 디렉터리 중심 |
| 도메인 분리 | 기능별 모듈 단위 구조 (`patterns`, `stories`, `learn` 등) |
| 서버/클라이언트 명시 | `server/`, `client/` 또는 `'use client'` 주석으로 경계 명확화 |
| 다국어 대비 | `i18n/` 분리, 향후 `next-intl` 도입 가능 |
| 타입 중앙화 | `src/types/` 에서 DB 스키마 기반 타입 일괄 관리 |

---

## 2. 최종 폴더 구조

```
patto/
├── docs/                          # 설계 문서 (이 파일 위치)
│   ├── db-design.md
│   └── folder-structure.md
│
├── public/
│   └── icons/                     # PWA 아이콘, favicon
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── layout.tsx             # Root layout (폰트, Provider)
│   │   ├── page.tsx               # 랜딩 / 홈 (비로그인)
│   │   │
│   │   ├── (auth)/                # 인증 관련 라우트 그룹
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts       # Supabase Auth 콜백
│   │   │
│   │   ├── (app)/                 # 로그인 후 앱 라우트 그룹
│   │   │   ├── layout.tsx         # 앱 공통 레이아웃 (네비게이션)
│   │   │   │
│   │   │   ├── dashboard/         # 대시보드 / 홈
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── patterns/          # 패턴 목록
│   │   │   │   ├── page.tsx       # Level 선택 + 패턴 그리드
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # 패턴 카드 상세
│   │   │   │
│   │   │   ├── learn/             # 학습 세션
│   │   │   │   ├── page.tsx       # 학습 시작 화면
│   │   │   │   └── [storyId]/
│   │   │   │       └── page.tsx   # 카드 플립 학습 뷰
│   │   │   │
│   │   │   ├── stories/           # 스토리 목록
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   └── settings/          # 사용자 설정
│   │   │       └── page.tsx       # 언어·난이도 설정
│   │   │
│   │   └── api/                   # API Route Handlers
│   │       ├── auth/
│   │       │   └── route.ts
│   │       └── progress/
│   │           └── route.ts       # 진도 저장 엔드포인트
│   │
│   ├── components/                # 재사용 UI 컴포넌트
│   │   ├── ui/                    # 기본 원자 컴포넌트 (shadcn 스타일)
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Card.tsx
│   │   │
│   │   ├── pattern/               # 패턴 도메인 컴포넌트
│   │   │   ├── PatternCard.tsx    # 카드 앞면 (패턴 + 의미 + 이미지)
│   │   │   ├── PatternCardBack.tsx # 카드 뒷면 (예문 5개)
│   │   │   ├── PatternFlip.tsx    # 카드 플립 애니메이션 래퍼
│   │   │   ├── PatternGrid.tsx    # 패턴 목록 그리드
│   │   │   └── DifficultySelector.tsx
│   │   │
│   │   ├── story/                 # 스토리 도메인 컴포넌트
│   │   │   ├── StoryCard.tsx
│   │   │   └── StoryProgress.tsx
│   │   │
│   │   ├── audio/                 # 오디오 재생
│   │   │   └── AudioPlayer.tsx
│   │   │
│   │   └── layout/                # 레이아웃 컴포넌트
│   │       ├── BottomNav.tsx      # 모바일 하단 네비게이션
│   │       └── Header.tsx
│   │
│   ├── lib/                       # 유틸리티 / 외부 서비스 클라이언트
│   │   ├── supabase/
│   │   │   ├── client.ts          # 클라이언트 사이드 Supabase 클라이언트
│   │   │   ├── server.ts          # 서버 사이드 Supabase 클라이언트
│   │   │   └── middleware.ts      # 세션 갱신 미들웨어 헬퍼
│   │   │
│   │   ├── storage.ts             # Supabase Storage URL 생성 헬퍼
│   │   └── utils.ts               # cn() 등 공통 유틸
│   │
│   ├── hooks/                     # React 커스텀 훅
│   │   ├── usePattern.ts          # 패턴 데이터 조회
│   │   ├── useProgress.ts         # 진도 조회·업데이트
│   │   └── useAudio.ts            # 오디오 재생 제어
│   │
│   ├── actions/                   # Next.js Server Actions
│   │   ├── progress.ts            # 진도 업데이트 액션
│   │   └── settings.ts            # 사용자 설정 저장 액션
│   │
│   ├── queries/                   # Supabase 쿼리 함수 (서버 전용)
│   │   ├── patterns.ts            # 패턴 조회 쿼리
│   │   ├── examples.ts            # 예문 조회 쿼리
│   │   ├── stories.ts             # 스토리 조회 쿼리
│   │   └── progress.ts            # 진도 조회 쿼리
│   │
│   ├── types/                     # TypeScript 타입 정의
│   │   ├── db.ts                  # Supabase 생성 타입 (supabase gen types)
│   │   ├── pattern.ts             # 패턴 관련 도메인 타입
│   │   ├── story.ts               # 스토리 관련 도메인 타입
│   │   └── user.ts                # 사용자 관련 타입
│   │
│   └── constants/                 # 상수
│       ├── levels.ts              # LEVELS, MAX_PATTERNS_PER_LEVEL
│       ├── difficulties.ts        # DIFFICULTIES = ['normal', 'advanced', 'native']
│       └── languages.ts           # SUPPORTED_LANGUAGES
│
├── supabase/                      # Supabase 로컬 개발 설정
│   ├── migrations/                # SQL 마이그레이션 파일
│   │   └── 001_initial_schema.sql
│   └── seed/                      # 초기 데이터 시드
│       └── 001_languages.sql
│
├── middleware.ts                  # Next.js 미들웨어 (세션 갱신)
├── next.config.ts
├── tailwind.config.ts             # (추가 예정)
└── package.json
```

---

## 3. 핵심 디렉터리 역할 요약

### `src/app/` — 라우트

| 경로 | 역할 |
|------|------|
| `(auth)/login` | 소셜 로그인 / 이메일 로그인 |
| `(app)/dashboard` | 오늘의 학습 현황, 추천 스토리 |
| `(app)/patterns` | 레벨별 패턴 브라우징 |
| `(app)/learn/[storyId]` | 카드 플립 학습 세션 |
| `(app)/stories` | 스토리 목록 및 진도 확인 |
| `(app)/settings` | 학습 언어·난이도 설정 |

---

### `src/queries/` — 서버 쿼리

Server Component 및 Server Action에서만 사용.  
클라이언트 컴포넌트에서는 직접 호출 금지 → `hooks/` 경유.

```ts
// 예시: src/queries/patterns.ts
export async function getPatternsByLevel(
  languageCode: string,
  level: 1 | 2 | 3,
  uiLang: string
) { ... }
```

---

### `src/types/` — 타입 전략

```ts
// src/types/db.ts — Supabase CLI 자동 생성
// $ npx supabase gen types typescript --local > src/types/db.ts

// src/types/pattern.ts — 앱 레이어 타입 (DB 타입 조합)
export type PatternWithTranslation = {
  id: string
  level: 1 | 2 | 3
  order_index: number
  pattern_text: string   // pattern_translations에서 JOIN
  meaning: string
  image_url: string | null
}
```

---

## 4. 환경 변수 (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 서버 전용, 절대 클라이언트 노출 금지
```

---

## 5. 추후 추가될 패키지 (설계 단계 메모)

| 패키지 | 용도 |
|--------|------|
| `@supabase/supabase-js` | Supabase 클라이언트 |
| `@supabase/ssr` | Next.js App Router용 세션 관리 |
| `next-intl` | 다국어 UI (향후) |
| `framer-motion` | 카드 플립 애니메이션 |
| `zustand` | 학습 세션 상태 관리 (선택) |

---

## 6. 현재 상태 vs 목표 상태

| 항목 | 현재 | 목표 |
|------|------|------|
| `src/app/` | favicon만 존재 | 위 라우트 구조 구현 |
| DB | 없음 | Supabase 연결 + 스키마 적용 |
| 컴포넌트 | 없음 | 패턴 카드 + 플립 UI |
| 콘텐츠 | 없음 | Level 1 패턴 500개 시드 |
