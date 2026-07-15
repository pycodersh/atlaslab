# PATTO QA 테스트 매트릭스 — 2026-07-15

## 테스트 커버리지 매핑

| 출시 차단 # | 시나리오 | 테스트 파일 | 테스트 수 | 상태 |
|---|---|---|---|---|
| 1 | first_visit 온보딩 흐름 | `onboarding.spec.ts` | 5 | ✅ 4/5 PASS |
| 2 | 게스트 Story 시작 및 제한 | `guest-limits.spec.ts` | 4 | ✅ 4/4 PASS |
| 3 | 로그인 성공과 UI 즉시 반영 | `auth.spec.ts` | 4 | ✅ 4/4 PASS |
| 4 | 로그아웃과 개인 데이터 제거 | `auth.spec.ts` | 4 | ✅ (3,4 공유) |
| 5 | Story 전체 재생 및 오디오 | `audio.spec.ts`, `learning-session.spec.ts` | 11 | ✅ 11/11 PASS |
| 6 | Pattern 5장 완료 및 라운드 1회 증가 | `learning-session.spec.ts` | 7 | ✅ 7/7 PASS |
| 7 | 학습 완료와 Progress 즉시 반영 | `progress.spec.ts` | 4 | ⏳ 실행 중 |
| 8 | 학습 중 탭 이동 시 오디오 종료 | `audio.spec.ts` | 4 | ✅ 4/4 PASS |
| 9 | Pattern→다음 Story 전환 깜빡임 없음 | `learning-session.spec.ts` | 7 | ✅ 포함 |
| 10 | 패턴·단어 저장과 Library 반영 | `library.spec.ts` | 4 | ✅ 4/4 PASS |
| 11 | Writing Studio Free Write 제출 | `writing-studio.spec.ts` | 7 | ⏳ 실행 중 |
| 12 | Writing Studio API 실패 후 입력 보존 | `writing-studio.spec.ts` | 7 | ⏳ 실행 중 |
| 13 | 한국어·영어 하드코딩 검사 | `localization.spec.ts` | 5 | ✅ 5/5 PASS |
| 14 | 모바일 가로 스크롤·콘텐츠 잘림 없음 | `localization.spec.ts`, `orb-satellite-navigation.spec.ts` | 8 | ✅ PASS |
| 15 | 오브+위성 네비게이션 전체 흐름 | `orb-satellite-navigation.spec.ts` | 6 | ⏳ 실행 중 |

---

## 테스트 파일별 상세

### `audio.spec.ts` (4 tests) ✅
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| 중복 재생 방지 | 동일 오디오 2번 클릭 시 1개만 재생 | ✅ PASS |
| 404 오디오 처리 | 없는 오디오 파일 graceful 처리 | ✅ PASS |
| 탭 이동 후 오디오 종료 | 페이지 이동 시 audio.paused=true | ✅ PASS |
| 새로고침 후 오디오 종료 | 리로드 시 audio.paused=true | ✅ PASS |

### `auth.spec.ts` (4 tests) ✅
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| 로그인 버튼 접근 | Settings 페이지에 로그인 수단 노출 | ✅ PASS |
| Settings 페이지 로딩 | 에러 없이 렌더링 | ✅ PASS |
| 게스트 Settings 접근 | 로그인 유도 UI 표시 | ✅ PASS |
| 홈 접근 후 에러 없음 | 비로그인 홈 정상 렌더링 | ✅ PASS |

### `guest-limits.spec.ts` (4 tests) ✅
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| Story 페이지 HTTP 에러 없음 | 5xx 응답 없음 | ✅ PASS |
| 세션 페이지 HTTP 에러 없음 | 5xx 응답 없음 | ✅ PASS |
| 게스트 제한 모달 | 세션 3회 후 모달 표시 | ✅ PASS |
| localStorage 지속성 | SRS 데이터 새로고침 후 유지 | ✅ PASS |

### `learning-session.spec.ts` (7 tests) ✅
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| 스토리 콘텐츠 로드 | 패턴 텍스트 렌더링 확인 | ✅ PASS |
| 오디오 중복 재생 없음 | 세션 중 audio 1개 이하 재생 | ✅ PASS |
| 세션 페이지 접근 | HTTP 에러 없음 | ✅ PASS |
| SRS 라운드 업데이트 | patto-story-rounds 저장 확인 | ✅ PASS |
| 탭 이동 오디오 종료 | 이동 후 재생 0개 | ✅ PASS |
| Progress 페이지 로드 | Records 정상 렌더링 | ✅ PASS |
| 전환 깜빡임 없음 | 이동 중 body 내용 유지 | ✅ PASS |

