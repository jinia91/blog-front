import {
  type GameState,
  type EnemyDef,
  type Position,
  Tile,
  MAP_WIDTH,
  MAP_HEIGHT,
  TOTAL_FLOORS,
  createEnemy,
  scaleEnemyStats
} from './types'
import { computeFOV } from './dungeon'
import { initFloor } from './game-init'
import { pickUpItems } from './game-actions'
import { clearProjectile, buildProjectilePath, playerAttackReady } from './game-core-utils'
import { attackEnemy, processEnemyTurns, findRangedTarget, hasRangedLineOfSight } from './game-combat'
import {
  getOmenStage,
  buildOmenIntroLogs,
  buildReinforcementLog,
  buildOmenSymptomLog,
  buildCollapseLogs,
  buildBuriedLog,
  buildReaperArrivalLogs,
  buildReaperShadowLog,
  addThemeMark,
  resolveMarkSetUnlocks,
  emitNarrativeMetric,
  computeRelationInfluence,
  applyMarkSetEffect,
  applyRunEndMetricsIfNeeded,
  rememberOmenLines
} from './narrative'

function roomContains (room: { x: number, y: number, w: number, h: number }, x: number, y: number): boolean {
  return x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h
}

function findStairsPos (state: GameState): Position | null {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (state.map.tiles[y][x] === Tile.Stairs) {
        return { x, y }
      }
    }
  }
  return null
}

function isEnemyOccupied (state: GameState, x: number, y: number): boolean {
  for (const e of state.enemies) {
    if (e.alive && e.pos.x === x && e.pos.y === y) return true
  }
  return false
}

function isSpawnableTile (tile: Tile): boolean {
  return tile !== Tile.Wall && tile !== Tile.Stairs && tile !== Tile.Shop
}

function randomSpawnPos (state: GameState, minDistanceFromPlayer: number): Position | null {
  for (let attempt = 0; attempt < 240; attempt++) {
    const room = state.map.rooms[Math.floor(Math.random() * state.map.rooms.length)]
    const x = room.x + Math.floor(Math.random() * room.w)
    const y = room.y + Math.floor(Math.random() * room.h)
    const tile = state.map.tiles[y][x]
    if (!isSpawnableTile(tile)) continue
    if (state.player.pos.x === x && state.player.pos.y === y) continue
    if (isEnemyOccupied(state, x, y)) continue
    const dist = Math.abs(state.player.pos.x - x) + Math.abs(state.player.pos.y - y)
    if (dist < minDistanceFromPlayer) continue
    return { x, y }
  }
  return null
}

