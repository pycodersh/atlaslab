// ── Paddle 웹훅 서명 검증 (두 라우트가 같이 쓴다) ───────────────────────────
//
// ★ 왜 밖으로 뺐나 — 2026-09-12에 보니 웹훅 라우트가 **둘**이었고
//   `app/kpatto/api/webhooks/paddle`만 검증하고
//   `app/patto/api/webhooks/paddle`은 **아무 검증 없이** `kpatto_pro = true`를
//   써 주고 있었다. URL과 가격 ID와 남의 user_id만 알면 누구나 JSON을 POST해
//   Pro를 공짜로 켤 수 있었다. 결제가 있는 제품에서 이건 매출이 새는 구멍이다.
//
//   구현이 한 라우트 안에 있어서 다른 라우트가 그냥 빠뜨릴 수 있었다.
//   그래서 **검증을 한 군데에 두고 둘이 같은 것을 부르게** 한다.
//
// ★ 비교를 상수 시간으로 한다.
//   `computed === h1`은 첫 다른 바이트에서 빠져나온다. 원격에서 재기는 어렵지만,
//   서명 비교에서 굳이 타이밍을 흘릴 이유도 없다.
// ─────────────────────────────────────────────────────────────────────────────

import { cleanEnv } from './env';

/** Paddle-Signature: `ts=<timestamp>;h1=<hex_hmac_sha256>` */
export async function verifyPaddleSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  // ★ 시크릿에도 BOM이 붙을 수 있다. 붙으면 HMAC 입력이 달라져 **모든 웹훅이
  //   401**이 된다 — 결제는 되는데 구독이 안 켜지는, 찾기 어려운 실패다.
  const key_secret = cleanEnv(secret);
  if (!key_secret) return false;

  const parts: Record<string, string> = {};
  for (const p of signature.split(';')) {
    const i = p.indexOf('=');
    if (i > 0) parts[p.slice(0, i)] = p.slice(i + 1);
  }
  const ts = parts['ts'];
  const h1 = parts['h1'];
  if (!ts || !h1) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key_secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sigBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${ts}:${body}`),
  );
  const computed = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return timingSafeEqual(computed, h1);
}

/** 길이가 다르면 바로 false. 같으면 전부 훑고 나서 답한다. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
