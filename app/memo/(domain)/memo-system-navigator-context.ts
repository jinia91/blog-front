export interface MemoSystemNavigatorContext {
  type: NavigatorContextType
  refreshTrigger: number
}

export enum NavigatorContextType {
  NORMAL_MODE,
  REFERENCE_MODE,
  SEARCH_MODE
}
