export type ObjectScaleSize = 'S' | 'M' | 'L' | 'XL' | 'XXL'
export type ObjectRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'mythic'
export type ObjectEffectType = 'aura' | 'trigger' | 'interact' | 'pulse' | 'stateful'
export type ObjectRoomTag = 'combat' | 'hazard' | 'treasure' | 'ritual' | 'support'
export type RoomIdentity = 'altar' | 'collapse' | 'purge' | 'quarantine' | 'supply'

export interface ObjectEffect {
  type: ObjectEffectType
  value: number
  radius?: number
  note: string
}

export type ModifierKind = 'hp' | 'str' | 'def' | 'maxHp' | 'gold' | 'xp' | 'item' | 'doom'

export interface ObjectModifier {
  kind: ModifierKind
  value: number
  mode?: 'flat' | 'percent'
  itemPool?: 'weapon' | 'armor' | 'potion' | 'random'
}

export interface ObjectSpawnRules {
  maxPerFloor: number
  maxPerRoom: number
  requiresOpenArea: boolean
}

export interface ScaledObjectDef {
  id: string
  themeId: string
  name: string
  size: ObjectScaleSize
  rarity: ObjectRarity
  minFloor: number
  maxFloor: number
  weight: number
  roomTags: readonly ObjectRoomTag[]
  footprintMask: readonly string[]
  effects: readonly ObjectEffect[]
  risks: readonly ObjectModifier[]
  rewards: readonly ObjectModifier[]
  spawnRules: ObjectSpawnRules
  symbol: string
}

export const OBJECT_SIZE_DIMENSIONS: Readonly<Record<ObjectScaleSize, { w: number, h: number }>> = {
  S: { w: 2, h: 2 },
  M: { w: 3, h: 3 },
  L: { w: 4, h: 4 },
  XL: { w: 5, h: 5 },
  XXL: { w: 6, h: 6 }
}

export const OBJECT_SIZE_COST: Readonly<Record<ObjectScaleSize, number>> = {
  S: 1,
  M: 2,
  L: 3,
  XL: 5,
  XXL: 8
}

const RARITY_WEIGHT: Readonly<Record<ObjectRarity, number>> = {
  common: 1.25,
  uncommon: 1.0,
  rare: 0.72,
  epic: 0.46,
  mythic: 0.15
}

const IDENTITY_WEIGHT: Readonly<Record<RoomIdentity, readonly ObjectRoomTag[]>> = {
  altar: ['ritual', 'treasure'],
  collapse: ['hazard', 'combat'],
  purge: ['ritual', 'hazard'],
  quarantine: ['support', 'hazard'],
  supply: ['support', 'treasure']
}

const fnRectMask = (size: ObjectScaleSize): readonly string[] => {
  const { w, h } = OBJECT_SIZE_DIMENSIONS[size]
  const row = '#'.repeat(w)
  return Array.from({ length: h }, () => row)
}

