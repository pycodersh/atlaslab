import Link from 'next/link'
import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Refund Policy - K-Pantry',
  description:
    'K-Pantry refund policy for digital products — K-Pantry Pro lifetime access and downloadable recipe books sold through Gumroad.',
}

/**
 * K-Pantry 디지털 상품 환불 정책. 사이트 공용 /terms 4절(Paddle 구독, 7일 내 개별 협의)과 별개로
 * Gumroad 일회성 판매(라이선스 키 · PDF)에 맞춘 기준이다. 문구 바꾸면 Last updated 도 같이 바꾼다.
 */
export default function KPantryRefundPage() {
  return (
    <LegalPage>
      <h1>K-Pantry Refund Policy</h1>
      <p className="legal-meta">Last updated: November 1, 2026 &nbsp;·&nbsp; Effective: November 1, 2026</p>

      <p>
        This policy applies to digital products for K-Pantry sold by Atlas Lab Studios
        (&quot;Atlas Lab&quot;, &quot;we&quot;) through <strong>Gumroad</strong>, including the
        K-Pantry Pro lifetime pass (unlocked with a license key) and any downloadable recipe
        books (PDF/eBook).
      </p>

      <h2>1. Digital products are delivered instantly</h2>
      <p>
        Your license key and any download links are delivered on your Gumroad receipt right
        after payment, and the content is available to use immediately. Because a digital
        product cannot be returned once it has been delivered, <strong>we do not offer refunds
        for a change of mind</strong> — for example, if you no longer want the product, bought
        it by mistake after using it, or found that a recipe was not to your taste.
      </p>
      <p>
        Please try the free features of K-Pantry before you buy. Everything except the Pro
        features is available without payment.
      </p>

      <h2>2. When we will refund you</h2>
      <p>
        If the product <strong>does not work because of a fault on our side</strong>, we will
        refund you in full when you contact us <strong>within 7 days of purchase</strong>.
        This includes cases where:
      </p>
      <ul>
        <li>your license key is rejected and we cannot fix it for you within a reasonable time;</li>
        <li>Pro features stay locked after a successful activation because of a defect in K-Pantry;</li>
        <li>a downloadable file is missing, corrupted, or cannot be opened, and we cannot send you a working copy;</li>
        <li>you were charged more than once for the same order.</li>
      </ul>
      <p>
        Problems caused by your own device, browser settings, blocked cookies, or network
        connection are not system faults, but please contact us anyway — we will help you get
        the product working.
      </p>

      <h2>3. How to request a refund</h2>
      <p>
        Email <a href="mailto:contact@atlaslabstudios.com">contact@atlaslabstudios.com</a> within
        7 days of purchase with:
      </p>
      <ul>
        <li>the email address used at checkout, and your Gumroad receipt or order number;</li>
        <li>a short description of the problem (a screenshot helps).</li>
      </ul>
      <p>
        We reply within 3 business days. Approved refunds are issued through Gumroad to your
        original payment method; the time it takes to appear depends on your bank or card issuer.
      </p>

      <h2>4. What happens after a refund</h2>
      <p>
        When a purchase is refunded, charged back, or disputed, its license key stops working
        and K-Pantry Pro is turned off on every browser where it was activated (within 30 days
        at most, when the key is next re-checked). Please delete any downloaded files.
      </p>

      <h2>5. Your statutory rights</h2>
      <p>
        Nothing in this policy limits any rights you have under the consumer protection laws of
        your country that cannot be excluded by agreement.
      </p>

      <p>
        See also our <Link href="/terms">Terms of Service</Link> and{' '}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <div className="legal-more">
        <Link href="/kpantry/en">← Back to K-Pantry</Link>
        <Link href="/kpantry/en/subscribe">K-Pantry Pro</Link>
      </div>
    </LegalPage>
  )
}
