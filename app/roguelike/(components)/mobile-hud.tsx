'use client'

import React, { useMemo, useCallback } from 'react'
import type { Player } from '../(domain)/types'

interface MobileHudProps {
  player: Player
  floor: number
  log: string[]
  themeName: string
  themeIcon: string
}

export default function MobileHud ({ player, floor, log, themeName, themeIcon }: MobileHudProps): React.ReactElement {
  const sanitizeLog = useCallback((msg: string): string => {
    // eslint-disable-next-line no-control-regex
    const noAnsi = msg.replace(/\x1b\[[0-9;]*m/g, '')
    // eslint-disable-next-line no-control-regex
    return noAnsi.replace(/[\u0000-\u001F\u007F]/g, '')
  }, [])

  const hpPercent = useMemo(() => {
    return (player.stats.hp / player.stats.maxHp) * 100
  }, [player.stats.hp, player.stats.maxHp])

  const barColor = useMemo(() => {
    if (hpPercent > 50) return 'bg-green-500'
    if (hpPercent > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }, [hpPercent])

  const recentLogs = useMemo(() => {
    const start = Math.max(0, log.length - 3)
    return log.slice(start).map(sanitizeLog)
  }, [log, sanitizeLog])

  const weaponName = player.weapon !== null ? player.weapon.name : '---'
  const armorName = player.armor !== null ? player.armor.name : '---'

  return (
    <div className="w-full flex flex-col">
      {/* Main HUD Bar - 2 compact rows */}
      <div className="w-full bg-gray-900/95 backdrop-blur-sm border border-gray-700 px-2 py-1">
        {/* Row 1: HP + Level + Theme + Floor */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="text-gray-400 shrink-0">HP</span>
          <div className="relative flex-1 h-2 bg-gray-700 rounded-sm overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 ${barColor} transition-all duration-300`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <span className={`shrink-0 text-[10px] ${hpPercent > 25 ? 'text-white' : 'text-red-400'}`}>
            {player.stats.hp}/{player.stats.maxHp}
          </span>
          <div className="w-px h-3 bg-gray-600 shrink-0" />
          <span className="text-cyan-400 shrink-0">Lv.{player.level}</span>
          <div className="w-px h-3 bg-gray-600 shrink-0" />
          <span className="shrink-0">{themeIcon}</span>
          <span className="text-gray-400 truncate max-w-[64px]">{themeName}</span>
          <span className="text-yellow-400 shrink-0">B{floor}F</span>
        </div>
        {/* Row 2: Equipment + Gold */}
        <div className="flex items-center gap-1 text-[10px] mt-0.5">
          <span className="shrink-0">{'\u2694'}</span>
          <span className="text-amber-400 truncate max-w-[90px]">{weaponName}</span>
          <div className="w-px h-3 bg-gray-600 shrink-0 mx-0.5" />
          <span className="shrink-0">{'\uD83D\uDEE1'}</span>
          <span className="text-blue-400 truncate max-w-[90px]">{armorName}</span>
          <div className="flex-1" />
          <span className="text-yellow-400 shrink-0">{player.gold}G</span>
        </div>
      </div>

      {/* Log Area - 3 recent messages */}
      <div className="w-full bg-gray-900/80 backdrop-blur-sm border-x border-b border-gray-700 px-2 py-1">
        {recentLogs.map((msg, i) => (
          <p key={i} className={`text-[10px] truncate leading-tight ${i === recentLogs.length - 1 ? 'text-gray-300' : 'text-gray-500'}`}>
            {msg}
          </p>
        ))}
        {recentLogs.length === 0 && (
          <p className="text-[10px] text-gray-600 leading-tight">...</p>
        )}
      </div>
    </div>
  )
}
