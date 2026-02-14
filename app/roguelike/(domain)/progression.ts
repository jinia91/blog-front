import {
  type ItemRarity,
  type ShopItem,
  type InvItem,
  type WeaponData,
  type ArmorData,
  type PotionData,
  type Position,
  type Player,
  type EnemyDef,
  type Enemy,
  type Stats,
  type FloorTheme,
  type ThemeRiskProfile,
  MAX_HERO_LEVEL,
  TOTAL_FLOORS
} from './model'
import {
  RARITY_DROP_RATE,
  RARITY_PRICE,
  RARITY_MULTIPLIER,
  RARITY_NAMES,
  FLOOR_THEMES
} from './content'
import {
  WEAPONS,
  ARMORS,
  LEGENDARY_WEAPONS,
  LEGENDARY_ARMORS,
  getThemeWeaponById,
  getThemeArmorById
} from './items'

const RARITY_ORDER: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

function expectedThemeDifficultyForFloor (floor: number): number {
  const t = (Math.max(1, floor) - 1) / Math.max(1, TOTAL_FLOORS - 1)
  return 1 + t * 3.0
}

function riskProfileScore (risk: ThemeRiskProfile): number {
  if (risk === 'safe') return -0.35
  if (risk === 'risky') return 0.35
  if (risk === 'deadly') return 0.6
  return 0
}

function clamp01 (v: number): number {
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}

function themeRiskRewardBonus (floor: number, theme: FloorTheme | undefined): number {
  if (theme === undefined) return 0
  const difficultyGap = (theme.difficulty - expectedThemeDifficultyForFloor(floor)) * 0.04
  const risk = riskProfileScore(theme.riskProfile) * 0.06
  const bias = theme.lootBias
  return Math.max(-0.16, Math.min(0.18, difficultyGap + risk + bias))
}

function adjustedRarityRates (bonus: number): Record<ItemRarity, number> {
  const rates: Record<ItemRarity, number> = { ...RARITY_DROP_RATE }
  if (bonus > 0) {
    rates.common = clamp01(rates.common - bonus * 0.7)
    rates.uncommon = clamp01(rates.uncommon - bonus * 0.35)
    rates.rare = clamp01(rates.rare + bonus * 0.55)
    rates.epic = clamp01(rates.epic + bonus * 0.33)
    rates.legendary = clamp01(rates.legendary + bonus * 0.17)
  } else if (bonus < 0) {
    const penalty = Math.abs(bonus)
    rates.common = clamp01(rates.common + penalty * 0.65)
    rates.uncommon = clamp01(rates.uncommon + penalty * 0.30)
    rates.rare = clamp01(rates.rare - penalty * 0.5)
    rates.epic = clamp01(rates.epic - penalty * 0.3)
    rates.legendary = clamp01(rates.legendary - penalty * 0.15)
  }

  const total = rates.common + rates.uncommon + rates.rare + rates.epic + rates.legendary
  if (total <= 0) return { ...RARITY_DROP_RATE }
  return {
    common: rates.common / total,
    uncommon: rates.uncommon / total,
    rare: rates.rare / total,
    epic: rates.epic / total,
    legendary: rates.legendary / total
  }
}

function maxRarityForFloor (floor: number): ItemRarity {
  if (floor <= 2) return 'uncommon'
  if (floor <= 4) return 'rare'
  if (floor <= 7) return 'epic'
  return 'legendary'
}

function clampRarityByFloor (rarity: ItemRarity, floor: number): ItemRarity {
  const maxRarity = maxRarityForFloor(floor)
  const maxIdx = RARITY_ORDER.indexOf(maxRarity)
  const idx = RARITY_ORDER.indexOf(rarity)
  if (idx <= maxIdx) return rarity
  return RARITY_ORDER[maxIdx]
}

function tierForFloor (floor: number, tiers: number): number {
  return Math.min(Math.floor((Math.max(1, floor) - 1) / 3), tiers - 1)
}

export function rollRarity (floor: number = 1, themeId?: string, extraRiskReward: number = 0): ItemRarity {
  const theme = themeId !== undefined ? FLOOR_THEMES.find(t => t.id === themeId) : undefined
  const bonus = themeRiskRewardBonus(floor, theme) + extraRiskReward
  const rates = adjustedRarityRates(bonus)
  const roll = Math.random()
  let cumulative = 0
  for (const r of RARITY_ORDER) {
    cumulative += rates[r]
    if (roll < cumulative) {
      return clampRarityByFloor(r, floor)
    }
  }
  return clampRarityByFloor('common', floor)
}

