export interface Memo {
  memoId: number
  title: string
  content: string
  references: ReferenceInfo[]
}

export interface SimpleMemoInfo {
  id: number
  title: string
  references: ReferenceInfo[]
}

export interface ReferenceInfo {
  id: number
  referenceId: number
}

export interface Folder {
  id: number | null
  name: string
  parent: Folder | null
  children: Folder[]
  memos: SimpleMemoInfo[]
}