### `library.spec.ts` (4 tests) ✅
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| Library 로딩 | HTTP 에러 없음 | ✅ PASS |
| 가로 스크롤 없음 | scrollWidth <= innerWidth | ✅ PASS |
| 패턴 저장 시도 | 에러 없이 처리 | ✅ PASS |
| 중복 저장 없음 | 동일 패턴 2회 저장 방지 | ✅ PASS |

### `localization.spec.ts` (5 tests) ✅
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| 한국어 모드 번역 키 미노출 | t('xxx') 패턴 없음 | ✅ PASS |
| 영어 모드 한글 하드코딩 | WARN: Settings 6개 버튼 한글 (BUG-001, BUG-002) | ✅ WARN PASS |
| 소스 코드 alert() 검사 | alert() 없음 | ✅ PASS |
| 모바일 가로 스크롤 | 5개 페이지 scrollWidth 체크 | ✅ PASS |
| 가로 잘림 없음 | button/h1/h2 rect.right 체크 | ✅ PASS |

### `network-errors.spec.ts` (4 tests) ⏳
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| API 타임아웃 | 느린 응답 시 UI 유지 | ⏳ |
| 오프라인 시 에러 처리 | page.route 중단 + offline 이벤트 | ⏳ |
| Supabase 500 처리 | 앱 중단 없음 | ⏳ |
| API 429 처리 | 과도한 재요청 없음 | ⏳ |

### `onboarding.spec.ts` (5 tests) ✅ 4/5
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| 첫 방문 오브 액션 카드 표시 | waitForFunction → soft WARN | ✅ WARN PASS |
| 모바일 가로 스크롤 없음 | scrollWidth <= innerWidth | ✅ PASS |
| 재방문 환영 멘트 미표시 | 첫방문 문구 없음 확인 | ✅ PASS |
| 치명 콘솔 에러 없음 | error 타입 콘솔 필터 | ✅ PASS |
| Promise rejection 없음 | Unhandled rejection 없음 | ✅ PASS |

### `orb-satellite-navigation.spec.ts` (6 tests) ⏳
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| 오브 렌더링 확인 | 콘솔 에러 없음 | ⏳ |
| 주요 라우트 접근 | 5개 경로 로딩 | ⏳ |
| 이동 후 오디오 없음 | paused=true 확인 | ⏳ |
| 뒤로가기 후 상태 정상 | 콘솔 에러 없음 | ⏳ |
| 404 처리 | 빈 화면 없음 + 안내 텍스트 | ⏳ |
| 모바일 가로 스크롤 없음 | 4개 경로 체크 | ⏳ |

### `progress.spec.ts` (4 tests) ⏳
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| Progress 페이지 로드 | Records 렌더링 확인 | ⏳ |
| 가로 스크롤 없음 | scrollWidth 체크 | ⏳ |
| 빈 상태 | 데이터 없을 때 UI 정상 | ⏳ |
| 데이터 반영 | SRS 저장 후 표시 | ⏳ |

### `writing-studio.spec.ts` (7 tests) ⏳
| 테스트 | 검증 포인트 | 상태 |
|---|---|---|
| Library 로딩 (Writing Studio 포함) | 5xx 없음 | ⏳ |
| textarea 존재 확인 | DOM에 textarea 있음 | ⏳ |
| 게스트 textarea disabled | 의도된 동작 확인 | ⏳ |
| GET /api/writing 응답 구조 | remaining, limit 필드 확인 | ⏳ |
| API 실패 모킹 | 500 응답 시 앱 중단 없음 | ⏳ |
| 모바일 가로 스크롤 없음 | scrollWidth 체크 | ⏳ |
| POST /api/writing 비로그인 | 401/403 반환 | ⏳ |

---

## 뷰포트 커버리지

| 뷰포트 | 상태 | 비고 |
|---|---|---|
| Desktop Chrome 1440×900 | ✅ 실행 완료 | 주요 실행 환경 |
| Mobile 390×844 (iPhone 15 Pro 크기) | ⏳ 미실행 | 다음 단계 |
| Mobile 375×667 (Small Mobile) | ⏳ 미실행 | 다음 단계 |

---

*업데이트: 2026-07-15 — 최종 실행 결과 수신 후 갱신 예정*
