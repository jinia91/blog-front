'use client'

import React, { useState } from 'react'
import { useWebSocketStatus } from '../(usecase)/websocket-status-usecases'
import { ConnectionStatus } from '../(domain)/websocket-status'

export function ConnectionStatusIndicator (): React.ReactElement {
  const { status, lastError, reconnectAttempts } = useWebSocketStatus()
  const [isHovered, setIsHovered] = useState(false)

  const getStatusConfig = (): {
    bgColor: string
    borderColor: string
    textColor: string
    label: string
    animate: boolean
  } => {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return {
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
          label: 'synced',
          animate: false
        }
      case ConnectionStatus.CONNECTING:
        return {
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
          label: 'connecting',
          animate: true
        }
      case ConnectionStatus.RECONNECTING:
        return {
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
          label: `retry ${reconnectAttempts}/10`,
          animate: true
        }
      case ConnectionStatus.DISCONNECTED:
        return {
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-400',
          label: 'offline',
          animate: false
        }
      case ConnectionStatus.ERROR:
        return {
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          textColor: 'text-red-400',
          label: 'error',
          animate: true
        }
      default:
        return {
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50',
          textColor: 'text-gray-400',
          label: '...',
          animate: false
        }
    }
  }

  const config = getStatusConfig()
  const showError = status === ConnectionStatus.ERROR && lastError !== null

  return (
    <div
      className="relative"
      onMouseEnter={() => { setIsHovered(true) }}
      onMouseLeave={() => { setIsHovered(false) }}
    >
      <div
        className={`
          inline-flex items-center gap-1.5
          px-2 py-0.5 rounded-full
          border backdrop-blur-sm
          text-xs font-mono
          transition-all duration-150
          cursor-default select-none
          ${config.bgColor} ${config.borderColor} ${config.textColor}
        `}
      >
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${config.textColor.replace('text-', 'bg-')}
            ${config.animate ? 'animate-pulse' : ''}
          `}
        />
        <span className="opacity-80">{config.label}</span>
      </div>

      {/* Error tooltip */}
      {showError && isHovered && (
        <div
          className="
            absolute bottom-full right-0 mb-2
            px-2 py-1 rounded
            bg-gray-900 border border-red-500/30
            text-xs text-red-300
            whitespace-nowrap
            shadow-lg
          "
        >
          {lastError}
        </div>
      )}
    </div>
  )
}
