import {
  type ItemRarity,
  type FloorTheme,
  type ThemeObject
} from './model'

export const RARITY_MULTIPLIER: Record<ItemRarity, number> = {
  common: 1.0,
  uncommon: 1.3,
  rare: 1.6,
  epic: 2.0,
  legendary: 3.0
}

export const RARITY_DROP_RATE: Record<ItemRarity, number> = {
  common: 0.74,
  uncommon: 0.19,
  rare: 0.055,
  epic: 0.013,
  legendary: 0.002
}

export const RARITY_NAMES: Record<ItemRarity, string> = {
  common: '일반',
  uncommon: '고급',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설'
}

export const RARITY_PRICE: Record<ItemRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 200
}

const THEME_ITEM_REFS: Record<string, { uniqueWeaponIds: string[], uniqueArmorIds: string[] }> = {
  cave: { uniqueWeaponIds: ['cave_stalagmite_club', 'cave_web_snare'], uniqueArmorIds: ['cave_stonehide_vest'] },
  sewer: { uniqueWeaponIds: ['sewer_rust_pipe'], uniqueArmorIds: ['sewer_slime_shell', 'sewer_sewer_plate'] },
  forest: { uniqueWeaponIds: ['forest_thorn_staff'], uniqueArmorIds: ['forest_bark_armor'] },
  crypt: { uniqueWeaponIds: ['crypt_bone_blade', 'crypt_cursed_dagger'], uniqueArmorIds: ['crypt_skeleton_shield'] },
  swamp: { uniqueWeaponIds: ['swamp_poison_sting'], uniqueArmorIds: ['swamp_toad_hide'] },
  lava: { uniqueWeaponIds: ['lava_obsidian_axe'], uniqueArmorIds: ['lava_flame_scale_armor'] },
  ice: { uniqueWeaponIds: ['ice_spear'], uniqueArmorIds: ['ice_frost_armor'] },
  abyss: { uniqueWeaponIds: ['abyss_shadow_dagger'], uniqueArmorIds: ['abyss_dark_robe'] },
  sunken_temple: { uniqueWeaponIds: ['sunken_coral_trident'], uniqueArmorIds: ['sunken_deep_scale'] },
  eldritch_depths: { uniqueWeaponIds: ['eldritch_tentacle_whip_plus'], uniqueArmorIds: ['eldritch_outer_god_hide'] },
  rlyeh: { uniqueWeaponIds: ['rlyeh_cthulhu_claw'], uniqueArmorIds: ['rlyeh_elder_sign_armor'] },
  machine_factory: { uniqueWeaponIds: ['machine_steam_blade', 'machine_gear_shuriken'], uniqueArmorIds: ['machine_steel_overall'] },
  fuel_mine: { uniqueWeaponIds: ['fuel_drill_spear', 'fuel_dynamite'], uniqueArmorIds: ['fuel_miner_helmet'] },
  iron_fortress: { uniqueWeaponIds: ['iron_steam_hammer'], uniqueArmorIds: ['iron_mech_plate', 'iron_steam_shield'] },
  wasteland: { uniqueWeaponIds: ['wasteland_radiation_club', 'wasteland_raider_gun'], uniqueArmorIds: ['wasteland_radiation_suit'] },
  ruins: { uniqueWeaponIds: ['ruins_broken_glass_knife', 'ruins_pipe_sniper'], uniqueArmorIds: ['ruins_scrap_armor'] },
  bunker: { uniqueWeaponIds: ['bunker_laser_pistol', 'bunker_electric_club'], uniqueArmorIds: ['bunker_bulletproof_vest'] },
  cyber_server: { uniqueWeaponIds: ['cyber_electric_whip', 'cyber_virus_injector'], uniqueArmorIds: ['cyber_firewall_shield'] },
  deep_sea: { uniqueWeaponIds: ['deepsea_pressure_cannon'], uniqueArmorIds: ['deepsea_diving_suit', 'deepsea_titanium_exoskeleton'] },
  yokai_shrine: { uniqueWeaponIds: ['yokai_exorcism_blade', 'yokai_flame_fan'], uniqueArmorIds: ['yokai_oni_mask'] },
  pharaoh_tomb: { uniqueWeaponIds: ['pharaoh_cobra_staff'], uniqueArmorIds: ['pharaoh_mask', 'pharaoh_mummy_wrap_armor'] },
  casino_hell: { uniqueWeaponIds: ['casino_sharp_cards', 'casino_chip_bundle'], uniqueArmorIds: ['casino_lucky_tuxedo'] },
  mutation_lab: { uniqueWeaponIds: ['mutation_mutant_tentacle', 'mutation_syringe_blade'], uniqueArmorIds: ['mutation_mutant_exoskeleton'] },
  crystal_cavern: { uniqueWeaponIds: ['crystal_lance'], uniqueArmorIds: ['crystal_armor'] },
  fungal_garden: { uniqueWeaponIds: ['fungal_spore_sprayer'], uniqueArmorIds: ['fungal_mycelium_armor'] },
  clocktower: { uniqueWeaponIds: ['clockwork_spring_sword', 'clockwork_hourglass'], uniqueArmorIds: ['clocktower_clockwork_armor'] },
  void_library: { uniqueWeaponIds: ['void_knowledge_staff'], uniqueArmorIds: ['void_grimoire_binding'] }
}

type FloorThemeBase = Omit<FloorTheme, 'difficulty' | 'riskProfile' | 'lootBias' | 'eventBias' | 'objectBias'>

interface ThemeBalance {
  difficulty: number
  riskProfile: FloorTheme['riskProfile']
  lootBias: number
  eventBias: number
  objectBias: number
}

const THEME_BALANCE: Record<string, ThemeBalance> = {
  cave: { difficulty: 1.0, riskProfile: 'safe', lootBias: -0.04, eventBias: 0.05, objectBias: 0.06 },
  sewer: { difficulty: 1.2, riskProfile: 'balanced', lootBias: -0.02, eventBias: 0.04, objectBias: 0.05 },
  forest: { difficulty: 1.3, riskProfile: 'balanced', lootBias: -0.01, eventBias: 0.05, objectBias: 0.06 },
  crypt: { difficulty: 1.5, riskProfile: 'balanced', lootBias: 0.00, eventBias: 0.03, objectBias: 0.04 },
  swamp: { difficulty: 1.7, riskProfile: 'risky', lootBias: 0.01, eventBias: 0.02, objectBias: 0.03 },
  lava: { difficulty: 2.2, riskProfile: 'risky', lootBias: 0.04, eventBias: 0.01, objectBias: 0.00 },
  ice: { difficulty: 2.1, riskProfile: 'balanced', lootBias: 0.03, eventBias: 0.02, objectBias: 0.01 },
  abyss: { difficulty: 2.6, riskProfile: 'risky', lootBias: 0.05, eventBias: 0.03, objectBias: -0.02 },
  sunken_temple: { difficulty: 2.4, riskProfile: 'balanced', lootBias: 0.04, eventBias: 0.04, objectBias: 0.00 },
  eldritch_depths: { difficulty: 3.0, riskProfile: 'deadly', lootBias: 0.08, eventBias: 0.06, objectBias: -0.05 },
  rlyeh: { difficulty: 3.3, riskProfile: 'deadly', lootBias: 0.10, eventBias: 0.08, objectBias: -0.06 },
  machine_factory: { difficulty: 2.0, riskProfile: 'balanced', lootBias: 0.02, eventBias: 0.03, objectBias: 0.04 },
  fuel_mine: { difficulty: 2.3, riskProfile: 'risky', lootBias: 0.03, eventBias: 0.02, objectBias: 0.01 },
  iron_fortress: { difficulty: 2.7, riskProfile: 'risky', lootBias: 0.05, eventBias: 0.01, objectBias: -0.02 },
  wasteland: { difficulty: 2.8, riskProfile: 'risky', lootBias: 0.05, eventBias: 0.03, objectBias: -0.01 },
  ruins: { difficulty: 2.5, riskProfile: 'balanced', lootBias: 0.03, eventBias: 0.05, objectBias: 0.02 },
  bunker: { difficulty: 3.0, riskProfile: 'risky', lootBias: 0.06, eventBias: 0.04, objectBias: -0.03 },
  cyber_server: { difficulty: 3.1, riskProfile: 'deadly', lootBias: 0.07, eventBias: 0.06, objectBias: -0.04 },
  deep_sea: { difficulty: 3.2, riskProfile: 'risky', lootBias: 0.06, eventBias: 0.05, objectBias: -0.02 },
  yokai_shrine: { difficulty: 2.9, riskProfile: 'balanced', lootBias: 0.05, eventBias: 0.07, objectBias: 0.03 },
  pharaoh_tomb: { difficulty: 3.0, riskProfile: 'risky', lootBias: 0.06, eventBias: 0.05, objectBias: 0.01 },
  casino_hell: { difficulty: 3.1, riskProfile: 'risky', lootBias: 0.08, eventBias: 0.10, objectBias: 0.00 },
  mutation_lab: { difficulty: 3.4, riskProfile: 'deadly', lootBias: 0.09, eventBias: 0.08, objectBias: -0.05 },
  crystal_cavern: { difficulty: 3.2, riskProfile: 'balanced', lootBias: 0.07, eventBias: 0.06, objectBias: 0.02 },
  fungal_garden: { difficulty: 3.3, riskProfile: 'risky', lootBias: 0.08, eventBias: 0.07, objectBias: -0.01 },
  clocktower: { difficulty: 3.5, riskProfile: 'deadly', lootBias: 0.10, eventBias: 0.09, objectBias: -0.04 },
  void_library: { difficulty: 3.8, riskProfile: 'deadly', lootBias: 0.12, eventBias: 0.10, objectBias: -0.05 }
}

