import { type GameState, Tile, MAP_WIDTH, MAP_HEIGHT, TOTAL_FLOORS } from './types'
import { computeFOV } from './dungeon'
import { initFloor } from './game-init'
import { pickUpItems } from './game-actions'
import { clearProjectile, buildProjectilePath, playerAttackReady } from './game-core-utils'
import { attackEnemy, processEnemyTurns, findRangedTarget, hasRangedLineOfSight } from './game-combat'

function consumeTurn (state: GameState, logMessage?: string): GameState {
  let next = state
  if (logMessage !== undefined) {
    next = { ...next, log: [...next.log, logMessage] }
  }
  next = { ...next, turns: next.turns + 1 }
  next = processEnemyTurns(next)
  computeFOV(next.map, next.player.pos.x, next.player.pos.y)
  return next
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

  // Check if on shop tile
  if (result.map.tiles[ny][nx] === Tile.Shop && !result.shopOpen) {
    result = { ...result, log: [...result.log, '상점이다! S키로 열기'] }
  }

  result = processEnemyTurns(result)
  computeFOV(result.map, result.player.pos.x, result.player.pos.y)

  return result
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
    return { ...state, won: true, log: [...state.log, '던전을 정복했다!'] }
  }

  const nextFloor = state.floor + 1
  const newState = initFloor(nextFloor, state.player, state.usedThemeIds)
  return {
    ...newState,
    turns: state.turns,
    kills: state.kills
  }
}
