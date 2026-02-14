import {
  type GameState,
  type EventOutcome,
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
import {
  applyRelationDelta,
  emitNarrativeMetric,
  applyRunEndMetricsIfNeeded,
  addThemeMark,
  resolveMarkSetUnlocks,
  applyMarkSetEffect
} from './narrative'

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
    let kills = state.kills
    let enemies = state.enemies
    let enemiesChanged = false
    let map = state.map
    let mapChanged = false
    const token = mapItem.item.data.name.slice(9)
    const obj = findThemeObjectByToken(state, token)
    if (obj === undefined) return state

    const cloneEnemies = (): void => {
      if (enemiesChanged) return
      enemies = state.enemies.map(e => ({ ...e, stats: { ...e.stats }, pos: { ...e.pos } }))
      enemiesChanged = true
    }

    const cloneMap = (): void => {
      if (mapChanged) return
      map = {
        ...state.map,
        explored: state.map.explored.map(row => [...row]),
        visible: state.map.visible.map(row => [...row])
      }
      mapChanged = true
    }

    const grantRandomEquipment = (floorBoost: number = 0, minRank: number = 0): void => {
      if (player.inventory.length >= MAX_INVENTORY) {
        newLog.push('인벤토리가 가득 찼다')
        return
      }
      const targetFloor = Math.min(state.floor + floorBoost, TOTAL_FLOORS)
      const isWeapon = Math.random() < 0.5
      if (isWeapon) {
        const wpn = minRank > 0
          ? rollWeaponByRarity(targetFloor, state.currentTheme.id, minRank)
          : weaponForFloor(targetFloor, state.currentTheme.id)
        player.inventory = [...player.inventory, { kind: 'weapon', data: wpn }]
        newLog.push(`${rarityColor(wpn.rarity)}${wpn.name}${C.reset} 획득!`)
      } else {
        const arm = minRank > 0
          ? rollArmorByRarity(targetFloor, state.currentTheme.id, minRank)
          : armorForFloor(targetFloor, state.currentTheme.id)
        player.inventory = [...player.inventory, { kind: 'armor', data: arm }]
        newLog.push(`${rarityColor(arm.rarity)}${arm.name}${C.reset} 획득!`)
      }
    }

    const grantPotion = (): void => {
      if (player.inventory.length >= MAX_INVENTORY) {
        newLog.push('인벤토리가 가득 찼다')
        return
      }
      const pot = potionForFloor(state.floor)
      player.inventory = [...player.inventory, { kind: 'potion', data: pot }]
      newLog.push(`${pot.name} 획득!`)
    }

    const teleportToRandomRoom = (): void => {
      const rooms = state.map.rooms
      if (rooms.length <= 1) return
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)]
      const cx = randomRoom.x + Math.floor(randomRoom.w / 2)
      const cy = randomRoom.y + Math.floor(randomRoom.h / 2)
      player.pos = { x: cx, y: cy }
      computeFOV(state.map, cx, cy)
      newLog.push('공간이 뒤틀리며 다른 구역으로 이동했다!')
    }

    const damageEnemy = (idx: number, damage: number): void => {
      cloneEnemies()
      const enemy = enemies[idx]
      if (!enemy.alive) return
      enemy.stats.hp -= damage
      if (enemy.stats.hp <= 0) {
        enemy.stats.hp = 0
        enemy.alive = false
        kills += 1
        player.xp += enemy.xp
        player.gold += Math.floor(state.floor * 2 + Math.random() * 6)
        newLog.push(`${enemy.name} 처치!`)
      }
    }

    const damageRandomEnemy = (damage: number): void => {
      const alive = state.enemies
        .map((e, i) => ({ e, i }))
        .filter(x => x.e.alive)
      if (alive.length === 0) return
      const picked = alive[Math.floor(Math.random() * alive.length)].i
      damageEnemy(picked, damage)
    }

    const damageAdjacentEnemies = (damage: number): number => {
      let hit = 0
      for (let i = 0; i < state.enemies.length; i++) {
        const e = state.enemies[i]
        if (!e.alive) continue
        const dist = Math.abs(e.pos.x - player.pos.x) + Math.abs(e.pos.y - player.pos.y)
        if (dist <= 1) {
          damageEnemy(i, damage)
          hit += 1
        }
      }
      return hit
    }

    const damageAllEnemies = (baseDamage: number): number => {
      let hit = 0
      for (let i = 0; i < state.enemies.length; i++) {
        if (!state.enemies[i].alive) continue
        damageEnemy(i, baseDamage)
        hit += 1
      }
      return hit
    }

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
      case 'randomItem':
        grantRandomEquipment(0, 0)
        break
      case 'teleport':
        teleportToRandomRoom()
        break
      case 'bloodAltar': {
        const hpCost = Math.max(1, Math.floor(player.stats.maxHp * 0.2))
        player.stats.hp = Math.max(1, player.stats.hp - hpCost)
        const bless = Math.floor(Math.random() * 3)
        if (bless === 0) {
          player.stats.str += 2 + Math.floor(state.floor / 6)
          newLog.push('피의 대가로 힘이 증가했다! STR 상승')
        } else if (bless === 1) {
          player.stats.def += 2 + Math.floor(state.floor / 6)
          newLog.push('피의 대가로 육체가 단단해졌다! DEF 상승')
        } else {
          const hpGain = 8 + Math.floor(state.floor / 2)
          player.stats.maxHp += hpGain
          player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + hpGain)
          newLog.push(`피의 계약으로 생명력 확장! MaxHP +${hpGain}`)
        }
        break
      }
      case 'echoWell': {
        const roll = Math.random()
        if (roll < 0.25) {
          const heal = Math.floor(player.stats.maxHp * 0.25)
          player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal)
          newLog.push(`메아리 회복! HP +${heal}`)
        } else if (roll < 0.5) {
          const xpGain = state.floor * 12
          player.xp += xpGain
          newLog.push(`메아리 지식 획득! XP +${xpGain}`)
        } else if (roll < 0.75) {
          const goldGain = state.floor * 10
          player.gold += goldGain
          newLog.push(`메아리 파편 환전! Gold +${goldGain}`)
        } else {
          player.stats.str += 1
          player.stats.def += 1
          newLog.push('메아리가 전투 감각을 복제했다! STR/DEF +1')
        }
        break
      }
      case 'brokenClock':
        player.nextAttackTurn = Math.max(0, state.turns - 1)
        cloneEnemies()
        for (const e of enemies) {
          if (!e.alive) continue
          e.nextAttackTurn += 1
        }
        newLog.push('시간이 비틀려 플레이어는 빨라지고 적은 느려졌다.')
        break
      case 'mirrorGate': {
        const recoil = Math.max(1, Math.floor(player.stats.maxHp * 0.12))
        player.stats.hp = Math.max(1, player.stats.hp - recoil)
        const xpGain = state.floor * 14
        player.xp += xpGain
        newLog.push(`거울 분신과의 결투에서 승리! XP +${xpGain}`)
        if (Math.random() < 0.35) grantRandomEquipment(1, 1)
        break
      }
      case 'cursedVending':
        if (Math.random() < 0.67) {
          grantRandomEquipment(1, Math.random() < 0.45 ? 1 : 0)
        } else {
          player.stats.hp = Math.max(1, Math.floor(player.stats.hp * 0.7))
          player.gold = Math.max(0, player.gold - state.floor * 6)
          newLog.push('저주 상품이었다... HP와 Gold를 잃었다.')
        }
        break
      case 'pocketRift':
        teleportToRandomRoom()
        grantRandomEquipment(1, 0)
        break
      case 'bountyBoard': {
        let targetIdx = -1
        let maxHp = -1
        for (let i = 0; i < state.enemies.length; i++) {
          const e = state.enemies[i]
          if (!e.alive) continue
          if (e.stats.hp > maxHp) {
            maxHp = e.stats.hp
            targetIdx = i
          }
        }
        if (targetIdx !== -1) {
          const dmg = Math.max(6, Math.floor(state.floor * 4.5))
          damageEnemy(targetIdx, dmg)
          newLog.push('현상금 표식이 발동해 표적이 약화됐다.')
        } else {
          newLog.push('현상금 대상이 없다.')
        }
        break
      }
      case 'pactStatue':
        player.stats.maxHp = Math.max(12, player.stats.maxHp - 4)
        player.stats.hp = Math.min(player.stats.hp, player.stats.maxHp)
        grantRandomEquipment(2, 1)
        newLog.push('계약의 대가로 생명력을 잃었지만 강한 장비를 얻었다.')
        break
      case 'memoryObelisk': {
        const roll = Math.random()
        if (roll < 0.34) {
          player.stats.str += 2
          newLog.push('전장의 기억이 육체에 새겨졌다. STR +2')
        } else if (roll < 0.67) {
          player.stats.def += 2
          newLog.push('수호의 기억이 피부를 감쌌다. DEF +2')
        } else {
          player.stats.maxHp += 6
          player.stats.hp += 6
          newLog.push('생존의 기억이 심장을 강화했다. MaxHP +6')
        }
        break
      }
      case 'mutationCapsule': {
        const roll = Math.random()
        if (roll < 0.34) {
          player.stats.str += 4
          player.stats.def = Math.max(0, player.stats.def - 2)
          newLog.push('근육 변이 성공! STR +4, DEF -2')
        } else if (roll < 0.67) {
          player.stats.def += 4
          player.stats.str = Math.max(1, player.stats.str - 2)
          newLog.push('외피 변이 성공! DEF +4, STR -2')
        } else {
          player.stats.maxHp += 12
          player.stats.hp += 12
          player.stats.str = Math.max(1, player.stats.str - 1)
          newLog.push('세포 과증식! MaxHP +12, STR -1')
        }
        break
      }
      case 'climateTotem': {
        const roll = Math.random()
        if (roll < 0.34) {
          const hit = damageAllEnemies(Math.max(4, state.floor * 2))
          newLog.push(`열파가 퍼졌다! 적 ${hit}체 피해`)
        } else if (roll < 0.67) {
          cloneEnemies()
          for (const e of enemies) {
            if (!e.alive) continue
            e.nextAttackTurn += 2
          }
          newLog.push('혹한이 번져 적의 행동이 지연됐다.')
        } else {
          const heal = Math.max(4, state.floor * 2)
          player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + heal)
          newLog.push(`폭풍의 전하를 흡수했다! HP +${heal}`)
        }
        break
      }
      case 'trapWorkbench': {
        const hit = damageAdjacentEnemies(Math.max(6, state.floor * 3))
        if (hit === 0) {
          player.stats.def += 1
          newLog.push('즉시 터뜨릴 함정이 없어 장비만 보강했다. DEF +1')
        } else {
          newLog.push(`근접 함정이 발동했다! 적 ${hit}체 타격`)
        }
        break
      }
      case 'resonancePillar':
        for (let i = 0; i < 2; i++) {
          const roll = Math.random()
          if (roll < 0.25) {
            player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + Math.floor(player.stats.maxHp * 0.12))
          } else if (roll < 0.5) {
            player.gold += state.floor * 8
          } else if (roll < 0.75) {
            player.xp += state.floor * 8
          } else {
            player.stats.str += 1
            player.stats.def += 1
          }
        }
        newLog.push('공명 연쇄가 발동해 여러 축복이 중첩됐다.')
        break
      case 'noiseBeacon':
        player.gold += state.floor * 12
        player.stats.hp = Math.max(1, player.stats.hp - Math.max(2, state.floor))
        cloneEnemies()
        for (const e of enemies) {
          if (!e.alive) continue
          e.nextAttackTurn = Math.min(e.nextAttackTurn, state.turns)
        }
        newLog.push('소음으로 적이 각성했다! 하지만 약탈 보상을 챙겼다.')
        break
      case 'campfire':
        if (Math.random() < 0.5) {
          player.stats.hp = player.stats.maxHp
          newLog.push('휴식 완료. HP 완전 회복!')
        } else {
          player.stats.str += 1
          player.stats.def += 1
          if (player.weapon !== null) {
            const curSpeed = player.weapon.speed ?? 2
            player.weapon = { ...player.weapon, speed: Math.max(1, curSpeed - 1) }
          }
          newLog.push('장비를 정비했다. STR/DEF +1, 무기 속도 향상')
        }
        break
      case 'runeForge': {
        const eqIndices = player.inventory
          .map((item, i) => ({ item, i }))
          .filter(x => x.item.kind === 'weapon' || x.item.kind === 'armor')
        if (eqIndices.length >= 2) {
          const first = eqIndices[0]
          const second = eqIndices[1]
          const remain = player.inventory.filter((_, i) => i !== first.i && i !== second.i)
          if (first.item.kind === 'weapon' && second.item.kind === 'weapon') {
            const fused = {
              kind: 'weapon' as const,
              data: {
                name: `룬합성 ${first.item.data.name}`,
                atk: Math.floor((first.item.data.atk + second.item.data.atk) / 2) + 2,
                range: Math.max(first.item.data.range ?? 1, second.item.data.range ?? 1),
                speed: Math.max(1, Math.min(first.item.data.speed ?? 2, second.item.data.speed ?? 2) - 1),
                rarity: 'rare' as const
              }
            }
            player.inventory = [...remain, fused]
            newLog.push('룬 대장간에서 무기 2개를 융합했다!')
          } else if (first.item.kind === 'armor' && second.item.kind === 'armor') {
            const fused = {
              kind: 'armor' as const,
              data: {
                name: `룬합성 ${first.item.data.name}`,
                def: Math.floor((first.item.data.def + second.item.data.def) / 2) + 2,
                rarity: 'rare' as const
              }
            }
            player.inventory = [...remain, fused]
            newLog.push('룬 대장간에서 방어구 2개를 융합했다!')
          } else {
            player.inventory = remain
            grantRandomEquipment(1, 1)
            newLog.push('속성이 달라 융합 실패. 대신 부산물을 얻었다.')
          }
        } else {
          grantRandomEquipment(1, 1)
          newLog.push('융합할 장비가 부족해 보상 장비를 직접 받았다.')
        }
        break
      }
      case 'entropyChest': {
        const roll = Math.random()
        if (roll < 0.25) {
          grantRandomEquipment(2, 2)
          grantRandomEquipment(1, 1)
          newLog.push('대성공! 엔트로피가 희귀 보상으로 수렴했다.')
        } else if (roll < 0.5) {
          player.stats.hp = Math.max(1, Math.floor(player.stats.hp * 0.55))
          player.gold += state.floor * 25
          newLog.push('불안정 폭주! HP를 잃고 막대한 Gold를 얻었다.')
        } else if (roll < 0.75) {
          player.xp += state.floor * 20
          newLog.push('정보 엔트로피 해석 성공! 대량 XP 획득')
        } else {
          player.stats.str = Math.max(1, player.stats.str - 1)
          player.stats.def = Math.max(0, player.stats.def - 1)
          grantPotion()
          newLog.push('뒤틀린 결과... 능력치가 흔들렸지만 생존 물자는 확보했다.')
        }
        break
      }
      case 'debtBroker': {
        const loan = state.floor * 30
        player.gold += loan
        player.stats.maxHp = Math.max(12, player.stats.maxHp - 3)
        player.stats.hp = Math.min(player.stats.hp, player.stats.maxHp)
        newLog.push(`대출 체결! Gold +${loan}, MaxHP -3`)
        break
      }
      case 'ghostShop': {
        const ghostCost = state.floor * 8
        if (player.gold >= ghostCost && player.inventory.length < MAX_INVENTORY) {
          player.gold -= ghostCost
          grantRandomEquipment(1, 1)
          newLog.push(`유령 상점 거래 완료 (-${ghostCost}G)`)
        } else if (player.inventory.length >= MAX_INVENTORY) {
          newLog.push('유령 상점: 인벤토리가 가득 차 거래 실패')
        } else {
          newLog.push('유령 상점: 골드가 부족해 거래 실패')
        }
        break
      }
      case 'chronoBank':
        player.nextAttackTurn = state.turns
        player.xp += state.floor * 10
        if (player.weapon !== null) {
          const curSpeed = player.weapon.speed ?? 2
          player.weapon = { ...player.weapon, speed: Math.max(1, curSpeed - 1) }
        }
        newLog.push('축적된 시간을 인출했다! 공격 리듬이 빨라졌다.')
        break
      case 'overheatReactor': {
        const recoil = Math.max(1, Math.floor(player.stats.maxHp * 0.15))
        player.stats.hp = Math.max(1, player.stats.hp - recoil)
        if (player.weapon !== null) {
          const curSpeed = player.weapon.speed ?? 2
          player.weapon = {
            ...player.weapon,
            atk: player.weapon.atk + 2 + Math.floor(state.floor / 6),
            speed: Math.max(1, curSpeed - 1)
          }
          newLog.push('무기가 과열 강화됐다! 공격력/속도 상승')
        } else {
          player.stats.str += 2
          newLog.push('장착 무기가 없어 신체가 과열 적응했다. STR +2')
        }
        break
      }
      case 'companionEgg':
        grantPotion()
        damageRandomEnemy(Math.max(5, state.floor * 3))
        newLog.push('동행의 기운이 적을 공격하고 지원 물자를 남겼다.')
        break
      case 'reputationIdol': {
        const roll = Math.random()
        if (roll < 0.34) {
          player.gold += state.floor * 14
          newLog.push('세력 호감 상승: 후원금 획득')
        } else if (roll < 0.67) {
          player.xp += state.floor * 14
          newLog.push('세력 호감 상승: 전술 기록 전달')
        } else {
          grantRandomEquipment(1, 1)
          newLog.push('세력 호감 상승: 특수 장비 보급')
        }
        break
      }
      case 'foresightCocoon':
        cloneMap()
        for (let y = 0; y < map.explored.length; y++) {
          for (let x = 0; x < map.explored[y].length; x++) {
            map.explored[y][x] = true
          }
        }
        newLog.push('예지 발동! 현재 층의 지형이 머릿속에 각인됐다.')
        break
      case 'parasitePool':
        player.stats.str += 3
        player.stats.def = Math.max(0, player.stats.def - 1)
        player.stats.hp = Math.max(1, player.stats.hp - Math.max(1, Math.floor(state.floor / 2)))
        newLog.push('기생 공생체 장착: STR +3, DEF -1')
        break
      case 'greedBeacon': {
        const goldGain = state.floor * 20
        player.gold += goldGain
        player.stats.hp = Math.max(1, player.stats.hp - Math.max(2, state.floor * 2))
        newLog.push(`탐욕 폭주! Gold +${goldGain}, HP 소모`)
        break
      }
      case 'guardianStatue':
        player.reviveCharges += 1
        newLog.push('수호 인장 획득! 다음 치명상을 1회 무효화')
        break
      case 'chaosPrism': {
        const pool = player.stats.str + player.stats.def + Math.max(4, Math.floor(player.stats.maxHp / 6))
        const newStr = 1 + Math.floor(Math.random() * Math.max(2, Math.floor(pool * 0.45)))
        const remain = Math.max(2, pool - newStr)
        const newDef = Math.floor(Math.random() * Math.max(1, Math.floor(remain * 0.5)))
        const hpFactor = Math.max(4, remain - newDef)
        player.stats.str = newStr
        player.stats.def = newDef
        player.stats.maxHp = hpFactor * 6
        player.stats.hp = Math.min(player.stats.hp, player.stats.maxHp)
        newLog.push('혼돈 프리즘이 능력치를 재배열했다.')
        break
      }
      case 'codexTablet': {
        const xpGain = state.floor * 20
        player.xp += xpGain
        grantRandomEquipment(2, 2)
        newLog.push(`고문서 해독 완료! XP +${xpGain}`)
        break
      }
      case 'omenGate':
        player.omenMarks += 1
        player.stats.hp = Math.max(1, Math.floor(player.stats.hp * 0.9))
        grantRandomEquipment(1, 1)
        newLog.push('종말의 인장이 각인됐다. 다음 보스 드랍이 강화된다.')
        break
      default:
        break
    }

    let result: GameState = {
      ...state,
      player,
      enemies,
      map,
      items: newItems,
      log: newLog,
      usedObjects: newUsedObjects,
      kills,
      projectile: null
    }
    result = checkLevelUp(result)
    if (result.player.stats.hp <= 0) {
      result = {
        ...result,
        over: true,
        player: { ...result.player, stats: { ...result.player.stats, hp: 0 } },
        log: [...result.log, '당신은 쓰러졌다...']
      }
    }
    return applyRunEndMetricsIfNeeded(result)
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

