-- user_profiles 결제·권한 컬럼을 브라우저(anon·authenticated)가 바꾸지 못하게 막는다
--
-- 문제(2026-10-27 라이브 DB 실측):
--   정책 user_profiles_own 이 FOR ALL · TO public · USING/WITH CHECK (id = auth.uid()) 이고
--   authenticated 에 테이블 UPDATE·INSERT 권한이 있으며 컬럼 제한·트리거가 없었다.
--   → 로그인한 사용자가 브라우저에서
--        supabase.from('user_profiles').update({ kpatto_pro: true }).eq('id', 내 id)
--     로 K-PATTO 유료 에피소드를 스스로 열 수 있었다. plan(AI 사용 한도 판정)도 같다.
--
-- 막는 컬럼(서버만 쓴다 — Paddle 웹훅·paddle-portal 은 서비스 롤):
--   kpatto_pro, kpatto_subscription_id, kpatto_subscription_status,
--   kpatto_billing_end_at, kpatto_customer_id, plan
-- 열어 두는 컬럼: kpatto_notif_new_episode, kpatto_notif_weekly_reminder
--   (알림 설정 화면이 브라우저에서 직접 쓴다) 및 그 밖의 프로필 컬럼.
--
-- 판정은 current_user 로 한다. PostgREST 는 요청마다 anon/authenticated/service_role 로
-- 역할을 바꾸므로 브라우저 요청만 걸리고, 서비스 롤·postgres·가입 트리거(handle_new_user)는 통과한다.
--   UPDATE: 막는 컬럼 값이 바뀌면 오류(같은 값을 다시 쓰는 것은 허용)
--   INSERT: 막는 컬럼을 기본값으로 되돌린다(정상 흐름에서 브라우저가 행을 만들 일은 없다)

CREATE OR REPLACE FUNCTION public.protect_user_profiles_billing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.kpatto_pro                 := false;
    NEW.kpatto_subscription_id     := NULL;
    NEW.kpatto_subscription_status := NULL;
    NEW.kpatto_billing_end_at      := NULL;
    NEW.kpatto_customer_id         := NULL;
    NEW.plan                       := 'free';
    RETURN NEW;
  END IF;

  IF NEW.kpatto_pro                 IS DISTINCT FROM OLD.kpatto_pro
  OR NEW.kpatto_subscription_id     IS DISTINCT FROM OLD.kpatto_subscription_id
  OR NEW.kpatto_subscription_status IS DISTINCT FROM OLD.kpatto_subscription_status
  OR NEW.kpatto_billing_end_at      IS DISTINCT FROM OLD.kpatto_billing_end_at
  OR NEW.kpatto_customer_id         IS DISTINCT FROM OLD.kpatto_customer_id
  OR NEW.plan                       IS DISTINCT FROM OLD.plan
  THEN
    RAISE EXCEPTION 'billing columns on user_profiles are read-only for clients'
      USING ERRCODE = '42501';  -- insufficient_privilege
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_profiles_billing ON public.user_profiles;
CREATE TRIGGER protect_user_profiles_billing
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_profiles_billing();
