import {
  type GameState,
  type Enemy,
  type EnemyDef,
  type MapItem,
  type WeaponData,
  Tile,
  MAP_WIDTH,
  MAP_HEIGHT,
  LEGENDARY_WEAPONS,
  LEGENDARY_ARMORS,
  TOTAL_FLOORS,
  weaponForFloor,
  armorForFloor,
  createEnemy,
  scaleEnemyStats
} from './types'
import { checkLevelUp, nextPlayerAttackTurn } from './game-core-utils'
import { getBossPhaseDecisionEvent } from './events'
import { addThemeMark, resolveMarkSetUnlocks, emitNarrativeMetric, applyMarkSetEffect, findLatestRouteTag } from './narrative'

function projectileDirectionGlyph (dx: number, dy: number): string {
  if (dx === 0 && dy < 0) return '↑'
  if (dx === 0 && dy > 0) return '↓'
  if (dy === 0 && dx > 0) return '→'
  if (dy === 0 && dx < 0) return '←'
  if (dx > 0 && dy < 0) return '↗'
  if (dx > 0 && dy > 0) return '↘'
  if (dx < 0 && dy < 0) return '↖'
  if (dx < 0 && dy > 0) return '↙'
  return '•'
}

function projectileGlyph (weapon: WeaponData | null, dx: number, dy: number): { ch: string, color: 'yellow' | 'cyan' | 'red' } {
  const range = weapon?.range ?? 1
  const directional = projectileDirectionGlyph(dx, dy)
  if (range >= 4) return { ch: directional, color: 'cyan' }
  if (range >= 2) return { ch: directional, color: 'yellow' }
  return { ch: '*', color: 'red' }
}

function enemyAttackReady (state: GameState, enemy: Enemy): boolean {
  return state.turns >= enemy.nextAttackTurn
}

function bossPatternForContext (state: GameState): Enemy['bossPattern'] {
  const routeTag = findLatestRouteTag(state.narrative)
  if (routeTag === 'frozen_time' || routeTag === 'furnace_oath') return 'mutator'
  if (routeTag === 'iron_protocol' || routeTag === 'abyssal_call') return 'predator'
  if (state.currentTheme.id === 'clocktower' || state.currentTheme.id === 'lava' || state.currentTheme.id === 'ice') return 'mutator'
  if (state.currentTheme.id === 'cyber_server' || state.currentTheme.id === 'bunker' || state.currentTheme.id === 'machine_factory') return 'predator'
  return 'summoner'
}

function shouldTriggerBossPhase2 (state: GameState, enemy: Enemy): boolean {
  if (!enemy.isBoss || !enemy.alive || enemy.bossPhase !== 1) return false
  const hpRatio = enemy.stats.hp / Math.max(1, enemy.stats.maxHp)
  const routeTag = findLatestRouteTag(state.narrative)
  const hasAbyssSet = state.narrative.sequenceTags.includes('set_abyssal_call')
  if (hpRatio <= 0.55) return true
  if (routeTag !== null && hpRatio <= 0.7) return true
  if (hasAbyssSet && hpRatio <= 0.75) return true
  return false
}

function inBounds (x: number, y: number): boolean {
  return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT
}

function canSpawnAddAt (state: GameState, x: number, y: number): boolean {
  if (!inBounds(x, y)) return false
  const tile = state.map.tiles[y][x]
  if (tile === Tile.Wall || tile === Tile.Stairs || tile === Tile.Shop) return false
  if (state.player.pos.x === x && state.player.pos.y === y) return false
  for (const enemy of state.enemies) {
    if (enemy.alive && enemy.pos.x === x && enemy.pos.y === y) return false
  }
  return true
}

function spawnBossAdds (state: GameState, enemies: Enemy[], boss: Enemy, count: number): Enemy[] {
  const out = [...enemies]
  const monsterDefs = state.currentTheme.monsters
  let spawned = 0
  const occupiedByOut = (x: number, y: number): boolean => out.some(enemy => enemy.alive && enemy.pos.x === x && enemy.pos.y === y)
  for (let r = 1; r <= 3 && spawned < count; r++) {
    for (let dy = -r; dy <= r && spawned < count; dy++) {
      for (let dx = -r; dx <= r && spawned < count; dx++) {
        if (Math.abs(dx) + Math.abs(dy) !== r) continue
        const x = boss.pos.x + dx
        const y = boss.pos.y + dy
        if (!canSpawnAddAt(state, x, y)) continue
        if (occupiedByOut(x, y)) continue
        const def = monsterDefs[Math.floor(Math.random() * monsterDefs.length)]
        const scaled = scaleEnemyStats(def.stats, state.floor, state.currentTheme, state.player.level)
        const addDef: EnemyDef = {
          ...def,
          stats: scaled,
          name: `페이즈 하수인 ${def.name}`,
          xp: Math.floor(def.xp * 1.2),
          speed: def.speed ?? def.attackSpeed
        }
        const newEnemy = createEnemy(addDef, { x, y }, false)
        newEnemy.nextAttackTurn = state.turns + 1
        newEnemy.bossPattern = boss.bossPattern
        out.push(newEnemy)
        spawned += 1
      }
    }
  }
  return out
}

