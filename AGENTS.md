<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 배포 규칙

## [필수] 프로덕션 배포 방법
- **로컬에서 `vercel deploy --prod` 실행 금지**
- 배포는 **main 브랜치 push → Vercel Git 연동 자동 배포**로만 한다
- 이 규칙을 어기면 다른 워킹 디렉토리(예: `landing/`)의 stale 코드가 프로덕션을 덮어쓸 수 있다

## 동일 projectId 폴더 주의
- `ClaudeCode/landing/` 폴더도 같은 atlaslab Vercel 프로젝트(prj_Tx4gQZhhTM6GWNag2UyIZrJp5zsA)에 연결되어 있다
- 해당 폴더에서 `vercel deploy --prod`를 실행하면 이 `patto/` 앱의 프로덕션을 덮어쓴다
- `landing/` 폴더에서 Vercel CLI 명령은 절대 실행하지 말 것
