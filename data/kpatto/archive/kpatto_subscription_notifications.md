# K-PATTO Subscription + Notifications 페이지 구현

## 1. Subscription 페이지 (/kpatto/subscription)

### 라우트
`/kpatto/subscription` 신규 페이지 생성

### UI 구성
```
← Subscription                    (상단 뒤로가기)

현재 플랜 표시

┌─────────────────────────────────┐
│ 🆓 Free                Current  │
│                                 │
│ ✓ Pre-course (전체 무료)        │
│ ✓ EP01~05 무료                  │
│ ✓ Basic challenges              │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ⭐ K-PATTO Pro          $2.99/mo│
│                                 │
│ ✓ EP06~ unlimited access        │
│ ✓ New episodes auto-unlocked    │
│ ✓ Full challenge access         │
│ ✓ Unlimited bookmarks           │
│ ✓ Full audio access             │
│                                 │
│ [Upgrade to Pro →]              │  ← 오렌지 버튼
└─────────────────────────────────┘
```

### 구독 중일 때
```
┌─────────────────────────────────┐
│ ⭐ K-PATTO Pro          Active  │
│ Next billing: 2026.08.23        │
│                                 │
│ [Manage Subscription]           │  ← Paddle 포털 링크
└─────────────────────────────────┘
```

### 구현 사항
- `useKPattoSubscription()` 훅으로 현재 구독 상태 확인
- 구독 중: Pro 플랜에 Active 배지 + Manage 버튼
- 미구독: Free 플랜 Current 표시 + Upgrade 버튼
- Upgrade 버튼 클릭 → 기존 KPattoPaywall과 동일한 Paddle 결제창
- Manage Subscription → Paddle 고객 포털 URL
- Profile 탭 → Subscription 클릭 시 이 페이지로 이동

---

## 2. Notifications 페이지 (/kpatto/notifications)

### 라우트
`/kpatto/notifications` 신규 페이지 생성

### UI 구성
```
← Notifications

┌─────────────────────────────────┐
│ New Episode Alerts         [ON] │
│ Get notified when new           │
│ episodes are released           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ Weekly Study Reminder      [OFF]│
│ A gentle reminder to keep       │
│ your Korean practice going      │
└─────────────────────────────────┘
```

### 구현 사항
- 토글 상태는 Supabase user_profiles에 저장
  컬럼 추가:
  ```sql
  ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS kpatto_notif_new_episode boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS kpatto_notif_weekly_reminder boolean DEFAULT false;
  ```
- 비로그인 시: "Sign in to manage notifications" 안내
- Profile 탭 → Notifications 클릭 시 이 페이지로 이동

---

## 3. Profile 탭 연결

현재 Subscription, Notifications 탭이 빈 페이지로 연결됨
→ 각각 위 페이지로 라우팅 수정

---

## 4. Supabase SQL 실행 필요

```sql
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS kpatto_notif_new_episode boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS kpatto_notif_weekly_reminder boolean DEFAULT false;
```
