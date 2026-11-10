import 'server-only'

/**
 * Gumroad 라이선스 키 확인 — WebApp Pass · Complete Bundle 구매자가 앱을 여는 데 쓴다.
 *
 * Gumroad 쪽 준비: 두 상품 모두 상품 설정에서 "Generate a unique license key per sale" 를 켠다.
 * 상품 ID(상품 편집 화면의 License key 섹션에 표시)를 서버 전용 환경 변수에 넣는다:
 *   GUMROAD_WEBAPP_PRODUCT_ID (또는 GUMROAD_PRODUCT_ID), GUMROAD_BUNDLE_PRODUCT_ID
 * eBook 단품은 앱을 열지 않으므로 여기 없다.
 *
 * K-Pantry Pro(평생 이용권)도 같은 방식이다: GUMROAD_KPANTRY_PRODUCT_ID.
 * 앱마다 상품 목록을 따로 확인한다 — K-Pantry 키로 K-PATTO 가 열리면 안 된다.
 *
 * API: POST https://api.gumroad.com/v2/licenses/verify (product_id, license_key, increment_uses_count)
 * 처음 입력할 때만 사용 횟수를 늘린다(기기 등록 추적). 30일마다 하는 재확인은 늘리지 않는다.
 */

export type KPattoProduct = 'webapp' | 'bundle'
export type LicenseProduct = KPattoProduct | 'kpantry'

export type LicenseCheck<P extends LicenseProduct = LicenseProduct> =
  | { ok: true; product: P; saleId: string | null; email: string | null }
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

type VerifyOptions = { incrementUses?: boolean }

export async function verifyKPattoLicense(
  licenseKey: string,
  options: VerifyOptions = {},
): Promise<LicenseCheck<KPattoProduct>> {
  const webappId = clean(process.env.GUMROAD_WEBAPP_PRODUCT_ID) || clean(process.env.GUMROAD_PRODUCT_ID)
  return verifyAgainst(
    [['webapp', webappId], ['bundle', clean(process.env.GUMROAD_BUNDLE_PRODUCT_ID)]],
    licenseKey,
    options,
  )
}

type GumroadSale = {
  id?: string
  order_id?: number | string
  email?: string
  purchase_email?: string
  product_id?: string
  refunded?: boolean
  partially_refunded?: boolean
  chargedback?: boolean
  disputed?: boolean
  dispute_won?: boolean
}

/** 이메일은 대소문자·공백을 무시하고, 주문 번호는 앞의 # 를 뗀다 — 패스 지문과 30일 재확인이 같은 값을 쓰게 */
export function normalizePurchaseRef(input: string): string {
  const v = input.trim()
  return v.includes('@') ? v.toLowerCase() : v.replace(/^#/, '')
}

/**
 * K-Pantry Lifetime Pass 구매 확인 — 라이선스 키 없이 Gumroad 판매 내역에서 찾는다.
 *
 * K-Pantry 상품은 Gumroad 에서 라이선스 키를 켤 수 없어서(is_licensed:false) licenses/verify 를 못 쓴다.
 * 대신 판매자 토큰으로 GET /v2/sales 를 불러 이 상품의 판매 중 하나와 맞는지 본다:
 *   - '@' 가 있으면 결제 이메일
 *   - 숫자면 영수증의 주문 번호(order_id)
 *   - 그 밖에는 Sale ID(GET /v2/sales/:id)
 * Gumroad 필터가 느슨해도 통과하지 않게 상품 ID·값 일치를 여기서 다시 확인한다.
 *
 * 필요한 서버 환경 변수:
 *   GUMROAD_ACCESS_TOKEN        Gumroad Settings → Advanced → Applications 에서 만든 앱의 액세스 토큰(view_sales)
 *   GUMROAD_KPANTRY_PRODUCT_ID  상품 ID(NyPSC8wWKf_mTVg7yTzBjg==) — permalink(kpantry)가 아니다
 *
 * 주의: 이메일만으로 열리므로 구매자의 이메일을 아는 사람은 열 수 있다(라이선스 키를 공유하는 것과 비슷한 수준).
 */
export async function verifyKPantryPurchase(ref: string): Promise<LicenseCheck<'kpantry'>> {
  const token = clean(process.env.GUMROAD_ACCESS_TOKEN)
  const productId = clean(process.env.GUMROAD_KPANTRY_PRODUCT_ID)
  if (!token || !productId) return { ok: false, reason: 'not_configured' }

  const value = normalizePurchaseRef(ref)
  const isEmail = value.includes('@')
  const isOrderNo = /^\d{4,}$/.test(value)

  const call = async (path: string, params?: Record<string, string>) => {
    const url = new URL(`https://api.gumroad.com/v2/${path}`)
    for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
      if (res.status === 404) return { reached: true, sales: [] as GumroadSale[] }
      if (!res.ok) {
        // 401/403 은 토큰 문제다 — 사용자 잘못이 아니니 '확인 불가'로 돌려주고 서버 로그에 남긴다
        console.error(`[kpantry] Gumroad ${path} → ${res.status}`)
        return { reached: false, sales: [] as GumroadSale[] }
      }
      const body = await res.json().catch(() => null) as { success?: boolean; sales?: GumroadSale[]; sale?: GumroadSale } | null
      if (!body?.success) return { reached: true, sales: [] as GumroadSale[] }
      return { reached: true, sales: body.sales ?? (body.sale ? [body.sale] : []) }
    } catch {
      return { reached: false, sales: [] as GumroadSale[] }
    }
  }

  const { reached, sales } = isEmail
    ? await call('sales', { product_id: productId, email: value })
    : isOrderNo
      ? await call('sales', { product_id: productId, order_id: value })
      : await call(`sales/${encodeURIComponent(value)}`)
  if (!reached) return { ok: false, reason: 'unavailable' }

  const matches = sales.filter(s => {
    if (s.product_id !== productId) return false
    if (isEmail) return [s.email, s.purchase_email].some(e => e?.trim().toLowerCase() === value)
    if (isOrderNo) return String(s.order_id ?? '') === value
    return s.id === value
  })
  if (matches.length === 0) return { ok: false, reason: 'invalid' }

  // 같은 이메일로 여러 번 샀으면 하나라도 살아 있으면 연다
  const good = matches.find(s => !s.refunded && !s.chargedback && !(s.disputed && !s.dispute_won))
  if (!good) return { ok: false, reason: 'refunded' }
  return { ok: true, product: 'kpantry', saleId: good.id ?? null, email: good.email ?? good.purchase_email ?? null }
}

async function verifyAgainst<P extends LicenseProduct>(
  candidates: [P, string][],
  licenseKey: string,
  { incrementUses = false }: VerifyOptions,
): Promise<LicenseCheck<P>> {
  const products = candidates.filter(([, id]) => id)
  if (products.length === 0) return { ok: false, reason: 'not_configured' }

  let reachedGumroad = false
  for (const [product, productId] of products) {
    let res: Response
    try {
      res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ product_id: productId, license_key: licenseKey, increment_uses_count: String(incrementUses) }),
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