const OBJECTS: readonly ScaledObjectDef[] = [
  {
    id: 'world_anchored_pillar',
    themeId: '*',
    name: '고정 앵커 기둥',
    size: 'S',
    rarity: 'common',
    minFloor: 1,
    maxFloor: 10,
    weight: 1.25,
    roomTags: ['combat', 'support'],
    footprintMask: fnRectMask('S'),
    effects: [{ type: 'aura', value: 6, radius: 2, note: '주변의 원거리 피해를 약화한다.' }],
    risks: [],
    rewards: [{ kind: 'def', value: 1 }],
    spawnRules: { maxPerFloor: 4, maxPerRoom: 1, requiresOpenArea: false },
    symbol: '⌂'
  },
  {
    id: 'world_shattered_obelisk',
    themeId: '*',
    name: '균열 오벨리스크',
    size: 'M',
    rarity: 'uncommon',
    minFloor: 2,
    maxFloor: 10,
    weight: 1.0,
    roomTags: ['ritual', 'hazard'],
    footprintMask: fnRectMask('M'),
    effects: [{ type: 'trigger', value: 12, note: '접근 시 균열 파동이 발생한다.' }],
    risks: [{ kind: 'hp', value: 8, mode: 'flat' }],
    rewards: [{ kind: 'xp', value: 16, mode: 'flat' }],
    spawnRules: { maxPerFloor: 3, maxPerRoom: 1, requiresOpenArea: true },
    symbol: '◈'
  },
  {
    id: 'world_blood_sarcophagus',
    themeId: '*',
    name: '혈흔 석관',
    size: 'L',
    rarity: 'rare',
    minFloor: 3,
    maxFloor: 10,
    weight: 0.8,
    roomTags: ['treasure', 'ritual'],
    footprintMask: fnRectMask('L'),
    effects: [{ type: 'interact', value: 22, note: '열면 금단 보상이 나오지만 대가를 치른다.' }],
    risks: [{ kind: 'hp', value: 0.18, mode: 'percent' }],
    rewards: [{ kind: 'gold', value: 24, mode: 'flat' }, { kind: 'item', value: 1, itemPool: 'random' }],
    spawnRules: { maxPerFloor: 2, maxPerRoom: 1, requiresOpenArea: true },
    symbol: '▣'
  },
  {
    id: 'world_orrery_core',
    themeId: '*',
    name: '왜곡 성좌핵',
    size: 'XL',
    rarity: 'epic',
    minFloor: 6,
    maxFloor: 10,
    weight: 0.5,
    roomTags: ['ritual', 'hazard'],
    footprintMask: fnRectMask('XL'),
    effects: [{ type: 'pulse', value: 20, radius: 3, note: '주기적으로 중력 파동을 발산한다.' }],
    risks: [{ kind: 'doom', value: 10, mode: 'flat' }, { kind: 'hp', value: 14, mode: 'flat' }],
    rewards: [{ kind: 'xp', value: 36, mode: 'flat' }, { kind: 'str', value: 1, mode: 'flat' }],
    spawnRules: { maxPerFloor: 1, maxPerRoom: 1, requiresOpenArea: true },
    symbol: '◎'
  },
  {
    id: 'world_collapse_heart',
    themeId: '*',
    name: '붕괴 심장핵',
    size: 'XXL',
    rarity: 'mythic',
    minFloor: 9,
    maxFloor: 10,
    weight: 0.22,
    roomTags: ['hazard', 'ritual'],
    footprintMask: fnRectMask('XXL'),
    effects: [{ type: 'stateful', value: 3, note: '해제 단계에 따라 던전 위협 수준이 변한다.' }],
    risks: [{ kind: 'doom', value: 24, mode: 'flat' }, { kind: 'hp', value: 0.25, mode: 'percent' }],
    rewards: [{ kind: 'maxHp', value: 8, mode: 'flat' }, { kind: 'item', value: 1, itemPool: 'random' }, { kind: 'gold', value: 40, mode: 'flat' }],
    spawnRules: { maxPerFloor: 1, maxPerRoom: 1, requiresOpenArea: true },
    symbol: '◉'
  },
  {
    id: 'world_supply_locker',
    themeId: '*',
    name: '비상 보급함',
    size: 'M',
    rarity: 'common',
    minFloor: 1,
    maxFloor: 10,
    weight: 1.15,
    roomTags: ['support', 'treasure'],
    footprintMask: fnRectMask('M'),
    effects: [{ type: 'interact', value: 1, note: '응급물자가 나온다.' }],
    risks: [],
    rewards: [{ kind: 'item', value: 1, itemPool: 'potion' }, { kind: 'gold', value: 10, mode: 'flat' }],
    spawnRules: { maxPerFloor: 3, maxPerRoom: 1, requiresOpenArea: false },
    symbol: '□'
  },
  {
    id: 'ruins_fallen_altar',
    themeId: 'ruins',
    name: '무너진 제단',
    size: 'L',
    rarity: 'rare',
    minFloor: 2,
    maxFloor: 10,
    weight: 1.0,
    roomTags: ['ritual', 'treasure'],
    footprintMask: fnRectMask('L'),
    effects: [{ type: 'interact', value: 32, note: '신앙의 잔향과 거래한다.' }],
    risks: [{ kind: 'doom', value: 12, mode: 'flat' }, { kind: 'hp', value: 10, mode: 'flat' }],
    rewards: [{ kind: 'item', value: 1, itemPool: 'random' }, { kind: 'xp', value: 28, mode: 'flat' }],
    spawnRules: { maxPerFloor: 1, maxPerRoom: 1, requiresOpenArea: true },
    symbol: 'A'
  },
  {
    id: 'deep_sea_pressure_ring',
    themeId: 'deep_sea',
    name: '압력 원환',
    size: 'XL',
    rarity: 'epic',
    minFloor: 5,
    maxFloor: 10,
    weight: 0.62,
    roomTags: ['hazard', 'combat'],
    footprintMask: fnRectMask('XL'),
    effects: [{ type: 'pulse', value: 18, radius: 3, note: '고압 파동이 이동/명중을 교란한다.' }],
    risks: [{ kind: 'hp', value: 12, mode: 'flat' }, { kind: 'doom', value: 8, mode: 'flat' }],
    rewards: [{ kind: 'def', value: 2, mode: 'flat' }, { kind: 'gold', value: 30, mode: 'flat' }],
    spawnRules: { maxPerFloor: 1, maxPerRoom: 1, requiresOpenArea: true },
    symbol: 'O'
  },
  {
    id: 'rlyeh_sealed_heart',
    themeId: 'rlyeh',
    name: '봉인 심장',
    size: 'XXL',
    rarity: 'mythic',
    minFloor: 9,
    maxFloor: 10,
    weight: 0.3,
    roomTags: ['ritual', 'hazard'],
    footprintMask: fnRectMask('XXL'),
    effects: [{ type: 'stateful', value: 3, note: '단계별 개방 시 보스 패턴이 변질된다.' }],
    risks: [{ kind: 'hp', value: 0.28, mode: 'percent' }, { kind: 'doom', value: 20, mode: 'flat' }],
    rewards: [{ kind: 'item', value: 1, itemPool: 'random' }, { kind: 'xp', value: 45, mode: 'flat' }],
    spawnRules: { maxPerFloor: 1, maxPerRoom: 1, requiresOpenArea: true },
    symbol: 'H'
  },
  {
    id: 'machine_turret_core',
    themeId: 'machine_factory',
    name: '자동 포탑 코어',
    size: 'M',
    rarity: 'uncommon',
    minFloor: 3,
    maxFloor: 10,
    weight: 1.0,
    roomTags: ['combat', 'hazard'],
    footprintMask: fnRectMask('M'),
    effects: [{ type: 'aura', value: 10, radius: 2, note: '포격 반경 내 아군/적군 모두 타격된다.' }],
    risks: [{ kind: 'hp', value: 6, mode: 'flat' }],
    rewards: [{ kind: 'str', value: 1, mode: 'flat' }, { kind: 'gold', value: 16, mode: 'flat' }],
    spawnRules: { maxPerFloor: 2, maxPerRoom: 1, requiresOpenArea: false },
    symbol: 'T'
  },
  {
    id: 'fungal_spore_nest',
    themeId: 'fungal_garden',
    name: '포자 둥지',
    size: 'L',
    rarity: 'rare',
    minFloor: 4,
    maxFloor: 10,
    weight: 0.9,
    roomTags: ['hazard', 'ritual'],
    footprintMask: fnRectMask('L'),
    effects: [{ type: 'trigger', value: 14, radius: 2, note: '포자 분출과 함께 돌연이 보상이 나온다.' }],
    risks: [{ kind: 'hp', value: 9, mode: 'flat' }, { kind: 'doom', value: 6, mode: 'flat' }],
    rewards: [{ kind: 'item', value: 1, itemPool: 'potion' }, { kind: 'xp', value: 24, mode: 'flat' }],
    spawnRules: { maxPerFloor: 1, maxPerRoom: 1, requiresOpenArea: true },
    symbol: 'M'
  },
  {
    id: 'clocktower_time_pendulum',
    themeId: 'clocktower',
    name: '시간 진자',
    size: 'XL',
    rarity: 'epic',
    minFloor: 6,
    maxFloor: 10,
    weight: 0.54,
    roomTags: ['ritual', 'combat'],
    footprintMask: fnRectMask('XL'),
    effects: [{ type: 'pulse', value: 16, radius: 3, note: '행동 주기가 흔들리며 순서가 교란된다.' }],
    risks: [{ kind: 'doom', value: 9, mode: 'flat' }],
    rewards: [{ kind: 'xp', value: 34, mode: 'flat' }, { kind: 'def', value: 1, mode: 'flat' }],
    spawnRules: { maxPerFloor: 1, maxPerRoom: 1, requiresOpenArea: true },
    symbol: 'P'
  }
]

