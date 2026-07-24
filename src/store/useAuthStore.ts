'use client'

import { create } from 'zustand'

import {
  clearStoredRefreshToken,
  clearStoredToken,
  getStoredRefreshToken,
  getStoredToken,
  setStoredRefreshToken,
  setStoredToken,
} from '@/lib/authToken'
import { decodeJwtPayload } from '@/lib/decodeJwt'
import type { LoginResult, UserJwtPayload } from '@/types/auth'

interface AuthState {
  token: string | null
  refreshToken: string | null
  payload: UserJwtPayload | null
  login: (result: LoginResult) => void
  setTokens: (token: string, refreshToken: string) => void
  logout: () => void
}

function decode(token: string | null) {
  return token ? decodeJwtPayload<UserJwtPayload>(token) : null
}

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = getStoredToken()
  return {
    token: initialToken,
    refreshToken: getStoredRefreshToken(),
    payload: decode(initialToken),
    login: (result) => {
      setStoredToken(result.token)
      setStoredRefreshToken(result.refreshToken)
      set({
        token: result.token,
        refreshToken: result.refreshToken,
        payload: decode(result.token),
      })
    },
    setTokens: (token, refreshToken) => {
      setStoredToken(token)
      setStoredRefreshToken(refreshToken)
      set({ token, refreshToken, payload: decode(token) })
    },
    logout: () => {
      clearStoredToken()
      clearStoredRefreshToken()
      set({ token: null, refreshToken: null, payload: null })
    },
  }
})
