export type FloorBand = 'early' | 'mid' | 'late' | 'finale'

export type RoomRole = 'safe' | 'combat' | 'reward' | 'hazard' | 'event' | 'setpiece' | 'rest'

export type RoomArchetypeId =
  | 'l_ambush'
  | 'u_bait'
  | 'crossroads'
  | 'donut_ring'
  | 'multi_corridor'
  | 'cathedral_hall'
  | 'branch_hub'
  | 'mirror_chamber'
  | 'collapsing_cell'
  | 'locked_vault'
  | 'flooded_or_lava'
  | 'hidden_annex'

export type TileEffectId =
  | 'cracked_floor'
  | 'spike_tile'
  | 'mud_tile'
  | 'ice_tile'
  | 'lava_tile'
  | 'polluted_water'
  | 'healing_fountain'
  | 'cursed_altar'
  | 'rune_portal'
  | 'burst_rune'
  | 'cover_tile'
  | 'breakable_pillar'
  | 'locked_door'
  | 'pressure_plate'
  | 'dark_tile'
  | 'echo_tile'

export type TileEffectRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'mythic'
export type TileEffectTrigger = 'on_enter' | 'on_turn' | 'on_interact' | 'passive'

export interface RoomArchetypeDef {
  id: RoomArchetypeId
  name: string
  summary: string
  minSize: { w: number, h: number }
  floorRange: { min: number, max: number }
  roleBias: Partial<Record<RoomRole, number>>
  weightByBand: Partial<Record<FloorBand, number>>
  risk: number // 1-5
  reward: number // 1-5
  supportsLargeObjects: boolean
}

export interface TileEffectDef {
  id: TileEffectId
  name: string
  rarity: TileEffectRarity
  trigger: TileEffectTrigger
  floorRange: { min: number, max: number }
  risk: number // 1-5
  reward: number // 1-5
  budgetCost: number
  symbol: string
  color: string
  tags: readonly RoomRole[]
  desc: string
}

export interface FloorPacingProfile {
  safe: number
  hazard: number
  event: number
  setpiece: number
}

export interface TileBudgetProfile {
  normal: [number, number]
  hazard: [number, number]
  setpiece: [number, number]
}

export interface RoomSelectionContext {
  floor: number
  roomCount: number
  rng?: () => number
}

export interface TileSelectionContext {
  floor: number
  themeId: string
  role: RoomRole
  budget: number
  desiredCount: number
  rng?: () => number
}

const FALLBACK_PACING: FloorPacingProfile = {
  safe: 0.35,
  hazard: 0.35,
  event: 0.2,
  setpiece: 0.1
}

export const FLOOR_PACING: ReadonlyArray<{ min: number, max: number, profile: FloorPacingProfile }> = [
  { min: 1, max: 2, profile: { safe: 0.6, hazard: 0.2, event: 0.2, setpiece: 0.0 } },
  { min: 3, max: 5, profile: { safe: 0.35, hazard: 0.4, event: 0.25, setpiece: 0.0 } },
  { min: 6, max: 8, profile: { safe: 0.25, hazard: 0.5, event: 0.25, setpiece: 0.25 } },
  { min: 9, max: 9, profile: { safe: 0.15, hazard: 0.55, event: 0.15, setpiece: 0.35 } },
  { min: 10, max: 10, profile: { safe: 0.0, hazard: 0.2, event: 0.2, setpiece: 0.6 } }
]

export const TILE_BUDGET: TileBudgetProfile = {
  normal: [1, 2],
  hazard: [2, 4],
  setpiece: [5, 7]
}

export const HIDDEN_ROOM_CHANCE: [number, number] = [0.2, 0.35]