function mutateBossArena (state: GameState, boss: Enemy, pattern: Enemy['bossPattern']): GameState['map'] {
  const tiles = state.map.tiles.map(row => [...row])
  const explored = state.map.explored.map(row => [...row])
  const visible = state.map.visible.map(row => [...row])
  const radius = 3
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = boss.pos.x + dx
      const y = boss.pos.y + dy
      if (!inBounds(x, y)) continue
      if (Math.abs(dx) + Math.abs(dy) > radius) continue
      if (tiles[y][x] === Tile.Wall || tiles[y][x] === Tile.Stairs || tiles[y][x] === Tile.Shop) continue
      if (pattern === 'mutator') {
        tiles[y][x] = Math.random() < 0.5 ? Tile.ArcaneField : Tile.Bramble
      } else if (pattern === 'predator') {
        tiles[y][x] = Math.random() < 0.6 ? Tile.Bramble : Tile.ShallowWater
      } else if (Math.random() < 0.25) {
        tiles[y][x] = Tile.ArcaneField
      }
    }
  }
  return { ...state.map, tiles, explored, visible }
}

export function attackEnemy (
  state: GameState,
  enemyIdx: number,
  isRanged: boolean = false,
  projectilePath: Array<{ x: number, y: number }> = []
): GameState {
  const enemy = { ...state.enemies[enemyIdx], stats: { ...state.enemies[enemyIdx].stats } }
  const player = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]
  const nextAttackTurn = nextPlayerAttackTurn(state)
  player.nextAttackTurn = nextAttackTurn

  const atkPower = player.stats.str + (player.weapon !== null ? player.weapon.atk : 0)
  const rangePenalty = isRanged ? 0.85 : 1.0
  const roll = Math.random()
  let damage: number

  if (roll < 0.05) {
    damage = 0
    if (isRanged) {
      newLog.push('원거리 공격이 빗나갔다!')
    } else {
      newLog.push('빗나갔다!')
    }
  } else {
    damage = Math.max(1, Math.floor((atkPower - enemy.stats.def + Math.floor(Math.random() * 5) - 2) * rangePenalty))
    if (roll < 0.15) {
      damage = Math.floor(damage * 1.5)
      if (isRanged) {
        newLog.push(`원거리 크리티컬! ${enemy.name}에게 ${damage} 데미지`)
      } else {
        newLog.push(`크리티컬! ${enemy.name}에게 ${damage} 데미지`)
      }
    } else {
      if (isRanged) {
        newLog.push(`→ ${enemy.name}에게 ${damage} 원거리 데미지`)
      } else {
        newLog.push(`${enemy.name}에게 ${damage} 데미지`)
      }
    }
  }

  enemy.stats.hp -= damage

  let newKills = state.kills
  let bossTransitioned = false
  let transitionSpawnCount = 0
  let mapAfterTransition = state.map

  if (enemy.stats.hp <= 0) {
    enemy.alive = false
    newKills += 1
    player.xp += enemy.xp
    if (enemy.isBoss) {
      newLog.push(`BOSS ${enemy.name}을(를) 처치했다!`)
      const bossGold = state.floor * 20 + Math.floor(Math.random() * 30)
      player.gold += bossGold
      newLog.push(`${bossGold} Gold 획득!`)
    } else {
      newLog.push(`${enemy.name}를 처치했다!`)
      // Monster gold drop (30% chance)
      if (Math.random() < 0.3) {
        const monsterGold = state.floor * 2 + Math.floor(Math.random() * 5)
        player.gold += monsterGold
        newLog.push(`${monsterGold} Gold 획득!`)
      }
    }
  } else if (shouldTriggerBossPhase2(state, enemy)) {
    const routeTag = findLatestRouteTag(state.narrative)
    enemy.bossPhase = 2
    enemy.bossPattern = bossPatternForContext(state)
    enemy.attackSpeed = Math.max(1, enemy.attackSpeed - 1)
    enemy.stats.str += 2 + Math.floor(state.floor / 4)
    enemy.stats.def += 1 + Math.floor(state.floor / 6)
    bossTransitioned = true

    const tags = state.narrative.sequenceTags
    if (tags.includes('set_frozen_time')) {
      enemy.nextAttackTurn += 1
      newLog.push('낙인 공명(동결): 보스 각성이 지연됐다.')
    }
    if (tags.includes('set_furnace_oath')) {
      enemy.stats.str += 2
      newLog.push('낙인 공명(화로): 전장의 열기가 폭주한다.')
    }
    if (tags.includes('set_abyssal_call')) {
      enemy.stats.str += 2
      enemy.attackSpeed = Math.max(1, enemy.attackSpeed - 1)
      newLog.push('낙인 공명(심연): 보스가 더 광폭해졌다.')
    }
    if (tags.includes('set_iron_protocol')) {
      enemy.stats.def += 2
      enemy.range = Math.max(enemy.range, 4)
      transitionSpawnCount += 1
    }
    if (tags.includes('set_sunk_prophecy')) transitionSpawnCount += 1
    if (tags.includes('set_rot_covenant')) enemy.bossPattern = 'mutator'

    transitionSpawnCount += enemy.bossPattern === 'summoner' ? 2 : enemy.bossPattern === 'predator' ? 1 : 0
    mapAfterTransition = mutateBossArena(state, enemy, enemy.bossPattern)

    newLog.push(`BOSS ${enemy.name}이(가) 2페이즈에 돌입했다!`)
    if (routeTag !== null) newLog.push(`연쇄 반응: ${routeTag}`)
    if (enemy.bossPattern === 'summoner') newLog.push('페이즈 패턴: 하수인 소환')
    else if (enemy.bossPattern === 'mutator') newLog.push('페이즈 패턴: 전장 변형')
    else newLog.push('페이즈 패턴: 광폭 추격')
  }

  let newEnemies = state.enemies.map((e, i) => i === enemyIdx ? enemy : e)
  if (bossTransitioned && transitionSpawnCount > 0) {
    newEnemies = spawnBossAdds(state, newEnemies, enemy, transitionSpawnCount)
    newLog.push(`보스가 하수인 ${transitionSpawnCount}체를 소환했다.`)
  }

  let newItems = state.items
  // Boss drop: guaranteed upgrade but low-floor overpowered drops are suppressed.
  if (enemy.stats.hp <= 0 && enemy.isBoss) {
    let drop: MapItem
    const routeTag = findLatestRouteTag(state.narrative)
    const omenBonus = Math.min(0.25, state.player.omenMarks * 0.1)
    const routeLegendBonus = routeTag === 'abyssal_call'
      ? 0.03
      : routeTag === 'furnace_oath'
        ? 0.02
        : routeTag === 'sunk_prophecy'
          ? 0.015
          : 0
    const legendaryChance = (state.floor >= 8 ? 0.03 : 0) + omenBonus + routeLegendBonus
    if (Math.random() < legendaryChance) {
      // Legendary drop
      drop = Math.random() < 0.5
        ? { pos: { ...enemy.pos }, item: { kind: 'weapon', data: LEGENDARY_WEAPONS[Math.floor(Math.random() * LEGENDARY_WEAPONS.length)] }, ch: '/' }
        : { pos: { ...enemy.pos }, item: { kind: 'armor', data: LEGENDARY_ARMORS[Math.floor(Math.random() * LEGENDARY_ARMORS.length)] }, ch: ']' }
      newLog.push(`★ 환상의 ${drop.item.data.name}을(를) 발견했다! ★`)
    } else {
      const baseBoost = state.floor >= 6 ? 1 : 0
      const routeBoost = routeTag === 'iron_protocol' ? 1 : 0
      const rareBoost = Math.random() < (state.floor >= 5 ? 0.30 : 0.12) ? 1 : 0
      const dropFloor = Math.min(state.floor + baseBoost + rareBoost + routeBoost, TOTAL_FLOORS)
      drop = Math.random() < 0.5
        ? { pos: { ...enemy.pos }, item: { kind: 'weapon', data: weaponForFloor(dropFloor, state.currentTheme.id) }, ch: '/' }
        : { pos: { ...enemy.pos }, item: { kind: 'armor', data: armorForFloor(dropFloor, state.currentTheme.id) }, ch: ']' }
    }
    newItems = [...state.items, drop]
  }

  let projectile = null
  if (isRanged && projectilePath.length > 0) {
    const firstStep = projectilePath[0]
    const dx = Math.sign(firstStep.x - state.player.pos.x)
    const dy = Math.sign(firstStep.y - state.player.pos.y)
    projectile = { path: projectilePath, ...projectileGlyph(player.weapon, dx, dy) }
  }

  let result: GameState = {
    ...state,
    player,
    enemies: newEnemies,
    items: newItems,
    map: mapAfterTransition,
    log: newLog,
    kills: newKills,
    projectile
  }
  if (bossTransitioned) {
    const phaseEvent = getBossPhaseDecisionEvent()
    result = {
      ...result,
      activeEvent: { eventId: phaseEvent.id },
      eventIdx: 0,
      bossPhaseContext: {
        enemyIndex: enemyIdx,
        bossName: enemy.name,
        phase: 2
      }
    }
    result = emitNarrativeMetric(result, 'boss_phase_transition', {
      boss: enemy.name,
      pattern: enemy.bossPattern,
      spawn_count: transitionSpawnCount
    })
  }
  if (enemy.stats.hp <= 0 && enemy.isBoss && result.player.omenMarks > 0) {
    result = {
      ...result,
      player: { ...result.player, omenMarks: Math.max(0, result.player.omenMarks - 1) },
      log: [...result.log, '징조의 문 인장이 소모되며 보상이 증폭됐다!']
    }
  }
  if (enemy.stats.hp <= 0 && enemy.isBoss) {
    if (enemy.bossPhase === 2) {
      result = emitNarrativeMetric(result, 'boss_phase_clear', { boss: enemy.name })
    }
    let narrative = addThemeMark(result.narrative, result.currentTheme.id, 2)
    const markSetResult = resolveMarkSetUnlocks(narrative)
    narrative = markSetResult.narrative
    const nextLog = [...result.log, `낙인 획득: ${result.currentTheme.name} +2 (보스)`]
    for (const setId of markSetResult.unlocked) {
      nextLog.push(`낙인 조합 각성: ${setId}`)
    }
    result = {
      ...result,
      narrative,
      log: nextLog
    }
    result = emitNarrativeMetric(result, 'theme_mark_gain', {
      mark_id: result.currentTheme.id,
      amount: 2,
      reason: 'boss_kill'
    })
    for (const setId of markSetResult.unlocked) {
      result = emitNarrativeMetric(result, 'theme_mark_set_complete', { set_id: setId })
      result = applyMarkSetEffect(result, setId)
    }
  }
  result = checkLevelUp(result)
  return result
}

