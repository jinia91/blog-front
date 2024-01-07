export enum Auth {
  Guest,
  User,
  Admin
}

export interface Session {
  accessToken: string
  refreshToken: string
  nickName: string
  email: string
  roles: Set<string>
}
