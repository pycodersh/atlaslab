/**
 * kp_challenges 품질 감사 + EP focus 패턴 커버리지
 * 실행: npx tsx scripts/audit-challenges.ts
 *
 * 스키마 확인: challenge_type 컬럼 사용, question = { prompt: "..." } JSON 객체
 */
import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
)

function isKorean(text: string): boolean { return /[가-힣ㄱ-ㆎ]/.test(text) }
function isEnglish(text: string): boolean { return /[a-zA-Z]/.test(text) && !/[가-힣]/.test(text) }
function pad(n: number) { return String(n).padStart(2, "0") }
function getPrompt(question: any): string {
  if (!question) return ""
  if (typeof question === "string") return question
  return question.prompt ?? question.text ?? JSON.stringify(question)
}

async function fetchAll<T>(table: string, columns: string, pageSize = 500): Promise<T[]> {
  const result: T[] = []
  let from = 0
  while (true) {
    const { data, error } = await sb.from(table).select(columns).order("id").range(from, from + pageSize - 1)
    if (error) throw new Error(`${table} 조회 실패: ${error.message}`)
    if (!data || data.length === 0) break
    result.push(...data as T[])
    if (data.length < pageSize) break
    from += pageSize
  }
  return result
}

async function main() {
  console.log("데이터 로드 중...")
  const [challenges, episodes, deRows, dialogues] = await Promise.all([
    fetchAll<any>("kp_challenges", "id, episode_id, challenge_type, question, answer, options, word_pieces"),
    fetchAll<any>("kp_episodes", "id, episode_num"),
    fetchAll<any>("kp_dialogue_expressions", "id, dialogue_id, role"),
    fetchAll<any>("kp_dialogues", "id, episode_id"),
  ])

  const epNumMap = new Map(episodes.map((e: any) => [e.id as number, e.episode_num as number]))
  const dlgEpMap = new Map(dialogues.map((d: any) => [d.id as number, d.episode_id as number]))
  const allEpNums = episodes.map((e: any) => e.episode_num as number).sort((a: number, b: number) => a - b)

  console.log(`챌린지: ${challenges.length}개 | 에피소드: ${episodes.length}개\n`)

  // 타입별 분포 미리 확인
  const byType: Record<string, number> = {}
  for (const c of challenges) byType[c.challenge_type ?? "null"] = (byType[c.challenge_type ?? "null"] ?? 0) + 1
  console.log("[ challenge_type 분포 ]")
  for (const [t, n] of Object.entries(byType).sort()) console.log(`  ${t}: ${n}개`)
  console.log()

  // ====== 1. translation ======
  console.log("══════════════════════════════════════════════")
  console.log("1. translation 타입")
  console.log("══════════════════════════════════════════════")

  const trans = challenges.filter((c: any) => c.challenge_type === "translation")
  const transNoAnswer: any[] = []
  const transLangSwap: any[] = []

  for (const c of trans) {
    const opts: string[] = Array.isArray(c.options) ? c.options : []
    const prompt = getPrompt(c.question)
    if (!opts.includes(c.answer)) transNoAnswer.push({ ...c, prompt })
    // question이 한국어이고 answer가 영어 → 뒤바뀜
    if (isKorean(prompt) && isEnglish(c.answer)) transLangSwap.push({ ...c, prompt })
    // question 영어 & answer도 영어 → 뒤바뀜
    else if (isEnglish(prompt) && isEnglish(c.answer)) transLangSwap.push({ ...c, prompt })
  }

  console.log(`translation 총 ${trans.length}개`)
  if (!transNoAnswer.length) { console.log("  ✅ answer가 options에 없는 것: 0건") }
  else {
    console.log(`  ⚠️  answer가 options에 없는 것: ${transNoAnswer.length}건`)
    for (const c of transNoAnswer.slice(0, 20)) {
      const ep = epNumMap.get(c.episode_id) ?? "?"
      console.log(`    [id=${c.id}] EP${pad(Number(ep))} Q="${c.prompt}" A="${c.answer}"`)
      console.log(`      options=${JSON.stringify(c.options)}`)
    }
    if (transNoAnswer.length > 20) console.log(`    ... 외 ${transNoAnswer.length - 20}건`)
  }
  if (!transLangSwap.length) { console.log("  ✅ 언어 뒤바뀜 의심: 0건") }
  else {
    console.log(`  ⚠️  언어 뒤바뀜 의심: ${transLangSwap.length}건`)
    for (const c of transLangSwap.slice(0, 20)) {
      const ep = epNumMap.get(c.episode_id) ?? "?"
      console.log(`    [id=${c.id}] EP${pad(Number(ep))} Q="${c.prompt}" A="${c.answer}"`)
    }
    if (transLangSwap.length > 20) console.log(`    ... 외 ${transLangSwap.length - 20}건`)
  }

  // ====== 2. fill_blank ======
  console.log("\n══════════════════════════════════════════════")
  console.log("2. fill_blank 타입")
  console.log("══════════════════════════════════════════════")

  const fill = challenges.filter((c: any) => c.challenge_type === "fill_blank")
  const fillNoBlank: any[] = []
  const fillNoAnswer: any[] = []

  for (const c of fill) {
    const prompt = getPrompt(c.question)
    if (!prompt.includes("___")) fillNoBlank.push({ ...c, prompt })
    const opts: string[] = Array.isArray(c.options) ? c.options : []
    if (!opts.includes(c.answer)) fillNoAnswer.push({ ...c, prompt })
  }

  console.log(`fill_blank 총 ${fill.length}개`)
  if (!fillNoBlank.length) { console.log("  ✅ 빈칸(___)이 없는 것: 0건") }
  else {
    console.log(`  ⚠️  빈칸(___)이 없는 것: ${fillNoBlank.length}건`)
    for (const c of fillNoBlank.slice(0, 20)) {
      const ep = epNumMap.get(c.episode_id) ?? "?"
      console.log(`    [id=${c.id}] EP${pad(Number(ep))} Q="${c.prompt}"`)
    }
    if (fillNoBlank.length > 20) console.log(`    ... 외 ${fillNoBlank.length - 20}건`)
  }
  if (!fillNoAnswer.length) { console.log("  ✅ answer가 options에 없는 것: 0건") }
  else {
    console.log(`  ⚠️  answer가 options에 없는 것: ${fillNoAnswer.length}건`)
    for (const c of fillNoAnswer.slice(0, 20)) {
      const ep = epNumMap.get(c.episode_id) ?? "?"
      console.log(`    [id=${c.id}] EP${pad(Number(ep))} Q="${c.prompt}" A="${c.answer}"`)
      console.log(`      options=${JSON.stringify(c.options)}`)
    }
    if (fillNoAnswer.length > 20) console.log(`    ... 외 ${fillNoAnswer.length - 20}건`)
  }

  // ====== 3. word_order ======
  console.log("\n══════════════════════════════════════════════")
  console.log("3. word_order 타입")
  console.log("══════════════════════════════════════════════")

  const worder = challenges.filter((c: any) => c.challenge_type === "word_order")
  const wordMismatch: any[] = []

  for (const c of worder) {
    const pieces: string[] = Array.isArray(c.word_pieces) ? c.word_pieces : []
    const joined = pieces.join(" ").trim()
    const answer = String(c.answer ?? "").trim()
    if (joined !== answer) wordMismatch.push({ ...c, joined })
  }

  console.log(`word_order 총 ${worder.length}개`)
  if (!wordMismatch.length) { console.log("  ✅ word_pieces 조합 불일치: 0건") }
  else {
    console.log(`  ⚠️  word_pieces 조합 불일치: ${wordMismatch.length}건`)
    for (const c of wordMismatch.slice(0, 20)) {
      const ep = epNumMap.get(c.episode_id) ?? "?"
      console.log(`    [id=${c.id}] EP${pad(Number(ep))}`)
      console.log(`      word_pieces: ${JSON.stringify(c.word_pieces)}`)
      console.log(`      joined    : "${c.joined}"`)
      console.log(`      answer    : "${c.answer}"`)
    }
    if (wordMismatch.length > 20) console.log(`    ... 외 ${wordMismatch.length - 20}건`)
  }

  // ====== 4. 에피소드 커버리지 ======
  console.log("\n══════════════════════════════════════════════")
  console.log("4. 에피소드 챌린지 커버리지")
  console.log("══════════════════════════════════════════════")

  const challengeByEp = new Map<number, number>()
  for (const c of challenges) {
    const epNum = epNumMap.get(c.episode_id) ?? 0
    challengeByEp.set(epNum, (challengeByEp.get(epNum) ?? 0) + 1)
  }

  const noChallengeEps = allEpNums.filter((n: number) => !challengeByEp.has(n))
  const avg = allEpNums.reduce((s: number, n: number) => s + (challengeByEp.get(n) ?? 0), 0) / allEpNums.length

  if (!noChallengeEps.length) { console.log("  ✅ 챌린지 없는 에피소드: 0건") }
  else { console.log(`  ⚠️  챌린지 없는 에피소드 (${noChallengeEps.length}건): EP${noChallengeEps.map((n: number) => pad(n)).join(", EP")}`) }
  console.log(`  EP당 평균 챌린지: ${avg.toFixed(1)}개`)
  console.log("  challenge_type별:")
  for (const [t, n] of Object.entries(byType).sort()) console.log(`    ${t}: ${n}개`)

  const sorted = allEpNums.map((n: number) => ({ n, cnt: challengeByEp.get(n) ?? 0 })).sort((a: any, b: any) => b.cnt - a.cnt)
  console.log(`  많은 TOP5: ${sorted.slice(0, 5).map((x: any) => `EP${pad(x.n)}(${x.cnt})`).join(", ")}`)
  const bottom5 = [...sorted].reverse().slice(0, 5)
  console.log(`  적은 TOP5: ${bottom5.map((x: any) => `EP${pad(x.n)}(${x.cnt})`).join(", ")}`)

  // ====== 5. focus 패턴 커버리지 ======
  console.log("\n══════════════════════════════════════════════")
  console.log("5. EP별 focus 패턴 수 (kp_dialogue_expressions role=focus)")
  console.log("══════════════════════════════════════════════")

  const focusRows = deRows.filter((r: any) => r.role === "focus")
  const focusByEp = new Map<number, number>()
  for (const r of focusRows) {
    const epId = dlgEpMap.get(r.dialogue_id)
    if (!epId) continue
    const epNum = epNumMap.get(epId) ?? 0
    focusByEp.set(epNum, (focusByEp.get(epNum) ?? 0) + 1)
  }

  const noFocusEps = allEpNums.filter((n: number) => (focusByEp.get(n) ?? 0) === 0)
  if (!noFocusEps.length) { console.log("  ✅ focus 패턴 없는 에피소드: 0건") }
  else { console.log(`  ⚠️  focus 패턴 없는 에피소드 (${noFocusEps.length}건): EP${noFocusEps.map((n: number) => pad(n)).join(", EP")}`) }

  console.log("\n  EP별 focus 패턴 수:")
  for (let i = 0; i < allEpNums.length; i += 10) {
    const chunk = allEpNums.slice(i, i + 10)
    console.log("  " + chunk.map((n: number) => `EP${pad(n)}:${String(focusByEp.get(n) ?? 0).padStart(2)}`).join("  "))
  }
  const focusAvg = allEpNums.reduce((s: number, n: number) => s + (focusByEp.get(n) ?? 0), 0) / allEpNums.length
  console.log(`\n  EP당 평균 focus 패턴: ${focusAvg.toFixed(1)}개`)
  console.log("\n══ 완료 ══")
}

main().catch(console.error)