export function generateShopItems (floor: number, priceMultiplier: number = 1): ShopItem[] {
  const items: ShopItem[] = []
  const wpn = weaponForFloor(Math.min(floor + 1, TOTAL_FLOORS))
  const arm = armorForFloor(Math.min(floor + 1, TOTAL_FLOORS))
  const pot1 = potionForFloor(floor)
  const pot2 = potionForFloor(floor)

  const priceOf = (item: InvItem): number => {
    let basePrice = RARITY_PRICE.common
    if (item.kind === 'weapon' && item.data.rarity !== undefined) {
      basePrice = RARITY_PRICE[item.data.rarity]
    } else if (item.kind === 'armor' && item.data.rarity !== undefined) {
      basePrice = RARITY_PRICE[item.data.rarity]
    }
    return Math.max(1, Math.floor(basePrice * floor * priceMultiplier))
  }

  items.push({ item: { kind: 'weapon', data: wpn }, price: priceOf({ kind: 'weapon', data: wpn }), sold: false })
  items.push({ item: { kind: 'armor', data: arm }, price: priceOf({ kind: 'armor', data: arm }), sold: false })
  items.push({ item: { kind: 'potion', data: pot1 }, price: Math.max(1, Math.floor(8 * floor * priceMultiplier)), sold: false })
  items.push({ item: { kind: 'potion', data: pot2 }, price: Math.max(1, Math.floor(8 * floor * priceMultiplier)), sold: false })

  return items
}

export function weaponForFloor (floor: number, themeId?: string): WeaponData {
  const adjustedFloor = Math.max(1, floor)
  const theme = themeId !== undefined ? FLOOR_THEMES.find(t => t.id === themeId) : undefined
  const rewardBonus = themeRiskRewardBonus(adjustedFloor, theme)
  const themeUniqueChance = theme !== undefined
    ? Math.max(0.08, Math.min(0.35, 0.17 + rewardBonus * 0.8))
    : 0.17

  if (themeId !== undefined && Math.random() < themeUniqueChance) {
    if (theme?.uniqueWeaponIds !== undefined && theme.uniqueWeaponIds.length > 0) {
      const key = theme.uniqueWeaponIds[Math.floor(Math.random() * theme.uniqueWeaponIds.length)]
      const base = getThemeWeaponById(key)
      if (base !== undefined) {
        const rarity = rollRarity(adjustedFloor, themeId, rewardBonus)
        if (rarity === 'legendary') {
          return LEGENDARY_WEAPONS[Math.floor(Math.random() * LEGENDARY_WEAPONS.length)]
        }
        const mult = RARITY_MULTIPLIER[rarity]
        const prefix = rarity !== 'common' ? `[${RARITY_NAMES[rarity]}] ` : ''
        return {
          name: prefix + base.name,
          atk: Math.floor(base.atk * mult * (1 + (adjustedFloor - 1) * 0.08)),
          rarity,
          range: base.range,
          speed: base.speed
        }
      }
    }
  }
  const rarity = rollRarity(adjustedFloor, themeId, rewardBonus)
  if (rarity === 'legendary') {
    return LEGENDARY_WEAPONS[Math.floor(Math.random() * LEGENDARY_WEAPONS.length)]
  }
  const tier = tierForFloor(adjustedFloor, WEAPONS.length)
  const pool = WEAPONS[tier]
  const base = pool[Math.floor(Math.random() * pool.length)]
  const mult = RARITY_MULTIPLIER[rarity]
  const prefix = rarity !== 'common' ? `[${RARITY_NAMES[rarity]}] ` : ''
  return {
    name: prefix + base.name,
    atk: Math.floor(base.atk * mult),
    rarity,
    range: base.range,
    speed: base.speed
  }
}

