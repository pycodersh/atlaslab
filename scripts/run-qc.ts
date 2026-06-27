/**
 * Story QC 실행 스크립트 (개발 전용)
 *
 * 사용법:
 *   npx tsx scripts/run-qc.ts
 *
 * Story 1 패키지에 QC를 실행하고 결과를 콘솔에 출력한다.
 */

import { story001Package } from '../data/factory/story-001-package'
import { runQC, printQCReport } from '../lib/factory/quality'

const report = runQC(story001Package as Parameters<typeof runQC>[0])
printQCReport(report)

console.log('Quality Summary:')
console.log(`  Score       : ${report.score}/100`)
console.log(`  Grade       : ${report.grade}`)
console.log(`  Status      : ${report.reviewStatus.toUpperCase()}`)
console.log(`  Failures    : ${report.failures.length}`)
console.log(`  Warnings    : ${report.warnings.length}`)
console.log(`  Auto-fixable: ${report.autoFixable.length}`)
