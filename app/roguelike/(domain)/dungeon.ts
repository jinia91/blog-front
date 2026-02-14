import {
  MAP_WIDTH,
  MAP_HEIGHT,
  FOV_RADIUS,
  Tile,
  type DungeonMap,
  type Position,
  type Room,
  type Enemy,
  type MapItem,
  type FloorTheme,
  type EnemyDef,
  type InvItem,
  type RunNarrativeState,
  createEnemy,
  enemyCountForFloor,
  itemCountForFloor,
  weaponForFloor,
  armorForFloor,
  potionForFloor,
  getThemeObjects,
  getRetentionObjectBalance,
  retentionObjectCapForFloor,
  scaleEnemyStats,
  scaleBossStats
} from './types'
import { selectEventsForFloor } from './events'
import { recommendedPlayerLevelForFloor } from './progression'
import { computeRelationInfluence, findLatestRouteTag } from './narrative'

interface BSPNode {
  x: number
  y: number
  w: number
  h: number
  left?: BSPNode
  right?: BSPNode
  room?: Room
}

type RoomShape = 'rect' | 'ellipse' | 'diamond' | 'cross' | 'pillars'

const ROOM_SHAPES: RoomShape[] = ['rect', 'ellipse', 'diamond', 'cross', 'pillars']

function createEmptyMap (): DungeonMap {
  const tiles: Tile[][] = []
  const explored: boolean[][] = []
  const visible: boolean[][] = []

  for (let y = 0; y < MAP_HEIGHT; y++) {
    tiles[y] = []
    explored[y] = []
    visible[y] = []
    for (let x = 0; x < MAP_WIDTH; x++) {
      tiles[y][x] = Tile.Wall
      explored[y][x] = false
      visible[y][x] = false
    }
  }

  return {
    tiles,
    explored,
    visible,
    rooms: []
  }
}

function splitNode (node: BSPNode, depth: number, maxDepth: number): void {
  if (depth >= maxDepth) return

  const minSize = 12
  const canSplitH = node.w >= minSize * 2
  const canSplitV = node.h >= minSize * 2

  if (!canSplitH && !canSplitV) return

  let splitH = false
  if (canSplitH && canSplitV) {
    splitH = node.w > node.h ? Math.random() < 0.6 : Math.random() < 0.4
  } else if (canSplitH) {
    splitH = true
  }

  if (splitH) {
    const splitX = node.x + minSize + Math.floor(Math.random() * (node.w - minSize * 2 + 1))
    node.left = { x: node.x, y: node.y, w: splitX - node.x, h: node.h }
    node.right = { x: splitX, y: node.y, w: node.x + node.w - splitX, h: node.h }
  } else {
    const splitY = node.y + minSize + Math.floor(Math.random() * (node.h - minSize * 2 + 1))
    node.left = { x: node.x, y: node.y, w: node.w, h: splitY - node.y }
    node.right = { x: node.x, y: splitY, w: node.w, h: node.y + node.h - splitY }
  }

  if (node.left !== undefined) splitNode(node.left, depth + 1, maxDepth)
  if (node.right !== undefined) splitNode(node.right, depth + 1, maxDepth)
}

function carveRectRoom (map: DungeonMap, room: Room): void {
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      map.tiles[y][x] = Tile.Floor
    }
  }
}

function carveEllipseRoom (map: DungeonMap, room: Room): void {
  const cx = room.x + room.w / 2
  const cy = room.y + room.h / 2
  const rx = Math.max(1.5, room.w / 2)
  const ry = Math.max(1.5, room.h / 2)
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      const nx = (x + 0.5 - cx) / rx
      const ny = (y + 0.5 - cy) / ry
      if ((nx * nx) + (ny * ny) <= 0.95) {
        map.tiles[y][x] = Tile.Floor
      }
    }
  }
}

function carveDiamondRoom (map: DungeonMap, room: Room): void {
  const cx = room.x + Math.floor(room.w / 2)
  const cy = room.y + Math.floor(room.h / 2)
  const rx = Math.max(2, Math.floor(room.w / 2))
  const ry = Math.max(2, Math.floor(room.h / 2))
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      const nx = Math.abs(x - cx) / rx
      const ny = Math.abs(y - cy) / ry
      if (nx + ny <= 1) {
        map.tiles[y][x] = Tile.Floor
      }
    }
  }
}

