import { notFound } from 'next/navigation'
import { ScreensClient } from './_client'

export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <ScreensClient />
}
