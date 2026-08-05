-- ============================================================
-- Migration 029: Phase 1 — Emergency Write Lockdown
-- ============================================================
-- 이 마이그레이션은 028_admin_table_rls.sql 을 완전히 흡수한다.
-- (028은 작성됐으나 프로덕션 DB에 적용된 적 없음 — 행동 테스트로 확인)
--
-- ── 행동 테스트 결과 (Prefer: return=representation) ──────────
--   PATCH → [{data}]  : RLS OFF, 쓰기 열림
--   PATCH → []        : 쓰기 차단 (RLS 또는 기타 보호)
--
--   kp_episodes (id=1)    → [{data}]  🚨 CONFIRMED OPEN
--   kp_panels   (id=1)    → [{data}]  🚨 CONFIRMED OPEN
--   kp_bubbles  (id=2639) → [{data}]  🚨 CONFIRMED OPEN (복원 완료)
--   kp_expressions (id=770) → []      ✅ 차단 (대시보드 RLS 추정)
--   kp_challenges (id=4276) → []      ✅ 차단 (migration 017)
--   blog_posts    (UUID)    → []      ✅ 차단 (이유 불명, 방어적 추가)
--   kp_dialogue_expressions → []      ✅ 차단
--   kpatto_webtoon_layouts  → []      ✅ 차단 (migration 016)
--   story_patterns          → []      ✅ 차단 (migration 001)
--   ai_api_logs / ai_daily_usage → [] ✅ 차단 (migration 011)
--
-- audio 버킷 DELETE: HTTP 400 "NoSuchKey" (인증 통과)
--   → WAV 파일 전체 삭제 가능 상태 → AS RESTRICTIVE로 차단
--
-- 말풍선 에디터(/api/admin/episode-layout): service_role 확인 ✅
-- kp_challenge_progress: auth.uid()=user_id 정책 확인 ✅ (017)
--
-- pg_policies는 REST로 조회 불가 → 행동 테스트를 정책 목록 대용으로 사용.
--
-- 전략: ENABLE RLS + SELECT USING(true)만 생성.
--   INSERT·UPDATE·DELETE 정책 없음 → 기본 차단.
--   service_role은 RLS 우회 (Supabase 내장) → 서버 경로 무영향.
--   SELECT 경로 유지 → 앱 코드 변경 불필요.
--
-- 적용일: 2026-08-05
-- ============================================================

-- ── GROUP A: kp_episodes (RLS OFF 확인 — 즉시 차단 대상) ────

-- 028의 정책이 존재할 경우를 대비해 DROP 후 재생성 (멱등)
ALTER TABLE kp_episodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read kp_episodes"    ON kp_episodes;
DROP POLICY IF EXISTS "kp_episodes_public_read"  ON kp_episodes;

CREATE POLICY "kp_episodes_public_read"
  ON kp_episodes FOR SELECT TO anon, authenticated
  USING (true);

-- ── GROUP A: kp_panels (RLS OFF 확인 — is_free 조건, Option A 확정) ──

ALTER TABLE kp_panels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read kp_panels"  ON kp_panels;
DROP POLICY IF EXISTS "kp_panels_read"        ON kp_panels;

-- Option A (확정): is_free=true 화만 허용.
--   유료화 컷 이미지 URL이 anon에 노출되지 않음.
--   유료화는 /api/kpatto/episode/[id] (service_role) 경유 → 무영향.
CREATE POLICY "kp_panels_read"
  ON kp_panels FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kp_episodes e
      WHERE e.id = kp_panels.episode_id AND e.is_free = true
    )
  );

-- Option B (비활성):
-- CREATE POLICY "kp_panels_read"
--   ON kp_panels FOR SELECT TO anon, authenticated USING (true);

-- ── GROUP A: kp_bubbles (RLS OFF 확인 — is_free 조건 필수) ──

-- kp_bubbles.korean에 대사 텍스트가 직접 저장됨.
-- RLS 없으면 EP11+ 유료 대사가 anon에 노출된다.
-- 무료 화(is_free=true)만 SELECT 허용; 유료화는 API 라우트(service_role) 사용.
ALTER TABLE kp_bubbles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kp_bubbles_free_read"  ON kp_bubbles;

