import { z } from 'zod'

export const RoleSchema = z.enum([
  'SUPER',
  'SERVICE',
  'ADMIN',
  'USER',
  'LEGACY_ADMIN',
  'LEGACY_USER',
  'GUEST',
])
export type Role = z.infer<typeof RoleSchema>

export const ROLE_OPTIONS = RoleSchema.options

export const ROLE_LABELS: Record<Role, string> = {
  SUPER: 'ผู้ดูแลระบบสูงสุด',
  SERVICE: 'ฝ่ายบริการ',
  ADMIN: 'ผู้ดูแลโรงพยาบาล',
  USER: 'ผู้ใช้งาน',
  LEGACY_ADMIN: 'ผู้ดูแล (ระบบเดิม)',
  LEGACY_USER: 'ผู้ใช้งาน (ระบบเดิม)',
  GUEST: 'ผู้เยี่ยมชม',
}

export interface UserJwtPayload {
  id: string
  name: string
  role: Role
  hosId: string
  wardId: string
  exp?: number
}

export const LoginRequestSchema = z.object({
  username: z
    .string()
    .min(1, 'กรุณากรอกชื่อผู้ใช้')
    .max(50, 'ชื่อผู้ใช้ยาวไม่เกิน 50 ตัวอักษร'),
  password: z
    .string()
    .min(4, 'รหัสผ่านอย่างน้อย 4 ตัวอักษร')
    .max(20, 'รหัสผ่านยาวไม่เกิน 20 ตัวอักษร'),
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
