'use client'

import { useQuery } from '@tanstack/react-query'

import { getNotificationDashboardCount } from '@/lib/api/notifications'

export function useNotificationDashboardCount() {
  return useQuery({
    queryKey: ['notification-dashboard-count'],
    queryFn: getNotificationDashboardCount,
    refetchInterval: 60_000,
  })
}
