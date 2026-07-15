import Link from 'next/link'

const videos = [
  {
    id: 'Utq4_wlb_BA',
    title: 'Patto Onboarding',
    description: "See how Patto's onboarding works — from first launch to your first pattern.",
    app: 'patto',
  },
]

export default function VideosPage() {
  return (
    <div style={{ background: '#0d0820', minHeight: '100vh', padding: '2rem 1.5rem', color: 'white' }}>
      <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '0.9rem' }}>
        ← Atlas Lab
      </Link>

      <div style={{ marginTop: '2rem', marginBottom: '2.5rem', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          VIDEOS
        </p>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>See our apps in action</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
          Short demos and feature walkthroughs
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        {videos.map(video => (
          <div key={video.id} style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'relative', paddingTop: '177%' }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
            <div style={{ padding: '1rem' }}>
              <span style={{
                fontSize: '0.7rem',
                color: '#a89fff',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>{video.app}</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0.25rem 0' }}>{video.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{video.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