const BASE_FLOOR_THEMES: FloorThemeBase[] = [
  {
    id: 'cave',
    name: '동굴',
    icon: '🪨',
    wallColor: 'gray',
    floorColor: 'gray',
    flavorTexts: [
      '습기 찬 바위틈에서 무언가 기어다니는 소리가 들린다...',
      '어둡고 축축한 동굴... 발밑에서 물방울 소리가 울린다.'
    ],
    monsters: [
      { name: '쥐', ch: 'r', stats: { hp: 6, maxHp: 6, str: 2, def: 0 }, xp: 3 },
      { name: '박쥐', ch: 'b', stats: { hp: 4, maxHp: 4, str: 3, def: 0 }, xp: 4, range: 2 },
      { name: '동굴거미', ch: 'x', stats: { hp: 8, maxHp: 8, str: 3, def: 1 }, xp: 5 }
    ],
    boss: { name: '동굴 트롤', ch: 'T', stats: { hp: 20, maxHp: 20, str: 5, def: 3 }, xp: 15 },
    themeObject: { name: '물웅덩이', ch: 'o', color: 'cyan', spawnChance: 0.4, effectType: 'heal30', logMessage: '물웅덩이에서 물을 마셨다. HP 회복!' },
    specialRoomDesc: '반짝이는 수정이 가득한 방이다.'
  },
  {
    id: 'sewer',
    name: '하수도',
    icon: '🕳',
    wallColor: 'darkGreen',
    floorColor: 'gray',
    flavorTexts: [
      '악취가 코를 찌른다... 하수도의 깊은 곳에서 무언가 꿈틀거린다.',
      '끈적이는 바닥... 녹색 슬라임이 벽을 타고 흐른다.'
    ],
    monsters: [
      { name: '슬라임', ch: 's', stats: { hp: 10, maxHp: 10, str: 2, def: 2 }, xp: 4 },
      { name: '거머리', ch: 'l', stats: { hp: 5, maxHp: 5, str: 4, def: 0 }, xp: 3 },
      { name: '하수도 쥐', ch: 'r', stats: { hp: 7, maxHp: 7, str: 3, def: 1 }, xp: 4 }
    ],
    boss: { name: '하수도 왕', ch: 'K', stats: { hp: 22, maxHp: 22, str: 6, def: 2 }, xp: 18, range: 2 },
    themeObject: { name: '하수도 밸브', ch: 'V', color: 'darkGreen', spawnChance: 0.35, effectType: 'gamble', effectValue: 65, logMessage: '밸브를 돌렸다...' },
    specialRoomDesc: '거대한 정화 탱크가 있는 방이다.'
  },
  {
    id: 'forest',
    name: '지하숲',
    icon: '🌿',
    wallColor: 'green',
    floorColor: 'darkGreen',
    flavorTexts: [
      '거대한 버섯과 이끼가 빛을 발한다... 숲이 살아 숨쉬다.',
      '덩굴이 벽을 뒤덮고 있다... 어딘가에서 으르렁거리는 소리가...'
    ],
    monsters: [
      { name: '늑대', ch: 'w', stats: { hp: 9, maxHp: 9, str: 4, def: 1 }, xp: 5 },
      { name: '뱀', ch: 'S', stats: { hp: 6, maxHp: 6, str: 5, def: 0 }, xp: 4, range: 2 },
      { name: '나무정령', ch: 't', stats: { hp: 12, maxHp: 12, str: 3, def: 3 }, xp: 6, range: 3 }
    ],
    boss: { name: '고대 나무정령', ch: 'E', stats: { hp: 25, maxHp: 25, str: 5, def: 5 }, xp: 20, range: 4 },
    themeObject: { name: '거대 버섯', ch: 'Y', color: 'green', spawnChance: 0.4, effectType: 'gamble', effectValue: 70, logMessage: '거대 버섯을 먹었다...' },
    specialRoomDesc: '고대 나무의 뿌리가 방을 뒤덮고 있다.'
  },
  {
    id: 'crypt',
    name: '지하묘',
    icon: '💀',
    wallColor: 'darkYellow',
    floorColor: 'gray',
    flavorTexts: [
      '부서진 관과 해골이 널려있다... 죽은 자들이 잠들지 못한다.',
      '차가운 공기... 벽에서 귀곡성이 울려퍼진다.'
    ],
    monsters: [
      { name: '해골', ch: 'Z', stats: { hp: 8, maxHp: 8, str: 4, def: 2 }, xp: 5 },
      { name: '좀비', ch: 'z', stats: { hp: 12, maxHp: 12, str: 3, def: 2 }, xp: 5 },
      { name: '유령', ch: 'g', stats: { hp: 6, maxHp: 6, str: 5, def: 1 }, xp: 6, range: 4 }
    ],
    boss: { name: '리치', ch: 'L', stats: { hp: 18, maxHp: 18, str: 8, def: 3 }, xp: 22, range: 5 },
    themeObject: { name: '묘비', ch: '†', color: 'gray', spawnChance: 0.35, effectType: 'xp', effectValue: 20, logMessage: '묘비의 비문을 읽었다. 지식을 얻었다!' },
    specialRoomDesc: '봉인된 석관이 놓인 비밀의 방이다.'
  },
  {
    id: 'swamp',
    name: '독늪',
    icon: '🐸',
    wallColor: 'darkGreen',
    floorColor: 'darkGreen',
    flavorTexts: [
      '발이 질퍽한 늪에 빠진다... 독안개가 시야를 가린다.',
      '거품이 보글보글 올라온다... 늪 속에서 눈이 빛난다.'
    ],
    monsters: [
      { name: '독개구리', ch: 'f', stats: { hp: 7, maxHp: 7, str: 3, def: 1 }, xp: 4, range: 2 },
      { name: '독모기', ch: 'm', stats: { hp: 4, maxHp: 4, str: 5, def: 0 }, xp: 3, range: 3 },
      { name: '나가', ch: 'N', stats: { hp: 10, maxHp: 10, str: 4, def: 2 }, xp: 6, range: 4 }
    ],
    boss: { name: '히드라', ch: 'H', stats: { hp: 28, maxHp: 28, str: 6, def: 4 }, xp: 24, range: 3 },
    themeObject: { name: '독버섯 군락', ch: '%', color: 'darkGreen', spawnChance: 0.35, effectType: 'gamble', effectValue: 60, logMessage: '독버섯을 먹어보았다...' },
    specialRoomDesc: '거대한 늪지 연못이 고여 있는 방이다.'
  },
  {
    id: 'lava',
    name: '용암',
    icon: '🔥',
    wallColor: 'darkRed',
    floorColor: 'red',
    flavorTexts: [
      '뜨거운 열기가 피부를 태운다... 용암이 흐르는 균열이 보인다.',
      '대지가 붉게 달아올랐다... 화염의 정령들이 춤춘다.'
    ],
    monsters: [
      { name: '화염 임프', ch: 'i', stats: { hp: 7, maxHp: 7, str: 5, def: 1 }, xp: 5, range: 4 },
      { name: '지옥견', ch: 'h', stats: { hp: 10, maxHp: 10, str: 5, def: 2 }, xp: 6 },
      { name: '용암 골렘', ch: 'G', stats: { hp: 14, maxHp: 14, str: 4, def: 4 }, xp: 7 }
    ],
    boss: { name: '화룡', ch: 'D', stats: { hp: 30, maxHp: 30, str: 7, def: 5 }, xp: 28, range: 5 },
    themeObject: { name: '용암 결정', ch: '♦', color: 'red', spawnChance: 0.3, effectType: 'buffStr', effectValue: 2, logMessage: '용암 결정을 흡수했다! STR+2!' },
    specialRoomDesc: '용암 호수 한가운데 작은 섬이 있는 방이다.'
  },
  {
    id: 'ice',
    name: '빙하',
    icon: '❄',
    wallColor: 'cyan',
    floorColor: 'blue',
    flavorTexts: [
      '숨결이 하얗게 얼어붙는다... 얼음 결정이 벽을 뒤덮고 있다.',
      '발밑이 미끄럽다... 얼어붙은 시체들이 경고하듯 서있다.'
    ],
    monsters: [
      { name: '얼음 늑대', ch: 'w', stats: { hp: 9, maxHp: 9, str: 5, def: 2 }, xp: 6 },
      { name: '서리 망령', ch: 'W', stats: { hp: 7, maxHp: 7, str: 6, def: 1 }, xp: 6, range: 4 },
      { name: '예티', ch: 'Y', stats: { hp: 13, maxHp: 13, str: 4, def: 4 }, xp: 7 }
    ],
    boss: { name: '서리 거인', ch: 'F', stats: { hp: 32, maxHp: 32, str: 7, def: 6 }, xp: 30, range: 3 },
    themeObject: { name: '얼음 결정', ch: '◆', color: 'cyan', spawnChance: 0.3, effectType: 'buffDef', effectValue: 2, logMessage: '얼음 결정을 흡수했다! DEF+2!' },
    specialRoomDesc: '얼어붙은 호수 위에 세워진 방이다.'
  },
  {
    id: 'abyss',
    name: '심연',
    icon: '👁',
    wallColor: 'magenta',
    floorColor: 'gray',
    flavorTexts: [
      '현실이 일그러진다... 심연의 속삭임이 정신을 잠식한다.',
      '어둠 너머에서 거대한 존재가 당신을 지켜보고 있다...'
    ],
    monsters: [
      { name: '악마', ch: 'd', stats: { hp: 10, maxHp: 10, str: 5, def: 2 }, xp: 6 },
      { name: '암흑 마법사', ch: 'M', stats: { hp: 7, maxHp: 7, str: 7, def: 1 }, xp: 7, range: 5 },
      { name: '그림자', ch: 'S', stats: { hp: 8, maxHp: 8, str: 6, def: 3 }, xp: 7, range: 2 }
    ],
    boss: { name: '심연의 군주', ch: 'A', stats: { hp: 35, maxHp: 35, str: 8, def: 6 }, xp: 35, range: 5 },
    themeObject: { name: '차원 균열', ch: '⊕', color: 'magenta', spawnChance: 0.25, effectType: 'teleport', logMessage: '차원 균열에 빨려들어갔다!' },
    specialRoomDesc: '현실이 비틀려 공간이 뒤섞인 방이다.'
  },
  {
    id: 'sunken_temple',
    name: '침몰 신전',
    icon: '🐙',
    wallColor: 'darkCyan',
    floorColor: 'darkGreen',
    flavorTexts: [
      '해저에 잠든 신전... 벽에 새겨진 문양이 보는 이의 정신을 흔든다.',
      '물에 잠긴 제단에서 촉수가 꿈틀거린다... 이곳은 인간의 영역이 아니다.'
    ],
    monsters: [
      { name: '심해인', ch: 'D', stats: { hp: 11, maxHp: 11, str: 5, def: 3 }, xp: 7 },
      { name: '광신도', ch: 'c', stats: { hp: 8, maxHp: 8, str: 6, def: 1 }, xp: 5, range: 4 },
      { name: '별의 자손', ch: '*', stats: { hp: 14, maxHp: 14, str: 4, def: 4 }, xp: 8, range: 5 }
    ],
    boss: { name: '다곤', ch: 'Q', stats: { hp: 36, maxHp: 36, str: 9, def: 5 }, xp: 32, range: 3 },
    themeObject: { name: '고대 비문', ch: '≡', color: 'darkCyan', spawnChance: 0.3, effectType: 'xp', effectValue: 25, logMessage: '고대 비문을 해독했다! 경험치 획득!' },
    specialRoomDesc: '바닷물에 잠긴 고대 제단이 있는 방이다.'
  },
  {
    id: 'eldritch_depths',
    name: '광기의 심해',
    icon: '🦑',
    wallColor: 'darkMagenta',
    floorColor: 'darkCyan',
    flavorTexts: [
      '현실의 법칙이 무너진다... 벽이 숨을 쉬고, 바닥이 맥동한다.',
      '머리 속에서 알 수 없는 언어가 울린다... 이안! 이안! 크툴루 프타근!'
    ],
    monsters: [
      { name: '쇼고스', ch: 'O', stats: { hp: 16, maxHp: 16, str: 5, def: 5 }, xp: 9 },
      { name: '미고', ch: 'V', stats: { hp: 9, maxHp: 9, str: 7, def: 2 }, xp: 7, range: 4 },
      { name: '밤의 마수', ch: 'n', stats: { hp: 10, maxHp: 10, str: 6, def: 3 }, xp: 8, range: 3 }
    ],
    boss: { name: '니알라토텝', ch: 'N', stats: { hp: 40, maxHp: 40, str: 10, def: 7 }, xp: 38, range: 5 },
    themeObject: { name: '별의 파편', ch: '☆', color: 'magenta', spawnChance: 0.25, effectType: 'gamble', effectValue: 50, logMessage: '별의 파편에 손을 댔다...' },
    specialRoomDesc: '비유클리드 기하학으로 뒤틀린 방이다.'
  },
  {
    id: 'rlyeh',
    name: '르뤼에',
    icon: '🌊',
    wallColor: 'darkGreen',
    floorColor: 'darkMagenta',
    flavorTexts: [
      '죽지 않는 것은 영원히 누워있으리라... 르뤼에의 문이 열렸다.',
      '비유클리드 기하학의 공간... 모든 각도가 동시에 예각이자 둔각이다.'
    ],
    monsters: [
      { name: '옛것', ch: 'E', stats: { hp: 13, maxHp: 13, str: 6, def: 4 }, xp: 9 },
      { name: '비아케', ch: 'B', stats: { hp: 8, maxHp: 8, str: 8, def: 1 }, xp: 7, range: 5 },
      { name: '차원의 방랑자', ch: '&', stats: { hp: 11, maxHp: 11, str: 7, def: 3 }, xp: 8, range: 3 }
    ],
    boss: { name: '크툴루', ch: 'C', stats: { hp: 50, maxHp: 50, str: 12, def: 8 }, xp: 50, range: 3 },
    themeObject: { name: '차원문', ch: '門', color: 'darkGreen', spawnChance: 0.2, effectType: 'gamble', effectValue: 50, logMessage: '차원문이 열렸다...' },
    specialRoomDesc: '크툴루의 꿈이 서린 봉인의 방이다.'
  },
  {
    id: 'machine_factory',
    name: '기계 공장',
    icon: '⚙',
    wallColor: 'darkYellow',
    floorColor: 'gray',
    flavorTexts: [
      '거대한 톱니바퀴가 끊임없이 돌아간다... 증기가 파이프에서 새어나온다.',
      '기름 냄새가 코를 찌른다... 녹슨 기계들 사이에서 무언가 움직인다.'
    ],
    monsters: [
      { name: '톱니 쥐', ch: 'r', stats: { hp: 9, maxHp: 9, str: 4, def: 2 }, xp: 5 },
      { name: '스팀 드론', ch: 'o', stats: { hp: 7, maxHp: 7, str: 5, def: 1 }, xp: 5, range: 4 },
      { name: '기름 슬라임', ch: 's', stats: { hp: 12, maxHp: 12, str: 3, def: 3 }, xp: 6 }
    ],
    boss: { name: '공장장 오토', ch: 'O', stats: { hp: 28, maxHp: 28, str: 7, def: 5 }, xp: 26, range: 2 },
    themeObject: { name: '고장난 자판기', ch: '■', color: 'darkYellow', spawnChance: 0.35, effectType: 'randomItem', logMessage: '자판기를 두드렸더니 무언가 나왔다!' },
    specialRoomDesc: '거대한 증기 엔진이 가동 중인 방이다.'
  },
  {
    id: 'fuel_mine',
    name: '연료 광산',
    icon: '⛏',
    wallColor: 'darkRed',
    floorColor: 'darkYellow',
    flavorTexts: [
      '디젤 연료가 벽을 타고 흐른다... 언제 폭발해도 이상하지 않다.',
      '갱도 깊숙이 드릴 소리가 울린다... 광부들의 비명이 섞여있다.'
    ],
    monsters: [
      { name: '폭탄 광부', ch: 'b', stats: { hp: 8, maxHp: 8, str: 6, def: 1 }, xp: 6, range: 4 },
      { name: '드릴 벌레', ch: 'd', stats: { hp: 10, maxHp: 10, str: 5, def: 3 }, xp: 6 },
      { name: '디젤 박쥐', ch: 'v', stats: { hp: 6, maxHp: 6, str: 7, def: 0 }, xp: 5, range: 3 }
    ],
    boss: { name: '시추왕 크랭크', ch: 'K', stats: { hp: 32, maxHp: 32, str: 8, def: 4 }, xp: 30, range: 3 },
    themeObject: { name: '연료 통', ch: '⊙', color: 'darkRed', spawnChance: 0.3, effectType: 'gamble', effectValue: 55, logMessage: '연료 통을 열었다...' },
    specialRoomDesc: '검은 연료가 웅덩이처럼 고인 방이다.'
  },
  {
    id: 'iron_fortress',
    name: '철의 요새',
    icon: '🏭',
    wallColor: 'gray',
    floorColor: 'darkRed',
    flavorTexts: [
      '강철 벽 너머로 증기 기관의 굉음이 울린다... 철의 군단이 기다린다.',
      '거대한 철문이 닫혀있다... 기계 병사들의 행군 소리가 가까워진다.'
    ],
    monsters: [
      { name: '기계 병사', ch: 'M', stats: { hp: 13, maxHp: 13, str: 5, def: 5 }, xp: 8 },
      { name: '증기 사냥개', ch: 'h', stats: { hp: 10, maxHp: 10, str: 7, def: 2 }, xp: 7 },
      { name: '화염방사병', ch: 'F', stats: { hp: 9, maxHp: 9, str: 8, def: 1 }, xp: 7, range: 4 }
    ],
    boss: { name: '철의 장군 아이언클래드', ch: 'I', stats: { hp: 42, maxHp: 42, str: 10, def: 8 }, xp: 40, range: 2 },
    themeObject: { name: '무기 선반', ch: '⌐', color: 'gray', spawnChance: 0.3, effectType: 'randomItem', logMessage: '무기 선반에서 장비를 발견했다!' },
    specialRoomDesc: '무기와 갑옷이 진열된 무기고 방이다.'
  },
  {
    id: 'wasteland',
    name: '황무지',
    icon: '☢',
    wallColor: 'darkYellow',
    floorColor: 'darkGreen',
    flavorTexts: [
      '메마른 대지에 방사능 먼지가 흩날린다... 문명의 잔해만이 남아있다.',
      '금이 간 아스팔트 사이로 돌연변이 식물이 자란다... 여긴 죽음의 땅이다.'
    ],
    monsters: [
      { name: '방사능 쥐', ch: 'r', stats: { hp: 10, maxHp: 10, str: 5, def: 2 }, xp: 6 },
      { name: '약탈자', ch: 'p', stats: { hp: 8, maxHp: 8, str: 6, def: 1 }, xp: 5, range: 4 },
      { name: '돌연변이 개', ch: 'd', stats: { hp: 11, maxHp: 11, str: 4, def: 3 }, xp: 6 }
    ],
    boss: { name: '황무지 군벌', ch: 'W', stats: { hp: 30, maxHp: 30, str: 8, def: 5 }, xp: 28, range: 4 },
    themeObject: { name: '방사능 웅덩이', ch: '☢', color: 'green', spawnChance: 0.3, effectType: 'gamble', effectValue: 50, logMessage: '방사능 웅덩이에 손을 담갔다...' },
    specialRoomDesc: '방사능 폐기물이 쌓인 위험한 방이다.'
  },
  {
    id: 'ruins',
    name: '폐허 도시',
    icon: '🏚',
    wallColor: 'gray',
    floorColor: 'darkYellow',
    flavorTexts: [
      '무너진 빌딩 사이로 바람이 운다... 한때 번화했던 거리는 폐허뿐이다.',
      '깨진 유리창 너머로 그림자가 스친다... 생존자인가, 아니면...'
    ],
    monsters: [
      { name: '야생 사냥꾼', ch: 'H', stats: { hp: 9, maxHp: 9, str: 6, def: 2 }, xp: 6, range: 5 },
      { name: '감염자', ch: 'z', stats: { hp: 13, maxHp: 13, str: 4, def: 2 }, xp: 6 },
      { name: '폐허 거미', ch: 'x', stats: { hp: 7, maxHp: 7, str: 7, def: 1 }, xp: 5, range: 2 }
    ],
    boss: { name: '감염된 거수', ch: 'G', stats: { hp: 35, maxHp: 35, str: 9, def: 6 }, xp: 32, range: 3 },
    themeObject: { name: '자동판매기 잔해', ch: '▣', color: 'darkYellow', spawnChance: 0.35, effectType: 'randomItem', logMessage: '잔해를 뒤져 물건을 찾았다!' },
    specialRoomDesc: '무너진 건물 안에 생존자의 흔적이 있는 방이다.'
  },
  {
    id: 'bunker',
    name: '지하 벙커',
    icon: '🔒',
    wallColor: 'darkCyan',
    floorColor: 'gray',
    flavorTexts: [
      '밀폐된 철문 너머... 최후의 피난처는 이미 함락되었다.',
      '비상등이 깜빡인다... 벙커의 방어 시스템이 침입자를 감지했다.'
    ],
    monsters: [
      { name: '경비 로봇', ch: 'R', stats: { hp: 14, maxHp: 14, str: 5, def: 5 }, xp: 8, range: 5 },
      { name: '돌연변이 인간', ch: 'm', stats: { hp: 10, maxHp: 10, str: 7, def: 2 }, xp: 7 },
      { name: '전기 해파리', ch: 'j', stats: { hp: 8, maxHp: 8, str: 8, def: 1 }, xp: 7, range: 4 }
    ],
    boss: { name: '벙커 핵심 AI', ch: 'A', stats: { hp: 44, maxHp: 44, str: 11, def: 7 }, xp: 42, range: 5 },
    themeObject: { name: '비상 보급함', ch: '⊞', color: 'darkCyan', spawnChance: 0.3, effectType: 'heal50', logMessage: '비상 보급함을 열었다! 의료 키트 발견!' },
    specialRoomDesc: '비상 물자가 쌓인 보급 창고 방이다.'
  },
  {
    id: 'cyber_server',
    name: '사이버 서버',
    icon: '💻',
    wallColor: 'cyan',
    floorColor: 'darkCyan',
    flavorTexts: [
      '네온빛 데이터 스트림이 벽을 타고 흐른다... 방화벽이 침입자를 감지했다.',
      '서버 랙 사이로 전기 아크가 튄다... 디지털 세계의 심연에 접속했다.'
    ],
    monsters: [
      { name: '방화벽 데몬', ch: 'F', stats: { hp: 11, maxHp: 11, str: 5, def: 3 }, xp: 6, range: 3 },
      { name: '바이러스 봇', ch: 'v', stats: { hp: 7, maxHp: 7, str: 6, def: 1 }, xp: 5 },
      { name: '글리치 웜', ch: 'w', stats: { hp: 9, maxHp: 9, str: 4, def: 2 }, xp: 5 }
    ],
    boss: { name: '코어 AI', ch: 'Ω', stats: { hp: 34, maxHp: 34, str: 8, def: 6 }, xp: 30, range: 5 },
    themeObject: { name: '데이터 터미널', ch: '▦', color: 'cyan', spawnChance: 0.35, effectType: 'xp', effectValue: 20, logMessage: '데이터를 다운로드했다! 경험치 획득!' },
    specialRoomDesc: '거대한 서버 랙이 빛나는 코어 방이다.'
  },
  {
    id: 'deep_sea',
    name: '심해 연구소',
    icon: '🫧',
    wallColor: 'blue',
    floorColor: 'darkCyan',
    flavorTexts: [
      '수압이 선체를 짓누른다... 깨진 유리 너머로 심해의 어둠이 밀려온다.',
      '생체 발광 빛이 복도를 채운다... 연구소 밖에서 거대한 그림자가 스친다.'
    ],
    monsters: [
      { name: '발광 해파리', ch: 'j', stats: { hp: 6, maxHp: 6, str: 5, def: 0 }, xp: 4, range: 3 },
      { name: '심해 앵글러', ch: 'a', stats: { hp: 10, maxHp: 10, str: 6, def: 2 }, xp: 6 },
      { name: '변이 문어', ch: 'q', stats: { hp: 12, maxHp: 12, str: 4, def: 3 }, xp: 6 }
    ],
    boss: { name: '심해왕 크라켄', ch: 'K', stats: { hp: 36, maxHp: 36, str: 9, def: 5 }, xp: 32 },
    themeObject: { name: '산소 탱크', ch: 'O', color: 'blue', spawnChance: 0.35, effectType: 'heal50', logMessage: '산소 탱크로 숨을 돌렸다! HP 회복!' },
    specialRoomDesc: '거대한 관측창 너머로 심해가 보이는 방이다.'
  },
  {
    id: 'yokai_shrine',
    name: '요괴 신사',
    icon: '⛩',
    wallColor: 'red',
    floorColor: 'darkRed',
    flavorTexts: [
      '토리이 문 너머에서 피리 소리가 울린다... 요괴들의 축제가 시작됐다.',
      '종이 부적이 바람에 흩날린다... 붉은 등불 아래 그림자가 어른거린다.'
    ],
    monsters: [
      { name: '갓파', ch: 'k', stats: { hp: 9, maxHp: 9, str: 4, def: 2 }, xp: 5 },
      { name: '오니', ch: 'O', stats: { hp: 13, maxHp: 13, str: 6, def: 3 }, xp: 7 },
      { name: '히토다마', ch: 'h', stats: { hp: 5, maxHp: 5, str: 7, def: 0 }, xp: 5, range: 4 }
    ],
    boss: { name: '구미호', ch: '9', stats: { hp: 38, maxHp: 38, str: 9, def: 5 }, xp: 34, range: 3 },
    themeObject: { name: '소원 나무', ch: '♣', color: 'red', spawnChance: 0.35, effectType: 'gamble', effectValue: 65, logMessage: '소원 나무에 소원을 빌었다...' },
    specialRoomDesc: '거대한 토리이 문이 서있는 신성한 방이다.'
  },
  {
    id: 'pharaoh_tomb',
    name: '파라오의 무덤',
    icon: '🏺',
    wallColor: 'yellow',
    floorColor: 'darkYellow',
    flavorTexts: [
      '황금빛 상형문자가 벽에서 빛난다... 파라오의 저주가 침입자를 기다린다.',
      '모래가 바닥을 덮고 있다... 석관 뚜껑이 서서히 밀려나는 소리가...'
    ],
    monsters: [
      { name: '미라', ch: 'M', stats: { hp: 12, maxHp: 12, str: 4, def: 4 }, xp: 6 },
      { name: '스카라베 떼', ch: 's', stats: { hp: 6, maxHp: 6, str: 6, def: 0 }, xp: 4 },
      { name: '아누비스 병사', ch: 'A', stats: { hp: 10, maxHp: 10, str: 5, def: 3 }, xp: 7, range: 3 }
    ],
    boss: { name: '불멸의 파라오', ch: 'P', stats: { hp: 40, maxHp: 40, str: 10, def: 7 }, xp: 36, range: 4 },
    themeObject: { name: '카노푸스 항아리', ch: '⊔', color: 'yellow', spawnChance: 0.3, effectType: 'gamble', effectValue: 60, logMessage: '항아리를 열었다...' },
    specialRoomDesc: '황금빛 상형문자로 뒤덮인 보물실이다.'
  },
  {
    id: 'casino_hell',
    name: '카지노 지옥',
    icon: '🎰',
    wallColor: 'red',
    floorColor: 'yellow',
    flavorTexts: [
      '네온사인이 깜빡인다... 룰렛 소리와 비명이 뒤섞인 지옥의 카지노.',
      '칩이 바닥에 흩어져있다... 여기서 지면 영혼으로 지불한다.'
    ],
    monsters: [
      { name: '딜러 귀신', ch: 'D', stats: { hp: 8, maxHp: 8, str: 6, def: 1 }, xp: 5, range: 3 },
      { name: '슬롯머신 괴물', ch: '$', stats: { hp: 14, maxHp: 14, str: 3, def: 5 }, xp: 7 },
      { name: '주사위 마귀', ch: 'd', stats: { hp: 7, maxHp: 7, str: 7, def: 0 }, xp: 5 }
    ],
    boss: { name: '잭팟 악마', ch: 'J', stats: { hp: 32, maxHp: 32, str: 8, def: 5 }, xp: 30 },
    themeObject: { name: '슬롯머신', ch: '♠', color: 'yellow', spawnChance: 0.4, effectType: 'gamble', effectValue: 50, logMessage: '슬롯머신을 돌렸다...' },
    specialRoomDesc: '거대한 룰렛이 도는 VIP 방이다.'
  },
  {
    id: 'mutation_lab',
    name: '변이 연구소',
    icon: '🧬',
    wallColor: 'green',
    floorColor: 'darkMagenta',
    flavorTexts: [
      '깨진 배양 캡슐에서 점액이 흘러나온다... 실험체들이 탈출했다.',
      '유전자 조작의 잔해... 벽에서 맥동하는 살덩이가 자라나고 있다.'
    ],
    monsters: [
      { name: '변이체', ch: 'X', stats: { hp: 11, maxHp: 11, str: 5, def: 2 }, xp: 6 },
      { name: '촉수 배양체', ch: 'T', stats: { hp: 8, maxHp: 8, str: 7, def: 1 }, xp: 6, range: 3 },
      { name: '유전자 슬라임', ch: 'G', stats: { hp: 13, maxHp: 13, str: 3, def: 4 }, xp: 6 }
    ],
    boss: { name: '프로토타입 오메가', ch: 'Φ', stats: { hp: 38, maxHp: 38, str: 9, def: 6 }, xp: 34, range: 4 },
    themeObject: { name: '배양 캡슐', ch: '⊕', color: 'green', spawnChance: 0.3, effectType: 'gamble', effectValue: 55, logMessage: '배양 캡슐을 열었다...' },
    specialRoomDesc: '깨진 배양 캡슐이 줄지어 있는 실험실이다.'
  },
  {
    id: 'crystal_cavern',
    name: '수정 동굴',
    icon: '💎',
    wallColor: 'magenta',
    floorColor: 'cyan',
    flavorTexts: [
      '거대한 수정 기둥이 무지개빛을 발한다... 아름답지만 치명적인 곳.',
      '수정에 반사된 자신의 모습이 무한히 이어진다... 어디가 진짜인가?'
    ],
    monsters: [
      { name: '수정 골렘', ch: 'G', stats: { hp: 14, maxHp: 14, str: 4, def: 5 }, xp: 7 },
      { name: '보석 박쥐', ch: 'b', stats: { hp: 6, maxHp: 6, str: 6, def: 1 }, xp: 5 },
      { name: '프리즘 정령', ch: 'p', stats: { hp: 9, maxHp: 9, str: 5, def: 3 }, xp: 6, range: 4 }
    ],
    boss: { name: '수정왕', ch: '◇', stats: { hp: 35, maxHp: 35, str: 8, def: 7 }, xp: 32 },
    themeObject: { name: '공명 수정', ch: '◇', color: 'magenta', spawnChance: 0.35, effectType: 'buffMaxHp', effectValue: 8, logMessage: '공명 수정이 몸에 스며들었다! MaxHP+8!' },
    specialRoomDesc: '거대한 수정 기둥이 무지개빛을 발하는 방이다.'
  },
  {
    id: 'fungal_garden',
    name: '균류 정원',
    icon: '🍄',
    wallColor: 'darkMagenta',
    floorColor: 'green',
    flavorTexts: [
      '거대한 버섯이 숲을 이룬다... 포자가 공기를 가득 채우고 있다.',
      '균사체가 바닥을 뒤덮었다... 여기선 모든 것이 천천히 분해된다.'
    ],
    monsters: [
      { name: '포자충', ch: 's', stats: { hp: 8, maxHp: 8, str: 4, def: 2 }, xp: 5 },
      { name: '균사 좀비', ch: 'z', stats: { hp: 12, maxHp: 12, str: 5, def: 2 }, xp: 6 },
      { name: '맹독 버섯', ch: 'M', stats: { hp: 7, maxHp: 7, str: 7, def: 1 }, xp: 5, range: 3 }
    ],
    boss: { name: '균류 여왕', ch: 'Q', stats: { hp: 30, maxHp: 30, str: 7, def: 5 }, xp: 28, range: 4 },
    themeObject: { name: '거대 포자낭', ch: '◎', color: 'darkMagenta', spawnChance: 0.35, effectType: 'gamble', effectValue: 60, logMessage: '포자낭이 터졌다...' },
    specialRoomDesc: '형광 버섯이 천장까지 자란 거대 동굴이다.'
  },
  {
    id: 'clocktower',
    name: '시계탑',
    icon: '🕰',
    wallColor: 'darkYellow',
    floorColor: 'darkCyan',
    flavorTexts: [
      '거대한 시계 톱니가 끝없이 회전한다... 시간이 뒤틀린 공간.',
      '째깍째깍... 시간이 앞으로 가기도, 뒤로 가기도 한다.'
    ],
    monsters: [
      { name: '태엽 인형', ch: 'c', stats: { hp: 10, maxHp: 10, str: 4, def: 3 }, xp: 5 },
      { name: '크로노 유령', ch: 'C', stats: { hp: 7, maxHp: 7, str: 6, def: 1 }, xp: 6, range: 4 },
      { name: '톱니 자동인형', ch: 'R', stats: { hp: 13, maxHp: 13, str: 5, def: 4 }, xp: 7 }
    ],
    boss: { name: '시간의 수호자', ch: '∞', stats: { hp: 36, maxHp: 36, str: 9, def: 6 }, xp: 34 },
    themeObject: { name: '정지된 시계', ch: '⊗', color: 'darkYellow', spawnChance: 0.3, effectType: 'fullHeal', logMessage: '시계를 되돌렸다... 시간이 역행한다! HP 전체 회복!' },
    specialRoomDesc: '거대한 시계 메커니즘이 천천히 도는 방이다.'
  },
  {
    id: 'void_library',
    name: '공허의 도서관',
    icon: '📖',
    wallColor: 'white',
    floorColor: 'darkMagenta',
    flavorTexts: [
      '끝없는 서가가 허공으로 뮻어있다... 책들이 스스로 펼쳐지며 속삭인다.',
      '금서의 페이지가 바람에 펴럭인다... 읽는 자는 돌아올 수 없다.'
    ],
    monsters: [
      { name: '책벌레 악령', ch: 'W', stats: { hp: 9, maxHp: 9, str: 5, def: 2 }, xp: 6 },
      { name: '지식의 망령', ch: 'K', stats: { hp: 7, maxHp: 7, str: 7, def: 1 }, xp: 6, range: 4 },
      { name: '활자 괴물', ch: 'L', stats: { hp: 11, maxHp: 11, str: 4, def: 4 }, xp: 7 }
    ],
    boss: { name: '금서의 수호자', ch: '∑', stats: { hp: 34, maxHp: 34, str: 8, def: 6 }, xp: 32, range: 5 },
    themeObject: { name: '금서', ch: '⊡', color: 'white', spawnChance: 0.3, effectType: 'gamble', effectValue: 55, logMessage: '금서를 펼쳤다...' },
    specialRoomDesc: '끝없는 서가가 허공으로 뻗어있는 금서의 방이다.'
  }
]

