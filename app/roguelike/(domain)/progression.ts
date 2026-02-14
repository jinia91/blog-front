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
  TOTAL_FLOORS
} from './model'
import {
  RARITY_DROP_RATE,
  RARITY_PRICE,
  RARITY_MULTIPLIER,
  RARITY_NAMES,
  WEAPONS,
  ARMORS,
  LEGENDARY_WEAPONS,
  LEGENDARY_ARMORS,
  FLOOR_THEMES
} from './content'

const RARITY_ORDER: ItemRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

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

export function rollRarity (floor: number = 1): ItemRarity {
  const roll = Math.random()
  let cumulative = 0
  for (const r of RARITY_ORDER) {
    cumulative += RARITY_DROP_RATE[r]
    if (roll < cumulative) {
      return clampRarityByFloor(r, floor)
    }
  }
  return clampRarityByFloor('common', floor)
}

export function generateShopItems (floor: number): ShopItem[] {
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
    return basePrice * floor
  }

  items.push({ item: { kind: 'weapon', data: wpn }, price: priceOf({ kind: 'weapon', data: wpn }), sold: false })
  items.push({ item: { kind: 'armor', data: arm }, price: priceOf({ kind: 'armor', data: arm }), sold: false })
  items.push({ item: { kind: 'potion', data: pot1 }, price: 8 * floor, sold: false })
  items.push({ item: { kind: 'potion', data: pot2 }, price: 8 * floor, sold: false })

  return items
}

export function weaponForFloor (floor: number, themeId?: string): WeaponData {
  const adjustedFloor = Math.max(1, floor)

  if (themeId !== undefined && Math.random() < 0.2) {
    const theme = FLOOR_THEMES.find(t => t.id === themeId)
    if (theme?.uniqueWeapons !== undefined && theme.uniqueWeapons.length > 0) {
      const base = theme.uniqueWeapons[Math.floor(Math.random() * theme.uniqueWeapons.length)]
      const rarity = rollRarity(adjustedFloor)
      if (rarity === 'legendary') {
        return LEGENDARY_WEAPONS[Math.floor(Math.random() * LEGENDARY_WEAPONS.length)]
      }
      const mult = RARITY_MULTIPLIER[rarity]
      const prefix = rarity !== 'common' ? `[${RARITY_NAMES[rarity]}] ` : ''
      const speed = base.speed ?? (base.range !== undefined && base.range >= 4 ? 3 : base.range !== undefined && base.range >= 2 ? 2 : 2)
      return {
        name: prefix + base.name,
        atk: Math.floor(base.atk * mult * (1 + (adjustedFloor - 1) * 0.08)),
        rarity,
        range: base.range,
        speed
      }
    }
  }
  const rarity = rollRarity(adjustedFloor)
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

  if (themeId !== undefined && Math.random() < 0.2) {
    const theme = FLOOR_THEMES.find(t => t.id === themeId)
    if (theme?.uniqueArmors !== undefined && theme.uniqueArmors.length > 0) {
      const base = theme.uniqueArmors[Math.floor(Math.random() * theme.uniqueArmors.length)]
      const rarity = rollRarity(adjustedFloor)
      if (rarity === 'legendary') {
        return LEGENDARY_ARMORS[Math.floor(Math.random() * LEGENDARY_ARMORS.length)]
      }
      const mult = RARITY_MULTIPLIER[rarity]
      const prefix = rarity !== 'common' ? `[${RARITY_NAMES[rarity]}] ` : ''
      return { name: prefix + base.name, def: Math.floor(base.def * mult * (1 + (adjustedFloor - 1) * 0.08)), rarity }
    }
  }
  const rarity = rollRarity(adjustedFloor)
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
  return Math.floor(30 + (level * level * 14) + (level * 10))
}

export function weaponAttackSpeed (weapon: WeaponData | null): number {
  if (weapon === null) return 2
  if (weapon.speed !== undefined) return Math.max(1, weapon.speed)
  const range = weapon.range ?? 1
  if (range >= 4) return 3
  if (range >= 2) return 2
  return 2
}

export function enemyAttackSpeed (def: EnemyDef): number {
  if (def.attackSpeed !== undefined) return Math.max(1, def.attackSpeed)
  const range = def.range ?? 1
  if (range >= 4) return 3
  if (range >= 2) return 2
  return 1
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
    nextAttackTurn: 0
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
    nextAttackTurn: 0
  }
}

export function enemyCountForFloor (floor: number): number {
  if (floor <= 3) return 5 + Math.floor(Math.random() * 3)
  if (floor <= 6) return 7 + Math.floor(Math.random() * 3)
  if (floor <= 9) return 9 + Math.floor(Math.random() * 3)
  return 5
}

export function itemCountForFloor (floor: number): number {
  return 4 + Math.floor(Math.random() * 4)
}

export function scaleEnemyStats (base: Stats, floor: number): Stats {
  const multiplier = 1 + (floor - 1) * 0.18
  return {
    hp: Math.floor(base.hp * multiplier),
    maxHp: Math.floor(base.maxHp * multiplier),
    str: Math.floor(base.str * (1 + (floor - 1) * 0.16)),
    def: Math.floor(base.def * (1 + (floor - 1) * 0.14))
  }
}

export function scaleBossStats (base: Stats, floor: number): Stats {
  const hpMult = 3 * (1 + (floor - 1) * 0.22)
  const strMult = 1.5 * (1 + (floor - 1) * 0.16)
  const defMult = 1.5 * (1 + (floor - 1) * 0.14)
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
  return pool[Math.floor(Math.random() * pool.length)]
}