function relationDeltaForEvent (
  eventId: string,
  choiceIdx: number,
  category: string
): Partial<GameState['narrative']['relation']> {
  if (eventId === 'imprisoned_spirit') {
    if (choiceIdx === 0) return { survivor: 2 }
    if (choiceIdx === 1) return { betrayal: 1 }
    return { cultist: 2, betrayal: 1 }
  }
  if (eventId === 'dying_adventurer') {
    if (choiceIdx === 0) return { survivor: 2 }
    if (choiceIdx === 1) return { betrayal: 2 }
    return {}
  }
  if (eventId === 'survivor_hideout') {
    if (choiceIdx === 0) return { survivor: 2 }
    if (choiceIdx === 1) return { survivor: 1, betrayal: 1 }
    return { betrayal: 1 }
  }
  if (eventId === 'dark_library') {
    if (choiceIdx === 0) return { cultist: 2 }
    if (choiceIdx === 1) return { betrayal: 1 }
    return { survivor: 1 }
  }
  if (eventId === 'forbidden_tome') {
    if (choiceIdx === 0) return { cultist: 2 }
    if (choiceIdx === 1) return { survivor: 1 }
    return { survivor: 1 }
  }

  if (category === 'npc') {
    if (choiceIdx === 0) return { survivor: 1 }
    if (choiceIdx === 2) return { betrayal: 1 }
  }
  return {}
}