function spawnReinforcementWave (state: GameState): GameState {
  if (state.over || state.won || state.grimReaperTriggered) return state
  const relationInfluence = computeRelationInfluence(state.narrative, state.currentTheme)
  const markBurden = state.narrative.sequenceTags.filter(tag => tag.startsWith('set_')).length
  const interval = Math.max(14, Math.max(18, 34 - state.floor) - markBurden * 2)
  if (state.turns <= 0 || state.turns % interval !== 0) return state

  let spawnCount = 1
  if (state.floor >= 6) spawnCount += 1
  if (state.currentTheme.riskProfile === 'deadly' && Math.random() < 0.5) spawnCount += 1
  if (relationInfluence.ambushWeight >= 1.3) spawnCount += 1
  if (relationInfluence.ambushWeight >= 1.8 && Math.random() < 0.4) spawnCount += 1

  const newEnemies = [...state.enemies]
  const newLog = [...state.log]
  let player = state.player
  let supportTriggered = false
  let spawned = 0

  for (let i = 0; i < spawnCount; i++) {
    const pos = randomSpawnPos(state, 7)
    if (pos === null) continue
    const baseDef = state.currentTheme.monsters[Math.floor(Math.random() * state.currentTheme.monsters.length)]
    const scaledStats = scaleEnemyStats(baseDef.stats, state.floor, state.currentTheme, state.player.level)
    const reinfDef: EnemyDef = {
      ...baseDef,
      name: `증원 ${baseDef.name}`,
      stats: scaledStats,
      xp: Math.floor(baseDef.xp * 1.15),
      speed: baseDef.speed ?? baseDef.attackSpeed
    }
    const enemy = createEnemy(reinfDef, pos, false)
    enemy.nextAttackTurn = state.turns + enemy.attackSpeed
    newEnemies.push(enemy)
    spawned += 1
  }

  const supportChance = Math.max(0, Math.min(0.52, (relationInfluence.supportWeight - 1) * 0.55))
  if (supportChance > 0 && Math.random() < supportChance) {
    player = { ...state.player, stats: { ...state.player.stats } }
    const heal = Math.max(3, Math.floor(state.floor * 1.5))
    const gold = Math.max(4, Math.floor(state.floor * 2))
    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal)
    player.gold += gold
    newLog.push(`생존자 은닉품이 도착했다. HP +${heal}, Gold +${gold}`)
    supportTriggered = true
  }

  if (spawned === 0 && !supportTriggered) return state
  let omenNarrative = state.narrative
  if (spawned > 0) {
    const reinforcementLine = buildReinforcementLog(state.currentTheme, spawned, state.narrative.recentOmenLines)
    newLog.push(reinforcementLine)
    omenNarrative = rememberOmenLines(omenNarrative, [reinforcementLine])
  }
  let next: GameState = {
    ...state,
    enemies: newEnemies,
    player,
    log: newLog,
    narrative: omenNarrative
  }
  if (spawned > 0) {
    next = emitNarrativeMetric(next, 'reinforcement_spawned', {
      spawned,
      ambush_weight: relationInfluence.ambushWeight.toFixed(2)
    })
  }
  if (supportTriggered) {
    next = emitNarrativeMetric(next, 'relation_support_triggered', {
      support_weight: relationInfluence.supportWeight.toFixed(2)
    })
  }
  return next
}

function collapseRoomsExceptStairsRoom (state: GameState): {
  map: GameState['map']
  enemies: GameState['enemies']
  items: GameState['items']
  collapsedRoomCount: number
  buriedEnemyCount: number
} {
  const stairsPos = findStairsPos(state)
  if (stairsPos === null) {
    return {
      map: state.map,
      enemies: state.enemies,
      items: state.items,
      collapsedRoomCount: 0,
      buriedEnemyCount: 0
    }
  }

  const stairsRoomIdx = state.map.rooms.findIndex(r => roomContains(r, stairsPos.x, stairsPos.y))
  if (stairsRoomIdx === -1) {
    return {
      map: state.map,
      enemies: state.enemies,
      items: state.items,
      collapsedRoomCount: 0,
      buriedEnemyCount: 0
    }
  }

  const newTiles = state.map.tiles.map(row => [...row])
  const collapsedRooms = state.map.rooms.filter((_, idx) => idx !== stairsRoomIdx)
  for (const room of collapsedRooms) {
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        if (x === stairsPos.x && y === stairsPos.y) continue
        if (x === state.player.pos.x && y === state.player.pos.y) continue
        if (newTiles[y][x] !== Tile.Wall) {
          newTiles[y][x] = Tile.Wall
        }
      }
    }
  }

  const inCollapsedRoom = (x: number, y: number): boolean => {
    for (let i = 0; i < state.map.rooms.length; i++) {
      if (i === stairsRoomIdx) continue
      if (roomContains(state.map.rooms[i], x, y)) return true
    }
    return false
  }

  let buriedEnemyCount = 0
  const enemies = state.enemies.filter(e => {
    if (!inCollapsedRoom(e.pos.x, e.pos.y)) return true
    if (e.alive) buriedEnemyCount += 1
    return false
  })

  const items = state.items.filter(it => !inCollapsedRoom(it.pos.x, it.pos.y))
  const map = {
    ...state.map,
    tiles: newTiles,
    explored: state.map.explored.map(row => [...row]),
    visible: state.map.visible.map(row => [...row])
  }

  return {
    map,
    enemies,
    items,
    collapsedRoomCount: collapsedRooms.length,
    buriedEnemyCount
  }
}

