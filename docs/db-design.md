# PATTO DB 설계서

> 작성일: 2026-06-23  
> 기준 스택: Next.js 16 / React 19 / Supabase (PostgreSQL)  
> 설계 원칙: 다국어 확장 가능, 사전 구축(pre-built) 방식, 실시간 생성 없음

---

## 1. 설계 원칙

| 원칙 | 내용 |
|------|------|
| 다국어 분리 | 패턴 구조(schema)와 텍스트 콘텐츠(content)를 분리하여 언어 확장 시 스키마 변경 불필요 |
| 사전 구축 | 모든 패턴·예문·이미지·스토리는 DB에 미리 저장, 런타임 AI 생성 없음 |
| 난이도 분리 | 예문은 Normal / Advanced / Native 3단계로 분리 저장 |
| UUID 기본키 | 모든 테이블에 UUID 사용 (Supabase 기본값 `gen_random_uuid()`) |

---

## 2. 언어(Language) 테이블

```sql
-- 지원 언어 목록
CREATE TABLE languages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code       TEXT NOT NULL UNIQUE,   -- 'en', 'ko', 'ja', 'es'
  name       TEXT NOT NULL,          -- 'English', '한국어', '日本語'
  is_active  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

초기 데이터:

| code | name | is_active |
|------|------|-----------|
| en | English | true |
| ko | 한국어 | false |
| ja | 日本語 | false |
| es | Español | false |

---

## 3. 패턴(Pattern) 테이블

패턴의 구조 정보(레벨, 순서)는 언어 독립적으로 저장하고,
텍스트 표현(패턴 문자열, 의미)은 별도 번역 테이블에 저장한다.

```sql
-- 패턴 구조 (언어 독립)
CREATE TABLE patterns (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id  UUID NOT NULL REFERENCES languages(id),
  level        SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
  order_index  INT NOT NULL,                    -- 레벨 내 순서 (1부터 시작)
  image_id     UUID REFERENCES pattern_images(id),
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (language_id, level, order_index)
);

-- 패턴 텍스트 번역 (UI 표시 언어 기준)
-- native_lang: 학습 언어 (패턴 문자열)
-- ui_lang: UI 표시 언어 (의미 설명)
CREATE TABLE pattern_translations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id  UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  ui_lang     TEXT NOT NULL REFERENCES languages(code),  -- 설명 표시 언어
  pattern_text TEXT NOT NULL,   -- 예: "I want to ~"
  meaning      TEXT NOT NULL,   -- 예: "~하고 싶다"
  UNIQUE (pattern_id, ui_lang)
);
```

### 레벨별 패턴 수

| Level | 설명 | 패턴 수 |
|-------|------|---------|
| 1 | 핵심 패턴 | 500개 |
| 2 | 확장 패턴 | 1,500개 |
| 3 | 고급 패턴 | 2,000개 |

---

## 4. 예문(Example) 테이블

```sql
-- 예문 난이도 enum
CREATE TYPE difficulty_level AS ENUM ('normal', 'advanced', 'native');

-- 예문 (패턴 1개당 난이도별 5개 = 최대 15개)
CREATE TABLE examples (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id  UUID NOT NULL REFERENCES patterns(id) ON DELETE CASCADE,
  difficulty  difficulty_level NOT NULL,
  order_index SMALLINT NOT NULL CHECK (order_index BETWEEN 1 AND 5),
  sentence    TEXT NOT NULL,        -- 학습 언어 예문
  audio_url   TEXT,                 -- Supabase Storage 경로
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (pattern_id, difficulty, order_index)
);

-- 예문 번역 (UI 언어별)
CREATE TABLE example_translations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  example_id   UUID NOT NULL REFERENCES examples(id) ON DELETE CASCADE,
  ui_lang      TEXT NOT NULL REFERENCES languages(code),
  translation  TEXT NOT NULL,   -- 번역문
  UNIQUE (example_id, ui_lang)
);
```

### 난이도 정의

| 난이도 | 설명 |
|--------|------|
| normal | 일상 회화 수준, 짧고 명확한 문장 |
| advanced | 조금 더 긴 문장, 다양한 어휘 |
| native | 원어민 자연 표현, 관용구 포함 가능 |

---

## 5. 이미지(Image) 테이블

```sql
-- 패턴 대표 이미지 메타데이터
CREATE TABLE pattern_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_key TEXT NOT NULL UNIQUE,  -- Supabase Storage 경로 (예: 'patterns/en/001.webp')
  alt_text    TEXT,                  -- 접근성 설명
  style       TEXT NOT NULL DEFAULT 'minimal_3d',  -- 이미지 스타일 태그
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Supabase Storage 버킷 구조

