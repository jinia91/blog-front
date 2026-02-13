'use client'

import React, { useMemo } from 'react'
import type { Player } from '../(domain)/types'

interface MobileHudProps {
  player: Player
  floor: number
  log: string[]
}

export default function MobileHud ({ player, floor, log }: MobileHudProps): React.ReactElement {
  const hpPercent = useMemo(() => {
    return (player.stats.hp / player.stats.maxHp) * 100
  }, [player.stats.hp, player.stats.maxHp])

  const barColor = useMemo(() => {
    if (hpPercent > 50) return 'bg-green-500'
    if (hpPercent > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }, [hpPercent])

  const recentLogs = useMemo(() => {
    const start = Math.max(0, log.length - 4)
    return log.slice(start)
  }, [log])

  const weaponDisplay = player.weapon !== null ? player.weapon.name : '---'
  const armorDisplay = player.armor !== null ? player.armor.name : '---'

  return (
    <div className="w-full flex flex-col">
      {/* Main HUD Bar */}
      <div className="w-full bg-gray-900/95 backdrop-blur-sm border border-gray-700 px-2 py-1.5 flex items-center justify-between gap-2 text-xs">
        {/* HP Section */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-gray-400 shrink-0">HP</span>
          <div className="relative w-16 h-2 bg-gray-700 rounded-sm overflow-hidden shrink-0">
            <div
              className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-300`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className={`shrink-0 ${hpPercent > 25 ? 'text-white' : 'text-red-400'}`}>
            {player.stats.hp}/{player.stats.maxHp}
          </span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-600 shrink-0" />

        {/* Level */}
        <div className="text-cyan-400 shrink-0">
          Lv.{player.level}
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-600 shrink-0" />

        {/* Floor */}
        <div className="text-yellow-400 shrink-0">
          B{floor}F
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-600 shrink-0" />

        {/* Weapon */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="shrink-0">⚔</span>
          <span className="text-amber-400 truncate">{weaponDisplay}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-4 bg-gray-600 shrink-0" />

        {/* Armor */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="shrink-0">🛡</span>
          <span className="text-blue-400 truncate">{armorDisplay}</span>
        </div>
      </div>

      {/* Log Area - 4 recent messages */}
      <div className="w-full bg-gray-900/80 backdrop-blur-sm border-x border-b border-gray-700 px-3 py-1.5">
        {recentLogs.map((msg, i) => (
          <p key={i} className={`text-xs truncate ${i === recentLogs.length - 1 ? 'text-gray-300' : 'text-gray-500'}`}>
            {msg}
          </p>
        ))}
        {recentLogs.length === 0 && (
          <p className="text-xs text-gray-600">...</p>
        )}
      </div>
    </div>
  )
}