export const ROOM_ARCHETYPES: readonly RoomArchetypeDef[] = [
  {
    id: 'l_ambush',
    name: 'L자 매복방',
    summary: '사각 시야를 이용한 근접 매복 중심',
    minSize: { w: 7, h: 7 },
    floorRange: { min: 1, max: 10 },
    roleBias: { combat: 1.3, hazard: 1.1 },
    weightByBand: { early: 1.2, mid: 1.1, late: 0.9 },
    risk: 2,
    reward: 2,
    supportsLargeObjects: false
  },
  {
    id: 'u_bait',
    name: 'U자 미끼방',
    summary: '중앙 보상과 양측 포위 구도',
    minSize: { w: 8, h: 7 },
    floorRange: { min: 1, max: 10 },
    roleBias: { reward: 1.3, hazard: 1.2 },
    weightByBand: { early: 1.1, mid: 1.0, late: 0.9 },
    risk: 2,
    reward: 3,
    supportsLargeObjects: false
  },
  {
    id: 'crossroads',
    name: '십자 교차방',
    summary: '다방향 유입 전투, 기동 중심',
    minSize: { w: 8, h: 8 },
    floorRange: { min: 2, max: 10 },
    roleBias: { combat: 1.25, event: 1.05 },
    weightByBand: { early: 1.0, mid: 1.2, late: 1.0 },
    risk: 3,
    reward: 2,
    supportsLargeObjects: false
  },
  {
    id: 'donut_ring',
    name: '도넛 링방',
    summary: '중앙 막힘, 링 동선으로 원거리 유리',
    minSize: { w: 9, h: 9 },
    floorRange: { min: 3, max: 10 },
    roleBias: { combat: 1.1, hazard: 1.2 },
    weightByBand: { mid: 1.1, late: 1.2 },
    risk: 3,
    reward: 3,
    supportsLargeObjects: true
  },
  {
    id: 'multi_corridor',
    name: '다층 복도방',
    summary: '좁은 라인 연속, 함정 밀도 높음',
    minSize: { w: 10, h: 8 },
    floorRange: { min: 3, max: 10 },
    roleBias: { hazard: 1.5, combat: 1.1 },
    weightByBand: { mid: 1.1, late: 1.25, finale: 1.2 },
    risk: 4,
    reward: 2,
    supportsLargeObjects: false
  },
  {
    id: 'cathedral_hall',
    name: '대성당 홀',
    summary: '광역 전투/엘리트 배치에 특화된 대공간',
    minSize: { w: 12, h: 10 },
    floorRange: { min: 4, max: 10 },
    roleBias: { setpiece: 1.5, combat: 1.2 },
    weightByBand: { late: 1.2, finale: 1.25 },
    risk: 4,
    reward: 4,
    supportsLargeObjects: true
  },
  {
    id: 'branch_hub',
    name: '분기 허브',
    summary: '3-4갈래 선택 루트 제공',
    minSize: { w: 9, h: 9 },
    floorRange: { min: 1, max: 10 },
    roleBias: { event: 1.3, safe: 1.2 },
    weightByBand: { early: 1.15, mid: 1.0, late: 0.85 },
    risk: 1,
    reward: 2,
    supportsLargeObjects: false
  },
  {
    id: 'mirror_chamber',
    name: '미러 챔버',
    summary: '좌우 대칭 함정/보상 페이크',
    minSize: { w: 8, h: 8 },
    floorRange: { min: 2, max: 10 },
    roleBias: { event: 1.2, hazard: 1.1 },
    weightByBand: { mid: 1.2, late: 1.0 },
    risk: 2,
    reward: 3,
    supportsLargeObjects: false
  },
  {
    id: 'collapsing_cell',
    name: '붕괴방',
    summary: '턴 경과 시 이동 가능한 영역 축소',
    minSize: { w: 9, h: 8 },
    floorRange: { min: 5, max: 10 },
    roleBias: { hazard: 1.5, setpiece: 1.2 },
    weightByBand: { late: 1.2, finale: 1.3 },
    risk: 5,
    reward: 3,
    supportsLargeObjects: true
  },
  {
    id: 'locked_vault',
    name: '잠긴 금고방',
    summary: '키/레버로 접근하는 고보상 방',
    minSize: { w: 9, h: 8 },
    floorRange: { min: 4, max: 10 },
    roleBias: { reward: 1.6, event: 1.2 },
    weightByBand: { mid: 1.0, late: 1.1, finale: 1.2 },
    risk: 3,
    reward: 5,
    supportsLargeObjects: true
  },
  {
    id: 'flooded_or_lava',
    name: '수몰/용암방',
    summary: '이동 페널티 또는 지속 피해 지형 중심',
    minSize: { w: 8, h: 8 },
    floorRange: { min: 3, max: 10 },
    roleBias: { hazard: 1.4, combat: 1.1 },
    weightByBand: { mid: 1.0, late: 1.25, finale: 1.2 },
    risk: 4,
    reward: 2,
    supportsLargeObjects: true
  },
  {
    id: 'hidden_annex',
    name: '숨은 부속방',
    summary: '이벤트/벽 파괴로만 접근 가능한 비밀 공간',
    minSize: { w: 6, h: 6 },
    floorRange: { min: 2, max: 10 },
    roleBias: { reward: 1.35, event: 1.2 },
    weightByBand: { early: 0.7, mid: 1.0, late: 1.1 },
    risk: 2,
    reward: 4,
    supportsLargeObjects: false
  }
]

