export enum Provider {
  GOOGLE = 'GOOGLE',
}

export function findProvider (value: string): Provider {
  const key = Object.keys(Provider).find(
    key => Provider[key as keyof typeof Provider]
  )
  if (key == null) {
    throw new Error('정의된 Provider가 아닙니다')
  }
  return Provider[key as keyof typeof Provider]
}
