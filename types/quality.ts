/**
 * PATTO Story Factory — Quality Control (QC) 타입
 *
 * Story Package 생성 후 자동으로 품질을 검사한다.
 * Pass한 Story만 PATTO Library에 등록된다.
 */

// ── 등급 ──────────────────────────────────────────────────────────────────────

export type QualityGrade = 'A+' | 'A' | 'B+' | 'B' | 'C' | 'F'
export type ReviewStatus = 'pass' | 'needs-review' | 'fail'

// ── 검사 항목 ID ──────────────────────────────────────────────────────────────

export type QCCheckId =
  | 'story-length'          // 18~22문장
  | 'pattern-count'         // 정확히 5개
  | 'pattern-naturalness'   // Story 안에서 실제 사용
  | 'difficulty-match'      // CEFR 난이도 일치
  | 'story-flow'            // 시작-전개-마무리
  | 'repetition'            // 과도한 반복 없음
  | 'translation-quality'   // 자연스러운 한국어
  | 'scene-consistency'     // Scene ↔ Paragraph ↔ Pattern 연결
  | 'prompt-consistency'    // Prompt ↔ Scene 내용 일치
  | 'metadata-accuracy'     // Metadata 수치 일치

// ── 개별 검사 결과 ─────────────────────────────────────────────────────────────

export type QCCheck = {
  id: QCCheckId
  label: string             // 사람이 읽기 좋은 이름
  passed: boolean
  score: number             // 0–100 (부분 점수 가능)
  weight: number            // 가중치 (합계 = 100)
  detail?: string           // 실패/경고 상세 메시지
  autoFixable?: boolean     // 자동 수정 가능 여부
}

// ── 전체 QC 결과 ──────────────────────────────────────────────────────────────

export type QualityReport = {
  packageId: string
  checkedAt: string         // ISO date
  score: number             // 0–100 (weighted)
  grade: QualityGrade
  reviewStatus: ReviewStatus
  checks: QCCheck[]
  failures: string[]        // ⚠ 메시지 목록 (실패 항목)
  warnings: string[]        // 통과했지만 주의할 항목
  autoFixable: string[]     // 자동 수정 가능한 항목 ID 목록
}

// ── StoryPackage에 추가될 quality 필드 ────────────────────────────────────────

export type PackageQuality = {
  score: number
  grade: QualityGrade
  reviewStatus: ReviewStatus
  checkedAt: string
  failCount: number
  warningCount: number
}
