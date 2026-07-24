import { z } from 'zod'

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
  hosId: string
  wardId: string
  exp?: number
}

export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้').max(50),
  password: z.string().min(4, 'รหัสผ่านอย่างน้อย 4 ตัวอักษร').max(20),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export interface LoginResult {
  token: string
  refreshToken: string
  id: string
  name: string | null
  hosId: string
  wardId: string
  role: Role
  pic: string | null
}

export interface RefreshResult {
  token: string
  refreshToken: string
}
