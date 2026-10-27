import 'server-only'

/**
 * Gumroad 라이선스 키 확인 — WebApp Pass · Complete Bundle 구매자가 앱을 여는 데 쓴다.
 *
 * Gumroad 쪽 준비: 두 상품 모두 상품 설정에서 "Generate a unique license key per sale" 를 켠다.
 * 상품 ID(상품 편집 화면의 License key 섹션에 표시)를 서버 전용 환경 변수에 넣는다:
 *   GUMROAD_WEBAPP_PRODUCT_ID, GUMROAD_BUNDLE_PRODUCT_ID
 * eBook 단품은 앱을 열지 않으므로 여기 없다.
 *
 * API: POST https://api.gumroad.com/v2/licenses/verify (product_id, license_key, increment_uses_count)
 * 사용 횟수는 늘리지 않는다 — 한 키 한 계정은 우리 DB(license_key UNIQUE)가 지킨다.
 */

export type LicenseProduct = 'webapp' | 'bundle'

export type LicenseCheck =
  | { ok: true; product: LicenseProduct; saleId: string | null; email: string | null }
  | { ok: false; reason: 'not_configured' | 'invalid' | 'refunded' | 'unavailable' }

// Vercel 값 앞에 붙는 BOM(U+FEFF)·공백을 떼어 낸다 — 프로덕션에서만 깨지는 일을 막는다
const clean = (v: string | undefined) => (v ?? '').replace(/^﻿/, '').trim()

type GumroadPurchase = {
  sale_id?: string
  email?: string
  refunded?: boolean
  chargebacked?: boolean
  disputed?: boolean
}

export async function verifyKPattoLicense(licenseKey: string): Promise<LicenseCheck> {
  const products: [LicenseProduct, string][] = (
    [['webapp', clean(process.env.GUMROAD_WEBAPP_PRODUCT_ID)], ['bundle', clean(process.env.GUMROAD_BUNDLE_PRODUCT_ID)]] as [LicenseProduct, string][]
  ).filter(([, id]) => id)
  if (products.length === 0) return { ok: false, reason: 'not_configured' }

  let reachedGumroad = false
  for (const [product, productId] of products) {
    let res: Response
    try {
      res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ product_id: productId, license_key: licenseKey, increment_uses_count: 'false' }),
        cache: 'no-store',
      })
    } catch {
      continue
    }
    // 404 = 이 상품의 키가 아니다 → 다음 상품으로. 그 밖의 5xx 는 Gumroad 장애로 본다.
    if (res.status >= 500) continue
    reachedGumroad = true
    const body = await res.json().catch(() => null) as { success?: boolean; purchase?: GumroadPurchase } | null
    if (!body?.success || !body.purchase) continue

    const p = body.purchase
    if (p.refunded || p.chargebacked || p.disputed) return { ok: false, reason: 'refunded' }
    return { ok: true, product, saleId: p.sale_id ?? null, email: p.email ?? null }
  }

  return { ok: false, reason: reachedGumroad ? 'invalid' : 'unavailable' }
}