function carveCrossRoom (map: DungeonMap, room: Room): void {
  const cx = room.x + Math.floor(room.w / 2)
  const cy = room.y + Math.floor(room.h / 2)
  const armW = Math.max(1, Math.floor(room.w * 0.24))
  const armH = Math.max(1, Math.floor(room.h * 0.24))
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      const inVertical = Math.abs(x - cx) <= armW
      const inHorizontal = Math.abs(y - cy) <= armH
      if (inVertical || inHorizontal) {
        map.tiles[y][x] = Tile.Floor
      }
    }
  }
}

function carvePillarsRoom (map: DungeonMap, room: Room): void {
  carveRectRoom(map, room)
  if (room.w < 8 || room.h < 8) return
  for (let y = room.y + 2; y < room.y + room.h - 2; y += 3) {
    for (let x = room.x + 2; x < room.x + room.w - 2; x += 3) {
      if (Math.random() < 0.7) {
        map.tiles[y][x] = Tile.Wall
      }
    }
  }
}

function countRoomFloors (map: DungeonMap, room: Room): number {
  let count = 0
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      if (map.tiles[y][x] === Tile.Floor) count += 1
    }
  }
  return count
}

function carveRoomWithShape (map: DungeonMap, room: Room, shape: RoomShape): void {
  if (shape === 'ellipse') carveEllipseRoom(map, room)
  else if (shape === 'diamond') carveDiamondRoom(map, room)
  else if (shape === 'cross') carveCrossRoom(map, room)
  else if (shape === 'pillars') carvePillarsRoom(map, room)
  else carveRectRoom(map, room)

  const minFloorTiles = Math.max(8, Math.floor(room.w * room.h * 0.22))
  if (countRoomFloors(map, room) < minFloorTiles) {
    carveRectRoom(map, room)
  }

  const center = roomCenter(room)
  map.tiles[center.y][center.x] = Tile.Floor
}

function createRoomInNode (node: BSPNode, map: DungeonMap): void {
  if (node.left !== undefined || node.right !== undefined) {
    if (node.left !== undefined) createRoomInNode(node.left, map)
    if (node.right !== undefined) createRoomInNode(node.right, map)
  } else {
    const minRoomSize = 4
    const maxW = Math.max(minRoomSize, node.w - 2)
    const maxH = Math.max(minRoomSize, node.h - 2)
    const roomW = minRoomSize + Math.floor(Math.random() * (maxW - minRoomSize + 1))
    const roomH = minRoomSize + Math.floor(Math.random() * (maxH - minRoomSize + 1))
    const roomX = node.x + 1 + Math.floor(Math.random() * (node.w - roomW - 1))
    const roomY = node.y + 1 + Math.floor(Math.random() * (node.h - roomH - 1))

    const room: Room = { x: roomX, y: roomY, w: roomW, h: roomH }
    node.room = room
    map.rooms.push(room)
    const shape: RoomShape = roomW >= 7 && roomH >= 7
      ? ROOM_SHAPES[Math.floor(Math.random() * ROOM_SHAPES.length)]
      : 'rect'
    carveRoomWithShape(map, room, shape)
  }
}

function connectRooms (node: BSPNode, map: DungeonMap): void {
  if (node.left === undefined || node.right === undefined) return

  connectRooms(node.left, map)
  connectRooms(node.right, map)

  const leftRoom = getLeafRoom(node.left)
  const rightRoom = getLeafRoom(node.right)

  if (leftRoom === null || rightRoom === null) return

  const c1 = roomCenter(leftRoom)
  const c2 = roomCenter(rightRoom)

  if (Math.random() < 0.5) {
    createHCorridor(map, c1.x, c2.x, c1.y)
    createVCorridor(map, c1.y, c2.y, c2.x)
  } else {
    createVCorridor(map, c1.y, c2.y, c1.x)
    createHCorridor(map, c1.x, c2.x, c2.y)
  }
}

