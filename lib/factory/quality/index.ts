/**
 * PATTO Story Factory — QC 진입점
 *
 * runQC(package) → QualityReport
 *
 * 모든 검사는 순수 함수 (AI 호출 없음).
 * AI 보조 검사(번역 품질, 자연스러움)는 prompts.ts의 프롬프트를 사용해
 * 외부에서 별도로 호출한 뒤 결과를 mergeAIChecks()로 병합한다.
 */

import type { StoryPackage } from '@/types/factory'
import type { QCCheck, QualityGrade, QualityReport, PackageQuality } from '@/types/quality'

import {
  checkStoryLength,
  checkPatternCount,
  checkPatternNaturalness,
  checkDifficultyMatch,
  checkStoryFlow,
  checkRepetition,
  checkSceneConsistency,
  checkPromptConsistency,
  checkMetadataAccuracy,
} from './checker'

export { buildTranslationQCPrompt, buildPatternNaturalnessQCPrompt, buildPromptConsistencyQCPrompt } from './prompts'
export type { ScenePromptCheckInput } from './prompts'

// ── 등급 계산 ─────────────────────────────────────────────────────────────────

function scoreToGrade(score: number): QualityGrade {
  if (score >= 97) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 83) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 60) return 'C'
  return 'F'
}

// ── Weighted Score 계산 ───────────────────────────────────────────────────────

function calcWeightedScore(checks: QCCheck[]): number {
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0)
  const weightedSum  = checks.reduce((sum, c) => sum + c.score * c.weight, 0)
  return totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight)
}

// ── 번역 품질 플레이스홀더 검사 (AI 호출 전 기본값) ────────────────────────────

function checkTranslationQualityBasic(pkg: StoryPackage): QCCheck {
  const issues: string[] = []
  for (const p of pkg.paragraphs) {
    if (!p.koreanTranslation || p.koreanTranslation.trim().length < 5) {
      issues.push(`Paragraph "${p.id}": 한국어 번역 누락`)
    }
    // 직역 감지: 영어 단어가 한국어 번역에 그대로 남아 있는 경우
    const englishWords = p.english.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? []
    const koreanText   = p.koreanTranslation.toLowerCase()
    const leaked = englishWords.filter(w => koreanText.includes(w) && w !== 'i')
    if (leaked.length > 3) {
      issues.push(`Paragraph "${p.id}": 영어 단어가 번역에 남아 있음 (${leaked.slice(0, 3).join(', ')}...)`)
    }
  }

  const passed = issues.length === 0
  const score  = passed ? 95 : Math.max(0, 95 - issues.length * 15)

  return {
    id: 'translation-quality',
    label: '번역 품질 (자연스러운 한국어)',
    passed,
    score,
    weight: 15,
    detail: issues.length > 0 ? issues.join('\n') : undefined,
    autoFixable: true,
  }
}

// ── runQC: 메인 진입점 ────────────────────────────────────────────────────────

export function runQC(pkg: StoryPackage): QualityReport {
  const checks: QCCheck[] = [
    checkStoryLength(pkg.paragraphs),
    checkPatternCount(pkg.patterns),
    checkPatternNaturalness(pkg.patterns, pkg.paragraphs),
    checkDifficultyMatch(pkg.metadata, pkg.paragraphs),
    checkStoryFlow(pkg.paragraphs),
    checkRepetition(pkg.paragraphs),
    checkTranslationQualityBasic(pkg),
    checkSceneConsistency(pkg.scenes, pkg.paragraphs, pkg.patterns),
    checkPromptConsistency(pkg.scenes),
    checkMetadataAccuracy(pkg.metadata, pkg.paragraphs, pkg.scenes, pkg.patterns),
  ]

  const score         = calcWeightedScore(checks)
  const grade         = scoreToGrade(score)
  const failedChecks  = checks.filter(c => !c.passed)
  const passedChecks  = checks.filter(c => c.passed)

  // 75점 미만이거나 weight 15+ 항목 실패 시 fail
  const hasCriticalFail = failedChecks.some(c => c.weight >= 15)
  const reviewStatus = score >= 90 && failedChecks.length === 0
    ? 'pass'
    : score >= 75 && !hasCriticalFail
      ? 'needs-review'
      : 'fail'

  const failures = failedChecks.map(c => `⚠ ${c.label}${c.detail ? ` — ${c.detail.split('\n')[0]}` : ''}`)
  const warnings = passedChecks
    .filter(c => c.score < 100)
    .map(c => `△ ${c.label} (${c.score}점)`)
  const autoFixable = failedChecks.filter(c => c.autoFixable).map(c => c.id)

  return {
    packageId: pkg.packageId,
    checkedAt: new Date().toISOString(),
    score,
    grade,
    reviewStatus,
    checks,
    failures,
    warnings,
    autoFixable,
  }
}

