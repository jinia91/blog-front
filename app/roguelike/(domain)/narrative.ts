import {
  type FloorTheme,
  type GameState,
  type NarrativeMetricEvent,
  type RunNarrativeState
} from './model'

type OmenSymptomType = 'hp_drain' | 'tempo_slow' | 'omen_spawn' | 'enemy_haste'

interface ThemeOmenFlavor {
  intro: string[]
  reinforcement: string[]
  collapse: string[]
  reaperArrival: string[]
  reaperShadow: string[]
  symptoms: Record<OmenSymptomType, string[]>
}

interface SequenceRoute {
  tag: string
  path: string[]
}

interface MarkSetRecipe {
  id: string
  requiredMarks: string[]
}

interface RelationInfluence {
  supportWeight: number
  ambushWeight: number
  shopPriceMultiplier: number
  lootModifier: number
}

const DEFAULT_OMEN_FLAVOR: ThemeOmenFlavor = {
  intro: [
    '공기가 눅눅해지며 숨이 짧아진다.',
    '멀리서 장송곡 같은 진동이 천천히 다가온다.',
    '횃불의 불꽃이 바람 없이 한쪽으로만 기울어진다.',
    '바닥의 먼지가 보이지 않는 맥박에 맞춰 떨린다.',
    '누군가 이름을 부르는 환청이 벽 사이를 스친다.',
    '발밑의 돌이 심장처럼 미세하게 수축한다.',
    '온기가 빠져나가며 손끝이 납처럼 무거워진다.',
    '천장의 균열에서 검은 입김 같은 기운이 흘러내린다.',
    '빛의 경계가 흐려지고 그림자 윤곽이 두꺼워진다.',
    '벽면의 문양이 방금 움직인 듯한 잔상을 남긴다.',
    '먼 곳에서 쇠사슬이 끌리는 소리가 세 번 울린다.',
    '피부 아래로 찬 바람이 기어오르는 감각이 돈다.'
  ],
  reinforcement: [
    '검은 틈새가 벌어지며 수색대가 몰려든다.',
    '무너진 벽 너머에서 새로운 발소리가 겹친다.',
    '봉인선이 끊기며 대기 중이던 추격대가 밀려든다.',
    '바닥의 금이 입처럼 벌어지고 적들이 토해진다.',
    '낡은 문짝이 저절로 열리며 증원병이 나타난다.',
    '천장의 그늘이 뭉쳐 형체를 만들고 달려든다.',
    '비명 같은 경보가 울리자 사냥꾼들이 집결했다.',
    '복도 끝 횃불이 모두 켜지며 매복이 드러난다.',
    '핏빛 인장이 깜빡이자 추종자 무리가 소환된다.',
    '지면이 꺼지며 숨어 있던 포식자들이 떠오른다.',
    '금속 셔터가 열리고 대기조가 쏟아져 들어온다.'
  ],
  collapse: [
    '벽돌과 비명이 함께 가라앉으며 회랑이 통째로 붕괴한다.',
    '계단 방을 제외한 공간이 어둠으로 찢겨나간다.',
    '기둥들이 한 박자 늦게 무너지며 탈출로가 사라진다.',
    '천장의 문양이 깨져 내리며 통로가 먼지에 잠긴다.',
    '돌바닥이 갈라져 바닥 없는 구멍으로 침식된다.',
    '벽면 전체가 안쪽으로 접히듯 구겨져 길을 삼킨다.',
    '문과 창문이 동시에 뒤틀리며 방들이 납작해진다.',
    '무게를 잃은 파편이 떠오르다 한꺼번에 추락한다.',
    '복도 끝이 검은막에 닿는 순간, 구역째로 소거된다.',
    '경첩이 찢어지는 소리와 함께 출입구가 붕괴한다.',
    '공간이 비명을 지르며 계단만 남기고 꺼져버린다.'
  ],
  reaperArrival: [
    '금속이 바닥을 긁는 소리와 함께 사신이 낫을 끌고 나타난다.',
    '사신의 눈동자가 어둠 속에서 천천히 당신을 고정한다.',
    '냉기가 숨통을 조이며 검은 망토가 문턱을 넘는다.',
    '사신의 발밑에서 불꽃이 꺼지며 그림자만 남는다.',
    '낫날이 벽을 스치자 돌이 종잇장처럼 갈라진다.',
    '종소리도 없이 조용히, 죽음의 집행자가 계단 앞을 막는다.',
    '사신이 고개를 드는 순간 공기가 칼날처럼 날카로워진다.',
    '검은 피막이 찢기고 낫을 든 형체가 걸어 나온다.',
    '피안의 문이 열리며 사신이 무표정하게 나타난다.',
    '눈꺼풀을 깜빡인 사이, 사신이 이미 사거리 안에 들어왔다.',
    '낡은 장송곡의 마지막 박자와 함께 사신이 강림한다.'
  ],
  reaperShadow: [
    '사신의 그림자가 먼저 도착했다.',
    '빛보다 먼저 검은 형상이 발밑에 닿는다.',
    '벽면에 드리운 낫의 실루엣이 천천히 자라난다.',
    '숨결이 하얗게 얼며 등 뒤로 긴 그림자가 겹친다.',
    '발소리 없이 그림자만 미끄러지듯 다가온다.',
    '횃불이 꺼졌다 켜지는 찰나, 그림자가 한 칸 가까워졌다.',
    '바닥의 검은 얼룩이 낫 모양으로 갈라진다.',
    '당신의 그림자가 아닌 또 하나가 발끝에 포개진다.',
    '벽에 걸린 그림자 목이 비정상적으로 길어진다.',
    '공기의 결이 찢어지며 사신의 그림자가 번진다.'
  ],
  symptoms: {
    hp_drain: [
      '심장에 냉기가 스며든다.',
      '가슴을 움켜쥔 듯 맥박이 한 번 건너뛴다.',
      '핏줄에서 열기가 빠져나간다.',
      '상처 주변이 창백해지며 힘이 빠진다.',
      '숨을 들이쉴 때마다 폐가 얼음처럼 아프다.',
      '눈앞이 잠깐 어두워지며 생기가 훑겨 나간다.'
    ],
    tempo_slow: [
      '시간이 한 박자 늦게 흐르며 손끝이 무뎌진다.',
      '발을 내딛는 순간 바닥이 끈적하게 붙잡는다.',
      '무기의 궤적이 물속처럼 둔하게 느려진다.',
      '몸이 명령보다 느리게 반응한다.',
      '관절에 모래가 낀 듯 움직임이 끊긴다.',
      '눈앞 풍경이 끈적하게 늘어지며 속도를 삼킨다.'
    ],
    omen_spawn: [
      '균열의 상처에서 무언가 기어 나온다.',
      '문양 틈새에서 형체가 찢겨 나오듯 태어난다.',
      '허공이 구겨지며 새로운 적이 밀려든다.',
      '그림자 덩어리가 살점을 얻어 일어선다.',
      '균열 속 울음과 함께 사냥감이 배출된다.',
      '닫힌 문 뒤에서 존재가 갑자기 나타난다.'
    ],
    enemy_haste: [
      '적들이 보이지 않는 북소리에 맞춰 발을 맞춘다.',
      '적의 시선이 동시에 번뜩이며 돌진한다.',
      '적들의 동작이 갑자기 유기적으로 빨라진다.',
      '어딘가의 지휘 신호에 맞춰 적이 가속한다.',
      '적이 숨 고르기 없이 연속 공격 태세에 들어간다.',
      '살기의 파동이 적의 보폭을 밀어 올린다.'
    ]
  }
}

