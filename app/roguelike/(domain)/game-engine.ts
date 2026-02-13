import {
  type GameState, type Player, type InvItem, type MapItem, type Enemy, type ItemRarity,
  Tile, MAP_WIDTH, MAP_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT, PANEL_WIDTH, MAX_INVENTORY, TOTAL_FLOORS,
  LEGENDARY_WEAPONS, LEGENDARY_ARMORS,
  createPlayer, xpForLevel, selectThemeForFloor, weaponForFloor, armorForFloor, potionForFloor,
  generateShopItems
} from './types'
import { generateDungeon, computeFOV } from './dungeon'
import { getEventById } from './events'

export type { GameState } from './types'

export const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[91m',
  green: '\x1b[92m',
  yellow: '\x1b[93m',
  blue: '\x1b[94m',
  magenta: '\x1b[95m',
  cyan: '\x1b[96m',
  white: '\x1b[97m',
  gray: '\x1b[90m',
  darkRed: '\x1b[31m',
  darkGreen: '\x1b[32m',
  darkYellow: '\x1b[33m',
  darkCyan: '\x1b[36m',
  darkMagenta: '\x1b[35m'
}

function rarityColor (rarity: ItemRarity | undefined): string {
  if (rarity === undefined || rarity === 'common') return C.white
  if (rarity === 'uncommon') return C.green
  if (rarity === 'rare') return C.blue
  if (rarity === 'epic') return C.magenta
  if (rarity === 'legendary') return C.bold + C.yellow
  return C.white
}

function stripAnsi (str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[\d+m/g, '')
}

function charWidth (ch: string): number {
  const code = ch.codePointAt(0)
  if (code === undefined) return 1
  if (
    (code >= 0x1100 && code <= 0x115F) ||
    (code >= 0x2E80 && code <= 0x303E) ||
    (code >= 0x3040 && code <= 0x33BF) ||
    (code >= 0x3400 && code <= 0x4DBF) ||
    (code >= 0x4E00 && code <= 0x9FFF) ||
    (code >= 0xAC00 && code <= 0xD7AF) ||
    (code >= 0xF900 && code <= 0xFAFF) ||
    (code >= 0xFE30 && code <= 0xFE4F) ||
    (code >= 0xFF01 && code <= 0xFF60) ||
    (code >= 0xFFE0 && code <= 0xFFE6) ||
    (code >= 0x20000 && code <= 0x2FA1F)
  ) {
    return 2
  }
  return 1
}

function displayWidth (str: string): number {
  const stripped = stripAnsi(str)
  let w = 0
  for (const ch of stripped) {
    w += charWidth(ch)
  }
  return w
}

function sliceDisplay (str: string, maxWidth: number): string {
  let w = 0
  let result = ''
  let pos = 0
  while (pos < str.length) {
    if (str.charCodeAt(pos) === 0x1b && pos + 1 < str.length && str[pos + 1] === '[') {
      const mIdx = str.indexOf('m', pos + 2)
      if (mIdx !== -1) {
        result += str.slice(pos, mIdx + 1)
        pos = mIdx + 1
        continue
      }
    }
    const ch = str[pos]
    const cw = charWidth(ch)
    if (w + cw > maxWidth) break
    result += ch
    w += cw
    pos++
  }
  return result + C.reset
}

function padEndDisplay (str: string, targetWidth: number): string {
  const w = displayWidth(str)
  if (w >= targetWidth) return sliceDisplay(str, targetWidth)
  return str + ' '.repeat(targetWidth - w)
}

function padPanel (s: string): string {
  return padEndDisplay(s, PANEL_WIDTH)
}

export function initFloor (floor: number, existingPlayer: Player | null, usedThemeIds: string[] = []): GameState {
  const theme = selectThemeForFloor(floor, usedThemeIds)
  const newUsedThemeIds = [...usedThemeIds, theme.id].slice(-3)
  const { map, playerPos, enemies, items } = generateDungeon(floor, theme)
  const player = existingPlayer === null
    ? createPlayer(playerPos)
    : { ...existingPlayer, pos: { ...playerPos } }

  computeFOV(map, player.pos.x, player.pos.y)

  const log: string[] = []
  if (floor === 1) {
    log.push('\uB358\uC804\uC5D0 \uC785\uC7A5\uD588\uB2E4...')
  } else {
    log.push(`${floor}\uCE35\uC5D0 \uB3C4\uCC29\uD588\uB2E4...`)
  }
  const flavorText = theme.flavorTexts[Math.floor(Math.random() * theme.flavorTexts.length)]
  log.push(flavorText)
  if (floor === 10) {
    log.push('\uAC70\uB300\uD55C \uC6A9\uC758 \uC228\uC18C\uB9AC\uAC00 \uB4E4\uB9B0\uB2E4...')
  }

  return {
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
    shopItems: generateShopItems(floor),
    shopIdx: 0,
    usedObjects: [],
    activeEvent: null,
    eventIdx: 0
  }
}

function checkLevelUp (state: GameState): GameState {
  const p = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]
  let changed = false

  while (p.xp >= p.xpNext) {
    p.xp -= p.xpNext
    p.level += 1
    const hpGain = 7 + Math.floor(Math.random() * 8)
    const strGain = 1 + Math.floor(Math.random() * 3)
    const defGain = Math.floor(Math.random() * 3)
    p.stats.maxHp += hpGain
    p.stats.str += strGain
    p.stats.def += defGain
    p.stats.hp = p.stats.maxHp
    p.xpNext = xpForLevel(p.level)
    newLog.push(`\uB808\uBCA8 \uC5C5! Lv.${p.level} (HP+${hpGain} STR+${strGain} DEF+${defGain})`)
    changed = true
  }

  if (changed) {
    return { ...state, player: p, log: newLog }
  }
  return state
}

