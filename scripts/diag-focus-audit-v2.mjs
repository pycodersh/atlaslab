/**
 * diag-focus-audit-v2.mjs
 * EP01~100 focus 표현 배분표 vs 실제 DB 비교 진단 스크립트
 *
 * 조인 경로:
 *   kp_dialogue_expressions(dialogue_id, expression_id, role)
 *   -> kp_dialogues(id, episode_id)
 *   -> kp_episodes(id, episode_num)
 *
 * 배분표: 화당 4개 (EP11만 5개)
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const headers = {
  'apikey': SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

async function supabaseGet(path) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase [${res.status}] ${path}\n  ${text}`);
  }
  return res.json();
}

async function main() {
  console.log('=== K-PATTO Focus 표현 감사 (EP01~100) ===\n');

  // 1. kp_episodes: EP01~100
  const episodes = await supabaseGet(
    'kp_episodes?select=id,episode_num&episode_num=lte.100&order=episode_num.asc&limit=200'
  );
  if (!episodes.length) {
    console.log('kp_episodes 데이터 없음.');
    return;
  }

  // id -> episode_num, episode_num -> id
  const epIdToNum = new Map(episodes.map(e => [e.id, e.episode_num]));
  const epNumToId = new Map(episodes.map(e => [e.episode_num, e.id]));
  const validEpIds = new Set(epIdToNum.keys());

  // 2. kp_dialogues: 유효한 에피소드에 속한 dialogue id -> episode_id 매핑
  //    (episode_num 1~100의 episode_id 목록으로 필터)
  //    Supabase는 배열 필터를 지원하지만 너무 많을 수 있으니 전체 가져와서 메모리 필터
  console.log(`에피소드 ${episodes.length}개 로드 완료. kp_dialogues 로드 중...`);

  // 페이지 단위로 전체 dialogue 로드
  let allDialogues = [];
  let offset = 0;
  const PAGE = 1000;
  while (true) {
    const batch = await supabaseGet(
      `kp_dialogues?select=id,episode_id&limit=${PAGE}&offset=${offset}`
    );
    allDialogues = allDialogues.concat(batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }

  // dialogue_id -> episode_id (EP01~100 내에 있는 것만)
  const dlgToEp = new Map();
  for (const d of allDialogues) {
    if (validEpIds.has(d.episode_id)) {
      dlgToEp.set(d.id, d.episode_id);
    }
  }
  console.log(`kp_dialogues ${allDialogues.length}행 로드 (유효 EP 내 ${dlgToEp.size}행)\n`);

  // 3. kp_dialogue_expressions: role='focus' 전체
  let allFocus = [];
  offset = 0;
  while (true) {
    const batch = await supabaseGet(
      `kp_dialogue_expressions?select=dialogue_id,expression_id&role=eq.focus&limit=${PAGE}&offset=${offset}`
    );
    allFocus = allFocus.concat(batch);
    if (batch.length < PAGE) break;
    offset += PAGE;
  }
  console.log(`kp_dialogue_expressions (role=focus) ${allFocus.length}행 로드\n`);

  // episode_id -> Set<expression_id>
  const focusByEpId = new Map();
  for (const row of allFocus) {
    const epId = dlgToEp.get(row.dialogue_id);
    if (epId === undefined) continue; // EP 범위 밖
    if (!focusByEpId.has(epId)) focusByEpId.set(epId, new Set());
    focusByEpId.get(epId).add(row.expression_id);
  }

  // 4. 배분표: EP11만 5개, 나머지 4개
  function expectedCount(epNum) {
    return epNum === 11 ? 5 : 4;
  }

  // 5. 결과 집계
  const results = [];
  for (const ep of episodes) {
    const { id: epId, episode_num: epNum } = ep;
    const expected = expectedCount(epNum);
    const actualSet = focusByEpId.get(epId) || new Set();
    const actual = actualSet.size;
    const diff = expected - actual;
    results.push({
      epNum, epId, expected, actual, diff,
      expressionIds: [...actualSet].sort((a, b) => a - b),
    });
  }

  // 6. 테이블 출력
  const pad = (s, n) => String(s).padEnd(n);
  console.log(
    pad('EP', 7) +
    pad('배분표', 8) +
    pad('실제 수', 8) +
    pad('차이', 6) +
    '연결된 expression_id 목록'
  );
  console.log('─'.repeat(90));

  const missing = [];
  for (const r of results) {
    const label = `EP${String(r.epNum).padStart(2, '0')}`;
    const diffLabel = r.diff > 0 ? `▼${r.diff}` : 'OK';
    const ids = r.expressionIds.length ? r.expressionIds.join(', ') : '(없음)';
    console.log(
      pad(label, 7) +
      pad(r.expected, 8) +
      pad(r.actual, 8) +
      pad(diffLabel, 6) +
      ids
    );
    if (r.diff > 0) missing.push(r);
  }

  // 7. 누락 요약
  console.log('\n' + '═'.repeat(90));
  if (missing.length === 0) {
    console.log('전체 정상 — 모든 EP의 focus 표현 수가 배분표와 일치합니다.');
  } else {
    console.log(`누락 EP: ${missing.length}개\n`);
    console.log(pad('EP', 7) + pad('배분표', 8) + pad('실제 수', 8) + pad('부족', 6) + '연결된 expression_id');
    console.log('─'.repeat(70));
    for (const m of missing) {
      const label = `EP${String(m.epNum).padStart(2, '0')}`;
      const ids = m.expressionIds.length ? m.expressionIds.join(', ') : '(없음)';
      console.log(pad(label, 7) + pad(m.expected, 8) + pad(m.actual, 8) + pad(m.diff, 6) + ids);
    }
  }

  // 8. 전체 통계
  const totalExpected = results.reduce((s, r) => s + r.expected, 0);
  const totalActual   = results.reduce((s, r) => s + r.actual, 0);
  console.log(`\n총계: 배분표=${totalExpected}, 실제=${totalActual}, 차이=${totalExpected - totalActual}`);
  console.log(`대상 EP=${results.length}개, 누락 EP=${missing.length}개`);
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