function triggerGrimReaperIfNeeded (state: GameState): GameState {
  if (state.grimReaperTriggered || state.turns < 500) return state

  const collapse = collapseRoomsExceptStairsRoom(state)
  let next: GameState = {
    ...state,
    map: collapse.map,
    enemies: collapse.enemies,
    items: collapse.items,
    grimReaperTriggered: true,
    log: [...state.log, ...buildCollapseLogs(state.currentTheme, state.narrative.recentOmenLines)]
  }
  next = { ...next, narrative: rememberOmenLines(next.narrative, next.log.slice(-2)) }

  if (collapse.buriedEnemyCount > 0) {
    next = { ...next, log: [...next.log, buildBuriedLog(collapse.buriedEnemyCount)] }
  }

  const stairsPos = findStairsPos(next)
  let spawnPos: Position | null = null
  if (stairsPos !== null) {
    const stairsRoom = next.map.rooms.find(r => roomContains(r, stairsPos.x, stairsPos.y))
    if (stairsRoom !== undefined) {
      for (let attempt = 0; attempt < 120; attempt++) {
        const x = stairsRoom.x + Math.floor(Math.random() * stairsRoom.w)
        const y = stairsRoom.y + Math.floor(Math.random() * stairsRoom.h)
        if (!isSpawnableTile(next.map.tiles[y][x])) continue
        if (next.player.pos.x === x && next.player.pos.y === y) continue
        if (isEnemyOccupied(next, x, y)) continue
        spawnPos = { x, y }
        break
      }
    }
  }
  if (spawnPos === null) {
    spawnPos = randomSpawnPos(next, 4)
  }

  if (spawnPos !== null) {
    const baseStats = {
      hp: 180 + next.floor * 45,
      maxHp: 180 + next.floor * 45,
      str: 20 + next.floor * 4,
      def: 14 + next.floor * 2
    }
    const grimDef: EnemyDef = {
      name: '사신',
      ch: 'R',
      stats: scaleEnemyStats(baseStats, next.floor + 5, next.currentTheme, next.player.level),
      xp: 120 + next.floor * 30,
      range: 5,
      speed: 1
    }
    const grim = createEnemy(grimDef, spawnPos, false)
    grim.nextAttackTurn = next.turns + 1
    next = {
      ...next,
      enemies: [...next.enemies, grim],
      log: [...next.log, ...buildReaperArrivalLogs(next.currentTheme, next.narrative.recentOmenLines)]
    }
    next = { ...next, narrative: rememberOmenLines(next.narrative, next.log.slice(-2)) }
  } else {
    const shadowLog = buildReaperShadowLog(next.currentTheme, next.narrative.recentOmenLines)
    next = {
      ...next,
      log: [...next.log, shadowLog],
      narrative: rememberOmenLines(next.narrative, [shadowLog])
    }
  }

  next = emitNarrativeMetric(next, 'grim_reaper_triggered', {
    buried_enemies: collapse.buriedEnemyCount,
    collapsed_rooms: collapse.collapsedRoomCount
  })
  return next
}

