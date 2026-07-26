import { z } from 'zod'

import { authApiClient } from '@/lib/apiClient'
import { hasFile, toFormData } from '@/lib/api/formData'
import { UserSchema, type CreateUserInput, type User } from '@/lib/api/users'
import type { LoginRequest, LoginResult, RefreshResult } from '@/types/auth'

export async function login(payload: LoginRequest): Promise<LoginResult> {
  const { data } = await authApiClient.post('/login', payload)
  return data as LoginResult
}

export async function refreshTokens(token: string): Promise<RefreshResult> {
  const { data } = await authApiClient.post('/refresh', { token })
  return data as RefreshResult
}

// POST /auth/register เป็น endpoint สาธารณะและรับไฟล์ `image` ได้ ต่างจาก POST /auth/user
// ที่ต้องมีสิทธิ์ admin แต่รับ JSON เท่านั้น — หน้าตั้งค่าจึงเลือกใช้ตัวนี้เมื่อมีการแนบรูป
export async function register(
  dto: CreateUserInput & { image?: File },
): Promise<User> {
  const { data } = await authApiClient.post(
    '/register',
    hasFile(dto) ? toFormData(dto) : dto,
  )
  return UserSchema.parse(data)
}

export const AuthHealthSchema = z.looseObject({
  status: z.string().optional(),
})
export type AuthHealth = z.infer<typeof AuthHealthSchema>

export async function getAuthHealth(): Promise<AuthHealth> {
  const { data } = await authApiClient.get('/health')
  return AuthHealthSchema.parse(data)
}
