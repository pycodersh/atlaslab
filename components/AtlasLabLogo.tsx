// components/AtlasLabLogo.tsx

interface AtlasLabLogoProps {
  variant?: 'nav' | 'large'
}

export default function AtlasLabLogo({ variant = 'nav' }: AtlasLabLogoProps) {
  if (variant === 'large') {
    return (
      <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#0d0820"/>
        <defs>
          <linearGradient id="lg" x1="0" y1="60" x2="0" y2="290" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8eaf0"/>
            <stop offset="100%" stopColor="#8890a8"/>
          </linearGradient>
        </defs>

        {/* A — left leg */}
        <path d="M82 268 L148 62 L162 62 L110 268 Z" fill="url(#lg)"/>
        {/* A — right leg */}
        <path d="M148 62 L162 62 L200 196 L186 196 Z" fill="url(#lg)"/>
        {/* A — crossbar */}
        <rect x="108" y="172" width="80" height="12" fill="url(#lg)"/>
        {/* A — top serif */}
        <rect x="141" y="56" width="24" height="8" rx="1" fill="url(#lg)"/>
        {/* A — bottom-left serifs */}
        <rect x="72" y="268" width="24" height="7" rx="1" fill="url(#lg)"/>
        <rect x="100" y="268" width="24" height="7" rx="1" fill="url(#lg)"/>

        {/* L — vertical stem */}
        <rect x="210" y="62" width="18" height="213" fill="url(#lg)"/>
        {/* L — horizontal foot */}
        <rect x="210" y="257" width="80" height="18" fill="url(#lg)"/>
        {/* L — top serif */}
        <rect x="202" y="56" width="34" height="8" rx="1" fill="url(#lg)"/>
        {/* L — bottom-right serif */}
        <rect x="278" y="268" width="20" height="7" rx="1" fill="url(#lg)"/>

        {/* ATLASLAB */}
        <text
          x="200" y="322"
          fontFamily="'Palatino Linotype', Palatino, Georgia, serif"
          fontSize="17" letterSpacing="9"
          fill="url(#lg)" textAnchor="middle" fontWeight="400"
        >ATLASLAB</text>
      </svg>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <svg height="44" viewBox="0 0 56 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ng" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8eaf0"/>
            <stop offset="100%" stopColor="#8890a8"/>
          </linearGradient>
        </defs>

        {/* A — left leg */}
        <path d="M1 38 L14 5 L18 5 L8 38 Z" fill="url(#ng)"/>
        {/* A — right leg */}
        <path d="M14 5 L18 5 L26 28 L22 28 Z" fill="url(#ng)"/>
        {/* A — crossbar */}
        <rect x="7" y="22" width="16" height="3" fill="url(#ng)"/>
        {/* A — top serif */}
        <rect x="12" y="3" width="8" height="3" rx="0.5" fill="url(#ng)"/>
        {/* A — bottom serifs */}
        <rect x="0" y="38" width="7" height="2.5" rx="0.5" fill="url(#ng)"/>
        <rect x="9" y="38" width="7" height="2.5" rx="0.5" fill="url(#ng)"/>

        {/* L — vertical stem */}
        <rect x="29" y="5" width="5" height="33" fill="url(#ng)"/>
        {/* L — horizontal foot */}
        <rect x="29" y="35" width="22" height="5" fill="url(#ng)"/>
        {/* L — top serif */}
        <rect x="26" y="3" width="11" height="3" rx="0.5" fill="url(#ng)"/>
        {/* L — bottom-right serif */}
        <rect x="48" y="38" width="6" height="2.5" rx="0.5" fill="url(#ng)"/>
      </svg>
      <span style={{
        fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
        fontSize: '14px',
        letterSpacing: '4px',
        background: 'linear-gradient(to bottom, #e8eaf0, #8890a8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 400,
      }}>ATLASLAB</span>
    </div>
  )
}
