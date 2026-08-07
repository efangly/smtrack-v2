'use client'

import { create } from 'zustand'

import {
  DEFAULT_NOTIFICATION_SOUND_ID,
  getStoredNotificationSoundPref,
  setStoredNotificationSoundPref,
} from '@/lib/notificationSound'

interface NotificationSoundState {
  enabled: boolean
  soundId: string
  hydrated: boolean
  setEnabled: (enabled: boolean) => void
  setSoundId: (soundId: string) => void
  /** อ่านค่าจาก localStorage หลัง mount แล้วเท่านั้น (กัน hydration mismatch) */
  hydrate: () => void
}

export const useNotificationSoundStore = create<NotificationSoundState>(
  (set, get) => ({
    enabled: true,
    soundId: DEFAULT_NOTIFICATION_SOUND_ID,
    hydrated: false,
    setEnabled: (enabled) => {
      setStoredNotificationSoundPref({ enabled, soundId: get().soundId })
      set({ enabled })
    },
    setSoundId: (soundId) => {
      setStoredNotificationSoundPref({ enabled: get().enabled, soundId })
      set({ soundId })
    },
    hydrate: () => {
      if (get().hydrated) return
      set({ ...getStoredNotificationSoundPref(), hydrated: true })
    },
  }),
)
