'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getNextUnreadId } from '@/lib/editor/storage'

export default function EditorIndexPage() {
  const router = useRouter()

  useEffect(() => {
    const id = getNextUnreadId(30)
    router.replace(`/editor/${id}`)
  }, [router])

  return null
}