function enemyAttackPlayer (state: GameState, enemyIdx: number, isRanged: boolean = false): GameState {
  const enemy = { ...state.enemies[enemyIdx] }
  if (!enemy.alive) return state
  if (!enemyAttackReady(state, enemy)) return state

  const player = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]

  const atkPower = enemy.stats.str
  const playerDef = player.stats.def + (player.armor !== null ? player.armor.def : 0)
  const rangePenalty = isRanged ? 0.9 : 1.0
  const roll = Math.random()
  let damage: number

  if (roll < 0.05) {
    damage = 0
    if (isRanged) {
      newLog.push(`${enemy.name}의 원거리 공격이 빗나갔다!`)
    } else {
      newLog.push(`${enemy.name}의 공격이 빗나갔다!`)
    }
  } else {
    damage = Math.max(1, Math.floor((atkPower - playerDef + Math.floor(Math.random() * 5) - 2) * rangePenalty))
    if (roll < 0.15) {
      damage = Math.floor(damage * 1.5)
      if (isRanged) {
        newLog.push(`${enemy.name} 원거리 크리티컬! ${damage} 데미지`)
      } else {
        newLog.push(`${enemy.name} 크리티컬! ${damage} 데미지`)
      }
    } else {
      if (isRanged) {
        newLog.push(`${enemy.name}의 원거리 공격! ${damage} 데미지 받음`)
      } else {
        newLog.push(`${enemy.name}에게 ${damage} 데미지 받음`)
      }
    }
  }

  player.stats.hp -= damage

  let over = state.over
  if (player.stats.hp <= 0) {
    if (player.reviveCharges > 0) {
      player.reviveCharges -= 1
      player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.5))
      over = false
      newLog.push('수호의 석상이 발동했다! 죽음을 피하고 다시 일어섰다!')
    } else {
      player.stats.hp = 0
      over = true
      newLog.push('당신은 쓰러졌다...')
    }
  }

  enemy.nextAttackTurn = state.turns + enemy.attackSpeed
  const enemies = state.enemies.map((e, i) => i === enemyIdx ? enemy : e)

  return { ...state, player, enemies, log: newLog, over }
}

