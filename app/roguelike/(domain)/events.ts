import {
  type EventDef, type EventOutcome, type GameState, type InvItem,
  weaponForFloor, armorForFloor, potionForFloor
} from './types'

function skillCheck (playerStat: number, difficulty: number): boolean {
  return playerStat + Math.floor(Math.random() * 6) >= difficulty
}

export const EVENT_REGISTRY: EventDef[] = [
  // ─── CHOICE EVENTS (6) ───────────────────────────────────────────

  {
    id: 'mysterious_chest',
    name: '신비한 상자',
    category: 'choice',
    description: [
      '오래된 상자가 은은한 빛을 발하고 있다...',
      '자물쇠에는 함정의 흔적이 보인다.'
    ],
    choices: [
      { label: '열어본다', description: '상자를 열어 보물을 확인한다' },
      { label: '부순다', description: '조심히 상자를 부수어 안전하게 연다' },
      { label: '무시한다', description: '위험을 피해 지나간다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.7) {
          const item: InvItem = Math.random() < 0.5
            ? { kind: 'weapon', data: weaponForFloor(floor + 1) }
            : { kind: 'armor', data: armorForFloor(floor + 1) }
          return { log: ['상자에서 보물을 발견했다!'], giveItem: item }
        }
        return {
          log: ['함정이다!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.25)
        }
      }
      if (choiceIdx === 1) {
        const item: InvItem = Math.random() < 0.5
          ? { kind: 'weapon', data: weaponForFloor(floor) }
          : { kind: 'armor', data: armorForFloor(floor) }
        return { log: ['안전하게 상자를 열었다.'], giveItem: item }
      }
      return { log: ['현명한 선택이다.'], goldChange: floor * 10 }
    }
  },

  {
    id: 'abandoned_altar',
    name: '버려진 제단',
    category: 'choice',
    description: [
      '피로 물든 제단이 어둠 속에 서있다...',
      '무언가를 바치면 힘을 얻을 수 있을 것 같다.'
    ],
    choices: [
      { label: 'HP를 바친다', description: '생명력을 제물로 바친다' },
      { label: '골드를 바친다', description: '재물을 제물로 바친다' },
      { label: '기도한다', description: '아무것도 바치지 않고 기도한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (state.player.stats.hp <= 15) {
          return { log: ['HP가 부족하다.'] }
        }
        if (Math.random() < 0.5) {
          return { log: ['제단이 힘을 부여했다!'], hpChange: -15, strChange: 3 }
        }
        return { log: ['제단이 방어의 축복을 내렸다!'], hpChange: -15, defChange: 3 }
      }
      if (choiceIdx === 1) {
        const cost = floor * 20
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        const item: InvItem = Math.random() < 0.5
          ? { kind: 'weapon', data: weaponForFloor(floor + 1) }
          : { kind: 'armor', data: armorForFloor(floor + 1) }
        return { log: ['제단이 보물을 내려주었다!'], goldChange: -cost, giveItem: item }
      }
      if (Math.random() < 0.5) {
        return { log: ['신의 축복!'], fullHeal: true }
      }
      return { log: ['아무 일도 일어나지 않았다...'] }
    }
  },

  {
    id: 'wishing_well',
    name: '소원의 우물',
    category: 'choice',
    description: [
      '깊은 우물에서 신비한 빛이 올라온다...',
      '동전을 던지면 소원이 이루어질까?'
    ],
    choices: [
      { label: '동전을 던진다', description: '골드를 바쳐 소원을 빈다' },
      { label: '우물을 들여다본다', description: '호기심에 우물 속을 살핀다' },
      { label: '지나간다', description: '그냥 지나친다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        const cost = floor * 15
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        const roll = Math.random()
        if (roll < 0.4) {
          return { log: ['체력의 한계가 확장됐다!'], goldChange: -cost, maxHpChange: 15 }
        }
        if (roll < 0.7) {
          return { log: ['힘이 솟구친다!'], goldChange: -cost, strChange: 2 }
        }
        return { log: ['방어력이 강화됐다!'], goldChange: -cost, defChange: 2 }
      }
      if (choiceIdx === 1) {
        if (Math.random() < 0.6) {
          return {
            log: ['우물 속에서 포션을 발견했다!'],
            giveItem: { kind: 'potion', data: potionForFloor(floor) }
          }
        }
        return { log: ['아무것도 보이지 않는다...'] }
      }
      return { log: ['발걸음을 돌렸다.'] }
    }
  },

  {
    id: 'gamblers_den',
    name: '도박꾼의 방',
    category: 'choice',
    description: [
      '해골이 주사위를 쥐고 있다...',
      '"한 판 하겠나?" 라고 적혀있다.'
    ],
    choices: [
      { label: '도박한다', description: '골드를 걸고 주사위를 굴린다' },
      { label: '해골을 뒤진다', description: '해골 주변을 살핀다' },
      { label: '떠난다', description: '도박은 미련한 짓이다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        const bet = floor * 10
        if (state.player.gold < bet) {
          return { log: ['골드가 부족하다.'] }
        }
        if (Math.random() < 0.5) {
          return { log: ['승리! 골드를 두 배로 얻었다!'], goldChange: bet }
        }
        return { log: ['패배... 골드를 잃었다.'], goldChange: -bet }
      }
      if (choiceIdx === 1) {
        if (Math.random() < 0.2) {
          return {
            log: ['동전을 찾았다!', '저주받은 동전이었다!'],
            goldChange: floor * 5,
            strChange: -1
          }
        }
        return { log: ['동전을 찾았다.'], goldChange: floor * 5 }
      }
      return { log: ['현명하게 발걸음을 돌렸다.'] }
    }
  },

  {
    id: 'crystal_garden',
    name: '수정 정원',
    category: 'choice',
    themeIds: ['ice', 'abyss', 'eldritch_depths', 'rlyeh'],
    description: [
      '수정 기둥들이 신비한 음을 내고 있다...',
      '힘의 원천이 느껴진다.'
    ],
    choices: [
      { label: '수정을 흡수한다', description: '수정의 에너지를 몸에 흡수한다' },
      { label: '수정을 캔다', description: '수정을 채취한다' },
      { label: '노래를 듣는다', description: '수정의 하모니에 몸을 맡긴다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        return { log: ['수정의 에너지가 몸에 흡수됐다!'], maxHpChange: 10, defChange: -1 }
      }
      if (choiceIdx === 1) {
        return {
          log: ['수정을 채취했다.'],
          giveItem: { kind: 'potion', data: potionForFloor(floor) },
          goldChange: floor * 8
        }
      }
      return { log: ['몸과 마음이 치유됐다.'], fullHeal: true }
    }
  },

  {
    id: 'dark_library',
    name: '어둠의 서재',
    category: 'choice',
    themeIds: ['crypt', 'sunken_temple', 'rlyeh'],
    description: [
      '고대의 서적이 가득한 서재...',
      '금지된 지식이 잠들어 있다.'
    ],
    choices: [
      { label: '금서를 읽는다', description: '금지된 지식을 탐한다' },
      { label: '서적을 가져간다', description: '쓸만한 책을 챙긴다' },
      { label: '불태운다', description: '위험한 지식을 파괴한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        return {
          log: ['금지된 지식을 얻었다! 하지만 대가가 따른다...'],
          strChange: 3,
          hpChange: -Math.floor(state.player.stats.maxHp * 0.2)
        }
      }
      if (choiceIdx === 1) {
        return {
          log: ['쓸만한 물건을 찾았다.'],
          giveItem: { kind: 'weapon', data: weaponForFloor(floor) }
        }
      }
      return { log: ['서재를 불태웠다. 경험치를 얻었다.'], xpChange: floor * 15 }
    }
  },

  // ─── TRAP EVENTS (4) ─────────────────────────────────────────────

  {
    id: 'spike_trap',
    name: '가시 함정',
    category: 'trap',
    description: [
      '바닥이 미묘하게 움직인다...',
      '함정일지도 모른다!'
    ],
    choices: [
      {
        label: '조심히 해제한다',
        description: '함정을 해제해본다',
        skillCheck: { stat: 'def', difficulty: 5 }
      },
      {
        label: '뛰어넘는다',
        description: '빠르게 뛰어넘는다',
        skillCheck: { stat: 'str', difficulty: 3 }
      },
      { label: '다른 길로 간다', description: '안전한 길을 찾는다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.def, 5 + floor)) {
          return { log: ['함정을 해제하고 보물을 발견했다!'], goldChange: floor * 12 }
        }
        return { log: ['함정 해제에 실패했다!'], hpChange: -(floor * 3) }
      }
      if (choiceIdx === 1) {
        if (skillCheck(state.player.stats.str, 3 + floor)) {
          return { log: ['무사히 넘었다!'] }
        }
        return { log: ['뛰어넘다 가시에 찔렸다!'], hpChange: -(floor * 2) }
      }
      return { log: ['다른 방으로 이동했다.'], teleport: true }
    }
  },

  {
    id: 'poison_mist',
    name: '독안개 방',
    category: 'trap',
    themeIds: ['swamp', 'sewer', 'forest'],
    description: [
      '짙은 안개가 방을 가득 채우고 있다...',
      '독이다!'
    ],
    choices: [
      {
        label: '숨을 참고 통과한다',
        description: '독을 무릅쓰고 전진한다',
        skillCheck: { stat: 'str', difficulty: 4 }
      },
      { label: '부채질한다', description: '안개를 걷어낸다' },
      { label: '돌아간다', description: '위험을 피한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.str, 4 + floor)) {
          return {
            log: ['독을 이겨내고 장비를 발견했다!'],
            giveItem: { kind: 'armor', data: armorForFloor(floor) }
          }
        }
        return {
          log: ['독에 당했다!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.2)
        }
      }
      if (choiceIdx === 1) {
        return { log: ['안개가 걷혔다.'], xpChange: floor * 5 }
      }
      return { log: ['안전하게 돌아갔다.'] }
    }
  },

  {
    id: 'collapsing_floor',
    name: '무너지는 바닥',
    category: 'trap',
    minFloor: 3,
    description: [
      '발밑에서 금이 가는 소리가 들린다...',
      '곧 무너질 것 같다!'
    ],
    choices: [
      {
        label: '빠르게 달린다',
        description: '반대편으로 전력질주한다',
        skillCheck: { stat: 'str', difficulty: 6 }
      },
      { label: '천천히 뒤로 간다', description: '조심히 물러난다' },
      {
        label: '매달린다',
        description: '튀어나온 곳에 매달린다',
        skillCheck: { stat: 'def', difficulty: 5 }
      }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.str, 6 + floor)) {
          return {
            log: ['전력질주로 반대편에 도착! 보물을 발견했다!'],
            giveItem: { kind: 'weapon', data: weaponForFloor(floor + 1) },
            goldChange: floor * 10
          }
        }
        return { log: ['바닥이 무너졌다!'], hpChange: -(floor * 4), teleport: true }
      }
      if (choiceIdx === 1) {
        return { log: ['안전하게 물러났다.'] }
      }
      if (skillCheck(state.player.stats.def, 5 + floor)) {
        return {
          log: ['매달려서 보물을 발견했다!'],
          xpChange: floor * 12,
          giveItem: { kind: 'potion', data: potionForFloor(floor) }
        }
      }
      return { log: ['매달리다 떨어졌다!'], hpChange: -(floor * 3) }
    }
  },

  {
    id: 'rune_lock',
    name: '룬 자물쇠',
    category: 'trap',
    minFloor: 2,
    description: [
      '문에 빛나는 룬이 새겨져 있다...',
      '올바른 방법으로 열어야 한다.'
    ],
    choices: [
      {
        label: '힘으로 부순다',
        description: '문을 강제로 부순다',
        skillCheck: { stat: 'str', difficulty: 8 }
      },
      {
        label: '해독한다',
        description: '룬의 의미를 파악한다',
        skillCheck: { stat: 'def', difficulty: 6 }
      },
      { label: '무시한다', description: '그냥 지나간다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.str, 8 + floor)) {
          return {
            log: ['문을 부수고 보물을 획득했다!'],
            giveItem: { kind: 'weapon', data: weaponForFloor(floor + 1) }
          }
        }
        return { log: ['마법 반격!'], hpChange: -(floor * 4) }
      }
      if (choiceIdx === 1) {
        if (skillCheck(state.player.stats.def, 6 + floor)) {
          return {
            log: ['룬을 해독하여 문을 열었다!'],
            giveItem: { kind: 'weapon', data: weaponForFloor(floor + 1) },
            goldChange: floor * 15
          }
        }
        return { log: ['해독에 실패하여 마법에 맞았다.'], hpChange: -(floor * 2) }
      }
      return { log: ['문을 지나쳤다.'] }
    }
  },

  // ─── NPC EVENTS (5) ──────────────────────────────────────────────

  {
    id: 'wandering_merchant',
    name: '떠돌이 상인',
    category: 'npc',
    description: [
      '낡은 망토의 상인이 나타났다.',
      '"좋은 물건 있소..."'
    ],
    choices: [
      { label: '물건을 본다', description: '상인의 물건을 구매한다' },
      { label: '정보를 산다', description: '던전의 정보를 얻는다' },
      { label: '대화한다', description: '이야기를 나눈다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        const cost = floor * 15
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        const item: InvItem = Math.random() < 0.5
          ? { kind: 'weapon', data: weaponForFloor(floor + 2) }
          : { kind: 'armor', data: armorForFloor(floor + 2) }
        return { log: ['상인에게서 물건을 구매했다!'], goldChange: -cost, giveItem: item }
      }
      if (choiceIdx === 1) {
        const cost = floor * 5
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        return {
          log: ['상인이 유용한 정보를 알려줬다.'],
          goldChange: -cost,
          xpChange: floor * 10
        }
      }
      return { log: ['상인과 즐거운 대화를 나눴다.'], xpChange: floor * 3 }
    }
  },

  {
    id: 'imprisoned_spirit',
    name: '갇힌 영혼',
    category: 'npc',
    themeIds: ['crypt', 'abyss', 'eldritch_depths', 'rlyeh'],
    description: [
      '사슬에 묶인 영혼이 도움을 구한다...',
      '"제발... 풀어주세요..."'
    ],
    choices: [
      { label: '풀어준다', description: '사슬을 풀어 영혼을 해방한다' },
      { label: '무시한다', description: '위험할 수 있으니 지나간다' },
      { label: '흡수한다', description: '영혼의 힘을 빨아들인다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.7) {
          return { log: ['영혼의 축복!'], strChange: 2, defChange: 2 }
        }
        return {
          log: ['영혼의 저주!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.15),
          strChange: -1
        }
      }
      if (choiceIdx === 1) {
        return { log: ['영혼의 울음소리가 점점 사라진다...'] }
      }
      return { log: ['영혼의 힘을 흡수했다.'], maxHpChange: 8, xpChange: floor * 8 }
    }
  },

  {
    id: 'blacksmith',
    name: '지하 대장장이',
    category: 'npc',
    themeIds: ['machine_factory', 'iron_fortress', 'fuel_mine', 'cave'],
    description: [
      '대장간의 불꽃이 타오른다...',
      '대장장이가 모루를 두드리고 있다.'
    ],
    choices: [
      { label: '무기 강화', description: '현재 무기를 강화한다' },
      { label: '방어구 강화', description: '현재 방어구를 강화한다' },
      { label: '수리한다', description: '장비를 수리하고 몸을 쉰다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        const cost = floor * 12
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        return {
          log: ['대장장이가 새 무기를 건네줬다!'],
          goldChange: -cost,
          giveItem: { kind: 'weapon', data: weaponForFloor(floor + 1) }
        }
      }
      if (choiceIdx === 1) {
        const cost = floor * 12
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        return {
          log: ['대장장이가 새 방어구를 건네줬다!'],
          goldChange: -cost,
          giveItem: { kind: 'armor', data: armorForFloor(floor + 1) }
        }
      }
      const cost = floor * 5
      if (state.player.gold < cost) {
        return { log: ['골드가 부족하다.'] }
      }
      return { log: ['장비를 수리하고 몸을 쉬었다.'], goldChange: -cost, fullHeal: true }
    }
  },

  {
    id: 'fortune_teller',
    name: '점술사',
    category: 'npc',
    description: [
      '수정 구슬 앞에 앉은 노파...',
      '"운명을 보여주마..."'
    ],
    choices: [
      { label: '운명을 본다', description: '미래를 점쳐본다' },
      { label: '저주를 풀어달라', description: '나쁜 기운을 떨어낸다' },
      { label: '이야기를 나눈다', description: '노파와 대화한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        const cost = floor * 8
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        const roll = Math.random()
        if (roll < 0.33) {
          return { log: ['힘의 운명이 보인다!'], goldChange: -cost, strChange: 2 }
        }
        if (roll < 0.66) {
          return { log: ['방어의 운명이 보인다!'], goldChange: -cost, defChange: 2 }
        }
        return { log: ['생명의 운명이 보인다!'], goldChange: -cost, maxHpChange: 10 }
      }
      if (choiceIdx === 1) {
        const cost = floor * 15
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        return { log: ['노파가 저주를 풀어주었다.'], goldChange: -cost, fullHeal: true }
      }
      return { log: ['노파가 의미심장한 이야기를 들려줬다.'], xpChange: floor * 5 }
    }
  },

  {
    id: 'dying_adventurer',
    name: '죽어가는 모험가',
    category: 'npc',
    description: [
      '부상당한 모험가가 벽에 기대어 있다...',
      '"내 장비를... 가져가라..."'
    ],
    choices: [
      { label: '치료해준다', description: '자신의 HP를 소모하여 치료한다' },
      { label: '장비를 가져간다', description: '모험가의 장비를 수거한다' },
      { label: '지나간다', description: '안타깝지만 지나간다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (state.player.stats.hp <= 15) {
          return { log: ['HP가 부족하다.'] }
        }
        const item: InvItem = Math.random() < 0.5
          ? { kind: 'weapon', data: weaponForFloor(floor + 1) }
          : { kind: 'armor', data: armorForFloor(floor + 1) }
        return {
          log: ['모험가가 감사의 보물을 건넸다.'],
          hpChange: -15,
          giveItem: item,
          goldChange: floor * 10
        }
      }
      if (choiceIdx === 1) {
        return {
          log: ['모험가의 눈에서 빛이 사라졌다...'],
          giveItem: { kind: 'weapon', data: weaponForFloor(floor) },
          xpChange: -(floor * 5)
        }
      }
      return { log: ['모험가를 위해 기도했다.'], xpChange: floor * 3 }
    }
  },

  // ─── PUZZLE EVENTS (3) ───────────────────────────────────────────

  {
    id: 'ancient_riddle',
    name: '고대의 수수께끼',
    category: 'puzzle',
    minFloor: 2,
    description: [
      '벽에 새겨진 수수께끼...',
      '"힘인가, 지혜인가, 용기인가?"'
    ],
    choices: [
      { label: '힘 (STR)', description: '힘으로 답한다' },
      { label: '지혜 (DEF)', description: '지혜로 답한다' },
      { label: '용기 (HP)', description: '용기로 답한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      const { str, def, hp, maxHp } = state.player.stats
      if (choiceIdx === 0) {
        if (str > 10 + floor) {
          return {
            log: ['정답이다! 보물이 나타났다!'],
            giveItem: { kind: 'weapon', data: weaponForFloor(floor + 1) }
          }
        }
        return { log: ['틀렸다... 함정이 작동했다!'], hpChange: -(floor * 3) }
      }
      if (choiceIdx === 1) {
        if (def > 8 + floor) {
          return {
            log: ['정답이다! 보물과 지식을 얻었다!'],
            goldChange: floor * 20,
            xpChange: floor * 10
          }
        }
        return { log: ['틀렸다... 다른 곳으로 이동됐다.'], teleport: true }
      }
      if (hp > maxHp * 0.5) {
        return { log: ['용기가 인정받았다!'], fullHeal: true, strChange: 1 }
      }
      return { log: ['용기가 부족했다...'], hpChange: -(floor * 2) }
    }
  },

  {
    id: 'elemental_shrine',
    name: '원소의 제단',
    category: 'puzzle',
    themeIds: ['lava', 'ice', 'swamp'],
    description: [
      '세 가지 원소의 기운이 소용돌이친다...',
      '하나를 선택하라.'
    ],
    choices: [
      { label: '불의 힘', description: '화염의 힘을 받아들인다' },
      { label: '얼음의 보호', description: '냉기의 방어막을 얻는다' },
      { label: '독의 적응', description: '독에 대한 내성을 얻는다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      if (choiceIdx === 0) {
        return {
          log: ['화염의 힘이 몸에 깃들었다!'],
          strChange: 3,
          hpChange: -Math.floor(state.player.stats.maxHp * 0.1)
        }
      }
      if (choiceIdx === 1) {
        return { log: ['냉기의 방어막을 얻었다!'], defChange: 3, strChange: -1 }
      }
      return { log: ['독에 대한 내성을 얻었다!'], maxHpChange: 12, fullHeal: true }
    }
  },

  {
    id: 'mirror_room',
    name: '거울의 방',
    category: 'puzzle',
    minFloor: 3,
    description: [
      '수많은 거울이 당신을 비추고 있다...',
      '진짜 자신은 어디에?'
    ],
    choices: [
      { label: '거울을 깨뜨린다', description: '거울을 힘껏 부순다' },
      { label: '거울 속으로 들어간다', description: '거울 너머로 발을 내딛는다' },
      { label: '가만히 서있는다', description: '자신의 모습을 응시한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.6) {
          const item: InvItem = Math.random() < 0.5
            ? { kind: 'weapon', data: weaponForFloor(floor + 1) }
            : { kind: 'armor', data: armorForFloor(floor + 1) }
          return { log: ['거울 뒤에서 보물을 발견했다!'], giveItem: item }
        }
        return { log: ['거울 파편이 날아왔다!'], hpChange: -(floor * 3) }
      }
      if (choiceIdx === 1) {
        return { log: ['다른 공간으로 이동했다.'], teleport: true, fullHeal: true }
      }
      return { log: ['내면의 평화를 찾았다.'], strChange: 1, defChange: 1 }
    }
  },

  // ─── THEME-SPECIFIC EVENTS ─────────────────────────────────────

  {
    id: 'scavenger_cache',
    name: '약탈자의 은신처',
    category: 'choice',
    themeIds: ['wasteland'],
    description: [
      '황무지에 버려진 임시 거처...',
      '약탈자의 물자가 남아있다.'
    ],
    choices: [
      { label: '물자를 뒤진다', description: '은신처를 수색한다' },
      { label: '함정을 살핀다', description: '주의깊게 조사한다', skillCheck: { stat: 'def', difficulty: 5 } },
      { label: '떠난다', description: '위험할 수 있다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.6) {
          return {
            log: ['물자 속에서 무기를 발견했다!'],
            giveItem: { kind: 'weapon', data: weaponForFloor(floor + 1) }
          }
        }
        return { log: ['함정이었다! 폭발에 휘말렸다!'], hpChange: -(floor * 3) }
      }
      if (choiceIdx === 1) {
        if (skillCheck(state.player.stats.def, 5 + floor)) {
          return {
            log: ['함정을 해제하고 은신처를 안전하게 수색했다!'],
            goldChange: floor * 15,
            giveItem: { kind: 'armor', data: armorForFloor(floor) }
          }
        }
        return { log: ['조사 중 함정이 작동했다!'], hpChange: -(floor * 2) }
      }
      return { log: ['현명하게 떠났다.'], xpChange: floor * 3 }
    }
  },

  {
    id: 'radiation_pool',
    name: '방사능 웅덩이',
    category: 'trap',
    themeIds: ['wasteland'],
    description: [
      '녹색으로 빛나는 웅덩이...',
      '방사능이 감지된다!'
    ],
    choices: [
      { label: '손을 담근다', description: '변이의 힘을 얻는다' },
      { label: '돌을 던져본다', description: '안전하게 테스트한다' },
      { label: '피한다', description: '방사능을 피한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.5) {
          return { log: ['방사능이 힘을 부여했다!'], strChange: 3 }
        }
        return {
          log: ['변이 실패! 방사능에 피폭됐다!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.3),
          strChange: -1
        }
      }
      if (choiceIdx === 1) {
        return { log: ['돌이 녹아내리는 것을 관찰했다. 관찰로 지식을 얻었다.'], xpChange: floor * 5 }
      }
      return { log: ['안전하게 돌아갔다.'] }
    }
  },

  {
    id: 'survivor_hideout',
    name: '생존자 은신처',
    category: 'npc',
    themeIds: ['ruins'],
    description: [
      '바리케이드 뒤에서 누군가 숨어있다...',
      '"살아있는 사람이야?"'
    ],
    choices: [
      { label: '도움을 준다', description: 'HP를 나눠 치료한다' },
      { label: '물물교환', description: '장비를 교환한다' },
      { label: '지나간다', description: '경계를 유지한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (state.player.stats.hp <= 10) {
          return { log: ['HP가 부족하다.'] }
        }
        return {
          log: ['생존자를 치료해줬다. 감사의 보답!'],
          hpChange: -10,
          giveItem: { kind: 'weapon', data: weaponForFloor(floor + 1) },
          goldChange: floor * 8
        }
      }
      if (choiceIdx === 1) {
        return {
          log: ['물물교환 성공!'],
          goldChange: floor * 10,
          giveItem: { kind: 'armor', data: armorForFloor(floor) }
        }
      }
      return { log: ['서로 경계하며 헤어졌다.'], xpChange: floor * 3 }
    }
  },

  {
    id: 'security_terminal',
    name: '보안 터미널',
    category: 'puzzle',
    themeIds: ['bunker'],
    description: [
      '벙커의 보안 터미널이 작동 중이다...',
      '비밀번호를 입력하면 무언가 열릴 것 같다.'
    ],
    choices: [
      { label: '해킹을 시도한다', description: '시스템에 침입한다', skillCheck: { stat: 'def', difficulty: 7 } },
      { label: '강제로 부순다', description: '터미널을 파괴한다', skillCheck: { stat: 'str', difficulty: 6 } },
      { label: '무시한다', description: '건드리지 않는다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.def, 7 + floor)) {
          return {
            log: ['해킹 성공! 보안 금고가 열렸다!'],
            giveItem: { kind: 'weapon', data: weaponForFloor(floor + 2) },
            goldChange: floor * 20
          }
        }
        return { log: ['해킹 실패! 전기 충격!'], hpChange: -(floor * 4) }
      }
      if (choiceIdx === 1) {
        if (skillCheck(state.player.stats.str, 6 + floor)) {
          return { log: ['터미널을 부수고 내부 금고를 발견했다!'], goldChange: floor * 15 }
        }
        return { log: ['폭발! 터미널이 자폭했다!'], hpChange: -(floor * 3) }
      }
      return { log: ['현명한 선택이다.'] }
    }
  },

  {
    id: 'corrupted_data',
    name: '손상된 데이터 노드',
    category: 'puzzle',
    themeIds: ['cyber_server'],
    description: [
      '깜빡이는 데이터 노드...',
      '복구하면 유용한 정보를 얻을 수 있을 것 같다.'
    ],
    choices: [
      { label: '데이터 복구', description: '데이터를 복구한다', skillCheck: { stat: 'def', difficulty: 6 } },
      { label: '바이러스 주입', description: '데이터를 오염시킨다' },
      { label: '무시한다', description: '위험할 수 있다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.def, 6 + floor)) {
          return {
            log: ['귀중한 데이터 복구!'],
            xpChange: floor * 20,
            goldChange: floor * 10
          }
        }
        return { log: ['데이터 폭발!'], hpChange: -(floor * 3) }
      }
      if (choiceIdx === 1) {
        if (Math.random() < 0.5) {
          return { log: ['바이러스가 힘을 줬다!'], strChange: 2 }
        }
        return {
          log: ['역바이러스 감염!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.2)
        }
      }
      return { log: ['안전하게 지나갔다.'] }
    }
  },

  {
    id: 'pressure_chamber',
    name: '감압실',
    category: 'trap',
    themeIds: ['deep_sea'],
    description: [
      '밀폐된 감압실의 문이 열려있다...',
      '내부에 물자가 보인다.'
    ],
    choices: [
      { label: '들어간다', description: '물자를 회수한다' },
      { label: '밸브를 조작한다', description: '수압을 조절한다', skillCheck: { stat: 'def', difficulty: 6 } },
      { label: '지나간다', description: '위험을 피한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.7) {
          return {
            log: ['물자를 발견했다!'],
            giveItem: { kind: 'potion', data: potionForFloor(floor) }
          }
        }
        return { log: ['수압이 급변했다!'], hpChange: -(floor * 4) }
      }
      if (choiceIdx === 1) {
        if (skillCheck(state.player.stats.def, 6 + floor)) {
          return {
            log: ['수압을 안정시키고 물자를 회수했다!'],
            fullHeal: true,
            goldChange: floor * 10
          }
        }
        return { log: ['밸브가 역류했다!'], hpChange: -(floor * 3) }
      }
      return { log: ['현명하게 물러났다.'] }
    }
  },

  {
    id: 'kitsune_encounter',
    name: '여우 요괴',
    category: 'npc',
    themeIds: ['yokai_shrine'],
    description: [
      '아름다운 여인이 미소짓고 있다...',
      '하지만 꼬리가 보인다. 여우 요괴다!'
    ],
    choices: [
      { label: '선물을 바친다', description: '골드를 바쳐 호감을 산다' },
      { label: '정체를 밝힌다', description: '요괴의 정체를 지적한다' },
      { label: '도망친다', description: '빠르게 도망간다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        const cost = floor * 15
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        if (Math.random() < 0.6) {
          return {
            log: ['여우가 축복을 내렸다!'],
            goldChange: -cost,
            fullHeal: true,
            strChange: 2
          }
        }
        return {
          log: ['여우가 웃으며 사라졌다.'],
          goldChange: -cost
        }
      }
      if (choiceIdx === 1) {
        if (Math.random() < 0.5) {
          return { log: ['여우가 감탄했다! 방어의 축복!'], defChange: 2 }
        }
        return { log: ['화가 났다! 여우불!'], hpChange: -(floor * 3) }
      }
      return { log: ['혼비백산 도주!'], teleport: true }
    }
  },

  {
    id: 'pharaoh_curse',
    name: '파라오의 저주',
    category: 'trap',
    themeIds: ['pharaoh_tomb'],
    description: [
      '석관이 열리며 독기가 퍼진다...',
      '"감히 나의 잠을 깨우다니..."'
    ],
    choices: [
      { label: '맞선다', description: '저주에 저항한다', skillCheck: { stat: 'str', difficulty: 7 } },
      { label: '보물을 바친다', description: '골드를 바쳐 용서를 구한다' },
      { label: '도주한다', description: '빠르게 도망간다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.str, 7 + floor)) {
          return {
            log: ['저주를 이겨내고 파라오의 보물을 획득했다!'],
            giveItem: { kind: 'weapon', data: weaponForFloor(floor + 2) },
            goldChange: floor * 20
          }
        }
        return {
          log: ['저주에 당했다!'],
          hpChange: -(floor * 5),
          strChange: -1
        }
      }
      if (choiceIdx === 1) {
        const cost = floor * 25
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        return {
          log: ['파라오가 용서했다.'],
          goldChange: -cost,
          fullHeal: true
        }
      }
      return {
        log: ['저주를 피해 도주했다!'],
        hpChange: -(floor * 2),
        teleport: true
      }
    }
  },

  {
    id: 'devils_roulette',
    name: '악마의 룰렛',
    category: 'choice',
    themeIds: ['casino_hell'],
    description: [
      '거대한 룰렛이 불길한 빛을 발한다...',
      '"영혼을 걸고 한 판 하겠나?"'
    ],
    choices: [
      { label: '올인한다', description: '모든 것을 건다' },
      { label: '소액으로 건다', description: '적은 골드를 건다' },
      { label: '거부한다', description: '도박을 거부한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.4) {
          return {
            log: ['잭팟! 엄청난 보상을 얻었다!'],
            goldChange: floor * 30,
            strChange: 3,
            defChange: 2
          }
        }
        return {
          log: ['파산... 모든 것을 잃었다.'],
          goldChange: -(floor * 20),
          hpChange: -Math.floor(state.player.stats.maxHp * 0.3)
        }
      }
      if (choiceIdx === 1) {
        const cost = floor * 10
        if (state.player.gold < cost) {
          return { log: ['골드가 부족하다.'] }
        }
        if (Math.random() < 0.5) {
          return { log: ['소소한 승리!'], goldChange: floor * 10 }
        }
        return { log: ['아깝게 패배.'], goldChange: -(floor * 10) }
      }
      return { log: ['현명한 선택이다.'], xpChange: floor * 5 }
    }
  },

  {
    id: 'mutation_serum',
    name: '변이 혈청',
    category: 'choice',
    themeIds: ['mutation_lab'],
    description: [
      '배양 캡슐에 혈청이 남아있다...',
      '주사하면 변이가 일어날 것 같다.'
    ],
    choices: [
      { label: '주사한다', description: '변이 혈청을 주입한다' },
      { label: '분석한다', description: '성분을 파악한다', skillCheck: { stat: 'def', difficulty: 6 } },
      { label: '파괴한다', description: '위험한 혈청을 파괴한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        const roll = Math.random()
        if (roll < 0.4) {
          return {
            log: ['강력한 변이! 힘과 체력이 증가했다!'],
            strChange: 4,
            maxHpChange: 5
          }
        }
        if (roll < 0.7) {
          return {
            log: ['방어 변이! 단단해졌다!'],
            defChange: 3,
            strChange: 1
          }
        }
        return {
          log: ['변이 실패! 몸이 거부반응을 일으켰다!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.25),
          strChange: -1
        }
      }
      if (choiceIdx === 1) {
        if (skillCheck(state.player.stats.def, 6 + floor)) {
          return {
            log: ['유용한 데이터를 얻었다!'],
            giveItem: { kind: 'potion', data: potionForFloor(floor) },
            xpChange: floor * 10
          }
        }
        return { log: ['실험 실패! 혈청이 폭발했다!'], hpChange: -(floor * 2) }
      }
      return {
        log: ['혈청을 파괴했다. 파편에서 소재를 얻었다.'],
        xpChange: floor * 8,
        goldChange: floor * 5
      }
    }
  },

  {
    id: 'resonance_crystal',
    name: '공명 수정',
    category: 'puzzle',
    themeIds: ['crystal_cavern'],
    description: [
      '거대한 수정 기둥이 진동하고 있다...',
      '올바른 음을 내면 반응할 것 같다.'
    ],
    choices: [
      { label: '두드린다', description: '수정을 두드려본다' },
      { label: '노래한다', description: '수정에 노래를 불러준다', skillCheck: { stat: 'def', difficulty: 5 } },
      { label: '캔다', description: '수정을 채취한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.5) {
          return {
            log: ['수정이 공명했다! 에너지가 몸에 깃들었다!'],
            maxHpChange: 10,
            defChange: 1
          }
        }
        return { log: ['수정이 파열됐다!'], hpChange: -(floor * 3) }
      }
      if (choiceIdx === 1) {
        if (skillCheck(state.player.stats.def, 5 + floor)) {
          return {
            log: ['완벽한 공명! 모든 것이 치유됐다!'],
            fullHeal: true,
            strChange: 2,
            defChange: 1
          }
        }
        return { log: ['불협화음으로 공간이 뒤틀렸다!'], teleport: true }
      }
      return {
        log: ['수정 조각을 캤다.'],
        goldChange: floor * 12,
        giveItem: { kind: 'armor', data: armorForFloor(floor) }
      }
    }
  },

  {
    id: 'mycelium_network',
    name: '균사체 네트워크',
    category: 'npc',
    themeIds: ['fungal_garden'],
    description: [
      '바닥의 균사체가 빛의 패턴을 만든다...',
      '소통하려는 것 같다.'
    ],
    choices: [
      { label: '접촉한다', description: '균사체에 손을 대본다' },
      { label: '포자를 채취한다', description: '유용한 포자를 수집한다' },
      { label: '불태운다', description: '균사체를 제거한다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.6) {
          return {
            log: ['균사체가 치유해줬다!'],
            fullHeal: true,
            defChange: 1
          }
        }
        return {
          log: ['균사체가 기생했다... 하지만 힘이 솟는다!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.15),
          strChange: 2
        }
      }
      if (choiceIdx === 1) {
        return {
          log: ['포자를 채취했다.'],
          giveItem: { kind: 'potion', data: potionForFloor(floor) }
        }
      }
      return {
        log: ['균류를 정리하고 경험을 얻었다.'],
        strChange: 1,
        xpChange: floor * 8
      }
    }
  },

  {
    id: 'time_paradox',
    name: '시간의 역설',
    category: 'puzzle',
    themeIds: ['clocktower'],
    description: [
      '거대한 시계의 바늘이 거꾸로 돌고 있다...',
      '시간이 흐트러지고 있다.'
    ],
    choices: [
      { label: '시계를 맞춘다', description: '바늘을 올바른 위치로', skillCheck: { stat: 'def', difficulty: 7 } },
      { label: '시간을 되돌린다', description: '과거로 돌아간다' },
      { label: '부순다', description: '시계를 부순다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (skillCheck(state.player.stats.def, 7 + floor)) {
          return {
            log: ['시간이 바로잡혔다! 모든 것이 회복됐다!'],
            fullHeal: true,
            strChange: 2,
            defChange: 2
          }
        }
        return { log: ['시간의 역류에 휩쓸렸다!'], hpChange: -(floor * 4) }
      }
      if (choiceIdx === 1) {
        return {
          log: ['시간을 거슬러 올라갔다...'],
          hpChange: -15,
          maxHpChange: 15,
          xpChange: floor * 10
        }
      }
      return {
        log: ['시계가 폭발하며 다른 곳으로!'],
        goldChange: floor * 15,
        teleport: true
      }
    }
  },

  {
    id: 'forbidden_tome',
    name: '금단의 서적',
    category: 'choice',
    themeIds: ['void_library'],
    description: [
      '스스로 펼쳐지는 책이 당신을 부른다...',
      '"읽어라... 진실을 알려주마..."'
    ],
    choices: [
      { label: '읽는다', description: '금단의 지식을 탐한다' },
      { label: '찢는다', description: '위험한 지식을 파괴한다' },
      { label: '덮는다', description: '책을 덮고 떠난다' }
    ],
    resolve (choiceIdx: number, state: GameState): EventOutcome {
      const floor = state.floor
      if (choiceIdx === 0) {
        if (Math.random() < 0.5) {
          return {
            log: ['진실을 깨달았다! 지혜와 힘이 몸에 깃들었다!'],
            strChange: 3,
            defChange: 2,
            xpChange: floor * 15
          }
        }
        return {
          log: ['지식의 대가... 정신이 잠식됐다!'],
          hpChange: -Math.floor(state.player.stats.maxHp * 0.3),
          strChange: 4
        }
      }
      if (choiceIdx === 1) {
        return {
          log: ['파편에서 보물과 지식을 얻었다.'],
          goldChange: floor * 12,
          xpChange: floor * 8
        }
      }
      return { log: ['현명한 선택이다.'], xpChange: floor * 5 }
    }
  }
]

export function getEventById (id: string): EventDef | undefined {
  return EVENT_REGISTRY.find(e => e.id === id)
}

export function selectEventsForFloor (floor: number, themeId: string): EventDef[] {
  const eligible = EVENT_REGISTRY.filter(e => {
    if (e.minFloor !== undefined && floor < e.minFloor) return false
    return true
  })

  const themeSpecific = eligible.filter(e =>
    e.themeIds !== undefined && e.themeIds.includes(themeId)
  )
  const general = eligible.filter(e => e.themeIds === undefined)

  const shuffle = <T>(arr: T[]): T[] => {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const tmp = copy[i]
      copy[i] = copy[j]
      copy[j] = tmp
    }
    return copy
  }

  const result: EventDef[] = []

  if (themeSpecific.length > 0) {
    const shuffledTheme = shuffle(themeSpecific)
    result.push(shuffledTheme[0])
    if (general.length > 0) {
      const shuffledGeneral = shuffle(general)
      result.push(shuffledGeneral[0])
    }
  } else {
    const shuffledGeneral = shuffle(general)
    result.push(...shuffledGeneral.slice(0, 2))
  }

  return shuffle(result)
}
