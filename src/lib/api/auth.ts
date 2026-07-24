import { authApiClient } from '@/lib/apiClient'
import type { LoginRequest, LoginResult, RefreshResult } from '@/types/auth'

export async function login(payload: LoginRequest): Promise<LoginResult> {
  const { data } = await authApiClient.post('/login', payload)
  return data as LoginResult
}

export async function refreshTokens(token: string): Promise<RefreshResult> {
  const { data } = await authApiClient.post('/refresh', { token })
  return data as RefreshResult
}