function triggerDoomWarningAndSymptoms (state: GameState): GameState {
  if (state.over || state.won || state.grimReaperTriggered || state.turns < 400) return state

  let next = state
  const stage = getOmenStage(next.turns)
  if (stage > next.narrative.omenStage) {
    next = {
      ...next,
      narrative: {
        ...next.narrative,
        omenStage: stage
      }
    }
    next = emitNarrativeMetric(next, 'omen_stage_enter', { stage })
  }

  if (!next.doomWarningIssued) {
    const introLogs = buildOmenIntroLogs(next.currentTheme, next.turns, next.narrative.recentOmenLines)
    next = {
      ...next,
      doomWarningIssued: true,
      log: [...next.log, ...introLogs],
      narrative: rememberOmenLines(next.narrative, introLogs)
    }
  }

  const markBurden = next.narrative.sequenceTags.filter(tag => tag.startsWith('set_')).length
  const baseInterval = next.turns >= 480 ? 6 : next.turns >= 450 ? 8 : 12
  const symptomInterval = Math.max(4, baseInterval - markBurden)
  if (next.lastDoomSymptomTurn >= 0 && (next.turns - next.lastDoomSymptomTurn) < symptomInterval) {
    return next
  }

  const symptomRoll = Math.floor(Math.random() * 4)
  const newLog = [...next.log]
  let player = next.player
  let enemies = next.enemies

  if (symptomRoll === 0) {
    player = { ...next.player, stats: { ...next.player.stats } }
    const dmg = Math.max(1, Math.floor(2 + next.floor * 0.25))
    player.stats.hp = Math.max(1, player.stats.hp - dmg)
    newLog.push(`${buildOmenSymptomLog(next.currentTheme, 'hp_drain', next.turns, next.narrative.recentOmenLines)} HP -${dmg}`)
  } else if (symptomRoll === 1) {
    player = { ...next.player, stats: { ...next.player.stats } }
    player.nextAttackTurn += 1
    newLog.push(buildOmenSymptomLog(next.currentTheme, 'tempo_slow', next.turns, next.narrative.recentOmenLines))
  } else if (symptomRoll === 2) {
    const pos = randomSpawnPos(next, 6)
    if (pos !== null) {
      const baseDef = next.currentTheme.monsters[Math.floor(Math.random() * next.currentTheme.monsters.length)]
      const scaledStats = scaleEnemyStats(baseDef.stats, next.floor + 2, next.currentTheme, next.player.level)
      const omenDef: EnemyDef = {
        ...baseDef,
        name: `전조 ${baseDef.name}`,
        stats: scaledStats,
        xp: Math.floor(baseDef.xp * 1.2),
        speed: baseDef.speed ?? baseDef.attackSpeed
      }
      const omen = createEnemy(omenDef, pos, false)
      omen.nextAttackTurn = next.turns + omen.attackSpeed
      enemies = [...next.enemies, omen]
      newLog.push(`${buildOmenSymptomLog(next.currentTheme, 'omen_spawn', next.turns, next.narrative.recentOmenLines)} (${omen.name})`)
    } else {
      newLog.push(buildOmenSymptomLog(next.currentTheme, 'omen_spawn', next.turns, next.narrative.recentOmenLines))
    }
  } else {
    const accelerated = next.enemies.map(e => {
      if (!e.alive) return e
      return { ...e, nextAttackTurn: Math.max(next.turns, e.nextAttackTurn - 1) }
    })
    enemies = accelerated
    newLog.push(buildOmenSymptomLog(next.currentTheme, 'enemy_haste', next.turns, next.narrative.recentOmenLines))
  }

  const lastSymptomLog = newLog[newLog.length - 1]
  let result: GameState = {
    ...next,
    player,
    enemies,
    log: newLog,
    lastDoomSymptomTurn: next.turns,
    narrative: rememberOmenLines(next.narrative, lastSymptomLog !== undefined ? [lastSymptomLog] : [])
  }
  result = emitNarrativeMetric(result, 'omen_symptom_triggered', {
    symptom: symptomRoll,
    stage: result.narrative.omenStage
  })
  return result
}

function processTurnAfterIncrement (state: GameState): GameState {
  let next = spawnReinforcementWave(state)
  next = triggerDoomWarningAndSymptoms(next)
  next = triggerGrimReaperIfNeeded(next)
  if (next.activeEvent !== null) {
    computeFOV(next.map, next.player.pos.x, next.player.pos.y)
    return applyRunEndMetricsIfNeeded(next)
  }
  next = processEnemyTurns(next)
  computeFOV(next.map, next.player.pos.x, next.player.pos.y)
  return applyRunEndMetricsIfNeeded(next)
}

function consumeTurn (state: GameState, logMessage?: string): GameState {
  let next = state
  if (logMessage !== undefined) {
    next = { ...next, log: [...next.log, logMessage] }
  }
  next = { ...next, turns: next.turns + 1 }
  return processTurnAfterIncrement(next)
}