const THEME_OMEN_FLAVOR: Record<string, Partial<ThemeOmenFlavor>> = {
  ruins: {
    intro: ['무너진 기둥 사이로 오래된 속삭임이 새어나온다.'],
    reinforcement: ['잔해 아래 숨어 있던 망령들이 들끓기 시작한다.']
  },
  deep_sea: {
    intro: ['압력이 귀 안쪽을 눌러오고, 바닷물의 맥박이 벽을 친다.'],
    symptoms: {
      hp_drain: ['폐 깊숙이 짠물이 차오르는 환영이 밀려온다.'],
      tempo_slow: ['수압이 팔다리를 누르며 움직임이 둔해진다.'],
      omen_spawn: ['검은 포말이 응축되어 형체를 얻는다.'],
      enemy_haste: ['심해의 조류가 적들을 앞으로 떠민다.']
    }
  },
  rlyeh: {
    intro: ['비유클리드 각도가 접히며, 당신의 그림자가 늦게 반응한다.'],
    collapse: ['르뤼에의 기하가 접혀 사라지고, 살아남은 공간만 뾰족하게 남는다.'],
    reaperArrival: ['신전의 균열이 눈꺼풀처럼 열리고, 사신이 그 틈에서 내려온다.']
  },
  void_library: {
    intro: ['책장 사이 글자가 뜯겨 나와 공중에 검은 비처럼 흩어진다.'],
    symptoms: {
      hp_drain: ['지식의 대가가 피로 회수된다.'],
      tempo_slow: ['문장 사이 여백에 시간이 걸려 넘어진다.'],
      omen_spawn: ['금서의 여백에서 오탈자가 육신을 얻는다.'],
      enemy_haste: ['광신도들이 같은 문장을 합창하며 돌진한다.']
    }
  },
  lava: {
    intro: ['마그마의 맥동이 심장 박동과 겹치며 불길한 리듬을 만든다.'],
    collapse: ['용암맥이 터지며 회랑이 붉은 균열 아래로 꺼진다.']
  },
  ice: {
    intro: ['서리 낀 숨결이 가면처럼 얼굴에 달라붙는다.'],
    symptoms: {
      hp_drain: ['핏줄이 얼어붙는 듯한 고통이 스친다.'],
      tempo_slow: ['관절 사이로 성에가 끼며 반응이 늦어진다.'],
      omen_spawn: ['얼음 균열에서 서늘한 형체가 기어 나온다.'],
      enemy_haste: ['냉기의 칼날바람이 적들의 등을 떠민다.']
    }
  },
  crypt: {
    intro: ['묘비 아래에서 누군가 손가락으로 덮개를 긁고 있다.'],
    reaperArrival: ['관 뚜껑이 천천히 열리며 사신이 장송을 이끈다.']
  }
}

