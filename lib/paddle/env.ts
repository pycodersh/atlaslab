// ── 환경변수에서 보이지 않는 글자를 떼어낸다 ────────────────────────────────
//
// ★ 왜 있나 — 2026-09-12 프로덕션에서 실제로 결제가 막혀 있었다.
//
//   Vercel 대시보드에 붙여넣은 Paddle 값 **앞에 BOM(U+FEFF)이 붙어** 있었다.
//   로컬 `.env.local`은 깨끗해서 **개발에서는 멀쩡하고 프로덕션에서만** 깨졌다.
//   (PowerShell의 Out-File·Set-Content가 기본으로 BOM을 붙인다 — 그 파일에서
//    복사하면 눈에 안 보이는 한 글자가 따라온다.)
//
//   그래서 두 곳이 **조용히** 죽어 있었다:
//
//   ① 클라이언트 토큰 → Authorization 헤더에 들어간다.
//      U+FEFF는 ISO-8859-1이 아니라 브라우저가 요청을 **만들기도 전에** 던진다:
//        Failed to execute 'append' on 'Headers': String contains non ISO-8859-1 code point
//      → Paddle 호출이 전부 실패한다. 「Upgrade to Pro」를 눌러도 아무 일이 없고
//        콘솔에는 초기화 성공 로그만 남는다.
//
//   ② 가격 ID → 웹훅에서 `priceId !== KPATTO_PRICE_ID` 비교에 쓰인다.
//      BOM이 붙으면 **영원히 다르다.** 결제가 성사돼도 200 `{received:true}`로
//      흘려보내고 구독이 켜지지 않는다.
//
//   둘 다 오류를 내지 않는다. 로그만 보면 정상으로 보인다.
//
// ★ 값을 받는다 — 이름을 받지 않는다.
//   Next.js는 **`process.env.NEXT_PUBLIC_X`라고 글자 그대로 적힌 자리**만
//   빌드 때 값으로 바꿔 넣는다. `read('NEXT_PUBLIC_X')`처럼 이름을 넘기면
//   브라우저 번들에서 `undefined`가 된다 — 고치려다 더 크게 깨뜨린다.
//   그래서 호출부는 반드시 `cleanEnv(process.env.NEXT_PUBLIC_X)` 형태로 쓴다.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 떼어낼 글자들. 전부 **복사·붙여넣기로 딸려오고 눈에 보이지 않는** 것들이다.
 *   U+FEFF BOM · U+200B~U+200D 폭 없는 공백 · U+2060 word joiner
 * 앞뒤 일반 공백과 따옴표도 함께 턴다 — 대시보드에 `"live_..."`로 붙여넣는
 * 실수가 같은 증상을 낸다.
 */
const INVISIBLE = /^[﻿​-‍⁠\s"']+|[﻿​-‍⁠\s"']+$/g;

/**
 * 환경변수 값을 쓸 수 있는 형태로 만든다.
 * 빈 문자열은 `undefined`로 돌려준다 — 「설정했는데 빈 값」이 「미설정」과
 * 다르게 동작하면 원인을 찾는 데만 하루가 간다.
 */
export function cleanEnv(raw: string | undefined | null): string | undefined {
  if (raw == null) return undefined;
  const v = String(raw).replace(INVISIBLE, '');
  return v === '' ? undefined : v;
}

/**
 * 값이 원본과 다른가 — 즉 보이지 않는 글자가 실제로 섞여 있었나.
 * 고쳐서 넘기되 **한 번은 시끄럽게 알린다.** 조용히 고치기만 하면 대시보드의
 * 값은 계속 더러운 채로 남고, 다음 사람이 같은 자리에서 또 막힌다.
 */
export function cleanEnvLoud(raw: string | undefined | null, label: string): string | undefined {
  const cleaned = cleanEnv(raw);
  if (raw != null && cleaned !== undefined && cleaned !== String(raw)) {
    const bad = [...String(raw)]
      .filter(c => /[﻿​-‍⁠]/.test(c))
      .map(c => 'U+' + c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0'));
    console.warn(
      `[env] ${label}에 보이지 않는 글자가 섞여 있어 떼어내고 씁니다` +
      (bad.length ? ` (${[...new Set(bad)].join(', ')})` : ' (앞뒤 공백/따옴표)') +
      ' — Vercel 환경변수 값을 다시 붙여넣어 주세요.'
    );
  }
  return cleaned;
}
