'use client'

import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

import { playNotificationSound } from '@/lib/notificationSound'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'
import { useNotificationSoundStore } from '@/store/useNotificationSoundStore'

import { NotificationToastBody } from './NotificationToastBody'

/**
 * เฝ้าดู items ใน useNotificationFeedStore แล้วเด้ง toast + เล่นเสียงสำหรับรายการที่เพิ่งเข้ามาใหม่เท่านั้น
 * ไม่เด้งให้รายการที่มีอยู่แล้วตอน mount (เช่น เปลี่ยนหน้าแล้ว component นี้ mount ใหม่)
 */
export function NotificationToastEmitter() {
  const items = useNotificationFeedStore((state) => state.items)
  const soundEnabled = useNotificationSoundStore((state) => state.enabled)
  const soundId = useNotificationSoundStore((state) => state.soundId)
  const hydrateSound = useNotificationSoundStore((state) => state.hydrate)
  const lastSeenId = useRef<string | null>(null)
  const isFirstRun = useRef(true)

  useEffect(() => hydrateSound(), [hydrateSound])

  useEffect(() => {
    if (isFirstRun.current) {
      lastSeenId.current = items[0]?.id ?? null
      isFirstRun.current = false
      return
    }

    if (items.length === 0) return

    const lastIndex = lastSeenId.current
      ? items.findIndex((n) => n.id === lastSeenId.current)
      : -1
    const newItems = lastIndex === -1 ? items.slice(0, 1) : items.slice(0, lastIndex)

    if (newItems.length > 0 && soundEnabled) {
      playNotificationSound(soundId)
    }

    for (const notification of [...newItems].reverse()) {
      toast.custom((t) => (
        <NotificationToastBody t={t} notification={notification} />
      ))
    }

    lastSeenId.current = items[0].id
  }, [items, soundEnabled, soundId])

  return null
}