const SEQUENCE_ROUTES: SequenceRoute[] = [
  { tag: 'sunk_prophecy', path: ['ruins', 'deep_sea', 'rlyeh'] },
  { tag: 'rot_covenant', path: ['forest', 'swamp', 'crypt'] },
  { tag: 'iron_protocol', path: ['machine_factory', 'bunker', 'cyber_server'] },
  { tag: 'frozen_time', path: ['ice', 'clocktower', 'void_library'] },
  { tag: 'furnace_oath', path: ['lava', 'fuel_mine', 'iron_fortress'] },
  { tag: 'abyssal_call', path: ['sunken_temple', 'eldritch_depths', 'rlyeh'] }
]

const MARK_SET_RECIPES: MarkSetRecipe[] = [
  { id: 'set_sunk_prophecy', requiredMarks: ['ruins', 'deep_sea', 'rlyeh'] },
  { id: 'set_rot_covenant', requiredMarks: ['forest', 'swamp', 'crypt'] },
  { id: 'set_iron_protocol', requiredMarks: ['machine_factory', 'bunker', 'cyber_server'] },
  { id: 'set_frozen_time', requiredMarks: ['ice', 'clocktower', 'void_library'] },
  { id: 'set_furnace_oath', requiredMarks: ['lava', 'fuel_mine', 'iron_fortress'] },
  { id: 'set_abyssal_call', requiredMarks: ['sunken_temple', 'eldritch_depths', 'rlyeh'] }
]

function pickLine (lines: string[], fallback: string): string {
  if (lines.length === 0) return fallback
  return lines[Math.floor(Math.random() * lines.length)]
}

function pickLineNoRepeat (lines: string[], fallback: string, recent: string[]): string {
  if (lines.length === 0) return fallback
  const usable = lines.filter(line => !recent.includes(line))
  if (usable.length > 0) return usable[Math.floor(Math.random() * usable.length)]
  return pickLine(lines, fallback)
}

function clamp (v: number, min: number, max: number): number {
  if (v < min) return min
  if (v > max) return max
  return v
}