export const FLOOR_THEMES: FloorTheme[] = BASE_FLOOR_THEMES.map(theme => ({
  ...theme,
  ...(THEME_ITEM_REFS[theme.id] ?? {}),
  ...(THEME_BALANCE[theme.id] ?? {
    difficulty: 2.0,
    riskProfile: 'balanced',
    lootBias: 0,
    eventBias: 0,
    objectBias: 0
  })
}))

const THEME_OBJECT_VARIANTS: Record<string, ThemeObject[]> = {
  cave: [{ name: '종유석', ch: '⌃', color: 'gray', spawnChance: 0.24, effectType: 'buffDef', effectValue: 1, logMessage: '단단한 종유석 파편을 주워 방어가 강화됐다.' }],
  sewer: [{ name: '녹슨 격자', ch: '#', color: 'darkGreen', spawnChance: 0.2, effectType: 'gold', effectValue: 8, logMessage: '격자 틈에서 동전을 건졌다.' }],
  forest: [{ name: '빛나는 포자', ch: '*', color: 'green', spawnChance: 0.24, effectType: 'heal30', logMessage: '포자가 상처를 감싸며 회복됐다.' }],
  crypt: [{ name: '향로', ch: 'n', color: 'darkYellow', spawnChance: 0.2, effectType: 'xp', effectValue: 18, logMessage: '향로의 연기가 기억을 깨운다.' }],
  swamp: [{ name: '늪 진주', ch: 'o', color: 'darkGreen', spawnChance: 0.2, effectType: 'gold', effectValue: 10, logMessage: '늪 바닥에서 진주를 건져냈다.' }],
  lava: [{ name: '화산 유리', ch: 'v', color: 'red', spawnChance: 0.18, effectType: 'buffStr', effectValue: 1, logMessage: '뜨거운 유리가 무기를 날카롭게 만든다.' }],
  ice: [{ name: '서리 꽃', ch: '*', color: 'cyan', spawnChance: 0.2, effectType: 'buffDef', effectValue: 1, logMessage: '서리 꽃의 한기가 몸을 단단하게 했다.' }],
  abyss: [{ name: '심연의 눈', ch: 'o', color: 'magenta', spawnChance: 0.16, effectType: 'xp', effectValue: 22, logMessage: '눈동자와 마주치자 지식이 밀려왔다.' }],
  sunken_temple: [{ name: '산호 제단', ch: 'T', color: 'darkCyan', spawnChance: 0.2, effectType: 'buffMaxHp', effectValue: 6, logMessage: '산호 제단의 축복으로 생명력이 늘었다.' }],
  eldritch_depths: [{ name: '왜곡 수정', ch: 'x', color: 'darkMagenta', spawnChance: 0.16, effectType: 'gamble', effectValue: 45, logMessage: '수정이 파동을 내뿜는다...' }],
  rlyeh: [{ name: '봉인 석판', ch: '=', color: 'darkGreen', spawnChance: 0.18, effectType: 'teleport', logMessage: '석판의 문양이 공간을 비틀었다.' }],
  machine_factory: [{ name: '윤활 캔', ch: 'u', color: 'darkYellow', spawnChance: 0.24, effectType: 'heal30', logMessage: '응급 윤활제로 몸을 정비했다.' }],
  fuel_mine: [{ name: '압축 연료', ch: 'f', color: 'darkRed', spawnChance: 0.18, effectType: 'buffStr', effectValue: 1, logMessage: '연료 폭발력이 힘을 끌어올렸다.' }],
  iron_fortress: [{ name: '강철 리벳', ch: 'r', color: 'gray', spawnChance: 0.2, effectType: 'buffDef', effectValue: 1, logMessage: '리벳으로 장비를 고정해 방어가 올랐다.' }],
  wasteland: [{ name: '정화 주사기', ch: 'i', color: 'green', spawnChance: 0.2, effectType: 'heal50', logMessage: '해독 주사기가 체력을 되돌렸다.' }],
  ruins: [{ name: '생존자 캐시', ch: 'c', color: 'darkYellow', spawnChance: 0.2, effectType: 'randomItem', logMessage: '숨겨진 보급품을 발견했다.' }],
  bunker: [{ name: '탄약 상자', ch: 'a', color: 'darkCyan', spawnChance: 0.2, effectType: 'randomItem', logMessage: '탄약 상자에서 장비를 꺼냈다.' }],
  cyber_server: [{ name: '백업 노드', ch: 'B', color: 'cyan', spawnChance: 0.2, effectType: 'xp', effectValue: 24, logMessage: '백업 노드에서 전술 데이터를 추출했다.' }],
  deep_sea: [{ name: '심해 산호', ch: 'c', color: 'blue', spawnChance: 0.2, effectType: 'heal30', logMessage: '산호 점액이 상처를 봉합했다.' }],
  yokai_shrine: [{ name: '부적 더미', ch: '+', color: 'red', spawnChance: 0.2, effectType: 'buffDef', effectValue: 2, logMessage: '부적의 가호가 몸을 감쌌다.' }],
  pharaoh_tomb: [{ name: '황금 매듭', ch: '8', color: 'yellow', spawnChance: 0.18, effectType: 'gold', effectValue: 12, logMessage: '황금 매듭을 풀어 보물을 얻었다.' }],
  casino_hell: [{ name: '룰렛 칩', ch: '@', color: 'yellow', spawnChance: 0.24, effectType: 'gamble', effectValue: 58, logMessage: '칩을 던지자 운명의 룰렛이 돈다.' }],
  mutation_lab: [{ name: '안정화 혈청', ch: 's', color: 'green', spawnChance: 0.2, effectType: 'buffMaxHp', effectValue: 8, logMessage: '혈청이 세포를 안정화했다.' }],
  crystal_cavern: [{ name: '수정 파편', ch: '/', color: 'magenta', spawnChance: 0.2, effectType: 'xp', effectValue: 20, logMessage: '수정 파편이 기억을 각성시켰다.' }],
  fungal_garden: [{ name: '약용 균핵', ch: 'm', color: 'darkMagenta', spawnChance: 0.2, effectType: 'heal50', logMessage: '약용 균핵이 깊은 상처를 봉합했다.' }],
  clocktower: [{ name: '추시계 진자', ch: 'p', color: 'darkYellow', spawnChance: 0.18, effectType: 'teleport', logMessage: '진자가 흔들리며 시간이 튀었다.' }],
  void_library: [{ name: '주석 사본', ch: 'p', color: 'white', spawnChance: 0.2, effectType: 'xp', effectValue: 22, logMessage: '사본의 주석에서 전술 지식을 얻었다.' }]
}