function applyTerrainStepEffect (state: GameState, x: number, y: number): GameState {
  const tile = state.map.tiles[y][x]
  if (tile !== Tile.ShallowWater && tile !== Tile.Bramble && tile !== Tile.HealingMoss && tile !== Tile.ArcaneField) {
    return state
  }

  const player = { ...state.player, stats: { ...state.player.stats } }
  const log = [...state.log]
  let over = state.over

  if (tile === Tile.ShallowWater) {
    if (Math.random() < 0.35) {
      player.nextAttackTurn += 1
      log.push('얕은 물에 발이 묶였다. 공격 템포가 늦어졌다.')
    }
  } else if (tile === Tile.Bramble) {
    const dmg = Math.max(1, Math.floor(1 + state.floor * 0.25))
    player.stats.hp -= dmg
    log.push(`가시덤불 지형에 찔렸다! HP -${dmg}`)
  } else if (tile === Tile.HealingMoss) {
    if (player.stats.hp < player.stats.maxHp) {
      const heal = Math.min(player.stats.maxHp - player.stats.hp, Math.max(2, Math.floor(2 + state.floor * 0.2)))
      player.stats.hp += heal
      log.push(`치유 이끼가 상처를 감쌌다. HP +${heal}`)
    }
  } else if (tile === Tile.ArcaneField) {
    if (Math.random() < 0.5) {
      player.nextAttackTurn = Math.max(state.turns, player.nextAttackTurn - 1)
      log.push('비전 장판의 공명으로 다음 공격이 빨라졌다.')
    } else {
      const backlash = Math.max(1, Math.floor(1 + state.floor * 0.15))
      player.stats.hp -= backlash
      log.push(`비전 장판의 역류! HP -${backlash}`)
    }
  }

  if (player.stats.hp <= 0) {
    if (player.reviveCharges > 0) {
      player.reviveCharges -= 1
      player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.5))
      log.push('수호의 석상이 발동했다! 지형 피해에서 부활했다!')
    } else {
      player.stats.hp = 0
      over = true
      log.push('위험 지형에서 쓰러졌다...')
    }
  }

  return { ...state, player, log, over }
}

export function movePlayer (state: GameState, dx: number, dy: number): GameState {
  const baseState = clearProjectile(state)
  const nx = baseState.player.pos.x + dx
  const ny = baseState.player.pos.y + dy

  if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) {
    // Try ranged attack even if can't move
    const rangedTarget = findRangedTarget(baseState, dx, dy)
    if (rangedTarget !== -1) {
      if (!playerAttackReady(baseState)) {
        const waitTurns = Math.max(0, baseState.player.nextAttackTurn - baseState.turns)
        return consumeTurn(baseState, `공격 재정비 중... (${waitTurns}턴)`)
      }
      const target = baseState.enemies[rangedTarget]
      const range = baseState.player.weapon?.range ?? 1
      const projectilePath = buildProjectilePath(baseState, baseState.player.pos.x, baseState.player.pos.y, target.pos.x, target.pos.y, range)
      let result = attackEnemy(baseState, rangedTarget, true, projectilePath)
      result = consumeTurn(result)
      return result
    }
    return baseState
  }

  // Melee attack on adjacent enemy
  for (let i = 0; i < baseState.enemies.length; i++) {
    const e = baseState.enemies[i]
    if (e.alive && e.pos.x === nx && e.pos.y === ny) {
      if (!playerAttackReady(baseState)) {
        const waitTurns = Math.max(0, baseState.player.nextAttackTurn - baseState.turns)
        return consumeTurn(baseState, `공격 재정비 중... (${waitTurns}턴)`)
      }
      let result = attackEnemy(baseState, i, false)
      result = consumeTurn(result)
      return result
    }
  }

  // Can't move into wall - try ranged attack
  if (baseState.map.tiles[ny][nx] === Tile.Wall) {
    const rangedTarget = findRangedTarget(baseState, dx, dy)
    if (rangedTarget !== -1) {
      if (!playerAttackReady(baseState)) {
        const waitTurns = Math.max(0, baseState.player.nextAttackTurn - baseState.turns)
        return consumeTurn(baseState, `공격 재정비 중... (${waitTurns}턴)`)
      }
      const target = baseState.enemies[rangedTarget]
      const range = baseState.player.weapon?.range ?? 1
      const projectilePath = buildProjectilePath(baseState, baseState.player.pos.x, baseState.player.pos.y, target.pos.x, target.pos.y, range)
      let result = attackEnemy(baseState, rangedTarget, true, projectilePath)
      result = consumeTurn(result)
      return result
    }
    return baseState
  }

  const newPlayer = { ...baseState.player, pos: { x: nx, y: ny } }
  let result: GameState = { ...baseState, player: newPlayer, turns: baseState.turns + 1 }

  result = pickUpItems(result)
  result = applyTerrainStepEffect(result, nx, ny)
  if (result.over) {
    computeFOV(result.map, result.player.pos.x, result.player.pos.y)
    return applyRunEndMetricsIfNeeded(result)
  }

  // Check if on shop tile
  if (result.map.tiles[ny][nx] === Tile.Shop && !result.shopOpen) {
    result = { ...result, log: [...result.log, '상점이다! S키로 열기'] }
  }

  return processTurnAfterIncrement(result)
}

