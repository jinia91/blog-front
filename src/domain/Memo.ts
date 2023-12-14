export interface Memo {
  memoId: number;
  title: string;
  content: string;
  references: Reference[];
}

export interface SimpleMemo {
  memoId: number;
  title: string;
  references: Reference[];
}

export interface Reference {
  rootId: number;
  referenceId: number;
}