export function armorForFloor (floor: number, themeId?: string): ArmorData {
  const adjustedFloor = Math.max(1, floor)
  const theme = themeId !== undefined ? FLOOR_THEMES.find(t => t.id === themeId) : undefined
  const rewardBonus = themeRiskRewardBonus(adjustedFloor, theme)
  const themeUniqueChance = theme !== undefined
    ? Math.max(0.08, Math.min(0.35, 0.17 + rewardBonus * 0.8))
    : 0.17

  if (themeId !== undefined && Math.random() < themeUniqueChance) {
    if (theme?.uniqueArmorIds !== undefined && theme.uniqueArmorIds.length > 0) {
      const key = theme.uniqueArmorIds[Math.floor(Math.random() * theme.uniqueArmorIds.length)]
      const base = getThemeArmorById(key)
      if (base !== undefined) {
        const rarity = rollRarity(adjustedFloor, themeId, rewardBonus)
        if (rarity === 'legendary') {
          return LEGENDARY_ARMORS[Math.floor(Math.random() * LEGENDARY_ARMORS.length)]
        }
        const mult = RARITY_MULTIPLIER[rarity]
        const prefix = rarity !== 'common' ? `[${RARITY_NAMES[rarity]}] ` : ''
        return { name: prefix + base.name, def: Math.floor(base.def * mult * (1 + (adjustedFloor - 1) * 0.08)), rarity }
      }
    }
  }
  const rarity = rollRarity(adjustedFloor, themeId, rewardBonus)
  if (rarity === 'legendary') {
    return LEGENDARY_ARMORS[Math.floor(Math.random() * LEGENDARY_ARMORS.length)]
  }
  const tier = tierForFloor(adjustedFloor, ARMORS.length)
  const pool = ARMORS[tier]
  const base = pool[Math.floor(Math.random() * pool.length)]
  const mult = RARITY_MULTIPLIER[rarity]
  const prefix = rarity !== 'common' ? `[${RARITY_NAMES[rarity]}] ` : ''
  return {
    name: prefix + base.name,
    def: Math.floor(base.def * mult),
    rarity
  }
}

export function potionForFloor (floor: number): PotionData {
  const types: Array<{ healType: 'hp' | 'str', value: number }> = [
    { healType: 'hp', value: Math.floor(10 + floor * 3) },
    { healType: 'str', value: Math.floor(2 + floor * 0.5) }
  ]
  const choice = types[Math.floor(Math.random() * types.length)]
  return {
    name: choice.healType === 'hp' ? '체력 포션' : '힘 포션',
    healType: choice.healType,
    value: choice.value
  }
}

export function xpForLevel (level: number): number {
  if (level >= MAX_HERO_LEVEL) return 999999
  return Math.floor(26 + (level * level * 9) + (level * 8))
}

export function recommendedPlayerLevelForFloor (floor: number): number {
  return Math.min(MAX_HERO_LEVEL, Math.max(1, floor))
}

export function floorCatchupXpNeeded (player: Player, floor: number): number {
  const target = recommendedPlayerLevelForFloor(floor)
  if (player.level >= target) return 0
  let need = 0
  let level = player.level
  let xp = player.xp
  let xpNext = player.xpNext
  while (level < target && level < MAX_HERO_LEVEL) {
    need += Math.max(0, xpNext - xp)
    level += 1
    xp = 0
    xpNext = xpForLevel(level)
  }
  return Math.max(0, need)
}

function resolveAttackSpeed (range: number | undefined, explicitSpeed: number | undefined, meleeFallback: number): number {
  if (explicitSpeed !== undefined) return Math.max(1, explicitSpeed)
  const resolvedRange = range ?? 1
  if (resolvedRange >= 4) return 3
  if (resolvedRange >= 2) return 2
  return meleeFallback
}

export function weaponAttackSpeed (weapon: WeaponData | null): number {
  if (weapon === null) return 2
  return resolveAttackSpeed(weapon.range, weapon.speed, 2)
}

export function enemyAttackSpeed (def: EnemyDef): number {
  const explicit = def.speed ?? def.attackSpeed
  return resolveAttackSpeed(def.range, explicit, 2)
}

export function createPlayer (pos: Position): Player {
  return {
    pos,
    stats: { hp: 35, maxHp: 35, str: 5, def: 3 },
    level: 1,
    xp: 0,
    xpNext: xpForLevel(1),
    gold: 0,
    weapon: { name: '녹슨 단도', atk: 2, speed: 1 },
    armor: null,
    inventory: [],
    nextAttackTurn: 0,
    reviveCharges: 0,
    omenMarks: 0
  }
}

export function createEnemy (def: EnemyDef, pos: Position, isBoss: boolean = false): Enemy {
  const atkSpeed = enemyAttackSpeed(def)
  return {
    pos,
    stats: { ...def.stats },
    name: def.name,
    ch: def.ch,
    xp: def.xp,
    alive: true,
    isBoss,
    range: def.range ?? 1,
    attackSpeed: atkSpeed,
    nextAttackTurn: 0,
    bossPhase: 1,
    bossPattern: 'summoner'
  }
}

