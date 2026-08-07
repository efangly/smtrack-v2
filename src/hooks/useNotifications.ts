'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getAllNotifications,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/api/notifications'
import type { PaginationQuery } from '@/lib/api/pagination'
import { useNotificationFeedStore } from '@/store/useNotificationFeedStore'

export function useNotifications(serial: string, params: PaginationQuery = {}) {
  return useQuery({
    queryKey: ['notifications', serial, params],
    queryFn: () => getNotifications(serial, params),
    enabled: !!serial,
  })
}

export function useAllNotifications(
  params: PaginationQuery & { filter?: string } = {},
) {
  return useQuery({
    queryKey: ['notifications', 'all', params],
    queryFn: () => getAllNotifications(params),
  })
}

// ค่า unread ที่ persistent (isRead=false ใน DB) — ใช้ seed useNotificationFeedStore
// ตอนแอปเปิดขึ้นมา (ดู RealtimeFeedProvider) ต่างจาก unreadCount ในตัว store เองที่
// เป็นแค่ session counter จนกว่าจะ seed
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: getUnreadNotificationCount,
    staleTime: 30_000,
  })
}

export function useMarkAllNotificationsRead() {
  const setUnreadCount = useNotificationFeedStore((state) => state.setUnreadCount)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // ค่าที่แม่นยำจริง ๆ จะตามมาจาก SSE action:'read-all' — ตั้ง 0 ไปก่อนกัน UI ค้าง
      setUnreadCount(0)
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })
}
