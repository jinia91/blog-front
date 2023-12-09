export interface Memo {
  memoId: number;
  title: string;
  content: string;
  references: Reference[];
}

export interface Reference {
  rootId: number;
  referenceId: number;
}
