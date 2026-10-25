-- kp_preorder_emails: K-PATTO E-Book 출시 알림·사전 주문 이메일
-- /api/kpatto/preorder 가 서비스 롤로만 쓴다. 브라우저(anon)에는 읽기·쓰기 모두 막는다.

CREATE TABLE IF NOT EXISTS kp_preorder_emails (
  email       TEXT PRIMARY KEY,
  source      TEXT NOT NULL DEFAULT 'purchase-page',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE kp_preorder_emails ENABLE ROW LEVEL SECURITY;
-- 정책을 두지 않는다 = anon/authenticated 는 접근 불가, 서비스 롤만 RLS 를 우회한다
