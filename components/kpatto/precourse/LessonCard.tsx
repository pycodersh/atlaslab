'use client'

import { useEffect, useRef, useState } from 'react'

interface LessonCardProps {
  children: React.ReactNode
  stepKey: string | number  // changes on each step → triggers fade
}

export function LessonCard({ children, stepKey }: LessonCardProps) {
  const [visible, setVisible] = useState(false)
  const prev = useRef(stepKey)

  useEffect(() => {
    if (prev.current !== stepKey) {
      setVisible(false)
      prev.current = stepKey
      const t = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(t)
    } else {
      setVisible(true)
    }
  }, [stepKey])

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {children}
    </div>
  )
}
