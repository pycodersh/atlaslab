'use client'
import { Player } from '@remotion/player'
import { Episode1 } from '../../../src/videos/Episode1'

export default function PlayerWrapper() {
  return (
    <Player
      component={Episode1}
      durationInFrames={660}
      compositionWidth={1080}
      compositionHeight={1920}
      fps={30}
      style={{ width: '100%', maxWidth: 480, borderRadius: 20, overflow: 'hidden' }}
      controls
      autoPlay
      loop={false}
    />
  )
}
