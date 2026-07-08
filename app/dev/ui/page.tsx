/**
 * PATTO UI Design System Playground — /dev/ui
 * Server component gate: blocks access in production.
 */

import { notFound } from 'next/navigation'
import { UIPlaygroundClient } from './_client'

export default function Page() {
  if (process.env.NODE_ENV !== 'development') notFound()
  return <UIPlaygroundClient />
}
