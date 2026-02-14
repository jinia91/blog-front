import {
  type GameState,
  type Enemy,
  type InvItem,
  Tile,
  MAP_WIDTH,
  MAP_HEIGHT,
  VIEW_WIDTH,
  VIEW_HEIGHT,
  PANEL_WIDTH,
  MAX_INVENTORY,
  TOTAL_FLOORS,
  getThemeObjects,
  weaponAttackSpeed
} from './types'
import { getEventById } from './events'
import { C, rarityColor, sanitizeLogLine, padEndDisplay, displayWidth } from './game-text'

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
        } else if (hasProjectileAt(state, col, row)) {
          const projectile = state.projectile
          if (projectile !== null) {
            const color = projectile.color === 'cyan' ? C.cyan : projectile.color === 'red' ? C.red : C.yellow
            mapStr += color + projectile.ch + C.reset
          } else {
            mapStr += C.yellow + '•' + C.reset
          }
        } else if (hasVisibleEnemy(state, col, row)) {
          const enemyAtPos = getEnemyAtPos(state, col, row)
          if (enemyAtPos !== null && enemyAtPos.isBoss) {
            mapStr += C.magenta + getEnemyChar(state, col, row) + C.reset
          } else {
            mapStr += C.red + getEnemyChar(state, col, row) + C.reset
          }
        } else if (hasVisibleItem(state, col, row)) {
          const ch = getItemChar(state, col, row)
          const themeObjColor = themeObjectColorByChar(state, ch)
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
          } else if (themeObjColor !== null) {
            mapStr += themeObjColor + ch + C.reset
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
        output.push(' ' + sanitizeLogLine(recentLogs[i]))
      } else {
        output.push('')
      }
    }

    output.push('WASD:이동 | F:원거리 | I:인벤토리 | X:버리기 | >:계단 | Q:종료')
  }

  return output
}

function padPanel (s: string): string {
  return padEndDisplay(s, PANEL_WIDTH)
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

function themeObjectColorByChar (state: GameState, ch: string): string | null {
  const objects = getThemeObjects(state.currentTheme)
  const found = objects.find(obj => obj.ch === ch)
  if (found === undefined) return null
  return (C as Record<string, string>)[found.color] ?? C.cyan
}

function hasProjectileAt (state: GameState, x: number, y: number): boolean {
  if (state.projectile === null) return false
  if (!state.map.visible[y][x]) return false
  return state.projectile.path.some(p => p.x === x && p.y === y)
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

  const wpnName = p.weapon !== null ? p.weapon.name : '없음'
  const wpnRange = p.weapon !== null ? (p.weapon.range ?? 1) : 0
  const wpnSpeed = weaponAttackSpeed(p.weapon)
  const rangeTag = wpnRange >= 4 ? `${C.cyan}(원)${C.reset}` : wpnRange >= 2 ? `${C.green}(중)${C.reset}` : ''
  lines.push(padEndDisplay(` 무기:${C.yellow}${wpnName}${C.reset}${rangeTag}`, PANEL_WIDTH))
  lines.push(padEndDisplay(` 속도:${C.white}${wpnSpeed}턴${C.reset} 주기`, PANEL_WIDTH))

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

function getItemName (item: InvItem): string {
  if (item.kind === 'weapon') return item.data.name
  if (item.kind === 'armor') return item.data.name
  return item.data.name
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
  lines.push('  방향키:선택 Enter:사용 X:버리기')
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
    const speed = weaponAttackSpeed(item.data)
    return `ATK+${item.data.atk}${rangeStr} SPD:${speed}`
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