export function getScaledObjectById (id: string): ScaledObjectDef | undefined {
  return OBJECTS.find(obj => obj.id === id)
}

export function objectBudgetForFloor (floor: number, rng: () => number = Math.random): number {
  if (floor <= 3) return 4 + Math.floor(rng() * 3) // 4-6
  if (floor <= 7) return 7 + Math.floor(rng() * 4) // 7-10
  return 10 + Math.floor(rng() * 5) // 10-14
}

export function objectCost (size: ObjectScaleSize): number {
  return OBJECT_SIZE_COST[size]
}

function weightedPick<T> (items: readonly T[], weightFn: (item: T) => number, rng: () => number): T | null {
  let total = 0
  for (const item of items) total += Math.max(0, weightFn(item))
  if (total <= 0) return null
  let threshold = rng() * total
  for (const item of items) {
    threshold -= Math.max(0, weightFn(item))
    if (threshold <= 0) return item
  }
  return items.length > 0 ? items[items.length - 1] : null
}

function themePool (themeId: string): readonly ScaledObjectDef[] {
  return OBJECTS.filter(obj => obj.themeId === '*' || obj.themeId === themeId)
}

function themeSizeMultiplier (floor: number, size: ObjectScaleSize): number {
  if (floor <= 2) return size === 'S' || size === 'M' ? 1.2 : 0.2
  if (floor <= 5) return size === 'L' ? 1.15 : size === 'XL' ? 0.7 : size === 'XXL' ? 0.12 : 1.0
  if (floor <= 8) return size === 'XL' ? 1.1 : size === 'XXL' ? 0.5 : 0.95
  return size === 'XXL' ? 1.15 : 0.92
}