CREATE POLICY "kp_bubbles_free_read"
  ON kp_bubbles FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kp_episodes e
      WHERE e.id = kp_bubbles.episode_id
        AND e.is_free = true
    )
  );

-- ── GROUP A: kp_expressions (행동 테스트 차단 — 방어적 추가) ─

-- 행동 테스트에서 PATCH → [] (이미 차단). 대시보드 RLS 추정.
-- ENABLE RLS + 정책 재생성으로 마이그레이션 파일에 명시적으로 기록.
ALTER TABLE kp_expressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read kp_expressions"    ON kp_expressions;
DROP POLICY IF EXISTS "kp_expressions_public_read"  ON kp_expressions;

CREATE POLICY "kp_expressions_public_read"
  ON kp_expressions FOR SELECT TO anon, authenticated
  USING (true);

-- ── GROUP A: kp_challenges (migration 017에서 이미 RLS ON) ───

-- 017에서 생성된 정책명: "kp_challenges_public_read" (SELECT USING(true))
-- 028 정책명: "anon read kp_challenges"
-- 둘 다 DROP IF EXISTS 후 하나로 통합.
ALTER TABLE kp_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read kp_challenges"    ON kp_challenges;
DROP POLICY IF EXISTS "kp_challenges_public_read"  ON kp_challenges;

CREATE POLICY "kp_challenges_public_read"
  ON kp_challenges FOR SELECT TO anon, authenticated
  USING (true);

-- ── GROUP A: kp_dialogues (이미 anon SELECT 차단) ────────────

-- 행동 테스트: anon SELECT → 빈 배열 (이미 차단).
-- 028 정책 DROP + 현재 상태 유지 (SELECT 정책 없음 = anon 완전 차단).
-- Phase 1은 쓰기 차단이 목적 → 읽기 현황 유지.
ALTER TABLE kp_dialogues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read kp_dialogues"  ON kp_dialogues;
-- SELECT 정책 없음 → anon SELECT도 차단 (Phase 3까지 유지)

-- ── GROUP A: kp_dialogue_expressions (이미 차단) ─────────────

-- 행동 테스트: PATCH → [] (이미 차단). anon SELECT도 차단 상태.
ALTER TABLE kp_dialogue_expressions ENABLE ROW LEVEL SECURITY;
-- SELECT 정책 없음 유지

-- ── GROUP B: blog_posts (행동 테스트 차단 — 방어적 추가) ─────

-- 행동 테스트: 실존 UUID로 PATCH → [] (이미 차단). 이유 불명.
-- ENABLE RLS + SELECT USING(true) 추가.
-- Note: published_at 컬럼은 있으나 boolean published 없음.
-- Phase 1에서는 USING(true); Phase 3에서 published_at 필터 검토.
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_posts_public_read"  ON blog_posts;

CREATE POLICY "blog_posts_public_read"
  ON blog_posts FOR SELECT TO anon, authenticated
  USING (true);

-- ── GROUP B: kpatto_dialogues (구형, 0 행) ───────────────────

-- migration 015에서 생성. 현재 사용하지 않으나 방어적으로 잠금.
ALTER TABLE kpatto_dialogues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kpatto_dialogues_public_read"  ON kpatto_dialogues;

CREATE POLICY "kpatto_dialogues_public_read"
  ON kpatto_dialogues FOR SELECT TO anon, authenticated
  USING (true);

-- ── 변경 없는 테이블 (감사 기록) ────────────────────────────

-- kp_challenge_progress (migration 017):
--   FOR ALL USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id) ✅
--   클라이언트 UPSERT 허용 (진행도 저장 필요) → 변경 없음.

-- kpatto_webtoon_layouts (migration 016):
--   RLS ON, SELECT USING(true)만 존재 → 변경 없음. ✅

-- story_patterns (migration 001):
--   RLS ON, SELECT USING(true)만 존재 → 변경 없음. ✅
--   savedPatterns.ts의 잘못된 테이블명으로 쓰기 미발생 → Phase 1 안전.

