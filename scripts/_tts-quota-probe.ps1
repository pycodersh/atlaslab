# TTS 일일 한도 리셋 경계 탐침 — 결과를 로그 파일에 기록
# 실행 시각 기록
$ts  = Get-Date -Format "yyyy-MM-dd HH:mm:ss KST"
$log = "C:\Users\msj15\OneDrive\바탕 화면\ClaudeCode\patto\scripts\tts-quota-probe.log"

"[$ts] 탐침 시작 — expr 789" | Tee-Object -FilePath $log -Append

$out = & npx tsx "C:\Users\msj15\OneDrive\바탕 화면\ClaudeCode\patto\scripts\generate-kpatto-audio-gemini.ts" --expr 789 2>&1
$out | Tee-Object -FilePath $log -Append

$end = Get-Date -Format "yyyy-MM-dd HH:mm:ss KST"
"[$end] 탐침 종료" | Tee-Object -FilePath $log -Append
"-" * 60    | Tee-Object -FilePath $log -Append
