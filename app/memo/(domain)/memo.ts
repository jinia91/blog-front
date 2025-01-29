export interface Memo {
  memoId: number
  title: string
  content: string
  references: ReferenceInfo[]
}

export interface SimpleMemoInfo {
  id: number
  title: string
  references?: ReferenceInfo[]
}

export interface ReferenceInfo {
  id: number
  referenceId: number
}
