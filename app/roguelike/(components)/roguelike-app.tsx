'use client'
import React, { useState } from 'react'
import TitleScreen from './title-screen'
import GameScreen from './game-screen'

type AppPhase = 'title' | 'playing'

export default function RoguelikeApp (): React.ReactElement {
  const [phase, setPhase] = useState<AppPhase>('title')

  return (
    <div className="h-50vh bg-black flex items-center justify-center">
      {phase === 'title' && (
        <TitleScreen onStart={() => { setPhase('playing') }} />
      )}
      {phase === 'playing' && (
        <GameScreen onQuit={() => { setPhase('title') }} />
      )}
    </div>
  )
}
