import { type WeaponData, type ArmorData } from './model'

function weapon (name: string, atk: number, range: number = 1, speed?: number): WeaponData {
  const normalizedSpeed = speed ?? (range >= 4 ? 3 : range >= 2 ? 2 : 2)
  return { name, atk, range, speed: normalizedSpeed }
}

function armor (name: string, def: number): ArmorData {
  return { name, def }
}

export const WEAPONS: WeaponData[][] = [
  [weapon('단검', 4, 1, 1), weapon('촉수 채찍', 3, 2, 2), weapon('단궁', 2, 4, 3)],
  [weapon('장검', 6, 1, 2), weapon('공허의 단도', 7, 1, 1), weapon('석궁', 5, 4, 3)],
  [weapon('전투 도끼', 9, 1, 3), weapon('엘더 사인 철퇴', 8, 1, 2), weapon('엘더 룬활', 7, 5, 3)],
  [weapon('화염검', 12, 1, 2), weapon('크툴루 삼지창', 13, 2, 2), weapon('화염 투창', 10, 3, 3)],
  [weapon('용살자', 16, 1, 3), weapon('네크로노미콘 검', 17, 1, 2), weapon('심연의 지팡이', 14, 5, 4)]
]

export const ARMORS: ArmorData[][] = [
  [armor('가죽 갑옷', 2), armor('광신도 로브', 1)],
  [armor('사슬 갑옷', 4), armor('심해인 가죽', 3)],
  [armor('판금 갑옷', 6), armor('별돌 갑옷', 7)],
  [armor('미스릴 갑옷', 9), armor('엘더 판금', 10)],
  [armor('용린 갑옷', 12), armor('크툴루 외골격', 13)]
]

export const LEGENDARY_WEAPONS: WeaponData[] = [
  { ...weapon('영혼 포식자', 25, 1, 2), rarity: 'legendary' },
  { ...weapon('별의 파편', 22, 5, 3), rarity: 'legendary' },
  { ...weapon('심연의 이빨', 28, 1, 3), rarity: 'legendary' },
  { ...weapon('시간의 검', 24, 1, 1), rarity: 'legendary' },
  { ...weapon('혼돈의 지팡이', 26, 5, 4), rarity: 'legendary' }
]

export const LEGENDARY_ARMORS: ArmorData[] = [
  { ...armor('시간의 갑옷', 20), rarity: 'legendary' },
  { ...armor('별의 외피', 18), rarity: 'legendary' },
  { ...armor('불멸의 로브', 22), rarity: 'legendary' },
  { ...armor('심연의 껍질', 19), rarity: 'legendary' },
  { ...armor('혼돈의 갑주', 21), rarity: 'legendary' }
]

