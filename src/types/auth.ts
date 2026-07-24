export type Role =
  | 'SUPER'
  | 'SERVICE'
  | 'ADMIN'
  | 'USER'
  | 'LEGACY_ADMIN'
  | 'LEGACY_USER'
  | 'GUEST'

export interface UserJwtPayload {
  id: string
  name: string
  role: Role
  wardId: string
  exp?: number
}
