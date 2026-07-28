'use client'

import { useQuery } from '@tanstack/react-query'

import { getNotifications } from '@/lib/api/notifications'
import type { PaginationQuery } from '@/lib/api/pagination'

export function useNotifications(serial: string, params: PaginationQuery = {}) {
  return useQuery({
    queryKey: ['notifications', serial, params],
    queryFn: () => getNotifications(serial, params),
    enabled: !!serial,
  })
}
