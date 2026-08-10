import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'K-Pantry',
  description: 'Cook Korean with What You Have.',
}

export default function KPantryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ backgroundColor: '#F5F0E8', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