export const THEME_WEAPON_CATALOG: Record<string, WeaponData> = {
  cave_stalagmite_club: weapon('석순 곤봉', 3, 1, 2),
  cave_web_snare: weapon('거미줄 올가미', 2, 3, 2),
  sewer_rust_pipe: weapon('녹슨 파이프', 4, 1, 2),
  forest_thorn_staff: weapon('가시나무 지팡이', 5, 2, 2),
  crypt_bone_blade: weapon('뼈 검', 5, 1, 2),
  crypt_cursed_dagger: weapon('저주받은 단도', 6, 1, 1),
  swamp_poison_sting: weapon('독침', 4, 3, 2),
  lava_obsidian_axe: weapon('흑요석 도끼', 8, 1, 3),
  ice_spear: weapon('얼음 창', 7, 2, 2),
  abyss_shadow_dagger: weapon('그림자 단검', 8, 1, 1),
  sunken_coral_trident: weapon('산호 삼지창', 7, 2, 2),
  eldritch_tentacle_whip_plus: weapon('촉수 채찍+', 9, 3, 2),
  rlyeh_cthulhu_claw: weapon('크툴루의 발톱', 10, 1, 2),
  machine_steam_blade: weapon('증기 톱날', 6, 1, 2),
  machine_gear_shuriken: weapon('톱니 수리검', 4, 4, 3),
  fuel_drill_spear: weapon('드릴 창', 7, 2, 2),
  fuel_dynamite: weapon('다이너마이트', 9, 4, 3),
  iron_steam_hammer: weapon('증기 해머', 9, 1, 3),
  wasteland_radiation_club: weapon('방사능 곤봉', 6, 1, 2),
  wasteland_raider_gun: weapon('약탈자의 총', 5, 5, 3),
  ruins_broken_glass_knife: weapon('깨진 유리칼', 5, 1, 1),
  ruins_pipe_sniper: weapon('쇠파이프 저격총', 7, 5, 4),
  bunker_laser_pistol: weapon('레이저 권총', 7, 5, 3),
  bunker_electric_club: weapon('전기 곤봉', 6, 1, 2),
  cyber_electric_whip: weapon('전자 채찍', 6, 3, 2),
  cyber_virus_injector: weapon('바이러스 주사기', 5, 1, 2),
  deepsea_pressure_cannon: weapon('수압 캐논', 8, 4, 3),
  yokai_exorcism_blade: weapon('퇴마의 부적검', 7, 1, 2),
  yokai_flame_fan: weapon('불꽃 부채', 5, 3, 2),
  pharaoh_cobra_staff: weapon('황금 코브라 지팡이', 8, 2, 2),
  casino_sharp_cards: weapon('날카로운 카드', 5, 4, 3),
  casino_chip_bundle: weapon('칩 뭉치', 4, 1, 2),
  mutation_mutant_tentacle: weapon('변이 촉수', 7, 3, 2),
  mutation_syringe_blade: weapon('주사기 블레이드', 6, 1, 2),
  crystal_lance: weapon('수정 창', 8, 2, 2),
  fungal_spore_sprayer: weapon('포자 분사기', 5, 4, 3),
  clockwork_spring_sword: weapon('시계 태엽검', 7, 1, 2),
  clockwork_hourglass: weapon('시간의 모래시계', 6, 3, 2),
  void_knowledge_staff: weapon('지식의 지팡이', 8, 4, 3)
}

export const THEME_ARMOR_CATALOG: Record<string, ArmorData> = {
  cave_stonehide_vest: armor('돌가죽 조끼', 2),
  sewer_slime_shell: armor('슬라임 외피', 1),
  sewer_sewer_plate: armor('하수도 쇠갑옷', 3),
  forest_bark_armor: armor('나무 껍질 갑옷', 3),
  crypt_skeleton_shield: armor('해골 방패', 4),
  swamp_toad_hide: armor('독두꺼비 가죽', 2),
  lava_flame_scale_armor: armor('화염 비늘 갑옷', 5),
  ice_frost_armor: armor('서리 갑옷', 6),
  abyss_dark_robe: armor('어둠의 로브', 5),
  sunken_deep_scale: armor('심해인 비늘갑', 6),
  eldritch_outer_god_hide: armor('외신의 가죽', 7),
  rlyeh_elder_sign_armor: armor('엘더 사인 갑주', 8),
  machine_steel_overall: armor('강철 작업복', 4),
  fuel_miner_helmet: armor('광부 헬멧', 3),
  iron_mech_plate: armor('기계 판금갑', 7),
  iron_steam_shield: armor('증기 실드', 6),
  wasteland_radiation_suit: armor('방사능 방호복', 4),
  ruins_scrap_armor: armor('폐허 찌끄레기 갑옷', 3),
  bunker_bulletproof_vest: armor('방탄 조끼', 5),
  cyber_firewall_shield: armor('방화벽 실드', 5),
  deepsea_diving_suit: armor('잠수 슈트', 4),
  deepsea_titanium_exoskeleton: armor('티타늄 외골격', 6),
  yokai_oni_mask: armor('오니 가면', 4),
  pharaoh_mask: armor('파라오의 가면', 5),
  pharaoh_mummy_wrap_armor: armor('미라 붕대 갑옷', 4),
  casino_lucky_tuxedo: armor('행운의 턱시도', 3),
  mutation_mutant_exoskeleton: armor('변이 외골격', 5),
  crystal_armor: armor('수정 갑옷', 6),
  fungal_mycelium_armor: armor('균사체 갑옷', 4),
  clocktower_clockwork_armor: armor('태엽 갑옷', 5),
  void_grimoire_binding: armor('마도서 장정', 5)
}

export function getThemeWeaponById (id: string): WeaponData | undefined {
  const item = THEME_WEAPON_CATALOG[id]
  return item !== undefined ? { ...item } : undefined
}

export function getThemeArmorById (id: string): ArmorData | undefined {
  const item = THEME_ARMOR_CATALOG[id]
  return item !== undefined ? { ...item } : undefined
}