export function hasRangedLineOfSight (state: GameState, x0: number, y0: number, x1: number, y1: number): boolean {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy
  let x = x0
  let y = y0

  while (true) {
    if (x === x1 && y === y1) return true
    if (state.map.tiles[y][x] === Tile.Wall && !(x === x0 && y === y0)) return false

    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }
}

export function findRangedTarget (state: GameState, dx: number, dy: number): number {
  const weaponRange = state.player.weapon !== null ? (state.player.weapon.range ?? 1) : 1
  if (weaponRange <= 1) return -1

  const px = state.player.pos.x
  const py = state.player.pos.y
  let bestIdx = -1
  let bestDist = Infinity

  for (let i = 0; i < state.enemies.length; i++) {
    const e = state.enemies[i]
    if (!e.alive) continue

    const ex = e.pos.x - px
    const ey = e.pos.y - py
    const dist = Math.abs(ex) + Math.abs(ey)

    if (dist < 2 || dist > weaponRange) continue
    if (!state.map.visible[e.pos.y][e.pos.x]) continue

    // Check if enemy is roughly in the direction of movement
    const inDirection = (dx !== 0 && Math.sign(ex) === Math.sign(dx) && Math.abs(ex) >= Math.abs(ey)) ||
      (dy !== 0 && Math.sign(ey) === Math.sign(dy) && Math.abs(ey) >= Math.abs(ex))
    if (!inDirection) continue

    // Check line of sight
    if (!hasRangedLineOfSight(state, px, py, e.pos.x, e.pos.y)) continue

    if (dist < bestDist) {
      bestDist = dist
      bestIdx = i
    }
  }

  return bestIdx
}

