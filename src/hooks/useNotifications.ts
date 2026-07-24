'use client'

import { useQuery } from '@tanstack/react-query'

import { getNotifications } from '@/lib/api/notifications'

export function useNotifications(serial: string) {
  return useQuery({
    queryKey: ['notifications', serial],
    queryFn: () => getNotifications(serial),
    enabled: !!serial,
  })
}