export const TILE_EFFECTS: readonly TileEffectDef[] = [
  { id: 'cracked_floor', name: '균열 바닥', rarity: 'common', trigger: 'on_enter', floorRange: { min: 1, max: 10 }, risk: 1, reward: 0, budgetCost: 1, symbol: '≈', color: 'gray', tags: ['hazard'], desc: '낮은 확률로 미끄러져 한 칸 오차 이동' },
  { id: 'spike_tile', name: '가시 타일', rarity: 'common', trigger: 'on_enter', floorRange: { min: 1, max: 10 }, risk: 2, reward: 0, budgetCost: 1, symbol: '†', color: 'red', tags: ['hazard', 'combat'], desc: '진입 시 고정 피해' },
  { id: 'mud_tile', name: '늪/진흙', rarity: 'common', trigger: 'on_enter', floorRange: { min: 1, max: 10 }, risk: 2, reward: 0, budgetCost: 1, symbol: ';', color: 'darkGreen', tags: ['hazard'], desc: '이동 후 턴 지연 증가' },
  { id: 'ice_tile', name: '빙판', rarity: 'uncommon', trigger: 'on_enter', floorRange: { min: 2, max: 10 }, risk: 2, reward: 1, budgetCost: 2, symbol: '*', color: 'cyan', tags: ['hazard', 'event'], desc: '직진 미끄러짐' },
  { id: 'lava_tile', name: '용암', rarity: 'rare', trigger: 'on_turn', floorRange: { min: 4, max: 10 }, risk: 4, reward: 0, budgetCost: 3, symbol: '~', color: 'red', tags: ['hazard', 'setpiece'], desc: '위에 서있으면 지속 피해' },
  { id: 'polluted_water', name: '오염수', rarity: 'uncommon', trigger: 'on_turn', floorRange: { min: 3, max: 10 }, risk: 3, reward: 0, budgetCost: 2, symbol: 'w', color: 'darkCyan', tags: ['hazard'], desc: '턴당 약독 디버프 누적' },
  { id: 'healing_fountain', name: '치유 샘', rarity: 'uncommon', trigger: 'on_interact', floorRange: { min: 1, max: 10 }, risk: 0, reward: 3, budgetCost: 2, symbol: '✦', color: 'green', tags: ['safe', 'reward', 'rest'], desc: '1회 회복 후 비활성' },
  { id: 'cursed_altar', name: '저주 제단', rarity: 'rare', trigger: 'on_interact', floorRange: { min: 2, max: 10 }, risk: 4, reward: 4, budgetCost: 4, symbol: 'Ω', color: 'magenta', tags: ['hazard', 'reward', 'event'], desc: '강보상과 디버프 동시 발생' },
  { id: 'rune_portal', name: '룬 포탈', rarity: 'rare', trigger: 'on_interact', floorRange: { min: 4, max: 10 }, risk: 2, reward: 3, budgetCost: 3, symbol: '◉', color: 'blue', tags: ['event', 'setpiece'], desc: '단거리 순간이동, 전투 지형 재배치' },
  { id: 'burst_rune', name: '파열 룬', rarity: 'uncommon', trigger: 'on_enter', floorRange: { min: 3, max: 10 }, risk: 3, reward: 1, budgetCost: 2, symbol: '¤', color: 'yellow', tags: ['hazard', 'combat'], desc: '밟으면 폭발' },
  { id: 'cover_tile', name: '엄폐물', rarity: 'common', trigger: 'passive', floorRange: { min: 1, max: 10 }, risk: 0, reward: 2, budgetCost: 1, symbol: '▣', color: 'gray', tags: ['combat', 'safe'], desc: '원거리 피해 감소' },
  { id: 'breakable_pillar', name: '파괴 기둥', rarity: 'uncommon', trigger: 'on_interact', floorRange: { min: 2, max: 10 }, risk: 1, reward: 2, budgetCost: 2, symbol: 'Π', color: 'darkYellow', tags: ['combat', 'event'], desc: '파괴 시 시야선/동선 변경' },
  { id: 'locked_door', name: '잠금문', rarity: 'rare', trigger: 'on_interact', floorRange: { min: 3, max: 10 }, risk: 2, reward: 4, budgetCost: 3, symbol: '⌂', color: 'yellow', tags: ['reward', 'event', 'setpiece'], desc: '키/레버가 있어야 개방' },
  { id: 'pressure_plate', name: '압력판', rarity: 'uncommon', trigger: 'on_enter', floorRange: { min: 2, max: 10 }, risk: 2, reward: 2, budgetCost: 2, symbol: '⊙', color: 'darkYellow', tags: ['event', 'hazard'], desc: '문 개폐 또는 함정 연동' },
  { id: 'dark_tile', name: '암흑 타일', rarity: 'epic', trigger: 'passive', floorRange: { min: 6, max: 10 }, risk: 4, reward: 1, budgetCost: 4, symbol: '■', color: 'darkMagenta', tags: ['hazard', 'setpiece'], desc: '시야 반경 감소' },
  { id: 'echo_tile', name: '메아리 타일', rarity: 'epic', trigger: 'on_turn', floorRange: { min: 5, max: 10 }, risk: 4, reward: 2, budgetCost: 4, symbol: ')))', color: 'darkCyan', tags: ['hazard', 'event', 'setpiece'], desc: '소음 축적 시 증원 확률 증가' }
]