function attackEnemy (state: GameState, enemyIdx: number, isRanged: boolean = false): GameState {
  const enemy = { ...state.enemies[enemyIdx], stats: { ...state.enemies[enemyIdx].stats } }
  const player = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]

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

  if (enemy.stats.hp <= 0) {
    enemy.alive = false
    newKills += 1
    player.xp += enemy.xp
    if (enemy.isBoss) {
      newLog.push(`BOSS ${enemy.name}\uC744(\uB97C) \uCC98\uCE58\uD588\uB2E4!`)
      const bossGold = state.floor * 20 + Math.floor(Math.random() * 30)
      player.gold += bossGold
      newLog.push(`${bossGold} Gold \uD68D\uB4DD!`)
    } else {
      newLog.push(`${enemy.name}를 처치했다!`)
      // Monster gold drop (30% chance)
      if (Math.random() < 0.3) {
        const monsterGold = state.floor * 2 + Math.floor(Math.random() * 5)
        player.gold += monsterGold
        newLog.push(`${monsterGold} Gold 획득!`)
      }
    }
  }

  const newEnemies = state.enemies.map((e, i) => i === enemyIdx ? enemy : e)

  let newItems = state.items
  // Boss drop: guaranteed high-tier weapon or armor, 10% legendary
  if (enemy.stats.hp <= 0 && enemy.isBoss) {
    let drop: MapItem
    if (Math.random() < 0.1) {
      // Legendary drop
      drop = Math.random() < 0.5
        ? { pos: { ...enemy.pos }, item: { kind: 'weapon', data: LEGENDARY_WEAPONS[Math.floor(Math.random() * LEGENDARY_WEAPONS.length)] }, ch: '/' }
        : { pos: { ...enemy.pos }, item: { kind: 'armor', data: LEGENDARY_ARMORS[Math.floor(Math.random() * LEGENDARY_ARMORS.length)] }, ch: ']' }
      newLog.push(`★ 환상의 ${drop.item.data.name}을(를) 발견했다! ★`)
    } else {
      const dropFloor = Math.min(state.floor + 2, TOTAL_FLOORS)
      drop = Math.random() < 0.5
        ? { pos: { ...enemy.pos }, item: { kind: 'weapon', data: weaponForFloor(dropFloor, state.currentTheme.id) }, ch: '/' }
        : { pos: { ...enemy.pos }, item: { kind: 'armor', data: armorForFloor(dropFloor, state.currentTheme.id) }, ch: ']' }
    }
    newItems = [...state.items, drop]
  }

  let result: GameState = { ...state, player, enemies: newEnemies, items: newItems, log: newLog, kills: newKills }
  result = checkLevelUp(result)
  return result
}

function enemyAttackPlayer (state: GameState, enemyIdx: number, isRanged: boolean = false): GameState {
  const enemy = state.enemies[enemyIdx]
  if (!enemy.alive) return state

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
    player.stats.hp = 0
    over = true
    newLog.push('\uB2F9\uC2E0\uC740 \uC4F0\uB7EC\uC84C\uB2E4...')
  }

  return { ...state, player, log: newLog, over }
}

