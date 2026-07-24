'use client'

import { create } from 'zustand'

import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '@/lib/authToken'
import { decodeJwtPayload } from '@/lib/decodeJwt'
import type { UserJwtPayload } from '@/types/auth'

interface AuthState {
  token: string | null
  payload: UserJwtPayload | null
  setToken: (token: string) => void
  clearToken: () => void
}

function decode(token: string | null) {
  return token ? decodeJwtPayload<UserJwtPayload>(token) : null
}

export const useAuthStore = create<AuthState>((set) => {
  const initial = getStoredToken()
  return {
    token: initial,
    payload: decode(initial),
    setToken: (token) => {
      setStoredToken(token)
      set({ token, payload: decode(token) })
    },
    clearToken: () => {
      clearStoredToken()
      set({ token: null, payload: null })
    },
  }
})
