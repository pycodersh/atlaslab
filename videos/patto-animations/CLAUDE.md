# CLAUDE.md — patto-animations 공통 규칙

## Design System
모든 UI 구현 시 Atlas Design System 사용
경로: ../atlas-design-system
- Glass 카드: /components/GlassCard
- SVG 아이콘: /icons
- 색상/타이포그래피: /typography.ts
- PNG Asset 사용 금지

## 여백 기준
- 상단: 120px (아이폰 상태바 영역 고려)
- 하단: 80px
- 좌우: 40px
- 모든 텍스트/요소는 이 여백 안쪽에 배치

## 텍스트/언어
- 텍스트 하드코딩 금지
- 모든 텍스트는 /src/locales/ko.ts 키로 참조
- 언어 파일만 교체하면 전체 언어 변경 가능하도록 구조화

## 영상 스펙
- 해상도: 1080 x 1920 (9:16 세로) 또는 1920 x 1080 (16:9 가로)
- fps: 30
- 오디오 없음
- PNG import 금지
- 버튼 UI 추가 금지

## Orb
- PNG 사용 금지
- CSS/SVG로 직접 구현 (원형 + 아이스 블루 그라디언트 + 눈 2개)

## 구현 원칙
- 새로운 Scene/기능 추가 금지
- 지시사항에 없는 동작 구현 금지
- 장면 전환 시 이전 요소 완전히 제거 후 다음 장면 시작
