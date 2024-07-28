export enum Auth {
  Guest,
  User,
  Admin
}

export interface Session {
  nickName: string
  email: string
  roles: Set<string>
  picUrl: string
}