interface RetentionObjectDef {
  id: string
  name: string
  ch: string
  color: string
  effectType: ThemeObject['effectType']
  logMessage: string
}

export interface RetentionObjectBalance {
  spawnChance: number
  minFloor: number
  exclusiveGroup?: string
}

const RETENTION_OBJECT_DEFS: RetentionObjectDef[] = [
  { id: 'g_blood_altar', name: '피의 제단', ch: 'B', color: 'red', effectType: 'bloodAltar', logMessage: '피의 계약이 시작된다...' },
  { id: 'g_echo_well', name: '메아리 우물', ch: 'W', color: 'cyan', effectType: 'echoWell', logMessage: '우물에서 지난 기억의 파문이 되돌아온다.' },
  { id: 'g_broken_clock', name: '부서진 시계', ch: 't', color: 'darkYellow', effectType: 'brokenClock', logMessage: '시간의 톱니가 삐걱거리며 멈춘다.' },
  { id: 'g_mirror_gate', name: '거울 문', ch: 'M', color: 'magenta', effectType: 'mirrorGate', logMessage: '거울 속에서 또 다른 네가 다가온다.' },
  { id: 'g_cursed_vending', name: '저주 자판기', ch: 'V', color: 'darkMagenta', effectType: 'cursedVending', logMessage: '자판기가 불길한 소리를 내며 작동한다.' },
  { id: 'g_pocket_rift', name: '균열 게이트', ch: 'R', color: 'darkCyan', effectType: 'pocketRift', logMessage: '공간이 찢기며 작은 포켓룸이 열린다.' },
  { id: 'g_bounty_board', name: '현상금 게시판', ch: 'Q', color: 'yellow', effectType: 'bountyBoard', logMessage: '현상금 표식이 적들을 향해 번쩍인다.' },
  { id: 'g_pact_statue', name: '계약 석상', ch: 'P', color: 'white', effectType: 'pactStatue', logMessage: '석상이 속삭인다. 대가를 치르면 힘을 주겠노라.' },
  { id: 'g_memory_obelisk', name: '기억 오벨리스크', ch: 'O', color: 'blue', effectType: 'memoryObelisk', logMessage: '오벨리스크가 오래된 전투 기억을 주입한다.' },
  { id: 'g_mutation_capsule', name: '변이 캡슐', ch: 'X', color: 'green', effectType: 'mutationCapsule', logMessage: '캡슐 속 변이체 유전자가 흐른다.' },
  { id: 'g_climate_totem', name: '기후 토템', ch: 'C', color: 'cyan', effectType: 'climateTotem', logMessage: '토템이 층의 환경을 뒤틀기 시작한다.' },
  { id: 'g_trap_workbench', name: '함정 작업대', ch: 'H', color: 'darkYellow', effectType: 'trapWorkbench', logMessage: '작업대 위 부품들이 덜컥거리며 결합된다.' },
  { id: 'g_resonance_pillar', name: '공명 기둥', ch: '=', color: 'magenta', effectType: 'resonancePillar', logMessage: '기둥의 진동이 주변 오브젝트를 공명시킨다.' },
  { id: 'g_noise_beacon', name: '소음 비콘', ch: 'N', color: 'yellow', effectType: 'noiseBeacon', logMessage: '비콘이 울리자 괴물들이 이를 갈며 몰려든다.' },
  { id: 'g_campfire', name: '야영 모닥불', ch: 'F', color: 'red', effectType: 'campfire', logMessage: '짧은 휴식의 온기가 몸을 감싼다.' },
  { id: 'g_rune_forge', name: '룬 대장간', ch: 'U', color: 'darkCyan', effectType: 'runeForge', logMessage: '대장간의 룬이 장비를 재구성한다.' },
  { id: 'g_entropy_chest', name: '엔트로피 상자', ch: 'E', color: 'darkMagenta', effectType: 'entropyChest', logMessage: '상자를 여는 순간 운명이 요동친다.' },
  { id: 'g_debt_broker', name: '빚의 상인', ch: 'D', color: 'darkGreen', effectType: 'debtBroker', logMessage: '상인이 미소짓는다. 지금은 공짜지만...' },
  { id: 'g_ghost_shop', name: '유령 상점', ch: 'S', color: 'white', effectType: 'ghostShop', logMessage: '안개 속 장터에서 잔상 아이템이 떠오른다.' },
  { id: 'g_chrono_bank', name: '시간 저금통', ch: 'K', color: 'darkYellow', effectType: 'chronoBank', logMessage: '저금통이 시간을 축적해 전투 리듬을 바꾼다.' },
  { id: 'g_overheat_reactor', name: '과열 반응로', ch: '*', color: 'darkRed', effectType: 'overheatReactor', logMessage: '반응로가 과열되며 원거리 장비를 달군다.' },
  { id: 'g_companion_egg', name: '동행 알', ch: '@', color: 'green', effectType: 'companionEgg', logMessage: '알이 깨지며 작은 동행의 기운이 스민다.' },
  { id: 'g_reputation_idol', name: '평판 우상', ch: 'I', color: 'blue', effectType: 'reputationIdol', logMessage: '우상이 당신의 행적을 기록한다.' },
  { id: 'g_foresight_cocoon', name: '예지 고치', ch: 'Y', color: 'cyan', effectType: 'foresightCocoon', logMessage: '고치가 터지며 지형의 미래가 보인다.' },
  { id: 'g_parasite_pool', name: '기생 연못', ch: ':', color: 'darkGreen', effectType: 'parasitePool', logMessage: '연못 속 기생체가 장비와 몸에 들러붙는다.' },
  { id: 'g_greed_beacon', name: '탐욕 등대', ch: '$', color: 'yellow', effectType: 'greedBeacon', logMessage: '등대 불빛이 금은보화를 향한 욕망을 키운다.' },
  { id: 'g_guardian_statue', name: '수호 석상', ch: 'G', color: 'gray', effectType: 'guardianStatue', logMessage: '석상에 손을 대자 수호 인장이 새겨진다.' },
  { id: 'g_chaos_prism', name: '혼돈 프리즘', ch: 'Z', color: 'magenta', effectType: 'chaosPrism', logMessage: '프리즘이 능력치를 뒤섞는다.' },
  { id: 'g_codex_tablet', name: '고문서 석판', ch: 'L', color: 'white', effectType: 'codexTablet', logMessage: '석판 해독이 완료되며 비밀 지식이 열린다.' },
  { id: 'g_omen_gate', name: '종말 징조문', ch: '!', color: 'red', effectType: 'omenGate', logMessage: '문이 열리고 보스의 징조가 몸에 각인된다.' }
]