function hasRelationDelta (delta: Partial<GameState['narrative']['relation']>): boolean {
  return (delta.survivor ?? 0) !== 0 || (delta.cultist ?? 0) !== 0 || (delta.betrayal ?? 0) !== 0
}

function relationDeltaLog (delta: Partial<GameState['narrative']['relation']>): string {
  const parts: string[] = []
  if ((delta.survivor ?? 0) !== 0) parts.push(`생존자 ${(delta.survivor ?? 0) > 0 ? '+' : ''}${delta.survivor}`)
  if ((delta.cultist ?? 0) !== 0) parts.push(`광신도 ${(delta.cultist ?? 0) > 0 ? '+' : ''}${delta.cultist}`)
  if ((delta.betrayal ?? 0) !== 0) parts.push(`배신 ${(delta.betrayal ?? 0) > 0 ? '+' : ''}${delta.betrayal}`)
  return `[관계] ${parts.join(' / ')}`
}

function isPositiveEventOutcome (outcome: EventOutcome): boolean {
  if ((outcome.hpChange ?? 0) > 0) return true
  if ((outcome.maxHpChange ?? 0) > 0) return true
  if ((outcome.strChange ?? 0) > 0) return true
  if ((outcome.defChange ?? 0) > 0) return true
  if ((outcome.goldChange ?? 0) > 0) return true
  if ((outcome.xpChange ?? 0) > 0) return true
  if (outcome.giveItem !== undefined) return true
  if (outcome.fullHeal === true) return true
  return false
}