function getLeafRoom (node: BSPNode): Room | null {
  if (node.room !== undefined) return node.room
  if (node.left !== undefined) {
    const lr = getLeafRoom(node.left)
    if (lr !== null) return lr
  }
  if (node.right !== undefined) {
    return getLeafRoom(node.right)
  }
  return null
}

function createHCorridor (map: DungeonMap, x1: number, x2: number, y: number): void {
  const startX = Math.min(x1, x2)
  const endX = Math.max(x1, x2)
  for (let x = startX; x <= endX; x++) {
    if (map.tiles[y][x] === Tile.Wall) {
      map.tiles[y][x] = Tile.Floor
    } else if (map.tiles[y][x] === Tile.Floor) {
      const isEdge = (y > 0 && map.tiles[y - 1][x] === Tile.Wall) || (y < MAP_HEIGHT - 1 && map.tiles[y + 1][x] === Tile.Wall)
      if (isEdge) map.tiles[y][x] = Tile.Door
    }
  }
}

function createVCorridor (map: DungeonMap, y1: number, y2: number, x: number): void {
  const startY = Math.min(y1, y2)
  const endY = Math.max(y1, y2)
  for (let y = startY; y <= endY; y++) {
    if (map.tiles[y][x] === Tile.Wall) {
      map.tiles[y][x] = Tile.Floor
    } else if (map.tiles[y][x] === Tile.Floor) {
      const isEdge = (x > 0 && map.tiles[y][x - 1] === Tile.Wall) || (x < MAP_WIDTH - 1 && map.tiles[y][x + 1] === Tile.Wall)
      if (isEdge) map.tiles[y][x] = Tile.Door
    }
  }
}

export function roomCenter (room: Room): Position {
  return {
    x: room.x + Math.floor(room.w / 2),
    y: room.y + Math.floor(room.h / 2)
  }
}

function isFloorAndEmpty (map: DungeonMap, x: number, y: number, occupied: Set<string>): boolean {
  if (map.tiles[y][x] !== Tile.Floor) return false
  const key = `${x},${y}`
  return !occupied.has(key)
}

function randomFloorPos (map: DungeonMap, room: Room, occupied: Set<string>): Position | null {
  const candidates: Position[] = []
  for (let y = room.y; y < room.y + room.h; y++) {
    for (let x = room.x; x < room.x + room.w; x++) {
      if (isFloorAndEmpty(map, x, y, occupied)) {
        candidates.push({ x, y })
      }
    }
  }
  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function manhattanDist (a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
}

function clamp (v: number, min: number, max: number): number {
  if (v < min) return min
  if (v > max) return max
  return v
}

function clampInt (v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(v)))
}

function collectSpecialTileCandidates (
  map: DungeonMap,
  occupied: Set<string>,
  playerPos: Position,
  stairsPos: Position
): Position[] {
  const out: Position[] = []
  for (let y = 1; y < MAP_HEIGHT - 1; y++) {
    for (let x = 1; x < MAP_WIDTH - 1; x++) {
      if (map.tiles[y][x] !== Tile.Floor) continue
      const key = `${x},${y}`
      if (occupied.has(key)) continue
      if (manhattanDist({ x, y }, playerPos) <= 2) continue
      if (manhattanDist({ x, y }, stairsPos) <= 2) continue
      out.push({ x, y })
    }
  }
  return out
}