const RETENTION_OBJECT_BALANCE: Record<string, RetentionObjectBalance> = {
  g_blood_altar: { spawnChance: 0.05, minFloor: 1, exclusiveGroup: 'sacrifice' },
  g_echo_well: { spawnChance: 0.045, minFloor: 1, exclusiveGroup: 'memory' },
  g_broken_clock: { spawnChance: 0.03, minFloor: 2, exclusiveGroup: 'time' },
  g_mirror_gate: { spawnChance: 0.03, minFloor: 2, exclusiveGroup: 'rift' },
  g_cursed_vending: { spawnChance: 0.04, minFloor: 1, exclusiveGroup: 'economy' },
  g_pocket_rift: { spawnChance: 0.028, minFloor: 3, exclusiveGroup: 'rift' },
  g_bounty_board: { spawnChance: 0.03, minFloor: 2, exclusiveGroup: 'contract' },
  g_pact_statue: { spawnChance: 0.028, minFloor: 3, exclusiveGroup: 'sacrifice' },
  g_memory_obelisk: { spawnChance: 0.032, minFloor: 2, exclusiveGroup: 'memory' },
  g_mutation_capsule: { spawnChance: 0.027, minFloor: 3, exclusiveGroup: 'chaos' },
  g_climate_totem: { spawnChance: 0.03, minFloor: 3, exclusiveGroup: 'world' },
  g_trap_workbench: { spawnChance: 0.032, minFloor: 1, exclusiveGroup: 'forge' },
  g_resonance_pillar: { spawnChance: 0.028, minFloor: 4, exclusiveGroup: 'world' },
  g_noise_beacon: { spawnChance: 0.03, minFloor: 2, exclusiveGroup: 'agro' },
  g_campfire: { spawnChance: 0.045, minFloor: 1, exclusiveGroup: 'rest' },
  g_rune_forge: { spawnChance: 0.028, minFloor: 4, exclusiveGroup: 'forge' },
  g_entropy_chest: { spawnChance: 0.024, minFloor: 5, exclusiveGroup: 'forge' },
  g_debt_broker: { spawnChance: 0.03, minFloor: 2, exclusiveGroup: 'economy' },
  g_ghost_shop: { spawnChance: 0.026, minFloor: 4, exclusiveGroup: 'economy' },
  g_chrono_bank: { spawnChance: 0.024, minFloor: 5, exclusiveGroup: 'time' },
  g_overheat_reactor: { spawnChance: 0.024, minFloor: 5, exclusiveGroup: 'forge' },
  g_companion_egg: { spawnChance: 0.028, minFloor: 3, exclusiveGroup: 'support' },
  g_reputation_idol: { spawnChance: 0.024, minFloor: 4, exclusiveGroup: 'contract' },
  g_foresight_cocoon: { spawnChance: 0.022, minFloor: 5, exclusiveGroup: 'world' },
  g_parasite_pool: { spawnChance: 0.022, minFloor: 6, exclusiveGroup: 'chaos' },
  g_greed_beacon: { spawnChance: 0.024, minFloor: 5, exclusiveGroup: 'economy' },
  g_guardian_statue: { spawnChance: 0.028, minFloor: 3, exclusiveGroup: 'support' },
  g_chaos_prism: { spawnChance: 0.02, minFloor: 6, exclusiveGroup: 'chaos' },
  g_codex_tablet: { spawnChance: 0.02, minFloor: 7, exclusiveGroup: 'contract' },
  g_omen_gate: { spawnChance: 0.018, minFloor: 8, exclusiveGroup: 'rift' }
}

const GLOBAL_RETENTION_OBJECTS: ThemeObject[] = RETENTION_OBJECT_DEFS.map(obj => ({
  ...obj,
  spawnChance: RETENTION_OBJECT_BALANCE[obj.id]?.spawnChance ?? 0
}))

export function getRetentionObjectBalance (id: string): RetentionObjectBalance | undefined {
  return RETENTION_OBJECT_BALANCE[id]
}

export function retentionObjectCapForFloor (floor: number): number {
  if (floor <= 2) return 1
  if (floor <= 6) return 2
  return 3
}

export function getThemeObjects (theme: FloorTheme): ThemeObject[] {
  const baseObjects = theme.themeObject !== undefined ? [{ ...theme.themeObject }] : []
  const extraObjects = THEME_OBJECT_VARIANTS[theme.id] ?? []
  return [...baseObjects, ...extraObjects, ...GLOBAL_RETENTION_OBJECTS].map((obj, idx) => ({
    ...obj,
    id: obj.id ?? `${theme.id}_obj_${idx}`
  }))
}
