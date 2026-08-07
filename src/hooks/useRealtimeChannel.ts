'use client'

import { useContext, useEffect, useRef } from 'react'

import {
  RealtimeFeedContext,
  type RealtimeChannel,
} from '@/components/features/realtime/RealtimeFeedContext'
import type { SseStatus } from '@/hooks/useSse'

/**
 * รับ event ของ channel หนึ่งจาก EventSource กลางของแท็บ (RealtimeFeedProvider)
 * แทนการเปิด stream ของตัวเอง — ดู comment ใน RealtimeFeedProvider ว่าทำไม
 *
 * `handler` ไม่ต้อง memo: เก็บผ่าน ref แล้ว subscribe แค่ครั้งเดียว ไม่งั้น closure
 * ใหม่ทุก render จะ subscribe/unsubscribe วนไม่หยุด (และ refcount ของ channel
 * จะเด้ง 1→0→1 ทำให้ reconnect รัวไปด้วย)
 */
export function useRealtimeChannel(
  channel: RealtimeChannel,
  handler: (data: unknown) => void,
): SseStatus {
  const context = useContext(RealtimeFeedContext)
  if (!context) {
    throw new Error('useRealtimeChannel ต้องอยู่ภายใต้ <RealtimeFeedProvider>')
  }

  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  const { subscribe, status } = context
  useEffect(
    () => subscribe(channel, (data) => handlerRef.current(data)),
    [channel, subscribe],
  )

  return status
}
