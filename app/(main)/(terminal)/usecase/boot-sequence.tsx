'use client'
import React, { useEffect, useState } from 'react'

interface BootSequenceState {
  isBooting: boolean
  progress: number
}

export function useBootSequence (): BootSequenceState {
  const getInitialBootingState = (): boolean => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('terminal_has_booted') === null
  }

  const [state, setState] = useState<BootSequenceState>({
    isBooting: getInitialBootingState(),
    progress: 0
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.isBooting) return

    // Fast boot: 1.5초 완료
    const duration = 1500
    const interval = 50
    const steps = duration / interval
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = Math.min((step / steps) * 100, 100)
      setState(prev => ({ ...prev, progress }))

      if (step >= steps) {
        clearInterval(timer)
        sessionStorage.setItem('terminal_has_booted', 'true')
        setState(prev => ({ ...prev, isBooting: false }))
      }
    }, interval)

    return () => clearInterval(timer)
  }, [state.isBooting])

  return state
}

interface BootSequenceProps {
  progress: number
}

export function BootSequence ({ progress }: BootSequenceProps): React.ReactElement {
  const barWidth = Math.round(progress / 5) // 0-20 blocks
  const emptyWidth = 20 - barWidth

  return (
    <div className="flex flex-col items-center justify-center h-64 p-8">
      {/* ASCII Logo */}
      <pre className="text-green-400 text-xs mb-6 text-center" style={{ lineHeight: 1.2 }}>
{`     ██╗██╗███╗   ██╗██╗ █████╗
     ██║██║████╗  ██║██║██╔══██╗
     ██║██║██╔██╗ ██║██║███████║
██   ██║██║██║╚██╗██║██║██╔══██║
╚█████╔╝██║██║ ╚████║██║██║  ██║
 ╚════╝ ╚═╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝`}
      </pre>

      {/* Progress bar */}
      <div className="font-mono text-green-400 text-sm">
        <div className="mb-2 text-center">SYSTEM LOADING...</div>
        <div className="flex items-center gap-2">
          <span>[</span>
          <span className="text-green-500">{'█'.repeat(barWidth)}</span>
          <span className="text-gray-600">{'░'.repeat(emptyWidth)}</span>
          <span>]</span>
          <span className="w-12 text-right">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}
