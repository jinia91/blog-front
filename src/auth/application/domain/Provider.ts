export enum Provider {
  GOOGLE = 'GOOGLE',
}

export function findProvider (value: string): Provider | undefined {
  const key = Object.keys(Provider).find(
    key => Provider[key as keyof typeof Provider].toLowerCase() === value.toLowerCase()
  )

  return key ? Provider[key as keyof typeof Provider] : undefined
}