function endsWithRoute (history: string[], route: string[]): boolean {
  if (history.length < route.length) return false
  const offset = history.length - route.length
  for (let i = 0; i < route.length; i++) {
    if (history[offset + i] !== route[i]) return false
  }
  return true
}

function resolveFlavor (themeId: string): ThemeOmenFlavor {
  const custom = THEME_OMEN_FLAVOR[themeId]
  if (custom === undefined) return DEFAULT_OMEN_FLAVOR
  const mergeLines = (preferred: string[] | undefined, fallback: string[]): string[] => {
    if (preferred === undefined || preferred.length === 0) return fallback
    return [...preferred, ...fallback]
  }
  return {
    intro: mergeLines(custom.intro, DEFAULT_OMEN_FLAVOR.intro),
    reinforcement: mergeLines(custom.reinforcement, DEFAULT_OMEN_FLAVOR.reinforcement),
    collapse: mergeLines(custom.collapse, DEFAULT_OMEN_FLAVOR.collapse),
    reaperArrival: mergeLines(custom.reaperArrival, DEFAULT_OMEN_FLAVOR.reaperArrival),
    reaperShadow: mergeLines(custom.reaperShadow, DEFAULT_OMEN_FLAVOR.reaperShadow),
    symptoms: {
      hp_drain: mergeLines(custom.symptoms?.hp_drain, DEFAULT_OMEN_FLAVOR.symptoms.hp_drain),
      tempo_slow: mergeLines(custom.symptoms?.tempo_slow, DEFAULT_OMEN_FLAVOR.symptoms.tempo_slow),
      omen_spawn: mergeLines(custom.symptoms?.omen_spawn, DEFAULT_OMEN_FLAVOR.symptoms.omen_spawn),
      enemy_haste: mergeLines(custom.symptoms?.enemy_haste, DEFAULT_OMEN_FLAVOR.symptoms.enemy_haste)
    }
  }
}

export function getOmenStage (turns: number): 0 | 1 | 2 | 3 | 4 {
  if (turns >= 500) return 4
  if (turns >= 480) return 3
  if (turns >= 450) return 2
  if (turns >= 400) return 1
  return 0
}

export function doomCountdownLine (turns: number): string {
  return `사신 도래까지 ${Math.max(0, 500 - turns)}턴...`
}

export function omenThemeLabel (theme: FloorTheme): string {
  return `${theme.icon} ${theme.name}`
}

export function rememberOmenLines (narrative: RunNarrativeState, lines: string[]): RunNarrativeState {
  const recent = [...narrative.recentOmenLines]
  for (const line of lines) {
    if (line.trim().length < 6) continue
    if (line.includes('도래까지')) continue
    recent.push(line)
  }
  return {
    ...narrative,
    recentOmenLines: recent.slice(-18)
  }
}

export function buildOmenIntroLogs (theme: FloorTheme, turns: number, recent: string[] = []): string[] {
  const flavor = resolveFlavor(theme.id)
  const intro = pickLineNoRepeat(flavor.intro, DEFAULT_OMEN_FLAVOR.intro[0], recent)
  return [
    `${omenThemeLabel(theme)}의 공기가 바뀌었다.`,
    intro,
    doomCountdownLine(turns)
  ]
}

export function buildReinforcementLog (theme: FloorTheme, spawned: number, recent: string[] = []): string {
  const flavor = resolveFlavor(theme.id)
  const line = pickLineNoRepeat(flavor.reinforcement, DEFAULT_OMEN_FLAVOR.reinforcement[0], recent)
  return `${line} (증원 ${spawned})`
}

export function buildOmenSymptomLog (
  theme: FloorTheme,
  symptom: OmenSymptomType,
  turns: number,
  recent: string[] = []
): string {
  const flavor = resolveFlavor(theme.id)
  const line = pickLineNoRepeat(flavor.symptoms[symptom], DEFAULT_OMEN_FLAVOR.symptoms[symptom][0], recent)
  return `전조: ${line} | ${doomCountdownLine(turns)}`
}

export function buildCollapseLogs (theme: FloorTheme, recent: string[] = []): string[] {
  const flavor = resolveFlavor(theme.id)
  return [
    `${omenThemeLabel(theme)}이(가) 거대한 비명을 내지르며 갈라진다.`,
    pickLineNoRepeat(flavor.collapse, DEFAULT_OMEN_FLAVOR.collapse[0], recent)
  ]
}

