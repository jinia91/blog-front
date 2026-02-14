import {
  type GameState,
  type Player,
  type RunNarrativeState,
  type NarrativeMetricEvent,
  createPlayer,
  selectThemeForFloor,
  generateShopItems,
  recommendedPlayerLevelForFloor,
  floorCatchupXpNeeded
} from './types'
import { generateDungeon, computeFOV } from './dungeon'
import { checkLevelUp } from './game-core-utils'
import { computeRelationInfluence, emitNarrativeMetric, updateSequenceTags } from './narrative'

export function initFloor (
  floor: number,
  existingPlayer: Player | null,
  usedThemeIds: string[] = [],
  previousNarrative?: RunNarrativeState,
  previousMetrics: NarrativeMetricEvent[] = []
): GameState {
  const theme = selectThemeForFloor(floor, usedThemeIds)
  const newUsedThemeIds = [...usedThemeIds, theme.id].slice(-3)
  const currentPlayerLevel = existingPlayer?.level ?? 1
  const narrativeBase: RunNarrativeState = previousNarrative ?? {
    marks: {},
    themeHistory: [],
    sequenceTags: [],
    relation: { survivor: 0, cultist: 0, betrayal: 0 },
    omenStage: 0,
    recentOmenLines: []
  }
  const relationInfluence = computeRelationInfluence(narrativeBase, theme)
  const { map, playerPos, enemies, items } = generateDungeon(floor, theme, currentPlayerLevel, narrativeBase)
  const player = existingPlayer === null
    ? createPlayer(playerPos)
    : { ...existingPlayer, pos: { ...playerPos } }

  computeFOV(map, player.pos.x, player.pos.y)

  const log: string[] = []
  if (floor === 1) {
    log.push('던전에 입장했다...')
  } else {
    log.push(`${floor}층에 도착했다...`)
  }
  const flavorText = theme.flavorTexts[Math.floor(Math.random() * theme.flavorTexts.length)]
  log.push(flavorText)
  const riskLabel = theme.riskProfile === 'safe' ? '안정' : theme.riskProfile === 'risky' ? '고위험' : theme.riskProfile === 'deadly' ? '치명' : '균형'
  log.push(`테마 난이도 ${theme.difficulty.toFixed(1)} / ${riskLabel}`)
  if (floor === 10) {
    log.push('거대한 용의 숨소리가 들린다...')
  }

  const narrative: RunNarrativeState = {
    ...narrativeBase,
    themeHistory: [...narrativeBase.themeHistory, theme.id].slice(-16),
    omenStage: 0,
    recentOmenLines: narrativeBase.recentOmenLines ?? []
  }
  const sequenceUpdate = updateSequenceTags(narrative.themeHistory, narrative.sequenceTags)
  narrative.sequenceTags = sequenceUpdate.tags
  for (const tag of sequenceUpdate.unlocked) {
    log.push(`서사 연쇄 감응: ${tag}`)
  }

  let state: GameState = {
    map,
    player,
    enemies,
    items,
    floor,
    over: false,
    won: false,
    log,
    turns: existingPlayer === null ? 0 : 0,
    kills: existingPlayer === null ? 0 : 0,
    invOpen: false,
    invIdx: 0,
    currentTheme: theme,
    usedThemeIds: newUsedThemeIds,
    shopOpen: false,
    shopItems: generateShopItems(floor, relationInfluence.shopPriceMultiplier),
    shopIdx: 0,
    usedObjects: [],
    activeEvent: null,
    eventIdx: 0,
    projectile: null,
    grimReaperTriggered: false,
    doomWarningIssued: false,
    lastDoomSymptomTurn: -1,
    narrative,
    metricEvents: [...previousMetrics],
    floorEventMarkClaimed: false,
    bossPhaseContext: null
  }

  if (relationInfluence.shopPriceMultiplier <= 0.92) {
    state = {
      ...state,
      log: [...state.log, '생존자 네트워크의 지원으로 상점 가격이 낮아졌다.']
    }
  } else if (relationInfluence.shopPriceMultiplier >= 1.12) {
    state = {
      ...state,
      log: [...state.log, '불온한 소문이 퍼져 상점이 높은 가격을 부른다.']
    }
  }

  if (existingPlayer !== null) {
    const targetLevel = recommendedPlayerLevelForFloor(floor)
    const catchupXp = floorCatchupXpNeeded(state.player, floor)
    if (catchupXp > 0) {
      state = {
        ...state,
        player: { ...state.player, xp: state.player.xp + catchupXp },
        log: [...state.log, `층 보정 경험치 +${catchupXp} (권장 Lv.${targetLevel})`]
      }
      state = checkLevelUp(state)
    }
  }

  const metricKey = floor === 1 && existingPlayer === null ? 'run_start' : 'floor_enter'
  state = emitNarrativeMetric(state, metricKey, {
    floor,
    theme: theme.id
  })
  if (sequenceUpdate.unlocked.length > 0) {
    for (const tag of sequenceUpdate.unlocked) {
      state = emitNarrativeMetric(state, 'arc_route_lock', { tag })
    }
  }

  return state
}
