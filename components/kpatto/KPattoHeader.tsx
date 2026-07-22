'use client'

import Image from 'next/image'
import Link from 'next/link'

export function KPattoHeader() {
  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: '#FFFFFF',
      borderBottom: '1px solid #F2F2F2',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 56,
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {/* Logo */}
        <Link href="/kpatto/home" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Image
            src="/kpatto/banners/KPatto Icon.png"
            alt="K-PATTO"
            width={28}
            height={28}
            style={{ background: 'transparent' }}
          />
          <span style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#111111',
            letterSpacing: '-0.03em',
          }}>
            K-PATTO
          </span>
        </Link>


      </div>
    </div>
  )
}
