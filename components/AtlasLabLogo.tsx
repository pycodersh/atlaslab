// components/AtlasLabLogo.tsx
// Usage in nav: <AtlasLabLogo variant="nav" />
// Usage for preview: <AtlasLabLogo variant="large" />

interface AtlasLabLogoProps {
  variant?: 'nav' | 'large'
}

export default function AtlasLabLogo({ variant = 'nav' }: AtlasLabLogoProps) {
  if (variant === 'large') {
    return (
      <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="#0d0820"/>
        <defs>
          <linearGradient id="lg" x1="200" y1="60" x2="200" y2="290" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e8eaf0"/>
            <stop offset="100%" stopColor="#8890a8"/>
          </linearGradient>
          <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8cad8"/>
            <stop offset="100%" stopColor="#5a6080"/>
          </linearGradient>
        </defs>

        {/* A — left leg */}
        <path d="M88 260 L148 68 L164 68 L164 82 L120 260 Z" fill="url(#lg)"/>
        {/* A — right leg (shared top with L) */}
        <path d="M148 68 L172 68 L208 188 L192 188 Z" fill="url(#lg)"/>
        {/* A — crossbar */}
        <path d="M108 172 L204 172 L204 184 L108 184 Z" fill="url(#lg)"/>
        {/* A — top serif */}
        <path d="M142 62 L174 62 L174 70 L142 70 Z" fill="url(#lg)"/>
        {/* A — bottom left serifs */}
        <path d="M80 260 L104 260 L104 268 L80 268 Z" fill="url(#lg)"/>
        <path d="M110 260 L134 260 L134 268 L110 268 Z" fill="url(#lg)"/>

        {/* L — vertical stem (shares apex with A) */}
        <path d="M168 68 L188 68 L188 260 L268 260 L268 270 L168 270 Z" fill="url(#lg)"/>
        {/* L — top serif */}
        <path d="M160 62 L196 62 L196 70 L160 70 Z" fill="url(#lg)"/>
        {/* L — bottom right serif */}
        <path d="M256 260 L276 260 L276 268 L256 268 Z" fill="url(#lg)"/>

        {/* overlap depth shadow */}
        <path d="M168 68 L188 68 L208 188 L192 188 Z" fill="url(#lg2)" opacity="0.35"/>

        {/* ATLASLAB */}
        <text
          x="200"
          y="318"
          fontFamily="'Palatino Linotype', Palatino, Georgia, serif"
          fontSize="18"
          letterSpacing="8"
          fill="url(#lg)"
          textAnchor="middle"
          fontWeight="400"
        >
          ATLASLAB
        </text>
      </svg>
    )
  }

  // nav variant — height 44px
  return (
    <svg height="44" viewBox="0 0 200 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ng" x1="0" y1="0" x2="0" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e8eaf0"/>
          <stop offset="100%" stopColor="#8890a8"/>
        </linearGradient>
        <linearGradient id="ng2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c8cad8"/>
          <stop offset="100%" stopColor="#5a6080"/>
        </linearGradient>
      </defs>

      {/* A — left leg */}
      <path d="M4 37 L22 6 L27 6 L27 10 L18 37 Z" fill="url(#ng)"/>
      {/* A — right leg */}
      <path d="M22 6 L30 6 L37 27 L32 27 Z" fill="url(#ng)"/>
      {/* A — crossbar */}
      <path d="M10 23 L34 23 L34 26.5 L10 26.5 Z" fill="url(#ng)"/>
      {/* A — top serif */}
      <path d="M19 4 L31 4 L31 7 L19 7 Z" fill="url(#ng)"/>
      {/* A — bottom serifs */}
      <path d="M1 37 L9 37 L9 39.5 L1 39.5 Z" fill="url(#ng)"/>
      <path d="M12 37 L20 37 L20 39.5 L12 39.5 Z" fill="url(#ng)"/>

      {/* L — vertical */}
      <path d="M28 6 L34 6 L34 37 L48 37 L48 39.5 L28 39.5 Z" fill="url(#ng)"/>
      {/* L — top serif */}
      <path d="M25 4 L37 4 L37 7 L25 7 Z" fill="url(#ng)"/>
      {/* L — bottom right serif */}
      <path d="M45 37 L51 37 L51 39.5 L45 39.5 Z" fill="url(#ng)"/>

      {/* overlap depth */}
      <path d="M28 6 L34 6 L37 27 L32 27 Z" fill="url(#ng2)" opacity="0.35"/>

      {/* divider */}
      <line x1="61" y1="6" x2="61" y2="39" stroke="#8890a8" strokeWidth="0.5" opacity="0.3"/>

      {/* ATLASLAB */}
      <text
        x="72"
        y="28"
        fontFamily="'Palatino Linotype', Palatino, Georgia, serif"
        fontSize="13"
        letterSpacing="3.5"
        fill="url(#ng)"
        fontWeight="400"
      >
        ATLASLAB
      </text>
    </svg>
  )
}