function scatterSpecialTiles (
  map: DungeonMap,
  floor: number,
  theme: FloorTheme,
  occupied: Set<string>,
  playerPos: Position,
  stairsPos: Position
): void {
  const candidates = collectSpecialTileCandidates(map, occupied, playerPos, stairsPos)
  if (candidates.length === 0) return

  const riskHazardMult = theme.riskProfile === 'deadly'
    ? 1.35
    : theme.riskProfile === 'risky'
      ? 1.18
      : theme.riskProfile === 'safe'
        ? 0.8
        : 1
  const supportMult = theme.riskProfile === 'safe'
    ? 1.35
    : theme.riskProfile === 'deadly'
      ? 0.72
      : 1
  const roomFactor = Math.max(1, Math.floor(map.rooms.length / 4))

  const waterCount = clampInt((2 + floor * 0.45 + roomFactor) * (0.95 + theme.objectBias * 0.35), 1, 10)
  const brambleCount = clampInt((1 + floor * 0.3 + roomFactor * 0.8) * riskHazardMult, 1, 9)
  const healingCount = clampInt((1 + floor * 0.25 + roomFactor * 0.6) * supportMult, 1, 7)
  const arcaneCount = clampInt((floor >= 3 ? (0.8 + floor * 0.16) : 0) * (1 + theme.eventBias * 0.4), 0, 5)

  const place = (tile: Tile, count: number): void => {
    for (let i = 0; i < count; i++) {
      if (candidates.length === 0) return
      const idx = Math.floor(Math.random() * candidates.length)
      const pos = candidates[idx]
      candidates.splice(idx, 1)
      map.tiles[pos.y][pos.x] = tile
    }
  }

  place(Tile.ShallowWater, waterCount)
  place(Tile.Bramble, brambleCount)
  place(Tile.HealingMoss, healingCount)
  place(Tile.ArcaneField, arcaneCount)
}

