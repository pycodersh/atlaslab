/**
 * K-PATTO 캐러셀 HTML 생성기
 *
 * 실행: npx tsx scripts/carousel/generate-carousel.ts --from N --to M
 *   --from  시작 순번 (1-based, 포함)
 *   --to    끝 순번  (1-based, 포함)
 *
 * 예: --from 1 --to 5  → 1~5번 표현 5세트 30장 생성
 */

import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'
import { romanize } from 'koroman'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const OUT = path.resolve(process.cwd(), 'scripts/carousel/kpatto-carousel.html')

// ── CLI 인자 파싱 ─────────────────────────────────────────────────────────────

function parseArgs(): { from: number; to: number } {
  const argv = process.argv.slice(2)
  const get = (flag: string): number | null => {
    const i = argv.indexOf(flag)
    if (i < 0 || !argv[i + 1]) return null
    const v = parseInt(argv[i + 1], 10)
    return isNaN(v) ? null : v
  }
  const from = get('--from')
  const to   = get('--to')
  if (from === null || to === null) {
    console.error('Usage: npx tsx scripts/carousel/generate-carousel.ts --from N --to M')
    console.error('  N, M: 1-based 순번 (expression-order.csv 기준)')
    process.exit(1)
  }
  if (from < 1 || to < from) {
    console.error(`[오류] --from ${from} --to ${to}: 유효하지 않은 범위 (from ≥ 1, to ≥ from)`)
    process.exit(1)
  }
  return { from, to }
}

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────

/** 패턴에서 핵심어 추출: "~주세요" → "주세요", "~이에요/예요" → "이에요" */
function corePattern(patKo: string): string {
  return patKo.replace(/^~/, '').split('/')[0].replace(/[.!?]$/, '').trim()
}

/**
 * 예문 ko → {lead, hl} 분리
 * 문장부호(? ! .)는 원문 그대로 유지 — hl에 포함
 */
function splitEx(exKo: string, patKo: string): { lead: string; hl: string } {
  const raw  = exKo.trim()                // 원문 유지 (부호 제거 안 함)
  const core = corePattern(patKo)         // 검색용: 부호 제거한 핵심어
  const idx  = raw.indexOf(core)
  if (idx < 0) return { lead: '', hl: raw }
  return {
    lead: raw.slice(0, idx).trim(),
    hl:   raw.slice(idx).trim(),          // 핵심어 + 이후 문장부호 포함
  }
}

/**
 * hookL1: 첫 예문 영어
 * hookL2: hookL1이 ?로 끝나면 "How do you ask it?", 아니면 "How do you say it?"
 */
function makeHook(examples: unknown, fallbackEn: string): [string, string] {
  const l2 = (l1: string) => l1.trim().endsWith('?') ? 'How do you ask this in Korean?' : 'How do you say this in Korean?'
  try {
    const arr = (typeof examples === 'string' ? JSON.parse(examples) : examples) as { en: string; ko: string }[]
    if (Array.isArray(arr) && arr[0]?.en) {
      const h1 = arr[0].en
      return [h1, l2(h1)]
    }
  } catch { /* skip */ }
  return [fallbackEn, l2(fallbackEn)]
}

/** pattern_ko → formula: "~주세요" → "[anything] + 주세요" */
function makeFormula(patKo: string): string {
  const stripped = patKo.replace(/^~/, '').trim()
  if (stripped.includes('/')) return `[noun] + ${stripped.replace('/', ' / ')}`
  return `[anything] + ${stripped}`
}

/**
 * description 첫 문장, 120자 단어 경계 자름
 * 마침표/느낌표/물음표 기준 첫 문장 추출 후 120자 초과 시 트림
 */
function firstSentence(desc: string | null, maxLen = 120): string {
  if (!desc || desc.trim() === '') return ''
  const m = desc.match(/^[^.!?]+[.!?]/)
  const sent = (m ? m[0] : desc).trim()
  if (sent.length <= maxLen) return sent
  const cut = sent.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…'
}

// ── 메인 ──────────────────────────────────────────────────────────────────────

