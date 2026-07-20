'use client'

import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Segment depth of /patto/stories/[id]/patterns/[pid] is deeper than /patto/stories/[id]
// deeper path = slide in from right; shallower path = slide in from left
function pathDepth(path: string) {
  return path.split('/').filter(Boolean).length
}

// Only animate within the stories/patterns subtree — other navigations fade
function isStoryPatternRoute(path: string) {
  return /\/patto\/stories\/\d+/.test(path)
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const prevPathRef = useRef<string>(pathname)
  const prevDepth = pathDepth(prevPathRef.current)
  const currDepth = pathDepth(pathname)

  const inStoryTree = isStoryPatternRoute(pathname) || isStoryPatternRoute(prevPathRef.current)

  // Direction: going deeper → slide from right (+100%), going shallower → slide from left (−100%)
  const xEnter  = !inStoryTree ? 0 : currDepth >= prevDepth ?  '100%' : '-100%'
  const xExit   = !inStoryTree ? 0 : currDepth >= prevDepth ? '-100%' :  '100%'
  const opacity = inStoryTree ? 1 : 0

  // Update ref after computing direction
  if (prevPathRef.current !== pathname) {
    prevPathRef.current = pathname
  }

  // Tab switches (non-story routes): skip visual transition to avoid flash
  if (!inStoryTree) {
    return <div style={{ width: '100%', minHeight: '100%' }}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ x: xEnter, opacity: 0.7 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: xExit, opacity: 0.7 }}
        transition={{
          duration: 0.26,
          ease: [0.32, 0, 0.67, 0],
        }}
        style={{ width: '100%', minHeight: '100%', overflowX: 'clip' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