function hasRangedLineOfSight (state: GameState, x0: number, y0: number, x1: number, y1: number): boolean {
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

function findRangedTarget (state: GameState, dx: number, dy: number): number {
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

function processEnemyTurns (state: GameState): GameState {
  let current = state
  for (let i = 0; i < current.enemies.length; i++) {
    if (current.over) break
    const enemy = current.enemies[i]
    if (!enemy.alive) continue

    const dist = Math.abs(enemy.pos.x - current.player.pos.x) + Math.abs(enemy.pos.y - current.player.pos.y)
    const isVisible = current.map.visible[enemy.pos.y][enemy.pos.x]
    const enemyRange = enemy.range

    if (dist <= Math.max(5, enemyRange + 1) && isVisible) {
      if (enemyRange >= 4) {
        // Ranged enemy: attack from distance, try to maintain distance
        if (dist <= enemyRange && hasRangedLineOfSight(current, enemy.pos.x, enemy.pos.y, current.player.pos.x, current.player.pos.y)) {
          current = enemyAttackPlayer(current, i, true)
        } else if (dist < 3) {
          // Too close, try to retreat
          current = moveEnemyAway(current, i)
        } else {
          current = moveEnemyToward(current, i)
        }
      } else if (enemyRange >= 2) {
        // Mid-range enemy: attack from mid distance
        if (dist <= enemyRange && dist >= 2 && hasRangedLineOfSight(current, enemy.pos.x, enemy.pos.y, current.player.pos.x, current.player.pos.y)) {
          current = enemyAttackPlayer(current, i, true)
        } else if (dist === 1) {
          // Adjacent: melee attack
          current = enemyAttackPlayer(current, i, false)
        } else {
          current = moveEnemyToward(current, i)
        }
      } else {
        // Melee enemy: original behavior
        if (dist === 1) {
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
    return enemyAttackPlayer(state, idx)
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
    return enemyAttackPlayer(state, idx)
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
    if (tile === Tile.Floor || tile === Tile.Door) {
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
  if (dist <= enemy.range) {
    return enemyAttackPlayer(state, idx, dist > 1)
  }

  return state
}

function pickUpItems (state: GameState): GameState {
  const px = state.player.pos.x
  const py = state.player.pos.y
  let found = -1
  for (let i = 0; i < state.items.length; i++) {
    if (state.items[i].pos.x === px && state.items[i].pos.y === py) {
      found = i
      break
    }
  }

  if (found === -1) return state

  const mapItem = state.items[found]
  const newLog = [...state.log]
  const posKey = `${px},${py}`

  // Event trigger
  if (mapItem.item.kind === 'potion' && mapItem.item.data.name.startsWith('event:')) {
    if (state.usedObjects.includes(posKey)) return state
    const eventId = mapItem.item.data.name.slice(6)
    const eventDef = getEventById(eventId)
    if (eventDef === undefined) return state
    const newUsedObjects = [...state.usedObjects, posKey]
    const newItems = state.items.filter((_, i) => i !== found)
    const eventLog = [...state.log, `${C.magenta}[이벤트] ${eventDef.name}${C.reset}`]
    return {
      ...state,
      items: newItems,
      log: eventLog,
      usedObjects: newUsedObjects,
      activeEvent: { eventId },
      eventIdx: 0
    }
  }

  // Theme-specific object
  if (mapItem.item.kind === 'potion' && mapItem.item.data.name.startsWith('themeObj:')) {
    if (state.usedObjects.includes(posKey)) return state
    const newUsedObjects = [...state.usedObjects, posKey]
    const newItems = state.items.filter((_, i) => i !== found)
    const player = { ...state.player, stats: { ...state.player.stats } }
    const theme = state.currentTheme
    const obj = theme.themeObject
    if (obj === undefined) return state

    newLog.push(obj.logMessage)

    switch (obj.effectType) {
      case 'heal30':
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + Math.floor(player.stats.maxHp * 0.3))
        break
      case 'heal50':
        player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + Math.floor(player.stats.maxHp * 0.5))
        break
      case 'fullHeal':
        player.stats.hp = player.stats.maxHp
        break
      case 'buffStr':
        player.stats.str += (obj.effectValue ?? 2)
        newLog.push(`STR +${obj.effectValue ?? 2}!`)
        break
      case 'buffDef':
        player.stats.def += (obj.effectValue ?? 2)
        newLog.push(`DEF +${obj.effectValue ?? 2}!`)
        break
      case 'buffMaxHp': {
        const val = obj.effectValue ?? 8
        player.stats.maxHp += val
        player.stats.hp += val
        newLog.push(`MaxHP +${val}!`)
        break
      }
      case 'gold': {
        const goldAmt = (obj.effectValue ?? 10) * state.floor
        player.gold += goldAmt
        newLog.push(`${goldAmt} Gold 획득!`)
        break
      }
      case 'xp': {
        const xpAmt = (obj.effectValue ?? 15) * state.floor
        player.xp += xpAmt
        newLog.push(`${xpAmt} XP 획득!`)
        break
      }
      case 'gamble': {
        const successRate = (obj.effectValue ?? 50) / 100
        if (Math.random() < successRate) {
          const buffRoll = Math.random()
          if (buffRoll < 0.33) {
            player.stats.str += 2
            newLog.push('행운! STR +2!')
          } else if (buffRoll < 0.66) {
            player.stats.def += 2
            newLog.push('행운! DEF +2!')
          } else {
            player.stats.maxHp += 10
            player.stats.hp += 10
            newLog.push('행운! MaxHP +10!')
          }
        } else {
          player.stats.hp = Math.max(1, Math.floor(player.stats.hp * 0.7))
          newLog.push('불운! HP 감소...')
        }
        break
      }
      case 'randomItem': {
        if (player.inventory.length < MAX_INVENTORY) {
          const isWeapon = Math.random() < 0.5
          if (isWeapon) {
            const wpn = weaponForFloor(state.floor, state.currentTheme.id)
            player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
            newLog.push(`${wpn.name} 발견!`)
          } else {
            const arm = armorForFloor(state.floor, state.currentTheme.id)
            player.inventory = [...player.inventory, { kind: 'armor', data: arm }]
            newLog.push(`${arm.name} 발견!`)
          }
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
        break
      }
      case 'teleport': {
        // Will handle teleport after returning state
        const rooms = state.map.rooms
        if (rooms.length > 1) {
          const randomRoom = rooms[Math.floor(Math.random() * rooms.length)]
          const cx = randomRoom.x + Math.floor(randomRoom.w / 2)
          const cy = randomRoom.y + Math.floor(randomRoom.h / 2)
          player.pos = { x: cx, y: cy }
          computeFOV(state.map, cx, cy)
          newLog.push('다른 곳으로 이동했다!')
        }
        break
      }
      default:
        break
    }

    return { ...state, player, items: newItems, log: newLog, usedObjects: newUsedObjects }
  }

  // Special room marker
  if (mapItem.item.kind === 'potion' && mapItem.item.data.name.startsWith('specialRoom:')) {
    if (state.usedObjects.includes(posKey)) return state
    const newUsedObjects = [...state.usedObjects, posKey]
    const newItems = state.items.filter((_, i) => i !== found)
    const player = { ...state.player, stats: { ...state.player.stats } }
    const theme = state.currentTheme

    if (theme.specialRoomDesc !== undefined) {
      newLog.push(`${C.cyan}[특수 방]${C.reset} ${theme.specialRoomDesc}`)
    }

    // Special room bonus: random buff + item
    const buffRoll = Math.random()
    if (buffRoll < 0.33) {
      player.stats.str += 1
      newLog.push('이 방의 기운이 힘을 준다! STR +1!')
    } else if (buffRoll < 0.66) {
      player.stats.def += 1
      newLog.push('이 방의 기운이 방어를 올린다! DEF +1!')
    } else {
      player.stats.maxHp += 5
      player.stats.hp += 5
      newLog.push('이 방의 기운이 생명력을 준다! MaxHP +5!')
    }

    // Bonus item from special room
    if (player.inventory.length < MAX_INVENTORY) {
      const isWeapon = Math.random() < 0.5
      if (isWeapon) {
        const wpn = weaponForFloor(Math.min(state.floor + 1, TOTAL_FLOORS), state.currentTheme.id)
        player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
        newLog.push(`${rarityColor(wpn.rarity)}${wpn.name}${C.reset} 발견!`)
      } else {
        const arm = armorForFloor(Math.min(state.floor + 1, TOTAL_FLOORS), state.currentTheme.id)
        player.inventory = [...player.inventory, { kind: 'armor', data: arm }]
        newLog.push(`${rarityColor(arm.rarity)}${arm.name}${C.reset} 발견!`)
      }
    }

    return { ...state, player, items: newItems, log: newLog, usedObjects: newUsedObjects }
  }

  // Treasure chest
  if (mapItem.ch === 'C') {
    if (state.usedObjects.includes(posKey)) return state
    const newUsedObjects = [...state.usedObjects, posKey]
    const newItems = state.items.filter((_, i) => i !== found)
    const player = { ...state.player, stats: { ...state.player.stats } }
    newLog.push('보물상자를 열었다!')
    const roll = Math.random()
    if (roll < 0.5) {
      // Higher tier weapon or armor
      const dropFloor = Math.min(state.floor + 1, TOTAL_FLOORS)
      const isWeapon = Math.random() < 0.5
      if (isWeapon) {
        const wpn = weaponForFloor(dropFloor, state.currentTheme.id)
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
          newLog.push(`${rarityColor(wpn.rarity)}${wpn.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      } else {
        const arm = armorForFloor(dropFloor, state.currentTheme.id)
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'armor', data: arm }]
          newLog.push(`${rarityColor(arm.rarity)}${arm.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      }
    } else if (roll < 0.75) {
      // Rare+ equipment (force uncommon or better)
      const isWeapon = Math.random() < 0.5
      if (isWeapon) {
        let wpn = weaponForFloor(state.floor, state.currentTheme.id)
        while (wpn.rarity === 'common' || wpn.rarity === undefined) {
          wpn = weaponForFloor(state.floor, state.currentTheme.id)
        }
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
          newLog.push(`${rarityColor(wpn.rarity)}${wpn.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      } else {
        let arm = armorForFloor(state.floor, state.currentTheme.id)
        while (arm.rarity === 'common' || arm.rarity === undefined) {
          arm = armorForFloor(state.floor, state.currentTheme.id)
        }
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'armor', data: arm }]
          newLog.push(`${rarityColor(arm.rarity)}${arm.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      }
    } else if (roll < 0.90) {
      // Gold
      const goldAmount = state.floor * 15
      player.gold += goldAmount
      newLog.push(`${goldAmount} Gold 획득!`)
    } else {
      // 2 potions
      const pot1 = potionForFloor(state.floor)
      const pot2 = potionForFloor(state.floor)
      if (player.inventory.length < MAX_INVENTORY) {
        player.inventory = [...player.inventory, { kind: 'potion', data: pot1 }]
        newLog.push(`${pot1.name} 획득!`)
      }
      if (player.inventory.length < MAX_INVENTORY) {
        player.inventory = [...player.inventory, { kind: 'potion', data: pot2 }]
        newLog.push(`${pot2.name} 획득!`)
      }
    }
    // 5% chance of legendary from chest
    if (Math.random() < 0.05 && player.inventory.length < MAX_INVENTORY) {
      const isWeapon = Math.random() < 0.5
      if (isWeapon) {
        const leg = LEGENDARY_WEAPONS[Math.floor(Math.random() * LEGENDARY_WEAPONS.length)]
        player.inventory = [...player.inventory, { kind: 'weapon', data: leg }]
        newLog.push(`★ 환상의 ${leg.name}을(를) 발견했다! ★`)
      } else {
        const leg = LEGENDARY_ARMORS[Math.floor(Math.random() * LEGENDARY_ARMORS.length)]
        player.inventory = [...player.inventory, { kind: 'armor', data: leg }]
        newLog.push(`★ 환상의 ${leg.name}을(를) 발견했다! ★`)
      }
    }
    return { ...state, player, items: newItems, log: newLog, usedObjects: newUsedObjects }
  }

  // Fountain (full HP restore)
  if (mapItem.ch === '~') {
    if (state.usedObjects.includes(posKey)) return state
    const newUsedObjects = [...state.usedObjects, posKey]
    const newItems = state.items.filter((_, i) => i !== found)
    const player = { ...state.player, stats: { ...state.player.stats } }
    player.stats.hp = player.stats.maxHp
    newLog.push('회복의 샘에서 기운이 솟아오른다! HP 전체 회복!')
    return { ...state, player, items: newItems, log: newLog, usedObjects: newUsedObjects }
  }

  // Shrine (permanent buff)
  if (mapItem.ch === '^') {
    if (state.usedObjects.includes(posKey)) return state
    const newUsedObjects = [...state.usedObjects, posKey]
    const newItems = state.items.filter((_, i) => i !== found)
    const player = { ...state.player, stats: { ...state.player.stats } }
    const buffRoll = Math.random()
    if (buffRoll < 0.33) {
      player.stats.str += 2
      newLog.push('축복의 제단! STR +2!')
    } else if (buffRoll < 0.66) {
      player.stats.def += 2
      newLog.push('축복의 제단! DEF +2!')
    } else {
      player.stats.maxHp += 10
      player.stats.hp += 10
      newLog.push('축복의 제단! MaxHP +10!')
    }
    return { ...state, player, items: newItems, log: newLog, usedObjects: newUsedObjects }
  }

  // Cursed altar (70% reward, 30% penalty)
  if (mapItem.ch === '?') {
    if (state.usedObjects.includes(posKey)) return state
    const newUsedObjects = [...state.usedObjects, posKey]
    const newItems = state.items.filter((_, i) => i !== found)
    const player = { ...state.player, stats: { ...state.player.stats } }
    if (Math.random() < 0.7) {
      // Reward: rare+ item
      const isWeapon = Math.random() < 0.5
      if (isWeapon) {
        let wpn = weaponForFloor(state.floor, state.currentTheme.id)
        while (wpn.rarity === 'common' || wpn.rarity === undefined) {
          wpn = weaponForFloor(state.floor, state.currentTheme.id)
        }
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
          newLog.push(`저주 제단에서 보상이! ${rarityColor(wpn.rarity)}${wpn.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      } else {
        let arm = armorForFloor(state.floor, state.currentTheme.id)
        while (arm.rarity === 'common' || arm.rarity === undefined) {
          arm = armorForFloor(state.floor, state.currentTheme.id)
        }
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'armor', data: arm }]
          newLog.push(`저주 제단에서 보상이! ${rarityColor(arm.rarity)}${arm.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      }
    } else {
      // Penalty: HP halved
      player.stats.hp = Math.max(1, Math.floor(player.stats.hp / 2))
      newLog.push('저주 제단의 저주! HP가 절반으로...')
    }
    return { ...state, player, items: newItems, log: newLog, usedObjects: newUsedObjects }
  }

  // Gold pickup
  if (mapItem.ch === '$') {
    const goldMatch = mapItem.item.data.name.match(/(\d+)/)
    const goldAmount = goldMatch !== null ? parseInt(goldMatch[1], 10) : 10
    const newPlayer = { ...state.player, gold: state.player.gold + goldAmount }
    newLog.push(`${goldAmount} Gold 획득!`)
    const newItems = state.items.filter((_, i) => i !== found)
    return { ...state, player: newPlayer, items: newItems, log: newLog }
  }

  // Normal item pickup
  if (state.player.inventory.length >= MAX_INVENTORY) {
    newLog.push('인벤토리가 가득 찼다')
    return { ...state, log: newLog }
  }

  const newInventory = [...state.player.inventory, mapItem.item]
  const itemName = getItemName(mapItem.item)
  const rColor = mapItem.item.kind === 'weapon'
    ? rarityColor(mapItem.item.data.rarity)
    : mapItem.item.kind === 'armor'
      ? rarityColor(mapItem.item.data.rarity)
      : C.green
  // Legendary special message
  const itemRarity = mapItem.item.kind === 'weapon' ? mapItem.item.data.rarity : mapItem.item.kind === 'armor' ? mapItem.item.data.rarity : undefined
  if (itemRarity === 'legendary') {
    newLog.push(`★ 환상의 ${itemName}을(를) 발견했다! ★`)
  } else {
    newLog.push(`${rColor}${itemName}${C.reset} 획득!`)
  }

  const newItems = state.items.filter((_, i) => i !== found)
  const newPlayer = { ...state.player, inventory: newInventory }

  return { ...state, player: newPlayer, items: newItems, log: newLog }
}

function getItemName (item: InvItem): string {
  if (item.kind === 'weapon') return item.data.name
  if (item.kind === 'armor') return item.data.name
  return item.data.name
}

export function useItem (state: GameState, idx: number): GameState {
  if (idx < 0 || idx >= state.player.inventory.length) return state

  const item = state.player.inventory[idx]
  const newLog = [...state.log]
  const player = { ...state.player, stats: { ...state.player.stats } }

  if (item.kind === 'weapon') {
    if (player.weapon !== null && player.weapon.name === item.data.name && player.weapon.atk === item.data.atk) {
      player.weapon = null
      newLog.push(`${item.data.name} \uD574\uC81C!`)
      return { ...state, player, log: newLog }
    }
    const newInventory = player.inventory.filter((_, i) => i !== idx)
    player.inventory = newInventory
    if (player.weapon !== null) {
      player.inventory = [...player.inventory, { kind: 'weapon' as const, data: player.weapon }]
    }
    player.weapon = item.data
    newLog.push(`${item.data.name} \uC7A5\uCC29!`)
  } else if (item.kind === 'armor') {
    if (player.armor !== null && player.armor.name === item.data.name && player.armor.def === item.data.def) {
      player.armor = null
      newLog.push(`${item.data.name} \uD574\uC81C!`)
      return { ...state, player, log: newLog }
    }
    const newInventory = player.inventory.filter((_, i) => i !== idx)
    player.inventory = newInventory
    if (player.armor !== null) {
      player.inventory = [...player.inventory, { kind: 'armor' as const, data: player.armor }]
    }
    player.armor = item.data
    newLog.push(`${item.data.name} \uC7A5\uCC29!`)
  } else if (item.kind === 'potion') {
    const newInventory = player.inventory.filter((_, i) => i !== idx)
    player.inventory = newInventory
    if (item.data.healType === 'hp') {
      const heal = Math.min(item.data.value, player.stats.maxHp - player.stats.hp)
      player.stats.hp += heal
      newLog.push(`\uCCB4\uB825 \uD3EC\uC158\uC73C\uB85C ${heal} \uD68C\uBCF5!`)
    } else {
      player.stats.str += item.data.value
      newLog.push(`STR +${item.data.value}!`)
    }
  }

  return { ...state, player, log: newLog }
}

export function buyShopItem (state: GameState, idx: number): GameState {
  if (idx < 0 || idx >= state.shopItems.length) return state
  const shopItem = state.shopItems[idx]
  if (shopItem.sold) return state

  const newLog = [...state.log]
  const player = { ...state.player, stats: { ...state.player.stats } }

  if (player.gold < shopItem.price) {
    newLog.push('골드가 부족하다')
    return { ...state, log: newLog }
  }

  if (player.inventory.length >= MAX_INVENTORY) {
    newLog.push('인벤토리가 가득 찼다')
    return { ...state, log: newLog }
  }

  player.gold -= shopItem.price
  player.inventory = [...player.inventory, shopItem.item]
  const itemName = getItemName(shopItem.item)
  newLog.push(`${itemName} 구매! (-${shopItem.price}G)`)

  const newShopItems = state.shopItems.map((si, i) =>
    i === idx ? { ...si, sold: true } : si
  )

  return { ...state, player, shopItems: newShopItems, log: newLog }
}

export function resolveEvent (state: GameState): GameState {
  if (state.activeEvent === null) return state
  const eventDef = getEventById(state.activeEvent.eventId)
  if (eventDef === undefined) return { ...state, activeEvent: null, eventIdx: 0 }

  const choice = eventDef.choices[state.eventIdx]
  if (choice === undefined) return { ...state, activeEvent: null, eventIdx: 0 }

  // Check requiresGold
  if (choice.requiresGold !== undefined && state.player.gold < choice.requiresGold) {
    return {
      ...state,
      log: [...state.log, '골드가 부족하다']
    }
  }

  // Check requiresHp
  if (choice.requiresHp !== undefined && state.player.stats.hp <= choice.requiresHp) {
    return {
      ...state,
      log: [...state.log, 'HP가 부족하다']
    }
  }

  const outcome = eventDef.resolve(state.eventIdx, state)
  const player = { ...state.player, stats: { ...state.player.stats }, inventory: [...state.player.inventory] }
  const newLog = [...state.log, ...outcome.log]

  // Apply stat changes
  if (outcome.hpChange !== undefined) {
    player.stats.hp = Math.max(1, Math.min(player.stats.maxHp, player.stats.hp + outcome.hpChange))
  }
  if (outcome.maxHpChange !== undefined) {
    player.stats.maxHp += outcome.maxHpChange
    player.stats.hp += outcome.maxHpChange
  }
  if (outcome.strChange !== undefined) {
    player.stats.str = Math.max(1, player.stats.str + outcome.strChange)
  }
  if (outcome.defChange !== undefined) {
    player.stats.def = Math.max(0, player.stats.def + outcome.defChange)
  }
  if (outcome.goldChange !== undefined) {
    player.gold = Math.max(0, player.gold + outcome.goldChange)
  }
  if (outcome.xpChange !== undefined) {
    player.xp = Math.max(0, player.xp + outcome.xpChange)
  }
  if (outcome.fullHeal === true) {
    player.stats.hp = player.stats.maxHp
  }
  if (outcome.giveItem !== undefined && player.inventory.length < MAX_INVENTORY) {
    player.inventory = [...player.inventory, outcome.giveItem]
    const itemName = outcome.giveItem.data.name
    newLog.push(`${itemName} 획득!`)
  }

  let result: GameState = {
    ...state,
    player,
    log: newLog,
    activeEvent: null,
    eventIdx: 0
  }

  // Teleport to random room
  if (outcome.teleport === true && state.map.rooms.length > 1) {
    const rooms = state.map.rooms
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)]
    const cx = randomRoom.x + Math.floor(randomRoom.w / 2)
    const cy = randomRoom.y + Math.floor(randomRoom.h / 2)
    result = { ...result, player: { ...result.player, pos: { x: cx, y: cy } } }
    computeFOV(result.map, cx, cy)
  }

  // Check level up from XP gain
  result = checkLevelUp(result)

  // Check if player died
  if (result.player.stats.hp <= 0) {
    result = { ...result, over: true, player: { ...result.player, stats: { ...result.player.stats, hp: 0 } } }
    result.log = [...result.log, '당신은 쓰러졌다...']
  }

  return result
}

export function cancelEvent (state: GameState): GameState {
  if (state.activeEvent === null) return state
  return { ...state, activeEvent: null, eventIdx: 0 }
}

export function movePlayer (state: GameState, dx: number, dy: number): GameState {
  const nx = state.player.pos.x + dx
  const ny = state.player.pos.y + dy

  if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) {
    // Try ranged attack even if can't move
    const rangedTarget = findRangedTarget(state, dx, dy)
    if (rangedTarget !== -1) {
      let result = attackEnemy(state, rangedTarget, true)
      result = { ...result, turns: result.turns + 1 }
      result = processEnemyTurns(result)
      computeFOV(result.map, result.player.pos.x, result.player.pos.y)
      return result
    }
    return state
  }

  // Melee attack on adjacent enemy
  for (let i = 0; i < state.enemies.length; i++) {
    const e = state.enemies[i]
    if (e.alive && e.pos.x === nx && e.pos.y === ny) {
      let result = attackEnemy(state, i, false)
      result = { ...result, turns: result.turns + 1 }
      result = processEnemyTurns(result)
      computeFOV(result.map, result.player.pos.x, result.player.pos.y)
      return result
    }
  }

  // Can't move into wall - try ranged attack
  if (state.map.tiles[ny][nx] === Tile.Wall) {
    const rangedTarget = findRangedTarget(state, dx, dy)
    if (rangedTarget !== -1) {
      let result = attackEnemy(state, rangedTarget, true)
      result = { ...result, turns: result.turns + 1 }
      result = processEnemyTurns(result)
      computeFOV(result.map, result.player.pos.x, result.player.pos.y)
      return result
    }
    return state
  }

  const newPlayer = { ...state.player, pos: { x: nx, y: ny } }
  let result: GameState = { ...state, player: newPlayer, turns: state.turns + 1 }

  result = pickUpItems(result)

  // Check if on shop tile
  if (result.map.tiles[ny][nx] === Tile.Shop && !result.shopOpen) {
    result = { ...result, log: [...result.log, '상점이다! S키로 열기'] }
  }

  result = processEnemyTurns(result)
  computeFOV(result.map, result.player.pos.x, result.player.pos.y)

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
      return { ...state, log: [...state.log, '\uC544\uC9C1 \uC801\uC774 \uB0A8\uC544\uC788\uB2E4...'] }
    }
    return { ...state, won: true, log: [...state.log, '\uB358\uC804\uC744 \uC815\uBCF5\uD588\uB2E4!'] }
  }

  const nextFloor = state.floor + 1
  const newState = initFloor(nextFloor, state.player, state.usedThemeIds)
  return {
    ...newState,
    turns: state.turns,
    kills: state.kills
  }
}

function colorTile (tile: Tile, visible: boolean, wallColor: string, floorColor: string): string {
  const ch = tileChar(tile)
  if (!visible) return C.gray + ch + C.reset
  const wallC = (C as Record<string, string>)[wallColor] ?? C.gray
  const floorC = (C as Record<string, string>)[floorColor] ?? C.gray
  if (tile === Tile.Wall) return wallC + ch + C.reset
  if (tile === Tile.Floor) return floorC + ch + C.reset
  if (tile === Tile.Door) return C.darkYellow + ch + C.reset
  if (tile === Tile.Stairs) return C.magenta + ch + C.reset
  if (tile === Tile.Shop) return C.yellow + 'S' + C.reset
  return ch
}

function getCamera (px: number, py: number): { cx: number, cy: number } {
  const cx = Math.max(0, Math.min(px - Math.floor(VIEW_WIDTH / 2), MAP_WIDTH - VIEW_WIDTH))
  const cy = Math.max(0, Math.min(py - Math.floor(VIEW_HEIGHT / 2), MAP_HEIGHT - VIEW_HEIGHT))
  return { cx, cy }
}

function renderEvent (state: GameState): string[] {
  if (state.activeEvent === null) return []
  const eventDef = getEventById(state.activeEvent.eventId)
  if (eventDef === undefined) return []

  const lines: string[] = []

  let categoryLabel = '이벤트'
  if (eventDef.category === 'trap') categoryLabel = '함정'
  else if (eventDef.category === 'npc') categoryLabel = 'NPC'
  else if (eventDef.category === 'puzzle') categoryLabel = '퍼즐'
  lines.push(`  ${C.magenta}[${categoryLabel}]${C.reset} ${C.cyan}${eventDef.name}${C.reset}`)
  lines.push('')

  for (const desc of eventDef.description) {
    lines.push(`  ${desc}`)
  }
  lines.push('')

  for (let i = 0; i < eventDef.choices.length; i++) {
    const ch = eventDef.choices[i]
    const isSelected = i === state.eventIdx
    const prefix = isSelected ? C.cyan + '> ' + C.reset : '  '
    let costStr = ''
    if (ch.requiresGold !== undefined) costStr = ` ${C.yellow}(${ch.requiresGold}G)${C.reset}`
    if (ch.requiresHp !== undefined) costStr = ` ${C.red}(-${ch.requiresHp}HP)${C.reset}`
    if (ch.skillCheck !== undefined) {
      const statName = ch.skillCheck.stat === 'str' ? 'STR' : 'DEF'
      costStr = ` ${C.blue}[${statName} 체크]${C.reset}`
    }
    lines.push(`${prefix}${i + 1}. ${ch.label}${costStr}`)
  }

  lines.push('')
  lines.push('  방향키:선택 Enter:결정 Esc:취소')

  while (lines.length < VIEW_HEIGHT) {
    lines.push('')
  }

  return lines
}

export function renderGame (state: GameState, compact: boolean = false): string[] {
  const output: string[] = []

  const headerLabel = ' ' + C.cyan + '던전' + C.reset + ' ' + C.yellow + 'B' + state.floor + 'F' + C.reset + ' '
  const headerLabelLen = displayWidth(headerLabel)
  const mapDashes = VIEW_WIDTH - headerLabelLen - 1

  if (compact) {
    const header = '\u250C\u2500' + headerLabel + '\u2500'.repeat(Math.max(0, mapDashes)) + '\u2510'
    output.push(header)
  } else {
    const header = '\u250C\u2500' + headerLabel + '\u2500'.repeat(Math.max(0, mapDashes)) + '\u252C' + '\u2500'.repeat(PANEL_WIDTH) + '\u2510'
    output.push(header)
  }

  const panelLines = compact ? [] : buildPanel(state)

  if (state.over) {
    const mapLines = renderGameOver(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      if (compact) {
        output.push('\u2502' + padMap(mapStr) + '\u2502')
      } else {
        const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
        output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
      }
    }
  } else if (state.won) {
    const mapLines = renderVictory(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      if (compact) {
        output.push('\u2502' + padMap(mapStr) + '\u2502')
      } else {
        const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
        output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
      }
    }
  } else if (state.activeEvent !== null) {
    const mapLines = renderEvent(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      if (compact) {
        output.push('\u2502' + padMap(mapStr) + '\u2502')
      } else {
        const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
        output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
      }
    }
  } else if (state.shopOpen) {
    const mapLines = renderShop(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      if (compact) {
        output.push('\u2502' + padMap(mapStr) + '\u2502')
      } else {
        const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
        output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
      }
    }
  } else if (state.invOpen) {
    const mapLines = renderInventory(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      if (compact) {
        output.push('\u2502' + padMap(mapStr) + '\u2502')
      } else {
        const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
        output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
      }
    }
  } else {
    const { cx, cy } = getCamera(state.player.pos.x, state.player.pos.y)
    for (let viewRow = 0; viewRow < VIEW_HEIGHT; viewRow++) {
      const row = cy + viewRow
      let mapStr = ''
      for (let viewCol = 0; viewCol < VIEW_WIDTH; viewCol++) {
        const col = cx + viewCol
        if (row < 0 || row >= MAP_HEIGHT || col < 0 || col >= MAP_WIDTH) {
          mapStr += ' '
        } else if (state.player.pos.x === col && state.player.pos.y === row) {
          mapStr += C.cyan + '@' + C.reset
        } else if (hasVisibleEnemy(state, col, row)) {
          const enemyAtPos = getEnemyAtPos(state, col, row)
          if (enemyAtPos !== null && enemyAtPos.isBoss) {
            mapStr += C.magenta + getEnemyChar(state, col, row) + C.reset
          } else {
            mapStr += C.red + getEnemyChar(state, col, row) + C.reset
          }
        } else if (hasVisibleItem(state, col, row)) {
          const ch = getItemChar(state, col, row)
          if (ch === '$') {
            mapStr += C.darkYellow + ch + C.reset
          } else if (ch === 'C') {
            mapStr += C.cyan + ch + C.reset
          } else if (ch === '~') {
            mapStr += C.cyan + ch + C.reset
          } else if (ch === '^') {
            mapStr += C.green + ch + C.reset
          } else if (ch === '?') {
            mapStr += C.red + ch + C.reset
          } else if (ch === '!') {
            mapStr += C.magenta + ch + C.reset
          } else if (ch === '★') {
            mapStr += C.yellow + ch + C.reset
          } else if (state.currentTheme.themeObject !== undefined && ch === state.currentTheme.themeObject.ch) {
            const objColor = (C as Record<string, string>)[state.currentTheme.themeObject.color] ?? C.cyan
            mapStr += objColor + ch + C.reset
          } else {
            mapStr += C.yellow + ch + C.reset
          }
        } else if (state.map.visible[row][col]) {
          mapStr += colorTile(state.map.tiles[row][col], true, state.currentTheme.wallColor, state.currentTheme.floorColor)
        } else if (state.map.explored[row][col]) {
          mapStr += colorTile(state.map.tiles[row][col], false, state.currentTheme.wallColor, state.currentTheme.floorColor)
        } else {
          mapStr += ' '
        }
      }
      if (compact) {
        output.push('\u2502' + padMap(mapStr) + '\u2502')
      } else {
        const panel = viewRow < panelLines.length ? panelLines[viewRow] : ' '.repeat(PANEL_WIDTH)
        output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
      }
    }
  }

  if (compact) {
    const bottomBar = '\u2514' + '\u2500'.repeat(VIEW_WIDTH) + '\u2518'
    output.push(bottomBar)
  } else {
    const bottomBar = '\u2514' + '\u2500'.repeat(VIEW_WIDTH) + '\u2534' + '\u2500'.repeat(PANEL_WIDTH) + '\u2518'
    output.push(bottomBar)

    const logStart = Math.max(0, state.log.length - 4)
    const recentLogs = state.log.slice(logStart)
    for (let i = 0; i < 4; i++) {
      if (i < recentLogs.length) {
        output.push(' ' + recentLogs[i])
      } else {
        output.push('')
      }
    }

    output.push('WASD:이동 | I:인벤토리 | >:계단 | Q:종료')
  }

  return output
}

function padMap (s: string): string {
  return padEndDisplay(s, VIEW_WIDTH)
}

function tileChar (tile: Tile): string {
  if (tile === Tile.Wall) return '#'
  if (tile === Tile.Floor) return '.'
  if (tile === Tile.Door) return '+'
  if (tile === Tile.Stairs) return '>'
  if (tile === Tile.Shop) return 'S'
  return ' '
}

function hasVisibleEnemy (state: GameState, x: number, y: number): boolean {
  if (!state.map.visible[y][x]) return false
  for (const e of state.enemies) {
    if (e.alive && e.pos.x === x && e.pos.y === y) return true
  }
  return false
}

function getEnemyChar (state: GameState, x: number, y: number): string {
  for (const e of state.enemies) {
    if (e.alive && e.pos.x === x && e.pos.y === y) return e.ch
  }
  return '?'
}

function getEnemyAtPos (state: GameState, x: number, y: number): Enemy | null {
  for (const e of state.enemies) {
    if (e.alive && e.pos.x === x && e.pos.y === y) return e
  }
  return null
}

function hasVisibleItem (state: GameState, x: number, y: number): boolean {
  if (!state.map.visible[y][x]) return false
  for (const item of state.items) {
    if (item.pos.x === x && item.pos.y === y) return true
  }
  return false
}

function getItemChar (state: GameState, x: number, y: number): string {
  for (const item of state.items) {
    if (item.pos.x === x && item.pos.y === y) return item.ch
  }
  return '?'
}

function buildPanel (state: GameState): string[] {
  const p = state.player
  const lines: string[] = []

  const lvStr = `Lv.${p.level}`
  lines.push(padEndDisplay(` ${C.cyan}@용사${C.reset}   ${lvStr} `, PANEL_WIDTH))

  const filled = Math.round(p.stats.hp / p.stats.maxHp * 6)
  const hpPercent = p.stats.hp / p.stats.maxHp
  let barColor = C.green
  if (hpPercent <= 0.25) barColor = C.red
  else if (hpPercent <= 0.5) barColor = C.yellow
  const filledBar = barColor + '\u2588'.repeat(filled) + C.reset
  const emptyBar = C.gray + '\u2591'.repeat(6 - filled) + C.reset
  const hpText = ` HP[${filledBar}${emptyBar}]`
  const hpNums = `${p.stats.hp}/${p.stats.maxHp}`
  lines.push(padEndDisplay(hpText + hpNums, PANEL_WIDTH))

  const strVal = p.stats.str + (p.weapon !== null ? p.weapon.atk : 0)
  const defVal = p.stats.def + (p.armor !== null ? p.armor.def : 0)
  lines.push(padEndDisplay(` ${C.red}STR${C.reset}:${strVal} ${C.blue}DEF${C.reset}:${defVal}`, PANEL_WIDTH))

  lines.push(' '.repeat(PANEL_WIDTH))

  const wpnName = p.weapon !== null ? p.weapon.name : '없음'
  const wpnRange = p.weapon !== null ? (p.weapon.range ?? 1) : 0
  const rangeTag = wpnRange >= 4 ? `${C.cyan}(원)${C.reset}` : wpnRange >= 2 ? `${C.green}(중)${C.reset}` : ''
  lines.push(padEndDisplay(` 무기:${C.yellow}${wpnName}${C.reset}${rangeTag}`, PANEL_WIDTH))

  const armName = p.armor !== null ? p.armor.name : '없음'
  lines.push(padEndDisplay(` 방어:${C.blue}${armName}${C.reset}`, PANEL_WIDTH))

  lines.push(' '.repeat(PANEL_WIDTH))

  lines.push(padEndDisplay(` 층: ${state.floor}/${TOTAL_FLOORS}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` ${state.currentTheme.icon} ${state.currentTheme.name}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` 골드: ${C.yellow}${p.gold}${C.reset}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` XP:${p.xp}/${p.xpNext}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` 처치: ${state.kills}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` 턴:   ${state.turns}`, PANEL_WIDTH))

  while (lines.length < VIEW_HEIGHT) {
    lines.push(' '.repeat(PANEL_WIDTH))
  }

  return lines
}

function renderInventory (state: GameState): string[] {
  const lines: string[] = []

  lines.push(`  ${C.cyan}인벤토리${C.reset}`)
  lines.push('')

  for (let i = 0; i < MAX_INVENTORY; i++) {
    if (i < state.player.inventory.length) {
      const item = state.player.inventory[i]
      const isSelected = i === state.invIdx
      const prefix = isSelected ? C.cyan + '> ' + C.reset : '  '
      const name = getItemName(item)
      const info = getItemInfo(item)
      let coloredName = name
      if (item.kind === 'weapon') {
        coloredName = rarityColor(item.data.rarity) + name + C.reset
      } else if (item.kind === 'armor') {
        coloredName = rarityColor(item.data.rarity) + name + C.reset
      } else {
        coloredName = C.green + name + C.reset
      }
      lines.push(`${prefix}${i + 1}. ${coloredName} ${info}`)
    } else {
      lines.push('  -')
    }
  }

  lines.push('')
  lines.push('  방향키:선택 Enter:사용')
  lines.push('  I:닫기')

  while (lines.length < VIEW_HEIGHT) {
    lines.push('')
  }

  return lines
}

function renderShop (state: GameState): string[] {
  const lines: string[] = []

  lines.push(`  ${C.yellow}상점${C.reset}  골드: ${C.yellow}${state.player.gold}${C.reset}`)
  lines.push('')

  for (let i = 0; i < state.shopItems.length; i++) {
    const si = state.shopItems[i]
    const isSelected = i === state.shopIdx
    const prefix = isSelected ? C.cyan + '> ' + C.reset : '  '
    if (si.sold) {
      lines.push(`${prefix}${i + 1}. ${C.gray}-- 품절 --${C.reset}`)
    } else {
      const name = getItemName(si.item)
      const info = getItemInfo(si.item)
      const rColor = si.item.kind === 'weapon'
        ? rarityColor(si.item.data.rarity)
        : si.item.kind === 'armor'
          ? rarityColor(si.item.data.rarity)
          : C.green
      lines.push(`${prefix}${i + 1}. ${rColor}${name}${C.reset} ${info} ${C.yellow}${si.price}G${C.reset}`)
    }
  }

  lines.push('')
  lines.push('  방향키:선택 Enter:구매')
  lines.push('  S/Esc:닫기')

  while (lines.length < VIEW_HEIGHT) {
    lines.push('')
  }

  return lines
}

function getItemInfo (item: InvItem): string {
  if (item.kind === 'weapon') {
    const range = item.data.range ?? 1
    const rangeStr = range >= 4 ? ' 원거리' : range >= 2 ? ' 중거리' : ''
    return `ATK+${item.data.atk}${rangeStr}`
  }
  if (item.kind === 'armor') return `DEF+${item.data.def}`
  if (item.data.healType === 'hp') return `HP+${item.data.value}`
  return `STR+${item.data.value}`
}

function renderGameOver (state: GameState): string[] {
  const lines: string[] = []
  const centerPad = Math.floor(VIEW_WIDTH / 2) - 10
  const pad = ' '.repeat(Math.max(0, centerPad))
  for (let i = 0; i < Math.floor(VIEW_HEIGHT / 2) - 4; i++) lines.push('')
  lines.push(pad + C.red + '    게임 오버' + C.reset)
  lines.push('')
  lines.push(`${pad}  층: ${state.floor}  레벨: ${state.player.level}`)
  lines.push(`${pad}  처치: ${state.kills}  턴: ${state.turns}`)
  lines.push(`${pad}  골드: ${C.yellow}${state.player.gold}${C.reset}`)
  lines.push('')
  lines.push(`${pad}  Q키로 나가기`)

  while (lines.length < VIEW_HEIGHT) {
    lines.push('')
  }

  return lines
}

function renderVictory (state: GameState): string[] {
  const lines: string[] = []
  const centerPad = Math.floor(VIEW_WIDTH / 2) - 14
  const pad = ' '.repeat(Math.max(0, centerPad))
  for (let i = 0; i < Math.floor(VIEW_HEIGHT / 2) - 4; i++) lines.push('')
  lines.push(pad + C.yellow + '  승리! 던전을 정복했다!' + C.reset)
  lines.push('')
  lines.push(`${pad}  층: ${state.floor}  레벨: ${state.player.level}`)
  lines.push(`${pad}  처치: ${state.kills}  턴: ${state.turns}`)
  lines.push(`${pad}  골드: ${C.yellow}${state.player.gold}${C.reset}`)
  lines.push('')
  lines.push(`${pad}  Q키로 나가기`)

  while (lines.length < VIEW_HEIGHT) {
    lines.push('')
  }

  return lines
}
