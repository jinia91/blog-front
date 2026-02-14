import {
  type GameState,
  type InvItem,
  MAX_INVENTORY,
  TOTAL_FLOORS,
  LEGENDARY_WEAPONS,
  LEGENDARY_ARMORS,
  weaponForFloor,
  armorForFloor,
  potionForFloor
} from './types'
import { computeFOV } from './dungeon'
import { getEventById } from './events'
import { C, rarityColor } from './game-text'
import {
  checkLevelUp,
  rollWeaponByRarity,
  rollArmorByRarity,
  findThemeObjectByToken
} from './game-core-utils'

export function pickUpItems (state: GameState): GameState {
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
    const token = mapItem.item.data.name.slice(9)
    const obj = findThemeObjectByToken(state, token)
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
      const dropFloor = Math.min(state.floor + (state.floor >= 5 ? 1 : 0), TOTAL_FLOORS)
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
        const wpn = rollWeaponByRarity(state.floor, state.currentTheme.id, 1)
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
          newLog.push(`${rarityColor(wpn.rarity)}${wpn.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      } else {
        const arm = rollArmorByRarity(state.floor, state.currentTheme.id, 1)
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
    // Legendary drops are late-floor only.
    const chestLegendChance = state.floor >= 8 ? 0.03 : state.floor >= 6 ? 0.01 : 0
    if (Math.random() < chestLegendChance && player.inventory.length < MAX_INVENTORY) {
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
        const wpn = rollWeaponByRarity(state.floor, state.currentTheme.id, 1)
        if (player.inventory.length < MAX_INVENTORY) {
          player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
          newLog.push(`저주 제단에서 보상이! ${rarityColor(wpn.rarity)}${wpn.name}${C.reset} 획득!`)
        } else {
          newLog.push('인벤토리가 가득 찼다')
        }
      } else {
        const arm = rollArmorByRarity(state.floor, state.currentTheme.id, 1)
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
      newLog.push(`${item.data.name} 해제!`)
      return { ...state, player, log: newLog }
    }
    const newInventory = player.inventory.filter((_, i) => i !== idx)
    player.inventory = newInventory
    if (player.weapon !== null) {
      player.inventory = [...player.inventory, { kind: 'weapon' as const, data: player.weapon }]
    }
    player.weapon = item.data
    newLog.push(`${item.data.name} 장착!`)
  } else if (item.kind === 'armor') {
    if (player.armor !== null && player.armor.name === item.data.name && player.armor.def === item.data.def) {
      player.armor = null
      newLog.push(`${item.data.name} 해제!`)
      return { ...state, player, log: newLog }
    }
    const newInventory = player.inventory.filter((_, i) => i !== idx)
    player.inventory = newInventory
    if (player.armor !== null) {
      player.inventory = [...player.inventory, { kind: 'armor' as const, data: player.armor }]
    }
    player.armor = item.data
    newLog.push(`${item.data.name} 장착!`)
  } else if (item.kind === 'potion') {
    const newInventory = player.inventory.filter((_, i) => i !== idx)
    player.inventory = newInventory
    if (item.data.healType === 'hp') {
      const heal = Math.min(item.data.value, player.stats.maxHp - player.stats.hp)
      player.stats.hp += heal
      newLog.push(`체력 포션으로 ${heal} 회복!`)
    } else {
      player.stats.str += item.data.value
      newLog.push(`STR +${item.data.value}!`)
    }
  }

  return { ...state, player, log: newLog, projectile: null }
}

export function dropItem (state: GameState, idx: number): GameState {
  if (idx < 0 || idx >= state.player.inventory.length) return state

  const item = state.player.inventory[idx]
  const player = { ...state.player, inventory: state.player.inventory.filter((_, i) => i !== idx) }
  const newLog = [...state.log, `${getItemName(item)} 버리기`]

  return { ...state, player, log: newLog, projectile: null }
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

  return { ...state, player, shopItems: newShopItems, log: newLog, projectile: null }
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
    eventIdx: 0,
    projectile: null
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
  return { ...state, activeEvent: null, eventIdx: 0, projectile: null }
}
