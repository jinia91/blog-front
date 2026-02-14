export const MAP_WIDTH = 80
export const MAP_HEIGHT = 36
export const VIEW_WIDTH = 32
export const VIEW_HEIGHT = 14
export const PANEL_WIDTH = 20
export const FOV_RADIUS = 12
export const MAX_INVENTORY = 8
export const TOTAL_FLOORS = 10

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface Position {
  x: number
  y: number
}

export enum Tile {
  Wall = 0,
  Floor = 1,
  Door = 2,
  Stairs = 3,
  Shop = 4
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
  rarity?: ItemRarity
  range?: number // 1=melee, 2-3=mid, 4-5=ranged
  speed?: number // attacks every N turns (lower is faster)
}

export interface ArmorData {
  name: string
  def: number
  rarity?: ItemRarity
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

export interface ShopItem {
  item: InvItem
  price: number
  sold: boolean
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
  nextAttackTurn: number
}

export interface Enemy {
  pos: Position
  stats: Stats
  name: string
  ch: string
  xp: number
  alive: boolean
  isBoss: boolean
  range: number
  attackSpeed: number
  nextAttackTurn: number
}

export interface EnemyDef {
  name: string
  ch: string
  stats: Stats
  xp: number
  range?: number // 1=melee, 2-3=mid, 4-5=ranged
  attackSpeed?: number
}

export interface FloorTheme {
  id: string
  name: string
  icon: string
  wallColor: string
  floorColor: string
  flavorTexts: string[]
  monsters: EnemyDef[]
  boss: EnemyDef
  uniqueWeapons?: WeaponData[]
  uniqueArmors?: ArmorData[]
  themeObject?: ThemeObject
  specialRoomDesc?: string
}

export type ThemeObjectEffect = 'heal30' | 'heal50' | 'fullHeal' | 'buffStr' | 'buffDef' | 'buffMaxHp' | 'gold' | 'xp' | 'gamble' | 'randomItem' | 'teleport'

export interface ThemeObject {
  id?: string
  name: string
  ch: string
  color: string
  spawnChance: number
  effectType: ThemeObjectEffect
  effectValue?: number
  logMessage: string
}

export interface ProjectileTrail {
  path: Position[]
  ch: string
  color: 'yellow' | 'cyan' | 'red'
}

export type EventCategory = 'choice' | 'trap' | 'npc' | 'puzzle'

export interface EventChoice {
  label: string
  description: string
  requiresGold?: number
  requiresHp?: number
  skillCheck?: { stat: 'str' | 'def', difficulty: number }
}

export interface EventOutcome {
  log: string[]
  hpChange?: number
  maxHpChange?: number
  strChange?: number
  defChange?: number
  goldChange?: number
  xpChange?: number
  giveItem?: InvItem
  fullHeal?: boolean
  teleport?: boolean
}

export interface EventDef {
  id: string
  name: string
  category: EventCategory
  description: string[]
  choices: EventChoice[]
  resolve: (choiceIdx: number, state: GameState) => EventOutcome
  themeIds?: string[]
  minFloor?: number
}

export interface ActiveEvent {
  eventId: string
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
  currentTheme: FloorTheme
  usedThemeIds: string[]
  shopOpen: boolean
  shopItems: ShopItem[]
  shopIdx: number
  usedObjects: string[]
  activeEvent: ActiveEvent | null
  eventIdx: number
  projectile: ProjectileTrail | null
}