function isThemeEventSuccess (state: GameState, eventDefId: string, eventThemeIds: string[] | undefined, outcome: EventOutcome): boolean {
  if (eventDefId === 'boss_phase_decision') return false
  if (eventThemeIds === undefined || !eventThemeIds.includes(state.currentTheme.id)) return false
  if ((outcome.hpChange ?? 0) < 0) return false
  return isPositiveEventOutcome(outcome)
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

  const relationDelta = relationDeltaForEvent(eventDef.id, state.eventIdx, eventDef.category)
  let narrative = state.narrative
  let floorEventMarkClaimed = state.floorEventMarkClaimed
  if (hasRelationDelta(relationDelta)) {
    narrative = applyRelationDelta(narrative, relationDelta)
    newLog.push(relationDeltaLog(relationDelta))
  }

  const gainedThemeEventMark = isThemeEventSuccess(state, eventDef.id, eventDef.themeIds, outcome) && !floorEventMarkClaimed
  const unlockedSetIds: string[] = []
  if (gainedThemeEventMark) {
    narrative = addThemeMark(narrative, state.currentTheme.id, 1)
    floorEventMarkClaimed = true
    newLog.push(`낙인 획득: ${state.currentTheme.name} +1 (테마 이벤트)`)
    const markSetResult = resolveMarkSetUnlocks(narrative)
    narrative = markSetResult.narrative
    for (const setId of markSetResult.unlocked) {
      unlockedSetIds.push(setId)
      newLog.push(`낙인 조합 각성: ${setId}`)
    }
  }

  let result: GameState = {
    ...state,
    player,
    narrative,
    floorEventMarkClaimed,
    log: newLog,
    activeEvent: null,
    eventIdx: 0,
    projectile: null
  }

  if (eventDef.id === 'boss_phase_decision') {
    const context = result.bossPhaseContext
    if (context !== null) {
      const enemies = result.enemies.map(enemy => ({ ...enemy, stats: { ...enemy.stats }, pos: { ...enemy.pos } }))
      const boss = enemies[context.enemyIndex]
      if (boss !== undefined && boss.alive) {
        if (state.eventIdx === 0) {
          boss.nextAttackTurn += 2
          result = { ...result, log: [...result.log, '후퇴 성공: 보스의 리듬이 잠시 끊겼다.'] }
        } else if (state.eventIdx === 1) {
          result = {
            ...result,
            player: {
              ...result.player,
              nextAttackTurn: Math.max(result.turns, result.player.nextAttackTurn - 1)
            },
            log: [...result.log, '강화 성공: 전투 템포가 상승했다.']
          }
        } else {
          boss.stats.str += 2
          boss.attackSpeed = Math.max(1, boss.attackSpeed - 1)
          result = {
            ...result,
            narrative: {
              ...result.narrative,
              omenStage: Math.min(4, result.narrative.omenStage + 1) as 0 | 1 | 2 | 3 | 4
            },
            log: [...result.log, '위험 감수: 보스도 함께 각성했다.']
          }
        }
        result = { ...result, enemies }
      }
      result = emitNarrativeMetric(result, 'boss_phase_choice', {
        choice_idx: state.eventIdx,
        boss: context.bossName
      })
    }
    result = { ...result, bossPhaseContext: null }
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
  if (hasRelationDelta(relationDelta)) {
    result = emitNarrativeMetric(result, 'relation_change', {
      event_id: eventDef.id,
      choice_idx: state.eventIdx,
      survivor: relationDelta.survivor ?? 0,
      cultist: relationDelta.cultist ?? 0,
      betrayal: relationDelta.betrayal ?? 0
    })
  }
  if (gainedThemeEventMark) {
    result = emitNarrativeMetric(result, 'theme_mark_gain', {
      mark_id: result.currentTheme.id,
      amount: 1,
      reason: 'theme_event_success'
    })
    for (const setId of unlockedSetIds) {
      result = emitNarrativeMetric(result, 'theme_mark_set_complete', { set_id: setId })
      result = applyMarkSetEffect(result, setId)
    }
  }

  // Check if player died
  if (result.player.stats.hp <= 0) {
    result = { ...result, over: true, player: { ...result.player, stats: { ...result.player.stats, hp: 0 } } }
    result.log = [...result.log, '당신은 쓰러졌다...']
  }

  return applyRunEndMetricsIfNeeded(result)
}

export function cancelEvent (state: GameState): GameState {
  if (state.activeEvent === null) return state
  if (state.activeEvent.eventId === 'boss_phase_decision') {
    return { ...state, log: [...state.log, '지금은 결정을 피할 수 없다.'] }
  }
  return { ...state, activeEvent: null, eventIdx: 0, projectile: null }
}
