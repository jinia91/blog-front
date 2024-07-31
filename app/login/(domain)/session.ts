export enum Auth {
  Guest = 'GUEST',
  User = 'USER',
  Admin = 'ADMIN',
}

export interface Session {
  nickName: string
  email: string
  roles: Set<string>
  picUrl: string
}