```
patto-assets/
├── patterns/
│   ├── en/
│   │   ├── 001.webp     (Level 1, order 1)
│   │   ├── 002.webp
│   │   └── ...
│   ├── ko/
│   └── ja/
└── audio/
    └── en/
        ├── ex_001_normal_1.mp3
        └── ...
```

### 이미지 정책

- 포맷: WebP (품질 90, 최대 800×800px)
- 스타일: 미니멀 3D 일러스트, 성인 친화적, 단순 배경
- 금지: 실사, Duolingo 키즈 스타일
- 목표: Apple 교육 앱 수준

---

## 6. 스토리(Story) 테이블

```sql
-- 스토리 (패턴 5개 묶음)
CREATE TABLE stories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_id  UUID NOT NULL REFERENCES languages(id),
  level        SMALLINT NOT NULL CHECK (level IN (1, 2, 3)),
  order_index  INT NOT NULL,         -- 스토리 번호 (1부터 시작)
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (language_id, level, order_index)
);

-- 스토리 텍스트 (제목, 설명)
CREATE TABLE story_translations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id     UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  ui_lang      TEXT NOT NULL REFERENCES languages(code),
  title        TEXT NOT NULL,
  description  TEXT,
  UNIQUE (story_id, ui_lang)
);

-- 스토리-패턴 연결 (패턴 5개 고정)
CREATE TABLE story_patterns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id    UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  pattern_id  UUID NOT NULL REFERENCES patterns(id),
  order_index SMALLINT NOT NULL CHECK (order_index BETWEEN 1 AND 5),
  UNIQUE (story_id, order_index),
  UNIQUE (story_id, pattern_id)
);
```

### 스토리 구성 규칙

- 패턴 5개 = 스토리 1개
- Level 1 기준: 500패턴 → 100 스토리
- Level 2 기준: 1,500패턴 → 300 스토리
- Level 3 기준: 2,000패턴 → 400 스토리

---

## 7. 사용자(User) 테이블

```sql
-- 사용자 프로필 (Supabase Auth 연동)
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  ui_lang       TEXT NOT NULL DEFAULT 'ko' REFERENCES languages(code),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 사용자 학습 언어 설정
CREATE TABLE user_language_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  native_lang     TEXT NOT NULL REFERENCES languages(code),  -- 모국어
  learning_lang   TEXT NOT NULL REFERENCES languages(code),  -- 학습 언어
  difficulty      difficulty_level NOT NULL DEFAULT 'normal',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, native_lang, learning_lang)
);
```

---

## 8. 학습 진도(Progress) 테이블

```sql
-- 패턴별 학습 진도
CREATE TABLE user_pattern_progress (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_id     UUID NOT NULL REFERENCES patterns(id),
  difficulty     difficulty_level NOT NULL,
  status         TEXT NOT NULL DEFAULT 'unseen'
                   CHECK (status IN ('unseen', 'learning', 'reviewing', 'mastered')),
  review_count   INT NOT NULL DEFAULT 0,
  last_reviewed  TIMESTAMPTZ,
  next_review    TIMESTAMPTZ,              -- SRS 다음 복습일 (향후 확장)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pattern_id, difficulty)
);

-- 스토리 완료 기록
CREATE TABLE user_story_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  story_id     UUID NOT NULL REFERENCES stories(id),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, story_id)
);
```

---

## 9. 전체 ERD 요약

```
languages
  ↑
  ├── patterns ─────────────── pattern_translations
  │     ↑                            (ui_lang)
  │     ├── pattern_images
  │     ├── examples ────────── example_translations
  │     │     (difficulty)            (ui_lang)
  │     └── story_patterns
  │               ↓
  └── stories ──────────────── story_translations
        (level, order_index)        (ui_lang)

user_profiles
  ├── user_language_settings
  ├── user_pattern_progress
  └── user_story_progress
```

---

## 10. Supabase RLS(Row Level Security) 기본 정책

```sql
-- 콘텐츠 테이블: 모든 인증 사용자 읽기 허용
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "patterns_read" ON patterns FOR SELECT USING (is_published = true);

-- 진도 테이블: 본인 데이터만 접근
ALTER TABLE user_pattern_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_own" ON user_pattern_progress
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## 11. MVP 초기 데이터 볼륨 (Level 1 기준)

| 항목 | 수량 |
|------|------|
| 패턴 | 500개 |
| 이미지 | 500개 (WebP, ~800×800px) |
| 예문 (normal) | 2,500개 |
| 예문 (advanced) | 2,500개 |
| 예문 (native) | 2,500개 |
| 스토리 | 100개 |
| 총 예문 수 | 7,500개 |
