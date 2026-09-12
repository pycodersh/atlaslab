// ── 웹훅 서명 — 검증이 실제로 막는가 ────────────────────────────────────────
//
// 2026-09-12에 웹훅 라우트가 **둘**이고 한쪽만 검증하는 것을 발견했다.
// `app/patto/api/webhooks/paddle`는 서명을 보지 않고 `kpatto_pro = true`를
// 써 주고 있었다 — URL·가격 ID·남의 user_id만 알면 Pro가 공짜였다.
//
// 이 테스트가 지키는 것은 세 가지다:
//   ① 올바른 서명은 통과한다 (막느라 결제까지 막으면 더 나쁘다)
//   ② 위조·변조·시크릿 불일치는 **전부** 막힌다
//   ③ ★ 두 라우트가 **둘 다** 검증을 부른다 — 이게 원래 깨졌던 부분이다
//
//   npm run test:verify
// ─────────────────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-unused-expressions --
   `조건 ? ok(…) : no(…)` 는 이 저장소의 테스트 표기다. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { verifyPaddleSignature, timingSafeEqual } from '../lib/paddle/verify';

let pass = 0, fail = 0;
const ok = (l: string, x = '') => { pass++; console.log(`  ok   ${l}${x ? ' — ' + x : ''}`); };
const no = (l: string, d: string) => { fail++; console.log(`  FAIL ${l}\n       ${d}`); };

const SECRET = 'pdl_ntfset_test_secret_value';
const BODY = JSON.stringify({
  event_type: 'subscription.activated',
  data: { id: 'sub_1', status: 'active', custom_data: { user_id: 'u_1' } },
});

/** Paddle이 보내는 형태의 서명을 만든다 */
async function sign(body: string, secret: string, ts = '1757000000') {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const b = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}:${body}`));
  const hex = Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
  return `ts=${ts};h1=${hex}`;
}

async function main() {
  console.log('Paddle 웹훅 서명');

  const good = await sign(BODY, SECRET);

  // ── ① 올바른 것은 통과한다 ────────────────────────────────────────────────
  (await verifyPaddleSignature(BODY, good, SECRET))
    ? ok('올바른 서명은 통과한다')
    : no('올바른 서명을 막는다', '이러면 결제는 되는데 구독이 안 켜진다 — 더 나쁜 실패다');

  // ── ② 막아야 할 것들 ──────────────────────────────────────────────────────
  const cases: [string, string, string, string][] = [
    ['서명이 없다',      BODY,                       '',                      SECRET],
    ['h1이 없다',        BODY,                       'ts=1757000000',         SECRET],
    ['ts가 없다',        BODY,                       good.split(';')[1],      SECRET],
    ['h1을 바꿨다',      BODY,                       good.slice(0, -1) + '0', SECRET],
    ['본문을 바꿨다',    BODY.replace('u_1', 'u_2'), good,                    SECRET],
    ['시크릿이 다르다',  BODY,                       good,                    'other_secret'],
    ['시크릿이 빈 값',   BODY,                       good,                    ''],
    ['★ 시크릿에 BOM',   BODY,                       good,                    '﻿' + SECRET],
  ];
  for (const [label, body, sig, secret] of cases) {
    const passed = await verifyPaddleSignature(body, sig, secret);
    // ★ BOM 붙은 시크릿은 **통과해야** 한다 — 떼어내고 쓰기 때문이다.
    //   여기서 막히면 대시보드 오염이 곧 「모든 웹훅 401」이 된다.
    const want = label.includes('BOM');
    passed === want
      ? ok(want ? `${label} → 떼어내고 통과시킨다` : `${label} → 막는다`)
      : no(`${label}이 기대와 다르다`, `passed=${passed}, want=${want}`);
  }

  // ── ③ 상수 시간 비교 ──────────────────────────────────────────────────────
  timingSafeEqual('abc', 'abc') && !timingSafeEqual('abc', 'abd') && !timingSafeEqual('abc', 'abcd')
    ? ok('상수 시간 비교가 같음·다름·길이차를 바르게 답한다')
    : no('비교 함수가 틀렸다', '');

  // ── ④ ★ 두 라우트가 모두 검증을 부르는가 ──────────────────────────────────
  //    이게 원래 깨졌던 부분이다. 구현이 한 파일 안에 있어 다른 쪽이 빠뜨렸다.
  const routes = [
    'app/kpatto/api/webhooks/paddle/route.ts',
    'app/patto/api/webhooks/paddle/route.ts',
  ];
  for (const r of routes) {
    const src = readFileSync(join(process.cwd(), r), 'utf8');
    const calls = src.includes('verifyPaddleSignature(');
    const failsClosed = src.includes('PADDLE_WEBHOOK_SECRET') && src.includes('401');
    calls && failsClosed
      ? ok(`★ ${r} 가 서명을 검증하고 fail-closed다`)
      : no(`${r} 가 검증하지 않는다`,
          '이 라우트로 POST하면 결제 없이 Pro가 켜진다 — 매출이 새는 구멍이다');
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}

void main();
