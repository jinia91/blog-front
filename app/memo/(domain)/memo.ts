export interface Memo {
  memoId: number
  title: string
  content: string
  references: ReferenceInfo[]
}

export interface SimpleMemoInfo {
  id: number
  title: string
  sequence?: string // 디폴트: '' (빈 문자열), 백엔드에서 없을 수 있음
  references?: ReferenceInfo[]
}

export interface ReferenceInfo {
  id: number
  referenceId: number
}