export const THEME_TILE_PRIORITIES: Readonly<Record<string, readonly TileEffectId[]>> = {
  ruins: ['locked_door', 'pressure_plate', 'breakable_pillar', 'cursed_altar'],
  deep_sea: ['polluted_water', 'mud_tile', 'rune_portal', 'echo_tile'],
  rlyeh: ['dark_tile', 'rune_portal', 'cursed_altar', 'echo_tile'],
  lava: ['lava_tile', 'burst_rune', 'cracked_floor'],
  ice: ['ice_tile', 'cracked_floor', 'cover_tile'],
  swamp: ['mud_tile', 'polluted_water', 'spike_tile'],
  clocktower: ['pressure_plate', 'rune_portal', 'echo_tile'],
  machine_factory: ['breakable_pillar', 'cover_tile', 'burst_rune'],
  bunker: ['cover_tile', 'locked_door', 'pressure_plate']
}

function floorBand (floor: number): FloorBand {
  if (floor <= 3) return 'early'
  if (floor <= 6) return 'mid'
  if (floor <= 9) return 'late'
  return 'finale'
}

function randomInRange ([min, max]: [number, number], rng: () => number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

function weightedPick<T> (items: T[], weightOf: (item: T) => number, rng: () => number): T | null {
  let total = 0
  for (const item of items) {
    total += Math.max(0, weightOf(item))
  }
  if (total <= 0) return null
  let threshold = rng() * total
  for (const item of items) {
    threshold -= Math.max(0, weightOf(item))
    if (threshold <= 0) return item
  }
  return items.length > 0 ? items[items.length - 1] : null
}

export function getPacingForFloor (floor: number): FloorPacingProfile {
  const row = FLOOR_PACING.find(cfg => floor >= cfg.min && floor <= cfg.max)
  return row !== undefined ? row.profile : FALLBACK_PACING
}

export function tileBudgetForRole (role: RoomRole, rng: () => number = Math.random): number {
  if (role === 'setpiece') return randomInRange(TILE_BUDGET.setpiece, rng)
  if (role === 'hazard' || role === 'combat') return randomInRange(TILE_BUDGET.hazard, rng)
  return randomInRange(TILE_BUDGET.normal, rng)
}

export function hiddenRoomChanceForFloor (floor: number): number {
  const clamped = Math.max(1, Math.min(10, floor))
  const progress = (clamped - 1) / 9
  return HIDDEN_ROOM_CHANCE[0] + (HIDDEN_ROOM_CHANCE[1] - HIDDEN_ROOM_CHANCE[0]) * progress
}

export function pickRoomRoleForFloor (floor: number, rng: () => number = Math.random): RoomRole {
  const pacing = getPacingForFloor(floor)
  const roll = rng()
  if (roll < pacing.safe) return 'safe'
  if (roll < pacing.safe + pacing.hazard) return 'hazard'
  if (roll < pacing.safe + pacing.hazard + pacing.event) return 'event'
  if (roll < pacing.safe + pacing.hazard + pacing.event + pacing.setpiece) return 'setpiece'
  return 'combat'
}

export function selectRoomArchetypes (ctx: RoomSelectionContext): RoomArchetypeDef[] {
  const rng = ctx.rng ?? Math.random
  const band = floorBand(ctx.floor)
  const out: RoomArchetypeDef[] = []
  let prevId: RoomArchetypeId | null = null

  const candidates = ROOM_ARCHETYPES.filter(def => ctx.floor >= def.floorRange.min && ctx.floor <= def.floorRange.max)
  if (candidates.length === 0) return out

  for (let i = 0; i < ctx.roomCount; i++) {
    const role = pickRoomRoleForFloor(ctx.floor, rng)
    const picked = weightedPick(candidates, def => {
      const bandWeight = def.weightByBand[band] ?? 0.6
      const roleWeight = def.roleBias[role] ?? 1.0
      const repeatPenalty = prevId === def.id ? 0.45 : 1.0
      return bandWeight * roleWeight * repeatPenalty
    }, rng)

    if (picked === null) break
    out.push(picked)
    prevId = picked.id
  }

  return out
}

export function selectTileEffectsForRoom (ctx: TileSelectionContext): TileEffectDef[] {
  const rng = ctx.rng ?? Math.random
  const priorities = new Set(THEME_TILE_PRIORITIES[ctx.themeId] ?? [])

  const candidates = TILE_EFFECTS.filter(def =>
    ctx.floor >= def.floorRange.min &&
    ctx.floor <= def.floorRange.max &&
    def.budgetCost <= ctx.budget
  )

  const selected: TileEffectDef[] = []
  let budgetLeft = ctx.budget

  while (selected.length < ctx.desiredCount && budgetLeft > 0) {
    const pool = candidates.filter(def =>
      def.budgetCost <= budgetLeft &&
      !selected.some(s => s.id === def.id)
    )
    if (pool.length === 0) break

    const picked = weightedPick(pool, def => {
      const themeBias = priorities.has(def.id) ? 1.6 : 1.0
      const roleBias = def.tags.includes(ctx.role) ? 1.35 : 1.0
      const rarityBias = def.rarity === 'common'
        ? 1.4
        : def.rarity === 'uncommon'
          ? 1.1
          : def.rarity === 'rare'
            ? 0.85
            : def.rarity === 'epic'
              ? 0.55
              : 0.2
      return themeBias * roleBias * rarityBias
    }, rng)

    if (picked === null) break
    selected.push(picked)
    budgetLeft -= picked.budgetCost
  }

  return selected
}
