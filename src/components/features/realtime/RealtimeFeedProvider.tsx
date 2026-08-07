'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { DeviceChangedEventSchema, type Device } from '@/lib/api/devices'
import {
  NotificationCreatedEventSchema,
  NotificationReadEventSchema,
} from '@/lib/api/notifications'
import { useSseChannels } from '@/hooks/useSse'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'

/**
 * เจ้าของ EventSource ตัวเดียวของทั้งแอปสำหรับ stream การแจ้งเตือน + สถานะ device
 * (`/stream?channels=device,notification`) — component อื่นอ่านผลผ่าน
 * useNotificationFeedStore หรือ React Query cache ของ ['devices'] แทนการเปิด SSE ซ้ำ
 */
export function RealtimeFeedProvider({ children }: { children: ReactNode }) {
  const push = useNotificationFeedStore((state) => state.push)
  const setUnreadCount = useNotificationFeedStore((state) => state.setUnreadCount)
  const setStatus = useNotificationFeedStore((state) => state.setStatus)
  const queryClient = useQueryClient()

  // seed unreadCount จาก DB ตอนแอปเปิด (persistent) — ก่อนหน้านี้ store เริ่มที่ 0 เสมอ
  // และนับได้แค่ event ที่เข้ามาระหว่างเปิดแอปทิ้งไปตอน refresh
  const { data: initialUnreadCount } = useUnreadNotificationCount()
  useEffect(() => {
    if (initialUnreadCount !== undefined) setUnreadCount(initialUnreadCount)
  }, [initialUnreadCount, setUnreadCount])

  const status = useSseChannels('/stream?channels=device,notification', {
    notification: (raw) => {
      // event นี้มีสองรูปแบบแยกกันด้วย field `action`: แจ้งเตือนใหม่ (ไม่มี action)
      // กับการเปลี่ยนสถานะอ่านแล้ว (action: 'read'|'read-all') — ต้องเช็คก่อน parse
      // เพราะสอง schema ไม่ทับซ้อนกัน (parse ผิด schema จะ fail เงียบๆ)
      if (raw && typeof raw === 'object' && 'action' in raw) {
        const parsed = NotificationReadEventSchema.safeParse(raw)
        if (!parsed.success) return
        setUnreadCount(parsed.data.unreadCount)
        return
      }

      const parsed = NotificationCreatedEventSchema.safeParse(raw)
      if (!parsed.success) return
      push(parsed.data)
      // unreadCount ที่แนบมา (ของ ward เดียวกับ notification นี้) แม่นกว่าการ +1
      // local ของ push() เอง — ใช้ทับถ้า backend ส่งมาด้วย
      if (parsed.data.unreadCount !== undefined) {
        setUnreadCount(parsed.data.unreadCount)
      }
    },
    device: (raw) => {
      const parsed = DeviceChangedEventSchema.safeParse(raw)
      if (!parsed.success) return
      const { device } = parsed.data

      // อัปเดต device ที่มีอยู่แล้วใน cache เท่านั้น — device ใหม่ (action: 'created')
      // ปล่อยให้ polling fallback ของ useDevices() ดึงมาแทน กัน list/filter ที่ query
      // ปัจจุบันกรอง/แบ่งหน้าไว้อยู่แล้วโชว์ผิดที่ผิดทางจากการ append เข้ากลางลิสต์
      //
      // queryKey ของ useDevices() คือ ['devices', params] (params มี search ได้) — ต้อง
      // เจาะจงแค่ key รูปแบบนี้ (length 2, params เป็น object) ไม่ใช่ query อื่นที่ขึ้นต้นด้วย
      // 'devices' เหมือนกัน เช่น ['devices', serial] ของ useDevice() ที่เก็บ Device เดี่ยว
      // ไม่ใช่ array — ถ้า match กว้างเกินไปจะพัง (old.some ไม่มีบน object เดี่ยว)
      queryClient.setQueriesData<Device[]>(
        {
          predicate: (query) => {
            const key = query.queryKey
            return (
              key[0] === 'devices' &&
              key.length === 2 &&
              typeof key[1] === 'object'
            )
          },
        },
        (old) =>
          old?.some((d) => d.id === device.id)
            ? old.map((d) => (d.id === device.id ? device : d))
            : old,
      )
      if (device.serial) {
        queryClient.setQueryData<Device>(['devices', device.serial], (old) =>
          old ? device : old,
        )
      }
    },
  })

  useEffect(() => {
    setStatus(status)
  }, [status, setStatus])

  return <>{children}</>
}