export function processEnemyTurns (state: GameState): GameState {
  let current = state
  for (let i = 0; i < current.enemies.length; i++) {
    if (current.over) break
    const enemy = current.enemies[i]
    if (!enemy.alive) continue

    const dist = Math.abs(enemy.pos.x - current.player.pos.x) + Math.abs(enemy.pos.y - current.player.pos.y)
    const isVisible = current.map.visible[enemy.pos.y][enemy.pos.x]
    const enemyRange = enemy.range
    const canAttack = enemyAttackReady(current, enemy)

    if (dist <= Math.max(5, enemyRange + 1) && isVisible) {
      if (enemyRange >= 4) {
        // Ranged enemy: attack from distance, try to maintain distance
        if (canAttack && dist <= enemyRange && hasRangedLineOfSight(current, enemy.pos.x, enemy.pos.y, current.player.pos.x, current.player.pos.y)) {
          current = enemyAttackPlayer(current, i, true)
        } else if (dist < 3) {
          // Too close, try to retreat
          current = moveEnemyAway(current, i)
        } else {
          current = moveEnemyToward(current, i)
        }
      } else if (enemyRange >= 2) {
        // Mid-range enemy: attack from mid distance
        if (canAttack && dist <= enemyRange && dist >= 2 && hasRangedLineOfSight(current, enemy.pos.x, enemy.pos.y, current.player.pos.x, current.player.pos.y)) {
          current = enemyAttackPlayer(current, i, true)
        } else if (dist === 1 && canAttack) {
          // Adjacent: melee attack
          current = enemyAttackPlayer(current, i, false)
        } else {
          current = moveEnemyToward(current, i)
        }
      } else {
        // Melee enemy: original behavior
        if (dist === 1 && canAttack) {
          current = enemyAttackPlayer(current, i, false)
        } else {
          current = moveEnemyToward(current, i)
        }
      }
    } else {
      if (Math.random() < 0.25) {
        current = moveEnemyRandom(current, i)
      }
    }
  }
  return current
}

function isBlocked (state: GameState, x: number, y: number, selfIdx: number): boolean {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true
  if (state.map.tiles[y][x] === Tile.Wall) return true
  if (x === state.player.pos.x && y === state.player.pos.y) return true
  for (let i = 0; i < state.enemies.length; i++) {
    if (i === selfIdx) continue
    const e = state.enemies[i]
    if (e.alive && e.pos.x === x && e.pos.y === y) return true
  }
  return false
}

