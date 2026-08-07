'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

import {
  ALWAYS_ON_CHANNELS,
  RealtimeFeedContext,
  type RealtimeChannel,
  type RealtimeHandler,
} from './RealtimeFeedContext'

/**
 * เจ้าของ EventSource **ตัวเดียวของทั้งแท็บ** — ทุก live feed (telemetry,
 * notification, สถานะ device) เดินผ่าน connection นี้เส้นเดียวแล้วกระจายต่อผ่าน
 * context ห้าม component อื่นเปิด EventSource เอง
 *
 * เหตุผล: browser จำกัด 6 connection ต่อ origin บน HTTP/1.1 และ EventSource ไม่
 * ปิดตัวเอง — ตอนที่แต่ละ feed เปิด stream ของตัวเอง (หน้า device กิน 3 เส้น
 * และเพิ่มอีกเส้นต่อ probe) แค่เปิดหน้าเดิมสองแท็บก็กินโควตาจนหมด ทำให้ request
 * ที่เหลือของแท็บที่สองค้าง pending ตลอดไป
 *
 * channel ที่ไม่ได้อยู่ใน ALWAYS_ON_CHANNELS จะถูกขอจาก server เฉพาะตอนมี
 * subscriber จริง (นับ refcount) — เข้าหน้า device แล้วค่อย reconnect เพิ่ม
 * channel telemetry รอบเดียว ออกจากหน้าก็ถอดออก ไม่ต้องรับ log ของทุกกล่องใน
 * ward ค้างไว้ทุกหน้า
 */
export function RealtimeFeedProvider({ children }: { children: ReactNode }) {
  const push = useNotificationFeedStore((state) => state.push)
  const setUnreadCount = useNotificationFeedStore((state) => state.setUnreadCount)
  const setStatus = useNotificationFeedStore((state) => state.setStatus)
  const queryClient = useQueryClient()

  // subscriber ภายนอกต่อ channel — เก็บใน ref เพราะเปลี่ยนแปลงระหว่าง render ไม่ควร
  // ทำให้ Provider re-render (การ re-render จริงมาจาก optionalChannels เท่านั้น)
  const handlersRef = useRef<Map<RealtimeChannel, Set<RealtimeHandler>>>(new Map())
  const refCountsRef = useRef<Map<RealtimeChannel, number>>(new Map())
  const [optionalChannels, setOptionalChannels] = useState<RealtimeChannel[]>([])

  const subscribe = useCallback(
    (channel: RealtimeChannel, handler: RealtimeHandler) => {
      let handlers = handlersRef.current.get(channel)
      if (!handlers) {
        handlers = new Set()
        handlersRef.current.set(channel, handlers)
      }
      handlers.add(handler)

      const optional = !ALWAYS_ON_CHANNELS.includes(channel)
      if (optional) {
        const next = (refCountsRef.current.get(channel) ?? 0) + 1
        refCountsRef.current.set(channel, next)
        if (next === 1) {
          setOptionalChannels((prev) =>
            prev.includes(channel) ? prev : [...prev, channel],
          )
        }
      }

      return () => {
        handlers.delete(handler)
        if (!optional) return

        const next = Math.max(0, (refCountsRef.current.get(channel) ?? 0) - 1)
        refCountsRef.current.set(channel, next)
        if (next === 0) {
          setOptionalChannels((prev) => prev.filter((c) => c !== channel))
        }
      }
    },
    [],
  )

  const emit = useCallback((channel: RealtimeChannel, data: unknown) => {
    // สำเนา Set ก่อนวน เผื่อ handler ตัวใดตัวหนึ่ง unsubscribe ระหว่างวนอยู่
    for (const handler of [...(handlersRef.current.get(channel) ?? [])]) {
      handler(data)
    }
  }, [])

  // seed unreadCount จาก DB ตอนแอปเปิด (persistent) — ก่อนหน้านี้ store เริ่มที่ 0 เสมอ
  // และนับได้แค่ event ที่เข้ามาระหว่างเปิดแอปทิ้งไปตอน refresh
  const { data: initialUnreadCount } = useUnreadNotificationCount()
  useEffect(() => {
    if (initialUnreadCount !== undefined) setUnreadCount(initialUnreadCount)
  }, [initialUnreadCount, setUnreadCount])

  // path ต้องเป็น string ที่ derive จาก "เนื้อ" ของ channel list ไม่ใช่ identity ของ array
  // — useSseChannels ผูก effect ไว้กับ path ตรง ๆ ถ้าเปลี่ยน identity เฉย ๆ จะ reconnect ฟรี
  const path = useMemo(() => {
    const channels = [...ALWAYS_ON_CHANNELS, ...optionalChannels].sort()
    return `/stream?channels=${channels.join(',')}`
  }, [optionalChannels])

  // ลงทะเบียน listener ครบทุก channel เสมอ ถึงจะยังไม่ได้ขอ channel นั้นจาก server —
  // eventNames ที่คงที่ทำให้ effect ของ useSseChannels ไม่ reconnect ซ้อนตอน channel
  // list เปลี่ยน (server ไม่ส่ง channel ที่ไม่ได้ขออยู่แล้ว)
  const status = useSseChannels(path, {
    notification: (raw) => {
      // event นี้มีสองรูปแบบแยกกันด้วย field `action`: แจ้งเตือนใหม่ (ไม่มี action)
      // กับการเปลี่ยนสถานะอ่านแล้ว (action: 'read'|'read-all') — ต้องเช็คก่อน parse
      // เพราะสอง schema ไม่ทับซ้อนกัน (parse ผิด schema จะ fail เงียบๆ)
      if (raw && typeof raw === 'object' && 'action' in raw) {
        const parsed = NotificationReadEventSchema.safeParse(raw)
        if (parsed.success) setUnreadCount(parsed.data.unreadCount)
        emit('notification', raw)
        return
      }

      const parsed = NotificationCreatedEventSchema.safeParse(raw)
      if (parsed.success) {
        push(parsed.data)
        // unreadCount ที่แนบมา (ของ ward เดียวกับ notification นี้) แม่นกว่าการ +1
        // local ของ push() เอง — ใช้ทับถ้า backend ส่งมาด้วย
        if (parsed.data.unreadCount !== undefined) {
          setUnreadCount(parsed.data.unreadCount)
        }
      }
      emit('notification', raw)
    },
    device: (raw) => {
      const parsed = DeviceChangedEventSchema.safeParse(raw)
      if (!parsed.success) {
        emit('device', raw)
        return
      }
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

      emit('device', raw)
    },
    telemetry: (raw) => emit('telemetry', raw),
  })

  useEffect(() => {
    setStatus(status)
  }, [status, setStatus])

  const value = useMemo(() => ({ subscribe, status }), [subscribe, status])

  return (
    <RealtimeFeedContext.Provider value={value}>
      {children}
    </RealtimeFeedContext.Provider>
  )
}
