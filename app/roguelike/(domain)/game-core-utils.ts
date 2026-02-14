import {
  type GameState,
  type ItemRarity,
  type WeaponData,
  type ArmorData,
  type ThemeObject,
  Tile,
  MAP_WIDTH,
  MAP_HEIGHT,
  MAX_HERO_LEVEL,
  xpForLevel,
  weaponForFloor,
  armorForFloor,
  weaponAttackSpeed,
  getThemeObjects
} from './types'

export function checkLevelUp (state: GameState): GameState {
  const p = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]
  let changed = false

  while (p.level < MAX_HERO_LEVEL && p.xp >= p.xpNext) {
    p.xp -= p.xpNext
    p.level += 1
    const hpGain = 4 + Math.floor(Math.random() * 4) + Math.floor(p.level / 8)
    const strGain = (p.level % 3 === 0 ? 1 : 0) + (Math.random() < 0.35 ? 1 : 0)
    const defGain = (p.level % 4 === 0 ? 1 : 0) + (Math.random() < 0.3 ? 1 : 0)
    p.stats.maxHp += hpGain
    p.stats.str += strGain
    p.stats.def += defGain
    p.stats.hp = p.stats.maxHp
    p.xpNext = xpForLevel(p.level)
    newLog.push(`레벨 업! Lv.${p.level} (HP+${hpGain} STR+${strGain} DEF+${defGain})`)
    changed = true
  }

  if (p.level >= MAX_HERO_LEVEL) {
    p.level = MAX_HERO_LEVEL
    p.xp = 0
    p.xpNext = xpForLevel(MAX_HERO_LEVEL)
  }

  if (changed) {
    return { ...state, player: p, log: newLog }
  }
  return state
}

export function clearProjectile (state: GameState): GameState {
  if (state.projectile === null) return state
  return { ...state, projectile: null }
}

export function rarityRank (rarity: ItemRarity | undefined): number {
  if (rarity === undefined) return 0
  if (rarity === 'common') return 0
  if (rarity === 'uncommon') return 1
  if (rarity === 'rare') return 2
  if (rarity === 'epic') return 3
  return 4
}

export function rollWeaponByRarity (floor: number, themeId: string, minRank: number): WeaponData {
  let best = weaponForFloor(floor, themeId)
  for (let i = 0; i < 10; i++) {
    if (rarityRank(best.rarity) >= minRank) return best
    const cand = weaponForFloor(floor, themeId)
    if (rarityRank(cand.rarity) > rarityRank(best.rarity)) best = cand
  }
  return best
}

export function rollArmorByRarity (floor: number, themeId: string, minRank: number): ArmorData {
  let best = armorForFloor(floor, themeId)
  for (let i = 0; i < 10; i++) {
    if (rarityRank(best.rarity) >= minRank) return best
    const cand = armorForFloor(floor, themeId)
    if (rarityRank(cand.rarity) > rarityRank(best.rarity)) best = cand
  }
  return best
}

export function findThemeObjectByToken (state: GameState, token: string): ThemeObject | undefined {
  const objects = getThemeObjects(state.currentTheme)
  return objects.find(obj => obj.id === token)
}

export function buildProjectilePath (
  state: GameState,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  maxRange: number
): Array<{ x: number, y: number }> {
  const path: Array<{ x: number, y: number }> = []
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  let x = x0
  let y = y0
  let traveled = 0

  while (!(x === x1 && y === y1) && traveled < maxRange + 1) {
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
    traveled += 1

    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) break
    path.push({ x, y })
    if (state.map.tiles[y][x] === Tile.Wall) break
  }

  return path
}

export function playerAttackReady (state: GameState): boolean {
  return state.turns >= state.player.nextAttackTurn
}

export function nextPlayerAttackTurn (state: GameState): number {
  const delay = weaponAttackSpeed(state.player.weapon)
  return state.turns + delay
}