export function generateDungeon (floor: number, theme: FloorTheme): {
  map: DungeonMap
  playerPos: Position
  enemies: Enemy[]
  items: MapItem[]
}
export function generateDungeon (floor: number, theme: FloorTheme, playerLevel: number): {
  map: DungeonMap
  playerPos: Position
  enemies: Enemy[]
  items: MapItem[]
}
export function generateDungeon (
  floor: number,
  theme: FloorTheme,
  playerLevel: number,
  narrative?: RunNarrativeState
): {
  map: DungeonMap
  playerPos: Position
  enemies: Enemy[]
  items: MapItem[]
}
export function generateDungeon (
  floor: number,
  theme: FloorTheme,
  playerLevel: number = 1,
  narrative?: RunNarrativeState
): {
    map: DungeonMap
    playerPos: Position
    enemies: Enemy[]
    items: MapItem[]
  } {
  const map = createEmptyMap()

  const root: BSPNode = {
    x: 1,
    y: 1,
    w: MAP_WIDTH - 2,
    h: MAP_HEIGHT - 2
  }

  splitNode(root, 0, 5)
  createRoomInNode(root, map)
  connectRooms(root, map)

  const firstRoom = map.rooms[0]
  const playerPos = roomCenter(firstRoom)

  const occupied = new Set<string>()
  occupied.add(`${playerPos.x},${playerPos.y}`)

  let stairsRoom = map.rooms[0]
  let maxDist = 0
  const firstCenter = roomCenter(firstRoom)
  for (const room of map.rooms) {
    const c = roomCenter(room)
    const dist = manhattanDist(firstCenter, c)
    if (dist > maxDist) {
      maxDist = dist
      stairsRoom = room
    }
  }

  const stairsPos = roomCenter(stairsRoom)
  map.tiles[stairsPos.y][stairsPos.x] = Tile.Stairs
  occupied.add(`${stairsPos.x},${stairsPos.y}`)

  const enemies: Enemy[] = []
  const enemyCount = enemyCountForFloor(floor, theme, playerLevel)
  const enemyDefs = theme.monsters

  for (let i = 0; i < enemyCount; i++) {
    let placed = false
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomRoomIdx = 1 + Math.floor(Math.random() * (map.rooms.length - 1))
      const room = map.rooms[randomRoomIdx]
      const pos = randomFloorPos(map, room, occupied)
      if (pos !== null) {
        const baseDef = enemyDefs[Math.floor(Math.random() * enemyDefs.length)]
        const scaledStats = scaleEnemyStats(baseDef.stats, floor, theme, playerLevel)
        const scaledXp = Math.floor(baseDef.xp * (1 + (floor - 1) * 0.15))
        const scaledDef: EnemyDef = { ...baseDef, stats: scaledStats, xp: scaledXp }
        enemies.push(createEnemy(scaledDef, pos, false))
        occupied.add(`${pos.x},${pos.y}`)
        placed = true
        break
      }
    }
    if (!placed) break
  }

  // Spawn boss in the stairs room
  const bossPos = randomFloorPos(map, stairsRoom, occupied)
  if (bossPos !== null) {
    const bossDef = theme.boss
    const bossStats = scaleBossStats(bossDef.stats, floor, theme, playerLevel)
    const bossXp = Math.floor(bossDef.xp * 3.2 * (1 + (floor - 1) * 0.12))
    const scaledBossDef: EnemyDef = { ...bossDef, stats: bossStats, xp: bossXp }
    enemies.push(createEnemy(scaledBossDef, bossPos, true))
    occupied.add(`${bossPos.x},${bossPos.y}`)
  }

  const items: MapItem[] = []
  const itemCount = itemCountForFloor(floor, theme, playerLevel)
  const relationInfluence = narrative !== undefined
    ? computeRelationInfluence(narrative, theme)
    : undefined
  const latestRouteTag = narrative !== undefined ? findLatestRouteTag(narrative) : null
  const routeLootBias = latestRouteTag === 'sunk_prophecy'
    ? 0.02
    : latestRouteTag === 'furnace_oath'
      ? 0.03
      : latestRouteTag === 'abyssal_call'
        ? 0.04
        : latestRouteTag === 'iron_protocol'
          ? 0.01
          : latestRouteTag === 'rot_covenant'
            ? -0.01
            : 0
  const riskLootShift = theme.riskProfile === 'safe'
    ? -0.04
    : theme.riskProfile === 'risky'
      ? 0.05
      : theme.riskProfile === 'deadly'
        ? 0.08
        : 0
  const lootShift = theme.lootBias + riskLootShift + (relationInfluence?.lootModifier ?? 0) + routeLootBias
  const weaponThreshold = clamp(0.30 + lootShift * 0.45, 0.18, 0.45)
  const armorThreshold = clamp(weaponThreshold + 0.25 + lootShift * 0.2, weaponThreshold + 0.15, 0.72)
  const potionThreshold = clamp(armorThreshold + 0.25 - lootShift * 0.15, armorThreshold + 0.12, 0.92)

  for (let i = 0; i < itemCount; i++) {
    let placed = false
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomRoomIdx = Math.floor(Math.random() * map.rooms.length)
      const room = map.rooms[randomRoomIdx]
      const pos = randomFloorPos(map, room, occupied)
      if (pos !== null) {
        const roll = Math.random()
        let item: MapItem
        if (roll < weaponThreshold) {
          item = {
            pos,
            item: { kind: 'weapon', data: weaponForFloor(floor, theme.id) },
            ch: '/'
          }
        } else if (roll < armorThreshold) {
          item = {
            pos,
            item: { kind: 'armor', data: armorForFloor(floor, theme.id) },
            ch: ']'
          }
        } else if (roll < potionThreshold) {
          item = {
            pos,
            item: { kind: 'potion', data: potionForFloor(floor) },
            ch: '!'
          }
        } else {
          const goldAmount = 5 + Math.floor(floor * 3 + Math.random() * 10)
          item = {
            pos,
            item: { kind: 'potion', data: { name: `${goldAmount} Gold`, healType: 'hp', value: 0 } },
            ch: '$'
          }
        }
        items.push(item)
        occupied.add(`${pos.x},${pos.y}`)
        placed = true
        break
      }
    }
    if (!placed) break
  }

  // Spawn treasure chests (1-2 per floor)
  const chestCount = 1 + (Math.random() < 0.5 ? 1 : 0)
  for (let i = 0; i < chestCount; i++) {
    let placed = false
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomRoomIdx = 1 + Math.floor(Math.random() * (map.rooms.length - 1))
      const room = map.rooms[randomRoomIdx]
      const pos = randomFloorPos(map, room, occupied)
      if (pos !== null) {
        const dummyItem: InvItem = { kind: 'potion', data: { name: 'chest', healType: 'hp', value: 0 } }
        items.push({ pos, item: dummyItem, ch: 'C' })
        occupied.add(`${pos.x},${pos.y}`)
        placed = true
        break
      }
    }
    if (!placed) break
  }

  // Spawn special objects
  // Fountain (30% chance, ch: '~')
  if (Math.random() < 0.3) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomRoomIdx = 1 + Math.floor(Math.random() * (map.rooms.length - 1))
      const room = map.rooms[randomRoomIdx]
      const pos = randomFloorPos(map, room, occupied)
      if (pos !== null) {
        const dummyItem: InvItem = { kind: 'potion', data: { name: 'fountain', healType: 'hp', value: 0 } }
        items.push({ pos, item: dummyItem, ch: '~' })
        occupied.add(`${pos.x},${pos.y}`)
        break
      }
    }
  }

  // Shrine (20% chance, ch: '^')
  if (Math.random() < 0.2) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomRoomIdx = 1 + Math.floor(Math.random() * (map.rooms.length - 1))
      const room = map.rooms[randomRoomIdx]
      const pos = randomFloorPos(map, room, occupied)
      if (pos !== null) {
        const dummyItem: InvItem = { kind: 'potion', data: { name: 'shrine', healType: 'hp', value: 0 } }
        items.push({ pos, item: dummyItem, ch: '^' })
        occupied.add(`${pos.x},${pos.y}`)
        break
      }
    }
  }

  // Cursed altar (25% chance, ch: '?')
  if (Math.random() < 0.25) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomRoomIdx = 1 + Math.floor(Math.random() * (map.rooms.length - 1))
      const room = map.rooms[randomRoomIdx]
      const pos = randomFloorPos(map, room, occupied)
      if (pos !== null) {
        const dummyItem: InvItem = { kind: 'potion', data: { name: 'cursed', healType: 'hp', value: 0 } }
        items.push({ pos, item: dummyItem, ch: '?' })
        occupied.add(`${pos.x},${pos.y}`)
        break
      }
    }
  }

  // Spawn theme objects (base + per-theme variants)
  const themeObjects = [...getThemeObjects(theme)].sort(() => Math.random() - 0.5)
  const spawnedExclusiveGroups = new Set<string>()
  let spawnedRetentionObjects = 0
  const retentionCap = retentionObjectCapForFloor(floor)
  const objectRateMult = clamp(
    1 + theme.objectBias + (theme.riskProfile === 'safe' ? 0.08 : theme.riskProfile === 'deadly' ? -0.08 : 0),
    0.65,
    1.45
  )
  for (const obj of themeObjects) {
    const objId = obj.id ?? theme.id
    const balance = getRetentionObjectBalance(objId)
    if (balance !== undefined) {
      if (floor < balance.minFloor) continue
      if (spawnedRetentionObjects >= retentionCap) continue
      if (balance.exclusiveGroup !== undefined && spawnedExclusiveGroups.has(balance.exclusiveGroup)) continue
    }
    const effectiveChance = clamp(obj.spawnChance * objectRateMult, 0.02, 0.95)
    if (Math.random() >= effectiveChance) continue
    for (let attempt = 0; attempt < 50; attempt++) {
      const randomRoomIdx = 1 + Math.floor(Math.random() * (map.rooms.length - 1))
      const room = map.rooms[randomRoomIdx]
      const pos = randomFloorPos(map, room, occupied)
      if (pos !== null) {
        const dummyItem: InvItem = { kind: 'potion', data: { name: `themeObj:${objId}`, healType: 'hp', value: 0 } }
        items.push({ pos, item: dummyItem, ch: obj.ch })
        occupied.add(`${pos.x},${pos.y}`)
        if (balance !== undefined) {
          spawnedRetentionObjects += 1
          if (balance.exclusiveGroup !== undefined) {
            spawnedExclusiveGroups.add(balance.exclusiveGroup)
          }
        }
        break
      }
    }
  }

  // Spawn shop tile (30% chance, not in player or stairs room)
  if (Math.random() < 0.3 && map.rooms.length > 2) {
    const eligibleRooms = map.rooms.filter((room, idx) => {
      if (idx === 0) return false // player start room
      const c = roomCenter(room)
      if (c.x === stairsPos.x && c.y === stairsPos.y) return false // stairs room
      return true
    })
    if (eligibleRooms.length > 0) {
      const shopRoom = eligibleRooms[Math.floor(Math.random() * eligibleRooms.length)]
      const shopPos = randomFloorPos(map, shopRoom, occupied)
      if (shopPos !== null) {
        map.tiles[shopPos.y][shopPos.x] = Tile.Shop
        occupied.add(`${shopPos.x},${shopPos.y}`)
      }
    }
  }

  // Spawn special room item (if theme has specialRoomDesc)
  if (theme.specialRoomDesc !== undefined && Math.random() < 0.4 && map.rooms.length > 2) {
    const specialEligible = map.rooms.filter((room, idx) => {
      if (idx === 0) return false
      const c = roomCenter(room)
      if (c.x === stairsPos.x && c.y === stairsPos.y) return false
      if (map.tiles[c.y][c.x] === Tile.Shop) return false
      return true
    })
    if (specialEligible.length > 0) {
      const specialRoom = specialEligible[Math.floor(Math.random() * specialEligible.length)]
      const pos = randomFloorPos(map, specialRoom, occupied)
      if (pos !== null) {
        const dummyItem: InvItem = { kind: 'potion', data: { name: `specialRoom:${theme.id}`, healType: 'hp', value: 0 } }
        items.push({ pos, item: dummyItem, ch: '★' })
        occupied.add(`${pos.x},${pos.y}`)
      }
    }
  }

  // Spawn events (1-2 per floor)
  const recommendedLevel = recommendedPlayerLevelForFloor(floor)
  const underLevelGap = Math.max(0, recommendedLevel - playerLevel)
  const supportWeight = relationInfluence?.supportWeight ?? 1
  const ambushWeight = relationInfluence?.ambushWeight ?? 1
  const eventBias = theme.eventBias + (theme.riskProfile === 'deadly' ? 0.18 : theme.riskProfile === 'risky' ? 0.1 : theme.riskProfile === 'safe' ? -0.05 : 0)
  const relationEventShift = (ambushWeight - 1) * 0.08 + (supportWeight - 1) * 0.04
  const eventChance = clamp(0.22 + eventBias + relationEventShift + underLevelGap * 0.05, 0.08, 0.78)
  const eventCount = clamp(
    1 + (Math.random() < eventChance ? 1 : 0) + (Math.random() < Math.max(0, eventChance - 0.2) ? 1 : 0),
    1,
    3
  )
  const selectedEvents = selectEventsForFloor(floor, theme.id, {
    count: eventCount,
    riskProfile: theme.riskProfile,
    difficulty: theme.difficulty,
    sequenceTags: narrative?.sequenceTags,
    relation: narrative?.relation
  })
  const eligibleEventRooms = map.rooms.filter((room, idx) => {
    if (idx === 0) return false // player start room
    const c = roomCenter(room)
    if (c.x === stairsPos.x && c.y === stairsPos.y) return false // stairs room
    if (map.tiles[c.y][c.x] === Tile.Shop) return false // shop room
    return true
  })

  const shuffledEventRooms = [...eligibleEventRooms].sort(() => Math.random() - 0.5)

  for (let i = 0; i < selectedEvents.length && i < shuffledEventRooms.length; i++) {
    const room = shuffledEventRooms[i]
    const pos = randomFloorPos(map, room, occupied)
    if (pos !== null) {
      const dummyItem: InvItem = { kind: 'potion', data: { name: `event:${selectedEvents[i].id}`, healType: 'hp', value: 0 } }
      items.push({ pos, item: dummyItem, ch: '!' })
      occupied.add(`${pos.x},${pos.y}`)
    }
  }

  scatterSpecialTiles(map, floor, theme, occupied, playerPos, stairsPos)

  return { map, playerPos, enemies, items }
}

function hasLineOfSight (map: DungeonMap, x0: number, y0: number, x1: number, y1: number): boolean {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  let x = x0
  let y = y0

  while (true) {
    if (x === x1 && y === y1) return true

    if (map.tiles[y][x] === Tile.Wall) {
      return false
    }

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

export function computeFOV (map: DungeonMap, px: number, py: number): void {
  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      map.visible[y][x] = false
    }
  }

  map.visible[py][px] = true
  map.explored[py][px] = true

  for (let y = 0; y < MAP_HEIGHT; y++) {
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (manhattanDist({ x: px, y: py }, { x, y }) > FOV_RADIUS) continue
      if (x === px && y === py) continue

      if (hasLineOfSight(map, px, py, x, y)) {
        map.visible[y][x] = true
        map.explored[y][x] = true
      }
    }
  }
}
