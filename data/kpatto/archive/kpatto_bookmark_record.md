# K-PATTO 패턴카드 북마크 → Record 탭 연동

## 기능 개요
패턴카드 우상단 🔖 북마크 누르면
→ Supabase에 저장
→ Record 탭 > Search & Save 섹션에 리스트업

---

## 1. Supabase 테이블

```sql
CREATE TABLE IF NOT EXISTS kpatto_bookmarks (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id  text NOT NULL,           -- 예: "ep01-p001"
  episode_id  text NOT NULL,           -- 예: "kp-ep-001"
  pattern_ko  text NOT NULL,           -- 예: "~이에요 / 예요"
  pattern_en  text NOT NULL,           -- 예: "Use this to say what something IS"
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, pattern_id)          -- 중복 북마크 방지
);

-- RLS
ALTER TABLE kpatto_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "본인 북마크만" ON kpatto_bookmarks
  FOR ALL USING (auth.uid() = user_id);
```

---

## 2. 북마크 버튼 동작

패턴카드 🔖 아이콘:
- 비활성 (저장 안 됨): 빈 북마크 아이콘
- 활성 (저장됨): 채워진 북마크 아이콘 (오렌지 #D4873A)
- 탭 시: toggle (저장 ↔ 삭제)
- 저장 시: 토스트 메시지 "북마크에 저장됐어요!"
- 삭제 시: 토스트 메시지 "북마크에서 삭제됐어요."

---

## 3. Record 탭 > Search & Save 섹션 UI

### 레이아웃
```
SEARCH & SAVE

┌─────────────────────────────────────┐
│ ~이에요 / 예요          EP01  🔖    │
│ Use this to say what something IS   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ ~주세요                 EP01  🔖    │
│ Use this to ask for something       │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ ~뭐예요?                EP01  🔖    │
│ Use this to ask what something is   │
└─────────────────────────────────────┘

  ∨ 3개 더 보기   ← 접기/펼치기 버튼
```

### 규칙
- 최신 북마크 순으로 정렬 (최근 저장이 위)
- 기본: 최대 3개만 표시
- 3개 초과 시: "∨ N개 더 보기" 버튼 표시
- 펼치면: 전체 목록 표시 + "∧ 접기" 버튼
- 북마크 없을 때: "저장한 패턴이 없어요. 패턴카드의 🔖를 눌러보세요!" 안내

### 카드 스타일
- 배경: var(--surface-1)
- 패턴 한국어: 16px, font-weight 700
- EP 태그: 11px, 연두색 배지 (기존 패턴카드 색상 동일)
- 🔖 아이콘: 탭하면 북마크 해제 (활성 상태)
- 패턴 설명 (en): 13px, var(--text-secondary)
- 탭 시: 해당 에피소드 패턴카드로 이동

---

## 4. 네비게이션 연동

북마크 카드 탭 시:
```
/kpatto/story/kp-ep-001?pattern=ep01-p001
```
→ 해당 에피소드 스토리 페이지로 이동
→ 해당 패턴카드로 자동 스크롤

---

## 5. 적용 범위
- EP01~10 패턴카드 전체에 북마크 기능 적용
- Record 탭 Search & Save 섹션 신규 추가
- 기존 Record 탭 구조 유지하고 섹션만 추가
