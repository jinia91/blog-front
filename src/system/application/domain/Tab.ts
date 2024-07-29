export enum ApplicationType {
  MEMO = 'MEMO',
  COMMON = 'COMMON',
}

export interface Tab {
  name: string
  urlPath: string
  type?: ApplicationType
}
