import { z } from 'zod'

import { apiClient, type EnvelopeResponse } from '@/lib/apiClient'
import type { PaginationQuery } from '@/lib/api/pagination'

// category/severity คำนวณฝั่ง backend ตอนสร้าง notification (notification-classifier.util.ts)
// แทนการ parse `message` เองฝั่ง frontend — ใช้ z.string() เผื่อ backend เพิ่ม category ใหม่
// ในอนาคตโดยไม่ต้องแก้ schema นี้ตาม
export const NotificationSchema = z.object({
  id: z.string(),
  serial: z.string(),
  message: z.string(),
  detail: z.string(),
  status: z.boolean(),
  deliveredSse: z.boolean(),
  deliveredFcm: z.boolean(),
  isRead: z.boolean(),
  readAt: z.string().nullable(),
  category: z.string(),
  severity: z.string(),
  createAt: z.string(),
  updateAt: z.string(),
})
export type Notification = z.infer<typeof NotificationSchema>

// event `notification` จาก SSE ตอนมีการแจ้งเตือนใหม่ — เหมือน Notification ทุก field
// บวก unreadCount (ของ ward ที่ event นี้เกิด) เป็น field เสริม ต้อง extend schema
// แยกไว้เพราะ NotificationSchema.parse() ปกติจะ strip field ที่ไม่รู้จักทิ้ง
export const NotificationCreatedEventSchema = NotificationSchema.extend({
  unreadCount: z.number().optional(),
})
export type NotificationCreatedEvent = z.infer<
  typeof NotificationCreatedEventSchema
>

// event `notification` จาก SSE ตอนมีการ mark read/read-all — แยกชนิดจากด้านบนด้วย
// field `action` ที่ event แจ้งเตือนใหม่ไม่มี ใช้ `'action' in event` เช็คก่อน parse
export const NotificationReadEventSchema = z.object({
  action: z.enum(['read', 'read-all']),
  notificationId: z.string().optional(),
  unreadCount: z.number(),
})
export type NotificationReadEvent = z.infer<typeof NotificationReadEventSchema>

export async function getNotifications(
  serial: string,
  params: PaginationQuery = {},
): Promise<Notification[]> {
  const { data } = await apiClient.get(
    `/notifications/${encodeURIComponent(serial)}`,
    { params },
  )
  return z.array(NotificationSchema).parse(data)
}

const PaginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

const PaginatedNotificationsSchema = z.object({
  data: z.array(NotificationSchema),
  meta: PaginationMetaSchema,
})

export interface PaginatedNotifications {
  data: Notification[]
  meta: z.infer<typeof PaginationMetaSchema>
}

// GET /notifications ครอบคลุมทุกอุปกรณ์ (scope ตาม ward ของ user เอง) และรองรับ
// ?filter= แต่ไม่รองรับ serial — คนละ endpoint กับ getNotifications ด้านบน
// (ดู NotificationQueryDto ฝั่ง backend: มีแค่ page/limit/filter)
export async function getAllNotifications(
  params: PaginationQuery & { filter?: string } = {},
): Promise<PaginatedNotifications> {
  const response: EnvelopeResponse = await apiClient.get('/notifications', {
    params,
  })
  // meta (page/limit/total/totalPages) มาเป็น sibling ของ data ใน envelope —
  // unwrapEnvelope เก็บไว้ที่ response.meta แยกต่างหาก (ดู apiClient.ts)
  return PaginatedNotificationsSchema.parse({
    data: response.data,
    meta: response.meta,
  })
}

const CountSchema = z.object({ count: z.number() })

// นับแบบ persistent (isRead=false ใน DB) ต่างจาก unreadCount ใน useNotificationFeedStore
// ที่เป็นแค่ตัวนับ session ปัจจุบัน — ตัวนี้คือค่าที่ถูกต้องข้าม refresh/หลายแท็บ
export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await apiClient.get('/notifications/unread-count')
  return CountSchema.parse(data).count
}

// จำนวนครั้งสะสมของแจ้งเตือนแต่ละประเภท (ไม่ใช่ยอด unread คงเหลือ) — คำนวณด้วย
// classifyNotification() ตัวเดียวกับตอน persist ฝั่ง backend (notification.service.ts findCount)
export const NotificationDashboardCountSchema = z.object({
  temp: z.number(),
  door: z.number(),
  internet: z.number(),
  plug: z.number(),
  sdcard: z.number(),
})
export type NotificationDashboardCount = z.infer<
  typeof NotificationDashboardCountSchema
>

export async function getNotificationDashboardCount(): Promise<NotificationDashboardCount> {
  const { data } = await apiClient.get('/notifications/dashboard/count')
  return NotificationDashboardCountSchema.parse(data)
}

// คืนจำนวนรายการที่ถูก mark read (ไม่ใช่ unread count ที่เหลือ) — รอ SSE
// action:'read-all' มา sync unreadCount ที่แท้จริงอีกที (ดู RealtimeFeedProvider)
export async function markAllNotificationsRead(): Promise<number> {
  const { data } = await apiClient.post('/notifications/read-all')
  return CountSchema.parse(data).count
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await apiClient.patch(
    `/notifications/${encodeURIComponent(id)}/read`,
  )
  return NotificationSchema.parse(data)
}
