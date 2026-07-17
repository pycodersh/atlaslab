'use client'
import { Player } from '@remotion/player'
import { Episode3 } from '../../../src/videos/Episode3'

export default function PlayerWrapper() {
  return (
    <Player
      component={Episode3}
      durationInFrames={600}
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