function findNearestRangedTarget (state: GameState): number {
  const weaponRange = state.player.weapon?.range ?? 1
  if (weaponRange <= 1) return -1

  let bestIdx = -1
  let bestDist = Infinity
  for (let i = 0; i < state.enemies.length; i++) {
    const enemy = state.enemies[i]
    if (!enemy.alive) continue
    const dist = Math.abs(enemy.pos.x - state.player.pos.x) + Math.abs(enemy.pos.y - state.player.pos.y)
    if (dist < 2 || dist > weaponRange) continue
    if (!state.map.visible[enemy.pos.y][enemy.pos.x]) continue
    if (!hasRangedLineOfSight(state, state.player.pos.x, state.player.pos.y, enemy.pos.x, enemy.pos.y)) continue
    if (dist < bestDist) {
      bestDist = dist
      bestIdx = i
    }
  }
  return bestIdx
}

export function rangedAttack (state: GameState): GameState {
  const baseState = clearProjectile(state)
  const weaponRange = baseState.player.weapon?.range ?? 1
  if (weaponRange <= 1) {
    return { ...baseState, log: [...baseState.log, '현재 장비로는 원거리 공격 불가'] }
  }

  if (!playerAttackReady(baseState)) {
    const waitTurns = Math.max(0, baseState.player.nextAttackTurn - baseState.turns)
    return consumeTurn(baseState, `공격 재정비 중... (${waitTurns}턴)`)
  }

  const targetIdx = findNearestRangedTarget(baseState)
  if (targetIdx === -1) {
    return consumeTurn(baseState, '사거리 내 원거리 표적이 없다')
  }

  const target = baseState.enemies[targetIdx]
  const projectilePath = buildProjectilePath(baseState, baseState.player.pos.x, baseState.player.pos.y, target.pos.x, target.pos.y, weaponRange)
  let result = attackEnemy(baseState, targetIdx, true, projectilePath)
  result = consumeTurn(result)
  return result
}

export function descend (state: GameState): GameState {
  const px = state.player.pos.x
  const py = state.player.pos.y

  if (state.map.tiles[py][px] !== Tile.Stairs) {
    return state
  }

  if (state.floor === TOTAL_FLOORS) {
    const aliveEnemies = state.enemies.filter(e => e.alive)
    if (aliveEnemies.length > 0) {
      return { ...state, log: [...state.log, '아직 적이 남아있다...'] }
    }
    return applyRunEndMetricsIfNeeded({ ...state, won: true, log: [...state.log, '던전을 정복했다!'] })
  }

  let narrative = state.narrative
  narrative = addThemeMark(narrative, state.currentTheme.id, 1)
  const markSetResult = resolveMarkSetUnlocks(narrative)
  narrative = markSetResult.narrative
  const descendLog = [...state.log, `낙인 획득: ${state.currentTheme.name} +1`]
  for (const setId of markSetResult.unlocked) {
    descendLog.push(`낙인 조합 각성: ${setId}`)
  }
  let markedState: GameState = {
    ...state,
    narrative,
    log: descendLog
  }
  markedState = emitNarrativeMetric(markedState, 'theme_mark_gain', {
    mark_id: state.currentTheme.id,
    amount: 1,
    reason: 'floor_clear'
  })
  for (const setId of markSetResult.unlocked) {
    markedState = emitNarrativeMetric(markedState, 'theme_mark_set_complete', { set_id: setId })
    markedState = applyMarkSetEffect(markedState, setId)
  }

  const nextFloor = state.floor + 1
  const newState = initFloor(
    nextFloor,
    markedState.player,
    markedState.usedThemeIds,
    markedState.narrative,
    markedState.metricEvents
  )
  return {
    ...newState,
    kills: markedState.kills
  }
}