export function buildBuriedLog (buriedEnemyCount: number): string {
  return `붕괴의 파도에 ${buriedEnemyCount}기의 적이 매몰되었다.`
}

export function buildReaperArrivalLogs (theme: FloorTheme, recent: string[] = []): string[] {
  const flavor = resolveFlavor(theme.id)
  return [
    pickLineNoRepeat(flavor.reaperArrival, DEFAULT_OMEN_FLAVOR.reaperArrival[0], recent),
    '이제 남은 것은 계단으로 향하는 짧은 결심뿐이다.'
  ]
}

export function buildReaperShadowLog (theme: FloorTheme, recent: string[] = []): string {
  const flavor = resolveFlavor(theme.id)
  return pickLineNoRepeat(flavor.reaperShadow, DEFAULT_OMEN_FLAVOR.reaperShadow[0], recent)
}

export function addThemeMark (
  narrative: RunNarrativeState,
  markId: string,
  amount: number
): RunNarrativeState {
  const normalized = Math.max(0, amount)
  const nextMarks = { ...narrative.marks }
  nextMarks[markId] = (nextMarks[markId] ?? 0) + normalized
  return {
    ...narrative,
    marks: nextMarks
  }
}

export function resolveMarkSetUnlocks (
  narrative: RunNarrativeState
): { narrative: RunNarrativeState, unlocked: string[] } {
  const tags = new Set(narrative.sequenceTags)
  const unlocked: string[] = []
  for (const recipe of MARK_SET_RECIPES) {
    if (tags.has(recipe.id)) continue
    const complete = recipe.requiredMarks.every(markId => (narrative.marks[markId] ?? 0) >= 1)
    if (!complete) continue
    tags.add(recipe.id)
    unlocked.push(recipe.id)
  }
  return {
    narrative: {
      ...narrative,
      sequenceTags: [...tags]
    },
    unlocked
  }
}

export function applyRelationDelta (
  narrative: RunNarrativeState,
  delta: Partial<RunNarrativeState['relation']>
): RunNarrativeState {
  return {
    ...narrative,
    relation: {
      survivor: narrative.relation.survivor + (delta.survivor ?? 0),
      cultist: narrative.relation.cultist + (delta.cultist ?? 0),
      betrayal: narrative.relation.betrayal + (delta.betrayal ?? 0)
    }
  }
}

export function updateSequenceTags (
  themeHistory: string[],
  currentTags: string[]
): { tags: string[], unlocked: string[] } {
  const set = new Set(currentTags)
  const unlocked: string[] = []
  for (const route of SEQUENCE_ROUTES) {
    if (set.has(route.tag)) continue
    if (!endsWithRoute(themeHistory, route.path)) continue
    set.add(route.tag)
    unlocked.push(route.tag)
  }
  return {
    tags: [...set],
    unlocked
  }
}

export function findLatestRouteTag (narrative: RunNarrativeState): string | null {
  const routeTags = new Set(SEQUENCE_ROUTES.map(route => route.tag))
  for (let i = narrative.sequenceTags.length - 1; i >= 0; i--) {
    const tag = narrative.sequenceTags[i]
    if (routeTags.has(tag)) return tag
  }
  return null
}

export function computeRelationInfluence (
  narrative: RunNarrativeState,
  theme?: FloorTheme
): RelationInfluence {
  const supportScore = narrative.relation.survivor - narrative.relation.betrayal
  const ambushScore = narrative.relation.cultist + narrative.relation.betrayal
  const themePressure = theme?.riskProfile === 'deadly'
    ? 0.08
    : theme?.riskProfile === 'safe'
      ? -0.04
      : 0
  return {
    supportWeight: clamp(1 + supportScore * 0.12 - ambushScore * 0.05, 0.55, 2.1),
    ambushWeight: clamp(1 + ambushScore * 0.12 - supportScore * 0.06 + themePressure, 0.6, 2.4),
    shopPriceMultiplier: clamp(1 - supportScore * 0.04 + ambushScore * 0.03 + themePressure * 0.5, 0.72, 1.55),
    lootModifier: clamp(supportScore * 0.01 + ambushScore * 0.012 + themePressure * 0.35, -0.08, 0.13)
  }
}