function moveEnemyToward (state: GameState, idx: number): GameState {
  const enemy = state.enemies[idx]
  const dx = state.player.pos.x - enemy.pos.x
  const dy = state.player.pos.y - enemy.pos.y
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  let moveX = 0
  let moveY = 0

  if (absDx >= absDy) {
    moveX = dx > 0 ? 1 : -1
    moveY = 0
  } else {
    moveX = 0
    moveY = dy > 0 ? 1 : -1
  }

  const nx = enemy.pos.x + moveX
  const ny = enemy.pos.y + moveY

  if (nx === state.player.pos.x && ny === state.player.pos.y) {
    if (enemyAttackReady(state, enemy)) return enemyAttackPlayer(state, idx)
    return state
  }

  if (!isBlocked(state, nx, ny, idx)) {
    const newEnemies = state.enemies.map((e, i) => {
      if (i === idx) {
        return { ...e, pos: { x: nx, y: ny } }
      }
      return e
    })
    return { ...state, enemies: newEnemies }
  }

  const altNx = enemy.pos.x + (moveY !== 0 ? (dx > 0 ? 1 : dx < 0 ? -1 : 0) : 0)
  const altNy = enemy.pos.y + (moveX !== 0 ? (dy > 0 ? 1 : dy < 0 ? -1 : 0) : 0)

  if (altNx === state.player.pos.x && altNy === state.player.pos.y) {
    if (enemyAttackReady(state, enemy)) return enemyAttackPlayer(state, idx)
    return state
  }

  if (!isBlocked(state, altNx, altNy, idx)) {
    const newEnemies = state.enemies.map((e, i) => {
      if (i === idx) {
        return { ...e, pos: { x: altNx, y: altNy } }
      }
      return e
    })
    return { ...state, enemies: newEnemies }
  }

  return state
}

function moveEnemyRandom (state: GameState, idx: number): GameState {
  const enemy = state.enemies[idx]
  const dirs = [
    { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: 0 }, { x: 1, y: 0 }
  ]
  const shuffled = dirs.sort(() => Math.random() - 0.5)

  for (const dir of shuffled) {
    const nx = enemy.pos.x + dir.x
    const ny = enemy.pos.y + dir.y
    if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) continue
    const tile = state.map.tiles[ny][nx]
    if (tile !== Tile.Wall) {
      if (!isBlocked(state, nx, ny, idx)) {
        const newEnemies = state.enemies.map((e, i) => {
          if (i === idx) {
            return { ...e, pos: { x: nx, y: ny } }
          }
          return e
        })
        return { ...state, enemies: newEnemies }
      }
    }
  }
  return state
}

function moveEnemyAway (state: GameState, idx: number): GameState {
  const enemy = state.enemies[idx]
  const dx = enemy.pos.x - state.player.pos.x
  const dy = enemy.pos.y - state.player.pos.y

  // Try to move away from player
  let moveX = 0
  let moveY = 0
  if (Math.abs(dx) >= Math.abs(dy)) {
    moveX = dx >= 0 ? 1 : -1
  } else {
    moveY = dy >= 0 ? 1 : -1
  }

  const nx = enemy.pos.x + moveX
  const ny = enemy.pos.y + moveY

  if (!isBlocked(state, nx, ny, idx)) {
    const newEnemies = state.enemies.map((e, i) => {
      if (i === idx) return { ...e, pos: { x: nx, y: ny } }
      return e
    })
    return { ...state, enemies: newEnemies }
  }

  // Try perpendicular
  const altNx = enemy.pos.x + (moveY !== 0 ? (dx >= 0 ? 1 : -1) : 0)
  const altNy = enemy.pos.y + (moveX !== 0 ? (dy >= 0 ? 1 : -1) : 0)

  if (!isBlocked(state, altNx, altNy, idx)) {
    const newEnemies = state.enemies.map((e, i) => {
      if (i === idx) return { ...e, pos: { x: altNx, y: altNy } }
      return e
    })
    return { ...state, enemies: newEnemies }
  }

  // Can't retreat, just attack if in range
  const dist = Math.abs(enemy.pos.x - state.player.pos.x) + Math.abs(enemy.pos.y - state.player.pos.y)
  if (dist <= enemy.range && enemyAttackReady(state, enemy)) {
    return enemyAttackPlayer(state, idx, dist > 1)
  }

  return state
}
