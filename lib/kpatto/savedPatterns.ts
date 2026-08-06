/**
 * @deprecated 이 모듈은 `kpatto_saved_patterns` 테이블에 의존하며,
 * 해당 테이블이 존재하지 않아 프로덕션에서 조용히 실패합니다.
 *
 * K-PATTO 표현 저장은 localStorage 기반으로 이동되었습니다:
 *   components/kpatto/ExpressionPopup.tsx — getSavedExpressionIds(), persistSavedIds()
 *   localStorage key: 'kpatto-saved-expressions'
 *
 * PatternSection.tsx가 아직 이 모듈을 import하므로 함수 스텁을 유지합니다.
 * 향후: PatternSection의 import를 제거하고 이 파일을 삭제할 것.
 */
import { createClient } from '@/lib/supabase/client'

/** @deprecated table `kpatto_saved_patterns` does not exist → always returns [] */
export async function getSavedPatterns(): Promise<{ id: string; pattern_id: string; episode_id: string; created_at: string }[]> {
  return []
}

/** @deprecated table `kpatto_saved_patterns` does not exist → always returns false */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function savePattern(_patternId: string, _episodeId: string): Promise<boolean> {
  return false
}

/** @deprecated table `kpatto_saved_patterns` does not exist → always returns false */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function unsavePattern(_patternId: string): Promise<boolean> {
  return false
}

/** @deprecated table `kpatto_saved_patterns` does not exist → always returns false */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function isPatternSaved(_patternId: string): Promise<boolean> {
  // Suppress "unused import" for createClient — keeping the import to avoid changing the module signature.
  void createClient
  return false
}
