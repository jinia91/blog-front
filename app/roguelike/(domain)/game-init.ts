import { type GameState, type Player, createPlayer, selectThemeForFloor, generateShopItems } from './types'
import { generateDungeon, computeFOV } from './dungeon'

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
    log.push('던전에 입장했다...')
  } else {
    log.push(`${floor}층에 도착했다...`)
  }
  const flavorText = theme.flavorTexts[Math.floor(Math.random() * theme.flavorTexts.length)]
  log.push(flavorText)
  if (floor === 10) {
    log.push('거대한 용의 숨소리가 들린다...')
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
    eventIdx: 0,
    projectile: null
  }
}
