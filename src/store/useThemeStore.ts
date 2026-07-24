'use client'

import { create } from 'zustand'

import {
  applyMode,
  getStoredMode,
  setStoredMode,
  type ResolvedTheme,
  type ThemeMode,
} from '@/lib/theme'

interface ThemeState {
  /** ค่าเริ่มต้นคง 'system' เสมอเพื่อให้ตรงกับ markup ที่ render จาก server */
  mode: ThemeMode
  resolved: ResolvedTheme
  hydrated: boolean
  setMode: (mode: ThemeMode) => void
  /** อ่านค่าจาก localStorage หลัง mount แล้วเริ่มฟังการเปลี่ยนธีมของ OS */
  hydrate: () => () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'system',
  resolved: 'light',
  hydrated: false,
  setMode: (mode) => {
    setStoredMode(mode)
    set({ mode, resolved: applyMode(mode) })
  },
  hydrate: () => {
    const mode = getStoredMode()
    set({ mode, resolved: applyMode(mode), hydrated: true })

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (get().mode !== 'system') return
      set({ resolved: applyMode('system') })
    }
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  },
}))
