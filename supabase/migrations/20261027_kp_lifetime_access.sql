-- kp_lifetime_access: Gumroad 일회성 구매(WebApp Pass · Complete Bundle)로 얻은 K-PATTO 앱 평생 이용권
--
-- user_profiles.kpatto_pro 와 따로 둔다:
--   - kpatto_pro 는 Paddle 구독 웹훅이 켜고 끈다 — 구독 이벤트가 평생 이용권을 꺼 버리면 안 된다
--   - user_profiles 는 본인 행 쓰기가 열려 있어(user_profiles_own) 여기 두면 스스로 켤 수 있다
-- 쓰기는 /api/kpatto/redeem(서비스 롤)만 한다. 사용자는 자기 행을 읽기만 한다.
--
-- 한 계정에 한 줄(user_id PK), 한 라이선스 키는 한 계정에만(license_key UNIQUE).
-- 환불·분쟁이 생기면 해당 행을 지우면 이용권이 사라진다(자동 회수는 아직 없음).

CREATE TABLE IF NOT EXISTS kp_lifetime_access (
  user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  product          TEXT NOT NULL CHECK (product IN ('webapp', 'bundle')),
  license_key      TEXT NOT NULL UNIQUE,
  gumroad_sale_id  TEXT,
  purchase_email   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE kp_lifetime_access ENABLE ROW LEVEL SECURITY;

-- 본인 행만 SELECT — INSERT/UPDATE/DELETE 정책은 두지 않는다(서비스 롤만 쓴다)
CREATE POLICY "kp_lifetime_select_own" ON kp_lifetime_access
  FOR SELECT USING (auth.uid() = user_id);
