// ── 결제를 막았던 「보이지 않는 한 글자」를 고정한다 ─────────────────────────
//
// 2026-09-12 프로덕션 실측: Vercel의 Paddle 값 앞에 BOM(U+FEFF)이 붙어 있었다.
// 로컬 `.env.local`은 깨끗해서 **개발에서는 재현되지 않았다.**
//
// 이 테스트가 지키는 것은 「환경변수가 깨끗하다」가 아니다 — 대시보드 값은
// 여기서 볼 수 없다. 지키는 것은 **더러운 값이 들어와도 코드가 버틴다**는 것이다.
// 그래서 실제로 프로덕션에서 나온 그 문자열을 그대로 넣어 본다.
//
//   npm run test:env
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-unused-expressions --
   `조건 ? ok(…) : no(…)` 는 이 저장소의 테스트 표기다. 검사와 보고가 한 줄에
   붙어 있어야 읽을 때 눈이 갈라지지 않는다. */
import { cleanEnv, cleanEnvLoud } from '../lib/paddle/env';

let pass = 0, fail = 0;
const ok = (l: string, x = '') => { pass++; console.log(`  ok   ${l}${x ? ' — ' + x : ''}`); };
const no = (l: string, d: string) => { fail++; console.log(`  FAIL ${l}\n       ${d}`); };

console.log('Paddle 환경변수 — 보이지 않는 글자');

const BOM = '﻿';
// ★ 프로덕션에서 실제로 나온 형태 (값은 자리표시자로 바꿨다)
const DIRTY_TOKEN = BOM + 'live_273dd9a498065eab2d3e040e7f1';
const DIRTY_PRICE = BOM + 'pri_01ky74gvff7x82ehk7csbaztx1';

// ── ① 떼어내는가 ────────────────────────────────────────────────────────────
{
  const t = cleanEnv(DIRTY_TOKEN);
  t === 'live_273dd9a498065eab2d3e040e7f1'
    ? ok('BOM이 붙은 토큰을 깨끗하게 만든다', `${DIRTY_TOKEN.length}자 → ${t!.length}자`)
    : no('토큰에서 BOM이 안 떨어진다', String(t));

  cleanEnv(DIRTY_PRICE) === 'pri_01ky74gvff7x82ehk7csbaztx1'
    ? ok('BOM이 붙은 가격 ID를 깨끗하게 만든다')
    : no('가격 ID에서 BOM이 안 떨어진다', String(cleanEnv(DIRTY_PRICE)));
}

// ── ② ★ 진짜 증상 — 헤더를 만들 수 있는가 ───────────────────────────────────
//    이것이 「Upgrade to Pro가 아무 반응 없음」의 정체였다.
//    브라우저는 U+FEFF를 헤더에 못 넣고 요청을 만들기도 전에 던진다.
{
  let threw = false;
  try { new Headers({ Authorization: `Bearer ${DIRTY_TOKEN}` }); } catch { threw = true; }
  threw
    ? ok('★ 더러운 토큰은 실제로 Headers 생성에서 던진다 (증상 재현)')
    : no('더러운 토큰인데 헤더가 만들어진다',
        '이 환경에서는 증상이 재현되지 않는다 — 아래 검사만으로는 부족하다');

  let ok2 = true;
  try { new Headers({ Authorization: `Bearer ${cleanEnv(DIRTY_TOKEN)}` }); } catch { ok2 = false; }
  ok2
    ? ok('★ 떼어낸 토큰으로는 헤더가 만들어진다 (결제 경로가 열린다)')
    : no('떼어냈는데도 헤더를 못 만든다', '다른 글자가 더 섞여 있다');
}

// ── ③ ★ 두 번째 증상 — 가격 ID 비교 ────────────────────────────────────────
//    웹훅은 `priceId !== KPATTO_PRICE_ID`면 200으로 흘려보낸다.
//    BOM이 붙으면 영원히 다르다 — 결제가 돼도 구독이 안 켜진다.
{
  const fromPaddle = 'pri_01ky74gvff7x82ehk7csbaztx1';
  (fromPaddle !== DIRTY_PRICE)
    ? ok('★ 더러운 가격 ID는 웹훅 비교에서 영원히 어긋난다 (증상 재현)')
    : no('증상이 재현되지 않는다', '이 검사는 아무것도 보장하지 않는다');
  (fromPaddle === cleanEnv(DIRTY_PRICE))
    ? ok('★ 떼어내면 일치한다 (구독이 켜진다)')
    : no('떼어냈는데도 안 맞는다', String(cleanEnv(DIRTY_PRICE)));
}

// ── ④ 그 밖에 딸려오는 것들 ────────────────────────────────────────────────
{
  const cases: [string, string, string][] = [
    ['앞뒤 공백',        '  live_abc  ',        'live_abc'],
    ['따옴표째 붙여넣기', '"live_abc"',          'live_abc'],
    ['폭 없는 공백',     '​live_abc',      'live_abc'],
    ['word joiner',      'live_abc⁠',      'live_abc'],
    ['줄바꿈',           'live_abc\n',          'live_abc'],
  ];
  for (const [label, raw, want] of cases) {
    cleanEnv(raw) === want ? ok(label) : no(label, `${JSON.stringify(cleanEnv(raw))} ≠ ${want}`);
  }
}

// ── ⑤ 빈 값은 미설정과 같아야 한다 ──────────────────────────────────────────
{
  cleanEnv('') === undefined && cleanEnv('   ') === undefined && cleanEnv(BOM) === undefined
    ? ok('빈 값·공백·BOM뿐인 값은 undefined다 (「설정했는데 빈 값」을 미설정과 같게)')
    : no('빈 값이 undefined가 아니다',
        '빈 문자열이 미설정과 다르게 동작하면 원인 찾는 데만 하루가 간다');

  cleanEnv(undefined) === undefined && cleanEnv(null) === undefined
    ? ok('undefined·null을 그대로 통과시킨다')
    : no('undefined 처리가 틀렸다', '');
}

// ── ⑥ 고칠 때 조용하지 않은가 ───────────────────────────────────────────────
//    조용히 고치기만 하면 대시보드 값은 계속 더러운 채로 남는다.
{
  const warned: string[] = [];
  const orig = console.warn;
  console.warn = (...a: unknown[]) => { warned.push(a.join(' ')); };
  cleanEnvLoud(DIRTY_TOKEN, 'TEST_TOKEN');
  cleanEnvLoud('live_clean', 'TEST_CLEAN');
  console.warn = orig;

  warned.length === 1 && warned[0].includes('U+FEFF') && warned[0].includes('TEST_TOKEN')
    ? ok('★ 더러운 값일 때만 경고하고, 어느 변수의 어떤 글자인지 말한다')
    : no('경고가 틀렸다', JSON.stringify(warned));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
