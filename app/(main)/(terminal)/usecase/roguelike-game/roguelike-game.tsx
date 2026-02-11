import { type TerminalContext } from '../../domain/terminal-context'
import {
  type GameState, type Player, type InvItem,
  Tile, MAP_WIDTH, MAP_HEIGHT, VIEW_WIDTH, VIEW_HEIGHT, PANEL_WIDTH, MAX_INVENTORY, TOTAL_FLOORS,
  createPlayer, xpForLevel
} from './types'
import { generateDungeon, computeFOV } from './dungeon'

const C = {
  reset: '\x1b[0m',
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
  darkYellow: '\x1b[33m'
}

function stripAnsi (str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[\d+m/g, '')
}

function charWidth (ch: string): number {
  const code = ch.codePointAt(0)
  if (code === undefined) return 1
  // CJK Unified Ideographs, Hangul, fullwidth chars, etc.
  if (
    (code >= 0x1100 && code <= 0x115F) || // Hangul Jamo
    (code >= 0x2E80 && code <= 0x303E) || // CJK Radicals
    (code >= 0x3040 && code <= 0x33BF) || // Japanese
    (code >= 0x3400 && code <= 0x4DBF) || // CJK Unified Ext A
    (code >= 0x4E00 && code <= 0x9FFF) || // CJK Unified Ideographs
    (code >= 0xAC00 && code <= 0xD7AF) || // Hangul Syllables
    (code >= 0xF900 && code <= 0xFAFF) || // CJK Compat Ideographs
    (code >= 0xFE30 && code <= 0xFE4F) || // CJK Compat Forms
    (code >= 0xFF01 && code <= 0xFF60) || // Fullwidth Forms
    (code >= 0xFFE0 && code <= 0xFFE6) || // Fullwidth Signs
    (code >= 0x20000 && code <= 0x2FA1F) // CJK Ext B-F
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

function initFloor (floor: number, existingPlayer: Player | null): GameState {
  const { map, playerPos, enemies, items } = generateDungeon(floor)
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
    invIdx: 0
  }
}

function checkLevelUp (state: GameState): GameState {
  const p = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]
  let changed = false

  while (p.xp >= p.xpNext) {
    p.xp -= p.xpNext
    p.level += 1
    p.stats.maxHp += 8
    p.stats.str += 2
    p.stats.def += 1
    p.stats.hp = p.stats.maxHp
    p.xpNext = xpForLevel(p.level)
    newLog.push(`\uB808\uBCA8 \uC5C5! Lv.${p.level}`)
    changed = true
  }

  if (changed) {
    return { ...state, player: p, log: newLog }
  }
  return state
}

function attackEnemy (state: GameState, enemyIdx: number): GameState {
  const enemy = { ...state.enemies[enemyIdx], stats: { ...state.enemies[enemyIdx].stats } }
  const player = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]

  const atkPower = player.stats.str + (player.weapon !== null ? player.weapon.atk : 0)
  const roll = Math.random()
  let damage: number

  if (roll < 0.05) {
    damage = 0
    newLog.push('\uBE57\uB098\uAC14\uB2E4!')
  } else {
    damage = Math.max(1, atkPower - enemy.stats.def + Math.floor(Math.random() * 5) - 2)
    if (roll < 0.15) {
      damage = Math.floor(damage * 1.5)
      newLog.push(`\uD06C\uB9AC\uD2F0\uCEEC! ${enemy.name}\uC5D0\uAC8C ${damage} \uB370\uBBF8\uC9C0`)
    } else {
      newLog.push(`${enemy.name}\uC5D0\uAC8C ${damage} \uB370\uBBF8\uC9C0`)
    }
  }

  enemy.stats.hp -= damage

  let newKills = state.kills

  if (enemy.stats.hp <= 0) {
    enemy.alive = false
    newKills += 1
    player.xp += enemy.xp
    newLog.push(`${enemy.name}\uB97C \uCC98\uCE58\uD588\uB2E4!`)
  }

  const newEnemies = state.enemies.map((e, i) => i === enemyIdx ? enemy : e)

  let result: GameState = { ...state, player, enemies: newEnemies, log: newLog, kills: newKills }
  result = checkLevelUp(result)
  return result
}