async function main() {
  const { from, to } = parseArgs()
  console.log(`K-PATTO 캐러셀 생성: 순번 ${from}~${to}\n`)

  // 전체 조회 (정렬 기준: first_episode ASC, id ASC — expression-order.csv 동일)
  const { data, error } = await sb
    .from('kp_expressions')
    .select('id, slug, first_episode, korean, english, romaja, structure, description, examples')
    .order('first_episode', { ascending: true, nullsFirst: false })
    .order('id', { ascending: true })
    .range(0, 999)

  if (error) throw new Error(`DB 조회 실패: ${error.message}`)
  const allRows = data ?? []
  console.log(`전체 조회: ${allRows.length}건`)

  // --from/--to 슬라이스 (1-based → 0-based)
  const rows = allRows.slice(from - 1, to)
  console.log(`범위 슬라이스: ${rows.length}건 (순번 ${from}~${Math.min(to, allRows.length)})\n`)

  // description 공백 통계 (전체 기준)
  const emptyDesc = allRows.filter(r => !r.description || r.description.trim() === '').length
  console.log(`description 공백: ${emptyDesc}건 / 전체 ${allRows.length}건`)
  if (emptyDesc > 0) {
    console.log('  공백 예시:')
    allRows.filter(r => !r.description || r.description.trim() === '').slice(0, 5).forEach(r =>
      console.log(`    ep${r.first_episode} id=${r.id} slug=${r.slug}`)
    )
  }
  console.log()

  // 샘플 확인 (슬라이스 첫 3행)
  console.log('── 샘플 확인 ────────────────────────────────────────')
  for (const r of rows.slice(0, 3)) {
    const desc1 = firstSentence(r.description)
    console.log(`[${r.slug}]  ep=${r.first_episode}`)
    console.log(`  description → "${desc1 || '(비어 있음)'}"`)
    console.log(`  formula     → "${r.structure || makeFormula(r.korean)}"`)
    console.log()
  }

  // ── SETS 빌드 ─────────────────────────────────────────────────────────────
  type ExRow = { en: string; ko: string }

  const SETS = rows.map((r, localIdx) => {
    // 예문 파싱
    let exArr: ExRow[] = []
    try {
      const raw = typeof r.examples === 'string' ? JSON.parse(r.examples) : r.examples
      if (Array.isArray(raw)) exArr = (raw as ExRow[]).slice(0, 2)
    } catch { /* skip */ }
    while (exArr.length < 2) exArr.push({ ko: r.korean, en: r.english })

    const ex = exArr.slice(0, 2).map((e: ExRow) => {
      const { lead, hl } = splitEx(e.ko, r.korean)
      let roma = ''
      try { roma = romanize(e.ko) ?? '' } catch { roma = '' }
      return { lead, hl, roma, en: e.en }
    })

    const [hookL1, hookL2] = makeHook(r.examples, r.english)
    const formula = r.structure || makeFormula(r.korean)
    const desc    = firstSentence(r.description)

    return {
      slug:    r.slug || String(r.id),
      hookL1,
      hookL2,
      ko:      r.korean,
      // romaja 컬럼은 slug와 동일한 값이므로 발음 표기로 부적합 → 생략
      en:      r.english,
      ex,
      desc,
      formula,
    }
  })

  // ── HTML 생성 ─────────────────────────────────────────────────────────────
  const html = buildHtml(SETS, from, Math.min(to, allRows.length))
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, html, 'utf-8')

  const sizeMB = (fs.statSync(OUT).size / 1024).toFixed(1)
  console.log('── 생성 완료 ────────────────────────────────────────')
  console.log(`파일: ${OUT}`)
  console.log(`세트: ${SETS.length}개 / 카드: ${SETS.length * 6}장 / 크기: ${sizeMB} KB`)
}

// ── HTML 빌더 ─────────────────────────────────────────────────────────────────

