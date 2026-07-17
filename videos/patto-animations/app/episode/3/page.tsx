import dynamic from 'next/dynamic'

const PlayerWrapper = dynamic(() => import('./PlayerWrapper'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '100vh', background: '#0a0a12' }} />,
})

export default function Page() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <PlayerWrapper />
    </div>
  )
}
