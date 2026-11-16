-- kp_downloads: 무료 PDF 같은 내려받기 횟수 기록
-- /downloads/k-patto-free-sample.pdf 라우트가 서비스 롤로만 쓴다. 브라우저(anon)에는 읽기 · 쓰기 모두 막는다.
-- 개인정보는 남기지 않는다(IP · 이메일 없음): 어떤 파일을, 어느 버튼(source)에서, 언제.

CREATE TABLE IF NOT EXISTS kp_downloads (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  file        TEXT NOT NULL,
  source      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS kp_downloads_file_created_idx ON kp_downloads (file, created_at);

ALTER TABLE kp_downloads ENABLE ROW LEVEL SECURITY;
-- 정책을 두지 않는다 = anon/authenticated 는 접근 불가, 서비스 롤만 RLS 를 우회한다
