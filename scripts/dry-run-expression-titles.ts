/**
 * dry-run-expression-titles.ts
 *
 * generateMetadata의 title 계산 로직을 그대로 재현해서
 * kp_expressions 325개의 예상 title을 CSV로 stdout에 출력.
 *
 * DB 쓰기·페이지 변경 없음. 읽기 전용.
 *
 * 실행: npx ts-node -r dotenv/config scripts/dry-run-expression-titles.ts > titles.csv
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// ── generateMetadata와 동일한 헬퍼 ──────────────────────────────────────────

type ExampleItem = { ko: string; en: string }

/** 앞뒤 `~` 제거. e.g. "~주세요" → "주세요" */
function cleanKorean(raw: string): string {
  return raw.replace(/^~+|~+$/g, '').trim()
}

/** 전체 `~` 제거 후 공백·구두점 정리.
 *  e.g. "I'm from ~." → "I'm from"
 *       "Give me ~, please." → "Give me, please" */
function cleanEnglish(raw: string): string {
  return raw
    .replace(/~/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ([,?.])/g, '$1')
    .trim()
    .replace(/\.+$/, '')
    .trim()
}

/** 문말 마침표만 제거 (examples 경로용 — 물결 제거 로직 미적용) */
function stripPeriod(s: string): string {
  return s.replace(/\.+$/, '').trim()
}

/** 단어 경계에서 maxLen 자 잘라 "..." 붙이기 */
function truncateAtWord(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '...'
}

/** title 조합: 80자 초과 시 — {korean} suffix 제거 */
function buildTitle(clean: string, kor: string): string {
  if (!clean) return `${kor} in Korean`
  const isQuestion = clean.endsWith('?')
  const full = isQuestion
    ? `How to Ask "${clean}" in Korean — ${kor}`
    : `How to Say "${clean}" in Korean — ${kor}`
  if (full.length <= 80) return full
  return isQuestion
    ? `How to Ask "${clean}" in Korean`
    : `How to Say "${clean}" in Korean`
}

type TitleResult = {
  title: string
  path: 'examples' | 'normal' | 'examples-missing'
}

/** generateMetadata와 동일한 title 계산 */
function computeTitle(
  korean: string,
  english: string | null,
  examples: ExampleItem[] | null,
): TitleResult {
  const hasTilde = (english ?? '').includes('~') || korean.includes('~')
  const ex0 = examples?.[0]

  if (hasTilde) {
    if (ex0) {
      return {
        title: buildTitle(stripPeriod(ex0.en), stripPeriod(ex0.ko)),
        path: 'examples',
      }
    }
    // examples 없음 — 현행 로직으로 폴백 (~ 잔존 가능)
    return {
      title: buildTitle(
        english ? cleanEnglish(english) : '',
        cleanKorean(korean),
      ),
      path: 'examples-missing',
    }
  }

  return {
    title: buildTitle(
      english ? cleanEnglish(english) : '',
      cleanKorean(korean),
    ),
    path: 'normal',
  }
}

// ── SLUG_TO_ID (expressions-config에서 import) ────────────────────────────
import { SLUG_TO_ID, ID_TO_SLUG } from '../lib/kpatto/expressions-config'

const SEO_IDS: number[] = Object.values(SLUG_TO_ID)

// ── Supabase 클라이언트 ────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

// ── CSV 셀 escape ──────────────────────────────────────────────────────────
function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value)
  // 쉼표·따옴표·줄바꿈 포함 시 큰따옴표로 감싸기
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

// ── 메인 ─────────────────────────────────────────────────────────────────────
async function main() {
  const { data, error } = await supabase
    .from('kp_expressions')
    .select('id, korean, english, examples')
    .in('id', SEO_IDS)
    .order('id')

  if (error) {
    process.stderr.write(`[ERROR] Supabase query failed: ${error.message}\n`)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    process.stderr.write('[WARN] No rows returned.\n')
    process.exit(0)
  }

  process.stderr.write(`[INFO] ${data.length} rows fetched (expected 325)\n`)

  // CSV 헤더
  const HEADER = ['id', 'slug', 'korean', 'raw_english', 'path', 'title', 'title_len']
  process.stdout.write(HEADER.join(',') + '\n')

  for (const row of data) {
    const slug    = ID_TO_SLUG[row.id] ?? ''
    const examples = row.examples as ExampleItem[] | null
    const { title, path } = computeTitle(row.korean, row.english, examples)

    const cells = [
      csvCell(row.id),
      csvCell(slug),
      csvCell(row.korean),
      csvCell(row.english ?? ''),
      csvCell(path),
      csvCell(title),
      csvCell(title.length),
    ]
    process.stdout.write(cells.join(',') + '\n')
  }

  process.stderr.write('[INFO] Done.\n')
}

main()
