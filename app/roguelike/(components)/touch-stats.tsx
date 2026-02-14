'use client'

import React, { useCallback } from 'react'
import type { Player } from '../(domain)/types'

interface TouchStatsProps {
  player: Player
  floor: number
  turns: number
  kills: number
  themeName: string
  themeIcon: string
  relation: {
    survivor: number
    cultist: number
    betrayal: number
  }
  activeRouteTag: string | null
  onClose: () => void
}

export default function TouchStats ({
  player,
  floor,
  turns,
  kills,
  themeName,
  themeIcon,
  relation,
  activeRouteTag,
  onClose
}: TouchStatsProps): React.ReactElement {
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const hpPercent = Math.round((player.stats.hp / player.stats.maxHp) * 100)
  const xpPercent = Math.round((player.xp / player.xpNext) * 100)
  const totalAtk = player.stats.str + (player.weapon !== null ? player.weapon.atk : 0)
  const totalDef = player.stats.def + (player.armor !== null ? player.armor.def : 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-sm mx-4 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl"
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400 dos-font">스탯</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            aria-label="Close stats"
          >
            {'\u2715'}
          </button>
        </div>

        {/* Character Info */}
        <div className="px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl text-cyan-400">@</span>
            <div>
              <div className="text-lg text-white font-bold">용사</div>
              <div className="text-sm text-cyan-400">Lv.{player.level}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 py-3 space-y-3">
          {/* HP Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-400">HP</span>
              <span className="text-gray-300">{player.stats.hp}/{player.stats.maxHp}</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-sm overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-purple-400">XP</span>
              <span className="text-gray-300">{player.xp}/{player.xpNext}</span>
            </div>
            <div className="w-full h-3 bg-gray-700 rounded-sm overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-gray-800 rounded px-3 py-2">
              <div className="text-xs text-gray-500">기본 공격</div>
              <div className="text-lg text-red-400 font-bold">{player.stats.str}</div>
            </div>
            <div className="bg-gray-800 rounded px-3 py-2">
              <div className="text-xs text-gray-500">기본 방어</div>
              <div className="text-lg text-blue-400 font-bold">{player.stats.def}</div>
            </div>
            <div className="bg-gray-800 rounded px-3 py-2">
              <div className="text-xs text-gray-500">총 공격력</div>
              <div className="text-lg text-amber-400 font-bold">{totalAtk}</div>
            </div>
            <div className="bg-gray-800 rounded px-3 py-2">
              <div className="text-xs text-gray-500">총 방어력</div>
              <div className="text-lg text-cyan-400 font-bold">{totalDef}</div>
            </div>
          </div>

          {/* Equipment */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
              <span className="text-amber-400">{'\u2694'}</span>
              <div className="flex-1">
                <div className="text-xs text-gray-500">무기</div>
                <div className="text-sm text-white">
                  {player.weapon !== null ? `${player.weapon.name} ATK+${player.weapon.atk}` : '없음'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2">
              <span className="text-blue-400">{'\uD83D\uDEE1'}</span>
              <div className="flex-1">
                <div className="text-xs text-gray-500">방어구</div>
                <div className="text-sm text-white">
                  {player.armor !== null ? `${player.armor.name} DEF+${player.armor.def}` : '없음'}
                </div>
              </div>
            </div>
          </div>

          {/* Game Info */}
          <div className="space-y-2 pt-2">
            {/* Theme */}
            <div className="bg-gray-800 rounded px-3 py-2 flex items-center gap-2">
              <span className="text-lg">{themeIcon}</span>
              <div>
                <div className="text-xs text-gray-500">테마</div>
                <div className="text-sm text-purple-400 font-bold">{themeName}</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800 rounded px-2 py-2 text-center">
                <div className="text-xs text-gray-500">층</div>
                <div className="text-sm text-yellow-400 font-bold">B{floor}F</div>
              </div>
              <div className="bg-gray-800 rounded px-2 py-2 text-center">
                <div className="text-xs text-gray-500">처치</div>
                <div className="text-sm text-red-400 font-bold">{kills}</div>
              </div>
              <div className="bg-gray-800 rounded px-2 py-2 text-center">
                <div className="text-xs text-gray-500">골드</div>
                <div className="text-sm text-yellow-400 font-bold">{player.gold}</div>
              </div>
            </div>

            {/* Narrative relation */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-800 rounded px-2 py-2 text-center">
                <div className="text-xs text-gray-500">생존자</div>
                <div className="text-sm text-green-400 font-bold">{relation.survivor}</div>
              </div>
              <div className="bg-gray-800 rounded px-2 py-2 text-center">
                <div className="text-xs text-gray-500">광신도</div>
                <div className="text-sm text-purple-400 font-bold">{relation.cultist}</div>
              </div>
              <div className="bg-gray-800 rounded px-2 py-2 text-center">
                <div className="text-xs text-gray-500">배신</div>
                <div className="text-sm text-red-400 font-bold">{relation.betrayal}</div>
              </div>
            </div>

            {activeRouteTag !== null && (
              <div className="bg-gray-800 rounded px-3 py-2">
                <div className="text-xs text-gray-500">활성 연쇄</div>
                <div className="text-sm text-cyan-300 font-bold break-all">{activeRouteTag}</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-700 text-center text-xs text-gray-400">
          {turns}턴
        </div>
      </div>
    </div>
  )
}
