'use client'

import { createContext } from 'react'

import type { SseStatus } from '@/hooks/useSse'

export const REALTIME_CHANNELS = ['device', 'notification', 'telemetry'] as const
export type RealtimeChannel = (typeof REALTIME_CHANNELS)[number]

/**
 * channel ที่ต้องเปิดค้างทุกหน้า — badge จำนวนที่ยังไม่อ่าน, toast แจ้งเตือน และ
 * cache ของรายการ device ต้องอัปเดตแม้ผู้ใช้ไม่ได้อยู่หน้าที่เกี่ยวข้อง
 * ส่วน channel ที่เหลือ (telemetry) เปิดเฉพาะตอนมี subscriber จริงเพื่อไม่ต้องยิง
 * log ของทุกกล่องใน ward มาที่แท็บที่ไม่ได้ใช้
 */
export const ALWAYS_ON_CHANNELS: RealtimeChannel[] = ['device', 'notification']

export type RealtimeHandler = (data: unknown) => void

export interface RealtimeFeedValue {
  /** ลงทะเบียนรับ event ของ channel — คืนฟังก์ชันสำหรับยกเลิก */
  subscribe: (channel: RealtimeChannel, handler: RealtimeHandler) => () => void
  status: SseStatus
}

export const RealtimeFeedContext = createContext<RealtimeFeedValue | null>(null)