-- ai_api_logs (migration 011):
--   RLS ON, SELECT USING(user_id=auth.uid()) — anon 읽기·쓰기 차단 ✅
-- ai_daily_usage (migration 011):
--   RLS ON, SELECT USING(user_id=auth.uid()) ✅
-- translation_cache, essay_review_cache (migration 011):
--   RLS ON, SELECT USING(true) — 쓰기 정책 없음 ✅

-- user_profiles, user_language_settings,
-- user_pattern_progress, user_story_progress (migration 001): 보호됨 ✅
-- subscriptions (create_subscriptions.sql): 보호됨 ✅
-- kpatto_stories, kpatto_patterns, kpatto_vocabulary (migration 012): 보호됨 ✅
-- kpatto_saved_patterns (migration 014):
--   RLS ON, auth.uid() 기준 SELECT/INSERT/DELETE ✅
--   (kpatto_saved_patterns 테이블은 현재 존재하나 lib에서 다른 이름 참조 중 — 별건 버그)

-- ── STORAGE: audio 버킷 ──────────────────────────────────────

-- 행동 테스트:
--   DELETE /storage/v1/object/audio/nonexistent.wav
--   → HTTP 400 "NoSuchKey" (인증 통과 = 삭제 권한 열림) 🚨
--   → 음성 파일 전체 삭제 가능 상태
--
-- 원인: audio 버킷에 permissive DELETE 정책 존재 (대시보드 설정 추정).
-- 기존 permissive 정책이 있는 상태에서 permissive 차단 정책을 추가하면:
--   USING(true) OR USING(bucket_id <> 'audio') = USING(true) → 무효
--
-- 해결: AS RESTRICTIVE 사용.
--   permissive 정책이 있어도 restrictive 정책은 AND로 평가됨:
--   USING(true) AND USING(bucket_id <> 'audio') = audio 차단 ✅
--
-- 음성 업로드 스크립트: service_role 사용 확인 → RLS 우회, 무영향.
-- 음성 재생(SELECT): public 버킷 → 정책 불필요, 계속 작동.

DROP POLICY IF EXISTS "audio_block_anon_delete"  ON storage.objects;
CREATE POLICY "audio_block_anon_delete"
  ON storage.objects AS RESTRICTIVE
  FOR DELETE TO anon, authenticated
  USING (bucket_id <> 'audio');

DROP POLICY IF EXISTS "audio_block_anon_update"  ON storage.objects;
CREATE POLICY "audio_block_anon_update"
  ON storage.objects AS RESTRICTIVE
  FOR UPDATE TO anon, authenticated
  USING (bucket_id <> 'audio')
  WITH CHECK (bucket_id <> 'audio');

-- ============================================================
-- 적용 후 검증 (HTTP 테스트로 확인 — pg_policies 조회는 증거 아님)
-- ============================================================
-- 전부 401·403 또는 빈 배열이어야 함:
--
--   kp_episodes PATCH/DELETE  → 401·403
--   kp_panels   PATCH/DELETE  → 401·403
--   kp_bubbles  PATCH/DELETE  → 401·403
--   kp_panels   SELECT (EP11) → 빈 배열 (is_free=false)
--   kp_bubbles  SELECT (EP11) → 빈 배열 (is_free=false)
--   kp_expressions PATCH      → 401·403
--   kp_challenges  DELETE      → 401·403
--   blog_posts PATCH/DELETE   → 401·403
--   audio 버킷 DELETE          → 403

-- ============================================================
-- ROLLBACK SQL
-- ============================================================
/*
-- 경고: 실행 즉시 아래 테이블에 쓰기 권한이 다시 열린다.

ALTER TABLE kp_episodes      DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_bubbles       DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_panels        DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_expressions   DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_challenges    DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_dialogues     DISABLE ROW LEVEL SECURITY;
ALTER TABLE kp_dialogue_expressions DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts       DISABLE ROW LEVEL SECURITY;
ALTER TABLE kpatto_dialogues DISABLE ROW LEVEL SECURITY;

-- kp_challenges는 017 RLS 복원:
CREATE POLICY "kp_challenges_public_read"
  ON kp_challenges FOR SELECT USING (true);

-- Storage 롤백:
DROP POLICY IF EXISTS "audio_block_anon_delete"  ON storage.objects;
DROP POLICY IF EXISTS "audio_block_anon_update"   ON storage.objects;
*/
