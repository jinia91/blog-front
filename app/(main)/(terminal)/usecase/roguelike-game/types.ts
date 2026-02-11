export const MAP_WIDTH = 80
export const MAP_HEIGHT = 36
export const VIEW_WIDTH = 50
export const VIEW_HEIGHT = 22
export const PANEL_WIDTH = 24
export const FOV_RADIUS = 12
export const MAX_INVENTORY = 8
export const TOTAL_FLOORS = 10

export interface Position {
  x: number
  y: number
}

export enum Tile {
  Wall = 0,
  Floor = 1,
  Door = 2,
  Stairs = 3
}

export interface Room {
  x: number
  y: number
  w: number
  h: number
}

export interface DungeonMap {
  tiles: Tile[][]
  explored: boolean[][]
  visible: boolean[][]
  rooms: Room[]
}

export interface Stats {
  hp: number
  maxHp: number
  str: number
  def: number
}

export interface WeaponData {
  name: string
  atk: number
}

export interface ArmorData {
  name: string
  def: number
}

export interface PotionData {
  name: string
  healType: 'hp' | 'str'
  value: number
}

export type InvItem =
  | { kind: 'weapon', data: WeaponData }
  | { kind: 'armor', data: ArmorData }
  | { kind: 'potion', data: PotionData }

export interface MapItem {
  pos: Position
  item: InvItem
  ch: string
}

export interface Player {
  pos: Position
  stats: Stats
  level: number
  xp: number
  xpNext: number
  gold: number
  weapon: WeaponData | null
  armor: ArmorData | null
  inventory: InvItem[]
}

export interface Enemy {
  pos: Position
  stats: Stats
  name: string
  ch: string
  xp: number
  alive: boolean
}

export interface EnemyDef {
  name: string
  ch: string
  stats: Stats
  xp: number
}

export interface GameState {
  map: DungeonMap
  player: Player
  enemies: Enemy[]
  items: MapItem[]
  floor: number
  over: boolean
  won: boolean
  log: string[]
  turns: number
  kills: number
  invOpen: boolean
  invIdx: number
}

export const ENEMY_TABLE: EnemyDef[][] = [
  [
    { name: 'Rat', ch: 'r', stats: { hp: 6, maxHp: 6, str: 2, def: 0 }, xp: 3 },
    { name: 'Bat', ch: 'b', stats: { hp: 4, maxHp: 4, str: 3, def: 0 }, xp: 4 }
  ],
  [
    { name: 'Slime', ch: 's', stats: { hp: 10, maxHp: 10, str: 3, def: 1 }, xp: 6 },
    { name: 'Snake', ch: 'S', stats: { hp: 7, maxHp: 7, str: 4, def: 0 }, xp: 5 }
  ],
  [
    { name: 'Goblin', ch: 'g', stats: { hp: 14, maxHp: 14, str: 5, def: 2 }, xp: 9 },
    { name: 'Kobold', ch: 'k', stats: { hp: 11, maxHp: 11, str: 4, def: 3 }, xp: 8 }
  ],
  [
    { name: 'Wolf', ch: 'w', stats: { hp: 18, maxHp: 18, str: 6, def: 2 }, xp: 12 },
    { name: 'Spider', ch: 'x', stats: { hp: 14, maxHp: 14, str: 7, def: 1 }, xp: 11 }
  ],
  [
    { name: 'Skeleton', ch: 'Z', stats: { hp: 22, maxHp: 22, str: 7, def: 4 }, xp: 16 },
    { name: 'Zombie', ch: 'z', stats: { hp: 28, maxHp: 28, str: 6, def: 3 }, xp: 14 }
  ],
  [
    { name: 'Orc', ch: 'O', stats: { hp: 28, maxHp: 28, str: 9, def: 5 }, xp: 20 },
    { name: 'DarkElf', ch: 'e', stats: { hp: 20, maxHp: 20, str: 11, def: 3 }, xp: 18 }
  ],
  [
    { name: 'Wraith', ch: 'W', stats: { hp: 25, maxHp: 25, str: 12, def: 4 }, xp: 25 },
    { name: 'Gargoyle', ch: 'G', stats: { hp: 35, maxHp: 35, str: 10, def: 7 }, xp: 23 }
  ],
  [
    { name: 'Troll', ch: 'T', stats: { hp: 45, maxHp: 45, str: 11, def: 6 }, xp: 32 },
    { name: 'DarkMage', ch: 'M', stats: { hp: 22, maxHp: 22, str: 15, def: 3 }, xp: 28 }
  ],
  [
    { name: 'Demon', ch: 'D', stats: { hp: 40, maxHp: 40, str: 14, def: 7 }, xp: 40 },
    { name: 'Minotaur', ch: 'm', stats: { hp: 50, maxHp: 50, str: 13, def: 8 }, xp: 38 }
  ],
  [
    { name: 'Dragon', ch: 'D', stats: { hp: 120, maxHp: 120, str: 20, def: 12 }, xp: 200 }
  ]
]

export const WEAPONS: WeaponData[][] = [
  [{ name: 'Short Sword', atk: 4 }],
  [{ name: 'Long Sword', atk: 6 }],
  [{ name: 'Battle Axe', atk: 9 }],
  [{ name: 'Flame Sword', atk: 12 }],
  [{ name: 'DragonSlayer', atk: 16 }]
]

export const ARMORS: ArmorData[][] = [
  [{ name: 'Leather', def: 2 }],
  [{ name: 'Chain Mail', def: 4 }],
  [{ name: 'Plate', def: 6 }],
  [{ name: 'Mithril', def: 9 }],
  [{ name: 'DragonScale', def: 12 }]
]

export function weaponForFloor (floor: number): WeaponData {
  const tier = Math.min(Math.floor((floor - 1) / 2), WEAPONS.length - 1)
  const pool = WEAPONS[tier]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function armorForFloor (floor: number): ArmorData {
  const tier = Math.min(Math.floor((floor - 1) / 2), ARMORS.length - 1)
  const pool = ARMORS[tier]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function potionForFloor (floor: number): PotionData {
  const types: Array<{ healType: 'hp' | 'str', value: number }> = [
    { healType: 'hp', value: Math.floor(10 + floor * 2) },
    { healType: 'str', value: Math.floor(2 + floor * 0.5) }
  ]
  const choice = types[Math.floor(Math.random() * types.length)]
  return {
    name: choice.healType === 'hp' ? 'Health Potion' : 'Strength Potion',
    healType: choice.healType,
    value: choice.value
  }
}

export function xpForLevel (level: number): number {
  return level * 25 + 15
}

export function createPlayer (pos: Position): Player {
  return {
    pos,
    stats: { hp: 30, maxHp: 30, str: 5, def: 3 },
    level: 1,
    xp: 0,
    xpNext: xpForLevel(1),
    gold: 0,
    weapon: { name: 'Rusty Dagger', atk: 2 },
    armor: null,
    inventory: []
  }
}

export function createEnemy (def: EnemyDef, pos: Position): Enemy {
  return {
    pos,
    stats: { ...def.stats },
    name: def.name,
    ch: def.ch,
    xp: def.xp,
    alive: true
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