// ── AI 검사 결과 병합 ─────────────────────────────────────────────────────────
// AI가 translation-quality 또는 prompt-consistency를 검사한 결과를
// 기존 QualityReport에 덮어쓴다.

type AICheckPatch = {
  id: 'translation-quality' | 'prompt-consistency'
  passed: boolean
  score: number
  detail?: string
}

export function mergeAIChecks(report: QualityReport, patches: AICheckPatch[]): QualityReport {
  const updatedChecks = report.checks.map(c => {
    const patch = patches.find(p => p.id === c.id)
    if (!patch) return c
    return { ...c, passed: patch.passed, score: patch.score, detail: patch.detail }
  })

  const score        = calcWeightedScore(updatedChecks)
  const grade        = scoreToGrade(score)
  const failedChecks = updatedChecks.filter(c => !c.passed)
  const passedChecks = updatedChecks.filter(c => c.passed)

  const hasCriticalFail = failedChecks.some(c => c.weight >= 15)
  const reviewStatus = score >= 90 && failedChecks.length === 0
    ? 'pass'
    : score >= 75 && !hasCriticalFail
      ? 'needs-review'
      : 'fail'

  return {
    ...report,
    score,
    grade,
    reviewStatus,
    checks: updatedChecks,
    failures: failedChecks.map(c => `⚠ ${c.label}${c.detail ? ` — ${c.detail.split('\n')[0]}` : ''}`),
    warnings: passedChecks.filter(c => c.score < 100).map(c => `△ ${c.label} (${c.score}점)`),
    autoFixable: failedChecks.filter(c => c.autoFixable).map(c => c.id),
  }
}

// ── QualityReport → PackageQuality 요약 ──────────────────────────────────────

export function toPackageQuality(report: QualityReport): PackageQuality {
  return {
    score: report.score,
    grade: report.grade,
    reviewStatus: report.reviewStatus,
    checkedAt: report.checkedAt,
    failCount: report.failures.length,
    warningCount: report.warnings.length,
  }
}

// ── 콘솔 출력 (개발 전용) ─────────────────────────────────────────────────────

export function printQCReport(report: QualityReport): void {
  if (process.env.NODE_ENV !== 'development') return

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`QC Report: ${report.packageId}`)
  console.log(`Score: ${report.score}/100  Grade: ${report.grade}  Status: ${report.reviewStatus.toUpperCase()}`)
  console.log('─'.repeat(50))

  for (const check of report.checks) {
    const icon = check.passed ? '✓' : '✗'
    console.log(`${icon} [${check.score.toString().padStart(3)}] ${check.label}`)
    if (check.detail) {
      check.detail.split('\n').forEach(line => console.log(`     ${line}`))
    }
  }

  if (report.failures.length > 0) {
    console.log('\nFailures:')
    report.failures.forEach(f => console.log(` ${f}`))
  }

  if (report.warnings.length > 0) {
    console.log('\nWarnings:')
    report.warnings.forEach(w => console.log(` ${w}`))
  }

  if (report.autoFixable.length > 0) {
    console.log(`\nAuto-fixable: ${report.autoFixable.join(', ')}`)
  }

  console.log('─'.repeat(50) + '\n')
}
