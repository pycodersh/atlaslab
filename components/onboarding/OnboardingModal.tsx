'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { Scene1 } from './Scene1'
import { Scene2 } from './Scene2'
import { Scene3 } from './Scene3'
import { Scene4 } from './Scene4'
import { COLORS } from './motionConstants'

const KEYFRAMES = `
@keyframes onbOrbFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
@keyframes onbAuraBreath {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes onbRingCW {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes onbRingCCW {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}
@keyframes onbS1Float {
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-8px); }
}
@keyframes onbWaveBar {
  0%, 100% { transform: scaleY(0.15); }
  50%      { transform: scaleY(1); }
}
`

type SceneId = 'scene1' | 'scene2' | 'scene3' | 'scene4'
const SCENE_ORDER: SceneId[] = ['scene1', 'scene2', 'scene3', 'scene4']

function ProgressDots({ current }: { current: number }) {
  return (
    <div style={{
      position: 'absolute', bottom: 24, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', gap: 7,
      pointerEvents: 'none',
    }}>
      {SCENE_ORDER.map((_, i) => (
        <div key={i} style={{
          height: 5,
          width: i === current ? 12 : 5,
          borderRadius: 3,
          background: i === current ? '#1A73EB' : 'rgba(26,115,235,0.18)',
          transition: 'all 300ms ease',
        }} />
      ))}
    </div>
  )
}

interface Props {
  visible: boolean
  onComplete: () => void
}

export function OnboardingModal({ visible, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [sceneKey, setSceneKey] = useState(0) // remount scenes on advance

  const goNext = useCallback(() => {
    const nextIdx = currentIdx + 1
    if (nextIdx >= SCENE_ORDER.length) return
    setCurrentIdx(nextIdx)
    setSceneKey(k => k + 1)
  }, [currentIdx])

  // Reset when modal re-opens
  useEffect(() => {
    if (visible) {
      setCurrentIdx(0)
      setSceneKey(k => k + 1)
    }
  }, [visible])

  if (!visible) return null

  const currentScene = SCENE_ORDER[currentIdx]
  const isLastScene  = currentScene === 'scene4'

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #eef5ff 0%, #f8fbff 50%, #ffffff 100%)',
        }}
        // Tap anywhere to advance (scenes 1-3 only)
        onClick={isLastScene ? undefined : goNext}
      >
        {/* Background blobs */}
        <div style={{
          position: 'absolute',
          width: 300, height: 300,
          top: -80, left: -60,
          borderRadius: '50%',
          background: COLORS.blob.top,
          opacity: 0.6,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          width: 240, height: 240,
          bottom: -60, right: -40,
          borderRadius: '50%',
          background: COLORS.blob.bottom,
          opacity: 0.5,
          pointerEvents: 'none',
        }} />

        {/* Safe area wrapper */}
        <div style={{
          position: 'absolute', inset: 0,
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Scene */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            {currentScene === 'scene1' && <Scene1 key={`s1-${sceneKey}`} />}
            {currentScene === 'scene2' && <Scene2 key={`s2-${sceneKey}`} />}
            {currentScene === 'scene3' && <Scene3 key={`s3-${sceneKey}`} />}
            {currentScene === 'scene4' && (
              <Scene4
                key={`s4-${sceneKey}`}
                onStart={onComplete}
                onLater={onComplete}
              />
            )}
          </div>

          {/* Swipe hint (scenes 1-3) */}
          {!isLastScene && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 52 }}>
              <div style={{
                width: 36, height: 4, borderRadius: 2,
                background: 'rgba(26,115,235,0.15)',
              }} />
            </div>
          )}
        </div>

        {/* Progress dots */}
        <ProgressDots current={currentIdx} />
      </div>
    </>
  )
}