export function enemyCountForFloor (floor: number, theme?: FloorTheme, playerLevel: number = 1): number {
  let base: number
  if (floor <= 3) base = 5 + Math.floor(Math.random() * 3)
  else if (floor <= 6) base = 7 + Math.floor(Math.random() * 3)
  else if (floor <= 9) base = 9 + Math.floor(Math.random() * 3)
  else base = 5

  if (theme !== undefined) {
    base += Math.round((theme.difficulty - 2.2) * 0.9)
    base += Math.round(theme.eventBias * 1.2)
    if (theme.riskProfile === 'safe') base -= 1
    if (theme.riskProfile === 'deadly') base += 1
  }
  const recommended = recommendedPlayerLevelForFloor(floor)
  if (playerLevel < recommended) base -= 1
  return Math.max(4, Math.min(12, base))
}

export function itemCountForFloor (floor: number, theme?: FloorTheme, playerLevel: number = 1): number {
  let base = 4 + Math.floor(Math.random() * 4)
  if (theme !== undefined) {
    base += Math.round(theme.lootBias * 10)
    base += Math.round(theme.objectBias * 2)
    if (theme.riskProfile === 'safe') base += 1
  }
  const recommended = recommendedPlayerLevelForFloor(floor)
  if (playerLevel < recommended) base += 1
  return Math.max(3, Math.min(9, base))
}

export function scaleEnemyStats (base: Stats, floor: number, theme?: FloorTheme, playerLevel: number = 1): Stats {
  const themeDiff = theme?.difficulty ?? expectedThemeDifficultyForFloor(floor)
  const themeRisk = theme !== undefined ? riskProfileScore(theme.riskProfile) : 0
  const levelDelta = recommendedPlayerLevelForFloor(floor) - playerLevel
  const levelAssist = levelDelta > 0 ? Math.min(0.12, levelDelta * 0.03) : 0
  const multiplier = 1 + (floor - 1) * 0.18 + (themeDiff - 2.0) * 0.04 + (themeRisk * 0.03) - levelAssist
  return {
    hp: Math.floor(base.hp * multiplier),
    maxHp: Math.floor(base.maxHp * multiplier),
    str: Math.floor(base.str * (1 + (floor - 1) * 0.16 + (themeDiff - 2.0) * 0.03 - levelAssist * 0.5)),
    def: Math.floor(base.def * (1 + (floor - 1) * 0.14 + (themeDiff - 2.0) * 0.025 - levelAssist * 0.5))
  }
}

export function scaleBossStats (base: Stats, floor: number, theme?: FloorTheme, playerLevel: number = 1): Stats {
  const themeDiff = theme?.difficulty ?? expectedThemeDifficultyForFloor(floor)
  const themeRisk = theme !== undefined ? riskProfileScore(theme.riskProfile) : 0
  const levelDelta = recommendedPlayerLevelForFloor(floor) - playerLevel
  const levelAssist = levelDelta > 0 ? Math.min(0.12, levelDelta * 0.03) : 0
  const hpMult = 3 * (1 + (floor - 1) * 0.22 + (themeDiff - 2.0) * 0.045 + (themeRisk * 0.03) - levelAssist)
  const strMult = 1.5 * (1 + (floor - 1) * 0.16 + (themeDiff - 2.0) * 0.035 + (themeRisk * 0.03) - levelAssist * 0.5)
  const defMult = 1.5 * (1 + (floor - 1) * 0.14 + (themeDiff - 2.0) * 0.03 + (themeRisk * 0.02) - levelAssist * 0.5)
  return {
    hp: Math.floor(base.hp * hpMult),
    maxHp: Math.floor(base.maxHp * hpMult),
    str: Math.floor(base.str * strMult),
    def: Math.floor(base.def * defMult)
  }
}

export function selectThemeForFloor (floor: number, usedThemeIds: string[]): FloorTheme {
  const available = FLOOR_THEMES.filter(t => !usedThemeIds.includes(t.id))
  const pool = available.length > 0 ? available : FLOOR_THEMES
  const targetDifficulty = expectedThemeDifficultyForFloor(floor)
  const close = pool.filter(t => Math.abs(t.difficulty - targetDifficulty) <= 1.05)
  const medium = pool.filter(t => Math.abs(t.difficulty - targetDifficulty) <= 1.75)
  const selectedPool = close.length > 0 ? close : (medium.length > 0 ? medium : pool)
  return selectedPool[Math.floor(Math.random() * selectedPool.length)]
}
