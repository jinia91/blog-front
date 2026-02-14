export type BalancePresetId = 'casual' | 'normal' | 'hardcore'

export interface BalancePreset {
  id: BalancePresetId
  label: string
  description: string
  themeDifficultyMultiplier: number
  lootBiasMultiplier: number
  eventBiasMultiplier: number
  objectBiasMultiplier: number
  bossLegendaryChanceBonus: number
  catchupXpMultiplier: number
}

export const BALANCE_PRESETS: Record<BalancePresetId, BalancePreset> = {
  casual: {
    id: 'casual',
    label: 'Casual',
    description: '완만한 난이도와 높은 복구력을 제공',
    themeDifficultyMultiplier: 0.9,
    lootBiasMultiplier: 1.1,
    eventBiasMultiplier: 0.95,
    objectBiasMultiplier: 1.1,
    bossLegendaryChanceBonus: 0.02,
    catchupXpMultiplier: 1.2
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    description: '기본 밸런스',
    themeDifficultyMultiplier: 1.0,
    lootBiasMultiplier: 1.0,
    eventBiasMultiplier: 1.0,
    objectBiasMultiplier: 1.0,
    bossLegendaryChanceBonus: 0,
    catchupXpMultiplier: 1.0
  },
  hardcore: {
    id: 'hardcore',
    label: 'Hardcore',
    description: '고위험 고리턴 중심의 빡센 밸런스',
    themeDifficultyMultiplier: 1.12,
    lootBiasMultiplier: 0.9,
    eventBiasMultiplier: 1.08,
    objectBiasMultiplier: 0.92,
    bossLegendaryChanceBonus: -0.01,
    catchupXpMultiplier: 0.9
  }
}

const FALLBACK_PRESET_ID: BalancePresetId = 'normal'

function toPresetId (value: string | undefined): BalancePresetId {
  if (value === undefined) return FALLBACK_PRESET_ID
  const normalized = value.trim().toLowerCase()
  if (normalized === 'casual' || normalized === 'normal' || normalized === 'hardcore') {
    return normalized
  }
  return FALLBACK_PRESET_ID
}

export function getActiveBalancePresetId (
  envValue: string | undefined = process.env.NEXT_PUBLIC_ROGUELIKE_PRESET
): BalancePresetId {
  return toPresetId(envValue)
}

export function getActiveBalancePreset (
  envValue: string | undefined = process.env.NEXT_PUBLIC_ROGUELIKE_PRESET
): BalancePreset {
  return BALANCE_PRESETS[getActiveBalancePresetId(envValue)]
}