function enemyAttackPlayer (state: GameState, enemyIdx: number): GameState {
  const enemy = state.enemies[enemyIdx]
  if (!enemy.alive) return state

  const player = { ...state.player, stats: { ...state.player.stats } }
  const newLog = [...state.log]

  const atkPower = enemy.stats.str
  const playerDef = player.stats.def + (player.armor !== null ? player.armor.def : 0)
  const roll = Math.random()
  let damage: number

  if (roll < 0.05) {
    damage = 0
    newLog.push(`${enemy.name}\uC758 \uACF5\uACA9\uC774 \uBE57\uB098\uAC14\uB2E4!`)
  } else {
    damage = Math.max(1, atkPower - playerDef + Math.floor(Math.random() * 5) - 2)
    if (roll < 0.15) {
      damage = Math.floor(damage * 1.5)
      newLog.push(`${enemy.name} \uD06C\uB9AC\uD2F0\uCEEC! ${damage} \uB370\uBBF8\uC9C0`)
    } else {
      newLog.push(`${enemy.name}\uC5D0\uAC8C ${damage} \uB370\uBBF8\uC9C0 \uBC1B\uC74C`)
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

function processEnemyTurns (state: GameState): GameState {
  let current = state
  for (let i = 0; i < current.enemies.length; i++) {
    if (current.over) break
    const enemy = current.enemies[i]
    if (!enemy.alive) continue

    const dist = Math.abs(enemy.pos.x - current.player.pos.x) + Math.abs(enemy.pos.y - current.player.pos.y)
    const isVisible = current.map.visible[enemy.pos.y][enemy.pos.x]

    if (dist <= 5 && isVisible) {
      if (dist === 1) {
        current = enemyAttackPlayer(current, i)
      } else {
        current = moveEnemyToward(current, i)
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

  if (mapItem.ch === '$') {
    const goldMatch = mapItem.item.data.name.match(/(\d+)/)
    const goldAmount = goldMatch !== null ? parseInt(goldMatch[1], 10) : 10
    const newPlayer = { ...state.player, gold: state.player.gold + goldAmount }
    newLog.push(`${goldAmount} Gold \uD68D\uB4DD!`)
    const newItems = state.items.filter((_, i) => i !== found)
    return { ...state, player: newPlayer, items: newItems, log: newLog }
  }

  if (state.player.inventory.length >= MAX_INVENTORY) {
    newLog.push('\uC778\uBCA4\uD1A0\uB9AC\uAC00 \uAC00\uB4DD \uCC3C\uB2E4')
    return { ...state, log: newLog }
  }

  const newInventory = [...state.player.inventory, mapItem.item]
  const itemName = getItemName(mapItem.item)
  newLog.push(`${itemName} \uD68D\uB4DD!`)

  const newItems = state.items.filter((_, i) => i !== found)
  const newPlayer = { ...state.player, inventory: newInventory }

  return { ...state, player: newPlayer, items: newItems, log: newLog }
}

function getItemName (item: InvItem): string {
  if (item.kind === 'weapon') return item.data.name
  if (item.kind === 'armor') return item.data.name
  return item.data.name
}

function useItem (state: GameState, idx: number): GameState {
  if (idx < 0 || idx >= state.player.inventory.length) return state

  const item = state.player.inventory[idx]
  const newInventory = state.player.inventory.filter((_, i) => i !== idx)
  const newLog = [...state.log]
  const player = { ...state.player, inventory: newInventory, stats: { ...state.player.stats } }

  if (item.kind === 'weapon') {
    if (player.weapon !== null) {
      player.inventory = [...player.inventory, { kind: 'weapon' as const, data: player.weapon }]
    }
    player.weapon = item.data
    newLog.push(`${item.data.name} \uC7A5\uCC29!`)
  } else if (item.kind === 'armor') {
    if (player.armor !== null) {
      player.inventory = [...player.inventory, { kind: 'armor' as const, data: player.armor }]
    }
    player.armor = item.data
    newLog.push(`${item.data.name} \uC7A5\uCC29!`)
  } else if (item.kind === 'potion') {
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

function movePlayer (state: GameState, dx: number, dy: number): GameState {
  const nx = state.player.pos.x + dx
  const ny = state.player.pos.y + dy

  if (nx < 0 || nx >= MAP_WIDTH || ny < 0 || ny >= MAP_HEIGHT) return state
  if (state.map.tiles[ny][nx] === Tile.Wall) return state

  for (let i = 0; i < state.enemies.length; i++) {
    const e = state.enemies[i]
    if (e.alive && e.pos.x === nx && e.pos.y === ny) {
      let result = attackEnemy(state, i)
      result = { ...result, turns: result.turns + 1 }
      result = processEnemyTurns(result)
      computeFOV(result.map, result.player.pos.x, result.player.pos.y)
      return result
    }
  }

  const newPlayer = { ...state.player, pos: { x: nx, y: ny } }
  let result: GameState = { ...state, player: newPlayer, turns: state.turns + 1 }

  result = pickUpItems(result)
  result = processEnemyTurns(result)
  computeFOV(result.map, result.player.pos.x, result.player.pos.y)

  return result
}

function descend (state: GameState): GameState {
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
  const newState = initFloor(nextFloor, state.player)
  return {
    ...newState,
    turns: state.turns,
    kills: state.kills
  }
}

function colorTile (tile: Tile, visible: boolean): string {
  const ch = tileChar(tile)
  if (!visible) return C.gray + ch + C.reset
  if (tile === Tile.Wall) return C.gray + ch + C.reset
  if (tile === Tile.Floor) return C.gray + ch + C.reset
  if (tile === Tile.Door) return C.darkYellow + ch + C.reset
  if (tile === Tile.Stairs) return C.magenta + ch + C.reset
  return ch
}

function getCamera (px: number, py: number): { cx: number, cy: number } {
  const cx = Math.max(0, Math.min(px - Math.floor(VIEW_WIDTH / 2), MAP_WIDTH - VIEW_WIDTH))
  const cy = Math.max(0, Math.min(py - Math.floor(VIEW_HEIGHT / 2), MAP_HEIGHT - VIEW_HEIGHT))
  return { cx, cy }
}

function renderGame (state: GameState): string[] {
  const output: string[] = []

  const headerLabel = ' ' + C.cyan + 'DUNGEON' + C.reset + ' ' + C.yellow + 'B' + state.floor + 'F' + C.reset + ' '
  const headerLabelLen = displayWidth(headerLabel)
  const mapDashes = VIEW_WIDTH - headerLabelLen - 1
  const header = '\u250C\u2500' + headerLabel + '\u2500'.repeat(Math.max(0, mapDashes)) + '\u252C' + '\u2500'.repeat(PANEL_WIDTH) + '\u2510'
  output.push(header)

  const panelLines = buildPanel(state)

  if (state.over) {
    const mapLines = renderGameOver(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
      output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
    }
  } else if (state.won) {
    const mapLines = renderVictory(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
      output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
    }
  } else if (state.invOpen) {
    const mapLines = renderInventory(state)
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      const mapStr = row < mapLines.length ? mapLines[row] : ' '.repeat(VIEW_WIDTH)
      const panel = row < panelLines.length ? panelLines[row] : ' '.repeat(PANEL_WIDTH)
      output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
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
          mapStr += C.red + getEnemyChar(state, col, row) + C.reset
        } else if (hasVisibleItem(state, col, row)) {
          const ch = getItemChar(state, col, row)
          if (ch === '$') {
            mapStr += C.darkYellow + ch + C.reset
          } else {
            mapStr += C.yellow + ch + C.reset
          }
        } else if (state.map.visible[row][col]) {
          mapStr += colorTile(state.map.tiles[row][col], true)
        } else if (state.map.explored[row][col]) {
          mapStr += colorTile(state.map.tiles[row][col], false)
        } else {
          mapStr += ' '
        }
      }
      const panel = viewRow < panelLines.length ? panelLines[viewRow] : ' '.repeat(PANEL_WIDTH)
      output.push('\u2502' + padMap(mapStr) + '\u2502' + padPanel(panel) + '\u2502')
    }
  }

  const footer = '\u2514' + '\u2500'.repeat(VIEW_WIDTH) + '\u2534' + '\u2500'.repeat(PANEL_WIDTH) + '\u2518'
  output.push(footer)
  output.push('')
  output.push('WASD:Move | I:Inventory | >:Stairs | Q:Quit')

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
  lines.push(padEndDisplay(` ${C.cyan}@Hero${C.reset}   ${lvStr} `, PANEL_WIDTH))

  const filled = Math.round(p.stats.hp / p.stats.maxHp * 8)
  const hpPercent = p.stats.hp / p.stats.maxHp
  let barColor = C.green
  if (hpPercent <= 0.25) barColor = C.red
  else if (hpPercent <= 0.5) barColor = C.yellow
  const filledBar = barColor + '\u2588'.repeat(filled) + C.reset
  const emptyBar = C.gray + '\u2591'.repeat(8 - filled) + C.reset
  const hpText = ` HP[${filledBar}${emptyBar}]`
  const hpNums = `${p.stats.hp}/${p.stats.maxHp}`
  lines.push(padEndDisplay(hpText + hpNums, PANEL_WIDTH))

  const strVal = p.stats.str + (p.weapon !== null ? p.weapon.atk : 0)
  const defVal = p.stats.def + (p.armor !== null ? p.armor.def : 0)
  lines.push(padEndDisplay(` ${C.red}STR${C.reset}:${strVal} ${C.blue}DEF${C.reset}:${defVal}`, PANEL_WIDTH))

  lines.push(' '.repeat(PANEL_WIDTH))

  const wpnName = p.weapon !== null ? p.weapon.name : 'None'
  lines.push(padEndDisplay(` Wpn:${C.yellow}${wpnName}${C.reset}`, PANEL_WIDTH))

  const armName = p.armor !== null ? p.armor.name : 'None'
  lines.push(padEndDisplay(` Arm:${C.blue}${armName}${C.reset}`, PANEL_WIDTH))

  lines.push(' '.repeat(PANEL_WIDTH))

  lines.push(padEndDisplay(` Floor: ${state.floor}/${TOTAL_FLOORS}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` Gold:  ${C.yellow}${p.gold}${C.reset}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` XP:${p.xp}/${p.xpNext}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` Kill:  ${state.kills}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` Turn:  ${state.turns}`, PANEL_WIDTH))

  lines.push('\u2500'.repeat(PANEL_WIDTH))

  const logStart = Math.max(0, state.log.length - 4)
  const recentLogs = state.log.slice(logStart)
  for (let i = 0; i < 4; i++) {
    const msg = i < recentLogs.length ? ' ' + recentLogs[i] : ''
    lines.push(padEndDisplay(msg, PANEL_WIDTH))
  }

  lines.push(' '.repeat(PANEL_WIDTH))

  return lines
}

function renderInventory (state: GameState): string[] {
  const lines: string[] = []

  lines.push(`  ${C.cyan}INVENTORY${C.reset}`)
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
        coloredName = C.yellow + name + C.reset
      } else if (item.kind === 'armor') {
        coloredName = C.blue + name + C.reset
      } else {
        coloredName = C.green + name + C.reset
      }
      lines.push(`${prefix}${i + 1}. ${coloredName} ${info}`)
    } else {
      lines.push('  -')
    }
  }

  lines.push('')
  lines.push('  Arrow:Select Enter:Use')
  lines.push('  I:Close')

  while (lines.length < VIEW_HEIGHT) {
    lines.push('')
  }

  return lines
}

function getItemInfo (item: InvItem): string {
  if (item.kind === 'weapon') return `ATK+${item.data.atk}`
  if (item.kind === 'armor') return `DEF+${item.data.def}`
  if (item.data.healType === 'hp') return `HP+${item.data.value}`
  return `STR+${item.data.value}`
}

function renderGameOver (state: GameState): string[] {
  const lines: string[] = []
  const centerPad = Math.floor(VIEW_WIDTH / 2) - 10
  const pad = ' '.repeat(Math.max(0, centerPad))
  for (let i = 0; i < Math.floor(VIEW_HEIGHT / 2) - 4; i++) lines.push('')
  lines.push(pad + C.red + '    GAME OVER' + C.reset)
  lines.push('')
  lines.push(`${pad}  Floor: ${state.floor}  Level: ${state.player.level}`)
  lines.push(`${pad}  Kills: ${state.kills}  Turns: ${state.turns}`)
  lines.push(`${pad}  Gold:  ${C.yellow}${state.player.gold}${C.reset}`)
  lines.push('')
  lines.push(`${pad}  Press Q to exit`)

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
  lines.push(pad + C.yellow + '  VICTORY! Dragon Slain!' + C.reset)
  lines.push('')
  lines.push(`${pad}  Floor: 10  Level: ${state.player.level}`)
  lines.push(`${pad}  Kills: ${state.kills}  Turns: ${state.turns}`)
  lines.push(`${pad}  Gold:  ${C.yellow}${state.player.gold}${C.reset}`)
  lines.push('')
  lines.push(`${pad}  Press Q to exit`)

  while (lines.length < VIEW_HEIGHT) {
    lines.push('')
  }

  return lines
}

export const startRoguelikeGame = async (
  setContext: (args: ((prev: TerminalContext) => TerminalContext) | TerminalContext) => void
): Promise<void> => {
  const initialState = initFloor(1, null)

  setContext((prevContext): any => ({
    ...prevContext,
    view: renderGame(initialState),
    processContext: {
      bufferedView: prevContext.view,
      gameState: initialState
    }
  }))

  const handleKeyDown = (e: KeyboardEvent): void => {
    setContext((prevContext): any => {
      const gameState = prevContext.processContext?.gameState as GameState | undefined
      if (gameState === undefined) return prevContext

      if (gameState.over || gameState.won) {
        return prevContext
      }

      if (gameState.invOpen) {
        return handleInventoryInput(prevContext, gameState, e)
      }

      return handleNormalInput(prevContext, gameState, e)
    })
  }

  const handleNormalInput = (prevContext: any, gameState: GameState, e: KeyboardEvent): any => {
    let newState: GameState | null = null

    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        e.preventDefault()
        newState = movePlayer(gameState, 0, -1)
        break
      case 's':
      case 'ArrowDown':
        e.preventDefault()
        newState = movePlayer(gameState, 0, 1)
        break
      case 'a':
      case 'ArrowLeft':
        e.preventDefault()
        newState = movePlayer(gameState, -1, 0)
        break
      case 'd':
      case 'ArrowRight':
        e.preventDefault()
        newState = movePlayer(gameState, 1, 0)
        break
      case 'i':
      case 'I':
        e.preventDefault()
        newState = { ...gameState, invOpen: true, invIdx: 0 }
        break
      case '>':
      case 'Enter':
        e.preventDefault()
        newState = descend(gameState)
        break
      default:
        return prevContext
    }

    if (newState === null) return prevContext

    return {
      ...prevContext,
      view: renderGame(newState),
      processContext: {
        ...prevContext.processContext,
        gameState: newState
      }
    }
  }

  const handleInventoryInput = (prevContext: any, gameState: GameState, e: KeyboardEvent): any => {
    let newState: GameState = gameState
    const invLen = gameState.player.inventory.length

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        e.preventDefault()
        if (invLen > 0) {
          const newIdx = gameState.invIdx > 0 ? gameState.invIdx - 1 : invLen - 1
          newState = { ...gameState, invIdx: newIdx }
        }
        break
      case 'ArrowDown':
      case 's':
        e.preventDefault()
        if (invLen > 0) {
          const newIdx = gameState.invIdx < invLen - 1 ? gameState.invIdx + 1 : 0
          newState = { ...gameState, invIdx: newIdx }
        }
        break
      case 'Enter':
        e.preventDefault()
        if (invLen > 0) {
          newState = useItem(gameState, gameState.invIdx)
          if (newState.player.inventory.length === 0) {
            newState = { ...newState, invOpen: false, invIdx: 0 }
          } else if (newState.invIdx >= newState.player.inventory.length) {
            newState = { ...newState, invIdx: newState.player.inventory.length - 1 }
          }
        }
        break
      case 'i':
      case 'I':
      case 'Escape':
        e.preventDefault()
        newState = { ...gameState, invOpen: false }
        break
      default:
        return prevContext
    }

    return {
      ...prevContext,
      view: renderGame(newState),
      processContext: {
        ...prevContext.processContext,
        gameState: newState
      }
    }
  }

  const exitGameKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', exitGameKeyDown)
      setContext((prevContext): any => ({
        ...prevContext,
        view: prevContext.processContext.bufferedView.concat(['', 'Roguelike \uAC8C\uC784 \uC885\uB8CC!']),
        processContext: null
      }))
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keydown', exitGameKeyDown)
}