function buildHtml(
  sets: Array<{
    slug: string; hookL1: string; hookL2: string
    ko: string; en: string
    ex: { lead: string; hl: string; roma: string; en: string }[]
    desc: string; formula: string
  }>,
  fromN: number,
  toN: number,
): string {
  const setsJson = JSON.stringify(sets)
  const today = new Date().toISOString().slice(0, 10)
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>K-PATTO carousel — #${fromN}–${toN} (${sets.length} sets) — ${today}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Playfair+Display:ital,wght@0,500;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { background:#1A1A1A; font-family:'Inter','Noto Sans KR',sans-serif; padding:40px; }
  .set { margin-bottom:60px; }
  .set-label { color:#888; font-size:14px; margin-bottom:4px; letter-spacing:2px; }
  .set-num   { color:#555; font-size:12px; margin-bottom:12px; }
  .row { display:flex; flex-wrap:wrap; gap:16px; }

  /* ── 카드 공통 ── */
  .card {
    width:1080px; height:1080px; padding:110px;
    display:flex; flex-direction:column; box-sizing:border-box;
    position:relative; overflow:hidden;
    background-size:cover; background-position:center;
    background-color:#1c2e20; /* bg 로드 전 fallback */
  }
  /* bg 파일명 = 카드 번호와 1:1 대응 */
  .c1 { background-image:url('bg/bg-1.jpg'); }  /* 01 INTRODUCTION  — 진초록 기하학 */
  .c2 { background-image:url('bg/bg-2.jpg'); }  /* 02 THE PHRASE     — 크림+매화     */
  .c3 { background-image:url('bg/bg-3.jpg'); }  /* 03 EXAMPLE 1     — 크림+아웃라인 */
  .c4 { background-image:url('bg/bg-4.jpg'); }  /* 04 EXAMPLE 2     — 크림+구름     */
  .c5 { background-image:url('bg/bg-5.jpg'); }  /* 05 HOW IT WORKS  — 골드          */
  .c6 { background-image:url('bg/bg-6.jpg'); }  /* 06 CONCLUSION    — 진초록(bg-1과 동일 파일) */

  /* 텍스트 폭 — 배경 장식 위치에 따라 카드별로 다름 */
  .col     { max-width:62%; overflow:hidden; }
  .c1 .col, .c6 .col { max-width:80%; }   /* 장식이 우측 상단 모서리에만 → 넓게 */
  .c2 .between        { max-width:72%; }   /* 매화가 우측 상단에만 → 중간 */
  /* .c3~5 .between 는 기본 62% 유지 */

  .num       { font-size:22px; letter-spacing:8px; color:#C9A227; white-space:nowrap; }
  .num-dark  { font-size:22px; letter-spacing:8px; color:#8C6B33; }
  .num-gold  { font-size:22px; letter-spacing:8px; color:#3D2A0C; }

  .hook      { font-family:'Playfair Display',serif; font-style:italic; font-weight:500;
              font-size:78px; line-height:1.24; color:#D9B45B; overflow-wrap:normal; }
  /* l1: 한 줄 강제 — 하이픈 등에서 꺾이지 않도록; JS가 60px까지 축소 */
  .hook .l1  { display:block; white-space:nowrap; }
  .hook .l2  { display:block; font-size:44px; color:#EFE6CF; margin-top:16px; }  /* 서브타이틀: 고정 44px, 줄바꿈 허용 */
  .swipe  { font-size:30px; color:#C9A227; }

  .ko-big { font-family:'Noto Sans KR',sans-serif; font-size:96px; font-weight:700; color:#14342A; line-height:1.24; }
  .ko-mid { font-family:'Noto Sans KR',sans-serif; font-size:82px; font-weight:700; color:#B5813C;
            line-height:1.3; white-space:nowrap; }   /* 한 줄 강제 — JS가 폰트 축소 처리 */
  .ko-mid .lead { color:#14342A; }
  .roma   { font-size:38px; color:#7C6B52; }
  .en     { font-size:44px; color:#14342A; }
  .rule   { width:120px; height:3px; background:#B5813C; margin:30px 0; }

  /* 카드 5: description 텍스트 */
  .desc    { font-size:64px; font-weight:600; line-height:1.45; color:#FFF6E4;
             text-shadow:0 2px 12px rgba(0,0,0,0.35); }
  .formula { font-family:'Noto Sans KR',sans-serif; font-size:38px; color:#F3E3C4; margin-top:8px; }

  .cta      { font-size:62px; line-height:1.36; color:#F2EEE4; }
  .cta-sub  { font-size:42px; color:#D9B45B; margin-top:34px; }
  .brand    { font-size:31px; letter-spacing:10px; color:#8FA79A; }

  .between  { flex:1; display:flex; flex-direction:column; justify-content:center; gap:20px; max-width:62%; }
  .spread   { justify-content:space-between; }
</style>
</head>
<body>
<div id="out"></div>

<script>
const SETS = ${setsJson};

const CTA_MAIN = "Over 300 Korean phrases,<br>with audio and<br>webtoon stories.";
const CTA_SUB  = "Start → link in bio";

function esc(s) {
  return String(s ?? '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
}

function cards(s) {
  const hook = \`<div class="card c1 spread" data-card="\${s.slug}-1">
      <div class="num">LEARN KOREAN &middot; 01</div>
      <div class="hook col"><span class="l1">\${esc(s.hookL1)}</span><span class="l2">\${esc(s.hookL2)}</span></div>
      <div class="swipe">swipe &rarr;</div>
    </div>\`;

  const phrase = \`<div class="card c2" data-card="\${s.slug}-2">
      <div class="num-dark">02 &middot; THE PHRASE</div>
      <div class="between">
        <div class="ko-big">\${esc(s.ko)}</div>
        <div class="rule"></div>
        <div class="en">\${esc(s.en)}</div>
      </div>
    </div>\`;

  const ex = s.ex.map((e, i) => \`<div class="card c\${i + 3}" data-card="\${s.slug}-\${i + 3}">
      <div class="num-dark">0\${i + 3} &middot; EXAMPLE</div>
      <div class="between">
        <div class="ko-mid">\${e.lead ? \`<span class="lead">\${esc(e.lead)}</span> \` : ''}\${esc(e.hl)}</div>
        \${e.roma ? \`<div class="roma">\${esc(e.roma)}</div>\` : ''}
        <div class="en">\${esc(e.en)}</div>
      </div>
    </div>\`).join('');

  const tip = \`<div class="card c5" data-card="\${s.slug}-5">
      <div class="num-gold">05 &middot; HOW IT WORKS</div>
      <div class="between">
        <div class="desc">\${esc(s.desc || s.en)}</div>
        <div class="formula">\${esc(s.formula)}</div>
      </div>
    </div>\`;

  const cta = \`<div class="card c6 spread" data-card="\${s.slug}-6">
      <div class="num">06 &middot; THE CONCLUSION</div>
      <div class="col">
        <div class="cta">\${CTA_MAIN}</div>
        <div class="cta-sub">\${CTA_SUB}</div>
      </div>
      <div class="brand">K-PATTO</div>
    </div>\`;

  return hook + phrase + ex + tip + cta;
}

document.getElementById('out').innerHTML = SETS.map(s =>
  \`<div class="set">
    <div class="set-label">\${s.slug.toUpperCase()}</div>
    <div class="row">\${cards(s)}</div>
  </div>\`
).join('');

// ── 예문 한 줄 맞춤: ko-mid가 부모 너비를 넘으면 폰트를 60px까지 축소 ──
function fitOneLine() {
  document.querySelectorAll('.ko-mid').forEach(function(el) {
    var parent = el.parentElement;
    if (!parent) return;
    var maxW = parent.clientWidth;
    if (maxW === 0) return;          // 숨겨진 카드는 건너뜀
    var size = 82;
    el.style.fontSize = size + 'px';
    while (el.scrollWidth > maxW && size > 60) {
      size -= 2;
      el.style.fontSize = size + 'px';
    }
  });
}

// ── 훅 l1 한 줄 맞춤: hookL1(.l1)이 .col 너비를 넘으면 .hook 폰트를 60px까지 축소 ──
function fitHook() {
  document.querySelectorAll('.hook').forEach(function(hook) {
    var l1 = hook.querySelector('.l1');
    if (!l1) return;
    var col = hook.closest('.col') || hook.parentElement;
    if (!col) return;
    var maxW = col.clientWidth;
    if (maxW === 0) return;
    var size = 78;
    hook.style.fontSize = size + 'px';
    while (l1.scrollWidth > maxW && size > 60) {
      size -= 2;
      hook.style.fontSize = size + 'px';
    }
  });
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(function() { fitOneLine(); fitHook(); });
} else {
  setTimeout(function() { fitOneLine(); fitHook(); }, 600);
}
</script>
</body>
</html>`
}

main().catch(e => { console.error('\n[중단]', e.message ?? e); process.exit(1) })
