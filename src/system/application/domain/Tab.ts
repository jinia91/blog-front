export interface Tab {
  name: string
  urlPath: string
}

export interface TabsManager {
  tabs: Tab[]
  selectedTabIdx: number
}
