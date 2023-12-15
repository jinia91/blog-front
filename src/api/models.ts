export interface Memo {
  memoId: number;
  title: string;
  content: string;
  references: ReferenceInfo[];
}

export interface SimpleMemoInfo {
  id: number;
  title: string;
  references: ReferenceInfo[];
}

export interface ReferenceInfo {
  rootId: number;
  referenceId: number;
}

export interface FolderInfo {
  id: number | null;
  name: string;
  parent: FolderInfo | null;
  children: FolderInfo[];
  memos: SimpleMemoInfo[];
}
