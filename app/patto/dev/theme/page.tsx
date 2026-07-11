import { notFound } from 'next/navigation'
import { ThemeQAClient } from './_client'

export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <ThemeQAClient />
}