export function applyMarkSetEffect (state: GameState, setId: string): GameState {
  const player = { ...state.player, stats: { ...state.player.stats } }
  let enemies = state.enemies
  let enemiesChanged = false
  const log = [...state.log]

  const cloneEnemies = (): void => {
    if (enemiesChanged) return
    enemies = state.enemies.map(enemy => ({ ...enemy, stats: { ...enemy.stats }, pos: { ...enemy.pos } }))
    enemiesChanged = true
  }

  if (setId === 'set_sunk_prophecy') {
    player.stats.maxHp += 8
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 8)
    player.stats.def += 1
    log.push('낙인 공명: 침잠의 예언이 몸을 보호한다. MaxHP +8, DEF +1')
  } else if (setId === 'set_rot_covenant') {
    const heal = Math.max(4, Math.floor(player.stats.maxHp * 0.2))
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal)
    player.stats.str += 1
    log.push(`낙인 공명: 부패의 맹약이 생존 본능을 깨운다. HP +${heal}, STR +1`)
  } else if (setId === 'set_iron_protocol') {
    player.stats.def += 2
    player.reviveCharges += 1
    log.push('낙인 공명: 철의 프로토콜 활성화. DEF +2, 부활 인장 +1')
  } else if (setId === 'set_frozen_time') {
    player.nextAttackTurn = Math.max(state.turns, player.nextAttackTurn - 1)
    cloneEnemies()
    for (const enemy of enemies) {
      if (!enemy.alive) continue
      enemy.nextAttackTurn += 1
    }
    log.push('낙인 공명: 동결된 시간이 발동한다. 당신은 빨라지고 적은 느려진다.')
  } else if (setId === 'set_furnace_oath') {
    player.stats.str += 2
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + Math.max(3, state.floor))
    log.push('낙인 공명: 화로의 맹세가 피를 끓인다. STR +2')
  } else if (setId === 'set_abyssal_call') {
    player.omenMarks += 1
    player.stats.maxHp += 4
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + 4)
    log.push('낙인 공명: 심연의 호출이 메아리친다. 종말 인장 +1, MaxHP +4')
  } else {
    return state
  }
  log.push('대가: 전조의 밀도가 상승한다.')

  let next: GameState = {
    ...state,
    player,
    enemies,
    log
  }
  next = emitNarrativeMetric(next, 'theme_mark_set_effect_applied', { set_id: setId })
  return next
}

function hasMetricEvent (state: GameState, key: string): boolean {
  return state.metricEvents.some(event => event.key === key)
}

function hasRouteCompleteMetric (state: GameState, tag: string): boolean {
  return state.metricEvents.some(event => event.key === 'arc_route_complete' && event.payload.tag === tag)
}

export function applyRunEndMetricsIfNeeded (state: GameState): GameState {
  if (!state.over && !state.won) return state
  let next = state
  const routeTag = findLatestRouteTag(next.narrative)
  if (routeTag !== null && !hasRouteCompleteMetric(next, routeTag)) {
    next = emitNarrativeMetric(next, 'arc_route_complete', {
      tag: routeTag,
      result: next.won ? 'victory' : 'defeat'
    })
  }
  if (!hasMetricEvent(next, 'run_end')) {
    const endingCode = `${next.won ? 'VICTORY' : 'DEFEAT'}:${routeTag ?? 'NONE'}:F${next.floor}`
    next = emitNarrativeMetric(next, 'run_end', {
      result: next.won ? 'victory' : 'defeat',
      floor: next.floor,
      turns: next.turns,
      kills: next.kills,
      level: next.player.level,
      route: routeTag ?? 'none',
      ending_code: endingCode
    })
  }
  return next
}

export function emitNarrativeMetric (
  state: GameState,
  key: string,
  payload: Record<string, string | number | boolean> = {}
): GameState {
  const event: NarrativeMetricEvent = {
    key,
    turn: state.turns,
    floor: state.floor,
    themeId: state.currentTheme.id,
    payload
  }
  const metricEvents = [...state.metricEvents, event].slice(-200)
  return { ...state, metricEvents }
}