export function pickRoomIdentity (floor: number, themeId: string, rng: () => number = Math.random): RoomIdentity {
  const bias: Readonly<Record<RoomIdentity, number>> = {
    altar: themeId === 'rlyeh' || themeId === 'ruins' ? 1.3 : 1.0,
    collapse: floor >= 8 ? 1.35 : 1.0,
    purge: themeId === 'machine_factory' || themeId === 'lava' ? 1.25 : 1.0,
    quarantine: themeId === 'deep_sea' || themeId === 'mutation_lab' ? 1.2 : 1.0,
    supply: floor <= 3 ? 1.25 : 1.0
  }
  const ids: readonly RoomIdentity[] = ['altar', 'collapse', 'purge', 'quarantine', 'supply']
  const picked = weightedPick(ids, id => bias[id], rng)
  return picked ?? 'supply'
}

export interface SelectScaledObjectContext {
  floor: number
  themeId: string
  roomIdentities: readonly RoomIdentity[]
  rng?: () => number
}

export function selectScaledObjectsForFloor (ctx: SelectScaledObjectContext): ScaledObjectDef[] {
  const rng = ctx.rng ?? Math.random
  let budget = objectBudgetForFloor(ctx.floor, rng)
  const pool = themePool(ctx.themeId).filter(obj => ctx.floor >= obj.minFloor && ctx.floor <= obj.maxFloor)

  const selected: ScaledObjectDef[] = []
  const pickedById = new Map<string, number>()
  let xxlCount = 0
  let mythicCount = 0
  let sameRarityStreak = 0
  let lastRarity: ObjectRarity | null = null

  for (let guard = 0; guard < 80 && budget > 0; guard++) {
    const candidates = pool.filter(obj => {
      const cost = objectCost(obj.size)
      if (cost > budget) return false
      const already = pickedById.get(obj.id) ?? 0
      if (already >= obj.spawnRules.maxPerFloor) return false
      if (obj.size === 'XXL' && xxlCount >= 1) return false
      if (obj.rarity === 'mythic' && mythicCount >= 1) return false
      if (lastRarity === obj.rarity && sameRarityStreak >= 2) return false
      return true
    })
    if (candidates.length === 0) break

    const picked = weightedPick(candidates, obj => {
      const rarityWeight = RARITY_WEIGHT[obj.rarity]
      const baseWeight = obj.weight
      const sizeWeight = themeSizeMultiplier(ctx.floor, obj.size)
      const identityHits = ctx.roomIdentities.filter(id => {
        const preferredTags = IDENTITY_WEIGHT[id]
        return obj.roomTags.some(tag => preferredTags.includes(tag))
      }).length
      const identityMultiplier = 1 + identityHits * 0.16
      return baseWeight * rarityWeight * sizeWeight * identityMultiplier
    }, rng)

    if (picked === null) break

    selected.push(picked)
    budget -= objectCost(picked.size)
    pickedById.set(picked.id, (pickedById.get(picked.id) ?? 0) + 1)
    if (picked.size === 'XXL') xxlCount += 1
    if (picked.rarity === 'mythic') mythicCount += 1
    if (lastRarity === picked.rarity) sameRarityStreak += 1
    else sameRarityStreak = 1
    lastRarity = picked.rarity
  }

  return selected
}
